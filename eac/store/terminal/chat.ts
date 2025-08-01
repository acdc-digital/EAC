// Terminal Chat Store with Convex Integration
// /Users/matthewsimon/Projects/eac/eac/store/terminal/chat.ts

import { api } from '@/convex/_generated/api';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sessionId?: string;
  userId?: string;
  createdAt: number;
  _creationTime: number;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string;
  
  addMessage: (message: Omit<ChatMessage, '_id' | 'createdAt' | '_creationTime'>) => void;
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
            limit: 50,
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