'use client';

import React from 'react';
import { 
  ChartBarIcon,
  ShieldCheckIcon,
  EyeSlashIcon 
} from '@heroicons/react/24/outline';

interface TrustScoreDisplayProps {
  score: number;
  loading?: boolean;
  onGenerateProof?: () => void;
}

export default function TrustScoreDisplay({ 
  score, 
  loading = false, 
  onGenerateProof 
}: TrustScoreDisplayProps) {
  const getTrustTier = (score: number) => {
    if (score >= 900) return { name: 'Master', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    if (score >= 800) return { name: 'Expert', color: 'text-purple-400', bg: 'bg-purple-400/20' };
    if (score >= 700) return { name: 'Advanced', color: 'text-blue-400', bg: 'bg-blue-400/20' };
    if (score >= 600) return { name: 'Intermediate', color: 'text-trust-green', bg: 'bg-trust-green/20' };
    if (score >= 400) return { name: 'Builder', color: 'text-amber-400', bg: 'bg-amber-400/20' };
    return { name: 'Newcomer', color: 'text-midnight-400', bg: 'bg-midnight-400/20' };
  };

  const tier = getTrustTier(score);
  const scorePercentage = Math.min((score / 1000) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-6 w-6 text-zk-purple" />
          <h3 className="text-lg font-semibold text-white">Confidential Trust Score</h3>
        </div>
        <div className="flex items-center space-x-2">
          <EyeSlashIcon className="h-4 w-4 text-midnight-400" />
          <span className="text-xs text-midnight-400">Zero-Knowledge Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Display */}
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className={`text-4xl font-bold ${loading ? 'animate-pulse' : ''}`}>
                {loading ? '...' : score}
              </div>
              <div className="text-sm text-midnight-400">out of 1000</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${tier.bg} ${tier.color}`}>
              {tier.name}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-midnight-400">Trust Level</span>
              <span className="text-midnight-300">{scorePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-midnight-800 rounded-full h-2">
              <div 
                className="bg-trust-gradient h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${loading ? 0 : scorePercentage}%` }}
              />
            </div>
          </div>

          {/* ZK Proof Button */}
          <button 
            onClick={onGenerateProof}
            className="w-full bg-midnight-800 hover:bg-midnight-700 border border-midnight-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Generate ZK Trust Proof</span>
          </button>
        </div>

        {/* Trust Factors */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-midnight-300 mb-3">
            Trust Factors (Privacy Protected)
          </h4>
          <div className="space-y-3">
            <TrustFactor
              name="Payment Reliability"
              value={loading ? 0 : 85}
              loading={loading}
            />
            <TrustFactor
              name="Circle Completion"
              value={loading ? 0 : 92}
              loading={loading}
            />
            <TrustFactor
              name="DeFi Experience"
              value={loading ? 0 : 78}
              loading={loading}
            />
            <TrustFactor
              name="Social Verification"
              value={loading ? 0 : 65}
              loading={loading}
            />
          </div>
          
          <div className="mt-4 p-3 bg-midnight-800/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <EyeSlashIcon className="h-4 w-4 text-zk-purple" />
              <span className="text-xs font-medium text-zk-purple">Privacy Notice</span>
            </div>
            <p className="text-xs text-midnight-400">
              Your trust score is calculated using zero-knowledge proofs. 
              Individual transaction details remain private while maintaining verifiable trust metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TrustFactorProps {
  name: string;
  value: number;
  loading?: boolean;
}

function TrustFactor({ name, value, loading }: TrustFactorProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-midnight-300">{name}</span>
      <div className="flex items-center space-x-2">
        <div className="w-20 bg-midnight-800 rounded-full h-2">
          <div 
            className="bg-zk-purple h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${loading ? 0 : value}%` }}
          />
        </div>
        <span className={`text-sm w-8 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? '...' : `${value}%`}
        </span>
      </div>
    </div>
  );
}