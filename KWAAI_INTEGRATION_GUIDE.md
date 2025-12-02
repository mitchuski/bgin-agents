# 🤖 Kwaai Distributed LLM Integration Guide

## Overview

This guide covers the integration of [Kwaai AI Lab](https://github.com/Kwaai-AI-Lab) as the primary distributed LLM provider for the BGIN Multi-Agent System. Kwaai provides a privacy-preserving, decentralized approach to AI inference that aligns perfectly with BGIN's sovereignty and dignity-based principles.

## What is Kwaai?

Kwaai is a non-profit organization focused on democratizing access to artificial intelligence by designing, building and maintaining a free Personal AI. Their distributed architecture enables:

- **Privacy-Preserving Inference**: Data remains private during processing
- **Decentralized Processing**: Multiple nodes for redundancy and performance
- **Sovereign AI**: User-controlled AI that respects dignity and autonomy
- **Open Source**: Transparent and auditable AI systems

## Architecture

### Distributed LLM Providers

The integration includes two main providers:

1. **KwaaiNetProvider**: Enhanced single-endpoint provider with distributed capabilities
2. **KwaaiDistributedProvider**: Multi-node distributed inference provider

### Load Balancing & Redundancy

- **Round-Robin Load Balancing**: Distributes requests across available nodes
- **Health Monitoring**: Continuous health checks for all nodes
- **Automatic Failover**: Falls back to available nodes if one fails
- **Privacy Levels**: Configurable privacy preservation (minimum/medium/maximum)

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Kwaai API Configuration
KWAAI_ENDPOINT=https://api.kwaai.ai/v1
KWAAI_API_KEY=your-kwaai-api-key-here
KWAAI_MODEL=kwaainet/llama-3.2-3b-instruct

# Distributed LLM Configuration
KWAAI_DISTRIBUTED_NODES=https://node1.kwaai.ai,https://node2.kwaai.ai,https://node3.kwaai.ai
KWAAI_DISTRIBUTED_ENABLED=true
KWAAI_LOAD_BALANCING=round_robin
KWAAI_REDUNDANCY=1
KWAAI_PRIVACY_LEVEL=maximum

# Model Selection
KWAAI_FAST_MODEL=kwaainet/llama-3.2-3b-instruct
KWAAI_QUALITY_MODEL=kwaainet/llama-3.2-70b-instruct
KWAAI_EMBEDDING_MODEL=kwaainet/text-embedding-3-small
```

### Getting Kwaai API Key

1. Visit [Kwaai Platform](https://kwaai.ai)
2. Sign up for a free account
3. Generate an API key from your dashboard
4. Add the key to your environment configuration

## Features

### 1. Distributed Inference

The system automatically distributes LLM requests across multiple Kwaai nodes:

```typescript
// Automatic node selection and load balancing
const response = await llmClient.generateResponse(prompt, {
  model: 'kwaainet/llama-3.2-70b-instruct',
  maxTokens: 4000,
  temperature: 0.3
});
```

### 2. Privacy Preservation

All requests include privacy-preserving metadata:

```typescript
distributed: {
  enabled: true,
  nodes: ['https://node1.kwaai.ai', 'https://node2.kwaai.ai'],
  loadBalancing: 'round_robin',
  redundancy: 1,
  privacyLevel: 'maximum'
}
```

### 3. Parallel Processing

The documentation advisor leverages distributed inference for parallel document analysis:

```typescript
// Analyze multiple documents in parallel
const results = await documentationAdvisor.analyzeDocumentsInParallel(
  documents,
  { sessionId: 'session-123', domain: 'technical-standards' }
);
```

### 4. Model Selection

Automatic model selection based on task complexity:

- **Fast Model**: `kwaainet/llama-3.2-3b-instruct` for quick responses
- **Quality Model**: `kwaainet/llama-3.2-70b-instruct` for complex analysis
- **Embedding Model**: `kwaainet/text-embedding-3-small` for vector operations

## Usage Examples

### Basic LLM Request

```typescript
import { llmClient } from './integrations/llm/llm-client';

const response = await llmClient.generateResponse(
  "Analyze this documentation for quality issues",
  {
    model: 'kwaainet/llama-3.2-70b-instruct',
    maxTokens: 2000,
    temperature: 0.3
  }
);

console.log('Response:', response.content);
console.log('Distributed info:', response.distributed);
```

### Documentation Analysis

```typescript
import { documentationAdvisor } from './agents/archive/documentation-advisor';

// Single document analysis
const metrics = await documentationAdvisor.analyzeDocumentationQuality(
  document,
  { sessionId: 'session-123', domain: 'privacy-rights' }
);

// Parallel analysis of multiple documents
const allMetrics = await documentationAdvisor.analyzeDocumentsInParallel(
  documents,
  { sessionId: 'session-123', domain: 'technical-standards' }
);
```

### Custom Provider Usage

```typescript
import { KwaaiDistributedProvider } from './integrations/llm/llm-client';

const provider = new KwaaiDistributedProvider();
const response = await provider.generateResponse(prompt, options);
```

## Monitoring & Health Checks

### Node Health Monitoring

The system continuously monitors node health:

```typescript
// Check if distributed provider is available
const isAvailable = await provider.isAvailable();

// Get available nodes
const availableNodes = provider.getAvailableNodes();
```

### Response Metadata

All responses include distributed processing metadata:

```typescript
interface DistributedMetadata {
  node: string;                    // Node that processed the request
  processingTime: number;          // Processing time in milliseconds
  privacyPreserved: boolean;       // Privacy preservation status
  decentralized: boolean;          // Whether distributed processing was used
  fallback?: boolean;              // Whether fallback was used
}
```

## Troubleshooting

### Common Issues

1. **No Available Nodes**
   ```
   Error: No available Kwaai distributed nodes
   ```
   - Check `KWAAI_DISTRIBUTED_NODES` configuration
   - Verify node URLs are accessible
   - Check network connectivity

2. **API Key Issues**
   ```
   Error: KwaaiNet API error: 401 Unauthorized
   ```
   - Verify `KWAAI_API_KEY` is correct
   - Check API key permissions
   - Ensure key is not expired

3. **Node Timeout**
   ```
   Error: Kwaai distributed node failed: timeout
   ```
   - Check node availability
   - Verify network connectivity
   - System will automatically retry with other nodes

### Debug Mode

Enable debug logging:

```bash
DEBUG=kwaai:* npm start
```

### Health Check Endpoint

Check system status:

```bash
curl http://localhost:3000/api/health
```

## Performance Optimization

### Model Selection Strategy

- Use **fast models** for simple tasks (3B parameters)
- Use **quality models** for complex analysis (70B parameters)
- Enable **distributed processing** for parallel workloads

### Load Balancing

Configure load balancing strategy:

```bash
# Round-robin (default)
KWAAI_LOAD_BALANCING=round_robin

# Least connections
KWAAI_LOAD_BALANCING=least_connections

# Random selection
KWAAI_LOAD_BALANCING=random
```

### Redundancy Configuration

Set redundancy level for fault tolerance:

```bash
# Single redundancy (default)
KWAAI_REDUNDANCY=1

# Double redundancy for critical tasks
KWAAI_REDUNDANCY=2
```

## Security & Privacy

### Privacy Levels

Configure privacy preservation:

- **Minimum**: Basic privacy measures
- **Medium**: Enhanced privacy with data anonymization
- **Maximum**: Full privacy preservation with confidential compute

### Data Handling

- All requests are processed with privacy preservation
- No data is stored on Kwaai nodes
- Responses include privacy verification metadata

## Integration with BGIN Agents

### Archive Agent

Enhanced with distributed document analysis:

```typescript
// Parallel document processing
const results = await archiveAgent.processDocumentsInParallel(documents);

// Quality analysis with distributed inference
const qualityMetrics = await archiveAgent.analyzeQuality(document);
```

### Codex Agent

Leverages distributed inference for policy analysis:

```typescript
// Complex policy analysis
const analysis = await codexAgent.analyzePolicy(policy, {
  useDistributed: true,
  model: 'kwaainet/llama-3.2-70b-instruct'
});
```

### Discourse Agent

Uses distributed processing for community analysis:

```typescript
// Community sentiment analysis
const sentiment = await discourseAgent.analyzeCommunitySentiment(
  posts,
  { useDistributed: true }
);
```

## Future Enhancements

### Planned Features

1. **Dynamic Node Discovery**: Automatic discovery of new Kwaai nodes
2. **Adaptive Load Balancing**: ML-based node selection
3. **Cross-Node Caching**: Shared cache across distributed nodes
4. **Federated Learning**: Collaborative model improvement

### Contributing

To contribute to the Kwaai integration:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

### Documentation

- [Kwaai AI Lab GitHub](https://github.com/Kwaai-AI-Lab)
- [Kwaai Platform](https://kwaai.ai)
- [BGIN Documentation](./README.md)

### Community

- Join the BGIN community discussions
- Report issues on GitHub
- Contribute to the Kwaai integration

## License

This integration follows the same license as the BGIN project. Kwaai AI Lab components are licensed under their respective open-source licenses.

---

**Note**: This integration is designed to work with the Kwaai AI Lab's distributed infrastructure. Ensure you have proper API access and network connectivity to Kwaai services before deployment.
