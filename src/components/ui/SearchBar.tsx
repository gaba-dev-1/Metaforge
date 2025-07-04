import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useTftData } from '@/utils/useTftData';
import unitsJson from 'public/mapping/units.json';
import traitsJson from 'public/mapping/traits.json';
import itemsJson from 'public/mapping/items.json';
import debounce from 'lodash/debounce';

// Define search result interface
interface SearchResult {
  type: 'units' | 'traits' | 'items' | 'comps';
  id: string;
  name: string;
  icon?: string;
  cost?: number;
  traits?: any[];
}

export default function SearchBar({ className = '' }) {
  // Fix TypeScript error by using type assertion and safe property access
  const tftData = useTftData() as any;
  const data = tftData?.data || null;
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearch = useMemo(() => debounce((q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    q = q.toLowerCase();
    const foundResults: SearchResult[] = [];
    
    // Search units
    Object.entries(unitsJson.units)
      .filter(([_, unit]) => unit.name.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(([id, unit]) => foundResults.push({
        type: 'units', id, name: unit.name, 
        icon: `/assets/units/${unit.icon}`, cost: unit.cost
      }));
      
    // Search traits
    Object.entries({...traitsJson.origins, ...traitsJson.classes})
      .filter(([_, trait]) => trait.name.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(([id, trait]) => foundResults.push({
        type: 'traits', id, name: trait.name, icon: `/assets/traits/${trait.icon}`
      }));
      
    // Search items
    Object.entries(itemsJson.items)
      .filter(([_, item]) => item.name.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(([id, item]) => foundResults.push({
        type: 'items', id, name: item.name, icon: `/assets/items/${item.icon}`
      }));
      
    // Search compositions from data if available
    if (data?.compositions) {
      data.compositions
        .filter((comp: {name: string; id: string; traits?: any[]}) => comp.name.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach((comp: {name: string; id: string; traits?: any[]}) => foundResults.push({
          type: 'comps', id: comp.id, name: comp.name, traits: comp.traits?.slice(0, 2)
        }));
    }
    
    setResults(foundResults);
    setShowResults(foundResults.length > 0);
    setIsLoading(false);
  }, 200), [data]);
  
  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !(searchRef.current as HTMLElement).contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
    }
  };
  
  return (
    <div className={`relative w-full ${className}`} ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          aria-label="Search TFT entities"
          className="w-full px-9 py-1.5 bg-brown-light/40 border border-gold/30 rounded-lg focus:outline-none focus:border-gold text-sm"
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gold h-4 w-4" />
        {query && (
          <button 
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cream/60 hover:text-cream"
            onClick={() => { setQuery(''); setShowResults(false); }}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && query.length >= 2 && (
        <div className="absolute z-40 w-full mt-1 bg-brown/95 border border-gold/40 rounded-md shadow-lg">
          {isLoading ? (
            <div className="p-3 text-center text-cream/70 text-sm">Searching...</div>
          ) : results.length > 0 ? (
            <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-gold/20">
              {results.map((result, i) => (
                <Link 
                  href={`/entity/${result.type}/${result.id}`} 
                  key={i}
                  onClick={() => { setShowResults(false); setQuery(''); }}
                >
                  <div className="flex items-center gap-2.5 p-2 hover:bg-gold/10 rounded">
                    {result.type === 'units' && (
                      <div className="w-8 h-8 rounded-full border-2 overflow-hidden flex-shrink-0" 
                           style={{ borderColor: ['#9aa4af', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f'][result.cost as number - 1] || '#9aa4af' }}>
                        <img src={result.icon} alt={result.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    {result.type === 'traits' && <img src={result.icon} alt={result.name} className="w-7 h-7" />}
                    {result.type === 'items' && <img src={result.icon} alt={result.name} className="w-7 h-7" />}
                    {result.type === 'comps' && (
                      <div className="flex">
                        {result.traits?.map((trait, j) => (
                          <img key={j} src={trait.tierIcon || trait.icon} alt={trait.name} className="w-6 h-6 -ml-1 first:ml-0" />
                        ))}
                      </div>
                    )}
                    <div className="min-w-0 flex-grow">
                      <div className="font-medium text-sm truncate">{result.name}</div>
                      <div className="text-xs text-cream/70 capitalize">{result.type.replace(/s$/, '')}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-cream/70 text-sm">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
