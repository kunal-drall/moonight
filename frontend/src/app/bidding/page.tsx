import Navigation from '@/components/layout/Navigation';
import AnonymousBiddingInterface from '@/components/bidding/AnonymousBiddingInterface';

export default function BiddingPage() {
  return (
    <main className="min-h-screen bg-midnight-950">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <AnonymousBiddingInterface />
      </div>
    </main>
  );
}