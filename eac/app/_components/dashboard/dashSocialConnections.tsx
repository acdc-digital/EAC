// Social Connections Console Panel Component
// Displays social media connection management in the sidebar panel

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { useSocialConnectionSync } from "@/lib/hooks/useSocialConnectionSync";
import { useEditorStore } from "@/store";
import { useConvexAuth, useMutation } from "convex/react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Contact,
  Facebook,
  Instagram,
  Linkedin,
  MessageSquare,
  Music,
  Twitter
} from "lucide-react";
import { useEffect, useState } from "react";

interface SocialFormData {
  facebook: { username: string; apiKey: string; accessToken: string };
  instagram: { username: string; apiKey: string; accessToken: string };
  twitter: { username: string; clientId: string; clientSecret: string; apiTier: string };
  reddit: { username: string; clientId: string; clientSecret: string; userAgent: string };
  linkedin: { username: string; clientId: string; clientSecret: string; accessToken: string };
  tiktok: { username: string; clientKey: string; clientSecret: string; accessToken: string };
}

export function DashSocialConnections() {
  const { isAuthenticated } = useConvexAuth();
  const { connections, isLoading } = useSocialConnectionSync();
  const { openSpecialTab } = useEditorStore();
  
  // Convex mutations
  const createSocialConnection = useMutation(api.reddit.createSocialConnection);
  const disconnectSocialConnection = useMutation(api.reddit.deleteSocialConnection);
  const disconnectXConnection = useMutation(api.x.deleteXConnection);
  
  // Local state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isConnecting, setIsConnecting] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string | null>(null);
  const [pendingTabOpen, setPendingTabOpen] = useState<string | null>(null);
  const [pendingTabClose, setPendingTabClose] = useState<string | null>(null);

  const [formData, setFormData] = useState<SocialFormData>({
    facebook: { username: '', apiKey: '', accessToken: '' },
    instagram: { username: '', apiKey: '', accessToken: '' },
    twitter: { username: '', clientId: '', clientSecret: '', apiTier: 'free' },
    reddit: { username: '', clientId: '', clientSecret: '', userAgent: '' },
    linkedin: { username: '', clientId: '', clientSecret: '', accessToken: '' },
    tiktok: { username: '', clientKey: '', clientSecret: '', accessToken: '' },
  });

  const platformIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    reddit: MessageSquare,
    linkedin: Linkedin,
    tiktok: Music,
  };

  const platformNames = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'X (Twitter)',
    reddit: 'Reddit',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
  };

  const platformColors = {
    facebook: '#1877f2',
    instagram: '#e4405f',
    twitter: '#1da1f2',
    reddit: '#ff4500',
    linkedin: '#0a66c2',
    tiktok: '#000000',
  };

  // Handle OAuth callback success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      window.history.replaceState({}, document.title, window.location.pathname);
      setError(null);
      console.log('✅ OAuth authentication successful!');
    }
    
    if (urlParams.get('error')) {
      const errorType = urlParams.get('error');
      setError(`Authentication failed: ${errorType}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle opening platform instructions tab asynchronously
  useEffect(() => {
    if (pendingTabOpen) {
      const { openTabs, closeTab } = useEditorStore.getState();
      
      // Close any existing platform instructions tab
      const existingInstructionsTab = openTabs.find(tab => tab.type === 'platform-instructions');
      if (existingInstructionsTab) {
        closeTab(existingInstructionsTab.id);
      }
      
      // Open instructions tab for the pending platform
      openSpecialTab(
        `${pendingTabOpen}-instructions`,
        `${platformNames[pendingTabOpen as keyof typeof platformNames]} Connection Instructions`,
        'platform-instructions'
      );
      
      // Clear the pending state
      setPendingTabOpen(null);
    }
  }, [pendingTabOpen, openSpecialTab, platformNames]);

  // Handle closing platform instructions tab asynchronously
  useEffect(() => {
    if (pendingTabClose) {
      const { openTabs, closeTab } = useEditorStore.getState();
      
      // Close the instructions tab for this platform
      const instructionsTabId = `${pendingTabClose}-instructions`;
      const instructionsTab = openTabs.find(tab => tab.id === instructionsTabId);
      if (instructionsTab) {
        closeTab(instructionsTabId);
      }
      
      // Clear the pending state
      setPendingTabClose(null);
    }
  }, [pendingTabClose]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      const wasExpanded = next.has(section);
      
      if (wasExpanded) {
        // Closing the section - defer tab closing to useEffect
        next.delete(section);
        // Set pending tab to close asynchronously
        setPendingTabClose(section);
      } else {
        // Opening the section - defer tab opening to useEffect
        // Close any currently expanded sections
        next.clear();
        next.add(section);
        
        // Set pending tab to open asynchronously
        setPendingTabOpen(section);
      }
      return next;
    });
  };

  const updateFormData = (platform: keyof SocialFormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const getConnectionStatus = (platform: string) => {
    const connection = connections?.find(conn => conn.platform === platform);
    if (!connection?.isActive) return 'disconnected';
    
    // For OAuth platforms, check if they have access tokens
    if (platform === 'reddit') {
      return connection.accessToken ? 'authenticated' : 'connected';
    } else if (platform === 'twitter') {
      return connection.twitterAccessToken ? 'authenticated' : 'connected';
    }
    
    // For other platforms, just check if active
    return connection.isActive ? 'authenticated' : 'disconnected';
  };

  const getConnectionInfo = (platform: string) => {
    return connections?.find(conn => conn.platform === platform);
  };

  const handleConnect = async (platform: keyof typeof formData) => {
    try {
      setIsConnecting(prev => ({ ...prev, [platform]: true }));
      setError(null);
      
      if (platform === 'reddit') {
        const redditData = formData.reddit;
        const userAgent = redditData.userAgent || `EACDashboard/1.0 by ${redditData.username}`;
        
        await createSocialConnection({
          userId: 'temp-user-id',
          platform: 'reddit',
          username: redditData.username,
          clientId: redditData.clientId,
          clientSecret: redditData.clientSecret,
          userAgent: userAgent,
        });
        
        console.log('Reddit connection created successfully');
      } else if (platform === 'twitter') {
        const twitterData = formData.twitter;
        
        await createSocialConnection({
          userId: 'temp-user-id',
          platform: 'twitter',
          username: twitterData.username,
          apiKey: twitterData.clientId,
          apiSecret: twitterData.clientSecret,
        });
        
        console.log('Twitter connection created successfully');
      }
      
      // Collapse the section after successful connection
      setExpandedSections(prev => {
        const next = new Set(prev);
        next.delete(platform);
        return next;
      });
      
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
      setError(error instanceof Error ? error.message : `Failed to connect ${platform}`);
    } finally {
      setIsConnecting(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      setIsConnecting(prev => ({ ...prev, [platform]: true }));
      
      const connection = getConnectionInfo(platform);
      if (!connection) return;
      
      if (platform === 'twitter') {
        await disconnectXConnection({ connectionId: connection._id });
      } else {
        await disconnectSocialConnection({ connectionId: connection._id });
      }
      
      console.log(`${platform} disconnected successfully`);
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
      setError(error instanceof Error ? error.message : `Failed to disconnect ${platform}`);
    } finally {
      setIsConnecting(prev => ({ ...prev, [platform]: false }));
    }
  };

  // Handle OAuth authorization for Reddit
  const handleStartRedditOAuth = async (connectionId: string) => {
    try {
      // Get Reddit connection from Convex to get the client ID
      const connection = connections?.find(c => c._id === connectionId);
      const clientId = connection?.clientId || formData.reddit.clientId;
      
      if (!clientId) {
        setError('Please enter your Reddit Client ID first');
        return;
      }

      // Use environment variable to ensure consistency with backend
      const redirectUri = 'http://localhost:3000/api/auth/reddit/callback';
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

  // Handle OAuth authorization for Twitter/X
  const handleStartXOAuth = async (connectionId: string) => {
    try {
      // Get X connection from Convex to get the client ID
      const connection = connections?.find((c: any) => c._id === connectionId);
      const clientId = connection?.twitterClientId || connection?.apiKey || formData.twitter.clientId;
      
      if (!clientId) {
        setError('Please enter your X (Twitter) Client ID first');
        return;
      }

      // Use environment variable to ensure consistency with backend
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/twitter/callback`;
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

  // Show sign-in prompt when not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
        <div className="p-2">
          <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
            <span>Social Connections</span>
          </div>

          <div className="space-y-1 mt-2">
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-[#007acc]/10 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Contact className="w-6 h-6 text-[#007acc]" />
                </div>
                
                <h3 className="text-[#cccccc] font-medium text-sm mb-2">Sign in required</h3>
                <p className="text-[#858585] text-xs leading-relaxed">
                  Sign in to manage your social media connections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const platforms = ['facebook', 'instagram', 'twitter', 'reddit', 'linkedin', 'tiktok'] as const;

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Social Connections</span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-2 p-2 bg-red-900/20 border border-red-600/30 rounded text-xs text-red-400">
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </div>
          </div>
        )}

        {/* Social Platform Sections */}
        <div className="space-y-1 mt-2">
          {platforms.map((platform) => {
            const Icon = platformIcons[platform];
            const connectionStatus = getConnectionStatus(platform);
            const connectionInfo = getConnectionInfo(platform);
            const isExpanded = expandedSections.has(platform);
            const isCurrentlyConnecting = isConnecting[platform];

            return (
              <div key={platform} className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
                <button
                  onClick={() => toggleSection(platform)}
                  className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
                >
                  {isExpanded ? 
                    <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                    <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                  }
                  <Icon 
                    className="w-3.5 h-3.5" 
                    style={{ color: platformColors[platform] }}
                  />
                  <span className="text-xs font-medium flex-1 text-left">{platformNames[platform]}</span>
                  <div className="flex items-center gap-1">
                    {isCurrentlyConnecting ? (
                      <div className="w-3 h-3 border border-[#007acc] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="flex items-center gap-1">
                        {/* Three-state connection status indicator */}
                        {connectionStatus === 'authenticated' ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : connectionStatus === 'connected' ? (
                          <AlertCircle className="w-3 h-3 text-orange-400" />
                        ) : (
                          <div className="w-3 h-3 border border-[#858585] rounded-full" />
                        )}
                      </div>
                    )}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-2 pb-2 space-y-2">
                    <Separator className="bg-[#2d2d2d]" />
                    
                    {(connectionStatus === 'connected' || connectionStatus === 'authenticated') && connectionInfo ? (
                      // Connected State (with or without OAuth)
                      <div className="space-y-2">
                        <div className="text-[10px] text-[#858585] space-y-1">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={connectionStatus === 'authenticated' ? "text-green-400" : "text-orange-400"}>
                              {connectionStatus === 'authenticated' ? "✅ Connected & Authorized" : "🟡 Connected (Auth Required)"}
                            </span>
                          </div>
                          {connectionInfo.username && (
                            <div className="flex justify-between">
                              <span>Username:</span>
                              <span className="text-[#cccccc] font-mono">{connectionInfo.username}</span>
                            </div>
                          )}
                          {(platform === 'reddit' || platform === 'twitter') && (
                            <div className="flex justify-between">
                              <span>OAuth:</span>
                              <span className={
                                (platform === 'reddit' && connectionInfo.accessToken) || 
                                (platform === 'twitter' && connectionInfo.twitterAccessToken) 
                                  ? "text-green-400" : "text-orange-400"
                              }>
                                {(platform === 'reddit' && connectionInfo.accessToken) || 
                                 (platform === 'twitter' && connectionInfo.twitterAccessToken)
                                  ? "✅ Authorized" : "⚠️ Needs Auth"}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <Separator className="bg-[#2d2d2d]" />
                        
                        {/* OAuth Authorization Section - only show if needs auth */}
                        {((platform === 'reddit' && !connectionInfo.accessToken) || 
                          (platform === 'twitter' && !connectionInfo.twitterAccessToken)) && (
                          <div className="space-y-2">
                            <div className="text-[10px] text-[#858585] uppercase font-medium">OAuth Required</div>
                            <div className="text-[10px] text-[#cccccc] leading-relaxed">
                              {platform === 'reddit' 
                                ? 'Complete OAuth to enable Reddit posting'
                                : 'Complete OAuth to enable Twitter posting'
                              }
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#858585]">Authorize Access</span>
                              <button
                                onClick={() => {
                                  if (platform === 'reddit') {
                                    handleStartRedditOAuth(connectionInfo._id);
                                  } else if (platform === 'twitter') {
                                    handleStartXOAuth(connectionInfo._id);
                                  }
                                }}
                                disabled={isCurrentlyConnecting}
                                className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {platform === 'reddit' ? 'Authorize Reddit' : 'Authorize X'}
                              </button>
                            </div>
                            <Separator className="bg-[#2d2d2d]" />
                          </div>
                        )}
                        
                        {/* Re-authorization option for already authorized connections */}
                        {((platform === 'reddit' && connectionInfo.accessToken) || 
                          (platform === 'twitter' && connectionInfo.twitterAccessToken)) && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#858585]">Re-authorize</span>
                              <button
                                onClick={() => {
                                  if (platform === 'reddit') {
                                    handleStartRedditOAuth(connectionInfo._id);
                                  } else if (platform === 'twitter') {
                                    handleStartXOAuth(connectionInfo._id);
                                  }
                                }}
                                disabled={isCurrentlyConnecting}
                                className="text-xs text-[#858585] hover:text-[#cccccc] underline-offset-2 hover:underline disabled:opacity-50"
                              >
                                Re-authorize
                              </button>
                            </div>
                            <Separator className="bg-[#2d2d2d]" />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#858585]">Disconnect</span>
                          <button
                            onClick={() => handleDisconnect(platform)}
                            disabled={isCurrentlyConnecting}
                            className="text-xs text-red-400 hover:text-red-300 underline-offset-2 hover:underline disabled:opacity-50"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Connection Form
                      <div className="space-y-2">
                        <div className="text-[10px] text-[#858585] uppercase font-medium">Connection Setup</div>
                        
                        {/* Platform Connection Instructions Link */}
                        <div className="text-[10px]">
                          <span className="text-[#858585]">
                            Connection instructions opened automatically →
                          </span>
                        </div>
                        
                        {/* Platform-specific form fields */}
                        {platform === 'reddit' && (
                          <div className="space-y-2">
                            <div>
                              <Label className="text-[10px] text-[#858585]">Username</Label>
                              <Input
                                value={formData.reddit.username}
                                onChange={(e) => updateFormData('reddit', 'username', e.target.value)}
                                placeholder="your_username"
                                className="h-6 text-xs bg-[#2d2d2d] border-[#454545] text-[#cccccc]"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-[#858585]">Client ID</Label>
                              <Input
                                value={formData.reddit.clientId}
                                onChange={(e) => updateFormData('reddit', 'clientId', e.target.value)}
                                placeholder="Client ID"
                                className="h-6 text-xs bg-[#2d2d2d] border-[#454545] text-[#cccccc]"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-[#858585]">Client Secret</Label>
                              <Input
                                type="password"
                                value={formData.reddit.clientSecret}
                                onChange={(e) => updateFormData('reddit', 'clientSecret', e.target.value)}
                                placeholder="Client Secret"
                                className="h-6 text-xs bg-[#2d2d2d] border-[#454545] text-[#cccccc]"
                              />
                            </div>
                          </div>
                        )}

                        {platform === 'twitter' && (
                          <div className="space-y-2">
                            <div>
                              <Label className="text-[10px] text-[#858585]">Username</Label>
                              <Input
                                value={formData.twitter.username}
                                onChange={(e) => updateFormData('twitter', 'username', e.target.value)}
                                placeholder="@your_handle"
                                className="h-6 text-xs bg-[#2d2d2d] border-[#454545] text-[#cccccc]"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-[#858585]">Client ID</Label>
                              <Input
                                value={formData.twitter.clientId}
                                onChange={(e) => updateFormData('twitter', 'clientId', e.target.value)}
                                placeholder="API Key"
                                className="h-6 text-xs bg-[#2d2d2d] border-[#454545] text-[#cccccc]"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-[#858585]">Client Secret</Label>
                              <Input
                                type="password"
                                value={formData.twitter.clientSecret}
                                onChange={(e) => updateFormData('twitter', 'clientSecret', e.target.value)}
                                placeholder="API Secret"
                                className="h-6 text-xs bg-[#2d2d2d] border-[#454545] text-[#cccccc]"
                              />
                            </div>
                          </div>
                        )}

                        {platform === 'facebook' && (
                          <div className="space-y-2">
                            <div>
                              <Label className="text-[10px] text-[#858585]">Username</Label>
                              <Input
                                value={formData.facebook.username}
                                onChange={(e) => updateFormData('facebook', 'username', e.target.value)}
                                placeholder="your_username"
                                className="h-6 text-xs bg-[#2d2d2d] border-[#454545] text-[#cccccc]"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-[#858585]">API Key</Label>
                              <Input
                                value={formData.facebook.apiKey}
                                onChange={(e) => updateFormData('facebook', 'apiKey', e.target.value)}
                                placeholder="App ID"
                                className="h-6 text-xs bg-[#2d2d2d] border-[#454545] text-[#cccccc]"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-[#858585]">Access Token</Label>
                              <Input
                                type="password"
                                value={formData.facebook.accessToken}
                                onChange={(e) => updateFormData('facebook', 'accessToken', e.target.value)}
                                placeholder="Access Token"
                                className="h-6 text-xs bg-[#2d2d2d] border-[#454545] text-[#cccccc]"
                              />
                            </div>
                          </div>
                        )}

                        {/* Other platforms - placeholder forms */}
                        {platform === 'instagram' && (
                          <div className="text-[10px] text-[#858585] p-2 bg-[#2d2d2d]/30 rounded">
                            Instagram integration coming soon
                          </div>
                        )}

                        {platform === 'linkedin' && (
                          <div className="text-[10px] text-[#858585] p-2 bg-[#2d2d2d]/30 rounded">
                            LinkedIn integration coming soon
                          </div>
                        )}

                        {platform === 'tiktok' && (
                          <div className="text-[10px] text-[#858585] p-2 bg-[#2d2d2d]/30 rounded">
                            TikTok integration coming soon
                          </div>
                        )}
                        
                        {/* Connect button for platforms with forms */}
                        {(platform === 'reddit' || platform === 'twitter' || platform === 'facebook') && (
                          <>
                            <Separator className="bg-[#2d2d2d]" />
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#858585]">Connect Platform</span>
                              <button
                                onClick={() => handleConnect(platform)}
                                disabled={isCurrentlyConnecting || !formData[platform].username}
                                className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isCurrentlyConnecting ? 'Connecting...' : 'Connect'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
