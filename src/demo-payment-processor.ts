/**
 * Demo: Confidential Payment Processor
 * 
 * Demonstrates the automated cross-chain payment collection system
 * with privacy preservation for Moonight lending circles
 */

import { 
  MoonightPaymentProtocol,
  PaymentProcessor,
  PaymentCollector
} from './payments';
import { DEFAULT_PRIVACY_PARAMS } from './types';
import { generateMemberIdentity, createMembershipProof, DEFAULT_CIRCLE_PARAMS } from './index';

async function demoPaymentProcessor() {
  console.log('🚀 Moonight Confidential Payment Processor Demo\n');

  // Initialize enhanced protocol with payment processor
  const protocol = new MoonightPaymentProtocol('demo-protocol', DEFAULT_PRIVACY_PARAMS);
  
  console.log('1. 🔧 Setting up contributors and circle...');
  
  // Create member identities
  const alice = await generateMemberIdentity('alice-secret-key');
  const bob = await generateMemberIdentity('bob-secret-key');
  const charlie = await generateMemberIdentity('charlie-secret-key');
  
  console.log(`   ✅ Alice identity: ${alice.identityCommitment.substring(0, 16)}...`);
  console.log(`   ✅ Bob identity: ${bob.identityCommitment.substring(0, 16)}...`);
  console.log(`   ✅ Charlie identity: ${charlie.identityCommitment.substring(0, 16)}...`);

  // Create circle with auto-collection enabled
  console.log('\n2. 🔄 Creating lending circle with auto-collection...');
  
  // First, boost Alice's trust score to Builder level
  try {
    await protocol.updateTrustScore({
      targetMemberHash: (alice as any).identityCommitment,
      newScore: 700, // Builder tier
      calculationProof: JSON.stringify({ valid: true, scoreChange: 200 }),
      witnessData: JSON.stringify({ action: 'DEMO_SETUP', initialBoost: true })
    });
    console.log('   ✅ Alice\'s trust score boosted to Builder tier');
  } catch (error) {
    console.log('   ⚠️  Trust score update failed, continuing...');
  }
  
  const aliceProof = await createMembershipProof((alice as any).secretKey);
  const circleParams = {
    ...DEFAULT_CIRCLE_PARAMS,
    maxMembers: 3,
    monthlyAmount: BigInt('500000000000000000'), // 0.5 tokens
    totalRounds: 3
  };

  const circleId = await protocol.createCircleWithAutoCollection(
    (alice as any).identityCommitment,
    circleParams,
    aliceProof,
    true // Enable auto-collection
  );
  
  console.log(`   ✅ Circle created: ${circleId.substring(0, 16)}...`);
  
  // Members join the circle
  console.log('\n3. 👥 Members joining circle...');
  
  for (const [member, identity] of [['Alice', alice], ['Bob', bob], ['Charlie', charlie]]) {
    try {
      const memberProof = await createMembershipProof((identity as any).secretKey, circleId);
      await protocol.joinCircle({
        circleId,
        membershipProof: memberProof,
        stakeAmount: circleParams.stakeRequirement,
        identityCommitment: (identity as any).identityCommitment
      });
      console.log(`   ✅ ${member} joined the circle`);
    } catch (error) {
      console.log(`   ⚠️  ${member} couldn't join: ${(error as Error).message}`);
    }
  }

  // Set up multi-chain wallet connections for contributors
  console.log('\n4. 💰 Setting up multi-chain wallet connections...');
  
  const paymentProcessor = new PaymentProcessor('demo-processor', DEFAULT_PRIVACY_PARAMS);
  
  // Alice's wallets
  const aliceWallets = new Map([
    ['ethereum', createMockWalletProof((alice as any).identityCommitment, 'ethereum', '2000000000000000000')],
    ['polygon', createMockWalletProof((alice as any).identityCommitment, 'polygon', '1500000000000000000')],
    ['midnight', createMockWalletProof((alice as any).identityCommitment, 'midnight', '1000000000000000000')]
  ]);
  
  // Bob's wallets
  const bobWallets = new Map([
    ['ethereum', createMockWalletProof((bob as any).identityCommitment, 'ethereum', '800000000000000000')],
    ['arbitrum', createMockWalletProof((bob as any).identityCommitment, 'arbitrum', '1200000000000000000')]
  ]);
  
  // Charlie's wallets
  const charlieWallets = new Map([
    ['polygon', createMockWalletProof((charlie as any).identityCommitment, 'polygon', '600000000000000000')],
    ['midnight', createMockWalletProof((charlie as any).identityCommitment, 'midnight', '400000000000000000')]
  ]);

  await paymentProcessor.initializeWalletConnections((alice as any).identityCommitment, aliceWallets);
  await paymentProcessor.initializeWalletConnections((bob as any).identityCommitment, bobWallets);
  await paymentProcessor.initializeWalletConnections((charlie as any).identityCommitment, charlieWallets);
  
  console.log('   ✅ Alice: Connected to 3 chains (Ethereum, Polygon, Midnight)');
  console.log('   ✅ Bob: Connected to 2 chains (Ethereum, Arbitrum)');  
  console.log('   ✅ Charlie: Connected to 2 chains (Polygon, Midnight)');

  // Simulate payment collection for Round 1 (Alice is recipient)
  console.log('\n5. 🔄 Simulating automated payment collection for Round 1...');
  console.log('   (Alice is the recipient, so Bob and Charlie need to pay)');
  
  // Collect payment from Bob
  console.log('\n   💸 Collecting payment from Bob...');
  const bobPaymentParams = createMockPaymentParams(
    (bob as any).identityCommitment,
    circleParams.monthlyAmount,
    {
      circleId,
      recipientCommitment: (alice as any).identityCommitment,
      allowPartialPayment: true
    }
  );
  
  const bobResult = await paymentProcessor.collectMonthlyPayment(bobPaymentParams);
  console.log(`      Result: ${bobResult.success ? '✅ Success' : '❌ Failed'}`);
  if (bobResult.success) {
    console.log(`      Amount: ${bobResult.totalCollected?.toString()} wei`);
    console.log(`      Anonymity Score: ${bobResult.anonymityScore}/100`);
    console.log(`      Chains Used: ${Array.from(bobResult.paymentBreakdown?.keys() || []).join(', ')}`);
  } else {
    console.log(`      Error: ${bobResult.error}`);
  }

  // Collect payment from Charlie
  console.log('\n   💸 Collecting payment from Charlie...');
  const charliePaymentParams = createMockPaymentParams(
    (charlie as any).identityCommitment,
    circleParams.monthlyAmount,
    {
      circleId,
      recipientCommitment: (alice as any).identityCommitment,
      allowPartialPayment: true
    }
  );
  
  const charlieResult = await paymentProcessor.collectMonthlyPayment(charliePaymentParams);
  console.log(`      Result: ${charlieResult.success ? '✅ Success' : '❌ Failed'}`);
  if (charlieResult.success) {
    console.log(`      Amount: ${charlieResult.totalCollected?.toString()} wei`);
    console.log(`      Anonymity Score: ${charlieResult.anonymityScore}/100`);
    console.log(`      Chains Used: ${Array.from(charlieResult.paymentBreakdown?.keys() || []).join(', ')}`);
  } else {
    console.log(`      Error: ${charlieResult.error}`);
    if (charlieResult.isPartialPayment) {
      console.log(`      Partial Payment: ${charlieResult.totalCollected?.toString()} wei`);
      console.log(`      Shortfall: ${charlieResult.shortfall?.toString()} wei`);
    }
  }

  // Demo payment history with privacy preservation
  console.log('\n6. 🔐 Demonstrating privacy-preserving payment history...');
  
  const bobHistory = await paymentProcessor.getPaymentHistory((bob as any).identityCommitment);
  console.log(`   📝 Bob's payment history: ${bobHistory.records.length} encrypted records`);
  
  if (bobHistory.records.length > 0) {
    const record = bobHistory.records[0];
    console.log('      Sample encrypted record:');
    console.log(`      - Record ID: ${record.recordId.substring(0, 16)}...`);
    console.log(`      - Payment Hash: ${record.paymentHash.substring(0, 16)}...`);
    console.log(`      - Anonymity Score: ${record.anonymityScore}/100`);
    console.log(`      - Encrypted Amount: ${record.encryptedAmount.substring(0, 32)}...`);
    console.log('      - Amount remains private unless decryption key is provided');
  }

  // Demo failure handling and retry
  console.log('\n7. 🔄 Demonstrating failure handling and retry mechanism...');
  
  // Simulate a contributor with insufficient balance
  const insufficientParams = createMockPaymentParams(
    (charlie as any).identityCommitment,
    BigInt('2000000000000000000'), // 2 tokens - more than Charlie has
    {
      circleId,
      recipientCommitment: (alice as any).identityCommitment,
      allowPartialPayment: false
    }
  );
  
  const failedResult = await paymentProcessor.collectMonthlyPayment(insufficientParams);
  console.log(`   Result: ${failedResult.success ? '✅ Success' : '❌ Failed as expected'}`);
  console.log(`   Error: ${failedResult.error}`);
  
  // Now allow partial payment
  insufficientParams.allowPartialPayment = true;
  const partialResult = await paymentProcessor.collectMonthlyPayment(insufficientParams);
  console.log(`   Partial Payment Result: ${partialResult.success ? '✅ Success' : '❌ Failed'}`);
  if (partialResult.success && partialResult.isPartialPayment) {
    console.log(`   Partial Amount: ${partialResult.totalCollected?.toString()} wei`);
    console.log(`   Shortfall: ${partialResult.shortfall?.toString()} wei`);
    console.log(`   Next Payment Due: ${new Date(partialResult.nextPaymentDue!).toISOString()}`);
  }

  // Demo cross-chain analytics
  console.log('\n8. 📊 Cross-chain payment analytics...');
  
  try {
    const analytics = await protocol.getPaymentAnalytics(circleId);
    console.log('   Payment Analytics:');
    console.log(`   - Total Collected: ${analytics.totalCollected.toString()} wei`);
    console.log(`   - Completion Rate: ${analytics.averageCompletionRate.toFixed(2)}%`);
    console.log(`   - On-time Rate: ${analytics.onTimePaymentRate.toFixed(2)}%`);
    console.log(`   - Average Anonymity Score: ${analytics.averageAnonymityScore.toFixed(1)}/100`);
    console.log(`   - Failure Rate: ${analytics.failureRate.toFixed(2)}%`);
  } catch (error) {
    console.log(`   ⚠️  Analytics not available: ${(error as Error).message}`);
  }

  console.log('\n✅ Demo completed successfully!');
  console.log('\n🔒 Key Privacy Features Demonstrated:');
  console.log('   • Multi-chain wallet connections with ownership proofs');
  console.log('   • Anonymous payment routing through privacy bridges');
  console.log('   • Confidential balance verification using ZK proofs');
  console.log('   • Encrypted payment records with selective disclosure');
  console.log('   • Cross-chain settlement with privacy preservation');
  console.log('   • Automated retry and failure handling');
  console.log('   • Partial payment support with grace periods');
  console.log('   • Privacy-preserving payment analytics');
}

// Export helper functions for testing
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
  options: any = {}
): any {
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

// Run demo if script is executed directly
if (require.main === module) {
  demoPaymentProcessor()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Demo failed:', error);
      process.exit(1);
    });
}

export { demoPaymentProcessor };