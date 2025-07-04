import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterButtons } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { getEntityIcon, DEFAULT_ICONS, getTierIcon } from '@/utils/paths';
import { createPortal } from 'react-dom';
import traitsJson from 'public/mapping/traits.json';

export type EntityType = 'units' | 'items' | 'traits' | 'comps';

export interface FilterOption {
  id: string;
  name: string;
  icon?: string;
  cost?: number;
  category?: string;
  tierIcon?: string;
}

export interface FilterState {
  all: boolean;
  [key: string]: boolean;
}

interface EntityTabsProps {
  activeTab: EntityType;
  onTabChange: (tab: EntityType) => void;
  filterOptions: FilterOption[];
  filterState: FilterState;
  onFilterChange: (id: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showConditionsButton?: boolean;
  showConditions?: boolean;
  onToggleConditions?: () => void;
  allowSearch?: boolean;
  className?: string;
}

export function EntityTabs({
  activeTab,
  onTabChange,
  filterOptions,
  filterState,
  onFilterChange,
  searchValue = '',
  onSearchChange,
  showConditionsButton = false,
  showConditions = false,
  onToggleConditions,
  allowSearch = true,
  className = ''
}: EntityTabsProps) {
  const entityTypes: { id: EntityType; name: string }[] = [
    { id: 'units', name: 'Units' },
    { id: 'items', name: 'Items' },
    { id: 'traits', name: 'Traits' },
    { id: 'comps', name: 'Comps' }
  ];

  // Clear search when tab changes
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange('');
    }
  }, [activeTab, onSearchChange]);

  return (
    <div className={`bg-brown/10 border border-gold/30 rounded-lg backdrop-blur-md p-0 shadow-inner shadow-gold/5 ${className}`}>
      <div className="flex flex-col gap-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-2 border-b border-gold/20">
          <div className="flex overflow-x-auto custom-scrollbar">
            {entityTypes.map(type => (
              <button 
                key={type.id} 
                onClick={() => onTabChange(type.id)}
                className={`px-4 py-2.5 font-medium transition-all duration-200 ${
                  activeTab === type.id 
                    ? 'text-gold border-b-2 border-gold bg-brown-light/20' 
                    : 'text-cream hover:text-gold hover:bg-brown-light/10 rounded-t-md'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar mt-2 md:mt-0">
            {showConditionsButton && onToggleConditions && (
              <button 
                onClick={onToggleConditions}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${
                  showConditions 
                    ? 'bg-gold text-brown font-medium' 
                    : 'bg-brown-light/30 hover:bg-brown-light/50 text-cream'
                } transition-all duration-200`}
              >
                <Filter size={14} />
                {showConditions ? 'Hide Filters' : 'Advanced Filters'}
              </button>
            )}
            
            <FilterButtons 
              options={filterOptions}
              activeFilter={filterState}
              onChange={onFilterChange}
            />
          </div>
        </div>
        
        {allowSearch && onSearchChange && (
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gold h-5 w-5" />
            <input
              type="text" 
              placeholder={`Search ${activeTab}...`}
              value={searchValue}
              className="w-full pl-10 pr-12 py-2.5 bg-brown/60 focus:outline-none focus:ring-1 focus:ring-gold/50 rounded-lg text-cream transition-all duration-200"
              onChange={e => onSearchChange(e.target.value)}
            />
            {searchValue && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/50 hover:text-cream/80"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface SelectDropdownProps {
  options: FilterOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder: string;
  className?: string;
  multiple?: boolean;
  entityType?: 'unit' | 'item' | 'trait' | string;
  maxHeight?: string;
  showIcons?: boolean;
  limit?: number;
  closeAfterSelect?: boolean;
}

export function SelectDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  className = '',
  multiple = false,
  entityType = '',
  maxHeight = '200px',
  showIcons = true,
  limit = 0,
  closeAfterSelect = true
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    setPortalContainer(document.body);
  }, []);
  
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen) {
      const firstOption = document.querySelector('button[role="option"]') as HTMLElement;
      if (firstOption) firstOption.focus();
      e.preventDefault();
    }
  };
  
  const handleOptionKeyDown = (e: React.KeyboardEvent, optionId: string, index: number) => {
    const options = document.querySelectorAll('button[role="option"]');
    
    if (e.key === 'ArrowDown' && options && index < options.length - 1) {
      (options[index + 1] as HTMLElement).focus();
      e.preventDefault();
    } else if (e.key === 'ArrowUp' && options && index > 0) {
      (options[index - 1] as HTMLElement).focus();
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      handleSelect(optionId);
      e.preventDefault();
    }
  };
  
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        const dropdownContent = document.getElementById('dropdown-content');
        if (!dropdownContent || !dropdownContent.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);
  
  const getSelectedInfo = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return { text: placeholder, icon: null };
      if (value.length === 1) {
        const selected = options.find(opt => opt.id === value[0]);
        return { 
          text: selected ? selected.name : placeholder,
          icon: selected && showIcons ? selected.icon : null,
          cost: selected ? selected.cost : null
        };
      }
      return { text: `${value.length} selected`, icon: null };
    } else {
      const selected = options.find(opt => opt.id === value);
      return { 
        text: selected ? selected.name : placeholder,
        icon: selected && showIcons ? selected.icon : null,
        cost: selected ? selected.cost : null
      };
    }
  };
  
  const filteredOptions = searchQuery 
    ? options.filter(option => option.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;
  
  interface GroupedOptions {
    label: string;
    items: FilterOption[];
    color?: string;
  }
  
  const groupedOptions = useMemo(() => {
    if (entityType === 'unit' && options.some(opt => opt.cost !== undefined)) {
      const groups: Record<string, FilterOption[]> = {};
      
      filteredOptions.forEach(option => {
        const cost = option.cost?.toString() || 'Other';
        if (!groups[cost]) groups[cost] = [];
        groups[cost].push(option);
      });
      
      return Object.entries(groups)
        .sort(([costA], [costB]) => {
          if (costA === 'Other') return 1;
          if (costB === 'Other') return -1;
          return parseInt(costA) - parseInt(costB);
        })
        .map(([cost, items]) => ({
          label: `${cost} Cost`,
          color: ['#9aa4af', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f'][parseInt(cost) - 1] || '#9aa4af',
          items: items.sort((a, b) => a.name.localeCompare(b.name))
        })) as GroupedOptions[];
    }
    
    if (entityType === 'item' && options.some(opt => opt.category !== undefined)) {
      const groups: Record<string, FilterOption[]> = {};
      
      filteredOptions.forEach(option => {
        const category = option.category || 'Other';
        if (!groups[category]) groups[category] = [];
        groups[category].push(option);
      });
      
      return Object.entries(groups)
        .sort(([catA], [catB]) => {
          if (catA === 'Other') return 1;
          if (catB === 'Other') return -1;
          return catA.localeCompare(catB);
        })
        .map(([category, items]) => ({
          label: category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          items: items.sort((a, b) => a.name.localeCompare(b.name))
        })) as GroupedOptions[];
    }
    
    return [{
      label: '',
      items: filteredOptions.sort((a, b) => a.name.localeCompare(b.name))
    }] as GroupedOptions[];
  }, [filteredOptions, entityType]);
    
  const handleSelect = (optionId: string) => {
    if (multiple && Array.isArray(value)) {
      if (value.includes(optionId)) {
        const newValue = value.filter(v => v !== optionId);
        onChange(newValue);
      } else {
        if (limit > 0 && value.length >= limit) {
          const newValue = [...value];
          newValue.pop();
          newValue.push(optionId);
          onChange(newValue);
        } else {
          onChange([...value, optionId]);
        }
      }
      
      if (closeAfterSelect) {
        setIsOpen(false);
      }
    } else {
      onChange(optionId);
      setIsOpen(false);
    }
  };
  
  const isSelected = (optionId: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionId);
    } else {
      return value === optionId;
    }
  };
  
  const getIcon = (option: FilterOption) => {
    if (!showIcons || !option.icon) return null;
    
    if (entityType === 'unit') {
      return (
        <div 
          className="w-5 h-5 rounded-full flex-shrink-0 overflow-hidden border"
          style={{ 
            borderColor: option.cost ? 
              ['#9aa4af', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f'][option.cost - 1] || '#9aa4af'
              : '#9aa4af'
          }}
        >
          <img 
            src={getEntityIcon(option, 'unit')} 
            alt={option.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_ICONS.unit;
            }}
          />
        </div>
      );
    } else if (entityType === 'item') {
      return (
        <img 
          src={getEntityIcon(option, 'item')} 
          alt={option.name} 
          className="w-5 h-5 object-contain flex-shrink-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_ICONS.item;
          }}
        />
      );
    } else if (entityType === 'trait') {
      if (option.tierIcon) {
        return (
          <img 
            src={option.tierIcon} 
            alt={option.name} 
            className="w-5 h-5 object-contain flex-shrink-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_ICONS.trait;
            }}
          />
        );
      } else if (option.icon) {
        return (
          <img 
            src={getEntityIcon(option, 'trait')} 
            alt={option.name} 
            className="w-5 h-5 object-contain flex-shrink-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_ICONS.trait;
            }}
          />
        );
      }
    }
    
    return null;
  };
  
  const selectedInfo = getSelectedInfo();
  
  const renderDropdownContent = () => {
    if (!isOpen) return null;
    
    return (
      <div 
        id="dropdown-content"
        className="absolute z-50 mt-1 py-1 bg-brown/95 border border-gold/30 rounded-lg shadow-xl backdrop-blur-md overflow-hidden custom-scrollbar"
        style={{ 
          top: dropdownPosition.top, 
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          maxHeight: '300px'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-2 py-1 border-b border-gold/10 sticky top-0 bg-brown/95 backdrop-blur-md z-10">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gold/60 h-3.5 w-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-7 pr-2 py-1.5 bg-brown-light/30 border border-gold/10 rounded text-xs text-cream focus:outline-none focus:border-gold/30"
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
            />
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[250px] custom-scrollbar">
          {groupedOptions.length > 0 ? (
            groupedOptions.map((group, groupIndex) => (
              <div key={groupIndex} className="py-1">
                {group.label && (
                  <div 
                    className="px-3 py-1 text-xs font-medium border-b border-gold/10 mb-1"
                    style={group.color ? { color: group.color } : {}}
                  >
                    {group.label}
                  </div>
                )}
                {group.items.map((option, optionIndex) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    onKeyDown={(e) => handleOptionKeyDown(e, option.id, optionIndex)}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gold/10 transition-colors ${
                      isSelected(option.id) ? 'bg-gold/20 text-gold' : 'text-cream'
                    }`}
                    role="option"
                    aria-selected={isSelected(option.id)}
                    tabIndex={0}
                  >
                    {multiple && (
                      <div className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center ${
                        isSelected(option.id) ? 'bg-gold border-gold' : 'border-cream/50'
                      }`}>
                        {isSelected(option.id) && <span className="text-brown text-xs">✓</span>}
                      </div>
                    )}
                    {getIcon(option)}
                    <span className="truncate">{option.name}</span>
                  </button>
                ))}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-cream/50 text-sm">No matches found</div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between px-3 py-2 bg-brown-light/30 border border-gold/20 rounded-lg text-sm text-cream hover:bg-brown-light/40 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedInfo.icon && (
            <div className="flex-shrink-0">
              {entityType === 'unit' ? (
                <div 
                  className="w-5 h-5 rounded-full overflow-hidden border"
                  style={{ 
                    borderColor: selectedInfo.cost ? 
                      ['#9aa4af', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f'][selectedInfo.cost - 1] || '#9aa4af'
                      : '#9aa4af'
                  }}
                >
                  <img 
                    src={getEntityIcon({icon: selectedInfo.icon}, entityType as 'unit' | 'item' | 'trait')} 
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_ICONS[entityType as keyof typeof DEFAULT_ICONS] || DEFAULT_ICONS.unit;
                    }}
                  />
                </div>
              ) : (
                <img 
                  src={getEntityIcon({icon: selectedInfo.icon}, entityType as 'unit' | 'item' | 'trait')} 
                  alt=""
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_ICONS[entityType as keyof typeof DEFAULT_ICONS] || DEFAULT_ICONS.unit;
                  }}
                />
              )}
            </div>
          )}
          <span className={`truncate ${selectedInfo.text !== placeholder ? 'text-cream' : 'text-cream/60'}`}>
            {selectedInfo.text}
          </span>
        </div>
        <div className="ml-1">
          {isOpen ? <ChevronUp size={16} className="text-gold" /> : <ChevronDown size={16} className="text-gold" />}
        </div>
      </button>
      
      {isOpen && portalContainer && createPortal(renderDropdownContent(), portalContainer)}
    </div>
  );
}

