// Authentication Types
export interface RiotUser {
  puuid: string;
  gameName: string;
  tagLine: string;
  accountId?: string;
  summonerId?: string;
  region?: string;
  profileIconId?: number;
  summonerLevel?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: RiotUser | null;
  error: string | null;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
}

export interface LeaderboardEntry {
  summonerId: string;
  summonerName: string;
  tagLine: string;
  rank: number;
  leaguePoints: number;
  wins: number;
  losses: number;
  tier: string;
  division: string;
  profileIconId?: number;
  region: string;
}

export interface MatchHistoryEntry {
  matchId: string;
  queueId: number;
  gameType: string;
  gameCreation: number;
  gameDuration: number;
  gameVersion: string;
  mapId: number;
  placement: number;
  level: number;
  augments: string[];
  traits: {
    name: string;
    numUnits: number;
    style: number;
    tierCurrent: number;
    tierTotal: number;
  }[];
  units: {
    characterId: string;
    itemNames: string[];
    rarity: number;
    tier: number;
  }[];
  companions?: {
    contentId: string;
    skinId: number;
    species: string;
  };
}

export interface PlayerStats {
  summonerId: string;
  summonerName: string;
  tagLine: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries?: {
    target: number;
    wins: number;
    losses: number;
    progress: string;
  };
}

export interface ErrorState {
  hasError: boolean;
  error: {
    type: string;
    message: string;
    timestamp: Date;
  };
}
