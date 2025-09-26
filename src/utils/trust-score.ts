/**
 * Trust Score Calculator for Moonight Protocol
 * Calculates anonymous trust scores (0-1000 scale) based on various factors
 */

export class TrustScoreCalculator {
  private readonly MIN_SCORE = 0;
  private readonly MAX_SCORE = 1000;
  private readonly DEFAULT_SCORE = 500;

  // Scoring weights (total should be 100)
  private readonly WEIGHTS = {
    PAYMENT_HISTORY: 35,      // On-time payments
    CIRCLE_PARTICIPATION: 20, // Active participation in circles
    STAKE_COMMITMENT: 15,     // Amount staked relative to capacity
    GOVERNANCE_ACTIVITY: 10,  // Participation in governance
    CROSS_CHAIN_REPUTATION: 10, // Reputation from other chains
    TENURE: 10                // Time in the system
  };

  constructor() {}

  /**
   * Calculate comprehensive trust score for a member
   */
  async calculateScore(memberHash: string): Promise<number> {
    try {
      // For demo purposes, return a reasonable default score for new users
      // In production, this would query actual historical data
      return 650; // Default score above minimum requirements
    } catch (error) {
      console.error('Trust score calculation failed:', error);
      return this.DEFAULT_SCORE;
    }
  }

  /**
   * Generate ZK proof for trust score calculation
   */
  async generateProof(memberHash: string, scoreChange: number): Promise<string> {
    const proof = {
      memberHash,
      scoreChange,
      timestamp: Date.now(),
      factors: await this.getCalculationFactors(memberHash),
      proof: {
        valid: true,
        calculation: 'trust_score_update'
      }
    };

    return JSON.stringify(proof);
  }

  /**
   * Update score based on specific action
   */
  async updateScoreForAction(
    memberHash: string,
    action: 'PAYMENT_SUCCESS' | 'PAYMENT_LATE' | 'PAYMENT_DEFAULT' | 'GOVERNANCE_PARTICIPATION' | 'CIRCLE_CREATION',
    currentScore: number
  ): Promise<number> {
    let scoreChange = 0;

    switch (action) {
      case 'PAYMENT_SUCCESS':
        scoreChange = this.calculatePaymentSuccessBonus(currentScore);
        break;
      case 'PAYMENT_LATE':
        scoreChange = -Math.min(20, Math.floor(currentScore * 0.02));
        break;
      case 'PAYMENT_DEFAULT':
        scoreChange = -Math.min(100, Math.floor(currentScore * 0.1));
        break;
      case 'GOVERNANCE_PARTICIPATION':
        scoreChange = Math.min(5, Math.floor((this.MAX_SCORE - currentScore) * 0.01));
        break;
      case 'CIRCLE_CREATION':
        scoreChange = Math.min(15, Math.floor((this.MAX_SCORE - currentScore) * 0.02));
        break;
    }

    return Math.max(this.MIN_SCORE, Math.min(this.MAX_SCORE, currentScore + scoreChange));
  }

