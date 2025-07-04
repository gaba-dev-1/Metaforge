import React from 'react';
import Link from 'next/link';
import { getCostColor, getEntityIcon, getIconPath, DEFAULT_ICONS } from '@/utils/paths';
import { ProcessedItem, ProcessedUnit, ProcessedTrait, Composition } from '@/types';
import traitsJson from 'public/mapping/traits.json';
import unitsJson from 'public/mapping/units.json';
import itemsJson from 'public/mapping/items.json';
import { getTierName } from '@/utils/paths';

// Create context for tooltip
const TooltipContext = React.createContext({
  content: null as React.ReactNode, 
  position: { x: 0, y: 0 }, 
  show: (content: React.ReactNode, e: React.MouseEvent) => {}, 
  hide: () => {}
});

export const useTooltip = () => React.useContext(TooltipContext);

// Define types for our entities
interface UnitDetails {
  name: string;
  icon: string;
  cost: number;
  traits?: {
    origin?: string | string[];
    class?: string | string[];
  };
  ability?: {
    name: string;
    description: string;
    type: string;
    mana_cost?: number[];
  };
}

interface ItemDetails {
  name: string;
  category: string;
  icon: string;
  description?: string;
  stats?: string[];
}

interface ItemCombo {
  mainItem: ProcessedItem;
  items: ProcessedItem[];
  winRate: number;
}

