import React from 'react';
import Link from 'next/link';
import { parseCompTraits } from '@/utils/dataProcessing';
import { Composition, ProcessedDisplayTrait } from '@/types';
import { getEntityIcon } from '@/utils/paths';

interface CompCardProps {
  comp: Composition | null;
  highlight?: boolean;
}

export default function CompCard({ comp, highlight = false }: CompCardProps) {
  if (!comp) return null;
  
  const displayTraits = parseCompTraits(comp.name, comp.traits || []);
  
  // Calculate if this is a high-performing comp
  const isTopTier = (comp.winRate || 0) > 52 && (comp.avgPlacement || 8) < 4;
  
  return (
    <Link href={`/entity/comps/${comp.id}`}>
      <div 
        className={`p-3 rounded-lg transition-all shadow-md ${
          highlight 
            ? 'bg-gold/15 hover:bg-gold/25 border border-gold/20' 
            : isTopTier
              ? 'bg-brown-light/40 hover:bg-gold/15 border border-gold/10'
              : 'bg-brown-dark/30 hover:bg-gold/15 border border-transparent'
        } relative`}
      >
        {/* Top tier indicator - subtle gold corner accent */}
        {isTopTier && !highlight && (
          <div className="absolute top-0 right-0 w-5 h-5 overflow-hidden">
            <div className="absolute -right-0 -top-0 transform rotate-45 bg-gold shadow-sm w-7 h-1"></div>
          </div>
        )}
        
        <div className="flex justify-center gap-2 mb-3">
          {displayTraits.map((trait: ProcessedDisplayTrait, i: number) => (
            <div key={i} className="flex-shrink-0 w-7 h-7 bg-brown-light/30 rounded-full p-1">
              <img
                src={getEntityIcon(trait, 'trait')}
                alt={trait.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/app/default.png';
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Improved truncation for long comp names with ellipsis */}
        <div className="text-sm font-medium text-center truncate mb-3 px-1">
          {comp.name?.split('&')[0]?.trim() || 'Comp'}
        </div>
        
        <div className="flex justify-between items-center bg-brown-dark/40 rounded-md px-3 py-2 text-xs">
          <div className="flex flex-col items-center">
            <span className={`font-medium ${(comp.winRate || 0) >= 52 ? 'text-gold-light' : 'text-cream'}`}>
              {Math.min(comp.winRate || 0, 100).toFixed(1)}%
            </span>
            <span className="text-cream/70 text-xs">Win</span>
          </div>
          <div className="h-8 w-px bg-cream/10"></div>
          <div className="flex flex-col items-center">
            <span className={`font-medium ${(comp.avgPlacement || 8) <= 4 ? 'text-gold-light' : 'text-cream'}`}>
              {comp.avgPlacement?.toFixed(2) || '-'}
            </span>
            <span className="text-cream/70 text-xs">Avg Place</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
