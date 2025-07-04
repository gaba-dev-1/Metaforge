import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Loader2 } from 'lucide-react';

interface Region {
  id: string;
  name: string;
}

interface RegionFilterProps {
  regions: Region[];
  activeRegion: string;
  onChange: (region: string) => void;
  isLoading?: boolean;
}

export default function RegionFilter({ regions, activeRegion, onChange, isLoading = false }: RegionFilterProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Globe className="h-5 w-5 text-solar-flare" />
        <h3 className="text-lg font-display text-stellar-white">Navigate Regions</h3>
        {isLoading && (
          <Loader2 className="h-4 w-4 text-solar-flare animate-spin" />
        )}
      </div>
      
      <div className="flex flex-wrap gap-3 max-w-full">
        {regions.map(region => (
          <motion.button
            key={region.id}
            className={`px-5 py-3 rounded-lg backdrop-filter backdrop-blur-sm border transition-all text-sm font-medium ${
              activeRegion === region.id 
                ? 'bg-solar-flare text-void-core border-solar-flare shadow-solar' 
                : 'bg-void-core/60 text-corona-light hover:bg-void-core/80 border-solar-flare/30 hover:border-solar-flare/50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !isLoading && onChange(region.id)}
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.05 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {region.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
