// Extensions Panel Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/dashExtensions.tsx

"use client";

import { useMCP } from "@/lib/hooks/useMCP";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/store";
import { useEditorStore } from "@/store/editor";
import { AtSign, Bot, ChevronDown, ChevronRight, Download, FileText, Puzzle, Search, Star, Terminal } from "lucide-react";
import { useState } from "react";
import { ExtensionRequestButton } from "../extensions/ExtensionRequestForm";

interface Extension {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  isInstalled: boolean;
  category: 'productivity' | 'ai' | 'social' | 'development' | 'other';
  type?: 'extension' | 'agent' | 'mcp';
  icon?: string;
}

// Mock extension data - this will be replaced with real data later
const mockExtensions: Extension[] = [
  {
    id: 'twitter-enhanced',
    name: 'Twitter Enhanced',
    description: 'Advanced Twitter integration with analytics and scheduling',
    author: 'EAC Team',
    version: '1.0.0',
    downloads: 1250,
    rating: 4.8,
    isInstalled: false,
    category: 'social'
  },
  {
    id: 'reddit-analytics',
    name: 'Reddit Analytics Pro',
    description: 'Deep Reddit analytics and content optimization tools',
    author: 'Community',
    version: '2.1.3',
    downloads: 892,
    rating: 4.6,
    isInstalled: false,
    category: 'social'
  },
  {
    id: 'ai-content-generator',
    name: 'AI Content Generator',
    description: 'Generate high-quality content using advanced AI models',
    author: 'AI Labs',
    version: '1.5.2',
    downloads: 2100,
    rating: 4.9,
    isInstalled: false,
    category: 'ai'
  }
];

