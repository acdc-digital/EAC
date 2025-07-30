import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";

export function XApiTester() {
  const [result, setResult] = useState<string>("");
  const createConnection = useMutation(api.x.createXConnection);

  const testXConnection = async () => {
    try {
      setResult("Testing X connection creation...");
      
      const connectionId = await createConnection({
        userId: "test-user",
        username: "test_user",
        clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || "test-client-id",
        clientSecret: "test-client-secret", // This would be encrypted in production
        apiTier: "free"
      });

      setResult(`✅ Success! X connection created with ID: ${connectionId}`);
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-background">
      <h3 className="text-lg font-semibold mb-4">🐦 X (Twitter) API Test</h3>
      
      <div className="space-y-4">
        <Button 
          onClick={testXConnection}
          className="w-full"
        >
          Test X Connection Creation
        </Button>

        {result && (
          <div className="p-3 bg-muted rounded border font-mono text-sm">
            {result}
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Available X API Functions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>✅ <code>api.xApi.authenticateX</code> - OAuth 2.0 PKCE authentication</li>
            <li>✅ <code>api.xApi.createTweet</code> - Create and publish tweets</li>
            <li>✅ <code>api.xApi.uploadMedia</code> - Upload images/videos</li>
            <li>✅ <code>api.xApi.getTweetAnalytics</code> - Get tweet metrics</li>
            <li>✅ <code>api.x.createXConnection</code> - Store connection credentials</li>
            <li>✅ <code>api.x.getXConnections</code> - List user connections</li>
            <li>✅ <code>api.x.createXPost</code> - Save draft/scheduled tweets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
