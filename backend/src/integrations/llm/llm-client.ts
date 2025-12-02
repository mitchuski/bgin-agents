// =====================================
// backend/src/integrations/llm/llm-client.ts
// =====================================

import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import axios, { AxiosInstance } from 'axios';
import { logger } from '../../utils/logger';
import { config } from '../../utils/config';

export interface GenerationOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
  distributed?: {
    node: string;
    processingTime: number;
    privacyPreserved: boolean;
    decentralized: boolean;
    fallback?: boolean;
  };
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  scores: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface Entity {
  text: string;
  type: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface LLMProvider {
  name: string;
  generateResponse(prompt: string, options: GenerationOptions): Promise<LLMResponse>;
  generateEmbedding(text: string): Promise<EmbeddingResponse>;
  analyzeSentiment(text: string): Promise<SentimentAnalysis>;
  extractEntities(text: string): Promise<Entity[]>;
  isAvailable(): Promise<boolean>;
}

class AnthropicProvider implements LLMProvider {
  name = 'anthropic';
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.anthropicApiKey,
    });
  }

  async generateResponse(prompt: string, options: GenerationOptions = {}): Promise<LLMResponse> {
    try {
      const {
        model = 'claude-3-haiku-20240307',
        maxTokens = 4000,
        temperature = 0.3,
        topP = 1,
        stopSequences = []
      } = options;

      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        stop_sequences: stopSequences,
        messages: [{ role: 'user', content: prompt }]
      });

      return {
        content: response.content[0].type === 'text' ? response.content[0].text : '',
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        },
        model: response.model,
        finishReason: response.stop_reason || undefined
      };
    } catch (error) {
      logger.error('Anthropic API error:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    // Anthropic doesn't have embedding API, fallback to OpenAI
    throw new Error('Anthropic does not support embeddings, use OpenAI provider');
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    const prompt = `Analyze the sentiment of the following text and respond with a JSON object containing:
    - sentiment: "positive", "negative", or "neutral"
    - confidence: number between 0 and 1
    - scores: object with positive, negative, neutral scores (0-1)
    
    Text: "${text}"`;

    try {
      const response = await this.generateResponse(prompt, { maxTokens: 200 });
      const analysis = JSON.parse(response.content);
      return analysis;
    } catch (error) {
      logger.error('Sentiment analysis failed:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        scores: { positive: 0.33, negative: 0.33, neutral: 0.34 }
      };
    }
  }

  async extractEntities(text: string): Promise<Entity[]> {
    const prompt = `Extract named entities from the following text and respond with a JSON array of objects containing:
    - text: the entity text
    - type: entity type (PERSON, ORGANIZATION, LOCATION, etc.)
    - confidence: number between 0 and 1
    - startIndex: character start position
    - endIndex: character end position
    
    Text: "${text}"`;

    try {
      const response = await this.generateResponse(prompt, { maxTokens: 500 });
      const entities = JSON.parse(response.content);
      return Array.isArray(entities) ? entities : [];
    } catch (error) {
      logger.error('Entity extraction failed:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

class OpenAIProvider implements LLMProvider {
  name = 'openai';
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }

  async generateResponse(prompt: string, options: GenerationOptions = {}): Promise<LLMResponse> {
    try {
      const {
        model = 'gpt-3.5-turbo',
        maxTokens = 4000,
        temperature = 0.3,
        topP = 1,
        stopSequences = []
      } = options;

      const response = await this.client.chat.completions.create({
        model,
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        stop: stopSequences,
        messages: [{ role: 'user', content: prompt }]
      });

      const choice = response.choices[0];
      return {
        content: choice.message.content || '',
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens
        } : undefined,
        model: response.model,
        finishReason: choice.finish_reason
      };
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
      });

      return {
        embedding: response.data[0].embedding,
        model: response.model,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          totalTokens: response.usage.total_tokens
        }
      };
    } catch (error) {
      logger.error('OpenAI embedding error:', error);
      throw error;
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    const prompt = `Analyze the sentiment of the following text and respond with a JSON object containing:
    - sentiment: "positive", "negative", or "neutral"
    - confidence: number between 0 and 1
    - scores: object with positive, negative, neutral scores (0-1)
    
    Text: "${text}"`;

    try {
      const response = await this.generateResponse(prompt, { maxTokens: 200 });
      const analysis = JSON.parse(response.content);
      return analysis;
    } catch (error) {
      logger.error('Sentiment analysis failed:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        scores: { positive: 0.33, negative: 0.33, neutral: 0.34 }
      };
    }
  }

  async extractEntities(text: string): Promise<Entity[]> {
    const prompt = `Extract named entities from the following text and respond with a JSON array of objects containing:
    - text: the entity text
    - type: entity type (PERSON, ORGANIZATION, LOCATION, etc.)
    - confidence: number between 0 and 1
    - startIndex: character start position
    - endIndex: character end position
    
    Text: "${text}"`;

    try {
      const response = await this.generateResponse(prompt, { maxTokens: 500 });
      const entities = JSON.parse(response.content);
      return Array.isArray(entities) ? entities : [];
    } catch (error) {
      logger.error('Entity extraction failed:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}

class KwaaiNetProvider implements LLMProvider {
  name = 'kwaainet';
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;
  private distributedNodes: string[] = [];
  private currentNodeIndex: number = 0;

  constructor() {
    this.baseUrl = process.env.KWAAI_ENDPOINT || 'https://api.kwaai.ai/v1';
    this.apiKey = config.kwaaiApiKey || 'kwaainet-mock-key';
    
    // Initialize distributed nodes from environment
    const nodesEnv = process.env.KWAAI_DISTRIBUTED_NODES;
    if (nodesEnv) {
      this.distributedNodes = nodesEnv.split(',').map(node => node.trim());
    }
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Kwaai-Version': '1.0',
        'X-Kwaai-Distributed': 'true',
      },
      timeout: 30000,
    });
  }

  async generateResponse(prompt: string, options: GenerationOptions = {}): Promise<LLMResponse> {
    try {
      const {
        model = 'kwaainet/llama-3.2-3b-instruct',
        maxTokens = 4000,
        temperature = 0.3,
        topP = 1,
        stopSequences = []
      } = options;

      // Select optimal node for distributed inference
      const selectedNode = this.selectOptimalNode();
      const requestUrl = selectedNode ? `${selectedNode}/v1/chat/completions` : '/chat/completions';

      const requestPayload = {
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        stop: stopSequences.length > 0 ? stopSequences : undefined,
        stream: false,
        // Kwaai-specific distributed inference parameters
        distributed: {
          enabled: this.distributedNodes.length > 0,
          nodes: this.distributedNodes,
          loadBalancing: 'round_robin',
          redundancy: 1,
          privacyLevel: 'maximum'
        }
      };

      const response = await this.client.post(requestUrl, requestPayload);

      const choice = response.data.choices[0];
      return {
        content: choice.message.content || '',
        usage: response.data.usage ? {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens
        } : undefined,
        model: response.data.model,
        finishReason: choice.finish_reason,
        // Add distributed inference metadata
        distributed: {
          node: selectedNode || this.baseUrl,
          processingTime: response.data.processing_time || 0,
          privacyPreserved: true,
          decentralized: true
        }
      };
    } catch (error) {
      logger.error('KwaaiNet API error:', error);
      // Try fallback to primary endpoint if distributed node fails
      if (this.distributedNodes.length > 0) {
        logger.warn('Distributed node failed, falling back to primary endpoint');
        return this.generateResponseFallback(prompt, options);
      }
      throw error;
    }
  }

  private selectOptimalNode(): string | null {
    if (this.distributedNodes.length === 0) {
      return null;
    }
    
    // Round-robin load balancing
    const selectedNode = this.distributedNodes[this.currentNodeIndex];
    this.currentNodeIndex = (this.currentNodeIndex + 1) % this.distributedNodes.length;
    
    return selectedNode;
  }

  private async generateResponseFallback(prompt: string, options: GenerationOptions = {}): Promise<LLMResponse> {
    // Fallback to primary Kwaai endpoint
    const response = await this.client.post('/chat/completions', {
      model: options.model || 'kwaainet/llama-3.2-3b-instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.3,
      top_p: options.topP || 1,
      stop: options.stopSequences?.length > 0 ? options.stopSequences : undefined,
      stream: false
    });

    const choice = response.data.choices[0];
    return {
      content: choice.message.content || '',
      usage: response.data.usage ? {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens
      } : undefined,
      model: response.data.model,
      finishReason: choice.finish_reason,
      distributed: {
        node: this.baseUrl,
        processingTime: response.data.processing_time || 0,
        privacyPreserved: true,
        decentralized: false,
        fallback: true
      }
    };
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    try {
      const response = await this.client.post('/embeddings', {
        model: 'kwaainet/text-embedding-3-small',
        input: text
      });

      return {
        embedding: response.data.data[0].embedding,
        model: response.data.model,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          totalTokens: response.data.usage.total_tokens
        }
      };
    } catch (error) {
      logger.error('KwaaiNet embedding error:', error);
      throw error;
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    const prompt = `Analyze the sentiment of the following text and respond with a JSON object containing:
    - sentiment: "positive", "negative", or "neutral"
    - confidence: number between 0 and 1
    - scores: object with positive, negative, neutral scores (0-1)
    
    Text: "${text}"`;

    try {
      const response = await this.generateResponse(prompt, { maxTokens: 200 });
      const analysis = JSON.parse(response.content);
      return analysis;
    } catch (error) {
      logger.error('Sentiment analysis failed:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        scores: { positive: 0.33, negative: 0.33, neutral: 0.34 }
      };
    }
  }

  async extractEntities(text: string): Promise<Entity[]> {
    const prompt = `Extract named entities from the following text and respond with a JSON array of objects containing:
    - text: the entity text
    - type: entity type (PERSON, ORGANIZATION, LOCATION, etc.)
    - confidence: number between 0 and 1
    - startIndex: character start position
    - endIndex: character end position
    
    Text: "${text}"`;

    try {
      const response = await this.generateResponse(prompt, { maxTokens: 500 });
      const entities = JSON.parse(response.content);
      return Array.isArray(entities) ? entities : [];
    } catch (error) {
      logger.error('Entity extraction failed:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.get('/models');
      return true;
    } catch (error) {
      logger.error('KwaaiNet availability check failed:', error);
      return false;
    }
  }
}

class KwaaiDistributedProvider implements LLMProvider {
  name = 'kwaai-distributed';
  private nodes: string[];
  private currentNodeIndex: number = 0;
  private healthChecks: Map<string, boolean> = new Map();

  constructor() {
    // Initialize distributed nodes from environment
    const nodesEnv = process.env.KWAAI_DISTRIBUTED_NODES;
    this.nodes = nodesEnv ? nodesEnv.split(',').map(node => node.trim()) : [];
    
    if (this.nodes.length === 0) {
      logger.warn('No Kwaai distributed nodes configured');
    } else {
      logger.info(`Initialized Kwaai distributed provider with ${this.nodes.length} nodes`);
      this.performHealthChecks();
    }
  }

  private async performHealthChecks(): Promise<void> {
    for (const node of this.nodes) {
      try {
        const response = await axios.get(`${node}/health`, { timeout: 5000 });
        this.healthChecks.set(node, response.status === 200);
      } catch (error) {
        this.healthChecks.set(node, false);
        logger.warn(`Node ${node} is not available:`, error);
      }
    }
  }

  private getAvailableNodes(): string[] {
    return this.nodes.filter(node => this.healthChecks.get(node) === true);
  }

  private selectOptimalNode(): string | null {
    const availableNodes = this.getAvailableNodes();
    if (availableNodes.length === 0) {
      return null;
    }
    
    // Round-robin load balancing
    const selectedNode = availableNodes[this.currentNodeIndex % availableNodes.length];
    this.currentNodeIndex = (this.currentNodeIndex + 1) % availableNodes.length;
    
    return selectedNode;
  }

  async generateResponse(prompt: string, options: GenerationOptions = {}): Promise<LLMResponse> {
    const node = this.selectOptimalNode();
    if (!node) {
      throw new Error('No available Kwaai distributed nodes');
    }

    try {
      const {
        model = 'kwaainet/llama-3.2-3b-instruct',
        maxTokens = 4000,
        temperature = 0.3,
        topP = 1,
        stopSequences = []
      } = options;

      const response = await axios.post(`${node}/v1/chat/completions`, {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        stop: stopSequences.length > 0 ? stopSequences : undefined,
        stream: false,
        distributed: {
          enabled: true,
          nodes: this.nodes,
          loadBalancing: 'round_robin',
          redundancy: 1,
          privacyLevel: 'maximum'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${config.kwaaiApiKey}`,
          'Content-Type': 'application/json',
          'X-Kwaai-Version': '1.0',
          'X-Kwaai-Distributed': 'true',
        },
        timeout: 30000,
      });

      const choice = response.data.choices[0];
      return {
        content: choice.message.content || '',
        usage: response.data.usage ? {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens
        } : undefined,
        model: response.data.model,
        finishReason: choice.finish_reason,
        distributed: {
          node,
          processingTime: response.data.processing_time || 0,
          privacyPreserved: true,
          decentralized: true
        }
      };
    } catch (error) {
      logger.error(`Kwaai distributed node ${node} failed:`, error);
      // Try another node
      const availableNodes = this.getAvailableNodes().filter(n => n !== node);
      if (availableNodes.length > 0) {
        logger.info(`Retrying with another node: ${availableNodes[0]}`);
        return this.generateResponse(prompt, options);
      }
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    const node = this.selectOptimalNode();
    if (!node) {
      throw new Error('No available Kwaai distributed nodes');
    }

    try {
      const response = await axios.post(`${node}/v1/embeddings`, {
        model: 'kwaainet/text-embedding-3-small',
        input: text
      }, {
        headers: {
          'Authorization': `Bearer ${config.kwaaiApiKey}`,
          'Content-Type': 'application/json',
          'X-Kwaai-Version': '1.0',
        },
        timeout: 30000,
      });

      return {
        embedding: response.data.data[0].embedding,
        model: response.data.model,
        usage: response.data.usage ? {
          promptTokens: response.data.usage.prompt_tokens,
          totalTokens: response.data.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      logger.error(`Kwaai distributed embedding failed on node ${node}:`, error);
      throw error;
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    // Use distributed inference for sentiment analysis
    const prompt = `Analyze the sentiment of the following text and respond with a JSON object containing sentiment (positive/negative/neutral), confidence (0-1), and scores for each sentiment category:

Text: "${text}"

Respond only with valid JSON.`;
    
    const response = await this.generateResponse(prompt, {
      maxTokens: 200,
      temperature: 0.1
    });

    try {
      const analysis = JSON.parse(response.content);
      return {
        sentiment: analysis.sentiment || 'neutral',
        confidence: analysis.confidence || 0.5,
        scores: analysis.scores || {
          positive: 0.33,
          negative: 0.33,
          neutral: 0.34
        }
      };
    } catch (error) {
      logger.error('Failed to parse sentiment analysis:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        scores: { positive: 0.33, negative: 0.33, neutral: 0.34 }
      };
    }
  }

  async extractEntities(text: string): Promise<Entity[]> {
    const prompt = `Extract named entities from the following text and respond with a JSON array of entities. Each entity should have: text, type (PERSON, ORGANIZATION, LOCATION, etc.), confidence (0-1), startIndex, endIndex.

Text: "${text}"

Respond only with valid JSON array.`;
    
    const response = await this.generateResponse(prompt, {
      maxTokens: 500,
      temperature: 0.1
    });

    try {
      const entities = JSON.parse(response.content);
      return Array.isArray(entities) ? entities : [];
    } catch (error) {
      logger.error('Failed to parse entity extraction:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    const availableNodes = this.getAvailableNodes();
    return availableNodes.length > 0;
  }
}

export class LLMClient {
  private providers: Map<string, LLMProvider> = new Map();
  private primaryProvider: string = 'kwaainet';
  private fallbackProvider: string = 'anthropic';

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize KwaaiDistributed provider (primary for distributed inference)
    if (config.kwaaiApiKey && process.env.KWAAI_DISTRIBUTED_NODES) {
      this.providers.set('kwaai-distributed', new KwaaiDistributedProvider());
      this.primaryProvider = 'kwaai-distributed';
    }

    // Initialize KwaaiNet provider (primary fallback)
    if (config.kwaaiApiKey) {
      this.providers.set('kwaainet', new KwaaiNetProvider());
      if (this.primaryProvider === 'kwaainet') {
        this.primaryProvider = 'kwaainet';
      }
    }

    // Initialize Anthropic provider (fallback)
    if (config.anthropicApiKey) {
      this.providers.set('anthropic', new AnthropicProvider());
      this.fallbackProvider = 'anthropic';
    }

    // Initialize OpenAI provider (secondary fallback)
    if (config.openaiApiKey) {
      this.providers.set('openai', new OpenAIProvider());
    }

    logger.info(`Initialized ${this.providers.size} LLM providers`);
    logger.info(`Primary provider: ${this.primaryProvider}, Fallback: ${this.fallbackProvider}`);
  }

  async generateResponse(
    prompt: string, 
    options: GenerationOptions = {}
  ): Promise<LLMResponse> {
    const provider = this.providers.get(this.primaryProvider);
    if (!provider) {
      throw new Error(`Primary provider ${this.primaryProvider} not available`);
    }

    try {
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        throw new Error(`Primary provider ${this.primaryProvider} is not available`);
      }

      return await provider.generateResponse(prompt, options);
    } catch (error) {
      logger.warn(`Primary provider failed, trying fallback: ${error}`);
      
      const fallback = this.providers.get(this.fallbackProvider);
      if (!fallback) {
        throw new Error('No fallback provider available');
      }

      const isAvailable = await fallback.isAvailable();
      if (!isAvailable) {
        throw new Error('Fallback provider is not available');
      }

      return await fallback.generateResponse(prompt, options);
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    // Use OpenAI for embeddings as Anthropic doesn't support them
    const provider = this.providers.get('openai');
    if (!provider) {
      throw new Error('OpenAI provider not available for embeddings');
    }

    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      throw new Error('OpenAI provider is not available for embeddings');
    }

    return await provider.generateEmbedding(text);
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    const provider = this.providers.get(this.primaryProvider);
    if (!provider) {
      throw new Error(`Primary provider ${this.primaryProvider} not available`);
    }

    try {
      return await provider.analyzeSentiment(text);
    } catch (error) {
      logger.warn(`Sentiment analysis failed with primary provider, trying fallback: ${error}`);
      
      const fallback = this.providers.get(this.fallbackProvider);
      if (!fallback) {
        throw new Error('No fallback provider available for sentiment analysis');
      }

      return await fallback.analyzeSentiment(text);
    }
  }

  async extractEntities(text: string): Promise<Entity[]> {
    const provider = this.providers.get(this.primaryProvider);
    if (!provider) {
      throw new Error(`Primary provider ${this.primaryProvider} not available`);
    }

    try {
      return await provider.extractEntities(text);
    } catch (error) {
      logger.warn(`Entity extraction failed with primary provider, trying fallback: ${error}`);
      
      const fallback = this.providers.get(this.fallbackProvider);
      if (!fallback) {
        throw new Error('No fallback provider available for entity extraction');
      }

      return await fallback.extractEntities(text);
    }
  }

  async healthCheck(): Promise<{ [provider: string]: boolean }> {
    const results: { [provider: string]: boolean } = {};
    
    for (const [name, provider] of this.providers) {
      try {
        results[name] = await provider.isAvailable();
      } catch (error) {
        results[name] = false;
      }
    }

    return results;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  setPrimaryProvider(provider: string): void {
    if (!this.providers.has(provider)) {
      throw new Error(`Provider ${provider} not available`);
    }
    this.primaryProvider = provider;
    logger.info(`Primary LLM provider set to ${provider}`);
  }

  setFallbackProvider(provider: string): void {
    if (!this.providers.has(provider)) {
      throw new Error(`Provider ${provider} not available`);
    }
    this.fallbackProvider = provider;
    logger.info(`Fallback LLM provider set to ${provider}`);
  }
}

// Singleton instance
export const llmClient = new LLMClient();
