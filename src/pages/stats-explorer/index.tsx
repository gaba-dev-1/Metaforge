import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTftData } from '@/utils/useTftData';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { UnitIcon, Card, Layout, LoadingState, ErrorMessage } from '@/components/ui';
import { FeatureBanner, HeaderBanner, StatsCarousel, EntityTabs, ContextualFilterSidebar } from '@/components/common';
import type { EntityType, FilterOption, FilterState } from '@/components/common';
import unitsJson from 'public/mapping/units.json';
import itemsJson from 'public/mapping/items.json';
import traitsJson from 'public/mapping/traits.json';
import { parseCompTraits } from '@/utils/dataProcessing';
import { getEntityIcon, DEFAULT_ICONS, getTierIcon } from '@/utils/paths';
import { BaseStats, ProcessedDisplayTrait } from '@/types';
import { motion } from 'framer-motion';

interface NamedEntity {
  name: string;
  [key: string]: any;
}

interface ProcessedEntity extends BaseStats {
  avgPlacement: number;
  winRate: number;
  top4Rate: number;
  displayIcon?: string;
  tierIcon?: string;
  placementSum?: number;
  winRateSum?: number;
  top4RateSum?: number;
  cost?: number;
  category?: string;
  tier?: number;
  traits?: any[];
  originalUnits?: any[];
  units?: any[];
  numUnits?: number;
}

type SortField = 'count' | 'avgPlacement' | 'winRate' | 'top4Rate';
type SortDirection = 'asc' | 'desc';

interface ContextualFilter {
  entity: string;
  entityType: 'unit' | 'trait' | 'item';
  starLevel?: string[];
  itemsHeld?: string[];
  item1?: string;
  item2?: string;
  item3?: string;
  traitTier?: string;
  unitHolders?: string[];
  itemCombos?: string[];
}

