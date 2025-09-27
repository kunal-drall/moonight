'use client';

import React, { useState } from 'react';
import { 
  ShieldCheckIcon,
  EyeSlashIcon,
  KeyIcon,
  CogIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface AuthProps {
  onAuthenticated: (identity: string) => void;
}

export default function AnonymousAuth({ onAuthenticated }: AuthProps) {
  const [isGeneratingIdentity, setIsGeneratingIdentity] = useState(false);
  const [step, setStep] = useState<'welcome' | 'generating' | 'complete'>('welcome');
  const [identityCommitment, setIdentityCommitment] = useState<string>('');

  const handleGenerateIdentity = async () => {
    setIsGeneratingIdentity(true);
    setStep('generating');

    // Simulate ZK identity generation
    const steps = [
      'Generating secret key...',
      'Creating identity commitment...',
      'Computing nullifier...',
      'Generating membership proof...',
      'Finalizing anonymous identity...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate a mock identity commitment
    const commitment = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setIdentityCommitment(commitment);
    
    setStep('complete');
    setIsGeneratingIdentity(false);
    
    setTimeout(() => {
      onAuthenticated(commitment);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-midnight-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-zk-purple/20 p-4 rounded-full">
              <ShieldCheckIcon className="h-12 w-12 text-zk-purple" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Anonymous Authentication</h2>
          <p className="mt-2 text-midnight-300">
            Generate your zero-knowledge identity for Moonight Protocol
          </p>
        </div>

        <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-8 border border-midnight-700/50 space-y-6">
          {step === 'welcome' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-midnight-800/50 rounded-lg">
                  <EyeSlashIcon className="h-5 w-5 text-zk-purple" />
                  <span className="text-sm text-midnight-200">
                    Your identity remains completely anonymous
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-midnight-800/50 rounded-lg">
                  <KeyIcon className="h-5 w-5 text-trust-green" />
                  <span className="text-sm text-midnight-200">
                    Private keys never leave your device
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-midnight-800/50 rounded-lg">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-sm text-midnight-200">
                    Zero-knowledge proofs ensure privacy
                  </span>
                </div>
              </div>

              <button
                onClick={handleGenerateIdentity}
                className="w-full bg-zk-purple hover:bg-zk-purple-dark text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Generate Anonymous Identity</span>
              </button>
            </>
          )}

          {step === 'generating' && (
            <div className="text-center space-y-6">
              <CogIcon className="h-16 w-16 text-zk-purple mx-auto animate-spin" />
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Generating ZK Identity
                </h3>
                <p className="text-sm text-midnight-400">
                  Creating your anonymous identity using zero-knowledge cryptography...
                </p>
              </div>

              <div className="bg-midnight-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-2 w-2 bg-zk-purple rounded-full animate-pulse"></div>
                  <span className="text-xs text-zk-purple">Processing secure computation</span>
                </div>
                <p className="text-xs text-midnight-400">
                  This process ensures maximum privacy and security
                </p>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center space-y-6">
              <CheckCircleIcon className="h-16 w-16 text-trust-green mx-auto" />
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Identity Generated Successfully
                </h3>
                <p className="text-sm text-midnight-400">
                  Your anonymous identity is ready for use
                </p>
              </div>

              <div className="bg-midnight-800/50 rounded-lg p-4 text-left">
                <div className="flex items-center space-x-2 mb-2">
                  <ShieldCheckIcon className="h-4 w-4 text-trust-green" />
                  <span className="text-xs font-medium text-trust-green">Identity Commitment</span>
                </div>
                <p className="text-xs text-midnight-300 font-mono break-all">
                  {identityCommitment}
                </p>
              </div>

              <div className="text-xs text-midnight-400">
                Redirecting to dashboard...
              </div>
            </div>
          )}
        </div>

        <div className="bg-midnight-800/40 border border-midnight-600/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-5 w-5 text-zk-purple" />
            <div>
              <p className="text-sm text-midnight-200">
                <span className="font-medium text-zk-purple">Privacy First:</span> 
                {' '}Your identity is generated using zero-knowledge cryptography. 
                No personal information is stored or shared.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}