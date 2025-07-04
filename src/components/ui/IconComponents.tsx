import React from 'react';
import { useTooltip, renderUnitTooltip, renderItemTooltip, renderTraitTooltip, renderCompTooltip } from './Tooltip';
import { getEntityIcon, getCostColor, DEFAULT_ICONS } from '@/utils/paths';

interface TraitIconProps {
  trait: any;
  [key: string]: any;
}

interface UnitIconProps {
  unit: any;
  [key: string]: any;
}

interface ItemIconProps {
  item: any;
  [key: string]: any;
}

interface CompIconProps {
  comp: any;
  [key: string]: any;
}

const sizes = {
  xs: 'w-4 h-4', 
  sm: 'w-6 h-6', 
  md: 'w-10 h-10', 
  lg: 'w-16 h-16'
};

type IconSize = 'xs' | 'sm' | 'md' | 'lg';

interface EntityIconProps {
  entity: any;
  type: string;
  size?: IconSize;
  onClick?: (e: React.MouseEvent) => void;
  showDetailedTooltip?: boolean;
  className?: string;
}

export function EntityIcon({ 
  entity, 
  type, 
  size = 'md', 
  onClick, 
  showDetailedTooltip = true,
  className = ''
}: EntityIconProps) {
  const { show, hide } = useTooltip();
  if (!entity) return null;
  
  // Use the unified path resolver
  const iconPath = getEntityIcon(entity, type);
  const sizeClass = sizes[size];
  
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (showDetailedTooltip) {
      if (type === 'unit') {
        show(renderUnitTooltip(entity), e);
      } else if (type === 'item') {
        show(renderItemTooltip(entity), e);
      } else if (type === 'trait') {
        show(renderTraitTooltip(entity), e);
      } else if (type === 'comp') {
        show(renderCompTooltip(entity), e);
      } else {
        show(entity.name, e);
      }
    } else {
      show(entity.name, e);
    }
  };
  
  if (type === 'trait') {
    return (
      <div 
        className={`bg-brown-light/30 rounded hover:bg-brown-light/50 flex items-center justify-center ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={hide}
        onClick={onClick}
      >
        <img 
          src={iconPath} 
          alt={entity.name}
          className="w-12 h-12 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_ICONS.trait;
          }}
        />
      </div>
    );
  }
  
  if (type === 'unit') {
    const borderColor = getCostColor(entity.cost);
    
    return (
      <div 
        className={`relative ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={hide}
        onClick={onClick}
      >
        <img 
          src={iconPath} 
          alt={entity.name}
          className={`${sizeClass} rounded-full border-2 object-cover hover:shadow-md transition-shadow ${className}`}
          style={{ borderColor }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_ICONS.unit;
          }}
        />
      </div>
    );
  }
  
  if (type === 'item') {
    return (
      <div 
        className={`${sizeClass} overflow-hidden ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={hide}
        onClick={onClick}
      >
        <img 
          src={iconPath} 
          alt={entity.name}
          className="w-full h-full object-contain hover:shadow-md transition-shadow"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_ICONS.item;
          }}
        />
      </div>
    );
  }
  
  if (type === 'comp') {
    const mainTrait = entity.traits && entity.traits.length > 0 
      ? entity.traits.sort((a: any, b: any) => (b.tier || 0) - (a.tier || 0))[0]
      : null;
      
    const compIconSrc = mainTrait ? getEntityIcon(mainTrait, 'trait') : DEFAULT_ICONS.trait;
    
    return (
      <div 
        className={`${sizeClass} overflow-hidden ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={hide}
        onClick={onClick}
      >
        <img 
          src={compIconSrc} 
          alt={entity.name || 'Composition'}
          className="w-full h-full object-contain hover:shadow-md transition-shadow"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_ICONS.trait;
          }}
        />
      </div>
    );
  }
  
  return null;
}

export function TraitIcon({ trait, ...rest }: TraitIconProps) {
  return <EntityIcon type="trait" entity={trait} {...rest} />;
}

export function UnitIcon({ unit, ...rest }: UnitIconProps) {
  return <EntityIcon type="unit" entity={unit} {...rest} />;
}

export function ItemIcon({ item, ...rest }: ItemIconProps) {
  return <EntityIcon type="item" entity={item} {...rest} />;
}

export function CompIcon({ comp, ...rest }: CompIconProps) {
  return <EntityIcon type="comp" entity={comp} {...rest} />;
}
