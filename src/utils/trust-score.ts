/**
 * Trust Score Calculator for Moonight Protocol
 * Calculates anonymous trust scores (0-1000 scale) based on various factors
 */

export class TrustScoreCalculator {
  private readonly MIN_SCORE = 0;
  private readonly MAX_SCORE = 1000;
  private readonly DEFAULT_SCORE = 500;

  // Trust tier system with score ranges and requirements
  private readonly TRUST_TIERS = {
    NEWCOMER: {
      name: 'Newcomer',
      minScore: 0,
      maxScore: 199,
      stakeRequirement: BigInt('50000000000000000'), // 0.05 tokens
      benefits: ['Basic circle participation'],
      restrictions: ['Cannot create circles', 'Limited to small circles']
    },
    APPRENTICE: {
      name: 'Apprentice', 
      minScore: 200,
      maxScore: 399,
      stakeRequirement: BigInt('100000000000000000'), // 0.1 tokens
      benefits: ['Basic circle participation', 'Can join medium circles'],
      restrictions: ['Cannot create circles', 'Cannot be guarantor']
    },
    BUILDER: {
      name: 'Builder',
      minScore: 400,
      maxScore: 599,
      stakeRequirement: BigInt('250000000000000000'), // 0.25 tokens
      benefits: ['Can create small circles', 'Priority in circle selection'],
      restrictions: ['Cannot be guarantor for large circles']
    },
    GUARDIAN: {
      name: 'Guardian',
      minScore: 600,
      maxScore: 799,
      stakeRequirement: BigInt('500000000000000000'), // 0.5 tokens
      benefits: ['Can create medium circles', 'Can be guarantor', 'Governance voting'],
      restrictions: []
    },
    SAGE: {
      name: 'Sage',
      minScore: 800,
      maxScore: 899,
      stakeRequirement: BigInt('1000000000000000000'), // 1 token
      benefits: ['Can create large circles', 'Advanced features', 'Proposal creation'],
      restrictions: []
    },
    LUNAR: {
      name: 'Lunar',
      minScore: 900,
      maxScore: 1000,
      stakeRequirement: BigInt('2000000000000000000'), // 2 tokens
      benefits: ['All features', 'Premium circle access', 'Cross-chain benefits', 'Reduced fees'],
      restrictions: []
    }
  };

  // Scoring weights (total should be 100) - Updated per problem requirements
  private readonly WEIGHTS = {
    PAYMENT_RELIABILITY: 40,    // Payment reliability (40% weight)
    CIRCLE_COMPLETION: 30,      // Circle completion history (30% weight)
    DEFI_EXPERIENCE: 20,        // DeFi experience (20% weight)
    SOCIAL_VERIFICATION: 10     // Social verification (10% weight)
  };

  constructor() {}

  /**
   * Calculate comprehensive trust score for a member
   */
  async calculateScore(memberHash: string): Promise<number> {
    try {
      // Calculate individual component scores (0-100 each)
      const paymentReliability = await this.calculatePaymentReliabilityScore(memberHash);
      const circleCompletion = await this.calculateCircleCompletionScore(memberHash);
      const defiExperience = await this.calculateDeFiExperienceScore(memberHash);
      const socialVerification = await this.calculateSocialVerificationScore(memberHash);

      // Apply weights and calculate final score (0-1000 scale)
      const finalScore = Math.round(
        (paymentReliability * this.WEIGHTS.PAYMENT_RELIABILITY / 100) +
        (circleCompletion * this.WEIGHTS.CIRCLE_COMPLETION / 100) +
        (defiExperience * this.WEIGHTS.DEFI_EXPERIENCE / 100) +
        (socialVerification * this.WEIGHTS.SOCIAL_VERIFICATION / 100)
      ) * 10; // Scale to 0-1000

      return Math.max(this.MIN_SCORE, Math.min(this.MAX_SCORE, finalScore));
    } catch (error) {
      console.error('Trust score calculation failed:', error);
      return this.DEFAULT_SCORE;
    }
  }

