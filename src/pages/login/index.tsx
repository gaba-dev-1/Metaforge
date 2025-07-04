import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import Layout from '@/components/ui/Layout';
import { getRSOAuthUrl, setAuthRedirect } from '@/utils/auth';
import { useAuth } from '@/utils/auth/AuthContext';

export default function LoginPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const { error: queryError } = router.query;
  
  useEffect(() => {
    // Redirect to home page if already authenticated
    if (auth.isAuthenticated && !auth.isLoading) {
      router.push('/profile');
    }
    
    // Store the return path if it exists
    const returnPath = router.query.returnTo as string;
    if (returnPath && returnPath !== '/login') {
      setAuthRedirect(returnPath);
    }
  }, [auth.isAuthenticated, auth.isLoading, router]);
  
  // If loading auth state, show a loading state
  if (auth.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block h-12 w-12 border-4 border-t-gold border-r-gold/30 border-b-gold/10 border-l-gold/60 rounded-full animate-spin"></div>
            <p className="mt-4 text-corona-light">Checking authentication status...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  const handleLogin = () => {
    window.location.href = getRSOAuthUrl();
  };
  
  return (
    <Layout title="Login">
      <div className="mt-10">
        {/* Banner with background image like homepage */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-eclipse-shadow to-void-core opacity-90 z-0 rounded-xl"></div>
          <div className="absolute inset-0 bg-[url('/assets/app/learn_banner.jpg')] bg-cover bg-center opacity-20 z-0 rounded-xl"></div>
          <div className="absolute inset-0 rounded-xl border border-solar-flare/30 z-10"></div>
          
          <div className="relative z-20 px-6 py-8 flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-4xl font-display mb-2">
              <span className="text-solar-flare">Join</span> <span className="text-white">The Tacticians</span>
            </h1>
            <p className="text-corona-light/90 max-w-lg mx-auto">
              Sign in with your Riot account to access personalized content, track your progress, and climb the leaderboard.
            </p>
          </div>
        </div>
        
        {/* Login Card with Glass Effect */}
        <div className="max-w-md mx-auto backdrop-filter backdrop-blur-md bg-eclipse-shadow/30 rounded-xl overflow-hidden border border-solar-flare/30 p-6">
          <div className="flex flex-col items-center">
            {/* Logo without circle */}
            <img 
              src="/assets/app/app.png" 
              alt="MetaForge" 
              className="w-24 h-24 mb-6" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/app/default.png';
              }}
            />
            
            <h2 className="text-xl text-gold mb-4">Connect Your Riot Account</h2>
            
            <p className="text-corona-light mb-6 text-center">
              Track your TFT performance, save your favorite comps, and unlock premium features customized to your playstyle.
            </p>
            
            {(auth.error || queryError) && (
              <div className="bg-red-950/80 border border-red-500/50 text-red-200 p-3 rounded-md mb-6 w-full">
                {auth.error || queryError}
              </div>
            )}
            
            <motion.button
              onClick={handleLogin}
              className="relative flex items-center justify-center gap-2 px-8 py-3 w-full bg-solar-flare text-brown-dark rounded-md font-medium overflow-hidden"
              whileHover={{ 
                scale: 1.03, 
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background glow effect */}
              <motion.div 
                className="absolute inset-0 bg-white opacity-0 rounded-md"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.2 }}
                transition={{ duration: 0.3 }}
              />
              
              <LogIn size={20} />
              <span>Sign in with Riot</span>
            </motion.button>
            
            <div className="mt-6 text-xs text-corona-light/60 text-center">
              By signing in, you agree to our <a href="/terms" className="text-solar-flare hover:underline">Terms of Service</a> and <a href="/privacy" className="text-solar-flare hover:underline">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
