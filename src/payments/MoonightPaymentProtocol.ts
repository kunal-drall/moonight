/**
 * Payment Integration Layer for Moonight Protocol
 * 
 * Extends MoonightProtocol with confidential payment processor capabilities
 * Maintains backward compatibility while adding automated collection features
 */

import { MoonightProtocol } from '../contracts/MoonightProtocol';
import { PaymentProcessor } from './PaymentProcessor';
import { PaymentCollector } from './PaymentCollector';
import {
  MakePaymentParams,
  PaymentCollectionParams,
  PaymentCollectionResult,
  CollectionStatus,
  LendingCircle,
  CircleMember,
  PrivacyParams
} from '../types';

export class MoonightPaymentProtocol extends MoonightProtocol {
  private paymentProcessor: PaymentProcessor;
  private paymentCollector: PaymentCollector;
  private autoCollectionEnabled: boolean = true;

  constructor(protocolId: string, privacyParams: PrivacyParams) {
    super(protocolId, privacyParams);
    
    // Initialize payment processor and collector
    this.paymentProcessor = new PaymentProcessor(`processor-${protocolId}`, privacyParams);
    this.paymentCollector = new PaymentCollector(this.paymentProcessor, this);
    
    console.log('MoonightPaymentProtocol initialized with confidential payment processor');
  }

  /**
   * Enhanced payment method with automatic multi-chain collection
   */
  async makePaymentWithProcessor(
    payerHash: string,
    params: MakePaymentParams & {
      walletProofs?: Map<string, string>;
      allowPartialPayment?: boolean;
      enableAutoRetry?: boolean;
    }
  ): Promise<{
    paymentSuccess: boolean;
    collectionResult?: PaymentCollectionResult;
    protocolResult: boolean;
  }> {
    try {
      // If wallet proofs are provided, use payment processor
      if (params.walletProofs && params.walletProofs.size > 0) {
        // Initialize wallet connections
        await this.paymentProcessor.initializeWalletConnections(
          payerHash,
          params.walletProofs
        );

        const circle = this.state.circles.get(params.circleId);
        if (!circle) {
          throw new Error('Circle not found');
        }

        // Use payment processor for automated collection
        const collectionParams: PaymentCollectionParams = {
          contributorHash: payerHash,
          circleId: params.circleId,
          round: params.round,
          requiredAmount: circle.monthlyAmount,
          recipientCommitment: params.recipientHash,
          allowPartialPayment: params.allowPartialPayment || false,
          maxRetries: params.enableAutoRetry ? 3 : 1
        };

        const collectionResult = await this.paymentProcessor.collectMonthlyPayment(collectionParams);

        if (collectionResult.success) {
          // Process through original protocol with generated proof
          const enhancedPaymentProof = await this.enhancePaymentProof(
            params.paymentProof,
            collectionResult
          );

          const protocolResult = await super.makePayment(payerHash, {
            ...params,
            paymentProof: enhancedPaymentProof
          });

          return {
            paymentSuccess: true,
            collectionResult,
            protocolResult
          };
        } else {
          return {
            paymentSuccess: false,
            collectionResult,
            protocolResult: false
          };
        }
      } else {
        // Fall back to original payment method
        const protocolResult = await super.makePayment(payerHash, params);
        return {
          paymentSuccess: protocolResult,
          protocolResult
        };
      }
    } catch (error) {
      console.error('Enhanced payment processing failed:', error);
      return {
        paymentSuccess: false,
        protocolResult: false
      };
    }
  }

  /**
   * Enable automatic payment collection for a circle
   */
  async enableAutoCollection(
    circleId: string,
    collectionSchedule: {
      daysBeforeDue: number;
      retryInterval: number;
      maxRetries: number;
    }
  ): Promise<boolean> {
    try {
      const circle = this.state.circles.get(circleId);
      if (!circle || !circle.isActive) {
        throw new Error('Circle not found or inactive');
      }

      // Schedule payment collection for upcoming rounds
      const currentTime = Date.now();
      const monthlyInterval = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

      for (let round = circle.currentRound + 1; round <= circle.totalRounds; round++) {
        const dueDate = currentTime + ((round - circle.currentRound) * monthlyInterval);
        const collectionDate = dueDate - (collectionSchedule.daysBeforeDue * 24 * 60 * 60 * 1000);

        await this.paymentCollector.schedulePaymentCollection(
          circleId,
          round,
          collectionDate
        );
      }

      console.log(`Auto-collection enabled for circle ${circleId}`);
      return true;
    } catch (error) {
      console.error('Failed to enable auto-collection:', error);
      return false;
    }
  }

