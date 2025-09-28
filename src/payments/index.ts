/**
 * Confidential Payment Processor Module for Moonight Protocol
 * 
 * Exports all payment-related classes and utilities for automated
 * cross-chain payment collection with privacy preservation
 */

export { PaymentProcessor } from './PaymentProcessor';
export { PaymentCollector } from './PaymentCollector';
export { MoonightPaymentProtocol } from './MoonightPaymentProtocol';

// Re-export relevant types
export type {
  PaymentProcessorState,
  PaymentCollectionParams,
  PaymentCollectionResult,
  WalletConnection,
  PaymentAttempt,
  EncryptedPaymentRecord,
  PaymentFailureReason,
  PartialPayment,
  PaymentRetryPolicy,
  CrossChainSettlement,
  PaymentSchedule,
  CollectionStatus
} from '../types';