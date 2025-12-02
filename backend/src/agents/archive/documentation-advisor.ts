// =====================================
// backend/src/agents/archive/documentation-advisor.ts
// =====================================

import { llmClient } from '../../integrations/llm/llm-client';
import { logger } from '../../utils/logger';
import { DocumentProcessor, ProcessedDocument } from './document-processor';

export interface DocumentationQualityMetrics {
  completeness: number; // 0-1 score
  clarity: number; // 0-1 score
  accuracy: number; // 0-1 score
  structure: number; // 0-1 score
  accessibility: number; // 0-1 score
  overallScore: number; // 0-1 weighted average
}

export interface DocumentationRecommendation {
  type: 'structure' | 'content' | 'format' | 'accessibility' | 'completeness';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedAction: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface DocumentationPlan {
  title: string;
  overview: string;
  sections: DocumentationSection[];
  targetAudience: string[];
  estimatedTime: number; // in minutes
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
}

export interface DocumentationSection {
  title: string;
  description: string;
  content: string;
  subsections: DocumentationSubsection[];
  order: number;
  estimatedLength: number; // in words
}

export interface DocumentationSubsection {
  title: string;
  content: string;
  order: number;
  estimatedLength: number;
}

export class DocumentationAdvisor {
  private documentProcessor: DocumentProcessor;
  private useDistributedInference: boolean;

  constructor() {
    this.documentProcessor = new DocumentProcessor();
    this.useDistributedInference = process.env.KWAAI_DISTRIBUTED_NODES ? true : false;
  }

  /**
   * Analyze documentation quality using OpenDocs methodology
   */
  async analyzeDocumentationQuality(
    document: ProcessedDocument,
    context?: { sessionId: string; domain: string }
  ): Promise<DocumentationQualityMetrics> {
    try {
      logger.info(`Analyzing documentation quality for: ${document.title}`);

      const analysisPrompt = `
        Analyze the following document using Google OpenDocs documentation quality standards.
        Evaluate on completeness, clarity, accuracy, structure, and accessibility.
        
        Document Title: ${document.title}
        Content: ${document.content.substring(0, 4000)}...
        Summary: ${document.summary}
        Keywords: ${document.keywords.join(', ')}
        
        Context: ${context ? `Session: ${context.sessionId}, Domain: ${context.domain}` : 'General'}
        
        Provide scores (0-1) for each dimension and an overall weighted score.
        Consider:
        - Completeness: Does it cover all necessary topics?
        - Clarity: Is the language clear and understandable?
        - Accuracy: Are the facts and information correct?
        - Structure: Is it well-organized and logical?
        - Accessibility: Is it accessible to the target audience?
        
        Respond in JSON format:
        {
          "completeness": 0.0-1.0,
          "clarity": 0.0-1.0,
          "accuracy": 0.0-1.0,
          "structure": 0.0-1.0,
          "accessibility": 0.0-1.0,
          "overallScore": 0.0-1.0,
          "reasoning": "Brief explanation of scores"
        }
      `;

      const response = await llmClient.generateResponse(analysisPrompt, {
        maxTokens: 500,
        temperature: 0.2,
        // Leverage Kwaai distributed inference for better analysis
        model: this.useDistributedInference ? 'kwaainet/llama-3.2-70b-instruct' : 'kwaainet/llama-3.2-3b-instruct'
      });

      const metrics = JSON.parse(response.content);
      
      // Validate and normalize scores
      const validatedMetrics: DocumentationQualityMetrics = {
        completeness: Math.max(0, Math.min(1, metrics.completeness || 0)),
        clarity: Math.max(0, Math.min(1, metrics.clarity || 0)),
        accuracy: Math.max(0, Math.min(1, metrics.accuracy || 0)),
        structure: Math.max(0, Math.min(1, metrics.structure || 0)),
        accessibility: Math.max(0, Math.min(1, metrics.accessibility || 0)),
        overallScore: Math.max(0, Math.min(1, metrics.overallScore || 0))
      };

      logger.info(`Documentation quality analysis completed. Overall score: ${validatedMetrics.overallScore}`);
      return validatedMetrics;

    } catch (error) {
      logger.error('Failed to analyze documentation quality:', error);
      return {
        completeness: 0,
        clarity: 0,
        accuracy: 0,
        structure: 0,
        accessibility: 0,
        overallScore: 0
      };
    }
  }

