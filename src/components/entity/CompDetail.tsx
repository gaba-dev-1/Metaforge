import React, { useState } from 'react';
import Link from 'next/link';
import { StatsPanel, UnitIcon, TraitIcon, ItemIcon } from '@/components/ui';
import { parseCompTraits } from '@/utils/dataProcessing';
import traitsJson from 'public/mapping/traits.json';
import { Composition } from '@/types';
import { getEntityIcon } from '@/utils/paths';

interface CompDetailProps {
  entityData: Composition | null;
}

export default function CompDetail({ entityData }: CompDetailProps) {
  const [viewMode, setViewMode] = useState<'core' | 'extended'>('core');
  
  if (!entityData) return null;

  const mainTraits: Record<string, number> = {};
  if (entityData.name) {
    entityData.name.split(' & ').forEach(part => {
      const match = part.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const [_, count, name] = match;
        mainTraits[name.trim()] = parseInt(count);
      }
    });
  }

  // Group units by cost for better organization
  const unitsByCost: Record<number, typeof entityData.units> = {};
  entityData.units?.forEach(unit => {
    if (!unitsByCost[unit.cost]) {
      unitsByCost[unit.cost] = [];
    }
    unitsByCost[unit.cost].push(unit);
  });

  // Calculate best carries based on cost and item effectiveness
  const getBestCarries = () => {
    if (!entityData.units) return [];
    
    // Sort units by carrying potential (usually higher cost units with items)
    return entityData.units
      .filter(unit => unit.cost >= 3)
      .sort((a, b) => {
        // Higher cost units are better carriers
        if (a.cost !== b.cost) return b.cost - a.cost;
        
        // Units with more items are better carriers
        const aItemCount = a.bestItems?.length || 0;
        const bItemCount = b.bestItems?.length || 0;
        if (aItemCount !== bItemCount) return bItemCount - aItemCount;
        
        return 0;
      })
      .slice(0, 3);
  };

  const bestCarries = getBestCarries();
  
  // Get core units - FIXED: exactly 6 units
  const getCoreUnits = () => {
    if (!entityData.units) return [];
    
    // Sort units by cost (descending) and then by count/importance
    return entityData.units
      .sort((a, b) => {
        // Higher cost units first
        if (a.cost !== b.cost) return b.cost - a.cost;
        // Then by count/frequency
        return (b.count || 0) - (a.count || 0);
      })
      .slice(0, 6); // Limit to exactly 6 core units
  };
  
  // Get extended units - FIXED: exactly 12 units 
  const getExtendedUnits = () => {
    if (!entityData.units) return [];
    
    // Sort units with most important first
    return entityData.units
      .sort((a, b) => {
        // Higher cost units first
        if (a.cost !== b.cost) return b.cost - a.cost;
        // Then by count/frequency
        return (b.count || 0) - (a.count || 0);
      })
      .slice(0, 12); // Limit to exactly 12 units for extended view
  };
  
  // Choose units to display based on view mode - will always be 6 or 12
  const unitsToDisplay = viewMode === 'core' ? getCoreUnits() : getExtendedUnits();

  // Calculate team power and playstyle
  const getTeamPlaystyle = () => {
    if (!entityData.units) return "Standard";
    
    const highCostUnits = entityData.units.filter(u => u.cost >= 4).length;
    const lowCostUnits = entityData.units.filter(u => u.cost <= 2).length;
    
    if (highCostUnits >= 3) return "Fast 9";
    if (lowCostUnits >= 4) return "Reroll";
    return "Standard";
  };

  return (
    <>
      {/* UPDATED: Larger trait icons with container fill */}
      <div className="flex items-center gap-4 border-b border-gold/30 pb-4 mb-6">
        <div className="flex items-center">
          {(() => {
            const displayTraits = parseCompTraits(entityData.name, entityData.traits || []);
            return displayTraits.map((trait: any, i: number) => (
              <div key={i} className="w-16 h-16 flex items-center justify-center first:ml-0">
                <img 
                  src={getEntityIcon(trait, 'trait')} 
                  alt={trait.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/app/default.png';
                  }}
                />
              </div>
            ));
          })()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gold">{entityData.name}</h1>
          <p className="text-sm text-cream/80">
            {getTeamPlaystyle()}
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {entityData.traits && entityData.traits.length > 0 && (
            <div className="bg-brown-dark/20 rounded-lg p-4 shadow-md border border-gold/5">
              <h2 className="text-lg font-semibold text-gold mb-3">Active Traits</h2>
              <div className="space-y-3">
                {(() => {
                  // Filter traits to only include those mentioned in the comp name
                  // If no main traits were found in the name, show all traits
                  const traitsToShow = Object.keys(mainTraits).length > 0 
                    ? entityData.traits.filter(trait => mainTraits.hasOwnProperty(trait.name))
                    : entityData.traits;
                  
                  return traitsToShow
                    .sort((a, b) => (b.numUnits || 0) - (a.numUnits || 0))
                    .map((trait, i) => {
                      const isMainTrait = mainTraits.hasOwnProperty(trait.name);
                      const mainTraitCount = mainTraits[trait.name];
                      
                      // Get trait tier description
                      const traitData = traitsJson.origins[trait.id as keyof typeof traitsJson.origins] || 
                                        traitsJson.classes[trait.id as keyof typeof traitsJson.classes];
                      
                      // Find the active tier
                      const tierLevel = trait.tier || 0;
                      const activeTierInfo = traitData?.tiers?.[tierLevel - 1];
                      
                      return (
                        <Link href={`/entity/traits/${trait.id}`} key={i}>
                          <div className="bg-brown-light/40 p-3 rounded hover:bg-gold/15 transition-all shadow-sm">
                            <div className="flex items-center gap-3">
                              <TraitIcon 
                                trait={{
                                  ...trait,
                                  // Ensure proper icon resolution
                                  icon: traitData?.icon || trait.icon
                                }} 
                                size="sm" 
                              />
                              <div>
                                <div className="font-medium">
                                  {trait.name} ({isMainTrait ? mainTraitCount : trait.numUnits})
                                </div>
                                {/* ADDED: Display active tier buff */}
                                {activeTierInfo && (
                                  <div className="text-xs text-gold-light mt-1">{activeTierInfo.value}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    });
                })()}
              </div>
            </div>
          )}
          
          <div className="bg-brown-dark/20 rounded-lg p-4 shadow-md border border-gold/5">
            <h2 className="text-lg font-semibold text-gold mb-3">Performance Stats</h2>
            <StatsPanel stats={{
              ...entityData,
              placementData: entityData.placementData
            }} />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-brown-dark/20 rounded-lg p-4 shadow-md border border-gold/5">
            <h2 className="text-lg font-semibold text-gold mb-3">Team Composition</h2>
            <div className="flex justify-between items-center mb-3">
              <div className="flex rounded overflow-hidden border border-gold/30">
                <button 
                  className={`px-3 py-1 text-xs font-medium ${viewMode === 'core' ? 'bg-gold text-brown' : 'bg-brown-light/30 text-cream'}`}
                  onClick={() => setViewMode('core')}
                >
                  Core
                </button>
                <button 
                  className={`px-3 py-1 text-xs font-medium ${viewMode === 'extended' ? 'bg-gold text-brown' : 'bg-brown-light/30 text-cream'}`}
                  onClick={() => setViewMode('extended')}
                >
                  Extended
                </button>
              </div>
            </div>
              
            {/* Team display grid - IMPROVED HORIZONTAL STYLE */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {unitsToDisplay.map((unit, i) => (
                <Link href={`/entity/units/${unit.id}`} key={i}>
                  <div className="flex flex-row items-center bg-brown-light/40 p-2 rounded hover:bg-gold/15 transition-all shadow-sm">
                    <UnitIcon unit={unit} size="sm" className="mr-2" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate max-w-full">{unit.name}</div>
                      <div className="flex items-center">
                        <div className="text-xs text-cream/70 mr-1">{unit.cost} 🪙</div>
                        {unit.winRate && (
                          <div className="text-xs text-gold-light">{Math.min(unit.winRate, 100).toFixed(1)}%</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Best Carries Section - IMPROVED WITH CLEARER ITEM DISPLAY */}
            {bestCarries.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gold/20">
                <h3 className="font-semibold text-gold mb-3">Best Carries</h3>
                <div className="flex justify-between gap-2">
                  {bestCarries.map((unit, i) => (
                    <Link href={`/entity/units/${unit.id}`} key={i} className="flex-1">
                      <div className="flex flex-col items-center bg-brown-light/40 p-2 rounded-lg hover:bg-gold/15 transition-all shadow-sm">
                        <UnitIcon unit={unit} size="md" className="mb-1" />
                        <div className="text-xs font-medium text-center mb-1 truncate w-full">{unit.name}</div>
                        
                        {(unit.bestItems || []).length > 0 ? (
                          <div className="flex justify-center gap-1 mt-1">
                            {(unit.bestItems || []).slice(0, 3).map((item, j) => (
                              <Link href={`/entity/items/${item.id}`} key={j} className="block">
                                <div className="relative group">
                                  <ItemIcon item={item} size="sm" />
                                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-brown-dark text-xs text-cream p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {item.name}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-cream/50 text-center mt-1">No preferred items</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
