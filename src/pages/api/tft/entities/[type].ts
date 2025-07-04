import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeDatabase, getStats, insertSampleData } from '@/utils/db';
import { logMessage, LogSeverity } from '@/utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Initialize database if needed
    await initializeDatabase();
    
    const { type, region = 'all' } = req.query;
    
    // Validate type
    const validTypes = ['compositions', 'units', 'traits', 'items'];
    if (!type || !validTypes.includes(type as string)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }
    
    // Get the cached processed data
    logMessage(LogSeverity.INFO, `Fetching ${type} data for ${region}`);
    
    const processedData = await getStats(type as string, region as string);
    
    if (processedData) {
      // Set cache headers
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
      
      // Log some statistics about the returned data
      const dataSize = JSON.stringify(processedData).length;
      let entityCount = 0;
      
      // Check for entities
      if (type === 'compositions' && processedData.compositions) {
        entityCount = processedData.compositions.length;
      } else if (type === 'units' && processedData.units) {
        entityCount = processedData.units.length;
      } else if (type === 'traits' && processedData.traits) {
        entityCount = processedData.traits.length;
      } else if (type === 'items' && processedData.items) {
        entityCount = processedData.items.length;
      }
      
      logMessage(LogSeverity.INFO,
        `Returning ${entityCount} ${type} for ${region}, size: ${Math.round(dataSize / 1024)}KB`);
        
      return res.status(200).json(processedData);
    }
    
    // No data - insert sample data
    logMessage(LogSeverity.INFO, `No ${type} data available, inserting sample data`);
    await insertSampleData();
    
    // Get the sample data we just inserted
    const sampleData = await getStats(type as string, region as string);
    
    if (sampleData) {
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
      return res.status(200).json(sampleData);
    }
    
    return res.status(404).json({ error: `No ${type} data available and failed to create sample data` });
  } catch (error) {
    logMessage(LogSeverity.ERROR, 'API Error', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
