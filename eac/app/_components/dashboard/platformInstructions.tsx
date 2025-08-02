// Platform Connection Instructions Component
// Displays detailed instructions for connecting social media platforms

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Facebook, Instagram, Linkedin, MessageSquare, Music, Twitter } from "lucide-react";

interface PlatformInstructionsProps {
  platform?: string;
}

export function PlatformInstructions({ platform }: PlatformInstructionsProps) {
  const getPlatformInfo = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'reddit':
        return {
          name: 'Reddit',
          icon: MessageSquare,
          color: '#ff4500',
          instructions: [
            'Go to https://www.reddit.com/prefs/apps',
            'Click "Create App" or "Create Another App"',
            'Fill in the form:',
            '• App name: Your app name (e.g., "EAC Dashboard")',
            '• App type: Select "script"',
            '• Description: Brief description (optional)',
            '• About URL: Leave blank or add your website',
            '• Redirect URI: http://localhost:3001/auth/callback',
            'Click "Create app"',
            'Copy the Client ID (under the app name)',
            'Copy the Client Secret (shown as "secret")',
            'Your User Agent should be: YourAppName/1.0 by YourRedditUsername'
          ]
        };
      case 'twitter':
      case 'x':
        return {
          name: 'X (Twitter)',
          icon: Twitter,
          color: '#1da1f2',
          instructions: [
            'Go to https://developer.twitter.com/en/portal/dashboard',
            'Click "Create Project" or use existing project',
            'Navigate to your project and click "Add App"',
            'Choose "Development" environment',
            'Fill in app details:',
            '• App name: Your app name',
            '• App description: Brief description',
            'In App Settings, configure:',
            '• Authentication settings: Enable OAuth 2.0',
            '• Callback URLs: http://localhost:3001/auth/callback',
            '• Website URL: Your website or localhost:3001',
            'In the "Keys and Tokens" tab:',
            '• Copy the API Key (Client ID)',
            '• Copy the API Secret Key (Client Secret)',
            'Ensure your app has the necessary permissions for posting'
          ]
        };
      case 'facebook':
        return {
          name: 'Facebook',
          icon: Facebook,
          color: '#1877f2',
          instructions: [
            'Go to https://developers.facebook.com/',
            'Click "My Apps" then "Create App"',
            'Select "Business" as the app type',
            'Fill in the app details and create the app',
            'In the app dashboard, add "Facebook Login" product',
            'Configure OAuth settings:',
            '• Valid OAuth Redirect URIs: http://localhost:3001/auth/callback',
            '• Login Review: Submit for review if needed',
            'Go to Settings > Basic:',
            '• Copy the App ID',
            '• Copy the App Secret (click "Show")',
            'For Pages API access, you may need additional permissions',
            'Generate a User Access Token or Page Access Token as needed'
          ]
        };
      case 'instagram':
        return {
          name: 'Instagram',
          icon: Instagram,
          color: '#e4405f',
          instructions: [
            'Instagram API access requires Facebook Developer account',
            'Go to https://developers.facebook.com/',
            'Create or use existing Facebook app',
            'Add "Instagram Basic Display" product',
            'Configure Instagram Basic Display:',
            '• Valid OAuth Redirect URIs: http://localhost:3001/auth/callback',
            '• Deauthorize Callback URL: http://localhost:3001/auth/deauthorize',
            '• Data Deletion Request URL: http://localhost:3001/auth/delete',
            'Add Instagram Testers in App Review > Roles',
            'Get your credentials from App Settings > Basic:',
            '• Instagram App ID',
            '• Instagram App Secret',
            'Note: Instagram Business accounts may require different setup'
          ]
        };
      case 'linkedin':
        return {
          name: 'LinkedIn',
          icon: Linkedin,
          color: '#0a66c2',
          instructions: [
            'Go to https://www.linkedin.com/developers/',
            'Click "Create App"',
            'Fill in the application details:',
            '• App name: Your application name',
            '• LinkedIn Page: Associate with your company page',
            '• App logo: Upload a logo (optional)',
            'Select products (e.g., "Sign In with LinkedIn", "Share on LinkedIn")',
            'In Auth tab, configure:',
            '• Authorized redirect URLs: http://localhost:3001/auth/callback',
            'Copy your credentials from Auth tab:',
            '• Client ID',
            '• Client Secret',
            'Request access to additional products if needed',
            'Note: Some features require LinkedIn partner verification'
          ]
        };
      case 'tiktok':
        return {
          name: 'TikTok',
          icon: Music,
          color: '#000000',
          instructions: [
            'Go to https://developers.tiktok.com/',
            'Create a developer account if needed',
            'Click "Manage Apps" then "Create an App"',
            'Fill in the app information:',
            '• App name: Your application name',
            '• App description: Brief description',
            '• Category: Choose appropriate category',
            'Add products/permissions you need',
            'Configure redirect URL: http://localhost:3001/auth/callback',
            'In App Details, copy:',
            '• Client Key',
            '• Client Secret',
            'Submit for review if required',
            'Note: TikTok API access may be limited and require approval'
          ]
        };
      default:
        return {
          name: 'Platform',
          icon: MessageSquare,
          color: '#858585',
          instructions: ['Instructions will be available soon for this platform.']
        };
    }
  };

  const platformInfo = platform ? getPlatformInfo(platform) : null;

  if (!platform || !platformInfo) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-[#858585]">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Platform Instructions</h3>
          <p className="text-sm">Select a platform to view connection instructions.</p>
        </div>
      </div>
    );
  }

  const Icon = platformInfo.icon;

  return (
    <div className="w-full h-full overflow-auto bg-[#1e1e1e] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Icon 
            className="w-8 h-8" 
            style={{ color: platformInfo.color }}
          />
          <div>
            <h1 className="text-2xl font-bold text-[#cccccc]">
              {platformInfo.name} Connection Setup
            </h1>
            <p className="text-[#858585] text-sm">
              Follow these steps to connect your {platformInfo.name} account
            </p>
          </div>
          <Badge variant="outline" className="ml-auto text-[#007acc] border-[#007acc]">
            API Setup
          </Badge>
        </div>

        <Separator className="bg-[#2d2d2d]" />

        {/* Instructions Card */}
        <Card className="bg-[#252525] border-[#2d2d2d]">
          <CardHeader>
            <CardTitle className="text-[#cccccc] flex items-center gap-2">
              <Icon className="w-5 h-5" style={{ color: platformInfo.color }} />
              Step-by-Step Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-3">
              {platformInfo.instructions.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#007acc] text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-[#cccccc] text-sm leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Security Note */}
        <Card className="bg-[#2d1810] border-[#8b4513]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <h4 className="text-orange-400 font-medium text-sm mb-1">Security Notice</h4>
                <p className="text-orange-200 text-xs leading-relaxed">
                  Keep your API keys and secrets secure. Never share them publicly or commit them to version control. 
                  Use environment variables in production applications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Links */}
        <Card className="bg-[#252525] border-[#2d2d2d]">
          <CardHeader>
            <CardTitle className="text-[#cccccc] text-sm">Helpful Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {platform === 'reddit' && (
              <>
                <a 
                  href="https://www.reddit.com/prefs/apps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#007acc] hover:text-[#1e90ff] text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Reddit App Preferences
                </a>
                <a 
                  href="https://github.com/reddit-archive/reddit/wiki/OAuth2" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#007acc] hover:text-[#1e90ff] text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Reddit OAuth2 Documentation
                </a>
              </>
            )}
            {(platform === 'twitter' || platform === 'x') && (
              <>
                <a 
                  href="https://developer.twitter.com/en/portal/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#007acc] hover:text-[#1e90ff] text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Twitter Developer Portal
                </a>
                <a 
                  href="https://developer.twitter.com/en/docs/authentication/oauth-2-0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#007acc] hover:text-[#1e90ff] text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Twitter OAuth 2.0 Documentation
                </a>
              </>
            )}
            {platform === 'facebook' && (
              <>
                <a 
                  href="https://developers.facebook.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#007acc] hover:text-[#1e90ff] text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Facebook Developers
                </a>
                <a 
                  href="https://developers.facebook.com/docs/facebook-login" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#007acc] hover:text-[#1e90ff] text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Facebook Login Documentation
                </a>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
