// =====================================
// backend/src/agents/collaboration/documentation-versioning.ts
// =====================================

import { EventEmitter } from 'events';
import { documentationAdvisor, DocumentationQualityMetrics } from '../archive/documentation-advisor';
import { logger } from '../../utils/logger';
import { database } from '../../utils/database';
import { v4 as uuidv4 } from 'uuid';

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  content: string;
  title: string;
  description: string;
  author: string;
  authorType: 'archive' | 'codex' | 'discourse' | 'human';
  changes: DocumentChange[];
  qualityMetrics: DocumentationQualityMetrics;
  metadata: {
    created: Date;
    createdBy: string;
    sessionId: string;
    domain: string;
    tags: string[];
    status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
    parentVersion?: string;
    branchName?: string;
  };
  diff?: DocumentDiff;
}

export interface DocumentChange {
  id: string;
  type: 'addition' | 'deletion' | 'modification' | 'reorganization';
  section: string;
  oldContent?: string;
  newContent?: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  author: string;
  timestamp: Date;
  metadata: {
    lineNumber?: number;
    wordCount?: number;
    characterCount?: number;
    qualityImpact?: number;
  };
}

export interface DocumentDiff {
  additions: number;
  deletions: number;
  modifications: number;
  sectionsChanged: string[];
  qualityChange: {
    before: DocumentationQualityMetrics;
    after: DocumentationQualityMetrics;
    improvement: number;
  };
  summary: string;
}

export interface VersionBranch {
  id: string;
  name: string;
  description: string;
  baseVersion: string;
  currentVersion: string;
  status: 'active' | 'merged' | 'abandoned';
  created: Date;
  createdBy: string;
  metadata: {
    sessionId: string;
    domain: string;
    purpose: string;
    targetAudience: string[];
  };
}

export interface VersionComparison {
  version1: DocumentVersion;
  version2: DocumentVersion;
  diff: DocumentDiff;
  recommendations: string[];
  conflicts: VersionConflict[];
  mergeStrategy?: 'auto' | 'manual' | 'hybrid';
}

