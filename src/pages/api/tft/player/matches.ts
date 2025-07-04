import type { NextApiRequest, NextApiResponse } from 'next';
import { MatchHistoryEntry } from '@/types/auth';

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
  console.error(`[TFT/PLAYER/MATCHES] ${message}`, error);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { puuid, region = 'americas', count = '10' } = req.query;
    
    if (!puuid) {
      return res.status(400).json({ error: 'PUUID is required' });
    }
    
    if (!RIOT_API_KEY) {
      return res.status(500).json({ error: 'RIOT_API_KEY is not set' });
    }
    
    const regionRouting: Record<string, string> = {
      'na1': 'americas', 'na': 'americas',
      'br1': 'americas', 'br': 'americas',
      'la1': 'americas', 'lan': 'americas',
      'la2': 'americas', 'las': 'americas',
      'euw1': 'europe', 'euw': 'europe',
      'eun1': 'europe', 'eune': 'europe',
      'tr1': 'europe', 'tr': 'europe',
      'ru': 'europe',
      'kr': 'asia',
      'jp1': 'asia', 'jp': 'asia',
      'oc1': 'sea', 'oc': 'sea', 'oce': 'sea'
    };
    
    const routingRegion = regionRouting[region as string] || 'americas';
    
    try {
      await rateLimit();
      
      const matchIdsResponse = await fetch(
        `https://${routingRegion}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`,
        {
          headers: { 'X-Riot-Token': RIOT_API_KEY },
          signal: AbortSignal.timeout(15000)
        }
      );
      
      if (!matchIdsResponse.ok) {
        if (matchIdsResponse.status === 404) {
          return res.status(404).json({ error: 'No matches found for this player' });
        }
        logError(`Failed to fetch match IDs: ${matchIdsResponse.status} ${matchIdsResponse.statusText}`);
        return res.status(matchIdsResponse.status).json({ error: 'Failed to fetch match history' });
      }
      
      const matchIds = await matchIdsResponse.json();
      
      if (!matchIds.length) {
        return res.status(200).json([]);
      }
      
      const matchDetails = [];
      
      for (const matchId of matchIds) {
        try {
          await rateLimit();
          
          const matchResponse = await fetch(
            `https://${routingRegion}.api.riotgames.com/tft/match/v1/matches/${matchId}`,
            {
              headers: { 'X-Riot-Token': RIOT_API_KEY },
              signal: AbortSignal.timeout(10000)
            }
          );
          
          if (matchResponse.ok) {
            const matchData = await matchResponse.json();
            matchDetails.push(matchData);
          } else {
            logError(`Failed to fetch match ${matchId}: ${matchResponse.status}`);
          }
        } catch (error) {
          logError(`Error fetching match ${matchId}`, error);
          continue;
        }
      }
      
      const processedMatches: MatchHistoryEntry[] = matchDetails
        .map(match => {
          const participant = match.info.participants.find((p: any) => p.puuid === puuid);
          
          if (!participant) return null;
          
          return {
            matchId: match.metadata.match_id,
            queueId: match.info.queue_id || 0,
            gameType: match.info.tft_game_type || 'standard',
            gameCreation: match.info.game_datetime || Date.now(),
            gameDuration: match.info.game_length || 0,
            gameVersion: match.info.game_version || '',
            mapId: match.info.tft_set_number || 0,
            placement: participant.placement || 8,
            level: participant.level || 1,
            augments: participant.augments || [],
            traits: (participant.traits || []).map((trait: any) => ({
              name: trait.name || '',
              numUnits: trait.num_units || 0,
              style: trait.style || 0,
              tierCurrent: trait.tier_current || 0,
              tierTotal: trait.tier_total || 0
            })),
            units: (participant.units || []).map((unit: any) => ({
              characterId: unit.character_id || '',
              itemNames: unit.itemNames || [],
              rarity: unit.rarity || 0,
              tier: unit.tier || 1
            })),
            companions: participant.companion
          };
        })
        .filter(Boolean) as MatchHistoryEntry[];
      
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      
      return res.status(200).json(processedMatches);
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        logError("Request timeout for match history");
        return res.status(408).json({ error: 'Request timeout - please try again' });
      }
      
      logError("Riot API Error", error);
      return res.status(500).json({ error: 'Failed to fetch match history' });
    }
  } catch (error) {
    logError("Match History API Error", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
