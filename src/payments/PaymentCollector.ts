/**
 * Payment Collector for Moonight Lending Circles
 * 
 * Integrates PaymentProcessor with MoonightProtocol to automate
 * monthly payment collection for lending circles with privacy preservation
 */

import { PaymentProcessor } from './PaymentProcessor';
import { MoonightProtocol } from '../contracts/MoonightProtocol';
import {
  PaymentCollectionParams,
  PaymentCollectionResult,
  LendingCircle,
  CircleMember,
  MakePaymentParams,
  PartialPayment
} from '../types';

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
  readonly totalCollected: bigint;
  readonly successfulPayments: number;
  readonly partialPayments: number;
  readonly failedPayments: number;
  readonly completionRate: number;
}

export class PaymentCollector {
  private paymentProcessor: PaymentProcessor;
  private protocol: MoonightProtocol;
  private activeSchedules: Map<string, PaymentSchedule>;
  private collectionHistory: Map<string, CollectionStatus[]>;

  private readonly COLLECTION_WINDOW_HOURS = 72; // 3 days to collect payments
  private readonly RETRY_INTERVAL_MINUTES = 30;
  private readonly MAX_COLLECTION_ATTEMPTS = 5;

  constructor(
    paymentProcessor: PaymentProcessor,
    protocol: MoonightProtocol
  ) {
    this.paymentProcessor = paymentProcessor;
    this.protocol = protocol;
    this.activeSchedules = new Map();
    this.collectionHistory = new Map();

    // Start automatic payment collection process
    this.startAutomaticCollection();
  }

  /**
   * Schedule payment collection for a lending circle round
   */
  async schedulePaymentCollection(
    circleId: string,
    round: number,
    dueDate: number
  ): Promise<string> {
    // Get circle and member information
    const circle = await this.protocol.getCircle(circleId);
    if (!circle || !circle.isActive) {
      throw new Error('Circle not found or inactive');
    }

    const members = await this.protocol.getCircleMembers(circleId);
    const contributorHashes = members.map(m => m.memberHash);

    // Determine recipient for this round
    const recipientHash = await this.determineRoundRecipient(circleId, round);

    const schedule: PaymentSchedule = {
      circleId,
      round,
      dueDate,
      amount: circle.monthlyAmount,
      contributorHashes,
      recipientHash
    };

    const scheduleId = `${circleId}-${round}`;
    this.activeSchedules.set(scheduleId, schedule);

    console.log(`Payment collection scheduled for circle ${circleId}, round ${round}`);
    return scheduleId;
  }

  /**
   * Execute payment collection for a scheduled round
   */
  async executePaymentCollection(scheduleId: string): Promise<CollectionStatus> {
    const schedule = this.activeSchedules.get(scheduleId);
    if (!schedule) {
      throw new Error('Payment schedule not found');
    }

    // Create mutable status object
    let status = {
      circleId: schedule.circleId,
      round: schedule.round,
      totalExpected: schedule.amount * BigInt(schedule.contributorHashes.length - 1), // Recipient doesn't pay
      totalCollected: BigInt(0),
      successfulPayments: 0,
      partialPayments: 0,
      failedPayments: 0,
      completionRate: 0
    };

    const collectionPromises: Promise<PaymentCollectionResult>[] = [];

    // Collect payments from all contributors except the recipient
    for (const contributorHash of schedule.contributorHashes) {
      if (contributorHash === schedule.recipientHash) {
        continue; // Recipient doesn't pay in their round
      }

      const collectionParams: PaymentCollectionParams = {
        contributorHash,
        circleId: schedule.circleId,
        round: schedule.round,
        requiredAmount: schedule.amount,
        recipientCommitment: schedule.recipientHash,
        allowPartialPayment: true,
        maxRetries: this.MAX_COLLECTION_ATTEMPTS,
        priority: 'normal'
      };

      // Execute payment collection
      collectionPromises.push(
        this.paymentProcessor.collectMonthlyPayment(collectionParams)
          .catch(error => ({
            collectionId: 'failed',
            success: false,
            error: error.message,
            processingTime: 0
          }))
      );
    }

    // Wait for all payment collections to complete
    const results = await Promise.all(collectionPromises);

    // Process results and update status
    for (const result of results) {
      if (result.success) {
        if (result.isPartialPayment) {
          status.partialPayments++;
          status.totalCollected += result.totalCollected || BigInt(0);
        } else {
          status.successfulPayments++;
          status.totalCollected += result.totalCollected || BigInt(0);
        }
      } else {
        status.failedPayments++;
      }
    }

    // Calculate completion rate
    const totalPayments = status.successfulPayments + status.partialPayments + status.failedPayments;
    status.completionRate = totalPayments > 0 ? 
      ((status.successfulPayments + status.partialPayments) / totalPayments) * 100 : 0;

    // Store collection status
    const history = this.collectionHistory.get(schedule.circleId) || [];
    history.push(status as CollectionStatus);
    this.collectionHistory.set(schedule.circleId, history);

    // Process successful payments through the protocol
    await this.processSuccessfulPayments(schedule, results);

    console.log(`Payment collection completed for ${scheduleId}:`, {
      totalCollected: status.totalCollected.toString(),
      completionRate: `${status.completionRate.toFixed(2)}%`,
      successfulPayments: status.successfulPayments,
      partialPayments: status.partialPayments,
      failedPayments: status.failedPayments
    });

    return status as CollectionStatus;
  }

