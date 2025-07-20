// Activity Bar Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashActivityBar.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search, 
  GitBranch, 
  Bug, 
  Grid3X3,
  Settings,
  BarChart3,
  DollarSign,
  TrendingUp
} from "lucide-react";

interface ActivityBarProps {
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

export function DashActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
  const activityItems = [
    { id: "explorer", icon: FileText, label: "Explorer" },
    { id: "financial", icon: DollarSign, label: "Financial Overview" },
    { id: "analytics", icon: TrendingUp, label: "Analytics" },
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "search", icon: Search, label: "Search" },
    { id: "source", icon: GitBranch, label: "Source Control" },
    { id: "debug", icon: Bug, label: "Debug" },
    { id: "extensions", icon: Grid3X3, label: "Extensions" },
  ];

  return (
    <aside className="w-12 bg-[#181818] border-r border-[#2d2d2d] flex flex-col">
      {/* Activity Icons */}
      <div className="flex flex-col items-center py-2 space-y-1">
        {activityItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => onPanelChange(item.id)}
              className={`
                w-11 h-11 rounded-none hover:bg-[#2d2d2d] relative
                ${isActive 
                  ? 'bg-[#2d2d2d] border-l-2 border-[#007acc]' 
                  : 'border-l-2 border-transparent'
                }
              `}
              title={item.label}
            >
              <Icon 
                className={`w-5 h-5 ${
                  isActive ? 'text-[#cccccc]' : 'text-[#858585]'
                }`} 
              />
            </Button>
          );
        })}
      </div>

      {/* Settings at bottom */}
      <div className="mt-auto mb-2 flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className="w-11 h-11 rounded-none hover:bg-[#2d2d2d]"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-[#858585]" />
        </Button>
      </div>
    </aside>
  );
} 