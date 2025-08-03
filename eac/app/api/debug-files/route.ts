import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    
    // Get all files
    const files = await client.query(api.files.getAllUserFiles);
    
    return NextResponse.json({
      totalFiles: files.length,
      twitterFiles: files.filter(f => (f as any).platform === 'twitter' || (f as any).extension === 'x'),
      allFiles: files.map(f => ({
        id: f._id,
        name: f.name,
        platform: (f as any).platform,
        extension: (f as any).extension,
        type: (f as any).type,
        hasContent: !!(f as any).content,
        contentLength: (f as any).content?.length || 0,
        contentPreview: (f as any).content?.substring(0, 100) || 'NO CONTENT'
      }))
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Failed to fetch files', details: error }, { status: 500 });
  }
}
