#!/bin/bash
# Quick setup script for EAC Dashboard
# Run with: ./setup.sh

echo "🚀 Setting up EAC Dashboard..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if .env.local exists in eac folder
if [ ! -f "eac/.env.local" ]; then
    echo "📝 Creating environment file..."
    cp .env.example eac/.env.local
    echo "✅ Created eac/.env.local from .env.example"
    echo "⚠️  Please add your Anthropic API key to eac/.env.local for chat functionality"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check if Convex is configured
if [ ! -f ".env.local" ]; then
    echo "⚠️  Convex not configured. Run 'pnpm convex:dev' to set up Convex backend"
fi

echo "✅ Setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Add your Anthropic API key to eac/.env.local"
echo "2. Run 'pnpm convex:dev' to start Convex backend"
echo "3. Run 'pnpm dev' to start the development server"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "💬 AI Chat Features:"
echo "- Access via terminal tab at bottom of dashboard"
echo "- Type /help for available commands"
echo "- Chat format: '$ user:' and '$ system:' responses"
