import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  initializeDatabase,
  getStats, 
  getMatches, 
  getRegionStatuses,
  insertSampleData
} from '@/utils/db';
import { logMessage, LogSeverity } from '@/utils/logger';
import { ProcessedMatch } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProcessedMatch[] | { error: string }>
) {
  try {
    // Initialize database if needed
    await initializeDatabase();
    
    // First try to get processed data
    const cachedData = await getStats('compositions', 'all');
    
    if (cachedData && cachedData.compositions) {
      // Get region statuses for client display
      const regionStatuses = await getRegionStatuses();
      
      // Set cache headers for better performance
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
      
      // We need to return an array of processed matches for compatibility with existing code
      return res.status(200).json(
        cachedData.compositions.map((comp: any) => ({
          id: comp.id || 'unknown',
          region: comp.region || 'unknown',
          participants: [] // Empty participants as we don't need them anymore
        }))
      );
    }
    
    // If no processed data, try returning raw match data
    const matches = await getMatches();
    
    if (matches && matches.length > 0) {
      // Set cache headers
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
      return res.status(200).json(matches);
    }
    
    // No data available - insert sample data and return it
    logMessage(LogSeverity.INFO, 'No data available, inserting sample data');
    await insertSampleData();
    
    // Get the sample data we just inserted
    const sampleData = await getStats('compositions', 'all');
    
    if (sampleData && sampleData.compositions) {
      return res.status(200).json(
        sampleData.compositions.map((comp: any) => ({
          id: comp.id || 'sample-id',
          region: comp.region || 'all',
          participants: [] // Empty participants for sample data
        }))
      );
    }
    
    // If all else fails, return error
    return res.status(404).json({ error: 'No cached data available and failed to create sample data' });
  } catch (error) {
    logMessage(LogSeverity.ERROR, "API Error", error);
    
    return res.status(500).json({ 
      error: error instanceof Error ? 
        `Failed to process match data: ${error.message}` : 
        'Unknown error processing match data'
    });
  }
}
