// =====================================
// backend/src/routes/phala.ts
// =====================================

import express from 'express';
import { phalaRAGService } from '../agents/archive/phala-rag-service';
import { enhancedRAGEngine } from '../agents/archive/enhanced-rag-engine';
import { phalaLLMService } from '../integrations/phala-cloud/phala-llm-service';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * Process RAG query using Phala Cloud TEE for a specific track
 */
router.post('/rag/:track', async (req, res) => {
  try {
    const { track } = req.params;
    const { query, sessionId, userContext, filters, includeCrossSession, maxResults, synthesisMode } = req.body;

    // Validate track
    const validTracks = ['technical-standards', 'regulatory-landscape', 'privacy-rights', 'cross-chain-governance'];
    if (!validTracks.includes(track)) {
      return res.status(400).json({
        success: false,
        error: `Invalid track. Must be one of: ${validTracks.join(', ')}`
      });
    }

    // Validate required fields
    if (!query || !sessionId || !userContext) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: query, sessionId, userContext'
      });
    }

    logger.info(`Processing Phala RAG query for track ${track} in session ${sessionId}`);

    // Process using Phala Cloud
    const result = await enhancedRAGEngine.processQueryWithPhala({
      query,
      sessionId,
      userContext,
      filters,
      includeCrossSession,
      maxResults,
      synthesisMode
    }, track as any);

    return res.json({
      success: true,
      data: result,
      track,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Phala RAG processing failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Phala RAG processing failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get available models for a specific track
 */
router.get('/models/:track', async (req, res) => {
  try {
    const { track } = req.params;

    const validTracks = ['technical-standards', 'regulatory-landscape', 'privacy-rights', 'cross-chain-governance'];
    if (!validTracks.includes(track)) {
      return res.status(400).json({
        success: false,
        error: `Invalid track. Must be one of: ${validTracks.join(', ')}`
      });
    }

    const models = await phalaRAGService.getAvailableModels(track);

    return res.json({
      success: true,
      data: {
        track,
        models,
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error(`Failed to get models for track ${req.params.track}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get available models',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get privacy compliance report for a track and session
 */
router.get('/privacy-report/:track/:sessionId', async (req, res) => {
  try {
    const { track, sessionId } = req.params;

    const validTracks = ['technical-standards', 'regulatory-landscape', 'privacy-rights', 'cross-chain-governance'];
    if (!validTracks.includes(track)) {
      return res.status(400).json({
        success: false,
        error: `Invalid track. Must be one of: ${validTracks.join(', ')}`
      });
    }

    const report = await phalaRAGService.getPrivacyReport(track, sessionId);

    return res.json({
      success: true,
      data: {
        track,
        sessionId,
        report,
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error(`Failed to get privacy report for track ${req.params.track}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get privacy report',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get track configuration and capabilities
 */
router.get('/tracks', async (req, res) => {
  try {
    const tracks = [
      {
        id: 'technical-standards',
        name: 'Technical Standards',
        description: 'Blockchain technical specifications and standards compliance',
        privacyLevel: 'maximum',
        models: ['llama2-13b-chat', 'gpt-4', 'claude-3'],
        capabilities: ['document-analysis', 'standards-compliance', 'technical-synthesis']
      },
      {
        id: 'regulatory-landscape',
        name: 'Regulatory Landscape',
        description: 'Regulatory frameworks and compliance requirements',
        privacyLevel: 'maximum',
        models: ['llama2-13b-chat', 'gpt-4', 'claude-3'],
        capabilities: ['regulatory-analysis', 'compliance-checking', 'legal-synthesis']
      },
      {
        id: 'privacy-rights',
        name: 'Privacy & Digital Rights',
        description: 'Privacy protection and digital rights considerations',
        privacyLevel: 'maximum',
        models: ['llama2-13b-chat', 'gpt-4', 'claude-3'],
        capabilities: ['privacy-analysis', 'rights-assessment', 'sovereignty-verification']
      },
      {
        id: 'cross-chain-governance',
        name: 'Cross-Chain Governance',
        description: 'Cross-chain interoperability and governance mechanisms',
        privacyLevel: 'maximum',
        models: ['llama2-13b-chat', 'gpt-4', 'claude-3'],
        capabilities: ['interoperability-analysis', 'governance-coordination', 'protocol-synthesis']
      }
    ];

    return res.json({
      success: true,
      data: {
        tracks,
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error('Failed to get track information:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get track information',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Process RAG query using Phala WebUI (simplified approach)
 */
router.post('/webui/rag/:track', async (req, res) => {
  try {
    const { track } = req.params;
    const { query, sessionId, context } = req.body;

    // Validate track
    const validTracks = ['technical-standards', 'regulatory-landscape', 'privacy-rights', 'cross-chain-governance'];
    if (!validTracks.includes(track)) {
      return res.status(400).json({
        success: false,
        error: `Invalid track. Must be one of: ${validTracks.join(', ')}`
      });
    }

    // Validate required fields
    if (!query || !sessionId || !context) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: query, sessionId, context'
      });
    }

    logger.info(`Processing WebUI RAG query for track ${track} in session ${sessionId}`);

    // Process using Phala WebUI
    const result = await phalaRAGService.processQueryWithWebUI(
      query,
      track,
      sessionId,
      context
    );

    return res.json({
      success: true,
      data: result,
      track,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('WebUI RAG processing failed:', error);
    return res.status(500).json({
      success: false,
      error: 'WebUI RAG processing failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get available models from Phala WebUI
 */
router.get('/webui/models', async (req, res) => {
  try {
    const models = await phalaRAGService.getWebUIModels();

    return res.json({
      success: true,
      data: {
        models,
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error('Failed to get WebUI models:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get WebUI models',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Process RAG query with Phala Cloud LLM (maintains existing UI)
 */
router.post('/llm/rag', async (req, res) => {
  try {
    const { query, sessionId, userContext, filters, includeCrossSession, maxResults, synthesisMode, usePhala = true } = req.body;

    // Validate required fields
    if (!query || !sessionId || !userContext) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: query, sessionId, userContext'
      });
    }

    logger.info(`Processing RAG query with ${usePhala ? 'Phala Cloud' : 'local LLM'} in session ${sessionId}`);

    // Use the existing enhanced RAG engine with Phala Cloud integration
    const result = await enhancedRAGEngine.processQuery({
      query,
      sessionId,
      userContext,
      filters,
      includeCrossSession,
      maxResults,
      synthesisMode
    });

    return res.json({
      success: true,
      data: {
        ...result,
        phalaCloudUsed: usePhala,
        confidentialCompute: usePhala,
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error('RAG processing failed:', error);
    return res.status(500).json({
      success: false,
      error: 'RAG processing failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Health check for Phala Cloud integration
 */
router.get('/health', async (req, res) => {
  try {
    // Test Phala Cloud connectivity
    const testModels = await phalaRAGService.getAvailableModels('technical-standards');
    const webuiHealth = await phalaRAGService.checkWebUIHealth();
    const llmHealth = await phalaLLMService.healthCheck();
    
    return res.json({
      success: true,
      data: {
        status: 'healthy',
        phalaCloudConnected: testModels.length > 0,
        webuiConnected: webuiHealth,
        llmServiceConnected: llmHealth,
        availableTracks: 4,
        endpoint: process.env.PHALA_ENDPOINT || 'https://890e30429c7029b543e69653fb1ca507293797ad-3000.dstack-prod5.phala.network',
        features: {
          confidentialCompute: true,
          trackSpecificProcessing: true,
          privacyPreservation: true,
          attestationVerification: true
        },
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error('Phala Cloud health check failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Phala Cloud health check failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
