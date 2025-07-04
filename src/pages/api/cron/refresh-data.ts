import type { NextApiRequest, NextApiResponse } from 'next';
import { processMatchData } from '@/utils/dataProcessing';
import { initializeDatabase, saveStats, cleanupOldData } from '@/utils/db';
import { sanitizeForDatabase } from '@/utils/db/sanitizeData';
import { logMessage, LogSeverity } from '@/utils/logger';
import { processAllContinentsInParallel } from '@/utils/continentFetcher';
import _ from 'lodash';
import { Composition, ProcessedItem, ProcessedTrait, ProcessedUnit, ProcessedMatch } from '@/types';

// Ensure API key doesn't expire during execution
export const config = {
  maxDuration: 300, // 5 minutes
};

// Extract and process units from compositions for separate storage
function extractUnits(compositions: Composition[]): ProcessedUnit[] {
  logMessage(LogSeverity.INFO, `Extracting units from ${compositions.length} compositions`);
  
  // Create a map to deduplicate units by ID
  const unitMap: Record<string, ProcessedUnit & {
    weightedPlacementSum?: number;
    weightedWinRateSum?: number;
    weightedTop4RateSum?: number;
  }> = {};
  
  compositions.forEach(composition => {
    (composition.units || []).forEach(unit => {
      if (!unit.id || !unit.name) return;
      
      // Initialize unit if not already in map
      if (!unitMap[unit.id]) {
        unitMap[unit.id] = {
          id: unit.id,
          name: unit.name,
          icon: unit.icon,
          cost: unit.cost || 0,
          count: 0,
          avgPlacement: 0,
          winRate: 0,
          top4Rate: 0,
          playRate: 0,
          totalGames: 0,
          relatedComps: [],
          traits: unit.traits,
          bestItems: unit.bestItems || [],
          // Track weighted sums for accurate statistics
          weightedPlacementSum: 0,
          weightedWinRateSum: 0,
          weightedTop4RateSum: 0,
          stats: {
            count: 0,
            avgPlacement: 0,
            winRate: 0,
            top4Rate: 0
          }
        };
      }
      
      // Get composition weight (either its count or default to 1)
      const compWeight = composition.count || 1;
      
      // Update counts - incrementing by composition weight with safe access
      const existingUnit = unitMap[unit.id];
      existingUnit.count = (existingUnit.count || 0) + compWeight;
      existingUnit.totalGames = (existingUnit.totalGames || 0) + compWeight;
      
      // Add weighted stats using composition weight with safe access
      existingUnit.weightedPlacementSum = (existingUnit.weightedPlacementSum || 0) + 
        (composition.avgPlacement || 0) * compWeight;
      existingUnit.weightedWinRateSum = (existingUnit.weightedWinRateSum || 0) + 
        (composition.winRate || 0) * compWeight;
      existingUnit.weightedTop4RateSum = (existingUnit.weightedTop4RateSum || 0) + 
        (composition.top4Rate || 0) * compWeight;
      
      // Add composition to relatedComps if not already present
      if (!existingUnit.relatedComps?.find(comp => comp.id === composition.id)) {
        // Create a trimmed composition reference to avoid circular references
        const trimmedComp = {
          id: composition.id,
          name: composition.name,
          icon: composition.icon,
          avgPlacement: composition.avgPlacement,
          winRate: composition.winRate,
          top4Rate: composition.top4Rate,
          count: composition.count,
          traits: [], // Add empty traits array to satisfy the Composition type
          units: []   // Add empty units array to satisfy the Composition type
        };
        existingUnit.relatedComps = [...(existingUnit.relatedComps || []), trimmedComp];
      }
    });
  });
  
  // Calculate play rate and update stats object
  const totalComps = compositions.reduce((sum, comp) => sum + (comp.count || 1), 0);
  const units = Object.values(unitMap).map(unit => {
    // Calculate final averages based on weight
    const totalWeight = unit.count || 1;
    unit.avgPlacement = (unit.weightedPlacementSum || 0) / totalWeight;
    unit.winRate = (unit.weightedWinRateSum || 0) / totalWeight;
    unit.top4Rate = (unit.weightedTop4RateSum || 0) / totalWeight;
    
    // Update stats object for consistency
    unit.stats = {
      count: unit.count || 0,
      avgPlacement: unit.avgPlacement,
      winRate: unit.winRate,
      top4Rate: unit.top4Rate
    };
    
    // Clean up temporary properties
    const { weightedPlacementSum, weightedWinRateSum, weightedTop4RateSum, ...cleanUnit } = unit;
    
    // Set playRate
    cleanUnit.playRate = ((cleanUnit.count || 0) / totalComps) * 100;
    
    return cleanUnit;
  });
  
  logMessage(LogSeverity.INFO, `Extracted ${units.length} units from compositions`);
  return units;
}

