import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Trophy, Target, Calendar, Award, Star, Zap } from 'lucide-react';

interface MatchDetailProps {
  match: {
    matchId: string;
    queueId: number;
    gameType: string;
    gameCreation: number;
    gameDuration: number;
    gameVersion: string;
    mapId: number;
    placement: number;
    level: number;
    augments: string[];
    traits: Array<{
      name: string;
      numUnits: number;
      style: number;
      tierCurrent: number;
      tierTotal: number;
    }>;
    units: Array<{
      characterId: string;
      itemNames: string[];
      rarity: number;
      tier: number;
    }>;
    companions?: {
      contentId: string;
      skinId: number;
      species: string;
    };
  };
}

export default function MatchDetail({ match }: MatchDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'composition' | 'timeline'>('overview');
  
  const gameDate = new Date(match.gameCreation);
  const gameDuration = Math.floor(match.gameDuration / 60);
  const gameType = match.gameType === 'ranked' ? 'Ranked' : 'Normal';
  
  const getPlacementStyling = (placement: number) => {
    if (placement === 1) return {
      bg: 'bg-gradient-to-r from-solar-flare/30 to-burning-warning/30',
      border: 'border-solar-flare',
      text: 'text-solar-flare',
      icon: <Trophy className="h-8 w-8" />
    };
    if (placement <= 4) return {
      bg: 'bg-gradient-to-r from-verdant-success/20 to-verdant-success/10',
      border: 'border-verdant-success',
      text: 'text-verdant-success',
      icon: <Award className="h-8 w-8" />
    };
    return {
      bg: 'bg-gradient-to-r from-burning-warning/20 to-burning-warning/10',
      border: 'border-burning-warning',
      text: 'text-burning-warning',
      icon: <Target className="h-8 w-8" />
    };
  };
  
  const placementStyle = getPlacementStyling(match.placement);
  
  const getRarityColor = (rarity: number) => {
    const colors = ['#6b7280', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
    return colors[rarity] || colors[0];
  };

  return (
    <div className="space-y-8">
      <motion.div 
        className={`${placementStyle.bg} backdrop-blur-md border ${placementStyle.border} rounded-xl p-8`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`text-6xl font-bold ${placementStyle.text} mb-2`}>
              #{match.placement}
            </div>
            <div className="flex justify-center mb-2">
              {placementStyle.icon}
            </div>
            <div className="text-sm text-corona-light/70">Placement</div>
          </motion.div>
          
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl font-display text-stellar-white mb-4">
              {gameType} Match
            </h1>
            
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-4">
              <div className="flex items-center gap-2 bg-void-core/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-solar-flare/20">
                <Calendar className="h-4 w-4 text-corona-light/70" />
                <span className="text-corona-light text-sm">
                  {gameDate.toLocaleDateString()} at {gameDate.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-void-core/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-solar-flare/20">
                <Clock className="h-4 w-4 text-corona-light/70" />
                <span className="text-corona-light text-sm">{gameDuration} minutes</span>
              </div>
              <div className="flex items-center gap-2 bg-void-core/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-solar-flare/20">
                <Users className="h-4 w-4 text-corona-light/70" />
                <span className="text-corona-light text-sm">Level {match.level}</span>
              </div>
            </div>
            
            <div className="text-sm text-corona-light/60">
              Game Version: {match.gameVersion} • TFT Set: {match.mapId}
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            icon: Trophy, 
            label: "Placement", 
            value: `#${match.placement}`,
            color: placementStyle.text
          },
          { 
            icon: Target, 
            label: "Level Reached", 
            value: match.level.toString(),
            color: "text-corona-light"
          },
          { 
            icon: Zap, 
            label: "Active Traits", 
            value: match.traits.filter(t => t.style >= 1).length.toString(),
            color: "text-solar-flare"
          },
          { 
            icon: Star, 
            label: "Champion Units", 
            value: match.units.length.toString(),
            color: "text-corona-light"
          }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            className="backdrop-filter backdrop-blur-md bg-eclipse-shadow/30 border border-solar-flare/20 rounded-lg p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.15)" }}
          >
            <stat.icon className="h-6 w-6 text-solar-flare mx-auto mb-2" />
            <div className="text-sm text-corona-light/70 mb-1">{stat.label}</div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>
      
      <div className="backdrop-filter backdrop-blur-md bg-eclipse-shadow/30 border border-solar-flare/30 rounded-xl overflow-hidden">
        <div className="border-b border-solar-flare/30">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: Trophy },
              { id: 'composition', label: 'Team Composition', icon: Users },
              { id: 'timeline', label: 'Match Timeline', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center gap-2 px-6 py-4 transition-all text-sm font-medium ${
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
        
        <div className="p-8">
          {activeTab === 'overview' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <h3 className="text-xl font-display text-stellar-white mb-6 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-solar-flare" />
                  Hextech Augments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {match.augments.map((augment, index) => (
                    <motion.div 
                      key={index}
                      className="backdrop-filter backdrop-blur-sm bg-void-core/40 border border-solar-flare/20 rounded-lg p-4 text-center hover:border-solar-flare/40 transition-all"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-sm font-medium text-corona-light">
                        {augment.replace(/^TFT\d+_Augment_/, '').replace(/_/g, ' ')}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-display text-stellar-white mb-6 flex items-center gap-2">
                  <Star className="h-5 w-5 text-solar-flare" />
                  Active Traits
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {match.traits
                    .filter(trait => trait.style >= 1)
                    .sort((a, b) => b.style - a.style)
                    .map((trait, index) => (
                      <motion.div 
                        key={index}
                        className="backdrop-filter backdrop-blur-sm bg-void-core/40 border border-solar-flare/20 rounded-lg p-4 hover:border-solar-flare/40 transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 bg-solar-flare/10 rounded-lg flex items-center justify-center">
                            <div className="absolute -top-1 -right-1 bg-solar-flare text-void-core text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {trait.numUnits}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-corona-light">{trait.name}</div>
                            <div className="text-xs text-solar-flare">
                              {['Bronze', 'Silver', 'Gold', 'Diamond'][trait.style - 1] || 'Active'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  }
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'composition' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <h3 className="text-xl font-display text-stellar-white mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 text-solar-flare" />
                  Team Composition
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {match.units
                    .sort((a, b) => (b.tier - a.tier) || (b.rarity - a.rarity))
                    .map((unit, index) => (
                      <motion.div 
                        key={index}
                        className="backdrop-filter backdrop-blur-sm bg-void-core/40 border border-solar-flare/20 rounded-lg p-4 hover:border-solar-flare/40 transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div 
                            className="w-14 h-14 rounded-lg border-2 overflow-hidden bg-void-core/60 flex items-center justify-center relative"
                            style={{ borderColor: getRarityColor(unit.rarity) }}
                          >
                            <div className="text-xs text-corona-light">
                              {unit.characterId.slice(0, 3)}
                            </div>
                            {unit.tier > 1 && (
                              <div className="absolute bottom-0 right-0 bg-solar-flare text-void-core rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                {unit.tier}★
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-corona-light">{unit.characterId}</div>
                            <div className="text-sm text-corona-light/70">
                              {unit.tier}★ • {['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][unit.rarity] || 'Unknown'}
                            </div>
                          </div>
                        </div>
                        
                        {unit.itemNames && unit.itemNames.length > 0 && (
                          <div>
                            <div className="text-sm text-corona-light/70 mb-2">Items:</div>
                            <div className="flex gap-2">
                              {unit.itemNames.map((item, itemIndex) => (
                                <div 
                                  key={itemIndex} 
                                  className="w-8 h-8 bg-void-core/60 rounded border border-solar-flare/20 flex items-center justify-center"
                                >
                                  <div className="text-xs text-corona-light/70">
                                    {item.slice(0, 2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))
                  }
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'timeline' && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Clock className="h-16 w-16 mx-auto text-solar-flare/50 mb-4" />
              <h3 className="text-xl font-display text-stellar-white mb-2">
                Match Timeline
              </h3>
              <p className="text-corona-light/70 max-w-md mx-auto">
                Round-by-round progression and key events will be available soon.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
