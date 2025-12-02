// =====================================
// backend/src/agents/archive/enhanced-rag-engine.ts
// =====================================

import { retrievalSystem, SearchFilters, UserContext, SearchResult, FilteredResult } from './retrieval-system';
import { documentProcessor, DocumentMetadata, ProcessedDocument } from './document-processor';
import { documentationAdvisor, DocumentationQualityMetrics, DocumentationRecommendation, DocumentationPlan } from './documentation-advisor';
import { llmClient } from '../../integrations/llm/llm-client';
import { discourseClient } from '../../integrations/discourse-api/discourse-client';
import { kwaaiClient } from '../../integrations/kwaai/kwaai-client';
import { phalaRAGService, PhalaRAGResult } from './phala-rag-service';
import { phalaLLMService } from '../../integrations/phala-cloud/phala-llm-service';
import { logger } from '../../utils/logger';
import { database } from '../../utils/database';

export interface RAGQuery {
  query: string;
  sessionId: string;
  userContext: UserContext;
  filters?: SearchFilters;
  includeCrossSession?: boolean;
  maxResults?: number;
  synthesisMode?: 'summary' | 'detailed' | 'analytical';
}

export interface RAGResponse {
  response: string;
  sources: {
    documentId: string;
    title: string;
    content: string;
    score: number;
    accessLevel: 'full' | 'summary' | 'metadata';
  }[];
  metadata: {
    totalSources: number;
    crossSessionSources: number;
    processingTime: number;
    confidence: number;
    privacyLevel: string;
  };
  insights?: string[];
  recommendations?: string[];
}

export interface SynthesisContext {
  query: string;
  sources: FilteredResult[];
  sessionContext: {
    sessionId: string;
    sessionName: string;
    participantCount: number;
  };
  userContext: UserContext;
  synthesisMode: 'summary' | 'detailed' | 'analytical';
}

export class EnhancedRAGEngine {
  private readonly MAX_SOURCES = 10;
  private readonly MIN_CONFIDENCE = 0.6;

  async processQuery(ragQuery: RAGQuery): Promise<RAGResponse> {
    const startTime = Date.now();
    
    try {
      logger.info(`Processing RAG query: "${ragQuery.query}" in session ${ragQuery.sessionId}`);

      // Step 1: Search for relevant documents
      const searchResults = await this.searchRelevantDocuments(ragQuery);
      
      // Step 2: Rank and filter results
      const rankedResults = await retrievalSystem.rankResults(searchResults);
      const filteredResults = await retrievalSystem.applyPrivacyFilters(rankedResults, ragQuery.userContext);
      
      // Step 3: Cross-session search if enabled
      let crossSessionResults: FilteredResult[] = [];
      if (ragQuery.includeCrossSession) {
        crossSessionResults = await this.performCrossSessionSearch(ragQuery);
      }

      // Step 4: Combine and limit results
      const allResults = [...filteredResults, ...crossSessionResults]
        .slice(0, ragQuery.maxResults || this.MAX_SOURCES);

      // Step 5: Generate synthesis context
      const synthesisContext: SynthesisContext = {
        query: ragQuery.query,
        sources: allResults,
        sessionContext: await this.getSessionContext(ragQuery.sessionId),
        userContext: ragQuery.userContext,
        synthesisMode: ragQuery.synthesisMode || 'summary'
      };

      // Step 6: Generate response using LLM (with Phala Cloud integration)
      const response = await this.generateSynthesisWithPhala(synthesisContext);

      // Step 7: Generate insights and recommendations
      const insights = await this.generateInsights(synthesisContext);
      const recommendations = await this.generateRecommendations(synthesisContext);

      const processingTime = Date.now() - startTime;

      return {
        response: response.content,
        sources: allResults.map(result => ({
          documentId: result.metadata.documentId,
          title: result.document?.title || 'Untitled',
          content: result.content,
          score: result.finalScore,
          accessLevel: result.accessLevel
        })),
        metadata: {
          totalSources: allResults.length,
          crossSessionSources: crossSessionResults.length,
          processingTime,
          confidence: response.confidence || 0.8,
          privacyLevel: ragQuery.userContext.privacyLevel
        },
        insights,
        recommendations
      };

    } catch (error) {
      logger.error('RAG query processing failed:', error);
      throw error;
    }
  }