export default function StatsExplorer() {
  const router = useRouter();
  
  const tftDataResult = useTftData() as unknown as Record<string, any>;
  const data = tftDataResult?.data || null;
  const isLoading = tftDataResult?.isLoading || false;
  const error = tftDataResult?.error || null;
  const handleRetry = tftDataResult?.handleRetry || (() => {});
  
  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<EntityType>('units');
  const [sort, setSort] = useState<SortField>('count');
  const [dir, setDir] = useState<SortDirection>('desc');
  const [showConditions, setShowConditions] = useState<boolean>(false);
  
  // Category filters state
  const [categoryFilters, setCategoryFilters] = useState<FilterState>({ all: true });
  
  // Active contextual filters - these should NOT reset when tab changes
  const [activeFilters, setActiveFilters] = useState<ContextualFilter[]>([]);
  
  // Generate relation maps for contextual filters
  const relationships = useMemo(() => {
    const unitItemMap: Record<string, string[]> = {};
    const itemUnitMap: Record<string, string[]> = {};
    const itemComboMap: Record<string, string[]> = {};
    
    if (data?.compositions) {
      data.compositions.forEach((comp: any) => {
        comp.units.forEach((unit: any) => {
          if (!unit.id || !unit.items) return;
          
          if (!unitItemMap[unit.id]) {
            unitItemMap[unit.id] = [];
          }
          
          unit.items.forEach((item: any) => {
            if (!item.id) return;
            
            if (!unitItemMap[unit.id].includes(item.id)) {
              unitItemMap[unit.id].push(item.id);
            }
            
            if (!itemUnitMap[item.id]) {
              itemUnitMap[item.id] = [];
            }
            
            if (!itemUnitMap[item.id].includes(unit.id)) {
              itemUnitMap[item.id].push(unit.id);
            }
            
            (unit.items || []).forEach((otherItem: any) => {
              if (!otherItem.id || otherItem.id === item.id) return;
              
              if (!itemComboMap[item.id]) {
                itemComboMap[item.id] = [];
              }
              
              if (!itemComboMap[item.id].includes(otherItem.id)) {
                itemComboMap[item.id].push(otherItem.id);
              }
            });
          });
        });
      });
    }
    
    return { unitItemMap, itemUnitMap, itemComboMap };
  }, [data]);
  
  // Prepare entity options for filtering
  const allEntityOptions = useMemo(() => {
    return {
      units: Object.entries(unitsJson.units)
        .map(([id, u]: [string, any]) => ({ 
          id, 
          name: u.name, 
          icon: u.icon, 
          cost: u.cost 
        }))
        .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name)),
      items: Object.entries(itemsJson.items)
        .filter(([_, i]: [string, any]) => i.category !== 'component')
        .map(([id, i]: [string, any]) => ({ 
          id, 
          name: i.name, 
          icon: i.icon, 
          category: i.category 
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      traits: [...Object.entries(traitsJson.origins), ...Object.entries(traitsJson.classes)]
        .map(([id, t]: [string, any]) => ({ 
          id, 
          name: t.name, 
          icon: t.icon
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    };
  }, []);

  // Clear search and RESET category filters when tab changes, but keep contextual filters
  useEffect(() => {
    setSearch('');
    setCategoryFilters({ all: true });
    // Note: We do NOT reset activeFilters here
  }, [activeTab]);

  // Clear all filters (both category and contextual)
  const clearAllFilters = () => {
    setActiveFilters([]);
    setCategoryFilters({ all: true });
  };
  
  // Add a new contextual filter
  const addFilter = (filter: ContextualFilter) => {
    setActiveFilters(prev => {
      const existing = prev.findIndex(f => 
        f.entity === filter.entity && f.entityType === filter.entityType
      );
      
      if (existing >= 0) {
        const newFilters = [...prev];
        newFilters[existing] = filter;
        return newFilters;
      } else {
        return [...prev, filter];
      }
    });
  };
  
  // Remove a contextual filter
  const removeFilter = (index: number) => {
    setActiveFilters(prev => prev.filter((_, i) => i !== index));
  };

  // Handle category filter changes
  const handleCategoryFilterChange = (filterId: string) => {
    setCategoryFilters(prev => {
      if (filterId === 'all') {
        return { all: true };
      }
      
      const { all, ...rest } = prev;
      const newState = { ...rest, [filterId]: !rest[filterId] };
      
      const hasActiveFilters = Object.entries(newState)
        .some(([key, value]) => key !== 'all' && value);
      
      return hasActiveFilters ? { all: false, ...newState } : { all: true };
    });
  };

  // IMPROVED data processing with proper trait grouping and category filtering
  const data_processed = useMemo(() => {
    if (!data?.compositions?.length) {
      return { units: [], items: [], traits: [], comps: [] };
    }
    
    const process = (type: EntityType): ProcessedEntity[] => {
      const entities: Record<string, any> = {};
      
      // Filter compositions based on contextual filters
      const filteredCompositions = data.compositions.filter((comp: any) => {
        if (activeFilters.length === 0) return true;
        
        for (const filter of activeFilters) {
          let matchesFilter = false;
          
          if (filter.entityType === 'unit') {
            const unitInComp = comp.units.find((u: any) => u.id === filter.entity);
            if (!unitInComp) continue;
            
            if (filter.starLevel?.length) {
              matchesFilter = true;
            }
            
            let hasAllSpecifiedItems = true;
            if (filter.item1) {
              const hasItem1 = (unitInComp.items || []).some((item: any) => item.id === filter.item1);
              if (!hasItem1) hasAllSpecifiedItems = false;
            }
            if (filter.item2) {
              const hasItem2 = (unitInComp.items || []).some((item: any) => item.id === filter.item2);
              if (!hasItem2) hasAllSpecifiedItems = false;
            }
            if (filter.item3) {
              const hasItem3 = (unitInComp.items || []).some((item: any) => item.id === filter.item3);
              if (!hasItem3) hasAllSpecifiedItems = false;
            }
            
            if ((filter.item1 || filter.item2 || filter.item3) && !hasAllSpecifiedItems) {
              continue;
            }
            
            if (!filter.starLevel?.length && !filter.item1 && !filter.item2 && !filter.item3) {
              matchesFilter = true;
            } else {
              matchesFilter = true;
            }
          }
          else if (filter.entityType === 'trait') {
            const traitInComp = comp.traits.find((t: any) => t.id === filter.entity);
            if (!traitInComp) continue;
            
            if (filter.traitTier) {
              if (traitInComp.tier < parseInt(filter.traitTier)) continue;
              matchesFilter = true;
            } else {
              matchesFilter = true;
            }
          }
          else if (filter.entityType === 'item') {
            let hasItem = false;
            let matchesHolders = true;
            
            for (const unit of comp.units) {
              if ((unit.items || []).some((i: any) => i.id === filter.entity)) {
                hasItem = true;
                
                if (filter.unitHolders?.length) {
                  if (!filter.unitHolders.includes(unit.id)) {
                    matchesHolders = false;
                  }
                }
                
                if (filter.itemCombos?.length) {
                  const hasAnyCombo = filter.itemCombos.some(comboId => 
                    (unit.items || []).some((i: any) => i.id === comboId)
                  );
                  
                  if (!hasAnyCombo) {
                    matchesHolders = false;
                  }
                }
                
                if (matchesHolders) break;
              }
            }
            
            if (!hasItem || !matchesHolders) continue;
            matchesFilter = true;
          }
          
          if (matchesFilter) return true;
        }
        
        return false;
      });
      
      // Handle different entity types
      if (type === 'units') {
        filteredCompositions.forEach((comp: any) => {
          comp.units.forEach((unit: any) => {
            if (!unit?.id) return;
            
            if (!entities[unit.id]) {
              entities[unit.id] = { 
                ...unit, 
                count: 0, 
                winRateSum: 0, 
                top4RateSum: 0, 
                placementSum: 0
              };
            }
            
            entities[unit.id].count += comp.count ?? 0;
            entities[unit.id].placementSum += (comp.avgPlacement ?? 0) * (comp.count ?? 0);
            entities[unit.id].winRateSum += ((comp.winRate ?? 0) / 100) * (comp.count ?? 0);
            entities[unit.id].top4RateSum += ((comp.top4Rate ?? 0) / 100) * (comp.count ?? 0);
          });
        });
      } 
      else if (type === 'items') {
        filteredCompositions.forEach((comp: any) => {
          comp.units.forEach((unit: any) => {
            (unit.items || []).forEach((item: any) => {
              if (!item?.id) return;
              
              if (!entities[item.id]) {
                entities[item.id] = { 
                  ...item, 
                  count: 0, 
                  winRateSum: 0, 
                  top4RateSum: 0, 
                  placementSum: 0
                };
              }
              
              entities[item.id].count += comp.count ?? 0;
              entities[item.id].placementSum += (comp.avgPlacement ?? 0) * (comp.count ?? 0);
              entities[item.id].winRateSum += ((comp.winRate ?? 0) / 100) * (comp.count ?? 0);
              entities[item.id].top4RateSum += ((comp.top4Rate ?? 0) / 100) * (comp.count ?? 0);
            });
          });
        });
      }
      else if (type === 'traits') {
        // MAJOR FIX: Group traits by trait ID, accumulating across all tiers
        filteredCompositions.forEach((comp: any) => {
          comp.traits.forEach((trait: any) => {
            if (!trait?.id) return;
            
            const entityKey = trait.id; // Group by trait ID, not tier
            
            if (!entities[entityKey]) {
              // Initialize with the highest tier version we've seen
              entities[entityKey] = { 
                ...trait, 
                count: 0, 
                winRateSum: 0, 
                top4RateSum: 0, 
                placementSum: 0,
                maxTier: trait.tier,
                maxNumUnits: trait.numUnits,
                tierFrequency: {}
              };
            }
            
            // Track tier frequency for display
            if (!entities[entityKey].tierFrequency[trait.tier]) {
              entities[entityKey].tierFrequency[trait.tier] = 0;
            }
            entities[entityKey].tierFrequency[trait.tier] += comp.count || 1;
            
            // Keep track of the highest tier and unit count seen
            if (trait.tier > entities[entityKey].maxTier) {
              entities[entityKey].maxTier = trait.tier;
              entities[entityKey].maxNumUnits = trait.numUnits;
              entities[entityKey].tierIcon = trait.tierIcon;
            }
            
            entities[entityKey].count += comp.count ?? 0;
            entities[entityKey].placementSum += (comp.avgPlacement ?? 0) * (comp.count ?? 0);
            entities[entityKey].winRateSum += ((comp.winRate ?? 0) / 100) * (comp.count ?? 0);
            entities[entityKey].top4RateSum += ((comp.top4Rate ?? 0) / 100) * (comp.count ?? 0);
          });
        });
      }
      else if (type === 'comps') {
        filteredCompositions.forEach((comp: any) => {
          if (!comp?.id) return;
          
          if (!entities[comp.id]) {
            entities[comp.id] = { 
              ...comp, 
              count: 0, 
              winRateSum: 0, 
              top4RateSum: 0, 
              placementSum: 0,
              // Preserve original composition properties for categorization
              units: comp.units,
              traits: comp.traits
            };
          }
          
          entities[comp.id].count += comp.count ?? 0;
          entities[comp.id].placementSum += (comp.avgPlacement ?? 0) * (comp.count ?? 0);
          entities[comp.id].winRateSum += ((comp.winRate ?? 0) / 100) * (comp.count ?? 0);
          entities[comp.id].top4RateSum += ((comp.top4Rate ?? 0) / 100) * (comp.count ?? 0);
        });
      }
      
      // Process entities and calculate final stats
      const processedEntities = Object.values(entities)
        .filter(e => e.count > 0)
        .map(e => {
          const avgPlacement = (e.placementSum || 0) / (e.count || 1);
          const winRate = ((e.winRateSum || 0) / (e.count || 1)) * 100;
          const top4Rate = ((e.top4RateSum || 0) / (e.count || 1)) * 100;
          
          const processedEntity = {
            id: e.id,
            name: e.name,
            icon: e.icon,
            count: e.count,
            avgPlacement,
            winRate,
            top4Rate,
            cost: e.cost,
            category: e.category,
            tier: e.maxTier || e.tier,
            numUnits: e.maxNumUnits || e.numUnits,
            displayIcon: e.displayIcon,
            tierIcon: e.tierIcon,
            // Preserve units and traits for compositions
            units: e.units,
            traits: e.traits
          };
          
          // For traits, determine the best display icon
          if (type === 'traits' && e.maxTier) {
            const traitData = traitsJson.origins[e.id as keyof typeof traitsJson.origins] || 
                             traitsJson.classes[e.id as keyof typeof traitsJson.classes];
            
            if (traitData) {
              processedEntity.displayIcon = getTierIcon(e.id, e.maxNumUnits || 1);
              processedEntity.tierIcon = processedEntity.displayIcon;
            }
          }
          
          return processedEntity;
        });

      // Apply category filtering AFTER processing
      let categoryFilteredEntities = processedEntities;
      
      if (!categoryFilters.all) {
        categoryFilteredEntities = processedEntities.filter(entity => {
          if (type === 'units' && entity.cost !== undefined) {
            return categoryFilters[entity.cost.toString()];
          } else if (type === 'items' && entity.category) {
            return categoryFilters[entity.category];
          } else if (type === 'traits') {
            // For traits, check if it's an origin or class
            const isOrigin = Object.keys(traitsJson.origins).includes(entity.id);
            return categoryFilters[isOrigin ? 'origin' : 'class'];
          } else if (type === 'comps') {
            // For comps, implement some basic categorization
            // This is simplified - you might want more sophisticated logic
            const hasHighCostUnits = entity.units?.some((u: any) => u.cost >= 4);
            const category = hasHighCostUnits ? 'fast9' : 'reroll';
            return categoryFilters[category];
          }
          return true;
        });
      }
      
      return categoryFilteredEntities;
    };
    
    // Filter by search term
    const matchSearch = (e: NamedEntity): boolean => 
      !search || e.name.toLowerCase().includes(search.toLowerCase());
    
    // Sort function
    const sortFn = (a: ProcessedEntity, b: ProcessedEntity): number => {
      const av = a[sort] || 0, bv = b[sort] || 0;
      return dir === 'asc' ? av - bv : bv - av;
    };
    
    // Process and filter each entity type
    return {
      units: process('units').filter(matchSearch).sort(sortFn),
      items: process('items').filter(matchSearch).sort(sortFn),
      traits: process('traits').filter(matchSearch).sort(sortFn),
      comps: process('comps').filter(matchSearch).sort(sortFn)
    };
  }, [data, activeFilters, categoryFilters, search, sort, dir, activeTab]);

  // Column definitions
  const columns = [
    { id: 'count', name: 'Frequency' },
    { id: 'avgPlacement', name: 'Avg Place' },
    { id: 'winRate', name: 'Win %' },
    { id: 'top4Rate', name: 'Top 4 %' }
  ];

  // Category options for filter buttons - FIXED to work with category filters
  const getCategoryOptions = () => {
    switch(activeTab) {
      case 'units':
        return Array.from(new Set(allEntityOptions.units.map(u => u.cost?.toString() || '')))
          .filter(Boolean)
          .map(cost => ({ id: cost, name: `${cost} Cost` }))
          .sort((a, b) => parseInt(a.id) - parseInt(b.id));
      case 'items':
        return Array.from(
          new Set(allEntityOptions.items.map(i => i.category).filter(Boolean))
        ).map(c => ({ 
          id: c || '', 
          name: c ? c.replace(/-/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase()) : ''
        }));
      case 'traits':
        return [
          { id: 'origin', name: 'Origins' },
          { id: 'class', name: 'Classes' }
        ];
      case 'comps':
        return [
          { id: 'fast9', name: 'Fast 9' },
          { id: 'reroll', name: 'Reroll' },
          { id: 'standard', name: 'Standard' }
        ];
      default:
        return [];
    }
  };

  // Toggle conditions panel
  const toggleConditions = () => {
    setShowConditions(!showConditions);
  };
  
  // Get class for conditional styling with updated thresholds
  const getStatColor = (item: ProcessedEntity, stat: string): string => {
    if (stat === 'avgPlacement') {
      if (item.avgPlacement < 4.1) return 'text-gold font-medium';
      if (item.avgPlacement < 4.4) return 'text-amber-300 font-medium';
      if (item.avgPlacement > 4.8) return 'text-red-400';
      return 'text-cream';
    }
    if (stat === 'winRate') {
      if (item.winRate > 15) return 'text-gold font-medium';
      if (item.winRate > 12.5) return 'text-amber-300 font-medium';
      if (item.winRate < 8) return 'text-red-400';
      return 'text-cream';
    }
    if (stat === 'top4Rate') {
      if (item.top4Rate > 55) return 'text-gold font-medium';
      if (item.top4Rate > 50) return 'text-amber-300 font-medium';
      if (item.top4Rate < 45) return 'text-red-400';
      return 'text-cream';
    }
    return 'text-cream';
  };

  // Loading and error states
  if (isLoading) return (
    <Layout>
      <LoadingState message="Loading stats data..." />
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="mt-6">
        <ErrorMessage 
          message={error && typeof error === 'object' && 'message' in error ? String(error.message) : 'An error occurred'} 
          onRetry={handleRetry} 
        />
      </div>
    </Layout>
  );

  return (
    <Layout title="Stats Explorer">
      <HeaderBanner />
      <StatsCarousel />
      
      <div className="mt-8">
        <FeatureBanner title="Stats Explorer - Performance Metrics" />
        
        <EntityTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          filterOptions={getCategoryOptions()}
          filterState={categoryFilters}
          onFilterChange={handleCategoryFilterChange} // FIXED: Now properly connected
          searchValue={search}
          onSearchChange={setSearch}
          showConditionsButton={true}
          showConditions={showConditions}
          onToggleConditions={toggleConditions}
          className="mt-1"
        />

        <div className="flex mt-4">
          <Card className={`p-0 overflow-hidden backdrop-filter backdrop-blur-md bg-brown/10 border border-gold/30 shadow-inner shadow-gold/5 flex-1 flex ${showConditions ? 'rounded-r-none' : ''}`}>
            <div className="stats-table-container w-full">
              <table className="w-full border-collapse stats-table">
                <thead>
                  <tr className="bg-brown-light/30 text-gold text-sm border-b border-gold/30">
                    <th className="px-4 py-3 text-left sticky top-0 bg-brown z-10 backdrop-blur-sm" style={{width:'40%'}}>
                      {activeTab === 'comps' ? 'Comp' : activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
                    </th>
                    {columns.map(col => (
                      <th 
                        key={col.id} 
                        className="px-4 py-3 text-center cursor-pointer sticky top-0 bg-brown z-10 backdrop-blur-sm"
                        style={{width: '15%'}}
                        onClick={() => {
                          setDir(sort === col.id ? (dir === 'asc' ? 'desc' : 'asc') : 'desc');
                          setSort(col.id as SortField);
                        }}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>{col.name}</span>
                          <span className="w-4 ml-1 flex justify-center">
                            {sort === col.id ? 
                              (dir === 'asc' ? <ArrowUp className="h-3 w-3 text-gold" /> : <ArrowDown className="h-3 w-3 text-gold" />) : 
                              null
                            }
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data_processed[activeTab].map((item, idx) => (
                    <motion.tr 
                      key={`${item.id}-${idx}`} 
                      className="border-t border-gold/10 cursor-pointer hover:bg-gold/10 h-16" // FIXED: Add explicit height
                      onClick={() => router.push(`/entity/${activeTab}/${item.id}`)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      whileHover={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {activeTab === 'units' && <UnitIcon unit={item} size="md" />}
                          {activeTab === 'items' && (
                            <img 
                              src={getEntityIcon(item, 'item')} 
                              alt={item.name} 
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = DEFAULT_ICONS.item;
                              }}
                            />
                          )}
                          {activeTab === 'traits' && (
                            <img 
                              src={item.tierIcon || item.displayIcon || getEntityIcon(item, 'trait')} 
                              alt={item.name} 
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = DEFAULT_ICONS.trait;
                              }}
                            />
                          )}
                          {activeTab === 'comps' && item.traits && (
                            <div className="flex gap-1">
                              {parseCompTraits(item.name, item.traits).map((trait: ProcessedDisplayTrait, j: number) => (
                                <img 
                                  key={j} 
                                  src={trait.tierIcon || getEntityIcon(trait, 'trait')} 
                                  alt={trait.name} 
                                  className="w-6 h-6 object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = DEFAULT_ICONS.trait;
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          <div className="font-medium">
                            {item.name}
                            {activeTab === 'traits' && item.numUnits && (
                              <span className="ml-2 text-sm text-cream/80">({item.numUnits} units)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-corona-light">{item.count}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={getStatColor(item, 'avgPlacement')}>
                          {item.avgPlacement?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={getStatColor(item, 'winRate')}>
                          {item.winRate?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={getStatColor(item, 'top4Rate')}>
                          {item.top4Rate?.toFixed(1)}%
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                  {data_processed[activeTab].length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-cream/60">
                        {(activeFilters.length > 0 || !categoryFilters.all) ? (
                          <div className="flex flex-col items-center">
                            <div className="text-gold mb-2">No matches found</div>
                            <div className="text-cream/60 mb-3">Try removing some filters to see more results</div>
                            <button 
                              onClick={clearAllFilters}
                              className="px-3 py-1.5 rounded-md bg-solar-flare/20 border border-solar-flare/40 text-solar-flare hover:bg-solar-flare/30 transition-colors"
                            >
                              Clear All Filters
                            </button>
                          </div>
                        ) : (
                          "No data available"
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <ContextualFilterSidebar
              visible={showConditions}
              entityOptions={allEntityOptions}
              unitItemRelations={relationships.unitItemMap}
              itemUnitRelations={relationships.itemUnitMap}
              itemComboRelations={relationships.itemComboMap}
              filters={activeFilters}
              onAddFilter={addFilter}
              onRemoveFilter={removeFilter}
              onClearAll={() => setActiveFilters([])} // Only clear contextual filters
            />
          </Card>
        </div>
      </div>
    </Layout>
  );
}
