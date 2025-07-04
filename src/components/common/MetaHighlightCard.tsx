import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getEntityIcon, DEFAULT_ICONS } from '@/utils/paths';
import { HighlightEntity, EntityType } from '@/utils/useTftData';
import { parseCompTraits } from '@/utils/dataProcessing';

interface MetaHighlightCardProps {
  highlight: HighlightEntity | null;
  title: string;
  icon: React.ReactNode;
}

export function MetaHighlightCard({
  highlight,
  title,
  icon
}: MetaHighlightCardProps) {
  if (!highlight) {
    return (
      <motion.div 
        className="h-full border border-solar-flare/30 rounded-xl bg-eclipse-shadow/5 backdrop-filter backdrop-blur-md transition-all min-h-[120px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="flex items-center justify-center py-2 px-3 bg-eclipse-shadow/60 border-b border-solar-flare/30 rounded-t-xl">
          <div className="flex items-center justify-center gap-2">
            {icon}
            <h3 className="text-solar-flare text-base font-display tracking-tight">{title}</h3>
          </div>
        </div>
        <div className="relative h-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <p className="text-sm text-corona-light/70">No data available</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const displayTitle = highlight.variant && highlight.variant !== 'Overall' ? 
    `${title}: ${highlight.variant}` : 
    title;

  const renderEntityImage = () => {
    if (highlight.entityType === EntityType.Unit) {
      return (
        <motion.div 
          className="w-12 h-12 rounded-full border-2 border-solar-flare/30 overflow-hidden flex-shrink-0"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <img 
            src={getEntityIcon(highlight.entity, 'unit')} 
            alt={highlight.value} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_ICONS.unit;
            }}
          />
        </motion.div>
      );
    }
    
    if (highlight.entityType === EntityType.Item) {
      return (
        <motion.img 
          src={getEntityIcon(highlight.entity, 'item')} 
          alt={highlight.value} 
          className="w-12 h-12 object-contain" 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_ICONS.item;
          }}
        />
      );
    }
    
    if (highlight.entityType === EntityType.Trait) {
      return (
        <motion.img 
          src={getEntityIcon(highlight.entity, 'trait')} 
          alt={highlight.value} 
          className="w-12 h-12 object-contain" 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_ICONS.trait;
          }}
        />
      );
    }
    
    if (highlight.entityType === EntityType.Comp) {
      return (
        <div className="flex gap-1 flex-wrap justify-center ml-2">
          {parseCompTraits(highlight.entity.name, highlight.entity.traits || []).map((trait: any, i: number) => (
            <motion.img 
              key={i} 
              src={getEntityIcon(trait, 'trait')} 
              alt={trait.name} 
              className="w-8 h-8" 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_ICONS.trait;
              }}
            />
          ))}
        </div>
      );
    }
    
    return (
      <div className="w-12 h-12 bg-eclipse-shadow/50 rounded-full flex items-center justify-center">
        {icon}
      </div>
    );
  };

  return (
    <motion.div 
      className="h-full flex flex-col border border-solar-flare/30 rounded-xl bg-eclipse-shadow/5 backdrop-filter backdrop-blur-md transition-all min-h-[120px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ 
        boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.2)",
        borderColor: "rgba(245, 158, 11, 0.5)"
      }}
    >
      <div className="flex items-center justify-center py-2 px-3 rounded-t-xl bg-eclipse-shadow/60 border-b border-solar-flare/30">
        <div className="flex items-center justify-center gap-2">
          {icon}
          <h3 className="text-solar-flare text-base text-xl font-display tracking-tight">{displayTitle}</h3>
        </div>
      </div>
      <Link href={highlight.link} className="flex-1 relative">
        <motion.div 
          className="absolute inset-0 hover:bg-eclipse-shadow/50 hover:border-solar-flare/50 transition-all ease-in-out rounded-b-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
            <div className="flex-shrink-0">
              {renderEntityImage()}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate text-corona-light">{highlight.value}</div>
              <div className="text-xs text-corona-light/70 truncate">{highlight.detail}</div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
