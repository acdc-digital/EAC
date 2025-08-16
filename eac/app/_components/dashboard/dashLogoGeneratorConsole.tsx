// Logo Generator Console Component - Sidebar Panel
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/dashLogoGeneratorConsole.tsx

"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useLogoGenerationPrompt, useLogoGenerationSync } from "@/lib/hooks/useLogoGenerationSync";
import { useAgentStore } from "@/store";
import { useEditorStore } from "@/store/editor";
import { useLogoGeneratorStore } from "@/store/logoGenerator";
import { useTerminalStore } from "@/store/terminal";
import { useSessionStore } from "@/store/terminal/session";
import { useMutation } from "convex/react";
import {
  Copy,
  Download,
  Image,
  Palette,
  Sparkles,
  Zap
} from "lucide-react";
import { useState } from "react";

export function DashLogoGeneratorConsole() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { setActiveAgent } = useAgentStore();
  const { setActiveTab } = useTerminalStore();
  const { openSpecialTab } = useEditorStore();
  const { createNewSession, setExtensionsPanelOpen } = useSessionStore();
  const { currentLogo, isGenerating: storeIsGenerating, logoHistory, selectFromHistory } = useLogoGeneratorStore();
  const storeChatMessage = useMutation(api.chat.storeChatMessage);
  
  // Sync logo generation results from chat messages
  useLogoGenerationSync();
  const latestPrompt = useLogoGenerationPrompt();

  console.log('🎨 Logo Generator Console rendered');

  const handleGetStarted = async () => {
    console.log('🎨 Get Started clicked');
    
    try {
      // Create a new session specifically for logo generation
      console.log('🎨 Creating new session...');
      const newSessionId = createNewSession();
      console.log('🎨 New session created:', newSessionId);
      
      // Set the active agent to logo-generator
      console.log('🎨 Setting active agent...');
      setActiveAgent('logo-generator');
      
      // Store the initial message in the new session
      console.log('🎨 Storing chat message...');
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
      console.log('🎨 Chat message stored successfully');
      
      // Switch to terminal view to show the conversation
      console.log('🎨 Switching to terminal tab...');
      setActiveTab("terminal");
      
      // Close extensions panel to show chat
      console.log('🎨 Closing extensions panel to show chat...');
      setExtensionsPanelOpen(false);
      
      console.log('🎨 Workflow completed successfully');
    } catch (error) {
      console.error('Failed to initialize logo generator session:', error);
    }
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      {/* Header */}
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Logo Generator</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-vscode px-2 space-y-2">
        
        {/* Current Logo Display */}
        {currentLogo && (
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#ffcc02]" />
                <span className="text-xs font-medium text-[#cccccc]">Latest Logo</span>
              </div>
              
              {/* Logo Preview */}
              <div className="bg-[#2d2d2d] border border-[#454545] rounded p-4 flex items-center justify-center mb-3 aspect-[2/1]">
                <img 
                  src={currentLogo.imageUrl} 
                  alt="Generated Logo" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-1">
                <Button 
                  size="sm"
                  className="w-full bg-[#4fc3f7] hover:bg-[#29b6f6] text-black font-medium text-xs h-7"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = currentLogo.imageUrl;
                    link.download = `${currentLogo.brief.companyName || 'logo'}.png`;
                    link.click();
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  className="w-full border-[#454545] text-[#cccccc] hover:bg-[#454545] text-xs h-7"
                  onClick={() => openSpecialTab('logo-generator', 'Logo Generator', 'logo-generator')}
                >
                  View Full Editor
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Create Your Logo Section */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#ffcc02]" />
              <span className="text-xs font-medium text-[#cccccc]">Create Your Logo</span>
            </div>
            
            {!currentLogo && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[#ffcc02]" />
                  <span className="text-xs font-medium text-[#cccccc]">AI-Powered Generation</span>
                </div>
                <p className="text-xs text-[#858585] mb-3">
                  Our AI will guide you through creating the perfect logo for your brand. We'll ask about your style preferences, industry, and brand personality.
                </p>
              </>
            )}
            
            <Button 
              size="sm"
              onClick={handleGetStarted}
              disabled={isGenerating || storeIsGenerating}
              className="w-full bg-[#ffcc02] hover:bg-[#e6b800] text-black font-medium text-xs h-7"
            >
              {isGenerating || storeIsGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  {storeIsGenerating ? 'Generating...' : 'Starting...'}
                </div>
              ) : (
                currentLogo ? 'Generate New Logo' : 'Get Started'
              )}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <div className="p-3 space-y-3">
            <div className="text-xs font-medium text-[#cccccc] mb-2">Features</div>
            
            <div className="flex items-start gap-2">
              <Palette className="w-4 h-4 text-[#4fc3f7] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-[#cccccc]">Color Customization</div>
                <div className="text-[10px] text-[#858585]">Choose from unlimited color combinations</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Image className="w-4 h-4 text-[#51cf66] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-[#cccccc]">Multiple Formats</div>
                <div className="text-[10px] text-[#858585]">Export as SVG, PNG, or PDF</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#ffcc02] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-[#cccccc]">AI Variations</div>
                <div className="text-[10px] text-[#858585]">Generate multiple design options</div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Guidelines */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <div className="p-3">
            <div className="text-xs font-medium text-[#cccccc] mb-2">Brand Guidelines</div>
            <p className="text-[10px] text-[#858585] mb-2">
              Get a complete brand package including color codes, typography recommendations, and usage guidelines.
            </p>
            <Button 
              size="sm"
              variant="outline"
              className="w-full border-[#454545] text-[#858585] hover:text-[#cccccc] hover:bg-[#454545] text-xs h-6"
              onClick={() => console.log('Brand guidelines clicked')}
            >
              View Guidelines
            </Button>
          </div>
        </div>

        {/* Recent Generations */}
        {logoHistory.length > 0 && (
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <div className="p-3">
              <div className="text-xs font-medium text-[#cccccc] mb-2">Recent Generations</div>
              <div className="grid grid-cols-2 gap-2">
                {logoHistory.slice(0, 4).map((logo, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      selectFromHistory(i);
                      openSpecialTab('logo-generator', 'Logo Generator', 'logo-generator');
                    }}
                    className="aspect-square bg-[#2d2d2d] border border-[#454545] rounded p-2 flex items-center justify-center cursor-pointer hover:border-[#ffcc02] transition-colors"
                  >
                    <img 
                      src={logo.imageUrl} 
                      alt={`Logo ${i + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Latest Prompt Display */}
        {currentLogo && latestPrompt && (
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#ffcc02]" />
                <span className="text-xs font-medium text-[#cccccc]">Generation Prompt</span>
              </div>
              <div className="bg-[#2d2d2d] p-2 rounded border border-[#454545] mb-2">
                <code className="text-[10px] text-[#b3b3b3] font-mono break-all">{latestPrompt}</code>
              </div>
              <Button
                size="sm"
                onClick={() => navigator.clipboard.writeText(latestPrompt)}
                variant="ghost"
                className="text-xs text-[#858585] hover:text-[#cccccc] h-6 w-full"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy Prompt
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}