// Extract and process traits from compositions for separate storage
function extractTraits(compositions: Composition[]): ProcessedTrait[] {
  logMessage(LogSeverity.INFO, `Extracting traits from ${compositions.length} compositions`);
  
  // Create a map to deduplicate traits by ID
  const traitMap: Record<string, ProcessedTrait & {
    weightedPlacementSum?: number;
    weightedWinRateSum?: number;
    weightedTop4RateSum?: number;
  }> = {};
  
  compositions.forEach(composition => {
    (composition.traits || []).forEach(trait => {
      if (!trait.id || !trait.name) return;
      
      // Create key with ID and tier
      const key = `${trait.id}_${trait.tier || 0}`;
      
      // Initialize trait if not already in map
      if (!traitMap[key]) {
        traitMap[key] = {
          id: trait.id,
          name: trait.name,
          icon: trait.icon,
          tier: trait.tier || 0,
          numUnits: trait.numUnits || 0,
          tierIcon: trait.tierIcon,
          count: 0,
          avgPlacement: 0,
          winRate: 0,
          top4Rate: 0,
          playRate: 0,
          totalGames: 0,
          relatedComps: [],
          weightedPlacementSum: 0,
          weightedWinRateSum: 0,
          weightedTop4RateSum: 0,
          stats: {
            count: 0,
            avgPlacement: 0,
            winRate: 0,
            top4Rate: 0
          }
        };
      }
      
      // Get composition weight (either its count or default to 1)
      const compWeight = composition.count || 1;
      
      // Update counts with safe access
      const existingTrait = traitMap[key];
      existingTrait.count = (existingTrait.count || 0) + compWeight;
      existingTrait.totalGames = (existingTrait.totalGames || 0) + compWeight;
      
      // Add weighted stats using composition weight with safe access
      existingTrait.weightedPlacementSum = (existingTrait.weightedPlacementSum || 0) + 
        (composition.avgPlacement || 0) * compWeight;
      existingTrait.weightedWinRateSum = (existingTrait.weightedWinRateSum || 0) + 
        (composition.winRate || 0) * compWeight;
      existingTrait.weightedTop4RateSum = (existingTrait.weightedTop4RateSum || 0) + 
        (composition.top4Rate || 0) * compWeight;
      
      // Add composition to relatedComps if not already present
      if (!existingTrait.relatedComps?.find(comp => comp.id === composition.id)) {
        // Create a trimmed composition reference to avoid circular references
        const trimmedComp = {
          id: composition.id,
          name: composition.name,
          icon: composition.icon,
          avgPlacement: composition.avgPlacement,
          winRate: composition.winRate,
          top4Rate: composition.top4Rate,
          count: composition.count,
          traits: [], // Add empty traits array to satisfy the Composition type
          units: []   // Add empty units array to satisfy the Composition type
        };
        existingTrait.relatedComps = [...(existingTrait.relatedComps || []), trimmedComp];
      }
    });
  });
  
  // Calculate play rate and update stats object
  const totalTraits = Object.values(traitMap).reduce((sum: number, trait: any) => sum + (trait.count || 0), 0);
  const traits = Object.values(traitMap).map(trait => {
    // Calculate final averages based on weight
    const totalWeight = trait.count || 1;
    trait.avgPlacement = (trait.weightedPlacementSum || 0) / totalWeight;
    trait.winRate = (trait.weightedWinRateSum || 0) / totalWeight;
    trait.top4Rate = (trait.weightedTop4RateSum || 0) / totalWeight;
    
    // Update stats object for consistency
    trait.stats = {
      count: trait.count || 0,
      avgPlacement: trait.avgPlacement,
      winRate: trait.winRate,
      top4Rate: trait.top4Rate
    };
    
    // Clean up temporary properties
    const { weightedPlacementSum, weightedWinRateSum, weightedTop4RateSum, ...cleanTrait } = trait;
    
    // Set playRate
    cleanTrait.playRate = ((cleanTrait.count || 0) / totalTraits) * 100;
    
    return cleanTrait;
  });
  
  logMessage(LogSeverity.INFO, `Extracted ${traits.length} traits from compositions`);
  return traits;
}

