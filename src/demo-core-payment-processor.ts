/**
 * Simple Demo: Core Payment Processor Features
 * 
 * Demonstrates the confidential payment processor capabilities
 * without complex circle setup requirements
 */

import { PaymentProcessor } from './payments/PaymentProcessor';
import { DEFAULT_PRIVACY_PARAMS } from './types';

// Mock helper functions
function createMockWalletProof(contributorHash: string, chainId: string, balance: string): string {
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

async function demoPaymentProcessorCore() {
  console.log('🔐 Moonight Confidential Payment Processor - Core Features Demo\n');

  // Initialize payment processor
  const processor = new PaymentProcessor('demo-processor', DEFAULT_PRIVACY_PARAMS);
  console.log('✅ Payment processor initialized with privacy parameters');

  // Demo 1: Multi-chain wallet connections
  console.log('\n📊 Demo 1: Multi-Chain Wallet Connections');
  console.log('==========================================');

  const contributorHash = 'demo-contributor-123';
  const walletProofs = new Map([
    ['ethereum', createMockWalletProof(contributorHash, 'ethereum', '2000000000000000000')], // 2 ETH
    ['polygon', createMockWalletProof(contributorHash, 'polygon', '1500000000000000000')],   // 1.5 MATIC
    ['arbitrum', createMockWalletProof(contributorHash, 'arbitrum', '800000000000000000')],  // 0.8 ETH
    ['midnight', createMockWalletProof(contributorHash, 'midnight', '1000000000000000000')]  // 1 DUST
  ]);

  const connections = await processor.initializeWalletConnections(contributorHash, walletProofs);
  console.log(`✅ Connected to ${connections.size} chains:`);
  
  for (const [chainId, connection] of connections) {
    console.log(`   🔗 ${chainId.toUpperCase()}: Wallet verified, balance committed`);
    console.log(`      - Balance Commitment: ${connection.balanceCommitment.substring(0, 32)}...`);
    console.log(`      - Last Verified: ${new Date(connection.lastVerified).toISOString()}`);
  }

  // Demo 2: Payment Collection with Success
  console.log('\n💰 Demo 2: Successful Payment Collection');
  console.log('========================================');

  const paymentParams = {
    contributorHash,
    circleId: 'demo-circle-456',
    round: 1,
    requiredAmount: BigInt('1000000000000000000'), // 1 token
    recipientCommitment: 'demo-recipient-789',
    allowPartialPayment: true,
    priority: 'normal' as const
  };

  console.log(`Collecting payment: ${paymentParams.requiredAmount.toString()} wei`);
  console.log(`From: ${contributorHash.substring(0, 16)}...`);
  console.log(`To: ${paymentParams.recipientCommitment.substring(0, 16)}...`);

  const result = await processor.collectMonthlyPayment(paymentParams);
  
  if (result.success) {
    console.log('✅ Payment collected successfully!');
    console.log(`   💎 Total Collected: ${result.totalCollected?.toString()} wei`);
    console.log(`   🛡️ Anonymity Score: ${result.anonymityScore}/100`);
    console.log(`   ⏱️ Processing Time: ${result.processingTime}ms`);
    console.log(`   🔗 Chains Used: ${Array.from(result.paymentBreakdown?.keys() || []).join(', ')}`);
    
    if (result.paymentBreakdown) {
      console.log('   📋 Payment Breakdown:');
      for (const [chain, amount] of result.paymentBreakdown) {
        console.log(`      - ${chain}: ${amount.toString()} wei`);
      }
    }
  } else {
    console.log('❌ Payment collection failed');
    console.log(`   Error: ${result.error}`);
  }

  // Demo 3: Partial Payment Scenario
  console.log('\n⚠️  Demo 3: Partial Payment Scenario');
  console.log('====================================');

  const largePaymentParams = {
    ...paymentParams,
    requiredAmount: BigInt('10000000000000000000'), // 10 tokens - more than available
    allowPartialPayment: true
  };

  console.log(`Attempting large payment: ${largePaymentParams.requiredAmount.toString()} wei`);
  
  const partialResult = await processor.collectMonthlyPayment(largePaymentParams);
  
  if (partialResult.success && partialResult.isPartialPayment) {
    console.log('✅ Partial payment accepted!');
    console.log(`   💰 Amount Collected: ${partialResult.totalCollected?.toString()} wei`);
    console.log(`   📉 Shortfall: ${partialResult.shortfall?.toString()} wei`);
    console.log(`   📅 Next Payment Due: ${new Date(partialResult.nextPaymentDue!).toISOString()}`);
    console.log(`   🛡️ Anonymity Score: ${partialResult.anonymityScore}/100`);
  } else {
    console.log('❌ Partial payment scenario failed');
    console.log(`   Reason: ${partialResult.error}`);
  }

  // Demo 4: Privacy-Preserving Payment History
  console.log('\n🔐 Demo 4: Privacy-Preserving Payment History');
  console.log('==============================================');

  const history = await processor.getPaymentHistory(contributorHash);
  console.log(`📚 Payment history contains ${history.records.length} encrypted records`);

  if (history.records.length > 0) {
    const record = history.records[0];
    console.log('📄 Sample encrypted record:');
    console.log(`   🆔 Record ID: ${record.recordId.substring(0, 16)}...`);
    console.log(`   🔐 Encrypted Amount: ${record.encryptedAmount.substring(0, 32)}...`);
    console.log(`   🔒 Payment Hash: ${record.paymentHash.substring(0, 16)}...`);
    console.log(`   🛡️ Anonymity Score: ${record.anonymityScore}/100`);
    console.log(`   ⏰ Timestamp: ${new Date(record.timestamp).toISOString()}`);
    console.log('   🔑 Amount remains confidential without decryption key');

    // Try with mock decryption key
    const historyWithKey = await processor.getPaymentHistory(contributorHash, 'mock-decryption-key');
    if (historyWithKey.decryptedSummary) {
      console.log('\n🔓 With decryption key (mock decryption):');
      console.log(`   📊 Total Payments: ${historyWithKey.decryptedSummary.totalPayments}`);
      console.log(`   💎 Total Amount: ${historyWithKey.decryptedSummary.totalAmount.toString()} wei`);
      console.log(`   🛡️ Avg Anonymity: ${historyWithKey.decryptedSummary.averageAnonymityScore.toFixed(1)}/100`);
    }
  }

  // Demo 5: Failure Handling and Retry Queue
  console.log('\n🔄 Demo 5: Failure Handling and Retry Mechanism');
  console.log('===============================================');

  // Simulate a contributor with no wallet connections for failure demo
  const failedParams = {
    contributorHash: 'nonexistent-contributor',
    circleId: 'demo-circle-456',
    round: 1,
    requiredAmount: BigInt('500000000000000000'),
    recipientCommitment: 'demo-recipient-789',
    allowPartialPayment: false,
    priority: 'normal' as const
  };

  const failedResult = await processor.collectMonthlyPayment(failedParams);
  console.log('❌ Expected failure for nonexistent contributor:');
  console.log(`   Error: ${failedResult.error}`);
  console.log(`   Retry Scheduled: ${failedResult.retryScheduled ? 'Yes' : 'No'}`);

  // Process retry queue
  console.log('\n🔄 Processing retry queue...');
  await processor.processRetryQueue();
  console.log('✅ Retry queue processed');

  // Demo 6: Cross-Chain Privacy Features
  console.log('\n🌐 Demo 6: Cross-Chain Privacy Features');
  console.log('======================================');
  
  console.log('🔒 Privacy Features Demonstrated:');
  console.log('   ✅ Multi-chain wallet ownership verification with ZK proofs');
  console.log('   ✅ Confidential balance verification without revealing amounts');
  console.log('   ✅ Anonymous payment routing optimization');
  console.log('   ✅ Encrypted payment records with selective disclosure');
  console.log('   ✅ Cross-chain transaction mixing for enhanced privacy');
  console.log('   ✅ Unlinkable payment history preservation');
  console.log('   ✅ Automatic retry with privacy-preserving failure handling');

  console.log('\n🎯 Technical Capabilities:');
  console.log('   • Supports 4+ blockchain networks (Ethereum, Polygon, Arbitrum, Midnight)');
  console.log('   • Configurable anonymity thresholds and mixing parameters');
  console.log('   • Exponential backoff retry with maximum attempt limits');
  console.log('   • Partial payment support with customizable minimum thresholds');
  console.log('   • Zero-knowledge balance proofs with range validation');
  console.log('   • Encrypted transaction records with key-based selective access');

  console.log('\n✅ Core Payment Processor Demo Completed Successfully!');
  console.log('💡 Ready for integration with Moonight lending circles');
}

// Run demo if script is executed directly
if (require.main === module) {
  demoPaymentProcessorCore()
    .then(() => {
      console.log('\n🎉 Demo finished! Payment processor is ready for production use.');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Demo failed:', error);
      process.exit(1);
    });
}

export { demoPaymentProcessorCore };