# BGIN AI Working Groups System

## Overview

The BGIN AI Working Groups System provides a comprehensive solution for managing working groups, uploading documents to specific RAG containers, and querying with model optionality and intelligence disclosure. This system enables organizations to create isolated knowledge bases for different working groups while maintaining privacy and providing transparency about AI processing.

## Features

### 🏢 Working Group Management
- **Create Working Groups**: Set up dedicated working groups with custom configurations
- **RAG Containers**: Each working group gets its own isolated RAG container
- **Privacy Settings**: Configurable privacy levels (maximum, high, selective, minimal)
- **Model Configuration**: Customizable model settings per working group

### 📄 Document Upload & Processing
- **Multi-Format Support**: PDF, TXT, MD, DOCX, HTML files
- **Metadata Extraction**: Automatic extraction of document metadata
- **Quality Assessment**: Document quality scoring and validation
- **Version Control**: Track document versions and changes
- **Intelligence Disclosure**: Detailed processing information and model attribution

### 🤖 Model Optionality
- **Multiple Providers**: OpenAI, Anthropic, Ollama, Phala Cloud
- **Model Selection**: Choose optimal models based on task requirements
- **Fallback Models**: Automatic fallback to alternative models
- **Performance Optimization**: Select models based on speed, quality, or cost

### 🔍 RAG Query System
- **Semantic Search**: Advanced vector-based document retrieval
- **Context-Aware Responses**: Generate responses based on working group documents
- **Source Attribution**: Clear attribution of information sources
- **Confidence Scoring**: Confidence levels for generated responses

### 🔒 Intelligence Disclosure
- **Model Information**: Details about which models were used
- **Processing Steps**: Step-by-step processing information
- **Source Attribution**: Clear attribution of information sources
- **Confidence Scores**: Detailed confidence metrics
- **Reasoning Chain**: Explanation of the reasoning process

## API Endpoints

### Working Group Management

#### Create Working Group
```http
POST /api/working-groups/create
Content-Type: application/json

{
  "name": "Technical Standards",
  "description": "Working group focused on blockchain technical standards",
  "domain": "technical-standards",
  "createdBy": "user123",
  "config": {
    "modelSettings": {
      "primaryModel": "gpt-4",
      "fallbackModels": ["gpt-3.5-turbo", "claude-3-sonnet"],
      "modelProvider": "openai"
    },
    "privacySettings": {
      "privacyLevel": "high",
      "dataRetention": 365,
      "encryptionRequired": true
    }
  }
}
```

#### Get Working Groups
```http
GET /api/working-groups
```

#### Get Working Group by ID
```http
GET /api/working-groups/{workingGroupId}
```

### Document Management

#### Upload Document
```http
POST /api/working-groups/{workingGroupId}/upload
Content-Type: multipart/form-data

document: [file]
title: "Document Title"
author: "Author Name"
tags: ["tag1", "tag2"]
modelOverride: "gpt-4"
```

#### Get Documents
```http
GET /api/working-groups/{workingGroupId}/documents?status=completed&limit=10&offset=0
```

### Query System

#### Query Working Group
```http
POST /api/working-groups/{workingGroupId}/query
Content-Type: application/json

{
  "query": "What are the main technical standards discussed?",
  "modelOverride": "gpt-4",
  "includeDisclosure": true,
  "maxResults": 10,
  "similarityThreshold": 0.75
}
```

#### Get Available Models
```http
GET /api/working-groups/{workingGroupId}/models
```

## Configuration

### Working Group Configuration

```typescript
interface WorkingGroupConfig {
  ragContainer: {
    containerId: string;
    vectorDatabase: 'qdrant' | 'pinecone' | 'weaviate' | 'chroma';
    embeddingModel: string;
    chunkSize: number;
    chunkOverlap: number;
    similarityThreshold: number;
    maxResults: number;
    crossGroupSearch: boolean;
  };
  modelSettings: {
    primaryModel: string;
    fallbackModels: string[];
    modelProvider: 'openai' | 'anthropic' | 'ollama' | 'phala' | 'custom';
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  privacySettings: {
    privacyLevel: 'maximum' | 'high' | 'selective' | 'minimal';
    dataRetention: number;
    anonymizationRequired: boolean;
    encryptionRequired: boolean;
    crossGroupSharing: boolean;
    auditLogging: boolean;
  };
  intelligenceDisclosure: {
    enabled: boolean;
    disclosureLevel: 'full' | 'partial' | 'minimal';
    includeModelInfo: boolean;
    includeProcessingSteps: boolean;
    includeSourceAttribution: boolean;
    includeConfidenceScores: boolean;
    includeReasoningChain: boolean;
  };
  documentProcessing: {
    supportedFormats: string[];
    maxFileSize: number;
    autoProcessing: boolean;
    qualityThreshold: number;
    duplicateDetection: boolean;
    versionControl: boolean;
    metadataExtraction: boolean;
    contentValidation: boolean;
  };
}
```

