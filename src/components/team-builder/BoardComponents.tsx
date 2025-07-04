import React, { useRef, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { UnitInHex } from './DraggableComponents';
import { BoardCell, ProcessedUnit } from '@/types';
import { Star } from 'lucide-react';

// Define item types for drag and drop
interface DragItem {
  type: string;
  id: string;
}

interface UnitDragItem extends DragItem {
  type: 'UNIT';
  unit: any;
}

interface BoardUnitDragItem extends DragItem {
  type: 'UNIT_ON_BOARD';
  unit: any;
  items: any[];
  sourceHexId: string;
}

interface ItemDragItem extends DragItem {
  type: 'ITEM';
  item: any;
}

type TFTDragItem = UnitDragItem | BoardUnitDragItem | ItemDragItem;

// Star Menu Component with enhanced positioning
function StarMenu({ 
  starLevel, 
  handleStarSelection,
  position
}: { 
  starLevel: number, 
  handleStarSelection: (level: number) => void,
  position: { top: boolean, left: boolean }
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Get star color based on level
  const getStarColor = (level: number) => {
    switch(level) {
      case 1: return '#CD7F32'; // Bronze
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#FFD700'; // Gold
      case 4: return '#4CAF50'; // Green
      default: return '#FFFFFF'; // Default white
    }
  };
  
  return (
    <div 
      ref={menuRef} 
      className={`absolute ${position.top ? 'bottom-full mb-1' : 'top-1'} 
                 ${position.left ? 'left-1' : 'right-1'} 
                 z-50 bg-brown-light/95 border border-gold/40 rounded-md shadow-lg p-1 min-w-[120px]`}
      style={{maxHeight: '160px'}}
    >
      <div className="text-xs text-cream/80 text-center mb-1">Star Level</div>
      <div className="flex flex-col gap-1">
        <button 
          onClick={() => handleStarSelection(0)}
          className="flex items-center justify-between hover:bg-brown-light/60 px-2 py-1 rounded"
        >
          <span className="text-xs text-cream">None</span>
        </button>
        {[1, 2, 3, 4].map(level => (
          <button 
            key={level}
            onClick={() => handleStarSelection(level)}
            className={`flex items-center justify-between hover:bg-brown-light/60 px-2 py-1 rounded ${
              starLevel === level ? 'bg-brown-light/40' : ''
            }`}
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: level }, (_, i) => (
                <Star 
                  key={i}
                  size={10} 
                  fill={getStarColor(level)}
                  color={getStarColor(level)}
                />
              ))}
            </div>
            <span 
              className="text-xs" 
              style={{ color: getStarColor(level) }}
            >
              {level}★
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper function to ensure a unit meets ProcessedUnit requirements
const ensureValidUnit = (unit: any): ProcessedUnit => {
  return {
    ...unit,
    // Ensure required properties have valid values
    id: unit.id || `unit-${Date.now()}`, // Provide a fallback ID if missing
    cost: typeof unit.cost === 'number' ? unit.cost : 1, // Ensure cost is a number
    starLevel: typeof unit.starLevel === 'number' ? unit.starLevel : 0, // Ensure starLevel is a number
    // Add any other required properties with defaults here
  } as ProcessedUnit;
};

export function BoardHex({ 
  hexId, 
  cell, 
  board, 
  setBoard, 
  onRemove 
}: { 
  hexId: string, 
  cell: BoardCell, 
  board: Record<string, BoardCell>, 
  setBoard: React.Dispatch<React.SetStateAction<Record<string, BoardCell>>>, 
  onRemove: (hexId: string) => void 
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [starLevel, setStarLevel] = useState<number>(0); // Default to 0 stars (no stars)
  const [showStarMenu, setShowStarMenu] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<{ top: boolean, left: boolean }>({ top: false, left: false });
  
  const [{ isOver, canDrop }, dropRef] = useDrop<TFTDragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: ['UNIT', 'UNIT_ON_BOARD', 'ITEM'],
    canDrop: (item: TFTDragItem) => {
      if (item.type === 'ITEM') {
        return !!cell.unit;  // Convert to explicit boolean
      }
      return true;
    },
    drop: (item) => {
      if (item.type === 'UNIT' || item.type === 'UNIT_ON_BOARD') {
        setBoard(prev => {
          const newBoard = {...prev};
          
          // Check if this hex already has a unit
          if (prev[hexId]?.unit && item.type === 'UNIT') {
            // If unit being dragged from selector to an occupied hex, swap is not needed
            newBoard[hexId] = { 
              unit: ensureValidUnit({
                ...item.unit,
                starLevel: 0  // Initialize star level for new unit
              }),
              items: prev[hexId].items || [] // Preserve existing items
            };
          } 
          else if (item.type === 'UNIT_ON_BOARD' && item.sourceHexId) {
            if (item.sourceHexId === hexId) return prev;
            
            // Handle unit swapping when dragging from board to occupied hex
            if (prev[hexId]?.unit) {
              // Swap units between source and target
              newBoard[item.sourceHexId] = { 
                unit: prev[hexId].unit,
                items: prev[hexId].items || []
              };
            } else {
              // Delete the source hex if target is empty
              delete newBoard[item.sourceHexId];
            }
            
            // Place dragged unit on target hex
            newBoard[hexId] = { 
              unit: ensureValidUnit(item.unit),
              items: item.items || []
            };
          } else {
            // Simple placement of new unit
            newBoard[hexId] = { 
              unit: ensureValidUnit({
                ...item.unit,
                starLevel: 0  // Initialize star level for new unit
              })
            };
          }
          return newBoard;
        });
      } else if (item.type === 'ITEM') {
        setBoard(prev => {
          if (!prev[hexId]?.unit) return prev;
          const newBoard = {...prev};
          
          // Create a clean reference to the current cell and ensure items exist
          const currentCell = newBoard[hexId];
          const currentItems = currentCell.items || [];
          
          // Only add item if less than 3 items already
          if (currentItems.length < 3) {
            newBoard[hexId] = {
              ...currentCell,
              items: [...currentItems, item.item]
            };
          }
          
          return newBoard;
        });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  
  // Connect the drop ref to our div element
  useEffect(() => {
    if (ref.current) {
      dropRef(ref);
    }
  }, [dropRef]);
  
  const handleItemDoubleClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setBoard(prev => {
      const newBoard = {...prev};
      newBoard[hexId] = {
        ...newBoard[hexId],
        items: (newBoard[hexId].items || []).filter((_, i) => i !== index)
      };
      return newBoard;
    });
  };
  
  // Handle right click for star menu with position detection
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!cell.unit) return;
    
    // Get the position from hexId (format is "col-row")
    const [colStr, rowStr] = hexId.split('-');
    const col = parseInt(colStr);
    const row = parseInt(rowStr);
    
    // For bottom rows (2-3), position menu above
    // For empty/invalid rows, default to bottom row
    const isBottomRow = row >= 2 || isNaN(row);
    
    // For left columns (0-1), position menu to the right
    // For empty/invalid columns, default to right side
    const isLeftColumn = col <= 1 || isNaN(col);
    
    setMenuPosition({ top: isBottomRow, left: isLeftColumn });
    setShowStarMenu(!showStarMenu);
  };
  
  // Handle star selection
  const handleStarSelection = (level: number) => {
    if (!cell.unit) return;
    
    setStarLevel(level);
    
    // Update the board to include star level in unit data
    setBoard(prevBoard => {
      const newBoard = {...prevBoard};
      if (newBoard[hexId]?.unit) {
        newBoard[hexId] = {
          ...newBoard[hexId],
          unit: ensureValidUnit({
            ...newBoard[hexId].unit,
            starLevel: level
          })
        };
      }
      return newBoard;
    });
    
    setShowStarMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showStarMenu && ref.current && !ref.current.contains(e.target as Node)) {
        setShowStarMenu(false);
      }
    };
    
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showStarMenu]);
  
  // Set initial star level from board data
  useEffect(() => {
    if (cell.unit?.starLevel !== undefined) {
      setStarLevel(cell.unit.starLevel);
    } else {
      setStarLevel(0);
    }
  }, [cell.unit?.starLevel]);
  
  // Get star color based on level
  const getStarColor = (level: number) => {
    switch(level) {
      case 1: return '#CD7F32'; // Bronze
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#FFD700'; // Gold
      case 4: return '#4CAF50'; // Green
      default: return '#FFFFFF'; // Default white
    }
  };
  
  // Render stars based on level
  const renderStars = () => {
    if (starLevel === 0) return null;
    
    return (
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 star-container">
        <div className="flex gap-1">
          {Array.from({ length: starLevel }, (_, i) => (
            <Star 
              key={i}
              size={13} 
              fill={getStarColor(starLevel)}
              color={getStarColor(starLevel)}
              className="drop-shadow-md"
            />
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="hex-cell" ref={ref}>
      <div 
        className={`hex-container ${isOver ? (canDrop ? 'hex-drop-active' : 'hex-drop-invalid') : ''}`}
        onDoubleClick={() => onRemove(hexId)}
        onContextMenu={handleRightClick}
      >
        {cell.unit && <UnitInHex hexId={hexId} cell={cell} setBoard={setBoard} starLevel={starLevel} />}
      </div>
      
      {/* Star indicator - rendered outside of hex to allow overflow */}
      {cell.unit && renderStars()}
      
      {/* Star selection dropdown with improved positioning */}
      {showStarMenu && cell.unit && (
        <StarMenu 
          starLevel={starLevel}
          handleStarSelection={handleStarSelection}
          position={menuPosition}
        />
      )}
      
      {cell.unit && cell.items && cell.items.length > 0 && (
        <div className="item-container-absolute">
          {cell.items.map((item, idx) => (
            <div key={idx} className="item-wrapper" onDoubleClick={(e) => handleItemDoubleClick(e, idx)}>
              <img src={`/assets/items/${item.icon}`} alt={item.name} className="item-img" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Board({ 
  board, 
  setBoard 
}: { 
  board: Record<string, BoardCell>, 
  setBoard: React.Dispatch<React.SetStateAction<Record<string, BoardCell>>> 
}) {
  const rows = 4;
  const cols = 7;
  
  // Double-click to remove unit
  const handleDoubleClick = (hexId: string) => {
    setBoard(prev => {
      const newBoard = {...prev};
      delete newBoard[hexId];
      return newBoard;
    });
  };
  
  return (
    <div className="p-4 honeycomb-container overflow-x-auto">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="hex-row">
          {Array.from({ length: cols }, (_, col) => {
            const hexId = `${col}-${row}`;
            const cell = board[hexId] || {};
            
            return (
              <BoardHex 
                key={hexId} 
                hexId={hexId} 
                cell={cell} 
                board={board} 
                setBoard={setBoard}
                onRemove={handleDoubleClick}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