  /**
   * Process RAG query using Phala Cloud TEE for confidential compute
   * This method provides hardware-level privacy and verifiable computation
   */
  async processQueryWithPhala(
    ragQuery: RAGQuery,
    track: 'technical-standards' | 'regulatory-landscape' | 'privacy-rights' | 'cross-chain-governance'
  ): Promise<RAGResponse> {
    const startTime = Date.now();
    
    try {
      logger.info(`Processing RAG query with Phala Cloud for track ${track}: "${ragQuery.query}" in session ${ragQuery.sessionId}`);

      // Step 1: Get relevant documents for the track
      const searchResults = await this.searchRelevantDocuments(ragQuery);
      const rankedResults = await retrievalSystem.rankResults(searchResults);
      const filteredResults = await retrievalSystem.applyPrivacyFilters(rankedResults, ragQuery.userContext);
      
      // Step 2: Prepare documents for Phala Cloud processing
      const documents = filteredResults.slice(0, ragQuery.maxResults || this.MAX_SOURCES).map(result => ({
        id: result.metadata.documentId,
        content: result.content,
        metadata: {
          title: result.document?.title || 'Untitled',
          score: result.finalScore,
          accessLevel: result.accessLevel,
          sessionId: ragQuery.sessionId
        }
      }));

      // Step 3: Process using Phala Cloud TEE
      const phalaResult = await phalaRAGService.processTrackQuery(
        ragQuery.query,
        track,
        ragQuery.sessionId,
        documents
      );

      // Step 4: Generate additional insights using local processing
      const insights = await this.generateInsights({
        query: ragQuery.query,
        sources: phalaResult.sources.map(source => ({
          id: source.id,
          documentId: source.id,
          content: source.content,
          score: source.relevanceScore,
          finalScore: source.relevanceScore,
          relevanceScore: source.relevanceScore,
          qualityScore: 0.8, // Default quality score
          recencyScore: 0.7, // Default recency score
          accessLevel: 'full' as const,
          privacyCompliant: true,
          metadata: { 
            documentId: source.id, 
            title: source.title,
            sessionId: ragQuery.sessionId,
            privacyLevel: ragQuery.userContext.privacyLevel,
            chunkIndex: 0,
            startIndex: 0,
            endIndex: source.content.length,
            wordCount: source.content.split(' ').length
          }
        })),
        sessionContext: await this.getSessionContext(ragQuery.sessionId),
        userContext: ragQuery.userContext,
        synthesisMode: ragQuery.synthesisMode || 'summary'
      });

      const recommendations = await this.generateRecommendations({
        query: ragQuery.query,
        sources: phalaResult.sources.map(source => ({
          id: source.id,
          documentId: source.id,
          content: source.content,
          score: source.relevanceScore,
          finalScore: source.relevanceScore,
          relevanceScore: source.relevanceScore,
          qualityScore: 0.8, // Default quality score
          recencyScore: 0.7, // Default recency score
          accessLevel: 'full' as const,
          privacyCompliant: true,
          metadata: { 
            documentId: source.id, 
            title: source.title,
            sessionId: ragQuery.sessionId,
            privacyLevel: ragQuery.userContext.privacyLevel,
            chunkIndex: 0,
            startIndex: 0,
            endIndex: source.content.length,
            wordCount: source.content.split(' ').length
          }
        })),
        sessionContext: await this.getSessionContext(ragQuery.sessionId),
        userContext: ragQuery.userContext,
        synthesisMode: ragQuery.synthesisMode || 'summary'
      });

      const processingTime = Date.now() - startTime;

      return {
        response: phalaResult.response,
        sources: phalaResult.sources.map(source => ({
          documentId: source.id,
          title: source.title,
          content: source.content,
          score: source.relevanceScore,
          accessLevel: 'full' as const
        })),
        metadata: {
          totalSources: phalaResult.sources.length,
          crossSessionSources: 0, // Phala handles this internally
          processingTime,
          confidence: phalaResult.confidence,
          privacyLevel: ragQuery.userContext.privacyLevel
        },
        insights,
        recommendations
      };

    } catch (error) {
      logger.error('Phala RAG query processing failed:', error);
      throw error;
    }
  }

  /**
   * Generate synthesis using Phala Cloud for confidential compute
   * This maintains the existing UI while adding Phala Cloud capabilities
   */
  private async generateSynthesisWithPhala(context: SynthesisContext): Promise<{ content: string; confidence: number }> {
    try {
      logger.info('Generating synthesis with Phala Cloud for confidential compute');

      // Prepare context for Phala Cloud
      const contextString = context.sources.map(source => 
        `Document: ${source.document?.title || 'Untitled'}\nContent: ${source.content}\nRelevance: ${source.finalScore}`
      ).join('\n\n');

      // Use Phala Cloud for LLM inference
      const phalaResponse = await phalaLLMService.generateArchiveResponse(
        context.query,
        context.sessionContext?.sessionId || 'unknown',
        contextString,
        context.synthesisMode
      );

      // Extract response content
      const content = phalaResponse.choices[0]?.message?.content || 'No response generated';
      const confidence = 0.9; // High confidence for Phala Cloud responses

      logger.info(`Phala Cloud synthesis completed with ${phalaResponse.usage?.total_tokens || 0} tokens`);

      return {
        content,
        confidence: confidence || 0.9
      };

    } catch (error) {
      logger.error('Phala Cloud synthesis failed, falling back to local LLM:', error);
      
      // Fallback to local LLM if Phala Cloud fails
      const fallbackResult = await this.generateSynthesis(context);
      return {
        content: fallbackResult.content,
        confidence: fallbackResult.confidence || 0.7 // Default confidence for fallback
      };
    }
  }