### Model Selection Criteria

```typescript
interface ModelSelectionCriteria {
  task: 'document_processing' | 'query_response' | 'analysis' | 'generation';
  domain: string;
  privacyLevel: 'maximum' | 'high' | 'selective' | 'minimal';
  performanceRequirement: 'speed' | 'quality' | 'balanced';
  costSensitivity: 'low' | 'medium' | 'high';
  capabilities: string[];
  maxLatency?: number;
  maxCost?: number;
}
```

## Usage Examples

### 1. Create a Working Group

```javascript
const response = await fetch('/api/working-groups/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Privacy Research',
    description: 'Working group for privacy and digital rights research',
    domain: 'privacy-rights',
    createdBy: 'researcher123',
    config: {
      modelSettings: {
        primaryModel: 'claude-3-sonnet',
        fallbackModels: ['gpt-4', 'claude-3-haiku'],
        modelProvider: 'anthropic'
      },
      privacySettings: {
        privacyLevel: 'maximum',
        dataRetention: 180,
        encryptionRequired: true,
        anonymizationRequired: true
      }
    }
  })
});

const { workingGroup } = await response.json();
console.log('Created working group:', workingGroup.id);
```

### 2. Upload a Document

```javascript
const formData = new FormData();
formData.append('document', fileInput.files[0]);
formData.append('title', 'Privacy Policy Analysis');
formData.append('author', 'Jane Doe');
formData.append('tags', JSON.stringify(['privacy', 'policy', 'analysis']));
formData.append('modelOverride', 'claude-3-sonnet');

const response = await fetch(`/api/working-groups/${workingGroupId}/upload`, {
  method: 'POST',
  body: formData
});

const { documentUpload } = await response.json();
console.log('Document uploaded:', documentUpload.id);
```

### 3. Query Working Group

```javascript
const response = await fetch(`/api/working-groups/${workingGroupId}/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'What are the main privacy concerns discussed in the documents?',
    modelOverride: 'claude-3-sonnet',
    includeDisclosure: true,
    maxResults: 5
  })
});

const { result } = await response.json();
console.log('Response:', result.response);
console.log('Sources:', result.sources);
console.log('Intelligence Disclosure:', result.intelligenceDisclosure);
```

## Frontend Components

### WorkingGroups Component

The `WorkingGroups` component provides a complete interface for managing working groups:

- **Working Group List**: View and select working groups
- **Document Upload**: Upload documents with metadata
- **Query Interface**: Query the RAG container
- **Results Display**: View query results with source attribution
- **Intelligence Disclosure**: View detailed processing information

### MainInterface Component

The `MainInterface` component provides navigation between different system views:

- **Multi-Agent Chat**: Original BGIN AI interface
- **Working Groups**: Working group management
- **Analytics**: System analytics dashboard
- **Settings**: System configuration

## Security & Privacy

### Privacy Levels

- **Maximum**: All data encrypted, anonymized, and processed in TEE
- **High**: Strong encryption, selective disclosure, privacy-preserving processing
- **Selective**: Standard encryption with configurable disclosure
- **Minimal**: Basic encryption with minimal privacy controls

### Intelligence Disclosure

The system provides transparent information about AI processing:

- **Model Information**: Which models were used and why
- **Processing Steps**: Step-by-step processing information
- **Source Attribution**: Clear attribution of information sources
- **Confidence Scores**: Detailed confidence metrics
- **Reasoning Chain**: Explanation of the reasoning process

## Integration

### Database Integration

The system is designed to integrate with various databases:

- **PostgreSQL**: For metadata and configuration storage
- **Vector Databases**: Qdrant, Pinecone, Weaviate, Chroma
- **File Storage**: Local filesystem or cloud storage

### LLM Integration

Supports multiple LLM providers:

- **OpenAI**: GPT-3.5, GPT-4
- **Anthropic**: Claude 3 Haiku, Sonnet
- **Ollama**: Local models
- **Phala Cloud**: Confidential compute
- **Custom**: Custom model providers

## Development

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm run dev
```

### Testing

Run the test suite:
```bash
npm test
```

### Building

Build for production:
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- **Documentation**: [BGIN AI Docs](https://docs.bgin.org)
- **Issues**: [GitHub Issues](https://github.com/bgin-ai/issues)
- **Discord**: [BGIN AI Discord](https://discord.gg/bgin-ai)
- **Email**: support@bgin.org

