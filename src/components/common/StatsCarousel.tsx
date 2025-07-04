import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTftData, HighlightType, EntityType, HighlightEntity, HighlightGroup } from '@/utils/useTftData';
import { parseCompTraits } from '@/utils/dataProcessing';
import { getEntityIcon, ensureIconPath, DEFAULT_ICONS } from '@/utils/paths';

// Define a type for the variant keys
type VariantKeys = 'unitVariants' | 'itemVariants' | 'traitVariants' | 'compVariants';

// Extend HighlightEntity to include displayTitle for carousel items
interface CarouselHighlightEntity extends HighlightEntity {
  displayTitle: string;
}

export function StatsCarousel() {
  // Fixed TypeScript error by using type assertion and providing a default value
  const tftData = useTftData() as any;
  const highlights = tftData?.highlights || [];
  
  const [displayItems, setDisplayItems] = useState<CarouselHighlightEntity[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const scrollXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  
  // Process highlights to get diverse display items
  useEffect(() => {
    if (!highlights?.length) return;
    
    // Function to select diverse variants from each highlight type
    const getRandomHighlights = () => {
      const items: CarouselHighlightEntity[] = [];
      
      // Process each highlight type
      highlights.forEach((highlightGroup: HighlightGroup) => {
        // For each entity type, get a random variant that's not "Overall"
        const variantTypes: VariantKeys[] = ['unitVariants', 'itemVariants', 'traitVariants', 'compVariants'];
        
        variantTypes.forEach(variantType => {
          // Use type assertion to ensure TypeScript knows this is an array of HighlightEntity
          const variants = (highlightGroup[variantType] as HighlightEntity[]) || [];
          
          // Prefer variant items over overall items when available
          const specialVariants = variants.filter(v => v.variant && v.variant !== 'Overall');
          
          if (specialVariants.length > 0) {
            // Get a random special variant
            const randomVariant = specialVariants[Math.floor(Math.random() * specialVariants.length)];
            items.push({
              ...randomVariant,
              // Add highlight type title with variant
              displayTitle: `${highlightGroup.title}: ${randomVariant.variant}`
            });
          } else if (variants.length > 0) {
            // Fallback to any variant if no special variants exist
            const randomVariant = variants[Math.floor(Math.random() * variants.length)];
            items.push({
              ...randomVariant,
              displayTitle: highlightGroup.title
            });
          }
        });
      });
      
      // Shuffle the items
      return items.sort(() => Math.random() - 0.5);
    };
    
    // Get diverse highlights
    const randomHighlights = getRandomHighlights();
    setDisplayItems(randomHighlights);
  }, [highlights]);

  // Animation logic with improved speed control
  useEffect(() => {
    if (!displayItems.length || !scrollerRef.current) return;
    
    // Function to get current dimensions
    const updateDimensions = () => {
      if (scrollerRef.current) {
        setContainerWidth(scrollerRef.current.parentElement?.clientWidth || 0);
        setContentWidth(scrollerRef.current.scrollWidth / 3); // Divide by 3 because we have 3 copies
      }
    };
    
    // Initial dimensions update
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - lastTimeRef.current;
      
      // SPEED ADJUSTMENTS:
      // Base speed: 0.01
      // Default speed: 3
      // Hover speed: 1.5
      const baseSpeed = 0.01;
      const speed = isHovered ? baseSpeed * 1.5 : baseSpeed * 3;
      
      scrollXRef.current += speed * elapsed;
      
      if (scrollerRef.current) {
        // Reset position for seamless loop when reaching the first duplicate set
        if (scrollXRef.current >= contentWidth) {
          scrollXRef.current = 0;
        }
        
        scrollerRef.current.style.transform = `translateX(-${scrollXRef.current}px)`;
      }
      
      lastTimeRef.current = timestamp;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, [displayItems, isHovered, containerWidth, contentWidth]);
  
  // Helper function to render entity image
  const renderEntityImage = (item: CarouselHighlightEntity) => {
    if (item.entityType === EntityType.Unit) {
      return (
        <div className="min-w-10 h-10 rounded-full border-2 border-solar-flare/30 overflow-hidden flex-shrink-0">
          <img 
            src={getEntityIcon(item.entity, 'unit')} 
            alt={item.value} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_ICONS.unit;
            }}
          />
        </div>
      );
    }
    
    if (item.entityType === EntityType.Item) {
      return (
        <img 
          src={getEntityIcon(item.entity, 'item')} 
          alt={item.value} 
          className="min-w-10 h-10 object-contain"
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_ICONS.item;
          }}
        />
      );
    }
    
    if (item.entityType === EntityType.Trait) {
      return (
        <div className="min-w-10 h-10 flex items-center justify-center flex-shrink-0">
          <img 
          src={getEntityIcon(item.entity, 'trait')} 
          alt={item.value} 
          className="min-w-12 h-12 object-contain"
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_ICONS.trait;
          }}
        />
        </div>
      );
    }
    
    if (item.entityType === EntityType.Comp) {
      // Fix: Use fixed container height and width to match other entity types
      return (
        <div className="min-w-10 h-10 flex items-center justify-center flex-shrink-0">
          {parseCompTraits(item.entity.name, item.entity.traits || []).slice(0, 2).map((trait: any, i: number) => {
            return (
              <img 
                key={i} 
                src={getEntityIcon(trait, 'trait')}
                alt={trait.name} 
                className="h-12 w-12 -ml-1 first:ml-0" 
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_ICONS.trait;
                }}
              />
            );
          })}
        </div>
      );
    }
    
    return null;
  };
  
  if (!displayItems.length) return null;
  
  return (
    <div className="w-full overflow-hidden relative my-1 py-2">
      <div 
        className="flex" 
        ref={scrollerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ height: '75px', width: 'fit-content', willChange: 'transform' }}
      >
        {/* Triple the items for seamless looping */}
        {[...displayItems, ...displayItems, ...displayItems].map((highlight, idx) => (
          <Link href={highlight.link || '#'} key={idx}>
            <motion.div 
              className="flex-shrink-0 w-64 mx-1 relative z-10 border border-solar-flare/30 rounded-lg p-2 shadow-md 
                          transition-all hover:bg-eclipse-shadow/50 hover:border-solar-flare/50 
                          bg-eclipse-shadow/5 backdrop-filter backdrop-blur-md"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.2)"
              }}
            >
              {/* Consistent layout matching feature buttons */}
              <div className="flex flex-col h-full">
                {/* Title in cream */}
                <div className="text-xs font-semibold text-corona-light mb-2 text-center">
                  {highlight.displayTitle}
                </div>
                
                {/* Horizontally centered content with icon on left */}
                <div className="flex items-center justify-center flex-1">
                  <div className="flex-shrink-0 mr-3">
                    {renderEntityImage(highlight)}
                  </div>
                  <div className="min-w-0">
                    {/* Entity name in gold with truncation */}
                    <div className="text-solar-flare font-semibold text-sm truncate max-w-full">
                      {highlight.value}
                    </div>
                    <div className="text-xs text-corona-light/70 truncate max-w-full">
                      {highlight.detail}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
