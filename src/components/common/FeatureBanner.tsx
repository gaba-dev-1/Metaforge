import React, { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FeatureCardProps } from '@/types';

interface FeatureBannerProps {
  title: string;
  children?: ReactNode;
}

export function FeatureBanner({ title, children }: FeatureBannerProps) {
  return (
    <motion.div 
      className="feature-banner"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="flex justify-center items-center">
        <div className="flex items-center">
          <span className="text-lg text-corona-light ml-4 mt-1 font-display tracking-tight">{title}</span>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

export function FeatureCard({ title, icon, description, linkTo }: FeatureCardProps) {
  return (
    <Link href={linkTo}>
      <motion.div 
        className="feature-card group"
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 5px 15px -5px rgba(245, 158, 11, 0.15)"
        }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="relative p-3 flex flex-col h-full items-center text-center">
          <div className="flex justify-center">
            <div className="feature-hex-container">
              <svg 
                className="feature-hex-svg" 
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon 
                  points="50,0 100,25 100,75 50,100 0,75 0,25"
                  fill="hsla(27, 69.90%, 14.30%, 0.94)"
                  stroke="rgba(245, 158, 11, 0.5)" 
                  strokeWidth="2" 
                  className="transition-all group-hover:stroke-solar-flare"
                />
              </svg>
              
              <div className="feature-hex-content">
                {icon}
              </div>
            </div>
          </div>
          <h3 className="text-lg text-solar-flare mb-1 font-display tracking-tight">{title}</h3>
          <div className="text-xs text-corona-light/70 mt-auto group-hover:text-corona-light">{description}</div>
        </div>
      </motion.div>
    </Link>
  );
}

interface FeatureCardsContainerProps {
  children: ReactNode;
}

export function FeatureCardsContainer({ children }: FeatureCardsContainerProps) {
  return (
    <div className="feature-cards-container">
      {children}
    </div>
  );
}
