import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Award, TrendingUp, Users, Calendar, Clock, Star, Flame, Shield } from 'lucide-react';

interface PlayerDetailProps {
  player: {
    summonerId: string;
    summonerName: string;
    tagLine: string;
    rank: number;
    leaguePoints: number;
    wins: number;
    losses: number;
    tier: string;
    division: string;
    profileIconId?: number;
    region: string;
    hotStreak?: boolean;
    veteran?: boolean;
    freshBlood?: boolean;
    inactive?: boolean;
  };
}

export default function PlayerDetail({ player }: PlayerDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'achievements'>('overview');
  
  const totalGames = player.wins + player.losses;
  const winRate = totalGames > 0 ? ((player.wins / totalGames) * 100).toFixed(1) : '0.0';
  
  const getTierColor = (tier: string) => {
    const colors = {
      IRON: "text-cosmic-dust",
      BRONZE: "text-burning-warning",
      SILVER: "text-cosmic-dust",
      GOLD: "text-solar-flare",
      PLATINUM: "text-corona-light",
      DIAMOND: "text-corona-light",
      MASTER: "text-solar-flare",
      GRANDMASTER: "text-burning-warning",
      CHALLENGER: "text-solar-flare"
    };
    
    return colors[tier as keyof typeof colors] || "text-solar-flare";
  };
  
  const tierColor = getTierColor(player.tier);

  return (
    <div className="space-y-8">
      {/* Main Header */}
      <motion.div 
        className="bg-eclipse-shadow/90 backdrop-blur-sm border border-solar-flare/40 rounded-xl p-8 shadow-eclipse"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-void-core/60 border-3 border-solar-flare/60 shadow-solar">
              <img 
                src={player.profileIconId 
                  ? `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${player.profileIconId}.png` 
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
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-solar-flare text-void-core text-sm font-bold px-4 py-2 rounded-full shadow-solar">
              #{player.rank}
            </div>
          </div>
          
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-display text-stellar-white mb-4 drop-shadow-md">
              {player.summonerName}
              {player.tagLine && (
                <span className="text-xl text-corona-light/80 ml-3">#{player.tagLine}</span>
              )}
            </h1>
            
            <div className={`text-2xl font-bold ${tierColor} mb-6 drop-shadow-sm`}>
              {player.tier} {player.division} • {player.leaguePoints.toLocaleString()} LP
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm">
              <div className="bg-void-core/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-solar-flare/20">
                <span className="text-corona-light/70">Region: </span>
                <span className="text-solar-flare font-medium">{player.region.toUpperCase()}</span>
              </div>
              <div className="bg-void-core/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-solar-flare/20">
                <span className="text-corona-light/70">Win Rate: </span>
                <span className="text-solar-flare font-medium">{winRate}%</span>
              </div>
              <div className="bg-void-core/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-solar-flare/20">
                <span className="text-corona-light/70">Games: </span>
                <span className="text-stellar-white font-medium">{totalGames}</span>
              </div>
            </div>
            
            {(player.hotStreak || player.veteran || player.freshBlood) && (
              <div className="flex gap-3 justify-center lg:justify-start mt-6">
                {player.hotStreak && (
                  <span className="text-sm bg-burning-warning/30 text-burning-warning border border-burning-warning/40 px-3 py-1 rounded-full font-medium">
                    🔥 Hot Streak
                  </span>
                )}
                {player.veteran && (
                  <span className="text-sm bg-cosmic-dust/20 text-cosmic-dust border border-cosmic-dust/40 px-3 py-1 rounded-full font-medium">
                    ⭐ Veteran
                  </span>
                )}
                {player.freshBlood && (
                  <span className="text-sm bg-corona-light/20 text-corona-light border border-corona-light/40 px-3 py-1 rounded-full font-medium">
                    ⚡ Fresh Blood
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {[
          { 
            icon: Target, 
            label: "Win Rate", 
            value: `${winRate}%`,
            subValue: `${player.wins}W / ${player.losses}L`,
            color: parseFloat(winRate) >= 60 ? "text-solar-flare" : parseFloat(winRate) >= 50 ? "text-corona-light" : "text-burning-warning"
          },
          { 
            icon: Award, 
            label: "Victories", 
            value: player.wins.toString(),
            subValue: "Total wins",
            color: "text-solar-flare"
          },
          { 
            icon: TrendingUp, 
            label: "League Points", 
            value: player.leaguePoints.toLocaleString(),
            subValue: player.tier,
            color: "text-solar-flare"
          },
          { 
            icon: Trophy, 
            label: "Ranking", 
            value: `#${player.rank}`,
            subValue: `In ${player.region.toUpperCase()}`,
            color: "text-stellar-white"
          }
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="bg-eclipse-shadow/90 backdrop-blur-sm border border-solar-flare/30 rounded-xl p-6 text-center hover:border-solar-flare/50 transition-all shadow-solar hover:shadow-eclipse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <stat.icon className="h-8 w-8 text-solar-flare mx-auto mb-4" />
            <div className="text-sm text-corona-light/80 mb-2 font-medium">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
            <div className="text-xs text-cosmic-dust">{stat.subValue}</div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Tabs Section */}
      <motion.div 
        className="bg-eclipse-shadow/90 backdrop-blur-sm border border-solar-flare/40 rounded-xl overflow-hidden shadow-eclipse"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="border-b border-solar-flare/30">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'achievements', label: 'Achievements', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center gap-3 px-8 py-5 transition-all text-sm font-medium ${
                  activeTab === tab.id
                    ? 'text-solar-flare border-b-3 border-solar-flare bg-solar-flare/10'
                    : 'text-corona-light/70 hover:text-solar-flare hover:bg-void-core/30'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-10">
          {activeTab === 'overview' && (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-solar-flare/20 rounded-full border-2 border-solar-flare/40 flex items-center justify-center">
                <Users className="h-12 w-12 text-solar-flare" />
              </div>
              <h3 className="text-2xl font-display text-stellar-white mb-4">
                Player Overview
              </h3>
              <p className="text-corona-light/70 max-w-md mx-auto">
                Comprehensive player statistics, match patterns, and performance insights coming soon.
              </p>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-solar-flare/20 rounded-full border-2 border-solar-flare/40 flex items-center justify-center">
                <TrendingUp className="h-12 w-12 text-solar-flare" />
              </div>
              <h3 className="text-2xl font-display text-stellar-white mb-4">
                Advanced Analytics
              </h3>
              <p className="text-corona-light/70 max-w-md mx-auto">
                Detailed performance metrics, trends over time, and personalized recommendations coming soon.
              </p>
            </div>
          )}
          
          {activeTab === 'achievements' && (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-solar-flare/20 rounded-full border-2 border-solar-flare/40 flex items-center justify-center">
                <Award className="h-12 w-12 text-solar-flare" />
              </div>
              <h3 className="text-2xl font-display text-stellar-white mb-4">
                Achievements & Milestones
              </h3>
              <p className="text-corona-light/70 max-w-md mx-auto">
                Unlock badges, track milestones, and celebrate your TFT journey coming soon.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
