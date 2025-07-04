import { acquireRateLimit, REGION_TO_CONTINENT, CONTINENTS } from '@/utils/rateLimiter';
import { saveMatch, updateRegionStatus } from '@/utils/db';
import { logMessage, LogSeverity } from '@/utils/logger';
import { ProcessedMatch } from '@/types';

// REGIONS object with all available regions
export const REGIONS: Record<string, any> = {
  NA: { 
    master: 'https://na1.api.riotgames.com/tft/league/v1/master', 
    summoner: 'https://na1.api.riotgames.com/tft/summoner/v1/summoners',
    routing: 'na1',
    continental: 'americas',
    status: 'active'
  },
  EUW: { 
    master: 'https://euw1.api.riotgames.com/tft/league/v1/master', 
    summoner: 'https://euw1.api.riotgames.com/tft/summoner/v1/summoners',
    routing: 'euw1',
    continental: 'europe',
    status: 'active'
  },
  EUNE: { 
    master: 'https://eun1.api.riotgames.com/tft/league/v1/master', 
    summoner: 'https://eun1.api.riotgames.com/tft/summoner/v1/summoners',
    routing: 'eun1',
    continental: 'europe',
    status: 'active'
  },
  KR: { 
    master: 'https://kr.api.riotgames.com/tft/league/v1/master', 
    summoner: 'https://kr.api.riotgames.com/tft/summoner/v1/summoners',
    routing: 'kr',
    continental: 'asia',
    status: 'active'
  },
  JP: { 
    master: 'https://jp1.api.riotgames.com/tft/league/v1/master', 
    summoner: 'https://jp1.api.riotgames.com/tft/summoner/v1/summoners',
    routing: 'jp1',
    continental: 'asia',
    status: 'active'
  },
  BR: { 
    master: 'https://br1.api.riotgames.com/tft/league/v1/master', 
    summoner: 'https://br1.api.riotgames.com/tft/summoner/v1/summoners',
    routing: 'br1',
    continental: 'americas',
    status: 'active'
  },
  LAN: { 
    master: 'https://la1.api.riotgames.com/tft/league/v1/master', 
    summoner: 'https://la1.api.riotgames.com/tft/summoner/v1/summoners',
    routing: 'la1',
    continental: 'americas',
    status: 'active'
  },
  LAS: { 
    master: 'https://la2.api.riotgames.com/tft/league/v1/master', 
    summoner: 'https://la2.api.riotgames.com/tft/summoner/v1/summoners',
    routing: 'la2',
    continental: 'americas',
    status: 'active'
  },
  TR: { 
    master: 'https://tr1.api.riotgames.com/tft/league/v1/master', 
    summoner: 'https://tr1.api.riotgames.com/tft/summoner/v1/summoners',
    routing: 'tr1',
    continental: 'europe',
    status: 'active'
  },
  OCE: { 
    master: 'https://oc1.api.riotgames.com/tft/league/v1/master', 
    summoner: 'https://oc1.api.riotgames.com/tft/summoner/v1/summoners',
    routing: 'oc1',
    continental: 'sea',
    status: 'active'
  },
  RU: { 
    master: 'https://ru.api.riotgames.com/tft/league/v1/master', 
    summoner: 'https://ru.api.riotgames.com/tft/summoner/v1/summoners',
    routing: 'ru',
    continental: 'europe',
    status: 'active'
  }
};

// Define RegionKey type here to match the one in api.ts
export type RegionKey = keyof typeof REGIONS;

// Continental routing for parallel processing
export const REGIONS_BY_CONTINENT: Record<string, RegionKey[]> = {
  'americas': ['NA', 'BR', 'LAN', 'LAS'],
  'europe': ['EUW', 'EUNE', 'TR', 'RU'],
  'asia': ['KR', 'JP'],
  'sea': ['OCE']
};

// Define interface for API endpoints
interface ApiEndpoints {
  master: string;
  summoner: (id: string) => string;
  matches: (puuid: string) => string;
  matchDetails: (id: string) => string;
}

