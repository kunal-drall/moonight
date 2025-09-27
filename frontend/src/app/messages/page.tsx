import Navigation from '@/components/layout/Navigation';
import EncryptedMessaging from '@/components/messaging/EncryptedMessaging';

export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-midnight-950">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <EncryptedMessaging />
      </div>
    </main>
  );
}