  async processDocument(
    content: string,
    metadata: DocumentMetadata
  ): Promise<ProcessedDocument> {
    try {
      logger.info(`Processing document: ${metadata.title || 'Untitled'}`);
      
      // Convert string content to buffer for processing
      const buffer = Buffer.from(content, 'utf-8');
      
      return await documentProcessor.processDocument(buffer, metadata);

    } catch (error) {
      logger.error('Document processing failed:', error);
      throw error;
    }
  }

  async syncWithDiscourse(sessionId: string): Promise<void> {
    try {
      logger.info(`Syncing Discourse data for session ${sessionId}`);
      
      // Fetch topics from Discourse
      const topics = await discourseClient.fetchTopics();
      
      for (const topic of topics) {
        // Fetch posts for each topic
        const posts = await discourseClient.fetchPosts(topic.id);
        
        // Process each post as a document
        for (const post of posts) {
          const metadata: DocumentMetadata = {
            title: topic.title,
            author: post.username,
            source: 'discourse',
            sessionId,
            privacyLevel: 'selective',
            documentType: 'forum_post',
            mimeType: 'text/html',
            originalUrl: `${discourseClient['baseUrl']}/t/${topic.slug}/${topic.id}`,
            tags: topic.tags || [],
            language: 'en'
          };

          // Clean HTML content
          const cleanContent = this.cleanHtmlContent(post.cooked);
          
          if (cleanContent.length > 50) { // Only process substantial posts
            await this.processDocument(cleanContent, metadata);
          }
        }
      }

      logger.info(`Discourse sync completed for session ${sessionId}`);

    } catch (error) {
      logger.error('Discourse sync failed:', error);
      throw error;
    }
  }

  async generateKnowledgeCorrelations(sessionId: string): Promise<void> {
    try {
      logger.info(`Generating knowledge correlations for session ${sessionId}`);

      // Get all documents in the session
      const documents = await database.query(`
        SELECT id, title, content, summary, keywords
        FROM archive_documents 
        WHERE session_id = $1 AND processing_status = 'completed'
      `, [sessionId]);

      // Generate correlations between documents
      for (let i = 0; i < documents.rows.length; i++) {
        for (let j = i + 1; j < documents.rows.length; j++) {
          const doc1 = documents.rows[i];
          const doc2 = documents.rows[j];

          const correlation = await this.calculateDocumentCorrelation(doc1, doc2);
          
          if (correlation.strength > 0.7) {
            await database.query(`
              INSERT INTO archive_knowledge_correlations (
                source_document_id, target_document_id, correlation_strength,
                correlation_type, cross_session, confidence_score
              ) VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (source_document_id, target_document_id) 
              DO UPDATE SET 
                correlation_strength = EXCLUDED.correlation_strength,
                confidence_score = EXCLUDED.confidence_score
            `, [
              doc1.id,
              doc2.id,
              correlation.strength,
              correlation.type,
              false,
              correlation.confidence
            ]);
          }
        }
      }

      logger.info(`Knowledge correlations generated for session ${sessionId}`);

    } catch (error) {
      logger.error('Knowledge correlation generation failed:', error);
      throw error;
    }
  }

  private async searchRelevantDocuments(ragQuery: RAGQuery): Promise<SearchResult[]> {
    const filters: SearchFilters = {
      sessionId: ragQuery.sessionId,
      privacyLevel: ragQuery.userContext.privacyLevel,
      ...ragQuery.filters
    };

    return await retrievalSystem.searchSimilar(
      ragQuery.query,
      filters,
      ragQuery.maxResults || this.MAX_SOURCES
    );
  }

