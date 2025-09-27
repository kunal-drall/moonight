'use client';

import React from 'react';
import HeroSection from './HeroSection';
import ProblemSection from './ProblemSection';
import SolutionSection from './SolutionSection';
import HowItWorksSection from './HowItWorksSection';
import TechnologySection from './TechnologySection';
import MarketOpportunitySection from './MarketOpportunitySection';
import RoadmapSection from './RoadmapSection';
import CTASection from './CTASection';

export default function LandingPage() {
  return (
    <div className="bg-midnight-950 min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <TechnologySection />
      <MarketOpportunitySection />
      <RoadmapSection />
      <CTASection />
    </div>
  );
}