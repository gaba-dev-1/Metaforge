import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, RadialBarChart, RadialBar } from 'recharts';
import { 
  ChevronUp, 
  ChevronDown, 
  TrendingUp, 
  Activity, 
  Medal, 
  Sparkles, 
  Crown,
  Target,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Eye,
  Star,
  DollarSign,
  Shield
} from 'lucide-react';
import { UnitIcon, TraitIcon, ItemIcon } from '@/components/ui';
import { useTftData } from '@/utils/useTftData';
import { parseCompTraits } from '@/utils/dataProcessing';
import { getEntityIcon, DEFAULT_ICONS, getCostColor } from '@/utils/paths';

interface InsightCard {
  title: string;
  icon: React.ReactNode;
  data: any[];
  metric: string;
  formatter: (value: number) => string;
}

export function MetaInsightsDashboard() {
  const [activeInsight, setActiveInsight] = useState<string>('meta-overview');
  const tftData = useTftData() as any;
  const data = tftData?.data || null;
  
  if (!data?.compositions) return null;
  
  // Process comprehensive meta data with TFT-focused insights
  const metaAnalysis = useMemo(() => {
    const units: Record<string, any> = {};
    const traits: Record<string, any> = {};
    const items: Record<string, any> = {};
    const placements = Array(8).fill(0).map((_, i) => ({ 
      placement: i + 1, 
      count: 0,
      name: i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i + 1}th`,
      percentage: 0
    }));
    
    let totalGames = 0;
    let highRollGames = 0; // Games with top 3 finish
    let topDecileGames = 0; // Games in top 10% of compositions by winrate
    
    // Enhanced data processing with meta insights
    data.compositions.forEach((comp: any) => {
      const compGames = comp.count || 1;
      totalGames += compGames;
      
      // Track placement distribution properly
      if (comp.placementData && Array.isArray(comp.placementData)) {
        comp.placementData.forEach((p: any) => {
          const placementIndex = p.placement - 1;
          if (placementIndex >= 0 && placementIndex < 8) {
            placements[placementIndex].count += p.count || 0;
          }
        });
      } else {
        // Fallback: estimate placement distribution from average placement
        const avgPlace = comp.avgPlacement || 4.5;
        const placementIndex = Math.round(avgPlace - 1);
        if (placementIndex >= 0 && placementIndex < 8) {
          placements[placementIndex].count += compGames;
        }
      }
      
      // Identify high-roll and meta compositions
      if ((comp.winRate || 0) > 15) highRollGames += compGames;
      if ((comp.winRate || 0) > 20) topDecileGames += compGames;
      
      // Process units with enhanced metrics
      comp.units.forEach((unit: any) => {
        if (!units[unit.id]) {
          units[unit.id] = { 
            ...unit, 
            count: 0, 
            games: 0,
            winRateSum: 0, 
            top4RateSum: 0, 
            placementSum: 0,
            flexibility: new Set(), // Different comps this unit appears in
            itemSynergy: {}, // Items that pair well with this unit
            costEfficiency: 0 // Performance relative to cost
          };
        }
        
        const unitEntity = units[unit.id];
        unitEntity.count += compGames;
        unitEntity.games += compGames;
        unitEntity.placementSum += (comp.avgPlacement || 0) * compGames;
        unitEntity.winRateSum += ((comp.winRate || 0) / 100) * compGames;
        unitEntity.top4RateSum += ((comp.top4Rate || 0) / 100) * compGames;
        unitEntity.flexibility.add(comp.id);
        
        // Track item synergies
        if (unit.items) {
          unit.items.forEach((item: any) => {
            if (!unitEntity.itemSynergy[item.id]) {
              unitEntity.itemSynergy[item.id] = { count: 0, winRateSum: 0 };
            }
            unitEntity.itemSynergy[item.id].count += compGames;
            unitEntity.itemSynergy[item.id].winRateSum += ((comp.winRate || 0) / 100) * compGames;
          });
        }
      });
      
      // Process traits with tier analysis
      comp.traits.forEach((trait: any) => {
        const traitKey = `${trait.id}-${trait.tier}`;
        
        if (!traits[traitKey]) {
          traits[traitKey] = { 
            ...trait,
            traitId: trait.id,
            count: 0, 
            games: 0,
            winRateSum: 0, 
            top4RateSum: 0, 
            placementSum: 0,
            tierDistribution: Array(5).fill(0), // Track tier distribution
            unitSynergy: {}, // Units that work well with this trait
            difficulty: 0 // How hard is it to achieve this trait
          };
        }
        
        const traitEntity = traits[traitKey];
        traitEntity.count += compGames;
        traitEntity.games += compGames;
        traitEntity.placementSum += (comp.avgPlacement || 0) * compGames;
        traitEntity.winRateSum += ((comp.winRate || 0) / 100) * compGames;
        traitEntity.top4RateSum += ((comp.top4Rate || 0) / 100) * compGames;
        traitEntity.tierDistribution[trait.tier - 1] += compGames;
        
        // Track unit synergies
        comp.units.forEach((unit: any) => {
          if (!traitEntity.unitSynergy[unit.id]) {
            traitEntity.unitSynergy[unit.id] = { count: 0, winRateSum: 0 };
          }
          traitEntity.unitSynergy[unit.id].count += compGames;
          traitEntity.unitSynergy[unit.id].winRateSum += ((comp.winRate || 0) / 100) * compGames;
        });
      });
      
      // Process items with enhanced analysis
      comp.units.forEach((unit: any) => {
        if (!unit.items) return;
        
        unit.items.forEach((item: any) => {
          if (!items[item.id]) {
            items[item.id] = { 
              ...item, 
              count: 0, 
              games: 0,
              winRateSum: 0, 
              top4RateSum: 0, 
              placementSum: 0,
              versatility: new Set(), // Different units this item appears on
              carrySynergy: 0, // How well it works on carry units
              supportSynergy: 0, // How well it works on support units
              contestation: 0 // How contested this item is
            };
          }
          
          const itemEntity = items[item.id];
          itemEntity.count += compGames;
          itemEntity.games += compGames;
          itemEntity.placementSum += (comp.avgPlacement || 0) * compGames;
          itemEntity.winRateSum += ((comp.winRate || 0) / 100) * compGames;
          itemEntity.top4RateSum += ((comp.top4Rate || 0) / 100) * compGames;
          itemEntity.versatility.add(unit.id);
          
          // Determine if this is on a carry or support unit (based on cost)
          if (unit.cost >= 4) {
            itemEntity.carrySynergy += ((comp.winRate || 0) / 100) * compGames;
          } else {
            itemEntity.supportSynergy += ((comp.winRate || 0) / 100) * compGames;
          }
        });
      });
    });
    
    // Calculate final metrics for units
    Object.values(units).forEach((unit: any) => {
      unit.avgPlacement = unit.placementSum / unit.games;
      unit.winRate = (unit.winRateSum / unit.games) * 100;
      unit.top4Rate = (unit.top4RateSum / unit.games) * 100;
      unit.playRate = (unit.games / totalGames) * 100;
      unit.flexibilityScore = unit.flexibility.size;
      unit.costEfficiency = (unit.winRate || 0) / Math.max(unit.cost || 1, 1);
      
      // Calculate best items for this unit
      unit.bestItems = Object.entries(unit.itemSynergy)
        .map(([itemId, synergy]: [string, any]) => ({
          itemId,
          winRate: (synergy.winRateSum / synergy.count) * 100,
          count: synergy.count
        }))
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 3);
    });
    
    // Calculate final metrics for traits
    Object.values(traits).forEach((trait: any) => {
      trait.avgPlacement = trait.placementSum / trait.games;
      trait.winRate = (trait.winRateSum / trait.games) * 100;
      trait.top4Rate = (trait.top4RateSum / trait.games) * 100;
      trait.playRate = (trait.games / totalGames) * 100;
      trait.difficulty = trait.tierDistribution[3] + trait.tierDistribution[4]; // Higher tiers = more difficult
      
      // Calculate best units for this trait
      trait.bestUnits = Object.entries(trait.unitSynergy)
        .map(([unitId, synergy]: [string, any]) => ({
          unitId,
          winRate: (synergy.winRateSum / synergy.count) * 100,
          count: synergy.count
        }))
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 3);
    });
    
    // Calculate final metrics for items
    Object.values(items).forEach((item: any) => {
      item.avgPlacement = item.placementSum / item.games;
      item.winRate = (item.winRateSum / item.games) * 100;
      item.top4Rate = (item.top4RateSum / item.games) * 100;
      item.playRate = (item.games / totalGames) * 100;
      item.versatilityScore = item.versatility.size;
      item.carryEfficiency = item.carrySynergy / Math.max(item.games * 0.01, 1);
      item.supportEfficiency = item.supportSynergy / Math.max(item.games * 0.01, 1);
    });
    
    // Calculate percentage for placement distribution
    const totalPlacementGames = placements.reduce((sum, p) => sum + p.count, 0);
    placements.forEach(p => {
      p.percentage = totalPlacementGames > 0 ? (p.count / totalPlacementGames) * 100 : 0;
    });
    
    // Meta game health metrics - TFT focused
    const metaHealth = {
      diversity: Object.values(units).filter((u: any) => u.playRate > 5).length,
      balance: Math.max(0, 1 - (Math.max(...Object.values(units).map((u: any) => u.playRate)) / 100)),
      competitiveness: Math.min(1, topDecileGames / totalGames),
      consistency: Math.max(0, 1 - (placements[0].count + placements[1].count + placements[2].count) / totalGames),
      skillExpression: Math.min(1, highRollGames / totalGames)
    };
    
    return {
      units: Object.values(units),
      traits: Object.values(traits),
      items: Object.values(items),
      placements,
      metaHealth,
      totalGames,
      compositions: data.compositions.length,
      totalPlacementGames // Add this to the return so it's available
    };
  }, [data]);
  
  // Define insight cards with TFT-focused wording and theme colors
  const insightCards: Record<string, InsightCard> = {
    'meta-overview': {
      title: 'Meta Pulse',
      icon: <Activity className="h-6 w-6" />,
      data: [
        { name: 'Champion Diversity', value: metaAnalysis.metaHealth.diversity, max: 50 },
        { name: 'Balance Score', value: metaAnalysis.metaHealth.balance * 100, max: 100 },
        { name: 'High-Roll Factor', value: metaAnalysis.metaHealth.competitiveness * 100, max: 100 },
        { name: 'Consistency Index', value: metaAnalysis.metaHealth.consistency * 100, max: 100 },
        { name: 'Skill Expression', value: metaAnalysis.metaHealth.skillExpression * 100, max: 100 }
      ],
      metric: 'score',
      formatter: (value: number) => `${value.toFixed(1)}%`
    },
    'top-carries': {
      title: 'Elite Carries',
      icon: <Crown className="h-6 w-6" />,
      data: metaAnalysis.units
        .filter(unit => unit.cost >= 3) // 3+ cost units can be true carries
        .sort((a, b) => (b.winRate * b.playRate) - (a.winRate * a.playRate)) // Sort by impact (winrate * playrate)
        .slice(0, 6)
        .map(unit => ({
          name: unit.name,
          value: unit.winRate * unit.playRate / 100, // Impact score
          cost: unit.cost,
          winRate: unit.winRate,
          playRate: unit.playRate,
          entity: unit
        })),
      metric: 'impact',
      formatter: (value: number) => `${value.toFixed(1)} impact`
    },
    'flex-picks': {
      title: 'Flex Champions',
      icon: <Target className="h-6 w-6" />,
      data: metaAnalysis.units
        .filter(unit => unit.flexibilityScore >= 3)
        .sort((a, b) => b.flexibilityScore - a.flexibilityScore)
        .slice(0, 6)
        .map(unit => ({
          name: unit.name,
          value: unit.flexibilityScore,
          winRate: unit.winRate,
          playRate: unit.playRate,
          entity: unit
        })),
      metric: 'comps',
      formatter: (value: number) => `${value} comps`
    },
    'trait-dominance': {
      title: 'Trait Dominance',
      icon: <Crown className="h-6 w-6" />,
      data: metaAnalysis.traits
        .sort((a, b) => (b.winRate * b.playRate) - (a.winRate * a.playRate))
        .slice(0, 6)
        .map(trait => ({
          name: trait.name,
          value: trait.winRate * trait.playRate / 100,
          tier: trait.tier,
          winRate: trait.winRate,
          playRate: trait.playRate,
          entity: trait
        })),
      metric: 'impact',
      formatter: (value: number) => `${value.toFixed(1)}`
    },
    'item-priority': {
      title: 'Item Priority',
      icon: <Star className="h-6 w-6" />,
      data: metaAnalysis.items
        .sort((a, b) => (b.winRate + b.versatilityScore * 2) - (a.winRate + a.versatilityScore * 2))
        .slice(0, 6)
        .map(item => ({
          name: item.name,
          value: item.winRate + item.versatilityScore * 2,
          winRate: item.winRate,
          versatility: item.versatilityScore,
          entity: item
        })),
      metric: 'priority',
      formatter: (value: number) => `${value.toFixed(1)}`
    },
    'comp-distribution': {
      title: 'Comp Distribution',
      icon: <PieChartIcon className="h-6 w-6" />,
      data: metaAnalysis.placements.map(p => ({
        name: p.name,
        value: p.count,
        percentage: metaAnalysis.totalPlacementGames > 0 ? (p.count / metaAnalysis.totalPlacementGames) * 100 : 0,
        placement: p.placement
      })),
      metric: 'games',
      formatter: (value: number) => `${value.toLocaleString()} games`
    }
  };
  
  const activeCard = insightCards[activeInsight];
  
  // Custom tooltip components using theme colors
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-brown-dark/95 border border-gold/30 rounded-lg p-3 text-sm backdrop-blur-sm shadow-xl">
          <p className="text-gold font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-cream">
              {`${entry.name}: ${activeCard.formatter(entry.value)}`}
            </p>
          ))}
          {data.winRate && (
            <p className="text-cream/70 text-xs mt-1">
              Win Rate: {data.winRate.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Generate chart component based on insight type
  const renderChart = () => {
    if (!activeCard.data.length) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-cream/60">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
          </div>
        </div>
      );
    }
    
    switch (activeInsight) {
      case 'meta-overview':
        return (
          <RadialBarChart width={300} height={300} cx={150} cy={150} innerRadius="20%" outerRadius="80%" data={activeCard.data}>
            <RadialBar dataKey="value" cornerRadius={10} fill="#f59e0b" />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        );
        
      case 'comp-distribution':
        return (
          <BarChart width={400} height={300} data={activeCard.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#f3f4f6' }} 
            />
            <YAxis tick={{ fontSize: 12, fill: '#f3f4f6' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {activeCard.data.map((entry, index) => {
                // Use theme colors for placement bars - better for placement analysis
                const getPlacementColor = (placement: number) => {
                  if (placement <= 1) return '#f59e0b'; // Gold for 1st
                  if (placement <= 4) return '#d97706'; // Amber for top 4
                  if (placement <= 6) return '#92400e'; // Brown-600 for mid
                  return '#78716c'; // Stone-500 for bot
                };
                return (
                  <Cell key={`cell-${index}`} fill={getPlacementColor(entry.placement)} />
                );
              })}
            </Bar>
          </BarChart>
        );
        
      default:
        return (
          <BarChart width={400} height={300} data={activeCard.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#f3f4f6' }} 
              angle={-45} 
              textAnchor="end" 
              height={80}
            />
            <YAxis tick={{ fontSize: 12, fill: '#f3f4f6' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {activeCard.data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`rgba(245, 158, 11, ${0.9 - index * 0.1})`} // Gold theme with opacity
                />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };
  
  return (
    <div className="bg-brown/5 border border-gold/20 rounded-lg backdrop-blur-md overflow-hidden mt-6">
      <div className="bg-brown/60 border-b border-gold/30 p-4">
        <h2 className="text-2xl text-gold mb-4 font-display flex items-center gap-3">
          <BarChart3 className="h-6 w-6" />
          Meta Dashboard
        </h2>
        
        {/* Insight Navigation - themed properly */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(insightCards).map(([key, card]) => (
            <motion.button
              key={key}
              onClick={() => setActiveInsight(key)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                activeInsight === key
                  ? 'bg-gold text-brown-dark shadow-lg font-medium'
                  : 'bg-brown-light/30 text-cream/70 hover:bg-brown-light/50 hover:text-cream'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {card.icon}
              <span className="text-sm font-medium">{card.title}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeInsight}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart Section */}
            <div className="bg-brown-light/20 rounded-lg p-4 border border-gold/10">
              <h3 className="text-lg text-gold mb-4 flex items-center gap-2">
                {activeCard.icon}
                {activeCard.title}
              </h3>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Detailed Breakdown */}
            <div className="bg-brown-light/20 rounded-lg p-4 border border-gold/10">
              <h3 className="text-lg text-gold mb-4">Ranked Champions</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {activeCard.data.slice(0, 8).map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-brown-light/30 rounded-lg p-3 hover:bg-brown-light/40 transition-colors border border-gold/5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.entity && (
                          <div className="flex-shrink-0">
                            {activeInsight.includes('unit') || activeInsight === 'top-carries' || activeInsight === 'flex-picks' ? (
                              <img 
                                src={getEntityIcon(item.entity, 'unit')} 
                                alt={item.name}
                                className={`w-8 h-8 rounded-full border-2`}
                                style={{ borderColor: getCostColor(item.entity.cost) }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = DEFAULT_ICONS.unit;
                                }}
                              />
                            ) : activeInsight === 'trait-dominance' ? (
                              <img 
                                src={getEntityIcon(item.entity, 'trait')} 
                                alt={item.name}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = DEFAULT_ICONS.trait;
                                }}
                              />
                            ) : activeInsight === 'item-priority' ? (
                              <img 
                                src={getEntityIcon(item.entity, 'item')} 
                                alt={item.name}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = DEFAULT_ICONS.item;
                                }}
                              />
                            ) : null}
                          </div>
                        )}
                        <div>
                          <div className="text-cream font-medium text-sm">{item.name}</div>
                          <div className="text-cream/60 text-xs">
                            {activeCard.formatter(item.value)}
                            {item.winRate && ` • ${item.winRate.toFixed(1)}% WR`}
                            {item.playRate && ` • ${item.playRate.toFixed(1)}% PR`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-gold">
                          #{index + 1}
                        </div>
                        {activeInsight === 'top-carries' && (
                          <div className="text-xs text-cream/60">
                            {item.cost}🪙
                          </div>
                        )}
                        {activeInsight === 'trait-dominance' && (
                          <div className="text-xs text-cream/60">
                            Tier {item.tier}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Additional insights based on active card */}
          {activeInsight === 'meta-overview' && (
            <div className="mt-6 bg-brown-light/20 rounded-lg p-4 border border-gold/10">
              <h3 className="text-lg text-gold mb-4">Current Meta Snapshot</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-cream">{metaAnalysis.compositions}</div>
                  <div className="text-sm text-cream/60">Meta Comps</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cream">{metaAnalysis.totalGames.toLocaleString()}</div>
                  <div className="text-sm text-cream/60">Games Analyzed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cream">{(metaAnalysis.metaHealth.diversity)}</div>
                  <div className="text-sm text-cream/60">Playable Units</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cream">{(metaAnalysis.metaHealth.balance * 100).toFixed(1)}%</div>
                  <div className="text-sm text-cream/60">Balance Health</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cream">{(metaAnalysis.metaHealth.skillExpression * 100).toFixed(1)}%</div>
                  <div className="text-sm text-cream/60">Skill Factor</div>
                </div>
              </div>
            </div>
          )}

          {/* Elite Carries Explanation */}
          {activeInsight === 'top-carries' && (
            <div className="mt-6 bg-brown-light/20 rounded-lg p-4 border border-gold/10">
              <h3 className="text-lg text-gold mb-4">What Makes an Elite Carry?</h3>
              <p className="text-cream/80 text-sm leading-relaxed">
                Elite carries are high-cost units that consistently win games. We look at both win rate and play rate 
                to find champions that actually carry when used. These units deserve your best items and should be 
                prioritized in your item allocation strategy.
              </p>
            </div>
          )}

          {/* Comp Distribution Explanation */}
          {activeInsight === 'comp-distribution' && (
            <div className="mt-6 bg-brown-light/20 rounded-lg p-4 border border-gold/10">
              <h3 className="text-lg text-gold mb-4">Composition Placement Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-gold">
                    {((metaAnalysis.placements[0]?.count || 0) / metaAnalysis.totalGames * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-cream/60">1st Place Rate</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-cream">
                    {(metaAnalysis.placements.slice(0, 4).reduce((sum, p) => sum + (p.count || 0), 0) / metaAnalysis.totalGames * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-cream/60">Top 4 Rate</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-cream">
                    {(metaAnalysis.placements.slice(0, 4).reduce((sum, p) => sum + (p.count || 0), 0) / metaAnalysis.placements.reduce((sum, p) => sum + (p.count || 0), 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-cream/60">Top 4 of Total</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-cream">
                    {(metaAnalysis.placements.reduce((sum, p, i) => sum + (p.count || 0) * (i + 1), 0) / metaAnalysis.placements.reduce((sum, p) => sum + (p.count || 0), 0)).toFixed(2)}
                  </div>
                  <div className="text-xs text-cream/60">Average Place</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
