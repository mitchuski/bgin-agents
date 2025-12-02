// =====================================
// backend/src/agents/codex/policy-analyzer.ts
// =====================================

import { llmClient } from '../../integrations/llm/llm-client';
import { phalaLLMService } from '../../integrations/phala-cloud/phala-llm-service';
import { documentationAdvisor, DocumentationQualityMetrics, DocumentationRecommendation, DocumentationPlan } from '../archive/documentation-advisor';
import { logger } from '../../utils/logger';
import { database } from '../../utils/database';

export interface PolicyFramework {
  id: string;
  name: string;
  jurisdiction: string;
  domain: string;
  version: string;
  content: any;
  metadata: {
    created: Date;
    updated: Date;
    status: 'draft' | 'active' | 'deprecated' | 'archived';
    author?: string;
    contributors?: string[];
    tags?: string[];
  };
}

export interface PolicyAnalysis {
  id: string;
  framework: PolicyFramework;
  analysis: {
    complianceScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    strengths: string[];
    weaknesses: string[];
    gaps: string[];
    recommendations: string[];
  };
  stakeholderImpact: {
    regulators: number;
    industry: number;
    civilSociety: number;
    technicalCommunity: number;
  };
  documentation: {
    qualityMetrics: DocumentationQualityMetrics;
    recommendations: DocumentationRecommendation[];
    plan?: DocumentationPlan;
  };
  metadata: {
    analyzedAt: Date;
    analystId?: string;
    sessionId: string;
    confidence: number;
    processingTime: number;
  };
}

export interface StandardsDocument {
  id: string;
  title: string;
  content: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  jurisdiction: string;
  domain: string;
  metadata: {
    created: Date;
    updated: Date;
    author?: string;
    reviewers?: string[];
    tags?: string[];
  };
  qualityMetrics?: DocumentationQualityMetrics;
}

export class PolicyAnalyzer {
  private readonly frameworks: Map<string, PolicyFramework> = new Map();
  private readonly standards: Map<string, StandardsDocument> = new Map();

  constructor() {
    this.initializeDefaultFrameworks();
  }

