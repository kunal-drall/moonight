'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  EyeSlashIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import TrustScoreDisplay from './TrustScoreDisplay';
import PrivateCircleCard from './PrivateCircleCard';
import ZKProofStatus from '../zkproof/ZKProofStatus';

interface DashboardStats {
  totalCircles: number;
  activeBids: number;
  trustScore: number;
  privateMessages: number;
}

export default function PrivacyDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCircles: 0,
    activeBids: 0,
    trustScore: 0,
    privateMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [zkProofGenerating, setZkProofGenerating] = useState(false);

  // Simulate loading privacy data
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        totalCircles: 3,
        activeBids: 2,
        trustScore: 742,
        privateMessages: 8
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleGenerateProof = async () => {
    setZkProofGenerating(true);
    // Simulate ZK proof generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setZkProofGenerating(false);
  };

  return (
    <div className="space-y-6 privacy-fade-in">
      {/* Header */}
      <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Privacy Dashboard
            </h1>
            <p className="text-midnight-300">
              Your anonymous lending circle activities
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-trust-green/20 text-trust-green px-3 py-2 rounded-lg">
              <EyeSlashIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Anonymous</span>
            </div>
            <ZKProofStatus isGenerating={zkProofGenerating} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Private Circles"
          value={loading ? "..." : stats.totalCircles.toString()}
          icon={UserGroupIcon}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Active Bids"
          value={loading ? "..." : stats.activeBids.toString()}
          icon={CurrencyDollarIcon}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Trust Score"
          value={loading ? "..." : stats.trustScore.toString()}
          icon={ChartBarIcon}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Private Messages"
          value={loading ? "..." : stats.privateMessages.toString()}
          icon={LockClosedIcon}
          color="amber"
          loading={loading}
        />
      </div>

      {/* Trust Score Section */}
      <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50">
        <TrustScoreDisplay 
          score={stats.trustScore} 
          loading={loading}
          onGenerateProof={handleGenerateProof}
        />
      </div>

      {/* Private Circles */}
      <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Your Private Circles</h2>
          <button className="bg-zk-purple hover:bg-zk-purple-dark px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors">
            Create Circle
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PrivateCircleCard
            name="DeFi Builders Circle"
            members={5}
            maxMembers={8}
            monthlyAmount="1.5 ETH"
            nextPayment="Dec 15"
            trustLevel="High"
            loading={loading}
          />
          <PrivateCircleCard
            name="Privacy Advocates"
            members={12}
            maxMembers={15}
            monthlyAmount="2.0 ETH"
            nextPayment="Dec 20"
            trustLevel="Very High"
            loading={loading}
          />
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-midnight-800/40 border border-midnight-600/30 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="h-5 w-5 text-zk-purple" />
          <div>
            <p className="text-sm text-midnight-200">
              <span className="font-medium text-zk-purple">Privacy Protected:</span> 
              {' '}All your activities are secured with zero-knowledge proofs. 
              Your identity and transaction details remain anonymous.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'purple' | 'green' | 'blue' | 'amber';
  loading?: boolean;
}

function StatCard({ title, value, icon: Icon, color, loading }: StatCardProps) {
  const colorClasses = {
    purple: 'bg-zk-purple/20 text-zk-purple',
    green: 'bg-trust-green/20 text-trust-green',
    blue: 'bg-blue-500/20 text-blue-400',
    amber: 'bg-amber-500/20 text-amber-400',
  };

  return (
    <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-midnight-400">{title}</p>
          <p className={`text-2xl font-bold text-white ${loading ? 'animate-pulse' : ''}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}