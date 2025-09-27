'use client';

import React from 'react';
import { 
  ShieldCheckIcon,
  CogIcon 
} from '@heroicons/react/24/outline';

interface ZKProofStatusProps {
  isGenerating: boolean;
}

export default function ZKProofStatus({ isGenerating }: ZKProofStatusProps) {
  return (
    <div className="flex items-center space-x-2">
      {isGenerating ? (
        <div className="flex items-center space-x-2 bg-zk-purple/20 text-zk-purple px-3 py-2 rounded-lg">
          <CogIcon className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Generating ZK Proof...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 bg-trust-green/20 text-trust-green px-3 py-2 rounded-lg">
          <ShieldCheckIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Privacy Verified</span>
        </div>
      )}
    </div>
  );
}