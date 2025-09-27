/**
 * Moonight Protocol - Main Entry Point
 * Export all contract components and utilities
 */

export { MoonightProtocol } from './contracts/MoonightProtocol';
export { ZKProofVerifier } from './utils/zk-verifier';
export { PrivacyUtils } from './utils/privacy';
export { TrustScoreCalculator } from './utils/trust-score';
export { CrossChainManager } from './utils/cross-chain';
export { BiddingCircuit } from './circuits/BiddingCircuit';
export { BidAuctionManager } from './auctions/BidAuctionManager';

// Cross-Chain Privacy Bridge exports
export { PrivacyBridge } from './bridge/PrivacyBridge';
export { AnonymityPoolManager } from './bridge/AnonymityPoolManager';
export { TransactionMixer } from './bridge/TransactionMixer';
export { CrossChainRouter } from './bridge/CrossChainRouter';

export * from './types';

// Default privacy parameters for Midnight blockchain
export const DEFAULT_PRIVACY_PARAMS = {
  zkSnarkParams: 'groth16-bn254',
  commitmentScheme: 'pedersen-blake2s',
  nullifierDerivation: 'poseidon-hash',
  proofVerificationKey: JSON.stringify({
    protocol: 'groth16',
    curve: 'bn128',
    nPublic: 4,
    vk_alpha_1: ['0x1', '0x2'],
    vk_beta_2: [['0x3', '0x4'], ['0x5', '0x6']],
    vk_gamma_2: [['0x7', '0x8'], ['0x9', '0xa']],
    vk_delta_2: [['0xb', '0xc'], ['0xd', '0xe']],
    vk_alphabeta_12: [
      [['0xf', '0x10'], ['0x11', '0x12']],
      [['0x13', '0x14'], ['0x15', '0x16']]
    ],
    IC: [['0x17', '0x18'], ['0x19', '0x1a'], ['0x1b', '0x1c'], ['0x1d', '0x1e']]
  })
};

/**
 * Factory function to create a new Moonight Protocol instance
 */
import { MoonightProtocol } from './contracts/MoonightProtocol';

export function createMoonightProtocol(privacyParams = DEFAULT_PRIVACY_PARAMS) {
  return new MoonightProtocol(privacyParams);
}

/**
 * Utility function to generate member identity commitment
 */
export async function generateMemberIdentity(secretKey: string) {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  hash.update(secretKey);
  
  const identityCommitment = hash.digest('hex');
  
  return {
    identityCommitment,
    secretKey
  };
}

/**
 * Utility function to create a basic membership proof
 */
export async function createMembershipProof(
  secretKey: string,
  circleId?: string
) {
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
      circleId: circleId || '',
      timestamp: Date.now()
    }
  };

  return JSON.stringify(proof);
}

/**
 * Contract deployment configuration
 */
export const DEPLOYMENT_CONFIG = {
  network: 'midnight-testnet',
  gasLimit: 5000000,
  gasPrice: '20000000000', // 20 gwei
  confirmations: 3,
  timeout: 300000 // 5 minutes
};

/**
 * Default circle parameters for testing
 */
export const DEFAULT_CIRCLE_PARAMS = {
  maxMembers: 10,
  monthlyAmount: BigInt('1000000000000000000'), // 1 token (18 decimals)
  totalRounds: 12,
  minimumTrustScore: 500,
  stakeRequirement: BigInt('100000000000000000') // 0.1 token
};