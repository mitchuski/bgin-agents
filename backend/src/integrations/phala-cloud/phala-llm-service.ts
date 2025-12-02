// =====================================
// backend/src/integrations/phala-cloud/phala-llm-service.ts
// =====================================

import axios from 'axios';
import { logger } from '../../utils/logger';

export interface PhalaLLMConfig {
  endpoint: string;
  publicKey: string;
  salt: string;
  apiKey?: string;
  timeout: number;
}

export interface LLMRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  track?: string;
  sessionId?: string;
}

export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
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
  processingTime?: number;
}

export class PhalaLLMService {
  private config: PhalaLLMConfig;
  private baseURL: string;

  constructor(config: PhalaLLMConfig) {
    this.config = config;
    this.baseURL = config.endpoint;
  }

  /**
   * Send LLM request to Phala Cloud for confidential compute
   */
  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    
    try {
      logger.info(`Sending LLM request to Phala Cloud for track: ${request.track || 'default'}`);
      
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
          privacyLevel: 'maximum',
          confidentialCompute: true
        }
      }, {
        headers,
        timeout: this.config.timeout
      });

      const processingTime = Date.now() - startTime;

      const result: LLMResponse = {
        ...response.data,
        track: request.track,
        sessionId: request.sessionId,
        processingTime
      };

      // Try to get attestation and signature for verification
      try {
        if (request.sessionId) {
          result.attestation = await this.getAttestation(request.sessionId);
          result.signature = await this.getSignature(request.sessionId);
        }
      } catch (error) {
        logger.warn('Could not retrieve attestation/signature:', error);
      }

      logger.info(`LLM request completed in ${processingTime}ms for track: ${request.track || 'default'}`);
      return result;

    } catch (error) {
      logger.error('LLM request failed:', error);
      throw new Error(`Phala Cloud LLM request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate track-specific response for BGIN agents
   */
  async generateTrackResponse(
    query: string,
    track: 'technical-standards' | 'regulatory-landscape' | 'privacy-rights' | 'cross-chain-governance',
    sessionId: string,
    context?: string,
    model: string = 'gpt-3.5-turbo'
  ): Promise<LLMResponse> {
    const systemPrompt = this.getTrackSystemPrompt(track);
    
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      {
        role: 'user' as const,
        content: context ? `Context: ${context}\n\nQuery: ${query}` : query
      }
    ];

    return await this.generateResponse({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 2048,
      track,
      sessionId
    });
  }

  /**
   * Generate response for Archive Agent
   */
  async generateArchiveResponse(
    query: string,
    sessionId: string,
    context: string,
    synthesisMode: 'summary' | 'detailed' | 'analytical' = 'summary'
  ): Promise<LLMResponse> {
    const systemPrompt = `You are the BGIN Archive Agent, specializing in knowledge synthesis and document analysis. 
    You operate with maximum privacy using Phala Cloud's confidential compute infrastructure.
    
    Focus on:
    - Document analysis and knowledge synthesis
    - Cross-session search and retrieval
    - Privacy-preserving knowledge management
    - Distributed consciousness architecture
    
    Synthesis Mode: ${synthesisMode}
    Provide comprehensive, accurate analysis with actionable insights.`;

    return await this.generateResponse({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nQuery: ${query}`
        }
      ],
      temperature: 0.2,
      max_tokens: 2048,
      track: 'archive-agent',
      sessionId
    });
  }

  /**
   * Generate response for Codex Agent
   */
  async generateCodexResponse(
    query: string,
    sessionId: string,
    context: string
  ): Promise<LLMResponse> {
    const systemPrompt = `You are the BGIN Codex Agent, specializing in policy analysis and standards management.
    You operate with maximum privacy using Phala Cloud's confidential compute infrastructure.
    
    Focus on:
    - Policy analysis and standards development
    - Compliance checking and verification
    - Real-time sovereignty enforcement
    - Cryptoeconomic verification systems
    
    Provide detailed policy analysis with compliance recommendations.`;

    return await this.generateResponse({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nQuery: ${query}`
        }
      ],
      temperature: 0.1,
      max_tokens: 2048,
      track: 'codex-agent',
      sessionId
    });
  }

  /**
   * Generate response for Discourse Agent
   */
  async generateDiscourseResponse(
    query: string,
    sessionId: string,
    context: string
  ): Promise<LLMResponse> {
    const systemPrompt = `You are the BGIN Discourse Agent, specializing in community engagement and collaboration.
    You operate with maximum privacy using Phala Cloud's confidential compute infrastructure.
    
    Focus on:
    - Community engagement and consensus building
    - Trust network establishment
    - Privacy-preserving communication
    - Collaboration facilitation
    
    Provide community-focused analysis with collaboration recommendations.`;

    return await this.generateResponse({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nQuery: ${query}`
        }
      ],
      temperature: 0.4,
      max_tokens: 2048,
      track: 'discourse-agent',
      sessionId
    });
  }

  /**
   * Get track-specific system prompts
   */
  private getTrackSystemPrompt(track: string): string {
    const basePrompt = `You are a BGIN AI Agent operating with maximum privacy using Phala Cloud's confidential compute infrastructure.`;

    switch (track) {
      case 'technical-standards':
        return `${basePrompt}

Focus on technical specifications, standards compliance, and implementation details for blockchain governance.
Provide detailed technical analysis with specific recommendations for implementation.`;

      case 'regulatory-landscape':
        return `${basePrompt}

Focus on regulatory frameworks, compliance requirements, and legal considerations for blockchain governance.
Provide comprehensive regulatory analysis with compliance recommendations.`;

      case 'privacy-rights':
        return `${basePrompt}

Focus on privacy protection, data sovereignty, and digital rights in blockchain governance.
Provide privacy-focused analysis with emphasis on user sovereignty and dignity.`;

      case 'cross-chain-governance':
        return `${basePrompt}

Focus on cross-chain interoperability, governance mechanisms, and coordination protocols.
Provide detailed analysis of cross-chain governance challenges and solutions.`;

      default:
        return `${basePrompt}

Provide comprehensive analysis of blockchain governance topics with focus on technical implementation, regulatory compliance, privacy protection, and cross-chain coordination.`;
    }
  }

  /**
   * Get attestation for computation verification
   */
  private async getAttestation(sessionId: string): Promise<string> {
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
      logger.warn('Failed to get attestation:', error);
      return 'attestation-failed';
    }
  }

  /**
   * Get signature for computation verification
   */
  private async getSignature(sessionId: string): Promise<string> {
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
      logger.warn('Failed to get signature:', error);
      return 'signature-failed';
    }
  }

  /**
   * Health check for Phala Cloud connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to access the WebUI interface
      const response = await axios.get(this.baseURL, {
        timeout: 10000
      });
      return response.status === 200;
    } catch (error) {
      logger.error('Phala Cloud health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const phalaLLMService = new PhalaLLMService({
  endpoint: process.env.PHALA_ENDPOINT || 'https://890e30429c7029b543e69653fb1ca507293797ad-3000.dstack-prod5.phala.network',
  publicKey: process.env.PHALA_PUBLIC_KEY || '',
  salt: process.env.PHALA_SALT || 'ee17e2170d7d40dcaf3015d610837cf5',
  apiKey: process.env.PHALA_API_KEY,
  timeout: 60000 // 60 seconds
});
