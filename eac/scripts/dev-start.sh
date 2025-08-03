#!/bin/bash

# EAC Development Server Startup Script
# This script connects to the existing pleasant-grouse-284 deployment

echo "🚀 Starting EAC Development Environment..."

# Set the specific deployment we want to use
export CONVEX_DEPLOYMENT=dev:pleasant-grouse-284
export NEXT_PUBLIC_CONVEX_URL=https://pleasant-grouse-284.convex.cloud

echo "📦 Connecting to Convex deployment: pleasant-grouse-284..."

# Start Convex in development mode using the existing deployment
npx convex dev &

# Wait a moment for Convex to initialize
echo "⏳ Waiting for Convex to initialize..."
sleep 3

echo "🌐 Starting Next.js development server..."
echo "✅ Development environment ready!"
echo ""
echo "📱 Application will be available at http://localhost:3000"
echo "🔧 Convex dashboard available at: https://dashboard.convex.dev/d/pleasant-grouse-284"

# Start Next.js dev server
exec npx next dev
