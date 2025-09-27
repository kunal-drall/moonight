/**
 * Tests for Enhanced Private Governance System
 * Tests trust-weighted voting, proposal lifecycle, and privacy-preserving tallying
 */

import { MoonightProtocol } from '../contracts/MoonightProtocol';
import { GovernanceManager } from '../utils/governance';
import { PrivacyUtils } from '../utils/privacy';
import { TrustScoreCalculator } from '../utils/trust-score';
import { 
  PrivacyParams, 
  CreateProposalParams,
  GovernanceProposal,
  AnonymousVote,
  VoteTallyResult 
} from '../types';

describe('Enhanced Private Governance System', () => {
  let protocol: MoonightProtocol;
  let governanceManager: GovernanceManager;
  let privacyUtils: PrivacyUtils;
  let trustCalculator: TrustScoreCalculator;

  const mockPrivacyParams: PrivacyParams = {
    zkSnarkParams: 'test-params',
    commitmentScheme: 'pedersen',
    nullifierDerivation: 'poseidon',
    proofVerificationKey: 'test-verification-key'
  };

  beforeEach(() => {
    protocol = new MoonightProtocol(mockPrivacyParams);
    privacyUtils = new PrivacyUtils(mockPrivacyParams);
    trustCalculator = new TrustScoreCalculator();
    governanceManager = new GovernanceManager(privacyUtils, trustCalculator);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Trust-Weighted Voting', () => {
    test('should create trust-weighted vote commitment', async () => {
      const vote = true;
      const voterSecret = 'voter-secret-123';
      const trustScore = 750;

      const commitment = await governanceManager.generateTrustWeightedVoteCommitment(
        vote,
        voterSecret,
        trustScore
      );

      expect(commitment.commitment).toBeDefined();
      expect(commitment.randomness).toBeDefined();
      expect(commitment.voterSecret).toBe(voterSecret);
    });

    test('should verify vote eligibility based on trust score', async () => {
      const voterHash = 'voter-123';
      const proposalId = 'proposal-456';
      
      const mockProposal: GovernanceProposal = {
        proposalId,
        proposalType: 'INTEREST_RATE',
        proposalData: 'test proposal',
        votingDeadline: Date.now() + 86400000,
        requiredQuorum: 51,
        minimumTrustScore: 500,
        isActive: true,
        status: 'ACTIVE',
        createdAt: Date.now()
      };

      const membershipProof = JSON.stringify({
        memberSecret: 'secret',
        proof: { valid: true }
      });

      // Mock trust score calculation
      jest.spyOn(trustCalculator, 'calculateScore').mockResolvedValue(750);

      const eligibility = await governanceManager.verifyVoteEligibility(
        voterHash,
        proposalId,
        mockProposal,
        membershipProof
      );

      expect(eligibility.eligible).toBe(true);
      expect(eligibility.trustScore).toBe(750);
    });

    test('should reject voters with insufficient trust score', async () => {
      const voterHash = 'voter-low-trust';
      const proposalId = 'proposal-456';
      
      const mockProposal: GovernanceProposal = {
        proposalId,
        proposalType: 'INTEREST_RATE',
        proposalData: 'test proposal',
        votingDeadline: Date.now() + 86400000,
        requiredQuorum: 51,
        minimumTrustScore: 500,
        isActive: true,
        status: 'ACTIVE',
        createdAt: Date.now()
      };

      const membershipProof = JSON.stringify({
        memberSecret: 'secret',
        proof: { valid: true }
      });

      // Mock low trust score
      jest.spyOn(trustCalculator, 'calculateScore').mockResolvedValue(300);

      const eligibility = await governanceManager.verifyVoteEligibility(
        voterHash,
        proposalId,
        mockProposal,
        membershipProof
      );

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.reason).toContain('Trust score 300 below minimum 500');
    });
  });

  describe('Proposal Lifecycle Management', () => {
    test('should create proposal with enhanced parameters', async () => {
      const creatorHash = 'creator-123';
      const creatorProof = JSON.stringify({
        commitment: 'commitment-hash-creator-123',
        nullifier: 'nullifier-creator-123',
        proof: { valid: true }
      });

      // Mock high trust score for proposal creation
      jest.spyOn(trustCalculator, 'calculateScore').mockResolvedValue(600);

      const params: CreateProposalParams = {
        proposalType: 'INTEREST_RATE',
        proposalData: 'Increase circle interest rate to 7%',
        votingPeriod: 604800, // 7 days
        requiredQuorum: 60,
        circleId: 'circle-123',
        minimumTrustScore: 400,
        executionPeriod: 86400 // 1 day execution window
      };

      const proposalId = await protocol.createProposal(creatorHash, params, creatorProof);

      expect(proposalId).toBeDefined();
      
      const results = protocol.getProposalResults(proposalId);
      expect(results.proposal).toBeDefined();
      expect(results.proposal?.status).toBe('ACTIVE');
      expect(results.proposal?.circleId).toBe('circle-123');
      expect(results.proposal?.minimumTrustScore).toBe(400);
    });

    test('should reject proposal creation from low-trust member', async () => {
      const creatorHash = 'low-trust-creator';
      const creatorProof = JSON.stringify({
        commitment: 'commitment-hash-low-trust',
        nullifier: 'nullifier-low-trust',
        proof: { valid: true }
      });

      // Mock low trust score directly on the protocol's trust calculator
      jest.spyOn(protocol.trustCalculator, 'calculateScore').mockResolvedValue(300);

      const params: CreateProposalParams = {
        proposalType: 'INTEREST_RATE',
        proposalData: 'Test proposal',
        votingPeriod: 604800,
        requiredQuorum: 60
      };

      await expect(protocol.createProposal(creatorHash, params, creatorProof))
        .rejects.toThrow('Insufficient trust score for proposal creation');
    });

    test('should handle proposal execution with privacy preservation', async () => {
      // First create a proposal
      const creatorHash = 'creator-123';
      const creatorProof = JSON.stringify({
        commitment: 'commitment-hash-execution',
        nullifier: 'nullifier-execution',
        proof: { valid: true }
      });

      jest.spyOn(trustCalculator, 'calculateScore').mockResolvedValue(600);

      const params: CreateProposalParams = {
        proposalType: 'INTEREST_RATE',
        proposalData: 'Set interest rate to 8%',
        votingPeriod: 100, // Short period for testing
        requiredQuorum: 1, // Low quorum for testing
        executionPeriod: 86400
      };

      const proposalId = await protocol.createProposal(creatorHash, params, creatorProof);

      // Simulate voting
      const voterHash = 'voter-123';
      const voteCommitment = JSON.stringify({ choice: true });
      const zkNullifier = 'nullifier-123';
      const membershipProof = JSON.stringify({
        memberSecret: 'voter-secret',
        proof: { valid: true }
      });

      jest.spyOn(trustCalculator, 'calculateScore').mockResolvedValue(750);

      // Cast vote
      await protocol.castVote(voterHash, proposalId, voteCommitment, zkNullifier, membershipProof);

      // Wait for voting period to end (simulate)
      const proposal = protocol.getProposalResults(proposalId).proposal!;
      const updatedProposal: GovernanceProposal = {
        ...proposal,
        votingDeadline: Date.now() - 1000 // Expired
      };
      
      // Manually update for testing
      (protocol as any).state.governanceProposals.set(proposalId, updatedProposal);

      // Tally votes
      const tallyResult = await protocol.tallyVotesAndFinalize(proposalId);

      expect(tallyResult.passed).toBe(true);
      expect(tallyResult.privacyPreserved).toBe(true);
      expect(tallyResult.totalTrustWeight).toBeGreaterThan(0);

      // Execute proposal
      const executorHash = 'executor-123';
      const executionData = { newInterestRate: 800 }; // 8%

      const executed = await protocol.executeProposal(proposalId, executorHash, executionData);
      expect(executed).toBe(true);

      const finalResults = protocol.getProposalResults(proposalId);
      expect(finalResults.proposal?.status).toBe('EXECUTED');
      expect(finalResults.execution).toBeDefined();
    });
  });

  describe('Confidential Vote Tallying', () => {
    test('should tally votes while preserving individual privacy', async () => {
      const proposalId = 'test-proposal';
      const mockProposal: GovernanceProposal = {
        proposalId,
        proposalType: 'CIRCLE_PARAMS',
        proposalData: 'test',
        votingDeadline: Date.now() + 1000,
        requiredQuorum: 25, // Lower quorum: 25% (3/10 = 30% meets this)
        isActive: true,
        status: 'ACTIVE',
        createdAt: Date.now()
      };

      const votes: AnonymousVote[] = [
        {
          voteHash: 'hash1',
          proposalId,
          zkNullifier: 'null1',
          zkProof: 'proof1',
          trustWeight: 500,
          voteChoice: true,
          timestamp: Date.now()
        },
        {
          voteHash: 'hash2',
          proposalId,
          zkNullifier: 'null2',
          zkProof: 'proof2',
          trustWeight: 750,
          voteChoice: false,
          timestamp: Date.now()
        },
        {
          voteHash: 'hash3',
          proposalId,
          zkNullifier: 'null3',
          zkProof: 'proof3',
          trustWeight: 600,
          voteChoice: true,
          timestamp: Date.now()
        }
      ];

      const totalEligibleMembers = 10;

      const tally = await governanceManager.tallyVotesConfidentially(
        proposalId,
        votes,
        mockProposal,
        totalEligibleMembers
      );

      expect(tally.totalVotes).toBe(3);
      expect(tally.yesVotes).toBe(2);
      expect(tally.noVotes).toBe(1);
      expect(tally.yesTrustWeight).toBe(1100); // 500 + 600
      expect(tally.noTrustWeight).toBe(750);
      expect(tally.passed).toBe(true); // Yes trust weight > No trust weight
      expect(tally.privacyPreserved).toBe(true);
    });

    test('should verify tally integrity without revealing votes', async () => {
      const votes: AnonymousVote[] = [
        {
          voteHash: 'hash1',
          proposalId: 'prop1',
          zkNullifier: 'null1',
          zkProof: 'proof1',
          trustWeight: 500,
          voteChoice: true,
          timestamp: Date.now()
        },
        {
          voteHash: 'hash2',
          proposalId: 'prop1',
          zkNullifier: 'null2',
          zkProof: 'proof2',
          trustWeight: 300,
          voteChoice: false,
          timestamp: Date.now()
        }
      ];

      const tallyResult: VoteTallyResult = {
        proposalId: 'prop1',
        totalVotes: 2,
        yesVotes: 1,
        noVotes: 1,
        totalTrustWeight: 800,
        yesTrustWeight: 500,
        noTrustWeight: 300,
        quorumMet: true,
        passed: true,
        privacyPreserved: true
      };

      const nullifierSet = new Set<string>();

      const isValid = await governanceManager.verifyTallyIntegrity(
        votes,
        tallyResult,
        nullifierSet
      );

      expect(isValid).toBe(true);
    });

    test('should detect double voting attempts', async () => {
      const votes: AnonymousVote[] = [
        {
          voteHash: 'hash1',
          proposalId: 'prop1',
          zkNullifier: 'duplicate-nullifier',
          zkProof: 'proof1',
          trustWeight: 500,
          voteChoice: true,
          timestamp: Date.now()
        },
        {
          voteHash: 'hash2',
          proposalId: 'prop1',
          zkNullifier: 'duplicate-nullifier', // Same nullifier!
          zkProof: 'proof2',
          trustWeight: 300,
          voteChoice: false,
          timestamp: Date.now()
        }
      ];

      const tallyResult: VoteTallyResult = {
        proposalId: 'prop1',
        totalVotes: 2,
        yesVotes: 1,
        noVotes: 1,
        totalTrustWeight: 800,
        yesTrustWeight: 500,
        noTrustWeight: 300,
        quorumMet: true,
        passed: true,
        privacyPreserved: true
      };

      const nullifierSet = new Set<string>();

      const isValid = await governanceManager.verifyTallyIntegrity(
        votes,
        tallyResult,
        nullifierSet
      );

      expect(isValid).toBe(false); // Should detect duplicate nullifiers
    });
  });

  describe('Democratic Interest Rate Setting', () => {
    test('should allow democratic interest rate changes', async () => {
      const circleId = 'test-circle-123';
      
      // Create a mock circle first
      (protocol as any).state.circles.set(circleId, {
        circleId,
        memberCount: 5,
        maxMembers: 10,
        monthlyAmount: 1000n,
        interestRate: 500, // 5%
        currentRound: 1,
        totalRounds: 12,
        createdBlock: 1000,
        isActive: true,
        zkMembershipRoot: 'test-root'
      });

      // Create interest rate proposal
      const creatorHash = 'creator-123';
      const creatorProof = JSON.stringify({
        commitment: 'commitment-hash-rate-change',
        nullifier: 'nullifier-rate-change-creator',
        proof: { valid: true }
      });

      jest.spyOn(trustCalculator, 'calculateScore').mockResolvedValue(600);

      const params: CreateProposalParams = {
        proposalType: 'INTEREST_RATE',
        proposalData: 'Increase interest rate from 5% to 7%',
        votingPeriod: 100,
        requiredQuorum: 15, // Lower quorum for testing - 1 vote out of 5 members = 20%
        circleId,
        minimumTrustScore: 300
      };

      const proposalId = await protocol.createProposal(creatorHash, params, creatorProof);

      // Vote on the proposal
      const voterHash = 'voter-123';
      const voteCommitment = JSON.stringify({ choice: true });
      const zkNullifier = 'nullifier-rate-change';
      const membershipProof = JSON.stringify({
        memberSecret: 'voter-secret',
        proof: { valid: true }
      });

      jest.spyOn(trustCalculator, 'calculateScore').mockResolvedValue(750);

      await protocol.castVote(voterHash, proposalId, voteCommitment, zkNullifier, membershipProof);

      // Expire voting period and tally
      const proposal = protocol.getProposalResults(proposalId).proposal!;
      const updatedProposal: GovernanceProposal = {
        ...proposal,
        votingDeadline: Date.now() - 1000
      };
      (protocol as any).state.governanceProposals.set(proposalId, updatedProposal);

      const tallyResult = await protocol.tallyVotesAndFinalize(proposalId);
      expect(tallyResult.passed).toBe(true);

      // Execute the interest rate change
      const executorHash = 'executor-123';
      const executionData = { newInterestRate: 700 }; // 7%

      await protocol.executeProposal(proposalId, executorHash, executionData);

      // Verify the circle's interest rate was updated
      const updatedCircle = (protocol as any).state.circles.get(circleId);
      expect(updatedCircle.interestRate).toBe(700);
    });
  });

  describe('Quorum and Privacy Verification', () => {
    test('should enforce quorum requirements', async () => {
      const proposalId = 'quorum-test';
      const mockProposal: GovernanceProposal = {
        proposalId,
        proposalType: 'PENALTY_RULES',
        proposalData: 'test',
        votingDeadline: Date.now() + 1000,
        requiredQuorum: 75, // High quorum requirement
        isActive: true,
        status: 'ACTIVE',
        createdAt: Date.now()
      };

      // Only 2 votes out of 10 eligible members (20% participation)
      const votes: AnonymousVote[] = [
        {
          voteHash: 'hash1',
          proposalId,
          zkNullifier: 'null1',
          zkProof: 'proof1',
          trustWeight: 500,
          voteChoice: true,
          timestamp: Date.now()
        },
        {
          voteHash: 'hash2',
          proposalId,
          zkNullifier: 'null2',
          zkProof: 'proof2',
          trustWeight: 600,
          voteChoice: true,
          timestamp: Date.now()
        }
      ];

      const totalEligibleMembers = 10;

      const tally = await governanceManager.tallyVotesConfidentially(
        proposalId,
        votes,
        mockProposal,
        totalEligibleMembers
      );

      expect(tally.quorumMet).toBe(false); // 20% < 75% required
      expect(tally.passed).toBe(false); // Fails due to quorum
    });

    test('should generate valid execution proof', async () => {
      const proposalId = 'test-execution-proof';
      const tallyResult: VoteTallyResult = {
        proposalId,
        totalVotes: 5,
        yesVotes: 4,
        noVotes: 1,
        totalTrustWeight: 2500,
        yesTrustWeight: 2000,
        noTrustWeight: 500,
        quorumMet: true,
        passed: true,
        privacyPreserved: true
      };
      const executorHash = 'executor-123';

      const proof = await governanceManager.generateExecutionProof(
        proposalId,
        tallyResult,
        executorHash
      );

      expect(proof).toBeDefined();
      
      const proofData = JSON.parse(proof);
      expect(proofData.valid).toBe(true);
      expect(proofData.publicInputs.passed).toBe(true);
      expect(proofData.publicInputs.proposalId).toBe(proposalId);
    });
  });
});