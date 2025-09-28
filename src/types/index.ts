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
  readonly circleId?: string; // Optional: for circle-specific proposals
  readonly proposalType: 'INTEREST_RATE' | 'CIRCLE_PARAMS' | 'PENALTY_RULES' | 'QUORUM_THRESHOLD' | 'VOTING_PERIOD';
  readonly proposalData: string; // Encrypted proposal details
  readonly votingDeadline: number;
  readonly requiredQuorum: number;
  readonly minimumTrustScore?: number; // Minimum trust score to vote
  readonly isActive: boolean;
  readonly status: 'ACTIVE' | 'PASSED' | 'FAILED' | 'EXECUTED';
  readonly createdAt: number;
  readonly executionDeadline?: number; // Deadline for executing passed proposals
}

export interface AnonymousVote {
  readonly voteHash: string; // ZK-hashed vote
  readonly proposalId: string;
  readonly zkNullifier: string; // Prevents double voting
  readonly zkProof: string; // Proof of valid membership without revealing identity
  readonly trustWeight: number; // Trust-weighted voting power (0-1000)
  readonly voteChoice: boolean; // True for yes, false for no (encrypted in voteHash)
  readonly timestamp: number;
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
  readonly voteTallies: Map<string, VoteTallyResult>; // Proposal results
  readonly proposalExecutions: Map<string, ProposalExecution>; // Execution records
  readonly circleGovernanceParams: Map<string, CircleGovernanceParams>; // Circle-specific governance settings
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
  readonly circleId?: string; // For circle-specific proposals
  readonly minimumTrustScore?: number; // Minimum trust score to vote
  readonly executionPeriod?: number; // Time to execute after passing
}

// New governance interfaces for enhanced functionality
export interface VoteTallyResult {
  readonly proposalId: string;
  readonly totalVotes: number;
  readonly yesVotes: number;
  readonly noVotes: number;
  readonly totalTrustWeight: number;
  readonly yesTrustWeight: number;
  readonly noTrustWeight: number;
  readonly quorumMet: boolean;
  readonly passed: boolean;
  readonly privacyPreserved: boolean; // Indicates if individual votes remain private
}

export interface ProposalExecution {
  readonly proposalId: string;
  readonly executionProof: string; // ZK proof of valid execution
  readonly executedAt: number;
  readonly executionResult: string; // Encrypted result data
}

export interface VoteCommitment {
  readonly commitment: string; // Pedersen commitment to vote choice
  readonly randomness: string; // Random value for commitment
  readonly voterSecret: string; // Voter's secret for ZK proofs
}

