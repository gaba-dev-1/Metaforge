import type { NextApiRequest, NextApiResponse } from 'next';

const RIOT_API_KEY = process.env.RIOT_API_KEY || '';

const regions = ['kr', 'euw1', 'na1', 'br1', 'jp1', 'eun1', 'la1', 'la2', 'tr1', 'ru', 'oc1'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!RIOT_API_KEY) {
    return res.status(500).json({ error: 'RIOT_API_KEY is not set' });
  }

  try {
    let topPlayer: any = null;
    let topLP = 0;

    for (const region of regions) {
      try {
        const response = await fetch(
          `https://${region}.api.riotgames.com/tft/league/v1/challenger`,
          {
            headers: { 'X-Riot-Token': RIOT_API_KEY },
            signal: AbortSignal.timeout(5000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          const regionTop = data.entries
            .sort((a: any, b: any) => b.leaguePoints - a.leaguePoints)[0];

          if (regionTop && regionTop.leaguePoints > topLP) {
            topLP = regionTop.leaguePoints;
            topPlayer = { ...regionTop, region };
          }
        }
      } catch (error) {
        console.error(`Failed to fetch challenger for ${region}:`, error);
        continue;
      }
    }

    if (!topPlayer) {
      return res.status(404).json({ error: 'No global data found' });
    }

    try {
      const summonerResponse = await fetch(
        `https://${topPlayer.region}.api.riotgames.com/tft/summoner/v1/summoners/${topPlayer.summonerId}`,
        {
          headers: { 'X-Riot-Token': RIOT_API_KEY },
          signal: AbortSignal.timeout(3000)
        }
      );

      if (summonerResponse.ok) {
        const summoner = await summonerResponse.json();
        topPlayer.summonerName = summoner.name || topPlayer.summonerName || 'Unknown';
      }
    } catch (error) {
      // Keep existing name if fetch fails
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    
    return res.status(200).json({
      summonerId: topPlayer.summonerId,
      summonerName: topPlayer.summonerName || 'Global #1',
      leaguePoints: topPlayer.leaguePoints,
      region: topPlayer.region.toUpperCase(),
      tier: 'CHALLENGER'
    });
  } catch (error) {
    console.error('Global leaderboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
