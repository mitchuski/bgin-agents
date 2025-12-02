// =====================================
// backend/src/routes/toip.ts
// Trust over IP (ToIP) API Routes
// =====================================

import { Router, Request, Response } from 'express';
import { agentDIDManager, AgentDID, AgentCredential, TrustRelationship } from '../toip/agent-did-manager';

const router = Router();

/**
 * Create a new agent DID
 */
router.post('/agents/did', async (req: Request, res: Response) => {
  try {
    const { agentType, capabilities } = req.body;
    
    if (!agentType || !capabilities) {
      return res.status(400).json({
        error: 'Missing required fields: agentType, capabilities'
      });
    }

    const validAgentTypes = ['archive', 'codex', 'discourse'];
    if (!validAgentTypes.includes(agentType)) {
      return res.status(400).json({
        error: 'Invalid agent type. Must be one of: archive, codex, discourse'
      });
    }

    const agentDID = await agentDIDManager.createAgentDID(agentType, capabilities);
    
    return res.status(201).json({
      success: true,
      data: agentDID
    });
  } catch (error) {
    console.error('Error creating agent DID:', error);
    return res.status(500).json({
      error: 'Failed to create agent DID'
    });
  }
});

/**
 * Issue a capability credential for an agent
 */
router.post('/agents/credentials', async (req: Request, res: Response) => {
  try {
    const { issuerDID, subjectDID, agentType, capabilities, trustLevel } = req.body;
    
    if (!issuerDID || !subjectDID || !agentType || !capabilities) {
      return res.status(400).json({
        error: 'Missing required fields: issuerDID, subjectDID, agentType, capabilities'
      });
    }

    const credential = await agentDIDManager.issueCapabilityCredential(
      issuerDID,
      subjectDID,
      agentType,
      capabilities,
      trustLevel || 0.8
    );
    
    return res.status(201).json({
      success: true,
      data: credential
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    return res.status(500).json({
      error: 'Failed to issue credential'
    });
  }
});

/**
 * Establish a trust relationship between agents
 */
router.post('/agents/trust', async (req: Request, res: Response) => {
  try {
    const { fromAgent, toAgent, relationshipType, initialTrustScore, evidence } = req.body;
    
    if (!fromAgent || !toAgent || !relationshipType) {
      return res.status(400).json({
        error: 'Missing required fields: fromAgent, toAgent, relationshipType'
      });
    }

    const relationship = await agentDIDManager.establishTrustRelationship(
      fromAgent,
      toAgent,
      relationshipType,
      initialTrustScore || 0.5,
      evidence || []
    );
    
    return res.status(201).json({
      success: true,
      data: relationship
    });
  } catch (error) {
    console.error('Error establishing trust relationship:', error);
    return res.status(500).json({
      error: 'Failed to establish trust relationship'
    });
  }
});

/**
 * Update trust score with new evidence
 */
router.put('/agents/trust/:fromAgent/:toAgent', async (req: Request, res: Response) => {
  try {
    const { fromAgent, toAgent } = req.params;
    const { evidence } = req.body;
    
    if (!evidence) {
      return res.status(400).json({
        error: 'Missing required field: evidence'
      });
    }

    await agentDIDManager.updateTrustScore(fromAgent, toAgent, evidence);
    
    return res.json({
      success: true,
      message: 'Trust score updated successfully'
    });
  } catch (error) {
    console.error('Error updating trust score:', error);
    return res.status(500).json({
      error: 'Failed to update trust score'
    });
  }
});

/**
 * Get agent reputation
 */
router.get('/agents/:agentDID/reputation', async (req: Request, res: Response) => {
  try {
    const { agentDID } = req.params;
    
    const reputation = agentDIDManager.getAgentReputation(agentDID);
    
    if (!reputation) {
      return res.status(404).json({
        error: 'Agent reputation not found'
      });
    }
    
    return res.json({
      success: true,
      data: reputation
    });
  } catch (error) {
    console.error('Error getting agent reputation:', error);
    return res.status(500).json({
      error: 'Failed to get agent reputation'
    });
  }
});

/**
 * Get trust relationships for an agent
 */
router.get('/agents/:agentDID/trust-relationships', async (req: Request, res: Response) => {
  try {
    const { agentDID } = req.params;
    
    const relationships = agentDIDManager.getTrustRelationships(agentDID);
    
    return res.json({
      success: true,
      data: relationships
    });
  } catch (error) {
    console.error('Error getting trust relationships:', error);
    return res.status(500).json({
      error: 'Failed to get trust relationships'
    });
  }
});

/**
 * Get agent credentials
 */
router.get('/agents/:agentDID/credentials', async (req: Request, res: Response) => {
  try {
    const { agentDID } = req.params;
    
    const credentials = agentDIDManager.getAgentCredentials(agentDID);
    
    return res.json({
      success: true,
      data: credentials
    });
  } catch (error) {
    console.error('Error getting agent credentials:', error);
    return res.status(500).json({
      error: 'Failed to get agent credentials'
    });
  }
});

/**
 * Verify a credential
 */
router.post('/credentials/verify', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        error: 'Missing required field: credential'
      });
    }

    const isValid = await agentDIDManager.verifyCredential(credential);
    
    return res.json({
      success: true,
      data: {
        valid: isValid
      }
    });
  } catch (error) {
    console.error('Error verifying credential:', error);
    return res.status(500).json({
      error: 'Failed to verify credential'
    });
  }
});

/**
 * Get all agents in the trust network
 */
router.get('/agents', async (req: Request, res: Response) => {
  try {
    const agents = agentDIDManager.getAllAgents();
    
    return res.json({
      success: true,
      data: agents
    });
  } catch (error) {
    console.error('Error getting all agents:', error);
    return res.status(500).json({
      error: 'Failed to get agents'
    });
  }
});

/**
 * Get ToIP framework status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const agents = agentDIDManager.getAllAgents();
    const totalAgents = agents.length;
    
    let totalTrustRelationships = 0;
    let totalCredentials = 0;
    
    for (const agent of agents) {
      const relationships = agentDIDManager.getTrustRelationships(agent.did);
      const credentials = agentDIDManager.getAgentCredentials(agent.did);
      
      totalTrustRelationships += relationships.length;
      totalCredentials += credentials.length;
    }
    
    return res.json({
      success: true,
      data: {
        totalAgents,
        totalTrustRelationships,
        totalCredentials,
        frameworkVersion: '1.0.0',
        compliance: 'ToIP Foundation Standards',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting ToIP status:', error);
    return res.status(500).json({
      error: 'Failed to get ToIP status'
    });
  }
});

export default router;
