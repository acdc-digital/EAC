// Chat Messages Component with Convex Integration
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/chatMessages.tsx

"use client";

import { chatCommands } from "@/lib/chatCommands";
import { useChat } from "@/lib/hooks/useChat";
import React, { useEffect, useRef, useState } from "react";

export function ChatMessages() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [showCommandHints, setShowCommandHints] = useState(false);
  
  const { messages, isLoading, sendMessage, sessionId } = useChat();

  // Show command hints when user types '/'
  useEffect(() => {
    setShowCommandHints(message.startsWith('/') && message.length > 1);
  }, [message]);

  // Filter commands based on input
  const filteredCommands = chatCommands.filter(cmd => 
    message.length > 1 && cmd.command.toLowerCase().includes(message.toLowerCase())
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      const messageContent = message.trim();
      setMessage("");
      
      await sendMessage(messageContent);
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
      className="flex-1 overflow-y-auto bg-[#0e0e0e] p-2 min-h-0 scrollbar-hidden"
    >
      <div className="font-mono text-xs space-y-2 min-h-full">
        {/* Terminal Welcome Text */}
        <div className="text-[#cccccc] space-y-1 mb-4">
          <div>EAC Financial Dashboard - AI Assistant</div>
          <div className="text-[#4ec9b0]">▲ Next.js 15.0.0 + Convex Backend</div>
          <div>- OpenAI GPT-4o-mini Integration</div>
          <div className="text-[#858585] mt-2">AI Assistant ready for EAC project questions.</div>
          <div className="text-[#858585] text-xs">Session: {sessionId.slice(-8)}</div>
          <div className="text-[#858585] border-t border-[#333] pt-2 mt-3">
            Type your questions about projects, financials, or development below.
          </div>
        </div>

        {/* Chat Messages */}
        {messages?.map((msg) => (
          <div key={msg._id} className="space-y-1">
            {msg.role === 'user' && (
              <div className="text-[#cccccc]">
                <span className="text-[#007acc]">$ user:</span> {msg.content}
              </div>
            )}
            
            {msg.role === 'assistant' && (
              <div className="text-[#cccccc]">
                <span className="text-[#4ec9b0]">$ system:</span> <span className="whitespace-pre-wrap">{msg.content}</span>
              </div>
            )}
            
            {msg.role === 'system' && (
              <div className="text-[#f48771]">
                <span className="text-[#f48771]">$ error:</span> {msg.content}
              </div>
            )}
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-[#cccccc]">
            <span className="text-[#4ec9b0]">$ system:</span> <span className="text-[#858585] animate-pulse">thinking...</span>
          </div>
        )}

        {/* Inline Input */}
        <div className="flex flex-col pt-2">
          {/* Command Hints */}
          {showCommandHints && filteredCommands.length > 0 && (
            <div className="mb-2 p-2 bg-[#1a1a1a] border border-[#333] rounded text-xs">
              <div className="text-[#4ec9b0] mb-1">Available Commands:</div>
              {filteredCommands.slice(0, 5).map((cmd) => (
                <div key={cmd.command} className="text-[#858585] py-0.5">
                  <span className="text-[#cccccc]">{cmd.command}</span> - {cmd.description}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center">
            <span className="text-[#007acc]">$ user:</span>
            <form onSubmit={handleSubmit} className="flex-1 ml-1">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? "AI is thinking..." : "Ask about your EAC project or type /help for commands..."}
                disabled={isLoading}
                className="w-full bg-transparent text-[#cccccc] border-none outline-none placeholder:text-[#858585] disabled:opacity-50 disabled:cursor-not-allowed caret-[#cccccc]"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 