#!/bin/bash

# Web4City Admin - One-Click Build Script 🦑⚡
# Run from project root: ./build-admin-app.sh

set -e

echo "🐥 Building Web4City Admin App..."
echo ""

cd "$(dirname "$0")"

# Check if electron directory exists
if [ ! -d "electron" ]; then
    echo "❌ Error: electron/ directory not found"
    exit 1
fi

cd electron

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Electron dependencies..."
    npm install
fi

# Build Next.js export
echo "🏗️  Building Next.js export..."
cd ..
npm run build
cd electron

# Build the macOS app
echo "📦 Building macOS .app..."
npm run dist

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Your app is ready:"
echo "   dist/Web4City Admin-1.0.0.dmg"
echo ""
echo "🎯 Install:"
echo "   1. Open dist/Web4City\\ Admin-1.0.0.dmg"
echo "   2. Drag to Applications folder"
echo "   3. Launch from Applications"
echo ""
echo "⚠️  First launch: Right-click → Open (bypass warning once)"
echo ""
echo "🦑✨ Enjoy your native admin dashboard!"
echo ""