// Extract and process items from compositions for separate storage
function extractItems(compositions: Composition[]): ProcessedItem[] {
  logMessage(LogSeverity.INFO, `Extracting items from ${compositions.length} compositions`);
  
  // First pass: collect all items and their stats
  const itemMap: Record<string, {
    basic: {
      id: string;
      name: string;
      icon: string;
      category?: string;
    };
    stats: {
      count: number;
      totalGames: number;
      placementSum: number;
      winRateSum: number;
      top4RateSum: number;
    };
    comps: Set<string>;
    units: Record<string, {
      id: string;
      name: string;
      icon: string;
      cost: number;
      count: number;
      winRateSum: number;
      placementSum: number;
      top4RateSum: number;
      totalGames: number;
      relatedComps: Set<string>;
    }>;
  }> = {};
  
  // First pass - collect basic data with proper accumulation
  compositions.forEach(comp => {
    comp.units.forEach(unit => {
      (unit.items || []).forEach(item => {
        if (!item.id || !item.name) return;
        
        // Create or get item entry
        if (!itemMap[item.id]) {
          itemMap[item.id] = {
            basic: {
              id: item.id,
              name: item.name,
              icon: item.icon,
              category: item.category
            },
            stats: {
              count: 0,
              totalGames: 0,
              placementSum: 0,
              winRateSum: 0,
              top4RateSum: 0
            },
            comps: new Set<string>(),
            units: {}
          };
        }
        
        // Get composition weight
        const compWeight = comp.count || 1;
        
        // Update stats with proper weighting
        const itemEntry = itemMap[item.id];
        itemEntry.stats.count++;
        itemEntry.stats.totalGames += compWeight;
        itemEntry.stats.placementSum += (comp.avgPlacement || 0) * compWeight;
        itemEntry.stats.winRateSum += (comp.winRate || 0) * compWeight;
        itemEntry.stats.top4RateSum += (comp.top4Rate || 0) * compWeight;
        
        // Add composition ID
        itemEntry.comps.add(comp.id);
        
        // Add or update unit with proper stats accumulation
        if (!itemEntry.units[unit.id]) {
          itemEntry.units[unit.id] = {
            id: unit.id,
            name: unit.name,
            icon: unit.icon,
            cost: unit.cost || 0,
            count: 0,
            winRateSum: 0,
            placementSum: 0,
            top4RateSum: 0,
            totalGames: 0,
            relatedComps: new Set<string>()
          };
        }
        
        // Update unit stats with proper weighted accumulation
        itemEntry.units[unit.id].count++;
        itemEntry.units[unit.id].totalGames += compWeight;
        itemEntry.units[unit.id].placementSum += (comp.avgPlacement || 0) * compWeight;
        itemEntry.units[unit.id].winRateSum += (comp.winRate || 0) * compWeight;
        itemEntry.units[unit.id].top4RateSum += (comp.top4Rate || 0) * compWeight;
        itemEntry.units[unit.id].relatedComps.add(comp.id);
      });
    });
  });
  
  // Create trimmed compositions for reference
  const trimmedComps: Record<string, any> = {};
  compositions.forEach(comp => {
    trimmedComps[comp.id] = {
      id: comp.id,
      name: comp.name,
      icon: comp.icon,
      avgPlacement: comp.avgPlacement,
      winRate: comp.winRate,
      top4Rate: comp.top4Rate,
      count: comp.count,
      stats: {
        count: comp.count || 0,
        avgPlacement: comp.avgPlacement || 0,
        winRate: comp.winRate || 0,
        top4Rate: comp.top4Rate || 0
      },
      traits: [], // Empty arrays to satisfy Composition type
      units: []
    };
  });
  
  // Second pass - build final items with proper stats structure
  const items: ProcessedItem[] = [];
  
  for (const [itemId, entry] of Object.entries(itemMap)) {
    // Calculate item averages with proper weighting
    const itemWeight = entry.stats.totalGames || 1;
    const avgPlacement = entry.stats.placementSum / itemWeight;
    const winRate = (entry.stats.winRateSum / itemWeight);
    const top4Rate = (entry.stats.top4RateSum / itemWeight);
    
    // Process units with this item - creating proper stats structure
    const unitsWithItem = Object.values(entry.units).map(unitData => {
      const unitWeight = unitData.totalGames || 1;
      
      return {
        id: unitData.id,
        name: unitData.name,
        icon: unitData.icon,
        cost: unitData.cost,
        count: unitData.count,
        winRate: (unitData.winRateSum / unitWeight),
        avgPlacement: unitData.placementSum / unitWeight,
        top4Rate: (unitData.top4RateSum / unitWeight),
        stats: {
          count: unitData.count,
          winRate: (unitData.winRateSum / unitWeight),
          avgPlacement: unitData.placementSum / unitWeight,
          top4Rate: (unitData.top4RateSum / unitWeight)
        },
        relatedComps: Array.from(unitData.relatedComps)
          .map(compId => trimmedComps[compId])
          .filter(Boolean)
      };
    }).sort((a, b) => b.winRate - a.winRate);
    
    // Build related compositions
    const relatedComps = Array.from(entry.comps)
      .map(compId => trimmedComps[compId])
      .filter(Boolean);
    
    // Build final item
    const processedItem: ProcessedItem = {
      id: itemId,
      name: entry.basic.name,
      icon: entry.basic.icon,
      category: entry.basic.category,
      count: entry.stats.count,
      avgPlacement,
      winRate,
      top4Rate,
      playRate: 0, // Will be calculated later
      totalGames: entry.stats.totalGames,
      stats: {
        count: entry.stats.count,
        avgPlacement,
        winRate,
        top4Rate
      },
      unitsWithItem,
      relatedComps
    };
    
    items.push(processedItem);
  }
  
  // Calculate play rates
  const totalCount = items.reduce((sum, item) => sum + (item.count || 0), 0) || 1;
  items.forEach(item => {
    item.playRate = ((item.count || 0) / totalCount) * 100;
  });
  
  logMessage(LogSeverity.INFO, `Extracted ${items.length} items from compositions`);
  return items;
}

