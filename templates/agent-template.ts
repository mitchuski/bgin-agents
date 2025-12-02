// =====================================
// templates/agent-template.ts
// Custom Agent Template for Organizations
// =====================================

import { Agent, AgentRequest, AgentResponse, AgentConfig } from '../backend/src/types/agent';
import { LLMClient } from '../backend/src/integrations/llm/llm-client';
import { logger } from '../backend/src/utils/logger';

/**
 * Custom Agent Template
 * 
 * This template provides a foundation for creating custom agents
 * for your organization's specific governance and intelligence needs.
 * 
 * Usage:
 * 1. Copy this template to src/agents/custom/your-agent-name.ts
 * 2. Replace 'YourAgentName' with your actual agent name
 * 3. Implement the abstract methods
 * 4. Add your organization-specific logic
 */
export abstract class CustomAgentTemplate implements Agent {
  abstract name: string;
  abstract capabilities: string[];
  
  protected config: AgentConfig;
  protected llmClient: LLMClient;
  protected logger: Logger;
  protected organizationContext: OrganizationContext;

  constructor(config: AgentConfig, organizationContext: OrganizationContext) {
    this.config = config;
    this.organizationContext = organizationContext;
    this.llmClient = new LLMClient();
    this.logger = new Logger(`${this.constructor.name}`);
    
    this.logger.info(`Initialized ${this.name} for ${organizationContext.name}`);
  }

  /**
   * Process a request - implement this method with your agent's logic
   */
  abstract async processRequest(request: AgentRequest): Promise<AgentResponse>;

  /**
   * Initialize the agent - override if needed
   */
  async initialize(): Promise<void> {
    this.logger.info(`Initializing ${this.name}...`);
    // Add your initialization logic here
  }

  /**
   * Health check - override if needed
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Add your health check logic here
      return true;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get agent status - override if needed
   */
  async getStatus(): Promise<AgentStatus> {
    return {
      name: this.name,
      status: 'active',
      capabilities: this.capabilities,
      organization: this.organizationContext.name,
      lastActivity: new Date().toISOString()
    };
  }

  /**
   * Call LLM with organization context
   */
  protected async callLLM(prompt: string, options?: GenerationOptions): Promise<string> {
    const contextualPrompt = this.addOrganizationContext(prompt);
    const response = await this.llmClient.generateResponse(contextualPrompt, options);
    return response.content;
  }

  /**
   * Add organization context to prompts
   */
  protected addOrganizationContext(prompt: string): string {
    return `
Organization Context:
- Name: ${this.organizationContext.name}
- Domain: ${this.organizationContext.domain}
- Type: ${this.organizationContext.type}
- Governance Model: ${this.organizationContext.governanceModel}

${prompt}
    `.trim();
  }

  /**
   * Log activity for audit purposes
   */
  protected async logActivity(activity: AgentActivity): Promise<void> {
    await this.auditLogger.log({
      agent: this.name,
      organization: this.organizationContext.name,
      activity,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Validate request against organization policies
   */
  protected async validateRequest(request: AgentRequest): Promise<boolean> {
    // Add your organization's validation logic
    return true;
  }

  /**
   * Apply organization-specific data processing
   */
  protected async processData(data: any): Promise<any> {
    // Add your organization's data processing logic
    return data;
  }
}

// =====================================
// Example Implementation
// =====================================

/**
 * Example: Compliance Agent
 * 
 * This example shows how to create a compliance agent
 * for your organization's specific needs.
 */
export class ComplianceAgent extends CustomAgentTemplate {
  name = 'compliance-agent';
  capabilities = ['compliance-check', 'risk-assessment', 'policy-analysis'];

  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Validate request
      const isValid = await this.validateRequest(request);
      if (!isValid) {
        return {
          content: 'Request validation failed',
          confidence: 0,
          error: 'Invalid request'
        };
      }

      // Process the request
      const result = await this.processComplianceRequest(request);
      
      // Log activity
      await this.logActivity({
        type: 'compliance-check',
        input: request.content,
        output: result.content,
        confidence: result.confidence
      });

      return result;
    } catch (error) {
      this.logger.error('Compliance agent error:', error);
      return {
        content: 'Error processing compliance request',
        confidence: 0,
        error: error.message
      };
    }
  }

  private async processComplianceRequest(request: AgentRequest): Promise<AgentResponse> {
    const prompt = `
      Analyze the following request for compliance with our organization's policies:
      
      Request: ${request.content}
      
      Please provide:
      1. Compliance status (compliant/non-compliant/requires-review)
      2. Risk level (low/medium/high)
      3. Specific policy violations (if any)
      4. Recommendations for compliance
    `;

    const response = await this.callLLM(prompt, {
      maxTokens: 1000,
      temperature: 0.2
    });

    return {
      content: response,
      confidence: 0.9,
      metadata: {
        agent: this.name,
        organization: this.organizationContext.name,
        complianceChecked: true
      }
    };
  }
}

// =====================================
// Types and Interfaces
// =====================================

export interface OrganizationContext {
  name: string;
  domain: string;
  type: 'dao' | 'corporation' | 'community' | 'government';
  governanceModel: string;
  policies: Policy[];
  integrations: Integration[];
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  rules: Rule[];
}

export interface Rule {
  id: string;
  condition: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Integration {
  name: string;
  type: string;
  config: any;
  enabled: boolean;
}

export interface AgentStatus {
  name: string;
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  organization: string;
  lastActivity: string;
}

export interface AgentActivity {
  type: string;
  input: any;
  output: any;
  confidence: number;
  timestamp?: string;
}

export interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

// =====================================
// Utility Classes
// =====================================

class Logger {
  constructor(private context: string) {}

  info(message: string, ...args: any[]): void {
    console.log(`[${this.context}] INFO: ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`[${this.context}] ERROR: ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.context}] WARN: ${message}`, ...args);
  }
}

class AuditLogger {
  async log(activity: any): Promise<void> {
    // Implement your audit logging logic
    console.log('AUDIT:', activity);
  }
}

// =====================================
// Export for use in other files
// =====================================

export const auditLogger = new AuditLogger();
