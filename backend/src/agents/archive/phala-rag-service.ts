// =====================================
// backend/src/agents/archive/phala-rag-service.ts
// =====================================

import { phalaClient, TEEJob, RAGJobInput, InferenceJobInput, EmbeddingJobInput } from '../../integrations/phala-cloud/phala-client';
import { phalaWebUIClient, ChatCompletionRequest, ChatCompletionResponse } from '../../integrations/phala-cloud/phala-webui-client';
import { logger } from '../../utils/logger';
import { database } from '../../utils/database';

export interface TrackConfig {
  track: 'technical-standards' | 'regulatory-landscape' | 'privacy-rights' | 'cross-chain-governance';
  model: string;
  embeddingModel: string;
  privacyLevel: 'maximum' | 'high' | 'selective' | 'minimal';
  maxTokens: number;
  temperature: number;
}

export interface PhalaRAGResult {
  response: string;
  sources: Array<{
    id: string;
    title: string;
    content: string;
    relevanceScore: number;
    track: string;
  }>;
  confidence: number;
  privacyVerified: boolean;
  computationProof: string;
  processingTime: number;
  track: string;
  sessionId: string;
}

export class PhalaRAGService {
  private trackConfigs: Map<string, TrackConfig> = new Map();
  private activeJobs: Map<string, TEEJob> = new Map();

  constructor() {
    this.initializeTrackConfigs();
  }

  private initializeTrackConfigs(): void {
    // Technical Standards Track
    this.trackConfigs.set('technical-standards', {
      track: 'technical-standards',
      model: 'llama2-13b-chat',
      embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
      privacyLevel: 'maximum',
      maxTokens: 2048,
      temperature: 0.3
    });

    // Regulatory Landscape Track
    this.trackConfigs.set('regulatory-landscape', {
      track: 'regulatory-landscape',
      model: 'llama2-13b-chat',
      embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
      privacyLevel: 'maximum',
      maxTokens: 2048,
      temperature: 0.2
    });

    // Privacy & Digital Rights Track
    this.trackConfigs.set('privacy-rights', {
      track: 'privacy-rights',
      model: 'llama2-13b-chat',
      embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
      privacyLevel: 'maximum',
      maxTokens: 2048,
      temperature: 0.1
    });

    // Cross-Chain Governance Track
    this.trackConfigs.set('cross-chain-governance', {
      track: 'cross-chain-governance',
      model: 'llama2-13b-chat',
      embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
      privacyLevel: 'maximum',
      maxTokens: 2048,
      temperature: 0.4
    });
  }

