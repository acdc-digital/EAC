"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

interface TestResult {
  type: "mcp-call" | "intent" | "chat" | "error";
  tool?: string;
  message?: string;
  result?: unknown;
  intent?: unknown;
  error?: string;
}

export default function TestMCPPage() {
  const [testMessage, setTestMessage] = useState("");
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Test MCP actions
  const callMCPServer = useAction(api.mcpIntegration.callMCPServer);
  const detectIntent = useAction(api.mcpIntegration.detectProjectIntent);
  const sendChatMessage = useAction(api.chatActions.sendChatMessage);

  const testMCPCall = async (tool: string) => {
    setLoading(true);
    try {
      const result = await callMCPServer({
        tool,
        sessionId: "test-session",
      });
      setResult({ type: "mcp-call", tool, result });
    } catch (error) {
      setResult({ 
        type: "error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
    setLoading(false);
  };

  const testIntentDetection = async () => {
    if (!testMessage.trim()) return;
    
    setLoading(true);
    try {
      const intent = await detectIntent({ message: testMessage });
      setResult({ type: "intent", message: testMessage, intent });
    } catch (error) {
      setResult({ 
        type: "error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
    setLoading(false);
  };

  const testFullChat = async () => {
    if (!testMessage.trim()) return;
    
    setLoading(true);
    try {
      const chatResult = await sendChatMessage({
        content: testMessage,
        sessionId: "test-session",
      });
      setResult({ type: "chat", message: testMessage, result: chatResult });
    } catch (error) {
      setResult({ 
        type: "error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
    setLoading(false);
  };

  const predefinedTests = [
    {
      name: "Project Analysis",
      tool: "eac_project_analyze",
      message: "What's the structure of this project?"
    },
    {
      name: "Component Finder", 
      tool: "eac_component_finder",
      message: "Show me all the dashboard components"
    },
    {
      name: "Store Inspector",
      tool: "eac_store_inspector", 
      message: "How is state management organized?"
    },
    {
      name: "Convex Analyzer",
      tool: "eac_convex_analyzer",
      message: "What Convex functions do we have?"
    },
    {
      name: "Code Generator",
      tool: "eac_code_generator",
      message: "Generate a new analytics component"
    },
    {
      name: "🆕 Create Project",
      tool: "eac_project_creator",
      message: 'Create a new project called "Test Project MCP"'
    }
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#cccccc] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-[#ffffff]">MCP Server Test Interface</h1>
        
        {/* Direct MCP Tool Tests */}
        <Card className="bg-[#252526] border-[#454545] p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[#ffffff]">Direct MCP Tool Tests</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {predefinedTests.map((test) => (
              <Button
                key={test.tool}
                onClick={() => testMCPCall(test.tool)}
                disabled={loading}
                className="bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm"
              >
                {test.name}
              </Button>
            ))}
          </div>
        </Card>

        {/* Natural Language Tests */}
        <Card className="bg-[#252526] border-[#454545] p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[#ffffff]">Natural Language Tests</h2>
          <Textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter a natural language question (e.g., 'What components do we have?')"
            className="bg-[#1a1a1a] border-[#454545] text-[#cccccc] mb-4"
            rows={3}
          />
          <div className="flex gap-4">
            <Button
              onClick={testIntentDetection}
              disabled={loading || !testMessage.trim()}
              className="bg-[#6f42c1] hover:bg-[#7952cc] text-white"
            >
              Test Intent Detection
            </Button>
            <Button
              onClick={testFullChat}
              disabled={loading || !testMessage.trim()}
              className="bg-[#28a745] hover:bg-[#34ce57] text-white"
            >
              Test Full Chat Flow
            </Button>
          </div>
        </Card>

        {/* Quick Test Messages */}
        <Card className="bg-[#252526] border-[#454545] p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[#ffffff]">Quick Test Messages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {predefinedTests.map((test) => (
              <Button
                key={test.message}
                onClick={() => setTestMessage(test.message)}
                variant="outline"
                className="border-[#454545] text-[#cccccc] hover:bg-[#2a2d2e] text-left justify-start text-sm"
              >
                &quot;{test.message}&quot;
              </Button>
            ))}
          </div>
        </Card>

        {/* Results Display */}
        {result && (
          <Card className="bg-[#252526] border-[#454545] p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#ffffff]">Test Results</h2>
            <div className="bg-[#1a1a1a] p-4 rounded border border-[#454545]">
              <pre className="text-xs text-[#cccccc] whitespace-pre-wrap overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </Card>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-[#252526] p-6 rounded border border-[#454545]">
              <div className="text-[#cccccc]">Testing MCP integration...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
