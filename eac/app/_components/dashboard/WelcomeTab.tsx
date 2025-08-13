"use client";

import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { useNewUserDetection } from "@/lib/hooks/useNewUserDetection";
import { useAgentStore } from "@/store/agents";
import { useOnboardingStore } from "@/store/onboarding";
import { useTerminalStore } from "@/store/terminal";
import { useChatStore } from "@/store/terminal/chat";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
    ArrowRight,
    AtSign,
    Bot,
    Calendar,
    CheckCircle,
    ChevronRight,
    FileText,
    FolderPlus,
    Rocket,
    Sparkles,
    Star,
    Terminal,
    Twitter,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function WelcomeTab() {
  const [expandedSection, setExpandedSection] = useState<string | null>('quickstart');
  const { isAuthenticated } = useConvexAuth();
  const { setCollapsed: setTerminalCollapsed } = useTerminalStore();
  const { 
    isOnboardingComplete, 
    hasShownWelcome, 
    setHasShownWelcome, 
    setOnboardingActive,
    setCurrentStep
  } = useOnboardingStore();
  const { sessionId } = useChatStore();
  const { setActiveAgent } = useAgentStore();
  const storeChatMessage = useMutation(api.chat.storeChatMessage);
  const ensureInstructionsProject = useMutation(api.projects.ensureInstructionsProject);
  const { isNewUser, isChecking } = useNewUserDetection();
  
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const isUserSynced = currentUser !== undefined && currentUser !== null;
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      console.log('WelcomeTab - Auth status:', {
        isAuthenticated,
        isNewUser,
        isUserSynced,
        hasShownWelcome,
        isOnboardingComplete,
        currentUser: currentUser ? 'exists' : 'null'
      });
    }
  }, [isAuthenticated, isNewUser, isUserSynced, hasShownWelcome, isOnboardingComplete, currentUser]);
  
  // Handle first-time user onboarding UI setup
  useEffect(() => {
    if (
      isAuthenticated && 
      isNewUser === true && 
      !hasShownWelcome && 
      !isOnboardingComplete &&
      isUserSynced
    ) {
      console.log('🎉 First-time user detected - setting up onboarding UI');
      setHasShownWelcome(true);
      setTerminalCollapsed(false);
      // ChatMessages component will handle sending the actual onboarding messages
    }
  }, [isAuthenticated, isNewUser, hasShownWelcome, isOnboardingComplete, isUserSynced, setHasShownWelcome, setTerminalCollapsed]);

  const triggerOnboardingAgent = async () => {
    try {
      console.log('🚀 Starting onboarding agent...', {
        isUserSynced,
        sessionId,
        currentUser: currentUser ? 'exists' : 'null'
      });
      
      if (!isUserSynced) {
        console.warn('⚠️ User not yet synced to Convex, delaying onboarding...');
        return;
      }
      
      console.log('🔧 Ensuring Instructions project exists...');
      await ensureInstructionsProject();
      console.log('✅ Instructions project ready');
      
      setActiveAgent('instructions');
      setOnboardingActive(true);
      setCurrentStep('welcome');

      await storeChatMessage({
        role: "assistant",
        content: `🎉 **Welcome to EAC Social Media Management!**

I'm your AI assistant and I'm excited to help you set up your personalized social media workspace.

Ready to get started? **y/N**`,
        sessionId,
        processIndicator: {
          type: 'waiting',
          processType: 'onboarding',
          color: 'green'
        }
      });

      console.log('✅ Onboarding agent triggered successfully');
    } catch (error) {
      console.error('❌ Failed to trigger onboarding agent:', error);
      
      try {
        await storeChatMessage({
          role: "assistant", 
          content: `Welcome to EAC! 👋 

Your social media management workspace is ready. Type \`/help\` to see available commands.`,
          sessionId
        });
      } catch (fallbackError) {
        console.error('❌ Fallback message also failed:', fallbackError);
      }
    }
  };

  const quickStartSteps = [
    { 
      title: "Start with Onboarding Agent", 
      desc: "Let AI guide you through personalized setup", 
      action: "Respond in terminal below",
      icon: Rocket,
      color: "text-blue-400",
      recommended: true 
    },
    { 
      title: "Define Your Brand", 
      desc: "Share your website or describe your business", 
      action: "Interactive Q&A",
      icon: Sparkles,
      color: "text-purple-400"
    },
    { 
      title: "Activate Your Agents", 
      desc: "Choose AI assistants for your workflow", 
      action: "Type /help for list",
      icon: Bot,
      color: "text-green-400"
    }
  ];

  const agents = [
    { name: "Instructions", cmd: "/instructions", icon: FileText, desc: "Brand voice & guidelines", badge: "START HERE", color: "text-blue-400" },
    { name: "Campaign Director", cmd: "/director", icon: Bot, desc: "Enterprise campaigns", badge: "PRO", price: "$199", color: "text-yellow-400" },
    { name: "Marketing Officer", cmd: "/cmo", icon: AtSign, desc: "AI CMO strategy", badge: "PRO", price: "$49", color: "text-yellow-400" },
    { name: "Twitter", cmd: "/twitter", icon: Twitter, desc: "Social content", color: "text-sky-400" },
    { name: "Create Project", cmd: "/create-project", icon: FolderPlus, desc: "Project scaffolding", color: "text-emerald-400" },
    { name: "Schedule", cmd: "/schedule", icon: Calendar, desc: "Timeline management", color: "text-indigo-400" }
  ];

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] overflow-auto">
      {/* Welcome Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#1e1e1e] to-[#252525] border-b border-[#2d2d2d]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-white flex items-center gap-2">
              Welcome to EAC Social
              {isNewUser && (
                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                  New User
                </span>
              )}
            </h1>
            <p className="text-xs text-[#858585] mt-0.5">Your AI-powered social media command center</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-[#858585]">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        
        {/* Welcome Message for New Users */}
        {isNewUser && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-white mb-1">🎉 Welcome aboard!</h3>
                <p className="text-xs text-[#cccccc] leading-relaxed">
                  Your terminal is ready below. Our AI assistant will guide you through a quick 60-second setup 
                  to personalize your social media workspace.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Start Guide */}
        <div className="bg-[#1e1e1e] rounded-lg border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('quickstart')}
            className="w-full flex items-center gap-2 p-3 hover:bg-[#252525] transition-colors rounded-t-lg"
          >
            <ChevronRight className={`w-4 h-4 text-[#858585] transition-transform ${expandedSection === 'quickstart' ? 'rotate-90' : ''}`} />
            <Rocket className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold flex-1 text-left">Quick Start Guide</span>
            <span className="text-xs text-[#858585]">3 simple steps</span>
          </button>
          
          {expandedSection === 'quickstart' && (
            <div className="px-3 pb-3">
              <Separator className="bg-[#2d2d2d] mb-3" />
              <div className="space-y-2">
                {quickStartSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#252525]/50 transition-colors">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#252525] border border-[#2d2d2d]">
                      <span className="text-xs font-semibold">{i+1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <step.icon className={`w-3.5 h-3.5 ${step.color}`} />
                        <span className="text-xs font-medium text-white">{step.title}</span>
                        {step.recommended && (
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#858585] mb-1">{step.desc}</p>
                      <div className="flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-[#858585]" />
                        <code className="text-xs text-[#007acc]">{step.action}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-[#252525]/50 rounded">
                <p className="text-xs text-[#858585]">
                  💡 <strong>Pro tip:</strong> Just start typing in the terminal below and our AI will guide you!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Available Agents */}
        <div className="bg-[#1e1e1e] rounded-lg border border-[#2d2d2d]">
          <button
            onClick={() => toggleSection('agents')}
            className="w-full flex items-center gap-2 p-3 hover:bg-[#252525] transition-colors rounded-t-lg"
          >
            <ChevronRight className={`w-4 h-4 text-[#858585] transition-transform ${expandedSection === 'agents' ? 'rotate-90' : ''}`} />
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold flex-1 text-left">AI Agents</span>
            <span className="text-xs text-[#858585]">{agents.length} available</span>
          </button>
          
          {expandedSection === 'agents' && (
            <div className="px-3 pb-3">
              <Separator className="bg-[#2d2d2d] mb-3" />
              <div className="grid gap-2">
                {agents.map((agent, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#252525]/50 transition-colors group">
                    <agent.icon className={`w-4 h-4 ${agent.color || 'text-[#858585]'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{agent.name}</span>
                        {agent.badge === 'START HERE' && (
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                            {agent.badge}
                          </span>
                        )}
                        {agent.badge === 'PRO' && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                              {agent.badge}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-[#858585]">{agent.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-[#007acc] bg-[#252525] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {agent.cmd}
                      </code>
                      {agent.price && (
                        <span className="text-xs text-yellow-400">{agent.price}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-[#252525]/50 rounded">
                <p className="text-xs text-[#858585]">
                  💡 <strong>Usage:</strong> Type any command in the terminal below to activate an agent
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Environment Stats */}
        <div className="bg-[#1e1e1e] rounded-lg border border-[#2d2d2d] p-3">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold">Environment Status</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#858585]">Platform</span>
              <span className="text-xs font-medium text-green-400">EAC Social</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#858585]">Setup Time</span>
              <span className="text-xs font-medium">~60 seconds</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#858585]">Terminal</span>
              <span className="text-xs font-medium text-green-400">Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#858585]">AI Agents</span>
              <span className="text-xs font-medium">{agents.length} loaded</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#252525] to-[#1e1e1e] rounded-lg p-3 border border-[#2d2d2d]">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <div className="flex-1">
              <p className="text-xs font-medium text-white">Ready to start?</p>
              <p className="text-xs text-[#858585]">Your terminal is open below. Just start typing!</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#858585] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}