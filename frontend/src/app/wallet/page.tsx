import Navigation from '@/components/layout/Navigation';
import CrossChainWallet from '@/components/payments/CrossChainWallet';

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-midnight-950">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <CrossChainWallet />
      </div>
    </main>
  );
}