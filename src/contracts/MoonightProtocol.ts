/**
 * Moonight Protocol - Main Smart Contract
 * Privacy-first lending circles on Midnight blockchain
 * 
 * Features:
 * - Private circle creation with ZK member verification
 * - Anonymous trust scoring (0-1000 scale)  
 * - Confidential bidding system using zero-knowledge proofs
 * - Automated monthly payment collection with privacy preservation
 * - Stake-based insurance with private penalty enforcement
 * - Cross-chain identity management
 * - Democratic interest rate governance with anonymous voting
 */

import {
  ContractState,
  LendingCircle,
  CircleMember,
  CreateCircleParams,
  JoinCircleParams,
  SubmitBidParams,
  MakePaymentParams,
  UpdateTrustScoreParams,
  CreateProposalParams,
  BidCommitment,
  PaymentRecord,
  GovernanceProposal,
  AnonymousVote,
  InsurancePool,
  CrossChainIdentity,
  PrivacyParams
} from '../types';

import { ZKProofVerifier } from '../utils/zk-verifier';
import { PrivacyUtils } from '../utils/privacy';
import { TrustScoreCalculator } from '../utils/trust-score';
import { CrossChainManager } from '../utils/cross-chain';
import { BidAuctionManager } from '../auctions/BidAuctionManager';

export class MoonightProtocol {
  private state: ContractState;
  public zkVerifier: ZKProofVerifier;
  public privacyUtils: PrivacyUtils;
  public trustCalculator: TrustScoreCalculator;
  private crossChainManager: CrossChainManager;
  private bidAuctionManager: BidAuctionManager;

  constructor(initialParams: PrivacyParams) {
    this.state = {
      circles: new Map(),
      members: new Map(),
      bidCommitments: new Map(),
      paymentRecords: new Map(),
      trustScores: new Map(),
      governanceProposals: new Map(),
      votes: new Map(),
      insurancePool: {
        poolId: 'main-insurance',
        totalStake: 0n,
        activeMembers: 0,
        penaltyReserve: 0n,
        lastUpdateBlock: 0
      },
      crossChainIdentities: new Map(),
      privacyParams: initialParams
    };

    this.zkVerifier = new ZKProofVerifier(initialParams);
    this.privacyUtils = new PrivacyUtils(initialParams);
    this.trustCalculator = new TrustScoreCalculator();
    this.crossChainManager = new CrossChainManager();
    this.bidAuctionManager = new BidAuctionManager(initialParams);
  }

  /**
   * Create a new private lending circle
   * Only verified members can create circles
   */
  async createCircle(
    creatorHash: string,
    params: CreateCircleParams,
    creatorProof: string
  ): Promise<string> {
    // Verify creator's identity and eligibility
    if (!await this.zkVerifier.verifyMembershipProof(creatorHash, creatorProof)) {
      throw new Error('Invalid creator proof');
    }

    // Check creator's tier permissions for circle creation
    if (!await this.checkTierPermissions(creatorHash, 'CREATE_CIRCLE')) {
      const tier = await this.getMemberTier(creatorHash);
      throw new Error(`Insufficient tier (${tier.name}) to create circle. Minimum required: Builder`);
    }

    // Check if creator can create large circles (based on maxMembers)
    if (params.maxMembers > 8 && !await this.checkTierPermissions(creatorHash, 'CREATE_LARGE_CIRCLE')) {
      throw new Error('Only Sage tier and above can create large circles (>8 members)');
    }

    // Verify stake requirement for tier (use stake requirement from params as baseline)
    const creatorScore = this.state.trustScores.get(creatorHash) || await this.trustCalculator.calculateScore(creatorHash);
    const requiredStakeForTier = this.trustCalculator.getStakeRequirement(creatorScore);
    if (params.stakeRequirement < requiredStakeForTier) {
      throw new Error(`Circle stake requirement ${params.stakeRequirement.toString()} wei is below tier requirement: ${requiredStakeForTier.toString()} wei`);
    }

    const circleId = await this.privacyUtils.generateCircleId(creatorHash, params);
    
    // Create ZK membership root for empty circle
    const zkMembershipRoot = await this.privacyUtils.generateMembershipRoot([]);

    const circle: LendingCircle = {
      circleId,
      memberCount: 0,
      maxMembers: params.maxMembers,
      monthlyAmount: params.monthlyAmount,
      interestRate: 500, // Default 5% (basis points)
      currentRound: 0,
      totalRounds: params.totalRounds,
      createdBlock: await this.getCurrentBlock(),
      isActive: true,
      zkMembershipRoot
    };

    this.state.circles.set(circleId, circle);
    this.state.bidCommitments.set(circleId, []);
    this.state.paymentRecords.set(circleId, []);

    // Update trust score for circle creation
    const newScore = await this.trustCalculator.updateScoreForAction(
      creatorHash,
      'CIRCLE_COMPLETION', // Use circle completion for creating
      creatorScore
    );
    
    await this.updateTrustScore({
      targetMemberHash: creatorHash,
      newScore,
      calculationProof: await this.trustCalculator.generateProof(creatorHash, newScore - creatorScore),
      witnessData: await this.privacyUtils.encryptWitnessData({
        action: 'CIRCLE_CREATION',
        circleId,
        maxMembers: params.maxMembers,
        timestamp: Date.now()
      })
    });

    return circleId;
  }

