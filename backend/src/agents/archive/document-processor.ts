// =====================================
// backend/src/agents/archive/document-processor.ts
// =====================================

import { qdrantClient } from '../../integrations/vector-db/qdrant-client';
import { llmClient } from '../../integrations/llm/llm-client';
import { kwaaiClient } from '../../integrations/kwaai/kwaai-client';
import { logger } from '../../utils/logger';
import { database } from '../../utils/database';
import { v4 as uuidv4 } from 'uuid';

export interface DocumentMetadata {
  title?: string;
  author?: string;
  source?: string;
  sessionId: string;
  privacyLevel: 'maximum' | 'high' | 'selective' | 'minimal';
  documentType?: string;
  mimeType?: string;
  fileSize?: number;
  contributorHash?: string;
  originalUrl?: string;
  tags?: string[];
  language?: string;
  category?: string;
  version?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  metadata: {
    title?: string;
    sessionId: string;
    privacyLevel: string;
    startIndex: number;
    endIndex: number;
    wordCount: number;
  };
  embedding?: number[];
  qualityScore?: number;
}

export interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  chunks: DocumentChunk[];
  summary: string;
  keywords: string[];
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
    startIndex: number;
    endIndex: number;
  }>;
  qualityScore: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

export class DocumentProcessor {
  private readonly CHUNK_SIZE = 1000;
  private readonly CHUNK_OVERLAP = 200;
  private readonly COLLECTION_NAME = 'bgin_documents';

  constructor() {
    this.initializeCollection();
  }

  private async initializeCollection(): Promise<void> {
    try {
      const exists = await qdrantClient.collectionExists(this.COLLECTION_NAME);
      if (!exists) {
        await qdrantClient.createCollection(this.COLLECTION_NAME, {
          vectors: {
            size: 1536, // OpenAI embedding size
            distance: 'Cosine'
          },
          optimizers_config: {
            default_segment_number: 2
          },
          replication_factor: 1
        });
        logger.info(`Created Qdrant collection: ${this.COLLECTION_NAME}`);
      }
    } catch (error) {
      logger.error('Failed to initialize document collection:', error);
      throw error;
    }
  }

