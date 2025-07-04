import React from 'react';
import CompList from './CompList';
import unitsJson from 'public/mapping/units.json';
import { SavedComposition, BoardCell } from '@/types';

interface SuggestedCompositionsProps {
  onLoad: (comp: SavedComposition) => void;
}

export default function SuggestedCompositions({ onLoad }: SuggestedCompositionsProps) {
  // Create basic placeholder compositions without mock data
  const processedComps: SavedComposition[] = React.useMemo(() => {
    const units = unitsJson.units as Record<string, any>;
    
    // Generate an empty composition with placeholder name
    const createEmptyComposition = (id: string, name: string): SavedComposition => {
      return {
        id,
        name,
        board: {},
        date: new Date().toISOString(),
        traits: []
      };
    };
    
    return [
      createEmptyComposition('suggested-1', 'Challenger Composition'),
      createEmptyComposition('suggested-2', 'Invoker Composition'),
      createEmptyComposition('suggested-3', 'Redeemed Composition')
    ];
  }, []);
  
  return (
    <CompList
      compositions={processedComps}
      title="Suggested Compositions"
      onLoad={onLoad}
      maxHeight="max-h-96"
    />
  );
}