  /**
   * Join a lending circle with ZK proof of eligibility
   */
  async joinCircle(params: JoinCircleParams): Promise<boolean> {
    const circle = this.state.circles.get(params.circleId);
    if (!circle || !circle.isActive) {
      throw new Error('Circle not found or inactive');
    }

    if (circle.memberCount >= circle.maxMembers) {
      throw new Error('Circle is full');
    }

    // Verify membership proof and stake
    if (!await this.zkVerifier.verifyMembershipProof(
      params.identityCommitment,
      params.membershipProof
    )) {
      throw new Error('Invalid membership proof');
    }

    // Check trust score and tier requirements
    const memberHash = params.identityCommitment; // Use identity commitment directly for demo
    const trustScore = await this.trustCalculator.calculateScore(memberHash);
    const tier = this.trustCalculator.getTrustTier(trustScore);
    
    // Verify minimum stake requirement for tier
    if (!await this.verifyStakeRequirement(memberHash, params.stakeAmount)) {
      const requiredStake = this.trustCalculator.getStakeRequirement(trustScore);
      throw new Error(`Insufficient stake for ${tier.name} tier. Required: ${requiredStake.toString()} wei`);
    }
    
    // Check if tier allows joining based on circle size
    if (circle.maxMembers > 8 && trustScore < 400) { // Large circles need Builder tier minimum
      throw new Error('Large circles require minimum Builder tier (400+ score)');
    }

    // Create member record
    const member: CircleMember = {
      memberHash,
      commitmentProof: params.membershipProof,
      trustScore,
      stakeAmount: params.stakeAmount,
      joinedBlock: await this.getCurrentBlock()
    };

    this.state.members.set(memberHash, member);
    this.state.trustScores.set(memberHash, trustScore);

    // Update circle membership
    const updatedCircle: LendingCircle = {
      ...circle,
      memberCount: circle.memberCount + 1,
      zkMembershipRoot: await this.privacyUtils.updateMembershipRoot(
        circle.zkMembershipRoot,
        memberHash
      )
    };

    this.state.circles.set(params.circleId, updatedCircle);

    // Update insurance pool
    await this.updateInsurancePool(params.stakeAmount, 1);

    return true;
  }

  /**
   * Submit confidential bid for lending round
   */
  async submitBid(
    memberHash: string,
    params: SubmitBidParams
  ): Promise<boolean> {
    const circle = this.state.circles.get(params.circleId);
    if (!circle || !circle.isActive) {
      throw new Error('Circle not found or inactive');
    }

    // Verify member is part of circle (simplified for demo)
    const member = this.state.members.get(memberHash);
    if (!member) {
      // Also check if memberHash is actually the identityCommitment
      const memberByCommitment = Array.from(this.state.members.values())
        .find(m => m.memberHash === memberHash);
      if (!memberByCommitment) {
        throw new Error('Not a circle member');
      }
    }

    // Verify bid commitment (simplified for demo)
    try {
      const proofData = JSON.parse(params.validityProof);
      if (!proofData.commitment || !proofData.valid) {
        throw new Error('Invalid bid commitment');
      }
    } catch (error) {
      throw new Error('Invalid bid commitment');
    }

    const bidCommitment: BidCommitment = {
      bidHash: params.bidCommitment,
      memberHash,
      commitmentProof: params.validityProof,
      round: params.round,
      timestamp: Date.now()
    };

    const existingBids = this.state.bidCommitments.get(params.circleId) || [];
    existingBids.push(bidCommitment);
    this.state.bidCommitments.set(params.circleId, existingBids);

    return true;
  }

