'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

export function ConvexDebug() {
  const { isSignedIn } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [currentUserId] = useState('debug-user-' + Date.now()); // Fixed user ID for session

  // Test basic queries (only if signed in)
  const projects = useQuery(api.projects.getProjects, isSignedIn ? {} : "skip");
  const socialPosts = useQuery(api.socialPosts.getAllPosts, isSignedIn ? {} : "skip");
  const messages = useQuery(api.messages.getMessages, isSignedIn ? {} : "skip");

  // Test mutations
  const createTestProject = useMutation(api.projects.createProject);
  const createTestPost = useMutation(api.socialPosts.upsertPost);

  console.log('🔍 [DEBUG] Convex Query Results:', {
    projects,
    socialPosts,
    messages,
    projectsLoading: projects === undefined,
    socialPostsLoading: socialPosts === undefined,
    messagesLoading: messages === undefined,
    currentUserId,
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
  });

  const handleCreateTestProject = async () => {
    try {
      setDebugInfo('Creating test project...');
      const result = await createTestProject({
        name: `Test Project ${Date.now()}`,
        description: 'Test project created from debug panel',
        status: 'active',
        budget: 1000,
        userId: currentUserId
      });
      setDebugInfo(`✅ Test project created: ${result}`);
      console.log('✅ Test project created:', result);
    } catch (error) {
      const errorMsg = `❌ Failed to create test project: ${error}`;
      setDebugInfo(errorMsg);
      console.error('❌ Failed to create test project:', error);
    }
  };

  const handleCreateTestPost = async () => {
    try {
      setDebugInfo('Creating test social post...');
      const result = await createTestPost({
        fileName: `test-post-${Date.now()}.md`,
        fileType: 'reddit',
        content: 'This is a test social media post created from the debug panel.',
        title: 'Test Post',
        platformData: JSON.stringify({ subreddit: 'test' }),
        status: 'scheduled',
        scheduledFor: new Date('2025-07-30').getTime(),
        userId: currentUserId
      });
      setDebugInfo(`✅ Test social post created: ${result?._id}`);
      console.log('✅ Test social post created:', result);
    } catch (error) {
      const errorMsg = `❌ Failed to create test post: ${error}`;
      setDebugInfo(errorMsg);
      console.error('❌ Failed to create test post:', error);
    }
  };

  return (
    <Card className="bg-[#1e1e1e] border-[#454545]">
      <CardHeader>
        <CardTitle className="text-[#cccccc] text-sm">🔍 Convex Database Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-[#cccccc]">Connection Status</h4>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[#858585]">Projects:</span>
              <span className={projects === undefined ? "text-yellow-400" : "text-green-400"}>
                {projects === undefined ? "Loading..." : `${projects.length} items`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#858585]">Social Posts:</span>
              <span className={socialPosts === undefined ? "text-yellow-400" : "text-green-400"}>
                {socialPosts === undefined ? "Loading..." : `${socialPosts.length} items`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#858585]">Messages:</span>
              <span className={messages === undefined ? "text-yellow-400" : "text-green-400"}>
                {messages === undefined ? "Loading..." : `${messages.length} items`}
              </span>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-[#cccccc]">Recent Data</h4>
          <div className="bg-[#0e0e0e] p-2 rounded text-xs">
            <div className="text-[#858585] mb-1">Projects:</div>
            <pre className="text-[#cccccc] text-[10px] overflow-auto max-h-20">
              {projects ? JSON.stringify(projects.slice(0, 2), null, 2) : 'Loading...'}
            </pre>
          </div>
          <div className="bg-[#0e0e0e] p-2 rounded text-xs">
            <div className="text-[#858585] mb-1">Social Posts:</div>
            <pre className="text-[#cccccc] text-[10px] overflow-auto max-h-20">
              {socialPosts ? JSON.stringify(socialPosts.slice(0, 2), null, 2) : 'Loading...'}
            </pre>
          </div>
        </div>

        {/* Test Actions */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-[#cccccc]">Test Actions</h4>
          <div className="flex gap-2">
            <Button 
              onClick={handleCreateTestProject}
              size="sm"
              className="text-xs bg-[#0e639c] hover:bg-[#094771]"
            >
              Create Test Project
            </Button>
            <Button 
              onClick={handleCreateTestPost}
              size="sm"
              className="text-xs bg-[#0e639c] hover:bg-[#094771]"
            >
              Create Test Post
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-[#0e0e0e] p-2 rounded text-xs">
            <div className="text-[#858585] mb-1">Debug Info:</div>
            <div className="text-[#cccccc]">{debugInfo}</div>
          </div>
        )}

        {/* Environment Check */}
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-[#cccccc]">Environment</h4>
          <div className="text-xs text-[#858585] space-y-1">
            <div>Convex URL: {process.env.NEXT_PUBLIC_CONVEX_URL ? '✅ Set' : '❌ Missing'}</div>
            <div>Node Env: {process.env.NODE_ENV}</div>
            <div>User ID: {currentUserId}</div>
            <div>Deployment: dev:pleasant-grouse-284</div>
          </div>
        </div>

        {/* Manual Database Check */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-[#cccccc]">Manual Checks</h4>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => {
                console.log('🔍 Manual check - Current query states:', {
                  projects: projects,
                  socialPosts: socialPosts,
                  messages: messages
                });
                setDebugInfo(`Manual check completed - see console for details`);
              }}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              Log Current State
            </Button>
            <Button 
              onClick={async () => {
                try {
                  setDebugInfo('Creating test message...');
                  const testMessage = await fetch('/api/test-convex', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ test: true })
                  });
                  const result = await testMessage.json();
                  setDebugInfo(`Connection test result: ${JSON.stringify(result)}`);
                } catch (error) {
                  setDebugInfo(`❌ Connection test failed: ${error}`);
                }
              }}
              size="sm"
              variant="outline" 
              className="text-xs"
            >
              Test Connection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
