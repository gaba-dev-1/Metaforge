import React from 'react';
import { motion } from 'framer-motion';

interface PlacementDistributionProps {
  placementData?: Array<{ placement: number; count: number; }>;
}

function PlacementDistribution({ placementData }: PlacementDistributionProps) {
  if (!placementData || placementData.length === 0) return null;
  
  // Calculate total count for percentages
  const totalGames = placementData.reduce((sum, p) => sum + p.count, 0);
  const placementPercentages = placementData.map(p => ({
    ...p,
    percentage: ((p.count / totalGames) * 100).toFixed(1)
  }));

  return (
    <div className="mt-2 pt-3 border-t border-solar-flare/20">
      <div className="flex flex-col space-y-2">
        {/* Visual chart for all 8 placements */}
        <div className="w-full bg-void-core/50 rounded-lg p-3 border border-solar-flare/10">
          <div className="flex items-end space-x-1">
            {Array.from({ length: 8 }, (_, i) => {
              const placement = i + 1;
              // Find the placement data or use a default
              const placementData = placementPercentages.find(p => p.placement === placement) || 
                { placement, count: 0, percentage: '0.0' };
              
              const percentage = parseFloat(placementData.percentage);
              const height = `${Math.max(4, (percentage / 100) * 120)}px`;
              
              // Color scheme based on placement
              let barColor;
              let textColor;
              
              switch(placement) {
                case 1: 
                  barColor = 'bg-gradient-to-t from-solar-flare to-burning-warning';
                  textColor = 'text-solar-flare';
                  break;
                case 2: 
                  barColor = 'bg-gradient-to-t from-cosmic-dust to-stellar-white/80';
                  textColor = 'text-stellar-white';
                  break;
                case 3: 
                  barColor = 'bg-gradient-to-t from-amber-700 to-amber-600';
                  textColor = 'text-amber-400';
                  break;
                default: 
                  barColor = 'bg-gradient-to-t from-corona-light/40 to-corona-light/30';
                  textColor = 'text-corona-light';
              }

              return (
                <motion.div 
                  key={placement} 
                  className="flex-1 flex flex-col items-center"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: placement * 0.05,
                    ease: [0.2, 0.8, 0.2, 1]
                  }}
                >
                  <div className="text-xs text-corona-light/70 mb-1">{percentage}%</div>
                  <motion.div 
                    className={`w-full rounded-t ${barColor}`} 
                    style={{ height: "4px" }}
                    animate={{ height }}
                    transition={{ 
                      duration: 0.8, 
                      delay: placement * 0.05 + 0.3,
                      ease: [0.2, 0.8, 0.2, 1] 
                    }}
                  ></motion.div>
                  <div className={`text-xs font-medium mt-1 ${textColor}`}>
                    #{placement}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsPanelProps {
  stats: {
    count?: number;
    avgPlacement?: number;
    winRate?: number;
    top4Rate?: number;
    placementData?: Array<{ placement: number; count: number; }>;
    totalGames?: number; // Total number of games analyzed
    [key: string]: any;
  } | null;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) return null;
  
  // Calculate per-lobby frequency if totalGames is available
  const totalGames = stats.totalGames || 0;
  const perLobbyFrequency = totalGames > 0 
    ? ((stats.count || 0) / totalGames * 8).toFixed(1)
    : '-';
  
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.2, 0.8, 0.2, 1]
      }
    })
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div 
          className="stat-box"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <div className="text-sm text-corona-light/80">Frequency</div>
          <div className="text-base font-medium text-solar-flare">
            {totalGames > 0 ? `${perLobbyFrequency}/8` : stats.count || 0}
          </div>
        </motion.div>
        <motion.div 
          className="stat-box"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <div className="text-sm text-corona-light/80">Avg Place</div>
          <div className="text-base font-medium text-solar-flare">{stats.avgPlacement?.toFixed(2) || '-'}</div>
        </motion.div>
        <motion.div 
          className="stat-box"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <div className="text-sm text-corona-light/80">Win Rate</div>
          <div className="text-base font-medium text-solar-flare">{stats.winRate?.toFixed(1) || '0'}%</div>
        </motion.div>
        <motion.div 
          className="stat-box"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <div className="text-sm text-corona-light/80">Top 4</div>
          <div className="text-base font-medium text-solar-flare">{stats.top4Rate?.toFixed(1) || '0'}%</div>
        </motion.div>
      </div>
      
      {stats.placementData && <PlacementDistribution placementData={stats.placementData} />}
    </div>
  );
}

// Export PlacementDistribution component
export { PlacementDistribution };
