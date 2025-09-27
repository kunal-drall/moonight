'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheckIcon,
  EyeSlashIcon,
  UserGroupIcon,
  PlayIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-midnight-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zk-purple/10 via-midnight-950 to-midnight-900" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-zk-purple/30 rounded-full blur-xl animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-trust-green/20 rounded-full blur-lg animate-pulse-slow" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-zk-purple/20 rounded-full blur-2xl animate-pulse-slow" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          {/* Logo and brand */}
          <div className="flex justify-center items-center space-x-3 mb-8">
            <div className="bg-zk-purple/20 p-3 rounded-full">
              <ShieldCheckIcon className="h-12 w-12 text-zk-purple" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white">Moonight</h1>
              <p className="text-sm text-zk-purple uppercase tracking-wider">Protocol</p>
            </div>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Privacy-First
            <span className="block text-transparent bg-gradient-to-r from-zk-purple to-trust-green bg-clip-text">
              Lending Circles
            </span>
            <span className="block text-midnight-200 text-4xl md:text-5xl mt-2">
              for the Modern World
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-midnight-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join anonymous community lending powered by Midnight&apos;s zero-knowledge technology. 
            Build credit, access loans, and participate in global finance without exposing your financial data.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              href="/dashboard"
              className="bg-zk-purple hover:bg-zk-purple-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-privacy flex items-center space-x-2"
            >
              <ShieldCheckIcon className="h-5 w-5" />
              <span>Launch App</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <button className="bg-midnight-800/50 backdrop-blur-sm hover:bg-midnight-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors border border-midnight-600 flex items-center space-x-2">
              <PlayIcon className="h-5 w-5" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Privacy indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-midnight-400">
            <div className="flex items-center space-x-2">
              <EyeSlashIcon className="h-5 w-5 text-zk-purple" />
              <span className="text-sm">Anonymous by Default</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5 text-trust-green" />
              <span className="text-sm">Zero-Knowledge Proofs</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="h-5 w-5 text-blue-400" />
              <span className="text-sm">Global Community</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 relative">
          <div className="max-w-4xl mx-auto">
            {/* Interconnected circles visualization */}
            <div className="relative h-64 md:h-96">
              <svg className="w-full h-full" viewBox="0 0 800 400" fill="none">
                {/* Connection lines */}
                <g className="opacity-30">
                  <line x1="150" y1="200" x2="350" y2="120" stroke="url(#gradient1)" strokeWidth="2" className="animate-pulse-slow" />
                  <line x1="350" y1="120" x2="650" y2="200" stroke="url(#gradient1)" strokeWidth="2" className="animate-pulse-slow" style={{animationDelay: '0.5s'}} />
                  <line x1="150" y1="200" x2="400" y2="280" stroke="url(#gradient2)" strokeWidth="2" className="animate-pulse-slow" style={{animationDelay: '1s'}} />
                  <line x1="650" y1="200" x2="400" y2="280" stroke="url(#gradient2)" strokeWidth="2" className="animate-pulse-slow" style={{animationDelay: '1.5s'}} />
                </g>

                {/* Anonymous user circles */}
                <g>
                  <circle cx="150" cy="200" r="40" fill="url(#gradient3)" className="animate-pulse-slow" />
                  <circle cx="350" cy="120" r="35" fill="url(#gradient4)" className="animate-pulse-slow" style={{animationDelay: '0.3s'}} />
                  <circle cx="650" cy="200" r="40" fill="url(#gradient3)" className="animate-pulse-slow" style={{animationDelay: '0.6s'}} />
                  <circle cx="400" cy="280" r="35" fill="url(#gradient4)" className="animate-pulse-slow" style={{animationDelay: '0.9s'}} />
                  <circle cx="500" cy="150" r="30" fill="url(#gradient5)" className="animate-pulse-slow" style={{animationDelay: '1.2s'}} />
                </g>

                {/* Privacy shields */}
                <g className="opacity-80">
                  <path d="M140 190 L150 180 L160 190 L160 200 L155 210 L145 210 L140 200 Z" fill="#8b5cf6" />
                  <path d="M640 190 L650 180 L660 190 L660 200 L655 210 L645 210 L640 200 Z" fill="#10b981" />
                </g>

                {/* Gradients */}
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  </linearGradient>
                  <radialGradient id="gradient3">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
                  </radialGradient>
                  <radialGradient id="gradient4">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
                  </radialGradient>
                  <radialGradient id="gradient5">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
                  </radialGradient>
                </defs>
              </svg>

              {/* ZK proof symbols */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">🔒</div>
                  <p className="text-sm text-zk-purple font-medium">ZK Proofs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}