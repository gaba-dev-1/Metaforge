import traitsJson from 'public/mapping/traits.json';

// Define constants for asset paths
export const ASSET_PATHS = {
  trait: '/assets/traits/',
  unit: '/assets/units/',
  item: '/assets/items/',
  default: '/assets/'
};

// Default icons for fallbacks
export const DEFAULT_ICONS = {
  trait: '/assets/app/default.png',
  unit: '/assets/app/default.png',
  item: '/assets/app/default.png'
};

// Type for traits object
type TraitsRecord = Record<string, {
  name: string;
  description?: string;
  icon: string;
  tiers?: Array<{ units: number; value: string; icon?: string }>;
}>;

// Get cost color - standardized color mapping for all components
export const getCostColor = (cost: number) => {
  const colors: Record<number, string> = {
    1: '#9aa4af', 
    2: '#2ecc71', 
    3: '#3498db',
    4: '#9b59b6', 
    5: '#f1c40f', 
    6: '#e74c3c'
  };
  return colors[cost] || colors[1];
};

// Core icon path function
export const getIconPath = (icon: string | undefined, type: string): string => {
  if (!icon) return DEFAULT_ICONS[type as keyof typeof DEFAULT_ICONS] || '';
  
  // If path already has a proper prefix, return it directly
  if (icon.startsWith('/')) return icon;
  
  // Normalize type (remove plural 's' if present)
  const normalizedType = type.endsWith('s') ? type.slice(0, -1) : type;
  
  // Get the correct base path by type
  const basePath = ASSET_PATHS[normalizedType as keyof typeof ASSET_PATHS] || ASSET_PATHS.default;
  
  return `${basePath}${icon}`;
};

// Ensure path has proper prefix
export const ensureIconPath = (path: string, type: string): string => {
  if (!path) return DEFAULT_ICONS[type as keyof typeof DEFAULT_ICONS];
  if (path.startsWith('/')) return path;
  
  const basePath = type === 'trait' || type === 'traits' ? '/assets/traits/' :
                   type === 'unit' || type === 'units' ? '/assets/units/' :
                   type === 'item' || type === 'items' ? '/assets/items/' : '/assets/';
  
  return `${basePath}${path}`;
};

// Get tier name from level
export const getTierName = (tier: number) => {
  if (tier === 1) return "(Bronze)";
  if (tier === 2) return "(Silver)";
  if (tier === 3) return "(Gold)";
  if (tier === 4) return "(Diamond)";
  return "";
};

// Get trait tier icon - completely rewritten for accuracy
export const getTierIcon = (traitId: string, numUnits: number): string => {
  // Early return for invalid inputs
  if (!traitId || numUnits === undefined) return DEFAULT_ICONS.trait;
  
  // Get trait data from traits.json
  const traits: TraitsRecord = { ...traitsJson.origins, ...traitsJson.classes };
  const trait = traits[traitId];
  
  // If trait not found, return default icon
  if (!trait) return DEFAULT_ICONS.trait;
  
  // Get trait tiers
  const traitTiers = trait.tiers || [];
  if (!traitTiers.length) return getIconPath(trait.icon, 'trait');
  
  // Find the appropriate tier level based on unit count
  let tierLevel = -1;
  for (let i = 0; i < traitTiers.length; i++) {
    if (numUnits >= traitTiers[i].units) {
      tierLevel = i;
    } else {
      break;
    }
  }
  
  // If no tier matches, return the default trait icon
  if (tierLevel === -1) return getIconPath(trait.icon, 'trait');
  
  // Get the tier icon if specified in the tier data
  if (traitTiers[tierLevel].icon) {
    // Add empty string fallback to ensure we always pass a string
    return getIconPath(traitTiers[tierLevel].icon || '', 'trait');
  }
  
  // If no tier-specific icon, construct from trait ID instead of name
  const tierNames = ['bronze', 'silver', 'gold', 'diamond'];
  if (tierLevel >= tierNames.length) {
    return getIconPath(trait.icon, 'trait');
  }
  
  // CHANGE THIS LINE: Use traitId directly instead of formatting trait.name
  // Return constructed tier icon path - with fallback
  return `${ASSET_PATHS.trait}${traitId}_${tierNames[tierLevel]}.png`;
};

// Primary entity icon resolver - main function to use everywhere
export const getEntityIcon = (entity: any, type: string): string => {
  if (!entity) return DEFAULT_ICONS[type as keyof typeof DEFAULT_ICONS] || '';
  
  // Normalize type
  const normalizedType = type.endsWith('s') ? type.slice(0, -1) : type;
  
  // Special case for trait tier icons
  if (normalizedType === 'trait') {
    // First check if tierIcon is directly provided
    if (entity.tierIcon) return entity.tierIcon;
    
    // For traits with tier information
    if (entity.tier && entity.tier > 0 && entity.numUnits && entity.numUnits > 0 && entity.id) {
      const tierIcon = getTierIcon(entity.id, entity.numUnits);
      if (tierIcon) return tierIcon;
    }
  }
  
  // Default to regular icon path
  return ensureIconPath(entity.icon, normalizedType);
};

// Utility to safely get all trait data from unit - CRITICAL FIX for unit traits
export const getUnitTraits = (unit: any): { id: string, type: 'origin' | 'class' }[] => {
  if (!unit || !unit.traits) return [];
  
  const result: { id: string, type: 'origin' | 'class' }[] = [];
  
  // Extract origin traits
  if (unit.traits.origin) {
    if (Array.isArray(unit.traits.origin)) {
      unit.traits.origin.filter(Boolean).forEach((traitId: string) => {
        result.push({ id: traitId, type: 'origin' });
      });
    } else if (unit.traits.origin) {
      result.push({ id: unit.traits.origin, type: 'origin' });
    }
  }
  
  // Extract class traits
  if (unit.traits.class) {
    if (Array.isArray(unit.traits.class)) {
      unit.traits.class.filter(Boolean).forEach((traitId: string) => {
        result.push({ id: traitId, type: 'class' });
      });
    } else if (unit.traits.class) {
      result.push({ id: unit.traits.class, type: 'class' });
    }
  }
  
  return result;
};

// Get full trait info from id
export const getTraitInfo = (traitId: string): { 
  id: string;
  name: string; 
  icon: string; 
  isOrigin: boolean;
  tiers?: { units: number; value: string; icon?: string }[];
} | null => {
  if (!traitId) return null;
  
  const origins = traitsJson.origins as Record<string, any>;
  const classes = traitsJson.classes as Record<string, any>;
  
  if (origins[traitId]) {
    return { 
      id: traitId,
      ...origins[traitId], 
      isOrigin: true 
    };
  }
  
  if (classes[traitId]) {
    return { 
      id: traitId,
      ...classes[traitId], 
      isOrigin: false 
    };
  }
  
  return null;
};
