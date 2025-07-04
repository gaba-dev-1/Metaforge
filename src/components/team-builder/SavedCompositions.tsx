import React from 'react';
import CompList from './CompList';
import { SavedComposition } from '@/types';

interface SavedCompositionsProps {
  compositions: SavedComposition[];
  onLoad: (comp: SavedComposition) => void;
  onDelete: (id: string) => void;
}

export default function SavedCompositions({ 
  compositions, 
  onLoad, 
  onDelete 
}: SavedCompositionsProps) {
  return (
    <CompList
      compositions={compositions}
      title="Saved Compositions"
      onLoad={onLoad}
      onDelete={onDelete}
      maxHeight="max-h-60"
    />
  );
}
