import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, ExternalLink, Trophy, Crown, Medal } from 'lucide-react';
import { useRouter } from 'next/router';
import { LeaderboardEntry } from '@/types/auth';

interface TopPlayersProps {
  players: LeaderboardEntry[];
  isLoading: boolean;
  region: string;
}

type SortField = 'rank' | 'leaguePoints' | 'wins' | 'losses' | 'winRate';
type SortDirection = 'asc' | 'desc';

export default function TopPlayers({ players, isLoading, region }: TopPlayersProps) {
  const router = useRouter();
  const [sort, setSort] = useState<SortField>('rank');
  const [direction, setDirection] = useState<SortDirection>('asc');
  
  const sortedPlayers = useMemo(() => {
    if (!players?.length) return [];
    
    return [...players].sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sort) {
        case 'winRate':
          aVal = a.wins + a.losses > 0 ? (a.wins / (a.wins + a.losses)) * 100 : 0;
          bVal = b.wins + b.losses > 0 ? (b.wins / (b.wins + b.losses)) * 100 : 0;
          break;
        default:
          aVal = a[sort] as number;
          bVal = b[sort] as number;
      }
      
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [players, sort, direction]);
  
  const handleSort = (field: SortField) => {
    if (field === sort) {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setDirection(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const handlePlayerClick = (player: LeaderboardEntry) => {
    router.push(`/player/${player.summonerId}?region=${region}`);
  };
  
  const getTierStyling = (tier: string, rank: number) => {
    const baseColors = {
      IRON: { text: "text-cosmic-dust", bg: "bg-cosmic-dust/10", border: "border-cosmic-dust/30" },
      BRONZE: { text: "text-burning-warning", bg: "bg-burning-warning/10", border: "border-burning-warning/30" },
      SILVER: { text: "text-cosmic-dust", bg: "bg-cosmic-dust/10", border: "border-cosmic-dust/30" },
      GOLD: { text: "text-solar-flare", bg: "bg-solar-flare/10", border: "border-solar-flare/30" },
      PLATINUM: { text: "text-corona-light", bg: "bg-corona-light/10", border: "border-corona-light/30" },
      DIAMOND: { text: "text-corona-light", bg: "bg-corona-light/10", border: "border-corona-light/30" },
      MASTER: { text: "text-solar-flare", bg: "bg-solar-flare/10", border: "border-solar-flare/30" },
      GRANDMASTER: { text: "text-burning-warning", bg: "bg-burning-warning/10", border: "border-burning-warning/30" },
      CHALLENGER: { text: "text-solar-flare", bg: "bg-solar-flare/10", border: "border-solar-flare/30" }
    };
    
    const styling = baseColors[tier as keyof typeof baseColors] || baseColors.CHALLENGER;
    
    const getSpecialIcon = () => {
      if (rank === 1) return <Crown className="h-5 w-5 text-solar-flare" />;
      if (rank === 2) return <Medal className="h-5 w-5 text-cosmic-dust" />;
      if (rank === 3) return <Trophy className="h-5 w-5 text-burning-warning" />;
      return null;
    };
    
    return {
      ...styling,
      specialIcon: getSpecialIcon()
    };
  };
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-3">
          <div className="text-sm text-corona-light mb-4">Loading players...</div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-void-core/40 backdrop-blur-sm border border-solar-flare/20 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-5 w-8 bg-void-core/60 rounded"></div>
                  <div className="h-5 w-48 bg-void-core/60 rounded"></div>
                </div>
                <div className="flex gap-4">
                  <div className="h-5 w-16 bg-void-core/60 rounded"></div>
                  <div className="h-5 w-16 bg-void-core/60 rounded"></div>
                  <div className="h-5 w-16 bg-void-core/60 rounded"></div>
                  <div className="h-5 w-16 bg-void-core/60 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!players?.length) {
    return (
      <div className="p-8 text-center">
        <Trophy className="h-16 w-16 mx-auto text-solar-flare/50 mb-4" />
        <h3 className="text-xl font-display text-stellar-white mb-2">No Players Found</h3>
        <p className="text-corona-light/70">
          This region might not have ranked players yet, or there might be an issue loading the data.
        </p>
      </div>
    );
  }
  
  const columns = [
    { id: 'leaguePoints', name: 'LP', sortable: true },
    { id: 'wins', name: 'Wins', sortable: true },
    { id: 'losses', name: 'Losses', sortable: true },
    { id: 'winRate', name: 'WR%', sortable: true }
  ];
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="border-b border-solar-flare/30 pb-4 mb-6">
        <div className="flex items-center justify-between px-4">
          <div className="w-2/5 text-corona-light font-medium">
            Player ({sortedPlayers.length})
          </div>
          <div className="w-3/5 flex gap-2 lg:gap-4">
            {columns.map(column => (
              <button 
                key={column.id} 
                className={`flex items-center justify-end w-1/4 text-sm transition-colors font-medium ${
                  sort === column.id ? 'text-solar-flare' : 'text-corona-light/70 hover:text-corona-light'
                } ${column.sortable ? 'cursor-pointer' : ''}`}
                onClick={() => column.sortable && handleSort(column.id as SortField)}
                disabled={!column.sortable}
              >
                {column.name}
                {column.sortable && sort === column.id && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {direction === 'asc' ? 
                      <ArrowUp className="ml-1 h-3 w-3" /> : 
                      <ArrowDown className="ml-1 h-3 w-3" />
                    }
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Player List */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, staggerChildren: 0.02 }}
      >
        {sortedPlayers.map((player, index) => {
          const styling = getTierStyling(player.tier, player.rank);
          const winRate = player.wins + player.losses > 0 
            ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1)
            : '0.0';
          
          return (
            <motion.div 
              key={`${player.summonerId}-${index}`}
              className={`bg-void-core/40 hover:bg-void-core/60 border ${styling.border} rounded-lg p-4 transition-all cursor-pointer group ${styling.bg}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.3 }}
              whileHover={{ 
                scale: 1.01, 
                boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.15)" 
              }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handlePlayerClick(player)}
            >
              <div className="flex items-center justify-between">
                <div className="w-2/5 flex items-center gap-4">
                  <div className="w-16 flex items-center justify-start">
                    <div className="flex items-center gap-1">
                      {styling.specialIcon}
                      <span className={`font-bold text-lg ${styling.text}`}>
                        #{player.rank}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-corona-light truncate flex items-center gap-2">
                      {player.summonerName || "Unknown"}
                      {player.tagLine && (
                        <span className="text-xs text-corona-light/70">
                          #{player.tagLine}
                        </span>
                      )}
                    </div>
                    <div className={`text-sm font-medium ${styling.text} flex items-center gap-2`}>
                      {player.tier} {player.division}
                    </div>
                  </div>
                  
                  <ExternalLink className="h-4 w-4 text-corona-light/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="w-3/5 flex gap-2 lg:gap-4 text-sm">
                  <div className="w-1/4 text-right font-bold text-solar-flare">
                    {player.leaguePoints.toLocaleString()}
                  </div>
                  <div className="w-1/4 text-right text-solar-flare font-medium">
                    {player.wins}
                  </div>
                  <div className="w-1/4 text-right text-burning-warning font-medium">
                    {player.losses}
                  </div>
                  <div className="w-1/4 text-right font-medium">
                    <span className={`${
                      parseFloat(winRate) >= 60 ? 'text-solar-flare' : 
                      parseFloat(winRate) >= 50 ? 'text-corona-light' : 
                      'text-burning-warning'
                    }`}>
                      {winRate}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      <div className="text-center text-sm text-corona-light/60 pt-6 border-t border-solar-flare/20 mt-6">
        Showing {sortedPlayers.length} players from <span className="text-solar-flare">{region.toUpperCase()}</span>
      </div>
    </div>
  );
}
