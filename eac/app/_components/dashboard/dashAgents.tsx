// Agent Panel Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/dashAgents.tsx

"use client";

import { useMCP } from "@/lib/hooks/useMCP";
import { useAgentStore } from "@/store";
import { AtSign, Bot, Calendar, ChevronDown, ChevronRight, Command, FileText, Search, Terminal } from "lucide-react";
import { useState } from "react";

// Icon mapping for agent icons
const iconMap = {
  FileText,
  Bot,
  Terminal,
  Command,
  AtSign,
  Calendar,
  // Add more icons as needed
} as const;

export function DashAgents() {
  const { agents, activeAgentId } = useAgentStore();
  const { availableTools: mcpTools } = useMCP();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  // Filter agents and tools based on search
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.tools.some(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredMCPTools = (mcpTools || []).filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get all tools flattened for count
  const allTools = agents.flatMap(agent => agent.tools).length + (mcpTools?.length || 0);

  const toggleAgentExpansion = (agentId: string) => {
    setExpandedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col relative">
      <div className="p-2 pb-12 overflow-y-auto flex-1">
        {/* Header */}
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Agents & Tools</span>
          <div className="flex items-center gap-1">
            {activeAgentId && <div className="w-2 h-2 bg-[#4ec9b0] rounded-full"></div>}
            <span className="text-[#666]">{allTools}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-2 mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#858585]" />
          <input
            type="text"
            placeholder="Search agents and tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2d2d2d] border border-[#454545] rounded text-xs px-7 py-1.5 placeholder-[#858585] focus:outline-none focus:border-[#007acc]"
          />
        </div>

        {/* Informational Agent List */}
        <div className="space-y-1">
          {filteredAgents.map((agent) => {
            const isActive = agent.id === activeAgentId;
            const isExpanded = expandedAgents.has(agent.id);
            const firstTool = agent.tools[0];
            
            return (
              <div key={agent.id} className={`rounded border bg-[#1e1e1e] border-[#2d2d2d] ${isActive ? 'border-l-2 border-l-[#007acc]' : ''}`}>
                {/* Agent Header - Always Visible */}
                <div 
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[#252526] transition-colors"
                  onClick={() => toggleAgentExpansion(agent.id)}
                >
                  {/* Expand/Collapse Arrow */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-[#858585]" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-[#858585]" />
                    )}
                  </div>

                  {/* Agent Icon */}
                  <div className="flex-shrink-0">
                    {(() => {
                      if (agent.icon in iconMap) {
                        const IconComponent = iconMap[agent.icon as keyof typeof iconMap];
                        return <IconComponent className="w-3.5 h-3.5 text-[#858585]" />;
                      } else {
                        return <span className="text-[#858585] text-sm">{agent.icon}</span>;
                      }
                    })()}
                  </div>

                  {/* Agent Name and First Tool */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs ${isActive ? 'text-[#cccccc]' : 'text-[#b3b3b3]'}`}>
                      {agent.name}
                    </div>
                    {firstTool && (
                      <div className="flex items-center gap-1">
                        <Command className="w-2 h-2 text-[#4ec9b0] flex-shrink-0" />
                        <span className="font-mono text-[#4ec9b0] text-[10px] truncate">
                          {firstTool.command}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tool Count */}
                  <div className="flex-shrink-0 text-[10px] text-[#858585]">
                    {agent.tools.length} tool{agent.tools.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-2 pb-2 border-t border-[#2d2d2d] bg-[#1a1a1a]">
                    {/* Agent Description */}
                    <div className="text-[10px] text-[#b3b3b3] mb-2 mt-2 leading-relaxed">
                      {agent.description}
                    </div>

                    {/* All Tools List */}
                    <div className="space-y-1">
                      {agent.tools.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex items-center gap-2 px-2 py-1 bg-[#2d2d2d] rounded text-[10px]"
                        >
                          <Command className="w-2 h-2 text-[#4ec9b0] flex-shrink-0" />
                          <span className="font-mono text-[#4ec9b0] flex-shrink-0">
                            {tool.command}
                          </span>
                          <span className="text-[#858585] truncate">
                            {tool.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* MCP Tools Section */}
        {mcpTools && mcpTools.length > 0 && (
          <div className="mt-3">
            <div className="p-2 rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <div className="flex items-center gap-2 mb-1">
                <Terminal className="w-3.5 h-3.5 text-[#858585]" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-[#b3b3b3]">
                    MCP Server Tools
                  </div>
                  <div className="text-[10px] text-[#858585]">
                    {filteredMCPTools.length} tool{filteredMCPTools.length !== 1 ? 's' : ''} available
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-[#b3b3b3] mb-1 leading-relaxed">
                Model Context Protocol tools for code analysis and project management
              </div>

              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filteredMCPTools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-center gap-2 px-2 py-1 bg-[#2d2d2d] rounded text-[10px]"
                  >
                    <Command className="w-2 h-2 text-[#4fc3f7] flex-shrink-0" />
                    <span className="font-mono text-[#4fc3f7] flex-shrink-0">
                      {tool.name}
                    </span>
                    <span className="text-[#858585] truncate">
                      {tool.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredAgents.length === 0 && (!mcpTools || mcpTools.length === 0) && (
          <div className="text-center py-6">
            <Bot className="w-8 h-8 text-[#585858] mx-auto mb-2" />
            <p className="text-xs text-[#858585] mb-1">No agents or tools found</p>
            <p className="text-[10px] text-[#656565]">
              {searchQuery ? 'Try a different search term' : 'Agents will appear here when configured'}
            </p>
          </div>
        )}
      </div>

      {/* Help Text - Absolutely positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-[#181818] border-t border-[#2d2d2d]">
        <div className="text-[10px] text-[#858585] text-center">
          Use the terminal's Agents panel to select and activate agents
        </div>
      </div>
    </div>
  );
}
