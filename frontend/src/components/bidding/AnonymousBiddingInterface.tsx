'use client';

import React, { useState, useEffect } from 'react';
import { 
  EyeSlashIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import ZKProofGenerator from '../zkproof/ZKProofGenerator';

interface BiddingRound {
  id: string;
  circleName: string;
  currentRound: number;
  totalRounds: number;
  minBid: number;
  maxBid: number;
  endTime: Date;
  participantCount: number;
  status: 'active' | 'ended' | 'pending';
}

export default function AnonymousBiddingInterface() {
  const [activeRounds, setActiveRounds] = useState<BiddingRound[]>([]);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showZKProof, setShowZKProof] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading bidding data
    setTimeout(() => {
      setActiveRounds([
        {
          id: '1',
          circleName: 'DeFi Builders Circle',
          currentRound: 3,
          totalRounds: 12,
          minBid: 0.1,
          maxBid: 2.0,
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          participantCount: 5,
          status: 'active'
        },
        {
          id: '2',
          circleName: 'Privacy Advocates',
          currentRound: 7,
          totalRounds: 15,
          minBid: 0.2,
          maxBid: 3.0,
          endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
          participantCount: 12,
          status: 'active'
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const handleSubmitBid = async () => {
    if (!selectedRound || !bidAmount) return;
    
    setIsSubmitting(true);
    setShowZKProof(true);
    
    // Simulate bid submission with ZK proof generation
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    setIsSubmitting(false);
    setShowZKProof(false);
    setBidAmount('');
    setSelectedRound(null);
  };

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6 privacy-fade-in">
      {/* Header */}
      <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Anonymous Bidding</h1>
            <p className="text-midnight-300">
              Submit confidential bids using zero-knowledge proofs
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-zk-purple/20 text-zk-purple px-3 py-2 rounded-lg">
            <EyeSlashIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Identity Protected</span>
          </div>
        </div>
      </div>

      {/* Active Rounds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          // Loading states
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50 animate-pulse">
              <div className="h-4 bg-midnight-700 rounded mb-4"></div>
              <div className="h-3 bg-midnight-700 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-midnight-700 rounded w-1/2"></div>
            </div>
          ))
        ) : (
          activeRounds.map((round) => (
            <BiddingRoundCard
              key={round.id}
              round={round}
              isSelected={selectedRound === round.id}
              onSelect={() => setSelectedRound(round.id)}
              formatTimeRemaining={formatTimeRemaining}
            />
          ))
        )}
      </div>

      {/* Bid Submission */}
      {selectedRound && (
        <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50">
          <div className="flex items-center space-x-2 mb-4">
            <LockClosedIcon className="h-5 w-5 text-zk-purple" />
            <h2 className="text-lg font-semibold text-white">Submit Anonymous Bid</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-midnight-300 mb-2">
                  Bid Amount (ETH)
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter bid amount"
                  step="0.01"
                  min="0.01"
                  className="w-full bg-midnight-800 border border-midnight-600 rounded-lg px-4 py-3 text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-zk-purple focus:border-transparent"
                />
                <p className="text-xs text-midnight-400 mt-1">
                  Range: 0.1 - 2.0 ETH
                </p>
              </div>

              <button
                onClick={handleSubmitBid}
                disabled={!bidAmount || isSubmitting}
                className="w-full bg-zk-purple hover:bg-zk-purple-dark disabled:bg-midnight-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <ShieldCheckIcon className="h-4 w-4" />
                <span>{isSubmitting ? 'Generating ZK Proof...' : 'Submit Anonymous Bid'}</span>
              </button>
            </div>

            <div className="bg-midnight-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-3">Privacy Features</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <EyeSlashIcon className="h-4 w-4 text-trust-green" />
                  <span className="text-sm text-midnight-300">Bid amount hidden</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-4 w-4 text-trust-green" />
                  <span className="text-sm text-midnight-300">Identity protected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <LockClosedIcon className="h-4 w-4 text-trust-green" />
                  <span className="text-sm text-midnight-300">ZK proof verified</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-midnight-900/50 rounded">
                <p className="text-xs text-midnight-400">
                  Your bid is encrypted and only revealed during winner selection. 
                  Zero-knowledge proofs ensure fairness without compromising privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ZK Proof Generation Modal */}
      {showZKProof && (
        <ZKProofGenerator
          type="bidding"
          isVisible={showZKProof}
          onComplete={() => setShowZKProof(false)}
        />
      )}

      {/* Privacy Notice */}
      <div className="bg-midnight-800/40 border border-midnight-600/30 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="h-5 w-5 text-zk-purple" />
          <div>
            <p className="text-sm text-midnight-200">
              <span className="font-medium text-zk-purple">Anonymous Bidding:</span> 
              {' '}All bids are submitted using zero-knowledge proofs. Your identity and bid amounts 
              remain confidential until winner selection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BiddingRoundCardProps {
  round: BiddingRound;
  isSelected: boolean;
  onSelect: () => void;
  formatTimeRemaining: (endTime: Date) => string;
}

function BiddingRoundCard({ round, isSelected, onSelect, formatTimeRemaining }: BiddingRoundCardProps) {
  return (
    <div 
      className={`bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border transition-all cursor-pointer ${
        isSelected 
          ? 'border-zk-purple shadow-privacy' 
          : 'border-midnight-700/50 hover:border-midnight-600'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">{round.circleName}</h3>
          <p className="text-sm text-midnight-400">
            Round {round.currentRound} of {round.totalRounds}
          </p>
        </div>
        <div className="bg-trust-green/20 text-trust-green px-2 py-1 rounded text-xs font-medium">
          Active
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-midnight-300">Participants</span>
          <div className="flex items-center space-x-1">
            <UserGroupIcon className="h-4 w-4 text-midnight-400" />
            <span className="text-white">{round.participantCount}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-midnight-300">Bid Range</span>
          <span className="text-white">
            {round.minBid} - {round.maxBid} ETH
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-midnight-300">Time Remaining</span>
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4 text-amber-400" />
            <span className="text-amber-400">{formatTimeRemaining(round.endTime)}</span>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 p-2 bg-zk-purple/10 border border-zk-purple/30 rounded">
          <p className="text-xs text-zk-purple">Selected for bidding</p>
        </div>
      )}
    </div>
  );
}