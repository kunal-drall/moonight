import { TrustScoreCalculator } from './utils/trust-score';

async function testTrustScoring() {
  console.log('=== ZK Trust Scoring System Test ===\n');
  
  const calculator = new TrustScoreCalculator();
  const testMember = 'test-member-123';
  
  // Test 1: Score Calculation
  console.log('1. Testing Score Calculation...');
  const score = await calculator.calculateScore(testMember);
  console.log(`   Calculated Score: ${score}`);
  console.log(`   Score Range Valid: ${score >= 0 && score <= 1000}\n`);
  
  // Test 2: Trust Tier System
  console.log('2. Testing Trust Tier System...');
  const tier = calculator.getTrustTier(score);
  console.log(`   Tier Name: ${tier.name}`);
  console.log(`   Tier Key: ${tier.tierKey}`);
  console.log(`   Score Range: ${tier.minScore}-${tier.maxScore}`);
  console.log(`   Stake Requirement: ${tier.stakeRequirement.toString()} wei`);
  console.log(`   Benefits: ${tier.benefits.join(', ')}`);
  console.log(`   Restrictions: ${tier.restrictions.join(', ') || 'None'}\n`);
  
  // Test 3: All Tiers
  console.log('3. Testing All Trust Tiers...');
  const scores = [50, 250, 450, 650, 850, 950];
  for (const testScore of scores) {
    const testTier = calculator.getTrustTier(testScore);
    console.log(`   Score ${testScore}: ${testTier.name} (${testTier.minScore}-${testTier.maxScore})`);
  }
  console.log();
  
  // Test 4: Action Permissions
  console.log('4. Testing Action Permissions...');
  const actions = ['CREATE_CIRCLE', 'ACCESS_ADVANCED_FEATURES', 'CROSS_CHAIN_BENEFITS'];
  for (const action of actions) {
    const canPerform = calculator.canPerformAction(score, action);
    console.log(`   ${action}: ${canPerform ? 'ALLOWED' : 'DENIED'}`);
  }
  console.log();
  
  // Test 5: Score Updates
  console.log('5. Testing Score Updates...');
  const initialScore = 600;
  const paymentSuccess = await calculator.updateScoreForAction(testMember, 'PAYMENT_SUCCESS', initialScore);
  const paymentDefault = await calculator.updateScoreForAction(testMember, 'PAYMENT_DEFAULT', initialScore);
  console.log(`   Initial Score: ${initialScore}`);
  console.log(`   After Payment Success: ${paymentSuccess} (${paymentSuccess > initialScore ? '+' : ''}${paymentSuccess - initialScore})`);
  console.log(`   After Payment Default: ${paymentDefault} (${paymentDefault - initialScore})\n`);
  
  // Test 6: ZK Proof Generation
  console.log('6. Testing ZK Proof Generation...');
  const proof = await calculator.generateProof(testMember, 10);
  const proofData = JSON.parse(proof);
  console.log(`   Proof Generated: ✓`);
  console.log(`   Has ZK Proof: ${!!proofData.zkProof}`);
  console.log(`   Proof Valid: ${proofData.zkProof?.valid}`);
  console.log(`   Has Public Outputs: ${!!proofData.publicOutputs}`);
  console.log(`   Has Encrypted Witness: ${!!proofData.encryptedWitness}`);
  
  // Test proof verification
  const isValidProof = await calculator.verifyCalculation(testMember, score, proof);
  console.log(`   Proof Verification: ${isValidProof ? 'PASS' : 'FAIL'}\n`);
  
  // Test 7: Detailed Analysis
  console.log('7. Testing Detailed Score Analysis...');
  const analysis = calculator.getDetailedScoreAnalysis(score);
  console.log(`   Current Score: ${analysis.score}`);
  console.log(`   Current Tier: ${analysis.tier}`);
  console.log(`   Next Tier: ${analysis.nextTier?.name || 'None (Max tier)'}`);
  console.log(`   Score to Next Tier: ${analysis.scoreToNextTier}`);
  console.log(`   Stake Requirement: ${analysis.stakeRequirement} wei\n`);
  
  // Test 8: Requirements and Interpretations
  console.log('8. Testing Requirements System...');
  const requirements = calculator.getMinimumScoreRequirements();
  const interpretations = calculator.getScoreInterpretations();
  
  console.log('   Score Requirements:');
  Object.entries(requirements).forEach(([action, minScore]) => {
    console.log(`     ${action}: ${minScore}`);
  });
  
  console.log('\n   Score Interpretations:');
  Object.entries(interpretations).forEach(([range, tierName]) => {
    console.log(`     ${range}: ${tierName}`);
  });
  
  console.log('\n=== Test Completed Successfully ===');
}

// Run the test
testTrustScoring().catch(console.error);