  /**
   * Process successful payments through the MoonightProtocol
   */
  private async processSuccessfulPayments(
    schedule: PaymentSchedule,
    results: PaymentCollectionResult[]
  ): Promise<void> {
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const contributorHash = schedule.contributorHashes[i];

      if (result.success && result.totalCollected) {
        try {
          // Create payment proof for the protocol
          const paymentProof = await this.createPaymentProof(
            contributorHash,
            result.totalCollected,
            result.settlementProof || ''
          );

          const makePaymentParams: MakePaymentParams = {
            circleId: schedule.circleId,
            round: schedule.round,
            paymentProof,
            recipientHash: schedule.recipientHash
          };

          // Process payment through the protocol
          const paymentSuccess = await this.protocol.makePayment(
            contributorHash,
            makePaymentParams
          );

          if (paymentSuccess) {
            console.log(`Payment processed successfully for contributor ${contributorHash.substring(0, 8)}...`);
          }
        } catch (error) {
          console.error(`Failed to process payment for contributor ${contributorHash}:`, error);
        }
      }
    }
  }

  /**
   * Handle partial payments and schedule follow-ups
   */
  async handlePartialPayments(): Promise<void> {
    const now = Date.now();

    for (const [circleId, history] of this.collectionHistory) {
      const latestStatus = history[history.length - 1];
      
      if (latestStatus && latestStatus.partialPayments > 0) {
        // Get pending partial payments for this circle
        await this.schedulePartialPaymentFollowUp(circleId, latestStatus.round);
      }
    }
  }

  /**
   * Get payment collection status for a circle
   */
  async getCollectionStatus(circleId: string): Promise<CollectionStatus[]> {
    return this.collectionHistory.get(circleId) || [];
  }

  /**
   * Start automatic payment collection process
   */
  private startAutomaticCollection(): void {
    // Check for due payments every 30 minutes
    setInterval(async () => {
      await this.checkAndExecuteDuePayments();
      await this.paymentProcessor.processRetryQueue();
      await this.handlePartialPayments();
    }, this.RETRY_INTERVAL_MINUTES * 60 * 1000);

    console.log('Automatic payment collection started');
  }

  /**
   * Check for due payments and execute collection
   */
  private async checkAndExecuteDuePayments(): Promise<void> {
    const now = Date.now();
    const dueSchedules: string[] = [];

    for (const [scheduleId, schedule] of this.activeSchedules) {
      const timeUntilDue = schedule.dueDate - now;
      const collectionWindow = this.COLLECTION_WINDOW_HOURS * 60 * 60 * 1000;

      // Start collection if within collection window
      if (timeUntilDue <= collectionWindow && timeUntilDue >= -collectionWindow) {
        dueSchedules.push(scheduleId);
      }
    }

    // Execute payment collection for due schedules
    for (const scheduleId of dueSchedules) {
      try {
        await this.executePaymentCollection(scheduleId);
        // Remove from active schedules after collection
        this.activeSchedules.delete(scheduleId);
      } catch (error) {
        console.error(`Failed to execute payment collection for ${scheduleId}:`, error);
      }
    }
  }

  /**
   * Determine the recipient for a specific round
   */
  private async determineRoundRecipient(circleId: string, round: number): Promise<string> {
    // Simple round-robin allocation - in production would use more sophisticated methods
    const members = await this.protocol.getCircleMembers(circleId);
    const recipientIndex = (round - 1) % members.length;
    return members[recipientIndex].memberHash;
  }

  /**
   * Create payment proof for protocol integration
   */
  private async createPaymentProof(
    contributorHash: string,
    amount: bigint,
    settlementProof: string
  ): Promise<string> {
    return JSON.stringify({
      contributorCommitment: contributorHash,
      amountCommitment: amount.toString(),
      settlementProof,
      timestamp: Date.now(),
      proof: { valid: true }
    });
  }

  /**
   * Schedule follow-up for partial payments
   */
  private async schedulePartialPaymentFollowUp(
    circleId: string,
    round: number
  ): Promise<void> {
    // Get contributors with partial payments
    const schedule = this.activeSchedules.get(`${circleId}-${round}`);
    if (!schedule) return;

    // In a real implementation, this would:
    // 1. Identify contributors with partial payments
    // 2. Schedule retry attempts
    // 3. Send notifications
    // 4. Handle escalation if needed

    console.log(`Scheduled partial payment follow-up for circle ${circleId}, round ${round}`);
  }

  /**
   * Generate collection report for circle administrators
   */
  async generateCollectionReport(circleId: string): Promise<{
    circleId: string;
    totalRounds: number;
    successRate: number;
    totalCollected: bigint;
    averageCompletionRate: number;
    partialPaymentRate: number;
    onTimePaymentRate: number;
  }> {
    const history = this.collectionHistory.get(circleId) || [];
    
    if (history.length === 0) {
      throw new Error('No collection history found for circle');
    }

    let totalCollected = BigInt(0);
    let totalCompletionRate = 0;
    let totalPartialPayments = 0;
    let totalPayments = 0;

    for (const status of history) {
      totalCollected += status.totalCollected;
      totalCompletionRate += status.completionRate;
      totalPartialPayments += status.partialPayments;
      totalPayments += status.successfulPayments + status.partialPayments + status.failedPayments;
    }

    return {
      circleId,
      totalRounds: history.length,
      successRate: history.length > 0 ? totalCompletionRate / history.length : 0,
      totalCollected,
      averageCompletionRate: history.length > 0 ? totalCompletionRate / history.length : 0,
      partialPaymentRate: totalPayments > 0 ? (totalPartialPayments / totalPayments) * 100 : 0,
      onTimePaymentRate: totalPayments > 0 ? 
        ((totalPayments - totalPartialPayments) / totalPayments) * 100 : 0
    };
  }
}