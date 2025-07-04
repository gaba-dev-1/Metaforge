import React from 'react';
import traitsJson from 'public/mapping/traits.json';
import { getEntityIcon, getTierIcon } from '@/utils/paths';
import { useTooltip, renderTraitTooltip } from '@/components/ui/Tooltip';

interface TraitDisplay {
  id: string;
  name: string;
  count: number;
  breakpoints: number[];
  icon: string;
  tierLevel: number;
  description?: string;
}

interface TraitsPanelProps {
  traitCounts: Record<string, number>;
  traitTiers: Record<string, number>;
}

export default function TraitsPanel({ traitCounts = {}, traitTiers = {} }: TraitsPanelProps) {
  const { show, hide } = useTooltip(); // Get the tooltip functions
  const traitsData = { ...traitsJson.origins, ...traitsJson.classes } as Record<string, any>;
  
  // Process traits for display
  const activeTraits: TraitDisplay[] = Object.entries(traitCounts)
    .filter(([traitId]) => traitsData[traitId])
    .map(([traitId, count]) => {
      const traitData = traitsData[traitId];
      if (!traitData) return null;
      
      // Get tier and breakpoints
      const tierLevel = traitTiers[traitId] || 0;
      const breakpoints = traitData.tiers 
        ? traitData.tiers.map((t: { units: number }) => t.units).sort((a: number, b: number) => a - b)
        : [];
      
      // Create trait entity for proper icon resolution
      const traitEntity = {
        id: traitId,
        name: traitData.name,
        icon: traitData.icon,
        tier: tierLevel,
        numUnits: Number(count)
      };
      
      return {
        id: traitId,
        name: traitData.name,
        count: Number(count),
        breakpoints,
        icon: getEntityIcon(traitEntity, 'trait'), // Use our icon resolver for consistent handling
        tierLevel,
        description: traitData.description,
      };
    })
    .filter(Boolean) as TraitDisplay[];
  
  // Sort traits by tier level, count, and name
  const sortedActiveTraits = [...activeTraits].sort((a, b) => {
    if (a.tierLevel !== b.tierLevel) return b.tierLevel - a.tierLevel;
    if (a.count !== b.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });
  
  // Group traits by activation status
  const activatedTraits = sortedActiveTraits.filter(t => t.tierLevel > 0);
  const inactiveTraits = sortedActiveTraits.filter(t => t.tierLevel === 0);
  
  return (
    <div className="h-full panel-card rounded-none border-0 border-r border-gold/20">
      <h3 className="panel-title border-b border-gold/30">Traits</h3>
      
      <div className="h-[calc(100vh-280px)] overflow-y-auto">
        {activatedTraits.length > 0 && (
          <div>
            {activatedTraits.map((trait) => (
              <div 
                key={trait.id}
                className="flex items-center px-1.5 py-1.5 border-b border-gold/10 group hover:bg-brown-light/30"
                onMouseEnter={(e) => {
                  // Create a trait object with the format expected by renderTraitTooltip
                  const traitForTooltip = {
                    id: trait.id,
                    name: trait.name,
                    icon: trait.icon,
                    tier: trait.tierLevel,
                    numUnits: trait.count,
                    tierIcon: getTierIcon(trait.id, trait.count) // Fix: pass both required arguments
                  };
                  show(renderTraitTooltip(traitForTooltip), e);
                }}
                onMouseLeave={hide}
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  <img 
                    src={trait.icon} 
                    alt={trait.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/app/default.png';
                    }}
                  />
                </div>
                
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-brown-light/60 border border-gold/40 rounded-md ml-0.5 mr-1.5">
                  <span className="text-xs font-medium text-cream">{trait.count}</span>
                </div>
                
                <div className="flex-grow">
                  <div className="text-sm font-medium">{trait.name}</div>
                  <div className="flex items-center text-xs space-x-1.5 mt-0.5 text-cream/50">
                    {trait.breakpoints.map((bp, i) => (
                      <React.Fragment key={i}>
                        <span 
                          className={`${trait.count >= bp ? 'text-cream' : 'text-cream/50'}`}
                        >
                          {bp}
                        </span>
                        {i < trait.breakpoints.length - 1 && (
                          <span className="text-cream/40 mx-0.5">›</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {inactiveTraits.length > 0 && (
          <div>
            {inactiveTraits.map((trait) => (
              <div 
                key={trait.id}
                className="flex items-center px-1.5 py-1.5 border-b border-gold/10 opacity-70 hover:opacity-100 group hover:bg-brown-light/30"
                onMouseEnter={(e) => {
                  const traitForTooltip = {
                    id: trait.id,
                    name: trait.name,
                    icon: `/assets/traits/${traitsData[trait.id]?.icon}`,
                    tier: trait.tierLevel,
                    numUnits: trait.count,
                    tierIcon: getTierIcon(trait.id, trait.count) // Fix: pass both required arguments
                  };
                  show(renderTraitTooltip(traitForTooltip), e);
                }}
                onMouseLeave={hide}
              >
                <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center grayscale">
                  <img 
                    src={`/assets/traits/${traitsData[trait.id]?.icon}`} 
                    alt={trait.name}
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/app/default.png';
                    }}
                  />
                </div>
                
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-brown-light/60 border border-gold/20 rounded-md mx-1">
                  <span className="text-xs text-cream">{trait.count}</span>
                </div>
                
                <div className="flex-grow">
                  <div className="text-xs font-medium">{trait.name}</div>
                  <div className="flex items-center text-xs space-x-2 mt-0.5">
                    {trait.breakpoints.map((bp, i) => (
                      <React.Fragment key={i}>
                        <span className="text-cream/50">{bp}</span>
                        {i < trait.breakpoints.length - 1 && (
                          <span className="text-cream/40 mx-0.5">›</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTraits.length === 0 && (
          <div className="text-center py-4 text-cream/60 text-sm">
            Place units on the board to see active traits
          </div>
        )}
      </div>
    </div>
  );
}
