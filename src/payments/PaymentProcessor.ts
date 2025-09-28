/**
 * Confidential Payment Processor for Moonight Monthly Contributions
 * 
 * Features:
 * - Automated collection from multiple blockchain wallets
 * - Anonymous payment routing through privacy bridges
 * - Private balance verification using ZK proofs
 * - Cross-chain settlement with privacy preservation
 * - Encrypted transaction records
 * - Failure handling and retry mechanisms
 * - Partial payment support
 * - Privacy-preserving payment history
 */

import {
  PaymentProcessorState,
  PaymentCollectionParams,
  PaymentCollectionResult,
  WalletConnection,
  PaymentAttempt,
  EncryptedPaymentRecord,
  PaymentFailureReason,
  PartialPayment,
  PaymentRetryPolicy,
  CrossChainSettlement,
  ConfidentialBalance
} from '../types';

import { ZKProofVerifier } from '../utils/zk-verifier';
import { PrivacyUtils } from '../utils/privacy';
import { CrossChainManager } from '../utils/cross-chain';
import { PrivacyBridge } from '../bridge/PrivacyBridge';
import { TransactionMixer } from '../bridge/TransactionMixer';

export class PaymentProcessor {
  private state: PaymentProcessorState;
  private zkVerifier: ZKProofVerifier;
  private privacyUtils: PrivacyUtils;
  private crossChainManager: CrossChainManager;
  private privacyBridge: PrivacyBridge;
  private transactionMixer: TransactionMixer;

  private readonly SUPPORTED_CHAINS = ['midnight', 'ethereum', 'polygon', 'arbitrum'];
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_BASE = 30000; // 30 seconds
  private readonly PARTIAL_PAYMENT_THRESHOLD = 0.1; // 10% minimum
  private readonly ANONYMITY_SET_SIZE = 16;

  constructor(processorId: string, privacyParams: any) {
    this.state = {
      processorId,
      supportedChains: this.SUPPORTED_CHAINS,
      walletConnections: new Map(),
      pendingPayments: new Map(),
      paymentHistory: new Map(),
      encryptedRecords: new Map(),
      failureQueue: [],
      retryPolicy: {
        maxAttempts: this.MAX_RETRY_ATTEMPTS,
        baseDelay: this.RETRY_DELAY_BASE,
        backoffMultiplier: 2,
        maxDelay: 300000 // 5 minutes
      }
    };

    this.zkVerifier = new ZKProofVerifier(privacyParams);
    this.privacyUtils = new PrivacyUtils(privacyParams);
    this.crossChainManager = new CrossChainManager();
    this.privacyBridge = new PrivacyBridge(`bridge-${processorId}`, privacyParams);
    this.transactionMixer = new TransactionMixer(privacyParams);
  }

  /**
   * Initialize wallet connections for multiple chains
   */
  async initializeWalletConnections(
    contributorHash: string,
    walletProofs: Map<string, string>
  ): Promise<Map<string, WalletConnection>> {
    const connections = new Map<string, WalletConnection>();

    for (const [chainId, proof] of walletProofs) {
      if (!this.SUPPORTED_CHAINS.includes(chainId)) {
        continue;
      }

      try {
        // Verify wallet ownership proof
        const isValidProof = await this.zkVerifier.verifyWalletOwnershipProof(
          contributorHash,
          chainId,
          proof
        );

        if (!isValidProof) {
          continue;
        }

        // Get confidential balance
        const balanceProof = await this.generateConfidentialBalanceProof(
          chainId,
          proof
        );

        const connection: WalletConnection = {
          chainId,
          contributorHash,
          balanceCommitment: balanceProof.balanceCommitment,
          ownershipProof: proof,
          lastVerified: Date.now(),
          isActive: true,
          confidentialBalance: {
            balanceCommitment: balanceProof.balanceCommitment,
            chainId,
            nullifierSet: new Set(),
            zkProof: balanceProof.zkProof
          }
        };

        connections.set(chainId, connection);
      } catch (error) {
        console.error(`Failed to initialize wallet connection for ${chainId}:`, error);
      }
    }

    this.state.walletConnections.set(contributorHash, connections);
    return connections;
  }

