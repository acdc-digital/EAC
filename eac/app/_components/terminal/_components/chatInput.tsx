// Chat Input Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/terminal/_components/chatInput.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/store/terminal/chat";

interface ChatInputProps {
  placeholder?: string;
}

export function ChatInput({ placeholder = "Ask me about your EAC project..." }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isLoading } = useChatStore();

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

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
    <div className="border-t border-[#2d2d2d] bg-[#0e0e0e] p-2 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Terminal prompt */}
        <div className="text-[#007acc] font-mono text-xs flex-shrink-0">
          $
        </div>
        
        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "AI is thinking..." : placeholder}
          disabled={isLoading}
          className={`
            flex-1 bg-transparent text-[#cccccc] font-mono text-xs border-none outline-none
            placeholder:text-[#858585] disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-[#858585] font-mono text-xs animate-pulse">
            ...
          </div>
        )}
        
        {/* Send button (hidden but functional) */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="sr-only"
          aria-label="Send message"
        >
          Send
        </button>
      </form>
      
      {/* Help text */}
      <div className="text-[#454545] font-mono text-[10px] mt-1">
        Press Enter to send • Shift+Enter for new line
      </div>
    </div>
  );
} 