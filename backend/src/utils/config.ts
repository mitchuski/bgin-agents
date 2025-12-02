// =====================================
// backend/src/utils/config.ts
// =====================================

import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
  PORT: Joi.number().default(4000),
  
  // Database
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  VECTOR_DB_URL: Joi.string().required(),
  
  // Security
  JWT_SECRET: Joi.string().min(32).required(),
  ENCRYPTION_KEY: Joi.string().length(32).required(),
  ANONYMIZATION_SALT: Joi.string().min(16).required(),
  
  // AI Services
  ANTHROPIC_API_KEY: Joi.string().optional(),
  OPENAI_API_KEY: Joi.string().optional(),
  
  // Kwaai Integration
  KWAAI_API_KEY: Joi.string().required(),
  KWAAI_ENDPOINT: Joi.string().default('https://api.kwaai.ai/v1'),
  KWAAI_MODEL: Joi.string().default('kwaainet/llama-3.2-3b-instruct'),
  
  // Kwaai Distributed LLM
  KWAAI_DISTRIBUTED_NODES: Joi.string().optional(),
  KWAAI_DISTRIBUTED_ENABLED: Joi.boolean().default(false),
  KWAAI_LOAD_BALANCING: Joi.string().valid('round_robin', 'least_connections', 'random').default('round_robin'),
  KWAAI_REDUNDANCY: Joi.number().min(1).max(3).default(1),
  KWAAI_PRIVACY_LEVEL: Joi.string().valid('minimum', 'medium', 'maximum').default('maximum'),
  
  // Kwaai Model Selection
  KWAAI_FAST_MODEL: Joi.string().default('kwaainet/llama-3.2-3b-instruct'),
  KWAAI_QUALITY_MODEL: Joi.string().default('kwaainet/llama-3.2-70b-instruct'),
  KWAAI_EMBEDDING_MODEL: Joi.string().default('kwaainet/text-embedding-3-small'),
  
  // Integration
  DISCOURSE_API_KEY: Joi.string().optional(),
  
  // Features
  MULTI_AGENT_MODE: Joi.boolean().default(true),
  CROSS_SESSION_SYNTHESIS: Joi.boolean().default(true),
  PRIVACY_SIMULATION: Joi.boolean().default(true),
  
  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000')
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  
  // Database
  databaseUrl: envVars.DATABASE_URL,
  redisUrl: envVars.REDIS_URL,
  vectorDbUrl: envVars.VECTOR_DB_URL,
  
  // Security
  jwtSecret: envVars.JWT_SECRET,
  encryptionKey: envVars.ENCRYPTION_KEY,
  anonymizationSalt: envVars.ANONYMIZATION_SALT,
  
  // AI Services
  anthropicApiKey: envVars.ANTHROPIC_API_KEY,
  openaiApiKey: envVars.OPENAI_API_KEY,
  
  // Kwaai Integration
  kwaaiApiKey: envVars.KWAAI_API_KEY,
  kwaaiEndpoint: envVars.KWAAI_ENDPOINT,
  kwaaiModel: envVars.KWAAI_MODEL,
  
  // Kwaai Distributed LLM
  kwaaiDistributed: {
    nodes: envVars.KWAAI_DISTRIBUTED_NODES ? envVars.KWAAI_DISTRIBUTED_NODES.split(',').map(node => node.trim()) : [],
    enabled: envVars.KWAAI_DISTRIBUTED_ENABLED,
    loadBalancing: envVars.KWAAI_LOAD_BALANCING,
    redundancy: envVars.KWAAI_REDUNDANCY,
    privacyLevel: envVars.KWAAI_PRIVACY_LEVEL
  },
  
  // Kwaai Model Selection
  kwaaiModels: {
    fast: envVars.KWAAI_FAST_MODEL,
    quality: envVars.KWAAI_QUALITY_MODEL,
    embedding: envVars.KWAAI_EMBEDDING_MODEL
  },
  
  // Integration
  discourseApiKey: envVars.DISCOURSE_API_KEY,
  
  // Features
  multiAgentMode: envVars.MULTI_AGENT_MODE,
  crossSessionSynthesis: envVars.CROSS_SESSION_SYNTHESIS,
  privacySimulation: envVars.PRIVACY_SIMULATION,
  
  // CORS
  corsOrigin: envVars.CORS_ORIGIN,
  
  // Agent Configuration
  agents: {
    archive: {
      model: 'claude-3-haiku',
      maxTokens: 4000,
      temperature: 0.3
    },
    codex: {
      model: 'claude-3-sonnet',
      maxTokens: 6000,
      temperature: 0.2
    },
    discourse: {
      model: 'claude-3-haiku',
      maxTokens: 3000,
      temperature: 0.4
    }
  }
};