  private async performCrossSessionSearch(ragQuery: RAGQuery): Promise<FilteredResult[]> {
    try {
      // Get all other sessions
      const sessions = await database.query(`
        SELECT id FROM sessions WHERE id != $1
      `, [ragQuery.sessionId]);

      const otherSessionIds = sessions.rows.map((row: any) => row.id);
      
      if (otherSessionIds.length === 0) {
        return [];
      }

      const crossSessionResults = await retrievalSystem.crossSessionSearch(
        ragQuery.query,
        ragQuery.sessionId,
        otherSessionIds,
        5 // Limit cross-session results
      );

      // Convert SearchResult to RankedResult
      const rankedResults = await retrievalSystem.rankResults(crossSessionResults);
      return await retrievalSystem.applyPrivacyFilters(rankedResults, ragQuery.userContext);

    } catch (error) {
      logger.error('Cross-session search failed:', error);
      return [];
    }
  }

  private async generateSynthesis(context: SynthesisContext): Promise<{ content: string; confidence?: number }> {
    try {
      const sourcesText = context.sources
        .slice(0, 5) // Limit to top 5 sources for context
        .map((source, index) => 
          `[Source ${index + 1}] ${source.content}\n` +
          `(Title: ${source.document?.title || 'Untitled'}, ` +
          `Score: ${source.finalScore.toFixed(2)}, ` +
          `Privacy: ${source.metadata.privacyLevel})`
        )
        .join('\n\n');

      const prompt = this.buildSynthesisPrompt(context, sourcesText);
      
      const response = await llmClient.generateResponse(prompt, {
        maxTokens: context.synthesisMode === 'detailed' ? 4000 : context.synthesisMode === 'analytical' ? 5000 : 3000,
        temperature: 0.3
      });

      return {
        content: response.content,
        confidence: 0.8 // Could be calculated based on source quality
      };

    } catch (error) {
      logger.error('Synthesis generation failed:', error);
      return {
        content: 'Unable to generate synthesis at this time.',
        confidence: 0.1
      };
    }
  }

