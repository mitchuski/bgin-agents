// =====================================
// backend/src/agents/working-groups/model-selection-service.ts
// =====================================

import { logger } from '../../utils/logger';

export interface ModelCapability {
  name: string;
  description: string;
  type: 'text' | 'chat' | 'reasoning' | 'analysis' | 'confidential' | 'multimodal';
  performance: number; // 0-1 score
  cost: number; // relative cost
  latency: number; // milliseconds
  privacy: 'low' | 'medium' | 'high' | 'maximum';
}

export interface ModelProvider {
  name: string;
  type: 'openai' | 'anthropic' | 'ollama' | 'phala' | 'custom';
  baseUrl?: string;
  apiKey?: string;
  capabilities: ModelCapability[];
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  pricing: {
    inputTokens: number; // per 1K tokens
    outputTokens: number; // per 1K tokens
  };
}

export interface ModelSelectionCriteria {
  task: 'document_processing' | 'query_response' | 'analysis' | 'generation';
  domain: string;
  privacyLevel: 'maximum' | 'high' | 'selective' | 'minimal';
  performanceRequirement: 'speed' | 'quality' | 'balanced';
  costSensitivity: 'low' | 'medium' | 'high';
  capabilities: string[];
  maxLatency?: number;
  maxCost?: number;
}

export interface ModelSelectionResult {
  selectedModel: string;
  provider: string;
  reasoning: string;
  alternatives: Array<{
    model: string;
    provider: string;
    score: number;
    reasoning: string;
  }>;
  metadata: {
    selectionTime: Date;
    criteria: ModelSelectionCriteria;
    confidence: number;
  };
}

export interface IntelligenceDisclosureTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  disclosureLevel: 'full' | 'partial' | 'minimal';
}

export class ModelSelectionService {
  private providers: Map<string, ModelProvider> = new Map();
  private disclosureTemplates: Map<string, IntelligenceDisclosureTemplate> = new Map();

  constructor() {
    this.initializeProviders();
    this.initializeDisclosureTemplates();
  }

  /**
   * Select optimal model based on criteria
   */
  async selectModel(criteria: ModelSelectionCriteria): Promise<ModelSelectionResult> {
    try {
      logger.info(`Selecting model for task: ${criteria.task}`);

      const availableModels = this.getAvailableModels(criteria);
      const scoredModels = this.scoreModels(availableModels, criteria);
      const selectedModel = this.selectBestModel(scoredModels, criteria);

      const result: ModelSelectionResult = {
        selectedModel: selectedModel.model,
        provider: selectedModel.provider,
        reasoning: selectedModel.reasoning,
        alternatives: scoredModels
          .filter(m => m.model !== selectedModel.model)
          .slice(0, 3)
          .map(m => ({
            model: m.model,
            provider: m.provider,
            score: m.score,
            reasoning: m.reasoning
          })),
        metadata: {
          selectionTime: new Date(),
          criteria,
          confidence: selectedModel.confidence
        }
      };

      logger.info(`Model selected: ${selectedModel.model} (${selectedModel.provider})`);
      return result;

    } catch (error) {
      logger.error('Model selection failed:', error);
      throw error;
    }
  }

  /**
   * Generate intelligence disclosure
   */
  async generateIntelligenceDisclosure(
    modelInfo: any,
    processingSteps: any[],
    sourceAttribution: any[],
    confidenceScores: any,
    reasoningChain: any[],
    templateId?: string
  ): Promise<string> {
    try {
      logger.info('Generating intelligence disclosure');

      const template = templateId 
        ? this.disclosureTemplates.get(templateId)
        : this.getDefaultTemplate(modelInfo.disclosureLevel);

      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const variables = {
        modelName: modelInfo.primaryModel,
        modelProvider: modelInfo.modelProvider,
        modelVersion: modelInfo.version,
        processingSteps: processingSteps.length,
        sourceCount: sourceAttribution.length,
        overallConfidence: confidenceScores.overall,
        reasoningSteps: reasoningChain.length,
        generatedAt: new Date().toISOString(),
        workingGroupId: modelInfo.workingGroupId
      };

      const disclosure = this.renderTemplate(template.template, variables);
      
      logger.info('Intelligence disclosure generated');
      return disclosure;

    } catch (error) {
      logger.error('Intelligence disclosure generation failed:', error);
      throw error;
    }
  }

