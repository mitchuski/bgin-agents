// =====================================
// backend/src/agents/collaboration/documentation-workflow.ts
// =====================================

import { EventEmitter } from 'events';
import { enhancedRAGEngine } from '../archive/enhanced-rag-engine';
import { policyAnalyzer } from '../codex/policy-analyzer';
import { documentationAdvisor, DocumentationPlan, DocumentationQualityMetrics } from '../archive/documentation-advisor';
import { logger } from '../../utils/logger';
import { database } from '../../utils/database';

export interface DocumentationWorkflow {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'review' | 'approved' | 'published';
  participants: {
    archiveAgent: boolean;
    codexAgent: boolean;
    discourseAgent: boolean;
  };
  phases: DocumentationPhase[];
  currentPhase: number;
  metadata: {
    created: Date;
    updated: Date;
    createdBy: string;
    sessionId: string;
    domain: string;
    targetAudience: string[];
  };
}

export interface DocumentationPhase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  responsibleAgent: 'archive' | 'codex' | 'discourse' | 'collaborative';
  tasks: DocumentationTask[];
  deliverables: string[];
  qualityGates: QualityGate[];
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  dependencies: string[];
}

export interface DocumentationTask {
  id: string;
  title: string;
  description: string;
  type: 'research' | 'analysis' | 'writing' | 'review' | 'validation';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'failed';
  assignedAgent: 'archive' | 'codex' | 'discourse';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedEffort: number; // in minutes
  actualEffort?: number;
  deliverables: string[];
  dependencies: string[];
  metadata: {
    created: Date;
    updated: Date;
    dueDate?: Date;
    completedAt?: Date;
  };
}

export interface QualityGate {
  id: string;
  name: string;
  description: string;
  criteria: {
    metric: string;
    threshold: number;
    operator: '>=' | '<=' | '==' | '!=' | '>' | '<';
  }[];
  status: 'pending' | 'passed' | 'failed';
  evaluatedAt?: Date;
  evaluatedBy?: string;
  notes?: string;
}

export interface CollaborationResult {
  workflowId: string;
  phaseId: string;
  taskId: string;
  agentType: 'archive' | 'codex' | 'discourse';
  result: any;
  quality: DocumentationQualityMetrics;
  recommendations: string[];
  metadata: {
    timestamp: Date;
    processingTime: number;
    confidence: number;
  };
}

export class DocumentationWorkflowManager extends EventEmitter {
  private workflows: Map<string, DocumentationWorkflow> = new Map();
  private activeTasks: Map<string, DocumentationTask> = new Map();

  constructor() {
    super();
    this.initializeEventHandlers();
  }

  /**
   * Create a new documentation workflow using OpenDocs methodology
   */
  async createWorkflow(
    title: string,
    description: string,
    context: {
      sessionId: string;
      domain: string;
      targetAudience: string[];
      createdBy: string;
    },
    options?: {
      includeArchiveAgent?: boolean;
      includeCodexAgent?: boolean;
      includeDiscourseAgent?: boolean;
      phases?: string[];
    }
  ): Promise<DocumentationWorkflow> {
    try {
      logger.info(`Creating documentation workflow: ${title}`);

      const workflowId = `workflow_${Date.now()}`;
      
      // Create phases based on OpenDocs methodology
      const phases = await this.createDocumentationPhases(
        title,
        context,
        options?.phases || ['research', 'analysis', 'writing', 'review', 'validation']
      );

      const workflow: DocumentationWorkflow = {
        id: workflowId,
        title,
        description,
        status: 'draft',
        participants: {
          archiveAgent: options?.includeArchiveAgent !== false,
          codexAgent: options?.includeCodexAgent !== false,
          discourseAgent: options?.includeDiscourseAgent !== false
        },
        phases,
        currentPhase: 0,
        metadata: {
          created: new Date(),
          updated: new Date(),
          createdBy: context.createdBy,
          sessionId: context.sessionId,
          domain: context.domain,
          targetAudience: context.targetAudience
        }
      };

      // Store workflow
      this.workflows.set(workflowId, workflow);
      await this.storeWorkflow(workflow);

      // Initialize first phase
      await this.initializePhase(workflowId, 0);

      logger.info(`Documentation workflow created: ${workflowId}`);
      return workflow;

    } catch (error) {
      logger.error('Documentation workflow creation failed:', error);
      throw error;
    }
  }

