// Terminal Chat Store
// /Users/matthewsimon/Projects/EAC/eac/store/terminal/chat.ts

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
}

// Simple mock LLM response for now - can be replaced with actual API call
const mockLLMResponse = async (message: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Mock responses based on message content
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    return "Hello! I'm your AI assistant. I can help you with questions about your EAC project, Next.js development, or anything else you'd like to discuss.";
  }
  
  if (message.toLowerCase().includes('project') || message.toLowerCase().includes('eac')) {
    return "Your EAC Dashboard is looking great! It's built with Next.js 15, uses Zustand for state management, and follows a VS Code-inspired design. Is there something specific about the project you'd like to know about?";
  }
  
  if (message.toLowerCase().includes('help')) {
    return "I'm here to help! You can ask me about:\n• Your EAC project structure and code\n• Next.js and React development\n• State management with Zustand\n• Terminal and development workflows\n• General programming questions\n\nWhat would you like to know?";
  }
  
  // Default response
  return `Thanks for your message: "${message}"\n\nI'm a mock AI assistant for now. In a real implementation, I would connect to an LLM API like OpenAI, Claude, or a local model to provide intelligent responses about your EAC project and development questions.`;
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  
  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    
    set(state => ({
      messages: [...state.messages, newMessage]
    }));
  },
  
  sendMessage: async (content) => {
    const { addMessage, setLoading } = get();
    
    // Add user message
    addMessage({
      role: 'user',
      content
    });
    
    // Set loading state
    setLoading(true);
    
    try {
      // Get AI response (replace with actual LLM API call)
      const response = await mockLLMResponse(content);
      
      // Add AI response
      addMessage({
        role: 'assistant',
        content: response
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage({
        role: 'system',
        content: 'Sorry, there was an error getting a response from the AI. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  },
  
  clearMessages: () => {
    set({ messages: [] });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  }
})); 