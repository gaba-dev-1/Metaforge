import React from 'react';

interface FilterOption {
  id: string;
  name: string;
}

interface FilterButtonsProps {
  options: FilterOption[];
  activeFilter: {
    all: boolean;
    [key: string]: boolean;
  };
  onChange: (id: string) => void;
}

export default function FilterButtons({ options, activeFilter, onChange }: FilterButtonsProps) {
  const sortedOptions = [...options];
  if (!activeFilter.all) {
    sortedOptions.sort((a, b) => {
      if (activeFilter[a.id] && !activeFilter[b.id]) return -1;
      if (!activeFilter[a.id] && activeFilter[b.id]) return 1;
      return 0;
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button 
        className={`filter-btn ${activeFilter.all ? 'filter-active' : 'filter-inactive'}`}
        onClick={() => onChange('all')}
      >All</button>
      
      {sortedOptions.map(opt => (
        <button
          key={opt.id}
          className={`filter-btn ${activeFilter[opt.id] && !activeFilter.all ? 'filter-active' : 'filter-inactive'}`}
          onClick={() => onChange(opt.id)}
        >{opt.name}</button>
      ))}
    </div>
  );
}
