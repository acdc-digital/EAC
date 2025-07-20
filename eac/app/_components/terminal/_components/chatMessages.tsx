// Chat Messages Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/terminal/_components/chatMessages.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/terminal/chat";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export function ChatMessages({ messages, isLoading = false }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const { sendMessage } = useChatStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-focus input on mount and after messages
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      sendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div 
      ref={scrollRef} 
      className="flex-1 overflow-y-auto bg-[#0e0e0e] p-2 min-h-0 [&::-webkit-scrollbar]:hidden"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <div className="font-mono text-xs space-y-2 min-h-full">
        {/* Terminal Welcome Text */}
        <div className="text-[#cccccc] space-y-1 mb-4">
          <div>ACDC.digital 2025</div>
          <div className="text-[#4ec9b0]">▲ Next.js 15.0.0</div>
          <div>- Local: http://localhost:3000</div>
          <div>- Network: http://192.168.1.100:3000</div>
          <div className="text-[#858585] mt-2">AI Assistant ready. Type your message below.</div>
        </div>

        {/* Chat Messages */}
        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            {message.role === 'user' && (
              <div className="text-[#007acc]">
                {message.content}
              </div>
            )}
            
            {message.role === 'assistant' && (
              <div className="space-y-1">
                <div className="text-[#4ec9b0]">System:</div>
                <div className="text-[#cccccc] ml-3 whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            )}
            
            {message.role === 'system' && (
              <div className="text-[#858585] italic">
                {message.content}
              </div>
            )}
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="space-y-1">
            <div className="text-[#4ec9b0]">System:</div>
            <div className="text-[#858585] ml-3 animate-pulse">
              thinking...
            </div>
          </div>
        )}

        {/* Inline Input */}
        <div className="flex items-center">
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "AI is thinking..." : "Ask me about your EAC project..."}
              disabled={isLoading}
              className="w-full bg-transparent text-[#cccccc] border-none outline-none placeholder:text-[#858585] disabled:opacity-50 disabled:cursor-not-allowed caret-[#cccccc]"
            />
          </form>
        </div>
      </div>
    </div>
  );
} 