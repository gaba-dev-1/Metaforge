import type { NextApiRequest, NextApiResponse } from 'next';
import { getRegionStatuses } from '@/utils/db';
import { logMessage, LogSeverity } from '@/utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const statuses = await getRegionStatuses();
    
    // Set cache headers to allow short-term caching
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return res.status(200).json(statuses);
  } catch (error) {
    logMessage(LogSeverity.ERROR, 'Failed to get region statuses', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
