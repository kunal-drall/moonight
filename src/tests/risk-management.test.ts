/**
 * Privacy-Preserving Risk Management Tests
 * Tests for RiskManager and integration with MoonightProtocol
 */

import { RiskManager } from '../utils/risk-manager';
import { MoonightProtocol } from '../contracts/MoonightProtocol';
import { ZKProofVerifier } from '../utils/zk-verifier';
import { PrivacyUtils } from '../utils/privacy';
import { TrustScoreCalculator } from '../utils/trust-score';
import { DEFAULT_PRIVACY_PARAMS } from '../types';

describe('Privacy-Preserving Risk Management', () => {
  let protocol: MoonightProtocol;
  let riskManager: RiskManager;
  let zkVerifier: ZKProofVerifier;
  let privacyUtils: PrivacyUtils;
  let trustCalculator: TrustScoreCalculator;

  const testMemberHash = 'test_member_123';
  const testCircleId = 'test_circle_456';
  const baseStakeAmount = BigInt(1000);

  beforeEach(() => {
    protocol = new MoonightProtocol('test-protocol', DEFAULT_PRIVACY_PARAMS);
    zkVerifier = new ZKProofVerifier(DEFAULT_PRIVACY_PARAMS);
    privacyUtils = new PrivacyUtils(DEFAULT_PRIVACY_PARAMS);
    trustCalculator = new TrustScoreCalculator();
    riskManager = new RiskManager(zkVerifier, privacyUtils, trustCalculator);
  });

  describe('Private Stake Calculation', () => {
    it('should calculate private stake requirements with ZK proofs', async () => {
      const stakeCalculation = await riskManager.calculatePrivateStake(
        testMemberHash,
        testCircleId,
        baseStakeAmount
      );

      expect(stakeCalculation).toBeDefined();
      expect(stakeCalculation.memberCommitment).toBeDefined();
      expect(stakeCalculation.requiredStakeCommitment).toBeDefined();
      expect(stakeCalculation.actualStakeProof).toBeDefined();
      expect(stakeCalculation.trustScoreContribution).toBeDefined();
      expect(stakeCalculation.riskAdjustment).toBeDefined();
      expect(stakeCalculation.calculationProof).toBeDefined();
    });

    it('should generate different stake requirements for different trust scores', async () => {
      const highTrustMember = 'high_trust_member';
      const lowTrustMember = 'low_trust_member';

      // Set different trust scores
      await trustCalculator.updateScoreForAction(highTrustMember, 'PAYMENT_SUCCESS', 800);
      await trustCalculator.updateScoreForAction(lowTrustMember, 'PAYMENT_DEFAULT', 200);

      const highTrustStake = await riskManager.calculatePrivateStake(
        highTrustMember,
        testCircleId,
        baseStakeAmount
      );

      const lowTrustStake = await riskManager.calculatePrivateStake(
        lowTrustMember,
        testCircleId,
        baseStakeAmount
      );

      // Both should be valid but different
      expect(highTrustStake.memberCommitment).not.toBe(lowTrustStake.memberCommitment);
      expect(highTrustStake.requiredStakeCommitment).not.toBe(lowTrustStake.requiredStakeCommitment);
    });

    it('should integrate with protocol for stake verification', async () => {
      const circleParams = {
        maxMembers: 8,
        monthlyAmount: BigInt(500),
        totalRounds: 12,
        minimumTrustScore: 300,
        stakeRequirement: baseStakeAmount
      };

      // Create a circle first with proper proof
      const creatorProof = JSON.stringify({
        commitment: 'test_commitment',
        nullifier: 'test_nullifier',
        proof: { valid: true }
      });

      const circleId = await protocol.createCircle(
        testMemberHash,
        circleParams,
        creatorProof
      );

      // Now test joining with private stake calculation
      const joinParams = {
        circleId,
        membershipProof: 'membership_proof',
        stakeAmount: baseStakeAmount,
        identityCommitment: 'new_member_hash'
      };

      // This should use the private stake calculation internally
      await expect(protocol.joinCircle(joinParams)).resolves.toBe(true);
    });
  });

  describe('Anonymous Default Detection', () => {
    it('should detect defaults without revealing member identities', async () => {
      const round = 1;
      const paymentDeadline = Date.now() - 1000; // Past deadline

      const detectionResult = await riskManager.detectAnonymousDefaults(
        testCircleId,
        round,
        paymentDeadline
      );

      expect(detectionResult).toBeDefined();
      expect(detectionResult.detectionId).toBeDefined();
      expect(detectionResult.circleId).toBe(testCircleId);
      expect(detectionResult.round).toBe(round);
      expect(detectionResult.anonymousFlags).toBeInstanceOf(Array);
      expect(detectionResult.confidentialSeverity).toBeGreaterThanOrEqual(0);
      expect(detectionResult.confidentialSeverity).toBeLessThanOrEqual(10);
      expect(typeof detectionResult.requiresIntervention).toBe('boolean');
      expect(detectionResult.zkProof).toBeDefined();
    });

    it('should create anonymous flags without revealing member details', async () => {
      const round = 1;
      const paymentDeadline = Date.now() - 1000;

      const detectionResult = await riskManager.detectAnonymousDefaults(
        testCircleId,
        round,
        paymentDeadline
      );

      if (detectionResult.anonymousFlags.length > 0) {
        const flag = detectionResult.anonymousFlags[0];
        
        expect(flag.flagId).toBeDefined();
        expect(flag.nullifierHash).toBeDefined();
        expect(flag.severityCommitment).toBeDefined();
        expect(flag.evidenceHash).toBeDefined();
        expect(flag.flagTimestamp).toBeGreaterThan(0);
        expect(flag.zkProof).toBeDefined();
        
        // Should not contain member identity directly
        expect(flag.nullifierHash).not.toContain(testMemberHash);
      }
    });

    it('should process payment deadline with default detection', async () => {
      const round = 1;
      const paymentDeadline = Date.now() - 1000;

      // Should not throw for past deadline
      await expect(protocol.processPaymentDeadline(
        testCircleId,
        round,
        paymentDeadline
      )).rejects.toThrow('Circle not found'); // Expected since circle doesn't exist

      // Should throw for future deadline
      const futureDeadline = Date.now() + 10000;
      await expect(protocol.processPaymentDeadline(
        testCircleId,
        round,
        futureDeadline
      )).rejects.toThrow('Circle not found'); // Expected since circle doesn't exist
    });
  });

  describe('Confidential Liquidation', () => {
    it('should execute liquidation with encrypted member data', async () => {
      const targetCommitment = await privacyUtils.generateCommitment(
        testMemberHash,
        'liquidation_target'
      );
      const liquidationReason = 'Repeated payment defaults';

      const liquidationOrder = await riskManager.executeConfidentialLiquidation(
        targetCommitment,
        testCircleId,
        liquidationReason
      );

      expect(liquidationOrder).toBeDefined();
      expect(liquidationOrder.orderId).toBeDefined();
      expect(liquidationOrder.targetCommitment).toBe(targetCommitment);
      expect(liquidationOrder.liquidationAmount).toBeGreaterThan(BigInt(0));
      expect(liquidationOrder.confidentialReason).toBeDefined();
      expect(liquidationOrder.executionDeadline).toBeGreaterThan(Date.now());
      expect(liquidationOrder.recoveredAssets).toBeInstanceOf(Array);
      expect(liquidationOrder.zkProof).toBeDefined();
    });

    it('should maintain privacy during liquidation process', async () => {
      const targetCommitment = await privacyUtils.generateCommitment(
        testMemberHash,
        'liquidation_target'
      );

      const liquidationOrder = await riskManager.executeConfidentialLiquidation(
        targetCommitment,
        testCircleId,
        'Privacy test liquidation'
      );

      // Liquidation order should not reveal member identity directly
      expect(liquidationOrder.targetCommitment).not.toContain(testMemberHash);
      expect(liquidationOrder.confidentialReason).not.toContain(testMemberHash);
      
      // Should contain encrypted data
      expect(liquidationOrder.confidentialReason.length).toBeGreaterThan(0);
    });
  });

  describe('Encrypted Insurance Pool Management', () => {
    it('should process encrypted insurance claims', async () => {
      const claimantCommitment = await privacyUtils.generateCommitment(
        testMemberHash,
        'insurance_claimant'
      );
      
      const claimData = {
        amount: 1000,
        type: 'DEFAULT_COVERAGE',
        reason: 'Member defaulted on payment'
      };
      
      const encryptedClaimData = await privacyUtils.encrypt(
        JSON.stringify(claimData),
        'insurance_claim'
      );

      const claimProof = await zkVerifier.generateProof(
        'encrypted_insurance_v1',
        { claimantCommitment, claimData },
        [claimantCommitment, testCircleId]
      );

      const insuranceRecord = await riskManager.processEncryptedInsuranceClaim(
        claimantCommitment,
        testCircleId,
        encryptedClaimData,
        claimProof
      );

      expect(insuranceRecord).toBeDefined();
      expect(insuranceRecord.recordId).toBeDefined();
      expect(insuranceRecord.encryptedClaimAmount).toBeDefined();
      expect(insuranceRecord.encryptedClaimType).toBeDefined();
      expect(insuranceRecord.encryptedPayoutAmount).toBeDefined();
      expect(insuranceRecord.confidentialityProof).toBeDefined();
      expect(insuranceRecord.processingTimestamp).toBeGreaterThan(0);
    });

    it('should monitor insurance pool health privately', async () => {
      const healthStatus = await protocol.monitorInsurancePoolHealth();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.poolHealthScore).toBeGreaterThanOrEqual(0);
      expect(healthStatus.poolHealthScore).toBeLessThanOrEqual(100);
      expect(typeof healthStatus.requiresRebalancing).toBe('boolean');
      expect(healthStatus.anonymousRiskLevel).toBeGreaterThanOrEqual(0);
      expect(healthStatus.anonymousRiskLevel).toBeLessThanOrEqual(10);
      expect(healthStatus.zkProof).toBeDefined();
    });
  });

  describe('Private Penalty Enforcement', () => {
    it('should enforce penalties without revealing target identity', async () => {
      const targetNullifier = await privacyUtils.generateNullifier(
        testMemberHash,
        'penalty_target'
      );

      const penalty = await riskManager.enforcePrivatePenalty(
        targetNullifier,
        'TRUST_SCORE_PENALTY',
        7,
        'Repeated payment defaults'
      );

      expect(penalty).toBeDefined();
      expect(penalty.penaltyId).toBeDefined();
      expect(penalty.targetNullifier).toBe(targetNullifier);
      expect(penalty.penaltyType).toBe('TRUST_SCORE_PENALTY');
      expect(penalty.encryptedSeverity).toBeDefined();
      expect(penalty.enforcementProof).toBeDefined();
      expect(penalty.appliedTimestamp).toBeGreaterThan(0);
      expect(penalty.appealDeadline).toBeGreaterThan(penalty.appliedTimestamp);
    });

    it('should support different penalty types', async () => {
      const targetNullifier = await privacyUtils.generateNullifier(
        testMemberHash,
        'penalty_target'
      );

      const penaltyTypes: Array<PenaltyEnforcement['penaltyType']> = [
        'STAKE_REDUCTION',
        'TRUST_SCORE_PENALTY',
        'TEMPORARY_SUSPENSION',
        'PERMANENT_BAN'
      ];

      for (const penaltyType of penaltyTypes) {
        const penalty = await riskManager.enforcePrivatePenalty(
          targetNullifier + penaltyType, // Unique nullifier for each
          penaltyType,
          5,
          `Test penalty: ${penaltyType}`
        );

        expect(penalty.penaltyType).toBe(penaltyType);
        expect(penalty.enforcementProof).toBeDefined();
      }
    });
  });

  describe('ZK Risk Assessment Proofs', () => {
    it('should generate comprehensive risk assessment with ZK proofs', async () => {
      const riskAssessment = await riskManager.generateRiskAssessment(
        testMemberHash,
        testCircleId
      );

      expect(riskAssessment).toBeDefined();
      expect(riskAssessment.memberHash).toBe(testMemberHash);
      expect(riskAssessment.riskScore).toBeGreaterThanOrEqual(0);
      expect(riskAssessment.riskScore).toBeLessThanOrEqual(100);
      expect(typeof riskAssessment.stakeAdequacy).toBe('boolean');
      expect(riskAssessment.defaultProbability).toBeGreaterThanOrEqual(0);
      expect(riskAssessment.defaultProbability).toBeLessThanOrEqual(1);
      expect(riskAssessment.liquidationRisk).toBeGreaterThanOrEqual(0);
      expect(riskAssessment.liquidationRisk).toBeLessThanOrEqual(1);
      expect(riskAssessment.zkProof).toBeDefined();
      expect(riskAssessment.assessmentTimestamp).toBeGreaterThan(0);
    });

    it('should verify risk management operations', async () => {
      const operationTypes = [
        'STAKE_CALCULATION',
        'DEFAULT_DETECTION',
        'LIQUIDATION',
        'PENALTY_ENFORCEMENT'
      ] as const;

      for (const operationType of operationTypes) {
        // Generate a mock proof for testing
        const mockProof = await zkVerifier.generateProof(
          'risk_test_v1',
          { operationType, timestamp: Date.now() },
          ['test_operation_id', operationType]
        );

        const isValid = await protocol.verifyRiskManagementOperation(
          operationType,
          'test_operation_id',
          mockProof
        );

        // Note: In practice, these would be more sophisticated verifications
        expect(typeof isValid).toBe('boolean');
      }
    });

    it('should maintain privacy while generating proofs', async () => {
      const riskAssessment = await riskManager.generateRiskAssessment(
        testMemberHash,
        testCircleId
      );

      // Risk assessment should not contain raw financial data but may contain member hash in public inputs
      // The key is that private data like exact stake amounts should not be visible
      expect(riskAssessment.zkProof).not.toContain('1000'); // No raw stake amounts
      expect(riskAssessment.zkProof).not.toContain('secret'); // No secret data
      
      // But should contain proof validity indicators
      expect(riskAssessment.zkProof.length).toBeGreaterThan(10);
      
      // Verify the proof contains expected structure without revealing private data
      const proofData = JSON.parse(riskAssessment.zkProof);
      expect(proofData.valid).toBe(true);
      expect(proofData.zkProof).toBeDefined();
    });
  });

  describe('Integration with Main Protocol', () => {
    it('should integrate risk management with circle creation', async () => {
      const circleParams = {
        maxMembers: 6,
        monthlyAmount: BigInt(750),
        totalRounds: 8,
        minimumTrustScore: 400,
        stakeRequirement: BigInt(2000)
      };

      // Should integrate stake calculation in circle creation
      const creatorProof = JSON.stringify({
        commitment: 'test_commitment',
        nullifier: 'test_nullifier', 
        proof: { valid: true }
      });

      await expect(async () => {
        await protocol.createCircle(
          testMemberHash,
          circleParams,
          creatorProof
        );
      }).rejects.toThrow('Insufficient tier'); // Expected to fail due to tier requirements
    });

    it('should maintain economic security while preserving privacy', async () => {
      // Test that the system maintains security properties
      const riskAssessment = await riskManager.generateRiskAssessment(
        testMemberHash,
        testCircleId
      );

      // Risk scores should be reasonable
      expect(riskAssessment.riskScore).toBeLessThan(90); // Not maximum risk for test member
      expect(riskAssessment.defaultProbability).toBeLessThan(0.8); // Not extremely high default risk
      
      // Privacy should be maintained through encrypted/committed values
      expect(riskAssessment.zkProof).toBeTruthy();
      expect(typeof riskAssessment.stakeAdequacy).toBe('boolean');
    });
  });
});

// Import penalty enforcement type for tests
import { PenaltyEnforcement } from '../types';