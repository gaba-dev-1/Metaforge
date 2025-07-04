import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/auth/AuthContext';
import { getRSOAuthUrl, handleAuthRedirect } from '@/utils/auth';

export function useRSOAuth() {
  const { auth, login, logout } = useAuth();
  const router = useRouter();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  
  // Set up Riot Sign-On URL
  useEffect(() => {
    setRedirectUrl(getRSOAuthUrl());
  }, []);
  
  // Handle redirect after login if needed
  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      const redirectPath = handleAuthRedirect();
      if (redirectPath) {
        router.push(redirectPath);
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, router]);
  
  // Initiate login flow
  const initiateLogin = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      login();
    }
  };
  
  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    error: auth.error,
    login: initiateLogin,
    logout,
    redirectUrl
  };
}
