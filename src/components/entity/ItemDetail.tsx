import React from 'react';
import Link from 'next/link';
import { ItemIcon, UnitIcon, StatsPanel, TraitIcon } from '@/components/ui';
import itemsJson from 'public/mapping/items.json';
import { ProcessedItem } from '@/types';
import { getCostColor, getEntityIcon, DEFAULT_ICONS } from '@/utils/paths';

interface ItemDetails {
  name: string;
  category: string;
  icon: string;
  description?: string;
  stats?: string[];
  recipe?: string[];
}

export default function ItemDetail({ 
  entityData,
  itemDetails: propItemDetails
}: { 
  entityData: ProcessedItem | null;
  itemDetails?: ItemDetails;
}) {
  if (!entityData) return null;
  
  // Get detailed item information from the JSON or use provided itemDetails
  const itemDetails = propItemDetails || 
    (itemsJson.items[entityData.id as keyof typeof itemsJson.items] as ItemDetails | undefined);
  
  // Prepare placement data for distribution chart if available
  const placementData = entityData.relatedComps ? 
    entityData.relatedComps.reduce((acc, comp) => {
      if (!comp.placementData) return acc;
      
      comp.placementData.forEach(pd => {
        const existing = acc.find(a => a.placement === pd.placement);
        if (existing) {
          existing.count += pd.count;
        } else {
          acc.push({ ...pd });
        }
      });
      return acc;
    }, [] as Array<{ placement: number; count: number }>) : 
    undefined;

  // IMPROVED: Check for empty unitsWithItem and combos arrays to prevent issues
  const hasUnitsWithItem = entityData.unitsWithItem && entityData.unitsWithItem.length > 0;
  const hasItemCombos = entityData.combos && entityData.combos.length > 0;
  const hasRelatedComps = entityData.relatedComps && entityData.relatedComps.length > 0;

  return (
    <>
      {/* Header Section with Recipe moved here */}
      <div className="flex items-center border-b border-gold/30 pb-4 mb-4">
        {/* Left side with item icon */}
        <div className="flex items-center gap-4">
          <ItemIcon item={entityData} size="lg" />
          <div>
            <h1 className="text-xl font-bold text-gold">{entityData.name}</h1>
            {(itemDetails?.category || entityData.category) && (
              <p className="text-sm text-cream/80">
                {(itemDetails?.category || entityData.category || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </p>
            )}
          </div>
        </div>
        
        {/* Right side with recipe - larger icons, no names */}
        {itemDetails?.recipe && itemDetails.recipe.length > 0 && (
          <div className="ml-auto flex items-center gap-4">
            {itemDetails.recipe.map((componentId, i) => {
              const componentItem = itemsJson.items[componentId as keyof typeof itemsJson.items];
              if (!componentItem) return null;
              
              return (
                <React.Fragment key={i}>
                  <Link href={`/entity/items/${componentId}`} className="group">
                    <div className="relative">
                      <div className="w-14 h-14">
                        <img 
                          src={getEntityIcon({id: componentId, icon: componentItem.icon}, 'item')} 
                          alt={componentItem.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-brown-dark text-xs text-cream py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {componentItem.name}
                      </div>
                    </div>
                  </Link>
                  {i < (itemDetails.recipe?.length || 0) - 1 && (
                    <span className="text-gold text-3xl font-light">+</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Unified Item Details Section */}
          <div className="bg-brown-dark/20 rounded-lg p-4 shadow-md border border-gold/5">
            <h2 className="text-lg font-semibold text-gold mb-4">Item Details</h2>
            
            {/* Stats Section - Displayed with centered layout */}
            {itemDetails?.stats && itemDetails.stats.length > 0 && (
              <div className="mb-4 flex justify-center">
                <div className="flex flex-wrap justify-center gap-2">
                  {itemDetails.stats.map((stat, i) => (
                    <div key={i} className="bg-brown-light/40 px-3 py-2 rounded shadow-sm border border-gold/5">
                      <span className="text-gold-light font-medium">{stat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Description Section - Centered text */}
            {itemDetails?.description && (
              <div className="text-center">
                <p className="text-cream/90 bg-brown-light/30 p-4 rounded shadow-sm border border-gold/5 whitespace-pre-line">{itemDetails.description}</p>
              </div>
            )}
            
            {/* If no data available */}
            {!itemDetails?.description && !itemDetails?.stats?.length && (
              <p className="text-cream/60 text-center py-2">No detailed information available for this item.</p>
            )}
          </div>
          
          {/* Performance Stats */}
          <div className="bg-brown-dark/20 rounded-lg p-4 shadow-md border border-gold/5">
            <h2 className="text-lg font-semibold text-gold mb-3">Performance Stats</h2>
            <StatsPanel stats={{
              ...entityData.stats,
              placementData
            }} />
          </div>

          {/* Item Combos - MOVED HERE and showing only 3 */}
          {hasItemCombos && (
            <div className="bg-brown-dark/20 rounded-lg p-4 shadow-md border border-gold/5">
              <h2 className="text-lg font-semibold text-gold mb-3">Popular Combos</h2>
              <div className="space-y-3">
                {entityData.combos!.slice(0, 3).map((combo, i) => (
                  <div key={i} className="bg-brown-light/40 p-3 rounded hover:bg-gold/15 transition-all shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      {combo.items.map((item, j) => (
                        <Link href={`/entity/items/${item.id}`} key={j}>
                          <div className="relative group">
                            <ItemIcon item={item} size="md" />
                            <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-brown-dark text-xs text-cream p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {item.name}
                            </div>
                          </div>
                        </Link>
                      ))}
                      <div className="ml-auto flex items-center">
                        <span className="text-sm text-gold-light">
                          Win: {Math.min(combo.winRate || 0, 100).toFixed(1)}%
                        </span>
                        {combo.frequency !== undefined && (
                          <span className="text-sm text-cream/60 ml-2">
                            ({Math.round(combo.frequency * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Best Units */}
          {hasUnitsWithItem && (
            <div className="bg-brown-dark/20 rounded-lg p-4 shadow-md border border-gold/5">
              <h2 className="text-lg font-semibold text-gold mb-3">Best Units</h2>
              <div className="grid grid-cols-3 gap-3">
                {entityData.unitsWithItem!.slice(0, 6).map((unit, i) => (
                  <Link href={`/entity/units/${unit.id}`} key={i}>
                    <div className="flex flex-col items-center gap-2 bg-brown-light/40 p-3 rounded hover:bg-gold/15 transition-all shadow-sm">
                      <UnitIcon unit={unit} size="md" />
                      <div className="text-center">
                        <div className="text-sm font-medium truncate max-w-28">{unit.name}</div>
                        <div className="flex flex-col text-xs">
                          <span className="text-gold-light">
                            Win: {Math.min(unit.winRate || 0, 100).toFixed(1)}%
                          </span>
                          <span className="text-cream/70">
                            Avg: {unit.avgPlacement?.toFixed(2) || '?'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Related Compositions */}
          {hasRelatedComps && (
            <div className="bg-brown-dark/20 rounded-lg p-4 shadow-md border border-gold/5">
              <h2 className="text-lg font-semibold text-gold mb-3">Top Compositions</h2>
              <div className="grid grid-cols-2 gap-3">
                {entityData.relatedComps!.slice(0, 4).map((comp, i) => (
                  <Link href={`/entity/comps/${comp.id}`} key={i}>
                    <div className="bg-brown-light/40 p-3 rounded hover:bg-gold/15 transition-all shadow-sm">
                      <div className="flex justify-center gap-1 mb-2">
                        {(comp.traits || []).slice(0, 3).map((trait, j) => (
                          <TraitIcon 
                            key={j} 
                            trait={trait} 
                            size="sm"
                          />
                        ))}
                      </div>
                      <div className="text-sm font-medium text-center truncate mb-2">
                        {comp.name?.split('&')[0] || 'Comp'}
                      </div>
                      <div className="text-xs text-center flex justify-between px-2">
                        <span>Win: {Math.min(comp.winRate || 0, 100).toFixed(1)}%</span>
                        <span>Avg: {comp.avgPlacement?.toFixed(2)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* FALLBACK: If no relationship data is available */}
          {!hasUnitsWithItem && !hasItemCombos && !hasRelatedComps && (
            <div className="bg-brown-dark/20 rounded-lg p-4 shadow-md border border-gold/5">
              <h2 className="text-lg font-semibold text-gold mb-3">Usage Info</h2>
              <p className="text-cream/70 text-center p-4">
                No detailed usage information available for this item yet. 
                Check back later for data about which units work best with this item.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
