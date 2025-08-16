// Logo Generation API Route - OpenAI DALL-E Integration
// /Users/matthewsimon/Projects/eac/eac/app/api/generate-logo/route.ts

import {
  generateLogoWithOpenAI,
  validateOpenAIConfig,
  type LogoGenerationOptions
} from '@/lib/api/openai-images';
import { NextRequest, NextResponse } from 'next/server';

export interface LogoGenerationRequest {
  prompt: string;
  style?: 'vivid' | 'natural';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  numberOfImages?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Validate OpenAI configuration
    const configValidation = validateOpenAIConfig();
    if (!configValidation.isValid) {
      console.error('❌ OpenAI configuration invalid:', configValidation.error);
      return NextResponse.json({
        success: false,
        error: `OpenAI configuration error: ${configValidation.error}`,
        imageUrl: null,
        imageData: null,
        prompt: null
      }, { status: 500 });
    }

    const body: LogoGenerationRequest = await request.json();
    const { 
      prompt, 
      style = 'vivid', 
      size = '1024x1024', 
      quality = 'standard',
      numberOfImages = 1 
    } = body;

    console.log('🎨 Logo generation API called:', { 
      prompt, 
      style, 
      size, 
      quality, 
      numberOfImages 
    });

    // Generate logo using OpenAI DALL-E
    const options: LogoGenerationOptions = {
      prompt,
      style,
      size,
      quality,
      numberOfImages
    };

    const result = await generateLogoWithOpenAI(options);

    if (!result.success) {
      console.error('❌ Logo generation failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        imageUrl: null,
        imageData: null,
        prompt: prompt
      }, { status: 500 });
    }

    const response = {
      success: true,
      imageUrl: result.imageUrl,
      imageData: result.imageData || '',
      prompt: prompt,
      revisedPrompt: result.revisedPrompt,
      metadata: {
        ...result.metadata,
        requestedStyle: style,
        requestedSize: size,
        requestedQuality: quality,
        numberOfImages,
        generatedAt: new Date().toISOString()
      }
    };

    console.log('✅ Logo generation successful:', {
      success: response.success,
      hasImageUrl: !!response.imageUrl,
      hasRevisedPrompt: !!response.revisedPrompt
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Logo generation API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      imageUrl: null,
      imageData: null,
      prompt: null
    }, { status: 500 });
  }
}

// Remove the old placeholder function - now using real OpenAI integration
