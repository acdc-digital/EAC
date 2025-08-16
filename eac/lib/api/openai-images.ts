// OpenAI DALL-E Logo Generation API
// Consolidated image generation using OpenAI DALL-E
// /Users/matthewsimon/Projects/eac/eac/lib/api/openai-images.ts

import OpenAI from 'openai';

/**
 * Create OpenAI client instance (server-side only)
 * This prevents client-side initialization errors
 */
function createOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is missing or empty');
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface LogoGenerationOptions {
  prompt: string;
  style?: 'vivid' | 'natural';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  numberOfImages?: number;
}

export interface LogoGenerationResult {
  success: boolean;
  imageUrl?: string;
  imageData?: string; // base64 encoded
  revisedPrompt?: string;
  error?: string;
  metadata?: {
    model: string;
    style: string;
    size: string;
    quality: string;
    generatedAt: string;
  };
}

/**
 * Generate a logo using OpenAI DALL-E 3
 * Consolidated system with unified prompts and optimizations
 */
export async function generateLogoWithOpenAI(
  options: LogoGenerationOptions
): Promise<LogoGenerationResult> {
  try {
    console.log('🎨 OpenAI DALL-E logo generation started:', {
      prompt: options.prompt,
      style: options.style || 'vivid',
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
    });

    // Create OpenAI client (server-side only)
    const openai = createOpenAIClient();

    // Optimize the prompt for logo generation
    const optimizedPrompt = optimizeLogoPrompt(options.prompt);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: optimizedPrompt,
      n: 1, // DALL-E 3 only supports n=1
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      style: options.style || 'vivid',
      response_format: 'url', // Can be 'url' or 'b64_json'
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image data returned from OpenAI');
    }

    const imageData = response.data[0];
    
    if (!imageData?.url) {
      throw new Error('No image URL returned from OpenAI');
    }

    console.log('✅ OpenAI DALL-E logo generation successful:', {
      hasUrl: !!imageData.url,
      revisedPrompt: imageData.revised_prompt ? 'Yes' : 'No'
    });

    return {
      success: true,
      imageUrl: imageData.url,
      revisedPrompt: imageData.revised_prompt || options.prompt,
      metadata: {
        model: 'dall-e-3',
        style: options.style || 'vivid',
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        generatedAt: new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error('❌ OpenAI DALL-E logo generation failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Optimize prompt for professional logo generation with DALL-E 3
 * Consolidated system prompt engineering for consistent results
 */
export function optimizeLogoPrompt(userPrompt: string): string {
  // Clean and prepare the user input
  const cleanPrompt = userPrompt.trim();
  
  // If the prompt already contains logo-specific language, use it as-is
  if (cleanPrompt.toLowerCase().includes('logo') || 
      cleanPrompt.toLowerCase().includes('brand') ||
      cleanPrompt.toLowerCase().includes('symbol')) {
    return enhanceLogoPrompt(cleanPrompt);
  }

  // Otherwise, add logo-specific context
  const logoPrompt = `Professional logo design for ${cleanPrompt}`;
  return enhanceLogoPrompt(logoPrompt);
}

/**
 * Enhanced logo prompt with professional design specifications
 * Unified system prompt for consistent branding results
 */
function enhanceLogoPrompt(basePrompt: string): string {
  return `${basePrompt}, clean modern design, vector style illustration, high contrast, scalable, professional branding, minimalist aesthetic, suitable for business use, white or transparent background, crisp lines, bold colors, memorable visual identity`;
}

/**
 * Alternative: Generate logo with base64 response for direct embedding
 */
export async function generateLogoBase64(
  options: LogoGenerationOptions
): Promise<LogoGenerationResult> {
  try {
    // Create OpenAI client (server-side only)
    const openai = createOpenAIClient();
    
    const optimizedPrompt = optimizeLogoPrompt(options.prompt);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: optimizedPrompt,
      n: 1,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      style: options.style || 'vivid',
      response_format: 'b64_json',
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image data returned from OpenAI');
    }

    const imageData = response.data[0];
    
    if (!imageData?.b64_json) {
      throw new Error('No image data returned from OpenAI');
    }

    return {
      success: true,
      imageData: imageData.b64_json,
      revisedPrompt: imageData.revised_prompt || options.prompt,
      metadata: {
        model: 'dall-e-3',
        style: options.style || 'vivid',
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        generatedAt: new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error('❌ OpenAI DALL-E base64 generation failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Validate OpenAI API configuration
 */
export function validateOpenAIConfig(): { isValid: boolean; error?: string } {
  if (!process.env.OPENAI_API_KEY) {
    return {
      isValid: false,
      error: 'OPENAI_API_KEY environment variable is not set'
    };
  }

  if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    return {
      isValid: false,
      error: 'Invalid OPENAI_API_KEY format (should start with sk-)'
    };
  }

  return { isValid: true };
}
