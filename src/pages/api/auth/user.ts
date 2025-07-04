import type { NextApiRequest, NextApiResponse } from 'next';
import { RiotUser } from '@/types/auth';

// Riot API key for additional data (optional)
const RIOT_API_KEY = process.env.RIOT_API_KEY || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for access token
    const accessToken = req.cookies.access_token;
    const expiresAt = req.cookies.expires_at;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Check if token is expired
    if (expiresAt && parseInt(expiresAt) < Date.now()) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    // Fetch account info from Riot using their Account API
    const accountResponse = await fetch('https://americas.api.riotgames.com/riot/account/v1/accounts/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!accountResponse.ok) {
      return res.status(accountResponse.status).json({ error: 'Failed to fetch account data' });
    }
    
    const accountData = await accountResponse.json();
    
    // Create user object with basic data
    const user: RiotUser = {
      puuid: accountData.puuid,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine
    };
    
    // If we have an API key, try to fetch additional summoner data
    if (RIOT_API_KEY) {
      try {
        // Try regions one by one to find the player's main region
        const regions = ['na1', 'euw1', 'kr', 'br1', 'jp1', 'eun1', 'la1', 'la2', 'tr1', 'ru', 'oc1'];
        
        for (const region of regions) {
          const summonerResponse = await fetch(
            `https://${region}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${user.puuid}`,
            {
              headers: {
                'X-Riot-Token': RIOT_API_KEY
              }
            }
          );
          
          if (summonerResponse.ok) {
            const summonerData = await summonerResponse.json();
            
            // Add summoner data to user object
            user.summonerId = summonerData.id;
            user.profileIconId = summonerData.profileIconId;
            user.summonerLevel = summonerData.summonerLevel;
            user.region = region;
            break;
          }
        }
      } catch (error) {
        // Don't fail if we can't get summoner data, just continue
      }
    }
    
    // Return the user data
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
