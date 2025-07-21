#!/bin/bash

# EAC MCP Server Test Script
# Tests the MCP server functionality with the EAC project

echo "🧪 Testing EAC MCP Server"
echo "========================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the EAC project root directory"
    exit 1
fi

# Check if mcp-server directory exists
if [ ! -d "mcp-server" ]; then
    echo "❌ Error: mcp-server directory not found"
    exit 1
fi

echo "📁 Project root: $(pwd)"
echo "📂 MCP server: $(pwd)/mcp-server"
echo ""

# Navigate to mcp-server
cd mcp-server

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing MCP server dependencies..."
    pnpm install
    echo ""
fi

# Build the server
echo "🔨 Building MCP server..."
pnpm build
echo ""

# Test the simplified analysis
echo "🔍 Running EAC project analysis..."
echo "=================================="
echo ""

# Set project root and run analysis
EAC_PROJECT_ROOT=".." node dist/index-simple.js

echo ""
echo "✅ MCP Server test completed!"
echo ""
echo "Next steps:"
echo "1. Review the analysis output above"
echo "2. Check mcp-server/README.md for development guide"
echo "3. See docs/mcp-server-specification.md for full spec"
