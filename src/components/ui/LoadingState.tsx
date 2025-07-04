import React from 'react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingState({ 
  fullScreen = false, 
  message, 
  size = 'md' 
}: LoadingStateProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5,
        ease: [0.2, 0.8, 0.2, 1]
      }
    }
  };

  if (fullScreen) {
    return (
      <motion.div 
        className="loading-overlay"
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
      >
        <div className="flex flex-col items-center">
          <motion.div 
            className={`loading-spinner ${sizes[size]}`} 
            variants={spinnerVariants}
            animate="animate"
          />
          {message && (
            <motion.p 
              className="mt-3 text-corona-light/80"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {message}
            </motion.p>
          )}
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="flex justify-center items-center py-6"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      <div className="flex flex-col items-center">
        <motion.div 
          className={`loading-spinner ${sizes[size]}`}
          variants={spinnerVariants}
          animate="animate"
        />
        {message && (
          <motion.p 
            className="mt-3 text-corona-light/80"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