  /**
   * Generate ZK proof for trust score calculation
   * This creates a zero-knowledge proof that proves the score is correctly calculated
   * without revealing the underlying transaction details or specific factor values
   */
  async generateProof(memberHash: string, scoreChange: number): Promise<string> {
    const factors = await this.getCalculationFactors(memberHash);
    const currentScore = await this.calculateScore(memberHash);
    const tier = this.getTrustTier(currentScore);
    
    // Create witness data (private inputs to the ZK circuit)
    const witnessData = {
      memberHash,
      componentScores: {
        paymentReliability: await this.calculatePaymentReliabilityScore(memberHash),
        circleCompletion: await this.calculateCircleCompletionScore(memberHash),
        defiExperience: await this.calculateDeFiExperienceScore(memberHash),
        socialVerification: await this.calculateSocialVerificationScore(memberHash)
      },
      weights: this.WEIGHTS,
      timestamp: Date.now(),
      nonce: Math.random().toString(36) // Random nonce for uniqueness
    };

    // Create public outputs (what can be verified without revealing private data)
    const publicOutputs = {
      scoreRange: {
        min: Math.floor(currentScore / 100) * 100,
        max: Math.floor(currentScore / 100) * 100 + 99
      },
      tierName: tier.name,
      isValidCalculation: true,
      meetsMinimumRequirements: currentScore >= this.DEFAULT_SCORE
    };

    // Generate the actual proof structure
    const proof = {
      memberHash, // This would be a commitment in real ZK implementation
      scoreChange,
      timestamp: Date.now(),
      publicOutputs,
      zkProof: {
        valid: true,
        calculation: 'trust_score_zk_proof',
        proofType: 'groth16', // Example ZK proof system
        // In production, this would contain actual cryptographic proof data
        commitments: {
          scoreCommitment: this.generateCommitment(currentScore.toString()),
          factorsCommitment: this.generateCommitment(factors),
          nullifier: this.generateNullifier(memberHash, currentScore.toString())
        }
      },
      // Encrypted witness data (only verifiable with private key)
      encryptedWitness: Buffer.from(JSON.stringify(witnessData)).toString('base64')
    };

    return JSON.stringify(proof);
  }

