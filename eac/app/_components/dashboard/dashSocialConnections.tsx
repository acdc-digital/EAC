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
  Info,
  Instagram,
  Linkedin,
  MessageSquare,
  Music,
  Twitter,
  XCircle
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
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
    return connection?.isActive || false;
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
            const isConnected = getConnectionStatus(platform);
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
                    ) : isConnected ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-400" />
                    )}
                    <Info className="w-3 h-3 text-[#858585]" />
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-2 pb-2 space-y-2">
                    <Separator className="bg-[#2d2d2d]" />
                    
                    {isConnected && connectionInfo ? (
                      // Connected State
                      <div className="space-y-2">
                        <div className="text-[10px] text-[#858585] space-y-1">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className="text-green-400">✅ Connected</span>
                          </div>
                          {connectionInfo.username && (
                            <div className="flex justify-between">
                              <span>Username:</span>
                              <span className="text-[#cccccc] font-mono">{connectionInfo.username}</span>
                            </div>
                          )}
                        </div>
                        
                        <Separator className="bg-[#2d2d2d]" />
                        
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
                          <button
                            onClick={() => openSpecialTab(
                              `${platform}-instructions`,
                              `${platformNames[platform]} Connection Instructions`,
                              'platform-instructions'
                            )}
                            className="text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                          >
                            Find your connection instructions here →
                          </button>
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
