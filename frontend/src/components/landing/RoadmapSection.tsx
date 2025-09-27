'use client';

import React from 'react';
import { 
  RocketLaunchIcon,
  CogIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function RoadmapSection() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Foundation",
      timeline: "Months 1-2",
      status: "in-progress",
      description: "Core privacy contracts and essential features",
      icon: RocketLaunchIcon,
      color: "zk-purple",
      deliverables: [
        "Core privacy contracts on Midnight testnet",
        "Basic trust scoring and anonymous authentication", 
        "Web application MVP with essential features",
        "ZK proof generation and verification system"
      ]
    },
    {
      phase: "Phase 2", 
      title: "Core Features",
      timeline: "Months 3-4",
      status: "planned",
      description: "Mainnet launch with full privacy features",
      icon: CogIcon,
      color: "trust-green",
      deliverables: [
        "Mainnet launch with full privacy features",
        "Cross-chain integration (Ethereum, Polygon)",
        "Mobile app and Telegram bot integration",
        "Anonymous bidding and governance systems"
      ]
    },
    {
      phase: "Phase 3",
      title: "Advanced Privacy", 
      timeline: "Months 5-6",
      status: "planned",
      description: "Enhanced features and institutional tools",
      icon: ShieldCheckIcon,
      color: "blue-500",
      deliverables: [
        "Enhanced trust scoring across protocols",
        "Private insurance pools and governance",
        "Analytics dashboard for circle management",
        "Advanced ZK circuits for complex operations"
      ]
    },
    {
      phase: "Phase 4",
      title: "Scale & Expand",
      timeline: "Months 7-12", 
      status: "planned",
      description: "Global expansion and enterprise features",
      icon: GlobeAltIcon,
      color: "amber-500",
      deliverables: [
        "Multi-language support and global expansion",
        "Institutional features and API access",
        "Partnership integrations and white-label solutions",
        "Advanced privacy compliance tools"
      ]
    }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-trust-green text-white';
      case 'in-progress':
        return 'bg-zk-purple text-white';
      case 'planned':
        return 'bg-midnight-700 text-midnight-300';
      default:
        return 'bg-midnight-700 text-midnight-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'planned':
        return 'Planned';
      default:
        return 'Planned';
    }
  };

  return (
    <section className="py-24 bg-midnight-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Development Roadmap
          </h2>
          <p className="text-xl text-midnight-300 max-w-3xl mx-auto">
            Our phased approach to building the most comprehensive privacy-preserving lending platform
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-zk-purple via-trust-green via-blue-500 to-amber-500 opacity-30"></div>

          <div className="space-y-16">
            {phases.map((phase, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Content */}
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-6 border border-midnight-700/50 hover:border-zk-purple/30 transition-colors">
                    <div className={`flex items-center space-x-3 mb-4 ${index % 2 === 0 ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                      <div className={`bg-${phase.color}/20 p-3 rounded-lg`}>
                        <phase.icon className={`h-6 w-6 text-${phase.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-bold text-white">{phase.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(phase.status)}`}>
                            {getStatusText(phase.status)}
                          </span>
                        </div>
                        <p className="text-sm text-midnight-400">{phase.phase} • {phase.timeline}</p>
                      </div>
                    </div>

                    <p className="text-midnight-300 mb-4">{phase.description}</p>

                    <div className="space-y-2">
                      {phase.deliverables.map((deliverable, idx) => (
                        <div key={idx} className={`flex items-center space-x-2 ${index % 2 === 0 ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                          <CheckCircleIcon className={`h-4 w-4 text-${phase.color}`} />
                          <span className="text-sm text-midnight-400">{deliverable}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline dot */}
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-${phase.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <phase.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-20 h-20 border-2 border-midnight-700/50 rounded-full"></div>
                </div>

                {/* Empty space for alternating layout */}
                <div className="w-5/12"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-20">
          <div className="bg-midnight-900/60 backdrop-blur-lg rounded-xl p-8 border border-midnight-700/50">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Current Progress</h3>
              <p className="text-midnight-300">Phase 1 in active development</p>
            </div>

            <div className="relative">
              <div className="w-full bg-midnight-800 rounded-full h-4">
                <div className="bg-gradient-to-r from-zk-purple to-trust-green h-4 rounded-full transition-all duration-1000" style={{width: '25%'}}></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-zk-purple font-medium">Foundation</span>
                <span className="text-xs text-midnight-400">Core Features</span>
                <span className="text-xs text-midnight-400">Advanced Privacy</span>
                <span className="text-xs text-midnight-400">Scale & Expand</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-zk-purple mb-1">4/4</div>
                <p className="text-sm text-midnight-400">Core contracts designed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-trust-green mb-1">8/12</div>
                <p className="text-sm text-midnight-400">Frontend components built</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">2/3</div>
                <p className="text-sm text-midnight-400">ZK circuits implemented</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-zk-purple/20 to-trust-green/20 rounded-2xl p-8 border border-zk-purple/30">
            <h3 className="text-2xl font-bold text-white mb-4">Join Our Journey</h3>
            <p className="text-midnight-300 mb-6 max-w-2xl mx-auto">
              Be part of the privacy revolution in community finance. Follow our development progress 
              and get early access to new features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-zk-purple hover:bg-zk-purple-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Join Community Discord
              </button>
              <button className="bg-midnight-800 hover:bg-midnight-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-midnight-600">
                Follow Development Updates
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}