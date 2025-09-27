/**
 * Governance Utilities for Moonight Protocol
 * Handles private governance operations including trust-weighted voting,
 * proposal lifecycle management, and confidential vote tallying
 */

import { 
  GovernanceProposal, 
  AnonymousVote, 
  VoteTallyResult, 
  ProposalExecution,
  CircleGovernanceParams,
  VoteCommitment,
  CreateProposalParams
} from '../types';
import { PrivacyUtils } from './privacy';
import { TrustScoreCalculator } from './trust-score';

export class GovernanceManager {
  private privacyUtils: PrivacyUtils;
  private trustCalculator: TrustScoreCalculator;

  constructor(privacyUtils: PrivacyUtils, trustCalculator: TrustScoreCalculator) {
    this.privacyUtils = privacyUtils;
    this.trustCalculator = trustCalculator;
  }

  /**
   * Generate a trust-weighted vote commitment with privacy preservation
   */
  async generateTrustWeightedVoteCommitment(
    vote: boolean,
    voterSecret: string,
    trustScore: number
  ): Promise<VoteCommitment> {
    const crypto = require('crypto');
    const randomness = crypto.randomBytes(32).toString('hex');
    
    // Create commitment that includes trust weight but preserves privacy
    const commitmentData = {
      choice: vote,
      trustWeight: trustScore,
      voterSecret,
      randomness,
      timestamp: Date.now()
    };

    const commitment = await this.privacyUtils.generateCommitment(commitmentData);
    
    return {
      commitment,
      randomness,
      voterSecret
    };
  }

  /**
   * Verify vote eligibility based on trust score and membership
   */
  async verifyVoteEligibility(
    voterHash: string,
    proposalId: string,
    proposal: GovernanceProposal,
    membershipProof: string
  ): Promise<{ eligible: boolean; trustScore: number; reason?: string }> {
    try {
      // Verify membership proof - handle both old and new formats
      const proofData = JSON.parse(membershipProof);
      
      // Check for new format (commitment, nullifier, proof)
      const hasNewFormat = proofData.commitment && proofData.nullifier && proofData.proof;
      // Check for old format (memberSecret, proof)
      const hasOldFormat = proofData.memberSecret && proofData.proof;
      
      if (!hasNewFormat && !hasOldFormat) {
        return { eligible: false, trustScore: 0, reason: 'Invalid membership proof format' };
      }

      // Verify proof validity
      if (!proofData.proof?.valid) {
        return { eligible: false, trustScore: 0, reason: 'Invalid membership proof' };
      }

      // Get voter trust score
      const trustScore = await this.trustCalculator.calculateScore(voterHash);
      
      // Check minimum trust score requirement
      if (proposal.minimumTrustScore && trustScore < proposal.minimumTrustScore) {
        return { 
          eligible: false, 
          trustScore, 
          reason: `Trust score ${trustScore} below minimum ${proposal.minimumTrustScore}` 
        };
      }

      // Check if circle-specific proposal and member is in circle
      if (proposal.circleId) {
        // This would be verified against circle membership in the main contract
        // For now, we assume membership proof covers this
      }

      return { eligible: true, trustScore };

    } catch (error) {
      return { eligible: false, trustScore: 0, reason: 'Proof verification failed' };
    }
  }

  /**
   * Perform confidential vote tallying with privacy preservation
   */
  async tallyVotesConfidentially(
    proposalId: string,
    votes: AnonymousVote[],
    proposal: GovernanceProposal,
    totalEligibleMembers: number
  ): Promise<VoteTallyResult> {
    let totalVotes = 0;
    let yesVotes = 0;
    let noVotes = 0;
    let totalTrustWeight = 0;
    let yesTrustWeight = 0;
    let noTrustWeight = 0;

    // Tally votes while preserving individual vote privacy
    for (const vote of votes) {
      totalVotes++;
      totalTrustWeight += vote.trustWeight;

      if (vote.voteChoice) {
        yesVotes++;
        yesTrustWeight += vote.trustWeight;
      } else {
        noVotes++;
        noTrustWeight += vote.trustWeight;
      }
    }

    // Check quorum - based on number of votes vs required participation
    const participationRate = (totalVotes / totalEligibleMembers) * 100;
    const quorumMet = participationRate >= proposal.requiredQuorum;

    // Determine if proposal passed based on trust-weighted voting
    // For now, use simple majority of trust weight, but could also use vote count majority
    const trustWeightMajority = yesTrustWeight > noTrustWeight;
    const voteCountMajority = yesVotes > noVotes;
    
    // Use trust-weighted majority as primary decision mechanism
    const passed = quorumMet && trustWeightMajority;

    return {
      proposalId,
      totalVotes,
      yesVotes,
      noVotes,
      totalTrustWeight,
      yesTrustWeight,
      noTrustWeight,
      quorumMet,
      passed,
      privacyPreserved: true // Individual votes remain private
    };
  }