// Package and save entities
async function saveEntityData(
  processedData: any, 
  region: string, 
  entityType: 'compositions' | 'units' | 'traits' | 'items'
): Promise<boolean> {
  try {
    if (!processedData) {
      logMessage(LogSeverity.ERROR, `No data to save for ${entityType}/${region}`);
      return false;
    }
    
    let entities: any[] = [];
    let summary: any = { totalGames: 0, avgPlacement: 0, topEntities: [] };
    
    // Extract the correct entities based on type
    if (entityType === 'compositions') {
      entities = processedData.compositions || [];
      summary = processedData.summary || { totalGames: 0, avgPlacement: 0, topComps: [], topEntities: [] };
      
      logMessage(LogSeverity.INFO, `Saving ${entities.length} compositions for ${region}`);
    } else if (entityType === 'units') {
      entities = extractUnits(processedData.compositions || []);
      summary = {
        totalGames: processedData.summary?.totalGames || 0,
        avgPlacement: processedData.summary?.avgPlacement || 0,
        topUnits: entities.slice(0, 5).sort((a, b) => (b.winRate || 0) - (a.winRate || 0))
      };
      
      logMessage(LogSeverity.INFO, `Saving ${entities.length} units for ${region}`);
    } else if (entityType === 'traits') {
      entities = extractTraits(processedData.compositions || []);
      summary = {
        totalGames: processedData.summary?.totalGames || 0,
        avgPlacement: processedData.summary?.avgPlacement || 0,
        topTraits: entities.slice(0, 5).sort((a, b) => (b.winRate || 0) - (a.winRate || 0))
      };
      
      logMessage(LogSeverity.INFO, `Saving ${entities.length} traits for ${region}`);
    } else if (entityType === 'items') {
      entities = extractItems(processedData.compositions || []);
      summary = {
        totalGames: processedData.summary?.totalGames || 0,
        avgPlacement: processedData.summary?.avgPlacement || 0,
        topItems: entities.slice(0, 5).sort((a, b) => (b.winRate || 0) - (a.winRate || 0))
      };
      
      logMessage(LogSeverity.INFO, `Saving ${entities.length} items for ${region}`);
    }
    
    // Skip if no entities to save
    if (!entities.length) {
      logMessage(LogSeverity.WARN, `No ${entityType} to save for ${region}`);
      return false;
    }
    
    // Sort entities by win rate
    entities = entities.sort((a, b) => (b.winRate || 0) - (a.winRate || 0));
    
    // Create data object based on entity type
    const dataObj: any = {
      region,
      summary
    };
    
    // Add entities to the appropriate field
    dataObj[entityType] = entities;
    
    // Sanitize data for database storage
    const sanitizedData = sanitizeForDatabase(dataObj);
    
    logMessage(LogSeverity.INFO, 
      `Sanitized ${entityType} data for ${region}: ${Math.round(JSON.stringify(sanitizedData).length / 1024)}KB`);
    
    // Save to database
    return await saveStats(entityType, region, sanitizedData);
  } catch (error) {
    logMessage(LogSeverity.ERROR, `Failed to save ${entityType} data for ${region}:`, error);
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify cron secret for security
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    logMessage(LogSeverity.INFO, 'Starting data refresh job with parallel continent processing');
    
    // Initialize database if needed
    await initializeDatabase();
    
    // Process all regions in parallel by continent
    // Use the specified n matches per region
    const allMatches: ProcessedMatch[] = await processAllContinentsInParallel(100);
    
    // Skip global processing if insufficient matches
    if (allMatches.length < 20) {
      logMessage(LogSeverity.WARN, 'Insufficient total matches, skipping global stats processing');
      return res.status(200).json({ 
        success: true,
        message: 'Job completed, but insufficient matches for global stats',
        matchCount: allMatches.length
      });
    }
    
    // Process and save global data for all entity types
    logMessage(LogSeverity.INFO, `Processing ${allMatches.length} matches for global data`);
    const globalData = processMatchData(allMatches, 'all');
    
    if (!globalData || !globalData.compositions || globalData.compositions.length === 0) {
      logMessage(LogSeverity.WARN, 'No global compositions generated, skipping');
      return res.status(200).json({
        success: true,
        message: 'Job completed but no global compositions generated',
        matchCount: allMatches.length
      });
    }
    
    logMessage(LogSeverity.INFO, 
      `Processed ${globalData.compositions.length} global compositions`);
    
    // Save all entity types from the global data
    await saveEntityData(globalData, 'all', 'compositions');
    await saveEntityData(globalData, 'all', 'units');
    await saveEntityData(globalData, 'all', 'traits');
    await saveEntityData(globalData, 'all', 'items');
    
    // Now also process individual regions in parallel
    const regionProcessingPromises = _.groupBy(allMatches, 'region');
    const regionProcessingResults = [];
    
    // Process each region separately - can be done in parallel since we're only processing data
    for (const [region, matches] of Object.entries(regionProcessingPromises)) {
      if (matches.length < 1) {
        logMessage(LogSeverity.WARN, `Insufficient matches for ${region}, skipping stats processing`);
        continue;
      }
      
      // Process data for this region
      logMessage(LogSeverity.INFO, `Processing ${matches.length} matches for ${region}`);
      const regionData = processMatchData(matches, region);
      
      if (!regionData || !regionData.compositions || regionData.compositions.length === 0) {
        logMessage(LogSeverity.WARN, `No compositions generated for ${region}, skipping`);
        continue;
      }
      
      logMessage(LogSeverity.INFO, 
        `Processed ${regionData.compositions.length} compositions for ${region}`);
      
      // Save all entity types for this region
      await saveEntityData(regionData, region, 'compositions');
      await saveEntityData(regionData, region, 'units');
      await saveEntityData(regionData, region, 'traits');
      await saveEntityData(regionData, region, 'items');
      
      regionProcessingResults.push({
        region,
        compositions: regionData.compositions.length,
        matchCount: matches.length
      });
    }
    
    // Clean up old data
    await cleanupOldData(7); // Keep data for 7 days
    
    logMessage(LogSeverity.INFO, `Data refresh completed: ${allMatches.length} total matches`);
    
    return res.status(200).json({ 
      success: true,
      matchCount: allMatches.length,
      regionsProcessed: regionProcessingResults
    });
  } catch (error) {
    logMessage(LogSeverity.ERROR, 'Cron job error', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
