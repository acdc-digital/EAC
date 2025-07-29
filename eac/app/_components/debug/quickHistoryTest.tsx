// Quick Test Component for History System
// /Users/matthewsimon/Projects/eac/eac/app/_components/debug/quickHistoryTest.tsx

"use client";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export function QuickHistoryTest() {
  const generateTestLogs = () => {
    // Add some sample activity logs
    logger.fileOpened("social-post-1.md", "Markdown Document");
    logger.fileStatusChanged("reddit-post.md", "draft", "scheduled");
    logger.socialPostCreated("reddit", "My First Reddit Post");
    logger.connectionEstablished("reddit", "test_user");
    logger.folderToggled("Project Alpha", true);
    logger.projectCreated("New Marketing Campaign");
    logger.debugTest("Database Connection", true, { latency: "23ms" });
    logger.systemEvent("auto_save", "Files auto-saved successfully", { fileCount: 5 });
    
    // Add an error for variety
    logger.connectionFailed("twitter", "Invalid API credentials");
    logger.socialPostFailed("reddit", "Failed Post", "Rate limit exceeded");
  };

  return (
    <div className="p-2 bg-[#2a2a2a] rounded border border-[#454545]">
      <p className="text-xs text-[#858585] mb-2">Generate test activity logs</p>
      <Button
        onClick={generateTestLogs}
        size="sm"
        className="bg-[#0e639c] hover:bg-[#1177bb] text-white text-xs h-6 px-3"
      >
        Add Test Activity
      </Button>
    </div>
  );
}
