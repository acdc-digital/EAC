// Terminal Session Store
// /Users/matthewsimon/Projects/eac/eac/store/terminal/session.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatSession {
  sessionId: string;
  lastActivity: number;
  messageCount: number;
  preview: string;
  isActive?: boolean;
}

interface SessionState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isSessionsPanelOpen: boolean;
  isAgentsPanelOpen: boolean;
  isExtensionsPanelOpen: boolean;
  activeExtensionId: string | null;
  
  // Session management
  setSessions: (sessions: ChatSession[]) => void;
  addSession: (session: ChatSession) => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  removeSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void; // New function for soft delete
  setActiveSession: (sessionId: string | null) => void;
  
  // Extension selection
  setActiveExtension: (extensionId: string | null) => void;
  
  // UI state
  toggleSessionsPanel: () => void;
  setSessionsPanelOpen: (open: boolean) => void;
  toggleAgentsPanel: () => void;
  setAgentsPanelOpen: (open: boolean) => void;
  toggleExtensionsPanel: () => void;
  setExtensionsPanelOpen: (open: boolean) => void;
  
  // Session creation
  createNewSession: () => string;
}

// Generate a new session ID
const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `session_${timestamp}_${random}`;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      isSessionsPanelOpen: true, // Default to open so Sessions view is shown by default
      isAgentsPanelOpen: false,
      isExtensionsPanelOpen: false,
      activeExtensionId: null,
      
      setSessions: (sessions) => {
        set({ sessions });
      },
      
      addSession: (session) => {
        set(state => ({
          sessions: [session, ...state.sessions]
        }));
      },
      
      updateSession: (sessionId, updates) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.sessionId === sessionId
              ? { ...session, ...updates }
              : session
          )
        }));
      },
      
      removeSession: (sessionId) => {
        set(state => {
          const newSessions = state.sessions.filter(s => s.sessionId !== sessionId);
          const newActiveSessionId = state.activeSessionId === sessionId 
            ? (newSessions.length > 0 ? newSessions[0].sessionId : null)
            : state.activeSessionId;
          
          return {
            sessions: newSessions,
            activeSessionId: newActiveSessionId
          };
        });
      },
      
      deleteSession: (sessionId) => {
        // This is a placeholder that will be replaced with Convex mutation call
        // The actual deletion logic will be handled by the component using useMutation
        get().removeSession(sessionId);
      },
      
      setActiveSession: (sessionId) => {
        set(state => ({
          activeSessionId: sessionId,
          sessions: state.sessions.map(session => ({
            ...session,
            isActive: session.sessionId === sessionId
          }))
        }));
      },
      
      toggleSessionsPanel: () => {
        set(state => ({
          isSessionsPanelOpen: !state.isSessionsPanelOpen,
          isAgentsPanelOpen: false, // Close agents panel when opening sessions
          isExtensionsPanelOpen: false // Close extensions panel when opening sessions
        }));
      },
      
      setSessionsPanelOpen: (open) => {
        set({ 
          isSessionsPanelOpen: open,
          isAgentsPanelOpen: open ? false : get().isAgentsPanelOpen, // Close agents if opening sessions
          isExtensionsPanelOpen: open ? false : get().isExtensionsPanelOpen // Close extensions if opening sessions
        });
      },

      toggleAgentsPanel: () => {
        set(state => ({
          isAgentsPanelOpen: !state.isAgentsPanelOpen,
          isSessionsPanelOpen: false, // Close sessions panel when opening agents
          isExtensionsPanelOpen: false // Close extensions panel when opening agents
        }));
      },
      
      setAgentsPanelOpen: (open) => {
        set({ 
          isAgentsPanelOpen: open,
          isSessionsPanelOpen: open ? false : get().isSessionsPanelOpen, // Close sessions if opening agents
          isExtensionsPanelOpen: open ? false : get().isExtensionsPanelOpen // Close extensions if opening agents
        });
      },

      toggleExtensionsPanel: () => {
        set(state => ({
          isExtensionsPanelOpen: !state.isExtensionsPanelOpen,
          isSessionsPanelOpen: false, // Close sessions panel when opening extensions
          isAgentsPanelOpen: false // Close agents panel when opening extensions
        }));
      },
      
      setExtensionsPanelOpen: (open) => {
        set({ 
          isExtensionsPanelOpen: open,
          isSessionsPanelOpen: open ? false : get().isSessionsPanelOpen, // Close sessions if opening extensions
          isAgentsPanelOpen: open ? false : get().isAgentsPanelOpen // Close agents if opening extensions
        });
      },

      setActiveExtension: (extensionId) => {
        set({ activeExtensionId: extensionId });
      },
      
      createNewSession: () => {
        const newSessionId = generateSessionId();
        const newSession: ChatSession = {
          sessionId: newSessionId,
          lastActivity: Date.now(),
          messageCount: 0,
          preview: 'New session',
          isActive: true
        };
        
        const { addSession, setActiveSession } = get();
        addSession(newSession);
        setActiveSession(newSessionId);
        
        return newSessionId;
      }
    }),
    {
      name: 'session-store',
      partialize: (state) => ({
        activeSessionId: state.activeSessionId,
        isSessionsPanelOpen: state.isSessionsPanelOpen,
        isAgentsPanelOpen: state.isAgentsPanelOpen,
        isExtensionsPanelOpen: state.isExtensionsPanelOpen,
        activeExtensionId: state.activeExtensionId
      }),
    }
  )
);