  async processDocument(
    file: Buffer,
    metadata: DocumentMetadata
  ): Promise<ProcessedDocument> {
    const documentId = uuidv4();
    const startTime = Date.now();

    try {
      logger.info(`Processing document: ${metadata.title || 'Untitled'}`);

      // Extract text content based on file type
      const content = await this.extractTextContent(file, metadata.mimeType);
      
      // Process with Kwaai for privacy-preserving analysis
      const kwaaiResult = await kwaaiClient.processDocument(content, {
        ...metadata,
        documentId,
        processingTimestamp: new Date().toISOString()
      });

      // Generate summary using LLM
      const summary = await this.generateSummary(content, metadata);

      // Extract keywords
      const keywords = await this.extractKeywords(content, metadata);

      // Chunk the document
      const chunks = await this.chunkDocument(content, documentId, metadata);

      // Generate embeddings for chunks
      const chunksWithEmbeddings = await this.generateChunkEmbeddings(chunks);

      // Store in database
      await this.storeDocumentInDatabase({
        id: documentId,
        title: metadata.title || 'Untitled',
        content,
        metadata,
        chunks: chunksWithEmbeddings,
        summary,
        keywords,
        entities: kwaaiResult.entities || [],
        qualityScore: kwaaiResult.metadata.qualityScore,
        processingStatus: 'completed'
      });

      // Store in vector database
      await this.storeInVectorDB(chunksWithEmbeddings);

      const processingTime = Date.now() - startTime;
      logger.info(`Document processed successfully in ${processingTime}ms`);

      return {
        id: documentId,
        title: metadata.title || 'Untitled',
        content,
        metadata,
        chunks: chunksWithEmbeddings,
        summary,
        keywords,
        entities: kwaaiResult.entities || [],
        qualityScore: kwaaiResult.metadata.qualityScore,
        processingStatus: 'completed'
      };

    } catch (error) {
      logger.error(`Document processing failed: ${error}`);
      
      // Store failed document in database
      await this.storeDocumentInDatabase({
        id: documentId,
        title: metadata.title || 'Untitled',
        content: '',
        metadata,
        chunks: [],
        summary: '',
        keywords: [],
        entities: [],
        qualityScore: 0,
        processingStatus: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  private async extractTextContent(file: Buffer, mimeType?: string): Promise<string> {
    // For now, assume text content is already extracted
    // In production, you would use libraries like pdf-parse, mammoth, etc.
    return file.toString('utf-8');
  }

  private async generateSummary(content: string, metadata: DocumentMetadata): Promise<string> {
    try {
      const prompt = `Generate a concise summary of the following document for the BGIN governance research system. 
      Focus on key governance, policy, or technical insights relevant to blockchain governance.
      
      Document: ${content.substring(0, 4000)}...`;
      
      const response = await llmClient.generateResponse(prompt, {
        maxTokens: 300,
        temperature: 0.3
      });

      return response.content;
    } catch (error) {
      logger.error('Failed to generate summary:', error);
      return 'Summary generation failed';
    }
  }

  private async extractKeywords(content: string, metadata: DocumentMetadata): Promise<string[]> {
    try {
      const prompt = `Extract 10-15 key terms and concepts from this document that are relevant to blockchain governance, policy, or technical standards.
      
      Document: ${content.substring(0, 3000)}...`;
      
      const response = await llmClient.generateResponse(prompt, {
        maxTokens: 200,
        temperature: 0.2
      });

      // Parse keywords from response
      const keywords = response.content
        .split('\n')
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(keyword => keyword.length > 0)
        .slice(0, 15);

      return keywords;
    } catch (error) {
      logger.error('Failed to extract keywords:', error);
      return [];
    }
  }

  private async chunkDocument(
    content: string,
    documentId: string,
    metadata: DocumentMetadata
  ): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;
    let startIndex = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;

      // Check if adding this sentence would exceed chunk size
      if (currentChunk.length + sentence.length > this.CHUNK_SIZE && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          id: uuidv4(),
          documentId,
          chunkIndex,
          content: currentChunk.trim(),
          metadata: {
            title: metadata.title,
            sessionId: metadata.sessionId,
            privacyLevel: metadata.privacyLevel,
            startIndex,
            endIndex: startIndex + currentChunk.length,
            wordCount: currentChunk.split(/\s+/).length
          }
        });

        // Start new chunk with overlap
        const overlapText = currentChunk.slice(-this.CHUNK_OVERLAP);
        currentChunk = overlapText + ' ' + sentence;
        startIndex += currentChunk.length - overlapText.length - sentence.length - 1;
        chunkIndex++;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }

    // Add final chunk if there's content
    if (currentChunk.trim().length > 0) {
      chunks.push({
        id: uuidv4(),
        documentId,
        chunkIndex,
        content: currentChunk.trim(),
        metadata: {
          title: metadata.title,
          sessionId: metadata.sessionId,
          privacyLevel: metadata.privacyLevel,
          startIndex,
          endIndex: startIndex + currentChunk.length,
          wordCount: currentChunk.split(/\s+/).length
        }
      });
    }

    return chunks;
  }

  private async generateChunkEmbeddings(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    const chunksWithEmbeddings: DocumentChunk[] = [];

    for (const chunk of chunks) {
      try {
        const embeddingResponse = await llmClient.generateEmbedding(chunk.content);
        chunksWithEmbeddings.push({
          ...chunk,
          embedding: embeddingResponse.embedding
        });
      } catch (error) {
        logger.error(`Failed to generate embedding for chunk ${chunk.id}:`, error);
        chunksWithEmbeddings.push(chunk);
      }
    }

    return chunksWithEmbeddings;
  }

  private async storeDocumentInDatabase(document: ProcessedDocument): Promise<void> {
    try {
      // Store main document
      await database.query(`
        INSERT INTO archive_documents (
          id, session_id, title, content, content_hash, document_type, 
          mime_type, privacy_level, contributor_hash, vector_embedding, 
          metadata, processing_status, quality_score, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      `, [
        document.id,
        document.metadata.sessionId,
        document.title,
        document.content,
        this.generateContentHash(document.content),
        document.metadata.documentType || 'text',
        document.metadata.mimeType || 'text/plain',
        document.metadata.privacyLevel,
        document.metadata.contributorHash,
        document.chunks[0]?.embedding || null,
        JSON.stringify(document.metadata),
        document.processingStatus,
        document.qualityScore
      ]);

      // Store document chunks
      for (const chunk of document.chunks) {
        await database.query(`
          INSERT INTO archive_document_chunks (
            id, document_id, chunk_index, content, vector_embedding, 
            metadata, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `, [
          chunk.id,
          chunk.documentId,
          chunk.chunkIndex,
          chunk.content,
          chunk.embedding || null,
          JSON.stringify(chunk.metadata)
        ]);
      }

      logger.info(`Document ${document.id} stored in database`);
    } catch (error) {
      logger.error('Failed to store document in database:', error);
      throw error;
    }
  }

  private async storeInVectorDB(chunks: DocumentChunk[]): Promise<void> {
    try {
      const points = chunks
        .filter(chunk => chunk.embedding)
        .map(chunk => ({
          id: chunk.id,
          vector: chunk.embedding!,
          payload: {
            documentId: chunk.documentId,
            content: chunk.content,
            metadata: chunk.metadata,
            chunkIndex: chunk.chunkIndex
          }
        }));

      if (points.length > 0) {
        await qdrantClient.upsertPoints(this.COLLECTION_NAME, points);
        logger.info(`Stored ${points.length} chunks in vector database`);
      }
    } catch (error) {
      logger.error('Failed to store chunks in vector database:', error);
      throw error;
    }
  }

  private generateContentHash(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async getDocument(documentId: string): Promise<ProcessedDocument | null> {
    try {
      const result = await database.query(`
        SELECT * FROM archive_documents WHERE id = $1
      `, [documentId]);

      if (result.rows.length === 0) {
        return null;
      }

      const doc = result.rows[0];
      
      // Get chunks
      const chunksResult = await database.query(`
        SELECT * FROM archive_document_chunks WHERE document_id = $1 ORDER BY chunk_index
      `, [documentId]);

      const chunks: DocumentChunk[] = chunksResult.rows.map((row: any) => ({
        id: row.id,
        documentId: row.document_id,
        chunkIndex: row.chunk_index,
        content: row.content,
        metadata: row.metadata,
        embedding: row.vector_embedding,
        qualityScore: row.quality_score
      }));

      return {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        metadata: doc.metadata,
        chunks,
        summary: doc.summary || '',
        keywords: doc.keywords || [],
        entities: doc.entities || [],
        qualityScore: doc.quality_score,
        processingStatus: doc.processing_status,
        errorMessage: doc.error_message
      };
    } catch (error) {
      logger.error(`Failed to get document ${documentId}:`, error);
      throw error;
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      // Delete from vector database
      const chunksResult = await database.query(`
        SELECT id FROM archive_document_chunks WHERE document_id = $1
      `, [documentId]);

      const chunkIds = chunksResult.rows.map((row: any) => row.id);
      if (chunkIds.length > 0) {
        await qdrantClient.deletePoints(this.COLLECTION_NAME, chunkIds);
      }

      // Delete from database
      await database.query(`
        DELETE FROM archive_documents WHERE id = $1
      `, [documentId]);

      logger.info(`Document ${documentId} deleted successfully`);
    } catch (error) {
      logger.error(`Failed to delete document ${documentId}:`, error);
      throw error;
    }
  }
}

// Singleton instance
export const documentProcessor = new DocumentProcessor();
