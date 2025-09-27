'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  WalletIcon,
  Cog6ToothIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ShieldCheckIcon },
  { name: 'Circles', href: '/circles', icon: UserGroupIcon },
  { name: 'Bidding', href: '/bidding', icon: CurrencyDollarIcon },
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Wallet', href: '/wallet', icon: WalletIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-midnight-900/80 backdrop-blur-lg border-b border-midnight-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <MoonIcon className="h-8 w-8 text-zk-purple" />
                <span className="font-bold text-xl text-white">
                  Moonight
                </span>
                <span className="text-xs bg-zk-purple/20 text-zk-purple px-2 py-1 rounded-full">
                  PRIVACY
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-b-2 border-zk-purple text-zk-purple'
                        : 'text-midnight-300 hover:text-midnight-100 hover:border-midnight-300 border-b-2 border-transparent'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button className="bg-midnight-800 p-1 rounded-full text-midnight-400 hover:text-midnight-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight-800 focus:ring-zk-purple">
              <span className="sr-only">View notifications</span>
              <div className="h-6 w-6 rounded-full bg-trust-green/20 flex items-center justify-center">
                <div className="h-2 w-2 bg-trust-green rounded-full"></div>
              </div>
            </button>
            <div className="ml-3 relative">
              <button className="bg-midnight-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight-800 focus:ring-zk-purple">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-privacy-gradient flex items-center justify-center">
                  <span className="text-xs font-mono">ZK</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}