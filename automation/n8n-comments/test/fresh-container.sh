#!/usr/bin/env bash
# Starts a clean test n8n (fresh volume, so no remembered comments), imports and
# publishes the workflow, and waits until the webhooks answer. Extra arguments go
# to docker run, e.g.  bash test/fresh-container.sh -e CLAUDE_API_DRAFTS=true
# Then: node test/mock-apis.mjs (in another terminal) and node test/run-test.mjs
set -e
cd "$(dirname "$0")/.."
win() { command -v cygpath >/dev/null && cygpath -w "$1" || echo "$1"; }
docker rm -f n8n-comments-test >/dev/null 2>&1 || true
docker volume rm n8n_comments_test >/dev/null 2>&1 || true
MSYS_NO_PATHCONV=1 docker run -d --name n8n-comments-test -p 5688:5678 --env-file test/env.test "$@" \
  -v n8n_comments_test:/home/node/.n8n \
  -v "$(win "$PWD/test/config"):/data/config:ro" -v "$(win "$PWD/workflow"):/data/workflow:ro" \
  n8nio/n8n:2.44.6 >/dev/null
for i in $(seq 1 100); do docker logs n8n-comments-test 2>&1 | grep -q "Editor is now accessible" && break; sleep 3; done
MSYS_NO_PATHCONV=1 docker exec n8n-comments-test n8n import:workflow --input=/data/workflow/scrolly-comments.json >/dev/null 2>&1
MSYS_NO_PATHCONV=1 docker exec n8n-comments-test n8n publish:workflow --id=ScrollyComments1 >/dev/null 2>&1
docker restart n8n-comments-test >/dev/null
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w "%{http_code}" "localhost:5688/webhook/instagram?hub.mode=subscribe&hub.verify_token=test-verify&hub.challenge=1" || true)
  [ "$code" = 200 ] && echo "test n8n ready on http://localhost:5688" && exit 0
  sleep 3
done
echo "test n8n did not come up" && exit 1
