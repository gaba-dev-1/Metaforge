import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ErrorBanner } from '@/components/common';
import type { AppProps } from 'next/app';
import { ErrorState } from '@/types';
import { AuthProvider } from '@/utils/auth/AuthContext'; // Add AuthProvider import
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        console.error('Query error:', error);
      }
    }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 2,
        staleTime: 300000,
      }
    }
  }));
  
  const [globalError, setGlobalError] = useState<ErrorState | null>(null);
  
  // Global error handling
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      setGlobalError({
        hasError: true,
        error: {
          type: 'unknown',
          message: event.error?.message || 'An unexpected error occurred',
          timestamp: new Date()
        }
      });
      
      // Clear error after 5 seconds
      setTimeout(() => setGlobalError(null), 5000);
    };
    
    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {globalError && (
            <div className="fixed top-16 left-0 right-0 z-50 mx-auto max-w-3xl px-4">
              <ErrorBanner error={globalError} />
            </div>
          )}
          <Component {...pageProps} />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
