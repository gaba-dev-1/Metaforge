import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

// RSO Client credentials - Use environment variables
const RSO_CLIENT_ID = process.env.RIOT_CLIENT_ID || '';
const RSO_CLIENT_SECRET = process.env.RIOT_CLIENT_SECRET || '';
const RSO_TOKEN_URL = 'https://auth.riotgames.com/token';
const REDIRECT_URI = 'https://metaforge.lol/auth/callback';

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30 // 30 days
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle token exchange with auth code
  if (req.method === 'POST') {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
      }
      
      if (!RSO_CLIENT_ID || !RSO_CLIENT_SECRET) {
        return res.status(500).json({ error: 'RSO client credentials are not configured' });
      }
      
      // Prepare the form data for token exchange
      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('code', code);
      formData.append('redirect_uri', REDIRECT_URI);
      
      // Exchange code for tokens using Basic auth with client ID and secret
      const authHeader = `Basic ${Buffer.from(`${RSO_CLIENT_ID}:${RSO_CLIENT_SECRET}`).toString('base64')}`;
      
      const tokenResponse = await fetch(RSO_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authHeader
        },
        body: formData
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        return res.status(tokenResponse.status).json({ error: `Failed to exchange code for tokens: ${errorText}` });
      }
      
      const tokenData = await tokenResponse.json();
      
      // Calculate token expiration
      const expiresAt = Date.now() + (tokenData.expires_in * 1000);
      
      // Set cookies
      res.setHeader('Set-Cookie', [
        serialize('access_token', tokenData.access_token, COOKIE_OPTIONS),
        serialize('refresh_token', tokenData.refresh_token, COOKIE_OPTIONS),
        serialize('id_token', tokenData.id_token, COOKIE_OPTIONS),
        serialize('expires_at', expiresAt.toString(), COOKIE_OPTIONS)
      ]);
      
      return res.status(200).json({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        idToken: tokenData.id_token,
        expiresAt
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } 
  // Handle token refresh
  else if (req.method === 'GET' && req.url?.includes('/refresh')) {
    try {
      const refreshToken = req.cookies.refresh_token;
      
      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token found' });
      }
      
      if (!RSO_CLIENT_ID || !RSO_CLIENT_SECRET) {
        return res.status(500).json({ error: 'RSO client credentials are not configured' });
      }
      
      // Prepare form data for refresh
      const formData = new URLSearchParams();
      formData.append('grant_type', 'refresh_token');
      formData.append('refresh_token', refreshToken);
      
      // Refresh tokens using Basic auth with client ID and secret
      const authHeader = `Basic ${Buffer.from(`${RSO_CLIENT_ID}:${RSO_CLIENT_SECRET}`).toString('base64')}`;
      
      const tokenResponse = await fetch(RSO_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authHeader
        },
        body: formData
      });
      
      if (!tokenResponse.ok) {
        // Clear cookies on refresh failure
        res.setHeader('Set-Cookie', [
          serialize('access_token', '', { ...COOKIE_OPTIONS, maxAge: 0 }),
          serialize('refresh_token', '', { ...COOKIE_OPTIONS, maxAge: 0 }),
          serialize('id_token', '', { ...COOKIE_OPTIONS, maxAge: 0 }),
          serialize('expires_at', '', { ...COOKIE_OPTIONS, maxAge: 0 })
        ]);
        
        return res.status(401).json({ error: 'Failed to refresh token' });
      }
      
      const tokenData = await tokenResponse.json();
      
      // Calculate token expiration
      const expiresAt = Date.now() + (tokenData.expires_in * 1000);
      
      // Set cookies
      res.setHeader('Set-Cookie', [
        serialize('access_token', tokenData.access_token, COOKIE_OPTIONS),
        serialize('refresh_token', tokenData.refresh_token, COOKIE_OPTIONS),
        serialize('id_token', tokenData.id_token, COOKIE_OPTIONS),
        serialize('expires_at', expiresAt.toString(), COOKIE_OPTIONS)
      ]);
      
      return res.status(200).json({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        idToken: tokenData.id_token,
        expiresAt
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error during token refresh' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