export interface CircleGovernanceParams {
  readonly circleId: string;
  readonly votingThreshold: number; // Percentage required to pass (0-100)
  readonly quorumPercentage: number; // Minimum participation (0-100)
  readonly votingPeriodHours: number;
  readonly executionDelayHours: number;
  readonly allowedProposalTypes: GovernanceProposal['proposalType'][];
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

// Payment Processor Types
export interface PaymentProcessorState {
  readonly processorId: string;
  readonly supportedChains: string[];
  readonly walletConnections: Map<string, Map<string, WalletConnection>>;
  readonly pendingPayments: Map<string, PartialPayment[]>;
  readonly paymentHistory: Map<string, EncryptedPaymentRecord[]>;
  readonly encryptedRecords: Map<string, EncryptedPaymentRecord>;
  failureQueue: PaymentAttempt[]; // Made mutable for updates
  readonly retryPolicy: PaymentRetryPolicy;
}

export interface PaymentCollectionParams {
  readonly contributorHash: string;
  readonly circleId: string;
  readonly round: number;
  readonly requiredAmount: bigint;
  readonly recipientCommitment: string;
  readonly allowPartialPayment?: boolean;
  readonly maxRetries?: number;
  readonly priority?: 'low' | 'normal' | 'high';
}

export interface PaymentCollectionResult {
  readonly collectionId: string;
  readonly success: boolean;
  readonly totalCollected?: bigint;
  readonly paymentBreakdown?: Map<string, bigint>;
  readonly anonymityScore?: number;
  readonly settlementProof?: string;
  readonly processingTime?: number;
  readonly error?: string;
  readonly retryScheduled?: boolean;
  readonly isPartialPayment?: boolean;
  readonly shortfall?: bigint;
  readonly nextPaymentDue?: number;
}

export interface WalletConnection {
  readonly chainId: string;
  readonly contributorHash: string;
  readonly balanceCommitment: string;
  readonly ownershipProof: string;
  readonly lastVerified: number;
  readonly isActive: boolean;
  readonly confidentialBalance: ConfidentialBalance;
}

export interface PaymentAttempt {
  readonly attemptId: string;
  readonly collectionId: string;
  readonly params: PaymentCollectionParams;
  attemptNumber: number;
  readonly failureReason: PaymentFailureReason;
  nextRetry: number;
  readonly maxRetries: number;
}

export interface EncryptedPaymentRecord {
  readonly recordId: string;
  readonly contributorHash: string;
  readonly circleId: string;
  readonly round: number;
  readonly encryptedAmount: string;
  readonly encryptedBreakdown: string;
  readonly anonymityScore: number;
  readonly settlementProof: string;
  readonly timestamp: number;
  readonly paymentHash: string;
}

export type PaymentFailureReason = 
  | 'INSUFFICIENT_BALANCE'
  | 'NETWORK_ERROR'
  | 'INVALID_PROOF'
  | 'TIMEOUT'
  | 'TEMPORARY_FAILURE'
  | 'WALLET_CONNECTION_FAILED'
  | 'CROSS_CHAIN_ERROR'
  | 'INSUFFICIENT_GAS';

export interface PartialPayment {
  readonly paymentId: string;
  readonly contributorHash: string;
  readonly circleId: string;
  readonly round: number;
  readonly amountPaid: bigint;
  readonly amountDue: bigint;
  readonly shortfall: bigint;
  readonly timestamp: number;
  readonly nextPaymentDue: number;
  readonly isPartial: boolean;
}

export interface PaymentRetryPolicy {
  readonly maxAttempts: number;
  readonly baseDelay: number;
  readonly backoffMultiplier: number;
  readonly maxDelay: number;
}

export interface PaymentSchedule {
  readonly circleId: string;
  readonly round: number;
  readonly dueDate: number;
  readonly amount: bigint;
  readonly contributorHashes: string[];
  readonly recipientHash: string;
}

export interface CollectionStatus {
  readonly circleId: string;
  readonly round: number;
  readonly totalExpected: bigint;
  totalCollected: bigint;
  successfulPayments: number;
  partialPayments: number;
  failedPayments: number;
  completionRate: number;
}

export interface CrossChainSettlement {
  readonly settlementId: string;
  readonly sourceChains: string[];
  readonly targetChain: string;
  readonly totalAmount: bigint;
  readonly amountPerChain: Map<string, bigint>;
  readonly settlementProofs: string[];
  readonly anonymityScore: number;
  readonly completionTime: number;
}

// Privacy-Preserving Risk Management Types
export interface RiskAssessment {
  readonly memberHash: string;
  readonly riskScore: number; // 0-100, higher = more risky
  readonly stakeAdequacy: boolean;
  readonly defaultProbability: number; // 0-1
  readonly liquidationRisk: number; // 0-1
  readonly zkProof: string; // ZK proof of assessment validity
  readonly assessmentTimestamp: number;
}

export interface DefaultDetectionResult {
  readonly detectionId: string;
  readonly circleId: string;
  readonly round: number;
  readonly anonymousFlags: AnonymousDefaultFlag[];
  readonly confidentialSeverity: number; // 0-10 scale
  readonly requiresIntervention: boolean;
  readonly zkProof: string; // Proof of valid detection without revealing member
}

export interface AnonymousDefaultFlag {
  readonly flagId: string;
  readonly nullifierHash: string; // Prevents duplicate flagging
  readonly severityCommitment: string; // Pedersen commitment to severity
  readonly evidenceHash: string; // Hash of encrypted evidence
  readonly flagTimestamp: number;
  readonly zkProof: string; // Proof flag is valid without revealing flagger
}

export interface LiquidationOrder {
  readonly orderId: string;
  readonly targetCommitment: string; // ZK commitment to target member
  readonly liquidationAmount: bigint;
  readonly confidentialReason: string; // Encrypted liquidation reason
  readonly executionDeadline: number;
  readonly recoveredAssets: EncryptedAssetRecord[];
  readonly zkProof: string; // Proof liquidation is justified
}

export interface EncryptedAssetRecord {
  readonly assetId: string;
  readonly encryptedValue: string; // Encrypted asset value
  readonly encryptedType: string; // Encrypted asset type
  readonly recoveryProof: string; // ZK proof of recovery
}

export interface PenaltyEnforcement {
  readonly penaltyId: string;
  readonly targetNullifier: string; // Anonymous target identifier
  readonly penaltyType: 'STAKE_REDUCTION' | 'TRUST_SCORE_PENALTY' | 'TEMPORARY_SUSPENSION' | 'PERMANENT_BAN';
  readonly encryptedSeverity: string; // Encrypted penalty severity
  readonly enforcementProof: string; // ZK proof penalty is justified
  readonly appliedTimestamp: number;
  readonly appealDeadline?: number;
}

export interface EncryptedInsuranceRecord {
  readonly recordId: string;
  readonly encryptedClaimAmount: string;
  readonly encryptedClaimType: string;
  readonly encryptedPayoutAmount: string;
  readonly confidentialityProof: string; // ZK proof of confidentiality
  readonly processingTimestamp: number;
}

export interface PrivateStakeCalculation {
  readonly memberCommitment: string; // ZK commitment to member identity
  readonly requiredStakeCommitment: string; // Commitment to required stake
  readonly actualStakeProof: string; // ZK proof of actual stake adequacy
  readonly trustScoreContribution: string; // Encrypted trust score impact
  readonly riskAdjustment: string; // Encrypted risk-based adjustment
  readonly calculationProof: string; // ZK proof calculation is correct
}

export interface RiskManagementParams {
  readonly memberHash: string;
  readonly circleId: string;
  readonly assessmentType: 'STAKE_CALCULATION' | 'DEFAULT_DETECTION' | 'LIQUIDATION_ASSESSMENT' | 'PENALTY_EVALUATION';
  readonly zkProof: string;
  readonly encryptedData: string;
}

// Default privacy parameters for Midnight blockchain
export const DEFAULT_PRIVACY_PARAMS = {
  zkSnarkParams: 'groth16-bn254',
  commitmentScheme: 'pedersen-blake2s',
  nullifierDerivation: 'poseidon-hash',
  proofVerificationKey: JSON.stringify({
    protocol: 'groth16',
    curve: 'bn128',
    nPublic: 4,
    vk_alpha_1: ['0x1', '0x2'],
    vk_beta_2: [['0x3', '0x4'], ['0x5', '0x6']],
    vk_gamma_2: [['0x7', '0x8'], ['0x9', '0xa']],
    vk_delta_2: [['0xb', '0xc'], ['0xd', '0xe']],
    vk_alphabeta_12: [
      [['0xf', '0x10'], ['0x11', '0x12']],
      [['0x13', '0x14'], ['0x15', '0x16']]
    ],
    IC: [['0x17', '0x18'], ['0x19', '0x1a'], ['0x1b', '0x1c'], ['0x1d', '0x1e']]
  })
};