  /**
   * Collect monthly payment from contributor with privacy preservation
   */
  async collectMonthlyPayment(
    params: PaymentCollectionParams
  ): Promise<PaymentCollectionResult> {
    const collectionId = await this.privacyUtils.generateId();
    const startTime = Date.now();

    try {
      // Get contributor's wallet connections
      const walletConnections = this.state.walletConnections.get(params.contributorHash);
      if (!walletConnections || walletConnections.size === 0) {
        throw new Error('No wallet connections found for contributor');
      }

      // Verify sufficient balance across chains
      const balanceVerification = await this.verifyAggregateBalance(
        walletConnections,
        params.requiredAmount
      );

      if (!balanceVerification.sufficient) {
        return this.handleInsufficientBalance(params, balanceVerification);
      }

      // Select optimal payment routing strategy
      const routingStrategy = await this.selectPaymentRouting(
        walletConnections,
        params.requiredAmount,
        params.recipientCommitment
      );

      // Execute payment collection
      const paymentResult = await this.executePaymentCollection(
        params,
        routingStrategy,
        collectionId
      );

      // Create encrypted payment record
      await this.createEncryptedPaymentRecord(params, paymentResult, collectionId);

      return {
        collectionId,
        success: true,
        totalCollected: paymentResult.totalAmount,
        paymentBreakdown: paymentResult.chainBreakdown,
        anonymityScore: paymentResult.anonymityScore,
        settlementProof: paymentResult.settlementProof,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Payment collection failed:', error);
      
      // Queue for retry if appropriate
      if (this.shouldRetry(error)) {
        await this.queueForRetry(params, collectionId);
      }

      return {
        collectionId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        retryScheduled: this.shouldRetry(error),
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Generate confidential balance proof for a wallet
   */
  private async generateConfidentialBalanceProof(
    chainId: string,
    ownershipProof: string
  ): Promise<{
    balanceCommitment: string;
    zkProof: string;
  }> {
    // Extract balance information from ownership proof
    const proofData = JSON.parse(ownershipProof);
    const balanceWitness = proofData.balanceWitness;

    // Generate commitment to balance
    const balanceCommitment = await this.privacyUtils.generateCommitment({
      balance: balanceWitness.balance,
      chainId,
      randomness: balanceWitness.randomness
    });

    // Generate ZK proof of balance validity
    const zkProof = await this.zkVerifier.generateBalanceProof(
      balanceCommitment,
      JSON.stringify(balanceWitness)
    );

    return {
      balanceCommitment,
      zkProof
    };
  }

  /**
   * Verify aggregate balance across multiple chains
   */
  private async verifyAggregateBalance(
    walletConnections: Map<string, WalletConnection>,
    requiredAmount: bigint
  ): Promise<{
    sufficient: boolean;
    totalBalance: bigint;
    chainBalances: Map<string, bigint>;
    shortfall?: bigint;
  }> {
    const chainBalances = new Map<string, bigint>();
    let totalBalance = BigInt(0);

    for (const [chainId, connection] of walletConnections) {
      try {
        // Verify current balance using confidential balance proof
        const balanceValid = await this.zkVerifier.verifyConfidentialBalanceProof(
          connection.balanceCommitment,
          connection.confidentialBalance.zkProof,
          chainId
        );

        if (balanceValid) {
          // Extract balance amount (in real implementation, this would use private computation)
          const mockBalance = await this.extractBalanceFromProof(connection.confidentialBalance.zkProof);
          chainBalances.set(chainId, mockBalance);
          totalBalance += mockBalance;
        }
      } catch (error) {
        console.error(`Balance verification failed for ${chainId}:`, error);
      }
    }

    const sufficient = totalBalance >= requiredAmount;
    const shortfall = sufficient ? undefined : requiredAmount - totalBalance;

    return {
      sufficient,
      totalBalance,
      chainBalances,
      shortfall
    };
  }

  /**
   * Select optimal payment routing strategy
   */
  private async selectPaymentRouting(
    walletConnections: Map<string, WalletConnection>,
    requiredAmount: bigint,
    recipientCommitment: string
  ): Promise<{
    selectedChains: string[];
    amountPerChain: Map<string, bigint>;
    routingPath: string[];
    privacyScore: number;
  }> {
    // Sort chains by balance and privacy score
    const chainBalances = new Array<{chainId: string, balance: bigint, privacyScore: number}>();
    
    for (const [chainId, connection] of walletConnections) {
      const balance = await this.extractBalanceFromProof(connection.confidentialBalance.zkProof);
      const privacyScore = this.calculateChainPrivacyScore(chainId);
      
      chainBalances.push({ chainId, balance, privacyScore });
    }

    // Sort by privacy score descending, then by balance descending
    chainBalances.sort((a, b) => {
      if (a.privacyScore !== b.privacyScore) {
        return b.privacyScore - a.privacyScore;
      }
      return b.balance > a.balance ? 1 : -1;
    });

    // Select chains and distribute amounts
    const selectedChains: string[] = [];
    const amountPerChain = new Map<string, bigint>();
    let remainingAmount = requiredAmount;

    for (const chain of chainBalances) {
      if (remainingAmount <= 0) break;
      
      const contributionAmount = remainingAmount > chain.balance ? chain.balance : remainingAmount;
      if (contributionAmount > 0) {
        selectedChains.push(chain.chainId);
        amountPerChain.set(chain.chainId, contributionAmount);
        remainingAmount -= contributionAmount;
      }
    }

    // Calculate optimal routing path for privacy
    const routingPath = await this.calculateOptimalRoutingPath(selectedChains, recipientCommitment);
    const avgPrivacyScore = chainBalances
      .filter(c => selectedChains.includes(c.chainId))
      .reduce((sum, c) => sum + c.privacyScore, 0) / selectedChains.length;

    return {
      selectedChains,
      amountPerChain,
      routingPath,
      privacyScore: avgPrivacyScore
    };
  }

  /**
   * Execute payment collection across selected chains
   */
  private async executePaymentCollection(
    params: PaymentCollectionParams,
    routingStrategy: any,
    collectionId: string
  ): Promise<{
    totalAmount: bigint;
    chainBreakdown: Map<string, bigint>;
    anonymityScore: number;
    settlementProof: string;
  }> {
    const chainBreakdown = new Map<string, bigint>();
    let totalAmount = BigInt(0);
    const settlementProofs: string[] = [];

    // Execute payments on each selected chain
    for (const chainId of routingStrategy.selectedChains) {
      const amount = routingStrategy.amountPerChain.get(chainId)!;
      
      try {
        // Create anonymous transfer through privacy bridge
        const transferResult = await this.privacyBridge.initiateAnonymousTransfer({
          sourceChain: chainId,
          targetChain: 'midnight', // Target chain for lending circle
          amount,
          recipientCommitment: params.recipientCommitment,
          senderNullifier: await this.generateSenderNullifier(params.contributorHash, chainId),
          mixingDelay: 60, // 1 minute mixing delay
          zkProof: await this.generateTransferProof(params.contributorHash, chainId, amount)
        });

        chainBreakdown.set(chainId, amount);
        totalAmount += amount;
        settlementProofs.push(transferResult.commitment);

      } catch (error) {
        console.error(`Payment execution failed on ${chainId}:`, error);
        throw error;
      }
    }

    // Generate aggregate settlement proof
    const settlementProof = await this.generateSettlementProof(
      settlementProofs,
      totalAmount,
      params.contributorHash
    );

    // Calculate anonymity score based on mixing and routing
    const anonymityScore = this.calculateAnonymityScore(
      routingStrategy.selectedChains,
      routingStrategy.routingPath,
      this.ANONYMITY_SET_SIZE
    );

    return {
      totalAmount,
      chainBreakdown,
      anonymityScore,
      settlementProof
    };
  }

  /**
   * Handle insufficient balance scenario with partial payments
   */
  private async handleInsufficientBalance(
    params: PaymentCollectionParams,
    balanceVerification: any
  ): Promise<PaymentCollectionResult> {
    const collectionId = await this.privacyUtils.generateId();
    
    // Check if partial payments are allowed
    if (!params.allowPartialPayment) {
      return {
        collectionId,
        success: false,
        error: 'Insufficient balance for full payment',
        shortfall: balanceVerification.shortfall
      };
    }

    // Calculate partial payment amount
    const partialAmount = balanceVerification.totalBalance;
    const shortfall = params.requiredAmount - partialAmount;
    
    // Verify partial amount meets minimum threshold
    const partialPercentage = Number(partialAmount * BigInt(100) / params.requiredAmount);
    if (partialPercentage < (this.PARTIAL_PAYMENT_THRESHOLD * 100)) {
      return {
        collectionId,
        success: false,
        error: 'Partial payment below minimum threshold',
        shortfall
      };
    }

    // Create partial payment record
    const partialPayment: PartialPayment = {
      paymentId: collectionId,
      contributorHash: params.contributorHash,
      circleId: params.circleId,
      round: params.round,
      amountPaid: partialAmount,
      amountDue: params.requiredAmount,
      shortfall,
      timestamp: Date.now(),
      nextPaymentDue: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      isPartial: true
    };

    // Store partial payment record
    await this.storePartialPaymentRecord(partialPayment);

    return {
      collectionId,
      success: true,
      totalCollected: partialAmount,
      isPartialPayment: true,
      shortfall,
      nextPaymentDue: partialPayment.nextPaymentDue
    };
  }

  /**
   * Create encrypted payment record for privacy preservation
   */
  private async createEncryptedPaymentRecord(
    params: PaymentCollectionParams,
    paymentResult: any,
    collectionId: string
  ): Promise<void> {
    const record: EncryptedPaymentRecord = {
      recordId: collectionId,
      contributorHash: params.contributorHash,
      circleId: params.circleId,
      round: params.round,
      encryptedAmount: await this.privacyUtils.encryptData(paymentResult.totalAmount.toString()),
      encryptedBreakdown: await this.privacyUtils.encryptData(JSON.stringify(
        Array.from(paymentResult.chainBreakdown.entries())
      )),
      anonymityScore: paymentResult.anonymityScore,
      settlementProof: paymentResult.settlementProof,
      timestamp: Date.now(),
      paymentHash: await this.privacyUtils.hashPayment(
        params.contributorHash,
        params.recipientCommitment,
        paymentResult.totalAmount
      )
    };

    this.state.encryptedRecords.set(collectionId, record);
    
    // Add to contributor's payment history
    const history = this.state.paymentHistory.get(params.contributorHash) || [];
    history.push(record);
    this.state.paymentHistory.set(params.contributorHash, history);
  }

  /**
   * Queue failed payment for retry
   */
  private async queueForRetry(
    params: PaymentCollectionParams,
    collectionId: string
  ): Promise<void> {
    const attempt: PaymentAttempt = {
      attemptId: await this.privacyUtils.generateId(),
      collectionId,
      params,
      attemptNumber: 1,
      failureReason: 'NETWORK_ERROR',
      nextRetry: Date.now() + this.RETRY_DELAY_BASE,
      maxRetries: this.MAX_RETRY_ATTEMPTS
    };

    this.state.failureQueue.push(attempt);
  }

  /**
   * Process retry queue for failed payments
   */
  async processRetryQueue(): Promise<void> {
    const now = Date.now();
    const readyForRetry = this.state.failureQueue.filter(
      attempt => attempt.nextRetry <= now && attempt.attemptNumber <= attempt.maxRetries
    );

    for (const attempt of readyForRetry) {
      try {
        const result = await this.collectMonthlyPayment(attempt.params);
        
        if (result.success) {
          // Remove from retry queue on success
          this.state.failureQueue = this.state.failureQueue.filter(
            a => a.attemptId !== attempt.attemptId
          );
        } else {
          // Update retry attempt
          attempt.attemptNumber++;
          attempt.nextRetry = now + (this.RETRY_DELAY_BASE * Math.pow(2, attempt.attemptNumber - 1));
          
          if (attempt.attemptNumber > attempt.maxRetries) {
            // Move to permanent failure
            this.state.failureQueue = this.state.failureQueue.filter(
              a => a.attemptId !== attempt.attemptId
            );
          }
        }
      } catch (error) {
        console.error(`Retry attempt failed for ${attempt.collectionId}:`, error);
      }
    }
  }

  /**
   * Get privacy-preserving payment history for contributor
   */
  async getPaymentHistory(
    contributorHash: string,
    decryptionKey?: string
  ): Promise<{
    records: EncryptedPaymentRecord[];
    decryptedSummary?: {
      totalPayments: number;
      totalAmount: bigint;
      averageAnonymityScore: number;
    };
  }> {
    const records = this.state.paymentHistory.get(contributorHash) || [];
    
    if (!decryptionKey) {
      return { records };
    }

    try {
      // Decrypt summary information if key is provided
      let totalAmount = BigInt(0);
      let totalAnonymityScore = 0;

      for (const record of records) {
        const decryptedAmount = await this.privacyUtils.decryptData(
          record.encryptedAmount,
          decryptionKey
        );
        totalAmount += BigInt(decryptedAmount);
        totalAnonymityScore += record.anonymityScore;
      }

      const decryptedSummary = {
        totalPayments: records.length,
        totalAmount,
        averageAnonymityScore: records.length > 0 ? totalAnonymityScore / records.length : 0
      };

      return { records, decryptedSummary };
    } catch (error) {
      console.error('Failed to decrypt payment history:', error);
      return { records };
    }
  }

  // Helper methods
  private async extractBalanceFromProof(zkProof: string): Promise<bigint> {
    // Mock implementation - in production this would use ZK proof verification
    const proofData = JSON.parse(zkProof);
    return BigInt(proofData.mockBalance || '1000000000000000000'); // 1 token default
  }

  private calculateChainPrivacyScore(chainId: string): number {
    // Privacy scores based on chain characteristics
    const scores = {
      'midnight': 95,
      'ethereum': 60,
      'polygon': 70,
      'arbitrum': 75
    };
    return scores[chainId as keyof typeof scores] || 50;
  }

  private async calculateOptimalRoutingPath(
    selectedChains: string[],
    recipientCommitment: string
  ): Promise<string[]> {
    // Simple routing - in production would use more sophisticated algorithms
    return [...selectedChains, 'midnight'];
  }

  private async generateSenderNullifier(
    contributorHash: string,
    chainId: string
  ): Promise<string> {
    return await this.privacyUtils.generateNullifier(contributorHash + chainId);
  }

  private async generateTransferProof(
    contributorHash: string,
    chainId: string,
    amount: bigint
  ): Promise<string> {
    return JSON.stringify({
      contributorHash,
      chainId,
      amount: amount.toString(),
      proof: { valid: true },
      timestamp: Date.now()
    });
  }

  private async generateSettlementProof(
    settlementProofs: string[],
    totalAmount: bigint,
    contributorHash: string
  ): Promise<string> {
    return await this.privacyUtils.generateCommitment({
      proofs: settlementProofs,
      totalAmount: totalAmount.toString(),
      contributorHash,
      timestamp: Date.now()
    });
  }

  private calculateAnonymityScore(
    selectedChains: string[],
    routingPath: string[],
    anonymitySetSize: number
  ): number {
    // Base score from anonymity set size
    let score = Math.min(90, anonymitySetSize * 5);
    
    // Bonus for multiple chains
    if (selectedChains.length > 1) {
      score += 5;
    }
    
    // Bonus for routing complexity
    if (routingPath.length > 2) {
      score += 3;
    }
    
    return Math.min(100, score);
  }

  private shouldRetry(error: any): boolean {
    const retryableErrors = ['NETWORK_ERROR', 'TEMPORARY_FAILURE', 'INSUFFICIENT_GAS'];
    return retryableErrors.some(type => error.message?.includes(type));
  }

  private async storePartialPaymentRecord(partialPayment: PartialPayment): Promise<void> {
    // Store in state for tracking
    const pendingPayments = this.state.pendingPayments.get(partialPayment.contributorHash) || [];
    pendingPayments.push(partialPayment);
    this.state.pendingPayments.set(partialPayment.contributorHash, pendingPayments);
  }
}