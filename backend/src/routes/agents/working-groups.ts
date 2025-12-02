// =====================================
// backend/src/routes/agents/working-groups.ts
// =====================================

import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../../middleware/errorHandler';
import { workingGroupManager, WorkingGroup, DocumentUpload } from '../../agents/working-groups/working-group-manager';
import { logger } from '../../utils/logger';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'text/html'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, MD, DOCX, and HTML files are allowed.'));
    }
  }
});

// Working Group Management Endpoints

/**
 * Create a new working group
 */
router.post('/create', asyncHandler(async (req, res) => {
  const { name, description, domain, createdBy, config } = req.body;

  if (!name || !description || !domain || !createdBy) {
    return res.status(400).json({ 
      error: 'Name, description, domain, and createdBy are required' 
    });
  }

  try {
    const workingGroup = await workingGroupManager.createWorkingGroup(
      name,
      description,
      domain,
      createdBy,
      config
    );

    return res.json({
      success: true,
      workingGroup,
      message: 'Working group created successfully'
    });

  } catch (error) {
    logger.error('Working group creation failed:', error);
    return res.status(500).json({ 
      error: 'Working group creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Get all working groups
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const workingGroups = workingGroupManager.getAllWorkingGroups();

    return res.json({
      success: true,
      workingGroups,
      count: workingGroups.length,
      message: 'Working groups retrieved successfully'
    });

  } catch (error) {
    logger.error('Failed to retrieve working groups:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve working groups',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Get working group by ID
 */
router.get('/:workingGroupId', asyncHandler(async (req, res) => {
  const { workingGroupId } = req.params;

  try {
    const workingGroup = workingGroupManager.getWorkingGroup(workingGroupId);
    
    if (!workingGroup) {
      return res.status(404).json({ 
        error: 'Working group not found' 
      });
    }

    return res.json({
      success: true,
      workingGroup,
      message: 'Working group retrieved successfully'
    });

  } catch (error) {
    logger.error('Failed to retrieve working group:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve working group',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Document Upload Endpoints

/**
 * Upload document to working group
 */
router.post('/:workingGroupId/upload', upload.single('document'), asyncHandler(async (req, res) => {
  const { workingGroupId } = req.params;
  const { 
    title, 
    author, 
    source, 
    tags, 
    language, 
    category, 
    version, 
    license,
    customFields,
    modelOverride,
    processingOptions,
    disclosureOptions
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ 
      error: 'Document file is required' 
    });
  }

  try {
    // Parse JSON fields
    const parsedTags = tags ? JSON.parse(tags) : [];
    const parsedCustomFields = customFields ? JSON.parse(customFields) : {};
    const parsedProcessingOptions = processingOptions ? JSON.parse(processingOptions) : {};
    const parsedDisclosureOptions = disclosureOptions ? JSON.parse(disclosureOptions) : {};

    const documentUpload = await workingGroupManager.uploadDocument(
      workingGroupId,
      req.file.buffer,
      req.file.originalname,
      {
        title,
        author,
        source,
        tags: parsedTags,
        language: language || 'en',
        category: category || 'general',
        version: version || '1.0.0',
        license,
        customFields: parsedCustomFields
      },
      {
        modelOverride,
        processingOptions: parsedProcessingOptions,
        disclosureOptions: parsedDisclosureOptions
      }
    );

    return res.json({
      success: true,
      documentUpload,
      message: 'Document uploaded and processed successfully'
    });

  } catch (error) {
    logger.error('Document upload failed:', error);
    return res.status(500).json({ 
      error: 'Document upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Get document uploads for working group
 */
router.get('/:workingGroupId/documents', asyncHandler(async (req, res) => {
  const { workingGroupId } = req.params;
  const { status, limit, offset } = req.query;

  try {
    let documents = workingGroupManager.getDocumentUploads(workingGroupId);

    // Filter by status if provided
    if (status) {
      documents = documents.filter(doc => doc.processingStatus === status);
    }

    // Apply pagination
    const limitNum = limit ? parseInt(limit as string) : 50;
    const offsetNum = offset ? parseInt(offset as string) : 0;
    const paginatedDocuments = documents.slice(offsetNum, offsetNum + limitNum);

    return res.json({
      success: true,
      documents: paginatedDocuments,
      total: documents.length,
      limit: limitNum,
      offset: offsetNum,
      message: 'Documents retrieved successfully'
    });

  } catch (error) {
    logger.error('Failed to retrieve documents:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Get specific document upload
 */
router.get('/:workingGroupId/documents/:documentId', asyncHandler(async (req, res) => {
  const { workingGroupId, documentId } = req.params;

  try {
    const documents = workingGroupManager.getDocumentUploads(workingGroupId);
    const document = documents.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({ 
        error: 'Document not found' 
      });
    }

    return res.json({
      success: true,
      document,
      message: 'Document retrieved successfully'
    });

  } catch (error) {
    logger.error('Failed to retrieve document:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Query Endpoints

/**
 * Query working group RAG container
 */
router.post('/:workingGroupId/query', asyncHandler(async (req, res) => {
  const { workingGroupId } = req.params;
  const { 
    query, 
    modelOverride, 
    includeDisclosure, 
    maxResults, 
    similarityThreshold 
  } = req.body;

  if (!query) {
    return res.status(400).json({ 
      error: 'Query is required' 
    });
  }

  try {
    const result = await workingGroupManager.queryWorkingGroup(
      workingGroupId,
      query,
      {
        modelOverride,
        includeDisclosure: includeDisclosure !== false, // Default to true
        maxResults,
        similarityThreshold
      }
    );

    return res.json({
      success: true,
      result,
      message: 'Query processed successfully'
    });

  } catch (error) {
    logger.error('Working group query failed:', error);
    return res.status(500).json({ 
      error: 'Working group query failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Configuration Endpoints

/**
 * Update working group configuration
 */
router.put('/:workingGroupId/config', asyncHandler(async (req, res) => {
  const { workingGroupId } = req.params;
  const { config } = req.body;

  if (!config) {
    return res.status(400).json({ 
      error: 'Configuration is required' 
    });
  }

  try {
    const workingGroup = workingGroupManager.getWorkingGroup(workingGroupId);
    
    if (!workingGroup) {
      return res.status(404).json({ 
        error: 'Working group not found' 
      });
    }

    // Update configuration
    workingGroup.configuration = { ...workingGroup.configuration, ...config };
    workingGroup.metadata.updated = new Date();

    // TODO: Update in database
    // await workingGroupManager.updateWorkingGroup(workingGroup);

    return res.json({
      success: true,
      workingGroup,
      message: 'Configuration updated successfully'
    });

  } catch (error) {
    logger.error('Configuration update failed:', error);
    return res.status(500).json({ 
      error: 'Configuration update failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Get available models for working group
 */
router.get('/:workingGroupId/models', asyncHandler(async (req, res) => {
  const { workingGroupId } = req.params;

  try {
    const workingGroup = workingGroupManager.getWorkingGroup(workingGroupId);
    
    if (!workingGroup) {
      return res.status(404).json({ 
        error: 'Working group not found' 
      });
    }

    const models = {
      primary: workingGroup.configuration.modelSettings.primaryModel,
      fallback: workingGroup.configuration.modelSettings.fallbackModels,
      provider: workingGroup.configuration.modelSettings.modelProvider,
      available: [
        { name: 'gpt-3.5-turbo', provider: 'openai', capabilities: ['text', 'chat'] },
        { name: 'gpt-4', provider: 'openai', capabilities: ['text', 'chat', 'reasoning'] },
        { name: 'claude-3-haiku', provider: 'anthropic', capabilities: ['text', 'chat', 'analysis'] },
        { name: 'claude-3-sonnet', provider: 'anthropic', capabilities: ['text', 'chat', 'analysis', 'reasoning'] },
        { name: 'llama2', provider: 'ollama', capabilities: ['text', 'chat'] },
        { name: 'phala-gpt', provider: 'phala', capabilities: ['text', 'chat', 'confidential'] }
      ]
    };

    return res.json({
      success: true,
      models,
      message: 'Available models retrieved successfully'
    });

  } catch (error) {
    logger.error('Failed to retrieve models:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve models',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Intelligence Disclosure Endpoints

/**
 * Get intelligence disclosure for document
 */
router.get('/:workingGroupId/documents/:documentId/disclosure', asyncHandler(async (req, res) => {
  const { workingGroupId, documentId } = req.params;

  try {
    const documents = workingGroupManager.getDocumentUploads(workingGroupId);
    const document = documents.find(doc => doc.id === documentId);

    if (!document) {
      return res.status(404).json({ 
        error: 'Document not found' 
      });
    }

    return res.json({
      success: true,
      disclosure: document.intelligenceDisclosure,
      message: 'Intelligence disclosure retrieved successfully'
    });

  } catch (error) {
    logger.error('Failed to retrieve intelligence disclosure:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve intelligence disclosure',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Get intelligence disclosure for query result
 */
router.post('/:workingGroupId/query/disclosure', asyncHandler(async (req, res) => {
  const { workingGroupId } = req.params;
  const { query, modelOverride } = req.body;

  if (!query) {
    return res.status(400).json({ 
      error: 'Query is required' 
    });
  }

  try {
    const result = await workingGroupManager.queryWorkingGroup(
      workingGroupId,
      query,
      {
        modelOverride,
        includeDisclosure: true
      }
    );

    return res.json({
      success: true,
      disclosure: result.intelligenceDisclosure,
      message: 'Intelligence disclosure retrieved successfully'
    });

  } catch (error) {
    logger.error('Failed to retrieve intelligence disclosure:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve intelligence disclosure',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Health Check

/**
 * Working groups health check
 */
router.get('/health', asyncHandler(async (req, res) => {
  try {
    const isHealthy = await workingGroupManager.healthCheck();

    return res.json({
      success: true,
      healthy: isHealthy,
      message: isHealthy ? 'All systems healthy' : 'Some systems unhealthy'
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
