import React from 'react';
import Link from 'next/link';
import { FileInput, Trash2 } from 'lucide-react';
import traitsJson from 'public/mapping/traits.json';
import { SavedComposition, BoardCell } from '@/types';

interface CompListProps {
  compositions: SavedComposition[];
  title: string;
  onLoad?: (comp: SavedComposition) => void;
  onDelete?: (id: string) => void;
  className?: string;
  maxHeight?: string;
}

export default function CompList({ 
  compositions, 
  title, 
  onLoad, 
  onDelete, 
  className = '',
  maxHeight = 'max-h-60'
}: CompListProps) {
  if (compositions.length === 0) {
    return (
      <div className={`mt-4 bg-brown-light/10 rounded-lg border border-gold/20 p-3 ${className}`}>
        <div className="text-center text-cream/60 text-sm">
          No {title.toLowerCase()} compositions available
        </div>
      </div>
    );
  }
  
  return (
    <div className={`mt-4 panel-card ${className}`}>
      <h3 className="panel-title">{title}</h3>
      
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-3 overflow-y-auto ${maxHeight}`}>
        {compositions.map((comp) => (
          <div 
            key={comp.id}
            className="bg-brown-light/30 border border-gold/20 rounded-lg overflow-hidden group hover:border-gold/40"
          >
            <div className="p-2 border-b border-gold/10 flex justify-between items-center">
              <div className="text-sm font-medium truncate w-[7rem]">{comp.name}</div>
              {(onLoad || onDelete) && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onLoad && (
                    <button 
                      className="bg-gold/20 hover:bg-gold/40 text-cream p-1 rounded"
                      onClick={() => onLoad(comp)}
                      title="Load"
                    >
                      <FileInput size={12} />
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      className="bg-brown-light/40 hover:bg-brown-light/60 text-cream p-1 rounded"
                      onClick={() => onDelete(comp.id)}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-2 flex flex-wrap gap-1 justify-center">
              {comp.traits && Array.isArray(comp.traits) && comp.traits.slice(0, 6).map((trait, i) => {
                const traitData = 
                  (traitsJson.origins as Record<string, any>)[trait.id] || 
                  (traitsJson.classes as Record<string, any>)[trait.id];
                return traitData ? (
                  <img 
                    key={i} 
                    src={`/assets/traits/${traitData.icon}`}
                    alt={traitData.name}
                    className="w-5 h-5"
                    title={`${traitData.name} (${trait.count})`}
                  />
                ) : null;
              })}
              
              {(!comp.traits || !Array.isArray(comp.traits) || comp.traits.length === 0) && 
                Object.values(comp.board as Record<string, BoardCell>)
                  .filter((cell: BoardCell) => cell && cell.unit)
                  .slice(0, 6)
                  .map((cell: BoardCell, i) => {
                    // Since we've filtered for cell.unit, we can safely use non-null assertion
                    const unit = cell.unit!;
                    return (
                      <img 
                        key={i}
                        src={`/assets/units/${unit.icon}`}
                        alt={unit.name}
                        className="w-6 h-6 rounded-full border"
                        style={{ borderColor: ['#9aa4af', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e74c3c'][unit.cost - 1] || '#9aa4af' }}
                      />
                    );
                  })
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