export interface VersionConflict {
  id: string;
  type: 'content' | 'structure' | 'metadata' | 'quality';
  section: string;
  description: string;
  version1Value: any;
  version2Value: any;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export class DocumentationVersioningManager extends EventEmitter {
  private versions: Map<string, DocumentVersion> = new Map();
  private branches: Map<string, VersionBranch> = new Map();
  private documentVersions: Map<string, DocumentVersion[]> = new Map();

  constructor() {
    super();
    this.initializeEventHandlers();
  }

  /**
   * Create a new version of a document using OpenDocs methodology
   */
  async createVersion(
    documentId: string,
    content: string,
    context: {
      title: string;
      description: string;
      author: string;
      authorType: 'archive' | 'codex' | 'discourse' | 'human';
      sessionId: string;
      domain: string;
      changes: DocumentChange[];
    },
    options?: {
      parentVersion?: string;
      branchName?: string;
      tags?: string[];
      status?: 'draft' | 'review' | 'approved' | 'published';
    }
  ): Promise<DocumentVersion> {
    try {
      logger.info(`Creating new version for document: ${documentId}`);

      // Get current version to calculate diff
      const currentVersion = this.getLatestVersion(documentId);
      const versionNumber = this.calculateNextVersion(currentVersion?.version);

      // Analyze content quality
      const qualityMetrics = await this.analyzeContentQuality(content, context);

      // Calculate diff if parent version exists
      let diff: DocumentDiff | undefined;
      if (currentVersion) {
        diff = await this.calculateDiff(currentVersion, content, context.changes);
      }

      const version: DocumentVersion = {
        id: uuidv4(),
        documentId,
        version: versionNumber,
        content,
        title: context.title,
        description: context.description,
        author: context.author,
        authorType: context.authorType,
        changes: context.changes,
        qualityMetrics,
        metadata: {
          created: new Date(),
          createdBy: context.author,
          sessionId: context.sessionId,
          domain: context.domain,
          tags: options?.tags || [],
          status: options?.status || 'draft',
          parentVersion: options?.parentVersion,
          branchName: options?.branchName
        },
        diff
      };

      // Store version
      this.versions.set(version.id, version);
      
      // Update document versions list
      if (!this.documentVersions.has(documentId)) {
        this.documentVersions.set(documentId, []);
      }
      this.documentVersions.get(documentId)!.push(version);

      // Store in database
      await this.storeVersion(version);

      // Emit event
      this.emit('versionCreated', version);

      logger.info(`Version ${versionNumber} created for document ${documentId}`);
      return version;

    } catch (error) {
      logger.error('Version creation failed:', error);
      throw error;
    }
  }

  /**
   * Create a new branch for parallel development
   */
  async createBranch(
    documentId: string,
    baseVersion: string,
    context: {
      name: string;
      description: string;
      purpose: string;
      createdBy: string;
      sessionId: string;
      domain: string;
      targetAudience: string[];
    }
  ): Promise<VersionBranch> {
    try {
      logger.info(`Creating branch ${context.name} for document ${documentId}`);

      const branch: VersionBranch = {
        id: uuidv4(),
        name: context.name,
        description: context.description,
        baseVersion,
        currentVersion: baseVersion,
        status: 'active',
        created: new Date(),
        createdBy: context.createdBy,
        metadata: {
          sessionId: context.sessionId,
          domain: context.domain,
          purpose: context.purpose,
          targetAudience: context.targetAudience
        }
      };

      this.branches.set(branch.id, branch);
      await this.storeBranch(branch);

      this.emit('branchCreated', branch);
      logger.info(`Branch ${context.name} created for document ${documentId}`);
      return branch;

    } catch (error) {
      logger.error('Branch creation failed:', error);
      throw error;
    }
  }

  /**
   * Compare two versions of a document
   */
  async compareVersions(
    version1Id: string,
    version2Id: string
  ): Promise<VersionComparison> {
    try {
      logger.info(`Comparing versions ${version1Id} and ${version2Id}`);

      const version1 = this.versions.get(version1Id);
      const version2 = this.versions.get(version2Id);

      if (!version1 || !version2) {
        throw new Error('One or both versions not found');
      }

      // Calculate diff
      const diff = await this.calculateDiff(version1, version2.content, version2.changes);

      // Identify conflicts
      const conflicts = await this.identifyConflicts(version1, version2);

      // Generate recommendations
      const recommendations = await this.generateComparisonRecommendations(version1, version2, diff);

      // Determine merge strategy
      const mergeStrategy = this.determineMergeStrategy(conflicts, diff);

      const comparison: VersionComparison = {
        version1,
        version2,
        diff,
        recommendations,
        conflicts,
        mergeStrategy
      };

      logger.info(`Version comparison completed`);
      return comparison;

    } catch (error) {
      logger.error('Version comparison failed:', error);
      throw error;
    }
  }

  /**
   * Merge two versions using OpenDocs methodology
   */
  async mergeVersions(
    sourceVersionId: string,
    targetVersionId: string,
    context: {
      mergedBy: string;
      strategy: 'auto' | 'manual' | 'hybrid';
      resolution?: { [conflictId: string]: string };
    }
  ): Promise<DocumentVersion> {
    try {
      logger.info(`Merging versions ${sourceVersionId} and ${targetVersionId}`);

      const sourceVersion = this.versions.get(sourceVersionId);
      const targetVersion = this.versions.get(targetVersionId);

      if (!sourceVersion || !targetVersion) {
        throw new Error('One or both versions not found');
      }

      // Get comparison to identify conflicts
      const comparison = await this.compareVersions(sourceVersionId, targetVersionId);

      // Merge content based on strategy
      let mergedContent: string;
      let mergedChanges: DocumentChange[];

      switch (context.strategy) {
        case 'auto':
          ({ content: mergedContent, changes: mergedChanges } = await this.autoMerge(
            sourceVersion, targetVersion, comparison
          ));
          break;
        case 'manual':
          ({ content: mergedContent, changes: mergedChanges } = await this.manualMerge(
            sourceVersion, targetVersion, comparison, context.resolution
          ));
          break;
        case 'hybrid':
          ({ content: mergedContent, changes: mergedChanges } = await this.hybridMerge(
            sourceVersion, targetVersion, comparison, context.resolution
          ));
          break;
        default:
          throw new Error(`Unknown merge strategy: ${context.strategy}`);
      }

      // Create merged version
      const mergedVersion = await this.createVersion(
        sourceVersion.documentId,
        mergedContent,
        {
          title: `${sourceVersion.title} (Merged)`,
          description: `Merged from ${sourceVersion.version} and ${targetVersion.version}`,
          author: context.mergedBy,
          authorType: 'human',
          sessionId: sourceVersion.metadata.sessionId,
          domain: sourceVersion.metadata.domain,
          changes: mergedChanges
        },
        {
          parentVersion: sourceVersion.id,
          status: 'draft',
          tags: [...sourceVersion.metadata.tags, 'merged']
        }
      );

      // Resolve conflicts
      await this.resolveConflicts(comparison.conflicts, context.resolution, context.mergedBy);

      this.emit('versionsMerged', mergedVersion, sourceVersion, targetVersion);
      logger.info(`Versions merged successfully: ${mergedVersion.id}`);
      return mergedVersion;

    } catch (error) {
      logger.error('Version merge failed:', error);
      throw error;
    }
  }

  /**
   * Get version history for a document
   */
  getVersionHistory(documentId: string): DocumentVersion[] {
    const versions = this.documentVersions.get(documentId) || [];
    return versions.sort((a, b) => new Date(b.metadata.created).getTime() - new Date(a.metadata.created).getTime());
  }

  /**
   * Get branches for a document
   */
  getDocumentBranches(documentId: string): VersionBranch[] {
    return Array.from(this.branches.values()).filter(branch => 
      branch.metadata.sessionId === documentId
    );
  }

  /**
   * Analyze content quality using OpenDocs methodology
   */
  private async analyzeContentQuality(
    content: string,
    context: { sessionId: string; domain: string }
  ): Promise<DocumentationQualityMetrics> {
    try {
      const mockDocument = {
        id: 'temp-version-doc',
        title: 'Version Content',
        content,
        metadata: {
          sessionId: context.sessionId,
          privacyLevel: 'selective' as const,
          documentType: 'versioned_document'
        },
        chunks: [],
        summary: '',
        keywords: [],
        entities: [],
        qualityScore: 0,
        processingStatus: 'completed' as const
      };

      return await documentationAdvisor.analyzeDocumentationQuality(
        mockDocument,
        { sessionId: context.sessionId, domain: context.domain }
      );

    } catch (error) {
      logger.error('Content quality analysis failed:', error);
      return {
        completeness: 0.5,
        clarity: 0.5,
        accuracy: 0.5,
        structure: 0.5,
        accessibility: 0.5,
        overallScore: 0.5
      };
    }
  }

  /**
   * Calculate diff between versions
   */
  private async calculateDiff(
    oldVersion: DocumentVersion,
    newContent: string,
    changes: DocumentChange[]
  ): Promise<DocumentDiff> {
    try {
      // Simple diff calculation - in production, use a proper diff library
      const oldContent = oldVersion.content;
      const oldLines = oldContent.split('\n');
      const newLines = newContent.split('\n');

      let additions = 0;
      let deletions = 0;
      let modifications = 0;
      const sectionsChanged: string[] = [];

      // Calculate basic metrics
      const maxLines = Math.max(oldLines.length, newLines.length);
      for (let i = 0; i < maxLines; i++) {
        const oldLine = oldLines[i] || '';
        const newLine = newLines[i] || '';

        if (i >= oldLines.length) {
          additions++;
        } else if (i >= newLines.length) {
          deletions++;
        } else if (oldLine !== newLine) {
          modifications++;
        }
      }

      // Analyze quality change
      const qualityChange = {
        before: oldVersion.qualityMetrics,
        after: await this.analyzeContentQuality(newContent, {
          sessionId: oldVersion.metadata.sessionId,
          domain: oldVersion.metadata.domain
        }),
        improvement: 0
      };

      qualityChange.improvement = qualityChange.after.overallScore - qualityChange.before.overallScore;

      // Generate summary
      const summary = this.generateDiffSummary(additions, deletions, modifications, qualityChange);

      return {
        additions,
        deletions,
        modifications,
        sectionsChanged,
        qualityChange,
        summary
      };

    } catch (error) {
      logger.error('Diff calculation failed:', error);
      return {
        additions: 0,
        deletions: 0,
        modifications: 0,
        sectionsChanged: [],
        qualityChange: {
          before: oldVersion.qualityMetrics,
          after: oldVersion.qualityMetrics,
          improvement: 0
        },
        summary: 'Diff calculation failed'
      };
    }
  }

  /**
   * Identify conflicts between versions
   */
  private async identifyConflicts(
    version1: DocumentVersion,
    version2: DocumentVersion
  ): Promise<VersionConflict[]> {
    const conflicts: VersionConflict[] = [];

    // Check for content conflicts
    if (version1.title !== version2.title) {
      conflicts.push({
        id: uuidv4(),
        type: 'content',
        section: 'title',
        description: 'Document titles differ',
        version1Value: version1.title,
        version2Value: version2.title
      });
    }

    // Check for metadata conflicts
    if (version1.metadata.status !== version2.metadata.status) {
      conflicts.push({
        id: uuidv4(),
        type: 'metadata',
        section: 'status',
        description: 'Document status differs',
        version1Value: version1.metadata.status,
        version2Value: version2.metadata.status
      });
    }

    // Check for quality conflicts
    const qualityDiff = Math.abs(version1.qualityMetrics.overallScore - version2.qualityMetrics.overallScore);
    if (qualityDiff > 0.2) {
      conflicts.push({
        id: uuidv4(),
        type: 'quality',
        section: 'overall',
        description: 'Significant quality difference',
        version1Value: version1.qualityMetrics.overallScore,
        version2Value: version2.qualityMetrics.overallScore
      });
    }

    return conflicts;
  }

  /**
   * Generate comparison recommendations
   */
  private async generateComparisonRecommendations(
    version1: DocumentVersion,
    version2: DocumentVersion,
    diff: DocumentDiff
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (diff.qualityChange.improvement > 0.1) {
      recommendations.push('Version 2 shows significant quality improvement');
    } else if (diff.qualityChange.improvement < -0.1) {
      recommendations.push('Version 2 shows quality degradation - consider review');
    }

    if (diff.additions > diff.deletions * 2) {
      recommendations.push('Version 2 adds substantial content - verify completeness');
    }

    if (diff.modifications > 10) {
      recommendations.push('Many modifications detected - ensure consistency');
    }

    return recommendations;
  }

  /**
   * Determine merge strategy based on conflicts and diff
   */
  private determineMergeStrategy(
    conflicts: VersionConflict[],
    diff: DocumentDiff
  ): 'auto' | 'manual' | 'hybrid' {
    if (conflicts.length === 0) {
      return 'auto';
    } else if (conflicts.length > 5 || diff.modifications > 20) {
      return 'manual';
    } else {
      return 'hybrid';
    }
  }

  /**
   * Auto merge versions
   */
  private async autoMerge(
    sourceVersion: DocumentVersion,
    targetVersion: DocumentVersion,
    comparison: VersionComparison
  ): Promise<{ content: string; changes: DocumentChange[] }> {
    // Simple auto-merge: prefer higher quality version
    if (targetVersion.qualityMetrics.overallScore > sourceVersion.qualityMetrics.overallScore) {
      return {
        content: targetVersion.content,
        changes: targetVersion.changes
      };
    } else {
      return {
        content: sourceVersion.content,
        changes: sourceVersion.changes
      };
    }
  }

  /**
   * Manual merge versions
   */
  private async manualMerge(
    sourceVersion: DocumentVersion,
    targetVersion: DocumentVersion,
    comparison: VersionComparison,
    resolution?: { [conflictId: string]: string }
  ): Promise<{ content: string; changes: DocumentChange[] }> {
    // Manual merge requires human intervention
    // For now, return source version as base
    return {
      content: sourceVersion.content,
      changes: sourceVersion.changes
    };
  }

  /**
   * Hybrid merge versions
   */
  private async hybridMerge(
    sourceVersion: DocumentVersion,
    targetVersion: DocumentVersion,
    comparison: VersionComparison,
    resolution?: { [conflictId: string]: string }
  ): Promise<{ content: string; changes: DocumentChange[] }> {
    // Hybrid merge: auto-merge simple conflicts, manual for complex ones
    const autoConflicts = comparison.conflicts.filter(c => c.type === 'quality');
    const manualConflicts = comparison.conflicts.filter(c => c.type !== 'quality');

    if (autoConflicts.length > manualConflicts.length) {
      return this.autoMerge(sourceVersion, targetVersion, comparison);
    } else {
      return this.manualMerge(sourceVersion, targetVersion, comparison, resolution);
    }
  }

  /**
   * Resolve conflicts
   */
  private async resolveConflicts(
    conflicts: VersionConflict[],
    resolution?: { [conflictId: string]: string },
    resolvedBy?: string
  ): Promise<void> {
    for (const conflict of conflicts) {
      if (resolution && resolution[conflict.id]) {
        conflict.resolution = resolution[conflict.id];
        conflict.resolvedBy = resolvedBy;
        conflict.resolvedAt = new Date();
      }
    }
  }

  /**
   * Calculate next version number
   */
  private calculateNextVersion(currentVersion?: string): string {
    if (!currentVersion) {
      return '1.0.0';
    }

    const parts = currentVersion.split('.').map(Number);
    if (parts.length !== 3) {
      return '1.0.0';
    }

    // Increment patch version
    parts[2]++;
    return parts.join('.');
  }

  /**
   * Generate diff summary
   */
  private generateDiffSummary(
    additions: number,
    deletions: number,
    modifications: number,
    qualityChange: any
  ): string {
    const changes = additions + deletions + modifications;
    const qualityText = qualityChange.improvement > 0 ? 'improved' : 
                       qualityChange.improvement < 0 ? 'degraded' : 'unchanged';
    
    return `${changes} changes made (${additions} additions, ${deletions} deletions, ${modifications} modifications). Quality ${qualityText} by ${Math.abs(qualityChange.improvement).toFixed(2)}.`;
  }

  /**
   * Get latest version of a document
   */
  private getLatestVersion(documentId: string): DocumentVersion | undefined {
    const versions = this.documentVersions.get(documentId) || [];
    return versions.sort((a, b) => 
      new Date(b.metadata.created).getTime() - new Date(a.metadata.created).getTime()
    )[0];
  }

  /**
   * Initialize event handlers
   */
  private initializeEventHandlers(): void {
    this.on('versionCreated', (version) => {
      logger.info(`Version ${version.version} created for document ${version.documentId}`);
    });

    this.on('branchCreated', (branch) => {
      logger.info(`Branch ${branch.name} created`);
    });

    this.on('versionsMerged', (mergedVersion, sourceVersion, targetVersion) => {
      logger.info(`Versions merged: ${sourceVersion.version} + ${targetVersion.version} = ${mergedVersion.version}`);
    });
  }

  /**
   * Store version in database
   */
  private async storeVersion(version: DocumentVersion): Promise<void> {
    try {
      await database.query(`
        INSERT INTO document_versions (
          id, document_id, version, content, title, description, author, author_type,
          changes, quality_metrics, metadata, diff, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      `, [
        version.id,
        version.documentId,
        version.version,
        version.content,
        version.title,
        version.description,
        version.author,
        version.authorType,
        JSON.stringify(version.changes),
        JSON.stringify(version.qualityMetrics),
        JSON.stringify(version.metadata),
        JSON.stringify(version.diff)
      ]);

    } catch (error) {
      logger.error('Failed to store version:', error);
    }
  }

  /**
   * Store branch in database
   */
  private async storeBranch(branch: VersionBranch): Promise<void> {
    try {
      await database.query(`
        INSERT INTO version_branches (
          id, name, description, base_version, current_version, status,
          created, created_by, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      `, [
        branch.id,
        branch.name,
        branch.description,
        branch.baseVersion,
        branch.currentVersion,
        branch.status,
        branch.created,
        branch.createdBy,
        JSON.stringify(branch.metadata)
      ]);

    } catch (error) {
      logger.error('Failed to store branch:', error);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if we can access the database
      await database.query('SELECT 1');
      return true;

    } catch (error) {
      logger.error('Documentation versioning manager health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const documentationVersioningManager = new DocumentationVersioningManager();