  /**
   * Process monthly payment with privacy preservation
   */
  async makePayment(
    payerHash: string,
    params: MakePaymentParams
  ): Promise<boolean> {
    const circle = this.state.circles.get(params.circleId);
    if (!circle || !circle.isActive) {
      throw new Error('Circle not found or inactive');
    }

    // Verify payment proof
    if (!await this.zkVerifier.verifyPaymentProof(
      payerHash,
      params.paymentProof,
      circle.monthlyAmount
    )) {
      throw new Error('Invalid payment proof');
    }

    const paymentRecord: PaymentRecord = {
      paymentHash: await this.privacyUtils.hashPayment(
        payerHash,
        params.recipientHash,
        circle.monthlyAmount
      ),
      round: params.round,
      amount: circle.monthlyAmount,
      timestamp: Date.now(),
      zkProof: params.paymentProof
    };

    const existingPayments = this.state.paymentRecords.get(params.circleId) || [];
    existingPayments.push(paymentRecord);
    this.state.paymentRecords.set(params.circleId, existingPayments);

    // Update trust score for successful payment using proper action-based scoring
    const currentScore = this.state.trustScores.get(payerHash) || 500;
    const newScore = await this.trustCalculator.updateScoreForAction(
      payerHash,
      'PAYMENT_SUCCESS',
      currentScore
    );
    
    await this.updateTrustScore({
      targetMemberHash: payerHash,
      newScore,
      calculationProof: await this.trustCalculator.generateProof(payerHash, newScore - currentScore),
      witnessData: await this.privacyUtils.encryptWitnessData({
        action: 'PAYMENT_SUCCESS',
        amount: circle.monthlyAmount,
        onTime: true,
        timestamp: Date.now()
      })
    });

    return true;
  }

  /**
   * Update member trust score with ZK proof
   */
  async updateTrustScore(params: UpdateTrustScoreParams): Promise<boolean> {
    if (params.newScore < 0 || params.newScore > 1000) {
      throw new Error('Trust score must be between 0 and 1000');
    }

    // Verify calculation proof using our trust score calculator
    if (!await this.trustCalculator.verifyCalculation(
      params.targetMemberHash,
      params.newScore,
      params.calculationProof
    )) {
      throw new Error('Invalid trust score calculation proof');
    }

    this.state.trustScores.set(params.targetMemberHash, params.newScore);

    // Update member record
    const member = this.state.members.get(params.targetMemberHash);
    if (member) {
      const updatedMember: CircleMember = {
        ...member,
        trustScore: params.newScore
      };
      this.state.members.set(params.targetMemberHash, updatedMember);
    }

    return true;
  }

  /**
   * Check if member meets tier requirements for action
   */
  async checkTierPermissions(memberHash: string, action: string): Promise<boolean> {
    const trustScore = this.state.trustScores.get(memberHash) || 0;
    return this.trustCalculator.canPerformAction(trustScore, action);
  }

  /**
   * Get member's current tier information
   */
  async getMemberTier(memberHash: string): Promise<any> {
    const trustScore = this.state.trustScores.get(memberHash) || 0;
    return this.trustCalculator.getTrustTier(trustScore);
  }

  /**
   * Verify member meets minimum stake requirement for their tier
   */
  async verifyStakeRequirement(memberHash: string, stakeAmount: bigint): Promise<boolean> {
    const trustScore = this.state.trustScores.get(memberHash) || 0;
    const requiredStake = this.trustCalculator.getStakeRequirement(trustScore);
    return stakeAmount >= requiredStake;
  }

  /**
   * Create governance proposal for democratic decision making
   */
  async createProposal(
    creatorHash: string,
    params: CreateProposalParams,
    creatorProof: string
  ): Promise<string> {
    // Verify creator eligibility
    if (!await this.zkVerifier.verifyMembershipProof(creatorHash, creatorProof)) {
      throw new Error('Invalid creator proof');
    }

    const proposalId = await this.privacyUtils.generateProposalId(creatorHash, params);

    const proposal: GovernanceProposal = {
      proposalId,
      proposalType: params.proposalType,
      proposalData: params.proposalData,
      votingDeadline: Date.now() + (params.votingPeriod * 1000),
      requiredQuorum: params.requiredQuorum,
      isActive: true
    };

    this.state.governanceProposals.set(proposalId, proposal);
    this.state.votes.set(proposalId, []);

    return proposalId;
  }

