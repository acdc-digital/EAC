#!/bin/bash

# Force Development Environment Script
# This script ensures we always use the correct development deployment

echo "🔧 Forcing development environment configuration..."

# Create the .env.local with development deployment
cat > .env.local << 'EOF'
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

echo "✅ Development environment configured"
echo "📦 Deployment: dev:pleasant-grouse-284"
echo "🌐 URL: https://pleasant-grouse-284.convex.cloud"

# Export environment variables for this session
export CONVEX_DEPLOYMENT=dev:pleasant-grouse-284
export NEXT_PUBLIC_CONVEX_URL=https://pleasant-grouse-284.convex.cloud

# Run the command passed as arguments
if [ $# -gt 0 ]; then
    echo "🚀 Running: $@"
    "$@"
    
    # After Convex runs, restore our development settings
    echo "🔄 Restoring development configuration..."
    cat > .env.local << 'EOF'
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
    echo "✅ Development configuration restored"
fi
