import type { NextApiRequest, NextApiResponse } from 'next';
import { LeaderboardEntry } from '@/types/auth';

const RIOT_API_KEY = process.env.RIOT_API_KEY || '';

// Aggressive rate limiting for speed
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 20; // Reduced from 50ms to 20ms

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function rateLimit() {
  const now = Date.now();
  const timeSince = now - lastRequestTime;
  if (timeSince < RATE_LIMIT_DELAY) {
    await delay(RATE_LIMIT_DELAY - timeSince);
  }
  lastRequestTime = Date.now();
}

const logError = (message: string, error?: any) => {
  console.error(`[TFT/LEADERBOARD] ${message}`, error);
};

// Simple cache to avoid repeated summoner name lookups
const nameCache = new Map<string, { name: string; tagLine: string; timestamp: number }>();
const CACHE_TTL = 300000; // 5 minutes

async function fetchSummonerName(summonerId: string, region: string): Promise<{ name: string; tagLine: string } | null> {
  const cacheKey = `${summonerId}-${region}`;
  const cached = nameCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { name: cached.name, tagLine: cached.tagLine };
  }
  
  try {
    await rateLimit();
    
    const response = await fetch(
      `https://${region}.api.riotgames.com/tft/summoner/v1/summoners/${summonerId}`,
      {
        headers: { 'X-Riot-Token': RIOT_API_KEY },
        signal: AbortSignal.timeout(3000) // Reduced timeout
      }
    );
    
    if (response.ok) {
      const summoner = await response.json();
      const result = {
        name: summoner.name || "Unknown Player",
        tagLine: ""
      };
      
      // Cache the result
      nameCache.set(cacheKey, { ...result, timestamp: Date.now() });
      
      return result;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

function getRoutingRegion(region: string): string {
  const regionRouting: Record<string, string> = {
    'na1': 'americas', 'br1': 'americas', 'la1': 'americas', 'la2': 'americas',
    'euw1': 'europe', 'eun1': 'europe', 'tr1': 'europe', 'ru': 'europe',
    'kr': 'asia', 'jp1': 'asia',
    'oc1': 'sea'
  };
  
  return regionRouting[region] || 'americas';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { region = 'na1', limit = '50' } = req.query;
    
    if (!RIOT_API_KEY) {
      return res.status(500).json({ error: 'RIOT_API_KEY is not set' });
    }
    
    const regionMapping: Record<string, string> = {
      'na': 'na1', 'na1': 'na1',
      'euw': 'euw1', 'euw1': 'euw1',
      'kr': 'kr', 'jp': 'jp1', 'jp1': 'jp1',
      'br': 'br1', 'br1': 'br1',
      'las': 'la2', 'la2': 'la2',
      'lan': 'la1', 'la1': 'la1',
      'eune': 'eun1', 'eun1': 'eun1',
      'tr': 'tr1', 'tr1': 'tr1',
      'oc': 'oc1', 'oc1': 'oc1', 'oce': 'oc1',
      'ru': 'ru'
    };
    
    const validRegion = regionMapping[region as string] || 'na1';
    const limitNumber = Math.min(parseInt(limit as string) || 50, 50); // Reduced max limit for speed
    
    let leaderboardData: any = null;
    let tier = '';
    
    const tiers = [
      { name: 'CHALLENGER', endpoint: 'challenger' },
      { name: 'GRANDMASTER', endpoint: 'grandmaster' },
      { name: 'MASTER', endpoint: 'master' }
    ];
    
    // Try to get leaderboard data with aggressive timeout
    for (const tierInfo of tiers) {
      try {
        await rateLimit();
        
        const response = await fetch(
          `https://${validRegion}.api.riotgames.com/tft/league/v1/${tierInfo.endpoint}`,
          {
            headers: { 'X-Riot-Token': RIOT_API_KEY },
            signal: AbortSignal.timeout(5000) // Reduced timeout
          }
        );
        
        if (response.ok) {
          leaderboardData = await response.json();
          tier = tierInfo.name;
          break;
        }
      } catch (error) {
        logError(`Failed to fetch ${tierInfo.name} for ${validRegion}`, error);
        continue;
      }
    }
    
    if (!leaderboardData?.entries?.length) {
      return res.status(404).json({ error: `No leaderboard data found for ${validRegion}` });
    }
    
    const topEntries = leaderboardData.entries
      .sort((a: any, b: any) => b.leaguePoints - a.leaguePoints)
      .slice(0, limitNumber);
    
    // Fetch names in parallel with concurrency control
    const batchSize = 5; // Process names in batches
    const summonerResults: Array<{ name: string; tagLine: string } | null> = [];
    
    for (let i = 0; i < topEntries.length; i += batchSize) {
      const batch = topEntries.slice(i, i + batchSize);
      const batchPromises = batch.map((entry: any) => 
        fetchSummonerName(entry.summonerId, validRegion)
          .catch(() => null)
      );
      
      const batchResults = await Promise.all(batchPromises);
      summonerResults.push(...batchResults);
    }
    
    const processedEntries: LeaderboardEntry[] = topEntries.map((entry: any, index: number) => {
      const summonerInfo = summonerResults[index];
      
      return {
        summonerId: entry.summonerId || "",
        summonerName: summonerInfo?.name || entry.summonerName || `Player ${index + 1}`,
        tagLine: summonerInfo?.tagLine || "",
        rank: index + 1,
        leaguePoints: entry.leaguePoints || 0,
        wins: entry.wins || 0,
        losses: entry.losses || 0,
        tier,
        division: "",
        region: validRegion
      };
    });
    
    // Aggressive caching
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=240');
    
    return res.status(200).json(processedEntries);
  } catch (error) {
    logError("Leaderboard API Error", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