  /**
   * Generate documentation recommendations using OpenDocs methodology
   */
  async generateRecommendations(
    document: ProcessedDocument,
    qualityMetrics: DocumentationQualityMetrics,
    context?: { sessionId: string; domain: string }
  ): Promise<DocumentationRecommendation[]> {
    try {
      logger.info(`Generating documentation recommendations for: ${document.title}`);

      const recommendationsPrompt = `
        Based on the documentation quality analysis, generate specific, actionable recommendations
        following Google OpenDocs best practices for improving this document.
        
        Document: ${document.title}
        Quality Scores:
        - Completeness: ${qualityMetrics.completeness}
        - Clarity: ${qualityMetrics.clarity}
        - Accuracy: ${qualityMetrics.accuracy}
        - Structure: ${qualityMetrics.structure}
        - Accessibility: ${qualityMetrics.accessibility}
        - Overall: ${qualityMetrics.overallScore}
        
        Content Preview: ${document.content.substring(0, 2000)}...
        
        Context: ${context ? `Session: ${context.sessionId}, Domain: ${context.domain}` : 'General'}
        
        Generate 3-5 specific recommendations. For each recommendation, provide:
        - Type: structure, content, format, accessibility, or completeness
        - Priority: high, medium, or low
        - Title: Clear, actionable title
        - Description: What needs to be improved
        - Suggested Action: Specific steps to take
        - Impact: Expected improvement
        - Effort: low, medium, or high
        
        Respond in JSON format:
        {
          "recommendations": [
            {
              "type": "structure|content|format|accessibility|completeness",
              "priority": "high|medium|low",
              "title": "Recommendation title",
              "description": "What needs improvement",
              "suggestedAction": "Specific action to take",
              "impact": "Expected improvement",
              "effort": "low|medium|high"
            }
          ]
        }
      `;

      const response = await llmClient.generateResponse(recommendationsPrompt, {
        maxTokens: 800,
        temperature: 0.3,
        // Use distributed inference for comprehensive recommendations
        model: this.useDistributedInference ? 'kwaainet/llama-3.2-70b-instruct' : 'kwaainet/llama-3.2-3b-instruct'
      });

      const result = JSON.parse(response.content);
      return result.recommendations || [];

    } catch (error) {
      logger.error('Failed to generate recommendations:', error);
      return [];
    }
  }

  /**
   * Create a comprehensive documentation plan using OpenDocs methodology
   */
  async createDocumentationPlan(
    topic: string,
    context: { sessionId: string; domain: string; targetAudience: string[] },
    existingDocuments?: ProcessedDocument[]
  ): Promise<DocumentationPlan> {
    try {
      logger.info(`Creating documentation plan for: ${topic}`);

      const planPrompt = `
        Create a comprehensive documentation plan following Google OpenDocs methodology
        for the topic: "${topic}"
        
        Context:
        - Session: ${context.sessionId}
        - Domain: ${context.domain}
        - Target Audience: ${context.targetAudience.join(', ')}
        
        ${existingDocuments ? `
        Existing Related Documents:
        ${existingDocuments.map(doc => `- ${doc.title}: ${doc.summary}`).join('\n')}
        ` : ''}
        
        Create a structured documentation plan that includes:
        1. Clear overview and objectives
        2. Logical section organization
        3. Detailed subsection breakdown
        4. Target audience considerations
        5. Time estimates
        6. Priority levels
        7. Dependencies
        
        Follow OpenDocs best practices for:
        - User-centered design
        - Progressive disclosure
        - Accessibility
        - Multi-format support
        - Search optimization
        
        Respond in JSON format:
        {
          "title": "Documentation Plan Title",
          "overview": "Brief overview of the documentation",
          "targetAudience": ["audience1", "audience2"],
          "estimatedTime": 120,
          "priority": "high|medium|low",
          "dependencies": ["dep1", "dep2"],
          "sections": [
            {
              "title": "Section Title",
              "description": "Section description",
              "content": "Section content outline",
              "order": 1,
              "estimatedLength": 500,
              "subsections": [
                {
                  "title": "Subsection Title",
                  "content": "Subsection content",
                  "order": 1,
                  "estimatedLength": 200
                }
              ]
            }
          ]
        }
      `;

      const response = await llmClient.generateResponse(planPrompt, {
        maxTokens: 1200,
        temperature: 0.4,
        // Leverage distributed inference for complex planning
        model: this.useDistributedInference ? 'kwaainet/llama-3.2-70b-instruct' : 'kwaainet/llama-3.2-3b-instruct'
      });

      const plan = JSON.parse(response.content);
      return plan;

    } catch (error) {
      logger.error('Failed to create documentation plan:', error);
      return {
        title: `Documentation Plan for ${topic}`,
        overview: 'Documentation plan generation failed',
        sections: [],
        targetAudience: context.targetAudience,
        estimatedTime: 60,
        priority: 'medium',
        dependencies: []
      };
    }
  }