// Build API endpoints for a region
export const getApiEndpoints = (regionKey: RegionKey): ApiEndpoints | null => {
  const region = REGIONS[regionKey];
  if (!region) return null;
  
  return {
    master: region.master,
    summoner: (id: string) => `${region.summoner}/${id}`,
    matches: (puuid: string) => `https://${region.continental}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?count=100`,
    matchDetails: (id: string) => `https://${region.continental}.api.riotgames.com/tft/match/v1/matches/${id}`
  };
};

// Define interface for fetch options
interface FetchOptions extends RequestInit {
  maxRetries?: number;
  baseDelay?: number;
  timeout?: number;
}

// Typed fetch function with API key
export const fetchWithApiKey = async (url: string, options: FetchOptions = {}): Promise<any> => {
  const maxRetries = options.maxRetries || 5;
  const baseDelay = options.baseDelay || 1000; // 1 second

  // Determine region for rate limiting
  let region = 'na1'; // Default to NA
  
  // Extract region from URL
  if (url.includes('na1.api.riotgames.com')) region = 'na1';
  else if (url.includes('euw1.api.riotgames.com')) region = 'euw1';
  else if (url.includes('ru.api.riotgames.com')) region = 'ru';
  else if (url.includes('kr.api.riotgames.com')) region = 'kr';
  else if (url.includes('br1.api.riotgames.com')) region = 'br1';
  else if (url.includes('jp1.api.riotgames.com')) region = 'jp1';
  else if (url.includes('americas.api.riotgames.com')) region = 'americas';
  else if (url.includes('europe.api.riotgames.com')) region = 'europe';
  else if (url.includes('asia.api.riotgames.com')) region = 'asia';
  
  // Apply rate limiting
  await acquireRateLimit(region, url);
  
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);
      
      // Check if API key is set
      if (!process.env.RIOT_API_KEY) {
        throw new Error('RIOT_API_KEY is not set in environment variables');
      }
      
      const response = await fetch(url, {
        headers: { 'X-Riot-Token': process.env.RIOT_API_KEY },
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return await response.json();
      }
      
      // Handle specific error cases
      if (response.status === 429) {
        // Rate limit - get retry-after header or use exponential backoff
        const retryAfter = response.headers.get('Retry-After') || Math.pow(2, retries) * baseDelay;
        logMessage(LogSeverity.WARN, `Rate limit hit for ${url}, retrying after ${retryAfter}ms`);
        await new Promise(resolve => setTimeout(resolve, Number(retryAfter)));
        retries++;
        continue;
      }
      
      if (response.status === 504) {
        // Gateway timeout - common with EUW
        logMessage(LogSeverity.WARN, `Gateway timeout for ${url}, retry ${retries + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * baseDelay));
        retries++;
        continue;
      }
      
      if (response.status >= 500) {
        // Server error - retry with backoff
        logMessage(LogSeverity.ERROR, `Server error ${response.status} for ${url}, retry ${retries + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * baseDelay));
        retries++;
        continue;
      }
      
      // API key error
      if (response.status === 403 || response.status === 401) {
        logMessage(LogSeverity.ERROR, `API key error (${response.status}) for ${url}`);
        throw new Error(`Invalid Riot API key (${response.status})`);
      }
      
      // Other error, log and return null
      logMessage(LogSeverity.ERROR, `Error fetching ${url}: ${response.status}`);
      return null;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        logMessage(LogSeverity.ERROR, `Request timeout for ${url}, retry ${retries + 1}/${maxRetries}`);
      } else {
        logMessage(LogSeverity.ERROR, `Failed to fetch ${url}:`, error);
      }
      
      // Implement exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * baseDelay));
      retries++;
    }
  }
  
  logMessage(LogSeverity.ERROR, `Max retries (${maxRetries}) exceeded for ${url}`);
  return null;
};

// Define interface for league entries and summoners
interface LeagueEntry {
  summonerId: string;
  leaguePoints: number;
}

interface League {
  entries: LeagueEntry[];
}

interface Summoner {
  puuid: string;
  id: string;
}