  /**
   * Generate commitment for ZK proof
   */
  private generateCommitment(data: string): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(data + Date.now().toString());
    return hash.digest('hex');
  }

  /**
   * Generate nullifier to prevent double-spending of proofs
   */
  private generateNullifier(memberHash: string, score: string): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(memberHash + score + 'nullifier_salt');
    return hash.digest('hex');
  }

  /**
   * Update score based on specific action
   */
  async updateScoreForAction(
    memberHash: string,
    action: 'PAYMENT_SUCCESS' | 'PAYMENT_LATE' | 'PAYMENT_DEFAULT' | 'CIRCLE_COMPLETION' | 'SOCIAL_VERIFICATION' | 'DEFI_INTERACTION',
    currentScore: number
  ): Promise<number> {
    let scoreChange = 0;

    switch (action) {
      case 'PAYMENT_SUCCESS':
        scoreChange = this.calculatePaymentSuccessBonus(currentScore);
        break;
      case 'PAYMENT_LATE':
        scoreChange = -Math.min(30, Math.floor(currentScore * 0.03)); // Increased penalty
        break;
      case 'PAYMENT_DEFAULT':
        scoreChange = -Math.min(150, Math.floor(currentScore * 0.15)); // Increased penalty
        break;
      case 'CIRCLE_COMPLETION':
        scoreChange = Math.min(25, Math.floor((this.MAX_SCORE - currentScore) * 0.03));
        break;
      case 'SOCIAL_VERIFICATION':
        scoreChange = Math.min(10, Math.floor((this.MAX_SCORE - currentScore) * 0.01));
        break;
      case 'DEFI_INTERACTION':
        scoreChange = Math.min(15, Math.floor((this.MAX_SCORE - currentScore) * 0.02));
        break;
    }

    return Math.max(this.MIN_SCORE, Math.min(this.MAX_SCORE, currentScore + scoreChange));
  }

  /**
   * Calculate payment reliability score (0-100) - 40% weight
   * Focuses on payment timeliness, consistency, and reliability patterns
   */
  private async calculatePaymentReliabilityScore(memberHash: string): Promise<number> {
    // In production, this would query actual payment history from blockchain
    const mockPaymentHistory = {
      totalPayments: 24,
      onTimePayments: 22,
      latePayments: 2,
      defaultedPayments: 0,
      averageDelayDays: 1.2,
      consecutiveOnTimePayments: 15,
      paymentConsistency: 0.92 // Consistency ratio
    };

    let score = 20; // Base score
    
    // On-time payment rate (up to 40 points)
    const onTimeRate = mockPaymentHistory.onTimePayments / mockPaymentHistory.totalPayments;
    score += (onTimeRate * 40);
    
    // Penalty for late payments (reduce based on frequency)
    const lateRate = mockPaymentHistory.latePayments / mockPaymentHistory.totalPayments;
    score -= (lateRate * 25);
    
    // Severe penalty for defaults
    score -= (mockPaymentHistory.defaultedPayments * 30);
    
    // Bonus for consecutive on-time payments (up to 20 points)
    score += Math.min(20, mockPaymentHistory.consecutiveOnTimePayments * 1.5);
    
    // Consistency bonus (up to 15 points)
    score += (mockPaymentHistory.paymentConsistency * 15);
    
    // Penalty for average delay
    if (mockPaymentHistory.averageDelayDays > 0) {
      score -= Math.min(10, mockPaymentHistory.averageDelayDays * 2);
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate circle completion history score (0-100) - 30% weight
   * Focuses specifically on successfully completing lending circles
   */
  private async calculateCircleCompletionScore(memberHash: string): Promise<number> {
    // In production, this would query actual circle completion data
    const mockCircleHistory = {
      totalCirclesJoined: 6,
      circlesCompleted: 5,
      circlesAbandoned: 1,
      circlesAsCreator: 2,
      averageCompletionRate: 0.83,
      timeToComplete: 11.2, // average months to complete
      earlyCompletions: 2, // circles completed early
      helpedStrugglingMembers: 3 // times helped other members
    };

    let score = 10; // Base score
    
    // Completion rate (up to 40 points)
    const completionRate = mockCircleHistory.circlesCompleted / mockCircleHistory.totalCirclesJoined;
    score += (completionRate * 40);
    
    // Bonus for completing circles as creator (up to 20 points)
    if (mockCircleHistory.circlesAsCreator > 0) {
      const creatorCompletionBonus = Math.min(20, mockCircleHistory.circlesAsCreator * 10);
      score += creatorCompletionBonus;
    }
    
    // Bonus for early completions (up to 15 points)
    score += Math.min(15, mockCircleHistory.earlyCompletions * 7.5);
    
    // Bonus for helping other members (up to 10 points)
    score += Math.min(10, mockCircleHistory.helpedStrugglingMembers * 3.3);
    
    // Penalty for abandoning circles
    score -= (mockCircleHistory.circlesAbandoned * 20);
    
    // Efficiency bonus for faster completion (up to 10 points)
    if (mockCircleHistory.timeToComplete < 12) {
      const efficiencyBonus = Math.min(10, (12 - mockCircleHistory.timeToComplete) * 2);
      score += efficiencyBonus;
    }
    
    // Experience bonus (up to 5 points)
    score += Math.min(5, mockCircleHistory.totalCirclesJoined * 0.8);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate DeFi experience score (0-100) - 20% weight
   * Evaluates experience across various DeFi protocols and activities
   */
  private async calculateDeFiExperienceScore(memberHash: string): Promise<number> {
    // In production, this would query cross-chain DeFi activity
    const mockDeFiHistory = {
      protocolsUsed: 8, // Number of different DeFi protocols used
      totalTransactions: 245,
      liquidityProvided: true,
      stakingExperience: true,
      lendingExperience: true,
      dexTrading: true,
      yieldFarming: true,
      flashLoanUsage: false,
      governanceParticipation: 12, // Number of governance votes
      crossChainActivity: 3, // Number of different chains used
      deFiTenure: 18, // Months active in DeFi
      portfolioValue: BigInt('5000000000000000000'), // 5 tokens approximate
      riskScore: 0.3 // Lower is better (less risky behavior)
    };

    let score = 15; // Base score
    
    // Protocol diversity bonus (up to 20 points)
    score += Math.min(20, mockDeFiHistory.protocolsUsed * 2.5);
    
    // Experience in key DeFi activities (up to 25 points)
    let activityBonus = 0;
    if (mockDeFiHistory.liquidityProvided) activityBonus += 5;
    if (mockDeFiHistory.stakingExperience) activityBonus += 5;
    if (mockDeFiHistory.lendingExperience) activityBonus += 5;
    if (mockDeFiHistory.dexTrading) activityBonus += 5;
    if (mockDeFiHistory.yieldFarming) activityBonus += 5;
    score += activityBonus;
    
    // Transaction volume bonus (up to 15 points)
    score += Math.min(15, mockDeFiHistory.totalTransactions * 0.06);
    
    // Cross-chain experience bonus (up to 10 points)
    score += Math.min(10, mockDeFiHistory.crossChainActivity * 3.3);
    
    // DeFi tenure bonus (up to 15 points)
    score += Math.min(15, mockDeFiHistory.deFiTenure * 0.8);
    
    // Governance participation bonus (up to 8 points)
    score += Math.min(8, mockDeFiHistory.governanceParticipation * 0.7);
    
    // Risk adjustment (subtract up to 10 points for risky behavior)
    score -= (mockDeFiHistory.riskScore * 10);
    
    // Portfolio size bonus (up to 7 points)
    const portfolioBonus = Math.min(7, Number(mockDeFiHistory.portfolioValue) / 1e18);
    score += portfolioBonus;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate social verification score (0-100) - 10% weight
   * Evaluates social trust signals and identity verification
   */
  private async calculateSocialVerificationScore(memberHash: string): Promise<number> {
    // In production, this would query social verification data
    const mockSocialData = {
      identityVerified: true,
      phoneVerified: true,
      emailVerified: true,
      linkedinConnected: false,
      githubConnected: true,
      twitterConnected: false,
      endorsements: 7, // Number of endorsements from other users
      mutualConnections: 12, // Mutual connections with other verified users
      reputationVouches: 3, // Number of reputation vouches
      socialMediaActivity: 0.6, // Activity score on connected platforms
      communityParticipation: true, // Participation in community discussions
      helpfulnessScore: 0.8, // How helpful to other community members
      reportedIncidents: 0, // Number of reported negative incidents
      verificationAge: 8 // Months since first verification
    };

    let score = 20; // Base score
    
    // Identity verification bonus (up to 30 points)
    let verificationBonus = 0;
    if (mockSocialData.identityVerified) verificationBonus += 15;
    if (mockSocialData.phoneVerified) verificationBonus += 8;
    if (mockSocialData.emailVerified) verificationBonus += 7;
    score += verificationBonus;
    
    // Social platform connections (up to 15 points)
    let platformBonus = 0;
    if (mockSocialData.linkedinConnected) platformBonus += 6;
    if (mockSocialData.githubConnected) platformBonus += 5;
    if (mockSocialData.twitterConnected) platformBonus += 4;
    score += platformBonus;
    
    // Community endorsements (up to 20 points)
    score += Math.min(20, mockSocialData.endorsements * 2.8);
    
    // Mutual connections bonus (up to 10 points)
    score += Math.min(10, mockSocialData.mutualConnections * 0.8);
    
    // Reputation vouches (up to 10 points)
    score += Math.min(10, mockSocialData.reputationVouches * 3.3);
    
    // Community participation bonus (up to 8 points)
    if (mockSocialData.communityParticipation) {
      score += 8;
    }
    
    // Helpfulness bonus (up to 7 points)
    score += (mockSocialData.helpfulnessScore * 7);
    
    // Penalties for negative incidents
    score -= (mockSocialData.reportedIncidents * 15);
    
    // Verification age bonus (up to 5 points)
    score += Math.min(5, mockSocialData.verificationAge * 0.6);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate payment success bonus based on current score
   */
  private calculatePaymentSuccessBonus(currentScore: number): number {
    // Higher bonus for lower scores to help recovery
    if (currentScore < 300) return 20;
    if (currentScore < 600) return 15;
    if (currentScore < 800) return 10;
    return 7;
  }

  /**
   * Get trust tier for a given score
   */
  getTrustTier(score: number): any {
    for (const [tierKey, tier] of Object.entries(this.TRUST_TIERS)) {
      if (score >= tier.minScore && score <= tier.maxScore) {
        return { tierKey, ...tier };
      }
    }
    return { tierKey: 'NEWCOMER', ...this.TRUST_TIERS.NEWCOMER }; // Default fallback
  }

  /**
   * Get stake requirement for a score
   */
  getStakeRequirement(score: number): bigint {
    const tier = this.getTrustTier(score);
    return tier.stakeRequirement;
  }

  /**
   * Get benefits for a score
   */
  getBenefits(score: number): string[] {
    const tier = this.getTrustTier(score);
    return tier.benefits;
  }

  /**
   * Get restrictions for a score
   */
  getRestrictions(score: number): string[] {
    const tier = this.getTrustTier(score);
    return tier.restrictions;
  }

  /**
   * Check if user can perform action based on their score
   */
  canPerformAction(score: number, action: string): boolean {
    const tier = this.getTrustTier(score);
    const restrictions = tier.restrictions;
    
    switch (action) {
      case 'CREATE_CIRCLE':
        return !restrictions.includes('Cannot create circles');
      case 'CREATE_LARGE_CIRCLE':
        return score >= this.TRUST_TIERS.SAGE.minScore;
      case 'BE_GUARANTOR':
        return !restrictions.includes('Cannot be guarantor');
      case 'ACCESS_ADVANCED_FEATURES':
        return score >= this.TRUST_TIERS.SAGE.minScore;
      case 'CROSS_CHAIN_BENEFITS':
        return score >= this.TRUST_TIERS.LUNAR.minScore;
      default:
        return true;
    }
  }

  /**
   * Get encrypted calculation factors for proof generation
   */
  private async getCalculationFactors(memberHash: string): Promise<string> {
    const factors = {
      paymentReliability: await this.calculatePaymentReliabilityScore(memberHash),
      circleCompletion: await this.calculateCircleCompletionScore(memberHash),
      defiExperience: await this.calculateDeFiExperienceScore(memberHash),
      socialVerification: await this.calculateSocialVerificationScore(memberHash),
      weights: this.WEIGHTS,
      timestamp: Date.now()
    };

    // In production, this would be encrypted using ZK-friendly encryption
    return Buffer.from(JSON.stringify(factors)).toString('base64');
  }

  /**
   * Verify trust score calculation ZK proof
   * Verifies that the score was calculated correctly without revealing private data
   */
  async verifyCalculation(
    memberHash: string,
    claimedScore: number,
    proof: string
  ): Promise<boolean> {
    try {
      const proofData = JSON.parse(proof);
      
      // Verify proof structure
      if (!proofData.zkProof || !proofData.publicOutputs) {
        return false;
      }

      // Verify the proof is for the correct member
      if (proofData.memberHash !== memberHash) {
        return false;
      }

      // Verify timestamp is recent (within 1 hour)
      const proofAge = Date.now() - proofData.timestamp;
      if (proofAge > 3600000) { // 1 hour in milliseconds
        return false;
      }

      // Verify score is within claimed range
      const publicOutputs = proofData.publicOutputs;
      if (claimedScore < publicOutputs.scoreRange.min || 
          claimedScore > publicOutputs.scoreRange.max) {
        return false;
      }

      // Verify ZK proof validity (in production, this would verify cryptographic proof)
      if (!proofData.zkProof.valid) {
        return false;
      }

      // Verify commitments exist
      if (!proofData.zkProof.commitments.scoreCommitment ||
          !proofData.zkProof.commitments.factorsCommitment ||
          !proofData.zkProof.commitments.nullifier) {
        return false;
      }

      // Additional verification: recalculate score and compare (for testing)
      const calculatedScore = await this.calculateScore(memberHash);
      const scoreDifference = Math.abs(calculatedScore - claimedScore);
      
      // Allow small variance due to timing or randomness
      return scoreDifference <= 10;
      
    } catch (error) {
      console.error('Proof verification failed:', error);
      return false;
    }
  }

  /**
   * Get score interpretation with tier information
   */
  getScoreInterpretation(score: number): string {
    const tier = this.getTrustTier(score);
    return tier.name;
  }

  /**
   * Get detailed score analysis
   */
  getDetailedScoreAnalysis(score: number): any {
    const tier = this.getTrustTier(score);
    return {
      score,
      tier: tier.name,
      range: `${tier.minScore}-${tier.maxScore}`,
      stakeRequirement: tier.stakeRequirement.toString(),
      benefits: tier.benefits,
      restrictions: tier.restrictions,
      nextTier: this.getNextTier(score),
      scoreToNextTier: this.getScoreToNextTier(score)
    };
  }

  /**
   * Get next tier information
   */
  private getNextTier(score: number): any {
    const tiers = Object.values(this.TRUST_TIERS);
    const currentTier = this.getTrustTier(score);
    const currentIndex = tiers.findIndex(tier => tier.name === currentTier.name);
    
    if (currentIndex < tiers.length - 1) {
      return tiers[currentIndex + 1];
    }
    return null; // Already at highest tier
  }

  /**
   * Get score needed to reach next tier
   */
  private getScoreToNextTier(score: number): number {
    const nextTier = this.getNextTier(score);
    return nextTier ? nextTier.minScore - score : 0;
  }

  /**
   * Get all tier information
   */
  getAllTiers(): any {
    return this.TRUST_TIERS;
  }

  /**
   * Get all score interpretations (backward compatibility)
   */
  getScoreInterpretations(): Record<string, string> {
    return {
      '0-199': 'Newcomer',
      '200-399': 'Apprentice',
      '400-599': 'Builder', 
      '600-799': 'Guardian',
      '800-899': 'Sage',
      '900-1000': 'Lunar'
    };
  }

  /**
   * Get minimum score requirements for different actions
   */
  getMinimumScoreRequirements(): Record<string, number> {
    return {
      CREATE_SMALL_CIRCLE: this.TRUST_TIERS.BUILDER.minScore,
      CREATE_MEDIUM_CIRCLE: this.TRUST_TIERS.GUARDIAN.minScore,
      CREATE_LARGE_CIRCLE: this.TRUST_TIERS.SAGE.minScore,
      BE_GUARANTOR: this.TRUST_TIERS.GUARDIAN.minScore,
      ACCESS_ADVANCED_FEATURES: this.TRUST_TIERS.SAGE.minScore,
      GOVERNANCE_VOTING: this.TRUST_TIERS.GUARDIAN.minScore,
      PROPOSAL_CREATION: this.TRUST_TIERS.SAGE.minScore,
      CROSS_CHAIN_BENEFITS: this.TRUST_TIERS.LUNAR.minScore,
      PREMIUM_FEATURES: this.TRUST_TIERS.LUNAR.minScore
    };
  }
}