  /**
   * Generate documentation content using OpenDocs methodology
   */
  async generateDocumentationContent(
    section: DocumentationSection,
    context: { sessionId: string; domain: string; targetAudience: string[] },
    referenceDocuments?: ProcessedDocument[]
  ): Promise<string> {
    try {
      logger.info(`Generating content for section: ${section.title}`);

      const contentPrompt = `
        Generate high-quality documentation content following Google OpenDocs methodology
        for the section: "${section.title}"
        
        Section Description: ${section.description}
        Target Audience: ${context.targetAudience.join(', ')}
        Domain: ${context.domain}
        Session: ${context.sessionId}
        
        ${referenceDocuments ? `
        Reference Documents:
        ${referenceDocuments.map(doc => `- ${doc.title}: ${doc.summary}`).join('\n')}
        ` : ''}
        
        Follow OpenDocs best practices:
        1. Clear, concise language
        2. User-focused content
        3. Proper structure and formatting
        4. Accessibility considerations
        5. Actionable information
        6. Examples and use cases where appropriate
        
        Generate comprehensive content that is:
        - Well-structured with clear headings
        - Easy to understand for the target audience
        - Comprehensive but not overwhelming
        - Actionable and practical
        - Properly formatted for markdown
        
        Target length: approximately ${section.estimatedLength} words
      `;

      const response = await llmClient.generateResponse(contentPrompt, {
        maxTokens: Math.min(4000, section.estimatedLength * 2),
        temperature: 0.3,
        // Use distributed inference for high-quality content generation
        model: this.useDistributedInference ? 'kwaainet/llama-3.2-70b-instruct' : 'kwaainet/llama-3.2-3b-instruct'
      });

      return response.content;

    } catch (error) {
      logger.error(`Failed to generate content for section ${section.title}:`, error);
      return `# ${section.title}\n\nContent generation failed. Please try again.`;
    }
  }

  /**
   * Validate documentation against OpenDocs standards
   */
  async validateDocumentation(
    content: string,
    standards: string[] = ['accessibility', 'clarity', 'structure', 'completeness']
  ): Promise<{ isValid: boolean; issues: string[]; suggestions: string[] }> {
    try {
      logger.info('Validating documentation against OpenDocs standards');

      const validationPrompt = `
        Validate the following documentation content against Google OpenDocs standards.
        Check for: ${standards.join(', ')}
        
        Content:
        ${content.substring(0, 3000)}...
        
        Provide validation results in JSON format:
        {
          "isValid": true/false,
          "issues": ["issue1", "issue2"],
          "suggestions": ["suggestion1", "suggestion2"],
          "score": 0.0-1.0
        }
        
        Focus on:
        - Accessibility: Alt text, heading structure, color contrast
        - Clarity: Language, terminology, explanations
        - Structure: Logical flow, headings, organization
        - Completeness: Missing information, gaps
      `;

      const response = await llmClient.generateResponse(validationPrompt, {
        maxTokens: 600,
        temperature: 0.2,
        // Use distributed inference for thorough validation
        model: this.useDistributedInference ? 'kwaainet/llama-3.2-70b-instruct' : 'kwaainet/llama-3.2-3b-instruct'
      });

      const validation = JSON.parse(response.content);
      return {
        isValid: validation.isValid || false,
        issues: validation.issues || [],
        suggestions: validation.suggestions || []
      };

    } catch (error) {
      logger.error('Failed to validate documentation:', error);
      return {
        isValid: false,
        issues: ['Validation failed'],
        suggestions: ['Please review the content manually']
      };
    }
  }