export function DashExtensions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedExtensions, setExpandedExtensions] = useState<Set<string>>(new Set());
  const { agents } = useAgentStore();
  const { availableTools: mcpTools } = useMCP();
  const { openSpecialTab } = useEditorStore();

  // Handle opening logo generator
  const handleOpenLogoGenerator = () => {
    openSpecialTab('logo-generator', 'Logo Generator', 'logo-generator');
  };

  // Convert agents to extension format
  const agentExtensions: Extension[] = agents.map(agent => ({
    id: `agent-${agent.id}`,
    name: agent.name,
    description: agent.description,
    author: 'EAC Team',
    version: '1.0.0',
    downloads: agent.tools.length * 100, // Mock download count based on tools
    rating: 4.8,
    isInstalled: true, // Agents are considered "installed" since they're available
    category: 'ai' as const,
    type: 'agent' as const,
    icon: agent.icon
  }));

  // Convert MCP tools to extension format
  const mcpExtension: Extension = {
    id: 'mcp-server',
    name: 'MCP Server Tools',
    description: 'Model Context Protocol tools for code analysis and project management',
    author: 'EAC Team',
    version: '1.0.0',
    downloads: (mcpTools?.length || 0) * 50,
    rating: 4.7,
    isInstalled: true,
    category: 'development',
    type: 'mcp',
    icon: 'Terminal'
  };

  // Combine all extensions
  const allExtensions = [
    ...agentExtensions,
    ...(mcpTools && mcpTools.length > 0 ? [mcpExtension] : []),
    ...mockExtensions
  ];

  const filteredExtensions = allExtensions.filter(ext => {
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleExtensionExpansion = (extensionId: string) => {
    setExpandedExtensions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(extensionId)) {
        newSet.delete(extensionId);
      } else {
        newSet.add(extensionId);
      }
      return newSet;
    });
  };

  const handleInstall = (extensionId: string) => {
    console.log(`Installing extension: ${extensionId}`);
    // TODO: Implement extension installation
  };

  const getExtensionIcon = (extension: Extension) => {
    if (extension.type === 'agent' && extension.icon) {
      // Map agent icons
      const iconMap = { FileText, Bot, Terminal, AtSign };
      if (extension.icon in iconMap) {
        const IconComponent = iconMap[extension.icon as keyof typeof iconMap];
        return <IconComponent className="w-3.5 h-3.5 text-[#858585]" />;
      }
    } else if (extension.type === 'mcp') {
      return <Terminal className="w-3.5 h-3.5 text-[#858585]" />;
    }
    return <Puzzle className="w-3.5 h-3.5 text-[#858585]" />;
  };

  const getStatusBadge = (extension: Extension) => {
    if (extension.type === 'agent') {
      return (
        <span className="px-2 py-0.5 bg-[#4fc3f7]/20 text-[#4fc3f7] text-[9px] rounded uppercase">
          Agent
        </span>
      );
    } else if (extension.type === 'mcp') {
      return (
        <span className="px-2 py-0.5 bg-[#858585]/20 text-[#858585] text-[9px] rounded uppercase">
          MCP
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-[#2d2d2d] text-[#858585] text-[9px] rounded uppercase">
        {extension.category}
      </span>
    );
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2 overflow-y-auto flex-1">
        {/* Header */}
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Extensions</span>
          <div className="flex items-center gap-1">
            <Puzzle className="w-3 h-3" />
            <span className="text-[#666]">{allExtensions.length}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-2 mb-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#858585]" />
          <input
            type="text"
            placeholder="Search extensions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2d2d2d] border border-[#454545] rounded text-xs px-7 py-1.5 placeholder-[#858585] focus:outline-none focus:border-[#007acc]"
          />
        </div>

        {/* Extension Request Button */}
        <div className="mb-3">
          <ExtensionRequestButton />
        </div>

        {/* Extensions List */}
        <div className="space-y-1">
          {/* Campaign Director Extension - Premium Extension */}
          <div className="rounded border bg-[#1e1e1e] border-[#2d2d2d] border-l-2 border-l-[#ffcc02]">
            {/* Campaign Director Header */}
            <div 
              className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[#252526] transition-colors"
              onClick={() => toggleExtensionExpansion('campaign-director')}
            >
              {/* Expand/Collapse Arrow */}
              <div className="flex-shrink-0">
                {expandedExtensions.has('campaign-director') ? (
                  <ChevronDown className="w-3 h-3 text-[#858585]" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-[#858585]" />
                )}
              </div>

              {/* Extension Icon */}
              <div className="flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-[#858585]" />
              </div>

              {/* Extension Name and Download */}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#cccccc] truncate">
                  Campaign Director
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-2 h-2 text-[#858585] flex-shrink-0" />
                  <span className="text-[10px] text-[#858585] truncate">
                    Download Now
                  </span>
                </div>
              </div>

              {/* Price Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Purchase Campaign Director for $199.00');
                  }}
                  className="px-1.5 py-1 text-[9px] rounded transition-colors bg-[#2d2d2d] hover:bg-[#454545] text-[#ffcc02] border border-[#ffcc02]/40 hover:border-[#ffcc02]/60 font-sm"
                >
                  $199.00
                </button>
              </div>
            </div>

            {/* Expanded Content for Campaign Director */}
            {expandedExtensions.has('campaign-director') && (
              <div className="px-2 pb-2 border-t border-[#2d2d2d] bg-[#1a1a1a]">
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-[#b3b3b3]">
                      by EAC Team • v1.0.0
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 text-[#ffcc02] fill-current" />
                      <span className="text-[9px] text-[#b3b3b3]">4.9</span>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-[#b3b3b3] leading-relaxed">
                    Enterprise-level marketing campaign orchestration. Generate and schedule 100+ posts across multiple platforms with intelligent content distribution and timing optimization.
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#4fc3f7]/20 text-[#4fc3f7] text-[9px] rounded uppercase">
                      Agent
                    </span>
                    <span className="px-2 py-0.5 bg-[#ff6b6b]/20 text-[#ff6b6b] text-[9px] rounded uppercase">
                      Campaign
                    </span>
                    <span className="px-2 py-0.5 bg-[#51cf66]/20 text-[#51cf66] text-[9px] rounded uppercase">
                      Automation
                    </span>
                  </div>

                  {/* Campaign Director features */}
                  <div className="mt-3 space-y-1">
                    <div className="text-[10px] text-[#858585] uppercase tracking-wide">Features:</div>
                    <ul className="text-[10px] text-[#b3b3b3] space-y-0.5 pl-2">
                      <li>• 100+ Post Campaign Generation</li>
                      <li>• Multi-Platform Scheduling (Twitter, LinkedIn, Instagram, Facebook)</li>
                      <li>• Campaign Phase Management (Awareness → Conversion)</li>
                      <li>• Intelligent Content Distribution & Timing</li>
                      <li>• Batch Processing with Progress Tracking</li>
                      <li>• Instructions File Integration</li>
                    </ul>
                  </div>

                  {/* Usage Instructions */}
                  <div className="mt-3 space-y-1">
                    <div className="text-[10px] text-[#858585] uppercase tracking-wide">Usage:</div>
                    <div className="text-[10px] text-[#b3b3b3] leading-relaxed">
                      Activate the agent, then use <code className="bg-[#2d2d2d] px-1 rounded text-[#4fc3f7]">/director</code> command in terminal to start campaign creation.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Marketing Officer Extension - Always at top */}
          <div className="rounded border bg-[#1e1e1e] border-[#2d2d2d] border-l-2 border-l-[#ffcc02]">
            {/* Marketing Officer Header */}
            <div 
              className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[#252526] transition-colors"
              onClick={() => toggleExtensionExpansion('marketing-officer')}
            >
              {/* Expand/Collapse Arrow */}
              <div className="flex-shrink-0">
                {expandedExtensions.has('marketing-officer') ? (
                  <ChevronDown className="w-3 h-3 text-[#858585]" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-[#858585]" />
                )}
              </div>

              {/* Extension Icon */}
              <div className="flex-shrink-0">
                <AtSign className="w-3.5 h-3.5 text-[#858585]" />
              </div>

              {/* Extension Name and Download */}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#cccccc]">
                  Marketing Officer
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-2 h-2 text-[#858585] flex-shrink-0" />
                  <span className="text-[10px] text-[#858585] truncate">
                    Download Now
                  </span>
                </div>
              </div>

              {/* Price Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Purchase Marketing Officer for $49.00');
                  }}
                  className="px-1.5 py-1 text-[9px] rounded transition-colors bg-[#2d2d2d] hover:bg-[#454545] text-[#ffcc02] border border-[#ffcc02]/40 hover:border-[#ffcc02]/60 font-sm"
                >
                  $49.00
                </button>
              </div>
            </div>

            {/* Expanded Content for Marketing Officer */}
            {expandedExtensions.has('marketing-officer') && (
              <div className="px-2 pb-2 border-t border-[#2d2d2d] bg-[#1a1a1a]">
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-[#b3b3b3]">
                      by EAC Team • v1.0.0
                    </div>
                    <div className="flex items-center gap-1">

                    </div>
                  </div>
                  
                  <div className="text-[10px] text-[#b3b3b3] leading-relaxed">
                    Your AI CMO that researches audiences, plans strategy, creates the assets, and optimizes performance—on command.
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#ffcc02]/20 text-[#ffcc02] text-[9px] rounded uppercase">
                      Premium
                    </span>
                    <span className="px-2 py-0.5 bg-[#4fc3f7]/20 text-[#4fc3f7] text-[9px] rounded uppercase">
                      Agent
                    </span>
                  </div>

                  {/* Additional Marketing Officer features */}
                  <div className="mt-3 space-y-1">
                    <div className="text-[10px] text-[#858585] uppercase tracking-wide">Features:</div>
                    <ul className="text-[10px] text-[#b3b3b3] space-y-0.5 pl-2">
                      <li>• Campaign Strategy & Content Creation</li>
                      <li>• Experimentation & Optimization</li>
                      <li>• Go‑to‑Market Strategy & Planning</li>
                      <li>• ROI Tracking & Budget Management</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logo Generator Extension - Premium Extension */}
          <div className="rounded border bg-[#1e1e1e] border-[#2d2d2d] border-l-2 border-l-[#ffcc02]">
            {/* Logo Generator Header */}
            <div 
              className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[#252526] transition-colors"
              onClick={() => toggleExtensionExpansion('logo-generator')}
            >
              {/* Expand/Collapse Arrow */}
              <div className="flex-shrink-0">
                {expandedExtensions.has('logo-generator') ? (
                  <ChevronDown className="w-3 h-3 text-[#858585]" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-[#858585]" />
                )}
              </div>

              {/* Extension Icon */}
              <div className="flex-shrink-0">
                <Puzzle className="w-3.5 h-3.5 text-[#858585]" />
              </div>

              {/* Extension Name and Download */}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#cccccc] truncate">
                  Logo Generator
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-2 h-2 text-[#858585] flex-shrink-0" />
                  <span className="text-[10px] text-[#858585] truncate">
                    Download Now
                  </span>
                </div>
              </div>

              {/* Price Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Purchase Logo Generator for $29.00');
                  }}
                  className="px-1.5 py-1 text-[9px] rounded transition-colors bg-[#2d2d2d] hover:bg-[#454545] text-[#ffcc02] border border-[#ffcc02]/40 hover:border-[#ffcc02]/60 font-sm"
                >
                  $29.00
                </button>
              </div>
            </div>

            {/* Expanded Content for Logo Generator */}
            {expandedExtensions.has('logo-generator') && (
              <div className="px-2 pb-2 border-t border-[#2d2d2d] bg-[#1a1a1a]">
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-[#b3b3b3]">
                      by EAC Design Team • v1.0.0
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 text-[#ffcc02] fill-current" />
                      <span className="text-[9px] text-[#b3b3b3]">4.7</span>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-[#b3b3b3] leading-relaxed">
                    AI-powered logo creation and brand identity generation. Create professional logos, color palettes, and brand guidelines in minutes with advanced AI design algorithms.
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#ffcc02]/20 text-[#ffcc02] text-[9px] rounded uppercase">
                      Premium
                    </span>
                    <span className="px-2 py-0.5 bg-[#9c88ff]/20 text-[#9c88ff] text-[9px] rounded uppercase">
                      Design
                    </span>
                    <span className="px-2 py-0.5 bg-[#4fc3f7]/20 text-[#4fc3f7] text-[9px] rounded uppercase">
                      AI
                    </span>
                  </div>

                  {/* Logo Generator features */}
                  <div className="mt-3 space-y-1">
                    <div className="text-[10px] text-[#858585] uppercase tracking-wide">Features:</div>
                    <ul className="text-[10px] text-[#b3b3b3] space-y-0.5 pl-2">
                      <li>• AI-Powered Logo Creation</li>
                      <li>• Brand Identity Package Generation</li>
                      <li>• Color Palette & Typography Suggestions</li>
                      <li>• Multiple Format Exports (SVG, PNG, PDF)</li>
                      <li>• Brand Guidelines Documentation</li>
                      <li>• Logo Variations & Mockups</li>
                    </ul>
                  </div>

                  {/* Usage Instructions */}
                  <div className="mt-3 space-y-1">
                    <div className="text-[10px] text-[#858585] uppercase tracking-wide">Usage:</div>
                    <div className="text-[10px] text-[#b3b3b3] leading-relaxed">
                      Install and use <code className="bg-[#2d2d2d] px-1 rounded text-[#9c88ff]">/logo</code> command to start creating professional logos with AI assistance.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {filteredExtensions.length === 0 ? (
            <div className="text-center py-6">
              <Puzzle className="w-8 h-8 text-[#858585] mx-auto mb-2" />
              <div className="text-xs text-[#858585]">No extensions found</div>
              <div className="text-[10px] text-[#656565]">
                {searchQuery ? 'Try a different search term' : 'Extensions will appear here when available'}
              </div>
            </div>
          ) : (
            filteredExtensions.map((extension) => {
              const isExpanded = expandedExtensions.has(extension.id);
              const isInstalled = extension.isInstalled || extension.type === 'agent' || extension.type === 'mcp';
              
              return (
                <div
                  key={extension.id}
                  className={`rounded border bg-[#1e1e1e] border-[#2d2d2d] ${isInstalled ? 'border-l-2 border-l-[#007acc]' : ''}`}
                >
                  {/* Extension Header - Always Visible */}
                  <div 
                    className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[#252526] transition-colors"
                    onClick={() => toggleExtensionExpansion(extension.id)}
                  >
                    {/* Expand/Collapse Arrow */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-[#858585]" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-[#858585]" />
                      )}
                    </div>

                    {/* Extension Icon */}
                    <div className="flex-shrink-0">
                      {getExtensionIcon(extension)}
                    </div>

                    {/* Extension Name and Downloads */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[#cccccc]">
                        {extension.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-2 h-2 text-[#858585] flex-shrink-0" />
                        <span className="text-[10px] text-[#858585] truncate">
                          {extension.downloads.toLocaleString()} downloads
                        </span>
                      </div>
                    </div>

                    {/* Install Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstall(extension.id);
                        }}
                        disabled={extension.isInstalled || extension.type === 'agent' || extension.type === 'mcp'}
                        className={cn(
                          "px-2 py-1 text-[10px] rounded transition-colors",
                          extension.isInstalled || extension.type === 'agent' || extension.type === 'mcp'
                            ? "bg-[#2d2d2d] text-[#858585] cursor-default"
                            : "bg-[#007acc] hover:bg-[#106ebe] text-white"
                        )}
                      >
                        {extension.type === 'agent' || extension.type === 'mcp' ? 'Active' : extension.isInstalled ? 'Installed' : 'Install'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-2 pb-2 border-t border-[#2d2d2d] bg-[#1a1a1a]">
                      {/* Extension Details */}
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-[#b3b3b3]">
                            by {extension.author} • v{extension.version}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 text-[#ffcc02]" />
                            <span className="text-[10px] text-[#858585]">{extension.rating}</span>
                          </div>
                        </div>
                        
                        <div className="text-[10px] text-[#b3b3b3] leading-relaxed">
                          {extension.description}
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(extension)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
