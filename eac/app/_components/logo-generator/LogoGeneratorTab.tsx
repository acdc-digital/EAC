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
import { Copy, Download, Image, RotateCcw, Sparkles } from "lucide-react";
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
    // Create a new session specifically for logo generation
    const newSessionId = createNewSession();
    
    // Set the active agent to logo-generator
    setActiveAgent('logo-generator');
    
    // Store the initial message in the new session
    try {
      await storeChatMessage({
        role: 'assistant',
        content: `# 🎨 Logo Generator Started

Welcome! I'm your AI logo designer. I'll help you create professional logos for your brand.

**To get started, I'll need some information:**
- Company/brand name
- Industry or business type  
- Style preferences (modern, classic, playful, etc.)
- Color preferences
- Any specific requirements or inspiration

What's the name of the company or brand you'd like to create a logo for?`,
        sessionId: newSessionId,
        operation: {
          type: 'tool_executed',
          details: {
            tool: 'logo-generator',
            action: 'session_started'
          }
        }
      });
      
      // Switch to terminal view to show the conversation
      setActiveTab("terminal");
    } catch (error) {
      console.error('Failed to initialize logo generator session:', error);
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
            
          </div>
        </div>
      </div>
    </div>
  );
}

// Also export as default for dynamic imports
export default LogoGeneratorTab;
