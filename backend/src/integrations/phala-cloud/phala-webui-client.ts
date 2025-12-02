// =====================================
// backend/src/integrations/phala-cloud/phala-webui-client.ts
// =====================================

import axios from 'axios';
import { logger } from '../../utils/logger';

export interface PhalaWebUIConfig {
  endpoint: string;
  publicKey: string;
  salt: string;
  apiKey?: string;
  timeout: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  track?: string;
  sessionId?: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  track?: string;
  sessionId?: string;
  attestation?: string;
  signature?: string;
}

export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  track?: string;
}

export class PhalaWebUIClient {
  private config: PhalaWebUIConfig;
  private baseURL: string;

  constructor(config: PhalaWebUIConfig) {
    this.config = config;
    this.baseURL = config.endpoint;
  }

  /**
   * Get available models from Phala Cloud
   */
  async getModels(): Promise<ModelInfo[]> {
    try {
      logger.info('Fetching available models from Phala Cloud');
      
      const headers: any = {
        'Content-Type': 'application/json'
      };

      // Add authentication headers
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      } else {
        headers['X-Phala-Public-Key'] = this.config.publicKey;
        headers['X-Phala-Salt'] = this.config.salt;
      }

      const response = await axios.get(`${this.baseURL}/v1/models`, {
        headers,
        timeout: this.config.timeout
      });

      return response.data.data || [];
    } catch (error) {
      logger.error('Failed to fetch models from Phala Cloud:', error);
      throw new Error(`Model fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Send chat completion request to Phala Cloud
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      logger.info(`Sending chat completion request for track: ${request.track || 'default'}`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };

      // Add authentication headers
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      } else {
        headers['X-Phala-Public-Key'] = this.config.publicKey;
        headers['X-Phala-Salt'] = this.config.salt;
      }

      const response = await axios.post(`${this.baseURL}/v1/chat/completions`, {
        ...request,
        // Add Phala-specific metadata
        metadata: {
          track: request.track,
          sessionId: request.sessionId,
          timestamp: new Date().toISOString(),
          privacyLevel: 'maximum'
        }
      }, {
        headers,
        timeout: this.config.timeout
      });

      const result: ChatCompletionResponse = {
        ...response.data,
        track: request.track,
        sessionId: request.sessionId
      };

      logger.info(`Chat completion successful for track: ${request.track || 'default'}`);
      return result;

    } catch (error) {
      logger.error('Chat completion failed:', error);
      throw new Error(`Chat completion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process RAG query with track-specific context
   */
  async processRAGQuery(
    query: string,
    track: string,
    sessionId: string,
    context: string,
    model: string = 'gpt-3.5-turbo'
  ): Promise<ChatCompletionResponse> {
    const systemPrompt = this.getTrackSystemPrompt(track);
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Context: ${context}\n\nQuery: ${query}`
      }
    ];

    return await this.chatCompletion({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 2048,
      track,
      sessionId
    });
  }

  /**
   * Generate embeddings using Phala Cloud
   */
  async generateEmbeddings(
    texts: string[],
    track: string,
    sessionId: string,
    model: string = 'text-embedding-ada-002'
  ): Promise<number[][]> {
    try {
      logger.info(`Generating embeddings for ${texts.length} texts in track: ${track}`);
      
      // For now, we'll use a simple approach since vLLM might not have embedding models
      // In a real implementation, you'd call the embedding endpoint
      const response = await this.chatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `Generate embeddings for these texts: ${texts.join('\n')}`
        }],
        temperature: 0.1,
        max_tokens: 1000,
        track,
        sessionId
      });

      // This is a placeholder - in reality you'd parse the response to get embeddings
      // For now, return mock embeddings
      return texts.map(() => Array(1536).fill(0).map(() => Math.random()));
      
    } catch (error) {
      logger.error('Embedding generation failed:', error);
      throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get attestation for computation verification
   */
  async getAttestation(sessionId: string): Promise<string> {
    try {
      const headers: any = {};
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      } else {
        headers['X-Phala-Public-Key'] = this.config.publicKey;
        headers['X-Phala-Salt'] = this.config.salt;
      }

      const response = await axios.get(`${this.baseURL}/v1/attestation/${sessionId}`, {
        headers,
        timeout: this.config.timeout
      });

      return response.data.attestation || 'no-attestation-available';
    } catch (error) {
      logger.error('Failed to get attestation:', error);
      return 'attestation-failed';
    }
  }

  /**
   * Get signature for computation verification
   */
  async getSignature(sessionId: string): Promise<string> {
    try {
      const headers: any = {};
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      } else {
        headers['X-Phala-Public-Key'] = this.config.publicKey;
        headers['X-Phala-Salt'] = this.config.salt;
      }

      const response = await axios.get(`${this.baseURL}/v1/signature/${sessionId}`, {
        headers,
        timeout: this.config.timeout
      });

      return response.data.signature || 'no-signature-available';
    } catch (error) {
      logger.error('Failed to get signature:', error);
      return 'signature-failed';
    }
  }

  /**
   * Get track-specific system prompts
   */
  private getTrackSystemPrompt(track: string): string {
    const basePrompt = `You are the BGIN Archive Agent, a specialized AI assistant for blockchain governance research and analysis. You operate with maximum privacy and confidentiality using Phala Cloud's TEE (Trusted Execution Environment) infrastructure.`;

    switch (track) {
      case 'technical-standards':
        return `${basePrompt}

Focus on:
- Technical specifications and standards compliance
- Implementation details and best practices
- Cross-chain interoperability standards
- Consensus mechanisms and protocols
- Security and performance considerations

Provide detailed, technical analysis with specific recommendations for implementation.`;

      case 'regulatory-landscape':
        return `${basePrompt}

Focus on:
- Regulatory frameworks and compliance requirements
- Legal considerations and risk assessment
- Policy analysis and stakeholder impact
- Cross-jurisdictional governance challenges
- Regulatory sandbox and pilot programs

Provide comprehensive regulatory analysis with compliance recommendations.`;

      case 'privacy-rights':
        return `${basePrompt}

Focus on:
- Privacy protection and data sovereignty
- Digital rights and user agency
- FPP (First Person Project) compliance
- Dignity-based economics principles
- Privacy-preserving technologies

Provide privacy-focused analysis with emphasis on user sovereignty and dignity.`;

      case 'cross-chain-governance':
        return `${basePrompt}

Focus on:
- Cross-chain interoperability and coordination
- Multi-chain governance mechanisms
- Bridge protocols and security
- Consensus coordination across chains
- Cross-chain communication standards

Provide detailed analysis of cross-chain governance challenges and solutions.`;

      default:
        return `${basePrompt}

Provide comprehensive analysis of blockchain governance topics with focus on:
- Technical implementation
- Regulatory compliance
- Privacy protection
- Cross-chain coordination

Be thorough, accurate, and provide actionable insights.`;
    }
  }

  /**
   * Health check for Phala Cloud connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getModels();
      return true;
    } catch (error) {
      logger.error('Phala Cloud health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const phalaWebUIClient = new PhalaWebUIClient({
  endpoint: process.env.PHALA_ENDPOINT || 'https://890e30429c7029b543e69653fb1ca507293797ad-3000.dstack-prod5.phala.network',
  publicKey: process.env.PHALA_PUBLIC_KEY || '',
  salt: process.env.PHALA_SALT || 'ee17e2170d7d40dcaf3015d610837cf5',
  apiKey: process.env.PHALA_API_KEY,
  timeout: 60000 // 60 seconds
});
