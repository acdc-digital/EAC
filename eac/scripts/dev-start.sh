#!/bin/bash

# EAC Development Server Startup Script
# This script ensures we use a development deployment

echo "🚀 Starting EAC Development Environment..."

# Clear any existing Convex deployment variables
unset CONVEX_DEPLOYMENT
unset NEXT_PUBLIC_CONVEX_URL

# Start Convex in development mode with a fresh deployment
echo "📦 Setting up Convex development deployment..."

# Force create a new development deployment
npx convex dev --configure=new --team=acdc-digital --project=eac-dev

echo "✅ Development environment ready!"
