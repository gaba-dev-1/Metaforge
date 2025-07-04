import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layout, Card, FilterButtons, LoadingState, ErrorMessage } from '@/components/ui';
import { useTftData } from '@/utils/useTftData';
import { TrendingUp, Search, Layers, Trophy, Grid, ChevronDown, ChevronUp, Book, Newspaper, User, Download, Tv } from 'lucide-react';
import traitsJson from 'public/mapping/traits.json';
import unitsJson from 'public/mapping/units.json';
import itemsJson from 'public/mapping/items.json';
import { StatsCarousel } from '@/components/common/StatsCarousel';
import { HeaderBanner } from '@/components/common/HeaderBanner';
import { getEntityIcon, DEFAULT_ICONS } from '@/utils/paths';
import { useAuth } from '@/utils/auth/AuthContext';
import LoginButton from '@/components/auth/LoginButton';

// Define types with required 'all' property
type FilterType = 'units' | 'items' | 'traits';
interface FilterValue {
  all: boolean;
  [key: string]: boolean;
}

interface EntityGridProps {
  entities: Array<{
    id: string;
    name: string;
    icon: string;
    cost?: number;
    category?: string;
  }>;
  type: 'units' | 'items' | 'traits';
}

// Modernized App Banner Component with improved wording focused on experimentation
const AppBanner = () => {
  return (
    <motion.div 
      className="my-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative rounded-xl overflow-hidden">
        {/* Gradient background layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-eclipse-shadow to-void-core opacity-90 z-0"></div>
        
        {/* Image background layer */}
        <div className="absolute inset-0 bg-[url('/assets/app/bg.jpg')] bg-cover bg-center opacity-20 z-0"></div>
        
        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-xl border border-solar-flare/30 z-10"></div>
        
        {/* Content container - centered approach with improved hierarchy */}
        <div className="relative z-20 px-6 py-10 flex flex-col items-center text-center">
          <h2 className="text-4xl font-display tracking-tight text-solar-flare mb-3">
            <span className="text-gold">Master</span> <span className="text-corona-light/90">TeamFight Tactics</span>
          </h2>
          
          <p className="text-corona-light/90 mb-6 max-w-2xl mx-auto text-base md:text-lg">
            Make the most of data-driven analysis & community predictions to forge new comps & strats. Get ready to climb!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <motion.a 
              href="#" 
              className="btn btn-primary flex items-center justify-center gap-2 px-6 py-3"
              whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(245, 158, 11, 0.3)" }}
              whileTap={{ scale: 0.97 }}
            >
              <Download size={20} />
              <span>Mobile App</span>
            </motion.a>
            <motion.a 
              href="#" 
              className="btn btn-secondary flex items-center justify-center gap-2 px-6 py-3"
              whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(245, 158, 11, 0.2)" }}
              whileTap={{ scale: 0.97 }}
            >
              <Tv size={20} />
              <span>Desktop Overlay</span>
            </motion.a>
          </div>
          
          {/* Clean icon showcase using a clean horizontal display */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="relative">
              <img 
                src="/assets/items/TFT14_CypherItem_Golem_NullificationField.png" 
                alt="Unit" 
                className="w-12 h-12 object-cover rounded-full border-2 border-solar-flare"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_ICONS.unit;
                }}
              />
            </div>
            <div className="relative">
              <img 
                src="/assets/items/TFT14_CypherItem_Golem_TitansteelPlating.png" 
                alt="Unit" 
                className="w-12 h-12 object-cover rounded-full border-2 border-solar-flare"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_ICONS.unit;
                }}
              />
            </div>
            <div className="relative">
              <img 
                src="/assets/items/TFT14_CypherItem_Golem_KineticLauncherRockets.png" 
                alt="Unit" 
                className="w-12 h-12 object-cover rounded-full border-2 border-solar-flare"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_ICONS.unit;
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface FeatureCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  linkTo: string;
}