// Enhanced tooltips for each entity type
export const renderUnitTooltip = (unit: ProcessedUnit) => {
  if (!unit) return null;
  
  const unitDetails = unitsJson.units[unit.id as keyof typeof unitsJson.units] as UnitDetails | undefined;
  const origin = unitDetails?.traits?.origin ? (Array.isArray(unitDetails.traits.origin) ? unitDetails.traits.origin[0] : unitDetails.traits.origin) : null;
  const unitClass = unitDetails?.traits?.class ? (Array.isArray(unitDetails.traits.class) ? unitDetails.traits.class[0] : unitDetails.traits.class) : null;
  
  const originData = origin ? traitsJson.origins[origin as keyof typeof traitsJson.origins] : null;
  const classData = unitClass ? traitsJson.classes[unitClass as keyof typeof traitsJson.classes] : null;
  
  return (
    <div className="min-w-60 max-w-64 font-sans">
      <div className="flex items-start gap-2 mb-2">
        <div className="rounded-full border-2 w-10 h-10 flex-shrink-0 overflow-hidden" 
             style={{ borderColor: getCostColor(unit.cost) }}>
          <img 
            src={getEntityIcon(unit, 'unit')} 
            alt={unit.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_ICONS.unit;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gold truncate">{unit.name}</div>
          <div className="text-xs flex items-center">
            <span className="text-cream/90 mr-1">Cost:</span>
            <span className="font-medium text-cream">{unit.cost}🪙</span>
          </div>
        </div>
      </div>
      
      <div className="text-xs flex flex-wrap gap-1 mb-2">
        <span className="text-cream/80">Categories:</span>
        {originData && (
          <div className="bg-brown-light/40 px-1.5 py-0.5 rounded text-xs flex items-center">
            <img 
              src={getIconPath(originData.icon, 'trait')} 
              alt={originData.name} 
              className="w-3 h-3 mr-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_ICONS.trait;
              }}
            />
            <span>{originData.name}</span>
          </div>
        )}
        {classData && (
          <div className="bg-brown-light/40 px-1.5 py-0.5 rounded text-xs flex items-center">
            <img 
              src={getIconPath(classData.icon, 'trait')} 
              alt={classData.name} 
              className="w-3 h-3 mr-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_ICONS.trait;
              }}
            />
            <span>{classData.name}</span>
          </div>
        )}
      </div>
      
      {/* Best items section - without names */}
      {unit.bestItems && unit.bestItems.length > 0 && (
        <div className="border-t border-gold/20 pt-1 mb-2">
          <div className="text-xs text-cream/90 font-medium mb-1">Best Items:</div>
          <div className="flex gap-1 justify-center">
            {unit.bestItems.slice(0, 3).map((item, i) => (
              <Link href={`/entity/items/${item.id}`} key={i} className="block">
                <div className="relative group">
                  <img 
                    src={getEntityIcon(item, 'item')} 
                    alt={item.name} 
                    className="w-8 h-8 object-contain border border-gold/30 rounded p-0.5 bg-brown-light/30"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_ICONS.item;
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const renderItemTooltip = (item: ProcessedItem) => {
  if (!item) return null;
  
  const itemDetails = itemsJson.items[item.id as keyof typeof itemsJson.items] as ItemDetails | undefined;
  
  // Get potential combos
  const combos = item.combos || [];
  
  return (
    <div className="min-w-60 max-w-64 font-sans">
      <div className="flex items-start gap-2 mb-2">
        <div className="w-10 h-10 flex-shrink-0 border border-gold/30 rounded p-1 bg-brown-light/20">
          <img 
            src={getEntityIcon(item, 'item')} 
            alt={item.name} 
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_ICONS.item;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gold truncate">{item.name}</div>
          <div className="text-xs text-cream/80 truncate">
            {itemDetails?.category && 
              itemDetails.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </div>
        </div>
      </div>
      
      <div className="text-xs flex flex-wrap gap-1 mb-2">
        <span className="text-cream/80">Category:</span>
        <div className="bg-brown-light/40 px-1.5 py-0.5 rounded text-xs">
          {itemDetails?.category && 
            itemDetails.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </div>
      </div>
      
      {/* Stats section */}
      {itemDetails?.stats && itemDetails.stats.length > 0 && (
        <div className="text-xs border-b border-gold/20 pb-1 mb-2">
          <div className="text-cream/90 font-medium mb-1">Stats:</div>
          <div className="space-y-0.5">
            {itemDetails.stats.map((stat, i) => (
              <div key={i} className="text-gold-light">{stat}</div>
            ))}
          </div>
        </div>
      )}
      
      {itemDetails?.description && (
        <div className="text-xs border-t border-gold/20 pt-1 italic text-cream/90 mb-2 line-clamp-3">
          {itemDetails.description}
        </div>
      )}
      
      {/* Best units section */}
      {item.unitsWithItem && item.unitsWithItem.length > 0 && (
        <div className="border-t border-gold/20 pt-1 mb-2">
          <div className="text-xs text-cream/90 font-medium mb-1">Best Units:</div>
          <div className="flex flex-wrap gap-1 justify-center">
            {item.unitsWithItem.slice(0, 3).map((unit, i) => (
              <Link href={`/entity/units/${unit.id}`} key={i} className="block">
                <div className="relative group flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border-2 overflow-hidden"
                       style={{ borderColor: getCostColor(unit.cost) }}>
                    <img 
                      src={getEntityIcon(unit, 'unit')} 
                      alt={unit.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = DEFAULT_ICONS.unit;
                      }}
                    />
                  </div>
                  <div className="text-xs mt-0.5 text-center max-w-8 truncate">{unit.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Best combos section */}
      {combos.length > 0 && (
        <div className="border-t border-gold/20 pt-1 mb-2">
          <div className="text-xs text-cream/90 font-medium mb-1">Best Combos:</div>
          <div className="space-y-1">
            {combos.slice(0, 2).map((combo, i) => (
              <div key={i} className="flex items-center justify-center gap-1 bg-brown-light/30 p-1 rounded">
                {combo.items.map((comboItem, j) => (
                  <Link href={`/entity/items/${comboItem.id}`} key={j} className="block">
                    <img 
                      src={getEntityIcon(comboItem, 'item')} 
                      alt={comboItem.name} 
                      className="w-6 h-6 object-contain border border-gold/20 rounded bg-brown-light/40"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = DEFAULT_ICONS.item;
                      }}
                    />
                  </Link>
                ))}
                <div className="text-xs text-cream/90 ml-1">
                  {combo.winRate.toFixed(1)}% Win
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const renderTraitTooltip = (trait: ProcessedTrait) => {
  if (!trait) return null;
  
  const traitData = traitsJson.origins[trait.id as keyof typeof traitsJson.origins] || 
                    traitsJson.classes[trait.id as keyof typeof traitsJson.classes];
  
  const traitType = Object.keys(traitsJson.origins).includes(trait.id) ? 'Origin' : 'Class';
  
  // Get all units with this trait
  const unitsWithTrait = Object.entries(unitsJson.units)
    .filter(([_, unit]) => {
      if (!unit || !('traits' in unit) || !unit.traits) return false;
      
      // Check origins
      const origins = unit.traits.origin ? 
        (Array.isArray(unit.traits.origin) ? unit.traits.origin : [unit.traits.origin]) : [];
      
      // Check classes
      const classes = unit.traits.class ?
        (Array.isArray(unit.traits.class) ? unit.traits.class : [unit.traits.class]) : [];
      
      // Check if any origins or classes match the trait id
      return [...origins, ...classes].includes(trait.id);
    })
    .map(([id, unit]) => ({
      id,
      name: unit.name,
      icon: unit.icon, 
      cost: unit.cost
    }))
    .sort((a, b) => a.cost - b.cost);
  
  return (
    <div className="min-w-60 max-w-72 font-sans">
      <div className="flex items-start gap-2 mb-2">
        <div className="w-12 h-12 flex-shrink-0 rounded p-1 bg-brown-light/20">
          <img 
            src={getEntityIcon(trait, 'trait')} 
            alt={trait.name} 
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_ICONS.trait;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gold truncate">{trait.name}</div>
          <div className="text-xs flex items-center gap-1.5">
            <span className="text-cream/80">Type:</span>
            <span className="bg-brown-light/40 py-0.5 rounded text-xs">{traitType}</span>
          </div>
        </div>
      </div>
      
      {trait.tier > 0 && (
        <div className="text-xs flex flex-wrap gap-1 mb-2">
          <span className="text-cream/80">Active Level:</span>
          <span className="text-cream bg-brown-light/50 px-1.5 py-0.5 rounded-full text-xs">
            {trait.numUnits}-units {getTierName(trait.tier)}
          </span>
        </div>
      )}
      
      {traitData?.description && (
        <div className="text-xs border-t border-gold/20 pt-1 text-cream/90 mb-2 line-clamp-3">
          {traitData.description}
        </div>
      )}
      
      {/* Tier bonuses section */}
      {traitData?.tiers && traitData.tiers.length > 0 && (
        <div className="text-xs border-t border-gold/20 pt-1 mb-2">
          <div className="font-medium text-gold mb-1">Tier Bonuses:</div>
          <div className="space-y-1">
            {traitData.tiers.map((tier, i) => (
              <div 
                key={i} 
                className={`rounded p-1 flex items-center gap-1 text-xs ${
                  trait.tier > i 
                    ? 'bg-gold/20' 
                    : 'bg-brown-light/30 text-cream/60'
                }`}
              >
                <span className="font-semibold">{tier.units}:</span>
                <span className="line-clamp-1">{tier.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Units with this trait section */}
      {unitsWithTrait.length > 0 && (
        <div className="text-xs border-t border-gold/20 pt-1 mb-2">
          <div className="font-medium text-gold mb-1">Units ({unitsWithTrait.length}):</div>
          <div className="flex flex-wrap gap-1 justify-center">
            {unitsWithTrait.slice(0, 8).map((unit, i) => (
              <Link href={`/entity/units/${unit.id}`} key={i} className="block">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full border overflow-hidden"
                       style={{ borderColor: getCostColor(unit.cost) }}>
                    <img 
                      src={getEntityIcon(unit, 'unit')} 
                      alt={unit.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = DEFAULT_ICONS.unit;
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const renderCompTooltip = (comp: Composition) => {
  if (!comp) return null;
  
  // Extract the core units (highest cost and most played)
  const coreUnits = comp.units
    .filter(unit => unit.count && unit.count > 0)
    .sort((a, b) => {
      // Sort by count first, then by cost
      if (a.count !== b.count) return (b.count || 0) - (a.count || 0);
      return b.cost - a.cost;
    })
    .slice(0, 6);
  
  // Extract the main traits
  const mainTraits = comp.traits
    .filter(trait => trait.tier > 1)
    .sort((a, b) => b.tier - a.tier)
    .slice(0, 4);
  
  const loadInTeamBuilder = (e: React.MouseEvent) => {
    e.preventDefault();
    // Save comp to localStorage for loading in team builder
    if (typeof window !== 'undefined') {
      localStorage.setItem('loadComp', JSON.stringify(comp));
      window.location.href = '/team-builder';
    }
  };
  
  return (
    <div className="min-w-64 max-w-80 font-sans">
      <div className="flex items-start gap-2 mb-2">
        <div className="flex -space-x-1">
          {mainTraits.slice(0, 2).map((trait, i) => (
            <img 
              key={i} 
              src={getEntityIcon(trait, 'trait')} 
              alt={trait.name} 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_ICONS.trait;
              }}
            />
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gold truncate max-w-full">{comp.name}</div>
          <div className="text-xs text-cream/70">
            <span className="bg-brown-light/40 px-1.5 py-0.5 rounded text-xs">
              {comp.units && comp.units.filter(u => u.cost >= 4).length >= 3 ? "Fast 9" : 
              comp.units && comp.units.filter(u => u.cost <= 2).length >= 4 ? "Reroll" : "Standard"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-xs flex items-center gap-1 mb-2">
        <span className="text-cream/80">Performance:</span>
        <span className="text-gold/90 font-medium">{comp.winRate ? comp.winRate.toFixed(1) + '% Win' : ''}</span>
        <span className="text-cream/60">•</span>
        <span className="text-cream/90">{comp.avgPlacement ? comp.avgPlacement.toFixed(2) + ' Avg' : ''}</span>
      </div>
      
      {/* Core units section */}
      <div className="mb-2 border-t border-gold/20 pt-1">
        <div className="text-xs text-cream/90 font-medium mb-1">Core Units:</div>
        <div className="flex flex-wrap gap-1 justify-center">
          {coreUnits.map((unit, i) => (
            <Link href={`/entity/units/${unit.id}`} key={i} className="block">
              <div className="relative">
                <div className="w-8 h-8 rounded-full border-2 overflow-hidden"
                     style={{ borderColor: getCostColor(unit.cost) }}>
                  <img 
                    src={getEntityIcon(unit, 'unit')} 
                    alt={unit.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_ICONS.unit;
                    }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Traits section */}
      <div className="mb-2 border-t border-gold/20 pt-1">
        <div className="text-xs text-cream/90 font-medium mb-1">Active Traits:</div>
        <div className="flex flex-wrap gap-1 justify-center">
          {mainTraits.map((trait, i) => (
            <Link href={`/entity/traits/${trait.id}`} key={i} className="block">
              <div 
                className="bg-brown-light/30 px-2 py-0.5 rounded text-xs flex items-center gap-1"
              >
                <img 
                  src={getEntityIcon(trait, 'trait')} 
                  alt={trait.name} 
                  className="w-4 h-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_ICONS.trait;
                  }}
                />
                <span>{trait.name} ({trait.numUnits})</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Load in Team Builder button */}
      <div className="mt-3 border-t border-gold/20 pt-2">
        <Link href="/team-builder" onClick={loadInTeamBuilder} className="block">
          <div
            className="w-full text-xs bg-gold hover:bg-gold-light text-brown py-1.5 px-3 rounded flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <span>Load in Team Builder</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = React.useState<React.ReactNode>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const show = (content: React.ReactNode, e: React.MouseEvent) => {
    // Calculate position to avoid going off screen
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(rect.left, window.innerWidth - 320);
    
    // Position above or below based on space
    const y = rect.top + window.scrollY;
    const spaceBelow = window.innerHeight - rect.bottom;
    const posY = spaceBelow < 250 && rect.top > 250 ? y - 10 : y + rect.height + 10;
    
    setContent(content);
    setPosition({ x, y: posY });
  };

  const hide = () => setContent(null);

  return (
    <TooltipContext.Provider value={{ content, position, show, hide }}>
      {children}
      {content && (
        <div className="tooltip z-50 max-w-sm" style={{
          left: position.x, top: position.y, opacity: content ? 1 : 0
        }}>
          {content}
        </div>
      )}
    </TooltipContext.Provider>
  );
}