  private buildSynthesisPrompt(context: SynthesisContext, sourcesText: string): string {
    const basePrompt = `You are an Archive Agent in the BGIN Multi-Agent Research System. Your role is to synthesize research findings and provide evidence-based responses while respecting privacy levels.

**IMPORTANT: Provide comprehensive, detailed responses with extended reasoning. When referencing specific documents, include thorough analysis, context, and implications.**

Session: ${context.sessionContext.sessionName} (${context.sessionContext.participantCount} participants)
Query: ${context.query}
Privacy Level: ${context.userContext.privacyLevel}
Synthesis Mode: ${context.synthesisMode}

Sources:
${sourcesText}

**Reasoning Framework:**
1. Analyze each source document thoroughly
2. Identify key themes, patterns, and relationships
3. Consider multiple perspectives and potential implications
4. Provide detailed explanations for your conclusions
5. When referencing specific documents, explain WHY they are relevant and HOW they support your analysis

Please provide a comprehensive response that:`;

    switch (context.synthesisMode) {
      case 'summary':
        return basePrompt + `
1. **Comprehensive Summary**: Provide a thorough summary of key findings from all sources, including:
   - Main arguments and evidence presented
   - Key data points and statistics
   - Important quotes or excerpts (with proper attribution)
   - Context and background information
   - Relationships between different findings

2. **Document Analysis**: For each referenced document, explain:
   - What the document contains and its main purpose
   - Why it's relevant to the query
   - How it supports or contradicts other sources
   - The credibility and recency of the information
   - Any limitations or biases present

3. **Privacy-Aware Citations**: Provide clear, detailed citations that:
   - Reference specific sections or pages when possible
   - Include document titles, authors, and publication dates
   - Maintain appropriate privacy levels
   - Enable verification without revealing sensitive information

4. **Actionable Insights**: Offer specific, actionable insights including:
   - Immediate implications for blockchain governance
   - Recommended next steps or actions
   - Areas requiring further investigation
   - Potential policy or technical recommendations

5. **Extended Reasoning**: Include your reasoning process:
   - How you arrived at your conclusions
   - What evidence supports each claim
   - Alternative interpretations you considered
   - Confidence levels for different assertions`;

      case 'detailed':
        return basePrompt + `
1. **Comprehensive Analysis**: Provide an exhaustive analysis including:
   - Detailed examination of each source document
   - In-depth exploration of methodologies and approaches
   - Thorough analysis of data quality and reliability
   - Critical evaluation of arguments and evidence
   - Identification of gaps and limitations

2. **Relationship Mapping**: Explain complex relationships including:
   - How different findings connect and interact
   - Causal relationships and dependencies
   - Temporal sequences and historical context
   - Cross-disciplinary connections and implications
   - Potential feedback loops and systemic effects

3. **Governance Implications**: Discuss detailed implications including:
   - Specific impacts on different stakeholder groups
   - Regulatory and policy considerations
   - Technical implementation challenges
   - Economic and social consequences
   - Long-term strategic implications

4. **Research Opportunities**: Identify specific research areas including:
   - Detailed research questions that need investigation
   - Methodological approaches for future studies
   - Data collection requirements and challenges
   - Collaboration opportunities with other researchers
   - Funding and resource considerations

5. **Extended Documentation**: Provide comprehensive documentation including:
   - Detailed source analysis with page references
   - Complete reasoning chains and logical flows
   - Alternative interpretations and their merits
   - Confidence assessments and uncertainty quantification
   - Recommendations for further investigation`;

      case 'analytical':
        return basePrompt + `
1. **Critical Analysis**: Perform rigorous critical analysis including:
   - Systematic evaluation of source credibility and bias
   - Identification of logical fallacies and weak arguments
   - Assessment of evidence quality and sufficiency
   - Analysis of underlying assumptions and premises
   - Evaluation of methodological rigor and validity

2. **Pattern Recognition**: Identify and analyze patterns including:
   - Emerging trends and their significance
   - Recurring themes across different sources
   - Contradictions and inconsistencies
   - Anomalies and outliers
   - Predictive indicators and early warning signs

3. **Strategic Assessment**: Provide strategic analysis including:
   - SWOT analysis of current governance approaches
   - Competitive landscape and positioning
   - Risk assessment and mitigation strategies
   - Opportunity identification and prioritization
   - Long-term strategic planning considerations

4. **Policy Recommendations**: Offer detailed policy recommendations including:
   - Specific policy proposals with implementation details
   - Regulatory framework modifications
   - Institutional changes and governance reforms
   - Technical standards and protocols
   - Monitoring and evaluation mechanisms

5. **Extended Reasoning**: Provide comprehensive reasoning including:
   - Complete logical argumentation chains
   - Evidence evaluation and weighting
   - Alternative scenario analysis
   - Sensitivity analysis and robustness testing
   - Meta-analysis of the analytical process itself`;

      default:
        return basePrompt + `
1. **Comprehensive Synthesis**: Provide thorough synthesis including:
   - Integration of information from all relevant sources
   - Identification of key themes and patterns
   - Analysis of relationships and dependencies
   - Evaluation of evidence quality and reliability
   - Consideration of multiple perspectives and viewpoints

2. **Privacy-Aware Documentation**: Maintain privacy while providing:
   - Detailed source references and citations
   - Contextual information and background
   - Verification pathways without sensitive data exposure
   - Attribution that respects privacy requirements
   - Transparent methodology and approach

3. **Actionable Intelligence**: Offer specific, actionable insights including:
   - Immediate implications and next steps
   - Strategic recommendations and priorities
   - Research opportunities and collaboration potential
   - Policy and technical implementation guidance
   - Risk assessment and mitigation strategies

4. **Cross-Session Integration**: Identify and explain:
   - Connections to other research sessions
   - Cross-domain implications and applications
   - Collaborative opportunities and synergies
   - Knowledge transfer and replication potential
   - Systemic and holistic considerations

5. **Extended Reasoning**: Provide comprehensive reasoning including:
   - Detailed analytical process and methodology
   - Evidence evaluation and synthesis approach
   - Alternative interpretations and their consideration
   - Confidence levels and uncertainty quantification
   - Recommendations for further investigation and validation`;
    }
  }

  private async generateInsights(context: SynthesisContext): Promise<string[]> {
    try {
      const prompt = `Based on the following research context, generate 3-5 comprehensive, detailed insights for blockchain governance:

Query: ${context.query}
Sources: ${context.sources.length} documents
Session: ${context.sessionContext.sessionName}

**IMPORTANT: Provide detailed, well-reasoned insights with extended analysis. When referencing specific documents, include thorough explanations of their relevance and implications.**

For each insight, provide:
1. **Detailed Analysis**: Thorough examination of the insight including:
   - Specific evidence and data supporting the insight
   - Detailed explanation of why this insight is significant
   - Context and background information
   - Multiple perspectives and considerations

2. **Document References**: When referencing specific documents, explain:
   - What specific information from the document supports the insight
   - Why this document is particularly relevant
   - How it relates to other sources
   - The credibility and recency of the information

3. **Implications and Impact**: Detailed analysis of:
   - Immediate implications for blockchain governance
   - Long-term strategic implications
   - Specific impacts on different stakeholder groups
   - Potential risks and opportunities

4. **Actionable Recommendations**: Specific, detailed recommendations including:
   - Concrete next steps and actions
   - Implementation considerations and challenges
   - Resource requirements and timelines
   - Success metrics and evaluation criteria

Focus on:
- Emerging patterns or trends with detailed analysis
- Policy implications with specific recommendations
- Technical considerations with implementation details
- Governance challenges or opportunities with strategic analysis

Provide comprehensive, actionable insights with extended reasoning.`;

      const response = await llmClient.generateResponse(prompt, {
        maxTokens: 1500,
        temperature: 0.4
      });

      return response.content
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(insight => insight.length > 0)
        .slice(0, 5);

    } catch (error) {
      logger.error('Insights generation failed:', error);
      return [];
    }
  }

