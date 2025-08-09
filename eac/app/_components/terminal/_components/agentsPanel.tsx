// Agents Panel Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/agentsPanel.tsx

"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useMCP } from "@/lib/hooks/useMCP";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/store";
import { useSessionStore } from "@/store/terminal/session";
import { useConvexAuth } from "convex/react";
import { Bot, Calendar, FilePlus, FileText, LucideIcon, MessageSquare, Twitter } from "lucide-react";
import { useState } from "react";

interface AgentsPanelProps {
  className?: string;
}

export function AgentsPanel({ className }: AgentsPanelProps) {
  const { isAuthenticated } = useConvexAuth();
  const { setAgentsPanelOpen } = useSessionStore();
  const { agents, activeAgentId, setActiveAgent } = useAgentStore();
  const { availableTools: mcpTools } = useMCP();
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  // Map icon strings to Lucide React components
  const getIconComponent = (iconName: string): LucideIcon => {
    console.log('Getting icon for:', iconName);
    const iconMap: Record<string, LucideIcon> = {
      'FileText': FileText,
      'FilePlus': FilePlus,
      'Calendar': Calendar,
      'Twitter': Twitter,
      'Bot': Bot,
    };
    const icon = iconMap[iconName] || Bot;
    console.log('Mapped to:', icon.name || 'Bot');
    return icon;
  };

  const handleBackToChat = () => {
    setAgentsPanelOpen(false);
  };

  const handleAgentSelect = (agentId: string) => {
    setActiveAgent(agentId);
  };

  const handleToolSelect = (toolId: string, isAgent: boolean = true) => {
    setSelectedToolId(toolId);
    // Could add tool-specific logic here
  };

  // Flatten all agent tools into a single list with metadata (excluding premium extensions)
  const allAgentTools = agents
    .filter(agent => agent.id !== 'director' && agent.id !== 'cmo') // Filter out premium extensions
    .flatMap(agent => {
      console.log('Agent:', agent.name, 'Icon:', agent.icon);
      return agent.tools.map(tool => ({
        ...tool,
        agentId: agent.id,
        agentName: agent.name,
        agentIcon: agent.icon,
        type: 'agent' as const,
        isActive: activeAgentId === agent.id
      }));
    });

  // Format MCP tools to match agent tools structure
  // const allMcpTools = (mcpTools || []).map(tool => ({
  //   id: tool.name,
  //   name: tool.name,
  //   command: `/${tool.name}`,
  //   description: tool.description,
  //   agentId: 'mcp',
  //   agentName: 'MCP Server',
  //   type: 'mcp' as const,
  //   isActive: false
  // }));

  // Temporarily comment out MCP tools from terminal selection
  const allTools = [...allAgentTools]; // ...allMcpTools];

  if (!isAuthenticated) {
    return (
      <div className={cn("flex-1 bg-[#0e0e0e] flex flex-col items-center justify-center p-6", className)}>
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-[#858585] mx-auto mb-4" />
          <div className="text-sm text-[#cccccc] mb-2">Access AI Agents</div>
          <div className="text-xs text-[#858585]">Sign in to view and manage AI agents</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 bg-[#0e0e0e] flex flex-col min-h-0", className)}>
      {/* Agents List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {allTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Bot className="w-12 h-12 text-[#858585] mb-4" />
            <div className="text-sm text-[#cccccc] mb-2">No agents available</div>
            <div className="text-xs text-[#858585]">Agent tools will appear here when available</div>
          </div>
        ) : (
          <div className="h-full">
            {/* Table Header - Fixed */}
            <div className="sticky top-0 z-10 flex items-center px-3 py-1.5 bg-[#2d2d30] border-b border-[#454545] text-xs text-[#858585]">
              <div className="flex-shrink-0 w-16">Select</div>
              <div className="flex-shrink-0 w-8">Icon</div>
              <div className="flex-shrink-0 w-24">Agent</div>
              <div className="flex-shrink-0 w-32">Tool</div>
              <div className="flex-1 px-2">Description</div>
              <div className="flex-shrink-0 w-16 text-center">Type</div>
            </div>
            
            {/* Tool Rows - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-vscode">
              {allTools.map((tool) => (
                <div
                  key={`${tool.agentId}-${tool.id}`}
                  className={cn(
                    "w-full flex items-center px-3 py-1.5 transition-all duration-200 hover:bg-[#2a2a2a] border-b border-[#333]",
                    tool.isActive && tool.type === 'agent'
                      ? "border-l-2 border-l-[#0078d4]"
                      : ""
                  )}
                >
                  <div className="flex-shrink-0 w-16 flex items-center justify-start">
                    {tool.type === 'agent' ? (
                      <Checkbox
                        checked={tool.isActive}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            handleAgentSelect(tool.agentId);
                          } else if (tool.isActive) {
                            setActiveAgent(null);
                          }
                        }}
                        className="w-4 h-4"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-sm border border-[#454545] bg-[#333] flex items-center justify-center">
                        <span className="text-[10px] text-[#858585] font-bold">M</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    {tool.type === 'agent' && 'agentIcon' in tool ? (
                      (() => {
                        console.log('Rendering icon for tool:', tool.name, 'agentIcon:', tool.agentIcon);
                        const IconComponent = getIconComponent(tool.agentIcon as string);
                        return <IconComponent className="w-4 h-4 text-[#858585]" />;
                      })()
                    ) : (
                      <Bot className="w-4 h-4 text-[#858585]" />
                    )}
                  </div>
                  <div className="flex-shrink-0 w-24 text-xs text-[#cccccc]">
                    {tool.agentName}
                  </div>
                  <div className="flex-shrink-0 w-32 text-xs text-[#4fc3f7]">
                    {tool.command}
                  </div>
                  <div className="flex-1 px-2 min-w-0">
                    <div className="text-xs text-[#b3b3b3] truncate">
                      {tool.description}
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-16 text-center text-xs">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px]",
                      tool.type === 'agent' 
                        ? "bg-[#4fc3f7]/20 text-[#4fc3f7]" 
                        : "bg-[#858585]/20 text-[#858585]"
                    )}>
                      {tool.type === 'agent' ? 'Agent' : 'MCP'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
