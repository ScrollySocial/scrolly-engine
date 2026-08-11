# Scrolly $300 Report — Automation Pipeline

Turns `methodology/discover-engine.md`'s manual 13-step protocol into an unattended pipeline: Tally intake → Stripe verification → headless Discover agent → PDF report → operator review → client delivery.

See the approved plan at the top of this session for the original architecture. This file tracks **current build/verification status** — update it as pieces land. **The runtime architecture changed from the original plan** — see "Docker, not npm" below before doing anything else.

## Layout
```
automation/
  runner/run-discover.mjs        - headless agent runner (Claude Agent SDK). Runs NATIVELY on Windows.
  bridge-server.mjs               - local HTTP bridge (runs NATIVELY on Windows, port 5679 by default).
                                     Lets the n8n Docker container trigger the scripts below without
                                     needing filesystem/process access into the container.
  n8n/
    intake-and-kickoff.json       - Tally webhook -> Stripe verify -> create client folder -> launch runner
    engagement-complete.json      - runner's completion webhook -> operator review email (or auto-send)
    approve-and-send.json         - operator's one-click approval -> client email
    scripts/                      - small Node helpers. Called by bridge-server.mjs via child_process,
                                     NOT directly by n8n anymore (see "Docker, not npm").
  email-templates/                - source HTML for both pipeline emails (read by build-resend-payload.mjs)
  tally-form-spec.md              - exact fields to build in your own Tally account
  stripe-setup.md                 - exact Payment Link / webhook config for your own Stripe account
  .env.example                    - copy to .env and fill in
```

## Docker, not npm (changed 2026-08-11)

The original plan assumed `npm install -g n8n` (or as a local devDependency). On this machine that failed repeatedly and then stalled for hours (see "npm install saga" below) — switched to running n8n via its **official Docker image** instead, which avoids all native-module compilation entirely.

This has one real architectural consequence: **n8n now runs inside a Linux container**, a separate environment from this Windows machine. It cannot reach this machine's filesystem, the Windows-native Claude Agent SDK install, or spawn local processes the way the original workflow design (n8n "Execute Command" nodes calling `automation/n8n/scripts/*.mjs` directly) assumed.

