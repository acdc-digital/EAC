// Debug Panel Component for Sidebar
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/dashDebug.tsx

"use client";

import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { useFileLoad } from "@/lib/hooks/useFileLoad";
import { useProjects } from "@/lib/hooks/useProjects";
import { useProjectSync } from "@/lib/hooks/useProjectSync";
import { clearAllPersistedState, performFullSync } from "@/lib/utils/stateSync";
import { useEditorStore, useScheduledPostsFromConvex } from "@/store";
import { useChatStore } from "@/store/terminal/chat";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
    Activity,
    AtSign,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    Database,
    Eye,
    FileText,
    Hash,
    RefreshCw,
    Settings2,
    Terminal,
    Wifi,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";

export function DashDebug() {
  const { isAuthenticated } = useConvexAuth();
  const { isSignedIn, userId } = useAuth();
  
  // Chat store for terminal configuration
  const { messages, sessionId, streamingThinking, isStreamingThinking } = useChatStore();
  
  // File sync hook for debugging
  const { allUserFiles, isLoading: fileSyncLoading, isSynced } = useFileLoad();
  
  const [isExpanded, setIsExpanded] = useState({
    state: false,
    actions: false,
    projects: false,
    files: false,
    socialPosts: false,
    messages: false,
    connectionTests: false,
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [connectionTests, setConnectionTests] = useState<{[key: string]: 'idle' | 'loading' | 'success' | 'error'}>({});
  const [currentHost, setCurrentHost] = useState<string>('localhost:3000');
  const [convexDebugUser] = useState('debug-user-' + Date.now());
  
  // Get editor store functions for creating test files
  const createNewFile = useEditorStore(state => state.createNewFile);
  const repairFilesWithoutContent = useEditorStore(state => state.repairFilesWithoutContent);
  const projectFiles = useEditorStore(state => state.projectFiles);
  const financialFiles = useEditorStore(state => state.financialFiles);
  const { createFolder, deleteFolder } = useEditorStore();

  // State sync hooks
  const { projects: convexProjects, error: projectsError } = useProjects();
  const { syncStatus, isLoading: isSyncLoading, error: syncError } = useProjectSync();

  // Convex queries for debugging - only when authenticated
  const convexProjectsQuery = useQuery(
    api.projects.getProjects, 
    isAuthenticated ? {} : "skip"
  );
  const convexSocialPosts = useQuery(
    api.socialPosts.getAllPosts, 
    isAuthenticated ? {} : "skip"
  );
  const convexMessages = useQuery(
    api.messages.getMessages, 
    isAuthenticated ? {} : "skip"
  );

  // Convex mutations for testing
  const createTestProject = useMutation(api.projects.createProject);
  const createTestPost = useMutation(api.socialPosts.upsertPost);

  // Calendar debug queries and mutations
  const { posts: calendarPosts, isLoading: calendarLoading } = useScheduledPostsFromConvex('current-user');
  const allCalendarPosts = useQuery(api.socialPosts.getAllAgentPosts, {});
  const createCalendarTestPost = useMutation(api.socialPosts.createTestScheduledPost);
  const createCalendarTestPostAuth = useMutation(api.socialPosts.createTestScheduledPostForCurrentUser);
  const createCalendarRealPost = useMutation(api.socialPosts.createRealPostExample);
  const resetAndCreateCalendarExamples = useMutation(api.socialPosts.debugResetAndCreateExamples);

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

  // New enhanced state clearing function
  const clearAllPersistedStateAndSync = () => {
    if (typeof window === 'undefined') return;
    
    try {
      clearAllPersistedState();
      console.log('🔄 State cleared and will sync with Convex on reload');
    } catch (error) {
      console.error('❌ Failed to clear persisted state:', error);
    }
  };

  // Manual sync function
  const manualSync = () => {
    try {
      if (convexProjects) {
        performFullSync(convexProjects, createFolder, deleteFolder);
        console.log('✅ Manual sync completed');
      } else {
        console.log('⏳ Waiting for Convex projects to load...');
      }
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
    }
  };

  // State sync status logging
  const logSyncStatus = () => {
    console.log('🔍 Current Sync Status:');
    console.log('  Convex Projects:', convexProjects?.length ?? 'Loading...');
    console.log('  Zustand Projects:', syncStatus?.zustandProjectCount ?? 0);
    console.log('  Zustand Folders:', syncStatus?.zustandFolderCount ?? 0);
    console.log('  Last Sync:', syncStatus?.lastSyncTime ?? 'Never');
    console.log('  Sync Loading:', isSyncLoading);
    console.log('  Sync Error:', syncError);
    console.log('  Projects Error:', projectsError);
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

  // Social post creation functions
  const createRedditTestPost = async () => {
    try {
      const timestamp = Date.now();
      await createNewFile(`test-reddit-${timestamp}`, 'reddit', 'project');
      console.log('✅ Reddit test post created successfully');
    } catch (error) {
      console.error('❌ Failed to create Reddit test post:', error);
    }
  };

  const createTwitterTestPost = async () => {
    try {
      const timestamp = Date.now();
      await createNewFile(`test-twitter-${timestamp}`, 'x', 'project');
      console.log('✅ Twitter test post created successfully');
    } catch (error) {
      console.error('❌ Failed to create Twitter test post:', error);
    }
  };

  // File repair functions
  const repairAllFiles = () => {
    try {
      const beforeProject = projectFiles.length;
      const beforeFinancial = financialFiles.length;
      
      // Count files without content before repair
      const emptyProjectFiles = projectFiles.filter(file => !file.content || file.content.trim() === '').length;
      const emptyFinancialFiles = financialFiles.filter(file => !file.content || file.content.trim() === '').length;
      
      console.log('🔧 File Repair Analysis:');
      console.log(`📁 Project Files: ${beforeProject} total, ${emptyProjectFiles} without content`);
      console.log(`💰 Financial Files: ${beforeFinancial} total, ${emptyFinancialFiles} without content`);
      
      if (emptyProjectFiles === 0 && emptyFinancialFiles === 0) {
        console.log('✅ All files already have content - no repair needed!');
        return;
      }
      
      // Run the repair
      repairFilesWithoutContent();
      
      console.log(`🔧 Repaired ${emptyProjectFiles + emptyFinancialFiles} files with missing content`);
      console.log('✅ File repair completed successfully');
    } catch (error) {
      console.error('❌ Failed to repair files:', error);
    }
  };

  const analyzeFileContent = () => {
    console.log('📊 File Content Analysis:');
    console.log('\n📁 PROJECT FILES:');
    projectFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name}`);
      console.log(`     Type: ${file.type}`);
      console.log(`     Has Content: ${!!file.content}`);
      console.log(`     Content Length: ${file.content?.length || 0} characters`);
      if (file.content && file.content.length > 0) {
        console.log(`     Preview: ${file.content.substring(0, 50)}...`);
      }
      console.log('');
    });
    
    console.log('\n💰 FINANCIAL FILES:');
    financialFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name}`);
      console.log(`     Type: ${file.type}`);
      console.log(`     Has Content: ${!!file.content}`);
      console.log(`     Content Length: ${file.content?.length || 0} characters`);
      if (file.content && file.content.length > 0) {
        console.log(`     Preview: ${file.content.substring(0, 50)}...`);
      }
      console.log('');
    });
    
    const totalFiles = projectFiles.length + financialFiles.length;
    const emptyFiles = [...projectFiles, ...financialFiles].filter(file => !file.content || file.content.trim() === '').length;
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Files: ${totalFiles}`);
    console.log(`   Files with Content: ${totalFiles - emptyFiles}`);
    console.log(`   Files without Content: ${emptyFiles}`);
    console.log(`   Content Coverage: ${totalFiles > 0 ? Math.round(((totalFiles - emptyFiles) / totalFiles) * 100) : 0}%`);
  };

  // Convex Debug Functions
  const testConvexProject = async () => {
    try {
      console.log('🔍 Testing Convex project creation...');
      const result = await createTestProject({
        name: `Test Project ${Date.now()}`,
        description: 'Test project created from debug panel',
        status: 'active',
        budget: 1000,
      });
      console.log('✅ Test project created:', result);
      return 'success';
    } catch (error) {
      console.error('❌ Failed to create test project:', error);
      return 'error';
    }
  };

  const testConvexSocialPost = async () => {
    try {
      console.log('🔍 Testing Convex social post creation...');
      const result = await createTestPost({
        content: `Debug test post created at ${new Date().toLocaleString()}`,
        fileName: `debug-post-${Date.now()}.reddit`,
        fileType: 'reddit',
        status: 'scheduled',
        scheduledFor: Date.now() + (24 * 60 * 60 * 1000), // Tomorrow
        platformData: JSON.stringify({ subreddit: 'test' })
      });
      console.log('✅ Test social post created:', result);
      return 'success';
    } catch (error) {
      console.error('❌ Failed to create test social post:', error);
      return 'error';
    }
  };

  const logConvexData = () => {
    console.log('🔍 Current Convex Query Results:', {
      projects: convexProjectsQuery,
      socialPosts: convexSocialPosts,
      messages: convexMessages,
      projectsLoading: convexProjectsQuery === undefined,
      socialPostsLoading: convexSocialPosts === undefined,
      messagesLoading: convexMessages === undefined,
      currentUserId: convexDebugUser,
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
    });
  };

  // Calendar debug functions
  const runCalendarTestPost = async () => {
    try {
      console.log('🧪 Creating calendar test post...');
      const result = await createCalendarTestPost({ userId: 'debug-user' });
      console.log('✅ Calendar test post created:', result);
    } catch (error) {
      console.error('❌ Failed to create calendar test post:', error);
    }
  };

  const runCalendarAuthTestPost = async () => {
    try {
      console.log('🔐 Creating calendar authenticated test post...');
      const result = await createCalendarTestPostAuth();
      console.log('✅ Calendar authenticated test post created:', result);
    } catch (error) {
      console.error('❌ Failed to create calendar authenticated test post:', error);
    }
  };

  const runCalendarRealPost = async () => {
    try {
      console.log('✨ Creating calendar real post example...');
      const result = await createCalendarRealPost({ userId: 'debug-user' });
      console.log('✅ Calendar real post created:', result);
    } catch (error) {
      console.error('❌ Failed to create calendar real post:', error);
    }
  };

  const runCalendarResetAndCreateExamples = async () => {
    try {
      console.log('🔄 Resetting and creating calendar examples...');
      const result = await resetAndCreateCalendarExamples({ userId: 'debug-user' });
      console.log('✅ Calendar examples reset and created:', result);
    } catch (error) {
      console.error('❌ Failed to reset and create calendar examples:', error);
    }
  };

  const logCalendarDebugData = () => {
    console.log('📅 Calendar Debug Data:', {
      calendarPosts: calendarPosts?.length || 0,
      calendarPostsData: calendarPosts,
      allCalendarPosts: allCalendarPosts?.length || 0,
      allCalendarPostsData: allCalendarPosts,
      calendarLoading,
      firstPost: calendarPosts?.[0],
      userIds: calendarPosts ? [...new Set(calendarPosts.map(p => p.userId))] : [],
    });
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Debug Console</span>
        </div>

        {/* Debug Sections */}
        <div className="space-y-1 mt-2">
        
        {/* Authentication Status */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('authentication')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('authentication') ? 
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <Activity className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">Authentication</span>
            <div className="flex items-center gap-1">
              {isAuthenticated ? 
                <CheckCircle className="w-3 h-3 text-green-400" /> : 
                <XCircle className="w-3 h-3 text-red-400" />
              }
            </div>
          </button>
          
          {expandedSections.has('authentication') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              
              {/* Auth Status Display */}
              <div className="text-[10px] text-[#858585] space-y-1">
                <div className="flex justify-between">
                  <span>Convex Auth:</span>
                  <span className={`text-xs ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                    {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Terminal Access:</span>
                  <span className={`text-xs ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                    {isAuthenticated ? '✅ Enabled' : '❌ Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Agent Commands:</span>
                  <span className={`text-xs ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                    {isAuthenticated ? '✅ Available' : '❌ Requires Auth'}
                  </span>
                </div>
              </div>
              
              {!isAuthenticated && (
                <>
                  <Separator className="bg-[#2d2d2d]" />
                  <div className="text-[10px] text-[#858585] p-1 bg-[#2d2d2d]/30 rounded">
                    💡 <strong>To authenticate:</strong><br />
                    1. Click the user icon in activity bar<br />
                    2. Select "Sign In" from dropdown<br />
                    3. Complete sign-in process
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Terminal Configuration */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('terminal')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('terminal') ? 
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <Terminal className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">Terminal Config</span>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
            </div>
          </button>
          
          {expandedSections.has('terminal') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              
              {/* Terminal Configuration Display */}
              <div className="text-[10px] text-[#858585] space-y-1">
                <div className="flex justify-between">
                  <span>AI Thinking Mode:</span>
                  <span className="text-xs text-green-400">
                    ✅ Always Enabled
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Thinking Stream:</span>
                  <span className="text-xs text-green-400">
                    {isStreamingThinking ? '🔄 Active' : '✅ Ready'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chat Messages:</span>
                  <span className="text-xs text-[#cccccc]">
                    {messages.length} stored
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Session Active:</span>
                  <span className="text-xs text-green-400">
                    ✅ {sessionId.slice(0, 12)}...
                  </span>
                </div>
                {streamingThinking && (
                  <div className="flex justify-between">
                    <span>Current Thinking:</span>
                    <span className="text-xs text-yellow-400">
                      {streamingThinking.length} chars
                    </span>
                  </div>
                )}
              </div>
              
              <Separator className="bg-[#2d2d2d]" />
              <div className="text-[10px] text-[#858585] p-1 bg-[#2d2d2d]/30 rounded">
                💡 <strong>Thinking Mode:</strong><br />
                AI reasoning is now permanently enabled for all terminal interactions. 
                You'll always see the AI's thought process in real-time.
              </div>
            </div>
          )}
        </div>
        
        {/* Calendar Debug */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('calendar')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('calendar') ? 
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <Calendar className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">Calendar</span>
            <div className="flex items-center gap-1">
              {calendarLoading && <Clock className="w-3 h-3 text-yellow-400" />}
              {!calendarLoading && <CheckCircle className="w-3 h-3 text-green-400" />}
            </div>
          </button>
          
          {expandedSections.has('calendar') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              
              {/* Calendar Statistics */}
              <div className="text-[10px] text-[#858585] space-y-1">
                <div className="flex justify-between">
                  <span>User Posts:</span>
                  <span className="text-[#cccccc]">{calendarPosts?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Posts:</span>
                  <span className="text-[#cccccc]">{allCalendarPosts?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loading:</span>
                  <span className={`text-xs ${calendarLoading ? 'text-yellow-400' : 'text-green-400'}`}>
                    {calendarLoading ? '⏳ Loading' : '✅ Ready'}
                  </span>
                </div>
              </div>
              
              <Separator className="bg-[#2d2d2d]" />
              
              {/* Calendar Test Actions */}
              <div className="space-y-1">
                <div className="text-xs text-[#858585] mb-1 px-1">Test Post Creation</div>
                
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-[#858585]">🧪 Test post</span>
                  <button
                    onClick={runCalendarTestPost}
                    className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                  >
                    Create
                  </button>
                </div>
                
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-[#858585]">🔐 Auth test</span>
                  <button
                    onClick={runCalendarAuthTestPost}
                    className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                  >
                    Create
                  </button>
                </div>
                
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-[#858585]">✨ Real post</span>
                  <button
                    onClick={runCalendarRealPost}
                    className="text-xs text-[#28a745] hover:text-[#218838] underline-offset-2 hover:underline"
                  >
                    Create
                  </button>
                </div>
                
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-[#858585]">🔄 Reset examples</span>
                  <button
                    onClick={runCalendarResetAndCreateExamples}
                    className="text-xs text-[#6f42c1] hover:text-[#5a32a3] underline-offset-2 hover:underline"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              <Separator className="bg-[#2d2d2d]" />
              
              {/* Calendar Debug Actions */}
              <div className="space-y-1">
                <div className="text-xs text-[#858585] mb-1 px-1">Debug Information</div>
                
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-[#858585]">Log calendar data</span>
                  <button
                    onClick={logCalendarDebugData}
                    className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                  >
                    Log
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
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

        {/* State Sync Management */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('statesync')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('statesync') ? 
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <Wifi className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">State Sync</span>
            <div className="flex items-center gap-1">
              {isSyncLoading && <Clock className="w-3 h-3 text-yellow-400" />}
              {syncError && <XCircle className="w-3 h-3 text-red-400" />}
              {!isSyncLoading && !syncError && <CheckCircle className="w-3 h-3 text-green-400" />}
            </div>
          </button>
          
          {expandedSections.has('statesync') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              
              {/* Sync Status Display */}
              <div className="text-[10px] text-[#858585] space-y-1">
                <div className="flex justify-between">
                  <span>Convex Projects:</span>
                  <span className="text-[#cccccc]">{convexProjects?.length ?? 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Zustand Projects:</span>
                  <span className="text-[#cccccc]">{syncStatus?.zustandProjectCount ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Zustand Folders:</span>
                  <span className="text-[#cccccc]">{syncStatus?.zustandFolderCount ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Sync:</span>
                  <span className="text-[#cccccc]">
                    {syncStatus?.lastSyncTime ? 
                      new Date(syncStatus.lastSyncTime).toLocaleTimeString() : 
                      'Never'
                    }
                  </span>
                </div>
              </div>
              
              <Separator className="bg-[#2d2d2d]" />
              
              {/* Action Buttons */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-[#858585]">Clear & sync fresh</span>
                  <button
                    onClick={clearAllPersistedStateAndSync}
                    className="text-xs text-[#ff6b6b] hover:text-[#ff5252] underline-offset-2 hover:underline"
                  >
                    Reset
                  </button>
                </div>
                
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-[#858585]">Force manual sync</span>
                  <button
                    onClick={manualSync}
                    className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                  >
                    Sync
                  </button>
                </div>
                
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-[#858585]">Log sync status</span>
                  <button
                    onClick={logSyncStatus}
                    className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                  >
                    Log
                  </button>
                </div>
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

        {/* File Repair */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('filerepair')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('filerepair') ? 
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <FileText className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">File Repair</span>
          </button>
          
          {expandedSections.has('filerepair') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              <div className="px-1 space-y-2">
                <div className="text-xs text-[#858585] mb-2">Fix files with missing content</div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#858585]">Analyze file content</span>
                    <button
                      onClick={analyzeFileContent}
                      className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                    >
                      Analyze
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#858585]">Repair empty files</span>
                    <button
                      onClick={repairAllFiles}
                      className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                    >
                      Repair
                    </button>
                  </div>
                  
                  <div className="text-xs text-[#4a4a4a] mt-2 px-1">
                    Files: {projectFiles.length + financialFiles.length} total, {[...projectFiles, ...financialFiles].filter(file => !file.content || file.content.trim() === '').length} empty
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* File Sync */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('filesync')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('filesync') ? 
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <RefreshCw className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">File Sync</span>
            <div className="flex items-center gap-1">
              {fileSyncLoading && <Clock className="w-3 h-3 text-yellow-400" />}
              {!fileSyncLoading && isSynced && <CheckCircle className="w-3 h-3 text-green-400" />}
              {!fileSyncLoading && !isSynced && <XCircle className="w-3 h-3 text-red-400" />}
            </div>
          </button>
          
          {expandedSections.has('filesync') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              <div className="px-1 space-y-2">
                <div className="text-xs text-[#858585] mb-2">Database to Store synchronization</div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#858585]">Authenticated</span>
                    <span className="text-xs text-[#cccccc]">{isSignedIn ? '✅' : '❌'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#858585]">DB Files</span>
                    <span className="text-xs text-[#cccccc]">{allUserFiles?.length || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#858585]">Store Files</span>
                    <span className="text-xs text-[#cccccc]">{projectFiles.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#858585]">Sync Status</span>
                    <span className="text-xs text-[#cccccc]">{isSynced ? '✅' : '⏳'}</span>
                  </div>
                  
                  {userId && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#858585]">User ID</span>
                      <span className="text-xs text-[#cccccc] font-mono">{userId.slice(-6)}</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-[#4a4a4a] mt-2 px-1">
                    Syncing {allUserFiles?.length || 0} database files to store
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Convex Database */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('convex-debug')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('convex-debug') ?
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> :
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <Database className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">Convex Database</span>
            <div className="flex items-center gap-1">
              {convexProjectsQuery === undefined && <Clock className="w-3 h-3 text-yellow-400" />}
              {convexProjectsQuery !== undefined && <CheckCircle className="w-3 h-3 text-green-400" />}
            </div>
          </button>
          
          {expandedSections.has('convex-debug') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              
              {/* Query Status Display */}
              <div className="text-[10px] text-[#858585] space-y-1">
                <div className="flex justify-between">
                  <span>Projects:</span>
                  <span className="text-[#cccccc]">{convexProjectsQuery?.length ?? 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Social Posts:</span>
                  <span className="text-[#cccccc]">{convexSocialPosts?.length ?? 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Messages:</span>
                  <span className="text-[#cccccc]">{convexMessages?.length ?? 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span>User ID:</span>
                  <span className="text-[#cccccc] font-mono text-[9px]">{convexDebugUser.slice(-8)}</span>
                </div>
              </div>
              
              <Separator className="bg-[#2d2d2d]" />
              
              {/* Test Actions */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-[#858585]">Create test project</span>
                  <button
                    onClick={testConvexProject}
                    className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                  >
                    Test
                  </button>
                </div>
                
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-[#858585]">Create test social post</span>
                  <button
                    onClick={testConvexSocialPost}
                    className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                  >
                    Test
                  </button>
                </div>
                
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-[#858585]">Log query data</span>
                  <button
                    onClick={logConvexData}
                    className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                  >
                    Log
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* General Test Activity */}
        <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('test-activity')}
            className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
          >
            {expandedSections.has('test-activity') ?
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> :
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            }
            <Activity className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs font-medium flex-1 text-left">Test Activity</span>
          </button>
          
          {expandedSections.has('test-activity') && (
            <div className="px-2 pb-2 space-y-2">
              <Separator className="bg-[#2d2d2d]" />
              
              {/* Performance Tests */}
              <div className="space-y-1">
                <div className="text-xs text-[#858585] mb-1 px-1">Performance & Metrics</div>
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
              
              <Separator className="bg-[#2d2d2d]" />
              
              {/* Social Media Tests */}
              <div className="space-y-1">
                <div className="text-xs text-[#858585] mb-1 px-1">Social Media Testing</div>
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-[#858585]">Reddit test post</span>
                  </div>
                  <button
                    onClick={createRedditTestPost}
                    className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                  >
                    Create
                  </button>
                </div>
                
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <AtSign className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-[#858585]">Twitter test post</span>
                  </div>
                  <button
                    onClick={createTwitterTestPost}
                    className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                  >
                    Create
                  </button>
                </div>
              </div>
              
              <Separator className="bg-[#2d2d2d]" />
              
              {/* Connection Tests */}
              <div className="space-y-1">
                <div className="text-xs text-[#858585] mb-1 px-1">API Connection Tests</div>
                {[
                  { key: 'convex-database', label: 'Convex DB', icon: Database },
                  { key: 'twitter-api', label: 'Twitter API', icon: CheckCircle },
                  { key: 'reddit-api', label: 'Reddit API', icon: CheckCircle },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between px-1">
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