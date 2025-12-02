// =====================================
// backend/src/utils/config-simple.ts
// =====================================

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000'),
  
  // Database (optional for simple mode)
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/bgin_mvp',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  vectorDbUrl: process.env.VECTOR_DB_URL || 'http://localhost:6333',
  
  // Security (with defaults for development)
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-key-for-development-only-32-chars',
  encryptionKey: process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-characters',
  anonymizationSalt: process.env.ANONYMIZATION_SALT || 'dev-salt-16-chars',
  
  // AI Services (optional for simple mode)
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  
  // Integration (optional)
  kwaaiApiKey: process.env.KWAAI_API_KEY || '',
  discourseApiKey: process.env.DISCOURSE_API_KEY || '',
  
  // Phala Cloud
  phalaPublicKey: process.env.PHALA_PUBLIC_KEY || '',
  phalaSalt: process.env.PHALA_SALT || 'ee17e2170d7d40dcaf3015d610837cf5',
  phalaApiKey: process.env.PHALA_API_KEY || '',
  phalaEndpoint: process.env.PHALA_ENDPOINT || 'https://890e30429c7029b543e69653fb1ca507293797ad-3000.dstack-prod5.phala.network',
  
  // Features
  multiAgentMode: process.env.MULTI_AGENT_MODE === 'true' || true,
  crossSessionSynthesis: process.env.CROSS_SESSION_SYNTHESIS === 'true' || true,
  privacySimulation: process.env.PRIVACY_SIMULATION === 'true' || true,
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};
