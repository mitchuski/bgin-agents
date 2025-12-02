// =====================================
// backend/src/routes/health.ts
// =====================================

import { Router } from 'express';
import { database } from '../utils/database';
import { logger } from '../utils/logger';
import { qdrantClient } from '../integrations/vector-db/qdrant-client';
import { llmClient } from '../integrations/llm/llm-client';
import { discourseClient } from '../integrations/discourse-api/discourse-client';
import { kwaaiClient } from '../integrations/kwaai/kwaai-client';
import { dataMonitor } from '../monitoring/data-monitor';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'checking',
        redis: 'checking',
        vectorDb: 'checking',
        llmServices: 'checking',
        integrations: 'checking',
        agents: 'checking'
      },
      metrics: null as any
    };

    // Check PostgreSQL
    try {
      await database.query('SELECT 1');
      healthCheck.services.database = 'healthy';
    } catch (error) {
      healthCheck.services.database = 'unhealthy';
      healthCheck.status = 'degraded';
    }

    // Check Redis
    try {
      await database.getRedis().ping();
      healthCheck.services.redis = 'healthy';
    } catch (error) {
      healthCheck.services.redis = 'unhealthy';
      healthCheck.status = 'degraded';
    }

    // Check Vector Database
    try {
      const vectorHealth = await qdrantClient.healthCheck();
      healthCheck.services.vectorDb = vectorHealth ? 'healthy' : 'unhealthy';
      if (!vectorHealth) healthCheck.status = 'degraded';
    } catch (error) {
      healthCheck.services.vectorDb = 'unhealthy';
      healthCheck.status = 'degraded';
    }

    // Check LLM Services
    try {
      const llmHealth = await llmClient.healthCheck();
      const hasWorkingLLM = Object.values(llmHealth).some(status => status === true);
      healthCheck.services.llmServices = hasWorkingLLM ? 'healthy' : 'unhealthy';
      if (!hasWorkingLLM) healthCheck.status = 'degraded';
    } catch (error) {
      healthCheck.services.llmServices = 'unhealthy';
      healthCheck.status = 'degraded';
    }

    // Check Integrations
    try {
      const discourseHealth = await discourseClient.healthCheck();
      const kwaaiHealth = await kwaaiClient.healthCheck();
      const integrationsHealthy = discourseHealth || kwaaiHealth;
      healthCheck.services.integrations = integrationsHealthy ? 'healthy' : 'unhealthy';
      if (!integrationsHealthy) healthCheck.status = 'degraded';
    } catch (error) {
      healthCheck.services.integrations = 'unhealthy';
      healthCheck.status = 'degraded';
    }

    // Check Agents (simplified)
    try {
      // This would check individual agent health in production
      healthCheck.services.agents = 'healthy';
    } catch (error) {
      healthCheck.services.agents = 'unhealthy';
      healthCheck.status = 'degraded';
    }

    // Include metrics if available
    try {
      const metrics = dataMonitor.getMetrics();
      if (metrics) {
        healthCheck.metrics = {
          dataIngestion: metrics.dataIngestion,
          processingPipeline: metrics.processingPipeline,
          vectorDatabase: {
            totalPoints: metrics.vectorDatabase.totalPoints,
            health: metrics.vectorDatabase.health
          },
          performance: metrics.performance
        };
      }
    } catch (error) {
      logger.warn('Failed to include metrics in health check:', error);
    }

    return res.status(healthCheck.status === 'healthy' ? 200 : 503).json(healthCheck);
  } catch (error) {
    logger.error('Health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

router.get('/metrics', async (req, res) => {
  try {
    const metrics = dataMonitor.getMetrics();
    if (!metrics) {
      return res.status(503).json({
        error: 'No metrics available. Start monitoring first.'
      });
    }

    return res.json(metrics);
  } catch (error) {
    logger.error('Metrics retrieval failed:', error);
    return res.status(500).json({
      error: 'Failed to retrieve metrics'
    });
  }
});

router.get('/report', async (req, res) => {
  try {
    const report = await dataMonitor.generateReport();
    return res.json(report);
  } catch (error) {
    logger.error('Report generation failed:', error);
    return res.status(500).json({
      error: 'Failed to generate report'
    });
  }
});

export default router;
