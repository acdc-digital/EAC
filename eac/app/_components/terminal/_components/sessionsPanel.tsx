// Sessions Panel Component
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/sessionsPanel.tsx

"use client";

import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/terminal/chat";
import { useSessionStore } from "@/store/terminal/session";
import { useConvexAuth, useQuery } from "convex/react";
import { MessageSquare, Plus } from "lucide-react";
import { useEffect } from "react";

interface SessionsPanelProps {
  className?: string;
}

export function SessionsPanel({ className }: SessionsPanelProps) {
  const { isAuthenticated } = useConvexAuth();
  const {
    sessions,
    activeSessionId,
    setSessions,
    setActiveSession,
    createNewSession,
    setSessionsPanelOpen,
  } = useSessionStore();
  
  const { setSessionId } = useChatStore();
  
  // Fetch user sessions from Convex
  const userSessions = useQuery(
    api.chat.getUserSessions,
    isAuthenticated ? {} : "skip"
  );

  // Update sessions when data loads
  useEffect(() => {
    if (userSessions) {
      setSessions(userSessions);
      
      // If no active session and we have sessions, set the first one as active
      if (!activeSessionId && userSessions.length > 0) {
        setActiveSession(userSessions[0].sessionId);
        setSessionId(userSessions[0].sessionId);
      }
    }
  }, [userSessions, activeSessionId, setSessions, setActiveSession, setSessionId]);

  const handleSessionClick = (sessionId: string) => {
    setActiveSession(sessionId);
    setSessionId(sessionId);
    // Close the sessions panel and return to chat
    setSessionsPanelOpen(false);
  };

  const handleNewSession = () => {
    const newSessionId = createNewSession();
    setSessionId(newSessionId);
    // Close the sessions panel and return to chat
    setSessionsPanelOpen(false);
  };

  const handleBackToChat = () => {
    setSessionsPanelOpen(false);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className={cn("flex-1 bg-[#0e0e0e] flex items-center justify-center", className)}>
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-[#858585] mx-auto mb-4" />
          <div className="text-sm text-[#cccccc] mb-2">Access Chat Sessions</div>
          <div className="text-xs text-[#858585]">Sign in to view and manage your chat sessions</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 bg-[#0e0e0e] flex flex-col", className)}>
      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageSquare className="w-12 h-12 text-[#858585] mb-4" />
            <div className="text-sm text-[#cccccc] mb-2">No chat sessions yet</div>
            <div className="text-xs text-[#858585] mb-4">Start a new conversation to create your first session</div>
            <button
              onClick={handleNewSession}
              className="flex items-center gap-2 px-3 py-2 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Start New Session
            </button>
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center px-3 py-1.5 bg-[#2d2d30] border-b border-[#454545] text-xs text-[#858585] font-medium">
              <div className="flex-shrink-0 w-20">Session</div>
              <div className="flex-1 px-2">Preview</div>
              <div className="flex-shrink-0 w-16 text-center">Msgs/500</div>
              <div className="flex-shrink-0 w-20 text-right">Time</div>
            </div>
            
            {/* Session Rows */}
            {sessions.map((session, index) => (
              <button
                key={session.sessionId}
                onClick={() => handleSessionClick(session.sessionId)}
                className={cn(
                  "w-full flex items-center px-3 py-1.5 text-left transition-all duration-200 hover:bg-[#2a2a2a] border-b border-[#333] bg-[#1a1a1a]",
                  session.sessionId === activeSessionId
                    ? "border-l-2 border-l-[#0078d4]"
                    : ""
                )}
              >
                <div className="flex-shrink-0 w-20 text-xs text-[#cccccc] font-medium">
                  #{index + 1}
                </div>
                <div className="flex-1 px-2 min-w-0">
                  <div className="text-xs text-[#b3b3b3] truncate">
                    {session.preview}
                  </div>
                </div>
                <div className="flex-shrink-0 w-16 text-center text-xs text-[#858585]">
                  {session.messageCount}
                </div>
                <div className="flex-shrink-0 w-20 text-right text-xs text-[#858585]">
                  {formatTime(session.lastActivity)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
