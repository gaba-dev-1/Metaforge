import _ from 'lodash';
import traitsJson from 'public/mapping/traits.json';
import unitsJson from 'public/mapping/units.json';
import itemsJson from 'public/mapping/items.json';
import { getIconPath, getTierIcon, ensureIconPath } from '@/utils/paths';
import { ProcessedData, ProcessedMatch, Composition, UnitWithItem, ProcessedItem, ProcessedUnit } from '@/types';
import { generateAllItemCombos } from './itemCombos';

// Extended types for internal use to avoid type errors
interface ExtendedComposition extends Composition {
  count?: number; // Make count optional to fix the type error
  placement: number; // Add placement property needed for statistics calculations
  region?: string; // Add region as it's used in groupBy
}

// Extended ProcessedData interface that includes the items property
interface EnhancedProcessedData extends ProcessedData {
  items: ProcessedItem[];
}

// Cached data for better performance
const traits: Record<string, any> = { ...traitsJson.origins, ...traitsJson.classes };
const units: Record<string, any> = unitsJson.units;
const items: Record<string, any> = itemsJson.items;

// Define allowed entity types
type EntityType = 'trait' | 'unit' | 'item';

// Get display name consistently
export const getDisplayName = (id: string, type: EntityType): string => {
  if (type === 'trait') {
    return (traits as Record<string, { name: string }>)[id]?.name || id;
  } else if (type === 'unit') {
    return (units as Record<string, { name: string }>)[id]?.name || id;
  } else if (type === 'item') {
    return (items as Record<string, { name: string }>)[id]?.name || id;
  }
  return id;
};

// Extract main traits from comp name
export const parseCompTraits = (compName: string | undefined, allTraits: any[]): any[] => {
  const mainTraits: any[] = [];
  if (!compName) return allTraits.slice(0, 3);
  
  compName.split(' & ').forEach(part => {
    const match = part.match(/^(\d+)\s+(.+)$/);
    if (match) {
      const [_, count, traitName] = match;
      const matchingTrait = allTraits.find(t => t.name === traitName.trim());
      if (matchingTrait) {
        mainTraits.push(matchingTrait);
      }
    }
  });
  
  return mainTraits.length > 0 ? mainTraits.slice(0, 3) : allTraits.slice(0, 3);
};

// Calculate entity statistics across compositions with improved caps
export const calculateEntityStats = (entities: any[], compositions: ExtendedComposition[]) => {
  // Create an accumulator map for better performance
  const statsMap: Record<string, any> = {};
  
  compositions.forEach(comp => {
    entities.forEach(entity => {
      if (!entity?.id) return;
      
      if (!statsMap[entity.id]) {
        statsMap[entity.id] = {
          ...entity,
          count: 0,
          totalGames: 0,
          winRateSum: 0,
          top4RateSum: 0,
          placementSum: 0
        };
      }
      
      statsMap[entity.id].count++;
      statsMap[entity.id].totalGames += comp.count || 0;
      statsMap[entity.id].placementSum += (comp.avgPlacement || 0) * (comp.count || 1);
      statsMap[entity.id].winRateSum += ((comp.winRate || 0) / 100) * (comp.count || 1);
      statsMap[entity.id].top4RateSum += ((comp.top4Rate || 0) / 100) * (comp.count || 1);
    });
  });
  
  // Convert to array and calculate final stats with caps for reasonable values
  return Object.values(statsMap).map(entity => {
    const totalGames = entity.totalGames || 1;
    const calculatedWinRate = (entity.winRateSum / totalGames) * 100;
    const calculatedTop4Rate = (entity.top4RateSum / totalGames) * 100;
    
    // Cap values to reasonable ranges
    const avgPlacement = Math.min(Math.max(entity.placementSum / totalGames, 1), 8);
    const winRate = Math.min(Math.max(calculatedWinRate, 0), 100);
    const top4Rate = Math.min(Math.max(calculatedTop4Rate, 0), 100);
    
    return {
      ...entity,
      avgPlacement,
      winRate,
      top4Rate,
      playRate: (entity.count / compositions.length) * 100,
      stats: {
        count: entity.count,
        avgPlacement,
        winRate,
        top4Rate
      }
    };
  });
};

