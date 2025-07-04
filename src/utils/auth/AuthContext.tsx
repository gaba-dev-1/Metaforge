import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  checkAuthStatus, 
  logout as logoutUser, 
  getUserData, 
  refreshTokens, 
  isTokenExpired 
} from '@/utils/auth';
import { AuthState, RiotUser } from '@/types/auth';

// Initial auth state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null
};

// Create a dummy user for the default context
const dummyUser: RiotUser = {
  puuid: "",
  gameName: "",
  tagLine: ""
};

// Create context
const AuthContext = createContext<{
  auth: AuthState;
  login: () => void;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<RiotUser>;
}>({
  auth: initialState,
  login: () => {},
  logout: async () => {},
  refreshUserData: async () => {
    throw new Error('Not implemented');
    return dummyUser;
  }
});

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(initialState);
  const router = useRouter();

  // Check auth status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await checkAuthStatus();
        
        if (user) {
          setAuth({
            isAuthenticated: true,
            isLoading: false,
            user,
            error: null
          });
          
          // Check if token needs refreshing
          if (isTokenExpired()) {
            try {
              await refreshTokens();
            } catch (refreshError) {
              // Continue with session as we still have a valid user
            }
          }
        } else {
          setAuth({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: null
          });
        }
      } catch (error) {
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: error instanceof Error ? error.message : 'Authentication check failed'
        });
      }
    };

    checkAuth();
    
    // Check authentication status every 5 minutes to handle token refresh
    const intervalId = setInterval(checkAuth, 5 * 60 * 1000);
    
    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Redirect to login
  const login = useCallback(() => {
    // Store the current path for redirect after login
    const currentPath = router.asPath;
    if (currentPath !== '/login' && currentPath !== '/auth/callback' && !currentPath.startsWith('/api/')) {
      localStorage.setItem('auth_redirect', currentPath);
    }
    
    router.push('/login');
  }, [router]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });
      router.push('/');
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout failed'
      }));
    }
  }, [router]);

  // Refresh user data
  const refreshUserData = useCallback(async (): Promise<RiotUser> => {
    try {
      const user = await getUserData();
      
      setAuth(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        error: null
      }));
      
      return user;
    } catch (error) {
      // If unauthorized, reset auth state
      if (error instanceof Error && error.message.includes('401')) {
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: error.message
        });
      } else {
        setAuth(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to refresh user data'
        }));
      }
      
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
