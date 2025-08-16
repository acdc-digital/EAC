// Google Imagen API Integration
// /Users/matthewsimon/Projects/eac/eac/lib/api/imagen.ts

export interface ImagenGenerationRequest {
  prompt: string;
  aspectRatio?: 'ASPECT_RATIO_1_1' | 'ASPECT_RATIO_9_16' | 'ASPECT_RATIO_16_9' | 'ASPECT_RATIO_4_3';
  negativePrompt?: string;
  addWatermark?: boolean;
  seed?: number;
  outputMimeType?: 'image/png' | 'image/jpeg';
}

export interface ImagenGenerationResponse {
  images: Array<{
    bytesBase64Encoded: string;
    mimeType: string;
  }>;
  modelVersion: string;
  raiFilterApplied: boolean;
}

export interface LogoGenerationResult {
  imageUrl: string;
  imageData: string; // base64 encoded
  prompt: string;
  success: boolean;
  error?: string;
}

/**
 * Generate a logo using the API route
 */
// DEPRECATED: Google Imagen API Integration
// ⚠️  This file has been deprecated in favor of OpenAI DALL-E implementation
// ⚠️  See: /lib/api/openai-images.ts for the current implementation
// ⚠️  All code commented out but preserved as reference

// Note: This entire file is deprecated. The logoGeneratorAgent.ts has been updated
// to use the new OpenAI implementation instead of these Imagen functions.

// END OF DEPRECATED FILE - Use /lib/api/openai-images.ts for current implementation

/**
 * Generate a mock logo for development/testing
 */
function generateMockLogoBase64(): string {
  // This creates a simple SVG logo as base64 for testing
  const svgLogo = `
    <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="100" fill="#000000"/>
      <text x="100" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#ffffff">AMCP</text>
      <text x="100" y="70" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#cccccc">AUDIENCE MANAGEMENT</text>
      <circle cx="20" cy="20" r="8" fill="#ffcc02"/>
      <circle cx="180" cy="80" r="6" fill="#ffcc02"/>
    </svg>
  `;
  
  // Convert SVG to base64 (browser-safe)
  if (typeof window !== 'undefined') {
    return btoa(svgLogo);
  } else {
    // Node.js environment fallback
    return Buffer.from(svgLogo).toString('base64');
  }
}

/**
 * Optimize prompt for logo generation
 */
export function optimizeLogoPrompt(
  companyName: string,
  businessDescription: string,
  style: string,
  colors: string,
  logoType: 'text' | 'icon' | 'combination',
  targetAudience: string,
  additionalInstructions?: string
): string {
  let prompt = `Professional logo design for "${companyName}"`;
  
  if (businessDescription) {
    prompt += `, ${businessDescription}`;
  }
  
  // Style specifications
  const styleMap = {
    minimalist: 'clean, simple, minimal design with negative space',
    modern: 'contemporary, sleek, geometric, futuristic elements',
    traditional: 'classic, established, timeless, professional',
    playful: 'fun, creative, approachable, dynamic',
    elegant: 'sophisticated, refined, luxury, premium',
    bold: 'strong, impactful, confident, powerful'
  };
  
  prompt += `. Style: ${styleMap[style as keyof typeof styleMap] || style}`;
  
  // Logo type
  if (logoType === 'text') {
    prompt += '. Text-only logo with stylized typography, no icons or symbols';
  } else if (logoType === 'icon') {
    prompt += '. Icon-only logo, symbolic design, no text';
  } else {
    prompt += '. Combination logo with both company name text and complementary icon';
  }
  
  // Colors
  if (colors && !colors.toLowerCase().includes('no preference')) {
    prompt += `. Color scheme: ${colors}`;
  } else {
    prompt += '. Professional color scheme suitable for business use';
  }
  
  // Target audience consideration
  if (targetAudience) {
    prompt += `. Designed for ${targetAudience}`;
  }
  
  // Additional instructions
  if (additionalInstructions) {
    prompt += `. ${additionalInstructions}`;
  }
  
  // Quality and format specifications
  prompt += '. Vector-style design, clean background, scalable, professional quality, business-appropriate, modern branding';
  
  return prompt;
}
