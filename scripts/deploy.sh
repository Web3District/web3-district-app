#!/bin/bash
# deploy.sh - Safe deployment script with verification
# Usage: ./scripts/deploy.sh [commit-message]

set -e

cd "$(dirname "$0")/.."

echo "🚀 Web4City Deployment Script"
echo "=============================="
echo ""

# Step 1: Check for uncommitted changes
echo "📋 Step 1: Checking git status..."
if ! git diff-index --quiet HEAD --; then
    echo "   ⚠️  Uncommitted changes detected!"
    git status --short
    echo ""
    read -p "   Commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "   Commit message: " COMMIT_MSG
        git add -A
        git commit -m "$COMMIT_MSG"
    fi
else
    echo "   ✅ Working tree clean"
fi

# Step 2: Pull latest from origin
echo ""
echo "📥 Step 2: Pulling latest from origin..."
git pull origin main

# Step 3: Create deployment commit (if no changes were committed above)
echo ""
echo "📝 Step 3: Creating deployment commit..."
DEPLOY_MSG="${1:-Deploy $(date +%Y-%m-%d-%H%M)}"
git commit --allow-empty -m "$DEPLOY_MSG"

# Step 4: Push to GitHub (triggers Vercel)
echo ""
echo "📤 Step 4: Pushing to GitHub..."
git push origin main
echo "   ✅ Pushed to GitHub"
echo "   🔄 Vercel deployment triggered..."

# Step 5: Wait for Vercel to start building
echo ""
echo "⏳ Step 5: Waiting for Vercel to start building..."
sleep 15

# Step 6: Verify deployment
echo ""
echo "🔍 Step 6: Verifying deployment..."
chmod +x "$(dirname "$0")/verify-deploy.sh"
"$(dirname "$0")/verify-deploy.sh"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo "   Site: https://web4city.xyz"
    echo "   Vercel: https://vercel.com/web3district/web3-district-app/deployments"
else
    echo ""
    echo "⚠️  Deployment may have failed. Check Vercel dashboard."
    exit 1
fi
