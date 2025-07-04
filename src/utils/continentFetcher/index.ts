/**
 * ContinentFetcher - Parallel API fetch architecture for TFT data
 * 
 * This module enables parallel fetching across continents while maintaining
 * sequential fetching within regions of the same continent to respect
 * rate limits while maximizing throughput.
 */
import { processRegion, REGIONS_BY_CONTINENT, RegionKey } from '@/utils/api';
import { updateRegionStatus } from '@/utils/db';
import { logMessage, LogSeverity } from '@/utils/logger';
import { ProcessedMatch } from '@/types';

// Define continent processing function type
export type ContinentProcessor = (regions: RegionKey[], matchesPerRegion: number) => Promise<ProcessedMatch[]>;

/**
 * Process all regions within a continent sequentially
 * Respects rate limits by processing one region at a time
 */
export const processContinent: ContinentProcessor = async (regions, matchesPerRegion) => {
  const results: ProcessedMatch[] = [];
  
  // Process each region in the continent sequentially
  for (const region of regions) {
    try {
      logMessage(LogSeverity.INFO, `Processing ${region} in continent group`);
      
      // Process the region and add results - limited to 5 matches per region
      const regionMatches = await processRegion(region, matchesPerRegion);
      results.push(...regionMatches);
      
      // Short delay between regions to avoid potential rate limit issues
      if (regions.indexOf(region) < regions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      // Log error but continue with next region
      logMessage(LogSeverity.ERROR, `Failed to process ${region} in continent`, error);
      
      // Update region status to error
      await updateRegionStatus(
        region, 
        'error', 
        error instanceof Error ? error.message : 'Unknown error during continent processing'
      );
    }
  }
  
  return results;
};

/**
 * Process multiple continents in parallel
 * This is the main entry point for the parallel API fetch architecture
 */
export const processAllContinentsInParallel = async (matchesPerRegion: number = 5): Promise<ProcessedMatch[]> => {
  logMessage(LogSeverity.INFO, `Starting parallel continent processing with ${matchesPerRegion} matches per region`);
  
  // Create processors for each continent
  const continentProcessors = Object.entries(REGIONS_BY_CONTINENT).map(
    ([continent, regions]) => {
      logMessage(LogSeverity.INFO, `Setting up processor for ${continent} with regions: ${regions.join(', ')}`);
      return processContinent(regions, matchesPerRegion);
    }
  );
  
  try {
    // Process all continents in parallel
    const continentResults = await Promise.all(continentProcessors);
    
    // Flatten results - this ensures we return an array of ProcessedMatch objects
    const allMatches: ProcessedMatch[] = continentResults.flat();
    
    logMessage(
      LogSeverity.INFO, 
      `Parallel processing complete: ${allMatches.length} total matches across all continents`
    );
    
    return allMatches;
  } catch (error) {
    logMessage(LogSeverity.ERROR, 'Error in parallel continent processing', error);
    
    // Return empty array on failure - individual errors are already handled
    return [];
  }
};

// Export the main processor
export default processAllContinentsInParallel;
