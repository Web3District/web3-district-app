#!/bin/bash

# Web4City Admin - Build Script 🦑⚡
# Builds the native macOS app in one command

set -e

echo "🐥 Building Web4City Admin App..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the electron/ directory"
    echo "   cd electron && ./build.sh"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build Next.js export
echo "🏗️  Building Next.js export..."
cd ..
npm run build
cd electron

# Build the app
echo "📦 Building macOS app..."
npm run dist

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Your app is in: dist/"
echo ""
echo "🎯 Next steps:"
echo "   1. Open dist/Web4City Admin-1.0.0.dmg"
echo "   2. Drag Web4City Admin to Applications"
echo "   3. Launch from Applications folder"
echo ""
echo "⚠️  First launch: Right-click → Open (bypass macOS warning)"
echo ""
