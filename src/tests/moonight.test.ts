/**
 * Basic tests for Moonight Protocol
 * Tests core functionality and privacy features
 */

import {
  createMoonightProtocol,
  generateMemberIdentity,
  createMembershipProof,
  DEFAULT_PRIVACY_PARAMS,
  DEFAULT_CIRCLE_PARAMS
} from '../src';

describe('Moonight Protocol', () => {
  let protocol: any;
  let creator: any;
  let member1: any;
  let member2: any;

  beforeEach(async () => {
    protocol = createMoonightProtocol(DEFAULT_PRIVACY_PARAMS);
    creator = await generateMemberIdentity('creator-secret');
    member1 = await generateMemberIdentity('member1-secret');
    member2 = await generateMemberIdentity('member2-secret');
  });

  describe('Circle Creation', () => {
    test('should create a new lending circle', async () => {
      const creatorProof = await createMembershipProof(creator.secretKey);
      
      const circleId = await protocol.createCircle(
        creator.identityCommitment,
        DEFAULT_CIRCLE_PARAMS,
        creatorProof
      );

      expect(circleId).toBeDefined();
      expect(typeof circleId).toBe('string');

      const circleInfo = protocol.getCircleInfo(circleId);
      expect(circleInfo).toBeDefined();
      expect(circleInfo.maxMembers).toBe(DEFAULT_CIRCLE_PARAMS.maxMembers);
      expect(circleInfo.isActive).toBe(true);
    });

    test('should reject invalid creator proof', async () => {
      const invalidProof = 'invalid-proof';
      
      await expect(
        protocol.createCircle(
          creator.identityCommitment,
          DEFAULT_CIRCLE_PARAMS,
          invalidProof
        )
      ).rejects.toThrow('Invalid creator proof');
    });
  });

  describe('Circle Joining', () => {
    let circleId: string;

    beforeEach(async () => {
      const creatorProof = await createMembershipProof(creator.secretKey);
      circleId = await protocol.createCircle(
        creator.identityCommitment,
        DEFAULT_CIRCLE_PARAMS,
        creatorProof
      );
    });

    test('should allow member to join circle', async () => {
      const memberProof = await createMembershipProof(member1.secretKey);

      const result = await protocol.joinCircle({
        circleId,
        membershipProof: memberProof,
        stakeAmount: DEFAULT_CIRCLE_PARAMS.stakeRequirement,
        identityCommitment: member1.identityCommitment
      });

      expect(result).toBe(true);

      const circleInfo = protocol.getCircleInfo(circleId);
      expect(circleInfo.memberCount).toBe(1);
    });

    test('should reject invalid membership proof', async () => {
      await expect(
        protocol.joinCircle({
          circleId,
          membershipProof: 'invalid-proof',
          stakeAmount: DEFAULT_CIRCLE_PARAMS.stakeRequirement,
          identityCommitment: member1.identityCommitment
        })
      ).rejects.toThrow('Invalid membership proof');
    });

    test('should reject joining non-existent circle', async () => {
      const memberProof = await createMembershipProof(member1.secretKey);

      await expect(
        protocol.joinCircle({
          circleId: 'non-existent-circle',
          membershipProof: memberProof,
          stakeAmount: DEFAULT_CIRCLE_PARAMS.stakeRequirement,
          identityCommitment: member1.identityCommitment
        })
      ).rejects.toThrow('Circle not found or inactive');
    });
  });

  describe('Trust Score System', () => {
    test('should calculate trust score', async () => {
      const trustCalculator = protocol.trustCalculator;
      const score = await trustCalculator.calculateScore(member1.identityCommitment);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1000);
      expect(typeof score).toBe('number');
    });

    test('should update trust score with proof', async () => {
      const newScore = 750;
      const proof = await protocol.trustCalculator.generateProof(
        member1.identityCommitment,
        50
      );

      const result = await protocol.updateTrustScore({
        targetMemberHash: member1.identityCommitment,
        newScore,
        calculationProof: proof,
        witnessData: await protocol.privacyUtils.encryptWitnessData({
          action: 'test_update',
          reason: 'unit_test'
        })
      });

      expect(result).toBe(true);
    });

    test('should reject invalid trust score range', async () => {
      const proof = await protocol.trustCalculator.generateProof(
        member1.identityCommitment,
        50
      );

      await expect(
        protocol.updateTrustScore({
          targetMemberHash: member1.identityCommitment,
          newScore: 1500, // Invalid - over 1000
          calculationProof: proof,
          witnessData: 'encrypted-data'
        })
      ).rejects.toThrow('Trust score must be between 0 and 1000');
    });
  });

  describe('Bidding System', () => {
    let circleId: string;

    beforeEach(async () => {
      // Setup circle with member
      const creatorProof = await createMembershipProof(creator.secretKey);
      circleId = await protocol.createCircle(
        creator.identityCommitment,
        DEFAULT_CIRCLE_PARAMS,
        creatorProof
      );

      const memberProof = await createMembershipProof(member1.secretKey);
      await protocol.joinCircle({
        circleId,
        membershipProof: memberProof,
        stakeAmount: DEFAULT_CIRCLE_PARAMS.stakeRequirement,
        identityCommitment: member1.identityCommitment
      });
    });

    test('should submit confidential bid', async () => {
      const bidCommitment = await protocol.privacyUtils.generateCommitment(
        { amount: 1000, round: 1 }
      );
      const validityProof = JSON.stringify({
        commitment: bidCommitment,
        valid: true,
        rangeProof: { valid: true, commitment: bidCommitment }
      });

      const result = await protocol.submitBid(member1.identityCommitment, {
        circleId,
        round: 1,
        bidCommitment,
        validityProof
      });

      expect(result).toBe(true);
    });

    test('should reject bid from non-member', async () => {
      const bidCommitment = await protocol.privacyUtils.generateCommitment(
        { amount: 1000, round: 1 }
      );
      const validityProof = JSON.stringify({ valid: false });

      await expect(
        protocol.submitBid(member2.identityCommitment, {
          circleId,
          round: 1,
          bidCommitment,
          validityProof
        })
      ).rejects.toThrow('Not a circle member');
    });
  });

  describe('Payment System', () => {
    let circleId: string;

    beforeEach(async () => {
      // Setup circle with member
      const creatorProof = await createMembershipProof(creator.secretKey);
      circleId = await protocol.createCircle(
        creator.identityCommitment,
        DEFAULT_CIRCLE_PARAMS,
        creatorProof
      );

      const memberProof = await createMembershipProof(member1.secretKey);
      await protocol.joinCircle({
        circleId,
        membershipProof: memberProof,
        stakeAmount: DEFAULT_CIRCLE_PARAMS.stakeRequirement,
        identityCommitment: member1.identityCommitment
      });
    });

    test('should process payment with ZK proof', async () => {
      const paymentProof = JSON.stringify({
        payerCommitment: await protocol.privacyUtils.generateCommitment(member1.identityCommitment),
        amountCommitment: await protocol.privacyUtils.generateCommitment(
          DEFAULT_CIRCLE_PARAMS.monthlyAmount.toString()
        ),
        proof: { valid: true }
      });

      const result = await protocol.makePayment(member1.identityCommitment, {
        circleId,
        round: 1,
        paymentProof,
        recipientHash: creator.identityCommitment
      });

      expect(result).toBe(true);
    });
  });

  describe('Governance System', () => {
    test('should create governance proposal', async () => {
      const creatorProof = await createMembershipProof(creator.secretKey);

      const proposalId = await protocol.createProposal(
        creator.identityCommitment,
        {
          proposalType: 'INTEREST_RATE',
          proposalData: 'Increase interest rate to 6%',
          votingPeriod: 7 * 24 * 60 * 60, // 7 days
          requiredQuorum: 3
        },
        creatorProof
      );

      expect(proposalId).toBeDefined();
      expect(typeof proposalId).toBe('string');
    });

    test('should cast anonymous vote', async () => {
      const creatorProof = await createMembershipProof(creator.secretKey);
      
      const proposalId = await protocol.createProposal(
        creator.identityCommitment,
        {
          proposalType: 'INTEREST_RATE',
          proposalData: 'Test proposal',
          votingPeriod: 7 * 24 * 60 * 60,
          requiredQuorum: 1
        },
        creatorProof
      );

      const voteCommitment = await protocol.privacyUtils.generateVoteCommitment(
        true,
        member1.secretKey
      );
      const nullifier = await protocol.privacyUtils.generateNullifier(member1.secretKey);
      const membershipProof = JSON.stringify({
        memberSecret: member1.secretKey,
        proof: { valid: true }
      });

      const result = await protocol.castVote(
        member1.identityCommitment,
        proposalId,
        voteCommitment,
        nullifier,
        membershipProof
      );

      expect(result).toBe(true);
    });
  });

  describe('Insurance System', () => {
    test('should process insurance claim', async () => {
      // Setup member with stake
      const circleId = await setupCircleWithMember();
      
      const claimProof = JSON.stringify({
        claimantCommitment: await protocol.privacyUtils.generateCommitment(member1.identityCommitment),
        circleCommitment: await protocol.privacyUtils.generateCommitment(circleId),
        claimType: 'default',
        proof: { valid: true }
      });

      // First add some funds to insurance pool
      await protocol.updateInsurancePool(BigInt('1000000000000000000'), 1);

      const result = await protocol.processInsuranceClaim(
        member1.identityCommitment,
        circleId,
        claimProof
      );

      expect(result).toBe(true);
    });

    async function setupCircleWithMember() {
      const creatorProof = await createMembershipProof(creator.secretKey);
      const circleId = await protocol.createCircle(
        creator.identityCommitment,
        DEFAULT_CIRCLE_PARAMS,
        creatorProof
      );

      const memberProof = await createMembershipProof(member1.secretKey);
      await protocol.joinCircle({
        circleId,
        membershipProof: memberProof,
        stakeAmount: DEFAULT_CIRCLE_PARAMS.stakeRequirement,
        identityCommitment: member1.identityCommitment
      });

      return circleId;
    }
  });

  describe('Privacy Utils', () => {
    test('should generate secure commitments', async () => {
      const data = { test: 'data', amount: 1000 };
      const commitment1 = await protocol.privacyUtils.generateCommitment(data);
      const commitment2 = await protocol.privacyUtils.generateCommitment(data);

      expect(commitment1).toBeDefined();
      expect(commitment2).toBeDefined();
      expect(commitment1).not.toBe(commitment2); // Should be different due to randomness
    });

    test('should encrypt and decrypt witness data', async () => {
      const originalData = { action: 'payment', amount: 1000, onTime: true };
      
      const encrypted = await protocol.privacyUtils.encryptWitnessData(originalData);
      const decrypted = await protocol.privacyUtils.decryptWitnessData(encrypted);

      expect(decrypted).toEqual(originalData);
    });
  });
});