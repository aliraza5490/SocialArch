'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import LandingPage from '@/components/pages/landing-page';
import Dashboard from '@/components/pages/dashboard';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LandingPage />;
}
