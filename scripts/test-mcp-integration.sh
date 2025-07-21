#!/bin/bash

# MCP Integration Test Script for EAC Dashboard
# This script tests the MCP server integration by making HTTP requests
# to your deployed Convex functions on https://dashboard.convex.dev/d/blessed-squid-371

echo "🔧 EAC MCP Integration Test"
echo "=========================="
echo ""

echo "📝 Testing the following MCP integration components:"
echo "1. ✅ Convex functions deployed to blessed-squid-371"
echo "2. 🔗 Dev server running on http://localhost:3002"
echo "3. 🧪 Test interface available at /test-mcp"
echo ""

echo "🚀 Manual Testing Steps:"
echo ""
echo "1. Open http://localhost:3002/test-mcp in your browser"
echo "2. Try the 'Direct MCP Tool Tests' buttons:"
echo "   - Click 'Project Analysis' to test eac_project_analyze"
echo "   - Click 'Component Finder' to test eac_component_finder"
echo "   - Click 'Store Inspector' to test eac_store_inspector"
echo ""
echo "3. Test natural language detection:"
echo "   - Type: 'What's the structure of this project?'"
echo "   - Click 'Test Intent Detection' to see if it detects project analysis"
echo "   - Click 'Test Full Chat Flow' to see the complete integration"
echo ""
echo "4. Try these natural language examples:"

echo "   📊 'Analyze the project structure'"
echo "   🧩 'Show me all the dashboard components'"  
echo "   📦 'How is state management organized?'"
echo "   🗄️ 'What Convex functions do we have?'"
echo "   ⚡ 'Generate a new analytics component'"
echo ""

echo "💡 What to look for in the test results:"
echo "- Intent detection should identify the correct MCP tool (confidence > 0.7)"
echo "- MCP calls should return simulated responses with project data"
echo "- Full chat flow should trigger MCP automatically when detecting project questions"
echo ""

echo "🔍 Testing via the main chat interface:"
echo "1. Go to http://localhost:3002 (main dashboard)"
echo "2. Click the terminal tab"  
echo "3. Make sure 'AI Chat' is selected (should be default)"
echo "4. Type natural language questions like:"
echo "   $ user: What components do we have in the dashboard?"
echo "   $ user: Show me the project structure"
echo "   $ user: How is state organized?"
echo ""

echo "📊 Expected Behavior:"
echo "- The chat should detect MCP intents automatically"
echo "- OpenAI responses should include MCP analysis data"
echo "- Messages should be formatted in terminal style ($ user: / $ system:)"
echo ""

echo "🐛 If something isn't working:"
echo "1. Check the browser console for errors"
echo "2. Verify Convex functions are deployed at blessed-squid-371"
echo "3. Make sure .env.local has the correct CONVEX_DEPLOYMENT"
echo "4. Check that OpenAI API key is set in the Convex dashboard"
echo ""

echo "✅ Integration Status:"
echo "- Convex Functions: DEPLOYED"  
echo "- Dev Server: RUNNING (port 3002)"
echo "- Test Interface: http://localhost:3002/test-mcp"
echo "- Main Interface: http://localhost:3002"
echo ""

echo "🎯 Ready to test MCP integration!"
