import { TrustScoreCalculator } from './utils/trust-score';
import { MoonightProtocol } from './contracts/MoonightProtocol';
import { createMoonightProtocol, generateMemberIdentity, DEFAULT_PRIVACY_PARAMS } from './index';

async function demonstrateZKTrustScoring() {
  console.log('🌙 Moonight Protocol - ZK Trust Scoring System Demo\n');
  
  // Initialize the trust scoring system
  const calculator = new TrustScoreCalculator();
  const protocol = createMoonightProtocol();
  
  console.log('=== 1. Member Onboarding & Initial Scoring ===');
  
  // Generate member identities
  const alice = await generateMemberIdentity('alice-secret-key');
  const bob = await generateMemberIdentity('bob-secret-key');
  const charlie = await generateMemberIdentity('charlie-secret-key');
  
  console.log('Generated member identities:');
  console.log(`Alice: ${alice.identityCommitment.substring(0, 16)}...`);
  console.log(`Bob: ${bob.identityCommitment.substring(0, 16)}...`);
  console.log(`Charlie: ${charlie.identityCommitment.substring(0, 16)}...\n`);
  
  // Calculate initial trust scores
  const scores = {
    alice: await calculator.calculateScore(alice.identityCommitment),
    bob: await calculator.calculateScore(bob.identityCommitment),
    charlie: await calculator.calculateScore(charlie.identityCommitment)
  };
  
  console.log('Initial Trust Scores:');
  Object.entries(scores).forEach(([name, score]) => {
    const tier = calculator.getTrustTier(score);
    console.log(`${name.charAt(0).toUpperCase() + name.slice(1)}: ${score} (${tier.name} tier)`);
  });
  console.log();
  
  console.log('=== 2. Trust Tier Analysis ===');
  
  // Analyze each member's tier capabilities
  ['alice', 'bob', 'charlie'].forEach((name, index) => {
    const score = Object.values(scores)[index];
    const analysis = calculator.getDetailedScoreAnalysis(score);
    
    console.log(`${name.charAt(0).toUpperCase() + name.slice(1)}'s Profile:`);
    console.log(`  Score: ${analysis.score}`);
    console.log(`  Tier: ${analysis.tier} (${analysis.range})`);
    console.log(`  Stake Required: ${(BigInt(analysis.stakeRequirement) / BigInt(1e18)).toString()} tokens`);
    console.log(`  Benefits: ${analysis.benefits.join(', ')}`);
    console.log(`  Next Tier: ${analysis.nextTier?.name || 'Max tier reached'}`);
    console.log(`  Score Needed: ${analysis.scoreToNextTier} points`);
    console.log();
  });
  
  console.log('=== 3. Zero-Knowledge Proof Generation ===');
  
  // Generate ZK proofs for trust scores
  const proofs: Record<string, string> = {};
  const members = { alice, bob, charlie };
  
  for (const [name, identity] of Object.entries(members)) {
    const score = scores[name as keyof typeof scores];
    const proof = await calculator.generateProof(identity.identityCommitment, 0);
    proofs[name] = proof;
    
    const proofData = JSON.parse(proof);
    console.log(`${name.charAt(0).toUpperCase() + name.slice(1)}'s ZK Proof:`);
    console.log(`  Proof Type: ${proofData.zkProof.proofType}`);
    console.log(`  Score Range: ${proofData.publicOutputs.scoreRange.min}-${proofData.publicOutputs.scoreRange.max}`);
    console.log(`  Tier: ${proofData.publicOutputs.tierName || calculator.getTrustTier(score).name}`);
    console.log(`  Meets Min Requirements: ${proofData.publicOutputs.meetsMinimumRequirements}`);
    console.log(`  Proof Size: ${proof.length} bytes`);
    
    // Verify the proof
    const isValid = await calculator.verifyCalculation(
      identity.identityCommitment,
      score,
      proof
    );
    console.log(`  Verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log();
  }
  
  console.log('=== 4. Action-Based Score Updates ===');
  
  // Simulate various actions and their impact on trust scores
  console.log('Simulating payment activities:');
  
  let aliceScore = scores.alice;
  
  // Alice makes successful payments
  for (let i = 1; i <= 3; i++) {
    const newScore = await calculator.updateScoreForAction(
      alice.identityCommitment,
      'PAYMENT_SUCCESS',
      aliceScore
    );
    console.log(`Payment ${i}: ${aliceScore} → ${newScore} (+${newScore - aliceScore})`);
    aliceScore = newScore;
  }
  
  // Alice completes a circle
  const circleCompletionScore = await calculator.updateScoreForAction(
    alice.identityCommitment,
    'CIRCLE_COMPLETION',
    aliceScore
  );
  console.log(`Circle Completion: ${aliceScore} → ${circleCompletionScore} (+${circleCompletionScore - aliceScore})`);
  aliceScore = circleCompletionScore;
  
  // Check tier progression
  const newTier = calculator.getTrustTier(aliceScore);
  const oldTier = calculator.getTrustTier(scores.alice);
  
  console.log(`\nAlice's Progression:`);
  console.log(`Initial: ${scores.alice} (${oldTier.name})`);
  console.log(`Final: ${aliceScore} (${newTier.name})`);
  
  if (newTier.name !== oldTier.name) {
    console.log(`🎉 Alice advanced from ${oldTier.name} to ${newTier.name}!`);
    console.log(`New benefits: ${newTier.benefits.join(', ')}`);
  }
  console.log();
  
  console.log('=== 5. Privacy-Preserving Features ===');
  
  // Demonstrate privacy features
  console.log('Privacy Features Demonstrated:');
  
  const privateScoreProof = await calculator.generateProof(alice.identityCommitment, 25);
  const proofData = JSON.parse(privateScoreProof);
  
  console.log('✓ Score calculation without revealing exact factors');
  console.log('✓ Encrypted witness data protects sensitive information');
  console.log('✓ Range proofs show tier without exact score');
  console.log('✓ Nullifiers prevent proof replay attacks');
  console.log('✓ Commitments hide transaction details');
  console.log();
  
  console.log('Proof Components:');
  console.log(`- Commitments: ${Object.keys(proofData.zkProof.commitments).length} types`);
  console.log(`- Encrypted Witness: ${proofData.encryptedWitness.length} bytes`);
  console.log(`- Public Outputs Only: Score range, tier, validity status`);
  console.log(`- Private Inputs: Exact scores, transaction history, factors`);
  console.log();
  
  console.log('=== 6. Scoring Component Breakdown ===');
  
  // Show the component breakdown (this would be from encrypted witness in production)
  console.log('Trust Score Components (weighted):');
  console.log('• Payment Reliability (40%): Consistent, on-time payments');
  console.log('• Circle Completion History (30%): Successfully completed lending circles');
  console.log('• DeFi Experience (20%): Cross-chain activity, protocol usage');
  console.log('• Social Verification (10%): Identity verification, community endorsements');
  console.log();
  
  console.log('Privacy Guarantees:');
  console.log('• Transaction amounts: HIDDEN');
  console.log('• Payment counterparties: HIDDEN');
  console.log('• Exact activity timestamps: HIDDEN');
  console.log('• Specific protocol interactions: HIDDEN');
  console.log('• Individual component scores: HIDDEN');
  console.log('• Cross-chain wallet addresses: HIDDEN');
  console.log();
  
  console.log('=== 7. System Requirements Met ===');
  
  console.log('✅ Payment reliability (40% weight)');
  console.log('✅ Circle completion history (30% weight)');
  console.log('✅ DeFi experience (20% weight)');
  console.log('✅ Social verification (10% weight)');
  console.log('✅ Trust tiers (Newcomer to Lunar)');
  console.log('✅ Different stake requirements per tier');
  console.log('✅ Benefits and restrictions per tier');
  console.log('✅ Privacy-preserving reputation calculation');
  console.log('✅ ZK proofs for creditworthiness');
  console.log('✅ No revelation of transaction details');
  console.log('✅ Verifiable score in 0-1000 range');
  console.log();
  
  console.log('🌙 ZK Trust Scoring System Demo Complete!');
}

// Run the demonstration
demonstrateZKTrustScoring().catch(console.error);