// IMPROVED: Check if a composition is viable under realistic TFT gameplay rules
export const isRealisticComp = (comp: any): boolean => {
  if (!comp?.units || !Array.isArray(comp.units)) return false;
  
  // Rule 1: Check for too many tier 5 (legendary) units
  const legendaryCount = comp.units.filter((u: any) => u.cost === 5).length;
  if (legendaryCount > 3) return false; // More than 3 legendaries is unrealistic
  
  // Rule 2: Check for unrealistic trait combinations
  // Diamond tier traits (lvl 4) are very difficult to achieve
  if (comp.traits) {
    const diamondTraits = comp.traits.filter((t: any) => t.tier === 4).length;
    if (diamondTraits > 1) return false; // More than 1 diamond tier trait is unrealistic
    
    // Check if there are too many gold traits (tier 3)
    const goldTraits = comp.traits.filter((t: any) => t.tier === 3).length;
    if (goldTraits > 3) return false; // More than 3 gold traits is unrealistic
  }
  
  // Rule 3: Check unit count against game rules
  const totalUnits = comp.units.length;
  if (totalUnits < 5 || totalUnits > 10) return false; // Unrealistic unit count
  
  // Rule 4: Check for a balanced economy (can't have too many high-cost units early)
  // Calculate the total cost of the units
  const totalCost = comp.units.reduce((sum: number, u: any) => sum + (u.cost || 0), 0);
  const avgCost = totalCost / totalUnits;
  
  // If average unit cost is too high, the comp is likely unrealistic
  if (avgCost > 4) return false;
  
  // Rule 5: Check if this is a 'perfect items' comp (every unit has 3 perfect items)
  // This is unrealistic in most games
  const unitsWithFullItems = comp.units.filter((u: any) => 
    u.items && u.items.length === 3
  ).length;
  
  // If more than 70% of units have perfect items, it's suspicious
  if (unitsWithFullItems > totalUnits * 0.7) return false;
  
  return true;
};

