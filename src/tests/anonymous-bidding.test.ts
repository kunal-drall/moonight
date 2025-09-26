/**
 * Anonymous Bidding System Tests for Moonight Protocol
 * Tests the complete ZK-based bidding functionality
 */

import {
  createMoonightProtocol,
  generateMemberIdentity,
  createMembershipProof,
  DEFAULT_PRIVACY_PARAMS,
  DEFAULT_CIRCLE_PARAMS,
  BiddingCircuit,
  BidAuctionManager
} from '../index';

describe('Anonymous Bidding System', () => {
  let protocol: any;
  let biddingCircuit: BiddingCircuit;
  let auctionManager: BidAuctionManager;
  let creator: any;
  let member1: any;
  let member2: any;
  let member3: any;
  let circleId: string;

  beforeEach(async () => {
    // Initialize protocol and components
    protocol = createMoonightProtocol(DEFAULT_PRIVACY_PARAMS);
    biddingCircuit = new BiddingCircuit(DEFAULT_PRIVACY_PARAMS);
    auctionManager = new BidAuctionManager(DEFAULT_PRIVACY_PARAMS);

    // Generate member identities
    creator = await generateMemberIdentity('creator-secret');
    member1 = await generateMemberIdentity('member1-secret');
    member2 = await generateMemberIdentity('member2-secret');
    member3 = await generateMemberIdentity('member3-secret');

    // Create circle with members - need to boost creator's trust score first
    // Set creator's trust score directly in the state for testing
    protocol.getState().trustScores.set(creator.identityCommitment, 600); // Builder tier

    const creatorProof = await createMembershipProof(creator.secretKey);
    circleId = await protocol.createCircle(
      creator.identityCommitment,
      {
        ...DEFAULT_CIRCLE_PARAMS,
        maxMembers: 5,
        monthlyAmount: BigInt('1000000000000000000'), // 1 token
        stakeRequirement: BigInt('500000000000000000') // 0.5 token (Guardian tier requirement)
      },
      creatorProof
    );

    // Add members to circle
    for (const member of [member1, member2, member3]) {
      const memberProof = await createMembershipProof(member.secretKey);
      await protocol.joinCircle({
        circleId,
        membershipProof: memberProof,
        stakeAmount: BigInt('500000000000000000'), // Match circle requirement
        identityCommitment: member.identityCommitment
      });
    }
  });

  describe('Bidding Circuit', () => {
    test('should generate valid bid proof', async () => {
      const bidData = {
        amount: BigInt('50000000000000000'), // 0.05 token (5% interest)
        memberHash: member1.identityCommitment,
        round: 1,
        randomness: 'test-randomness-123'
      };

      const membershipWitness = 'test-witness';
      const minBid = BigInt('1000000000000000'); // 0.001 token
      const maxBid = BigInt('500000000000000000'); // 0.5 token

      const proof = await biddingCircuit.generateBidProof(
        bidData,
        circleId,
        minBid,
        maxBid,
        membershipWitness
      );

      expect(proof.commitment).toBeDefined();
      expect(proof.nullifier).toBeDefined();
      expect(proof.rangeProof).toBeDefined();
      expect(proof.membershipProof).toBeDefined();
      expect(proof.fairnessProof).toBeDefined();
    });

    test('should verify valid bid proof', async () => {
      const bidData = {
        amount: BigInt('30000000000000000'), // 0.03 token
        memberHash: member2.identityCommitment,
        round: 1,
        randomness: 'test-randomness-456'
      };

      const membershipWitness = 'test-witness';
      const minBid = BigInt('1000000000000000');
      const maxBid = BigInt('500000000000000000');

      const proof = await biddingCircuit.generateBidProof(
        bidData,
        circleId,
        minBid,
        maxBid,
        membershipWitness
      );

      const isValid = await biddingCircuit.verifyBidProof(
        proof,
        circleId,
        minBid,
        maxBid
      );

      expect(isValid).toBe(true);
    });

    test('should generate winner selection proof', async () => {
      const bidCommitments = [
        'commitment1',
        'commitment2',
        'commitment3'
      ];
      const winnerIndex = 1; // Second bidder wins
      const winnerAmount = BigInt('25000000000000000'); // 0.025 token

      const proof = await biddingCircuit.generateWinnerSelectionProof(
        bidCommitments,
        winnerIndex,
        winnerAmount,
        circleId
      );

      expect(proof.winnerCommitment).toBeDefined();
      expect(proof.winningAmount).toBeDefined();
      expect(proof.selectionProof).toBeDefined();
      expect(proof.fairnessProof).toBeDefined();
    });

    test('should verify winner selection proof', async () => {
      const bidCommitments = [
        'commitment1',
        'commitment2',
        'commitment3'
      ];
      const winnerIndex = 0;
      const winnerAmount = BigInt('20000000000000000');

      const proof = await biddingCircuit.generateWinnerSelectionProof(
        bidCommitments,
        winnerIndex,
        winnerAmount,
        circleId
      );

      const isValid = await biddingCircuit.verifyWinnerSelectionProof(
        proof,
        bidCommitments,
        circleId
      );

      expect(isValid).toBe(true);
    });
  });

  describe('Bid Auction Manager', () => {
    let auctionId: string;

    test('should start bidding round', async () => {
      const eligibleMembers = [
        member1.identityCommitment,
        member2.identityCommitment,
        member3.identityCommitment
      ];

      auctionId = await auctionManager.startBiddingRound(
        circleId,
        1,
        eligibleMembers,
        24, // 24 hours
        BigInt('1000000000000000'),
        BigInt('100000000000000000')
      );

      expect(auctionId).toBeDefined();
      expect(typeof auctionId).toBe('string');

      const stats = auctionManager.getAuctionStatistics(auctionId);
      expect(stats?.status).toBe('OPEN');
      expect(stats?.eligibleMembers).toBe(3);
    });

    test('should submit anonymous bids', async () => {
      const eligibleMembers = [member1.identityCommitment, member2.identityCommitment];
      
      auctionId = await auctionManager.startBiddingRound(
        circleId,
        1,
        eligibleMembers,
        24,
        BigInt('1000000000000000'),
        BigInt('100000000000000000')
      );

      // Submit first bid
      const bidData1 = {
        amount: BigInt('40000000000000000'), // 0.04 token
        memberHash: member1.identityCommitment,
        round: 1,
        randomness: 'randomness-1'
      };

      const result1 = await auctionManager.submitAnonymousBid(
        auctionId,
        bidData1,
        'membership-witness-1'
      );

      expect(result1).toBe(true);

      // Submit second bid
      const bidData2 = {
        amount: BigInt('35000000000000000'), // 0.035 token
        memberHash: member2.identityCommitment,
        round: 1,
        randomness: 'randomness-2'
      };

      const result2 = await auctionManager.submitAnonymousBid(
        auctionId,
        bidData2,
        'membership-witness-2'
      );

      expect(result2).toBe(true);

      const stats = auctionManager.getAuctionStatistics(auctionId);
      expect(stats?.participantCount).toBe(2);
    });

    test('should prevent double bidding using nullifiers', async () => {
      const eligibleMembers = [member1.identityCommitment];
      
      auctionId = await auctionManager.startBiddingRound(
        circleId,
        1,
        eligibleMembers,
        24,
        BigInt('1000000000000000'),
        BigInt('100000000000000000')
      );

      const bidData = {
        amount: BigInt('40000000000000000'),
        memberHash: member1.identityCommitment,
        round: 1,
        randomness: 'same-randomness' // Same randomness = same nullifier
      };

      // First bid should succeed
      const result1 = await auctionManager.submitAnonymousBid(
        auctionId,
        bidData,
        'membership-witness'
      );

      expect(result1).toBe(true);

      // Second bid with same parameters should fail
      await expect(
        auctionManager.submitAnonymousBid(
          auctionId,
          bidData,
          'membership-witness'
        )
      ).rejects.toThrow('Double bidding attempt detected');
    });

    test('should finalize bidding and select winner', async () => {
      const eligibleMembers = [member1.identityCommitment, member2.identityCommitment];
      
      auctionId = await auctionManager.startBiddingRound(
        circleId,
        1,
        eligibleMembers,
        24,
        BigInt('1000000000000000'),
        BigInt('100000000000000000')
      );

      // Submit multiple bids
      const bidData1 = {
        amount: BigInt('50000000000000000'),
        memberHash: member1.identityCommitment,
        round: 1,
        randomness: 'rand-1'
      };

      const bidData2 = {
        amount: BigInt('30000000000000000'), // Lower bid (should win)
        memberHash: member2.identityCommitment,
        round: 1,
        randomness: 'rand-2'
      };

      await auctionManager.submitAnonymousBid(auctionId, bidData1, 'witness-1');
      await auctionManager.submitAnonymousBid(auctionId, bidData2, 'witness-2');

      // Finalize bidding
      const result = await auctionManager.finalizeBidding(auctionId);

      expect(result.totalBids).toBe(2);
      expect(result.fairnessVerified).toBe(true);
      expect(result.winnerCommitment).toBeDefined();
      expect(result.selectionProof).toBeDefined();

      const stats = auctionManager.getAuctionStatistics(auctionId);
      expect(stats?.status).toBe('FINALIZED');
      expect(stats?.winnerSelected).toBe(true);
    });

    test('should verify auction integrity', async () => {
      const eligibleMembers = [member1.identityCommitment];
      
      auctionId = await auctionManager.startBiddingRound(
        circleId,
        1,
        eligibleMembers,
        24,
        BigInt('1000000000000000'),
        BigInt('100000000000000000')
      );

      const bidData = {
        amount: BigInt('40000000000000000'),
        memberHash: member1.identityCommitment,
        round: 1,
        randomness: 'integrity-test'
      };

      await auctionManager.submitAnonymousBid(auctionId, bidData, 'witness');
      await auctionManager.finalizeBidding(auctionId);

      const integrityVerified = await auctionManager.verifyAuctionIntegrity(auctionId);
      expect(integrityVerified).toBe(true);
    });
  });

  describe('Protocol Integration', () => {
    test('should start anonymous bidding round through protocol', async () => {
      const auctionId = await protocol.startAnonymousBiddingRound(
        circleId,
        1,
        24
      );

      expect(auctionId).toBeDefined();
      expect(typeof auctionId).toBe('string');

      const phase = protocol.getBiddingPhase(auctionId);
      expect(phase?.phase).toBe('SUBMISSION');
      expect(phase?.participantCount).toBe(0);
    });

    test('should submit anonymous bid through protocol', async () => {
      const auctionId = await protocol.startAnonymousBiddingRound(
        circleId,
        1,
        24
      );

      const result = await protocol.submitAnonymousBid(
        auctionId,
        member1.identityCommitment,
        BigInt('45000000000000000'), // 0.045 token
        'membership-witness'
      );

      expect(result).toBe(true);

      const phase = protocol.getBiddingPhase(auctionId);
      expect(phase?.participantCount).toBe(1);
    });

    test('should validate bid with comprehensive proofs', async () => {
      const bidCommitment = 'test-commitment';
      const membershipProof = JSON.stringify({
        valid: true,
        circleId: circleId
      });
      const rangeProof = JSON.stringify({
        valid: true,
        zkProof: { valid: true },
        minBid: '1',
        maxBid: '500000000000000000'
      });
      const fairnessProof = JSON.stringify({ valid: true });
      const nullifier = 'test-nullifier';
      const usedNullifiers = new Set<string>();

      const isValid = await protocol.validateBidWithProofs(
        circleId,
        member1.identityCommitment,
        bidCommitment,
        membershipProof,
        rangeProof,
        fairnessProof,
        nullifier,
        usedNullifiers
      );

      expect(isValid).toBe(true);
    });

    test('should batch validate multiple bids', async () => {
      const bidProofs = [
        {
          bidCommitment: 'commitment-1',
          membershipProof: JSON.stringify({ valid: true, circleId }),
          rangeProof: JSON.stringify({
            valid: true,
            zkProof: { valid: true },
            minBid: '1',
            maxBid: '500000000000000000'
          }),
          fairnessProof: JSON.stringify({ valid: true }),
          nullifier: 'nullifier-1'
        },
        {
          bidCommitment: 'commitment-2',
          membershipProof: JSON.stringify({ valid: true, circleId }),
          rangeProof: JSON.stringify({
            valid: true,
            zkProof: { valid: true },
            minBid: '1',
            maxBid: '500000000000000000'
          }),
          fairnessProof: JSON.stringify({ valid: true }),
          nullifier: 'nullifier-2'
        }
      ];

      const results = await protocol.batchValidateBids(
        circleId,
        bidProofs,
        new Set<string>()
      );

      expect(results).toHaveLength(2);
      expect(results[0]).toBe(true);
      expect(results[1]).toBe(true);
    });
  });

  describe('Privacy and Fairness', () => {
    test('should maintain bidder anonymity', async () => {
      const auctionId = await protocol.startAnonymousBiddingRound(circleId, 1, 24);

      // Submit bids from different members
      await protocol.submitAnonymousBid(
        auctionId,
        member1.identityCommitment,
        BigInt('40000000000000000'),
        'witness-1'
      );

      await protocol.submitAnonymousBid(
        auctionId,
        member2.identityCommitment,
        BigInt('35000000000000000'),
        'witness-2'
      );

      const stats = protocol.getAuctionStatistics(auctionId);
      
      // Statistics should not reveal individual bidder identities
      expect(stats.participantCount).toBe(2);
      expect(stats).not.toHaveProperty('bidders');
      expect(stats).not.toHaveProperty('memberHashes');
    });

    test('should ensure auction fairness through proofs', async () => {
      const auctionId = await protocol.startAnonymousBiddingRound(circleId, 1, 1); // 1 hour

      // Submit multiple bids
      await protocol.submitAnonymousBid(
        auctionId,
        member1.identityCommitment,
        BigInt('60000000000000000'),
        'witness-1'
      );

      await protocol.submitAnonymousBid(
        auctionId,
        member2.identityCommitment,
        BigInt('45000000000000000'),
        'witness-2'
      );

      const result = await protocol.finalizeBiddingRound(auctionId);

      // Should have fairness verification
      expect(result.fairnessVerified).toBe(true);
      expect(result.selectionProof).toBeDefined();

      // Verify auction integrity
      const integrityCheck = await protocol.verifyAuctionIntegrity(auctionId);
      expect(integrityCheck).toBe(true);
    });

    test('should prevent manipulation through ZK proofs', async () => {
      // Test that invalid proofs are rejected
      const invalidMembershipProof = JSON.stringify({ valid: false });
      const invalidRangeProof = JSON.stringify({
        valid: false,
        zkProof: { valid: false }
      });

      const isValid = await protocol.validateBidWithProofs(
        circleId,
        member1.identityCommitment,
        'commitment',
        invalidMembershipProof,
        invalidRangeProof,
        JSON.stringify({ valid: true }),
        'nullifier',
        new Set<string>()
      );

      expect(isValid).toBe(false);
    });
  });
});