  /**
   * Execute a documentation workflow phase
   */
  async executePhase(
    workflowId: string,
    phaseIndex: number,
    context: { sessionId: string; domain: string }
  ): Promise<CollaborationResult[]> {
    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      const phase = workflow.phases[phaseIndex];
      if (!phase) {
        throw new Error(`Phase ${phaseIndex} not found in workflow ${workflowId}`);
      }

      logger.info(`Executing phase ${phase.name} for workflow ${workflowId}`);

      phase.status = 'in_progress';
      const startTime = Date.now();

      const results: CollaborationResult[] = [];

      // Execute tasks in parallel where possible
      for (const task of phase.tasks) {
        if (task.status === 'pending') {
          try {
            const result = await this.executeTask(workflowId, phaseIndex, task.id, context);
            results.push(result);
          } catch (error) {
            logger.error(`Task ${task.id} execution failed:`, error);
            task.status = 'failed';
          }
        }
      }

      // Check quality gates
      const qualityGatesPassed = await this.evaluateQualityGates(phase, results);
      
      if (qualityGatesPassed) {
        phase.status = 'completed';
        phase.actualDuration = Date.now() - startTime;
        
        // Move to next phase if available
        if (phaseIndex < workflow.phases.length - 1) {
          await this.initializePhase(workflowId, phaseIndex + 1);
        } else {
          workflow.status = 'review';
        }
      } else {
        phase.status = 'failed';
      }

      workflow.currentPhase = phaseIndex;
      workflow.metadata.updated = new Date();

      // Update workflow
      this.workflows.set(workflowId, workflow);
      await this.updateWorkflow(workflow);

      logger.info(`Phase ${phase.name} completed for workflow ${workflowId}`);
      return results;

    } catch (error) {
      logger.error(`Phase execution failed for workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Execute a specific task within a phase
   */
  async executeTask(
    workflowId: string,
    phaseIndex: number,
    taskId: string,
    context: { sessionId: string; domain: string }
  ): Promise<CollaborationResult> {
    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      const phase = workflow.phases[phaseIndex];
      const task = phase.tasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error(`Task ${taskId} not found in phase ${phaseIndex}`);
      }

      logger.info(`Executing task ${task.title} (${task.assignedAgent})`);

      task.status = 'in_progress';
      const startTime = Date.now();

      let result: any;
      let quality: DocumentationQualityMetrics;
      let recommendations: string[] = [];

      // Execute task based on assigned agent
      switch (task.assignedAgent) {
        case 'archive':
          result = await this.executeArchiveTask(task, context);
          break;
        case 'codex':
          result = await this.executeCodexTask(task, context);
          break;
        case 'discourse':
          result = await this.executeDiscourseTask(task, context);
          break;
        default:
          throw new Error(`Unknown agent type: ${task.assignedAgent}`);
      }

      // Analyze result quality
      quality = await this.analyzeResultQuality(result, context);
      
      // Generate recommendations
      recommendations = await this.generateTaskRecommendations(task, result, quality);

      task.status = 'completed';
      task.actualEffort = Date.now() - startTime;
      task.metadata.completedAt = new Date();

      const collaborationResult: CollaborationResult = {
        workflowId,
        phaseId: phase.id,
        taskId: task.id,
        agentType: task.assignedAgent,
        result,
        quality,
        recommendations,
        metadata: {
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
          confidence: quality.overallScore
        }
      };

      // Store result
      await this.storeCollaborationResult(collaborationResult);

      logger.info(`Task ${task.title} completed successfully`);
      return collaborationResult;

    } catch (error) {
      logger.error(`Task execution failed: ${taskId}`, error);
      throw error;
    }
  }

  /**
   * Execute Archive Agent task
   */
  private async executeArchiveTask(
    task: DocumentationTask,
    context: { sessionId: string; domain: string }
  ): Promise<any> {
    switch (task.type) {
      case 'research':
        return await enhancedRAGEngine.generateDocumentation(
          task.title,
          {
            sessionId: context.sessionId,
            domain: context.domain,
            targetAudience: ['researchers', 'policymakers', 'developers']
          },
          {
            includeQualityAnalysis: true,
            generateRecommendations: true,
            validateAgainstStandards: true
          }
        );

      case 'analysis':
        return await enhancedRAGEngine.generateDocumentationAnalytics(
          context.sessionId
        );

      default:
        throw new Error(`Unsupported Archive Agent task type: ${task.type}`);
    }
  }

  /**
   * Execute Codex Agent task
   */
  private async executeCodexTask(
    task: DocumentationTask,
    context: { sessionId: string; domain: string }
  ): Promise<any> {
    // Get frameworks for both analysis and writing tasks
    const frameworks = policyAnalyzer.getAllFrameworks();
    if (frameworks.length === 0) {
      throw new Error('No frameworks available for analysis');
    }

    switch (task.type) {
      case 'analysis':
        const framework = frameworks[0];
        return await policyAnalyzer.analyzePolicyFramework(
          framework,
          { sessionId: context.sessionId, privacyLevel: 'selective' }
        );

      case 'writing':
        return await policyAnalyzer.generatePolicyDocumentation(
          frameworks[0],
          {
            sessionId: context.sessionId,
            domain: context.domain,
            targetAudience: ['policymakers', 'regulators', 'industry']
          },
          {
            includeQualityAnalysis: true,
            generateRecommendations: true,
            validateAgainstStandards: true
          }
        );

      default:
        throw new Error(`Unsupported Codex Agent task type: ${task.type}`);
    }
  }

  /**
   * Execute Discourse Agent task
   */
  private async executeDiscourseTask(
    task: DocumentationTask,
    context: { sessionId: string; domain: string }
  ): Promise<any> {
    // Placeholder for Discourse Agent tasks
    // In a full implementation, this would integrate with the Discourse Agent
    return {
      taskId: task.id,
      type: task.type,
      status: 'completed',
      result: `Discourse Agent completed ${task.title}`,
      timestamp: new Date()
    };
  }

  /**
   * Create documentation phases using OpenDocs methodology
   */
  private async createDocumentationPhases(
    title: string,
    context: { sessionId: string; domain: string; targetAudience: string[] },
    phaseNames: string[]
  ): Promise<DocumentationPhase[]> {
    const phases: DocumentationPhase[] = [];

    for (let i = 0; i < phaseNames.length; i++) {
      const phaseName = phaseNames[i];
      const phaseId = `phase_${i}_${phaseName}`;

      const phase: DocumentationPhase = {
        id: phaseId,
        name: phaseName,
        description: this.getPhaseDescription(phaseName),
        status: 'pending',
        responsibleAgent: this.getResponsibleAgent(phaseName),
        tasks: await this.createPhaseTasks(phaseName, context),
        deliverables: this.getPhaseDeliverables(phaseName),
        qualityGates: this.createQualityGates(phaseName),
        estimatedDuration: this.getPhaseDuration(phaseName),
        dependencies: i > 0 ? [phaseNames[i - 1]] : []
      };

      phases.push(phase);
    }

    return phases;
  }

  /**
   * Create tasks for a phase
   */
  private async createPhaseTasks(
    phaseName: string,
    context: { sessionId: string; domain: string; targetAudience: string[] }
  ): Promise<DocumentationTask[]> {
    const tasks: DocumentationTask[] = [];

    switch (phaseName) {
      case 'research':
        tasks.push(
          this.createTask('research_1', 'Gather relevant documents', 'research', 'archive', 'high'),
          this.createTask('research_2', 'Analyze existing knowledge', 'analysis', 'archive', 'high'),
          this.createTask('research_3', 'Identify knowledge gaps', 'analysis', 'archive', 'medium')
        );
        break;

      case 'analysis':
        tasks.push(
          this.createTask('analysis_1', 'Policy framework analysis', 'analysis', 'codex', 'high'),
          this.createTask('analysis_2', 'Stakeholder impact assessment', 'analysis', 'codex', 'medium'),
          this.createTask('analysis_3', 'Compliance evaluation', 'analysis', 'codex', 'high')
        );
        break;

      case 'writing':
        tasks.push(
          this.createTask('writing_1', 'Generate documentation content', 'writing', 'archive', 'high'),
          this.createTask('writing_2', 'Create policy documentation', 'writing', 'codex', 'high'),
          this.createTask('writing_3', 'Format and structure content', 'writing', 'archive', 'medium')
        );
        break;

      case 'review':
        tasks.push(
          this.createTask('review_1', 'Quality assessment', 'review', 'archive', 'high'),
          this.createTask('review_2', 'Policy compliance review', 'review', 'codex', 'high'),
          this.createTask('review_3', 'Community feedback integration', 'review', 'discourse', 'medium')
        );
        break;

      case 'validation':
        tasks.push(
          this.createTask('validation_1', 'Standards compliance check', 'validation', 'codex', 'high'),
          this.createTask('validation_2', 'Accessibility validation', 'validation', 'archive', 'medium'),
          this.createTask('validation_3', 'Final quality gate', 'validation', 'archive', 'critical')
        );
        break;
    }

    return tasks;
  }

  /**
   * Create a task
   */
  private createTask(
    id: string,
    title: string,
    type: DocumentationTask['type'],
    assignedAgent: DocumentationTask['assignedAgent'],
    priority: DocumentationTask['priority']
  ): DocumentationTask {
    return {
      id,
      title,
      description: `Execute ${title}`,
      type,
      status: 'pending',
      assignedAgent,
      priority,
      estimatedEffort: this.getTaskEffort(type),
      deliverables: [`${title} completion`],
      dependencies: [],
      metadata: {
        created: new Date(),
        updated: new Date()
      }
    };
  }

  /**
   * Get phase description
   */
  private getPhaseDescription(phaseName: string): string {
    const descriptions: { [key: string]: string } = {
      research: 'Gather and analyze existing knowledge and documentation',
      analysis: 'Analyze policies, frameworks, and stakeholder impacts',
      writing: 'Generate comprehensive documentation content',
      review: 'Review and assess quality of generated content',
      validation: 'Validate compliance with standards and requirements'
    };
    return descriptions[phaseName] || 'Documentation phase';
  }

  /**
   * Get responsible agent for phase
   */
  private getResponsibleAgent(phaseName: string): DocumentationPhase['responsibleAgent'] {
    const agents: { [key: string]: DocumentationPhase['responsibleAgent'] } = {
      research: 'archive',
      analysis: 'codex',
      writing: 'collaborative',
      review: 'collaborative',
      validation: 'collaborative'
    };
    return agents[phaseName] || 'collaborative';
  }

  /**
   * Get phase deliverables
   */
  private getPhaseDeliverables(phaseName: string): string[] {
    const deliverables: { [key: string]: string[] } = {
      research: ['Research report', 'Knowledge gaps analysis', 'Source documentation'],
      analysis: ['Policy analysis', 'Stakeholder impact report', 'Compliance assessment'],
      writing: ['Draft documentation', 'Policy documents', 'Structured content'],
      review: ['Quality assessment', 'Review comments', 'Improvement recommendations'],
      validation: ['Validation report', 'Compliance certificate', 'Final documentation']
    };
    return deliverables[phaseName] || [];
  }

  /**
   * Create quality gates for phase
   */
  private createQualityGates(phaseName: string): QualityGate[] {
    const gates: QualityGate[] = [];

    // Common quality gates
    gates.push({
      id: `gate_${phaseName}_completeness`,
      name: 'Completeness Check',
      description: 'Ensure all required content is present',
      criteria: [{
        metric: 'completeness',
        threshold: 0.8,
        operator: '>='
      }],
      status: 'pending'
    });

    gates.push({
      id: `gate_${phaseName}_quality`,
      name: 'Quality Check',
      description: 'Ensure content meets quality standards',
      criteria: [{
        metric: 'overallScore',
        threshold: 0.7,
        operator: '>='
      }],
      status: 'pending'
    });

    return gates;
  }

  /**
   * Get phase duration in minutes
   */
  private getPhaseDuration(phaseName: string): number {
    const durations: { [key: string]: number } = {
      research: 60,
      analysis: 90,
      writing: 120,
      review: 45,
      validation: 30
    };
    return durations[phaseName] || 60;
  }

  /**
   * Get task effort in minutes
   */
  private getTaskEffort(taskType: string): number {
    const efforts: { [key: string]: number } = {
      research: 30,
      analysis: 45,
      writing: 60,
      review: 20,
      validation: 15
    };
    return efforts[taskType] || 30;
  }

  /**
   * Initialize a phase
   */
  private async initializePhase(workflowId: string, phaseIndex: number): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    const phase = workflow.phases[phaseIndex];
    if (!phase) return;

    phase.status = 'pending';
    
    // Initialize tasks
    for (const task of phase.tasks) {
      task.status = 'pending';
      this.activeTasks.set(task.id, task);
    }

    logger.info(`Phase ${phase.name} initialized for workflow ${workflowId}`);
  }

  /**
   * Evaluate quality gates
   */
  private async evaluateQualityGates(
    phase: DocumentationPhase,
    results: CollaborationResult[]
  ): Promise<boolean> {
    for (const gate of phase.qualityGates) {
      const passed = await this.evaluateQualityGate(gate, results);
      gate.status = passed ? 'passed' : 'failed';
      gate.evaluatedAt = new Date();
      
      if (!passed) {
        logger.warn(`Quality gate ${gate.name} failed for phase ${phase.name}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate a single quality gate
   */
  private async evaluateQualityGate(
    gate: QualityGate,
    results: CollaborationResult[]
  ): Promise<boolean> {
    for (const criterion of gate.criteria) {
      const value = this.getMetricValue(criterion.metric, results);
      const threshold = criterion.threshold;
      
      let passed = false;
      switch (criterion.operator) {
        case '>=':
          passed = value >= threshold;
          break;
        case '<=':
          passed = value <= threshold;
          break;
        case '==':
          passed = value === threshold;
          break;
        case '!=':
          passed = value !== threshold;
          break;
        case '>':
          passed = value > threshold;
          break;
        case '<':
          passed = value < threshold;
          break;
      }

      if (!passed) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get metric value from results
   */
  private getMetricValue(metric: string, results: CollaborationResult[]): number {
    if (results.length === 0) return 0;

    const values = results.map(r => {
      switch (metric) {
        case 'completeness':
          return r.quality.completeness;
        case 'clarity':
          return r.quality.clarity;
        case 'accuracy':
          return r.quality.accuracy;
        case 'structure':
          return r.quality.structure;
        case 'accessibility':
          return r.quality.accessibility;
        case 'overallScore':
          return r.quality.overallScore;
        default:
          return 0;
      }
    });

    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Analyze result quality
   */
  private async analyzeResultQuality(
    result: any,
    context: { sessionId: string; domain: string }
  ): Promise<DocumentationQualityMetrics> {
    // Simplified quality analysis
    // In production, this would use the documentation advisor
    return {
      completeness: 0.8,
      clarity: 0.7,
      accuracy: 0.9,
      structure: 0.8,
      accessibility: 0.7,
      overallScore: 0.78
    };
  }

  /**
   * Generate task recommendations
   */
  private async generateTaskRecommendations(
    task: DocumentationTask,
    result: any,
    quality: DocumentationQualityMetrics
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (quality.overallScore < 0.7) {
      recommendations.push('Consider improving content quality');
    }

    if (quality.completeness < 0.8) {
      recommendations.push('Add more comprehensive content');
    }

    if (quality.clarity < 0.7) {
      recommendations.push('Improve content clarity and readability');
    }

    return recommendations;
  }

  /**
   * Initialize event handlers
   */
  private initializeEventHandlers(): void {
    this.on('workflowCreated', (workflow) => {
      logger.info(`Workflow created: ${workflow.id}`);
    });

    this.on('phaseCompleted', (workflowId, phaseIndex) => {
      logger.info(`Phase ${phaseIndex} completed for workflow ${workflowId}`);
    });

    this.on('taskCompleted', (workflowId, taskId) => {
      logger.info(`Task ${taskId} completed for workflow ${workflowId}`);
    });
  }

  /**
   * Store workflow in database
   */
  private async storeWorkflow(workflow: DocumentationWorkflow): Promise<void> {
    try {
      await database.query(`
        INSERT INTO documentation_workflows (
          id, title, description, status, participants, phases, 
          current_phase, metadata, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `, [
        workflow.id,
        workflow.title,
        workflow.description,
        workflow.status,
        JSON.stringify(workflow.participants),
        JSON.stringify(workflow.phases),
        workflow.currentPhase,
        JSON.stringify(workflow.metadata)
      ]);

    } catch (error) {
      logger.error('Failed to store workflow:', error);
    }
  }

  /**
   * Update workflow in database
   */
  private async updateWorkflow(workflow: DocumentationWorkflow): Promise<void> {
    try {
      await database.query(`
        UPDATE documentation_workflows SET
          status = $2, phases = $3, current_phase = $4, 
          metadata = $5, updated_at = NOW()
        WHERE id = $1
      `, [
        workflow.id,
        workflow.status,
        JSON.stringify(workflow.phases),
        workflow.currentPhase,
        JSON.stringify(workflow.metadata)
      ]);

    } catch (error) {
      logger.error('Failed to update workflow:', error);
    }
  }

  /**
   * Store collaboration result in database
   */
  private async storeCollaborationResult(result: CollaborationResult): Promise<void> {
    try {
      await database.query(`
        INSERT INTO collaboration_results (
          workflow_id, phase_id, task_id, agent_type, result_data,
          quality_metrics, recommendations, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        result.workflowId,
        result.phaseId,
        result.taskId,
        result.agentType,
        JSON.stringify(result.result),
        JSON.stringify(result.quality),
        JSON.stringify(result.recommendations),
        JSON.stringify(result.metadata)
      ]);

    } catch (error) {
      logger.error('Failed to store collaboration result:', error);
    }
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(id: string): DocumentationWorkflow | undefined {
    return this.workflows.get(id);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): DocumentationWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const checks = await Promise.all([
        enhancedRAGEngine.healthCheck(),
        policyAnalyzer.healthCheck()
      ]);

      return checks.every(check => check === true);

    } catch (error) {
      logger.error('Documentation workflow manager health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const documentationWorkflowManager = new DocumentationWorkflowManager();
