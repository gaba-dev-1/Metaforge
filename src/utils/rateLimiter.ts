/**
 * Advanced rate limiter implementation with queuing
 */
export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private timestamps: number[] = [];
  private pendingPromises: { resolve: () => void }[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Start cleanup interval
    this.intervalId = setInterval(() => this.cleanup(), windowMs / 2);
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Remove expired timestamps
    this.timestamps = this.timestamps.filter(time => time > windowStart);
    
    // Check if we can resolve pending promises
    this.checkPending();
  }

  private checkPending(): void {
    // If we have capacity and pending requests, resolve the oldest one
    while (this.timestamps.length < this.maxRequests && this.pendingPromises.length > 0) {
      const pending = this.pendingPromises.shift();
      if (pending) {
        this.timestamps.push(Date.now());
        pending.resolve();
      }
    }
  }

  async acquire(): Promise<void> {
    // Clean up old timestamps first
    const now = Date.now();
    const windowStart = now - this.windowMs;
    this.timestamps = this.timestamps.filter(time => time > windowStart);
    
    // If we haven't reached the limit, allow the request
    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now);
      return Promise.resolve();
    }
    
    // Otherwise, queue it
    return new Promise<void>(resolve => {
      this.pendingPromises.push({ resolve });
    });
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Define regions and continents
interface ContinentInfo {
  regions: string[];
  limiters: Record<string, RateLimiter>;
}

// Map regions to their continental routing
export const REGION_TO_CONTINENT: Record<string, string> = {
  'na1': 'americas',
  'br1': 'americas',
  'la1': 'americas',
  'la2': 'americas',
  'euw1': 'europe',
  'eun1': 'europe',
  'tr1': 'europe',
  'ru': 'europe',
  'kr': 'asia',
  'jp1': 'asia',
  'oc1': 'asia',
  'ph2': 'asia',
  'sg2': 'asia',
  'th2': 'asia',
  'tw2': 'asia',
  'vn2': 'asia'
};

// Create continent-based rate limiters
export const CONTINENTS: Record<string, ContinentInfo> = {
  'americas': {
    regions: ['na1', 'br1', 'la1', 'la2'],
    limiters: {
      'match': new RateLimiter(10000, 250),
      'matches-by-puuid': new RateLimiter(10000, 600)
    }
  },
  'europe': {
    regions: ['euw1', 'eun1', 'tr1', 'ru'],
    limiters: {
      'match': new RateLimiter(10000, 250),
      'matches-by-puuid': new RateLimiter(10000, 600)
    }
  },
  'asia': {
    regions: ['kr', 'jp1', 'oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'],
    limiters: {
      'match': new RateLimiter(10000, 250),
      'matches-by-puuid': new RateLimiter(10000, 600)
    }
  }
};

// Regional rate limiters (for regional endpoints)
const regionLimiters: Record<string, Record<string, RateLimiter>> = {};

// Initialize rate limiters for each region
Object.keys(REGION_TO_CONTINENT).forEach(region => {
  regionLimiters[region] = {
    // Summoner endpoint rate limits
    'summoner': new RateLimiter(60000, 1600),  // 1600 requests every 1 minute for summoner endpoints
    
    // League endpoint rate limits
    'league-master': new RateLimiter(10000, 30),  // /tft/league/v1/master - 30 requests every 10 seconds
    'league-entries': new RateLimiter(10000, 250), // /tft/league/v1/entries/{tier}/{division} - 250 requests every 10 seconds
    'league-summoner': new RateLimiter(60000, 60), // /tft/league/v1/entries/by-summoner/{summonerId} - 60 requests every 1 minute
    
    // General fallback rate limiter
    'default': new RateLimiter(10000, 20)      // Conservative default
  };
});

// Utility function to acquire appropriate rate limit for an endpoint
export async function acquireRateLimit(region: string, endpoint: string): Promise<void> {
  const continent = REGION_TO_CONTINENT[region] || 'americas'; // Default to Americas if unknown region
  
  // For continental endpoints (match details/history)
  if (endpoint.includes('/tft/match/v1/matches/by-puuid')) {
    await CONTINENTS[continent].limiters['matches-by-puuid'].acquire();
    return;
  } 
  
  if (endpoint.includes('/tft/match/v1/matches/')) {
    await CONTINENTS[continent].limiters['match'].acquire();
    return;
  }
  
  // For regional endpoints
  const limiter = regionLimiters[region] || regionLimiters['na1']; // Default to NA if unknown
  
  // Select the appropriate limiter based on the endpoint
  if (endpoint.includes('/tft/summoner/v1/')) {
    await limiter['summoner'].acquire();
  } else if (endpoint.includes('/tft/league/v1/master')) {
    await limiter['league-master'].acquire();
  } else if (endpoint.includes('/tft/league/v1/entries/by-summoner')) {
    await limiter['league-summoner'].acquire();
  } else if (endpoint.includes('/tft/league/v1/entries')) {
    await limiter['league-entries'].acquire();
  } else {
    await limiter['default'].acquire();
  }
}
