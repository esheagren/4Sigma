// OAuth utility functions for future integration
// This file provides the structure for adding OAuth providers

export interface OAuthProvider {
  name: string;
  clientId: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
}

export interface OAuthUser {
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: string;
  providerId: string;
}

// OAuth provider configurations
export const oauthProviders: Record<string, OAuthProvider> = {
  google: {
    name: 'Google',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/callback/google`,
    scope: ['openid', 'email', 'profile'],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  },
  github: {
    name: 'GitHub',
    clientId: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/callback/github`,
    scope: ['user:email'],
    authUrl: 'https://github.com/login/oauth/authorize',
  },
};

// Generate OAuth authorization URL
export const getOAuthUrl = (providerName: string): string => {
  const provider = oauthProviders[providerName];
  if (!provider) {
    throw new Error(`Unknown OAuth provider: ${providerName}`);
  }

  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: provider.redirectUri,
    scope: provider.scope.join(' '),
    response_type: 'code',
    state: generateRandomState(), // CSRF protection
  });

  return `${provider.authUrl}?${params.toString()}`;
};

// Generate random state for CSRF protection
const generateRandomState = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Handle OAuth callback (to be called from callback page)
export const handleOAuthCallback = async (
  provider: string, 
  code: string, 
  state: string
): Promise<{ user: OAuthUser; token: string }> => {
  try {
    // This would typically exchange the code for user data
    // For now, this is a placeholder structure
    const response = await fetch(`http://localhost:3000/api/auth/oauth/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      throw new Error('OAuth authentication failed');
    }

    return await response.json();
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
};

// Initiate OAuth flow
export const initiateOAuth = (providerName: string): void => {
  try {
    const authUrl = getOAuthUrl(providerName);
    window.location.href = authUrl;
  } catch (error) {
    console.error('Failed to initiate OAuth:', error);
    throw error;
  }
}; 