interface ContextualFilter {
  entity: string;
  entityType: 'unit' | 'trait' | 'item';
  starLevel?: string[];
  itemsHeld?: string[];
  item1?: string;
  item2?: string;
  item3?: string;
  traitTier?: string;
  unitHolders?: string[];
  itemCombos?: string[];
}

interface ContextualFilterSidebarProps {
  visible: boolean;
  entityOptions: {
    units: FilterOption[];
    items: FilterOption[];
    traits: FilterOption[];
  };
  unitItemRelations: Record<string, string[]>;
  itemUnitRelations: Record<string, string[]>;
  itemComboRelations: Record<string, string[]>;
  filters: ContextualFilter[];
  onAddFilter: (filter: ContextualFilter) => void;
  onRemoveFilter: (index: number) => void;
  onClearAll: () => void;
  className?: string;
}

export function ContextualFilterSidebar({
  visible,
  entityOptions,
  unitItemRelations,
  itemUnitRelations,
  itemComboRelations,
  filters,
  onAddFilter,
  onRemoveFilter,
  onClearAll,
  className = ''
}: ContextualFilterSidebarProps) {
  const [currentFilterType, setCurrentFilterType] = useState<'unit' | 'trait' | 'item'>('unit');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [starLevel, setStarLevel] = useState<string[]>([]);
  const [item1, setItem1] = useState<string>('');
  const [item2, setItem2] = useState<string>('');
  const [item3, setItem3] = useState<string>('');
  const [traitTier, setTraitTier] = useState<string>('');
  const [unitHolders, setUnitHolders] = useState<string[]>([]);
  const [itemCombo1, setItemCombo1] = useState<string>('');
  const [itemCombo2, setItemCombo2] = useState<string>('');
  
  const starLevelOptions = [
    { id: '1', name: '1★', icon: '/assets/ui/star_1.png' },
    { id: '2', name: '2★', icon: '/assets/ui/star_2.png' },
    { id: '3', name: '3★', icon: '/assets/ui/star_3.png' }
  ];
  
  const getTraitTierOptions = (traitId: string) => {
    if (!traitId) return [];
    
    const traitData = traitsJson.origins[traitId as keyof typeof traitsJson.origins] || 
                     traitsJson.classes[traitId as keyof typeof traitsJson.classes];
    
    if (!traitData || !traitData.tiers) return [];
    
    return traitData.tiers.map((tier, index) => {
      const tierLevel = index + 1;
      const tierIcon = tier.icon ? `/assets/traits/${tier.icon}` : getTierIcon(traitId, tier.units);
      
      return {
        id: tierLevel.toString(),
        name: `${tier.units} units`,
        icon: traitData.icon,
        tierIcon: tierIcon
      };
    });
  };
  
  useEffect(() => {
    setSelectedEntity('');
    resetSecondaryFilters();
  }, [currentFilterType]);
  
  useEffect(() => {
    resetSecondaryFilters();
    
    if (selectedEntity) {
      applyCurrentFilter();
    }
  }, [selectedEntity]);
  
  const resetSecondaryFilters = () => {
    setStarLevel([]);
    setItem1('');
    setItem2('');
    setItem3('');
    setTraitTier('');
    setUnitHolders([]);
    setItemCombo1('');
    setItemCombo2('');
  };
  
  const applyCurrentFilter = () => {
    if (!selectedEntity) return;
    
    const existingFilterIndex = filters.findIndex(
      f => f.entity === selectedEntity && f.entityType === currentFilterType
    );
    
    const newFilter: ContextualFilter = {
      entity: selectedEntity,
      entityType: currentFilterType
    };
    
    if (currentFilterType === 'unit') {
      if (starLevel.length > 0) newFilter.starLevel = starLevel;
      if (item1) newFilter.item1 = item1;
      if (item2) newFilter.item2 = item2;
      if (item3) newFilter.item3 = item3;
    } else if (currentFilterType === 'trait') {
      if (traitTier) newFilter.traitTier = traitTier;
    } else if (currentFilterType === 'item') {
      if (unitHolders.length > 0) newFilter.unitHolders = unitHolders;
      
      const combos: string[] = [];
      if (itemCombo1) combos.push(itemCombo1);
      if (itemCombo2) combos.push(itemCombo2);
      
      if (combos.length > 0) newFilter.itemCombos = combos;
    }
    
    if (existingFilterIndex >= 0) {
      if (!hasContextualFilters(newFilter)) {
        onRemoveFilter(existingFilterIndex);
      } else {
        const updatedFilters = [...filters];
        updatedFilters[existingFilterIndex] = newFilter;
        onClearAll();
        updatedFilters.forEach(filter => onAddFilter(filter));
      }
    } else {
      onAddFilter(newFilter);
    }
  };
  
  const hasContextualFilters = (filter: ContextualFilter): boolean => {
    return !!(
      (filter.starLevel && filter.starLevel.length > 0) ||
      filter.item1 || filter.item2 || filter.item3 ||
      filter.traitTier ||
      (filter.unitHolders && filter.unitHolders.length > 0) ||
      (filter.itemCombos && filter.itemCombos.length > 0)
    );
  };
  
  useEffect(() => {
    if (selectedEntity) {
      applyCurrentFilter();
    }
  }, [starLevel, item1, item2, item3, traitTier, unitHolders, itemCombo1, itemCombo2]);
  
  const getContextSpecificOptions = (type: string) => {
    if (!selectedEntity) return [];
    
    if (type === 'unit-items' && currentFilterType === 'unit' && unitItemRelations[selectedEntity]) {
      return entityOptions.items.filter(item => 
        unitItemRelations[selectedEntity]?.includes(item.id)
      );
    }
    
    if (type === 'item-units' && currentFilterType === 'item' && itemUnitRelations[selectedEntity]) {
      return entityOptions.units.filter(unit => 
        itemUnitRelations[selectedEntity]?.includes(unit.id)
      );
    }
    
    if (type === 'item-combos' && currentFilterType === 'item' && itemComboRelations[selectedEntity]) {
      return entityOptions.items.filter(item => 
        item.id !== selectedEntity && itemComboRelations[selectedEntity]?.includes(item.id)
      );
    }
    
    return [];
  };
  
  const getEntityName = (id: string, type: 'unit' | 'trait' | 'item'): string => {
    const options = type === 'unit' ? entityOptions.units :
                    type === 'trait' ? entityOptions.traits :
                    entityOptions.items;
                    
    return options.find(opt => opt.id === id)?.name || id;
  };
  
  const getEntityOptionByID = (id: string, type: 'unit' | 'trait' | 'item'): FilterOption | undefined => {
    const options = type === 'unit' ? entityOptions.units :
                    type === 'trait' ? entityOptions.traits :
                    entityOptions.items;
                    
    return options.find(opt => opt.id === id);
  };
  
  const formatFilterDisplay = (filter: ContextualFilter): React.ReactNode => {
    const entityName = getEntityName(filter.entity, filter.entityType);
    const entityOption = getEntityOptionByID(filter.entity, filter.entityType);
    const contextParts = [];
    
    if (filter.starLevel?.length) {
      contextParts.push(`${filter.starLevel.map(lvl => `${lvl}★`).join('/')} stars`);
    }
    
    const itemNames = [];
    if (filter.item1) itemNames.push(getEntityName(filter.item1, 'item'));
    if (filter.item2) itemNames.push(getEntityName(filter.item2, 'item'));
    if (filter.item3) itemNames.push(getEntityName(filter.item3, 'item'));
    
    if (itemNames.length > 0) {
      contextParts.push(`with ${itemNames.join(', ')}`);
    }
    
    if (filter.traitTier) {
      const traitData = traitsJson.origins[filter.entity as keyof typeof traitsJson.origins] || 
                       traitsJson.classes[filter.entity as keyof typeof traitsJson.classes];
      
      if (traitData && traitData.tiers) {
        const tierIndex = parseInt(filter.traitTier) - 1;
        if (tierIndex >= 0 && tierIndex < traitData.tiers.length) {
          const unitCount = traitData.tiers[tierIndex].units;
          contextParts.push(`${unitCount} units`);
        }
      }
    }
    
    if (filter.unitHolders?.length) {
      if (filter.unitHolders.length === 1) {
        contextParts.push(`on ${getEntityName(filter.unitHolders[0], 'unit')}`);
      } else {
        contextParts.push(`on ${filter.unitHolders.length} units`);
      }
    }
    
    if (filter.itemCombos?.length) {
      if (filter.itemCombos.length === 1) {
        contextParts.push(`with ${getEntityName(filter.itemCombos[0], 'item')}`);
      } else {
        contextParts.push(`with ${filter.itemCombos.length} items`);
      }
    }

    // Get the appropriate icon based on filter type and tier
    let iconSrc = '';
    if (entityOption) {
      if (filter.entityType === 'trait' && filter.traitTier) {
        // Use tier-specific icon for traits when tier is selected
        const traitData = traitsJson.origins[filter.entity as keyof typeof traitsJson.origins] || 
                         traitsJson.classes[filter.entity as keyof typeof traitsJson.classes];
        
        if (traitData && traitData.tiers) {
          const tierIndex = parseInt(filter.traitTier) - 1;
          if (tierIndex >= 0 && tierIndex < traitData.tiers.length) {
            const tier = traitData.tiers[tierIndex];
            iconSrc = tier.icon ? `/assets/traits/${tier.icon}` : getTierIcon(filter.entity, tier.units);
          }
        }
      } else {
        iconSrc = getEntityIcon(entityOption, filter.entityType);
      }
    }
    
    return (
      <div className="flex items-center gap-3">
        {iconSrc && (
          <div className="flex-shrink-0">
            {filter.entityType === 'unit' ? (
              <div 
                className="w-8 h-8 rounded-full overflow-hidden border-2"
                style={{ 
                  borderColor: entityOption?.cost ? 
                    ['#9aa4af', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f'][entityOption.cost - 1] || '#9aa4af'
                    : '#9aa4af'
                }}
              >
                <img 
                  src={iconSrc} 
                  alt={entityName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_ICONS.unit;
                  }}
                />
              </div>
            ) : (
              <img 
                src={iconSrc} 
                alt={entityName} 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_ICONS[filter.entityType];
                }}
              />
            )}
          </div>
        )}
        <div className="overflow-hidden">
          <div className="font-medium truncate">{entityName}</div>
          {contextParts.length > 0 && (
            <div className="text-xs text-cream/70 truncate">{contextParts.join(', ')}</div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '30%', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`overflow-visible border-l border-gold/30 bg-brown-light/20 backdrop-blur-md ${className}`}
        >
          <div className="p-4 h-full overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gold/20">
              <h3 className="text-gold font-display text-lg">Advanced Filters</h3>
              <button 
                onClick={onClearAll}
                className="text-xs px-2.5 py-1.5 bg-brown-light/30 hover:bg-brown-light/50 text-cream/80 rounded transition-all hover:text-cream"
              >
                Clear All
              </button>
            </div>
            
            {filters.length > 0 && (
              <div className="mb-6">
                <div className="bg-brown/40 border border-gold/20 rounded-lg overflow-hidden shadow-md">
                  <div className="bg-brown/60 px-4 py-2.5 border-b border-gold/20">
                    <h4 className="text-sm text-gold font-medium">Active Filters ({filters.length})</h4>
                  </div>
                  <div className="p-3 space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar">
                    {filters.map((filter, index) => (
                      <motion.div 
                        key={`${filter.entityType}-${filter.entity}-${index}`}
                        className="bg-brown-light/40 border border-gold/20 shadow-sm rounded-lg p-3 flex items-center justify-between hover:bg-brown-light/50 transition-colors"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        {formatFilterDisplay(filter)}
                        <button 
                          onClick={() => onRemoveFilter(index)}
                          className="ml-2 p-1.5 text-cream/60 hover:text-cream/90 rounded-full hover:bg-brown-light/50 transition-colors"
                          aria-label="Remove filter"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-5">
              <div className="bg-brown/40 border border-gold/20 rounded-lg overflow-hidden shadow-md mb-5">
                <div className="bg-brown/60 px-4 py-2.5 border-b border-gold/20">
                  <h4 className="text-sm text-gold font-medium">Filter By Entity Type</h4>
                </div>
                <div className="p-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentFilterType('unit')}
                      className={`flex-1 py-2.5 px-3 text-sm rounded font-medium transition-all ${
                        currentFilterType === 'unit' 
                          ? 'bg-gold/20 text-gold border border-gold/40 shadow-inner shadow-gold/10' 
                          : 'bg-brown-light/30 text-cream/70 hover:bg-brown-light/40 border border-gold/10'
                      }`}
                    >
                      Units
                    </button>
                    <button
                      onClick={() => setCurrentFilterType('trait')}
                      className={`flex-1 py-2.5 px-3 text-sm rounded font-medium transition-all ${
                        currentFilterType === 'trait' 
                          ? 'bg-gold/20 text-gold border border-gold/40 shadow-inner shadow-gold/10' 
                          : 'bg-brown-light/30 text-cream/70 hover:bg-brown-light/40 border border-gold/10'
                      }`}
                    >
                      Traits
                    </button>
                    <button
                      onClick={() => setCurrentFilterType('item')}
                      className={`flex-1 py-2.5 px-3 text-sm rounded font-medium transition-all ${
                        currentFilterType === 'item' 
                          ? 'bg-gold/20 text-gold border border-gold/40 shadow-inner shadow-gold/10' 
                          : 'bg-brown-light/30 text-cream/70 hover:bg-brown-light/40 border border-gold/10'
                      }`}
                    >
                      Items
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-brown/40 border border-gold/20 rounded-lg overflow-hidden shadow-md">
                <div className="bg-brown/60 px-4 py-2.5 border-b border-gold/20">
                  <h4 className="text-sm text-gold font-medium">
                    Select {currentFilterType === 'unit' ? 'Unit' : currentFilterType === 'trait' ? 'Trait' : 'Item'}
                  </h4>
                </div>
                <div className="p-3">
                  <SelectDropdown
                    options={
                      currentFilterType === 'unit' ? entityOptions.units :
                      currentFilterType === 'trait' ? entityOptions.traits :
                      entityOptions.items
                    }
                    value={selectedEntity}
                    onChange={(value) => setSelectedEntity(value as string)}
                    placeholder={`Select ${currentFilterType}...`}
                    entityType={currentFilterType}
                    maxHeight="200px"
                    closeAfterSelect={true}
                  />
                </div>
              </div>
            </div>
            
            {selectedEntity && (
              <div className="space-y-4 mt-5">
                <div className="bg-brown/40 border border-gold/20 rounded-lg overflow-hidden shadow-md">
                  <div className="bg-brown/60 px-4 py-2.5 border-b border-gold/20">
                    <h4 className="text-sm text-gold font-medium">Filter Options</h4>
                  </div>
                  <div className="p-3 space-y-4">
                    {currentFilterType === 'unit' && (
                      <>
                        <div>
                          <label className="text-xs text-cream/80 block mb-1.5 font-medium">Star Level</label>
                          <SelectDropdown
                            options={starLevelOptions}
                            value={starLevel}
                            onChange={(value) => setStarLevel(value as string[])}
                            placeholder="Any star level"
                            multiple={true}
                            entityType="star"
                            showIcons={false}
                            closeAfterSelect={true}
                          />
                        </div>
                        
                        {unitItemRelations[selectedEntity]?.length > 0 && (
                          <>
                            <div>
                              <label className="text-xs text-cream/80 block mb-1.5 font-medium">Item 1</label>
                              <SelectDropdown
                                options={getContextSpecificOptions('unit-items')}
                                value={item1}
                                onChange={(value) => {
                                  setItem1(value as string);
                                  if (!value) {
                                    setItem2('');
                                    setItem3('');
                                  }
                                }}
                                placeholder="Select first item"
                                multiple={false}
                                entityType="item"
                                closeAfterSelect={true}
                              />
                            </div>
                            
                            {item1 && (
                              <div>
                                <label className="text-xs text-cream/80 block mb-1.5 font-medium">Item 2</label>
                                <SelectDropdown
                                  options={getContextSpecificOptions('unit-items')}
                                  value={item2}
                                  onChange={(value) => {
                                    setItem2(value as string);
                                    if (!value) {
                                      setItem3('');
                                    }
                                  }}
                                  placeholder="Select second item"
                                  multiple={false}
                                  entityType="item"
                                  closeAfterSelect={true}
                                />
                              </div>
                            )}
                            
                            {item2 && (
                              <div>
                                <label className="text-xs text-cream/80 block mb-1.5 font-medium">Item 3</label>
                                <SelectDropdown
                                  options={getContextSpecificOptions('unit-items')}
                                  value={item3}
                                  onChange={(value) => setItem3(value as string)}
                                  placeholder="Select third item"
                                  multiple={false}
                                  entityType="item"
                                  closeAfterSelect={true}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                    
                    {currentFilterType === 'trait' && (
                      <div>
                        <label className="text-xs text-cream/80 block mb-1.5 font-medium">Trait Tier</label>
                        <SelectDropdown
                          options={getTraitTierOptions(selectedEntity)}
                          value={traitTier}
                          onChange={(value) => setTraitTier(value as string)}
                          placeholder="Any tier"
                          entityType="trait"
                          showIcons={true}
                          closeAfterSelect={true}
                        />
                      </div>
                    )}
                    
                    {currentFilterType === 'item' && (
                      <>
                        {itemUnitRelations[selectedEntity]?.length > 0 && (
                          <div>
                            <label className="text-xs text-cream/80 block mb-1.5 font-medium">Held By Units</label>
                            <SelectDropdown
                              options={getContextSpecificOptions('item-units')}
                              value={unitHolders}
                              onChange={(value) => setUnitHolders(value as string[])}
                              placeholder="Select units"
                              multiple={true}
                              entityType="unit"
                              closeAfterSelect={true}
                            />
                          </div>
                        )}
                        
                        {itemComboRelations[selectedEntity]?.length > 0 && (
                          <>
                            <div>
                              <label className="text-xs text-cream/80 block mb-1.5 font-medium">Item Combo 1</label>
                              <SelectDropdown
                                options={getContextSpecificOptions('item-combos')}
                                value={itemCombo1}
                                onChange={(value) => setItemCombo1(value as string)}
                                placeholder="Select combo item 1"
                                multiple={false}
                                entityType="item"
                                closeAfterSelect={true}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-cream/80 block mb-1.5 font-medium">Item Combo 2</label>
                              <SelectDropdown
                                options={getContextSpecificOptions('item-combos')}
                                value={itemCombo2}
                                onChange={(value) => setItemCombo2(value as string)}
                                placeholder="Select combo item 2"
                                multiple={false}
                                entityType="item"
                                closeAfterSelect={true}
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
