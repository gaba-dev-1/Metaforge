import React from 'react';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <motion.div 
      className={`error-banner ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <span>{message || 'An error occurred. Please try again.'}</span>
      {onRetry && (
        <motion.button 
          onClick={onRetry} 
          className="px-3 py-1 bg-void-core/60 hover:bg-void-core border border-solar-flare/40 rounded-lg text-sm text-corona-light"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Retry
        </motion.button>
      )}
    </motion.div>
  );
}
