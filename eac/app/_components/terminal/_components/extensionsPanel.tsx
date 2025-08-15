// Terminal Extensions Panel Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/extensionsPanel.tsx

"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/store";
import { useEditorStore } from "@/store/editor";
import { useSessionStore } from "@/store/terminal/session";
import { AtSign, Bot, Puzzle } from "lucide-react";

interface PremiumExtension {
  id: string;
  name: string;
  description: string;
  price: string;
  isInstalled: boolean;
  icon?: string;
}

// Premium extensions available
const premiumExtensions: PremiumExtension[] = [
  {
    id: 'logo-generator',
    name: 'Logo Generator',
    description: 'AI-powered logo creation and brand identity generation. Create professional logos, color palettes, and brand guidelines.',
    price: '$29.00',
    isInstalled: true,
    icon: 'Puzzle'
  },
  {
    id: 'marketing-officer',
    name: 'Marketing Officer',
    description: 'Your AI Chief Marketing Officer that plans and executes complete marketing campaigns from strategy to execution.',
    price: '$49.00',
    isInstalled: true,
    icon: 'AtSign'
  },
  {
    id: 'campaign-director',
    name: 'Campaign Director',
    description: 'Enterprise-level campaign orchestration. Generate and schedule 100+ posts across multiple platforms with intelligent content distribution.',
    price: '$199.00',
    isInstalled: true,
    icon: 'Bot'
  }
];

interface ExtensionsPanelProps {
  className?: string;
}

export function ExtensionsPanel({ className }: ExtensionsPanelProps) {
  const { activeExtensionId, setActiveExtension } = useSessionStore();
  const { activeAgentId, setActiveAgent } = useAgentStore();
  const { openSpecialTab } = useEditorStore();

  // Handle opening logo generator tab
  const handleOpenLogoGenerator = () => {
    openSpecialTab('logo-generator', 'Logo Generator', 'logo-generator');
  };

  const handleExtensionSelect = (extensionId: string) => {
    // When selecting an extension, activate it and set corresponding agent
    setActiveExtension(extensionId);
    
    // Clear any regular agent selection that's not the extension agent
    // This ensures mutual exclusivity
    const extensionAgentId = extensionId === 'marketing-officer' ? 'cmo' : 
                            extensionId === 'campaign-director' ? 'director' :
                            extensionId === 'logo-generator' ? 'logo-generator' : null;
    
    // Set the corresponding extension agent
    if (extensionAgentId) {
      setActiveAgent(extensionAgentId);
    }
  };

  const handlePurchase = (extensionId: string, price: string) => {
    console.log(`Purchase extension: ${extensionId} for ${price}`);
    // TODO: Implement purchase flow
  };

  const getExtensionIcon = (iconName?: string, isActive: boolean = false) => {
    const iconColor = isActive ? "text-[#ffcc02]" : "text-[#858585]";
    
    switch (iconName) {
      case 'Bot':
        return <Bot className={`w-4 h-4 ${iconColor}`} />;
      case 'Puzzle':
        return <Puzzle className={`w-4 h-4 ${iconColor}`} />;
      case 'AtSign':
      default:
        return <AtSign className={`w-4 h-4 ${iconColor}`} />;
    }
  };

  return (
    <div className={cn("flex-1 bg-[#0e0e0e] flex flex-col min-h-0", className)}>
      {/* Extensions List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="h-full">
          {/* Table Header - Fixed */}
          <div className="sticky top-0 z-10 flex items-center px-3 py-1.5 bg-[#2d2d30] border-b border-[#454545] text-xs text-[#858585]">
            <div className="flex-shrink-0 w-16">Select</div>
            <div className="flex-shrink-0 w-8">Icon</div>
            <div className="flex-shrink-0 w-32">Extension</div>
            <div className="flex-1 px-2">Description</div>
            <div className="flex-shrink-0 w-20 text-center">Status</div>
          </div>
          
          {/* Extension Rows - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-vscode">
            {premiumExtensions.map((extension) => (
              <div
                key={extension.id}
                className={cn(
                  "w-full flex items-center px-3 py-1.5 transition-all duration-200 border-b border-[#333] cursor-pointer group",
                  // Base hover effect for all extensions
                  "hover:bg-[#2a2a2a]",
                  // Enhanced hover effect specifically for logo-generator
                  extension.id === 'logo-generator' && "hover:bg-[#2a2a2a] hover:border-l-2 hover:border-l-[#ffcc02]/60 hover:shadow-sm",
                  // Active state styling
                  activeExtensionId === extension.id 
                    ? "border-l-2 border-l-[#ffcc02] bg-[#ffcc02]/10" 
                    : ""
                )}
                onClick={() => {
                  // If it's the logo generator, open the tab
                  if (extension.id === 'logo-generator') {
                    handleOpenLogoGenerator();
                  }
                }}
              >
                {/* Select Checkbox */}
                <div className="flex-shrink-0 w-16 flex items-center justify-start">
                  <Checkbox
                    checked={activeExtensionId === extension.id}
                    onCheckedChange={(checked) => {
                      // If checking the box, select the extension
                      // If unchecking the box, deselect the extension
                      if (checked) {
                        handleExtensionSelect(extension.id);
                      } else {
                        setActiveExtension(null);
                        setActiveAgent(null);
                      }
                    }}
                    className="w-4 h-4"
                  />
                </div>
                
                {/* Icon */}
                <div className="flex-shrink-0 w-8 flex items-center justify-center">
                  {getExtensionIcon(extension.icon, activeExtensionId === extension.id)}
                </div>
                
                {/* Extension Name */}
                <div className="flex-shrink-0 w-32 text-xs">
                  <span className={cn(
                    activeExtensionId === extension.id 
                      ? "text-[#ffcc02] font-medium" 
                      : "text-[#cccccc]",
                    // Add hover effect for logo-generator
                    extension.id === 'logo-generator' && "group-hover:text-[#ffcc02] transition-colors duration-200"
                  )}>
                    {extension.name}
                  </span>
                </div>
                
                {/* Description */}
                <div className="flex-1 px-2 min-w-0">
                  <div className={cn(
                    "text-xs text-[#b3b3b3] truncate",
                    // Add hover effect for logo-generator
                    extension.id === 'logo-generator' && "group-hover:text-[#cccccc] transition-colors duration-200"
                  )}>
                    {extension.description}
                  </div>
                </div>
                
                {/* Status Indicator */}
                <div className="flex-shrink-0 w-20 flex items-center justify-center">
                  {activeExtensionId === extension.id ? (
                    <span className="px-2 py-1 text-[10px] rounded font-medium bg-[#ffcc02]/20 text-[#ffcc02]">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-[10px] rounded font-medium bg-[#2d2d2d] text-[#858585]">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
