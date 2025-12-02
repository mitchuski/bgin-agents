// =====================================
// backend/src/integrations/phala-cloud/phala-client.ts
// =====================================

import axios from 'axios';
import { logger } from '../../utils/logger';

export interface PhalaConfig {
  publicKey: string;
  salt: string;
  endpoint: string;
  region: string;
  environment: 'development' | 'production';
}

export interface TEEJob {
  id: string;
  type: 'rag' | 'inference' | 'embedding';
  track: 'technical-standards' | 'regulatory-landscape' | 'privacy-rights' | 'cross-chain-governance';
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  output?: any;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface RAGJobInput {
  documents: Array<{
    id: string;
    content: string;
    metadata: any;
  }>;
  query: string;
  sessionId: string;
  track: string;
  privacyLevel: 'maximum' | 'high' | 'selective' | 'minimal';
}

export interface InferenceJobInput {
  prompt: string;
  model: string;
  track: string;
  sessionId: string;
  temperature?: number;
  maxTokens?: number;
  privacyLevel: 'maximum' | 'high' | 'selective' | 'minimal';
}

export interface EmbeddingJobInput {
  texts: string[];
  model: string;
  track: string;
  sessionId: string;
  privacyLevel: 'maximum' | 'high' | 'selective' | 'minimal';
}

export class PhalaCloudClient {
  private config: PhalaConfig;
  private baseURL: string;

  constructor(config: PhalaConfig) {
    this.config = config;
    this.baseURL = `${config.endpoint}/api/v1`;
  }

