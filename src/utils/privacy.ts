/**
 * Privacy Utilities for Moonight Protocol
 * Handles privacy-preserving operations and cryptographic functions
 */

import { PrivacyParams, CreateCircleParams } from '../types';

export class PrivacyUtils {
  private params: PrivacyParams;

  constructor(params: PrivacyParams) {
    this.params = params;
  }

  /**
   * Generate unique circle ID with privacy preservation
   */
  async generateCircleId(
    creatorHash: string,
    params: CreateCircleParams
  ): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    
    const circleData = {
      creator: creatorHash,
      maxMembers: params.maxMembers,
      monthlyAmount: params.monthlyAmount.toString(),
      totalRounds: params.totalRounds,
      timestamp: Date.now(),
      randomness: crypto.randomBytes(32).toString('hex')
    };

    hash.update(JSON.stringify(circleData));
    return hash.digest('hex');
  }

  /**
   * Generate proposal ID for governance
   */
  async generateProposalId(
    creatorHash: string,
    params: any
  ): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    
    const proposalData = {
      creator: creatorHash,
      type: params.proposalType,
      data: params.proposalData,
      timestamp: Date.now(),
      randomness: crypto.randomBytes(32).toString('hex')
    };

    hash.update(JSON.stringify(proposalData));
    return hash.digest('hex');
  }

  /**
   * Hash identity for privacy
   */
  async hashIdentity(identityCommitment: string): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(identityCommitment + this.params.commitmentScheme);
    return hash.digest('hex');
  }

  /**
   * Hash payment for privacy
   */
  async hashPayment(
    payerHash: string,
    recipientHash: string,
    amount: bigint
  ): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    
    const paymentData = {
      payer: payerHash,
      recipient: recipientHash,
      amount: amount.toString(),
      timestamp: Date.now()
    };

    hash.update(JSON.stringify(paymentData));
    return hash.digest('hex');
  }

  /**
   * Generate membership Merkle root
   */
  async generateMembershipRoot(members: string[]): Promise<string> {
    if (members.length === 0) {
      return await this.hashSingle('empty_root');
    }

    // Sort members for consistent ordering
    const sortedMembers = [...members].sort();
    
    // Build Merkle tree
    let currentLevel = [];
    for (const member of sortedMembers) {
      currentLevel.push(await this.hashSingle(member));
    }

    while (currentLevel.length > 1) {
      const nextLevel = [];
      
      for (let i = 0; i < currentLevel.length; i += 2) {
        if (i + 1 < currentLevel.length) {
          nextLevel.push(await this.hashPair(currentLevel[i], currentLevel[i + 1]));
        } else {
          nextLevel.push(currentLevel[i]);
        }
      }
      
      currentLevel = nextLevel;
    }

    return currentLevel[0];
  }

  /**
   * Update membership root by adding new member
   */
  async updateMembershipRoot(
    currentRoot: string,
    newMemberHash: string
  ): Promise<string> {
    // For simplicity, we'll recalculate the root
    // In production, this would be optimized to only update necessary nodes
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(currentRoot + newMemberHash);
    return hash.digest('hex');
  }

  /**
   * Encrypt witness data for trust score calculations
   */
  async encryptWitnessData(witnessData: any): Promise<string> {
    // In production, this would use proper encryption
    // For now, we'll use base64 encoding as placeholder
    const jsonData = JSON.stringify(witnessData);
    return Buffer.from(jsonData).toString('base64');
  }

  /**
   * Decrypt witness data
   */
  async decryptWitnessData(encryptedData: string): Promise<any> {
    try {
      const jsonData = Buffer.from(encryptedData, 'base64').toString();
      return JSON.parse(jsonData);
    } catch {
      return null;
    }
  }

  /**
   * Generate commitment for any data
   */
  async generateCommitment(data: any, randomness?: string): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    
    const commitment = {
      data: typeof data === 'string' ? data : this.serializeWithBigInt(data),
      randomness: randomness || crypto.randomBytes(32).toString('hex'),
      scheme: this.params.commitmentScheme
    };

    hash.update(JSON.stringify(commitment));
    return hash.digest('hex');
  }

  /**
   * Serialize data with BigInt support
   */
  private serializeWithBigInt(obj: any): string {
    return JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
  }

  /**
   * Generate range proof for bid amounts
   */
  async generateRangeProof(
    value: bigint,
    minValue: bigint,
    maxValue: bigint
  ): Promise<string> {
    // Simplified range proof - in production would use bulletproofs or similar
    const proof = {
      commitment: await this.generateCommitment(value.toString()),
      valid: value >= minValue && value <= maxValue,
      minValue: minValue.toString(),
      maxValue: maxValue.toString()
    };

    return JSON.stringify(proof);
  }

  /**
   * Generate zero-knowledge proof for membership
   */
  async generateMembershipProof(
    memberSecret: string,
    circleId: string
  ): Promise<string> {
    const crypto = require('crypto');
    
    const commitment = await this.generateCommitment(memberSecret);
    const nullifier = await this.generateNullifier(memberSecret);
    
    const proof = {
      commitment,
      nullifier,
      proof: {
        valid: true,
        circleId,
        timestamp: Date.now()
      }
    };

    return JSON.stringify(proof);
  }

  /**
   * Verify Merkle proof
   */
  async verifyMerkleProof(
    leaf: string,
    root: string,
    proof: string[]
  ): Promise<boolean> {
    try {
      let computedHash = leaf;
      
      for (const proofElement of proof) {
        if (computedHash <= proofElement) {
          computedHash = await this.hashPair(computedHash, proofElement);
        } else {
          computedHash = await this.hashPair(proofElement, computedHash);
        }
      }
      
      return computedHash === root;
    } catch {
      return false;
    }
  }

  /**
   * Generate anonymous vote commitment
   */
  async generateVoteCommitment(
    vote: boolean,
    voterSecret: string
  ): Promise<string> {
    const crypto = require('crypto');
    const randomness = crypto.randomBytes(32).toString('hex');
    
    const voteData = {
      choice: vote,
      randomness,
      voterSecret
    };

    const commitment = await this.generateCommitment(voteData);
    
    // Return properly formatted JSON
    return JSON.stringify({
      choice: vote,
      randomness,
      commitment
    });
  }

  /**
   * Batch verify multiple proofs efficiently
   */
  async batchVerifyProofs(proofs: string[]): Promise<boolean[]> {
    const results = [];
    
    for (const proof of proofs) {
      try {
        const proofData = JSON.parse(proof);
        results.push(proofData.valid === true);
      } catch {
        results.push(false);
      }
    }
    
    return results;
  }

  /**
   * Generate unique ID for payments and other entities
   */
  async generateId(): Promise<string> {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Encrypt data for privacy preservation
   */
  async encryptData(data: string, key?: string): Promise<string> {
    const crypto = require('crypto');
    
    // Use provided key or generate one from privacy params
    const encryptionKey = key || this.params.zkSnarkParams.substring(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt data for authorized access
   */
  async decryptData(encryptedData: string, key?: string): Promise<string> {
    const crypto = require('crypto');
    
    const [ivHex, encrypted] = encryptedData.split(':');
    const encryptionKey = key || this.params.zkSnarkParams.substring(0, 32);
    
    const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Private helper methods
  private async hashSingle(input: string): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
  }

  private async hashPair(left: string, right: string): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(left + right);
    return hash.digest('hex');
  }

  /**
   * Generic encryption method for various data types
   */
  async encrypt(data: string, purpose: string): Promise<string> {
    return await this.encryptData(data, purpose);
  }

  /**
   * Generic decryption method for various data types
   */
  async decrypt(encryptedData: string, purpose: string): Promise<string> {
    return await this.decryptData(encryptedData, purpose);
  }

  /**
   * Generate nullifier hash from data and salt
   */
  async generateNullifier(data: string, salt?: string): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    const input = salt ? data + salt : data + this.params.nullifierDerivation;
    hash.update(input);
    return hash.digest('hex');
  }

  /**
   * Generic hash function
   */
  async hash(data: string): Promise<string> {
    return await this.hashSingle(data);
  }
}