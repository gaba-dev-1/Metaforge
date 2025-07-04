import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Slack, Search, Layers, 
  Book, Newspaper, User, ChevronDown, Trophy, 
  Users, TrendingUp
} from 'lucide-react';
import AuthStatus from '@/components/auth/AuthStatus';
import SearchBar from '@/components/ui/SearchBar';
import { RegionDropdown } from '@/components/ui/RegionDropdown';

interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavDropdownProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  isActive: boolean;
  className?: string;
}

// Dropdown Component
function NavDropdown({ label, icon, items, isActive, className = '' }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.button
        className={`flex items-center gap-2 px-3 py-2 rounded-md ${
          isActive ? "bg-solar-flare/20 text-solar-flare border-b-2 border-solar-flare" : "text-corona-light hover:bg-solar-flare/10"
        }`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {icon && React.createElement(icon, { className: "h-4 w-4" })}
        <span className="hidden sm:block text-sm">{label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-3 w-3" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute z-20 mt-1 right-0 transform translate-x-3 w-56 rounded-md shadow-lg backdrop-filter backdrop-blur-lg bg-eclipse-shadow/70 border border-solar-flare/30 overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="py-1">
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="block px-4 py-2 text-sm hover:bg-solar-flare/10 text-corona-light hover:text-solar-flare transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    {item.icon && React.createElement(item.icon, { className: "h-4 w-4" })}
                    <span>{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title = "Tools for Tacticians" }: LayoutProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const pageTitle = `MetaForge | ${title}`;
  
  // Handle page transitions
  useEffect(() => {
    const handleRouteChangeStart = () => setIsPageTransitioning(true);
    const handleRouteChangeComplete = () => setIsPageTransitioning(false);
    
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);
  
  // Define navigation items
  const statsAndTools: NavItem[] = [
    { name: "Meta Report", href: "/meta-report", icon: TrendingUp },
    { name: "Stats Explorer", href: "/stats-explorer", icon: Search },
    { name: "Team Builder", href: "/team-builder", icon: Layers }
  ];
  
  const resources: NavItem[] = [
    { name: "Guides", href: "/guides", icon: Book },
    { name: "News", href: "/news", icon: Newspaper }
  ];
  
  const community: NavItem[] = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy }
  ];
  
  // Check if any items in a dropdown are active
  const isStatsActive = statsAndTools.some(item => router.pathname === item.href);
  const isResourcesActive = resources.some(item => router.pathname === item.href);
  const isCommunityActive = community.some(item => router.pathname === item.href || router.pathname.startsWith(item.href));

  // Page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="min-h-screen bg-main-bg bg-cover bg-center bg-fixed flex flex-col">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Master TeamFight Tactics with MetaForge - strategies and tools for tacticians" />
        <link rel="icon" href="/assets/app/app.png" />
      </Head>
      
      <div className="flex-grow flex flex-col min-h-screen bg-void-core/60">
        {/* Desktop and Mobile Navbar with Improved Spacing */}
        <nav className="bg-void-core/95 shadow-eclipse sticky top-0 z-50 border-b border-solar-flare/40">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo and title */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center gap-2">
                  <div className="relative h-10 w-10 overflow-hidden">
                    <motion.img 
                      src="/assets/app/app.png" 
                      alt="MetaForge" 
                      className="h-10 w-10"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/app/default.png';
                      }}
                    />
                  </div>
                  <span className="text-xl font-display tracking-tight text-solar-flare">MetaForge</span>
                </Link>
              </div>
              
              {/* Desktop navigation with improved spacing - using flex with justify-between */}
              <div className="hidden md:flex items-center flex-1 ml-2 mt-1 justify-between">
                {/* Left side dropdowns */}
                
                {/* Right side controls */}
                  <div className="flex items-center gap-3">
                    <RegionDropdown />
                    <AuthStatus />
                  </div>
                {/* Search bar with reduced width */}
                <div className="w-60 lg:w-72">
                  <SearchBar />
                </div>
              
                {/* Right side dropdown */} 
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                  <NavDropdown 
                    label="Tools" 
                    icon={Slack} 
                    items={statsAndTools} 
                    isActive={isStatsActive} 
                  />
                  
                  <NavDropdown 
                    label="Resources" 
                    icon={Book} 
                    items={resources} 
                    isActive={isResourcesActive} 
                  />
                  <NavDropdown 
                    label="Community" 
                    icon={Users} 
                    items={community} 
                    isActive={isCommunityActive} 
                  />
                </div>
                
                  
                </div>
              </div>  
              
              {/* Mobile menu button */}
              <div className="flex md:hidden">
                <motion.button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-corona-light hover:text-solar-flare hover:bg-eclipse-shadow/30"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="sr-only">Open menu</span>
                  {mobileMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu panel with improved animation and styling */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                className="md:hidden backdrop-filter backdrop-blur-md bg-eclipse-shadow/80"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <div className="px-2 pt-2 pb-3 space-y-1 border-t border-solar-flare/20">
                  {/* Tools Section */}
                  <div className="flex items-center justify-between">
                    <div className="px-3 py-2 font-medium text-solar-flare">Tools</div>
                  </div>
                  {statsAndTools.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        className={`block px-3 py-2 rounded-md text-sm font-medium ${
                          router.pathname === item.href
                            ? 'text-solar-flare bg-solar-flare/10 border-l-2 border-solar-flare'
                            : 'text-corona-light hover:bg-eclipse-shadow/30'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon && React.createElement(item.icon, { className: "h-4 w-4" })}
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Resources Section */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="px-3 py-2 font-medium text-solar-flare">Resources</div>
                  </div>
                  {resources.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + statsAndTools.length) * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        className={`block px-3 py-2 rounded-md text-sm font-medium ${
                          router.pathname === item.href
                            ? 'text-solar-flare bg-solar-flare/10 border-l-2 border-solar-flare'
                            : 'text-corona-light hover:bg-eclipse-shadow/30'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon && React.createElement(item.icon, { className: "h-4 w-4" })}
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Community Section */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="px-3 py-2 font-medium text-solar-flare">Community</div>
                  </div>
                  {community.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + statsAndTools.length + resources.length) * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        className={`block px-3 py-2 rounded-md text-sm font-medium ${
                          router.pathname === item.href || router.pathname.startsWith(item.href)
                            ? 'text-solar-flare bg-solar-flare/10 border-l-2 border-solar-flare'
                            : 'text-corona-light hover:bg-eclipse-shadow/30'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon && React.createElement(item.icon, { className: "h-4 w-4" })}
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Region & User Section */}
                  <div className="px-3 py-2 border-t border-solar-flare/20 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-solar-flare">Region</span>
                      <RegionDropdown />
                    </div>
                  </div>
                  
                  <div className="px-3 py-2 border-t border-solar-flare/20 mt-2">
                    <AuthStatus />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
        
        {/* Mobile search */}
        <div className="md:hidden px-4 py-2 bg-void-core/90 border-b border-solar-flare/30">
          <SearchBar />
        </div>
        
        <motion.main 
          className="max-w-7xl w-full mx-auto px-2 sm:px-4 py-6 sm:py-8"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {children}
        </motion.main>
        
        <footer className="bg-void-core/95 py-4 border-t border-solar-flare/30 text-center text-sm text-corona-light/70 mt-auto">
          <div className="max-w-7xl mx-auto px-4">
            <p>MetaForge is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
