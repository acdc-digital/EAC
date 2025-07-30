// Agent Panel Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/dashAgents.tsx

"use client";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/store";
import { Bot, CheckCircle, ChevronDown, ChevronRight, Circle, FileText, Terminal } from "lucide-react";
import { useState } from "react";

// Icon mapping for agent icons
const iconMap = {
  FileText,
  Bot,
  Terminal,
  // Add more icons as needed
} as const;

export function DashAgents() {
  const { agents, activeAgentId, setActiveAgent } = useAgentStore();
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  const handleAgentSelect = (agentId: string) => {
    // Toggle agent - if already active, deactivate it; otherwise activate it
    if (activeAgentId === agentId) {
      setActiveAgent(null);
    } else {
      setActiveAgent(agentId);
    }
  };

  const toggleAgentDetails = (agentId: string) => {
    setExpandedAgents(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        {/* Header */}
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Agents</span>
          <div className="flex items-center gap-1">
            {activeAgentId && <div className="w-2 h-2 bg-[#4ec9b0] rounded-full"></div>}
            <span className="text-[#666]">{agents.length}</span>
          </div>
        </div>

        {/* Agent List */}
        <div className="space-y-1 mt-2">
          {agents.map((agent) => {
            const isActive = agent.id === activeAgentId;
            const isExpanded = expandedAgents.has(agent.id);
            
            return (
              <div key={agent.id} className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
                {/* Agent Header - Clickable for expansion */}
                <div
                  className={cn(
                    "flex items-center gap-2 p-2 cursor-pointer transition-colors hover:bg-[#2d2d2d]/30",
                    isActive && "bg-[#2d2d2d]/50"
                  )}
                  onClick={() => toggleAgentDetails(agent.id)}
                >
                  {/* Expand/Collapse Button */}
                  <div className="hover:bg-[#2d2d2d] rounded p-0.5">
                    {isExpanded ?
                      <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> :
                      <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                    }
                  </div>

                  {/* Agent Icon */}
                  <div className="flex-shrink-0 text-sm text-[#858585]">
                    {(() => {
                      // Handle icon rendering - agent.icon is now always a string
                      if (agent.icon in iconMap) {
                        const IconComponent = iconMap[agent.icon as keyof typeof iconMap];
                        return <IconComponent className="w-3.5 h-3.5 text-[#858585]" />;
                      } else {
                        // Fallback for unknown icon names or emoji strings
                        return <span className="text-[#858585]">{agent.icon}</span>;
                      }
                    })()}
                  </div>

                  {/* Agent Name */}
                  <span className={cn(
                    "text-xs font-medium flex-1",
                    isActive ? "text-[#cccccc]" : "text-[#b3b3b3]"
                  )}>
                    {agent.name}
                  </span>

                  {/* Status Indicators - Clickable for agent activation */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAgentSelect(agent.id);
                    }}
                    className="flex items-center gap-1 hover:bg-[#2d2d2d] rounded p-1 transition-colors"
                    title={isActive ? "Deactivate agent" : "Activate agent"}
                  >
                    {isActive ? (
                      <CheckCircle className="w-3.5 h-3.5 text-[#007acc]" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[#585858]" />
                    )}
                  </button>
                </div>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-2 pb-2 space-y-2">
                    <Separator className="bg-[#2d2d2d]" />
                    
                    {/* Purpose/Overview */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-medium text-[#b3b3b3] uppercase tracking-wide px-1">
                        Purpose
                      </div>
                      <div className="text-[10px] text-[#cccccc] px-1 leading-relaxed">
                        {agent.description}
                      </div>
                    </div>

                    {/* Tools */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-medium text-[#b3b3b3] uppercase tracking-wide px-1">
                        Tools ({agent.tools.length})
                      </div>
                      {agent.tools.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex items-center justify-between px-1 py-0.5 text-[10px]"
                        >
                          <span className="font-mono text-[#4ec9b0]">
                            {tool.command}
                          </span>
                          <span className="text-[#858585] text-right truncate max-w-[120px]">
                            {tool.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Purpose/Overview */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-medium text-[#b3b3b3] uppercase tracking-wide px-1">
                        Purpose
                      </div>
                      <div className="text-[10px] text-[#cccccc] px-1 leading-relaxed">
                        {agent.description}
                      </div>
                    </div>

                    {/* Active Agent Usage Hint */}
                    {isActive && (
                      <div className="px-1 py-1 bg-[#0e1419] border border-[#1f2937] rounded text-[9px]">
                        <div className="flex items-center gap-1 text-[#4ec9b0] font-medium">
                          <Terminal className="w-2.5 h-2.5" />
                          <span>Active in Terminal</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {agents.length === 0 && (
          <div className="text-center py-6">
            <Bot className="w-8 h-8 text-[#585858] mx-auto mb-2" />
            <p className="text-xs text-[#858585] mb-1">No agents available</p>
            <p className="text-[10px] text-[#656565]">
              Agents will appear here when configured
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
