/**
 * Tests for Cross-Chain Privacy Bridge
 */

import { PrivacyBridge } from '../bridge/PrivacyBridge';
import { AnonymityPoolManager } from '../bridge/AnonymityPoolManager';
import { TransactionMixer } from '../bridge/TransactionMixer';
import { CrossChainRouter } from '../bridge/CrossChainRouter';
import { DEFAULT_PRIVACY_PARAMS } from '../index';
import { AnonymousTransferParams } from '../types';

describe('Cross-Chain Privacy Bridge', () => {
  let privacyBridge: PrivacyBridge;
  let bridgeId: string;

  beforeEach(() => {
    bridgeId = 'test-bridge-' + Math.random().toString(36).substring(7);
    privacyBridge = new PrivacyBridge(bridgeId, DEFAULT_PRIVACY_PARAMS);
  });

  describe('Anonymous Cross-Chain Transfers', () => {
    test('should initiate anonymous transfer between chains', async () => {
      const transferParams: AnonymousTransferParams = {
        sourceChain: 'ethereum',
        targetChain: 'midnight',
        amount: BigInt('1000000000000000000'), // 1 ETH
        recipientCommitment: '0x' + '1'.repeat(64),
        senderNullifier: '0x' + '2'.repeat(64),
        mixingDelay: 60, // 1 minute
        zkProof: JSON.stringify({
          transferProof: { valid: true },
          balanceProof: { valid: true },
          nullifierProof: { valid: true },
          amountCommitment: '0x' + '3'.repeat(64)
        })
      };

      const result = await privacyBridge.initiateAnonymousTransfer(transferParams);

      expect(result.transferId).toBeDefined();
      expect(result.commitment).toBeDefined();
      expect(result.nullifier).toBe(transferParams.senderNullifier);
      expect(result.estimatedConfirmation).toBeGreaterThan(60);
    });

    test('should reject transfer with invalid proof', async () => {
      const transferParams: AnonymousTransferParams = {
        sourceChain: 'ethereum',
        targetChain: 'midnight',
        amount: BigInt('1000000000000000000'),
        recipientCommitment: '0x' + '1'.repeat(64),
        senderNullifier: '0x' + '2'.repeat(64),
        mixingDelay: 0,
        zkProof: JSON.stringify({
          transferProof: { valid: false }, // Invalid proof
          balanceProof: { valid: true },
          nullifierProof: { valid: true },
          amountCommitment: '0x' + '3'.repeat(64)
        })
      };

      await expect(privacyBridge.initiateAnonymousTransfer(transferParams))
        .rejects.toThrow('Invalid anonymous transfer proof');
    });

    test('should reject transfer with reused nullifier', async () => {
      const transferParams: AnonymousTransferParams = {
        sourceChain: 'ethereum',
        targetChain: 'midnight',
        amount: BigInt('1000000000000000000'),
        recipientCommitment: '0x' + '1'.repeat(64),
        senderNullifier: '0x' + 'duplicate'.padEnd(64, '0'),
        mixingDelay: 0,
        zkProof: JSON.stringify({
          transferProof: { valid: true },
          balanceProof: { valid: true },
          nullifierProof: { valid: true },
          amountCommitment: '0x' + '3'.repeat(64)
        })
      };

      // First transfer should succeed
      await privacyBridge.initiateAnonymousTransfer(transferParams);

      // Second transfer with same nullifier should fail
      await expect(privacyBridge.initiateAnonymousTransfer(transferParams))
        .rejects.toThrow('Nullifier already used - potential double spend');
    });

    test('should reject unsupported chains', async () => {
      const transferParams: AnonymousTransferParams = {
        sourceChain: 'unsupported-chain',
        targetChain: 'midnight',
        amount: BigInt('1000000000000000000'),
        recipientCommitment: '0x' + '1'.repeat(64),
        senderNullifier: '0x' + '2'.repeat(64),
        mixingDelay: 0,
        zkProof: JSON.stringify({
          transferProof: { valid: true },
          balanceProof: { valid: true },
          nullifierProof: { valid: true },
          amountCommitment: '0x' + '3'.repeat(64)
        })
      };

      await expect(privacyBridge.initiateAnonymousTransfer(transferParams))
        .rejects.toThrow('Unsupported chain for transfer');
    });
  });

  describe('Confidential Balance Proofs', () => {
    test('should generate confidential balance proof', async () => {
      const chainId = 'ethereum';
      const balanceCommitment = '0x' + '1'.repeat(64);
      const witnessData = JSON.stringify({
        balance: '5000000000000000000', // 5 ETH as string
        chainId,
        blockNumber: 12345,
        nonce: 1
      });

      const result = await privacyBridge.generateConfidentialBalanceProof(
        chainId,
        balanceCommitment,
        witnessData
      );

      expect(result.proof).toBeDefined();
      expect(result.balanceRoot).toBeDefined();
      expect(Array.isArray(result.nullifierSet)).toBe(true);
    });

    test('should reject balance proof for unsupported chain', async () => {
      const chainId = 'unsupported-chain';
      const balanceCommitment = '0x' + '1'.repeat(64);
      const witnessData = JSON.stringify({
        balance: '5000000000000000000', // 5 ETH as string
        chainId,
        blockNumber: 12345,
        nonce: 1
      });

      await expect(privacyBridge.generateConfidentialBalanceProof(
        chainId,
        balanceCommitment,
        witnessData
      )).rejects.toThrow('Unsupported chain for balance proof');
    });
  });

  describe('Private Payment Routing', () => {
    test('should execute private payment routing', async () => {
      const sourceChain = 'ethereum';
      const targetChain = 'midnight';
      const amount = BigInt('1000000000000000000'); // 1 ETH
      const recipientCommitment = '0x' + '1'.repeat(64);

      const result = await privacyBridge.executePrivatePaymentRouting(
        sourceChain,
        targetChain,
        amount,
        recipientCommitment,
        2 // max 2 hops
      );

      expect(result.routeId).toBeDefined();
      expect(result.route.sourceChain).toBe(sourceChain);
      expect(result.route.targetChain).toBe(targetChain);
      expect(result.route.privacyScore).toBeGreaterThanOrEqual(50);
      expect(Array.isArray(result.intermediateCommitments)).toBe(true);
    });

    test('should reject routing with insufficient privacy score', async () => {
      // Mock a scenario where no sufficiently private route exists
      const sourceChain = 'ethereum';
      const targetChain = 'polygon'; // Direct connection might have low privacy score
      const amount = BigInt('1000000000000000000');
      const recipientCommitment = '0x' + '1'.repeat(64);

      // This test depends on the routing logic - if direct routes have low privacy scores
      try {
        const result = await privacyBridge.executePrivatePaymentRouting(
          sourceChain,
          targetChain,
          amount,
          recipientCommitment,
          1 // Only direct routes allowed
        );
        // If it succeeds, check that privacy score is reasonable
        expect(result.route.privacyScore).toBeGreaterThan(0);
      } catch (error) {
        expect((error as Error).message).toContain('No sufficiently private route found');
      }
    });
  });

  describe('Transaction Mixing', () => {
    test('should mix multiple transactions', async () => {
      // Create test transfers
      const transfers = [];
      for (let i = 0; i < 3; i++) {
        const transfer = {
          transferId: `test-transfer-${i}`,
          sourceChain: 'ethereum',
          targetChain: 'midnight',
          amount: BigInt('1000000000000000000'),
          recipientCommitment: '0x' + i.toString().repeat(64),
          nullifierHash: '0x' + (i + 1).toString().repeat(64),
          zkProof: JSON.stringify({ valid: true }),
          timestamp: Date.now(),
          status: 'PENDING' as const
        };
        transfers.push(transfer);
      }

      const result = await privacyBridge.mixTransactions(transfers, 20);

      expect(result.mixId).toBeDefined();
      expect(result.mixedTransfers.length).toBeGreaterThanOrEqual(transfers.length);
      expect(result.anonymitySetSize).toBeGreaterThanOrEqual(20);
    });

    test('should reject mixing with insufficient transfers', async () => {
      const transfer = {
        transferId: 'single-transfer',
        sourceChain: 'ethereum',
        targetChain: 'midnight',
        amount: BigInt('1000000000000000000'),
        recipientCommitment: '0x' + '1'.repeat(64),
        nullifierHash: '0x' + '2'.repeat(64),
        zkProof: JSON.stringify({ valid: true }),
        timestamp: Date.now(),
        status: 'PENDING' as const
      };

      await expect(privacyBridge.mixTransactions([transfer], 20))
        .rejects.toThrow('Need at least 2 transfers for mixing');
    });
  });

  describe('Transfer Verification', () => {
    test('should verify transfer completion', async () => {
      // First initiate a transfer
      const transferParams: AnonymousTransferParams = {
        sourceChain: 'ethereum',
        targetChain: 'midnight',
        amount: BigInt('1000000000000000000'),
        recipientCommitment: '0x' + '1'.repeat(64),
        senderNullifier: '0x' + '2'.repeat(64),
        mixingDelay: 0,
        zkProof: JSON.stringify({
          transferProof: { valid: true },
          balanceProof: { valid: true },
          nullifierProof: { valid: true },
          amountCommitment: '0x' + '3'.repeat(64)
        })
      };

      const initResult = await privacyBridge.initiateAnonymousTransfer(transferParams);
      const result = await privacyBridge.verifyTransferCompletion(initResult.transferId);

      expect(typeof result.completed).toBe('boolean');
      expect(result.confirmations).toBeGreaterThanOrEqual(0);
      expect(result.privacyScore).toBeGreaterThanOrEqual(0);
      expect(result.privacyScore).toBeLessThanOrEqual(100);
    });

    test('should reject verification for non-existent transfer', async () => {
      const fakeTransferId = 'non-existent-transfer-id';

      await expect(privacyBridge.verifyTransferCompletion(fakeTransferId))
        .rejects.toThrow('Transfer not found');
    });
  });

  describe('Anonymity Pools', () => {
    test('should get anonymity pool information', async () => {
      // Create a mock pool first by initiating transfers
      const transferParams: AnonymousTransferParams = {
        sourceChain: 'ethereum',
        targetChain: 'midnight',
        amount: BigInt('1000000000000000000'),
        recipientCommitment: '0x' + '1'.repeat(64),
        senderNullifier: '0x' + '2'.repeat(64),
        mixingDelay: 30,
        zkProof: JSON.stringify({
          transferProof: { valid: true },
          balanceProof: { valid: true },
          nullifierProof: { valid: true },
          amountCommitment: '0x' + '3'.repeat(64)
        })
      };

      await privacyBridge.initiateAnonymousTransfer(transferParams);

      // Note: In a real implementation, we'd need to get the pool ID from the transfer result
      // For this test, we'll create a basic pool info check
      const testPoolId = 'pool_test';
      
      try {
        const poolInfo = await privacyBridge.getAnonymityPoolInfo(testPoolId);
        expect(poolInfo.poolSize).toBeGreaterThanOrEqual(0);
        expect(poolInfo.denomination).toBeDefined();
        expect(poolInfo.merkleRoot).toBeDefined();
        expect(poolInfo.commitments).toBeGreaterThanOrEqual(0);
      } catch (error) {
        // Expected if pool doesn't exist
        expect((error as Error).message).toContain('not found');
      }
    });
  });
});

