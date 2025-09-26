/**
 * Moonight Protocol Usage Examples
 * Demonstrates how to use the privacy-first lending circles
 */

import {
  createMoonightProtocol,
  generateMemberIdentity,
  createMembershipProof,
  DEFAULT_CIRCLE_PARAMS,
  DEFAULT_PRIVACY_PARAMS
} from './index';

async function demoMoonightProtocol() {
  console.log('🌙 Moonight Protocol Demo');
  console.log('=' .repeat(50));

  try {
    // 1. Initialize the protocol
    console.log('\n1. Initializing Moonight Protocol...');
    const protocol = createMoonightProtocol(DEFAULT_PRIVACY_PARAMS);
    console.log('✅ Protocol initialized with privacy parameters');

    // 2. Generate member identities
    console.log('\n2. Generating member identities...');
    const alice = await generateMemberIdentity('alice-secret-key');
    const bob = await generateMemberIdentity('bob-secret-key');
    const charlie = await generateMemberIdentity('charlie-secret-key');
    
    console.log(`✅ Alice identity: ${alice.identityCommitment.substring(0, 16)}...`);
    console.log(`✅ Bob identity: ${bob.identityCommitment.substring(0, 16)}...`);
    console.log(`✅ Charlie identity: ${charlie.identityCommitment.substring(0, 16)}...`);

    // 3. Create a lending circle
    console.log('\n3. Creating lending circle...');
    const aliceProof = await createMembershipProof(alice.secretKey);
    const circleParams = {
      ...DEFAULT_CIRCLE_PARAMS,
      maxMembers: 5,
      monthlyAmount: BigInt('500000000000000000'), // 0.5 tokens
      totalRounds: 6
    };

    const circleId = await protocol.createCircle(
      alice.identityCommitment,
      circleParams,
      aliceProof
    );
    console.log(`✅ Circle created with ID: ${circleId.substring(0, 16)}...`);

    // 4. Members join the circle
    console.log('\n4. Members joining circle...');
    
    // Alice (creator) joins first
    await protocol.joinCircle({
      circleId,
      membershipProof: aliceProof,
      stakeAmount: circleParams.stakeRequirement,
      identityCommitment: alice.identityCommitment
    });
    console.log('✅ Alice (creator) joined the circle');
    
    // Bob joins
    const bobProof = await createMembershipProof(bob.secretKey);
    await protocol.joinCircle({
      circleId,
      membershipProof: bobProof,
      stakeAmount: circleParams.stakeRequirement,
      identityCommitment: bob.identityCommitment
    });
    console.log('✅ Bob joined the circle');

    // Charlie joins
    const charlieProof = await createMembershipProof(charlie.secretKey);
    await protocol.joinCircle({
      circleId,
      membershipProof: charlieProof,
      stakeAmount: circleParams.stakeRequirement,
      identityCommitment: charlie.identityCommitment
    });
    console.log('✅ Charlie joined the circle');

    // 5. Check circle status
    console.log('\n5. Circle status...');
    const circleInfo = protocol.getCircleInfo(circleId);
    if (circleInfo) {
      console.log(`📊 Circle members: ${circleInfo.memberCount}/${circleInfo.maxMembers}`);
      console.log(`💰 Monthly amount: ${circleInfo.monthlyAmount} wei`);
      console.log(`🔄 Rounds: ${circleInfo.currentRound}/${circleInfo.totalRounds}`);
    }

    // 6. Submit confidential bids
    console.log('\n6. Submitting confidential bids for round 1...');
    
    // Alice submits a bid
    const aliceBid = await protocol.privacyUtils.generateCommitment(
      { amount: 100, round: 1, bidder: alice.identityCommitment }
    );
    const aliceValidityProof = JSON.stringify({
      commitment: aliceBid,
      valid: true,
      rangeProof: { valid: true, commitment: aliceBid }
    });

    await protocol.submitBid(alice.identityCommitment, {
      circleId,
      round: 1,
      bidCommitment: aliceBid,
      validityProof: aliceValidityProof
    });
    console.log('✅ Alice submitted confidential bid');

    // 7. Check trust scores
    console.log('\n7. Checking trust scores...');
    const aliceScore = await protocol.getTrustScore(alice.identityCommitment, aliceProof);
    const bobScore = await protocol.getTrustScore(bob.identityCommitment, bobProof);
    console.log(`📈 Alice trust score: ${aliceScore || 'Private'}`);
    console.log(`📈 Bob trust score: ${bobScore || 'Private'}`);

    // 8. Create governance proposal
    console.log('\n8. Creating governance proposal...');
    const proposalId = await protocol.createProposal(
      alice.identityCommitment,
      {
        proposalType: 'INTEREST_RATE',
        proposalData: 'Reduce interest rate to 4% for better accessibility',
        votingPeriod: 7 * 24 * 60 * 60, // 7 days
        requiredQuorum: 2
      },
      aliceProof
    );
    console.log(`✅ Governance proposal created: ${proposalId.substring(0, 16)}...`);

    // 9. Anonymous voting
    console.log('\n9. Anonymous voting...');
    const bobVote = await protocol.privacyUtils.generateVoteCommitment(true, bob.secretKey);
    const bobNullifier = await protocol.privacyUtils.generateNullifier(bob.secretKey);
    const bobVotingProof = JSON.stringify({
      memberSecret: bob.secretKey,
      proof: { valid: true }
    });

    await protocol.castVote(
      bob.identityCommitment,
      proposalId,
      bobVote,
      bobNullifier,
      bobVotingProof
    );
    console.log('✅ Bob cast anonymous vote');

    // 10. Cross-chain identity example
    console.log('\n10. Cross-chain identity registration...');
    const chainProofs = new Map([
      ['ethereum', JSON.stringify({
        address: '0x1234...abcd',
        signature: '0xabcd...1234',
        timestamp: Date.now()
      })],
      ['polygon', JSON.stringify({
        address: '0x5678...efgh',
        signature: '0xefgh...5678',
        timestamp: Date.now()
      })]
    ]);

    await protocol.registerCrossChainIdentity(
      alice.identityCommitment,
      chainProofs,
      'reputation-proof-data'
    );
    console.log('✅ Cross-chain identity registered for Alice');

    // 11. Final state summary
    console.log('\n11. Final protocol state...');
    const state = protocol.getState();
    console.log(`🏛️  Total circles: ${state.circles.size}`);
    console.log(`👥 Total members: ${state.members.size}`);
    console.log(`🗳️  Active proposals: ${state.governanceProposals.size}`);
    console.log(`🛡️  Insurance pool stake: ${state.insurancePool.totalStake} wei`);
    console.log(`🌍 Cross-chain identities: ${state.crossChainIdentities.size}`);

    console.log('\n🎉 Demo completed successfully!');
    console.log('=' .repeat(50));

    return {
      protocol,
      circleId,
      members: { alice, bob, charlie },
      proposalId
    };

  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  }
}

