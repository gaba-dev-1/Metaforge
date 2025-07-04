// Base interface for statistics
export interface BaseStats {
  id: string; 
  name: string; 
  icon: string;
  count?: number; 
  winRate?: number; 
  playRate?: number; 
  avgPlacement?: number; 
  top4Rate?: number; 
  totalGames?: number;
  region?: string;
  stats?: {
    count?: number;
    avgPlacement?: number;
    winRate?: number;
    top4Rate?: number;
  };
}

// Game data interfaces
export interface TraitData {
  name: string; 
  description: string; 
  icon: string;
  tiers: Array<{ units: number; value: string; icon: string; }>;
}

export interface UnitData {
  name: string; 
  icon: string; 
  cost: number;
  traits: { origin: string | string[]; class: string | string[]; };
  ability: { name: string; description: string; type: string; mana_cost?: number[]; };
  stats: Record<string, number>;
}

export interface ItemData {
  name: string; 
  category: string; 
  icon: string; 
  description?: string;
}

// Item Combo interface
export interface ItemCombo {
  mainItem: ProcessedItem;
  items: ProcessedItem[];
  winRate: number;
  frequency?: number;
}

// API interfaces
export interface LeagueEntry { summonerId: string; leaguePoints: number; }
export interface League { entries: LeagueEntry[]; }
export interface Summoner { puuid: string; id: string; }
export interface Match { metadata: { match_id: string }; info: { participants: any[] }; }

export interface ProcessedMatch {
  id: string;
  region?: string;
  participants: {
    placement: number;
    units: { name: string; itemNames: string[]; }[];
    traits: { name: string; tier_current: number; num_units: number; }[];
  }[];
}

// Processed data interfaces
export interface ProcessedItem extends BaseStats { 
  category?: string;
  unitsWithItem?: UnitWithItem[];
  relatedComps?: Composition[];
  combos?: ItemCombo[];
}

export interface UnitWithItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  count: number;
  winRate: number;
  avgPlacement: number;
  relatedComps?: Composition[];
  stats?: {
    count?: number;
    avgPlacement?: number;
    winRate?: number;
    top4Rate?: number;
  };
}

export interface ProcessedUnit extends BaseStats {
  cost: number;
  items?: ProcessedItem[];
  bestItems?: ProcessedItem[];
  relatedComps?: Composition[];
  // Add the traits property to match what's being used in team-builder
  traits?: {
    origin?: string | string[];
    class?: string | string[];
  };
  starLevel?: number; // Star level for unit (1-4 stars)
}

export interface ProcessedTrait extends BaseStats {
  tier: number;
  numUnits: number; 
  tierIcon: string;
  relatedComps?: Composition[];
}

export interface Composition extends BaseStats {
  traits: ProcessedTrait[]; 
  units: ProcessedUnit[];
  placementData?: { placement: number; count: number; }[];
}

export interface ProcessedData { 
  compositions: Composition[]; 
  summary: {
    totalGames: number; 
    avgPlacement: number; 
    topComps: Composition[];
  }; 
  region?: string;
}

export interface TierList {
  S: BaseStats[]; 
  A: BaseStats[]; 
  B: BaseStats[]; 
  C: BaseStats[];
}

// Team builder interfaces
export interface BoardCell {
  unit?: ProcessedUnit;
  items?: ProcessedItem[];
}

export interface SavedComposition {
  id: string;
  name: string;
  board: Record<string, BoardCell>;
  date: string;
  traits?: {id: string, count: number}[];
}

// Feature card type
export interface FeatureCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  linkTo: string;
}

// Enhanced Region type with status and subRegions information
export interface Region {
  id: string;
  name: string;
  status?: 'active' | 'degraded' | 'down' | 'error';
  lastError?: Date;
  retryAttempts?: number;
  subRegions?: string[]; // Added subRegions property
  isGroup?: boolean;     // Flag to identify if this is a group/continent
}

// Error handling types
export interface ApiError {
  type: 'timeout' | 'rate-limit' | 'server' | 'network' | 'unknown';
  message: string;
  statusCode?: number;
  region?: string;
  timestamp: Date;
}

export interface ErrorState {
  hasError: boolean;
  error?: ApiError | null;
  retryFn?: () => void;
}

export interface ProcessedDisplayTrait {
  id: string;
  name: string;
  icon: string;
  tierIcon?: string;
}

// Module declarations
declare namespace NodeJS { interface ProcessEnv { RIOT_API_KEY: string; } }
