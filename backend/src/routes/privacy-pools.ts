// =====================================
// backend/src/routes/privacy-pools.ts
// Privacy Pools Integration API Routes
// =====================================

import { Router, Request, Response } from 'express';
import { bginASPManager, ResearchContribution, PrivacyPoolDeposit } from '../privacy-pools/asp-manager';

const router = Router();

/**
 * Add user to trust network
 */
router.post('/trust-network/users', async (req: Request, res: Response) => {
  try {
    const { userId, did } = req.body;
    
    if (!userId || !did) {
      return res.status(400).json({
        error: 'Missing required fields: userId, did'
      });
    }

    await bginASPManager.addUserToTrustNetwork(userId, did);
    
    return res.status(201).json({
      success: true,
      message: 'User added to trust network successfully'
    });
  } catch (error) {
    console.error('Error adding user to trust network:', error);
    return res.status(500).json({
      error: 'Failed to add user to trust network'
    });
  }
});

/**
 * Add research contribution
 */
router.post('/contributions', async (req: Request, res: Response) => {
  try {
    const contributionData = req.body;
    
    if (!contributionData.contributorId || !contributionData.contributionType) {
      return res.status(400).json({
        error: 'Missing required fields: contributorId, contributionType'
      });
    }

    const contribution = await bginASPManager.addResearchContribution(contributionData);
    
    return res.status(201).json({
      success: true,
      data: contribution
    });
  } catch (error) {
    console.error('Error adding research contribution:', error);
    return res.status(500).json({
      error: 'Failed to add research contribution'
    });
  }
});

/**
 * Get user trust score
 */
router.get('/trust-network/users/:userId/score', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const trustScore = bginASPManager.getUserTrustScore(userId);
    
    return res.json({
      success: true,
      data: {
        userId,
        trustScore
      }
    });
  } catch (error) {
    console.error('Error getting user trust score:', error);
    return res.status(500).json({
      error: 'Failed to get user trust score'
    });
  }
});

/**
 * Get user contributions
 */
router.get('/trust-network/users/:userId/contributions', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const contributions = bginASPManager.getUserContributions(userId);
    
    return res.json({
      success: true,
      data: contributions
    });
  } catch (error) {
    console.error('Error getting user contributions:', error);
    return res.status(500).json({
      error: 'Failed to get user contributions'
    });
  }
});

/**
 * Get user ASP eligibility
 */
router.get('/trust-network/users/:userId/asp-eligibility', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const eligibility = bginASPManager.getUserASPEligibility(userId);
    
    if (!eligibility) {
      return res.status(404).json({
        error: 'User not found in trust network'
      });
    }
    
    return res.json({
      success: true,
      data: eligibility
    });
  } catch (error) {
    console.error('Error getting user ASP eligibility:', error);
    return res.status(500).json({
      error: 'Failed to get user ASP eligibility'
    });
  }
});

/**
 * Get user privacy pool access
 */
router.get('/trust-network/users/:userId/privacy-pool-access', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const access = bginASPManager.getUserPrivacyPoolAccess(userId);
    
    if (!access) {
      return res.status(404).json({
        error: 'User not found in trust network'
      });
    }
    
    return res.json({
      success: true,
      data: access
    });
  } catch (error) {
    console.error('Error getting user privacy pool access:', error);
    return res.status(500).json({
      error: 'Failed to get user privacy pool access'
    });
  }
});

/**
 * Evaluate privacy pool deposit
 */
router.post('/deposits/evaluate', async (req: Request, res: Response) => {
  try {
    const depositData = req.body;
    
    if (!depositData.depositorId || !depositData.amount || !depositData.assetType) {
      return res.status(400).json({
        error: 'Missing required fields: depositorId, amount, assetType'
      });
    }

    const deposit = await bginASPManager.evaluateDeposit(depositData);
    
    return res.status(201).json({
      success: true,
      data: deposit
    });
  } catch (error) {
    console.error('Error evaluating deposit:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to evaluate deposit'
    });
  }
});

/**
 * Get association set
 */
router.get('/association-set', async (req: Request, res: Response) => {
  try {
    const associationSet = await bginASPManager.getAssociationSet();
    
    return res.json({
      success: true,
      data: {
        commitments: associationSet,
        count: associationSet.length
      }
    });
  } catch (error) {
    console.error('Error getting association set:', error);
    return res.status(500).json({
      error: 'Failed to get association set'
    });
  }
});

/**
 * Update association set
 */
router.post('/association-set/update', async (req: Request, res: Response) => {
  try {
    await bginASPManager.updateAssociationSet();
    
    const associationSet = await bginASPManager.getAssociationSet();
    
    return res.json({
      success: true,
      data: {
        commitments: associationSet,
        count: associationSet.length,
        message: 'Association set updated successfully'
      }
    });
  } catch (error) {
    console.error('Error updating association set:', error);
    return res.status(500).json({
      error: 'Failed to update association set'
    });
  }
});

/**
 * Get approved deposits
 */
router.get('/deposits/approved', async (req: Request, res: Response) => {
  try {
    const approvedDeposits = bginASPManager.getApprovedDeposits();
    
    return res.json({
      success: true,
      data: approvedDeposits
    });
  } catch (error) {
    console.error('Error getting approved deposits:', error);
    return res.status(500).json({
      error: 'Failed to get approved deposits'
    });
  }
});

/**
 * Get user rewards
 */
router.get('/trust-network/users/:userId/rewards', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const rewards = bginASPManager.getUserRewards(userId);
    
    return res.json({
      success: true,
      data: rewards
    });
  } catch (error) {
    console.error('Error getting user rewards:', error);
    return res.status(500).json({
      error: 'Failed to get user rewards'
    });
  }
});

/**
 * Get privacy pools integration status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const associationSet = await bginASPManager.getAssociationSet();
    const approvedDeposits = bginASPManager.getApprovedDeposits();
    
    return res.json({
      success: true,
      data: {
        associationSetSize: associationSet.length,
        approvedDepositsCount: approvedDeposits.length,
        integrationStatus: 'active',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting privacy pools status:', error);
    return res.status(500).json({
      error: 'Failed to get privacy pools status'
    });
  }
});

export default router;
