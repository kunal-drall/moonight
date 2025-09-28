/**
 * Moonight Private Governance System Demo
 * Demonstrates trust-weighted voting, proposal lifecycle, and privacy-preserving tallying
 */

import { MoonightProtocol } from './contracts/MoonightProtocol';
import { GovernanceManager } from './utils/governance';
import { 
  PrivacyParams, 
  CreateProposalParams,
  GovernanceProposal 
} from './types';

async function demoPrivateGovernance() {
  console.log('🌙 Moonight Private Governance System Demo');
  console.log('==========================================\n');

  // Initialize the protocol
  const mockPrivacyParams: PrivacyParams = {
    zkSnarkParams: 'production-params-v1.0',
    commitmentScheme: 'pedersen',
    nullifierDerivation: 'poseidon',
    proofVerificationKey: 'verification-key-v1.0'
  };

  const protocol = new MoonightProtocol('governance-demo', mockPrivacyParams);

  console.log('1. 🔧 Setting up mock lending circle...');
  
  // Setup a mock circle for governance
  const circleId = 'moonight-circle-alpha';
  const mockCircle = {
    circleId,
    memberCount: 8,
    maxMembers: 12,
    monthlyAmount: BigInt('1500000000000000000'), // 1.5 ETH
    interestRate: 500, // 5% annually
    currentRound: 3,
    totalRounds: 12,
    createdBlock: 1000,
    isActive: true,
    zkMembershipRoot: 'merkle-root-abc123'
  };

  // Add circle to protocol state
  (protocol as any).state.circles.set(circleId, mockCircle);

  // Setup mock members with different trust scores
  const members = [
    { hash: 'alice-hash-456', trustScore: 850, name: 'Alice (High Trust)' },
    { hash: 'bob-hash-789', trustScore: 650, name: 'Bob (Medium Trust)' },
    { hash: 'charlie-hash-012', trustScore: 720, name: 'Charlie (Medium-High Trust)' },
    { hash: 'diana-hash-345', trustScore: 480, name: 'Diana (Low-Medium Trust)' },
    { hash: 'eve-hash-678', trustScore: 920, name: 'Eve (Very High Trust)' }
  ];

  for (const member of members) {
    (protocol as any).state.trustScores.set(member.hash, member.trustScore);
  }

  console.log(`✅ Circle "${circleId}" created with ${mockCircle.memberCount} members`);
  console.log(`   Current interest rate: ${mockCircle.interestRate / 100}%\n`);

  console.log('2. 📋 Creating governance proposal...');

  // Alice (high trust) creates a proposal to change interest rate
  const creatorHash = 'alice-hash-456';
  const creatorProof = JSON.stringify({
    commitment: 'commitment-hash-alice-proposal',
    nullifier: 'nullifier-alice-proposal-456',
    proof: { valid: true, zkProof: 'alice-membership-proof' }
  });

  const proposalParams: CreateProposalParams = {
    proposalType: 'INTEREST_RATE',
    proposalData: JSON.stringify({
      title: 'Reduce Interest Rate to Support Members',
      description: 'Given market conditions and member feedback, propose reducing annual interest rate from 5% to 3.5% to make borrowing more accessible.',
      currentRate: 500,
      proposedRate: 350,
      rationale: 'Lower rates will increase borrowing activity and benefit all circle members'
    }),
    votingPeriod: 604800, // 7 days
    requiredQuorum: 60, // 60% participation required
    circleId,
    minimumTrustScore: 400, // Minimum 400 trust to vote
    executionPeriod: 86400 // 24 hour execution window
  };

  try {
    const proposalId = await protocol.createProposal(creatorHash, proposalParams, creatorProof);
    console.log(`✅ Proposal created successfully!`);
    console.log(`   Proposal ID: ${proposalId}`);
    console.log(`   Type: Interest Rate Change`);
    console.log(`   Quorum Required: ${proposalParams.requiredQuorum}%`);
    console.log(`   Minimum Trust Score: ${proposalParams.minimumTrustScore}\n`);

    console.log('3. 🗳️  Anonymous voting phase...');

    // Members cast their votes anonymously with trust weighting
    const votes = [
      { member: members[0], vote: true, reason: 'Supports lower rates' },
      { member: members[1], vote: false, reason: 'Prefers current rate' },
      { member: members[2], vote: true, reason: 'Agrees with proposal' },
      { member: members[3], vote: true, reason: 'Needs lower rates' },
      { member: members[4], vote: false, reason: 'Conservative approach' }
    ];

    for (let i = 0; i < votes.length; i++) {
      const { member, vote, reason } = votes[i];
      
      // Generate anonymous vote commitment
      const voteCommitment = JSON.stringify({
        choice: vote,
        randomness: `random-${i}-${Date.now()}`,
        timestamp: Date.now()
      });

      const zkNullifier = `nullifier-${member.hash}-${proposalId}`;
      const membershipProof = JSON.stringify({
        commitment: `commitment-${member.hash}-${proposalId}`,
        nullifier: zkNullifier,
        proof: { valid: true, circleId }
      });

      await protocol.castVote(
        member.hash,
        proposalId,
        voteCommitment,
        zkNullifier,
        membershipProof
      );

      console.log(`   ✅ ${member.name} voted ${vote ? 'YES' : 'NO'} (Trust: ${member.trustScore}) - ${reason}`);
    }

    console.log(`\n   Total votes cast: ${votes.length}`);
    console.log('   🔒 All individual votes remain private and anonymous\n');

    console.log('4. 📊 Confidential vote tallying...');

    // Simulate voting period ending
    const proposal = protocol.getProposalResults(proposalId).proposal!;
    const expiredProposal: GovernanceProposal = {
      ...proposal,
      votingDeadline: Date.now() - 1000 // Expired
    };
    (protocol as any).state.governanceProposals.set(proposalId, expiredProposal);

    // Perform confidential tallying
    const tallyResult = await protocol.tallyVotesAndFinalize(proposalId);

    console.log('   📈 Vote Tally Results (Privacy-Preserved):');
    console.log(`      Total Participants: ${tallyResult.totalVotes}`);
    console.log(`      YES Votes: ${tallyResult.yesVotes}`);
    console.log(`      NO Votes: ${tallyResult.noVotes}`);
    console.log(`      Total Trust Weight: ${tallyResult.totalTrustWeight}`);
    console.log(`      YES Trust Weight: ${tallyResult.yesTrustWeight}`);
    console.log(`      NO Trust Weight: ${tallyResult.noTrustWeight}`);
    console.log(`      Quorum Met: ${tallyResult.quorumMet ? '✅' : '❌'}`);
    console.log(`      Proposal Status: ${tallyResult.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`      Privacy Preserved: ${tallyResult.privacyPreserved ? '🔒 YES' : '❌ NO'}\n`);

    if (tallyResult.passed) {
      console.log('5. ⚡ Executing approved proposal...');

      const executorHash = 'protocol-executor';
      const executionData = {
        newInterestRate: 350, // 3.5%
        previousRate: 500,
        changeReason: 'Community governance decision',
        effectiveDate: new Date().toISOString()
      };

      const executed = await protocol.executeProposal(proposalId, executorHash, executionData);

      if (executed) {
        console.log('   ✅ Proposal executed successfully!');
        
        // Verify the changes
        const updatedCircle = (protocol as any).state.circles.get(circleId);
        console.log(`      Interest rate updated: ${mockCircle.interestRate / 100}% → ${updatedCircle.interestRate / 100}%`);
        
        const executionResults = protocol.getProposalResults(proposalId);
        console.log(`      Execution timestamp: ${new Date(executionResults.execution?.executedAt || 0).toISOString()}`);
        console.log('      🔒 Execution details encrypted, outcome transparent\n');
      }

      console.log('6. 🔍 Privacy and Transparency Summary:');
      console.log('   PRIVATE (Zero-Knowledge):');
      console.log('   • Individual vote choices remain completely anonymous');
      console.log('   • Voter identities are not revealed');
      console.log('   • Trust scores are hidden during voting process');
      console.log('   • Execution details are encrypted');
      console.log('');
      console.log('   PUBLIC (Transparent):');
      console.log('   • Proposal details and outcomes');
      console.log('   • Aggregate vote tallies and trust weights');
      console.log('   • Quorum achievement status');
      console.log('   • Final proposal execution results');
      console.log('   • Verification proofs for integrity\n');

    } else {
      console.log('5. ❌ Proposal failed - no execution needed');
      console.log(`   Reason: ${!tallyResult.quorumMet ? 'Insufficient participation' : 'Majority voted against'}\n`);
    }

    console.log('7. 🔐 Governance Features Demonstrated:');
    console.log('   ✅ Anonymous proposal creation with trust verification');
    console.log('   ✅ Trust-weighted private voting');
    console.log('   ✅ Confidential vote tallying with public results');
    console.log('   ✅ Democratic interest rate setting');
    console.log('   ✅ Quorum requirements enforcement');
    console.log('   ✅ Privacy-preserving result verification');
    console.log('   ✅ Transparent outcome with private details');
    console.log('   ✅ Proposal lifecycle management\n');

    console.log('🎉 Private Governance Demo Completed Successfully!');
    console.log('    Members voted democratically while maintaining complete privacy.');
    console.log('    The governance system ensures both transparency and anonymity.');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
if (require.main === module) {
  demoPrivateGovernance().catch(console.error);
}

export { demoPrivateGovernance };