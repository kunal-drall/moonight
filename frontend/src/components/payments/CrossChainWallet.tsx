'use client';

import React, { useState, useEffect } from 'react';
import { 
  WalletIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ArrowsRightLeftIcon,
  PlusIcon,
  LinkIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface ChainBalance {
  chain: string;
  balance: number;
  usdValue: number;
  token: string;
  connected: boolean;
  logo: string;
}

interface PrivateTransaction {
  id: string;
  type: 'payment' | 'deposit' | 'withdrawal';
  amount: number;
  chain: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  isPrivate: boolean;
}

export default function CrossChainWallet() {
  const [balances, setBalances] = useState<ChainBalance[]>([]);
  const [transactions, setTransactions] = useState<PrivateTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrivateBalances, setShowPrivateBalances] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading wallet data
    setTimeout(() => {
      setBalances([
        { 
          chain: 'Ethereum', 
          balance: 2.45, 
          usdValue: 4900, 
          token: 'ETH', 
          connected: true,
          logo: '🔹'
        },
        { 
          chain: 'Polygon', 
          balance: 156.78, 
          usdValue: 312, 
          token: 'MATIC', 
          connected: true,
          logo: '🟣'
        },
        { 
          chain: 'Midnight', 
          balance: 1250.0, 
          usdValue: 875, 
          token: 'DUST', 
          connected: true,
          logo: '🌙'
        },
        { 
          chain: 'Cardano', 
          balance: 0, 
          usdValue: 0, 
          token: 'ADA', 
          connected: false,
          logo: '🔵'
        }
      ]);

      setTransactions([
        {
          id: '1',
          type: 'payment',
          amount: 1.5,
          chain: 'Ethereum',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'completed',
          isPrivate: true
        },
        {
          id: '2',
          type: 'deposit',
          amount: 25.0,
          chain: 'Polygon',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          status: 'completed',
          isPrivate: true
        },
        {
          id: '3',
          type: 'payment',
          amount: 0.8,
          chain: 'Midnight',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'pending',
          isPrivate: true
        }
      ]);
      
      setLoading(false);
    }, 1500);
  }, []);

  const totalUsdValue = balances.reduce((sum, balance) => sum + balance.usdValue, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-trust-green';
      case 'pending': return 'text-amber-400';
      case 'failed': return 'text-danger';
      default: return 'text-midnight-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return '↗️';
      case 'deposit': return '↙️';
      case 'withdrawal': return '↗️';
      default: return '💫';
    }
  };

  return (
    <div className="space-y-6 privacy-fade-in">
      {/* Header */}
      <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Cross-Chain Wallet</h1>
            <p className="text-midnight-300">
              Privacy-preserving multi-chain asset management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPrivateBalances(!showPrivateBalances)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showPrivateBalances 
                  ? 'bg-trust-green/20 text-trust-green' 
                  : 'bg-midnight-700/50 text-midnight-400 hover:text-midnight-300'
              }`}
            >
              <EyeSlashIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {showPrivateBalances ? 'Hide' : 'Show'} Balances
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Total Portfolio */}
      <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50">
        <div className="text-center">
          <p className="text-sm text-midnight-400 mb-2">Total Portfolio Value</p>
          <div className="text-4xl font-bold text-white mb-1">
            {loading ? (
              <span className="animate-pulse">Loading...</span>
            ) : showPrivateBalances ? (
              `$${totalUsdValue.toLocaleString()}`
            ) : (
              '••••••'
            )}
          </div>
          <div className="flex items-center justify-center space-x-2">
            <ShieldCheckIcon className="h-4 w-4 text-zk-purple" />
            <span className="text-sm text-zk-purple">Privacy Protected</span>
          </div>
        </div>
      </div>

      {/* Chain Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50 animate-pulse">
              <div className="h-4 bg-midnight-700 rounded mb-4"></div>
              <div className="h-8 bg-midnight-700 rounded mb-2"></div>
              <div className="h-3 bg-midnight-700 rounded w-2/3"></div>
            </div>
          ))
        ) : (
          balances.map((balance, index) => (
            <ChainBalanceCard 
              key={index} 
              balance={balance} 
              showBalance={showPrivateBalances}
              onSelect={() => setSelectedChain(balance.chain)}
            />
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-zk-purple hover:bg-zk-purple-dark text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Add Funds</span>
        </button>
        <button className="bg-midnight-800 hover:bg-midnight-700 text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 border border-midnight-600">
          <ArrowsRightLeftIcon className="h-5 w-5" />
          <span>Cross-Chain Bridge</span>
        </button>
        <button className="bg-midnight-800 hover:bg-midnight-700 text-white py-4 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 border border-midnight-600">
          <LinkIcon className="h-5 w-5" />
          <span>Connect Wallet</span>
        </button>
      </div>

      {/* Private Transaction History */}
      <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Private Transaction History</h2>
          <div className="flex items-center space-x-2 bg-midnight-800/50 px-3 py-2 rounded-lg">
            <EyeSlashIcon className="h-4 w-4 text-zk-purple" />
            <span className="text-sm text-zk-purple">Anonymized</span>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-midnight-800/30 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-midnight-700 rounded mb-2"></div>
                <div className="h-3 bg-midnight-700 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="bg-midnight-800/30 rounded-lg p-4 border border-midnight-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getTypeIcon(transaction.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-white capitalize">
                        {transaction.type} - {transaction.chain}
                      </p>
                      <p className="text-xs text-midnight-400">
                        {transaction.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {showPrivateBalances ? `${transaction.amount} ${balances.find(b => b.chain === transaction.chain)?.token || ''}` : '••••'}
                    </p>
                    <p className={`text-xs capitalize ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <ShieldCheckIcon className="h-3 w-3 text-trust-green" />
                  <span className="text-xs text-trust-green">ZK Privacy Preserved</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-midnight-800/40 border border-midnight-600/30 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="h-5 w-5 text-zk-purple" />
          <div>
            <p className="text-sm text-midnight-200">
              <span className="font-medium text-zk-purple">Multi-Chain Privacy:</span> 
              {' '}Your wallet activities are protected across all supported blockchains 
              using zero-knowledge proofs and private state channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChainBalanceCardProps {
  balance: ChainBalance;
  showBalance: boolean;
  onSelect: () => void;
}

function ChainBalanceCard({ balance, showBalance, onSelect }: ChainBalanceCardProps) {
  return (
    <div 
      className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50 hover:border-midnight-600 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{balance.logo}</span>
          <div>
            <h3 className="font-semibold text-white">{balance.chain}</h3>
            <p className="text-xs text-midnight-400">{balance.token}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          balance.connected 
            ? 'bg-trust-green/20 text-trust-green' 
            : 'bg-midnight-600/50 text-midnight-400'
        }`}>
          {balance.connected ? 'Connected' : 'Connect'}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold text-white">
          {showBalance ? `${balance.balance.toFixed(2)} ${balance.token}` : '••••••'}
        </p>
        <p className="text-sm text-midnight-400">
          {showBalance ? `$${balance.usdValue.toLocaleString()}` : '••••'}
        </p>
      </div>

      {balance.connected && (
        <div className="flex items-center space-x-2 mt-4">
          <EyeSlashIcon className="h-3 w-3 text-zk-purple" />
          <span className="text-xs text-zk-purple">Privacy Enabled</span>
        </div>
      )}
    </div>
  );
}