**Fix: `automation/bridge-server.mjs`.** A tiny dependency-free HTTP server that runs natively on Windows (outside Docker) and wraps the exact same tested scripts. The three n8n workflows now call it via `http://host.docker.internal:5679/...` (Docker Desktop's built-in DNS name for reaching the host machine from inside a container) using HTTP Request nodes, instead of Execute Command nodes reaching into the container's own filesystem. Verified working end to end, including a real container→host request via `docker exec n8n wget -qO- http://host.docker.internal:5679/health`.

**This means two local processes must both be running** for the pipeline to work, not just the Docker container:
1. The n8n Docker container (`docker start n8n` if stopped — see below).
2. `automation/bridge-server.mjs` (`npm run bridge` from this folder, or `node bridge-server.mjs`).

Consider wiring both into a single startup script/Windows Task Scheduler entry later so they come up together after a reboot — not done yet.

## Setup (do this once)

1. Docker Desktop must be installed and running (already done on this machine — confirmed working after a Windows restart to finish enabling WSL2, plus completing Docker's own first-run welcome screen, which is what actually starts its engine).
2. Copy `.env.example` → `.env`, fill in real values. **`ANTHROPIC_API_KEY` is required** — get one from console.anthropic.com/settings/keys with billing enabled. Separate from any Claude.ai/Claude Code subscription login; the runner does not use interactive OAuth (confirmed — a run with no key set fails immediately with `Not logged in`).
3. Build the Tally form per `tally-form-spec.md`.
4. Set up Stripe per `stripe-setup.md`.
5. Start the n8n container (already running once on this machine as of 2026-08-11 — see "Current running state" below; to (re)create it from scratch):
   ```
   docker volume create n8n_data
   docker run -d --name n8n `
     -p 5678:5678 `
     -v n8n_data:/home/node/.n8n `
     -v "C:\Users\merce\Scrolly Organic Engine:/vault" `
     -e N8N_SECURE_COOKIE=false `
     --env-file automation/.env `
     n8nio/n8n:latest
   ```
   The `--env-file` flag is what lets the workflow JSON's `$env.STRIPE_SECRET_KEY`, `$env.RESEND_API_KEY`, `$env.REQUIRE_MANUAL_APPROVAL`, `$env.BRIDGE_PORT` expressions resolve — without it those all come back empty inside the container. If the container already exists, `docker stop n8n && docker rm n8n` first, or just `docker start n8n` to resume the existing one (env vars set at creation time persist, but changing `.env` later requires recreating the container to pick up new values).
6. Start the bridge server: `cd automation && npm run bridge` (or `node bridge-server.mjs`). Leave it running.
7. Open **http://localhost:5678**, finish n8n's one-time local owner-account setup (a login for this n8n instance only, not any external service), then import the three JSON files from `n8n/`. Native file-picker upload is unreliable to script — used "Import from URL" against a one-off local static file server instead (`http://host.docker.internal:<port>/<file>.json`, since the import fetch happens from inside the container, so `localhost` doesn't work for this — must be `host.docker.internal`). **Done as of 2026-08-11 — all three imported and verified to render with the correct nodes/connections; see Status below.**
8. Fill in each workflow's webhook URLs into `.env` (`N8N_*_WEBHOOK_URL`) once created; recreate the container (step 5) to pick them up, or set them directly as n8n Variables in the UI instead if you'd rather not restart the container each time.
9. Run the local dry run (see plan's Build Order step 6) before touching real Stripe/Tally.

## Status (2026-08-11)

**Done and verified directly:**
- `discover-engine.md`'s Automated/Unattended Mode section written (V0.5).
- `runner/run-discover.mjs` — verified end-to-end against a disposable synthetic client with `DATAFORSEO_ENABLED=false`: enforces the DataForSEO call ceiling via a PreToolUse hook, renders `report.pdf`/`appendix.pdf`, posts a completion webhook, writes `run-result.json`.
- All `n8n/scripts/*.mjs` helpers tested directly via CLI: `create-engagement.mjs` (stdin and `--payload-b64` paths, slug-collision handling), `build-resend-payload.mjs` (both modes), `check-and-consume-token.mjs` (valid/replay/wrong-token), `mark-delivered.mjs`.
- Docker Desktop installed and confirmed working (`docker ps` succeeds).
- n8n container running via the official image, migrations complete, reachable at `localhost:5678` (HTTP 200 confirmed).
- `bridge-server.mjs` built and tested standalone (`/health`, `/create-engagement` both verified via direct HTTP calls), **and** confirmed reachable from inside the n8n container via `host.docker.internal:5679`.
- All three workflow JSON files rewritten to call the bridge via HTTP Request nodes instead of Execute Command (which can't reach the host from inside the container).
- n8n owner-account setup complete. All three workflows imported (via "Import from URL" against a temporary local file server — native file-picker upload isn't reliably scriptable) and confirmed rendering with the correct nodes and connections: **Discover — Intake & Kickoff**, **Discover — Engagement Complete**, **Discover — Approve & Send**. Saved in n8n.

**Not yet done:**
- Workflows are imported but not yet activated/tested with real data — no live webhook trigger, no credential/env wiring confirmed end-to-end yet.
- The n8n container was created *without* `--env-file automation/.env` (no real `.env` existed yet at creation time) — needs recreating per the setup steps above once `.env` has real values, or the `$env.X` expressions in the workflows will resolve empty.
- Tally form, Stripe Payment Link/webhook, and Resend account not yet created (user's own account setup — see each spec file).
- Full end-to-end dry run (plan Build Order step 6) not yet run.
- DataForSEO funding + first live verified engagement — blocked on the user adding funds.
- No startup automation yet for "container + bridge server both running after a reboot" — currently manual.

## npm install saga (historical — kept for context, don't repeat this path)

Originally tried installing n8n via `npm install -g n8n` / as a local devDependency. Three attempts across several hours: first failed outright (a `puppeteer` postinstall tried to download Chromium and hit `ECONNRESET`); second stalled indefinitely at the same package count with no forward progress for over an hour despite confirmed-working internet (likely disk contention, possibly antivirus real-time scanning fighting npm's tens of thousands of small file writes — never conclusively identified). Abandoned in favor of Docker, which sidesteps native compilation entirely and pulled/started successfully in a few minutes. **Do not go back to a plain npm install of n8n on this machine** — Docker is the validated path.

## Cleanup note
Disposable smoke-test client folders (anything under `clients/` that isn't `mulberry-creek`) are safe to delete once the pipeline is trusted — not real client engagements. The initial ones were already cleaned up as part of the first git commit.