// Helper function to create mock payment proof
async function createPaymentProof(
  payerSecret: string,
  recipientHash: string,
  amount: bigint
): Promise<string> {
  const protocol = createMoonightProtocol();
  
  const payerCommitment = await protocol.privacyUtils.generateCommitment(payerSecret);
  const amountCommitment = await protocol.privacyUtils.generateCommitment(amount.toString());
  
  return JSON.stringify({
    payerCommitment,
    amountCommitment,
    proof: { valid: true }
  });
}

// Demo advanced features
async function demoAdvancedFeatures() {
  console.log('\n🔮 Advanced Features Demo');
  console.log('=' .repeat(30));

  const protocol = createMoonightProtocol();

  // Trust score operations
  console.log('\n📊 Trust Score Management:');
  const trustCalculator = protocol.trustCalculator;
  
  console.log('Score ranges:', trustCalculator.getScoreInterpretations());
  console.log('Requirements:', trustCalculator.getMinimumScoreRequirements());

  // Privacy utilities
  console.log('\n🔒 Privacy Operations:');
  const privacyUtils = protocol.privacyUtils;
  
  const testData = { action: 'payment', amount: 1000 };
  const encrypted = await privacyUtils.encryptWitnessData(testData);
  const decrypted = await privacyUtils.decryptWitnessData(encrypted);
  
  console.log('Encryption/Decryption test:', decrypted.action === testData.action ? '✅ Passed' : '❌ Failed');

  // ZK proof verification
  console.log('\n🛡️  Zero-Knowledge Proofs:');
  const zkVerifier = protocol.zkVerifier;
  
  const membershipProof = await createMembershipProof('test-secret');
  const isValid = await zkVerifier.verifyMembershipProof('test-hash', membershipProof);
  console.log('Membership proof verification:', isValid ? '✅ Valid' : '❌ Invalid');
}

// Run demos if script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await demoMoonightProtocol();
      await demoAdvancedFeatures();
    } catch (error) {
      console.error('Demo failed:', error);
      process.exit(1);
    }
  })();
}

export { demoMoonightProtocol, demoAdvancedFeatures, createPaymentProof };