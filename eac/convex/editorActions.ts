// Editor Actions - File editing with AI assistance
// /Users/matthewsimon/Projects/eac/eac/convex/editorActions.ts

"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { action } from "./_generated/server";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const editFileWithAI = action({
  args: {
    fileName: v.string(),
    originalContent: v.string(),
    editInstructions: v.string(),
    fileType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("🤖 Editor Action: Starting AI file editing...");
    
    try {
      const { fileName, originalContent, editInstructions, fileType } = args;
      
      console.log("📝 Edit request:", {
        fileName,
        originalLength: originalContent.length,
        instructions: editInstructions.substring(0, 100) + "...",
        fileType
      });

      // Check if we should use API fallback (for development/testing)
      const useAPIFallback = !process.env.ANTHROPIC_API_KEY || 
                             process.env.USE_FALLBACK_MODE === "true" ||
                             process.env.NODE_ENV === "development";
      
      if (useAPIFallback) {
        console.log("🔄 Using fallback mode for file editing...");
        
        // Simulate AI editing with a structured response
        const editedContent = await simulateFileEditing(originalContent, editInstructions, fileType);
        
        console.log("✅ Fallback editing complete:", {
          originalLength: originalContent.length,
          editedLength: editedContent.length,
          hasChanges: editedContent !== originalContent
        });
        
        return editedContent;
      }

      // Real AI editing with Anthropic Claude
      console.log("🧠 Using Anthropic Claude for file editing...");
      
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `You are a professional editor helping to revise file content. 

**File:** ${fileName}
**File Type:** ${fileType || 'text'}

**Original Content:**
${originalContent}

**Edit Instructions:**
${editInstructions}

**Task:** Please revise the content according to the instructions. Return ONLY the revised content, without any explanation or additional text. Maintain the same general structure and format unless specifically asked to change it.

**Revised Content:`
          }
        ]
      });

      const editedContent = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('') || '';

      if (!editedContent.trim()) {
        throw new Error('No edited content received from AI');
      }

      console.log("✅ AI editing complete:", {
        originalLength: originalContent.length,
        editedLength: editedContent.length,
        hasChanges: editedContent !== originalContent
      });

      return editedContent;

    } catch (error) {
      console.error("❌ File editing failed:", error);
      throw new Error(`Failed to edit file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Fallback function to simulate AI editing
async function simulateFileEditing(
  originalContent: string, 
  editInstructions: string, 
  fileType?: string
): Promise<string> {
  
  // Simple simulation based on common edit instructions
  let editedContent = originalContent;
  const instructions = editInstructions.toLowerCase();
  
  // Add content scenarios
  if (instructions.includes('add') || instructions.includes('include')) {
    if (instructions.includes('section')) {
      editedContent += `\n\n## New Section\n\nContent added based on your request: ${editInstructions}\n\nThis section has been added to address your editing requirements.`;
    } else {
      editedContent += `\n\n*Added content based on your request: ${editInstructions}*`;
    }
  }
  
  // Update/modify scenarios
  if (instructions.includes('update') || instructions.includes('modify') || instructions.includes('change')) {
    const timestamp = new Date().toISOString().split('T')[0];
    editedContent = `${editedContent}\n\n---\n*Updated on ${timestamp}: ${editInstructions}*`;
  }
  
  // Professional tone scenarios
  if (instructions.includes('professional') || instructions.includes('formal')) {
    editedContent = editedContent
      .replace(/\bhey\b/gi, 'greetings')
      .replace(/\bokay\b/gi, 'very well')
      .replace(/\bawesome\b/gi, 'excellent');
  }
  
  // Casual tone scenarios
  if (instructions.includes('casual') || instructions.includes('friendly')) {
    editedContent = editedContent
      .replace(/\bgreetings\b/gi, 'hey')
      .replace(/\bvery well\b/gi, 'okay')
      .replace(/\bexcellent\b/gi, 'awesome');
  }
  
  // If no specific changes detected, add a general improvement note
  if (editedContent === originalContent) {
    editedContent = `${originalContent}\n\n---\n*File edited according to: ${editInstructions}*\n*Note: This is a simulated edit in fallback mode.*`;
  }
  
  return editedContent;
}
