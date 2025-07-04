import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/ui/Layout';
import { PlayerDetail } from '@/components/entity';
import { ArrowLeft, Loader2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PlayerPage() {
  const router = useRouter();
  const { summonerId, region = 'na1' } = router.query;
  
  const { data: player, isLoading, isError, error } = useQuery({
    queryKey: ['player', summonerId, region],
    queryFn: async () => {
      const response = await fetch(`/api/tft/player/stats?summonerId=${summonerId}&region=${region}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch player data');
      }
      
      const stats = await response.json();
      
      return {
        ...stats,
        rank: 1,
        region: region as string
      };
    },
    enabled: !!summonerId,
    staleTime: 300000
  });
  
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[50vh]">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Loader2 className="h-16 w-16 text-solar-flare animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-display text-stellar-white mb-2">Loading Player Data</h2>
              <p className="text-corona-light/70">Fetching the latest statistics...</p>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (isError || !player) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-16">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="backdrop-filter backdrop-blur-md bg-eclipse-shadow/30 border border-crimson-alert/60 rounded-xl p-8 inline-block">
              <Trophy className="h-16 w-16 mx-auto text-crimson-alert/70 mb-4" />
              <h1 className="text-2xl font-display text-crimson-alert mb-4">Player Not Found</h1>
              <p className="text-corona-light/70 mb-6 max-w-md">
                {(error as Error)?.message || 'Unable to load player data'}
              </p>
              <Link 
                href="/leaderboard" 
                className="inline-flex items-center gap-2 bg-solar-flare hover:bg-solar-flare/90 text-void-core px-6 py-3 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Leaderboard
              </Link>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8">
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link 
            href="/leaderboard" 
            className="inline-flex items-center gap-2 text-corona-light hover:text-solar-flare transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Leaderboard</span>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <PlayerDetail player={player} />
        </motion.div>
      </div>
    </Layout>
  );
}
