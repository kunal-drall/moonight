'use client';

import React, { useState, useEffect } from 'react';
import { 
  CogIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ZKProofGeneratorProps {
  type: 'bidding' | 'trust' | 'payment' | 'membership';
  isVisible: boolean;
  onComplete: () => void;
}

interface ProofStep {
  name: string;
  description: string;
  completed: boolean;
  processing: boolean;
}

export default function ZKProofGenerator({ type, isVisible, onComplete }: ZKProofGeneratorProps) {
  const [steps, setSteps] = useState<ProofStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    // Initialize steps based on proof type
    const proofSteps = getStepsForType(type);
    setSteps(proofSteps);
    setCurrentStep(0);
    setIsComplete(false);

    // Start proof generation simulation
    simulateProofGeneration(proofSteps);
  }, [isVisible, type]);

  const getStepsForType = (type: string): ProofStep[] => {
    const baseSteps = [
      { name: 'Initialize Circuit', description: 'Setting up ZK circuit parameters', completed: false, processing: false },
      { name: 'Generate Witness', description: 'Creating proof witness data', completed: false, processing: false },
      { name: 'Compute Proof', description: 'Generating zero-knowledge proof', completed: false, processing: false },
      { name: 'Verify Proof', description: 'Validating proof correctness', completed: false, processing: false },
    ];

    switch (type) {
      case 'bidding':
        return [
          { name: 'Validate Bid Range', description: 'Checking bid amount within limits', completed: false, processing: false },
          ...baseSteps,
          { name: 'Submit Anonymous Bid', description: 'Sending encrypted bid to circle', completed: false, processing: false },
        ];
      case 'trust':
        return [
          { name: 'Calculate Trust Score', description: 'Computing trust metrics privately', completed: false, processing: false },
          ...baseSteps,
          { name: 'Update Trust Registry', description: 'Recording score with privacy', completed: false, processing: false },
        ];
      case 'payment':
        return [
          { name: 'Verify Payment Source', description: 'Confirming payment capability', completed: false, processing: false },
          ...baseSteps,
          { name: 'Execute Payment', description: 'Processing private payment', completed: false, processing: false },
        ];
      case 'membership':
        return [
          { name: 'Verify Identity', description: 'Validating membership eligibility', completed: false, processing: false },
          ...baseSteps,
          { name: 'Add to Circle', description: 'Joining circle anonymously', completed: false, processing: false },
        ];
      default:
        return baseSteps;
    }
  };

  const simulateProofGeneration = async (proofSteps: ProofStep[]) => {
    for (let i = 0; i < proofSteps.length; i++) {
      // Set current step as processing
      setSteps(prev => prev.map((step, idx) => ({
        ...step,
        processing: idx === i,
        completed: idx < i
      })));
      setCurrentStep(i);

      // Simulate processing time (varies by step)
      const processingTime = i === 2 ? 2000 : 800; // Proof computation takes longer
      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Mark step as completed
      setSteps(prev => prev.map((step, idx) => ({
        ...step,
        processing: false,
        completed: idx <= i
      })));
    }

    setIsComplete(true);
    
    // Auto-close after 2 seconds
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const getProofTypeTitle = (type: string) => {
    switch (type) {
      case 'bidding': return 'Anonymous Bid Proof';
      case 'trust': return 'Trust Score Proof';
      case 'payment': return 'Payment Proof';
      case 'membership': return 'Membership Proof';
      default: return 'ZK Proof';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-midnight-900 border border-midnight-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-privacy">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-zk-purple/20 p-2 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-zk-purple" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{getProofTypeTitle(type)}</h3>
              <p className="text-sm text-midnight-400">Generating zero-knowledge proof</p>
            </div>
          </div>
          
          {isComplete && (
            <button
              onClick={onComplete}
              className="text-midnight-400 hover:text-midnight-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  <CheckCircleIcon className="h-5 w-5 text-trust-green" />
                ) : step.processing ? (
                  <CogIcon className="h-5 w-5 text-zk-purple animate-spin" />
                ) : (
                  <div className="h-5 w-5 border-2 border-midnight-600 rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  step.completed 
                    ? 'text-trust-green' 
                    : step.processing 
                      ? 'text-zk-purple' 
                      : 'text-midnight-400'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-midnight-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="mt-6 p-4 bg-trust-green/10 border border-trust-green/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-trust-green" />
              <span className="text-sm font-medium text-trust-green">
                Proof Generated Successfully
              </span>
            </div>
            <p className="text-xs text-midnight-400 mt-1">
              Your privacy has been preserved throughout the process.
            </p>
          </div>
        )}

        <div className="mt-6 bg-midnight-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <ShieldCheckIcon className="h-4 w-4 text-zk-purple" />
            <span className="text-xs font-medium text-zk-purple">Privacy Guarantee</span>
          </div>
          <p className="text-xs text-midnight-400">
            Zero-knowledge proofs ensure your sensitive data never leaves your device while 
            maintaining cryptographic verification.
          </p>
        </div>
      </div>
    </div>
  );
}