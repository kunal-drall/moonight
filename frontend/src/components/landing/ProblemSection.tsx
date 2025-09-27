'use client';

import React from 'react';
import { 
  ExclamationTriangleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

export default function ProblemSection() {
  return (
    <section className="py-24 bg-midnight-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            The Privacy Gap in 
            <span className="text-transparent bg-gradient-to-r from-warning to-danger bg-clip-text"> Community Finance</span>
          </h2>
          <p className="text-xl text-midnight-300 max-w-3xl mx-auto">
            Despite the promise of decentralized finance, most solutions expose your entire financial life to the world
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Traditional Challenges */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="bg-warning/20 p-3 rounded-full">
                  <ExclamationTriangleIcon className="h-8 w-8 text-warning" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Traditional Challenges</h3>
            </div>

            <div className="space-y-6">
              <div className="bg-midnight-800/50 backdrop-blur-sm rounded-xl p-6 border border-midnight-700/50">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">👥</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Limited Access</h4>
                    <p className="text-midnight-300 text-sm">
                      1.4B people rely on informal lending but lack digital access to modern financial tools
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-midnight-800/50 backdrop-blur-sm rounded-xl p-6 border border-midnight-700/50">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">📊</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Public Exposure</h4>
                    <p className="text-midnight-300 text-sm">
                      Existing solutions expose all financial data publicly on transparent blockchains
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-midnight-800/50 backdrop-blur-sm rounded-xl p-6 border border-midnight-700/50">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">💰</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Overcollateralization</h4>
                    <p className="text-midnight-300 text-sm">
                      DeFi requires 150%+ collateral, excluding most people who need loans the most
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-midnight-800/50 backdrop-blur-sm rounded-xl p-6 border border-midnight-700/50">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🌍</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Geographic Barriers</h4>
                    <p className="text-midnight-300 text-sm">
                      Geographic limitations prevent global participation in community lending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Concerns */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="bg-danger/20 p-3 rounded-full">
                  <ShieldExclamationIcon className="h-8 w-8 text-danger" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Privacy Concerns</h3>
            </div>

            <div className="space-y-6">
              <div className="bg-midnight-800/50 backdrop-blur-sm rounded-xl p-6 border border-danger/20 border-dashed">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">👁️</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Public Transactions</h4>
                    <p className="text-midnight-300 text-sm">
                      All blockchain transactions are permanently public and searchable forever
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-midnight-800/50 backdrop-blur-sm rounded-xl p-6 border border-danger/20 border-dashed">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">📈</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Financial History Exposed</h4>
                    <p className="text-midnight-300 text-sm">
                      Financial history exposed to employers, competitors, governments, and bad actors
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-midnight-800/50 backdrop-blur-sm rounded-xl p-6 border border-danger/20 border-dashed">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🔍</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">No Control</h4>
                    <p className="text-midnight-300 text-sm">
                      No control over who sees your lending activity, borrowing patterns, or wealth accumulation
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-midnight-800/50 backdrop-blur-sm rounded-xl p-6 border border-danger/20 border-dashed">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🎯</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Targeted Attacks</h4>
                    <p className="text-midnight-300 text-sm">
                      Risk of targeted attacks, scams, and discrimination based on visible wealth and activity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call-out Statistics */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-danger/10 to-warning/10 rounded-2xl p-8 border border-danger/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">The Cost of Financial Transparency</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-danger mb-2">100%</div>
                <p className="text-midnight-300 text-sm">
                  of blockchain transactions are permanently public
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-warning mb-2">$180B+</div>
                <p className="text-midnight-300 text-sm">
                  global ROSCA market lacks privacy protection
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-danger mb-2">0%</div>
                <p className="text-midnight-300 text-sm">
                  financial privacy in current DeFi solutions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}