// =====================================
// backend/src/toip/agent-did-manager.ts
// Trust over IP (ToIP) Agent DID Management
// =====================================

import { v4 as uuidv4 } from 'uuid';

export interface AgentDID {
  did: string;
  verificationMethod: string;
  serviceEndpoint: string;
  capabilityInvocation: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentCredential {
  type: string;
  issuer: string;
  subject: string;
  credentialSubject: {
    agentType: 'archive' | 'codex' | 'discourse';
    capabilities: string[];
    trustLevel: number;
    permissions: string[];
  };
  issuanceDate: Date;
  expirationDate?: Date;
  proof: {
    type: string;
    created: Date;
    verificationMethod: string;
    proofPurpose: string;
    jws: string;
  };
}

export interface TrustRelationship {
  fromAgent: string;
  toAgent: string;
  trustScore: number;
  relationshipType: 'collaboration' | 'verification' | 'endorsement';
  evidence: TrustEvidence[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface TrustEvidence {
  type: 'successful-collaboration' | 'verified-claim' | 'peer-endorsement';
  description: string;
  confidence: number;
  timestamp: Date;
  verifiableCredential?: string;
}

export interface AgentReputation {
  agentDID: string;
  overallScore: number;
  categoryScores: {
    accuracy: number;
    reliability: number;
    collaboration: number;
    privacy: number;
  };
  totalInteractions: number;
  successfulCollaborations: number;
  lastUpdated: Date;
}

export class AgentDIDManager {
  private agentDIDs: Map<string, AgentDID> = new Map();
  private agentCredentials: Map<string, AgentCredential[]> = new Map();
  private trustRelationships: Map<string, TrustRelationship[]> = new Map();
  private agentReputations: Map<string, AgentReputation> = new Map();

  /**
   * Create a new DID for an agent
   */
  async createAgentDID(agentType: 'archive' | 'codex' | 'discourse', capabilities: string[]): Promise<AgentDID> {
    const did = `did:bgin:agent:${agentType}:${uuidv4()}`;
    const verificationMethod = `${did}#key-1`;
    const serviceEndpoint = `https://bgin-${agentType}-agent.example.com/api`;
    
    const agentDID: AgentDID = {
      did,
      verificationMethod,
      serviceEndpoint,
      capabilityInvocation: capabilities,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.agentDIDs.set(did, agentDID);
    
    // Initialize reputation
    this.agentReputations.set(did, {
      agentDID: did,
      overallScore: 0,
      categoryScores: {
        accuracy: 0,
        reliability: 0,
        collaboration: 0,
        privacy: 0
      },
      totalInteractions: 0,
      successfulCollaborations: 0,
      lastUpdated: new Date()
    });

    return agentDID;
  }

  /**
   * Issue a verifiable credential for agent capabilities
   */
  async issueCapabilityCredential(
    issuerDID: string,
    subjectDID: string,
    agentType: 'archive' | 'codex' | 'discourse',
    capabilities: string[],
    trustLevel: number
  ): Promise<AgentCredential> {
    const credential: AgentCredential = {
      type: 'AgentCapabilityCredential',
      issuer: issuerDID,
      subject: subjectDID,
      credentialSubject: {
        agentType,
        capabilities,
        trustLevel,
        permissions: this.getPermissionsForAgentType(agentType)
      },
      issuanceDate: new Date(),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      proof: {
        type: 'Ed25519Signature2020',
        created: new Date(),
        verificationMethod: `${issuerDID}#key-1`,
        proofPurpose: 'assertionMethod',
        jws: await this.generateJWSSignature(issuerDID, subjectDID, capabilities)
      }
    };

    // Store credential
    const existingCredentials = this.agentCredentials.get(subjectDID) || [];
    existingCredentials.push(credential);
    this.agentCredentials.set(subjectDID, existingCredentials);

    return credential;
  }

  /**
   * Establish a trust relationship between agents
   */
  async establishTrustRelationship(
    fromAgent: string,
    toAgent: string,
    relationshipType: 'collaboration' | 'verification' | 'endorsement',
    initialTrustScore: number,
    evidence: TrustEvidence[]
  ): Promise<TrustRelationship> {
    const relationship: TrustRelationship = {
      fromAgent,
      toAgent,
      trustScore: initialTrustScore,
      relationshipType,
      evidence,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    // Store relationship
    const existingRelationships = this.trustRelationships.get(fromAgent) || [];
    existingRelationships.push(relationship);
    this.trustRelationships.set(fromAgent, existingRelationships);

    // Update reputation scores
    await this.updateReputationScores(fromAgent, toAgent, relationshipType, initialTrustScore);

    return relationship;
  }

  /**
   * Update trust score based on collaboration evidence
   */
  async updateTrustScore(
    fromAgent: string,
    toAgent: string,
    newEvidence: TrustEvidence
  ): Promise<void> {
    const relationships = this.trustRelationships.get(fromAgent) || [];
    const relationship = relationships.find(rel => rel.toAgent === toAgent);
    
    if (relationship) {
      relationship.evidence.push(newEvidence);
      relationship.lastUpdated = new Date();
      
      // Recalculate trust score based on evidence
      relationship.trustScore = this.calculateTrustScore(relationship.evidence);
      
      // Update reputation
      await this.updateReputationScores(fromAgent, toAgent, relationship.relationshipType, relationship.trustScore);
    }
  }

  /**
   * Get agent reputation
   */
  getAgentReputation(agentDID: string): AgentReputation | undefined {
    return this.agentReputations.get(agentDID);
  }

  /**
   * Get trust relationships for an agent
   */
  getTrustRelationships(agentDID: string): TrustRelationship[] {
    return this.trustRelationships.get(agentDID) || [];
  }

  /**
   * Get agent credentials
   */
  getAgentCredentials(agentDID: string): AgentCredential[] {
    return this.agentCredentials.get(agentDID) || [];
  }

  /**
   * Verify agent credential
   */
  async verifyCredential(credential: AgentCredential): Promise<boolean> {
    // In a real implementation, this would verify the JWS signature
    // For now, we'll do basic validation
    return credential.type === 'AgentCapabilityCredential' &&
           credential.issuer.startsWith('did:bgin:') &&
           credential.subject.startsWith('did:bgin:') &&
           credential.proof.type === 'Ed25519Signature2020';
  }

  /**
   * Get all agents in the trust network
   */
  getAllAgents(): AgentDID[] {
    return Array.from(this.agentDIDs.values());
  }

  /**
   * Calculate trust score based on evidence
   */
  private calculateTrustScore(evidence: TrustEvidence[]): number {
    if (evidence.length === 0) return 0;
    
    const weights = {
      'successful-collaboration': 0.4,
      'verified-claim': 0.3,
      'peer-endorsement': 0.3
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const evidenceItem of evidence) {
      const weight = weights[evidenceItem.type] || 0.1;
      totalScore += evidenceItem.confidence * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Update reputation scores based on trust relationship
   */
  private async updateReputationScores(
    fromAgent: string,
    toAgent: string,
    relationshipType: string,
    trustScore: number
  ): Promise<void> {
    const reputation = this.agentReputations.get(toAgent);
    if (!reputation) return;

    // Update category scores based on relationship type
    switch (relationshipType) {
      case 'collaboration':
        reputation.categoryScores.collaboration = Math.max(
          reputation.categoryScores.collaboration,
          trustScore
        );
        reputation.successfulCollaborations++;
        break;
      case 'verification':
        reputation.categoryScores.accuracy = Math.max(
          reputation.categoryScores.accuracy,
          trustScore
        );
        break;
      case 'endorsement':
        reputation.categoryScores.reliability = Math.max(
          reputation.categoryScores.reliability,
          trustScore
        );
        break;
    }

    // Update overall score
    const categoryScores = Object.values(reputation.categoryScores);
    reputation.overallScore = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;
    reputation.totalInteractions++;
    reputation.lastUpdated = new Date();
  }

  /**
   * Get permissions for agent type
   */
  private getPermissionsForAgentType(agentType: string): string[] {
    const permissions = {
      'archive': ['read-documents', 'analyze-content', 'synthesize-knowledge', 'search-correlations'],
      'codex': ['analyze-policies', 'check-compliance', 'assess-impact', 'develop-standards'],
      'discourse': ['facilitate-discussions', 'build-consensus', 'manage-community', 'establish-trust']
    };
    
    return permissions[agentType as keyof typeof permissions] || [];
  }

  /**
   * Generate JWS signature (mock implementation)
   */
  private async generateJWSSignature(issuer: string, subject: string, capabilities: string[]): Promise<string> {
    // In a real implementation, this would generate a proper JWS signature
    // For now, we'll return a mock signature
    const payload = {
      issuer,
      subject,
      capabilities,
      timestamp: Date.now()
    };
    
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
}

// Export singleton instance
export const agentDIDManager = new AgentDIDManager();
