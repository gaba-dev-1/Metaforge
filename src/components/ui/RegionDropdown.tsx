import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { REGIONS, isRegionGroup, getSubRegions } from '@/utils/useTftData';

export function RegionDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRegion, setCurrentRegion] = useState('all');
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    setIsMounted(true);
    const savedRegion = localStorage.getItem('tft-region');
    if (savedRegion) setCurrentRegion(savedRegion);
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const changeRegion = (regionId: string) => {
    localStorage.setItem('tft-region', regionId);
    window.location.reload();
  };
  
  // Get the regions organized in a hierarchical structure
  const getHierarchicalRegions = () => {
    const parentRegions = REGIONS.filter(r => r.isGroup || r.id === 'all');
    return parentRegions.map(parent => {
      if (parent.isGroup && parent.subRegions) {
        const children = REGIONS.filter(r => parent.subRegions?.includes(r.id));
        return { parent, children };
      }
      return { parent, children: [] };
    });
  };
  
  // Get details for current region
  const getCurrentRegionDetails = () => {
    const region = REGIONS.find(r => r.id === currentRegion);
    if (!region) return REGIONS[0]; // Default to All Regions
    return region;
  };
  
  if (!isMounted) return <div className="h-9 w-9 sm:w-16" />;
  
  const currentRegionDetails = getCurrentRegionDetails();
  const hierarchicalRegions = getHierarchicalRegions();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
  className="flex items-center ml-1 gap-1 px-2 sm:px-3 py-2 rounded-md bg-void-core/30 border border-solar-flare/30 backdrop-blur-sm text-cream hover:bg-gold/10"
  onClick={() => setIsOpen(!isOpen)}
  aria-expanded={isOpen}
  aria-haspopup="true"
>
  <Globe className="h-4 w-4 text-gold" />
  <span className="hidden sm:block text-sm">{currentRegionDetails.name}</span>
  <ChevronDown className="h-3 w-3" />
</button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 right-0 w-56 rounded-md shadow-lg bg-void-core/50 backdrop-blur-lg border border-solar-flare/30">
          {hierarchicalRegions.map(({ parent, children }) => (
            <div key={parent.id}>
              {/* Parent region */}
              <button
                className={`block w-full text-left px-3 py-1.5 ${
                  parent.id === currentRegion 
                    ? "bg-gold/10 text-gold" 
                    : parent.isGroup 
                      ? "text-gold font-medium"
                      : "hover:bg-gold/5 text-cream"
                }`}
                onClick={() => {
                  setIsOpen(false);
                  changeRegion(parent.id);
                }}
              >
                {parent.name}
              </button>

              {/* Children */}
              {children.length > 0 && (
                <div>
                  {children.map(child => (
                    <button
                      key={child.id}
                      className={`block w-full text-left pl-5 pr-3 py-1 text-sm ${
                        child.id === currentRegion 
                          ? "bg-gold/10 text-gold" 
                          : "hover:bg-gold/5 text-cream/90"
                      }`}
                      onClick={() => {
                        setIsOpen(false);
                        changeRegion(child.id);
                      }}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