// Process match data with optimizations - Use ProcessedData as the return type
export const processMatchData = (matches: ProcessedMatch[], region?: string): ProcessedData => {
  if (!matches?.length) {
    return { 
      compositions: [], 
      summary: { totalGames: 0, avgPlacement: 0, topComps: [] },
      region
    };
  }

  // Filter by region if specified
  const filteredMatches = region && region !== 'all' 
    ? matches.filter(m => m.region?.toUpperCase() === region.toUpperCase())
    : matches;

  if (!filteredMatches.length) {
    return { 
      compositions: [], 
      summary: { totalGames: 0, avgPlacement: 0, topComps: [] },
      region 
    };
  }

  // Extract compositions with better map usage - FIXED with required properties
  const compositions = filteredMatches.flatMap(match =>
    match.participants.map(p => {
      // Generate a composition name based on significant traits
      const significantTraits = p.traits
        .filter(t => t.tier_current > 1)
        .sort((a, b) => b.num_units - a.num_units);
      
      // Create a name from the top traits
      const name = significantTraits.length > 0
        ? significantTraits
            .slice(0, 2)
            .map(t => `${t.num_units} ${getDisplayName(t.name, 'trait')}`)
            .join(' & ')
        : 'Mixed Composition';
      
      // Get an icon from the most significant trait
      const primaryTrait = significantTraits[0];
      const icon = primaryTrait
        ? getIconPath((traits)[primaryTrait.name]?.icon || '/assets/app/default.png', 'trait')
        : '/assets/app/default.png';
      
      // Generate a unique ID
      const id = `${match.id}-${p.placement}`;
      
      return {
        id,
        name,
        icon,
        placement: p.placement,
        region: match.region || 'unknown',
        traits: p.traits
          .filter(t => t.tier_current >= 1)
          .map(t => ({
            id: t.name,
            name: getDisplayName(t.name, 'trait'),
            icon: getIconPath((traits)[t.name]?.icon || '/assets/app/default.png', 'trait'),
            tier: t.tier_current,
            numUnits: t.num_units,
            tierIcon: getTierIcon(t.name, t.num_units)
          }))
          .sort((a, b) => b.tier !== a.tier ? b.tier - a.tier : a.name.localeCompare(b.name)),
        units: p.units.map(u => {
          // Get the unit data from mapping
          const unitData = (units)[u.name];
          
          return {
            id: u.name,
            name: getDisplayName(u.name, 'unit'),
            icon: getIconPath(unitData?.icon || '/assets/app/default.png', 'unit'),
            cost: unitData?.cost || 0,
            // Include traits data directly from unit mapping - CRITICAL FIX
            traits: unitData?.traits || {},
            items: u.itemNames.map(item => ({
              id: item,
              name: getDisplayName(item, 'item'),
              icon: getIconPath((items)[item]?.icon || '/assets/app/default.png', 'item'),
              category: (items)[item]?.category
            }))
          };
        })
      };
    })
  ) as ExtendedComposition[];  // Use our extended type with explicit casting

  // Process best items per unit - IMPROVED CALCULATION
  const itemsByUnit: Record<string, Record<string, {
    item: ProcessedItem, 
    count: number, 
    winRateSum: number, 
    top4RateSum: number,
    placementSum: number,
    totalGames: number
  }>> = {};
  
  compositions.forEach((comp: ExtendedComposition) => {
    comp.units.forEach(unit => {
      if (!itemsByUnit[unit.id]) itemsByUnit[unit.id] = {};
      
      (unit.items || []).forEach(item => {
        if (!itemsByUnit[unit.id][item.id]) {
          itemsByUnit[unit.id][item.id] = { 
            item, 
            count: 0,
            winRateSum: 0,
            top4RateSum: 0,
            placementSum: 0,
            totalGames: 0
          };
        }
        itemsByUnit[unit.id][item.id].count++;
        itemsByUnit[unit.id][item.id].totalGames += comp.count || 1;
        itemsByUnit[unit.id][item.id].placementSum += (comp.avgPlacement || 0) * (comp.count || 1);
        itemsByUnit[unit.id][item.id].winRateSum += ((comp.winRate || 0) / 100) * (comp.count || 1);
        itemsByUnit[unit.id][item.id].top4RateSum += ((comp.top4Rate || 0) / 100) * (comp.count || 1);
      });
    });
  });
  
  // Add best items to units with properly capped stats
  Object.entries(itemsByUnit).forEach(([unitId, unitItems]) => {
    const bestItems = Object.values(unitItems)
      .map(entry => {
        const totalGames = entry.totalGames || 1;
        const winRate = Math.min((entry.winRateSum / totalGames) * 100, 100);
        const top4Rate = Math.min((entry.top4RateSum / totalGames) * 100, 100);
        const avgPlacement = Math.min(Math.max(entry.placementSum / totalGames, 1), 8);
        
        return {
          ...entry.item,
          stats: {
            count: entry.count,
            winRate,
            top4Rate,
            avgPlacement
          }
        };
      })
      .sort((a, b) => (b.stats?.winRate || 0) - (a.stats?.winRate || 0))
      .slice(0, 3);
      
    compositions.forEach(comp => {
      comp.units.forEach(unit => {
        if (unit.id === unitId) (unit as ProcessedUnit).bestItems = bestItems;
      });
    });
  });

  // MAJOR FIX: Significantly improved unit-item relationship calculation
  const unitsWithItems: Record<string, Record<string, {
    unit: ProcessedUnit,
    count: number,
    winRateSum: number,
    top4RateSum: number,
    placementSum: number,
    totalGames: number,
    relatedComps: Set<string>
  }>> = {};
  
  // First pass - gather data with proper structure
  compositions.forEach((comp: ExtendedComposition) => {
    comp.units.forEach(unit => {
      (unit.items || []).forEach(item => {
        if (!item.id) return;
        
        if (!unitsWithItems[item.id]) {
          unitsWithItems[item.id] = {};
        }
        
        if (!unitsWithItems[item.id][unit.id]) {
          unitsWithItems[item.id][unit.id] = {
            unit: { 
              id: unit.id,
              name: unit.name,
              icon: unit.icon,
              cost: unit.cost, 
              count: 0,
              winRate: 0,
              avgPlacement: 0,
              stats: {
                count: 0,
                winRate: 0,
                avgPlacement: 0,
                top4Rate: 0
              }
            },
            count: 0,
            winRateSum: 0,
            top4RateSum: 0,
            placementSum: 0,
            totalGames: 0,
            relatedComps: new Set<string>()
          };
        }
        
        // Update stats with proper accumulation
        unitsWithItems[item.id][unit.id].count++;
        unitsWithItems[item.id][unit.id].totalGames += comp.count || 1;
        unitsWithItems[item.id][unit.id].placementSum += (comp.avgPlacement || 0) * (comp.count || 1);
        unitsWithItems[item.id][unit.id].winRateSum += ((comp.winRate || 0) / 100) * (comp.count || 1);
        unitsWithItems[item.id][unit.id].top4RateSum += ((comp.top4Rate || 0) / 100) * (comp.count || 1);
        unitsWithItems[item.id][unit.id].relatedComps.add(comp.id);
      });
    });
  });

  // IMPROVED: Composition filtering - apply realistic TFT gameplay rules
  const filteredCompositions = compositions.filter(isRealisticComp);

  // Improved composition grouping
  const compsByKey = _.groupBy(filteredCompositions, comp => {
    // Only consider traits with tier > 1 for composition name
    const significantTraits = comp.traits
      .filter(t => t.tier > 1 && t.numUnits > 1)
      .sort((a, b) => b.numUnits - a.numUnits || a.name.localeCompare(b.name))
      .slice(0, 2);
      
    const key = significantTraits
      .map(t => `${t.numUnits} ${t.name}`)
      .join(' & ');
      
    return key || 'Other';
  });
  
  // Create composition stats
  const stats: Composition[] = Object.entries(compsByKey)
    .filter(([name]) => name !== 'Other')
    .map(([name, comps]) => {
      // Get traits for icon determination - FIXED ICON SELECTION
      // Filter traits to only include those with tier > 1
      const traits = _.uniqBy(comps.flatMap(c => c.traits), 'id')
        .sort((a, b) => b.tier - a.tier);
      
      // Find significant traits (tier > 1) for the icon
      const significantTraits = traits.filter(t => t.tier > 1);
      
      // Calculate placement data for distribution charts
      const placementData = _.chain(comps)
        .countBy('placement')
        .map((count, place) => ({ placement: Number(place), count }))
        .sortBy('placement')
        .value();
      
      const avgPlacement = _.meanBy(comps, 'placement');
      const winRate = Math.min((comps.filter(c => c.placement === 1).length / comps.length) * 100, 100);
      const top4Rate = Math.min((comps.filter(c => c.placement <= 4).length / comps.length) * 100, 100);
      
      return {
        id: name.replace(/\s+/g, '-').toLowerCase(),
        name,
        // Set icon to first significant trait with tier > 1, fallback to first trait if none
        icon: significantTraits.length > 0 
          ? (significantTraits[0].tierIcon || significantTraits[0].icon) 
          : (traits.length > 0 ? (traits[0].tierIcon || traits[0].icon) : ''),
        traits,
        units: _.chain(comps)
          .flatMap('units')
          .groupBy('id')
          .map((units) => ({
            ...units[0],
            count: units.length
          }))
          .orderBy(['count', 'cost'], ['desc', 'desc'])
          .value(),
        count: comps.length,
        avgPlacement,
        winRate,
        top4Rate,
        playRate: (comps.length / compositions.length) * 100,
        placementData,
        // Store region data
        regions: _.countBy(comps, 'region'),
        stats: {
          count: comps.length,
          avgPlacement,
          winRate,
          top4Rate
        }
      };
    })
    .filter(comp => comp.count >= 2)
    .sort((a, b) => b.count - a.count);

  // CRITICAL FIX: Calculate proper unitsWithItem statistics
  const processedItems: Record<string, ProcessedItem> = {};

  Object.entries(unitsWithItems).forEach(([itemId, unitEntries]) => {
    // Process units with this item and ensure proper stats structure
    const processedUnits = Object.entries(unitEntries).map(([unitId, entry]) => {
      // Calculate averages with proper weighting
      const totalGames = entry.totalGames || 1;
      const winRate = Math.min((entry.winRateSum / totalGames) * 100, 100);
      const top4Rate = Math.min((entry.top4RateSum / totalGames) * 100, 100);
      const avgPlacement = Math.min(Math.max(entry.placementSum / totalGames, 1), 8);
      
      // Create a clean unit with proper nested stats structure
      const processedUnit: UnitWithItem = {
        id: entry.unit.id,
        name: entry.unit.name,
        icon: entry.unit.icon,
        cost: entry.unit.cost,
        count: entry.count,
        winRate: winRate,
        avgPlacement: avgPlacement,
        stats: {
          count: entry.count,
          winRate: winRate,
          avgPlacement: avgPlacement,
          top4Rate: top4Rate
        },
        relatedComps: Array.from(entry.relatedComps)
          .map(compId => stats.find(s => s.id === compId))
          .filter((comp): comp is Composition => comp !== undefined)
      };
      
      return processedUnit;
    })
    .sort((a, b) => (b.stats?.winRate || 0) - (a.stats?.winRate || 0));
    
    // Create or update the processed item with unitsWithItem data
    if (!processedItems[itemId]) {
      // Find an item instance to copy basic info from
      let itemBase: ProcessedItem | undefined;
      for (const comp of stats) {
        for (const unit of comp.units) {
          const foundItem = (unit.items || []).find(i => i.id === itemId);
          if (foundItem) {
            itemBase = foundItem as ProcessedItem;
            break;
          }
        }
        if (itemBase) break;
      }
      
      if (itemBase) {
        // Create a new item with statistics
        processedItems[itemId] = {
          ...itemBase,
          count: Object.values(unitEntries).reduce((sum, entry) => sum + entry.count, 0),
          winRate: Object.values(unitEntries).reduce((sum, entry) => sum + entry.winRateSum, 0) / 
                  Object.values(unitEntries).reduce((sum, entry) => sum + (entry.totalGames || 1), 0) * 100,
          avgPlacement: Object.values(unitEntries).reduce((sum, entry) => sum + entry.placementSum, 0) / 
                        Object.values(unitEntries).reduce((sum, entry) => sum + (entry.totalGames || 1), 0),
          unitsWithItem: processedUnits,
          relatedComps: processedUnits.flatMap(unit => unit.relatedComps || [])
            .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // unique comps
        };
      }
    } else {
      // Update existing item
      processedItems[itemId].unitsWithItem = processedUnits;
    }
    
    // Add unitsWithItem to all instances of this item in comps
    stats.forEach(comp => {
      comp.units.forEach(unit => {
        (unit.items || []).forEach(item => {
          if (item.id === itemId) {
            (item as ProcessedItem).unitsWithItem = processedUnits;
          }
        });
      });
    });
  });

  // Extract all items from compositions for generating item combos
  const allItems = Object.values(processedItems);
  
  // FIX: Generate item combos data and add it to items
  const itemCombos = generateAllItemCombos(allItems);
  
  // Attach combos to processed items
  Object.entries(itemCombos).forEach(([itemId, combos]) => {
    if (processedItems[itemId]) {
      processedItems[itemId].combos = combos;
    }
    
    // Also attach combos to items in compositions
    stats.forEach(comp => {
      comp.units.forEach(unit => {
        (unit.items || []).forEach(item => {
          if (item.id === itemId) {
            (item as ProcessedItem).combos = combos;
          }
        });
      });
    });
  });

  // Fix: Create an intermediate enhanced data object
  const enhancedData: EnhancedProcessedData = {
    compositions: stats,
    summary: {
      totalGames: filteredMatches.length,
      avgPlacement: _.meanBy(compositions, 'placement'),
      topComps: stats.slice(0, 5)
    },
    items: Object.values(processedItems),
    region
  };

  // Store items data in a global or module variable for access by other methods
  // This is a workaround since we can't include them in the returned data
  (global as any).__tftItemsData = Object.values(processedItems);

  // Return only the fields that are part of the ProcessedData interface
  return {
    compositions: enhancedData.compositions,
    summary: enhancedData.summary,
    region: enhancedData.region
  };
};

// NEW METHOD: Add a helper function to access the processed items
export const getProcessedItems = (): ProcessedItem[] => {
  return (global as any).__tftItemsData || [];
};