  /**
   * Deploy a Docker container to TEE for track-specific processing
   */
  async deployTrackContainer(track: string, containerConfig: any): Promise<string> {
    try {
      logger.info(`Deploying container for track: ${track}`);
      
      const response = await axios.post(`${this.baseURL}/deploy`, {
        track,
        containerConfig,
        environment: this.config.environment,
        privacyLevel: 'maximum' // Always use maximum privacy for BGIN
      }, {
        headers: {
          'X-Phala-Public-Key': this.config.publicKey,
          'X-Phala-Salt': this.config.salt,
          'Content-Type': 'application/json'
        }
      });

      const deploymentId = response.data.deploymentId;
      logger.info(`Container deployed successfully for track ${track}: ${deploymentId}`);
      
      return deploymentId;
    } catch (error) {
      logger.error(`Failed to deploy container for track ${track}:`, error);
      throw new Error(`Phala Cloud deployment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Submit RAG job to TEE for confidential document processing
   */
  async submitRAGJob(input: RAGJobInput): Promise<TEEJob> {
    try {
      logger.info(`Submitting RAG job for track: ${input.track}`);
      
      const response = await axios.post(`${this.baseURL}/jobs/rag`, {
        ...input,
        timestamp: new Date().toISOString(),
        privacyLevel: 'maximum' // BGIN requires maximum privacy
      }, {
        headers: {
          'X-Phala-Public-Key': this.config.publicKey,
          'X-Phala-Salt': this.config.salt,
          'Content-Type': 'application/json'
        }
      });

      const job: TEEJob = {
        id: response.data.jobId,
        type: 'rag',
        track: input.track as any,
        status: 'pending',
        input,
        createdAt: new Date()
      };

      logger.info(`RAG job submitted: ${job.id}`);
      return job;
    } catch (error) {
      logger.error('Failed to submit RAG job:', error);
      throw new Error(`RAG job submission failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Submit LLM inference job to TEE for confidential model execution
   */
  async submitInferenceJob(input: InferenceJobInput): Promise<TEEJob> {
    try {
      logger.info(`Submitting inference job for track: ${input.track}`);
      
      const response = await axios.post(`${this.baseURL}/jobs/inference`, {
        ...input,
        timestamp: new Date().toISOString(),
        privacyLevel: 'maximum' // BGIN requires maximum privacy
      }, {
        headers: {
          'X-Phala-Public-Key': this.config.publicKey,
          'X-Phala-Salt': this.config.salt,
          'Content-Type': 'application/json'
        }
      });

      const job: TEEJob = {
        id: response.data.jobId,
        type: 'inference',
        track: input.track as any,
        status: 'pending',
        input,
        createdAt: new Date()
      };

      logger.info(`Inference job submitted: ${job.id}`);
      return job;
    } catch (error) {
      logger.error('Failed to submit inference job:', error);
      throw new Error(`Inference job submission failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Submit embedding generation job to TEE
   */
  async submitEmbeddingJob(input: EmbeddingJobInput): Promise<TEEJob> {
    try {
      logger.info(`Submitting embedding job for track: ${input.track}`);
      
      const response = await axios.post(`${this.baseURL}/jobs/embedding`, {
        ...input,
        timestamp: new Date().toISOString(),
        privacyLevel: 'maximum' // BGIN requires maximum privacy
      }, {
        headers: {
          'X-Phala-Public-Key': this.config.publicKey,
          'X-Phala-Salt': this.config.salt,
          'Content-Type': 'application/json'
        }
      });

      const job: TEEJob = {
        id: response.data.jobId,
        type: 'embedding',
        track: input.track as any,
        status: 'pending',
        input,
        createdAt: new Date()
      };

      logger.info(`Embedding job submitted: ${job.id}`);
      return job;
    } catch (error) {
      logger.error('Failed to submit embedding job:', error);
      throw new Error(`Embedding job submission failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check job status and retrieve results
   */
  async getJobStatus(jobId: string): Promise<TEEJob> {
    try {
      const response = await axios.get(`${this.baseURL}/jobs/${jobId}`, {
        headers: {
          'X-Phala-Public-Key': this.config.publicKey,
          'X-Phala-Salt': this.config.salt
        }
      });

      return response.data;
    } catch (error) {
      logger.error(`Failed to get job status for ${jobId}:`, error);
      throw new Error(`Job status retrieval failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Wait for job completion and return results
   */
  async waitForJobCompletion(jobId: string, timeoutMs: number = 300000): Promise<TEEJob> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const job = await this.getJobStatus(jobId);
      
      if (job.status === 'completed') {
        logger.info(`Job ${jobId} completed successfully`);
        return job;
      }
      
      if (job.status === 'failed') {
        logger.error(`Job ${jobId} failed:`, job.error);
        throw new Error(`Job failed: ${job.error}`);
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error(`Job ${jobId} timed out after ${timeoutMs}ms`);
  }

  /**
   * Get track-specific model recommendations
   */
  async getTrackModels(track: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseURL}/models/track/${track}`, {
        headers: {
          'X-Phala-Public-Key': this.config.publicKey,
          'X-Phala-Salt': this.config.salt
        }
      });

      return response.data.models;
    } catch (error) {
      logger.error(`Failed to get models for track ${track}:`, error);
      return []; // Return empty array as fallback
    }
  }

  /**
   * Verify computation integrity using cryptographic proofs
   */
  async verifyComputation(jobId: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseURL}/verify/${jobId}`, {}, {
        headers: {
          'X-Phala-Public-Key': this.config.publicKey,
          'X-Phala-Salt': this.config.salt
        }
      });

      return response.data.verified;
    } catch (error) {
      logger.error(`Failed to verify computation for job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Get privacy compliance report for a track
   */
  async getPrivacyReport(track: string, sessionId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/privacy/report`, {
        params: { track, sessionId },
        headers: {
          'X-Phala-Public-Key': this.config.publicKey,
          'X-Phala-Salt': this.config.salt
        }
      });

      return response.data;
    } catch (error) {
      logger.error(`Failed to get privacy report for track ${track}:`, error);
      throw new Error(`Privacy report retrieval failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const phalaClient = new PhalaCloudClient({
  publicKey: process.env.PHALA_PUBLIC_KEY || '',
  salt: process.env.PHALA_SALT || 'ee17e2170d7d40dcaf3015d610837cf5',
  endpoint: process.env.PHALA_ENDPOINT || 'https://890e30429c7029b543e69653fb1ca507293797ad-3000.dstack-prod5.phala.network',
  region: process.env.PHALA_REGION || 'us-east-1',
  environment: (process.env.NODE_ENV as 'development' | 'production') || 'production'
});
