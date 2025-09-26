/**
 * Bid Auction Manager for Moonight Protocol
 * Orchestrates the anonymous bidding process with ZK proofs
 */

import { BiddingCircuit, BidData, BidProof, WinnerProof } from '../circuits/BiddingCircuit';
import { PrivacyParams, BidCommitment } from '../types';

export interface AuctionRound {
  readonly circleId: string;
  readonly round: number;
  readonly startTime: number;
  readonly endTime: number;
  readonly minBid: bigint;
  readonly maxBid: bigint;
  readonly status: 'OPEN' | 'CLOSED' | 'FINALIZED';
  readonly eligibleMembers: string[];
}

export interface AnonymousBid {
  readonly bidHash: string;
  readonly memberCommitment: string; // Anonymous member commitment
  readonly proof: BidProof;
  readonly timestamp: number;
  readonly nullifier: string; // Prevents double bidding
}

export interface AuctionResult {
  readonly winnerCommitment: string; // Anonymous winner
  readonly winningAmountEncrypted: string;
  readonly selectionProof: WinnerProof;
  readonly totalBids: number;
  readonly fairnessVerified: boolean;
}

export interface BiddingPhase {
  readonly phase: 'SUBMISSION' | 'REVEAL' | 'SELECTION' | 'COMPLETED';
  readonly deadline: number;
  readonly participantCount: number;
}

export class BidAuctionManager {
  private biddingCircuit: BiddingCircuit;
  private activeAuctions: Map<string, AuctionRound> = new Map();
  private auctionBids: Map<string, AnonymousBid[]> = new Map();
  private usedNullifiers: Set<string> = new Set();
  private auctionResults: Map<string, AuctionResult> = new Map();

  constructor(params: PrivacyParams) {
    this.biddingCircuit = new BiddingCircuit(params);
  }

  /**
   * Start a new bidding round for a lending circle
   */
  async startBiddingRound(
    circleId: string,
    round: number,
    eligibleMembers: string[],
    biddingPeriodHours: number = 24,
    minBid?: bigint,
    maxBid?: bigint
  ): Promise<string> {
    const auctionId = this.generateAuctionId(circleId, round);
    
    const now = Date.now();
    const auctionRound: AuctionRound = {
      circleId,
      round,
      startTime: now,
      endTime: now + (biddingPeriodHours * 60 * 60 * 1000),
      minBid: minBid || BigInt('1000000000000000'), // 0.001 token default
      maxBid: maxBid || BigInt('10000000000000000000'), // 10 tokens default
      status: 'OPEN',
      eligibleMembers
    };

    this.activeAuctions.set(auctionId, auctionRound);
    this.auctionBids.set(auctionId, []);

    return auctionId;
  }

