"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useExtensionRequests } from "@/lib/hooks/useExtensionRequests";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronRight, Plus, Send } from "lucide-react";
import { useState } from "react";

interface ExtensionRequestFormProps {
  isExpanded: boolean;
  className?: string;
}

export function ExtensionRequestForm({ isExpanded, className }: ExtensionRequestFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { createRequest } = useExtensionRequests();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        title: title.trim(),
        description: description.trim(),
        requestType: "new_extension", // Default to extension type
        userId: "anonymous", // TODO: Replace with actual user ID when auth is implemented
      });
      
      setSubmitted(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to submit extension request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) return null;

  if (submitted) {
    return (
      <div className={cn("px-2 pb-2 border-t border-[#2d2d2d] bg-[#1a1a1a]", className)}>
        <div className="mt-2 p-3 rounded bg-[#1e1e1e] border border-[#2d2d2d]">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Request submitted successfully!</span>
          </div>
          <p className="text-xs text-[#858585] text-center mt-2">
            Thank you for your suggestion. We'll review it and consider it for development.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("px-2 pb-2 border-t border-[#2d2d2d] bg-[#1a1a1a]", className)}>
      <div className="mt-2 space-y-3">
        {/* Title Input */}
        <div>
          <label className="text-xs text-[#858585] block mb-1">Extension Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., TikTok Integration, Advanced Analytics..."
            className="w-full bg-[#2d2d2d] border border-[#454545] rounded text-xs px-2 py-1.5 placeholder-[#858585] focus:outline-none focus:border-[#007acc]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-[#858585] block mb-1">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you'd like this extension to do, which platforms it should support, and how it would help your workflow..."
            className="w-full bg-[#2d2d2d] border border-[#454545] rounded text-xs px-2 py-1.5 placeholder-[#858585] focus:outline-none focus:border-[#007acc] resize-none"
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || isSubmitting}
            className="bg-[#007acc] hover:bg-[#005a9e] text-white text-xs h-7 px-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-1" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-3 h-3 mr-1" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ExtensionRequestButtonProps {
  className?: string;
}

export function ExtensionRequestButton({ className }: ExtensionRequestButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn("rounded border bg-[#1e1e1e] border-[#2d2d2d]", className)}>
      {/* Extension Request Header */}
      <div 
        className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[#252526] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Expand/Collapse Arrow */}
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-[#858585]" />
          ) : (
            <ChevronRight className="w-3 h-3 text-[#858585]" />
          )}
        </div>

        {/* Extension Icon */}
        <div className="flex-shrink-0">
          <Plus className="w-3.5 h-3.5 text-[#858585]" />
        </div>

        {/* Extension Name */}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-[#cccccc] truncate">
            Request Extension
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <ExtensionRequestForm isExpanded={isExpanded} />
    </div>
  );
}
