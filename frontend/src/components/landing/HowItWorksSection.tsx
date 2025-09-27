'use client';

import React, { useState } from 'react';
import { 
  UserIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Anonymous Identity",
      subtitle: "Generate your private identity",
      description: "Create a zero-knowledge identity proof that allows you to participate anonymously while building verifiable trust.",
      icon: UserIcon,
      color: "zk-purple",
      features: [
        "Generate zero-knowledge identity proof",
        "Link existing DeFi reputation privately", 
        "No personal information required"
      ],
      visual: "🔐"
    },
    {
      title: "Join Private Circle",
      subtitle: "Find and join lending communities",
      description: "Browse circles by size, duration, and interest rates. Stake insurance based on your private trust score.",
      icon: UserGroupIcon,
      color: "trust-green",
      features: [
        "Browse circles by size, duration, interest rates",
        "Stake insurance based on private trust score",
        "Join with anonymous membership proof"
      ],
      visual: "👥"
    },
    {
      title: "Democratic Governance",
      subtitle: "Participate in private voting",
      description: "Vote on monthly interest rates and proposals privately. Your vote weight is based on trust, but voting patterns remain hidden.",
      icon: ChatBubbleLeftRightIcon,
      color: "blue-500",
      features: [
        "Vote on monthly interest rates privately",
        "Trust-weighted voting ensures fairness",
        "Proposals visible, individual votes hidden"
      ],
      visual: "🗳️"
    },
    {
      title: "Confidential Participation",
      subtitle: "Bid, pay, and receive privately",
      description: "Submit private bids for monthly loans, make anonymous payments across chains, and receive distributions without identity exposure.",
      icon: CurrencyDollarIcon,
      color: "amber-500",
      features: [
        "Submit private bids for monthly loans",
        "Make anonymous payments across chains",
        "Receive distributions without identity exposure"
      ],
      visual: "💰"
    }
  ];

  return (
    <section className="py-24 bg-midnight-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-midnight-300 max-w-3xl mx-auto">
            Join anonymous lending circles in four simple steps, with your privacy protected at every stage
          </p>
        </div>

        {/* Step Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeStep === index
                  ? 'bg-zk-purple text-white shadow-privacy'
                  : 'bg-midnight-800/50 text-midnight-400 hover:text-midnight-200 hover:bg-midnight-700/50'
              }`}
            >
              <span className="hidden sm:inline">Step {index + 1}: </span>
              {step.title}
            </button>
          ))}
        </div>

        {/* Active Step Content */}
        <div className="bg-midnight-900/60 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-midnight-700/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Step Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className={`bg-${steps[activeStep].color}/20 p-4 rounded-xl`}>
                  {React.createElement(steps[activeStep].icon, {
                    className: `h-8 w-8 text-${steps[activeStep].color}`,
                  })}
                </div>
                <div>
                  <div className="text-sm text-midnight-400 uppercase tracking-wide">
                    Step {activeStep + 1}
                  </div>
                  <h3 className="text-3xl font-bold text-white">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-lg text-midnight-300">
                    {steps[activeStep].subtitle}
                  </p>
                </div>
              </div>

              <p className="text-midnight-300 text-lg leading-relaxed">
                {steps[activeStep].description}
              </p>

              <div className="space-y-3">
                {steps[activeStep].features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-trust-green flex-shrink-0" />
                    <span className="text-midnight-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Privacy Notice */}
              <div className="bg-midnight-800/50 border border-zk-purple/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ShieldCheckIcon className="h-4 w-4 text-zk-purple" />
                  <span className="text-sm font-medium text-zk-purple">Privacy Protected</span>
                </div>
                <p className="text-xs text-midnight-400">
                  All interactions in this step use zero-knowledge proofs to maintain complete anonymity
                </p>
              </div>
            </div>

            {/* Visual Representation */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Background circle */}
                <div className="w-80 h-80 bg-gradient-to-br from-zk-purple/10 to-trust-green/10 rounded-full flex items-center justify-center relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-10 left-10 w-16 h-16 bg-zk-purple/30 rounded-full blur-xl animate-pulse-slow" />
                    <div className="absolute bottom-10 right-10 w-20 h-20 bg-trust-green/20 rounded-full blur-lg animate-pulse-slow" style={{animationDelay: '1s'}} />
                  </div>
                  
                  {/* Main visual */}
                  <div className="text-center z-10">
                    <div className="text-8xl mb-6 animate-pulse-slow">
                      {steps[activeStep].visual}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-center space-x-2">
                        <EyeSlashIcon className="h-6 w-6 text-zk-purple" />
                        <span className="text-sm font-medium text-zk-purple">Anonymous</span>
                      </div>
                      <div className="flex justify-center space-x-2">
                        <ShieldCheckIcon className="h-5 w-5 text-trust-green" />
                        <span className="text-xs text-trust-green">ZK Verified</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step indicators around the circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {steps.map((_, index) => {
                    const angle = (index * 360) / steps.length - 90; // Start from top
                    const radians = (angle * Math.PI) / 180;
                    const radius = 200;
                    const x = Math.cos(radians) * radius;
                    const y = Math.sin(radians) * radius;
                    
                    return (
                      <div
                        key={index}
                        className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          index === activeStep
                            ? 'bg-zk-purple text-white scale-125 shadow-privacy'
                            : index < activeStep
                            ? 'bg-trust-green text-white'
                            : 'bg-midnight-700 text-midnight-400'
                        }`}
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                        }}
                      >
                        {index + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-midnight-800 hover:bg-midnight-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <ArrowRightIcon className="h-4 w-4 rotate-180" />
              <span>Previous</span>
            </button>
            
            <button
              onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
              disabled={activeStep === steps.length - 1}
              className="flex items-center space-x-2 px-6 py-3 bg-zk-purple hover:bg-zk-purple-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <span>Next</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}