// Social Media Connectors Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashboard/socialConnectors.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Facebook, Instagram, MessageSquare, Twitter } from "lucide-react";
import { useState } from "react";

interface SocialAccount {
  platform: 'facebook' | 'instagram' | 'twitter' | 'reddit';
  username: string;
  connected: boolean;
  lastSync?: Date;
}

type SocialFormData = {
  facebook: { username: string; apiKey: string; accessToken: string };
  instagram: { username: string; apiKey: string; accessToken: string };
  twitter: { username: string; apiKey: string; accessToken: string };
  reddit: { username: string; clientId: string; clientSecret: string };
};

export function SocialConnectors() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { platform: 'facebook', username: '', connected: false },
    { platform: 'instagram', username: '', connected: false },
    { platform: 'twitter', username: '', connected: false },
    { platform: 'reddit', username: '', connected: false },
  ]);

  const [formData, setFormData] = useState<SocialFormData>({
    facebook: { username: '', apiKey: '', accessToken: '' },
    instagram: { username: '', apiKey: '', accessToken: '' },
    twitter: { username: '', apiKey: '', accessToken: '' },
    reddit: { username: '', clientId: '', clientSecret: '' },
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

  const handleConnect = (platform: keyof typeof formData) => {
    // Simulate connection logic
    setAccounts(prev => 
      prev.map(acc => 
        acc.platform === platform 
          ? { ...acc, connected: true, username: formData[platform].username, lastSync: new Date() }
          : acc
      )
    );
  };

  const handleDisconnect = (platform: keyof typeof formData) => {
    setAccounts(prev => 
      prev.map(acc => 
        acc.platform === platform 
          ? { ...acc, connected: false, username: '', lastSync: undefined }
          : acc
      )
    );
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(formData).map(([platform, data]) => {
            const typedPlatform = platform as keyof typeof formData;
            const account = accounts.find(acc => acc.platform === typedPlatform);
            const Icon = platformIcons[typedPlatform];
            
            return (
              <Card key={platform} className="bg-[#2d2d2d] border-[#454545] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-[#4a9eff]" />
                  <h3 className="text-lg font-semibold">{platformNames[typedPlatform]}</h3>
                  {account?.connected && (
                    <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                  )}
                  {!account?.connected && (
                    <AlertCircle className="w-5 h-5 text-[#858585] ml-auto" />
                  )}
                </div>

                {account?.connected ? (
                  <div className="space-y-3">
                    <div className="bg-[#1e1e1e] p-3 rounded">
                      <p className="text-sm text-[#cccccc]">
                        <strong>Connected as:</strong> @{account.username}
                      </p>
                      {account.lastSync && (
                        <p className="text-xs text-[#858585] mt-1">
                          Last sync: {account.lastSync.toLocaleString()}
                        </p>
                      )}
                    </div>
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

                    <Button
                      onClick={() => handleConnect(typedPlatform)}
                      className="w-full bg-[#4a9eff] hover:bg-[#357abd] text-white"
                      disabled={
                        !data.username || 
                        (platform === 'reddit' 
                          ? !(data as { clientId: string }).clientId 
                          : !(data as { apiKey: string }).apiKey
                        )
                      }
                    >
                      Connect {platformNames[typedPlatform]}
                    </Button>
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
