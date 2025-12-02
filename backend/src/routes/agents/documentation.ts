// =====================================
// backend/src/routes/agents/documentation.ts
// =====================================

import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { enhancedRAGEngine } from '../../agents/archive/enhanced-rag-engine';
import { policyAnalyzer } from '../../agents/codex/policy-analyzer';
import { documentationWorkflowManager } from '../../agents/collaboration/documentation-workflow';
import { documentationVersioningManager } from '../../agents/collaboration/documentation-versioning';
import { logger } from '../../utils/logger';

const router = Router();

// Documentation generation endpoints

/**
 * Generate comprehensive documentation using OpenDocs methodology
 */
router.post('/generate', asyncHandler(async (req, res) => {
  const { topic, sessionId, domain, targetAudience, options } = req.body;

  if (!topic || !sessionId || !domain) {
    return res.status(400).json({ 
      error: 'Topic, sessionId, and domain are required' 
    });
  }

  try {
    const result = await enhancedRAGEngine.generateDocumentation(
      topic,
      {
        sessionId,
        domain,
        targetAudience: targetAudience || ['researchers', 'policymakers', 'developers']
      },
      {
        includeQualityAnalysis: options?.includeQualityAnalysis || true,
        generateRecommendations: options?.generateRecommendations || true,
        validateAgainstStandards: options?.validateAgainstStandards || true
      }
    );

    return res.json({
      success: true,
      documentation: result,
      message: 'Documentation generated successfully'
    });

  } catch (error) {
    logger.error('Documentation generation failed:', error);
    return res.status(500).json({ 
      error: 'Documentation generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Analyze and improve existing documentation
 */
router.post('/analyze/:documentId', asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { sessionId, domain } = req.body;

  if (!sessionId || !domain) {
    return res.status(400).json({ 
      error: 'SessionId and domain are required' 
    });
  }

  try {
    const result = await enhancedRAGEngine.analyzeAndImproveDocumentation(
      documentId,
      { sessionId, domain }
    );

    return res.json({
      success: true,
      analysis: result,
      message: 'Documentation analysis completed'
    });

  } catch (error) {
    logger.error('Documentation analysis failed:', error);
    return res.status(500).json({ 
      error: 'Documentation analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Generate documentation analytics
 */
router.get('/analytics/:sessionId', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const timeRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const analytics = await enhancedRAGEngine.generateDocumentationAnalytics(
      sessionId,
      timeRange
    );

    return res.json({
      success: true,
      analytics,
      message: 'Documentation analytics generated'
    });

  } catch (error) {
    logger.error('Documentation analytics failed:', error);
    return res.status(500).json({ 
      error: 'Documentation analytics failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Policy documentation endpoints

/**
 * Generate policy documentation
 */
router.post('/policy/generate', asyncHandler(async (req, res) => {
  const { frameworkId, sessionId, domain, targetAudience, options } = req.body;

  if (!frameworkId || !sessionId || !domain) {
    return res.status(400).json({ 
      error: 'FrameworkId, sessionId, and domain are required' 
    });
  }

  try {
    const framework = policyAnalyzer.getFramework(frameworkId);
    if (!framework) {
      return res.status(404).json({ 
        error: 'Policy framework not found' 
      });
    }

    const result = await policyAnalyzer.generatePolicyDocumentation(
      framework,
      {
        sessionId,
        domain,
        targetAudience: targetAudience || ['policymakers', 'regulators', 'industry']
      },
      {
        includeQualityAnalysis: options?.includeQualityAnalysis || true,
        generateRecommendations: options?.generateRecommendations || true,
        validateAgainstStandards: options?.validateAgainstStandards || true
      }
    );

    return res.json({
      success: true,
      documentation: result,
      message: 'Policy documentation generated successfully'
    });

  } catch (error) {
    logger.error('Policy documentation generation failed:', error);
    return res.status(500).json({ 
      error: 'Policy documentation generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Create standards document
 */
router.post('/standards/create', asyncHandler(async (req, res) => {
  const { title, content, sessionId, domain, jurisdiction, options } = req.body;

  if (!title || !content || !sessionId || !domain || !jurisdiction) {
    return res.status(400).json({ 
      error: 'Title, content, sessionId, domain, and jurisdiction are required' 
    });
  }

  try {
    const document = await policyAnalyzer.createStandardsDocument(
      title,
      content,
      { sessionId, domain, jurisdiction },
      {
        version: options?.version,
        author: options?.author,
        reviewers: options?.reviewers,
        tags: options?.tags
      }
    );

    return res.json({
      success: true,
      document,
      message: 'Standards document created successfully'
    });

  } catch (error) {
    logger.error('Standards document creation failed:', error);
    return res.status(500).json({ 
      error: 'Standards document creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Generate compliance report
 */
router.post('/compliance/report', asyncHandler(async (req, res) => {
  const { frameworkId, sessionId, domain, targetPolicies } = req.body;

  if (!frameworkId || !sessionId || !domain) {
    return res.status(400).json({ 
      error: 'FrameworkId, sessionId, and domain are required' 
    });
  }

  try {
    const framework = policyAnalyzer.getFramework(frameworkId);
    if (!framework) {
      return res.status(404).json({ 
        error: 'Policy framework not found' 
      });
    }

    const report = await policyAnalyzer.generateComplianceReport(
      framework,
      { sessionId, domain },
      targetPolicies
    );

    return res.json({
      success: true,
      report,
      message: 'Compliance report generated successfully'
    });

  } catch (error) {
    logger.error('Compliance report generation failed:', error);
    return res.status(500).json({ 
      error: 'Compliance report generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Workflow management endpoints

/**
 * Create documentation workflow
 */
router.post('/workflow/create', asyncHandler(async (req, res) => {
  const { title, description, sessionId, domain, targetAudience, createdBy, options } = req.body;

  if (!title || !description || !sessionId || !domain || !createdBy) {
    return res.status(400).json({ 
      error: 'Title, description, sessionId, domain, and createdBy are required' 
    });
  }

  try {
    const workflow = await documentationWorkflowManager.createWorkflow(
      title,
      description,
      {
        sessionId,
        domain,
        targetAudience: targetAudience || ['researchers', 'policymakers', 'developers'],
        createdBy
      },
      {
        includeArchiveAgent: options?.includeArchiveAgent !== false,
        includeCodexAgent: options?.includeCodexAgent !== false,
        includeDiscourseAgent: options?.includeDiscourseAgent !== false,
        phases: options?.phases
      }
    );

    return res.json({
      success: true,
      workflow,
      message: 'Documentation workflow created successfully'
    });

  } catch (error) {
    logger.error('Workflow creation failed:', error);
    return res.status(500).json({ 
      error: 'Workflow creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Execute workflow phase
 */
router.post('/workflow/:workflowId/execute/:phaseIndex', asyncHandler(async (req, res) => {
  const { workflowId, phaseIndex } = req.params;
  const { sessionId, domain } = req.body;

  if (!sessionId || !domain) {
    return res.status(400).json({ 
      error: 'SessionId and domain are required' 
    });
  }

  try {
    const results = await documentationWorkflowManager.executePhase(
      workflowId,
      parseInt(phaseIndex),
      { sessionId, domain }
    );

    return res.json({
      success: true,
      results,
      message: `Phase ${phaseIndex} executed successfully`
    });

  } catch (error) {
    logger.error('Phase execution failed:', error);
    return res.status(500).json({ 
      error: 'Phase execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Get workflow status
 */
router.get('/workflow/:workflowId', asyncHandler(async (req, res) => {
  const { workflowId } = req.params;

  try {
    const workflow = documentationWorkflowManager.getWorkflow(workflowId);
    if (!workflow) {
      return res.status(404).json({ 
        error: 'Workflow not found' 
      });
    }

    return res.json({
      success: true,
      workflow,
      message: 'Workflow retrieved successfully'
    });

  } catch (error) {
    logger.error('Workflow retrieval failed:', error);
    return res.status(500).json({ 
      error: 'Workflow retrieval failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Versioning endpoints

/**
 * Create document version
 */
router.post('/version/create', asyncHandler(async (req, res) => {
  const { 
    documentId, content, title, description, author, authorType, 
    sessionId, domain, changes, options 
  } = req.body;

  if (!documentId || !content || !title || !author || !sessionId || !domain) {
    return res.status(400).json({ 
      error: 'DocumentId, content, title, author, sessionId, and domain are required' 
    });
  }

  try {
    const version = await documentationVersioningManager.createVersion(
      documentId,
      content,
      {
        title,
        description: description || '',
        author,
        authorType: authorType || 'human',
        sessionId,
        domain,
        changes: changes || []
      },
      {
        parentVersion: options?.parentVersion,
        branchName: options?.branchName,
        tags: options?.tags,
        status: options?.status
      }
    );

    return res.json({
      success: true,
      version,
      message: 'Document version created successfully'
    });

  } catch (error) {
    logger.error('Version creation failed:', error);
    return res.status(500).json({ 
      error: 'Version creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Compare document versions
 */
router.post('/version/compare', asyncHandler(async (req, res) => {
  const { version1Id, version2Id } = req.body;

  if (!version1Id || !version2Id) {
    return res.status(400).json({ 
      error: 'Version1Id and version2Id are required' 
    });
  }

  try {
    const comparison = await documentationVersioningManager.compareVersions(
      version1Id,
      version2Id
    );

    return res.json({
      success: true,
      comparison,
      message: 'Version comparison completed'
    });

  } catch (error) {
    logger.error('Version comparison failed:', error);
    return res.status(500).json({ 
      error: 'Version comparison failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Merge document versions
 */
router.post('/version/merge', asyncHandler(async (req, res) => {
  const { sourceVersionId, targetVersionId, mergedBy, strategy, resolution } = req.body;

  if (!sourceVersionId || !targetVersionId || !mergedBy) {
    return res.status(400).json({ 
      error: 'SourceVersionId, targetVersionId, and mergedBy are required' 
    });
  }

  try {
    const mergedVersion = await documentationVersioningManager.mergeVersions(
      sourceVersionId,
      targetVersionId,
      {
        mergedBy,
        strategy: strategy || 'auto',
        resolution
      }
    );

    return res.json({
      success: true,
      mergedVersion,
      message: 'Versions merged successfully'
    });

  } catch (error) {
    logger.error('Version merge failed:', error);
    return res.status(500).json({ 
      error: 'Version merge failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Get document version history
 */
router.get('/version/history/:documentId', asyncHandler(async (req, res) => {
  const { documentId } = req.params;

  try {
    const history = documentationVersioningManager.getVersionHistory(documentId);

    return res.json({
      success: true,
      history,
      message: 'Version history retrieved successfully'
    });

  } catch (error) {
    logger.error('Version history retrieval failed:', error);
    return res.status(500).json({ 
      error: 'Version history retrieval failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Create version branch
 */
router.post('/version/branch', asyncHandler(async (req, res) => {
  const { 
    documentId, baseVersion, name, description, purpose, 
    createdBy, sessionId, domain, targetAudience 
  } = req.body;

  if (!documentId || !baseVersion || !name || !createdBy || !sessionId || !domain) {
    return res.status(400).json({ 
      error: 'DocumentId, baseVersion, name, createdBy, sessionId, and domain are required' 
    });
  }

  try {
    const branch = await documentationVersioningManager.createBranch(
      documentId,
      baseVersion,
      {
        name,
        description: description || '',
        purpose: purpose || 'parallel development',
        createdBy,
        sessionId,
        domain,
        targetAudience: targetAudience || ['developers']
      }
    );

    return res.json({
      success: true,
      branch,
      message: 'Version branch created successfully'
    });

  } catch (error) {
    logger.error('Branch creation failed:', error);
    return res.status(500).json({ 
      error: 'Branch creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Health check endpoint

/**
 * Documentation system health check
 */
router.get('/health', asyncHandler(async (req, res) => {
  try {
    const checks = await Promise.all([
      enhancedRAGEngine.healthCheck(),
      policyAnalyzer.healthCheck(),
      documentationWorkflowManager.healthCheck(),
      documentationVersioningManager.healthCheck()
    ]);

    const allHealthy = checks.every(check => check === true);

    return res.json({
      success: true,
      healthy: allHealthy,
      checks: {
        archiveAgent: checks[0],
        codexAgent: checks[1],
        workflowManager: checks[2],
        versioningManager: checks[3]
      },
      message: allHealthy ? 'All systems healthy' : 'Some systems unhealthy'
    });

  } catch (error) {
    logger.error('Health check failed:', error);
    return res.status(500).json({ 
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export default router;
