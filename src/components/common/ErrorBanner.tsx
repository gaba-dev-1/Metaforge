import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ErrorState } from '@/types';

export function ErrorBanner({ error, onRetry }: { error: ErrorState, onRetry?: () => void }) {
  if (!error.hasError) return null;
  
  const errorMessage = error.error?.message || 'An error occurred';
  const errorType = error.error?.type || 'unknown';
  const timeAgo = error.error?.timestamp 
    ? getTimeAgo(error.error.timestamp) 
    : '';
  
  return (
    <div className="error-banner">
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-red-300" size={18} />
        <div>
          <p className="text-sm font-medium">
            {errorType === 'timeout' ? 'Request timed out' : 
             errorType === 'rate-limit' ? 'Rate limit exceeded' : 
             errorType === 'server' ? 'Server error' : 
             'Connection error'}
          </p>
          <p className="text-xs text-red-300/90">
            {errorMessage} {timeAgo && `(${timeAgo})`}
          </p>
        </div>
      </div>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-red-700/50 hover:bg-red-700/70 px-3 py-1 rounded flex items-center gap-1 text-sm"
        >
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

// Helper function to format timestamp to readable time ago
function getTimeAgo(date: Date | string | number): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  return Math.floor(seconds) + " seconds ago";
}
