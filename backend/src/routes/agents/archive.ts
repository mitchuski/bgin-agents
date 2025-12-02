import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler'
import { enhancedRAGEngine } from '../../agents/archive/enhanced-rag-engine'
import { documentProcessor } from '../../agents/archive/document-processor'
import { retrievalSystem } from '../../agents/archive/retrieval-system'
import { dataValidator } from '../../utils/data-validator'
import { logger } from '../../utils/logger'

const router = Router()

// Archive Agent endpoints
router.get('/status', asyncHandler(async (req, res) => {
  try {
    const healthCheck = await enhancedRAGEngine.healthCheck()
    const stats = await retrievalSystem.getCollectionStats()
    
    res.json({
      agent: 'archive',
      status: healthCheck ? 'active' : 'degraded',
      capabilities: [
        'Enhanced RAG Processing',
        'Document Analysis & Processing',
        'Knowledge Synthesis',
        'Cross-Session Search',
        'Privacy-Preserving Retrieval',
        'Real-time Data Integration'
      ],
      privacy: 'strict',
      trust: 'high',
      lastProcessed: new Date().toISOString(),
      documentsProcessed: stats.points_count || 0,
      knowledgeBaseSize: `${(stats.points_count || 0) * 0.002}MB`, // Rough estimate
      health: {
        ragEngine: healthCheck,
        vectorDB: await retrievalSystem.healthCheck(),
        lastCheck: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.error('Archive agent status check failed:', error)
    res.status(500).json({
      agent: 'archive',
      status: 'error',
      error: 'Status check failed'
    })
  }
}))

router.post('/process', asyncHandler(async (req, res) => {
  try {
    const { content, metadata, validate = true } = req.body
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      })
    }

    // Validate document if requested
    let validationResult = null
    if (validate) {
      validationResult = await dataValidator.validateDocument({
        content,
        ...metadata
      })
      
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Document validation failed',
          validation: validationResult
        })
      }
    }

    // Process document
    const processedDocument = await documentProcessor.processDocument(
      content,
      metadata || {}
    )
    
    return res.json({
      success: true,
      document: {
        id: processedDocument.id,
        title: processedDocument.title,
        summary: processedDocument.summary,
        keywords: processedDocument.keywords,
        qualityScore: processedDocument.qualityScore,
        processingStatus: processedDocument.processingStatus,
        chunks: processedDocument.chunks.length
      },
      validation: validationResult,
      message: 'Document processed successfully'
    })
  } catch (error) {
    logger.error('Document processing failed:', error)
    return res.status(500).json({
      success: false,
      error: 'Document processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}))

router.post('/query', asyncHandler(async (req, res) => {
  try {
    const { 
      query, 
      sessionId, 
      userContext, 
      filters = {}, 
      includeCrossSession = false,
      maxResults = 10,
      synthesisMode = 'summary'
    } = req.body

    if (!query || !sessionId || !userContext) {
      return res.status(400).json({
        success: false,
        error: 'Query, sessionId, and userContext are required'
      })
    }

    const ragQuery = {
      query,
      sessionId,
      userContext,
      filters,
      includeCrossSession,
      maxResults,
      synthesisMode
    }

    const response = await enhancedRAGEngine.processQuery(ragQuery)
    
    return res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('RAG query failed:', error)
    return res.status(500).json({
      success: false,
      error: 'Query processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}))

router.get('/search', asyncHandler(async (req, res) => {
  try {
    const { 
      query, 
      sessionId, 
      privacyLevel = 'selective',
      limit = 10,
      documentType,
      qualityThreshold
    } = req.query

    if (!query || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Query and sessionId are required'
      })
    }

    const filters = {
      sessionId: sessionId as string,
      privacyLevel: privacyLevel as any,
      documentType: documentType as string,
      qualityThreshold: qualityThreshold ? parseFloat(qualityThreshold as string) : undefined
    }

    const userContext = {
      participantHash: 'anonymous',
      sessionId: sessionId as string,
      privacyLevel: privacyLevel as any,
      trustScore: 0.5,
      accessRights: []
    }

    const results = await retrievalSystem.searchSimilar(
      query as string,
      filters,
      parseInt(limit as string)
    )

    const rankedResults = await retrievalSystem.rankResults(results)
    const filteredResults = await retrievalSystem.applyPrivacyFilters(rankedResults, userContext)
    
    return res.json({
      success: true,
      query: query as string,
      results: filteredResults.map(result => ({
        id: result.id,
        title: result.document?.title || 'Untitled',
        content: result.content,
        score: result.finalScore,
        accessLevel: result.accessLevel,
        metadata: result.metadata
      })),
      total: filteredResults.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Search failed:', error)
    return res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}))

router.post('/sync-discourse', asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'SessionId is required'
      })
    }

    await enhancedRAGEngine.syncWithDiscourse(sessionId)
    
    return res.json({
      success: true,
      message: 'Discourse synchronization completed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Discourse sync failed:', error)
    return res.status(500).json({
      success: false,
      error: 'Discourse synchronization failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}))

router.post('/generate-correlations', asyncHandler(async (req, res) => {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'SessionId is required'
      })
    }

    await enhancedRAGEngine.generateKnowledgeCorrelations(sessionId)
    
    return res.json({
      success: true,
      message: 'Knowledge correlations generated',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Correlation generation failed:', error)
    return res.status(500).json({
      success: false,
      error: 'Correlation generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}))

router.get('/knowledge-base', asyncHandler(async (req, res) => {
  try {
    const stats = await retrievalSystem.getCollectionStats()
    
    return res.json({
      success: true,
      knowledgeBase: {
        totalDocuments: stats.points_count || 0,
        totalSize: `${(stats.points_count || 0) * 0.002}MB`,
        segments: stats.segments_count || 0,
        status: stats.status || 'unknown',
        categories: [
          'AI Governance',
          'Privacy Regulations',
          'Ethics Guidelines',
          'Technical Standards',
          'Policy Frameworks',
          'Research Papers'
        ],
        lastUpdated: new Date().toISOString(),
        privacy: 'strict'
      }
    })
  } catch (error) {
    logger.error('Knowledge base stats failed:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get knowledge base statistics'
    })
  }
}))

router.get('/health', asyncHandler(async (req, res) => {
  try {
    const health = await enhancedRAGEngine.healthCheck()
    
    return res.json({
      status: health ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      components: {
        ragEngine: health,
        vectorDB: await retrievalSystem.healthCheck()
      }
    })
  } catch (error) {
    logger.error('Health check failed:', error)
    return res.status(500).json({
      status: 'unhealthy',
      error: 'Health check failed'
    })
  }
}))

export default router

