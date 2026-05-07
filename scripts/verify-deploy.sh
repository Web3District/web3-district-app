#!/bin/bash
# verify-deploy.sh - Verify Vercel deployment succeeded
# Usage: ./scripts/verify-deploy.sh [expected-text]

set -e

EXPECTED_TEXT="${1:-USE YOUR GITHUB TO CLAIM YOUR LAND}"
URL="https://web4city.xyz"
MAX_RETRIES=12
RETRY_DELAY=10

echo "🔍 Verifying deployment to $URL"
echo "📝 Expected text: \"$EXPECTED_TEXT\""
echo ""

for i in $(seq 1 $MAX_RETRIES); do
    echo "⏱️  Check $i/$MAX_RETRIES..."
    
    # Fetch page and search for expected text
    RESPONSE=$(curl -s "$URL?nocache=$(date +%s)" || echo "")
    
    if echo "$RESPONSE" | grep -q "$EXPECTED_TEXT"; then
        echo ""
        echo "✅ DEPLOYMENT VERIFIED!"
        echo "   Found: \"$EXPECTED_TEXT\""
        echo "   Time: $(date)"
        exit 0
    fi
    
    # Check for build errors
    if echo "$RESPONSE" | grep -q "Application Error\|Build Error\|500\|502\|503"; then
        echo ""
        echo "❌ BUILD ERROR DETECTED!"
        echo "   Check Vercel dashboard: https://vercel.com/web3district/web3-district-app/deployments"
        exit 1
    fi
    
    if [ $i -lt $MAX_RETRIES ]; then
        echo "   Not yet... retrying in ${RETRY_DELAY}s"
        sleep $RETRY_DELAY
    fi
done

echo ""
echo "⚠️  DEPLOYMENT VERIFICATION FAILED"
echo "   Expected text not found after $MAX_RETRIES checks"
echo ""
echo "🔧 Troubleshooting:"
echo "   1. Check Vercel deployments: https://vercel.com/web3district/web3-district-app/deployments"
echo "   2. Check build logs for errors"
echo "   3. Try hard refresh: Cmd+Shift+R"
echo "   4. Clear browser cache"
echo ""
exit 1
