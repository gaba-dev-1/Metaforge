import React from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { getRSOAuthUrl } from '@/utils/auth';

interface LoginButtonProps {
  className?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outlined';
}

export default function LoginButton({ 
  className = '', 
  label = 'Sign in with Riot', 
  size = 'md',
  variant = 'primary'
}: LoginButtonProps) {
  const redirectUrl = getRSOAuthUrl();
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const variantClasses = {
    primary: 'bg-solar-flare/90 hover:bg-solar-flare text-void-core border-solar-flare',
    secondary: 'bg-eclipse-shadow/30 hover:bg-eclipse-shadow/50 text-corona-light border-solar-flare/40',
    outlined: 'bg-transparent hover:bg-solar-flare/10 text-solar-flare border-solar-flare/40'
  };
  
  const buttonClasses = `
    flex items-center justify-center gap-2 
    rounded-md border transition-all
    ${sizeClasses[size]} 
    ${variantClasses[variant]}
    ${className}
  `;
  
  const handleLogin = () => {
    window.location.href = redirectUrl;
  };
  
  return (
    <motion.button
      onClick={handleLogin}
      className={buttonClasses}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <LogIn size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />
      <span>{label}</span>
    </motion.button>
  );
}
