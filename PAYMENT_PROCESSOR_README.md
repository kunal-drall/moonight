# Confidential Payment Processor for Moonight

A comprehensive payment automation system for Moonight lending circles that enables anonymous, multi-chain payment collection with privacy preservation.

## Overview

The Confidential Payment Processor extends Moonight's privacy-first lending circles with automated payment collection capabilities across multiple blockchain networks. It maintains contributor anonymity while ensuring reliable payment collection through advanced cryptographic techniques and cross-chain routing.

## Key Features

### 🔐 Privacy-First Design
- **Anonymous Payment Routing**: Routes payments through multiple chains to break transaction linkability
- **Confidential Balance Verification**: Uses ZK proofs to verify balances without revealing amounts
- **Encrypted Transaction Records**: Stores payment history with selective disclosure capabilities
- **Unlinkable Payment History**: Contributors can access their payment data without compromising anonymity

### 🌐 Multi-Chain Support
- **Supported Networks**: Ethereum, Polygon, Arbitrum, Midnight
- **Cross-Chain Settlement**: Automatic settlement across networks with privacy preservation
- **Optimized Routing**: Selects optimal payment paths based on privacy scores and availability
- **Chain-Specific Privacy**: Leverages each network's unique privacy characteristics

### 🔄 Automated Collection
- **Scheduled Payments**: Automatic payment collection for lending circle rounds
- **Failure Handling**: Exponential backoff retry with configurable limits
- **Partial Payments**: Support for partial payments with grace periods
- **Batch Processing**: Efficient handling of multiple payments simultaneously

### 📊 Analytics & Monitoring
- **Privacy-Preserving Analytics**: Generate reports without compromising individual privacy
- **Payment Completion Tracking**: Monitor circle health and payment reliability
- **Cross-Chain Distribution**: Analyze payment patterns across networks
- **Trust Score Integration**: Update member trust scores based on payment behavior

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MoonightPaymentProtocol                      │
│                   (Enhanced Protocol Layer)                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐         ┌────────▼──────────┐
│ PaymentProcessor│         │  PaymentCollector │
│                │         │                   │
│ • Multi-chain  │         │ • Scheduling      │
│ • ZK proofs    │         │ • Automation      │
│ • Privacy      │         │ • Analytics       │
│ • Retry logic  │         │ • Integration     │
└────────────────┘         └───────────────────┘
        │                           │
        └─────────────┬─────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   Core Infrastructure                           │
│                                                                 │
│  PrivacyBridge  │  TransactionMixer  │  CrossChainManager      │
│  ZKVerifier     │  PrivacyUtils      │  TrustCalculator        │
└─────────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Basic Payment Collection

```typescript
import { PaymentProcessor } from './payments/PaymentProcessor';
import { DEFAULT_PRIVACY_PARAMS } from './types';

// Initialize processor
const processor = new PaymentProcessor('my-processor', DEFAULT_PRIVACY_PARAMS);

// Set up wallet connections
const walletProofs = new Map([
  ['ethereum', ethereumWalletProof],
  ['polygon', polygonWalletProof],
  ['midnight', midnightWalletProof]
]);

await processor.initializeWalletConnections(contributorHash, walletProofs);

// Collect payment
const result = await processor.collectMonthlyPayment({
  contributorHash: 'contributor123',
  circleId: 'circle456',
  round: 1,
  requiredAmount: BigInt('1000000000000000000'), // 1 token
  recipientCommitment: 'recipient789',
  allowPartialPayment: true
});

if (result.success) {
  console.log(`Collected: ${result.totalCollected} wei`);
  console.log(`Anonymity Score: ${result.anonymityScore}/100`);
}
```

### Enhanced Protocol Integration

```typescript
import { MoonightPaymentProtocol } from './payments/MoonightPaymentProtocol';

// Create enhanced protocol with payment automation
const protocol = new MoonightPaymentProtocol('protocol-id', DEFAULT_PRIVACY_PARAMS);

// Create circle with auto-collection
const circleId = await protocol.createCircleWithAutoCollection(
  creatorHash,
  circleParams,
  membershipProof,
  true // Enable auto-collection
);

// Enhanced payment with multi-chain support
const result = await protocol.makePaymentWithProcessor(payerHash, {
  circleId,
  round: 1,
  paymentProof,
  recipientHash,
  walletProofs,
  allowPartialPayment: true
});
```

### Payment History Access

```typescript
// Get encrypted payment history
const history = await processor.getPaymentHistory(contributorHash);
console.log(`${history.records.length} encrypted records found`);

// Decrypt with authorization key
const decryptedHistory = await processor.getPaymentHistory(
  contributorHash,
  decryptionKey
);

if (decryptedHistory.decryptedSummary) {
  console.log(`Total payments: ${decryptedHistory.decryptedSummary.totalPayments}`);
  console.log(`Total amount: ${decryptedHistory.decryptedSummary.totalAmount}`);
}
```

## Configuration

