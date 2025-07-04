import type { NextApiRequest, NextApiResponse } from 'next';
import { getStats, initializeDatabase } from '@/utils/db';
import { logMessage, LogSeverity } from '@/utils/logger';

export const config = {
  api: {
    responseLimit: '16mb',
  },
};

// Main handler for stats
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Get region from query
    const { region = 'all' } = req.query;
    
    // Validate region
    const validRegion = typeof region === 'string' ? region : 'all';
    
    // Get data for the region
    const compositions = await getStats('compositions', validRegion);
    
    if (!compositions) {
      logMessage(LogSeverity.WARN, `No compositions found for region: ${validRegion}`);
      return res.status(404).json({ error: `No data available for region: ${validRegion}` });
    }
    
    // Add region to response
    const response = {
      ...compositions,
      region: validRegion
    };
    
    return res.status(200).json(response);
  } catch (error) {
    logMessage(LogSeverity.ERROR, 'Error fetching compositions:', error);
    return res.status(500).json({ error: 'Failed to fetch composition data' });
  }
}
