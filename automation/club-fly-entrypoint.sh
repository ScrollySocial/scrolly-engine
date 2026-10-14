#!/bin/sh
# Container entrypoint: starts bridge-server.mjs PRIVATELY (background, this
# container's loopback only -- never published as a port by fly.toml or
# `docker run -p`), restarts it if it crashes, then execs
# club-public-proxy.mjs in the FOREGROUND as PID 1 so it receives signals
# directly and the platform's own health checks/restarts apply to the one
# process that's actually supposed to be reachable.
#
# POSIX sh only (Alpine's /bin/sh is busybox ash, not bash) -- no arrays,
# no [[ ]], no process substitution.
set -eu

if [ -z "${CLUB_ACCESS_TOKEN_SECRET:-}" ]; then
  echo "FATAL: CLUB_ACCESS_TOKEN_SECRET is not set. This must come from the" >&2
  echo "host's secret manager (e.g. \`fly secrets set CLUB_ACCESS_TOKEN_SECRET=...\`" >&2
  echo "or, for local testing, \`docker run -e CLUB_ACCESS_TOKEN_SECRET=...\`)." >&2
  echo "Refusing to start with no way to verify a customer's access token." >&2
  exit 1
fi

BRIDGE_PID=""

start_bridge() {
  node bridge-server.mjs &
  BRIDGE_PID=$!
}

# Restarts bridge-server.mjs on its own if it dies, without taking down the
# proxy (and therefore the whole container) with it -- the container-level
# restart-on-crash story (fly.toml's [[restart]]/checks, or `docker run
# --restart`) is a second, outer layer for when the WHOLE container needs
# replacing; this loop handles the narrower "just the private process died"
# case the same way automation/start-bridge.cmd already does on Windows.
supervise_bridge() {
  while true; do
    if ! kill -0 "$BRIDGE_PID" 2>/dev/null; then
      echo "[entrypoint] bridge-server.mjs is not running -- restarting" >&2
      start_bridge
    fi
    sleep 2
  done
}

shutdown() {
  echo "[entrypoint] shutting down" >&2
  [ -n "$BRIDGE_PID" ] && kill "$BRIDGE_PID" 2>/dev/null || true
  exit 0
}
trap shutdown TERM INT

start_bridge
supervise_bridge &

echo "[entrypoint] starting club-public-proxy.mjs (the only publicly reachable process)" >&2
exec node club-public-proxy.mjs
