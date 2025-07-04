import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getCostColor } from '@/utils/paths';
import { ProcessedUnit, ProcessedItem, BoardCell } from '@/types';
import { Star } from 'lucide-react';

interface DraggableUnitProps {
  unit: ProcessedUnit;
}

export function DraggableUnit({ unit }: DraggableUnitProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, dragRef] = useDrag({
    type: 'UNIT',
    item: { type: 'UNIT', unit, id: unit.id },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  });
  
  // Connect the drag ref to our div element
  useEffect(() => {
    if (ref.current) {
      dragRef(ref);
    }
  }, [dragRef]);
  
  return (
    <div ref={ref} className="selector-unit-wrapper" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="w-12 h-12 rounded overflow-hidden border-2" 
           style={{ borderColor: getCostColor(unit.cost) }}>
        <img src={`/assets/units/${unit.icon}`} alt={unit.name} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

interface DraggableItemProps {
  item: ProcessedItem;
}

export function DraggableItem({ item }: DraggableItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, dragRef] = useDrag({
    type: 'ITEM',
    item: { type: 'ITEM', item, id: item.id },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  });
  
  // Connect the drag ref to our div element
  useEffect(() => {
    if (ref.current) {
      dragRef(ref);
    }
  }, [dragRef]);
  
  return (
    <div 
      ref={ref} 
      className={`relative cursor-grab ${isDragging ? 'opacity-50' : 'hover:z-20'}`}
      title={item.name}
    >
      <img 
        src={`/assets/items/${item.icon}`} 
        alt={item.name}
        className={`w-10 h-10 object-contain transition-transform ${isDragging ? '' : 'hover:scale-110'}`}
      />
    </div>
  );
}

interface UnitInHexProps {
  hexId: string;
  cell: BoardCell;
  setBoard: React.Dispatch<React.SetStateAction<Record<string, BoardCell>>>;
  starLevel?: number;
}

export function UnitInHex({ hexId, cell, setBoard, starLevel = 1 }: UnitInHexProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, dragRef] = useDrag({
    type: 'UNIT_ON_BOARD',
    item: { 
      type: 'UNIT_ON_BOARD',
      unit: cell.unit,
      items: cell.items || [],
      sourceHexId: hexId,
      id: cell.unit?.id || 'unknown'
    },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  });
  
  // Connect the drag ref to our div element
  useEffect(() => {
    if (ref.current) {
      dragRef(ref);
    }
  }, [dragRef]);
  
  // Star color based on level
  const getStarColor = (level: number) => {
    switch(level) {
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#FFD700'; // Gold
      case 4: return '#B9F2FF'; // Diamond
      default: return '#FFFFFF'; // Default
    }
  };
  
  return (
    <div className="unit-wrapper">
      <div ref={ref} className="board-unit" style={{ opacity: isDragging ? 0.5 : 1 }}>
        <div className="board-unit-border" style={{ backgroundColor: getCostColor(cell.unit?.cost || 1) }}>
          <div className="board-unit-content">
            <img 
              src={`/assets/units/${cell.unit?.icon || 'default'}`} 
              alt={cell.unit?.name || 'Unit'} 
              className="board-unit-img" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
