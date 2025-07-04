import React from 'react';
import { Save, Trash2, MousePointer, Mouse, MousePointerClick } from 'lucide-react';
import { BoardCell } from '@/types';

export default function BuilderControls({ 
  board, 
  saveComposition, 
  clearBoard, 
  compositionName, 
  setCompositionName 
}: { 
  board: Record<string, BoardCell>, 
  saveComposition: () => void, 
  clearBoard: () => void, 
  compositionName: string, 
  setCompositionName: (name: string) => void 
}) {
  return (
    <div className="mt-1 mb-4 bg-brown/5 border border-gold/20 p-3 rounded-lg backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:justify-between gap-2">
        {/* Instructions section - first column */}
        <div className="flex-1 bg-brown-light/10 p-2 rounded border border-gold/10">
          <div className="flex flex-col gap-1 text-center">
            <div className="text-sm font-medium text-gold-light mb-1">Builder Instructions:</div>
            <div className="flex items-center text-xs text-cream/80 gap-1">
              <Mouse size={14} className="text-gold" /> 
              <span>Drag and drop units and items</span>
            </div>
            <div className="flex items-center text-xs text-cream/80 gap-1">
              <MousePointerClick size={14} className="text-gold" /> 
              <span>Double click units on and off the board</span>
            </div>
            <div className="flex items-center text-xs text-cream/80 gap-1">
              <MousePointer size={14} className="text-gold" /> 
              <span>Right click units to change star level (2★, 3★, 4★)</span>
            </div>
          </div>
        </div>
        
        {/* Team Building - second column */}
        <div className="flex-1 bg-brown-light/10 p-2 rounded border border-gold/10">
          <div className="flex flex-col gap-1 text-center">
            <div className="text-sm font-medium text-gold-light mb-1">Team Building:</div>
            <div className="text-xs text-cream/80">Create and save your comps</div>
            <div className="text-xs text-cream/80">Explore and load the suggestions</div>
          </div>
        </div>
        
        {/* Controls - third column */}
        <div className="flex-1 bg-brown-light/10 p-2 rounded border border-gold/10">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Comp name"
              value={compositionName}
              onChange={(e) => setCompositionName(e.target.value)}
              className="w-full py-1.5 px-3 bg-brown-light/40 border border-gold/30 rounded-md text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
            />
            
            <div className="flex gap-2 w-full justify-between">
              <button 
                className="flex-1 bg-gold hover:bg-gold-light text-brown px-3 py-1.5 rounded-md flex items-center justify-center gap-2 text-sm"
                onClick={saveComposition}
                disabled={Object.keys(board).length === 0}
              >
                <Save size={16} />
                <span>Save</span>
              </button>
              
              <button 
                className="flex-1 bg-brown-light/40 hover:bg-brown-light/60 text-cream px-3 py-1.5 rounded-md flex items-center justify-center gap-2 text-sm border border-gold/30"
                onClick={clearBoard}
              >
                <Trash2 size={16} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
