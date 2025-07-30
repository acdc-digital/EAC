#!/bin/bash

# EAC Convex Setup Script
# This script clears problematic environment variables and sets up a new Convex project

echo "🧹 Clearing old Convex environment variables..."

# Unset the problematic environment variables for this session
unset CONVEX_URL
unset CONVEX_DEPLOY_KEY
unset CONVEX_DEPLOYMENT
unset NEXT_PUBLIC_CONVEX_URL

echo "✅ Environment variables cleared"
echo "🚀 Starting fresh Convex setup..."

# Remove any existing .env files to start completely fresh
rm -f .env.local .env.production

# Set working directory to EAC project
cd "$(dirname "$0")/.."

echo "📁 Working directory: $(pwd)"

# Run Convex dev to trigger authentication and project setup
echo "🔐 Running Convex dev to authenticate and create new project..."
npx convex dev --configure new
