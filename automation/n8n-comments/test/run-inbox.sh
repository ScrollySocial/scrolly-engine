#!/usr/bin/env bash
# Runs the real comment inbox (inbox/server.mjs) for the end-to-end test on port 5691,
# with a fresh empty data folder each time. Run it in its own terminal (or in the
# background) next to node test/mock-apis.mjs, then bash test/fresh-container.sh
# and node test/run-test.mjs.
set -e
cd "$(dirname "$0")/.."
tmp="$(mktemp -d)"
mkdir -p "$tmp/data" "$tmp/config"
# Mercedes's profile, so the signup page looks the way her live one does.
cp config/profile.json "$tmp/config/"
echo "test inbox data in $tmp"
PORT=5691 DATA_DIR="$tmp/data" CONFIG_DIR="$tmp/config" \
  INBOX_API_SECRET=test-inbox-secret INBOX_SETUP_CODE=test-setup-code INBOX_SECURE_COOKIE=false \
  RUN_SECRET=test-run-secret N8N_RUN_URL=http://localhost:5688/webhook/comments-run \
  YOUTUBE_KEEP_DAYS=21 INBOX_TEST_HOOKS=true N8N_HOST=localhost:5691 \
  MAILERLITE_API_KEY=test-ml MAILERLITE_BASE=http://localhost:5690/mailerlite \
  exec node inbox/server.mjs
