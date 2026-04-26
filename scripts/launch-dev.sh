#!/usr/bin/env bash
# Starts the dev server and opens the app in your default browser (macOS).
set -euo pipefail
cd "$(dirname "$0")/.."
echo "Web3 District → http://localhost:3001 (opens in browser after the server is ready)"
(sleep 4 && open "http://localhost:3001") &
exec npm run dev
