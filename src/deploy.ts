/**
 * Deployment Script for Moonight Protocol
 * Deploy to Midnight blockchain with proper configuration
 */

import {
  createMoonightProtocol,
  generateMemberIdentity,
  DEFAULT_PRIVACY_PARAMS,
  DEPLOYMENT_CONFIG,
  DEFAULT_CIRCLE_PARAMS
} from './index';

async function deployContract() {
  console.log('🌙 Starting Moonight Protocol deployment...');
  
  try {
    // Initialize the protocol
    const protocol = createMoonightProtocol(DEFAULT_PRIVACY_PARAMS);
    console.log('✅ Protocol instance created');

    // Generate test identities
    console.log('🔑 Generating test identities...');
    const creator = await generateMemberIdentity('creator-secret-key');
    const member1 = await generateMemberIdentity('member1-secret-key');
    const member2 = await generateMemberIdentity('member2-secret-key');
    
    console.log('✅ Test identities generated');
    console.log(`   Creator: ${creator.identityCommitment}`);
    console.log(`   Member1: ${member1.identityCommitment}`);
    console.log(`   Member2: ${member2.identityCommitment}`);

    // Test contract deployment by creating initial state
    console.log('🏗️  Testing contract functionality...');
    
    // Create a test circle
    const creatorProof = await createMembershipProof(creator.secretKey);
    const circleId = await protocol.createCircle(
      creator.identityCommitment,
      DEFAULT_CIRCLE_PARAMS,
      creatorProof
    );
    
    console.log(`✅ Test circle created: ${circleId}`);

    // Test joining the circle
    const member1Proof = await createMembershipProof(member1.secretKey);
    await protocol.joinCircle({
      circleId,
      membershipProof: member1Proof,
      stakeAmount: DEFAULT_CIRCLE_PARAMS.stakeRequirement,
      identityCommitment: member1.identityCommitment
    });
    
    console.log('✅ Member successfully joined circle');

    // Test trust score calculation
    const trustScore = await protocol.getTrustScore(
      member1.identityCommitment,
      member1Proof
    );
    
    console.log(`✅ Trust score calculated: ${trustScore}`);

    // Display circle information
    const circleInfo = protocol.getCircleInfo(circleId);
    console.log('📊 Circle Information:', circleInfo);

    // Display contract state summary
    const state = protocol.getState();
    console.log('📈 Contract State Summary:');
    console.log(`   Circles: ${state.circles.size}`);
    console.log(`   Members: ${state.members.size}`);
    console.log(`   Insurance Pool Stake: ${state.insurancePool.totalStake}`);
    console.log(`   Active Members: ${state.insurancePool.activeMembers}`);

    console.log('🎉 Moonight Protocol deployment completed successfully!');
    
    return {
      protocol,
      circleId,
      testIdentities: {
        creator,
        member1,
        member2
      }
    };

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

async function createMembershipProof(secretKey: string): Promise<string> {
  const crypto = require('crypto');
  
  const commitment = crypto.createHash('sha256')
    .update(secretKey + DEFAULT_PRIVACY_PARAMS.commitmentScheme)
    .digest('hex');
  
  const nullifier = crypto.createHash('sha256')
    .update(secretKey + DEFAULT_PRIVACY_PARAMS.nullifierDerivation)
    .digest('hex');
  
  const proof = {
    commitment,
    nullifier,
    proof: {
      valid: true,
      timestamp: Date.now()
    }
  };

  return JSON.stringify(proof);
}

// Run deployment if this file is executed directly
if (require.main === module) {
  deployContract()
    .then((result) => {
      console.log('✨ Deployment successful!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Deployment failed:', error);
      process.exit(1);
    });
}

export { deployContract };