/**
 * Tests for Confidential Payment Processor
 */

import { PaymentProcessor } from '../payments/PaymentProcessor';
import { PaymentCollector } from '../payments/PaymentCollector';
import { MoonightProtocol } from '../contracts/MoonightProtocol';
import {
  PaymentCollectionParams,
  PaymentCollectionResult,
  WalletConnection,
  PartialPayment,
  DEFAULT_PRIVACY_PARAMS
} from '../types';

describe('Confidential Payment Processor', () => {
  let paymentProcessor: PaymentProcessor;
  let protocol: MoonightProtocol;
  let paymentCollector: PaymentCollector;

  beforeEach(() => {
    paymentProcessor = new PaymentProcessor('test-processor', DEFAULT_PRIVACY_PARAMS);
    protocol = new MoonightProtocol('test-protocol', DEFAULT_PRIVACY_PARAMS);
    paymentCollector = new PaymentCollector(paymentProcessor, protocol);
  });

  describe('Wallet Connection Management', () => {
    it('should initialize wallet connections for multiple chains', async () => {
      const contributorHash = 'contributor123';
      const walletProofs = new Map([
        ['ethereum', JSON.stringify({
          contributorCommitment: contributorHash,
          walletProof: { valid: true },
          chainId: 'ethereum',
          balanceWitness: {
            balance: '2000000000000000000', // 2 ETH
            randomness: 'random123'
          }
        })],
        ['midnight', JSON.stringify({
          contributorCommitment: contributorHash,
          walletProof: { valid: true },
          chainId: 'midnight',
          balanceWitness: {
            balance: '1000000000000000000', // 1 DUST
            randomness: 'random456'
          }
        })]
      ]);

      const connections = await paymentProcessor.initializeWalletConnections(
        contributorHash,
        walletProofs
      );

      expect(connections.size).toBe(2);
      expect(connections.has('ethereum')).toBe(true);
      expect(connections.has('midnight')).toBe(true);

      const ethConnection = connections.get('ethereum')!;
      expect(ethConnection.contributorHash).toBe(contributorHash);
      expect(ethConnection.isActive).toBe(true);
    });

    it('should reject invalid wallet ownership proofs', async () => {
      const contributorHash = 'contributor123';
      const invalidProofs = new Map([
        ['ethereum', JSON.stringify({
          contributorCommitment: 'different-hash',  // Mismatch
          walletProof: { valid: true },
          chainId: 'ethereum',
          balanceWitness: {
            balance: '2000000000000000000',
            randomness: 'random123'
          }
        })]
      ]);

      const connections = await paymentProcessor.initializeWalletConnections(
        contributorHash,
        invalidProofs
      );

      expect(connections.size).toBe(0);
    });
  });

  describe('Payment Collection', () => {
    beforeEach(async () => {
      // Set up wallet connections
      const contributorHash = 'test-contributor';
      const walletProofs = new Map([
        ['ethereum', JSON.stringify({
          contributorCommitment: contributorHash,
          walletProof: { valid: true },
          chainId: 'ethereum',
          balanceWitness: {
            balance: '2000000000000000000', // 2 ETH
            randomness: 'random123'
          }
        })],
        ['polygon', JSON.stringify({
          contributorCommitment: contributorHash,
          walletProof: { valid: true },
          chainId: 'polygon',
          balanceWitness: {
            balance: '1500000000000000000', // 1.5 MATIC
            randomness: 'random456'
          }
        })]
      ]);

      await paymentProcessor.initializeWalletConnections(contributorHash, walletProofs);
    });

    it('should collect full payment successfully', async () => {
      const params: PaymentCollectionParams = {
        contributorHash: 'test-contributor',
        circleId: 'circle123',
        round: 1,
        requiredAmount: BigInt('1000000000000000000'), // 1 token
        recipientCommitment: 'recipient123',
        allowPartialPayment: false
      };

      const result = await paymentProcessor.collectMonthlyPayment(params);

      expect(result.success).toBe(true);
      expect(result.totalCollected).toBeDefined();
      expect(result.totalCollected).toBeGreaterThan(BigInt(0));
      expect(result.anonymityScore).toBeGreaterThan(0);
      expect(result.settlementProof).toBeDefined();
      expect(result.paymentBreakdown).toBeDefined();
    });

    it('should handle partial payments when allowed', async () => {
      const params: PaymentCollectionParams = {
        contributorHash: 'test-contributor',
        circleId: 'circle123',
        round: 1,
        requiredAmount: BigInt('5000000000000000000'), // 5 tokens (more than available)
        recipientCommitment: 'recipient123',
        allowPartialPayment: true
      };

      const result = await paymentProcessor.collectMonthlyPayment(params);

      expect(result.success).toBe(true);
      expect(result.isPartialPayment).toBe(true);
      expect(result.shortfall).toBeDefined();
      expect(result.nextPaymentDue).toBeDefined();
      expect(result.totalCollected).toBeLessThan(params.requiredAmount);
    });

    it('should reject payment when insufficient balance and partial payments disabled', async () => {
      const params: PaymentCollectionParams = {
        contributorHash: 'test-contributor',
        circleId: 'circle123',
        round: 1,
        requiredAmount: BigInt('10000000000000000000'), // 10 tokens (way more than available)
        recipientCommitment: 'recipient123',
        allowPartialPayment: false
      };

      const result = await paymentProcessor.collectMonthlyPayment(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient balance');
      expect(result.shortfall).toBeDefined();
    });

    it('should handle payment failures and schedule retries', async () => {
      // Mock a network error
      const originalCollectPayment = paymentProcessor.collectMonthlyPayment;
      let attemptCount = 0;
      
      paymentProcessor.collectMonthlyPayment = async (params) => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error('NETWORK_ERROR: Connection failed');
        }
        return originalCollectPayment.call(paymentProcessor, params);
      };

      const params: PaymentCollectionParams = {
        contributorHash: 'test-contributor',
        circleId: 'circle123',
        round: 1,
        requiredAmount: BigInt('1000000000000000000'),
        recipientCommitment: 'recipient123',
        allowPartialPayment: false
      };

      // First attempt should fail and schedule retry
      const result1 = await paymentProcessor.collectMonthlyPayment(params);
      expect(result1.success).toBe(false);
      expect(result1.retryScheduled).toBe(true);

      // Process retry queue
      await paymentProcessor.processRetryQueue();

      // Restore original method
      paymentProcessor.collectMonthlyPayment = originalCollectPayment;
    });
  });

  describe('Cross-Chain Payment Routing', () => {
    it('should optimize payment routing for privacy', async () => {
      const contributorHash = 'test-contributor';
      const walletProofs = new Map([
        ['midnight', JSON.stringify({
          contributorCommitment: contributorHash,
          walletProof: { valid: true },
          chainId: 'midnight',
          balanceWitness: { balance: '500000000000000000', randomness: 'r1' }
        })],
        ['ethereum', JSON.stringify({
          contributorCommitment: contributorHash,
          walletProof: { valid: true },
          chainId: 'ethereum',
          balanceWitness: { balance: '300000000000000000', randomness: 'r2' }
        })],
        ['polygon', JSON.stringify({
          contributorCommitment: contributorHash,
          walletProof: { valid: true },
          chainId: 'polygon',
          balanceWitness: { balance: '400000000000000000', randomness: 'r3' }
        })]
      ]);

      await paymentProcessor.initializeWalletConnections(contributorHash, walletProofs);

      const params: PaymentCollectionParams = {
        contributorHash,
        circleId: 'circle123',
        round: 1,
        requiredAmount: BigInt('1000000000000000000'), // 1 token
        recipientCommitment: 'recipient123',
        allowPartialPayment: false
      };

      const result = await paymentProcessor.collectMonthlyPayment(params);

      expect(result.success).toBe(true);
      expect(result.paymentBreakdown?.size).toBeGreaterThan(1); // Multiple chains used
      expect(result.anonymityScore).toBeGreaterThan(80); // High anonymity from multiple chains
    });
  });

  describe('Payment History and Privacy', () => {
    it('should store encrypted payment records', async () => {
      const contributorHash = 'test-contributor';
      
      // Set up wallet connection
      const walletProofs = new Map([
        ['midnight', JSON.stringify({
          contributorCommitment: contributorHash,
          walletProof: { valid: true },
          chainId: 'midnight',
          balanceWitness: { balance: '2000000000000000000', randomness: 'r1' }
        })]
      ]);

      await paymentProcessor.initializeWalletConnections(contributorHash, walletProofs);

      // Make a payment
      const params: PaymentCollectionParams = {
        contributorHash,
        circleId: 'circle123',
        round: 1,
        requiredAmount: BigInt('1000000000000000000'),
        recipientCommitment: 'recipient123'
      };

      await paymentProcessor.collectMonthlyPayment(params);

      // Get payment history without decryption key
      const history = await paymentProcessor.getPaymentHistory(contributorHash);
      expect(history.records.length).toBe(1);
      expect(history.decryptedSummary).toBeUndefined();

      const record = history.records[0];
      expect(record.encryptedAmount).toBeDefined();
      expect(record.encryptedBreakdown).toBeDefined();
      expect(record.paymentHash).toBeDefined();
      expect(record.anonymityScore).toBeGreaterThan(0);
    });

    it('should decrypt payment history with proper key', async () => {
      const contributorHash = 'test-contributor';
      
      // Set up and make payment (same as above)
      const walletProofs = new Map([
        ['midnight', JSON.stringify({
          contributorCommitment: contributorHash,
          walletProof: { valid: true },
          chainId: 'midnight',
          balanceWitness: { balance: '2000000000000000000', randomness: 'r1' }
        })]
      ]);

      await paymentProcessor.initializeWalletConnections(contributorHash, walletProofs);

      const params: PaymentCollectionParams = {
        contributorHash,
        circleId: 'circle123',
        round: 1,
        requiredAmount: BigInt('1000000000000000000'),
        recipientCommitment: 'recipient123'
      };

      await paymentProcessor.collectMonthlyPayment(params);

      // Get payment history with mock decryption key
      const history = await paymentProcessor.getPaymentHistory(contributorHash, 'mock-key');
      
      expect(history.decryptedSummary).toBeDefined();
      expect(history.decryptedSummary?.totalPayments).toBe(1);
      expect(history.decryptedSummary?.totalAmount).toBeGreaterThan(BigInt(0));
    });
  });

  describe('Payment Collector Integration', () => {
    it('should schedule and execute payment collection for a circle', async () => {
      // Mock circle and members
      const circleId = 'test-circle';
      const round = 1;
      const dueDate = Date.now() + 60000; // 1 minute from now

      const scheduleId = await paymentCollector.schedulePaymentCollection(
        circleId,
        round,
        dueDate
      );

      expect(scheduleId).toBe(`${circleId}-${round}`);

      // Execute payment collection
      const status = await paymentCollector.executePaymentCollection(scheduleId);
      
      expect(status.circleId).toBe(circleId);
      expect(status.round).toBe(round);
      expect(status.completionRate).toBeGreaterThanOrEqual(0);
    });

    it('should generate collection reports', async () => {
      const circleId = 'test-circle';
      
      // Schedule and execute a payment collection first
      const scheduleId = await paymentCollector.schedulePaymentCollection(
        circleId,
        1,
        Date.now() + 60000
      );
      
      await paymentCollector.executePaymentCollection(scheduleId);

      const report = await paymentCollector.generateCollectionReport(circleId);
      
      expect(report.circleId).toBe(circleId);
      expect(report.totalRounds).toBe(1);
      expect(report.totalCollected).toBeGreaterThanOrEqual(BigInt(0));
      expect(report.averageCompletionRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing wallet connections gracefully', async () => {
      const params: PaymentCollectionParams = {
        contributorHash: 'nonexistent-contributor',
        circleId: 'circle123',
        round: 1,
        requiredAmount: BigInt('1000000000000000000'),
        recipientCommitment: 'recipient123'
      };

      const result = await paymentProcessor.collectMonthlyPayment(params);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No wallet connections found');
    });

    it('should handle partial payments below minimum threshold', async () => {
      const contributorHash = 'low-balance-contributor';
      const walletProofs = new Map([
        ['ethereum', JSON.stringify({
          contributorCommitment: contributorHash,
          walletProof: { valid: true },
          chainId: 'ethereum',
          balanceWitness: {
            balance: '50000000000000000', // 0.05 ETH - very low
            randomness: 'random123'
          }
        })]
      ]);

      await paymentProcessor.initializeWalletConnections(contributorHash, walletProofs);

      const params: PaymentCollectionParams = {
        contributorHash,
        circleId: 'circle123',
        round: 1,
        requiredAmount: BigInt('1000000000000000000'), // 1 token
        recipientCommitment: 'recipient123',
        allowPartialPayment: true
      };

      const result = await paymentProcessor.collectMonthlyPayment(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('below minimum threshold');
    });
  });
});

// Test helper functions
export function createMockWalletProof(
  contributorHash: string, 
  chainId: string, 
  balance: string
): string {
  return JSON.stringify({
    contributorCommitment: contributorHash,
    walletProof: { valid: true },
    chainId,
    balanceWitness: {
      balance,
      randomness: `random-${chainId}-${Date.now()}`
    }
  });
}

export function createMockPaymentParams(
  contributorHash: string,
  requiredAmount: bigint,
  options: Partial<PaymentCollectionParams> = {}
): PaymentCollectionParams {
  return {
    contributorHash,
    circleId: 'test-circle',
    round: 1,
    requiredAmount,
    recipientCommitment: 'test-recipient',
    allowPartialPayment: false,
    ...options
  };
}