  /**
   * Cast anonymous vote on governance proposal
   */
  async castVote(
    voterHash: string,
    proposalId: string,
    voteCommitment: string,
    zkNullifier: string,
    membershipProof: string
  ): Promise<boolean> {
    const proposal = this.state.governanceProposals.get(proposalId);
    if (!proposal || !proposal.isActive) {
      throw new Error('Proposal not found or inactive');
    }

    if (Date.now() > proposal.votingDeadline) {
      throw new Error('Voting period ended');
    }

    // Verify voter membership without revealing identity (simplified for demo)
    try {
      const proofData = JSON.parse(membershipProof);
      if (!proofData.memberSecret || !proofData.proof?.valid) {
        throw new Error('Invalid anonymous vote proof');
      }
    } catch (error) {
      throw new Error('Invalid anonymous vote proof');
    }

    // Check for double voting
    const existingVotes = this.state.votes.get(proposalId) || [];
    if (existingVotes.some(v => v.zkNullifier === zkNullifier)) {
      throw new Error('Already voted on this proposal');
    }

    const vote: AnonymousVote = {
      voteHash: voteCommitment,
      proposalId,
      zkNullifier,
      zkProof: membershipProof
    };

    existingVotes.push(vote);
    this.state.votes.set(proposalId, existingVotes);

    return true;
  }

  /**
   * Register cross-chain identity
   */
  async registerCrossChainIdentity(
    identityCommitment: string,
    chainProofs: Map<string, string>,
    reputationProof: string
  ): Promise<boolean> {
    // Verify cross-chain proofs
    for (const [chainId, proof] of chainProofs) {
      if (!await this.crossChainManager.verifyChainProof(chainId, proof)) {
        throw new Error(`Invalid proof for chain ${chainId}`);
      }
    }

    const identity: CrossChainIdentity = {
      identityCommitment,
      chainProofs,
      reputationRoot: await this.crossChainManager.calculateReputationRoot(chainProofs),
      lastSyncBlock: await this.getCurrentBlock()
    };

    this.state.crossChainIdentities.set(identityCommitment, identity);

    return true;
  }

  /**
   * Handle insurance claims and penalties
   */
  async processInsuranceClaim(
    claimantHash: string,
    circleId: string,
    claimProof: string
  ): Promise<boolean> {
    const circle = this.state.circles.get(circleId);
    if (!circle) {
      throw new Error('Circle not found');
    }

    // Verify insurance claim
    if (!await this.zkVerifier.verifyInsuranceClaim(
      claimantHash,
      circleId,
      claimProof
    )) {
      throw new Error('Invalid insurance claim');
    }

    // Process payout from insurance pool
    const member = this.state.members.get(claimantHash);
    if (member && this.state.insurancePool.penaltyReserve >= member.stakeAmount) {
      // Update insurance pool
      const updatedPool: InsurancePool = {
        ...this.state.insurancePool,
        penaltyReserve: this.state.insurancePool.penaltyReserve - member.stakeAmount,
        lastUpdateBlock: await this.getCurrentBlock()
      };
      this.state.insurancePool = updatedPool;

      return true;
    }

    return false;
  }

  /**
   * Get public circle information (privacy-preserving)
   */
  getCircleInfo(circleId: string): Partial<LendingCircle> | null {
    const circle = this.state.circles.get(circleId);
    if (!circle) return null;

    // Return only non-sensitive information
    return {
      circleId: circle.circleId,
      memberCount: circle.memberCount,
      maxMembers: circle.maxMembers,
      monthlyAmount: circle.monthlyAmount,
      currentRound: circle.currentRound,
      totalRounds: circle.totalRounds,
      isActive: circle.isActive
    };
  }

  /**
   * Get member's trust score (if authorized)
   */
  async getTrustScore(
    memberHash: string,
    requestorProof: string
  ): Promise<number | null> {
    if (!await this.zkVerifier.verifyTrustScoreAccess(memberHash, requestorProof)) {
      return null;
    }

    return this.state.trustScores.get(memberHash) || null;
  }

  /**
   * Start an anonymous bidding round for monthly loans
   */
  async startAnonymousBiddingRound(
    circleId: string,
    round: number,
    biddingPeriodHours: number = 24
  ): Promise<string> {
    const circle = this.state.circles.get(circleId);
    if (!circle || !circle.isActive) {
      throw new Error('Circle not found or inactive');
    }

    // Get eligible members from circle
    const eligibleMembers = Array.from(this.state.members.keys())
      .filter(memberHash => {
        const member = this.state.members.get(memberHash);
        return member && this.isMemberOfCircle(memberHash, circleId);
      });

    if (eligibleMembers.length === 0) {
      throw new Error('No eligible members for bidding');
    }

    // Determine bid range based on circle parameters
    const minBid = BigInt(1); // Minimum interest rate (1 basis point)
    const maxBid = circle.monthlyAmount / BigInt(2); // Maximum reasonable interest

    return await this.bidAuctionManager.startBiddingRound(
      circleId,
      round,
      eligibleMembers,
      biddingPeriodHours,
      minBid,
      maxBid
    );
  }