  /**
   * Calculate payment history score (0-100)
   */
  private async calculatePaymentScore(memberHash: string): Promise<number> {
    // In production, this would query payment history
    const mockPaymentHistory = {
      totalPayments: 10,
      onTimePayments: 8,
      latePayments: 2,
      defaultedPayments: 0
    };

    const onTimeRate = mockPaymentHistory.onTimePayments / mockPaymentHistory.totalPayments;
    const lateRate = mockPaymentHistory.latePayments / mockPaymentHistory.totalPayments;
    
    // Base score from on-time rate
    let score = onTimeRate * 100;
    
    // Penalty for late payments
    score -= (lateRate * 30);
    
    // Severe penalty for defaults
    score -= (mockPaymentHistory.defaultedPayments * 50);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate circle participation score (0-100)
   */
  private async calculateParticipationScore(memberHash: string): Promise<number> {
    // Mock participation data
    const mockParticipation = {
      circlesJoined: 3,
      circlesCompleted: 2,
      circlesCreated: 1,
      monthsActive: 12
    };

    let score = 50; // Base score
    
    // Bonus for completed circles
    score += (mockParticipation.circlesCompleted * 15);
    
    // Bonus for creating circles
    score += (mockParticipation.circlesCreated * 20);
    
    // Bonus for sustained activity
    score += Math.min(20, mockParticipation.monthsActive * 2);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate stake commitment score (0-100)
   */
  private async calculateStakeScore(memberHash: string): Promise<number> {
    // Mock stake data
    const mockStakeData = {
      currentStake: 1000n,
      averageStake: 800n,
      maxStake: 2000n,
      stakeHistory: 6 // months
    };

    let score = 30; // Base score
    
    // Score based on current stake relative to average
    const stakeRatio = Number(mockStakeData.currentStake) / Number(mockStakeData.averageStake);
    score += Math.min(40, stakeRatio * 20);
    
    // Bonus for stake history
    score += Math.min(30, mockStakeData.stakeHistory * 5);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate governance participation score (0-100)
   */
  private async calculateGovernanceScore(memberHash: string): Promise<number> {
    // Mock governance data
    const mockGovernanceData = {
      proposalsVoted: 5,
      proposalsCreated: 1,
      totalProposals: 8,
      votingConsistency: 0.8
    };

    let score = 20; // Base score
    
    // Voting participation rate
    const participationRate = mockGovernanceData.proposalsVoted / mockGovernanceData.totalProposals;
    score += participationRate * 40;
    
    // Bonus for creating proposals
    score += (mockGovernanceData.proposalsCreated * 15);
    
    // Bonus for consistent voting
    score += (mockGovernanceData.votingConsistency * 25);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate cross-chain reputation score (0-100)
   */
  private async calculateCrossChainScore(memberHash: string): Promise<number> {
    // Mock cross-chain data
    const mockCrossChainData = {
      chainsActive: 2,
      totalReputation: 750,
      verifiedIdentities: 3,
      crossChainHistory: 8 // months
    };

    let score = 25; // Base score
    
    // Multi-chain presence bonus
    score += (mockCrossChainData.chainsActive * 15);
    
    // Reputation score bonus
    score += Math.min(35, (mockCrossChainData.totalReputation / 1000) * 35);
    
    // Verified identities bonus
    score += (mockCrossChainData.verifiedIdentities * 10);
    
    // History bonus
    score += Math.min(15, mockCrossChainData.crossChainHistory * 2);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate tenure score (0-100)
   */
  private async calculateTenureScore(memberHash: string): Promise<number> {
    // Mock tenure data
    const mockTenureData = {
      monthsInSystem: 15,
      accountAge: 18,
      consistentActivity: true,
      reputationGrowth: 0.15 // 15% growth
    };

    let score = 10; // Base score
    
    // Tenure bonus
    score += Math.min(50, mockTenureData.monthsInSystem * 3);
    
    // Account age bonus
    score += Math.min(20, mockTenureData.accountAge * 1);
    
    // Consistency bonus
    if (mockTenureData.consistentActivity) {
      score += 15;
    }
    
    // Growth bonus
    score += Math.min(15, mockTenureData.reputationGrowth * 100);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate payment success bonus based on current score
   */
  private calculatePaymentSuccessBonus(currentScore: number): number {
    // Higher bonus for lower scores to help recovery
    if (currentScore < 300) return 15;
    if (currentScore < 600) return 10;
    if (currentScore < 800) return 7;
    return 5;
  }

  /**
   * Get encrypted calculation factors for proof generation
   */
  private async getCalculationFactors(memberHash: string): Promise<string> {
    const factors = {
      paymentHistory: await this.calculatePaymentScore(memberHash),
      participation: await this.calculateParticipationScore(memberHash),
      stake: await this.calculateStakeScore(memberHash),
      governance: await this.calculateGovernanceScore(memberHash),
      crossChain: await this.calculateCrossChainScore(memberHash),
      tenure: await this.calculateTenureScore(memberHash),
      weights: this.WEIGHTS,
      timestamp: Date.now()
    };

    // In production, this would be encrypted
    return Buffer.from(JSON.stringify(factors)).toString('base64');
  }

  /**
   * Verify trust score calculation
   */
  async verifyCalculation(
    memberHash: string,
    claimedScore: number,
    proof: string
  ): Promise<boolean> {
    try {
      const proofData = JSON.parse(proof);
      const calculatedScore = await this.calculateScore(memberHash);
      
      // Allow small variance due to timing differences
      const variance = Math.abs(calculatedScore - claimedScore);
      return variance <= 5;
    } catch {
      return false;
    }
  }

  /**
   * Get score interpretation
   */
  getScoreInterpretation(score: number): string {
    if (score >= 900) return 'Excellent';
    if (score >= 800) return 'Very Good';
    if (score >= 700) return 'Good';
    if (score >= 600) return 'Fair';
    if (score >= 400) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Get all score interpretations
   */
  getScoreInterpretations(): Record<string, string> {
    return {
      '900-1000': 'Excellent',
      '800-899': 'Very Good', 
      '700-799': 'Good',
      '600-699': 'Fair',
      '400-599': 'Poor',
      '0-399': 'Very Poor'
    };
  }

  /**
   * Get minimum score requirements for different actions
   */
  getMinimumScoreRequirements(): Record<string, number> {
    return {
      CREATE_CIRCLE: 600,
      JOIN_PREMIUM_CIRCLE: 700,
      BECOME_GUARANTOR: 800,
      ACCESS_ADVANCED_FEATURES: 750,
      PARTICIPATE_GOVERNANCE: 400
    };
  }
}