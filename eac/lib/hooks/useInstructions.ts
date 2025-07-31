// Instructions Project Management Hook
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useInstructions.ts

import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { useEffect } from 'react';

/**
 * Hook to manage Instructions project and files
 * Automatically ensures Instructions project exists for authenticated users
 */
export function useInstructions() {
  const { isSignedIn } = useAuth();
  
  // Queries - only run when user is signed in
  const instructionsProject = useQuery(
    api.projects.getInstructionsProject, 
    isSignedIn ? {} : "skip"
  );
  const instructionFiles = useQuery(
    api.files.getInstructionFiles, 
    isSignedIn && instructionsProject ? {} : "skip"
  );
  
  // Mutations
  const ensureInstructionsProject = useMutation(api.projects.ensureInstructionsProject);
  const createInstructionFile = useMutation(api.files.createInstructionFile);
  
  // Automatically ensure Instructions project exists when user is signed in
  useEffect(() => {
    if (isSignedIn && !instructionsProject) {
      ensureInstructionsProject({})
        .then(() => {
          console.log('✅ Instructions project ensured for user');
        })
        .catch((error) => {
          console.error('❌ Failed to ensure Instructions project:', error);
        });
    }
  }, [isSignedIn, instructionsProject, ensureInstructionsProject]);
  
  /**
   * Create a new instruction file
   */
  const createInstruction = async (params: {
    name: string;
    content: string;
    topic?: string;
    audience?: string;
  }) => {
    try {
      // Ensure project exists first
      if (!instructionsProject) {
        await ensureInstructionsProject({});
      }
      
      const newFile = await createInstructionFile(params);
      console.log('✅ Instruction file created:', newFile?.name);
      return newFile;
    } catch (error) {
      console.error('❌ Failed to create instruction file:', error);
      throw error;
    }
  };
  
  /**
   * Get all instruction files as context for AI
   */
  const getInstructionContext = (): string => {
    if (!instructionFiles || instructionFiles.length === 0) {
      return '';
    }
    
    const contextParts = instructionFiles.map(file => {
      return `## ${file.name}\n${file.content || 'No content available'}\n`;
    });
    
    return `# Project Instructions Context\n\n${contextParts.join('\n')}`;
  };
  
  /**
   * Check if Instructions project exists
   */
  const hasInstructionsProject = !!instructionsProject;
  
  /**
   * Get instruction files count
   */
  const instructionCount = instructionFiles?.length || 0;
  
  return {
    // Data
    instructionsProject,
    instructionFiles,
    hasInstructionsProject,
    instructionCount,
    
    // Actions
    createInstruction,
    getInstructionContext,
    ensureInstructionsProject,
    
    // Status
    isLoading: instructionsProject === undefined,
  };
}

/**
 * Hook to get instruction context for AI chat
 * Returns formatted instruction content to be included in AI prompts
 */
export function useInstructionContext() {
  const { instructionFiles } = useInstructions();
  
  if (!instructionFiles || instructionFiles.length === 0) {
    return null;
  }
  
  const context = instructionFiles
    .filter(file => file.content && file.content.trim().length > 0)
    .map(file => {
      return `### ${file.name.replace('.md', '').replace(/-/g, ' ')}\n${file.content}`;
    })
    .join('\n\n');
  
  if (!context.trim()) {
    return null;
  }
  
  return `## Project Instructions\n\nThe following are project-specific instructions that should guide your responses:\n\n${context}`;
}