  /**
   * Disable automatic payment collection for a circle
   */
  async disableAutoCollection(circleId: string): Promise<boolean> {
    try {
      // This would remove scheduled collections in a production implementation
      console.log(`Auto-collection disabled for circle ${circleId}`);
      return true;
    } catch (error) {
      console.error('Failed to disable auto-collection:', error);
      return false;
    }
  }

  /**
   * Get payment collection status for a circle
   */
  async getPaymentStatus(circleId: string): Promise<{
    circle: LendingCircle;
    currentRoundStatus?: CollectionStatus;
    collectionHistory: CollectionStatus[];
    autoCollectionEnabled: boolean;
  }> {
    const circle = this.state.circles.get(circleId);
    if (!circle) {
      throw new Error('Circle not found');
    }

    const collectionHistory = await this.paymentCollector.getCollectionStatus(circleId);
    const currentRoundStatus = collectionHistory.find(s => s.round === circle.currentRound);

    return {
      circle,
      currentRoundStatus,
      collectionHistory,
      autoCollectionEnabled: this.autoCollectionEnabled
    };
  }

  /**
   * Get detailed payment analytics for a circle
   */
  async getPaymentAnalytics(circleId: string): Promise<{
    totalCollected: bigint;
    averageCompletionRate: number;
    onTimePaymentRate: number;
    partialPaymentRate: number;
    failureRate: number;
    averageAnonymityScore: number;
    crossChainDistribution: Map<string, bigint>;
  }> {
    const report = await this.paymentCollector.generateCollectionReport(circleId);
    const collectionHistory = await this.paymentCollector.getCollectionStatus(circleId);

    // Calculate additional analytics
    let totalAnonymityScore = 0;
    let totalSuccessfulPayments = 0;
    const crossChainDistribution = new Map<string, bigint>();

    // This would analyze payment history for cross-chain distribution
    // In production, would access actual payment records

    return {
      totalCollected: report.totalCollected,
      averageCompletionRate: report.averageCompletionRate,
      onTimePaymentRate: report.onTimePaymentRate,
      partialPaymentRate: report.partialPaymentRate,
      failureRate: 100 - report.successRate,
      averageAnonymityScore: 85, // Mock value - would calculate from actual records
      crossChainDistribution
    };
  }

  /**
   * Handle failed payment recovery
   */
  async initiatePaymentRecovery(
    circleId: string,
    round: number,
    contributorHash: string,
    recoveryOptions: {
      extendDeadline?: number;
      allowPartialPayment?: boolean;
      alternativePaymentMethods?: string[];
      penaltyReduction?: number;
    }
  ): Promise<{
    recoveryInitiated: boolean;
    newDeadline?: number;
    penaltyAmount?: bigint;
    alternativeOptions?: string[];
  }> {
    try {
      const circle = this.state.circles.get(circleId);
      if (!circle) {
        throw new Error('Circle not found');
      }

      // Extend deadline if requested
      let newDeadline: number | undefined;
      if (recoveryOptions.extendDeadline) {
        newDeadline = Date.now() + (recoveryOptions.extendDeadline * 24 * 60 * 60 * 1000);
        
        // Reschedule payment collection
        await this.paymentCollector.schedulePaymentCollection(
          circleId,
          round,
          newDeadline
        );
      }

      // Calculate penalty (reduced if requested)
      let penaltyAmount = circle.monthlyAmount * BigInt(10) / BigInt(100); // 10% default penalty
      if (recoveryOptions.penaltyReduction) {
        penaltyAmount = penaltyAmount * BigInt(100 - recoveryOptions.penaltyReduction) / BigInt(100);
      }

      // Update trust score for late payment
      const currentScore = this.state.trustScores.get(contributorHash) || 500;
      const penaltyScore = await this.trustCalculator.updateScoreForAction(
        contributorHash,
        'PAYMENT_LATE',
        currentScore
      );

      await this.updateTrustScore({
        targetMemberHash: contributorHash,
        newScore: penaltyScore,
        calculationProof: await this.trustCalculator.generateProof(contributorHash, penaltyScore - currentScore),
        witnessData: await this.privacyUtils.encryptWitnessData({
          action: 'PAYMENT_RECOVERY',
          round,
          penalty: penaltyAmount.toString(),
          deadline: newDeadline
        })
      });

      return {
        recoveryInitiated: true,
        newDeadline,
        penaltyAmount,
        alternativeOptions: recoveryOptions.alternativePaymentMethods || []
      };
    } catch (error) {
      console.error('Payment recovery failed:', error);
      return { recoveryInitiated: false };
    }
  }