  private async generateRecommendations(context: SynthesisContext): Promise<string[]> {
    try {
      const prompt = `Based on the research findings, provide 3-5 comprehensive, detailed recommendations for the BGIN community:

Query: ${context.query}
Session: ${context.sessionContext.sessionName}
Sources: ${context.sources.length} documents

**IMPORTANT: Provide detailed, well-reasoned recommendations with extended analysis. When referencing specific documents, include thorough explanations of their relevance and how they support the recommendations.**

For each recommendation, provide:
1. **Detailed Rationale**: Comprehensive explanation including:
   - Specific evidence and data supporting the recommendation
   - Detailed analysis of why this recommendation is necessary
   - Context and background information
   - Multiple perspectives and considerations

2. **Document Evidence**: When referencing specific documents, explain:
   - What specific information from the document supports the recommendation
   - Why this document is particularly relevant
   - How it relates to other sources and findings
   - The credibility and recency of the supporting evidence

3. **Implementation Details**: Specific, actionable implementation guidance including:
   - Concrete steps and actions required
   - Timeline and milestones
   - Resource requirements and budget considerations
   - Stakeholder involvement and coordination needs
   - Risk assessment and mitigation strategies

4. **Success Metrics**: Detailed evaluation criteria including:
   - Specific, measurable outcomes
   - Key performance indicators (KPIs)
   - Monitoring and evaluation methods
   - Success benchmarks and targets
   - Long-term impact assessment

5. **Community Impact**: Analysis of community benefits including:
   - Specific benefits for different stakeholder groups
   - Community engagement opportunities
   - Knowledge sharing and collaboration potential
   - Capacity building and skill development
   - Long-term community value

Focus on:
- Immediate actions or next steps with detailed implementation plans
- Areas requiring further research with specific research questions and methodologies
- Policy or technical recommendations with detailed implementation guidance
- Community engagement opportunities with specific engagement strategies

Provide comprehensive, actionable recommendations with extended reasoning and detailed implementation guidance.`;

      const response = await llmClient.generateResponse(prompt, {
        maxTokens: 1200,
        temperature: 0.3
      });

      return response.content
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(rec => rec.length > 0)
        .slice(0, 5);

    } catch (error) {
      logger.error('Recommendations generation failed:', error);
      return [];
    }
  }

  private async getSessionContext(sessionId: string): Promise<{
    sessionId: string;
    sessionName: string;
    participantCount: number;
  }> {
    try {
      const result = await database.query(`
        SELECT name, participants_count FROM sessions WHERE id = $1
      `, [sessionId]);

      if (result.rows.length === 0) {
        return {
          sessionId,
          sessionName: 'Unknown Session',
          participantCount: 0
        };
      }

      return {
        sessionId,
        sessionName: result.rows[0].name,
        participantCount: result.rows[0].participants_count
      };

    } catch (error) {
      logger.error('Failed to get session context:', error);
      return {
        sessionId,
        sessionName: 'Unknown Session',
        participantCount: 0
      };
    }
  }

  private async calculateDocumentCorrelation(doc1: any, doc2: any): Promise<{
    strength: number;
    type: string;
    confidence: number;
  }> {
    try {
      // Simple keyword-based correlation for now
      const keywords1 = doc1.keywords || [];
      const keywords2 = doc2.keywords || [];
      
      const commonKeywords = keywords1.filter((k: string) => keywords2.includes(k));
      const strength = commonKeywords.length / Math.max(keywords1.length, keywords2.length, 1);
      
      return {
        strength,
        type: 'keyword_similarity',
        confidence: 0.7
      };

    } catch (error) {
      logger.error('Document correlation calculation failed:', error);
      return {
        strength: 0,
        type: 'unknown',
        confidence: 0
      };
    }
  }

