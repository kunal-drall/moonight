/**
 * Moonight Protocol Smart Contract Types
 * Privacy-first lending circles on Midnight blockchain
 */

export interface CircleMember {
  readonly memberHash: string; // ZK-hashed identity
  readonly commitmentProof: string; // ZK proof of commitment
  readonly trustScore: number; // 0-1000 scale, privately computed
  readonly stakeAmount: bigint;
  readonly joinedBlock: number;
}

export interface LendingCircle {
  readonly circleId: string;
  readonly memberCount: number;
  readonly maxMembers: number;
  readonly monthlyAmount: bigint;
  readonly interestRate: number; // Basis points (100 = 1%)
  readonly currentRound: number;
  readonly totalRounds: number;
  readonly createdBlock: number;
  readonly isActive: boolean;
  readonly zkMembershipRoot: string; // Merkle root for private membership verification
}

export interface BidCommitment {
  readonly bidHash: string; // ZK-hashed bid
  readonly memberHash: string;
  readonly commitmentProof: string;
  readonly round: number;
  readonly timestamp: number;
}

export interface PaymentRecord {
  readonly paymentHash: string; // Private payment identifier
  readonly round: number;
  readonly amount: bigint;
  readonly timestamp: number;
  readonly zkProof: string; // Zero-knowledge proof of payment
}

export interface TrustScoreUpdate {
  readonly memberHash: string;
  readonly newScore: number;
  readonly zkProof: string; // Proof that score calculation is correct
  readonly factors: string; // Encrypted factors used in calculation
}

export interface GovernanceProposal {
  readonly proposalId: string;
  readonly proposalType: 'INTEREST_RATE' | 'CIRCLE_PARAMS' | 'PENALTY_RULES';
  readonly proposalData: string; // Encrypted proposal details
  readonly votingDeadline: number;
  readonly requiredQuorum: number;
  readonly isActive: boolean;
}

export interface AnonymousVote {
  readonly voteHash: string; // ZK-hashed vote
  readonly proposalId: string;
  readonly zkNullifier: string; // Prevents double voting
  readonly zkProof: string; // Proof of valid membership without revealing identity
}

export interface InsurancePool {
  readonly poolId: string;
  readonly totalStake: bigint;
  readonly activeMembers: number;
  readonly penaltyReserve: bigint;
  readonly lastUpdateBlock: number;
}

export interface CrossChainIdentity {
  readonly identityCommitment: string; // ZK commitment to cross-chain identity
  readonly chainProofs: Map<string, string>; // Chain ID -> proof mapping
  readonly reputationRoot: string; // Merkle root of reputation across chains
  readonly lastSyncBlock: number;
}

export interface PrivacyParams {
  readonly zkSnarkParams: string;
  readonly commitmentScheme: string;
  readonly nullifierDerivation: string;
  readonly proofVerificationKey: string;
}

// Contract state interfaces
export interface ContractState {
  readonly circles: Map<string, LendingCircle>;
  readonly members: Map<string, CircleMember>;
  readonly bidCommitments: Map<string, BidCommitment[]>;
  readonly paymentRecords: Map<string, PaymentRecord[]>;
  readonly trustScores: Map<string, number>;
  readonly governanceProposals: Map<string, GovernanceProposal>;
  readonly votes: Map<string, AnonymousVote[]>;
  insurancePool: InsurancePool; // Made mutable for updates
  readonly crossChainIdentities: Map<string, CrossChainIdentity>;
  readonly privacyParams: PrivacyParams;
}

// Function parameter types
export interface CreateCircleParams {
  readonly maxMembers: number;
  readonly monthlyAmount: bigint;
  readonly totalRounds: number;
  readonly minimumTrustScore: number;
  readonly stakeRequirement: bigint;
}

export interface JoinCircleParams {
  readonly circleId: string;
  readonly membershipProof: string; // ZK proof of eligibility
  readonly stakeAmount: bigint;
  readonly identityCommitment: string;
}

export interface SubmitBidParams {
  readonly circleId: string;
  readonly round: number;
  readonly bidCommitment: string; // ZK commitment to bid amount
  readonly validityProof: string;
}

export interface MakePaymentParams {
  readonly circleId: string;
  readonly round: number;
  readonly paymentProof: string; // ZK proof of payment
  readonly recipientHash: string;
}

export interface UpdateTrustScoreParams {
  readonly targetMemberHash: string;
  readonly newScore: number;
  readonly calculationProof: string;
  readonly witnessData: string; // Encrypted witness data
}

export interface CreateProposalParams {
  readonly proposalType: GovernanceProposal['proposalType'];
  readonly proposalData: string;
  readonly votingPeriod: number;
  readonly requiredQuorum: number;
}

// Cross-Chain Privacy Bridge Types
export interface CrossChainTransfer {
  readonly transferId: string;
  readonly sourceChain: string;
  readonly targetChain: string;
  readonly amount: bigint;
  readonly recipientCommitment: string; // ZK commitment to recipient identity
  readonly nullifierHash: string; // Prevents double-spending
  readonly zkProof: string; // Privacy-preserving transfer proof
  readonly timestamp: number;
  readonly status: 'PENDING' | 'CONFIRMED' | 'EXECUTED' | 'FAILED';
}

export interface PrivacyBridgeState {
  readonly bridgeId: string;
  readonly supportedChains: string[];
  readonly totalLocked: Map<string, bigint>; // chain -> locked amount
  readonly anonymitySet: Set<string>; // Set of nullifiers for mixing
  readonly transferQueue: CrossChainTransfer[];
  readonly zkVerificationKeys: Map<string, string>; // chain -> verification key
}

export interface AnonymousTransferParams {
  readonly sourceChain: string;
  readonly targetChain: string;
  readonly amount: bigint;
  readonly recipientCommitment: string;
  readonly senderNullifier: string;
  readonly mixingDelay: number; // Seconds to wait for anonymity
  readonly zkProof: string;
}

export interface ConfidentialBalance {
  readonly balanceCommitment: string; // Pedersen commitment to balance
  readonly chainId: string;
  readonly nullifierSet: Set<string>; // Used nullifiers
  readonly zkProof: string; // Proof of balance validity
}

export interface CrossChainPaymentRoute {
  readonly routeId: string;
  readonly sourceChain: string;
  readonly intermediateChains: string[];
  readonly targetChain: string;
  readonly totalHops: number;
  readonly estimatedDelay: number;
  readonly privacyScore: number; // 0-100, higher is more private
}

export interface ZKBridgeProof {
  readonly proofType: 'TRANSFER' | 'BALANCE' | 'MEMBERSHIP' | 'NULLIFIER';
  readonly chainId: string;
  readonly proof: string;
  readonly publicSignals: string[];
  readonly verificationKey: string;
}

export interface AnonymityPool {
  readonly poolId: string;
  readonly chainId: string;
  readonly denomination: bigint; // Fixed denomination for mixing
  readonly commitments: Set<string>; // All commitments in the pool
  readonly nullifiers: Set<string>; // Spent nullifiers
  readonly merkleRoot: string; // Root of commitment tree
  readonly poolSize: number;
}

export interface PrivateTransactionMix {
  readonly mixId: string;
  readonly inputCommitments: string[];
  readonly outputCommitments: string[];
  readonly nullifiers: string[];
  readonly zkProof: string;
  readonly anonymitySetSize: number;
  readonly mixingFee: bigint;
}