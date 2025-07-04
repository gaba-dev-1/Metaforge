import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/utils/auth/AuthContext';
import LoginButton from './LoginButton';

interface AuthStatusProps {
  showProfileButton?: boolean;
}

export default function AuthStatus({ showProfileButton = true }: AuthStatusProps) {
  const { auth, logout } = useAuth();
  const { isAuthenticated, isLoading, user } = auth;
  
  if (isLoading) {
    return (
      <div className="h-8 w-20 bg-eclipse-shadow/30 animate-pulse rounded-md"></div>
    );
  }
  
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        {showProfileButton && (
          <Link href="/profile">
            <motion.button
              className="flex items-center justify-center p-2 rounded-md text-corona-light hover:bg-eclipse-shadow/30 border border-solar-flare/20 hover:border-solar-flare/40 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User size={16} />
            </motion.button>
          </Link>
        )}
        
        <motion.button
          onClick={() => logout()}
          className="flex items-center justify-center p-2 rounded-md text-corona-light hover:bg-eclipse-shadow/30 border border-solar-flare/20 hover:border-solar-flare/40 transition-all hover:text-solar-flare"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={16} />
        </motion.button>
      </div>
    );
  }
  
  return (
    <LoginButton 
      size="sm" 
      variant="outlined"
      label="Sign In"
    />
  );
}
