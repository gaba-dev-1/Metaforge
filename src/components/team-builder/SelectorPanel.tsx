import React, { useState, useEffect, useMemo } from 'react';
import { Search, UserIcon, PackageIcon, Layers } from 'lucide-react';
import { DraggableUnit, DraggableItem } from './DraggableComponents';
import { ProcessedUnit, ProcessedItem } from '@/types';
import traitsJson from 'public/mapping/traits.json';
import itemsJson from 'public/mapping/items.json';
import { getUnitTraits, getTraitInfo } from '@/utils/paths';

interface SelectorPanelProps {
  filteredUnits: ProcessedUnit[];
  filteredItems: ProcessedItem[];
  search: string;
  setSearch: (value: string) => void;
  board: Record<string, any>;
  setBoard: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

// Interface for trait display
interface TraitDisplay {
  id: string;
  name: string;
  icon: string;
  units: ProcessedUnit[];
}

// Interface for item category
interface ItemCategory {
  id: string;
  name: string;
  items: ProcessedItem[];
}

export default function SelectorPanel({ 
  filteredUnits, 
  filteredItems,
  search, 
  setSearch,
  board,
  setBoard
}: SelectorPanelProps) {
  const [activeTab, setActiveTab] = useState('units');
  const [expandedTraits, setExpandedTraits] = useState<string[]>([]);
  
  // Process traits for display with proper trait data
  const traitGroups = useMemo(() => {
    const traitMap = new Map<string, TraitDisplay>();
    
    // First pass - create trait objects with proper data
    Object.entries({ ...traitsJson.origins, ...traitsJson.classes }).forEach(([id, trait]) => {
      traitMap.set(id, {
        id,
        name: trait.name,
        icon: trait.icon,
        units: []
      });
    });
    
    // Second pass - assign units to traits using the improved getUnitTraits function
    filteredUnits.forEach(unit => {
      // Get all unit traits using our helper function
      const unitTraitsList = getUnitTraits(unit);
      
      // Add unit to each of its traits
      unitTraitsList.forEach(traitEntry => {
        const trait = traitMap.get(traitEntry.id);
        if (trait) {
          trait.units.push(unit);
        }
      });
    });
    
    // Convert to array and sort
    return Array.from(traitMap.values())
      .filter(trait => trait.units.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredUnits]);
  
  // Process items by category, with crafted items first
  const itemCategories = useMemo(() => {
    const categoryMap = new Map<string, ItemCategory>();
    
    // Get all categories
    filteredItems.forEach(item => {
      const category = item.category || 'other';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          id: category,
          name: category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          items: []
        });
      }
      categoryMap.get(category)?.items.push(item);
    });
    
    // Convert to array and sort (crafted first, then alphabetically)
    const sortedCategories = Array.from(categoryMap.values());
    
    // Special ordering for categories
    return sortedCategories.sort((a, b) => {
      // Crafted items first
      if (a.id === 'completed') return -1;
      if (b.id === 'completed') return 1;
      
      // Basic items next
      if (a.id === 'basic') return -1;
      if (b.id === 'basic') return 1;
      
      // Alphabetical for the rest
      return a.name.localeCompare(b.name);
    });
  }, [filteredItems]);
  
  // Toggle trait expansion
  const toggleTrait = (traitId: string) => {
    setExpandedTraits(prev => 
      prev.includes(traitId) 
        ? prev.filter(id => id !== traitId)
        : [...prev, traitId]
    );
  };
  
  // Helper to get unit range
  const getUnitRange = (unit: ProcessedUnit): number => {
    // Try to get range from unit stats using type assertion for extended stats
    const unitStats = unit.stats as Record<string, any> | undefined;
    if (unitStats && 'range' in unitStats) {
      return Number(unitStats.range);
    }
    
    // Default range based on unit class
    if (unit.traits) {
      // Get unit traits using our helper
      const unitTraitsList = getUnitTraits(unit);
      const unitTraitIds = unitTraitsList.map(t => t.id);
      
      // Long range units (row 3)
      const longRangeClasses = ['sniper', 'cannoneer', 'mage', 'artillery'];
      if (unitTraitIds.some(trait => longRangeClasses.includes(trait))) {
        return 4;
      }
      
      // Melee units (row1)
      const meleeClasses = ['assassin', 'brawler', 'warrior', 'duelist'];
      if (unitTraitIds.some(trait => meleeClasses.includes(trait))) {
        return 1;
      }
    }
    
    // Default to middle range
    return 2;
  };
  
  // Handle double click on unit for auto-placement
  const handleUnitDoubleClick = (unit: ProcessedUnit) => {
    // Get the unit's range from its stats
    const range = getUnitRange(unit);
    
    // Determine which row to place the unit based on range (0-indexed)
    const targetRow = Math.min(range - 1, 3);
    
    // Find first available position in the target row
    let placed = false;
    for (let col = 0; col < 7; col++) {
      const hexId = `${col}-${targetRow}`;
      if (!board[hexId]) {
        setBoard(prev => ({
          ...prev,
          [hexId]: { 
            unit: {
              ...unit,
              starLevel: 0 // Default to no stars
            } 
          }
        }));
        placed = true;
        break;
      }
    }
    
    // If row is full, try other rows
    if (!placed) {
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 7; col++) {
          const hexId = `${col}-${row}`;
          if (!board[hexId]) {
            setBoard(prev => ({
              ...prev,
              [hexId]: { 
                unit: {
                  ...unit,
                  starLevel: 0 // Default to no stars
                } 
              }
            }));
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
    }
  };
  
  return (
    <div className="panel-card h-full rounded-none border-0 border-l border-gold/20">
      <div className="p-2 border-b border-gold/20">
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-brown-light/30 border border-gold/30 rounded-md text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gold/70 h-4 w-4" />
        </div>
        
        <div className="flex border-b border-gold/20">
          <button
            onClick={() => setActiveTab('units')}
            className={`px-3 py-1.5 text-sm flex items-center gap-1 ${
              activeTab === 'units' 
                ? 'text-gold border-b-2 border-gold' 
                : 'text-cream/70 hover:text-cream'
            }`}
          >
            <UserIcon size={14} />
            <span>Units</span>
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-3 py-1.5 text-sm flex items-center gap-1 ${
              activeTab === 'items' 
                ? 'text-gold border-b-2 border-gold' 
                : 'text-cream/70 hover:text-cream'
            }`}
          >
            <PackageIcon size={14} />
            <span>Items</span>
          </button>
          <button
            onClick={() => setActiveTab('traits')}
            className={`px-3 py-1.5 text-sm flex items-center gap-1 ${
              activeTab === 'traits' 
                ? 'text-gold border-b-2 border-gold' 
                : 'text-cream/70 hover:text-cream'
            }`}
          >
            <Layers size={14} />
            <span>Traits</span>
          </button>
        </div>
      </div>
      
      <div className="h-[calc(100vh-320px)] overflow-y-auto p-2">
        {activeTab === 'units' && (
          <div className="grid grid-cols-5 gap-2">
            {filteredUnits.map((unit) => (
              <div 
                key={unit.id} 
                className="flex flex-col items-center"
                onDoubleClick={() => handleUnitDoubleClick(unit)}
              >
                <DraggableUnit unit={unit} />
                {/* Unit names removed as requested */}
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'items' && (
          <div className="space-y-4">
            {itemCategories.map((category) => (
              <div key={category.id} className="mb-4">
                <div className="text-xs font-medium text-gold-light mb-2 border-b border-gold/20 pb-1">
                  {category.name}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {category.items.map((item) => (
                    <div key={item.id} className="flex flex-col items-center">
                      <DraggableItem item={item} />
                      {/* Item names removed as requested */}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'traits' && (
          <div className="space-y-2">
            {traitGroups.map((trait) => (
              <div key={trait.id} className="border border-gold/10 rounded bg-brown-light/20">
                <div 
                  className="flex items-center p-2 cursor-pointer"
                  onClick={() => toggleTrait(trait.id)}
                >
                  <img 
                    src={`/assets/traits/${trait.icon}`} 
                    alt={trait.name} 
                    className="w-6 h-6 mr-2" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/app/default.png';
                    }}
                  />
                  <span className="text-sm">{trait.name}</span>
                  <span className="ml-auto text-xs text-cream/60">{trait.units.length} units</span>
                </div>
                
                {expandedTraits.includes(trait.id) && (
                  <div className="p-2 pt-0">
                    <div className="grid grid-cols-5 gap-2 mt-2 border-t border-gold/10 pt-2">
                      {trait.units.map((unit) => (
                        <div 
                          key={unit.id} 
                          className="flex flex-col items-center"
                          onDoubleClick={() => handleUnitDoubleClick(unit)}
                        >
                          <DraggableUnit unit={unit} />
                          {/* Unit names removed */}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
