// Test History System
// /Users/matthewsimon/Projects/eac/eac/app/_components/dashboard/historyTestPanel.tsx

"use client";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export function HistoryTestPanel() {
  const testOperations = [
    {
      label: "Test File Operation",
      action: () => logger.fileOpened("test-file.md", "Markdown Document")
    },
    {
      label: "Test Social Post",
      action: () => logger.socialPostCreated("reddit", "Test Post Title")
    },
    {
      label: "Test Connection Success",
      action: () => logger.connectionEstablished("reddit", "test_user")
    },
    {
      label: "Test Connection Error",
      action: () => logger.connectionFailed("reddit", "Invalid credentials")
    },
    {
      label: "Test Debug Success",
      action: () => logger.debugTest("API Connection", true, { endpoint: "/api/test", responseTime: "120ms" })
    },
    {
      label: "Test Debug Failure",
      action: () => logger.debugTest("Database Query", false, { error: "Timeout", query: "SELECT * FROM posts" })
    },
    {
      label: "Test Project Created",
      action: () => logger.projectCreated("New Test Project")
    },
    {
      label: "Test System Event",
      action: () => logger.systemEvent("backup_completed", "Automated backup completed successfully", { size: "125MB", duration: "45s" })
    }
  ];

  return (
    <div className="p-4 bg-[#2a2a2a] rounded-lg border border-[#454545]">
      <h3 className="text-sm font-medium text-[#cccccc] mb-3">History System Test Panel</h3>
      <p className="text-xs text-[#858585] mb-4">
        Click these buttons to generate test activity logs and verify the history system is working.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {testOperations.map((operation, index) => (
          <Button
            key={index}
            onClick={operation.action}
            variant="outline"
            size="sm"
            className="bg-transparent border-[#454545] text-[#cccccc] hover:bg-[#3a3a3a] text-xs"
          >
            {operation.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
