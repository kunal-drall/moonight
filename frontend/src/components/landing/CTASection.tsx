'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  BellIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export default function CTASection() {
  const socialProof = [
    {
      title: "Midnight Ecosystem Partnership",
      description: "Official partner in the Midnight blockchain ecosystem",
      icon: ShieldCheckIcon,
      color: "zk-purple"
    },
    {
      title: "Privacy Advocacy Endorsements", 
      description: "Supported by leading privacy and decentralization advocates",
      icon: UserGroupIcon,
      color: "trust-green"
    },
    {
      title: "Developer Community",
      description: "Growing community of privacy-focused developers",
      icon: ChatBubbleLeftRightIcon,
      color: "blue-500"
    }
  ];

  const actionOptions = [
    {
      title: "Launch Testnet Demo",
      description: "Experience the privacy features firsthand",
      icon: RocketLaunchIcon,
      href: "/dashboard",
      primary: true,
      color: "zk-purple"
    },
    {
      title: "Join Community Discord",
      description: "Connect with other privacy advocates", 
      icon: ChatBubbleLeftRightIcon,
      href: "#",
      primary: false,
      color: "trust-green"
    },
    {
      title: "Early Access Signup",
      description: "Get notified for mainnet launch",
      icon: BellIcon,
      href: "#",
      primary: false,
      color: "blue-500"
    },
    {
      title: "Read Documentation",
      description: "Learn about the privacy technology",
      icon: DocumentTextIcon,
      href: "#",
      primary: false,
      color: "amber-500"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="text-center mb-20">
          <div className="bg-gradient-to-br from-zk-purple/10 to-trust-green/10 rounded-3xl p-12 border border-zk-purple/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-zk-purple/30 rounded-full blur-xl animate-pulse-slow" />
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-trust-green/20 rounded-full blur-2xl animate-pulse-slow" style={{animationDelay: '1s'}} />
            </div>

            <div className="relative z-10">
              <div className="flex justify-center mb-8">
                <div className="bg-zk-purple/20 p-4 rounded-full">
                  <ShieldCheckIcon className="h-16 w-16 text-zk-purple" />
                </div>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Join the Privacy Revolution
                <span className="block text-transparent bg-gradient-to-r from-zk-purple to-trust-green bg-clip-text">
                  in Community Finance
                </span>
              </h2>

              <p className="text-xl text-midnight-300 mb-12 max-w-3xl mx-auto">
                Be among the first to experience truly private lending circles. 
                Build credit, access loans, and grow wealth without sacrificing your privacy.
              </p>

              {/* Primary CTA Button */}
              <Link 
                href="/dashboard"
                className="inline-flex items-center space-x-3 bg-zk-purple hover:bg-zk-purple-dark text-white px-12 py-6 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-privacy mb-8"
              >
                <RocketLaunchIcon className="h-6 w-6" />
                <span>Launch Privacy Dashboard</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>

              <div className="flex flex-wrap justify-center gap-6 text-midnight-400">
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-5 w-5 text-zk-purple" />
                  <span className="text-sm">100% Anonymous</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="h-5 w-5 text-trust-green" />
                  <span className="text-sm">Community Driven</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PlayIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-sm">Ready to Use</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {actionOptions.map((option, index) => (
            <Link
              key={index}
              href={option.href}
              className={`group bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50 hover:border-${option.color}/50 transition-all duration-300 transform hover:scale-105 ${
                option.primary ? 'ring-2 ring-zk-purple/30' : ''
              }`}
            >
              <div className={`bg-${option.color}/20 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                <option.icon className={`h-6 w-6 text-${option.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{option.title}</h3>
              <p className="text-sm text-midnight-400 mb-4">{option.description}</p>
              <div className="flex items-center space-x-2 text-xs">
                <span className={`text-${option.color}`}>Learn more</span>
                <ArrowRightIcon className={`h-3 w-3 text-${option.color} group-hover:translate-x-1 transition-transform`} />
              </div>
            </Link>
          ))}
        </div>

        {/* Social Proof */}
        <div className="bg-midnight-900/40 rounded-2xl p-8 border border-midnight-700/30">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Trusted & Supported</h3>
            <p className="text-midnight-300">
              Backed by leading organizations in the privacy and blockchain space
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {socialProof.map((proof, index) => (
              <div key={index} className="text-center">
                <div className={`bg-${proof.color}/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                  <proof.icon className={`h-8 w-8 text-${proof.color}`} />
                </div>
                <h4 className="font-semibold text-white mb-2">{proof.title}</h4>
                <p className="text-sm text-midnight-400">{proof.description}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="border-t border-midnight-700/50 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-midnight-800/50 rounded-lg p-4">
                <p className="text-sm text-midnight-300 mb-3">
                  &ldquo;Finally, a DeFi solution that doesn&apos;t expose my entire financial life. 
                  The privacy features are exactly what the community has been waiting for.&rdquo;
                </p>
                <div className="text-xs text-midnight-400">
                  - Early Beta User
                </div>
              </div>
              
              <div className="bg-midnight-800/50 rounded-lg p-4">
                <p className="text-sm text-midnight-300 mb-3">
                  &ldquo;The zero-knowledge implementation is elegant and user-friendly. 
                  This sets a new standard for privacy in community finance.&rdquo;
                </p>
                <div className="text-xs text-midnight-400">
                  - Privacy Developer
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <p className="text-midnight-400 mb-4">
            Ready to take control of your financial privacy?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-midnight-800 hover:bg-midnight-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-midnight-600">
              Watch Demo Video
            </button>
            <button className="bg-midnight-800 hover:bg-midnight-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-midnight-600">
              Schedule Demo Call
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}