#!/bin/bash
# vercel-webhook-notify.sh - Handle Vercel deployment webhooks
# Configure in Vercel: Project Settings → Git → Deploy Hooks
# Or: Project Settings → Notifications → Webhooks

# This script receives Vercel webhook POST data
# Usage: Called by webhook with POST data

WEBHOOK_DATA=$(cat)
EVENT_TYPE=$(echo "$WEBHOOK_DATA" | grep -o '"event":"[^"]*"' | cut -d'"' -f4)
DEPLOYMENT_STATE=$(echo "$WEBHOOK_DATA" | grep -o '"state":"[^"]*"' | cut -d'"' -f4)
DEPLOYMENT_URL=$(echo "$WEBHOOK_DATA" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)

LOG_FILE="$HOME/.openclaw/vercel-deployments.log"

echo "[$(date)] Event: $EVENT_TYPE, State: $DEPLOYMENT_STATE" >> "$LOG_FILE"

# Create alert file for Pint0 to pick up
ALERT_FILE="$HOME/.openclaw/vercel-alert.flag"

case "$DEPLOYMENT_STATE" in
    "READY")
        echo "✅ Deployment succeeded: $DEPLOYMENT_URL" >> "$LOG_FILE"
        rm -f "$ALERT_FILE"
        ;;
    "ERROR"|"CANCELED")
        echo "❌ Deployment failed: $DEPLOYMENT_URL" >> "$LOG_FILE"
        echo "DEPLOYMENT_FAILED:$DEPLOYMENT_URL" > "$ALERT_FILE"
        ;;
    "BUILDING")
        echo "🔄 Deployment building..." >> "$LOG_FILE"
        ;;
esac
