// Test endpoint to trigger Twitter agent execution
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("🧪 Testing Twitter agent execution...");
    
    // Import the Twitter agent
    const { TwitterAgent } = await import('../../../store/agents/twitterAgent');
    
    // Create an instance
    const agent = new TwitterAgent();
    
    // Get the tools
    const tools = agent.tools;
    console.log("Available tools:", tools.map((t: any) => t.id));
    
    // Execute the Twitter post creation
    const result = await agent.execute(
      tools.find((t: any) => t.id === 'create-twitter-post')!,
      'test post content',
      {} as any // Mock convex mutations
    );
    
    return NextResponse.json({
      success: true,
      result: result
    });
    
  } catch (error) {
    console.error("❌ Twitter agent test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
