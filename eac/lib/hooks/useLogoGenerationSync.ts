// Logo Generation Sync Hook
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useLogoGenerationSync.ts

import { api } from '@/convex/_generated/api';
import { useLogoGeneratorStore } from '@/store/logoGenerator';
import { useSessionStore } from '@/store/terminal/session';
import { useQuery } from 'convex/react';
import { useEffect } from 'react';

/**
 * Hook to sync logo generation results from chat messages to the logo store
 */
export function useLogoGenerationSync() {
  const { activeSessionId } = useSessionStore();
  const { setCurrentLogo, setIsGenerating } = useLogoGeneratorStore();
  
  // Get chat messages for the active session
  const chatMessages = useQuery(
    api.chat.getChatMessages,
    activeSessionId ? { sessionId: activeSessionId, limit: 50 } : "skip"
  );

  useEffect(() => {
    if (!chatMessages || typeof window === 'undefined') return;

    // Look for logo generation results in recent messages
    const logoGenerationMessages = chatMessages
      .filter(message => 
        message.role === 'assistant' && 
        message.operation?.type === 'tool_executed' &&
        message.operation?.details?.tool === 'logo_generation'
      )
      .sort((a, b) => b.createdAt - a.createdAt); // Most recent first

    if (logoGenerationMessages.length > 0) {
      const latestGeneration = logoGenerationMessages[0];
      const details = latestGeneration.operation?.details;
      
      console.log('🔄 Logo sync found generation message:', {
        hasDetails: !!details,
        hasImageUrl: !!details?.imageUrl,
        imageUrlPreview: details?.imageUrl?.substring(0, 50),
        hasBrief: !!details?.brief,
        messageId: latestGeneration._id
      });
      
      if (details && details.imageUrl && details.brief) {
        const generatedLogo = {
          imageUrl: details.imageUrl,
          imageData: details.imageData || '',
          prompt: details.prompt || '',
          brief: details.brief,
          generatedAt: latestGeneration.createdAt
        };
        
        console.log('✅ Setting current logo in store:', {
          imageUrl: generatedLogo.imageUrl.substring(0, 50) + '...',
          hasImageData: !!generatedLogo.imageData,
          promptLength: generatedLogo.prompt.length,
          companyName: generatedLogo.brief?.companyName
        });
        
        setCurrentLogo(generatedLogo);
        setIsGenerating(false);
      }
    }
  }, [chatMessages, setCurrentLogo, setIsGenerating]);

  // Monitor for generation in progress
  useEffect(() => {
    if (!chatMessages || typeof window === 'undefined') return;

    const recentMessages = chatMessages.slice(-5); // Check last 5 messages
    const hasGeneratingMessage = recentMessages.some(message =>
      message.content.includes('🔄 Creating with Google Imagen AI') ||
      message.content.includes('Generating Your Logo')
    );

    if (hasGeneratingMessage) {
      setIsGenerating(true);
    }
  }, [chatMessages, setIsGenerating]);
}

/**
 * Hook to extract logo generation prompt from chat messages
 */
export function useLogoGenerationPrompt() {
  const { activeSessionId } = useSessionStore();
  
  const chatMessages = useQuery(
    api.chat.getChatMessages,
    activeSessionId ? { sessionId: activeSessionId, limit: 50 } : "skip"
  );

  const latestPrompt = chatMessages
    ?.filter(message => 
      message.role === 'assistant' && 
      message.operation?.type === 'tool_executed' &&
      message.operation?.details?.tool === 'logo_generation'
    )
    .sort((a, b) => b.createdAt - a.createdAt)[0]
    ?.operation?.details?.prompt;

  return latestPrompt || null;
}
