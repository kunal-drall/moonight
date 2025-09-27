'use client';

import React from 'react';
import { 
  GlobeAltIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function MarketOpportunitySection() {
  const statistics = [
    {
      value: "$180B+",
      label: "Global ROSCA market size",
      description: "Traditional rotating savings and credit associations worldwide",
      icon: CurrencyDollarIcon,
      color: "trust-green"
    },
    {
      value: "1.4B",
      label: "Unbanked adults worldwide", 
      description: "People without access to formal financial services",
      icon: GlobeAltIcon,
      color: "zk-purple"
    },
    {
      value: "15M+",
      label: "US ROSCA participants",
      description: "Americans participating in informal lending circles",
      icon: UserGroupIcon,
      color: "blue-500"
    },
    {
      value: "5M+",
      label: "DeFi users seeking privacy",
      description: "Crypto users concerned about financial surveillance",
      icon: EyeSlashIcon,
      color: "amber-500"
    }
  ];

  const useCases = [
    {
      title: "Underbanked Populations",
      description: "Individuals without credit history who need access to community lending and gradual credit building",
      icon: UserGroupIcon,
      gradient: "from-trust-green to-trust-green-dark",
      examples: [
        "Recent immigrants building credit",
        "Young adults with no credit history",
        "Rural communities with limited banking"
      ]
    },
    {
      title: "Privacy-Conscious Users",
      description: "Crypto users who want to participate in DeFi without exposing their financial activities publicly",
      icon: EyeSlashIcon,
      gradient: "from-zk-purple to-zk-purple-dark",
      examples: [
        "High-net-worth individuals avoiding exposure",
        "Privacy advocates in DeFi",
        "Users in oppressive regimes"
      ]
    },
    {
      title: "Cross-Border Lending",
      description: "Families and communities spanning multiple countries who want to pool resources privately",
      icon: GlobeAltIcon,
      gradient: "from-blue-500 to-blue-600",
      examples: [
        "Diaspora community support networks",
        "International family lending circles",
        "Cross-border small business funding"
      ]
    },
    {
      title: "Professional Groups",
      description: "Workplace and professional communities that want financial privacy from employers and competitors",
      icon: BuildingOfficeIcon,
      gradient: "from-amber-500 to-amber-600",
      examples: [
        "Medical professionals group lending",
        "Teacher and educator circles",
        "Tech worker mutual aid societies"
      ]
    }
  ];

  return (
    <section className="py-24 bg-midnight-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Market Opportunity
          </h2>
          <p className="text-xl text-midnight-300 max-w-3xl mx-auto">
            A massive underserved market exists for privacy-preserving community finance
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {statistics.map((stat, index) => (
            <div key={index} className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50 text-center">
              <div className={`bg-${stat.color}/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                <stat.icon className={`h-8 w-8 text-${stat.color}`} />
              </div>
              <div className={`text-4xl font-bold text-${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-white font-semibold mb-2">{stat.label}</div>
              <p className="text-xs text-midnight-400">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Target Use Cases</h3>
            <p className="text-lg text-midnight-300 max-w-2xl mx-auto">
              Moonight Protocol serves diverse communities with varying privacy and financial needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`bg-gradient-to-r ${useCase.gradient} p-3 rounded-lg`}>
                    <useCase.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-2">{useCase.title}</h4>
                    <p className="text-midnight-300 text-sm mb-4">{useCase.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-midnight-400 font-medium mb-2">Examples:</p>
                  {useCase.examples.map((example, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-zk-purple rounded-full"></div>
                      <span className="text-xs text-midnight-400">{example}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Growth Potential */}
        <div className="bg-gradient-to-br from-zk-purple/10 to-trust-green/10 rounded-2xl p-8 border border-zk-purple/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Growth Drivers</h3>
            <p className="text-midnight-300 max-w-2xl mx-auto">
              Multiple converging trends create a perfect opportunity for privacy-preserving community finance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-trust-green/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ShieldCheckIcon className="h-8 w-8 text-trust-green" />
              </div>
              <h4 className="font-semibold text-white mb-2">Privacy Awareness</h4>
              <p className="text-sm text-midnight-400">
                Growing concern about financial surveillance and data breaches drives demand for private solutions
              </p>
            </div>

            <div className="text-center">
              <div className="bg-zk-purple/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AcademicCapIcon className="h-8 w-8 text-zk-purple" />
              </div>
              <h4 className="font-semibold text-white mb-2">ZK Technology Maturity</h4>
              <p className="text-sm text-midnight-400">
                Zero-knowledge proofs are becoming mainstream, enabling user-friendly privacy applications
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <GlobeAltIcon className="h-8 w-8 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Global Digital Adoption</h4>
              <p className="text-sm text-midnight-400">
                Increasing mobile adoption in emerging markets creates access to decentralized financial services
              </p>
            </div>
          </div>
        </div>

        {/* Competitive Advantage */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Competitive Advantage</h3>
            <p className="text-lg text-midnight-300 max-w-2xl mx-auto">
              First-mover advantage in privacy-preserving community lending with proven technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-midnight-800/50 rounded-xl p-6 border border-midnight-700/50 text-center">
              <div className="text-3xl mb-3">🏆</div>
              <h4 className="font-semibold text-white mb-2">First Mover</h4>
              <p className="text-sm text-midnight-400">
                First privacy-preserving lending circles on blockchain
              </p>
            </div>

            <div className="bg-midnight-800/50 rounded-xl p-6 border border-midnight-700/50 text-center">
              <div className="text-3xl mb-3">🔬</div>
              <h4 className="font-semibold text-white mb-2">Proven Technology</h4>
              <p className="text-sm text-midnight-400">
                Built on battle-tested Midnight blockchain infrastructure
              </p>
            </div>

            <div className="bg-midnight-800/50 rounded-xl p-6 border border-midnight-700/50 text-center">
              <div className="text-3xl mb-3">🌐</div>
              <h4 className="font-semibold text-white mb-2">Network Effects</h4>
              <p className="text-sm text-midnight-400">
                Growing privacy-conscious community creates strong moats
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}