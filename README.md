# Moonight Protocol

A privacy-first lending circles smart contract for the Midnight blockchain, featuring zero-knowledge proofs, anonymous trust scoring, and cross-chain identity management.

## 🌟 Features

### Core Privacy Features
- **Private Circle Creation**: Create lending circles with ZK member verification
- **Anonymous Trust Scoring**: 0-1000 scale trust system with privacy preservation
- **Confidential Bidding**: Zero-knowledge bidding system for lending rounds
- **Private Payment Collection**: Automated monthly payments with privacy preservation
- **Stake-based Insurance**: Private penalty enforcement and insurance claims

### Advanced Features
- **Cross-chain Identity Management**: Link identities across multiple blockchains
- **Democratic Governance**: Anonymous voting on interest rates and parameters
- **Trust Score Calculation**: Multi-factor scoring with ZK proofs
- **Insurance Pool Management**: Automated stake management and penalty distribution

## 🏗️ Architecture

### Smart Contract Components

#### Main Contract: `MoonightProtocol`
The core contract managing all lending circle operations with privacy preservation.

#### Utility Classes:
- **`ZKProofVerifier`**: Handles zero-knowledge proof verification
- **`PrivacyUtils`**: Privacy-preserving cryptographic operations
- **`TrustScoreCalculator`**: Anonymous trust scoring system
- **`CrossChainManager`**: Cross-chain identity and reputation management

### Privacy Implementation
- Uses ZK-SNARKs for membership verification
- Pedersen commitments for bid hiding
- Merkle trees for private membership proofs
- Nullifiers to prevent double-spending/voting

## 🚀 Getting Started

### Installation

```bash
git clone https://github.com/kunal-drall/moonight.git
cd moonight
npm install
```

### Build

```bash
npm run build
```

### Deploy

```bash
npm run deploy
```

### Run Tests

```bash
npm test
```

## 📖 Usage Examples

### Creating a Lending Circle

```typescript
import { createMoonightProtocol, generateMemberIdentity, DEFAULT_CIRCLE_PARAMS } from './src';

// Initialize protocol
const protocol = createMoonightProtocol();

// Generate identity
const creator = await generateMemberIdentity('your-secret-key');

// Create membership proof
const proof = await createMembershipProof(creator.secretKey);

// Create circle
const circleId = await protocol.createCircle(
  creator.identityCommitment,
  DEFAULT_CIRCLE_PARAMS,
  proof
);
```

### Joining a Circle

```typescript
const member = await generateMemberIdentity('member-secret-key');
const memberProof = await createMembershipProof(member.secretKey);

await protocol.joinCircle({
  circleId,
  membershipProof: memberProof,
  stakeAmount: BigInt('100000000000000000'), // 0.1 token
  identityCommitment: member.identityCommitment
});
```

## 🔒 Privacy Features

### Zero-Knowledge Proofs
- **Membership Proofs**: Prove circle membership without revealing identity
- **Payment Proofs**: Prove payment made without revealing amount details
- **Bid Proofs**: Submit bids while keeping amounts confidential
- **Trust Score Proofs**: Update scores with verifiable calculations

### Anonymous Voting
```typescript
const voteCommitment = await generateVoteCommitment(vote, voterSecret);
const nullifier = await generateNullifier(voterSecret);
const membershipProof = await generateAnonymousProof(voterSecret);

await protocol.castVote(
  voterHash,
  proposalId,
  voteCommitment,
  nullifier,
  membershipProof
);
```

## 🌐 Cross-Chain Integration

### Supported Chains
- Ethereum
- Polygon
- Avalanche
- Cardano
- Solana
- Midnight (native)

## 📊 Trust Scoring System

### New ZK Trust Scoring Algorithm (0-1000 scale)

The Moonight Protocol implements a sophisticated Zero-Knowledge trust scoring system that evaluates creditworthiness while preserving privacy.

#### Scoring Components & Weights
- **Payment Reliability (40%)**: Payment timeliness, consistency, and reliability patterns
- **Circle Completion History (30%)**: Successfully completing lending circles, helping other members
- **DeFi Experience (20%)**: Cross-chain DeFi activity, protocol usage, portfolio management
- **Social Verification (10%)**: Identity verification, community endorsements, social connections

#### Trust Tier System
- **Newcomer (0-199)**: Entry level with basic participation rights
  - Stake: 0.05 tokens | Benefits: Basic circle participation
- **Apprentice (200-399)**: Growing trust with medium circle access  
  - Stake: 0.1 tokens | Benefits: Medium circles, basic features
- **Builder (400-599)**: Can create small circles and priority selection
  - Stake: 0.25 tokens | Benefits: Create small circles, priority access
- **Guardian (600-799)**: Full circle access with guarantor capabilities
  - Stake: 0.5 tokens | Benefits: Medium circles, guarantor role, governance
- **Sage (800-899)**: Advanced features and large circle creation
  - Stake: 1 token | Benefits: Large circles, advanced features, proposals  
- **Lunar (900-1000)**: Premium tier with cross-chain benefits
  - Stake: 2 tokens | Benefits: All features, reduced fees, premium access

#### Privacy-Preserving Features
- **Zero-Knowledge Proofs**: Score calculations proven without revealing transaction details
- **Encrypted Witness Data**: Private scoring factors protected by encryption
- **Commitment Schemes**: Cryptographic commitments for score verification
- **Nullifier Prevention**: Prevents proof replay attacks and double-spending

#### Score Verification
The system generates verifiable ZK proofs that demonstrate:
- Score was calculated using the correct algorithm
- All components were properly weighted (40%+30%+20%+10%=100%)
- Member meets tier requirements without revealing exact values
- No transaction details or sensitive data exposed

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Deploy and test locally:

```bash
npm run deploy
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.