  /**
   * Analyze a policy framework using OpenDocs methodology
   */
  async analyzePolicyFramework(
    framework: PolicyFramework,
    context: { sessionId: string; privacyLevel: string }
  ): Promise<PolicyAnalysis> {
    const startTime = Date.now();
    
    try {
      logger.info(`Analyzing policy framework: ${framework.name}`);

      // Step 1: Analyze policy content
      const analysis = await this.performPolicyAnalysis(framework, context);
      
      // Step 2: Assess stakeholder impact
      const stakeholderImpact = await this.assessStakeholderImpact(framework, context);
      
      // Step 3: Generate documentation analysis
      const documentation = await this.analyzePolicyDocumentation(framework, context);
      
      // Step 4: Create documentation plan if needed
      if (documentation.qualityMetrics.overallScore < 0.7) {
        documentation.plan = await this.createPolicyDocumentationPlan(framework, context);
      }

      const processingTime = Date.now() - startTime;

      const policyAnalysis: PolicyAnalysis = {
        id: `analysis_${Date.now()}`,
        framework,
        analysis,
        stakeholderImpact,
        documentation,
        metadata: {
          analyzedAt: new Date(),
          sessionId: context.sessionId,
          confidence: this.calculateConfidence(analysis, stakeholderImpact),
          processingTime
        }
      };

      // Store analysis in database
      await this.storePolicyAnalysis(policyAnalysis);

      logger.info(`Policy analysis completed for ${framework.name} in ${processingTime}ms`);
      return policyAnalysis;

    } catch (error) {
      logger.error('Policy framework analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate policy documentation using OpenDocs methodology
   */
  async generatePolicyDocumentation(
    framework: PolicyFramework,
    context: { sessionId: string; domain: string; targetAudience: string[] },
    options?: {
      includeQualityAnalysis?: boolean;
      generateRecommendations?: boolean;
      validateAgainstStandards?: boolean;
    }
  ): Promise<{
    plan: DocumentationPlan;
    content: string;
    qualityMetrics?: DocumentationQualityMetrics;
    recommendations?: DocumentationRecommendation[];
    validation?: { isValid: boolean; issues: string[]; suggestions: string[] };
  }> {
    try {
      logger.info(`Generating policy documentation for: ${framework.name}`);

      // Step 1: Create documentation plan
      const plan = await documentationAdvisor.createDocumentationPlan(
        `${framework.name} - Policy Documentation`,
        {
          sessionId: context.sessionId,
          domain: context.domain,
          targetAudience: context.targetAudience
        }
      );

      // Step 2: Generate comprehensive content
      let content = `# ${framework.name}\n\n`;
      content += `**Jurisdiction:** ${framework.jurisdiction}\n`;
      content += `**Domain:** ${framework.domain}\n`;
      content += `**Version:** ${framework.version}\n`;
      content += `**Status:** ${framework.metadata.status}\n\n`;
      
      content += `## Overview\n\n${plan.overview}\n\n`;

      // Generate sections
      for (const section of plan.sections) {
        const sectionContent = await this.generatePolicySectionContent(
          section,
          framework,
          context
        );
        content += sectionContent + '\n\n';
      }

      const result: any = {
        plan,
        content
      };

      // Create mock document for analysis
      const mockDocument = {
        id: 'temp-policy-doc',
        title: framework.name,
        content,
        metadata: {
          sessionId: context.sessionId,
          privacyLevel: 'selective' as const,
          documentType: 'policy_documentation'
        },
        chunks: [],
        summary: plan.overview,
        keywords: [],
        entities: [],
        qualityScore: 0,
        processingStatus: 'completed' as const
      };

      // Step 3: Quality analysis (if requested)
      if (options?.includeQualityAnalysis) {
        result.qualityMetrics = await documentationAdvisor.analyzeDocumentationQuality(
          mockDocument,
          { sessionId: context.sessionId, domain: context.domain }
        );
      }

      // Step 4: Generate recommendations (if requested)
      if (options?.generateRecommendations && result.qualityMetrics) {
        result.recommendations = await documentationAdvisor.generateRecommendations(
          mockDocument,
          result.qualityMetrics,
          { sessionId: context.sessionId, domain: context.domain }
        );
      }

      // Step 5: Validate against standards (if requested)
      if (options?.validateAgainstStandards) {
        result.validation = await documentationAdvisor.validateDocumentation(content);
      }

      return result;

    } catch (error) {
      logger.error('Policy documentation generation failed:', error);
      throw error;
    }
  }

  /**
   * Create or update a standards document using OpenDocs methodology
   */
  async createStandardsDocument(
    title: string,
    content: string,
    context: { sessionId: string; domain: string; jurisdiction: string },
    options?: {
      version?: string;
      author?: string;
      reviewers?: string[];
      tags?: string[];
    }
  ): Promise<StandardsDocument> {
    try {
      logger.info(`Creating standards document: ${title}`);

      const standardsDoc: StandardsDocument = {
        id: `standards_${Date.now()}`,
        title,
        content,
        version: options?.version || '1.0.0',
        status: 'draft',
        jurisdiction: context.jurisdiction,
        domain: context.domain,
        metadata: {
          created: new Date(),
          updated: new Date(),
          author: options?.author,
          reviewers: options?.reviewers || [],
          tags: options?.tags || []
        }
      };

      // Analyze documentation quality
      const mockDocument = {
        id: standardsDoc.id,
        title: standardsDoc.title,
        content: standardsDoc.content,
        metadata: {
          sessionId: context.sessionId,
          privacyLevel: 'selective' as const,
          documentType: 'standards_document'
        },
        chunks: [],
        summary: '',
        keywords: [],
        entities: [],
        qualityScore: 0,
        processingStatus: 'completed' as const
      };

      standardsDoc.qualityMetrics = await documentationAdvisor.analyzeDocumentationQuality(
        mockDocument,
        { sessionId: context.sessionId, domain: context.domain }
      );

      // Store in database
      await this.storeStandardsDocument(standardsDoc);

      // Store in memory
      this.standards.set(standardsDoc.id, standardsDoc);

      logger.info(`Standards document created: ${standardsDoc.id}`);
      return standardsDoc;

    } catch (error) {
      logger.error('Standards document creation failed:', error);
      throw error;
    }
  }

  /**
   * Generate compliance report using OpenDocs methodology
   */
  async generateComplianceReport(
    framework: PolicyFramework,
    context: { sessionId: string; domain: string },
    targetPolicies?: string[]
  ): Promise<{
    reportId: string;
    framework: PolicyFramework;
    complianceScore: number;
    findings: {
      compliant: string[];
      nonCompliant: string[];
      recommendations: string[];
    };
    documentation: {
      qualityMetrics: DocumentationQualityMetrics;
      recommendations: DocumentationRecommendation[];
    };
    metadata: {
      generatedAt: Date;
      sessionId: string;
      confidence: number;
    };
  }> {
    try {
      logger.info(`Generating compliance report for: ${framework.name}`);

      // Step 1: Analyze compliance
      const complianceAnalysis = await this.analyzeCompliance(framework, targetPolicies);
      
      // Step 2: Generate findings
      const findings = await this.generateComplianceFindings(framework, complianceAnalysis);
      
      // Step 3: Analyze documentation quality
      const mockDocument = {
        id: 'temp-compliance-doc',
        title: `${framework.name} - Compliance Report`,
        content: JSON.stringify(findings),
        metadata: {
          sessionId: context.sessionId,
          privacyLevel: 'selective' as const,
          documentType: 'compliance_report'
        },
        chunks: [],
        summary: '',
        keywords: [],
        entities: [],
        qualityScore: 0,
        processingStatus: 'completed' as const
      };

      const qualityMetrics = await documentationAdvisor.analyzeDocumentationQuality(
        mockDocument,
        { sessionId: context.sessionId, domain: context.domain }
      );

      const recommendations = await documentationAdvisor.generateRecommendations(
        mockDocument,
        qualityMetrics,
        { sessionId: context.sessionId, domain: context.domain }
      );

      const report = {
        reportId: `compliance_${Date.now()}`,
        framework,
        complianceScore: complianceAnalysis.score,
        findings,
        documentation: {
          qualityMetrics,
          recommendations
        },
        metadata: {
          generatedAt: new Date(),
          sessionId: context.sessionId,
          confidence: complianceAnalysis.confidence
        }
      };

      // Store report
      await this.storeComplianceReport(report);

      return report;

    } catch (error) {
      logger.error('Compliance report generation failed:', error);
      throw error;
    }
  }

  /**
   * Perform policy analysis using LLM
   */
  private async performPolicyAnalysis(
    framework: PolicyFramework,
    context: { sessionId: string; privacyLevel: string }
  ): Promise<{
    complianceScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    strengths: string[];
    weaknesses: string[];
    gaps: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
        **IMPORTANT: Provide comprehensive, detailed policy analysis with extended reasoning. When referencing specific policy elements, include thorough analysis, context, and implications.**

        Analyze the following policy framework for compliance, risks, and recommendations with detailed reasoning and comprehensive analysis.
        
        Framework: ${framework.name}
        Jurisdiction: ${framework.jurisdiction}
        Domain: ${framework.domain}
        Content: ${JSON.stringify(framework.content)}
        
        **Analysis Requirements:**
        
        1. **Comprehensive Compliance Assessment**: Provide detailed analysis including:
           - Specific compliance requirements and how they are addressed
           - Detailed evaluation of each policy component
           - Cross-referencing with relevant regulations and standards
           - Identification of compliance strengths and weaknesses
           - Assessment of implementation feasibility and challenges
        
        2. **Detailed Risk Analysis**: Thorough risk assessment including:
           - Identification of specific risks and their potential impact
           - Analysis of risk likelihood and severity
           - Consideration of cascading and systemic risks
           - Evaluation of risk mitigation measures
           - Assessment of residual risks and their implications
        
        3. **Strengths Analysis**: Comprehensive identification of strengths including:
           - Specific policy elements that are particularly strong
           - Detailed explanation of why these elements are effective
           - Analysis of best practices and innovative approaches
           - Consideration of stakeholder benefits and positive impacts
           - Assessment of scalability and adaptability
        
        4. **Weaknesses Analysis**: Detailed identification of weaknesses including:
           - Specific policy elements that need improvement
           - Detailed explanation of why these elements are problematic
           - Analysis of potential negative consequences
           - Consideration of stakeholder concerns and impacts
           - Assessment of implementation challenges and barriers
        
        5. **Gaps Analysis**: Comprehensive gap identification including:
           - Specific areas where policy coverage is insufficient
           - Detailed explanation of why these gaps are significant
           - Analysis of potential consequences of these gaps
           - Consideration of emerging issues and future needs
           - Assessment of priority levels for addressing gaps
        
        6. **Recommendations**: Detailed, actionable recommendations including:
           - Specific policy modifications and improvements
           - Detailed implementation guidance and timelines
           - Resource requirements and stakeholder involvement
           - Risk mitigation strategies and monitoring approaches
           - Success metrics and evaluation criteria
        
        Provide analysis in JSON format with detailed explanations:
        {
          "complianceScore": 0.0-1.0,
          "riskLevel": "low|medium|high|critical",
          "strengths": ["detailed strength 1 with explanation", "detailed strength 2 with explanation"],
          "weaknesses": ["detailed weakness 1 with explanation", "detailed weakness 2 with explanation"],
          "gaps": ["detailed gap 1 with explanation", "detailed gap 2 with explanation"],
          "recommendations": ["detailed recommendation 1 with implementation details", "detailed recommendation 2 with implementation details"]
        }
      `;

      const response = await llmClient.generateResponse(prompt, {
        maxTokens: 3000,
        temperature: 0.2
      });

      return JSON.parse(response.content);

    } catch (error) {
      logger.error('Policy analysis failed:', error);
      return {
        complianceScore: 0.5,
        riskLevel: 'medium',
        strengths: [],
        weaknesses: ['Analysis failed'],
        gaps: [],
        recommendations: ['Review analysis process']
      };
    }
  }

  /**
   * Assess stakeholder impact
   */
  private async assessStakeholderImpact(
    framework: PolicyFramework,
    context: { sessionId: string; privacyLevel: string }
  ): Promise<{
    regulators: number;
    industry: number;
    civilSociety: number;
    technicalCommunity: number;
  }> {
    try {
      const prompt = `
        **IMPORTANT: Provide comprehensive, detailed stakeholder impact assessment with extended reasoning. When analyzing specific policy elements, include thorough analysis of their implications for each stakeholder group.**

        Assess the impact of this policy framework on different stakeholder groups with detailed analysis and comprehensive reasoning.
        
        Framework: ${framework.name}
        Jurisdiction: ${framework.jurisdiction}
        Domain: ${framework.domain}
        
        **Stakeholder Impact Analysis Requirements:**
        
        1. **Regulators Impact Analysis**: Detailed assessment including:
           - Specific regulatory oversight implications
           - Analysis of compliance monitoring requirements
           - Assessment of enforcement mechanisms and challenges
           - Consideration of inter-agency coordination needs
           - Evaluation of resource requirements and capacity needs
           - Analysis of regulatory effectiveness and efficiency impacts
        
        2. **Industry Impact Analysis**: Comprehensive business impact assessment including:
           - Specific operational changes and requirements
           - Analysis of compliance costs and resource implications
           - Assessment of competitive advantages and disadvantages
           - Consideration of innovation and development impacts
           - Evaluation of market access and participation effects
           - Analysis of business model adaptation requirements
        
        3. **Civil Society Impact Analysis**: Detailed public impact assessment including:
           - Specific effects on individual rights and freedoms
           - Analysis of privacy and data protection implications
           - Assessment of accessibility and inclusion impacts
           - Consideration of democratic participation and transparency
           - Evaluation of social equity and justice implications
           - Analysis of community engagement and representation effects
        
        4. **Technical Community Impact Analysis**: Comprehensive technical impact assessment including:
           - Specific implementation requirements and challenges
           - Analysis of technical standards and protocol impacts
           - Assessment of development and innovation implications
           - Consideration of interoperability and compatibility requirements
           - Evaluation of security and reliability considerations
           - Analysis of technical expertise and skill requirements
        
        **Impact Rating Criteria:**
        - 0-2: Minimal impact, minor adjustments required
        - 3-4: Low impact, some operational changes needed
        - 5-6: Moderate impact, significant changes required
        - 7-8: High impact, major operational transformation needed
        - 9-10: Critical impact, fundamental changes required
        
        Rate impact from 0-10 for each group with detailed justification:
        - Regulators: How much does this affect regulatory oversight?
        - Industry: How much does this affect business operations?
        - Civil Society: How much does this affect public rights and freedoms?
        - Technical Community: How much does this affect technical implementation?
        
        Respond in JSON format with detailed explanations:
        {
          "regulators": 0-10,
          "industry": 0-10,
          "civilSociety": 0-10,
          "technicalCommunity": 0-10,
          "reasoning": {
            "regulators": "detailed explanation of regulatory impact",
            "industry": "detailed explanation of business impact",
            "civilSociety": "detailed explanation of public impact",
            "technicalCommunity": "detailed explanation of technical impact"
          }
        }
      `;

      const response = await llmClient.generateResponse(prompt, {
        maxTokens: 2000,
        temperature: 0.3
      });

      const impact = JSON.parse(response.content);
      
      // Normalize to 0-1 scale
      return {
        regulators: impact.regulators / 10,
        industry: impact.industry / 10,
        civilSociety: impact.civilSociety / 10,
        technicalCommunity: impact.technicalCommunity / 10
      };

    } catch (error) {
      logger.error('Stakeholder impact assessment failed:', error);
      return {
        regulators: 0.5,
        industry: 0.5,
        civilSociety: 0.5,
        technicalCommunity: 0.5
      };
    }
  }

  /**
   * Analyze policy documentation quality
   */
  private async analyzePolicyDocumentation(
    framework: PolicyFramework,
    context: { sessionId: string; privacyLevel: string }
  ): Promise<{
    qualityMetrics: DocumentationQualityMetrics;
    recommendations: DocumentationRecommendation[];
    plan?: DocumentationPlan;
  }> {
    try {
      const mockDocument = {
        id: framework.id,
        title: framework.name,
        content: JSON.stringify(framework.content),
        metadata: {
          sessionId: context.sessionId,
          privacyLevel: 'selective' as const,
          documentType: 'policy_framework'
        },
        chunks: [],
        summary: '',
        keywords: [],
        entities: [],
        qualityScore: 0,
        processingStatus: 'completed' as const
      };

      const qualityMetrics = await documentationAdvisor.analyzeDocumentationQuality(
        mockDocument,
        { sessionId: context.sessionId, domain: framework.domain }
      );

      const recommendations = await documentationAdvisor.generateRecommendations(
        mockDocument,
        qualityMetrics,
        { sessionId: context.sessionId, domain: framework.domain }
      );

      return {
        qualityMetrics,
        recommendations
      };

    } catch (error) {
      logger.error('Policy documentation analysis failed:', error);
      return {
        qualityMetrics: {
          completeness: 0,
          clarity: 0,
          accuracy: 0,
          structure: 0,
          accessibility: 0,
          overallScore: 0
        },
        recommendations: []
      };
    }
  }

  /**
   * Create policy documentation plan
   */
  private async createPolicyDocumentationPlan(
    framework: PolicyFramework,
    context: { sessionId: string; privacyLevel: string }
  ): Promise<DocumentationPlan> {
    try {
      return await documentationAdvisor.createDocumentationPlan(
        `${framework.name} - Policy Documentation`,
        {
          sessionId: context.sessionId,
          domain: framework.domain,
          targetAudience: ['policymakers', 'regulators', 'industry', 'researchers']
        }
      );

    } catch (error) {
      logger.error('Policy documentation plan creation failed:', error);
      return {
        title: `${framework.name} - Policy Documentation`,
        overview: 'Documentation plan generation failed',
        sections: [],
        targetAudience: ['policymakers', 'regulators'],
        estimatedTime: 60,
        priority: 'medium',
        dependencies: []
      };
    }
  }

  /**
   * Generate policy section content
   */
  private async generatePolicySectionContent(
    section: any,
    framework: PolicyFramework,
    context: { sessionId: string; domain: string; targetAudience: string[] }
  ): Promise<string> {
    try {
      const prompt = `
        Generate content for the policy documentation section: "${section.title}"
        
        Framework: ${framework.name}
        Jurisdiction: ${framework.domain}
        Domain: ${context.domain}
        Target Audience: ${context.targetAudience.join(', ')}
        
        Section Description: ${section.description}
        
        Generate comprehensive, well-structured content that:
        1. Is clear and accessible to the target audience
        2. Follows policy documentation best practices
        3. Includes relevant examples and use cases
        4. Is properly formatted for markdown
        5. Maintains professional tone appropriate for policy documents
        
        Target length: approximately ${section.estimatedLength} words
      `;

      const response = await llmClient.generateResponse(prompt, {
        maxTokens: Math.min(4000, section.estimatedLength * 2),
        temperature: 0.3
      });

      return `## ${section.title}\n\n${response.content}`;

    } catch (error) {
      logger.error(`Policy section content generation failed for ${section.title}:`, error);
      return `## ${section.title}\n\nContent generation failed. Please try again.`;
    }
  }

  /**
   * Analyze compliance
   */
  private async analyzeCompliance(
    framework: PolicyFramework,
    targetPolicies?: string[]
  ): Promise<{ score: number; confidence: number }> {
    try {
      // Simplified compliance analysis
      // In production, this would integrate with actual compliance checking systems
      const baseScore = 0.7; // Default compliance score
      const confidence = 0.8; // Default confidence
      
      return { score: baseScore, confidence };

    } catch (error) {
      logger.error('Compliance analysis failed:', error);
      return { score: 0.5, confidence: 0.5 };
    }
  }

  /**
   * Generate compliance findings
   */
  private async generateComplianceFindings(
    framework: PolicyFramework,
    analysis: { score: number; confidence: number }
  ): Promise<{
    compliant: string[];
    nonCompliant: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
        Generate compliance findings for the policy framework: ${framework.name}
        
        Compliance Score: ${analysis.score}
        Confidence: ${analysis.confidence}
        
        Provide findings in JSON format:
        {
          "compliant": ["item1", "item2"],
          "nonCompliant": ["item1", "item2"],
          "recommendations": ["rec1", "rec2"]
        }
      `;

      const response = await llmClient.generateResponse(prompt, {
        maxTokens: 600,
        temperature: 0.3
      });

      return JSON.parse(response.content);

    } catch (error) {
      logger.error('Compliance findings generation failed:', error);
      return {
        compliant: [],
        nonCompliant: ['Analysis failed'],
        recommendations: ['Review compliance process']
      };
    }
  }

  /**
   * Calculate analysis confidence
   */
  private calculateConfidence(analysis: any, stakeholderImpact: any): number {
    // Simple confidence calculation based on analysis completeness
    const baseConfidence = 0.8;
    const impactVariance = Math.abs(stakeholderImpact.regulators - stakeholderImpact.industry) +
                          Math.abs(stakeholderImpact.civilSociety - stakeholderImpact.technicalCommunity);
    
    return Math.max(0.1, Math.min(1.0, baseConfidence - (impactVariance * 0.1)));
  }

  /**
   * Initialize default frameworks
   */
  private initializeDefaultFrameworks(): void {
    const defaultFrameworks: PolicyFramework[] = [
      {
        id: 'gdpr',
        name: 'GDPR Compliance Framework',
        jurisdiction: 'EU',
        domain: 'privacy',
        version: '2.1',
        content: {
          principles: ['lawfulness', 'fairness', 'transparency', 'purpose_limitation'],
          rights: ['access', 'rectification', 'erasure', 'portability'],
          obligations: ['data_protection_by_design', 'privacy_impact_assessment']
        },
        metadata: {
          created: new Date(),
          updated: new Date(),
          status: 'active',
          tags: ['privacy', 'data_protection', 'compliance']
        }
      },
      {
        id: 'ai_ethics',
        name: 'AI Ethics Guidelines',
        jurisdiction: 'Global',
        domain: 'ai-governance',
        version: '1.5',
        content: {
          principles: ['fairness', 'transparency', 'accountability', 'human_centered'],
          requirements: ['bias_mitigation', 'explainability', 'human_oversight'],
          governance: ['ethics_review', 'impact_assessment', 'stakeholder_engagement']
        },
        metadata: {
          created: new Date(),
          updated: new Date(),
          status: 'active',
          tags: ['ai', 'ethics', 'governance']
        }
      }
    ];

    defaultFrameworks.forEach(framework => {
      this.frameworks.set(framework.id, framework);
    });
  }

  /**
   * Store policy analysis in database
   */
  private async storePolicyAnalysis(analysis: PolicyAnalysis): Promise<void> {
    try {
      await database.query(`
        INSERT INTO policy_analyses (
          id, framework_id, analysis_data, stakeholder_impact, 
          documentation_metrics, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        analysis.id,
        analysis.framework.id,
        JSON.stringify(analysis.analysis),
        JSON.stringify(analysis.stakeholderImpact),
        JSON.stringify(analysis.documentation),
        JSON.stringify(analysis.metadata)
      ]);

    } catch (error) {
      logger.error('Failed to store policy analysis:', error);
    }
  }

