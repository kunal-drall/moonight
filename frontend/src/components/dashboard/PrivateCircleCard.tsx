'use client';

import React from 'react';
import { 
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ShieldCheckIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface PrivateCircleCardProps {
  name: string;
  members: number;
  maxMembers: number;
  monthlyAmount: string;
  nextPayment: string;
  trustLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  loading?: boolean;
}

export default function PrivateCircleCard({
  name,
  members,
  maxMembers,
  monthlyAmount,
  nextPayment,
  trustLevel,
  loading = false
}: PrivateCircleCardProps) {
  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'Very High':
        return 'text-trust-green bg-trust-green/20';
      case 'High':
        return 'text-blue-400 bg-blue-400/20';
      case 'Medium':
        return 'text-amber-400 bg-amber-400/20';
      default:
        return 'text-midnight-400 bg-midnight-400/20';
    }
  };

  const membershipPercentage = (members / maxMembers) * 100;

  return (
    <div className="bg-midnight-800/50 backdrop-blur-sm rounded-lg p-6 border border-midnight-600/50 hover:border-zk-purple/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`font-semibold text-white ${loading ? 'animate-pulse' : ''}`}>
            {loading ? 'Loading Circle...' : name}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <EyeSlashIcon className="h-3 w-3 text-zk-purple" />
            <span className="text-xs text-zk-purple">Anonymous Members</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${getTrustLevelColor(trustLevel)}`}>
          {loading ? '...' : trustLevel} Trust
        </div>
      </div>

      <div className="space-y-4">
        {/* Members */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="h-4 w-4 text-midnight-400" />
            <span className="text-sm text-midnight-300">Members</span>
          </div>
          <div className="text-sm text-white">
            {loading ? '...' : `${members}/${maxMembers}`}
          </div>
        </div>

        {/* Membership Progress */}
        <div className="space-y-1">
          <div className="w-full bg-midnight-700 rounded-full h-1.5">
            <div 
              className="bg-zk-purple h-1.5 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${loading ? 0 : membershipPercentage}%` }}
            />
          </div>
          <div className="text-xs text-midnight-400">
            {loading ? '...' : `${membershipPercentage.toFixed(0)}% full`}
          </div>
        </div>

        {/* Monthly Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="h-4 w-4 text-midnight-400" />
            <span className="text-sm text-midnight-300">Monthly Amount</span>
          </div>
          <div className="text-sm font-medium text-white">
            {loading ? '...' : monthlyAmount}
          </div>
        </div>

        {/* Next Payment */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-midnight-400" />
            <span className="text-sm text-midnight-300">Next Payment</span>
          </div>
          <div className="text-sm text-white">
            {loading ? '...' : nextPayment}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-6">
          <button className="flex-1 bg-zk-purple hover:bg-zk-purple-dark text-white py-2 px-3 rounded text-sm font-medium transition-colors">
            View Details
          </button>
          <button className="flex-1 bg-midnight-700 hover:bg-midnight-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors border border-midnight-600">
            Messages
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="bg-midnight-900/50 border border-midnight-700/30 rounded p-2 mt-4">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-3 w-3 text-trust-green" />
            <span className="text-xs text-midnight-300">
              All payments secured with ZK proofs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}