import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Layout, Card } from '@/components/ui';
import unitsJson from 'public/mapping/units.json';
import itemsJson from 'public/mapping/items.json';
import traitsJson from 'public/mapping/traits.json';
import { SavedComposition, Composition, BoardCell } from '@/types';
import { FeatureBanner, HeaderBanner, StatsCarousel } from '@/components/common';
import {
  TraitsPanel,
  Board,
  SavedCompositions,
  SuggestedCompositions,
  SelectorPanel,
  BuilderControls
} from '@/components/team-builder';

export default function TeamBuilder() {
  const [traitCounts, setTraitCounts] = useState({});
  const [traitTiers, setTraitTiers] = useState({});
  const [board, setBoard] = useState({});
  const [compositions, setCompositions] = useState<SavedComposition[]>([]);
  const [compositionName, setCompositionName] = useState('');
  const [search, setSearch] = useState('');
  const boardRef = useRef(null);
  
  // Filter units and items based on search
  const filteredUnits = useMemo(() => 
    Object.entries(unitsJson.units)
      .map(([id, unit]) => {
        // Use type assertion to define the expected shape
        return {
          id,
          name: unit.name,
          icon: unit.icon,
          cost: unit.cost,
          // Type assertion to avoid property access errors
          traits: (unit as any).traits || {},
          // Add empty stats object to match ProcessedUnit interface
          stats: {} as {
            count?: number;
            avgPlacement?: number;
            winRate?: number;
            top4Rate?: number;
          }
        };
      })
      .filter(unit => !search || unit.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name)),
    [search]
  );
  
  const filteredItems = useMemo(() => 
    Object.entries(itemsJson.items)
      .filter(([_, item]) => item.category && item.category !== 'tactician')
      .map(([id, item]) => ({
        id,
        name: item.name,
        icon: item.icon,
        category: item.category,
        // Add empty stats object to match ProcessedItem interface
        stats: {} as {
          count?: number;
          avgPlacement?: number;
          winRate?: number;
          top4Rate?: number;
        }
      }))
      .filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [search]
  );
  
  // Load saved compositions on mount
  useEffect(() => {
    try {
      const savedComps = localStorage.getItem('tft-compositions');
      if (savedComps) {
        setCompositions(JSON.parse(savedComps));
      }
      
      // Check if there's a comp to load from a tooltip
      const loadComp = localStorage.getItem('loadComp');
      if (loadComp) {
        const comp = JSON.parse(loadComp) as Composition;
        
        // Convert the composition to board cells
        const newBoard: Record<string, BoardCell> = {};
        let row = 0, col = 0;
        
        // Place units on the board
        comp.units.forEach(unit => {
          if (col >= 7) {
            col = 0;
            row++;
          }
          
          if (row < 4) {
            const hexId = `${col}-${row}`;
            
            // Here's the fixed code to safely access unit traits:
            // Create a proper type assertion to access unit traits
            const unitsData = unitsJson.units as Record<string, any>;
            const unitTraits = unitsData[unit.id]?.traits || {};
            
            newBoard[hexId] = { 
              unit: {
                ...unit,
                // Add traits from units.json
                traits: unitTraits
              }
            };
            col++;
          }
        });
        
        setBoard(newBoard);
        setCompositionName(comp.name || 'Imported Comp');
        
        // Clear the localStorage item to prevent reloading on refresh
        localStorage.removeItem('loadComp');
      }
    } catch (e) {
      console.error('Failed to load compositions', e);
    }
  }, []);
  
  // Save composition
  const saveComposition = () => {
    if (Object.keys(board).length === 0) return;
    
    const name = compositionName.trim() || `Comp #${compositions.length + 1}`;
    const newComp: SavedComposition = { 
      id: Date.now().toString(),
      name, 
      board, 
      date: new Date().toISOString(),
      traits: Object.entries(traitCounts)
        .filter(([_, count]) => (count as number) > 0)
        .map(([id, count]) => ({ id, count: count as number }))
    };
    
    const updatedComps = [...compositions, newComp];
    
    setCompositions(updatedComps);
    localStorage.setItem('tft-compositions', JSON.stringify(updatedComps));
    setCompositionName('');
  };
  
  // Load composition
  const loadComposition = (comp: SavedComposition) => {
    setBoard(comp.board);
  };
  
  // Delete composition
  const deleteComposition = (id: string) => {
    const updatedComps = compositions.filter(comp => comp.id !== id);
    setCompositions(updatedComps);
    localStorage.setItem('tft-compositions', JSON.stringify(updatedComps));
  };
  
  // Clear the board
  const clearBoard = () => {
    setBoard({});
  };

  // Calculate traits for unique units
  useEffect(() => {
    // Create a map of unique units
    const uniqueUnits = new Map<string, { traits: string[] }>();
    
    Object.values(board as Record<string, BoardCell>).forEach(cell => {
      if (!cell?.unit) return;
      
      const unitId = cell.unit.id;
      if (!uniqueUnits.has(unitId)) {
        // Fix: Create a safe reference to traits and handle null/undefined cases
        const traits = cell.unit.traits || {};
        
        // Handle both array and single value cases with proper null checks
        const originTraits = Array.isArray(traits.origin) 
          ? traits.origin 
          : (traits.origin ? [traits.origin] : []);
        
        const classTraits = Array.isArray(traits.class) 
          ? traits.class 
          : (traits.class ? [traits.class] : []);
        
        // Filter out undefined values and ensure TypeScript knows we have strings
        const allTraits = [...originTraits, ...classTraits].filter((trait): trait is string => Boolean(trait));
        
        uniqueUnits.set(unitId, { traits: allTraits });
      }
    });
    
    // Count traits and calculate tiers 
    const counts: Record<string, number> = {};
    const tiers: Record<string, number> = {};
    const allTraits: Record<string, any> = { ...traitsJson.origins, ...traitsJson.classes };
    
    uniqueUnits.forEach(unit => {
      unit.traits.forEach(trait => {
        counts[trait] = (counts[trait] || 0) + 1;
      });
    });
    
    Object.entries(counts).forEach(([traitId, count]) => {
      const traitData = allTraits[traitId];
      if (!traitData || !traitData.tiers) {
        tiers[traitId] = 0;
        return;
      }
      
      let tierLevel = 0;
      for (let i = 0; i < traitData.tiers.length; i++) {
        if (count >= traitData.tiers[i].units) {
          tierLevel = i + 1;
        } else {
          break;
        }
      }
      
      tiers[traitId] = tierLevel;
    });
    
    setTraitCounts(counts);
    setTraitTiers(tiers);
  }, [board]);
  
  return (
    <Layout title="Team Builder">
      {/* Header Banner */}
      <HeaderBanner />
      
      {/* Stats Carousel */}
      <StatsCarousel />
      
      <div className="mt-8">
        <FeatureBanner title="Team Builder - Plan & craft" />
        
        {/* Builder Controls with instructions */}
        <BuilderControls
          board={board}
          saveComposition={saveComposition}
          clearBoard={clearBoard}
          compositionName={compositionName}
          setCompositionName={setCompositionName}
        />
        
        <Card className="mt-2 bg-brown/5 border border-gold/20 p-0 rounded-lg backdrop-blur-md">
          <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col lg:flex-row team-builder-container" ref={boardRef}>
              {/* Left column - Traits */}
              <div className="lg:w-2/12 border-r border-gold/20 team-builder-panel">
                <TraitsPanel 
                  traitCounts={traitCounts} 
                  traitTiers={traitTiers} 
                />
              </div>
              
              {/* Middle column - Board */}
              <div className="lg:w-7/12 p-4 overflow-auto team-builder-content">
                {/* Board section */}
                <div className="mt-2">
                  <Board 
                    board={board} 
                    setBoard={setBoard} 
                  />
                </div>
                
                {/* Saved compositions BELOW the board */}
                <SavedCompositions 
                  compositions={compositions} 
                  onLoad={loadComposition}
                  onDelete={deleteComposition}
                />
                
                {/* Suggested compositions */}
                <SuggestedCompositions
                  onLoad={loadComposition}
                />
              </div>
              
              {/* Right column - Units/Items Selector */}
              <div className="lg:w-3/12 border-l border-gold/20 team-builder-panel">
                <SelectorPanel 
                  filteredUnits={filteredUnits} 
                  filteredItems={filteredItems}
                  search={search}
                  setSearch={setSearch}
                  board={board}
                  setBoard={setBoard}
                />
              </div>
            </div>
          </DndProvider>
        </Card>
      </div>
    </Layout>
  );
}
