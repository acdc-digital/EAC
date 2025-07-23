// Terminal Chat Store with Convex Integration
// /Users/matthewsimon/Projects/eac/eac/store/terminal/chat.ts

import { api } from '@/convex/_generated/api';
import { create } from 'zustand';

export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sessionId?: string;
  createdAt: number;
  _creationTime: number;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string;
  
  addMessage: (message: Omit<ChatMessage, '_id' | 'createdAt' | '_creationTime'>) => void;
  sendMessage: (content: string, convexActions: any) => Promise<void>;
  loadMessages: (convexQuery: any) => Promise<void>;
  clearMessages: (convexMutation: any) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setSessionId: (sessionId: string) => void;
}

// Generate a simple session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  sessionId: generateSessionId(),
  
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
  
  sendMessage: async (content: string, convexActions: any) => {
    const { sessionId, setLoading } = get();
    
    setLoading(true);
    
    try {
      // The Convex action will handle storing both user and assistant messages
      await convexActions.chatActions.sendChatMessage({
        content,
        sessionId,
      });
      
      // Reload messages to get the latest from the server
      // This will be handled by the React component using useQuery
    } catch (error) {
      console.error('Error sending message:', error);
      // Add local error message if needed
      get().addMessage({
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : "Failed to send message"}`,
        sessionId,
      });
    } finally {
      setLoading(false);
    }
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
})); 