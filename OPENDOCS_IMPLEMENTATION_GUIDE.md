# OpenDocs Implementation Guide

## Quick Start

This guide will help you implement the Google OpenDocs documentation advisor methodology into your BGIN AI MVP project.

## Prerequisites

- Node.js 18+
- TypeScript
- PostgreSQL 14+ with JSON extensions
- Existing BGIN AI MVP project structure

## Implementation Steps

### 1. Database Schema Updates

First, add the required database tables for the new functionality:

```sql
-- Documentation workflows table
CREATE TABLE documentation_workflows (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR NOT NULL,
  participants JSONB,
  phases JSONB,
  current_phase INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Document versions table
CREATE TABLE document_versions (
  id VARCHAR PRIMARY KEY,
  document_id VARCHAR NOT NULL,
  version VARCHAR NOT NULL,
  content TEXT NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  author VARCHAR NOT NULL,
  author_type VARCHAR NOT NULL,
  changes JSONB,
  quality_metrics JSONB,
  metadata JSONB,
  diff JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Version branches table
CREATE TABLE version_branches (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  base_version VARCHAR NOT NULL,
  current_version VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  created TIMESTAMP NOT NULL,
  created_by VARCHAR NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Collaboration results table
CREATE TABLE collaboration_results (
  id VARCHAR PRIMARY KEY,
  workflow_id VARCHAR NOT NULL,
  phase_id VARCHAR NOT NULL,
  task_id VARCHAR NOT NULL,
  agent_type VARCHAR NOT NULL,
  result_data JSONB,
  quality_metrics JSONB,
  recommendations JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Policy analyses table
CREATE TABLE policy_analyses (
  id VARCHAR PRIMARY KEY,
  framework_id VARCHAR NOT NULL,
  analysis_data JSONB,
  stakeholder_impact JSONB,
  documentation_metrics JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Standards documents table
CREATE TABLE standards_documents (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  version VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  jurisdiction VARCHAR NOT NULL,
  domain VARCHAR NOT NULL,
  metadata JSONB,
  quality_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Compliance reports table
CREATE TABLE compliance_reports (
  report_id VARCHAR PRIMARY KEY,
  framework_id VARCHAR NOT NULL,
  compliance_score DECIMAL,
  findings JSONB,
  documentation JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. File Structure

The new files should be placed in the following structure:

```
bgin-ai-mvp/
├── backend/
│   └── src/
│       ├── agents/
│       │   ├── archive/
│       │   │   ├── documentation-advisor.ts
│       │   │   └── enhanced-rag-engine.ts (updated)
│       │   ├── codex/
│       │   │   └── policy-analyzer.ts
│       │   └── collaboration/
│       │       ├── documentation-workflow.ts
│       │       └── documentation-versioning.ts
│       └── routes/
│           └── agents/
│               └── documentation.ts
├── OPENDOCS_INTEGRATION_SUMMARY.md
└── OPENDOCS_IMPLEMENTATION_GUIDE.md
```

### 3. Update Main Server

Add the new documentation routes to your main server file:

```typescript
// In your main server file (e.g., server.ts)
import documentationRoutes from './routes/agents/documentation';

// Add the route
app.use('/api/documentation', documentationRoutes);
```

### 4. Update Agent Coordinator

Update the Multiagent coordinator to include the new capabilities:

```typescript
// In Multiagent file
import { documentationWorkflowManager } from './collaboration/documentation-workflow';
import { documentationVersioningManager } from './collaboration/documentation-versioning';

// Add to agent initialization
this.agents.set('documentationWorkflow', documentationWorkflowManager);
this.agents.set('documentationVersioning', documentationVersioningManager);
```

### 5. Environment Variables

Add any required environment variables to your `.env` file:

```env
# OpenDocs Integration
OPENDOCS_QUALITY_THRESHOLD=0.7
OPENDOCS_ACCESSIBILITY_ENABLED=true
OPENDOCS_MULTI_LANGUAGE_SUPPORT=false
```

## Testing the Integration

### 1. Test Documentation Generation

```bash
curl -X POST http://localhost:3000/api/documentation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Blockchain Governance Standards",
    "sessionId": "test-session-1",
    "domain": "blockchain-governance",
    "targetAudience": ["researchers", "policymakers"],
    "options": {
      "includeQualityAnalysis": true,
      "generateRecommendations": true,
      "validateAgainstStandards": true
    }
  }'
```

### 2. Test Policy Documentation

```bash
curl -X POST http://localhost:3000/api/documentation/policy/generate \
  -H "Content-Type: application/json" \
  -d '{
    "frameworkId": "gdpr",
    "sessionId": "policy-session-1",
    "domain": "privacy-regulation",
    "targetAudience": ["policymakers", "regulators"],
    "options": {
      "includeQualityAnalysis": true,
      "generateRecommendations": true,
      "validateAgainstStandards": true
    }
  }'
```

### 3. Test Workflow Creation

```bash
curl -X POST http://localhost:3000/api/documentation/workflow/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Technical Standards Documentation",
    "description": "Comprehensive documentation for blockchain technical standards",
    "sessionId": "standards-session-1",
    "domain": "technical-standards",
    "targetAudience": ["developers", "engineers"],
    "createdBy": "user-123",
    "options": {
      "includeArchiveAgent": true,
      "includeCodexAgent": true,
      "includeDiscourseAgent": true
    }
  }'