  private cleanHtmlContent(html: string): string {
    // Simple HTML cleaning - in production, use a proper HTML parser
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp;
      .replace(/&amp;/g, '&') // Replace &amp;
      .replace(/&lt;/g, '<') // Replace &lt;
      .replace(/&gt;/g, '>') // Replace &gt;
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Generate comprehensive documentation using OpenDocs methodology
   */
  async generateDocumentation(
    topic: string,
    context: { sessionId: string; domain: string; targetAudience: string[] },
    options?: {
      includeQualityAnalysis?: boolean;
      generateRecommendations?: boolean;
      validateAgainstStandards?: boolean;
    }
  ): Promise<{
    plan: DocumentationPlan;
    content: string;
    qualityMetrics?: DocumentationQualityMetrics;
    recommendations?: DocumentationRecommendation[];
    validation?: { isValid: boolean; issues: string[]; suggestions: string[] };
  }> {
    try {
      logger.info(`Generating documentation for topic: ${topic}`);

      // Step 1: Get related documents for context
      const relatedDocuments = await this.getRelatedDocuments(topic, context.sessionId);
      
      // Step 2: Create documentation plan using OpenDocs methodology
      const plan = await documentationAdvisor.createDocumentationPlan(
        topic,
        context,
        relatedDocuments
      );

      // Step 3: Generate content for each section
      let fullContent = `# ${plan.title}\n\n${plan.overview}\n\n`;
      
      for (const section of plan.sections) {
        const sectionContent = await documentationAdvisor.generateDocumentationContent(
          section,
          context,
          relatedDocuments
        );
        fullContent += sectionContent + '\n\n';
      }

      const result: any = {
        plan,
        content: fullContent
      };

      // Step 4: Quality analysis (if requested)
      if (options?.includeQualityAnalysis) {
        const mockDocument: ProcessedDocument = {
          id: 'temp-doc',
          title: plan.title,
          content: fullContent,
          metadata: {
            title: plan.title,
            author: 'System',
            source: 'Generated',
            sessionId: context.sessionId,
            privacyLevel: 'selective',
            tags: [],
            language: 'en',
            category: 'documentation',
            version: '1.0.0'
          },
          chunks: [],
          summary: plan.overview,
          keywords: [],
          entities: [],
          qualityScore: 0,
          processingStatus: 'completed'
        };

        result.qualityMetrics = await documentationAdvisor.analyzeDocumentationQuality(
          mockDocument,
          { sessionId: context.sessionId, domain: context.domain }
        );
      }

      // Step 5: Generate recommendations (if requested)
      if (options?.generateRecommendations && result.qualityMetrics) {
        // Create a mock document for recommendations
        const mockDocument: ProcessedDocument = {
          id: 'mock_doc',
          title: 'Mock Document',
          content: 'Mock document content for recommendations',
          metadata: {
            title: 'Mock Document',
            author: 'System',
            source: 'Internal',
            sessionId: context.sessionId,
            privacyLevel: 'selective',
            tags: [],
            language: 'en',
            category: 'general',
            version: '1.0.0'
          },
          chunks: [],
          summary: 'Mock document summary',
          keywords: [],
          entities: [],
          qualityScore: 0.8,
          processingStatus: 'completed'
        };
        
        result.recommendations = await documentationAdvisor.generateRecommendations(
          mockDocument,
          result.qualityMetrics,
          { sessionId: context.sessionId, domain: context.domain }
        );
      }

      // Step 6: Validate against standards (if requested)
      if (options?.validateAgainstStandards) {
        result.validation = await documentationAdvisor.validateDocumentation(fullContent);
      }

      logger.info(`Documentation generation completed for topic: ${topic}`);
      return result;

    } catch (error) {
      logger.error('Documentation generation failed:', error);
      throw error;
    }
  }

  /**
   * Analyze and improve existing documentation using OpenDocs methodology
   */
  async analyzeAndImproveDocumentation(
    documentId: string,
    context: { sessionId: string; domain: string }
  ): Promise<{
    originalDocument: ProcessedDocument;
    qualityMetrics: DocumentationQualityMetrics;
    recommendations: DocumentationRecommendation[];
    improvedContent?: string;
  }> {
    try {
      logger.info(`Analyzing and improving documentation: ${documentId}`);

      // Step 1: Get the document
      const document = await documentProcessor.getDocument(documentId);
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      // Step 2: Analyze quality
      const qualityMetrics = await documentationAdvisor.analyzeDocumentationQuality(
        document,
        context
      );

      // Step 3: Generate recommendations
      const recommendations = await documentationAdvisor.generateRecommendations(
        document,
        qualityMetrics,
        context
      );

      // Step 4: Generate improved content (if quality is low)
      let improvedContent: string | undefined;
      if (qualityMetrics.overallScore < 0.6) {
        const plan = await documentationAdvisor.createDocumentationPlan(
          document.title,
          {
            sessionId: context.sessionId,
            domain: context.domain,
            targetAudience: ['researchers', 'policymakers', 'developers']
          },
          [document]
        );

        // Generate improved content
        let content = `# ${plan.title}\n\n${plan.overview}\n\n`;
        for (const section of plan.sections) {
          const sectionContent = await documentationAdvisor.generateDocumentationContent(
            section,
            {
              sessionId: context.sessionId,
              domain: context.domain,
              targetAudience: ['researchers', 'policymakers', 'developers']
            },
            [document]
          );
          content += sectionContent + '\n\n';
        }
        improvedContent = content;
      }

      return {
        originalDocument: document,
        qualityMetrics,
        recommendations,
        improvedContent
      };

    } catch (error) {
      logger.error('Documentation analysis and improvement failed:', error);
      throw error;
    }
  }

  /**
   * Generate documentation metrics and analytics
   */
  async generateDocumentationAnalytics(
    sessionId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<{
    totalDocuments: number;
    averageQuality: number;
    qualityDistribution: { [key: string]: number };
    topIssues: string[];
    improvementTrends: { [key: string]: number };
    recommendations: string[];
  }> {
    try {
      logger.info(`Generating documentation analytics for session: ${sessionId}`);

      // Get all documents in the session
      const documents = await database.query(`
        SELECT id, title, content, summary, keywords, quality_score, created_at
        FROM archive_documents 
        WHERE session_id = $1 AND processing_status = 'completed'
        ${timeRange ? 'AND created_at BETWEEN $2 AND $3' : ''}
        ORDER BY created_at DESC
      `, timeRange ? [sessionId, timeRange.start, timeRange.end] : [sessionId]);

      const processedDocuments: ProcessedDocument[] = documents.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        metadata: {
          sessionId: sessionId,
          privacyLevel: 'selective' as const,
          documentType: 'archive_document'
        },
        chunks: [],
        summary: row.summary || '',
        keywords: row.keywords || [],
        entities: [],
        qualityScore: row.quality_score || 0,
        processingStatus: 'completed' as const
      }));

      // Generate metrics
      const metrics = await documentationAdvisor.generateDocumentationMetrics(
        processedDocuments,
        timeRange
      );

      // Generate recommendations based on analytics
      const recommendations = await this.generateAnalyticsRecommendations(metrics, processedDocuments);

      return {
        ...metrics,
        recommendations
      };

    } catch (error) {
      logger.error('Documentation analytics generation failed:', error);
      throw error;
    }
  }

  /**
   * Get related documents for a topic
   */
  private async getRelatedDocuments(topic: string, sessionId: string): Promise<ProcessedDocument[]> {
    try {
      const searchResults = await retrievalSystem.searchSimilar(
        topic,
        { sessionId, privacyLevel: 'selective' },
        10
      );

      const documents: ProcessedDocument[] = [];
      for (const result of searchResults) {
        if (result.document) {
          // Convert SearchResult document to ProcessedDocument
          const processedDoc: ProcessedDocument = {
            id: result.document.id,
            title: result.document.title,
            content: result.content,
            metadata: {
              title: result.document.title,
              author: 'Unknown',
              source: 'Search Result',
              sessionId: result.metadata.sessionId,
              privacyLevel: result.metadata.privacyLevel as 'maximum' | 'high' | 'selective' | 'minimal',
              tags: result.document.keywords || [],
              language: 'en'
            },
            chunks: [],
            summary: result.document.summary,
            keywords: result.document.keywords || [],
            entities: [],
            qualityScore: result.document.qualityScore,
            processingStatus: 'completed'
          };
          documents.push(processedDoc);
        }
      }

      return documents;

    } catch (error) {
      logger.error('Failed to get related documents:', error);
      return [];
    }
  }

  /**
   * Generate recommendations based on analytics
   */
  private async generateAnalyticsRecommendations(
    metrics: any,
    documents: ProcessedDocument[]
  ): Promise<string[]> {
    try {
      const recommendations: string[] = [];

      if (metrics.averageQuality < 0.6) {
        recommendations.push('Consider implementing a documentation review process to improve overall quality');
      }

      if (metrics.qualityDistribution.poor > metrics.qualityDistribution.excellent) {
        recommendations.push('Focus on improving low-quality documents before creating new ones');
      }

      if (documents.length < 5) {
        recommendations.push('Increase documentation coverage for better knowledge management');
      }

      if (metrics.topIssues.length > 0) {
        recommendations.push(`Address common issues: ${metrics.topIssues.slice(0, 3).join(', ')}`);
      }

      return recommendations;

    } catch (error) {
      logger.error('Failed to generate analytics recommendations:', error);
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const checks = await Promise.all([
        retrievalSystem.healthCheck(),
        llmClient.healthCheck(),
        discourseClient.healthCheck(),
        kwaaiClient.healthCheck()
      ]);

      return checks.every(check => check === true);

    } catch (error) {
      logger.error('RAG engine health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const enhancedRAGEngine = new EnhancedRAGEngine();