  /**
   * Process batch payments for multiple circles
   */
  async processBatchPayments(
    paymentBatch: Array<{
      circleId: string;
      round: number;
      dueDate: number;
    }>
  ): Promise<Map<string, CollectionStatus>> {
    const results = new Map<string, CollectionStatus>();

    // Process payments in parallel for efficiency
    const processingPromises = paymentBatch.map(async (payment) => {
      try {
        const scheduleId = await this.paymentCollector.schedulePaymentCollection(
          payment.circleId,
          payment.round,
          payment.dueDate
        );

        const status = await this.paymentCollector.executePaymentCollection(scheduleId);
        results.set(payment.circleId, status);
      } catch (error) {
        console.error(`Batch payment processing failed for circle ${payment.circleId}:`, error);
      }
    });

    await Promise.all(processingPromises);
    return results;
  }

  /**
   * Get contributor's payment history across all circles
   */
  async getContributorPaymentHistory(
    contributorHash: string,
    decryptionKey?: string
  ): Promise<{
    totalCircles: number;
    totalPayments: number;
    successfulPayments: number;
    partialPayments: number;
    failedPayments: number;
    totalAmountPaid: bigint;
    averageAnonymityScore: number;
    paymentReliabilityScore: number;
  }> {
    const paymentHistory = await this.paymentProcessor.getPaymentHistory(
      contributorHash,
      decryptionKey
    );

    // Analyze payment patterns
    const records = paymentHistory.records;
    const totalPayments = records.length;
    let totalAnonymityScore = 0;

    for (const record of records) {
      totalAnonymityScore += record.anonymityScore;
    }

    // Calculate reliability score based on payment history
    const trustScore = this.state.trustScores.get(contributorHash) || 500;
    const reliabilityScore = Math.min(100, (trustScore / 10) + 
      (paymentHistory.decryptedSummary ? 10 : 0)); // Bonus for providing decryption key

    return {
      totalCircles: 1, // Would calculate from actual circle memberships
      totalPayments,
      successfulPayments: totalPayments, // Would distinguish from partial/failed
      partialPayments: 0,
      failedPayments: 0,
      totalAmountPaid: paymentHistory.decryptedSummary?.totalAmount || BigInt(0),
      averageAnonymityScore: totalPayments > 0 ? totalAnonymityScore / totalPayments : 0,
      paymentReliabilityScore: reliabilityScore
    };
  }

  /**
   * Enhance payment proof with processor-generated data
   */
  private async enhancePaymentProof(
    originalProof: string,
    collectionResult: PaymentCollectionResult
  ): Promise<string> {
    const originalData = JSON.parse(originalProof);
    
    const enhancedProof = {
      ...originalData,
      processorData: {
        collectionId: collectionResult.collectionId,
        multiChainEvidence: collectionResult.paymentBreakdown ? 
          Array.from(collectionResult.paymentBreakdown.entries()) : [],
        anonymityScore: collectionResult.anonymityScore,
        settlementProof: collectionResult.settlementProof,
        processingTime: collectionResult.processingTime
      },
      enhanced: true,
      timestamp: Date.now()
    };

    return JSON.stringify(enhancedProof);
  }

  /**
   * Override createCircle to enable auto-collection by default
   */
  async createCircleWithAutoCollection(
    creatorHash: string,
    params: any,
    membershipProof: string,
    enableAutoCollection: boolean = true
  ): Promise<string> {
    const circleId = await this.createCircle(creatorHash, params, membershipProof);
    
    if (enableAutoCollection) {
      await this.enableAutoCollection(circleId, {
        daysBeforeDue: 3,
        retryInterval: 30,
        maxRetries: 3
      });
    }

    return circleId;
  }
}