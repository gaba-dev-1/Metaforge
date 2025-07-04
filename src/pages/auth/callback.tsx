import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/ui/Layout';
import { exchangeCodeForTokens, handleAuthRedirect } from '@/utils/auth';
import { useAuth } from '@/utils/auth/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { refreshUserData } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Add debug log function
  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toISOString().substring(11, 19)}: ${message}`]);
  };
  
  useEffect(() => {
    // Only run when router is ready
    if (!router.isReady) return;
    
    addLog("Router is ready, starting callback processing");
    
    async function processCallback() {
      try {
        // Get code from query
        const { code, error: queryError } = router.query;
        
        addLog(`Query params - code: ${code ? 'present' : 'missing'}, error: ${queryError || 'none'}`);
        
        if (queryError) {
          setError(queryError as string);
          setIsProcessing(false);
          setTimeout(() => router.push('/login'), 3000);
          return;
        }
        
        if (!code || typeof code !== 'string') {
          addLog('Missing authorization code');
          setError('Missing authorization code');
          setIsProcessing(false);
          setTimeout(() => router.push('/login'), 3000);
          return;
        }
        
        // Exchange code for tokens
        addLog('Exchanging code for tokens...');
        try {
          await exchangeCodeForTokens(code);
          addLog('Code exchange successful!');
        } catch (exchangeError) {
          const errorMessage = exchangeError instanceof Error ? exchangeError.message : 'Unknown error';
          addLog(`Code exchange failed: ${errorMessage}`);
          throw exchangeError;
        }
        
        // Update user data in context
        addLog('Refreshing user data...');
        try {
          await refreshUserData();
          addLog('User data refreshed successfully!');
        } catch (refreshError) {
          const errorMessage = refreshError instanceof Error ? refreshError.message : 'Unknown error';
          addLog(`User data refresh failed: ${errorMessage}`);
          throw refreshError;
        }
        
        // Check for redirect after auth
        const redirectPath = handleAuthRedirect();
        addLog(`Redirect path: ${redirectPath || 'none, defaulting to /profile'}`);
        
        // Redirect to profile or redirect path
        addLog(`Redirecting to ${redirectPath || '/profile'}`);
        router.push(redirectPath || '/profile');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        addLog(`Fatal error: ${errorMessage}`);
        setError(errorMessage);
        setIsProcessing(false);
        setTimeout(() => router.push('/login'), 5000);
      }
    }

    processCallback();
  }, [router.isReady, router.query, router, refreshUserData]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-16">
        {error ? (
          <div className="text-center max-w-lg p-6 bg-red-900/20 border border-red-700/50 rounded-lg">
            <div className="text-xl text-red-400 mb-2">Authentication Error</div>
            <p className="text-corona-light mb-4">{error}</p>
            <p className="text-corona-light/60 text-sm">Redirecting to login page...</p>
            <div className="mt-4 w-16 h-1 bg-red-700/50 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-red-500 rounded-full shrink-animation"></div>
            </div>
            
            <style jsx>{`
              .shrink-animation {
                width: 100%;
                animation: shrink 5s linear forwards;
              }
              @keyframes shrink {
                from { width: 100%; }
                to { width: 0%; }
              }
            `}</style>
            
            {/* Debug information */}
            <div className="mt-6 text-left bg-brown-dark/50 p-3 rounded-md text-xs overflow-auto max-h-64">
              <div className="text-red-300 mb-1 font-semibold">Debug information:</div>
              {debugLogs.map((log, i) => (
                <div key={i} className="text-corona-light/80">{log}</div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center max-w-lg p-8 bg-brown/10 backdrop-filter backdrop-blur-sm border border-solar-flare/30 rounded-lg">
            <div className="inline-block h-12 w-12 border-4 border-t-gold border-r-gold/30 border-b-gold/10 border-l-gold/60 rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-corona-light mb-2">Completing authentication...</p>
            <p className="text-corona-light/60 text-sm">Please wait while we authenticate you with Riot Games.</p>
            
            {/* Debug information */}
            <div className="mt-6 text-left bg-brown-dark/50 p-3 rounded-md text-xs overflow-auto max-h-64">
              <div className="text-corona-light mb-1 font-semibold">Auth Progress:</div>
              {debugLogs.map((log, i) => (
                <div key={i} className="text-corona-light/80">{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