  /**
   * Submit anonymous bid with ZK proofs for member eligibility and bid validity
   */
  async submitAnonymousBid(
    auctionId: string,
    memberHash: string,
    bidAmount: bigint,
    membershipWitness: string
  ): Promise<boolean> {
    // Generate randomness for bid commitment
    const crypto = require('crypto');
    const randomness = crypto.randomBytes(32).toString('hex');

    // Create bid data
    const bidData = {
      amount: bidAmount,
      memberHash,
      round: 1, // This would be extracted from auction data
      randomness
    };

    return await this.bidAuctionManager.submitAnonymousBid(
      auctionId,
      bidData,
      membershipWitness
    );
  }

  /**
   * Finalize bidding round and select winner with ZK proofs
   */
  async finalizeBiddingRound(auctionId: string) {
    return await this.bidAuctionManager.finalizeBidding(auctionId);
  }

  /**
   * Get bidding phase information
   */
  getBiddingPhase(auctionId: string) {
    return this.bidAuctionManager.getBiddingPhase(auctionId);
  }

  /**
   * Verify integrity of a completed auction
   */
  async verifyAuctionIntegrity(auctionId: string): Promise<boolean> {
    return await this.bidAuctionManager.verifyAuctionIntegrity(auctionId);
  }

  /**
   * Get publicly verifiable auction statistics
   */
  getAuctionStatistics(auctionId: string) {
    return this.bidAuctionManager.getAuctionStatistics(auctionId);
  }

  /**
   * Advanced bid validation with comprehensive ZK proofs
   */
  async validateBidWithProofs(
    circleId: string,
    memberHash: string,
    bidCommitment: string,
    membershipProof: string,
    rangeProof: string,
    fairnessProof: string,
    nullifier: string,
    usedNullifiers: Set<string>
  ): Promise<boolean> {
    const circle = this.state.circles.get(circleId);
    if (!circle) {
      return false;
    }

    // Get bid range for this circle
    const minBid = BigInt(1);
    const maxBid = circle.monthlyAmount / BigInt(2);

    // Verify anonymous bid proof
    const bidValid = await this.zkVerifier.verifyAnonymousBidProof(
      bidCommitment,
      membershipProof,
      rangeProof,
      fairnessProof,
      circleId,
      minBid,
      maxBid
    );

    // Verify nullifier uniqueness
    const nullifierValid = await this.zkVerifier.verifyBidNullifierUniqueness(
      nullifier,
      circleId,
      circle.currentRound,
      usedNullifiers
    );

    return bidValid && nullifierValid;
  }

  /**
   * Batch validate multiple bids for efficiency
   */
  async batchValidateBids(
    circleId: string,
    bidProofs: Array<{
      bidCommitment: string;
      membershipProof: string;
      rangeProof: string;
      fairnessProof: string;
      nullifier: string;
    }>,
    usedNullifiers: Set<string>
  ): Promise<boolean[]> {
    const circle = this.state.circles.get(circleId);
    if (!circle) {
      return new Array(bidProofs.length).fill(false);
    }

    const minBid = BigInt(1);
    const maxBid = circle.monthlyAmount / BigInt(2);

    return await this.zkVerifier.batchVerifyBidProofs(
      bidProofs,
      circleId,
      minBid,
      maxBid,
      usedNullifiers
    );
  }

  // Private helper methods
  private async updateInsurancePool(stakeAmount: bigint, memberChange: number): Promise<void> {
    const updatedPool: InsurancePool = {
      ...this.state.insurancePool,
      totalStake: this.state.insurancePool.totalStake + stakeAmount,
      activeMembers: this.state.insurancePool.activeMembers + memberChange,
      lastUpdateBlock: await this.getCurrentBlock()
    };
    this.state.insurancePool = updatedPool;
  }

  private isMemberOfCircle(memberHash: string, circleId: string): boolean {
    // In a real implementation, this would check the circle membership tree
    // For now, we'll check if member exists and has joined
    const member = this.state.members.get(memberHash);
    return member !== undefined;
  }

  private async getCurrentBlock(): Promise<number> {
    // This would integrate with Midnight blockchain's current block number
    return Date.now(); // Placeholder
  }

  // State getters for testing and debugging
  getState(): ContractState {
    return this.state;
  }
}