  /**
   * Get available models based on criteria
   */
  private getAvailableModels(criteria: ModelSelectionCriteria): Array<{ model: string; provider: ModelProvider }> {
    const available: Array<{ model: string; provider: ModelProvider }> = [];

    for (const provider of this.providers.values()) {
      // Check if provider meets privacy requirements
      if (!this.meetsPrivacyRequirement(provider, criteria.privacyLevel)) {
        continue;
      }

      for (const capability of provider.capabilities) {
        // Check if model has required capabilities
        if (this.hasRequiredCapabilities(capability, criteria.capabilities)) {
          available.push({
            model: capability.name,
            provider
          });
        }
      }
    }

    return available;
  }

  /**
   * Score models based on criteria
   */
  private scoreModels(
    models: Array<{ model: string; provider: ModelProvider }>,
    criteria: ModelSelectionCriteria
  ): Array<{ model: string; provider: string; score: number; reasoning: string; confidence: number }> {
    const scored: Array<{ model: string; provider: string; score: number; reasoning: string; confidence: number }> = [];

    for (const { model, provider } of models) {
      const capability = provider.capabilities.find(c => c.name === model);
      if (!capability) continue;

      let score = 0;
      const reasoning: string[] = [];

      // Performance scoring
      const performanceScore = this.calculatePerformanceScore(capability, criteria);
      score += performanceScore * 0.3;
      reasoning.push(`Performance: ${(performanceScore * 100).toFixed(1)}%`);

      // Cost scoring
      const costScore = this.calculateCostScore(capability, criteria);
      score += costScore * 0.2;
      reasoning.push(`Cost efficiency: ${(costScore * 100).toFixed(1)}%`);

      // Latency scoring
      const latencyScore = this.calculateLatencyScore(capability, criteria);
      score += latencyScore * 0.2;
      reasoning.push(`Latency: ${(latencyScore * 100).toFixed(1)}%`);

      // Capability scoring
      const capabilityScore = this.calculateCapabilityScore(capability, criteria);
      score += capabilityScore * 0.2;
      reasoning.push(`Capabilities: ${(capabilityScore * 100).toFixed(1)}%`);

      // Privacy scoring
      const privacyScore = this.calculatePrivacyScore(capability, criteria);
      score += privacyScore * 0.1;
      reasoning.push(`Privacy: ${(privacyScore * 100).toFixed(1)}%`);

      scored.push({
        model,
        provider: provider.name,
        score: Math.min(1, Math.max(0, score)),
        reasoning: reasoning.join(', '),
        confidence: this.calculateConfidence(capability, criteria)
      });
    }

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Select best model from scored options
   */
  private selectBestModel(
    scoredModels: Array<{ model: string; provider: string; score: number; reasoning: string; confidence: number }>,
    criteria: ModelSelectionCriteria
  ): { model: string; provider: string; reasoning: string; confidence: number } {
    if (scoredModels.length === 0) {
      throw new Error('No suitable models found');
    }

    const best = scoredModels[0];
    
    // Add additional reasoning based on criteria
    const additionalReasoning: string[] = [];
    
    if (criteria.performanceRequirement === 'speed') {
      additionalReasoning.push('Selected for speed optimization');
    } else if (criteria.performanceRequirement === 'quality') {
      additionalReasoning.push('Selected for quality optimization');
    } else {
      additionalReasoning.push('Selected for balanced performance');
    }

    if (criteria.costSensitivity === 'high') {
      additionalReasoning.push('Cost-optimized selection');
    }

    return {
      ...best,
      reasoning: `${best.reasoning}. ${additionalReasoning.join(', ')}.`
    };
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(capability: ModelCapability, criteria: ModelSelectionCriteria): number {
    let score = capability.performance;

    // Adjust based on task type
    switch (criteria.task) {
      case 'document_processing':
        if (capability.type === 'analysis') score *= 1.2;
        break;
      case 'query_response':
        if (capability.type === 'chat') score *= 1.2;
        break;
      case 'analysis':
        if (capability.type === 'analysis' || capability.type === 'reasoning') score *= 1.3;
        break;
      case 'generation':
        if (capability.type === 'text') score *= 1.1;
        break;
    }

    return Math.min(1, score);
  }

  /**
   * Calculate cost score
   */
  private calculateCostScore(capability: ModelCapability, criteria: ModelSelectionCriteria): number {
    const costMultiplier = {
      'low': 1.0,
      'medium': 0.8,
      'high': 0.6
    }[criteria.costSensitivity];

    return Math.max(0, 1 - (capability.cost * costMultiplier));
  }

  /**
   * Calculate latency score
   */
  private calculateLatencyScore(capability: ModelCapability, criteria: ModelSelectionCriteria): number {
    if (criteria.maxLatency && capability.latency > criteria.maxLatency) {
      return 0;
    }

    const maxLatency = criteria.maxLatency || 10000; // 10 seconds default
    return Math.max(0, 1 - (capability.latency / maxLatency));
  }

  /**
   * Calculate capability score
   */
  private calculateCapabilityScore(capability: ModelCapability, criteria: ModelSelectionCriteria): number {
    const requiredCapabilities = criteria.capabilities;
    const modelCapabilities = [capability.type];

    const matches = requiredCapabilities.filter(req => 
      modelCapabilities.some(cap => cap.includes(req))
    ).length;

    return matches / requiredCapabilities.length;
  }

  /**
   * Calculate privacy score
   */
  private calculatePrivacyScore(capability: ModelCapability, criteria: ModelSelectionCriteria): number {
    const privacyLevels = { 'minimal': 1, 'selective': 2, 'high': 3, 'maximum': 4, 'low': 1, 'medium': 2 };
    const modelPrivacy = privacyLevels[capability.privacy];
    const requiredPrivacy = privacyLevels[criteria.privacyLevel];

    return modelPrivacy >= requiredPrivacy ? 1 : modelPrivacy / requiredPrivacy;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(capability: ModelCapability, criteria: ModelSelectionCriteria): number {
    const performanceScore = this.calculatePerformanceScore(capability, criteria);
    const capabilityScore = this.calculateCapabilityScore(capability, criteria);
    const privacyScore = this.calculatePrivacyScore(capability, criteria);

    return (performanceScore + capabilityScore + privacyScore) / 3;
  }

  /**
   * Check if provider meets privacy requirement
   */
  private meetsPrivacyRequirement(provider: ModelProvider, requiredLevel: string): boolean {
    const privacyLevels = { 'minimal': 1, 'selective': 2, 'high': 3, 'maximum': 4 };
    const providerPrivacy = provider.type === 'phala' ? 4 : 2; // Phala is maximum privacy
    const required = privacyLevels[requiredLevel as keyof typeof privacyLevels];

    return providerPrivacy >= required;
  }

  /**
   * Check if model has required capabilities
   */
  private hasRequiredCapabilities(capability: ModelCapability, required: string[]): boolean {
    return required.some(req => capability.type.includes(req));
  }

  /**
   * Get default disclosure template
   */
  private getDefaultTemplate(disclosureLevel: string): IntelligenceDisclosureTemplate | undefined {
    const templates = Array.from(this.disclosureTemplates.values());
    return templates.find(t => t.disclosureLevel === disclosureLevel);
  }

  /**
   * Render template with variables
   */
  private renderTemplate(template: string, variables: { [key: string]: any }): string {
    let rendered = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return rendered;
  }

  /**
   * Initialize model providers
   */
  private initializeProviders(): void {
    // OpenAI Provider
    this.providers.set('openai', {
      name: 'openai',
      type: 'openai',
      capabilities: [
        {
          name: 'gpt-3.5-turbo',
          description: 'Fast and efficient text generation',
          type: 'chat',
          performance: 0.8,
          cost: 0.3,
          latency: 2000,
          privacy: 'medium'
        },
        {
          name: 'gpt-4',
          description: 'Advanced reasoning and analysis',
          type: 'reasoning',
          performance: 0.95,
          cost: 0.8,
          latency: 4000,
          privacy: 'medium'
        }
      ],
      rateLimits: {
        requestsPerMinute: 60,
        tokensPerMinute: 150000
      },
      pricing: {
        inputTokens: 0.0015,
        outputTokens: 0.002
      }
    });

    // Anthropic Provider
    this.providers.set('anthropic', {
      name: 'anthropic',
      type: 'anthropic',
      capabilities: [
        {
          name: 'claude-3-haiku',
          description: 'Fast and efficient analysis',
          type: 'analysis',
          performance: 0.85,
          cost: 0.4,
          latency: 1500,
          privacy: 'high'
        },
        {
          name: 'claude-3-sonnet',
          description: 'Advanced analysis and reasoning',
          type: 'reasoning',
          performance: 0.9,
          cost: 0.6,
          latency: 3000,
          privacy: 'high'
        }
      ],
      rateLimits: {
        requestsPerMinute: 50,
        tokensPerMinute: 100000
      },
      pricing: {
        inputTokens: 0.003,
        outputTokens: 0.015
      }
    });

    // Ollama Provider (Local)
    this.providers.set('ollama', {
      name: 'ollama',
      type: 'ollama',
      capabilities: [
        {
          name: 'llama2',
          description: 'Local text generation',
          type: 'text',
          performance: 0.7,
          cost: 0.1,
          latency: 1000,
          privacy: 'maximum'
        }
      ],
      rateLimits: {
        requestsPerMinute: 1000,
        tokensPerMinute: 1000000
      },
      pricing: {
        inputTokens: 0,
        outputTokens: 0
      }
    });

    // Phala Provider (Confidential Compute)
    this.providers.set('phala', {
      name: 'phala',
      type: 'phala',
      capabilities: [
        {
          name: 'phala-gpt',
          description: 'Confidential compute with maximum privacy',
          type: 'confidential',
          performance: 0.85,
          cost: 0.5,
          latency: 5000,
          privacy: 'maximum'
        }
      ],
      rateLimits: {
        requestsPerMinute: 30,
        tokensPerMinute: 50000
      },
      pricing: {
        inputTokens: 0.002,
        outputTokens: 0.008
      }
    });
  }

  /**
   * Initialize disclosure templates
   */
  private initializeDisclosureTemplates(): void {
    // Full disclosure template
    this.disclosureTemplates.set('full', {
      id: 'full',
      name: 'Full Intelligence Disclosure',
      description: 'Complete disclosure of all processing details',
      disclosureLevel: 'full',
      variables: ['modelName', 'modelProvider', 'modelVersion', 'processingSteps', 'sourceCount', 'overallConfidence', 'reasoningSteps', 'generatedAt', 'workingGroupId'],
      template: `# Intelligence Disclosure Report

## Model Information
- **Model**: {{modelName}}
- **Provider**: {{modelProvider}}
- **Version**: {{modelVersion}}
- **Generated At**: {{generatedAt}}

## Processing Details
- **Processing Steps**: {{processingSteps}}
- **Source Documents**: {{sourceCount}}
- **Reasoning Steps**: {{reasoningSteps}}

## Confidence Scores
- **Overall Confidence**: {{overallConfidence}}%

## Working Group
- **Working Group ID**: {{workingGroupId}}

This response was generated using the {{modelName}} model from {{modelProvider}} with {{overallConfidence}}% confidence based on {{sourceCount}} source documents and {{reasoningSteps}} reasoning steps.`
    });

    // Partial disclosure template
    this.disclosureTemplates.set('partial', {
      id: 'partial',
      name: 'Partial Intelligence Disclosure',
      description: 'Balanced disclosure of key processing details',
      disclosureLevel: 'partial',
      variables: ['modelName', 'modelProvider', 'overallConfidence', 'sourceCount', 'generatedAt'],
      template: `## Intelligence Disclosure

**Model**: {{modelName}} ({{modelProvider}})
**Confidence**: {{overallConfidence}}%
**Sources**: {{sourceCount}} documents
**Generated**: {{generatedAt}}

This response was generated using {{modelName}} with {{overallConfidence}}% confidence based on {{sourceCount}} source documents.`
    });

    // Minimal disclosure template
    this.disclosureTemplates.set('minimal', {
      id: 'minimal',
      name: 'Minimal Intelligence Disclosure',
      description: 'Basic disclosure of essential information',
      disclosureLevel: 'minimal',
      variables: ['modelName', 'overallConfidence', 'generatedAt'],
      template: `Generated by {{modelName}} ({{overallConfidence}}% confidence) on {{generatedAt}}.`
    });
  }

  /**
   * Get all available providers
   */
  getProviders(): ModelProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get disclosure templates
   */
  getDisclosureTemplates(): IntelligenceDisclosureTemplate[] {
    return Array.from(this.disclosureTemplates.values());
  }
}

// Singleton instance
export const modelSelectionService = new ModelSelectionService();
