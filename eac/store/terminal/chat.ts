// Terminal Chat Store with Convex Integration
// /Users/matthewsimon/Projects/eac/eac/store/terminal/chat.ts

import { api } from '@/convex/_generated/api';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant' | 'system' | 'terminal';
  content: string;
  sessionId?: string;
  userId?: string;
  createdAt: number;
  _creationTime: number;
  operation?: {
    type: 'file_created' | 'project_created' | 'tool_executed' | 'error';
    details?: Record<string, any>;
  };
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string;
  
  addMessage: (message: Omit<ChatMessage, '_id' | 'createdAt' | '_creationTime'>) => void;
  addTerminalFeedback: (operation: ChatMessage['operation'], details: string) => void;
  sendMessage: (content: string) => Promise<void>;
  loadMessages: (convexQuery: any) => Promise<void>;
  clearMessages: (convexMutation: any) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setSessionId: (sessionId: string) => void;
  initializeUserSession: (userId: string) => void;
}

// Generate a user-specific session ID
const generateUserSessionId = (userId: string): string => {
  return `user_${userId}_session_${Date.now()}`;
};

// Generate a fallback session ID for unauthenticated users
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      sessionId: generateSessionId(),
      
      initializeUserSession: (userId: string) => {
        const userSessionId = `user_${userId}_persistent`;
        set({ sessionId: userSessionId });
      },
      
      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: Date.now(),
          _creationTime: Date.now(),
        };
        
        set(state => ({
          messages: [...state.messages, newMessage]
        }));
      },
      
      addTerminalFeedback: (operation, details) => {
        const { sessionId } = get();
        
        // Format terminal-style feedback based on operation type
        let terminalOutput = '';
        const timestamp = new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });
        
        switch (operation?.type) {
          case 'file_created':
            terminalOutput = `[${timestamp}] ✅ File created: ${operation.details?.fileName || 'unknown'}\n${details}`;
            break;
          case 'project_created':
            terminalOutput = `[${timestamp}] ✅ Project created: ${operation.details?.projectName || 'unknown'}\n${details}`;
            break;
          case 'tool_executed':
            terminalOutput = `[${timestamp}] 🔧 Tool executed: ${operation.details?.toolName || 'unknown'}\n${details}`;
            break;
          case 'error':
            terminalOutput = `[${timestamp}] ❌ Operation failed: ${operation.details?.error || 'unknown error'}\n${details}`;
            break;
          default:
            terminalOutput = `[${timestamp}] ℹ️ ${details}`;
        }
        
        const terminalMessage: ChatMessage = {
          _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          role: 'terminal',
          content: terminalOutput,
          sessionId,
          createdAt: Date.now(),
          _creationTime: Date.now(),
          operation,
        };
        
        set(state => ({
          messages: [...state.messages, terminalMessage]
        }));
      },
      
      sendMessage: async (content: string) => {
        // This is a placeholder - the actual sending is handled by useChat hook
        // The chat store just maintains local state
        console.log('Chat store sendMessage called with:', content);
        
        // Add the user message locally for immediate UI feedback
        const { sessionId, addMessage } = get();
        addMessage({
          role: 'user',
          content,
          sessionId,
        });
        
        // Note: The actual Convex interaction is handled by the useChat hook
        // This is just for local state management
      },
      
      loadMessages: async (convexQuery: any) => {
        const { sessionId } = get();
        
        try {
          const messages = await convexQuery(api.chat.getChatMessages, {
            sessionId,
            limit: 500,
          });
          
          set({ messages: messages || [] });
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      },
      
      clearMessages: async (convexMutation: any) => {
        const { sessionId } = get();
        
        try {
          await convexMutation(api.chat.clearChatHistory, {
            sessionId,
          });
          
          set({ messages: [] });
        } catch (error) {
          console.error('Error clearing messages:', error);
        }
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      setSessionId: (sessionId) => {
        set({ sessionId });
      }
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({ sessionId: state.sessionId }),
    }
  )
); 