import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
}

export default function Card({ 
  children, 
  className = '', 
  animate = false,
  delay = 0
}: CardProps) {
  if (animate) {
    return (
      <motion.div 
        className={`card w-full ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.4,
          ease: [0.2, 0.8, 0.2, 1],
          delay: delay
        }}
      >
        {children}
      </motion.div>
    );
  }
  
  return <div className={`card w-full ${className}`}>{children}</div>;
}
