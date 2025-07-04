import React from 'react';

type SpinnerSize = 'small' | 'medium' | 'large';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  message?: string;
}

export function LoadingSpinner({ size = 'medium', message = '' }: LoadingSpinnerProps) {
  const sizes = {
    small: 'h-4 w-4',
    medium: 'h-10 w-10',
    large: 'h-16 w-16'
  };
  
  const spinnerSize = sizes[size] || sizes.medium;
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-gold ${spinnerSize}`}></div>
      {message && <p className="mt-2 text-sm text-cream/70">{message}</p>}
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="loading-overlay">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        <p className="mt-3 text-cream/80">{message}</p>
      </div>
    </div>
  );
}