  /**
   * Store standards document in database
   */
  private async storeStandardsDocument(document: StandardsDocument): Promise<void> {
    try {
      await database.query(`
        INSERT INTO standards_documents (
          id, title, content, version, status, jurisdiction, domain,
          metadata, quality_metrics, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      `, [
        document.id,
        document.title,
        document.content,
        document.version,
        document.status,
        document.jurisdiction,
        document.domain,
        JSON.stringify(document.metadata),
        JSON.stringify(document.qualityMetrics)
      ]);

    } catch (error) {
      logger.error('Failed to store standards document:', error);
    }
  }

  /**
   * Store compliance report in database
   */
  private async storeComplianceReport(report: any): Promise<void> {
    try {
      await database.query(`
        INSERT INTO compliance_reports (
          report_id, framework_id, compliance_score, findings,
          documentation, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        report.reportId,
        report.framework.id,
        report.complianceScore,
        JSON.stringify(report.findings),
        JSON.stringify(report.documentation),
        JSON.stringify(report.metadata)
      ]);

    } catch (error) {
      logger.error('Failed to store compliance report:', error);
    }
  }

  /**
   * Get framework by ID
   */
  getFramework(id: string): PolicyFramework | undefined {
    return this.frameworks.get(id);
  }

  /**
   * Get all frameworks
   */
  getAllFrameworks(): PolicyFramework[] {
    return Array.from(this.frameworks.values());
  }

  /**
   * Get standards document by ID
   */
  getStandardsDocument(id: string): StandardsDocument | undefined {
    return this.standards.get(id);
  }

  /**
   * Get all standards documents
   */
  getAllStandardsDocuments(): StandardsDocument[] {
    return Array.from(this.standards.values());
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const checks = await Promise.all([
        llmClient.healthCheck(),
        phalaLLMService.healthCheck()
      ]);

      return checks.every(check => check === true);

    } catch (error) {
      logger.error('Policy analyzer health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const policyAnalyzer = new PolicyAnalyzer();
