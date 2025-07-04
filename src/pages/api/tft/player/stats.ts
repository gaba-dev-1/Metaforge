import type { NextApiRequest, NextApiResponse } from 'next';
import { PlayerStats } from '@/types/auth';

const RIOT_API_KEY = process.env.RIOT_API_KEY || '';

let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 100;

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
  console.error(`[TFT/PLAYER/STATS] ${message}`, error);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { summonerId, region = 'na1' } = req.query;
    
    if (!summonerId) {
      return res.status(400).json({ error: 'Summoner ID is required' });
    }
    
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
    
    try {
      await rateLimit();
      
      const response = await fetch(
        `https://${validRegion}.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerId}`,
        {
          headers: { 'X-Riot-Token': RIOT_API_KEY },
          signal: AbortSignal.timeout(10000)
        }
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          return res.status(404).json({ error: 'Player not found or not ranked in TFT' });
        }
        logError(`Failed to fetch player stats: ${response.status} ${response.statusText}`);
        return res.status(response.status).json({ error: 'Failed to fetch player stats' });
      }
      
      const data = await response.json();
      
      const rankedEntry = data.find((entry: any) => 
        entry.queueType === 'RANKED_TFT' || entry.queueType === 'RANKED_TFT_TURBO'
      );
      
      if (!rankedEntry) {
        return res.status(404).json({ error: 'No ranked TFT stats found for this player' });
      }
      
      const wins = rankedEntry.wins || 0;
      const losses = rankedEntry.losses || 0;
      const totalGames = wins + losses;
      const winRate = totalGames > 0 ? Number(((wins / totalGames) * 100).toFixed(1)) : 0;
      
      const playerStats: PlayerStats = {
        summonerId: rankedEntry.summonerId || '',
        summonerName: rankedEntry.summonerName || '',
        tagLine: '',
        tier: rankedEntry.tier || '',
        rank: rankedEntry.rank || '',
        leaguePoints: rankedEntry.leaguePoints || 0,
        wins,
        losses,
        winRate,
        hotStreak: rankedEntry.hotStreak || false,
        veteran: rankedEntry.veteran || false,
        freshBlood: rankedEntry.freshBlood || false,
        inactive: rankedEntry.inactive || false,
        miniSeries: rankedEntry.miniSeries || undefined
      };
      
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      
      return res.status(200).json(playerStats);
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        logError("Request timeout for player stats");
        return res.status(408).json({ error: 'Request timeout - please try again' });
      }
      
      logError("Riot API Error", error);
      return res.status(500).json({ error: 'Failed to fetch player stats' });
    }
  } catch (error) {
    logError("Player Stats API Error", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
