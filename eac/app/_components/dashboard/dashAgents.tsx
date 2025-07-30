// Agent Panel Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/dashAgents.tsx

"use client";

import { cn } from "@/lib/utils";
import { useAgentStore } from "@/store";
import { CheckCircle, Circle } from "lucide-react";

export function DashAgents() {
  const { agents, activeAgentId, setActiveAgent } = useAgentStore();

  const handleAgentSelect = (agentId: string) => {
    // Toggle agent - if already active, deactivate it; otherwise activate it
    if (activeAgentId === agentId) {
      setActiveAgent(null);
    } else {
      setActiveAgent(agentId);
    }
  };

  return (
    <div className="p-2">
      {/* Header */}
      <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1 mb-2">
        <span>Agents</span>
      </div>

      {/* Agent List */}
      <div className="space-y-1">
        {agents.map((agent) => {
          const isActive = agent.id === activeAgentId;
          
          return (
            <div
              key={agent.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                "hover:bg-[#2d2d2d]/50",
                isActive && "bg-[#2d2d2d] border border-[#007acc]/30"
              )}
              onClick={() => handleAgentSelect(agent.id)}
            >
              {/* Agent Icon */}
              <div className="flex-shrink-0 text-lg">
                {agent.icon}
              </div>

              {/* Agent Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "text-sm font-medium",
                    isActive ? "text-[#cccccc]" : "text-[#b3b3b3]"
                  )}>
                    {agent.name}
                  </h3>
                  
                  {/* Active Indicator */}
                  <div className="flex-shrink-0">
                    {isActive ? (
                      <CheckCircle className="w-4 h-4 text-[#007acc]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#585858]" />
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-[#858585] mt-0.5 line-clamp-2">
                  {agent.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Agent Details */}
      {activeAgentId && (
        <div className="mt-4 p-3 bg-[#1e1e1e] border border-[#2d2d2d] rounded-md">
          {(() => {
            const activeAgent = agents.find(a => a.id === activeAgentId);
            if (!activeAgent) return null;

            return (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{activeAgent.icon}</span>
                  <h4 className="text-sm font-medium text-[#cccccc]">
                    {activeAgent.name} Active
                  </h4>
                  <div className="w-2 h-2 bg-[#4ec9b0] rounded-full animate-pulse"></div>
                </div>
                
                <p className="text-xs text-[#858585] mb-3">
                  {activeAgent.description}
                </p>

                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wide">
                    Available Tools
                  </h5>
                  
                  {activeAgent.tools.map((tool) => (
                    <div
                      key={tool.id}
                      className="p-2 bg-[#0e0e0e] border border-[#333] rounded text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[#4ec9b0]">
                          {tool.command}
                        </span>
                        <span className="text-[#858585]">
                          {tool.name}
                        </span>
                      </div>
                      <p className="text-[#b3b3b3]">
                        {tool.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-2 bg-[#0e1419] border border-[#1f2937] rounded text-xs">
                  <p className="text-[#4ec9b0] font-medium mb-1">💡 Usage:</p>
                  <p className="text-[#b3b3b3]">
                    Use <code className="text-[#fbbf24] bg-[#1f2937] px-1 rounded">{"/"}</code> in 
                    the terminal chat and toggle to <strong>Agent Tools</strong> to access these commands.
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Empty State */}
      {agents.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🤖</div>
          <p className="text-sm text-[#858585] mb-1">No agents available</p>
          <p className="text-xs text-[#656565]">
            Agents will appear here when they&apos;re configured
          </p>
        </div>
      )}
    </div>
  );
}
