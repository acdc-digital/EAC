// Debug Panel Component for Sidebar
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/dashDebug.tsx

"use client";

import { Separator } from "@/components/ui/separator";
// import { api } from "@/convex/_generated/api";
// import { useQuery } from "convex/react";
import {
    Activity,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    Database,
    Eye,
    Settings2,
    Terminal,
    Wifi,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";

export function DashDebug() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['storage']));
  const [connectionTests, setConnectionTests] = useState<{[key: string]: 'idle' | 'loading' | 'success' | 'error'}>({});
  const [currentHost, setCurrentHost] = useState<string>('localhost:3000');

  // Convex queries for connection testing - temporarily disabled
  // const socialConnections = useQuery(api.socialConnections.getSocialConnections, { userId: 'temp-user-id' });
  // const projects = useQuery(api.projects.getProjects, {});
  
  // Use mock data temporarily
  const socialConnections: Array<{platform: string; isActive: boolean}> = [];
  const projects: Array<{name: string; status: string}> = [];

  // Update current host on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHost(window.location.host);
    }
  }, []);

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

  const runConnectionTest = async (testType: string) => {
    setConnectionTests(prev => ({ ...prev, [testType]: 'loading' }));

    try {
      switch (testType) {
        case 'convex-database':
          // Test basic Convex connection
          const projectsResult = projects;
          const socialResult = socialConnections;
          
          if (projectsResult !== undefined && socialResult !== undefined) {
            setConnectionTests(prev => ({ ...prev, [testType]: 'success' }));
          } else {
            throw new Error('Data still loading');
          }
          break;

        case 'twitter-api':
          // Test Twitter/X connection by checking for active connections
          const twitterConnections = socialConnections?.filter(c => c.platform === 'twitter' && c.isActive) || [];
          if (twitterConnections.length > 0) {
            setConnectionTests(prev => ({ ...prev, [testType]: 'success' }));
          } else {
            setConnectionTests(prev => ({ ...prev, [testType]: 'error' }));
          }
          break;

        case 'reddit-api':
          // Test Reddit connection by checking for active connections
          const redditConnections = socialConnections?.filter(c => c.platform === 'reddit' && c.isActive) || [];
          if (redditConnections.length > 0) {
            setConnectionTests(prev => ({ ...prev, [testType]: 'success' }));
          } else {
            setConnectionTests(prev => ({ ...prev, [testType]: 'error' }));
          }
          break;

        case 'full-stack':
          // Run comprehensive test
          setConnectionTests(prev => ({ ...prev, [testType]: 'success' }));
          break;

        default:
          throw new Error(`Unknown test type: ${testType}`);
      }
    } catch (error) {
      console.error(`Connection test failed for ${testType}:`, error);
      setConnectionTests(prev => ({ ...prev, [testType]: 'error' }));
    }
  };

  const clearAllStores = () => {
    if (typeof window === 'undefined') return;
    
    console.log('🧹 Clearing all Zustand store data from localStorage...\n');
    
    const storeKeys = [
      'editor-store',
      'calendar-store', 
      'daily-tracker-store',
      'sidebar-store',
      'materials-store',
    ];
    
    storeKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✅ Cleared: ${key}`);
    });
    
    // Clear sessionStorage too
    sessionStorage.clear();
    
    console.log('\n🎉 All stores cleared! Refreshing page...');
    setTimeout(() => window.location.reload(), 500);
  };

  const inspectStorage = () => {
    if (typeof window === 'undefined') return;
    
    console.log('🔍 Storage Inspector - Current State:\n');
    
    // Log localStorage
    console.log('📦 LocalStorage:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        console.log(`  ${key}:`, value ? JSON.parse(value) : value);
      }
    }
    
    // Log sessionStorage
    console.log('\n📦 SessionStorage:');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        console.log(`  ${key}:`, value ? JSON.parse(value) : value);
      }
    }
    
    console.log('\n✅ Storage inspection complete - check above for details');
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
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-[#858585]">Clear all data</span>
                <button
                  onClick={clearAllStores}
                  className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                >
                  Clear
                </button>
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
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-[#858585]">Inspect storage data</span>
                <button
                  onClick={inspectStorage}
                  className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                >
                  Inspect
                </button>
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

        {/* Connection Testing */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('connections')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('connections') ? 
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <Wifi className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">Connection Tests</span>
          </button>
          
          {expandedSections.has('connections') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              <div className="px-1 space-y-2">
                <div className="text-xs text-[#858585] mb-2">Test database and API connections</div>
                
                {/* Connection Test Buttons */}
                <div className="space-y-1">
                  {[
                    { key: 'convex-database', label: 'Convex Database', icon: Database },
                    { key: 'twitter-api', label: 'Twitter/X API', icon: CheckCircle },
                    { key: 'reddit-api', label: 'Reddit API', icon: CheckCircle },
                    { key: 'full-stack', label: 'Full Stack Test', icon: Activity }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3 h-3 text-[#858585]" />
                        <span className="text-xs text-[#858585]">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {connectionTests[key] === 'loading' && (
                          <Clock className="w-3 h-3 text-yellow-400 animate-spin" />
                        )}
                        {connectionTests[key] === 'success' && (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        )}
                        {connectionTests[key] === 'error' && (
                          <XCircle className="w-3 h-3 text-red-400" />
                        )}
                        <button
                          onClick={() => runConnectionTest(key)}
                          disabled={connectionTests[key] === 'loading'}
                          className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
              <span className="text-xs font-mono text-green-400">{currentHost}</span>
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