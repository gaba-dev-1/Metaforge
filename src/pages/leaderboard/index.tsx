import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Layout from '@/components/ui/Layout';
import { Search, RefreshCw, Trophy } from 'lucide-react';
import RegionFilter from '@/components/leaderboard/RegionFilter';
import TopPlayers from '@/components/leaderboard/TopPlayers';
import { LeaderboardEntry } from '@/types/auth';

const FeatureBanner = ({ title }: { title: string }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        <div className="h-1 flex-grow bg-gradient-to-r from-transparent via-solar-flare/20 to-solar-flare/50 mr-3"></div>
        <div className="bg-eclipse-shadow/90 backdrop-blur-sm border-b-3 border-solar-flare rounded-lg px-8 py-4 shadow-solar">
          <h2 className="text-2xl font-display text-solar-flare text-center">{title}</h2>
        </div>
        <div className="h-1 flex-grow bg-gradient-to-l from-transparent via-solar-flare/20 to-solar-flare/50 ml-3"></div>
      </div>
    </div>
  );
};

export default function LeaderboardPage() {
  const [activeRegion, setActiveRegion] = useState('na1');
  const [search, setSearch] = useState('');
  
  const regions = [
    { id: 'na1', name: 'NA' },
    { id: 'euw1', name: 'EUW' },
    { id: 'kr', name: 'KR' },
    { id: 'eun1', name: 'EUNE' },
    { id: 'br1', name: 'BR' },
    { id: 'jp1', name: 'JP' },
    { id: 'la1', name: 'LAN' },
    { id: 'la2', name: 'LAS' },
    { id: 'tr1', name: 'TR' },
    { id: 'ru', name: 'RU' },
    { id: 'oc1', name: 'OCE' }
  ];
  
  // Global leader query - cached for longer
  const {
    data: globalLeader,
    isLoading: isLoadingGlobal
  } = useQuery({
    queryKey: ['globalLeaderboard'],
    queryFn: async () => {
      const response = await fetch('/api/tft/leaderboard/global');
      if (!response.ok) throw new Error('Failed to fetch global leader');
      return response.json();
    },
    staleTime: 600000, // 10 minutes
    retry: 1
  });
  
  // Main leaderboard query - optimized for speed
  const {
    data: leaderboard,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', activeRegion],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      try {
        const response = await fetch(`/api/tft/leaderboard?region=${activeRegion}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch leaderboard data (${response.status})`);
        }
        
        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    staleTime: 180000, // 3 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  
  const filteredPlayers = useMemo(() => {
    if (!leaderboard || !search.trim()) return leaderboard || [];
    
    const searchLower = search.toLowerCase().trim();
    return leaderboard.filter(player => 
      player.summonerName.toLowerCase().includes(searchLower) ||
      (player.tagLine && player.tagLine.toLowerCase().includes(searchLower))
    );
  }, [leaderboard, search]);
  
  const stats = useMemo(() => {
    if (!leaderboard?.length) return null;
    
    const topLocal = leaderboard[0];
    const totalGames = leaderboard.reduce((sum, player) => sum + player.wins + player.losses, 0);
    const avgLP = Math.round(leaderboard.reduce((sum, player) => sum + player.leaguePoints, 0) / leaderboard.length);
    
    return { 
      globalLeader, 
      topLocal, 
      totalGames, 
      avgLP,
      playerCount: leaderboard.length 
    };
  }, [leaderboard, globalLeader]);

  return (
    <Layout title="Leaderboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div 
          className="relative overflow-hidden rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-void-core via-eclipse-shadow to-void-core opacity-65"></div>
          <div className="absolute inset-0 bg-[url('/assets/app/fight_banner.jpg')] bg-cover bg-center opacity-15"></div>
          <div className="absolute inset-0 border border-solar-flare/40 rounded-xl"></div>
          
          <div className="relative z-10 px-8 py-16 text-center">
            <motion.h1 
              className="text-3xl md:text-4xl font-display mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span className="text-solar-flare">Global</span>{' '}
              <span className="text-stellar-white">Leaderboard</span>
            </motion.h1>
            
            <motion.p 
              className="text-corona-light/80 max-w-2xl mx-auto text-lg mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Track the highest ranked TFT players across all regions and see where you stand in the competitive arena.
            </motion.p>
            
            {stats && (
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <motion.div 
                  className="bg-void-core/80 backdrop-blur-sm border border-solar-flare/30 rounded-lg p-4 text-center hover:border-solar-flare/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-lg font-bold text-stellar-white">
                    {isLoadingGlobal ? '...' : (globalLeader ? `${globalLeader.leaguePoints.toLocaleString()} LP` : 'N/A')}
                  </div>
                  <div className="text-xs text-corona-light/70">
                    {isLoadingGlobal ? 'Loading...' : (globalLeader ? `${globalLeader.summonerName} (${globalLeader.region})` : 'Top Global')}
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-void-core/80 backdrop-blur-sm border border-solar-flare/30 rounded-lg p-4 text-center hover:border-solar-flare/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-lg font-bold text-stellar-white">
                    {stats.topLocal ? `${stats.topLocal.leaguePoints.toLocaleString()} LP` : 'N/A'}
                  </div>
                  <div className="text-xs text-corona-light/70">
                    {stats.topLocal ? `${stats.topLocal.summonerName} (${activeRegion.toUpperCase()})` : 'Top Local'}
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-void-core/80 backdrop-blur-sm border border-solar-flare/30 rounded-lg p-4 text-center hover:border-solar-flare/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-lg font-bold text-stellar-white">
                    {stats.avgLP.toLocaleString()}
                  </div>
                  <div className="text-xs text-corona-light/70">Avg LP</div>
                </motion.div>

                <motion.div 
                  className="bg-void-core/80 backdrop-blur-sm border border-solar-flare/30 rounded-lg p-4 text-center hover:border-solar-flare/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-lg font-bold text-stellar-white">
                    {stats.totalGames.toLocaleString()}
                  </div>
                  <div className="text-xs text-corona-light/70">Total Games</div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {/* Main Content */}
        <motion.div 
          className="bg-eclipse-shadow/60 backdrop-blur-sm border border-solar-flare/40 rounded-xl overflow-hidden shadow-eclipse"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="p-6 border-b border-solar-flare/30">
            <div className="space-y-6">
              <RegionFilter 
                regions={regions} 
                activeRegion={activeRegion} 
                onChange={setActiveRegion}
                isLoading={isFetching}
              />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="text-corona-light/50 h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or tag..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-void-core/60 backdrop-blur-sm border border-solar-flare/30 rounded-lg text-sm focus:outline-none focus:border-solar-flare/60 text-corona-light placeholder-corona-light/50 transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-corona-light/50 hover:text-corona-light"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                <motion.button 
                  className="flex items-center gap-2 text-corona-light/70 hover:text-solar-flare text-sm px-4 py-3 rounded-lg hover:bg-void-core/30 border border-solar-flare/30 transition-all disabled:opacity-50"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                  <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
                </motion.button>
              </div>
              
              {search && filteredPlayers && (
                <div className="text-sm text-corona-light/70">
                  Found {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''} matching "{search}"
                </div>
              )}
            </div>
          </div>
          
          {isError ? (
            <motion.div 
              className="p-8 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="bg-crimson-alert/20 border border-crimson-alert/60 rounded-lg p-6">
                <Trophy className="h-16 w-16 mx-auto text-crimson-alert/70 mb-4" />
                <div className="text-crimson-alert text-lg font-medium mb-2">
                  Unable to Load Leaderboard
                </div>
                <p className="text-corona-light/80 mb-4">
                  {(error as Error)?.message || 'Failed to load leaderboard data'}
                </p>
                <motion.button 
                  onClick={() => refetch()} 
                  className="bg-crimson-alert hover:bg-crimson-alert/90 text-white px-6 py-3 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="h-4 w-4 mr-2 inline" />
                  Try Again
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <TopPlayers 
              players={filteredPlayers} 
              isLoading={isLoading}
              region={activeRegion}
            />
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
