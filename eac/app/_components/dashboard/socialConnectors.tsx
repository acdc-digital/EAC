// Social Media Connectors Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashboard/socialConnectors.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useSocialConnectionSync } from "@/lib/hooks/useSocialConnectionSync";
import { useMutation } from "convex/react";
import { AlertCircle, CheckCircle, Facebook, Instagram, MessageSquare, Twitter } from "lucide-react";
import { useEffect, useState } from "react";

interface SocialAccount {
  platform: 'facebook' | 'instagram' | 'twitter' | 'reddit';
  username: string;
  connected: boolean;
  lastSync?: Date;
  accessToken?: string;
  _id?: string;
}

interface SocialConnection {
  _id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'reddit';
  username: string;
  userId: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  isActive: boolean;
}

type SocialFormData = {
  facebook: { username: string; apiKey: string; accessToken: string };
  instagram: { username: string; apiKey: string; accessToken: string };
  twitter: { username: string; clientId: string; clientSecret: string; apiTier: string };
  reddit: { username: string; clientId: string; clientSecret: string; userAgent: string };
};

export function SocialConnectors() {
  // Use the centralized social connection sync hook
  const { connections, isLoading } = useSocialConnectionSync();
  
  // Convex mutations
  const createSocialConnection = useMutation(api.reddit.createSocialConnection);
  const disconnectSocialConnection = useMutation(api.reddit.deleteSocialConnection);
  const disconnectXConnection = useMutation(api.x.deleteXConnection);
  
  // Local state
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { platform: 'facebook', username: '', connected: false },
    { platform: 'instagram', username: '', connected: false },
    { platform: 'twitter', username: '', connected: false },
    { platform: 'reddit', username: '', connected: false },
  ]);

  // Handle OAuth callback success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setError(null);
      
      // Show success message and note that connection should update
      console.log('✅ OAuth authentication successful! Connection should update automatically.');
    }
    
    if (urlParams.get('error')) {
      const errorType = urlParams.get('error');
      setError(`Authentication failed: ${errorType}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const [formData, setFormData] = useState<SocialFormData>({
    facebook: { username: '', apiKey: '', accessToken: '' },
    instagram: { username: '', apiKey: '', accessToken: '' },
    twitter: { username: '', clientId: '', clientSecret: '', apiTier: 'free' },
    reddit: { username: '', clientId: '', clientSecret: '', userAgent: '' },
  });

  const platformIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    reddit: MessageSquare,
  };

  const platformNames = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'X (Twitter)',
    reddit: 'Reddit',
  };

  const handleConnect = async (platform: keyof typeof formData) => {
    if (platform === 'reddit') {
      try {
        setIsConnecting(true);
        setError(null);
        
        const redditData = formData.reddit;
        
        // Generate user agent if not provided
        const userAgent = redditData.userAgent || `EACDashboard/1.0 by ${redditData.username}`;
        
        // Call Convex mutation directly
        const connectionId = await createSocialConnection({
          userId: 'temp-user-id', // TODO: Replace with actual user ID
          platform: 'reddit',
          username: redditData.username,
          clientId: redditData.clientId,
          clientSecret: redditData.clientSecret,
          userAgent: userAgent,
        });
        
        console.log('Reddit connection created successfully:', connectionId);
        
        // Update local UI state
        setAccounts(prev =>
          prev.map(acc =>
            acc.platform === platform
              ? { ...acc, connected: true, username: redditData.username, lastSync: new Date() }
              : acc
          )
        );
        
      } catch (error) {
        console.error('Failed to connect Reddit:', error);
        setError(error instanceof Error ? error.message : 'Failed to connect Reddit');
      } finally {
        setIsConnecting(false);
      }
    } else if (platform === 'twitter') {
      try {
        setIsConnecting(true);
        setError(null);
        
        const twitterData = formData.twitter;
        
        // Call Convex mutation to create Twitter connection
        const connectionId = await createSocialConnection({
          userId: 'temp-user-id', // TODO: Replace with actual user ID
          platform: 'twitter',
          username: twitterData.username,
          // Use Twitter-specific fields
          apiKey: twitterData.clientId, // Will map to twitterClientId in backend
          apiSecret: twitterData.clientSecret, // Will map to twitterClientSecret in backend
        });
        
        console.log('Twitter connection created successfully:', connectionId);
        
        // Update local UI state
        setAccounts(prev =>
          prev.map(acc =>
            acc.platform === platform
              ? { ...acc, connected: true, username: twitterData.username, lastSync: new Date() }
              : acc
          )
        );
        
      } catch (error) {
        console.error('Failed to connect Twitter:', error);
        setError(error instanceof Error ? error.message : 'Failed to connect Twitter');
      } finally {
        setIsConnecting(false);
      }
    } else {
      // Simulate connection for other platforms
      setAccounts(prev =>
        prev.map(acc =>
          acc.platform === platform
            ? { ...acc, connected: true, username: formData[platform].username, lastSync: new Date() }
            : acc
        )
      );
    }
  };

  const handleStartRedditOAuth = async (connectionId: string) => {
    try {
      // Get Reddit connection from Convex to get the client ID
      const connection = connections?.find(c => c._id === connectionId);
      const clientId = connection?.clientId || formData.reddit.clientId;
      
      if (!clientId) {
        alert('Please enter your Reddit Client ID first');
        return;
      }

      // Use environment variable to ensure consistency with backend
      const redirectUri = 'http://localhost:3000/api/auth/reddit/callback'; // Match the actual dev server port
      console.log('🔗 Starting OAuth with redirect URI:', redirectUri);
      
      const scope = 'submit,identity,read'; // Added 'read' scope for analytics data
      const state = connectionId; // Pass connection ID as state
      
      const authUrl = new URL('https://www.reddit.com/api/v1/authorize');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('duration', 'permanent');
      authUrl.searchParams.set('scope', scope);
      
      // Redirect to Reddit authorization
      window.location.href = authUrl.toString();

    } catch (error) {
      console.error('Failed to start Reddit OAuth:', error);
      setError(error instanceof Error ? error.message : 'Failed to start OAuth');
    }
  };

  const handleStartXOAuth = async (connectionId: string) => {
    try {
      // Get X connection from Convex to get the client ID
      const connection = connections?.find((c: any) => c._id === connectionId);
      const clientId = connection?.twitterClientId || connection?.apiKey || formData.twitter.clientId;
      
      if (!clientId) {
        alert('Please enter your X (Twitter) Client ID first');
        return;
      }

      // Use environment variable to ensure consistency with backend
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`;
      console.log('🐦 Starting X OAuth with redirect URI:', redirectUri);
      
      const scope = 'tweet.read tweet.write users.read like.write offline.access'; // Complete scopes for dashboard
      
      // Generate PKCE challenge (simplified for demo - should be more secure)
      const codeVerifier = btoa(Math.random().toString()).substring(0, 43);
      const codeChallenge = codeVerifier; // In production, use SHA256 hash
      
      // Pass both connection ID and code verifier in state parameter
      const state = JSON.stringify({
        connectionId: connectionId,
        codeVerifier: codeVerifier
      });
      
      const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', scope);
      authUrl.searchParams.set('state', encodeURIComponent(state));
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'plain'); // Simplified for demo
      
      console.log('🐦 OAuth URL:', authUrl.toString());
      console.log('🐦 State being sent:', state);
      
      // Redirect to X authorization
      window.location.href = authUrl.toString();

    } catch (error) {
      console.error('Failed to start X OAuth:', error);
      setError(error instanceof Error ? error.message : 'Failed to start X OAuth');
    }
  };

  const handleDisconnect = async (platform: keyof typeof formData) => {
    try {
      const connection = connections?.find(c => c.platform === platform);
      
      if (connection) {
        if (platform === 'reddit') {
          await disconnectSocialConnection({ connectionId: connection._id });
        } else if (platform === 'twitter') {
          await disconnectXConnection({ connectionId: connection._id });
        }
        
        // Clear the form data for the platform
        setFormData(prev => ({
          ...prev,
          [platform]: platform === 'reddit' 
            ? { username: '', clientId: '', clientSecret: '', userAgent: '' }
            : platform === 'twitter'
            ? { username: '', clientId: '', clientSecret: '', apiTier: 'free' }
            : prev[platform]
        }));
        
        console.log(`✅ Successfully disconnected ${platform}`);
      }
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
    }
  };

  const updateFormData = (platform: keyof typeof formData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] overflow-auto">
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Social Media Connectors</h1>
          <p className="text-[#858585]">
            Connect your social media accounts to manage posts and analytics from one dashboard.
          </p>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-500 text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-400 text-sm"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(formData).map(([platform, data]) => {
            const typedPlatform = platform as keyof typeof formData;
            // Use Convex data for Reddit and Twitter, local state for others
            const convexConnection = connections?.find((c: any) => c.platform === typedPlatform);
            const account = (typedPlatform === 'reddit' || typedPlatform === 'twitter') && convexConnection
              ? {
                  platform: typedPlatform,
                  username: convexConnection.username,
                  connected: true,
                  accessToken: typedPlatform === 'twitter' 
                    ? convexConnection.twitterAccessToken 
                    : convexConnection.accessToken,
                  _id: convexConnection._id,
                  lastSync: convexConnection.updatedAt ? new Date(convexConnection.updatedAt) : undefined
                }
              : accounts.find(acc => acc.platform === typedPlatform);
            
            const Icon = platformIcons[typedPlatform];
            
            return (
              <Card key={platform} className="bg-[#2d2d2d] border-[#454545] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-[#4a9eff]" />
                  <h3 className="text-lg font-semibold">{platformNames[typedPlatform]}</h3>
                  {account?.connected ? (
                    account.accessToken ? (
                      <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-500 ml-auto" />
                    )
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#858585] ml-auto" />
                  )}
                </div>

                {account?.connected ? (
                  <div className="space-y-3">
                    <div className="bg-[#1e1e1e] p-3 rounded">
                      <p className="text-sm text-[#cccccc]">
                        <strong>Connected as:</strong> @{account.username}
                      </p>
                      <p className="text-xs text-[#858585] mt-1">
                        <strong>Status:</strong>{' '}
                        {account.accessToken ? (
                          <span className="text-green-500">Authorized for posting</span>
                        ) : (
                          <span className="text-green-500">Connection created, authorization required</span>
                        )}
                      </p>
                      {account.lastSync && (
                        <p className="text-xs text-[#858585] mt-1">
                          Last sync: {account.lastSync instanceof Date ? account.lastSync.toLocaleString() : String(account.lastSync)}
                        </p>
                      )}
                    </div>
                    
                    {/* Show OAuth authorization button if not yet authorized */}
                    {!account?.accessToken && typedPlatform === 'reddit' && account?._id && (
                      <Button
                        onClick={() => handleStartRedditOAuth(account._id)}
                        className="w-full bg-[#ff4500] hover:bg-[#e03d00] text-white"
                        disabled={isConnecting}
                      >
                        Authorize Reddit Access
                      </Button>
                    )}
                    
                    {/* Show authenticated status if authorized */}
                    {account?.accessToken && typedPlatform === 'reddit' && (
                      <div className="space-y-2">
                        <Button
                          disabled
                          className="w-full bg-green-600 text-white opacity-60 cursor-not-allowed"
                        >
                          ✓ Authenticated
                        </Button>
                        <Button
                          onClick={() => handleStartRedditOAuth(account._id)}
                          variant="outline"
                          className="w-full text-xs border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
                          disabled={isConnecting}
                        >
                          Re-authorize Access
                        </Button>
                      </div>
                    )}
                    
                    {/* Show OAuth authorization button for X if not yet authorized */}
                    {!account?.accessToken && typedPlatform === 'twitter' && account?._id && (() => {
                      // Debug logging - execute as side effect
                      console.log('🐦 Twitter Authorization Button Debug:', {
                        showButton: true,
                        hasAccessToken: !!account?.accessToken,
                        isTwitter: typedPlatform === 'twitter',
                        hasAccountId: !!account?._id,
                        accountId: account?._id,
                        account
                      });
                      
                      return (
                        <Button
                          onClick={() => handleStartXOAuth(account._id)}
                          className="w-full bg-[#1da1f2] hover:bg-[#1a91da] text-white"
                          disabled={isConnecting}
                        >
                          Authorize X (Twitter) Access
                        </Button>
                      );
                    })()}
                    
                    {/* Show authenticated status if authorized for X */}
                    {account?.accessToken && typedPlatform === 'twitter' && (
                      <div className="space-y-2">
                        <Button
                          disabled
                          className="w-full bg-green-600 text-white opacity-60 cursor-not-allowed"
                        >
                          ✓ Authenticated
                        </Button>
                        <Button
                          onClick={() => handleStartXOAuth(account._id)}
                          variant="outline"
                          className="w-full text-xs border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
                          disabled={isConnecting}
                        >
                          Re-authorize Access
                        </Button>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => handleDisconnect(typedPlatform)}
                      variant="outline"
                      className="w-full bg-transparent border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`${platform}-username`} className="text-sm text-[#cccccc]">
                        Username
                      </Label>
                      <Input
                        id={`${platform}-username`}
                        value={data.username}
                        onChange={(e) => updateFormData(typedPlatform, 'username', e.target.value)}
                        placeholder={`Your ${platformNames[typedPlatform]} username`}
                        className="mt-1 bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                      />
                    </div>

                    {platform === 'reddit' ? (
                      <>
                        <div>
                          <Label htmlFor={`${platform}-client-id`} className="text-sm text-[#cccccc]">
                            Client ID
                          </Label>
                          <Input
                            id={`${platform}-client-id`}
                            value={(data as { clientId: string }).clientId}
                            onChange={(e) => updateFormData(typedPlatform, 'clientId', e.target.value)}
                            placeholder="Reddit App Client ID"
                            className="mt-1 bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${platform}-client-secret`} className="text-sm text-[#cccccc]">
                            Client Secret
                          </Label>
                          <Input
                            id={`${platform}-client-secret`}
                            type="password"
                            value={(data as { clientSecret: string }).clientSecret}
                            onChange={(e) => updateFormData(typedPlatform, 'clientSecret', e.target.value)}
                            placeholder="Reddit App Client Secret"
                            className="mt-1 bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${platform}-user-agent`} className="text-sm text-[#cccccc]">
                            User Agent (Optional)
                          </Label>
                          <Input
                            id={`${platform}-user-agent`}
                            value={(data as { userAgent: string }).userAgent}
                            onChange={(e) => updateFormData(typedPlatform, 'userAgent', e.target.value)}
                            placeholder="EACDashboard/1.0 by your_username"
                            className="mt-1 bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                          />
                        </div>
                      </>
                    ) : platform === 'twitter' ? (
                      <>
                        <div>
                          <Label htmlFor={`${platform}-client-id`} className="text-sm text-[#cccccc]">
                            Client ID
                          </Label>
                          <Input
                            id={`${platform}-client-id`}
                            value={(data as { clientId: string }).clientId}
                            onChange={(e) => updateFormData(typedPlatform, 'clientId', e.target.value)}
                            placeholder="X (Twitter) Client ID from Developer Portal"
                            className="mt-1 bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${platform}-client-secret`} className="text-sm text-[#cccccc]">
                            Client Secret
                          </Label>
                          <Input
                            id={`${platform}-client-secret`}
                            type="password"
                            value={(data as { clientSecret: string }).clientSecret}
                            onChange={(e) => updateFormData(typedPlatform, 'clientSecret', e.target.value)}
                            placeholder="X (Twitter) Client Secret from Developer Portal"
                            className="mt-1 bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${platform}-api-tier`} className="text-sm text-[#cccccc]">
                            API Tier
                          </Label>
                          <select
                            id={`${platform}-api-tier`}
                            value={(data as { apiTier: string }).apiTier}
                            onChange={(e) => updateFormData(typedPlatform, 'apiTier', e.target.value)}
                            className="mt-1 w-full px-3 py-2 bg-[#1e1e1e] border border-[#454545] text-[#cccccc] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            aria-label="X API Tier Selection"
                          >
                            <option value="free">Free</option>
                            <option value="basic">Basic ($100/month)</option>
                            <option value="pro">Pro ($5,000/month)</option>
                          </select>
                          <p className="text-xs text-[#888] mt-1">
                            Select your X API subscription tier for rate limiting
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor={`${platform}-api-key`} className="text-sm text-[#cccccc]">
                            API Key
                          </Label>
                          <Input
                            id={`${platform}-api-key`}
                            type="password"
                            value={(data as { apiKey: string }).apiKey}
                            onChange={(e) => updateFormData(typedPlatform, 'apiKey', e.target.value)}
                            placeholder={`${platformNames[typedPlatform]} API Key`}
                            className="mt-1 bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${platform}-access-token`} className="text-sm text-[#cccccc]">
                            Access Token
                          </Label>
                          <Input
                            id={`${platform}-access-token`}
                            type="password"
                            value={(data as { accessToken: string }).accessToken}
                            onChange={(e) => updateFormData(typedPlatform, 'accessToken', e.target.value)}
                            placeholder={`${platformNames[typedPlatform]} Access Token`}
                            className="mt-1 bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
                          />
                        </div>
                      </>
                    )}

                    {/* Special handling for Reddit OAuth flow */}
                    {platform === 'reddit' ? (
                      <div className="space-y-3">
                        <Button
                          onClick={() => handleConnect(typedPlatform)}
                          className="w-full bg-[#4a9eff] hover:bg-[#357abd] text-white"
                          disabled={
                            isConnecting ||
                            !data.username ||
                            !(data as { clientId: string }).clientId ||
                            !(data as { clientSecret: string }).clientSecret
                          }
                        >
                          {isConnecting ? 'Creating...' : 'Create Reddit Connection'}
                        </Button>
                        
                        {/* OAuth Authorization Button - only show after connection is created */}
                        {connections?.find((c: any) => c.platform === 'reddit') && (
                          <Button
                            onClick={() => {
                              const redditConnection = connections.find((c: any) => c.platform === 'reddit');
                              if (redditConnection) {
                                handleStartRedditOAuth(redditConnection._id);
                              }
                            }}
                            className="w-full bg-[#ff4500] hover:bg-[#e03d00] text-white"
                            disabled={isConnecting}
                          >
                            Authorize Reddit Access
                          </Button>
                        )}
                      </div>
                    ) : platform === 'twitter' ? (
                      <div className="space-y-3">
                        <Button
                          onClick={() => handleConnect(typedPlatform)}
                          className="w-full bg-[#4a9eff] hover:bg-[#357abd] text-white"
                          disabled={
                            isConnecting ||
                            !data.username ||
                            !(data as { clientId: string }).clientId ||
                            !(data as { clientSecret: string }).clientSecret
                          }
                        >
                          {isConnecting ? 'Creating...' : 'Create X (Twitter) Connection'}
                        </Button>
                        
                        {/* OAuth Authorization Button - show when connection exists */}
                        {connections?.find((c: any) => c.platform === 'twitter') && (
                          <Button
                            onClick={() => {
                              const twitterConnection = connections.find((c: any) => c.platform === 'twitter');
                              if (twitterConnection) {
                                handleStartXOAuth(twitterConnection._id);
                              }
                            }}
                            className="w-full bg-[#1da1f2] hover:bg-[#1a91da] text-white"
                            disabled={isConnecting}
                          >
                            Authorize X (Twitter) Access
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleConnect(typedPlatform)}
                        className="w-full bg-[#4a9eff] hover:bg-[#357abd] text-white"
                        disabled={
                          !data.username ||
                          !(data as { apiKey: string }).apiKey
                        }
                      >
                        Connect {platformNames[typedPlatform]}
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-8 bg-[#2d2d2d] border border-[#454545] rounded p-4">
          <h3 className="text-lg font-semibold mb-3 text-[#cccccc]">Getting Started</h3>
          <div className="space-y-2 text-sm text-[#858585]">
            <p>• Create developer applications on each platform to get API credentials</p>
            <p>• For Facebook/Instagram: Visit Facebook Developers Console</p>
            <p>• For X (Twitter): Visit Twitter Developer Portal</p>
            <p>• For Reddit: Visit Reddit App Preferences</p>
            <p>• Keep your credentials secure and never share them publicly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
