import { useState, useMemo, useEffect, useCallback } from 'react';
import { Layout, Card, UnitIcon, ItemIcon } from '@/components/ui';
import { FeatureBanner, HeaderBanner, StatsCarousel, EntityTabs, MetaHighlightCard, MetaInsightsDashboard } from '@/components/common';
import type { EntityType, FilterState } from '@/components/common';
import { useTftData, useTierLists, HighlightType, EntityType as HighlightEntityType } from '@/utils/useTftData';
import Link from 'next/link';
import { Trophy, Star, Medal, Users, Shield, ChevronDown, ChevronUp, Sparkles, Crown } from 'lucide-react';
import { parseCompTraits } from '@/utils/dataProcessing';
import { getEntityIcon, DEFAULT_ICONS, getTraitInfo } from '@/utils/paths';
import { BaseStats } from '@/types';
import itemsJson from 'public/mapping/items.json';
import traitsJson from 'public/mapping/traits.json';
import { motion, AnimatePresence } from 'framer-motion';

export default function MetaReport() {
  const tftDataResult = useTftData() as unknown as Record<string, any>;
  
  const data = tftDataResult?.data ?? null;
  const isLoading = tftDataResult?.isLoading ?? false;
  const error = tftDataResult?.error ?? null;
  const handleRetry = tftDataResult?.handleRetry ?? (() => {});
  const highlights = tftDataResult?.highlights ?? [];
  
  const tierLists = useTierLists();
  const [activeTab, setActiveTab] = useState<EntityType>('units');
  const [filter, setFilter] = useState<FilterState>({ all: true });
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({
    S: true, A: true, B: true, C: false
  });

  // Reset filter when changing tabs
  useEffect(() => {
    setFilter({ all: true });
  }, [activeTab]);

  // Get category options based on active tab
  const categoryOptions = useMemo(() => {
    switch(activeTab) {
      case 'units':
        return [1, 2, 3, 4, 5].map(cost => ({ id: String(cost), name: `${cost} 🪙` }));
      case 'items':
        const categories = new Set<string>();
        Object.values(itemsJson.items).forEach(item => {
          if (item.category && !['component', 'tactician'].includes(item.category)) {
            categories.add(item.category);
          }
        });
        return Array.from(categories).map(category => ({
          id: category,
          name: category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        }));
      case 'traits':
        return [{ id: 'origin', name: 'Origins' }, { id: 'class', name: 'Classes' }];
      case 'comps':
        return [
          { id: 'fast9', name: 'Fast 9' },
          { id: 'reroll', name: 'Reroll' },
          { id: 'standard', name: 'Standard' }
        ];
      default:
        return [];
    }
  }, [activeTab]);

  // Filter entities based on current filter
  const filterEntity = useCallback((entity: any): boolean => {
    if (filter.all) return true;
    
    const isOriginTrait = (traitId: string): boolean => (
      Object.keys(traitsJson.origins).includes(traitId)
    );
  
    const getCompType = (comp: any): string => {
      if (!comp.units) return 'standard';
      const highCostUnits = comp.units.filter((u: any) => u.cost >= 4).length >= 3;
      const lowCostUnits = comp.units.filter((u: any) => u.cost <= 2).length >= 4;
      return highCostUnits ? 'fast9' : lowCostUnits ? 'reroll' : 'standard';
    };
    
    switch(activeTab) {
      case 'units':
        return entity.cost && filter[String(entity.cost)];
      case 'items':
        return entity.category && filter[entity.category];
      case 'traits':
        const isOrigin = isOriginTrait(entity.id);
        return (isOrigin && filter.origin) || (!isOrigin && filter.class);
      case 'comps':
        return filter[getCompType(entity)];
      default:
        return true;
    }
  }, [filter, activeTab]);

  // Apply filters to tier list
  const filteredTierList = useMemo(() => {
    if (!tierLists || filter.all) return tierLists;
    
    const result = {...tierLists};
    const list = result[activeTab as keyof typeof result];
    
    Object.keys(list).forEach(tier => {
      list[tier as keyof typeof list] = list[tier as keyof typeof list].filter(filterEntity);
    });
    
    return result;
  }, [tierLists, filter, activeTab, filterEntity]);

  // Filter highlights
  const filteredHighlights = useMemo(() => {
    if (!highlights || filter.all) return highlights;
    
    return highlights.map((group: any) => {
      const filtered = {...group};
      const variantKey = `${activeTab}Variants` as keyof typeof filtered;
      
      if (Array.isArray(filtered[variantKey])) {
        const filteredArray = (filtered[variantKey] as any[])
          .filter((variant: any) => filterEntity(variant.entity));
        filtered[variantKey] = filteredArray as any;
      }
      
      return filtered;
    });
  }, [highlights, filter, activeTab, filterEntity]);

  // Toggle filter with proper typing
  const toggleFilter = (id: string) => {
    if (id === 'all') {
      setFilter({ all: true });
    } else {
      setFilter(prevFilter => {
        // Create new filter state with proper typing
        const newFilter: FilterState = { ...prevFilter, all: false };
        
        // Toggle the specific filter
        newFilter[id] = !newFilter[id];
        
        // If no filters are active, reset to all
        const hasActiveFilters = Object.entries(newFilter)
          .some(([key, value]) => key !== 'all' && value === true);
        
        if (!hasActiveFilters) {
          return { all: true };
        }
        
        return newFilter;
      });
    }
  };

  // Toggle tier expansion
  const toggleTierExpansion = (tier: string) => {
    setExpandedTiers(prev => ({
      ...prev,
      [tier]: !prev[tier]
    }));
  };

  // Render entity icon WITHOUT TEXT
  const renderEntityIcon = (item: BaseStats): JSX.Element => {
    switch(activeTab) {
      case 'units':
        return <UnitIcon unit={item} size="lg" />;
      case 'items':
        return <ItemIcon item={item} size="lg" />;
      case 'traits':
        return (
          <img 
            src={getEntityIcon(item, 'trait')} 
            alt={item.name} 
            className="w-12 h-12 object-contain" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_ICONS.trait;
            }}
          />
        );
      default:
        const displayTraits = parseCompTraits(item.name, (item as any).traits || []);
        return (
          <div className="flex gap-1 flex-wrap justify-center w-full">
            {displayTraits.map((trait: any, i: number) => (
              <img 
                key={i} 
                src={getEntityIcon(trait, 'trait')} 
                alt={trait.name} 
                className="w-8 h-8" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_ICONS.trait;
                }}
              />
            ))}
          </div>
        );
    }
  };

  // Loading and error states
  if (isLoading) {
    return (
      <Layout title="Meta Report">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-cream/80">Loading meta data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="mt-6">
          <Card>
            <div className="text-center py-8">
              <div className="text-red-400 mb-2">Error loading data</div>
              <p className="text-cream/80 mb-4">
                {error && typeof error === 'object' && 'message' in error ? String(error.message) : 'An error occurred'}
              </p>
              <button onClick={handleRetry} className="px-4 py-2 bg-brown-light/50 hover:bg-brown-light/70 text-cream rounded-md">
                Retry
              </button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!filteredTierList) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-cream/80">Analyzing meta data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Enhanced tier styles with subtle shadows and better spread
  const tierStyles = [
    { 
      tier: 'S', 
      bgColor: 'bg-gradient-to-r from-gold via-yellow-500 to-gold', 
      textColor: 'text-brown-dark', 
      shadow: 'shadow-inner shadow-gold/20',
      glow: 'shadow-lg shadow-gold/15 shadow-spread',
      icon: <Crown className="h-6 w-6" />
    },
    { 
      tier: 'A', 
      bgColor: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600', 
      textColor: 'text-white', 
      shadow: 'shadow-inner shadow-amber-500/20',
      glow: 'shadow-md shadow-amber-500/15',
      icon: <Trophy className="h-5 w-5" />
    },
    { 
      tier: 'B', 
      bgColor: 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-700', 
      textColor: 'text-cream', 
      shadow: 'shadow-inner shadow-amber-700/20',
      glow: 'shadow-sm shadow-amber-700/10',
      icon: <Medal className="h-5 w-5" />
    },
    { 
      tier: 'C', 
      bgColor: 'bg-gradient-to-r from-amber-900 via-brown-dark to-amber-900', 
      textColor: 'text-cream/90', 
      shadow: 'shadow-inner shadow-amber-900/15',
      glow: 'shadow-sm shadow-amber-900/8',
      icon: <Shield className="h-5 w-5" />
    }
  ];

  // Highlight types
  const standardHighlights = [
    { type: HighlightType.TopWinner, title: "Best Winrate", icon: <Trophy className="text-gold h-5 w-5" /> },
    { type: HighlightType.MostConsistent, title: "Most Consistent", icon: <Medal className="text-gold h-5 w-5" /> },
    { type: HighlightType.MostPlayed, title: "Most Played", icon: <Users className="text-gold h-5 w-5" /> },
    { type: HighlightType.FlexiblePick, title: "Most Flexible", icon: <Shield className="text-gold h-5 w-5" /> },
    { type: HighlightType.PocketPick, title: "Pocket Pick", icon: <Star className="text-gold h-5 w-5" /> }
  ];

  return (
    <Layout title="Meta Report">
      <HeaderBanner />
      <StatsCarousel />
      
      <div className="mt-8">
        <FeatureBanner title="Meta Report - Highlights & Strategies" />
        <EntityTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          filterOptions={categoryOptions}
          filterState={filter}
          onFilterChange={toggleFilter}
          allowSearch={false}
          className="mt-1"
        />
      </div>
      
      <div className="mb-10 mt-6 flex flex-col lg:flex-row gap-6">
        {/* Tier List with themed colors only */}
        <div className="lg:w-4/6">
          <Card className="p-0 overflow-hidden h-full backdrop-filter backdrop-blur-md bg-brown/5 border border-gold/30">
            <div className="flex items-center justify-center py-4 bg-brown/60 border-b border-gold/30">
              <h2 className="text-xl font-display tracking-tight text-gold">Power Rankings</h2>
            </div>
            
            <div className="mt-4 w-full">
              {tierStyles.map(({ tier, bgColor, textColor, shadow, glow, icon }) => (
                <div key={tier} className={`border-t border-b border-gold/20 mb-2 ${glow}`}>
                  <div 
                    className="flex w-full items-center cursor-pointer group"
                    onClick={() => toggleTierExpansion(tier)}
                  >
                    <div className={`${bgColor} ${shadow} w-28 min-w-[7rem] h-14 flex items-center justify-center font-bold text-2xl ${textColor} border-r border-brown/20 relative overflow-hidden group-hover:scale-105 transition-transform duration-200`}>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <div className="flex items-center gap-2 relative z-10">
                        {icon}
                        <span>{tier}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center w-full px-4 py-3 bg-brown-light/20 group-hover:bg-brown-light/30 transition-colors">
                      <span className="text-gold text-sm font-medium">
                        {filteredTierList[activeTab as keyof typeof filteredTierList][tier as keyof typeof filteredTierList.units]?.length || 0} entities
                      </span>
                      <motion.div
                        animate={{ rotate: expandedTiers[tier] ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={18} className="text-gold" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedTiers[tier] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden bg-brown-light/20"
                      >
                        <div className="flex flex-wrap p-4 gap-2">
                          {filteredTierList[activeTab as keyof typeof filteredTierList][tier as keyof typeof filteredTierList.units]?.map((item, i) => (
                            <Link href={`/entity/${activeTab}/${item.id}`} key={i}>
                              <motion.div 
                                className="w-16 h-16 flex items-center justify-center hover:bg-brown-light/30 transition-all p-1 text-cream rounded-lg relative group"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2, delay: i * 0.03 }}
                                whileHover={{ 
                                  scale: 1.1, 
                                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
                                }}
                              >
                                {renderEntityIcon(item)}
                              </motion.div>
                            </Link>
                          ))}
                          {filteredTierList[activeTab as keyof typeof filteredTierList][tier as keyof typeof filteredTierList.units]?.length === 0 && (
                            <div className="h-16 w-full flex items-center justify-center text-cream/50 text-sm">
                              No {activeTab} in this tier
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Meta Highlights */}
        <div className="lg:w-2/6 flex flex-col gap-2">
          {standardHighlights.map((highlight, i) => {
            const highlightData = filteredHighlights?.find((h: any) => h.type === highlight.type);
            const highlightEntity = highlightData?.getPreferredVariant(activeTab);
            
            return (
              <motion.div 
                key={i} 
                className="h-full"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <MetaHighlightCard 
                  highlight={highlightEntity || null}
                  title={highlight.title}
                  icon={highlight.icon}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Meta Insights Dashboard */}
      <MetaInsightsDashboard />
    </Layout>
  );
}