  /**
   * Generate ZK proof for proposal execution
   */
  async generateExecutionProof(
    proposalId: string,
    tallyResult: VoteTallyResult,
    executorHash: string
  ): Promise<string> {
    // Create a ZK proof that demonstrates:
    // 1. The proposal passed according to the rules
    // 2. The executor has authority to execute
    // 3. The tally is correct without revealing individual votes

    const proofData = {
      proposalId,
      passed: tallyResult.passed,
      quorumMet: tallyResult.quorumMet,
      executor: executorHash,
      timestamp: Date.now(),
      // Don't include individual vote details to preserve privacy
      totalParticipation: tallyResult.totalVotes,
      trustWeightedResult: tallyResult.yesTrustWeight > tallyResult.noTrustWeight
    };

    // In a real implementation, this would be a proper ZK-SNARK proof
    // For demo purposes, we'll create a verifiable commitment
    return JSON.stringify({
      proof: await this.privacyUtils.generateCommitment(proofData),
      publicInputs: {
        proposalId,
        passed: tallyResult.passed,
        executedAt: Date.now()
      },
      valid: true
    });
  }

  /**
   * Verify the integrity of a vote tally without revealing individual votes
   */
  async verifyTallyIntegrity(
    votes: AnonymousVote[],
    tallyResult: VoteTallyResult,
    nullifierSet: Set<string>
  ): Promise<boolean> {
    // Verify no double voting (all nullifiers are unique)
    const voteNullifiers = new Set(votes.map(v => v.zkNullifier));
    if (voteNullifiers.size !== votes.length) {
      return false; // Duplicate nullifiers found
    }

    // Verify nullifiers aren't reused across proposals
    for (const nullifier of voteNullifiers) {
      if (nullifierSet.has(nullifier)) {
        return false; // Nullifier already used
      }
    }

    // Verify tally matches vote count
    if (votes.length !== tallyResult.totalVotes) {
      return false;
    }

    // Verify trust weight calculation
    const calculatedTrustWeight = votes.reduce((sum, vote) => sum + vote.trustWeight, 0);
    if (calculatedTrustWeight !== tallyResult.totalTrustWeight) {
      return false;
    }

    return true;
  }

  /**
   * Create default governance parameters for a circle
   */
  createDefaultGovernanceParams(circleId: string): CircleGovernanceParams {
    return {
      circleId,
      votingThreshold: 60, // 60% majority required
      quorumPercentage: 51, // At least 51% participation
      votingPeriodHours: 168, // 7 days
      executionDelayHours: 24, // 1 day delay after passing
      allowedProposalTypes: ['INTEREST_RATE', 'CIRCLE_PARAMS', 'PENALTY_RULES']
    };
  }

  /**
   * Generate a unique nullifier for vote privacy
   */
  async generateVoteNullifier(
    voterSecret: string,
    proposalId: string
  ): Promise<string> {
    return this.privacyUtils.generateNullifier(`${voterSecret}:${proposalId}`);
  }

  /**
   * Encrypt proposal execution results while keeping outcome public
   */
  async encryptExecutionResults(
    proposalId: string,
    executionData: any,
    publicOutcome: string
  ): Promise<string> {
    // Encrypt sensitive execution details while keeping the outcome transparent
    const encryptedData = await this.privacyUtils.encryptWitnessData({
      proposalId,
      executionData,
      timestamp: Date.now()
    });

    return JSON.stringify({
      encryptedDetails: encryptedData,
      publicOutcome,
      transparency: 'Results are public, execution details are private'
    });
  }
}