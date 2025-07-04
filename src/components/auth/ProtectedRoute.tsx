import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/auth/AuthContext';
import { setAuthRedirect } from '@/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { auth } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Store current path for redirect after login
      setAuthRedirect(router.asPath);
      router.push('/login');
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);
  
  // If still loading, show a loading state
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-t-gold border-r-gold/30 border-b-gold/10 border-l-gold/60 rounded-full animate-spin"></div>
          <p className="mt-4 text-corona-light">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If authenticated, render children
  if (auth.isAuthenticated) {
    return <>{children}</>;
  }
  
  // Return null if not authenticated (will redirect in useEffect)
  return null;
}
