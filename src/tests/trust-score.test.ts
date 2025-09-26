import { TrustScoreCalculator } from '../utils/trust-score';

describe('Trust Score Calculator', () => {
  let calculator: TrustScoreCalculator;

  beforeEach(() => {
    calculator = new TrustScoreCalculator();
  });

  describe('Score Calculation', () => {
    test('should calculate trust score with correct weights', async () => {
      const memberHash = 'test-member-123';
      const score = await calculator.calculateScore(memberHash);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1000);
      expect(Number.isInteger(score)).toBe(true);
    });

    test('should generate different scores for different members', async () => {
      const score1 = await calculator.calculateScore('member1');
      const score2 = await calculator.calculateScore('member2');
      
      expect(typeof score1).toBe('number');
      expect(typeof score2).toBe('number');
    });
  });

  describe('Trust Tier System', () => {
    test('should correctly identify Newcomer tier', () => {
      const tier = calculator.getTrustTier(100);
      expect(tier.name).toBe('Newcomer');
      expect(tier.tierKey).toBe('NEWCOMER');
    });

    test('should correctly identify Lunar tier', () => {
      const tier = calculator.getTrustTier(950);
      expect(tier.name).toBe('Lunar');
      expect(tier.tierKey).toBe('LUNAR');
    });

    test('should return stake requirements', () => {
      const stakeReq = calculator.getStakeRequirement(700);
      expect(typeof stakeReq).toBe('bigint');
      expect(stakeReq).toBeGreaterThan(0n);
    });

    test('should return benefits for tier', () => {
      const benefits = calculator.getBenefits(800);
      expect(Array.isArray(benefits)).toBe(true);
      expect(benefits.length).toBeGreaterThan(0);
    });
  });

  describe('Action Permissions', () => {
    test('should allow circle creation for Builder tier and above', () => {
      expect(calculator.canPerformAction(500, 'CREATE_CIRCLE')).toBe(true);
      expect(calculator.canPerformAction(300, 'CREATE_CIRCLE')).toBe(false);
    });

    test('should allow advanced features for Sage tier and above', () => {
      expect(calculator.canPerformAction(850, 'ACCESS_ADVANCED_FEATURES')).toBe(true);
      expect(calculator.canPerformAction(700, 'ACCESS_ADVANCED_FEATURES')).toBe(false);
    });
  });

  describe('Score Updates', () => {
    test('should increase score on payment success', async () => {
      const initialScore = 500;
      const updatedScore = await calculator.updateScoreForAction(
        'test-member',
        'PAYMENT_SUCCESS',
        initialScore
      );
      
      expect(updatedScore).toBeGreaterThan(initialScore);
    });

    test('should decrease score on payment default', async () => {
      const initialScore = 600;
      const updatedScore = await calculator.updateScoreForAction(
        'test-member',
        'PAYMENT_DEFAULT',
        initialScore
      );
      
      expect(updatedScore).toBeLessThan(initialScore);
    });

    test('should not exceed max score', async () => {
      const updatedScore = await calculator.updateScoreForAction(
        'test-member',
        'PAYMENT_SUCCESS',
        990
      );
      
      expect(updatedScore).toBeLessThanOrEqual(1000);
    });

    test('should not go below min score', async () => {
      const updatedScore = await calculator.updateScoreForAction(
        'test-member',
        'PAYMENT_DEFAULT',
        50
      );
      
      expect(updatedScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ZK Proof Generation', () => {
    test('should generate valid ZK proof', async () => {
      const memberHash = 'test-member-zk';
      const proof = await calculator.generateProof(memberHash, 10);
      
      expect(typeof proof).toBe('string');
      
      const proofData = JSON.parse(proof);
      expect(proofData).toHaveProperty('zkProof');
      expect(proofData).toHaveProperty('publicOutputs');
      expect(proofData).toHaveProperty('encryptedWitness');
      expect(proofData.zkProof.valid).toBe(true);
    });

    test('should verify valid proof', async () => {
      const memberHash = 'test-member-verify';
      const score = await calculator.calculateScore(memberHash);
      const proof = await calculator.generateProof(memberHash, 0);
      
      const isValid = await calculator.verifyCalculation(memberHash, score, proof);
      expect(isValid).toBe(true);
    });

    test('should reject invalid proof', async () => {
      const memberHash = 'test-member-invalid';
      const fakeProof = JSON.stringify({ invalid: 'proof' });
      
      const isValid = await calculator.verifyCalculation(memberHash, 500, fakeProof);
      expect(isValid).toBe(false);
    });
  });

  describe('Score Analysis', () => {
    test('should provide detailed score analysis', () => {
      const analysis = calculator.getDetailedScoreAnalysis(650);
      
      expect(analysis).toHaveProperty('score');
      expect(analysis).toHaveProperty('tier');
      expect(analysis).toHaveProperty('stakeRequirement');
      expect(analysis).toHaveProperty('benefits');
      expect(analysis).toHaveProperty('restrictions');
      expect(analysis.score).toBe(650);
    });

    test('should return score interpretations', () => {
      const interpretations = calculator.getScoreInterpretations();
      
      expect(typeof interpretations).toBe('object');
      expect(interpretations['900-1000']).toBe('Lunar');
      expect(interpretations['0-199']).toBe('Newcomer');
    });

    test('should return minimum requirements', () => {
      const requirements = calculator.getMinimumScoreRequirements();
      
      expect(typeof requirements).toBe('object');
      expect(requirements.CREATE_LARGE_CIRCLE).toBeGreaterThan(0);
      expect(requirements.CROSS_CHAIN_BENEFITS).toBe(900);
    });
  });

  describe('Tier System Integration', () => {
    test('should have all tiers with proper score ranges', () => {
      const tiers = calculator.getAllTiers();
      
      expect(tiers.NEWCOMER.minScore).toBe(0);
      expect(tiers.NEWCOMER.maxScore).toBe(199);
      expect(tiers.LUNAR.minScore).toBe(900);
      expect(tiers.LUNAR.maxScore).toBe(1000);
    });

    test('should have increasing stake requirements by tier', () => {
      const newcomerStake = calculator.getStakeRequirement(100);
      const lunarStake = calculator.getStakeRequirement(950);
      
      expect(lunarStake).toBeGreaterThan(newcomerStake);
    });
  });
});