import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/ui/Layout';
import { 
  Trophy, TrendingUp, Target, Award, Calendar, Clock, Loader2, RefreshCw, ChevronRight, Star, Zap, Shield
} from 'lucide-react';
import { useAuth } from '@/utils/auth/AuthContext';
import { PlayerStats as PlayerStatsType, MatchHistoryEntry } from '@/types/auth';
import LoginButton from '@/components/auth/LoginButton';
import { MatchDetail } from '@/components/entity';

const FeatureBanner = ({ title }: { title: string }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        <div className="h-1 flex-grow bg-gradient-to-r from-transparent via-solar-flare/20 to-solar-flare/50 mr-3"></div>
        <div className="bg-eclipse-shadow/70 backdrop-blur-md border-b-2 border-solar-flare rounded-lg px-8 py-3 shadow-solar">
          <h2 className="text-2xl font-display text-solar-flare text-center">{title}</h2>
        </div>
        <div className="h-1 flex-grow bg-gradient-to-l from-transparent via-solar-flare/20 to-solar-flare/50 ml-3"></div>
      </div>
    </div>
  );
};

const LoginCTA = () => {
  return (
    <div className="space-y-8">
      <motion.div 
        className="relative overflow-hidden rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-eclipse-shadow to-void-core opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/assets/app/learn_banner.jpg')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 border border-solar-flare/30 rounded-xl"></div>
        
        <div className="relative z-10 px-8 py-16 text-center">
          <motion.h1 
            className="text-4xl font-display text-stellar-white mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="text-gold font-display tracking-tight">Begin your</span>{' '}
            <span className="text-corona-light/90">Journey</span>
          </motion.h1>
          
          <motion.p 
            className="text-corona-light/80 max-w-2xl mx-auto mb-8 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Connect your Riot account to access detailed match analysis, personal statistics, and climb tracking.
          </motion.p>
          
          <motion.div
            className="flex justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <LoginButton 
              label="Connect Riot Account" 
              size="lg" 
              variant="primary"
              className="px-10 py-4 text-lg"
            />
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div 
        className="backdrop-filter backdrop-blur-md bg-eclipse-shadow/30 border border-solar-flare/30 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-display text-stellar-white">What You'll Access</h3>
            <p className="text-corona-light/70 text-sm mt-2">Unlock powerful insights with your Riot account</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Trophy, title: "Rank Tracking", desc: "Monitor your climb and LP gains through every season" },
              { icon: Clock, title: "Match History", desc: "Analyze every game with detailed post-match insights" },
              { icon: TrendingUp, title: "Performance", desc: "Discover patterns and improvement opportunities" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-solar-flare/20 to-burning-warning/10 rounded-full border border-solar-flare/30 flex items-center justify-center group-hover:border-solar-flare/60 transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="h-8 w-8 text-solar-flare" />
                </div>
                
                <h3 className="text-xl font-display text-stellar-white mb-3 group-hover:text-solar-flare transition-colors">
                  {feature.title}
                </h3>
                <p className="text-corona-light/70 text-sm leading-relaxed max-w-xs mx-auto">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PlayerProfileHeader = ({ user, isLoading }: { user: any; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-eclipse-shadow/30 backdrop-blur-md border border-solar-flare/30 p-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-void-core/40 rounded-xl animate-pulse"></div>
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-void-core/40 rounded w-64 animate-pulse"></div>
            <div className="h-5 bg-void-core/40 rounded w-40 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div 
      className="relative overflow-hidden rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-eclipse-shadow to-void-core opacity-95"></div>
      <div className="absolute inset-0 bg-[url('/assets/app/fight_banner.jpg')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 border border-solar-flare/30 rounded-xl"></div>
      
      <div className="relative z-10 p-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-24 h-24 rounded-xl border-2 border-solar-flare/60 overflow-hidden bg-void-core/60 backdrop-blur-sm">
              <img 
                src={user.profileIconId 
                  ? `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${user.profileIconId}.png` 
                  : '/assets/app/default-avatar.png'
                } 
                alt="Profile Icon" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/app/default-avatar.png';
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-solar-flare text-void-core text-sm font-bold px-3 py-1 rounded-full">
              Lv. {user.summonerLevel || '?'}
            </div>
          </motion.div>
          
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-display text-stellar-white mb-3">
              {user.gameName || user.summonerName || 'Tactician'}
              {user.tagLine && (
                <span className="text-corona-light/70 font-normal text-xl ml-2">#{user.tagLine}</span>
              )}
            </h1>
            
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {user.region && (
                <div className="bg-void-core/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-solar-flare/20">
                  <span className="text-corona-light/70">Region: </span>
                  <span className="text-solar-flare font-medium">{user.region.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PlayerStatsCards = ({ stats, isLoading }: { stats: PlayerStatsType | null; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center animate-pulse">
            <div className="w-16 h-16 bg-void-core/40 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-void-core/40 rounded mb-2 w-20 mx-auto"></div>
            <div className="h-6 bg-void-core/40 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <motion.div 
        className="text-center py-16"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-solar-flare/20 to-burning-warning/10 rounded-full border border-solar-flare/30 flex items-center justify-center">
          <Trophy className="h-8 w-8 text-solar-flare/50" />
        </div>
        <h3 className="text-xl font-display text-stellar-white mb-2">No Ranked Stats Yet</h3>
        <p className="text-corona-light/70">
          Play some ranked TFT games to see your statistics here!
        </p>
      </motion.div>
    );
  }

  const winRate = ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1);
  
  const statCards = [
    { 
      icon: Trophy, 
      label: "Current Rank", 
      value: `${stats.tier} ${stats.rank}`,
      subValue: `${stats.leaguePoints} LP`,
      color: "text-solar-flare"
    },
    { 
      icon: Target, 
      label: "Win Rate", 
      value: `${winRate}%`,
      subValue: `${stats.wins}W ${stats.losses}L`,
      color: parseFloat(winRate) >= 60 ? "text-verdant-success" : parseFloat(winRate) >= 50 ? "text-solar-flare" : "text-burning-warning"
    },
    { 
      icon: Award, 
      label: "Total Games", 
      value: (stats.wins + stats.losses).toString(),
      subValue: `${stats.wins} wins`,
      color: "text-corona-light"
    },
    { 
      icon: Star, 
      label: "Hot Streak", 
      value: stats.hotStreak ? "Active" : "Inactive",
      subValue: stats.veteran ? "Veteran" : "Climbing",
      color: stats.hotStreak ? "text-burning-warning" : "text-corona-light/70"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
      {statCards.map((stat, i) => (
        <motion.div
          key={i}
          className="text-center group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          whileHover={{ y: -5 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-solar-flare/20 to-burning-warning/10 rounded-full border border-solar-flare/30 flex items-center justify-center group-hover:border-solar-flare/60 transition-all duration-300 group-hover:scale-110">
            <stat.icon className="h-6 w-6 text-solar-flare" />
          </div>
          
          <div className="text-sm text-corona-light/70 mb-2">{stat.label}</div>
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
          {stat.subValue && (
            <div className="text-xs text-corona-light/60">{stat.subValue}</div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

const MatchHistory = ({ matches, isLoading }: { matches: MatchHistoryEntry[]; isLoading: boolean }) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchHistoryEntry | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-eclipse-shadow/30 rounded-xl p-4 border border-solar-flare/20 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-void-core/40 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-void-core/40 rounded w-32"></div>
                  <div className="h-3 bg-void-core/40 rounded w-24"></div>
                </div>
              </div>
              <div className="h-8 bg-void-core/40 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!matches?.length) {
    return (
      <motion.div 
        className="text-center py-16"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-solar-flare/20 to-burning-warning/10 rounded-full border border-solar-flare/30 flex items-center justify-center">
          <Clock className="h-8 w-8 text-solar-flare/50" />
        </div>
        <h3 className="text-xl font-display text-stellar-white mb-2">No Recent Matches</h3>
        <p className="text-corona-light/70">
          Play some TFT games to see your match history here!
        </p>
      </motion.div>
    );
  }

  const getPlacementColor = (placement: number) => {
    if (placement === 1) return 'text-solar-flare bg-solar-flare/20';
    if (placement <= 4) return 'text-verdant-success bg-verdant-success/20';
    return 'text-burning-warning bg-burning-warning/20';
  };

  return (
    <>
      <div className="space-y-3">
        {matches.map((match, index) => {
          const placementColor = getPlacementColor(match.placement || 8);
          const gameDuration = Math.floor((match.gameDuration || 0) / 60);
          const gameDate = new Date(match.gameCreation || Date.now()).toLocaleDateString();
          
          return (
            <motion.div 
              key={match.matchId}
              className="backdrop-filter backdrop-blur-md bg-eclipse-shadow/30 rounded-xl p-4 border border-solar-flare/20 hover:border-solar-flare/40 transition-all cursor-pointer group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onClick={() => setSelectedMatch(match)}
              whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.1)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${placementColor} border border-current/30 flex items-center justify-center font-bold text-lg`}>
                    #{match.placement || 8}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 text-sm text-corona-light">
                      <span className="font-medium">{gameDate}</span>
                      <span className="text-corona-light/50">•</span>
                      <span className="text-corona-light/70">{gameDuration} min</span>
                      <span className="text-corona-light/50">•</span>
                      <span className="text-corona-light/70">Level {match.level || 1}</span>
                    </div>
                    <div className="text-xs text-corona-light/60 mt-1">
                      {match.gameType || 'Standard'} • {match.traits?.filter(t => t.style >= 1).length || 0} active traits
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-xs text-corona-light/70">View Details</div>
                  <ChevronRight className="h-4 w-4 text-corona-light/40 group-hover:text-solar-flare transition-colors" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedMatch && (
          <motion.div 
            className="fixed inset-0 bg-void-core/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMatch(null)}
          >
            <motion.div 
              className="bg-eclipse-shadow/95 backdrop-blur-md rounded-xl border border-solar-flare/40 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display text-stellar-white">Match Analysis</h2>
                  <button 
                    onClick={() => setSelectedMatch(null)}
                    className="bg-void-core/60 hover:bg-void-core/80 text-corona-light px-4 py-2 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
                <MatchDetail match={selectedMatch} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const UserDashboard = () => {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'matches'>('overview');
  
  const {
    data: playerStats,
    isLoading: isLoadingStats,
    refetch: refetchStats
  } = useQuery<PlayerStatsType>({
    queryKey: ['playerStats', auth.user?.summonerId, auth.user?.region],
    queryFn: async () => {
      if (!auth.user?.summonerId) throw new Error('Summoner ID not found');
      
      const response = await fetch(
        `/api/tft/player/stats?summonerId=${auth.user.summonerId}&region=${auth.user.region || 'na1'}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch stats (${response.status})`);
      }
      
      return response.json();
    },
    enabled: !!auth.user?.summonerId && auth.isAuthenticated,
    staleTime: 300000,
    retry: 2
  });
  
  const {
    data: matchHistory,
    isLoading: isLoadingMatches,
    refetch: refetchMatches
  } = useQuery<MatchHistoryEntry[]>({
    queryKey: ['matchHistory', auth.user?.puuid, auth.user?.region],
    queryFn: async () => {
      if (!auth.user?.puuid) throw new Error('PUUID not found');
      
      const routingRegion = auth.user.region === 'kr' || auth.user.region === 'jp1' ? 'asia' : 
                           auth.user.region === 'euw1' || auth.user.region === 'eun1' ? 'europe' :
                           auth.user.region === 'oc1' ? 'sea' : 'americas';
      
      const response = await fetch(
        `/api/tft/player/matches?puuid=${auth.user.puuid}&region=${routingRegion}&count=10`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch matches (${response.status})`);
      }
      
      return response.json();
    },
    enabled: !!auth.user?.puuid && auth.isAuthenticated,
    staleTime: 300000,
    retry: 2
  });
  
  return (
    <div className="space-y-8">
      <PlayerProfileHeader user={auth.user} isLoading={auth.isLoading} />
      
      <div>
        <FeatureBanner title="Performance Overview" />
        <PlayerStatsCards stats={playerStats || null} isLoading={isLoadingStats} />
      </div>
      
      <div className="backdrop-filter backdrop-blur-md bg-eclipse-shadow/30 rounded-xl border border-solar-flare/30 overflow-hidden">
        <div className="border-b border-solar-flare/30">
          <div className="flex">
            {[
              { id: 'overview', label: 'Analytics', icon: TrendingUp },
              { id: 'matches', label: 'Match History', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center gap-2 px-6 py-4 transition-all ${
                  activeTab === tab.id
                    ? 'text-solar-flare border-b-2 border-solar-flare bg-solar-flare/10'
                    : 'text-corona-light hover:text-solar-flare/70 hover:bg-void-core/30'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-solar-flare/20 to-burning-warning/10 rounded-full border border-solar-flare/30 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-solar-flare/50" />
                </div>
                <h3 className="text-xl font-display text-stellar-white mb-2">
                  Advanced Analytics Coming Soon
                </h3>
                <p className="text-corona-light/70">
                  Detailed performance insights, trends, and recommendations will be available here.
                </p>
              </motion.div>
            )}
            
            {activeTab === 'matches' && (
              <motion.div
                key="matches"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-display text-stellar-white">Recent Matches</h3>
                  <button 
                    className="flex items-center gap-2 text-corona-light hover:text-solar-flare transition-colors"
                    onClick={() => refetchMatches()}
                    disabled={isLoadingMatches}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingMatches ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                
                <MatchHistory matches={matchHistory || []} isLoading={isLoadingMatches} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { auth } = useAuth();
  
  return (
    <Layout title="Profile">
      <div className="max-w-6xl mx-auto py-8">
        {!auth.isAuthenticated && !auth.isLoading ? (
          <LoginCTA />
        ) : (
          auth.isAuthenticated && <UserDashboard />
        )}
      </div>
    </Layout>
  );
}