  /**
   * Leverage Kwaai distributed inference for parallel document analysis
   */
  async analyzeDocumentsInParallel(
    documents: ProcessedDocument[],
    context?: { sessionId: string; domain: string }
  ): Promise<DocumentationQualityMetrics[]> {
    if (!this.useDistributedInference) {
      // Fallback to sequential processing
      const results: DocumentationQualityMetrics[] = [];
      for (const doc of documents) {
        const metrics = await this.analyzeDocumentationQuality(doc, context);
        results.push(metrics);
      }
      return results;
    }

    try {
      logger.info(`Analyzing ${documents.length} documents in parallel using Kwaai distributed inference`);
      
      // Create parallel analysis tasks
      const analysisTasks = documents.map(async (doc, index) => {
        const analysisPrompt = `
          Analyze document ${index + 1} of ${documents.length} using Google OpenDocs methodology.
          
          Document Title: ${doc.title}
          Content: ${doc.content.substring(0, 2000)}...
          Summary: ${doc.summary}
          Keywords: ${doc.keywords.join(', ')}
          
          Context: ${context ? `Session: ${context.sessionId}, Domain: ${context.domain}` : 'General'}
          
          Provide scores (0-1) for completeness, clarity, accuracy, structure, and accessibility.
          Respond in JSON format with reasoning.
        `;

        const response = await llmClient.generateResponse(analysisPrompt, {
          maxTokens: 300,
          temperature: 0.2,
          model: 'kwaainet/llama-3.2-70b-instruct'
        });

        const metrics = JSON.parse(response.content);
        return {
          completeness: Math.max(0, Math.min(1, metrics.completeness || 0)),
          clarity: Math.max(0, Math.min(1, metrics.clarity || 0)),
          accuracy: Math.max(0, Math.min(1, metrics.accuracy || 0)),
          structure: Math.max(0, Math.min(1, metrics.structure || 0)),
          accessibility: Math.max(0, Math.min(1, metrics.accessibility || 0)),
          overallScore: Math.max(0, Math.min(1, metrics.overallScore || 0))
        };
      });

      // Execute all analyses in parallel
      const results = await Promise.all(analysisTasks);
      
      logger.info(`Completed parallel analysis of ${documents.length} documents`);
      return results;

    } catch (error) {
      logger.error('Parallel document analysis failed:', error);
      // Fallback to sequential processing
      const results: DocumentationQualityMetrics[] = [];
      for (const doc of documents) {
        const metrics = await this.analyzeDocumentationQuality(doc, context);
        results.push(metrics);
      }
      return results;
    }
  }

  /**
   * Generate documentation metrics and analytics
   */
  async generateDocumentationMetrics(
    documents: ProcessedDocument[],
    timeRange?: { start: Date; end: Date }
  ): Promise<{
    totalDocuments: number;
    averageQuality: number;
    qualityDistribution: { [key: string]: number };
    topIssues: string[];
    improvementTrends: { [key: string]: number };
  }> {
    try {
      logger.info('Generating documentation metrics and analytics');

      const metrics = {
        totalDocuments: documents.length,
        averageQuality: 0,
        qualityDistribution: {} as { [key: string]: number },
        topIssues: [] as string[],
        improvementTrends: {} as { [key: string]: number }
      };

      if (documents.length === 0) {
        return metrics;
      }

      // Calculate average quality
      const qualityScores = documents.map(doc => doc.qualityScore || 0);
      metrics.averageQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;

      // Quality distribution
      const qualityRanges = {
        'excellent': qualityScores.filter(s => s >= 0.8).length,
        'good': qualityScores.filter(s => s >= 0.6 && s < 0.8).length,
        'fair': qualityScores.filter(s => s >= 0.4 && s < 0.6).length,
        'poor': qualityScores.filter(s => s < 0.4).length
      };
      metrics.qualityDistribution = qualityRanges;

      // Analyze common issues (simplified)
      const allKeywords = documents.flatMap(doc => doc.keywords || []);
      const keywordCounts = allKeywords.reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      metrics.topIssues = Object.entries(keywordCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([keyword]) => keyword);

      return metrics;

    } catch (error) {
      logger.error('Failed to generate documentation metrics:', error);
      return {
        totalDocuments: 0,
        averageQuality: 0,
        qualityDistribution: {},
        topIssues: [],
        improvementTrends: {}
      };
    }
  }
}

// Singleton instance
export const documentationAdvisor = new DocumentationAdvisor();