// Process one region with rate limiting and better error handling
export const processRegion = async (regionKey: RegionKey, matchesPerRegion: number = 100): Promise<ProcessedMatch[]> => {
  // Updated to limit matches per region to 5 for initial implementation
  const API = getApiEndpoints(regionKey);
  if (!API) return [];
  
  logMessage(LogSeverity.INFO, `Processing region ${regionKey}...`);
  
  try {
    // Update region status to processing
    await updateRegionStatus(regionKey, 'processing');
    
    // Fetch master league - can request more players now
    const league = await fetchWithApiKey(API.master, { 
      maxRetries: 3, 
      timeout: 15000 
    }) as League | null;
    
    if (!league?.entries?.length) {
      logMessage(LogSeverity.WARN, `No league data for ${regionKey}`);
      await updateRegionStatus(regionKey, 'degraded', 'No league data available');
      return [];
    }
    
    // Get top players - increased from 4 to 10 for more data sources
    const players = league.entries
      .sort((a, b) => b.leaguePoints - a.leaguePoints)
      .slice(0, 10);
    
    if (!players.length) {
      logMessage(LogSeverity.WARN, `No players found for ${regionKey}`);
      await updateRegionStatus(regionKey, 'degraded', 'No players found');
      return [];
    }
    
    // Fetch summoner data concurrently with proper rate limiting
    const summonerPromises = players.map(p => 
      fetchWithApiKey(API.summoner(p.summonerId), { 
        timeout: 8000, 
        maxRetries: 2 
      })
    );
    
    const summoners = (await Promise.all(summonerPromises)).filter(Boolean) as Summoner[];
    
    if (!summoners.length) {
      logMessage(LogSeverity.WARN, `No summoner data for ${regionKey}`);
      await updateRegionStatus(regionKey, 'degraded', 'No summoner data available');
      return [];
    }
    
    // Fetch match lists with higher batch size
    const matchListPromises: Promise<string[]>[] = [];
    
    for (const summoner of summoners) {
      // Increased from 20 to 100 matches per player
      matchListPromises.push(
        fetchWithApiKey(API.matches(summoner.puuid), {
          timeout: 15000,
          maxRetries: 2
        })
      );
    }
    
    const matchLists = (await Promise.all(matchListPromises)).filter(Boolean) as string[][];
    
    // Get unique match IDs, limited to 5 per region as requested
    const allMatchIds = matchLists.flat();
    const uniqueMatches = [...new Set(allMatchIds)].slice(0, matchesPerRegion);
    
    if (!uniqueMatches.length) {
      logMessage(LogSeverity.WARN, `No matches found for ${regionKey}`);
      await updateRegionStatus(regionKey, 'degraded', 'No matches found');
      return [];
    }
    
    logMessage(LogSeverity.INFO, `Fetching ${uniqueMatches.length} matches for ${regionKey}...`);
    
    // Fetch match details with increased batch size and parallelism
    const matches: any[] = [];
    const batchSize = 5; // Reduced from 10 to 5 since we only need 5 total matches
    
    for (let i = 0; i < uniqueMatches.length; i += batchSize) {
      const batchIds = uniqueMatches.slice(i, i + batchSize);
      const batchPromises = batchIds.map(id => 
        fetchWithApiKey(API.matchDetails(id), {
          timeout: 8000,
          maxRetries: 2
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(Boolean);
      matches.push(...validResults);
      
      // Add a small delay between batches to avoid rate limit spikes
      if (i + batchSize < uniqueMatches.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Save each match to database
      for (let j = 0; j < validResults.length; j++) {
        const match = validResults[j];
        if (match && match.metadata?.match_id) {
          await saveMatch(match.metadata.match_id, regionKey, match);
        }
      }
    }
    
    // Update region status to active
    await updateRegionStatus(regionKey, 'active');
    
    // Process match data
    return matches.map(match => ({
      id: match.metadata.match_id,
      region: regionKey,
      participants: match.info.participants.map((p: any) => ({
        placement: p.placement,
        units: p.units.map((u: any) => ({
          name: u.character_id,
          itemNames: u.itemNames || []
        })),
        traits: p.traits
          .filter((t: any) => t.style > 0)
          .map((t: any) => ({
            name: t.name,
            tier_current: t.style,
            num_units: t.num_units
          }))
      }))
    }));
  } catch (error) {
    logMessage(LogSeverity.ERROR, `Error processing region ${regionKey}:`, error);
    // Update region status to error
    await updateRegionStatus(
      regionKey, 
      'error', 
      error instanceof Error ? error.message : 'Unknown error'
    );
    return [];
  }
};