// Reimagined Feature Card with more visual impact, sleeker design and improved glass effect
const FeatureCard = ({ title, icon, description, linkTo }: FeatureCardProps) => {
  return (
    <Link href={linkTo}>
      <motion.div 
        className="backdrop-filter backdrop-blur-md bg-eclipse-shadow/30 to-void-core/40 rounded-xl overflow-hidden relative group border border-solar-flare/20"
        whileHover={{ 
          scale: 1.03, 
          boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.25)",
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Animated background glow effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-solar-flare/0 to-solar-flare/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
          animate={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
        
        {/* Border glow */}
        <div className="absolute inset-0 border border-solar-flare/30 group-hover:border-solar-flare/60 rounded-xl transition-colors duration-300" />
        
        <div className="p-6 h-full flex flex-col items-center text-center">
          {/* Icon with glow effect on hover */}
          <motion.div 
            className="w-16 h-16 rounded-full flex items-center justify-center bg-eclipse-shadow/60 backdrop-blur-md border border-solar-flare/40 mb-4 relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="absolute inset-0 bg-solar-flare/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="text-solar-flare z-10">
              {icon}
            </div>
          </motion.div>
          
          <h3 className="text-xl font-display text-solar-flare mb-2 group-hover:text-solar-flare/90 transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-sm text-corona-light/80 group-hover:text-corona-light/90 transition-colors duration-300">
            {description}
          </p>
          
          {/* Animated arrow that appears on hover */}
          <motion.div 
            className="mt-4 text-solar-flare/0 group-hover:text-solar-flare transition-colors duration-300 flex items-center justify-center"
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
};

interface FeatureCardsContainerProps {
  children: React.ReactNode;
}

// Improved Feature Cards Container with better spacing and animation
const FeatureCardsContainer = ({ children }: FeatureCardsContainerProps) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        staggerChildren: 0.1
      }}
    >
      {children}
    </motion.div>
  );
};

// Define an interface for the FeatureBanner props
interface FeatureBannerProps {
  title: string;
}

// Enhanced Feature Banner with centered alignment
const FeatureBanner = ({ title }: FeatureBannerProps) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-center">
        <div className="h-1 flex-grow bg-gradient-to-r from-transparent via-solar-flare/20 to-solar-flare/50 mr-3"></div>
        <div className="bg-eclipse-shadow/70 backdrop-blur-md border-b-2 border-solar-flare rounded-md px-8 py-3 inline-block shadow-sm shadow-solar-flare/20">
          <h2 className="text-2xl font-display text-solar-flare text-center">{title}</h2>
        </div>
        <div className="h-1 flex-grow bg-gradient-to-l from-transparent via-solar-flare/20 to-solar-flare/50 ml-3"></div>
      </div>
    </div>
  );
};

