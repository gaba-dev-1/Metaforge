import { processRegion, REGIONS_BY_CONTINENT, RegionKey } from '@/utils/api';
import { logMessage, LogSeverity } from '@/utils/logger';
import { ProcessedMatch } from '@/types';

/**
 * Process all continents in parallel with proper rate limiting
 */
export async function processAllContinentsInParallel(matchesPerRegion: number = 2000): Promise<ProcessedMatch[]> {
  try {
    logMessage(LogSeverity.INFO, 'Starting parallel continent processing');
    
    // Process each continent in parallel
    const continentPromises = Object.entries(REGIONS_BY_CONTINENT).map(
      async ([continentName, regions]) => {
        logMessage(LogSeverity.INFO, `Processing continent: ${continentName} with regions: ${regions.join(', ')}`);
        
        // Process regions within each continent in parallel
        const regionPromises = regions.map(region => 
          processRegion(region as RegionKey, matchesPerRegion)
        );
        
        // Wait for all regions in this continent to complete
        const continentResults = await Promise.all(regionPromises);
        
        // Flatten the results
        const continentMatches = continentResults.flat();
        
        logMessage(LogSeverity.INFO, 
          `Continent ${continentName} completed: ${continentMatches.length} total matches`);
        
        return continentMatches;
      }
    );
    
    // Wait for all continents to complete
    const allContinentResults = await Promise.all(continentPromises);
    
    // Flatten all results
    const allMatches = allContinentResults.flat();
    
    logMessage(LogSeverity.INFO, 
      `All continents completed: ${allMatches.length} total matches from ${Object.keys(REGIONS_BY_CONTINENT).length} continents`);
    
    return allMatches;
  } catch (error) {
    logMessage(LogSeverity.ERROR, 'Error in parallel continent processing:', error);
    return [];
  }
}