```

### 4. Test Version Management

```bash
curl -X POST http://localhost:3000/api/documentation/version/create \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc-123",
    "content": "# New Documentation\n\nThis is updated content...",
    "title": "Updated Documentation",
    "description": "Incorporates latest research findings",
    "author": "researcher-456",
    "authorType": "human",
    "sessionId": "research-session-1",
    "domain": "blockchain-research",
    "changes": [
      {
        "type": "addition",
        "section": "introduction",
        "description": "Added new introduction section",
        "impact": "medium"
      }
    ]
  }'
```

## Configuration Options

### 1. Quality Thresholds

You can adjust quality thresholds in the documentation advisor:

```typescript
// In documentation-advisor.ts
const QUALITY_THRESHOLDS = {
  EXCELLENT: 0.8,
  GOOD: 0.6,
  FAIR: 0.4,
  POOR: 0.0
};
```

### 2. Workflow Phases

Customize workflow phases in the workflow manager:

```typescript
// In documentation-workflow.ts
const DEFAULT_PHASES = [
  'research',
  'analysis', 
  'writing',
  'review',
  'validation'
];
```

### 3. Versioning Strategy

Configure versioning behavior:

```typescript
// In documentation-versioning.ts
const VERSIONING_CONFIG = {
  DEFAULT_VERSION: '1.0.0',
  VERSION_INCREMENT: 'patch', // 'major', 'minor', 'patch'
  AUTO_MERGE_THRESHOLD: 0.8
};
```

## Monitoring and Analytics

### 1. Health Check

Monitor system health:

```bash
curl http://localhost:3000/api/documentation/health
```

### 2. Documentation Analytics

Get analytics for a session:

```bash
curl "http://localhost:3000/api/documentation/analytics/session-123?startDate=2024-01-01&endDate=2024-12-31"
```

### 3. Quality Metrics

Access quality metrics through the API responses. Each documentation generation includes:

- Completeness score (0-1)
- Clarity score (0-1)
- Accuracy score (0-1)
- Structure score (0-1)
- Accessibility score (0-1)
- Overall quality score (0-1)

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify table creation scripts ran successfully

2. **Agent Initialization Errors**
   - Check that all required services are running
   - Verify LLM client configuration
   - Ensure Phala Cloud integration is properly configured

3. **Quality Analysis Failures**
   - Check LLM API credentials
   - Verify content is not empty or too short
   - Ensure proper error handling in documentation advisor

4. **Workflow Execution Errors**
   - Check that all participating agents are healthy
   - Verify workflow phase dependencies
   - Ensure proper task assignment

### Debug Mode

Enable debug logging:

```typescript
// In your environment configuration
const DEBUG_OPENDOCS = process.env.DEBUG_OPENDOCS === 'true';

if (DEBUG_OPENDOCS) {
  logger.level = 'debug';
}
```

## Performance Considerations

### 1. Caching

Implement caching for frequently accessed documentation:

```typescript
// Example caching implementation
const documentationCache = new Map();

const getCachedDocumentation = (key: string) => {
  return documentationCache.get(key);
};

const setCachedDocumentation = (key: string, value: any) => {
  documentationCache.set(key, value);
};
```

### 2. Rate Limiting

Implement rate limiting for documentation generation:

```typescript
// Example rate limiting
const rateLimiter = {
  documentationGeneration: '10 per minute',
  qualityAnalysis: '20 per minute',
  workflowExecution: '5 per minute'
};
```

### 3. Async Processing

For large documentation tasks, consider async processing:

```typescript
// Example async processing
const processDocumentationAsync = async (task: DocumentationTask) => {
  // Queue the task for background processing
  await taskQueue.add('documentation-generation', task);
};
```

## Security Considerations

### 1. Input Validation

Always validate input parameters:

```typescript
const validateDocumentationRequest = (req: any) => {
  if (!req.body.topic || typeof req.body.topic !== 'string') {
    throw new Error('Invalid topic');
  }
  // Add more validation as needed
};
```

### 2. Privacy Levels

Respect privacy levels in documentation generation:

```typescript
const generateDocumentationWithPrivacy = async (content: string, privacyLevel: string) => {
  if (privacyLevel === 'maximum') {
    // Use Phala Cloud TEE
    return await phalaLLMService.generateResponse(content);
  }
  // Use standard processing
  return await llmClient.generateResponse(content);
};
```

### 3. Access Control

Implement proper access control:

```typescript
const checkDocumentationAccess = (userId: string, documentId: string) => {
  // Implement access control logic
  return true; // or false based on permissions
};
```

## Next Steps

1. **Deploy the Integration**: Follow the implementation steps above
2. **Test Thoroughly**: Run all test cases and verify functionality
3. **Monitor Performance**: Set up monitoring and alerting
4. **Gather Feedback**: Collect user feedback on documentation quality
5. **Iterate and Improve**: Continuously improve based on usage patterns

## Support

For issues or questions regarding the OpenDocs integration:

1. Check the troubleshooting section above
2. Review the integration summary document
3. Check the API documentation
4. Contact the development team

## Conclusion

The OpenDocs integration provides a powerful foundation for intelligent, collaborative documentation generation in the BGIN AI MVP. By following this implementation guide, you can successfully deploy and utilize these new capabilities while maintaining the project's core values of privacy, sovereignty, and dignity-based economics.

