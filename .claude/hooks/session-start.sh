#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install dependencies if needed
npm install

# Kill any existing dev server
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Start dev server on all interfaces
nohup npm run dev -- -H 0.0.0.0 -p 3000 > /tmp/signalport-dev.log 2>&1 &

# Wait for server to be ready
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 2>/dev/null | grep -q "200"; then
    echo "Dev server ready on port 3000"
    break
  fi
  sleep 2
done