### Privacy Parameters

```typescript
const privacyParams = {
  zkSnarkParams: 'groth16-bn254',
  commitmentScheme: 'pedersen-blake2s',
  nullifierDerivation: 'poseidon-hash',
  proofVerificationKey: 'verification-key'
};
```

### Payment Collection Options

```typescript
const collectionParams = {
  contributorHash: string,
  circleId: string,
  round: number,
  requiredAmount: bigint,
  recipientCommitment: string,
  allowPartialPayment?: boolean,    // Default: false
  maxRetries?: number,              // Default: 3
  priority?: 'low' | 'normal' | 'high' // Default: 'normal'
};
```

### Retry Policy Configuration

```typescript
const retryPolicy = {
  maxAttempts: 3,
  baseDelay: 30000,      // 30 seconds
  backoffMultiplier: 2,
  maxDelay: 300000       // 5 minutes
};
```

## Privacy Guarantees

### Zero-Knowledge Proofs
- **Wallet Ownership**: Prove control over wallets without revealing private keys
- **Balance Verification**: Confirm sufficient balance without revealing exact amounts
- **Payment Validation**: Validate payment completion without exposing transaction details

### Anonymity Preservation
- **Unlinkable Transactions**: Use nullifiers and commitments to prevent transaction linking
- **Cross-Chain Mixing**: Route payments through multiple networks to enhance privacy
- **Encrypted Records**: Store payment history with encryption and selective disclosure

### Privacy Scores
- **Chain Privacy Ratings**:
  - Midnight: 95/100 (Native privacy)
  - Arbitrum: 75/100 (L2 privacy benefits)
  - Polygon: 70/100 (Lower fees, moderate privacy)
  - Ethereum: 60/100 (High security, limited privacy)

## Testing

### Run All Tests
```bash
npm test
```

### Run Payment Processor Tests Only
```bash
npm test -- --testPathPattern=payment-processor.test.ts
```

### Run Core Demo
```bash
npm run build
node dist/demo-core-payment-processor.js
```

## API Reference

### PaymentProcessor

#### `initializeWalletConnections(contributorHash, walletProofs)`
Set up verified wallet connections across multiple chains.

#### `collectMonthlyPayment(params)`
Execute automated payment collection with privacy preservation.

#### `getPaymentHistory(contributorHash, decryptionKey?)`
Retrieve encrypted payment history with optional decryption.

#### `processRetryQueue()`
Process failed payments scheduled for retry.

### PaymentCollector

#### `schedulePaymentCollection(circleId, round, dueDate)`
Schedule automatic payment collection for a lending circle round.

#### `executePaymentCollection(scheduleId)`
Execute scheduled payment collection and return status.

#### `generateCollectionReport(circleId)`
Generate comprehensive payment analytics for a circle.

### MoonightPaymentProtocol

#### `makePaymentWithProcessor(payerHash, params)`
Enhanced payment method with multi-chain collection support.

#### `enableAutoCollection(circleId, schedule)`
Enable automatic payment collection for a circle.

#### `getPaymentAnalytics(circleId)`
Get detailed payment analytics and cross-chain distribution.

## Security Considerations

### Cryptographic Security
- Uses Groth16 zk-SNARKs for zero-knowledge proofs
- Employs Pedersen commitments with Blake2s hashing
- Implements Poseidon hash for nullifier derivation

### Network Security
- Validates all cross-chain proofs before processing
- Uses secure random number generation for commitments
- Implements proper key derivation for encryption

### Privacy Protection
- Never stores unencrypted payment amounts
- Uses unlinkable nullifiers to prevent double-spending
- Implements proper mixing to break transaction graphs

## Performance Optimization

### Batch Processing
- Process multiple payments simultaneously
- Optimize cross-chain routing for efficiency
- Cache verification keys and commitments

### Gas Optimization
- Select chains with optimal gas prices
- Batch transactions where possible
- Use L2 solutions for cost reduction

### Scalability
- Horizontal scaling through multiple processor instances
- Efficient state management with Maps and Sets
- Asynchronous processing with proper error handling

## Monitoring and Observability

### Metrics
- Payment success rates per chain
- Average processing times
- Retry attempt frequencies
- Anonymity score distributions

### Logging
- Structured logging for payment events
- Privacy-preserving error reporting
- Audit trails for compliance

### Alerting
- Failed payment notifications
- Low balance warnings
- Network connectivity issues

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`
5. Run demos: `node dist/demo-core-payment-processor.js`

### Code Style
- Follow TypeScript strict mode guidelines
- Use proper error handling with try-catch blocks
- Implement comprehensive logging
- Write tests for all new features

### Privacy Guidelines
- Never log sensitive data in plaintext
- Use proper encryption for all stored data
- Validate all cryptographic proofs
- Follow zero-knowledge proof best practices

## License

MIT License - see LICENSE file for details.

## Support

For support, please create an issue in the GitHub repository or contact the Moonight team.