  /**
   * Process RAG query using Phala Cloud TEE for a specific track
   */
  async processTrackQuery(
    query: string,
    track: string,
    sessionId: string,
    documents: Array<{ id: string; content: string; metadata: any }>
  ): Promise<PhalaRAGResult> {
    const startTime = Date.now();
    const trackConfig = this.trackConfigs.get(track);
    
    if (!trackConfig) {
      throw new Error(`Unknown track: ${track}`);
    }

    try {
      logger.info(`Processing RAG query for track ${track} in session ${sessionId}`);

      // Step 1: Generate embeddings for documents in TEE
      const embeddingJob = await this.generateEmbeddings(documents, track, sessionId);
      const embeddingResult = await this.waitForJobCompletion(embeddingJob.id);

      // Step 2: Perform RAG search in TEE
      const ragJob = await this.performRAGSearch(query, documents, track, sessionId);
      const ragResult = await this.waitForJobCompletion(ragJob.id);

      // Step 3: Generate response using LLM in TEE
      const inferenceJob = await this.generateResponse(query, ragResult.output, track, sessionId);
      const inferenceResult = await this.waitForJobCompletion(inferenceJob.id);

      // Step 4: Verify computation integrity
      const privacyVerified = await phalaClient.verifyComputation(ragJob.id);
      const computationProof = await this.getComputationProof(ragJob.id);

      const processingTime = Date.now() - startTime;

      const result: PhalaRAGResult = {
        response: inferenceResult.output.response,
        sources: ragResult.output.sources || [],
        confidence: ragResult.output.confidence || 0.8,
        privacyVerified,
        computationProof,
        processingTime,
        track,
        sessionId
      };

      // Store result in database
      await this.storeRAGResult(result);

      logger.info(`RAG processing completed for track ${track} in ${processingTime}ms`);
      return result;

    } catch (error) {
      logger.error(`RAG processing failed for track ${track}:`, error);
      throw new Error(`Phala RAG processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate embeddings for documents using Phala Cloud TEE
   */
  private async generateEmbeddings(
    documents: Array<{ id: string; content: string; metadata: any }>,
    track: string,
    sessionId: string
  ): Promise<TEEJob> {
    const trackConfig = this.trackConfigs.get(track)!;
    
    const input: EmbeddingJobInput = {
      texts: documents.map(doc => doc.content),
      model: trackConfig.embeddingModel,
      track,
      sessionId,
      privacyLevel: trackConfig.privacyLevel
    };

    return await phalaClient.submitEmbeddingJob(input);
  }

  /**
   * Perform RAG search using Phala Cloud TEE
   */
  private async performRAGSearch(
    query: string,
    documents: Array<{ id: string; content: string; metadata: any }>,
    track: string,
    sessionId: string
  ): Promise<TEEJob> {
    const trackConfig = this.trackConfigs.get(track)!;
    
    const input: RAGJobInput = {
      documents,
      query,
      sessionId,
      track,
      privacyLevel: trackConfig.privacyLevel
    };

    return await phalaClient.submitRAGJob(input);
  }

  /**
   * Generate response using LLM in Phala Cloud TEE
   */
  private async generateResponse(
    query: string,
    ragContext: any,
    track: string,
    sessionId: string
  ): Promise<TEEJob> {
    const trackConfig = this.trackConfigs.get(track)!;
    
    const prompt = this.buildTrackPrompt(query, ragContext, track);
    
    const input: InferenceJobInput = {
      prompt,
      model: trackConfig.model,
      track,
      sessionId,
      temperature: trackConfig.temperature,
      maxTokens: trackConfig.maxTokens,
      privacyLevel: trackConfig.privacyLevel
    };

    return await phalaClient.submitInferenceJob(input);
  }

  /**
   * Build track-specific prompts for different BGIN tracks
   */
  private buildTrackPrompt(query: string, ragContext: any, track: string): string {
    const basePrompt = `You are the BGIN Archive Agent specializing in ${track}. 
    Analyze the following context and provide a comprehensive response to the user's query.
    
    Query: ${query}
    
    Context: ${JSON.stringify(ragContext, null, 2)}
    
    Please provide a detailed, accurate response based on the context provided.`;

    switch (track) {
      case 'technical-standards':
        return `${basePrompt}\n\nFocus on technical specifications, standards compliance, and implementation details.`;
      
      case 'regulatory-landscape':
        return `${basePrompt}\n\nFocus on regulatory frameworks, compliance requirements, and legal considerations.`;
      
      case 'privacy-rights':
        return `${basePrompt}\n\nFocus on privacy protection, data sovereignty, and digital rights considerations.`;
      
      case 'cross-chain-governance':
        return `${basePrompt}\n\nFocus on cross-chain interoperability, governance mechanisms, and coordination protocols.`;
      
      default:
        return basePrompt;
    }
  }

  /**
   * Wait for job completion with timeout
   */
  private async waitForJobCompletion(jobId: string, timeoutMs: number = 300000): Promise<TEEJob> {
    return await phalaClient.waitForJobCompletion(jobId, timeoutMs);
  }

  /**
   * Get computation proof for verification
   */
  private async getComputationProof(jobId: string): Promise<string> {
    try {
      const job = await phalaClient.getJobStatus(jobId);
      return job.output?.proof || 'no-proof-available';
    } catch (error) {
      logger.error(`Failed to get computation proof for job ${jobId}:`, error);
      return 'proof-retrieval-failed';
    }
  }

  /**
   * Store RAG result in database
   */
  private async storeRAGResult(result: PhalaRAGResult): Promise<void> {
    try {
      await database.query(`
        INSERT INTO phala_rag_results (
          id, track, session_id, response, sources, confidence,
          privacy_verified, computation_proof, processing_time, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        `phala_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        result.track,
        result.sessionId,
        result.response,
        JSON.stringify(result.sources),
        result.confidence,
        result.privacyVerified,
        result.computationProof,
        result.processingTime,
        new Date()
      ]);
    } catch (error) {
      logger.error('Failed to store RAG result:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Get track-specific models available in Phala Cloud
   */
  async getAvailableModels(track: string): Promise<string[]> {
    try {
      return await phalaClient.getTrackModels(track);
    } catch (error) {
      logger.error(`Failed to get models for track ${track}:`, error);
      return [];
    }
  }

  /**
   * Get privacy compliance report for a track
   */
  async getPrivacyReport(track: string, sessionId: string): Promise<any> {
    try {
      return await phalaClient.getPrivacyReport(track, sessionId);
    } catch (error) {
      logger.error(`Failed to get privacy report for track ${track}:`, error);
      return null;
    }
  }

  /**
   * Process RAG query using Phala WebUI (simplified approach)
   */
  async processQueryWithWebUI(
    query: string,
    track: string,
    sessionId: string,
    context: string
  ): Promise<PhalaRAGResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`Processing RAG query with Phala WebUI for track ${track} in session ${sessionId}`);

      // Get available models
      const models = await phalaWebUIClient.getModels();
      const model = models.length > 0 ? models[0].id : 'gpt-3.5-turbo';

      // Process query using WebUI
      const response = await phalaWebUIClient.processRAGQuery(
        query,
        track,
        sessionId,
        context,
        model
      );

      // Get attestation and signature for verification
      const attestation = await phalaWebUIClient.getAttestation(sessionId);
      const signature = await phalaWebUIClient.getSignature(sessionId);

      const processingTime = Date.now() - startTime;

      const result: PhalaRAGResult = {
        response: response.choices[0]?.message?.content || 'No response generated',
        sources: [{
          id: 'webui-context',
          title: `Context for ${track}`,
          content: context,
          relevanceScore: 0.9,
          track: track
        }],
        confidence: 0.8,
        privacyVerified: attestation !== 'attestation-failed',
        computationProof: signature,
        processingTime,
        track,
        sessionId
      };

      // Store result in database
      await this.storeRAGResult(result);

      logger.info(`WebUI RAG processing completed for track ${track} in ${processingTime}ms`);
      return result;

    } catch (error) {
      logger.error(`WebUI RAG processing failed for track ${track}:`, error);
      throw new Error(`Phala WebUI RAG processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get available models from Phala WebUI
   */
  async getWebUIModels(): Promise<any[]> {
    try {
      return await phalaWebUIClient.getModels();
    } catch (error) {
      logger.error('Failed to get WebUI models:', error);
      return [];
    }
  }

  /**
   * Health check for Phala WebUI
   */
  async checkWebUIHealth(): Promise<boolean> {
    try {
      return await phalaWebUIClient.healthCheck();
    } catch (error) {
      logger.error('WebUI health check failed:', error);
      return false;
    }
  }

  /**
   * Clean up completed jobs
   */
  async cleanupCompletedJobs(): Promise<void> {
    try {
      for (const [jobId, job] of this.activeJobs.entries()) {
        if (job.status === 'completed' || job.status === 'failed') {
          this.activeJobs.delete(jobId);
        }
      }
      logger.info(`Cleaned up completed jobs. Active jobs: ${this.activeJobs.size}`);
    } catch (error) {
      logger.error('Failed to cleanup completed jobs:', error);
    }
  }
}

// Export singleton instance
export const phalaRAGService = new PhalaRAGService();
