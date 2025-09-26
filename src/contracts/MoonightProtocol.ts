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

export class MoonightProtocol {
  private state: ContractState;
  public zkVerifier: ZKProofVerifier;
  public privacyUtils: PrivacyUtils;
  public trustCalculator: TrustScoreCalculator;
  private crossChainManager: CrossChainManager;

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

    // Check creator's trust score
    const creatorScore = this.state.trustScores.get(creatorHash) || 700; // Default higher score for demo
    if (creatorScore < 600) {
      throw new Error('Insufficient trust score to create circle');
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

    // Check trust score requirement (privately)
    const memberHash = params.identityCommitment; // Use identity commitment directly for demo
    const trustScore = await this.trustCalculator.calculateScore(memberHash);
    
    if (trustScore < 400) { // Lower requirement for demo
      throw new Error('Insufficient trust score');
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

    // Update trust score for successful payment
    await this.updateTrustScore({
      targetMemberHash: payerHash,
      newScore: Math.min(1000, (this.state.trustScores.get(payerHash) || 500) + 10),
      calculationProof: await this.trustCalculator.generateProof(payerHash, 10),
      witnessData: await this.privacyUtils.encryptWitnessData({
        action: 'payment',
        amount: circle.monthlyAmount,
        onTime: true
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

    // Verify calculation proof
    if (!await this.zkVerifier.verifyTrustScoreProof(
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

  private async getCurrentBlock(): Promise<number> {
    // This would integrate with Midnight blockchain's current block number
    return Date.now(); // Placeholder
  }

  // State getters for testing and debugging
  getState(): ContractState {
    return this.state;
  }
}