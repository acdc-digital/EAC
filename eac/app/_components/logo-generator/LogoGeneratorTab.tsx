// Logo Generator Tab Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/logo-generator/LogoGeneratorTab.tsx

"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useLogoGenerationPrompt, useLogoGenerationSync } from "@/lib/hooks/useLogoGenerationSync";
import { useAgentStore } from "@/store";
import { useLogoGeneratorStore } from "@/store/logoGenerator";
import { useTerminalStore } from "@/store/terminal";
import { useSessionStore } from "@/store/terminal/session";
import { useMutation } from "convex/react";
import { Copy, Download, Image, Palette, RotateCcw, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

export function LogoGeneratorTab() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { setActiveAgent } = useAgentStore();
  const { setActiveTab, setCollapsed: setTerminalCollapsed } = useTerminalStore();
  const { createNewSession, setActiveSession, setSessionsPanelOpen, setAgentsPanelOpen, setExtensionsPanelOpen } = useSessionStore();
  const { currentLogo, isGenerating: storeIsGenerating, logoHistory, selectFromHistory } = useLogoGeneratorStore();
  const storeChatMessage = useMutation(api.chat.storeChatMessage);
  
  // Sync logo generation results from chat messages
  useLogoGenerationSync();
  const latestPrompt = useLogoGenerationPrompt();

  const handleGetStarted = async () => {
    try {
      setIsGenerating(true);
      
      // Create a new chat session for logo generation
      const newSessionId = createNewSession();
      setActiveSession(newSessionId);
      
      // Activate the logo generator agent
      setActiveAgent('logo-generator');
      
      // Send initial message from the logo generator agent FIRST
      await storeChatMessage({
        role: "assistant",
        content: `🎨 **Welcome to the Logo Generator!**

I'm here to help you create a professional logo for your brand. I'll guide you through a step-by-step process to understand your vision and generate the perfect logo.

Let's start with the basics:

**What's the name of your company or brand?**`,
        sessionId: newSessionId,
        processIndicator: {
          type: 'waiting',
          processType: 'logo-generation',
          color: 'blue'
        }
      });
      
      console.log('✅ Logo Generator session created and initial prompt sent');
      
      // Small delay to ensure message is processed, then open terminal to chat
      setTimeout(() => {
        setTerminalCollapsed(false);
        setActiveTab('terminal'); // This is the correct tab name
        // Close all sub-panels so ChatMessages shows by default
        setSessionsPanelOpen(false);
        setAgentsPanelOpen(false);
        setExtensionsPanelOpen(false);
      }, 100);
      
    } catch (error) {
      console.error('Failed to start logo generation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full bg-[#1e1e1e] text-[#cccccc] flex flex-col max-h-[calc(100vh-140px)] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#2d2d2d] p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ffcc02]/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-[#ffcc02]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#cccccc]">Logo Generator</h1>
            <p className="text-sm text-[#858585]">AI-powered logo creation and brand identity generation</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Panel - Preview */}
        <div className="flex-1 overflow-y-auto scrollbar-vscode">
          <div className="p-6">
            <h2 className="text-lg font-medium text-[#cccccc] mb-4">Logo Preview</h2>
            
            {/* Logo Preview Frame */}
            <div className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-8 flex items-center justify-center min-h-[300px] mb-6">
              {currentLogo ? (
                <img 
                  src={currentLogo.imageUrl} 
                  alt="Generated Logo" 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 bg-[#454545] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Image className="w-12 h-12 text-[#858585]" />
                  </div>
                  <p className="text-[#858585] text-sm">Your logo will appear here</p>
                  <p className="text-[#656565] text-xs mt-1">Get started to begin logo generation</p>
                </div>
              )}
            </div>

            {/* Logo Variations */}
            {currentLogo && logoHistory.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-[#cccccc] mb-3">Recent Generations</h3>
                <div className="grid grid-cols-3 gap-3">
                  {logoHistory.slice(0, 3).map((logo, i) => (
                    <div 
                      key={i}
                      onClick={() => selectFromHistory(i)}
                      className="aspect-square bg-[#2d2d2d] border border-[#454545] rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-[#ffcc02] transition-colors"
                    >
                      <img 
                        src={logo.imageUrl} 
                        alt={`Logo variation ${i + 1}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generation Prompt Display */}
            {currentLogo && latestPrompt && (
              <div className="p-4 bg-[#2a2a2a] rounded-lg">
                <h4 className="text-sm font-medium text-[#cccccc] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ffcc02]" />
                  Generated with Imagen Prompt
                </h4>
                <div className="bg-[#1e1e1e] p-3 rounded border border-[#454545]">
                  <code className="text-xs text-[#b3b3b3] font-mono">{latestPrompt}</code>
                </div>
                <Button
                  onClick={() => navigator.clipboard.writeText(latestPrompt)}
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs text-[#858585] hover:text-[#cccccc]"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Prompt
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Controls */}
        <div className="w-80 border-l border-[#2d2d2d] overflow-y-auto scrollbar-vscode">
          <div className="p-6">
            <h2 className="text-lg font-medium text-[#cccccc] mb-6">Create Your Logo</h2>
            
            {/* Generated Logo Actions */}
            {currentLogo && (
              <div className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-4 mb-6">
                <h3 className="font-medium text-[#cccccc] mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ffcc02]" />
                  Logo Ready!
                </h3>
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-[#4fc3f7] hover:bg-[#29b6f6] text-black font-medium"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = currentLogo.imageUrl;
                      link.download = `${currentLogo.brief.companyName || 'logo'}.png`;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Logo
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-[#454545] text-[#cccccc] hover:bg-[#454545]"
                    onClick={handleGetStarted}
                    disabled={isGenerating || storeIsGenerating}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Generate Variation
                  </Button>
                </div>
                
                {/* Logo Details */}
                <div className="mt-4 pt-4 border-t border-[#454545]">
                  <div className="text-xs text-[#858585] space-y-1">
                    <div><span className="text-[#cccccc]">Company:</span> {currentLogo.brief.companyName}</div>
                    <div><span className="text-[#cccccc]">Style:</span> {currentLogo.brief.stylePreference}</div>
                    <div><span className="text-[#cccccc]">Type:</span> {currentLogo.brief.logoType}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Get Started Section */}
            {!currentLogo && (
              <div className="bg-[#2d2d2d] border border-[#454545] rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-[#ffcc02]" />
                  <span className="font-medium text-[#cccccc]">AI-Powered Generation</span>
                </div>
                <p className="text-sm text-[#b3b3b3] mb-4">
                  Our AI will guide you through creating the perfect logo for your brand. We'll ask about your style preferences, industry, and brand personality.
                </p>
                <Button 
                  onClick={handleGetStarted}
                  disabled={isGenerating || storeIsGenerating}
                  className="w-full bg-[#ffcc02] hover:bg-[#e6b800] text-black font-medium"
                >
                  {isGenerating || storeIsGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      {storeIsGenerating ? 'Generating...' : 'Starting...'}
                    </div>
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </div>
            )}

            {/* Features */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <Palette className="w-5 h-5 text-[#4fc3f7] mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-[#cccccc]">Color Customization</h4>
                  <p className="text-xs text-[#858585]">Choose from unlimited color combinations</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Image className="w-5 h-5 text-[#51cf66] mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-[#cccccc]">Multiple Formats</h4>
                  <p className="text-xs text-[#858585]">Export as SVG, PNG, or PDF</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#ffcc02] mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-[#cccccc]">AI Variations</h4>
                  <p className="text-xs text-[#858585]">Generate multiple design options</p>
                </div>
              </div>
            </div>

            {/* Brand Guidelines */}
            <div className="p-4 bg-[#2a2a2a] rounded-lg">
              <h4 className="text-sm font-medium text-[#cccccc] mb-2">Brand Guidelines</h4>
              <p className="text-xs text-[#858585]">
                Get a complete brand package including color codes, typography recommendations, and usage guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Also export as default for dynamic imports
export default LogoGeneratorTab;
