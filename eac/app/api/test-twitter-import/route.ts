// Test endpoint to verify Twitter tools import
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("🔍 Testing Twitter tools import from API route...");
    
    // Try multiple import paths
    let twitterTools;
    let importPath = '';
    
    try {
      importPath = '../../../lib/twitter-tools/index.mjs';
      console.log(`🔗 Attempting: ${importPath}`);
      twitterTools = await import('../../../lib/twitter-tools/index.mjs');
    } catch (e1) {
      console.log(`❌ Failed: ${importPath}`, e1 instanceof Error ? e1.message : String(e1));
      try {
        importPath = '../../../lib/twitter-tools/index.js';
        console.log(`🔗 Attempting: ${importPath}`);
        twitterTools = await import('../../../lib/twitter-tools/index.js');
      } catch (e2) {
        console.log(`❌ Failed: ${importPath}`, e2 instanceof Error ? e2.message : String(e2));
        try {
          importPath = '../../../lib/twitter-tools';
          console.log(`🔗 Attempting: ${importPath}`);
          twitterTools = await import('../../../lib/twitter-tools');
        } catch (e3) {
          console.log(`❌ Failed: ${importPath}`, e3 instanceof Error ? e3.message : String(e3));
          throw new Error('All import attempts failed');
        }
      }
    }
    
    console.log("✅ Import successful!");
    console.log("Available exports:", Object.keys(twitterTools));
    console.log("processTwitterRequest type:", typeof twitterTools.processTwitterRequest);
    
    return NextResponse.json({
      success: true,
      imports: Object.keys(twitterTools),
      processTwitterRequestType: typeof twitterTools.processTwitterRequest,
      successPath: importPath
    });
    
  } catch (error) {
    console.error("❌ Import test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