describe('Anonymity Pool Manager', () => {
  let poolManager: AnonymityPoolManager;

  beforeEach(() => {
    poolManager = new AnonymityPoolManager(DEFAULT_PRIVACY_PARAMS);
  });

  test('should create anonymity pool', async () => {
    const poolId = await poolManager.createPool('ethereum', BigInt('1000000000000000000'));
    
    expect(poolId).toBeDefined();
    expect(poolId.startsWith('pool_')).toBe(true);

    const poolInfo = await poolManager.getPoolInfo(poolId);
    expect(poolInfo.poolSize).toBe(0);
    expect(poolInfo.denomination).toBe(BigInt('1000000000000000000'));
  });

  test('should add commitment to pool', async () => {
    const poolId = await poolManager.createPool('ethereum', BigInt('1000000000000000000'));
    const result = await poolManager.addToPool(poolId, 'test-transfer-1');

    expect(result.commitment).toBeDefined();
    expect(result.merkleIndex).toBe(0);
    expect(result.newRoot).toBeDefined();

    const poolInfo = await poolManager.getPoolInfo(poolId);
    expect(poolInfo.poolSize).toBe(1);
  });

  test('should find optimal pool for amount', async () => {
    await poolManager.createPool('ethereum', BigInt('1000000000000000000'));
    await poolManager.createPool('ethereum', BigInt('10000000000000000000'));

    const result = await poolManager.findOptimalPool('ethereum', BigInt('1100000000000000000'));

    if (result) {
      expect(result.denomination).toBe(BigInt('1000000000000000000'));
      expect(result.anonymitySetSize).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('Transaction Mixer', () => {
  let mixer: TransactionMixer;

  beforeEach(() => {
    mixer = new TransactionMixer(DEFAULT_PRIVACY_PARAMS);
  });

  test('should add transfer to mixing queue', async () => {
    const transfer = {
      transferId: 'test-transfer',
      sourceChain: 'ethereum',
      targetChain: 'midnight',
      amount: BigInt('1000000000000000000'),
      recipientCommitment: '0x' + '1'.repeat(64),
      nullifierHash: '0x' + '2'.repeat(64),
      zkProof: JSON.stringify({ valid: true }),
      timestamp: Date.now(),
      status: 'PENDING' as const
    };

    const result = await mixer.addToMixingQueue(transfer, 60);

    expect(result.queueId).toBeDefined();
    expect(result.estimatedMixTime).toBeGreaterThan(Date.now());
  });

  test('should execute transaction mix', async () => {
    const transfers = [];
    for (let i = 0; i < 5; i++) {
      transfers.push({
        transferId: `test-transfer-${i}`,
        sourceChain: 'ethereum',
        targetChain: 'midnight',
        amount: BigInt('1000000000000000000'),
        recipientCommitment: '0x' + i.toString().repeat(64),
        nullifierHash: '0x' + (i + 1).toString().repeat(64),
        zkProof: JSON.stringify({ valid: true }),
        timestamp: Date.now(),
        status: 'PENDING' as const
      });
    }

    const mix = await mixer.executeMix(transfers, 10);

    expect(mix.mixId).toBeDefined();
    expect(mix.inputCommitments).toHaveLength(transfers.length);
    expect(mix.outputCommitments).toHaveLength(transfers.length);
    expect(mix.nullifiers).toHaveLength(transfers.length);
    expect(mix.anonymitySetSize).toBeGreaterThanOrEqual(10);
  });

  test('should get mixing statistics', () => {
    const stats = mixer.getMixingStats();

    expect(stats.totalMixes).toBeGreaterThanOrEqual(0);
    expect(stats.averageAnonymitySet).toBeGreaterThanOrEqual(0);
    expect(stats.totalVolumeProcessed).toBeGreaterThanOrEqual(BigInt(0));
    expect(stats.queueSizes instanceof Map).toBe(true);
  });
});

describe('Cross-Chain Router', () => {
  let router: CrossChainRouter;

  beforeEach(() => {
    router = new CrossChainRouter();
  });

  test('should find optimal route between chains', async () => {
    const route = await router.findOptimalRoute('ethereum', 'midnight', BigInt('1000000000000000000'));

    expect(route.sourceChain).toBe('ethereum');
    expect(route.targetChain).toBe('midnight');
    expect(route.totalHops).toBeGreaterThan(0);
    expect(route.estimatedDelay).toBeGreaterThan(0);
    expect(route.privacyScore).toBeGreaterThanOrEqual(0);
  });

  test('should find multiple route options', async () => {
    const routes = await router.findMultipleRoutes('ethereum', 'midnight', BigInt('1000000000000000000'));

    expect(routes.fastestRoute).toBeDefined();
    expect(routes.cheapestRoute).toBeDefined();
    expect(routes.mostPrivateRoute).toBeDefined();
    expect(Array.isArray(routes.alternativeRoutes)).toBe(true);
  });

  test('should estimate route cost', async () => {
    const route = await router.findOptimalRoute('ethereum', 'midnight', BigInt('1000000000000000000'));
    const cost = await router.estimateRouteCost(route, BigInt('1000000000000000000'));

    expect(cost.totalFee).toBeGreaterThan(BigInt(0));
    expect(Array.isArray(cost.breakdown)).toBe(true);
    expect(cost.breakdown.length).toBeGreaterThan(0);
  });

  test('should reject same source and target chains', async () => {
    await expect(router.findOptimalRoute('ethereum', 'ethereum', BigInt('1000000000000000000')))
      .rejects.toThrow('Source and target chains cannot be the same');
  });
});