// Debug Panel Component for Sidebar
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/dashDebug.tsx

"use client";

import { ClearStorageButton } from "@/components/ClearStorageButton";
import { StorageDebugger } from "@/components/StorageDebugger";
import { Separator } from "@/components/ui/separator";
import {
    Activity,
    ChevronDown,
    ChevronRight,
    Database,
    Eye,
    Settings2,
    Terminal
} from "lucide-react";
import { useState } from "react";

export function DashDebug() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['storage']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const logPerformanceData = () => {
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = {
        timing: window.performance.timing,
        memory: (window.performance as unknown as { memory?: unknown }).memory || 'Not available',
        navigation: window.performance.navigation,
      };
      console.log('🚀 Performance Data:', perfData);
    }
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Debug Console</span>
        </div>

        {/* Debug Sections */}
        <div className="space-y-1 mt-2">
        
        {/* Storage Management */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('storage')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('storage') ? 
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <Database className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">Storage</span>
          </button>
          
          {expandedSections.has('storage') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              <div className="px-1 space-y-2">
                <div className="text-xs text-[#858585]">Clear all data</div>
                <ClearStorageButton />
              </div>
            </div>
          )}
        </div>

        {/* Storage Inspector */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('inspector')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('inspector') ? 
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <Eye className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">Inspector</span>
          </button>
          
          {expandedSections.has('inspector') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              <div className="px-1">
                <StorageDebugger />
              </div>
            </div>
          )}
        </div>

        {/* Performance */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('performance')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('performance') ? 
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <Activity className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">Performance</span>
          </button>
          
          {expandedSections.has('performance') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-[#858585]">Log browser metrics</span>
                <button
                  onClick={logPerformanceData}
                  className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                >
                  Log
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Console Logging */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('console')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('console') ? 
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <Terminal className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">Console</span>
          </button>
          
          {expandedSections.has('console') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              <div className="px-1 text-xs text-[#858585]">
                Console output and logging information will appear in your browser&apos;s developer console.
              </div>
            </div>
          )}
        </div>

        {/* Environment */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d] p-2">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium">Environment</span>
          </div>
          <div className="space-y-1 px-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#858585]">Host</span>
              <span className="text-xs font-mono">localhost:3001</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#858585]">Framework</span>
              <span className="text-xs font-mono">Next.js 15</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#858585]">State</span>
              <span className="text-xs font-mono">Zustand</span>
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}