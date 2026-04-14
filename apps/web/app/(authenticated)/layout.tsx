'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: 'include',
        });
        if (!response.ok) {
          router.push('/');
          return;
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">PREDEM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <button
                onClick={async () => {
                  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                    method: 'POST',
                    credentials: 'include',
                  });
                  router.push('/');
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
