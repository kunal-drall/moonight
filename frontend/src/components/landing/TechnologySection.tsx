'use client';

import React from 'react';
import { 
  ShieldCheckIcon,
  CpuChipIcon,
  LinkIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

export default function TechnologySection() {
  return (
    <section className="py-24 bg-midnight-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powered by 
            <span className="text-transparent bg-gradient-to-r from-zk-purple to-trust-green bg-clip-text"> Midnight Blockchain</span>
          </h2>
          <p className="text-xl text-midnight-300 max-w-3xl mx-auto">
            Built on cutting-edge privacy infrastructure for maximum security and user experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Why Midnight */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-6">Why Midnight Blockchain?</h3>
            
            <div className="space-y-6">
              <div className="bg-midnight-800/50 backdrop-blur-sm rounded-xl p-6 border border-midnight-700/50">
                <div className="flex items-start space-x-4">
                  <div className="bg-zk-purple/20 p-3 rounded-lg">
                    <LockClosedIcon className="h-6 w-6 text-zk-purple" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Native Privacy Smart Contracts</h4>
                    <p className="text-midnight-300 text-sm">
                      Built-in privacy features at the protocol level, not bolt-on solutions
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-midnight-800/50 backdrop-blur-sm rounded-xl p-6 border border-midnight-700/50">
                <div className="flex items-start space-x-4">
                  <div className="bg-trust-green/20 p-3 rounded-lg">
                    <ShieldCheckIcon className="h-6 w-6 text-trust-green" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Zero-Knowledge Proof Infrastructure</h4>
                    <p className="text-midnight-300 text-sm">
                      High-performance ZK circuits optimized for financial applications
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-midnight-800/50 backdrop-blur-sm rounded-xl p-6 border border-midnight-700/50">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <LinkIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Cardano Ecosystem Integration</h4>
                    <p className="text-midnight-300 text-sm">
                      Seamless interoperability with the broader Cardano DeFi ecosystem
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-midnight-800/50 backdrop-blur-sm rounded-xl p-6 border border-midnight-700/50">
                <div className="flex items-start space-x-4">
                  <div className="bg-amber-500/20 p-3 rounded-lg">
                    <CodeBracketIcon className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Developer-Friendly Privacy Tools</h4>
                    <p className="text-midnight-300 text-sm">
                      Comprehensive SDK for building privacy-preserving applications
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Benefits */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-6">Technical Benefits</h3>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-zk-purple/10 to-trust-green/10 rounded-xl p-6 border border-zk-purple/20">
                <div className="flex items-start space-x-4">
                  <CheckCircleIcon className="h-6 w-6 text-trust-green mt-1" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">No Mixing or Tumbling Required</h4>
                    <p className="text-midnight-300 text-sm">
                      Privacy is built into every transaction, not added as an afterthought
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-zk-purple/10 to-trust-green/10 rounded-xl p-6 border border-zk-purple/20">
                <div className="flex items-start space-x-4">
                  <CheckCircleIcon className="h-6 w-6 text-trust-green mt-1" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Private by Default</h4>
                    <p className="text-midnight-300 text-sm">
                      Not a bolt-on solution - privacy is fundamental to the protocol design
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-zk-purple/10 to-trust-green/10 rounded-xl p-6 border border-zk-purple/20">
                <div className="flex items-start space-x-4">
                  <CheckCircleIcon className="h-6 w-6 text-trust-green mt-1" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Verifiable Fairness</h4>
                    <p className="text-midnight-300 text-sm">
                      Mathematical proofs ensure fairness while keeping details private
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-zk-purple/10 to-trust-green/10 rounded-xl p-6 border border-zk-purple/20">
                <div className="flex items-start space-x-4">
                  <CheckCircleIcon className="h-6 w-6 text-trust-green mt-1" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Cross-Chain Privacy Preservation</h4>
                    <p className="text-midnight-300 text-sm">
                      Maintain privacy even when bridging to other blockchains
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-midnight-900/60 backdrop-blur-lg rounded-2xl p-8 border border-midnight-700/50">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Technical Specifications</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Privacy Guarantees */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-zk-purple mr-2" />
                Privacy Guarantees
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-zk-purple rounded-full"></div>
                  <span className="text-sm text-midnight-300">Zero-knowledge proof verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-zk-purple rounded-full"></div>
                  <span className="text-sm text-midnight-300">Unlinkable cross-chain identities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-zk-purple rounded-full"></div>
                  <span className="text-sm text-midnight-300">Confidential trust score computation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-zk-purple rounded-full"></div>
                  <span className="text-sm text-midnight-300">Anonymous governance participation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-zk-purple rounded-full"></div>
                  <span className="text-sm text-midnight-300">Private asset management</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CpuChipIcon className="h-5 w-5 text-trust-green mr-2" />
                Performance Metrics
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-trust-green rounded-full"></div>
                  <span className="text-sm text-midnight-300">Sub-second proof verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-trust-green rounded-full"></div>
                  <span className="text-sm text-midnight-300">Cross-chain transaction finality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-trust-green rounded-full"></div>
                  <span className="text-sm text-midnight-300">Scalable to 100K+ anonymous users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-trust-green rounded-full"></div>
                  <span className="text-sm text-midnight-300">Mobile-optimized privacy features</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-trust-green rounded-full"></div>
                  <span className="text-sm text-midnight-300">Low-latency ZK computation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}