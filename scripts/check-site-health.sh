#!/bin/bash
# check-site-health.sh - Monitor site health and deployment status
# Add to cron: 0 */6 * * * /path/to/check-site-health.sh >> /tmp/web4city-health.log 2>&1

URL="https://web4city.xyz"
LOG_FILE="/tmp/web4city-health.log"
ALERT_FILE="$HOME/.openclaw/web4city-alert.flag"

echo "[$(date)] Health check started" >> "$LOG_FILE"

# Check 1: Site is reachable
if ! curl -s --max-time 10 "$URL" > /dev/null; then
    echo "[$(date)] ❌ SITE DOWN - $URL not reachable" >> "$LOG_FILE"
    touch "$ALERT_FILE"
    echo "SITE_DOWN" > "$ALERT_FILE"
    exit 1
fi

# Check 2: Expected content exists
RESPONSE=$(curl -s --max-time 10 "$URL?nocache=$(date +%s)")

if ! echo "$RESPONSE" | grep -q "Web4City"; then
    echo "[$(date)] ❌ CONTENT MISSING - Web4City title not found" >> "$LOG_FILE"
    echo "CONTENT_MISSING" > "$ALERT_FILE"
    exit 1
fi

# Check 3: Search placeholder is correct
if ! echo "$RESPONSE" | grep -q "USE YOUR GITHUB TO CLAIM YOUR LAND"; then
    echo "[$(date)] ⚠️  WRONG PLACEHOLDER - Old text still showing" >> "$LOG_FILE"
    echo "WRONG_PLACEHOLDER" > "$ALERT_FILE"
    exit 1
fi

# Check 4: No build errors
if echo "$RESPONSE" | grep -q "Application Error\|Build Error"; then
    echo "[$(date)] ❌ BUILD ERROR - Error page detected" >> "$LOG_FILE"
    echo "BUILD_ERROR" > "$ALERT_FILE"
    exit 1
fi

# All checks passed
echo "[$(date)] ✅ All health checks passed" >> "$LOG_FILE"
rm -f "$ALERT_FILE"
exit 0
