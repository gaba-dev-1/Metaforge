import { TokenData, RiotUser } from '@/types/auth';

// RSO Client credentials
const RSO_CLIENT_ID = process.env.NEXT_PUBLIC_RIOT_CLIENT_ID;
const REDIRECT_URI = 'https://metaforge.lol/auth/callback';

// API endpoints
const TOKEN_ENDPOINT = '/api/auth/token';
const LOGOUT_ENDPOINT = '/api/auth/logout';
const USER_ENDPOINT = '/api/auth/user';

/**
 * Generate the Riot Sign-On authorization URL
 */
export function getRSOAuthUrl(): string {
  // Required scopes for Riot authentication
  const scope = 'openid offline_access';
  
  if (!RSO_CLIENT_ID) {
    console.error('Missing NEXT_PUBLIC_RIOT_CLIENT_ID environment variable');
    return '#error-missing-client-id';
  }
  
  const params = new URLSearchParams({
    client_id: RSO_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: scope
  });
  
  return `https://auth.riotgames.com/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<TokenData> {
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      let errorMsg = 'Failed to exchange code for tokens';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMsg = errorData.error;
        }
      } catch (e) {
        // If JSON parsing fails, use the raw text
        errorMsg = responseText || errorMsg;
      }
      
      throw new Error(errorMsg);
    }
    
    const tokenData = await response.json();
    
    // Store token expiration in localStorage for client-side checks
    if (typeof window !== 'undefined' && tokenData.expiresAt) {
      localStorage.setItem('expires_at', tokenData.expiresAt.toString());
    }
    
    return tokenData;
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
}

/**
 * Get user data using tokens
 */
export async function getUserData(): Promise<RiotUser> {
  try {
    const response = await fetch(USER_ENDPOINT);
    
    if (!response.ok) {
      const responseText = await response.text();
      let errorMsg = 'Failed to fetch user data';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMsg = errorData.error;
        }
      } catch (e) {
        // If JSON parsing fails, use the raw text
        errorMsg = responseText || errorMsg;
      }
      
      throw new Error(errorMsg);
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Get user data error:', error);
    throw error;
  }
}

/**
 * Refresh tokens when they expire
 */
export async function refreshTokens(): Promise<TokenData> {
  try {
    const response = await fetch(`${TOKEN_ENDPOINT}/refresh`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      let errorMsg = 'Failed to refresh tokens';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMsg = errorData.error;
        }
      } catch (e) {
        // If JSON parsing fails, use the raw text
        errorMsg = responseText || errorMsg;
      }
      
      throw new Error(errorMsg);
    }
    
    const tokenData = await response.json();
    
    // Update token expiration in localStorage
    if (typeof window !== 'undefined' && tokenData.expiresAt) {
      localStorage.setItem('expires_at', tokenData.expiresAt.toString());
    }
    
    return tokenData;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

/**
 * Logout and clear tokens
 */
export async function logout(): Promise<void> {
  try {
    await fetch(LOGOUT_ENDPOINT, {
      method: 'POST'
    });
    
    // Clear any local storage related to auth
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_redirect');
      localStorage.removeItem('expires_at');
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * Check if the current session is authenticated
 */
export async function checkAuthStatus(): Promise<RiotUser | null> {
  try {
    const response = await fetch(USER_ENDPOINT);
    
    if (!response.ok) {
      return null;
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Auth status check error:', error);
    return null;
  }
}

/**
 * Handle initial page load redirect after authentication
 */
export function handleAuthRedirect(): string | null {
  if (typeof window === 'undefined') return null;
  
  const redirectPath = localStorage.getItem('auth_redirect');
  if (redirectPath) {
    localStorage.removeItem('auth_redirect');
    return redirectPath;
  }
  
  return null;
}

/**
 * Save redirect path for after authentication
 */
export function setAuthRedirect(path: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_redirect', path);
}

/**
 * Get token expiration status
 */
export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;
  
  const expiresAt = localStorage.getItem('expires_at');
  if (!expiresAt) return true;
  
  return parseInt(expiresAt) < Date.now();
}