  /**
   * Submit an anonymous bid with ZK proofs
   */
  async submitAnonymousBid(
    auctionId: string,
    bidData: BidData,
    membershipWitness: string
  ): Promise<boolean> {
    const auction = this.activeAuctions.get(auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    if (auction.status !== 'OPEN') {
      throw new Error('Auction is not open for bidding');
    }

    if (Date.now() > auction.endTime) {
      throw new Error('Bidding period has ended');
    }

    // Generate ZK proof for the bid
    const bidProof = await this.biddingCircuit.generateBidProof(
      bidData,
      auction.circleId,
      auction.minBid,
      auction.maxBid,
      membershipWitness
    );

    // Verify the proof
    const isValidProof = await this.biddingCircuit.verifyBidProof(
      bidProof,
      auction.circleId,
      auction.minBid,
      auction.maxBid
    );

    if (!isValidProof) {
      throw new Error('Invalid bid proof');
    }

    // Check for double bidding using nullifier
    if (this.usedNullifiers.has(bidProof.nullifier)) {
      throw new Error('Double bidding attempt detected');
    }

    // Create anonymous bid
    const anonymousBid: AnonymousBid = {
      bidHash: bidProof.commitment,
      memberCommitment: this.generateMemberCommitment(bidData.memberHash),
      proof: bidProof,
      timestamp: Date.now(),
      nullifier: bidProof.nullifier
    };

    // Store the bid
    const auctionBids = this.auctionBids.get(auctionId) || [];
    auctionBids.push(anonymousBid);
    this.auctionBids.set(auctionId, auctionBids);

    // Mark nullifier as used
    this.usedNullifiers.add(bidProof.nullifier);

    return true;
  }

  /**
   * Close bidding and determine winner with ZK proofs
   */
  async finalizeBidding(auctionId: string): Promise<AuctionResult> {
    const auction = this.activeAuctions.get(auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    if (auction.status === 'FINALIZED') {
      return this.auctionResults.get(auctionId)!;
    }

    const bids = this.auctionBids.get(auctionId) || [];
    if (bids.length === 0) {
      throw new Error('No bids submitted');
    }

    // Update auction status
    const updatedAuction = { ...auction, status: 'CLOSED' as const };
    this.activeAuctions.set(auctionId, updatedAuction);

    // Determine winner using ZK proofs (without revealing bid amounts)
    const winnerResult = await this.selectWinnerPrivately(auctionId, bids);

    // Create and verify the selection proof
    const result: AuctionResult = {
      winnerCommitment: winnerResult.winnerCommitment,
      winningAmountEncrypted: winnerResult.winningAmount,
      selectionProof: winnerResult.proof,
      totalBids: bids.length,
      fairnessVerified: await this.verifySelectionFairness(winnerResult.proof, bids, auction.circleId)
    };

    // Store result and mark auction as finalized
    this.auctionResults.set(auctionId, result);
    const finalizedAuction = { ...updatedAuction, status: 'FINALIZED' as const };
    this.activeAuctions.set(auctionId, finalizedAuction);

    return result;
  }

  /**
   * Get current bidding phase and statistics
   */
  getBiddingPhase(auctionId: string): BiddingPhase | null {
    const auction = this.activeAuctions.get(auctionId);
    if (!auction) return null;

    const now = Date.now();
    const bids = this.auctionBids.get(auctionId) || [];

    let phase: BiddingPhase['phase'];
    if (auction.status === 'OPEN' && now < auction.endTime) {
      phase = 'SUBMISSION';
    } else if (auction.status === 'CLOSED') {
      phase = 'SELECTION';
    } else if (auction.status === 'FINALIZED') {
      phase = 'COMPLETED';
    } else {
      phase = 'REVEAL';
    }

    return {
      phase,
      deadline: auction.endTime,
      participantCount: bids.length
    };
  }

  /**
   * Verify auction result integrity
   */
  async verifyAuctionIntegrity(auctionId: string): Promise<boolean> {
    const auction = this.activeAuctions.get(auctionId);
    const result = this.auctionResults.get(auctionId);
    const bids = this.auctionBids.get(auctionId);

    if (!auction || !result || !bids) {
      return false;
    }

    // Verify winner selection proof
    const selectionValid = await this.biddingCircuit.verifyWinnerSelectionProof(
      result.selectionProof,
      bids.map(bid => bid.bidHash),
      auction.circleId
    );

    // Verify all bid proofs
    const bidProofsValid = await Promise.all(
      bids.map(bid => 
        this.biddingCircuit.verifyBidProof(
          bid.proof,
          auction.circleId,
          auction.minBid,
          auction.maxBid
        )
      )
    );

    return selectionValid && bidProofsValid.every(valid => valid);
  }

  /**
   * Get auction statistics (publicly verifiable)
   */
  getAuctionStatistics(auctionId: string) {
    const auction = this.activeAuctions.get(auctionId);
    const bids = this.auctionBids.get(auctionId);
    const result = this.auctionResults.get(auctionId);

    if (!auction) return null;

    return {
      auctionId,
      circleId: auction.circleId,
      round: auction.round,
      status: auction.status,
      participantCount: bids?.length || 0,
      eligibleMembers: auction.eligibleMembers.length,
      startTime: auction.startTime,
      endTime: auction.endTime,
      fairnessVerified: result?.fairnessVerified || false,
      winnerSelected: !!result?.winnerCommitment
    };
  }

  // Private helper methods

  private generateAuctionId(circleId: string, round: number): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256')
      .update(circleId + round.toString() + Date.now().toString())
      .digest('hex');
  }

  private generateMemberCommitment(memberHash: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256')
      .update(memberHash + 'anonymous_member_commitment')
      .digest('hex');
  }

  private async selectWinnerPrivately(
    auctionId: string,
    bids: AnonymousBid[]
  ): Promise<{
    winnerCommitment: string;
    winningAmount: string;
    proof: WinnerProof;
  }> {
    // In a real implementation, this would use secure multi-party computation
    // or other privacy-preserving techniques to determine the winner
    // without revealing the actual bid amounts

    // For demonstration, we'll simulate the process
    const bidCommitments = bids.map(bid => bid.bidHash);
    
    // Simulate finding the winner (lowest bidder)
    // In reality, this would be done through ZK circuits
    const winnerIndex = 0; // Simplified - would be determined privately
    const winnerAmount = BigInt('5000000000000000'); // Simulated winning amount

    const auction = this.activeAuctions.get(auctionId)!;
    
    // Generate winner selection proof
    const proof = await this.biddingCircuit.generateWinnerSelectionProof(
      bidCommitments,
      winnerIndex,
      winnerAmount,
      auction.circleId
    );

    return {
      winnerCommitment: bids[winnerIndex].memberCommitment,
      winningAmount: proof.winningAmount,
      proof
    };
  }

  private async verifySelectionFairness(
    proof: WinnerProof,
    bids: AnonymousBid[],
    circleId: string
  ): Promise<boolean> {
    return await this.biddingCircuit.verifyWinnerSelectionProof(
      proof,
      bids.map(bid => bid.bidHash),
      circleId
    );
  }
}