#!/bin/bash

# EAC Development Environment Script
# This script ensures we always use the development deployment

echo "🚀 Starting EAC Development with Development Deployment..."

# Set environment variables explicitly
export CONVEX_DEPLOYMENT=dev:pleasant-grouse-284
export NEXT_PUBLIC_CONVEX_URL=https://pleasant-grouse-284.convex.cloud

# Update the .env.local file to ensure it has the correct values
cat > .env.local << EOF
# Deployment used by npx convex dev - DEVELOPMENT ONLY
CONVEX_DEPLOYMENT=dev:pleasant-grouse-284
NEXT_PUBLIC_CONVEX_URL=https://pleasant-grouse-284.convex.cloud

# Additional development environment variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Clerk Authentication (Development)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZGVsaWNhdGUtbWFuLTYzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_Q3rVvgO1MmVX2EuH6VwF9H7nRnG5VKEWFsw8Y5LO7GgSxjfmJ9XoXHW9X6Wj8j
EOF

echo "✅ Environment configured for development deployment: dev:pleasant-grouse-284"
echo "📦 Convex URL: https://pleasant-grouse-284.convex.cloud"

# Run convex dev
echo "🔄 Starting Convex development server..."
npx convex dev