const EntityGrid = ({ entities, type }: EntityGridProps) => {
  // Animation variants for staggered grid items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.2, 0.8, 0.2, 1]
      }
    }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {entities.map((entity, i) => (
        <motion.div key={i} variants={itemVariants}>
          <Link href={`/entity/${type}/${entity.id}`}>
            <motion.div 
              className="flex flex-col items-center p-2 bg-eclipse-shadow/40 backdrop-blur-sm rounded-xl hover:bg-eclipse-shadow/60 transition-all duration-300 border border-solar-flare/10 hover:border-solar-flare/30"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.2)" 
              }}
            >
              {type === 'units' && (
                <div className="relative">
                  <img 
                    src={`/assets/units/${entity.icon}`} 
                    alt={entity.name} 
                    className="w-12 h-12 rounded-full border-2 object-cover transition-transform duration-300 hover:scale-110" 
                    style={{ 
                      borderColor: ['#9aa4af', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e74c3c'][(entity.cost || 1) - 1] 
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_ICONS.unit;
                    }}
                  />
                </div>
              )}
              {type === 'items' && (
                <img 
                  src={`/assets/items/${entity.icon}`} 
                  alt={entity.name} 
                  className="w-11 h-11 object-contain transition-transform duration-300 hover:scale-110" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_ICONS.item;
                  }}
                />
              )}
              {type === 'traits' && (
                <img 
                  src={getEntityIcon(entity, 'trait')} 
                  alt={entity.name} 
                  className="w-12 h-12 object-contain transition-transform duration-300 hover:scale-110" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_ICONS.trait;
                  }}
                />
              )}
              <span className="text-xs mt-1 truncate w-full text-center text-corona-light">{entity.name}</span>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function Home() {
  // Fixed TypeScript error by using type assertion and accessing properties safely
  const tftData = useTftData() as any;
  const isLoading = tftData?.isLoading || false;
  const data = tftData?.data || null;
  const error = tftData?.error || null;
  const handleRetry = tftData?.handleRetry || (() => {});
  
  const [activeTab, setActiveTab] = useState<FilterType>('units');
  const [filters, setFilters] = useState<Record<FilterType, FilterValue>>({ 
    units: { all: true }, 
    items: { all: true }, 
    traits: { all: true, origin: false, class: false } 
  });
  const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(false);
  const { auth } = useAuth();

  // Process data before conditional returns
  const allUnits = useMemo(() => 
    Object.entries(unitsJson.units as Record<string, any>)
      .map(([id, unit]) => ({ id, name: unit.name, icon: unit.icon, cost: unit.cost }))
      .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))
  , []);
  
  // Use useMemo to memoize allTraitsData
  const allTraits = useMemo(() => {
    const allTraitsData = { ...traitsJson.origins, ...traitsJson.classes };
    
    return Object.entries(allTraitsData as Record<string, any>)
      .map(([id, trait]) => ({
        id, 
        name: trait.name, 
        icon: trait.icon,
        type: id in traitsJson.origins ? 'Origin' : 'Class'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);
  
  const allItems = useMemo(() => 
    Object.entries(itemsJson.items as Record<string, any>)
      .filter(([_, item]) => item.category !== 'component' && item.category !== 'tactician')
      .map(([id, item]) => ({ id, name: item.name, icon: item.icon, category: item.category }))
      .sort((a, b) => a.name.localeCompare(b.name))
  , []);

  // Filter options
  const costFilters = useMemo(() => 
    Array.from(new Set(allUnits.map(unit => unit.cost)))
      .sort()
      .map(cost => ({ id: cost.toString(), name: `${cost} 🪙` }))
  , [allUnits]);
  
  const categoryFilters = useMemo(() => 
    Array.from(new Set(allItems.map(item => item.category)))
      .filter(Boolean)
      .map(category => ({ id: category, name: category.replace(/-/g, ' ') }))
  , [allItems]);
  
  const traitTypeFilters = [
    { id: 'origin', name: 'Origins' },
    { id: 'class', name: 'Classes' }
  ];
  
  // Filtered entities
  const filteredUnits = useMemo(() => 
    allUnits.filter(unit => {
      const costKey = unit.cost?.toString();
      return filters.units.all || (costKey && costKey in filters.units && filters.units[costKey]);
    })
  , [allUnits, filters.units]);
  
  const filteredItems = useMemo(() => 
    allItems.filter(item => 
      filters.items.all || 
      (item.category && item.category in filters.items && filters.items[item.category])
    )
  , [allItems, filters.items]);
  
  const filteredTraits = useMemo(() => 
    allTraits.filter(trait => 
      filters.traits.all || 
      ('origin' in filters.traits && filters.traits.origin && trait.type === 'Origin') ||
      ('class' in filters.traits && filters.traits.class && trait.type === 'Class')
    )
  , [allTraits, filters.traits]);
  
  if (isLoading) return (
    <Layout>
      <LoadingState message="Loading TFT data..." />
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="mt-6">
        <ErrorMessage 
          message={error && typeof error === 'object' && 'message' in error ? String(error.message) : 'An error occurred'} 
          onRetry={handleRetry} 
        />
      </div>
    </Layout>
  );

  // Toggle filter handler
  const toggleFilter = (type: FilterType, filterId: string): void => {
    if (filterId === 'all') {
      setFilters({...filters, [type]: { all: true }});
    } else {
      const newTypeFilters: FilterValue = {...filters[type], all: false};
      
      if (newTypeFilters[filterId]) {
        newTypeFilters[filterId] = false;
        // Check if any filter is still active
        const hasActiveFilters = Object.entries(newTypeFilters)
          .some(([key, value]) => key !== 'all' && value);
          
        if (!hasActiveFilters) {
          newTypeFilters.all = true;
        }
      } else {
        newTypeFilters[filterId] = true;
      }
      
      setFilters({...filters, [type]: newTypeFilters});
    }
  };
  
  // Animation variants
  const featureSectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: {
        duration: 0.2,
        ease: [0.2, 0.2, 0.2, 1]
      }
    }
  };
  
  return (
    <Layout>
      {/* Header Banner */}
      <HeaderBanner />
      
      {/* Stats Carousel */}
      <StatsCarousel />
      
      {/* Sleek Modern App Banner with updated wording */}
      <AppBanner />
    
      {/* First Feature Section - Updated titles and descriptions */}
      <motion.div 
        className="mt-10"
        variants={featureSectionVariants}
        initial="hidden"
        animate="visible"
      >
        <FeatureBanner title="Tools for Tacticians" />
        <div className="mt-2">
          <FeatureCardsContainer>
            <FeatureCard 
              title="Meta Report"
              icon={<TrendingUp size={30} />}
              description="Discover current best strategies" 
              linkTo="/meta-report"
            />
            <FeatureCard 
              title="Stats Explorer"
              icon={<Search size={30} />}
              description="Analyze performance with detailed stats"
              linkTo="/stats-explorer"
            />
            <FeatureCard 
              title="Team Builder"
              icon={<Layers size={30} />}
              description="Plan & craft winning compositions"
              linkTo="/team-builder"
            />
          </FeatureCardsContainer>
        </div>
      </motion.div>
      
      {/* Second Feature Section - Updated titles and descriptions */}
      <motion.div 
        className="mt-10"
        variants={featureSectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <FeatureBanner title="Community & Resources" />
        <div className="mt-2">
          <FeatureCardsContainer>
            <FeatureCard 
              title="Strategy Guides"
              icon={<Book size={30} />}
              description="Learn from top players and climb the ladder" 
              linkTo="/guides"
            />
            <FeatureCard 
              title="Latest News"
              icon={<Newspaper size={30} />}
              description="Stay updated with patches and game changes"
              linkTo="/news"
            />
            <FeatureCard 
              title="Player Profile"
              icon={<User size={30} />}
              description="Track your stats and match history"
              linkTo="/profile"
            />
          </FeatureCardsContainer>
        </div>
      </motion.div>
        
      {/* Collections Section - Updated with improved glass effect */}
      <motion.div 
        className="mt-10"
        variants={featureSectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <FeatureBanner title="TFT Collection & Community" />
        <div className="mt-2 backdrop-filter backdrop-blur-md bg-eclipse-shadow/30 rounded-xl p-4 shadow-md border border-solar-flare/30 hover:border-solar-flare/40 transition-all">
          <motion.div 
            className="flex flex-col items-center cursor-pointer mb-2"
            onClick={() => setIsCollectionsExpanded(!isCollectionsExpanded)}
            whileHover={{ scale: 1.02 }}
          >
            {/* Modernized collections toggle button */}
            <motion.div 
              className="w-16 h-16 rounded-full flex items-center justify-center bg-eclipse-shadow/60 backdrop-blur-sm border border-solar-flare/40 mb-4 relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                borderColor: "rgba(245, 158, 11, 0.6)" 
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Grid
                size={30}
                className="text-solar-flare"
              />
            </motion.div>
            
            <h3 className="text-xl font-display text-solar-flare mb-2">Collections</h3>
            <div className="text-sm text-corona-light/80 mb-3 text-center max-w-lg">
              Discover all available units, items, and traits
            </div>
            
            <motion.div className="mt-1 flex justify-center text-solar-flare">
              {isCollectionsExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </motion.div>
          </motion.div>
          
          {/* Collections content with animation */}
          <motion.div 
            className="transition-all duration-200 ease-in-out overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: isCollectionsExpanded ? 'auto' : 0,
              opacity: isCollectionsExpanded ? 1 : 0
            }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="border-b border-solar-flare/30 pb-3 mb-4 mt-2">
              <div className="border-b border-solar-flare/30 flex flex-col sm:flex-row justify-between items-center">
                <div className="flex">
                  {(['units', 'items', 'traits'] as const).map((tab) => (
                    <motion.button
                      key={tab}
                      className={`px-4 py-2 transition-all duration-200 ${activeTab === tab ? 'text-solar-flare border-b-2 border-solar-flare' : 'text-corona-light/70 hover:text-corona-light'}`}
                      onClick={() => setActiveTab(tab)}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </motion.button>
                  ))}
                </div>
                <div className="py-2 px-4 overflow-x-auto w-full sm:w-auto">
                  {activeTab === 'units' && (
                    <FilterButtons 
                      options={costFilters} 
                      activeFilter={filters.units}
                      onChange={(id) => toggleFilter('units', id)}
                    />
                  )}
                  {activeTab === 'items' && (
                    <FilterButtons 
                      options={categoryFilters} 
                      activeFilter={filters.items}
                      onChange={(id) => toggleFilter('items', id)}
                    />
                  )}
                  {activeTab === 'traits' && (
                    <FilterButtons 
                      options={traitTypeFilters} 
                      activeFilter={filters.traits}
                      onChange={(id) => toggleFilter('traits', id)}
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="transition-opacity duration-500 ease-in-out overflow-x-auto">
              {activeTab === 'units' && <EntityGrid entities={filteredUnits} type="units" />}
              {activeTab === 'items' && <EntityGrid entities={filteredItems} type="items" />}
              {activeTab === 'traits' && <EntityGrid entities={filteredTraits} type="traits" />}
            </div>
          </motion.div>
        </div>
      </motion.div>
      {/* Collections Section */}
      <motion.div 
        className="mt-10"
        variants={featureSectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <div className="mt-2">
          {/* Community/Profile buttons in a equal-sized row */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <motion.div 
              className="backdrop-filter backdrop-blur-md bg-eclipse-shadow/30 rounded-xl p-4 border border-solar-flare/30 flex-1"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.15)" 
              }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/profile" className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-eclipse-shadow/60 backdrop-blur-sm border border-solar-flare/40 mb-4">
                  <User size={28} className="text-solar-flare" />
                </div>
                <h3 className="text-xl font-display text-solar-flare mb-2">My Profile</h3>
                <p className="text-sm text-corona-light/80 text-center">
                  View your stats, match history, and track your TFT journey
                </p>
              </Link>
            </motion.div>
            
            <motion.div 
              className="backdrop-filter backdrop-blur-md bg-eclipse-shadow/30 rounded-xl p-4 border border-solar-flare/30 flex-1"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.15)" 
              }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/leaderboard" className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-eclipse-shadow/60 backdrop-blur-sm border border-solar-flare/40 mb-4">
                  <Trophy size={28} className="text-solar-flare" />
                </div>
                <h3 className="text-xl font-display text-solar-flare mb-2">Leaderboard</h3>
                <p className="text-sm text-corona-light/80 text-center">
                  Discover top players and see where you rank globally
                </p>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* CTA Banner - Login/Get Started with proper button */}
      <motion.div 
        className="mt-12 mb-6"
        variants={featureSectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      >
        <div className="relative rounded-xl overflow-hidden">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-r from-eclipse-shadow to-void-core opacity-90 z-0"></div>
          <div className="absolute inset-0 bg-[url('/assets/app/fight_banner.jpg')] bg-cover bg-center opacity-20 z-0 rounded-xl"></div>
          <div className="absolute inset-0 rounded-xl border border-solar-flare/30 z-10"></div>
          
          {/* Content */}
          <div className="relative z-20 px-6 py-10 flex flex-col items-center text-center">
            <h2 className="text-2xl md:text-3xl font-display mb-3">
              <span className="text-solar-flare">Ready</span> <span className="text-white">to dominate the arena?</span>
            </h2>
            
            <p className="text-corona-light/90 mb-6 max-w-2xl mx-auto text-base">
              Join thousands of players using MetaForge to analyze their games, discover winning strategies, and climb the ranks.
            </p>
            
            {/* Centered Login Button */}
            <div className="flex justify-center">
              {auth.isAuthenticated ? (
                <Link href="/profile">
                  <motion.button
                    className="px-8 py-3 bg-solar-flare text-void-core font-medium rounded-md flex items-center gap-2"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(245, 158, 11, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User size={20} />
                    <span>Go to My Profile</span>
                  </motion.button>
                </Link>
              ) : (
                <LoginButton 
                  label="Sign in with Riot" 
                  size="lg" 
                  variant="primary" 
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
