'use client';

import React from 'react';
import { 
  ShieldCheckIcon,
  EyeSlashIcon,
  CurrencyDollarIcon,
  LinkIcon,
  GlobeAltIcon,
  UserGroupIcon,
  LockClosedIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function SolutionSection() {
  const features = [
    {
      title: "Zero-Knowledge Trust Scoring",
      description: "Prove creditworthiness without revealing transaction history. Build reputation across protocols privately with trust tiers that unlock better terms.",
      icon: ShieldCheckIcon,
      gradient: "from-zk-purple to-zk-purple-dark",
      benefits: [
        "Private credit history building",
        "Cross-protocol reputation",
        "Trust-based loan terms"
      ]
    },
    {
      title: "Private Bidding & Governance",
      description: "Compete for loans without exposing bid amounts. Vote on interest rates anonymously with democratic participation and complete privacy.",
      icon: CurrencyDollarIcon,
      gradient: "from-trust-green to-trust-green-dark",
      benefits: [
        "Anonymous competitive bidding",
        "Private governance voting",
        "Fair interest rate setting"
      ]
    },
    {
      title: "Cross-Chain Privacy",
      description: "Participate across Ethereum, Polygon, Arbitrum with unlinkable identities that prevent address correlation and pattern analysis.",
      icon: LinkIcon,
      gradient: "from-blue-500 to-blue-600",
      benefits: [
        "Multi-chain participation",
        "Unlinkable identities",
        "Pattern-resistant payments"
      ]
    },
    {
      title: "Confidential Operations",
      description: "Monthly payments processed privately with hidden insurance stakes and loan distributions without identity exposure to other members.",
      icon: EyeSlashIcon,
      gradient: "from-purple-500 to-purple-600",
      benefits: [
        "Private payment processing",
        "Hidden insurance amounts",
        "Anonymous distributions"
      ]
    },
    {
      title: "Economic Security",
      description: "ZK-proven stake requirements based on trust score with automated penalty enforcement for defaults and community insurance.",
      icon: LockClosedIcon,
      gradient: "from-amber-500 to-amber-600",
      benefits: [
        "Trust-based stake requirements",
        "Automated penalty system",
        "Community risk sharing"
      ]
    },
    {
      title: "Global Accessibility",
      description: "No geographic restrictions or personal relationships required. Mobile-first design for emerging markets with progressive onboarding.",
      icon: GlobeAltIcon,
      gradient: "from-emerald-500 to-emerald-600",
      benefits: [
        "Worldwide accessibility",
        "Mobile-optimized interface",
        "Simple progressive onboarding"
      ]
    }
  ];

  return (
    <section className="py-24 bg-midnight-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Anonymous Lending Circles,
            <span className="block text-transparent bg-gradient-to-r from-zk-purple to-trust-green bg-clip-text">
              Verifiable Trust
            </span>
          </h2>
          <p className="text-xl text-midnight-300 max-w-3xl mx-auto">
            Moonight Protocol combines the community benefits of traditional ROSCAs with cutting-edge 
            zero-knowledge cryptography for unprecedented financial privacy
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* Key Benefits Summary */}
        <div className="bg-gradient-to-br from-zk-purple/10 to-trust-green/10 rounded-2xl p-8 border border-zk-purple/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Privacy-First by Design</h3>
            <p className="text-midnight-300">
              Every aspect of Moonight Protocol is built from the ground up to preserve your privacy 
              while maintaining the trust and community benefits of traditional lending circles
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-zk-purple/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <EyeSlashIcon className="h-8 w-8 text-zk-purple" />
              </div>
              <h4 className="font-semibold text-white mb-2">Anonymous by Default</h4>
              <p className="text-xs text-midnight-400">
                No personal information required or stored
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-trust-green/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ShieldCheckIcon className="h-8 w-8 text-trust-green" />
              </div>
              <h4 className="font-semibold text-white mb-2">Cryptographically Secure</h4>
              <p className="text-xs text-midnight-400">
                Zero-knowledge proofs ensure mathematical certainty
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UserGroupIcon className="h-8 w-8 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Community Driven</h4>
              <p className="text-xs text-midnight-400">
                Democratic governance with private voting
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-amber-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <GlobeAltIcon className="h-8 w-8 text-amber-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Globally Accessible</h4>
              <p className="text-xs text-midnight-400">
                No geographic or relationship barriers
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  feature: {
    title: string;
    description: string;
    icon: React.ElementType;
    gradient: string;
    benefits: string[];
  };
}

function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;
  
  return (
    <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50 hover:border-zk-purple/30 transition-all duration-300 group">
      <div className="mb-4">
        <div className={`bg-gradient-to-r ${feature.gradient} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
        <p className="text-midnight-300 text-sm mb-4">{feature.description}</p>
      </div>
      
      <div className="space-y-2">
        {feature.benefits.map((benefit, index) => (
          <div key={index} className="flex items-center space-x-2">
            <CheckCircleIcon className="h-4 w-4 text-trust-green" />
            <span className="text-xs text-midnight-400">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}