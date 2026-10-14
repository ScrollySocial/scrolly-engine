# Scrolly $299 Report — Automation Pipeline

Turns `methodology/discover-engine.md`'s manual 13-step protocol into an unattended pipeline: Tally intake → Stripe verification → headless Discover agent → PDF report → operator review → client delivery.

See the approved plan at the top of this session for the original architecture. This file tracks **current build/verification status** — update it as pieces land. **The runtime architecture changed from the original plan** — see "Docker, not npm" below before doing anything else.

**2026-08-24 — payment verification changed.** Stripe is now connected through WooCommerce's own checkout on scrollyseo.com (Stripe Elements embedded in WooCommerce Blocks), not a standalone Stripe Payment Link. There is no Stripe Checkout Session for the pipeline to verify anymore. `intake-and-kickoff.json` was rewritten to verify against the **WooCommerce Order REST API** instead (`order_id`/`order_key` hidden fields on the Tally form, populated by `automation/woocommerce-thankyou-snippet.php` on WooCommerce's thank-you page). See `stripe-setup.md` (rewritten) for the full current setup and `tally-form-spec.md` for the matching Tally fields. Business email and Stripe/WooCommerce accounts now exist, but none of Resend, Tally, or the WooCommerce REST API key have real values in `.env` yet.

**2026-08-24, later same day — full payment→intake hand-off proven against real data.** Real WooCommerce REST API key generated and tested; two real test-mode orders (#156, #160) placed and independently fetched via the API — every field the verification logic checks (`status`, `total`, `order_key`, product line item) matched exactly. Found and fixed a real site bug in the process: WooCommerce's native "Coming soon" mode was still on, silently replacing the real `/cart/` page with a placeholder for all non-admin visitors (checkout itself was unaffected) — turned off, confirmed fixed. The real, pre-existing Tally form was located (`https://tally.so/r/D4OVlE` — see `tally-form-spec.md`), its hidden field renamed from the old `session_id` to `order_id` + a new `order_key` field, and `woocommerce-thankyou-snippet.php` (now with the real URL filled in) installed live via WPCode — confirmed on a real order (#160) that the "Start Your Intake Form" button appears and links correctly.

**Also added: `pending-intake-reminder.json` + `n8n/scripts/check-pending-intakes.mjs`** — a customer who pays but never clicks through to (or finishes) the Tally form would otherwise fall through silently, since nothing downstream ever fires without a Tally submission. This runs on a schedule (every 2h), finds paid audit orders with no matching `contact.json` anywhere in `clients/`, and emails a reminder via Resend with the same order-linked Tally URL — **repeating once per day** (per user request, not just a single nudge) until either intake is completed or `INTAKE_REMINDER_MAX_AGE_DAYS` is hit, whichever comes first. See that script's header comment for the full logic and `INTAKE_REMINDER_DELAY_HOURS`/`INTAKE_REMINDER_INTERVAL_HOURS`/`INTAKE_REMINDER_MAX_AGE_DAYS` in `.env.example` for timing. Needs `TALLY_FORM_URL` in `.env` (added) and, like everything Resend-dependent, a real `RESEND_API_KEY` (still not set).

## Layout
```
automation/
  runner/run-discover.mjs        - headless agent runner (Claude Agent SDK). Runs NATIVELY on Windows.
  bridge-server.mjs               - local HTTP bridge (runs NATIVELY on Windows, port 5679 by default).
                                     Lets the n8n Docker container trigger the scripts below without
                                     needing filesystem/process access into the container.
  n8n/
    intake-and-kickoff.json       - Tally webhook -> Stripe verify -> create client folder -> launch runner,
                                     plus a parallel, non-blocking branch that emails the client an optional
                                     GBP/GSC/GA4 view-only access request (skipped entirely if their Tally
                                     answers don't qualify — see "Optional GSC/GA4/GBP access request" below)
    engagement-complete.json      - runner's completion webhook -> operator review email (or auto-send)
    approve-and-send.json         - operator's one-click approval -> client email
    pending-intake-reminder.json  - schedule trigger (every 2h) -> reminds paid customers who
                                     never finished the Tally intake form (see 2026-08-24 note below)
    scripts/                      - small Node helpers. Called by bridge-server.mjs via child_process,
                                     NOT directly by n8n anymore (see "Docker, not npm").
  email-templates/                - source HTML for all three pipeline emails (read by build-resend-payload.mjs)
  tally-form-spec.md              - exact fields to build in your own Tally account
  stripe-setup.md                 - Stripe-through-WooCommerce + order-verification REST API key setup
  woocommerce-thankyou-snippet.php - PHP snippet for WooCommerce's thank-you page (order->Tally hand-off)
  .env.example                    - copy to .env and fill in
```

## Docker, not npm (changed 2026-08-11)

The original plan assumed `npm install -g n8n` (or as a local devDependency). On this machine that failed repeatedly and then stalled for hours (see "npm install saga" below) — switched to running n8n via its **official Docker image** instead, which avoids all native-module compilation entirely.

This has one real architectural consequence: **n8n now runs inside a Linux container**, a separate environment from this Windows machine. It cannot reach this machine's filesystem, the Windows-native Claude Agent SDK install, or spawn local processes the way the original workflow design (n8n "Execute Command" nodes calling `automation/n8n/scripts/*.mjs` directly) assumed.

**Fix: `automation/bridge-server.mjs`.** A tiny dependency-free HTTP server that runs natively on Windows (outside Docker) and wraps the exact same tested scripts. The three n8n workflows now call it via `http://host.docker.internal:5679/...` (Docker Desktop's built-in DNS name for reaching the host machine from inside a container) using HTTP Request nodes, instead of Execute Command nodes reaching into the container's own filesystem. Verified working end to end, including a real container→host request via `docker exec n8n wget -qO- http://host.docker.internal:5679/health`.

**This means two local processes must both be running** for the pipeline to work, not just the Docker container:
1. The n8n Docker container (`docker start n8n` if stopped — see below).
2. `automation/bridge-server.mjs` (`npm run bridge` from this folder, or `node bridge-server.mjs`).

**2026-08-27 — keeping bridge-server running (Phase 2.5 fix).** A bare `node bridge-server.mjs` (or `npm run bridge`) only survives as long as whatever terminal/session started it stays open — this is exactly what caused a real outage: the dashboard/order-monitoring routes went unreachable ("Failed to fetch") once that terminal session ended, with nothing to bring the process back. Two pieces fix this:

1. **Crash resilience:** `automation/start-bridge.cmd` — a restart loop, not a new dependency (no pm2, no npm install of anything). Run it instead of `node bridge-server.mjs` directly:
   ```
   automation\start-bridge.cmd
   ```
   It appends to `bridge-forever.log` (restart history included) and relaunches `node bridge-server.mjs` a few seconds after any exit, crash or otherwise.
2. **Survives logoff/reboot — one-time, do this yourself** (registering a scheduled task is a system-settings change, so this is intentionally left as a step for you, not something done automatically): open PowerShell and run
   ```powershell
   schtasks /create /tn "Scrolly Bridge Server" /tr "\"C:\Users\merce\Scrolly Organic Engine\automation\start-bridge.cmd\"" /sc onlogon /rl limited
   ```
   That registers it to start automatically next time you log in. To start it immediately without logging out first: `schtasks /run /tn "Scrolly Bridge Server"`. To remove it later: `schtasks /delete /tn "Scrolly Bridge Server" /f`.

**Why not Docker Compose:** bridge-server.mjs exists specifically to do things a Linux container can't — spawn native Windows processes (the Claude Agent SDK runner, PowerShell/cmd) and read/write this Windows filesystem directly. Containerizing it would mean re-solving that exact problem (Docker socket access or a host-process-spawning bridge of its own) for no real benefit — it would just move the "what keeps this alive" question into a second Docker layer instead of answering it. Task Scheduler is also what this file already flagged as the intended fix (see the line this replaced) — nothing new is being introduced, just built.

## n8n image pin — `:1.70.0` only, never `:latest` or `:1` (found and fixed 2026-08-24)

The original container was created against whatever `n8nio/n8n:latest` resolved to on 2026-08-11. By 2026-08-24, `:latest` had silently moved to **v2.34.4**, which hangs forever on boot with **zero log output** on this machine regardless of volume, env-file, or vault mount (reproduced identically on a completely fresh, isolated volume — ruled out everything project-specific). Pinning to the `:1` major tag instead resolved to **v1.123.27** — n8n's actual final v1 release, but by then already carrying a large new "workflow publishing" subsystem (separate `workflow_published_version`/`workflow_publish_history`/licensing tables) that production webhooks depend on. Activating a workflow (via CLI *or* the real UI toggle) never populated that table in this build, and with no "Publish" button exposed anywhere in the unlicensed/community UI, webhooks stayed permanently unroutable — n8n's own churn rate here is extreme (dozens of patch releases and full major versions in the *same week*, confirmed via the Docker Hub tags API), so don't assume this is fixed in some later tag either.

**The actual, separate, version-independent bug**, found only after ruling out both of the above: every workflow JSON in this repo was missing a `webhookId` (a UUID) on its webhook-trigger node — a field n8n's UI silently auto-generates when you build a webhook node by hand, but plain CLI/API import doesn't add for you. Without it, n8n can't register the clean static path (`tally-intake`, etc.) and silently falls back to an internal `<workflowId>/<node-name>/<path>` scheme instead — which is what every "the requested webhook is not registered" 404 traced back to, **on every n8n version tested, including the old 1.70.0 pin**. Fixed by adding a `webhookId` UUID to each webhook node in `intake-and-kickoff.json`, `engagement-complete.json`, and `approve-and-send.json` (`pending-intake-reminder.json` is schedule-triggered, unaffected). **If any workflow's webhook trigger node is ever rebuilt from scratch by hand rather than edited in the n8n UI, it needs a `webhookId` field added or it will silently mis-register exactly this way.**

Net result: pin `n8nio/n8n:1.70.0` specifically (confirmed clean migration set, no publish/licensing tables, boots in seconds) on a **fresh volume** — `n8n_data_stable`, not the original `n8n_data` (which got migrated forward by the broken 1.123.27 boot attempt and can't safely go backwards). The old `n8n_data` volume still exists, untouched, orphaned — safe to `docker volume rm n8n_data` once nothing needs to look back at it.

## Setup (do this once)

1. Docker Desktop must be installed and running (already done on this machine — confirmed working after a Windows restart to finish enabling WSL2, plus completing Docker's own first-run welcome screen, which is what actually starts its engine).
2. Copy `.env.example` → `.env`, fill in real values. **`ANTHROPIC_API_KEY` is required** — get one from console.anthropic.com/settings/keys with billing enabled. Separate from any Claude.ai/Claude Code subscription login; the runner does not use interactive OAuth (confirmed — a run with no key set fails immediately with `Not logged in`).
3. Build the Tally form per `tally-form-spec.md`.
4. Set up Stripe per `stripe-setup.md`.
5. Start the n8n container. **Pin the image to `n8nio/n8n:1.70.0` — never `:latest`, and never a floating major tag like `:1`.** (see "n8n image pin" below for the full story; the short version is both of those now resolve to versions with a broken/incompatible webhook system.) To (re)create it from scratch:
   ```
   docker volume create n8n_data_stable
   docker run -d --name n8n `
     -p 5678:5678 `
     -v n8n_data_stable:/home/node/.n8n `
     -v "C:\Users\merce\Scrolly Organic Engine:/vault" `
     -e N8N_SECURE_COOKIE=false `
     --env-file automation/.env `
     n8nio/n8n:1.70.0
   ```
   The `--env-file` flag is what lets the workflow JSON's `$env.STRIPE_SECRET_KEY`, `$env.RESEND_API_KEY`, `$env.REQUIRE_MANUAL_APPROVAL`, `$env.BRIDGE_PORT` expressions resolve — without it those all come back empty inside the container. If the container already exists, `docker stop n8n && docker rm n8n` first, or just `docker start n8n` to resume the existing one (env vars set at creation time persist, but changing `.env` later requires recreating the container to pick up new values). First boot on a fresh volume runs ~150 sequential migrations — takes roughly 2 minutes, is normal, don't interrupt it.
6. Start the bridge server: `cd automation && npm run bridge` (or `node bridge-server.mjs`). Leave it running.
7. Open **http://localhost:5678**, finish n8n's one-time local owner-account setup (a login for this n8n instance only, not any external service), then import the four JSON files from `n8n/` (`intake-and-kickoff.json`, `engagement-complete.json`, `approve-and-send.json`, `pending-intake-reminder.json`). Via UI: "Import from File" per workflow. Via CLI (what was actually used 2026-08-24, and needed for `n8nio/n8n:1.70.0` specifically — see below): `docker exec n8n n8n import:workflow --input=/vault/automation/n8n/<file>.json` for each — **but this version's CLI requires the JSON wrapped in an array (`[{...}]`), not the bare object the files actually contain** (that bare-object format is n8n's own single-workflow export format, so don't change the repo files — wrap a copy just for the import command). Then activate each with `docker exec n8n n8n update:workflow --id=<id> --active=true` and `docker restart n8n` to pick it up (CLI activation doesn't take effect on a running instance). On Windows/Git Bash, prefix any `docker exec`/`docker run` command with a `/vault/...`-style path argument with `MSYS_NO_PATHCONV=1`, or Git Bash silently mangles it into a bogus Windows path.
8. Fill in each workflow's webhook URLs into `.env` (`N8N_*_WEBHOOK_URL`) once created; recreate the container (step 5) to pick them up, or set them directly as n8n Variables in the UI instead if you'd rather not restart the container each time.
9. Run the local dry run (see plan's Build Order step 6) before touching real Stripe/Tally.

## Optional GSC/GA4/GBP access request (added 2026-08-18)

Right after intake, `intake-and-kickoff.json` fires a branch (parallel to launching the runner, so it never delays the report) that asks the client for **view-only** access to whichever of GBP/GSC/GA4 their own Tally answer indicates might exist:

- `build-resend-payload.mjs`'s `access-request` mode reads `contact.json`'s `accessStatus` (written by `create-engagement.mjs` from the three Tally status fields) and decides per service: "I have access" or "not set up yet" → skip that service; "I can share it" → ask; "Not sure" → ask, softened ("if you have this set up").
- If **none** of the three qualify, the script returns `{"skip": true, ...}` and the workflow's "Access request needed?" IF node stops there — no empty email gets sent.
- The email (`email-templates/access-request.html`) always requests the least-privileged role available per service: GSC "Restricted," GA4 "Viewer," GBP "Manager" (GBP has no stricter tier — the email says so explicitly rather than overclaiming "view-only" for it).
- This never blocks or delays report delivery. If access arrives later, a future engagement/runner update would need to actually query the GSC/GA4 APIs to detect and use it — that check isn't built yet (see Not yet done).
- Requires `SCROLLY_ACCESS_EMAIL` in `.env` (the address you want clients to add) — falls back to `RESEND_FROM_EMAIL` if unset.

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
- **First real (funded) agent run completed 2026-08-11.** `ANTHROPIC_API_KEY` confirmed working with real billing. Ran against a deliberately minimal/degenerate test case (`example.com`, the IANA reserved domain — no real business) with `ANTHROPIC_MAX_BUDGET_USD=2` as a safety cap. Result: the agent correctly executed all 13 steps, ran the Final Quality Gate (verdict: PASS), generated a full `report.md`/`appendix.md`, and **correctly recommended HOLD** rather than fabricating an opportunity analysis for a domain with no real business — exactly the integrity behavior the methodology exists to enforce. Real cost: **$2.02** for 24 turns. `run-result.json` showed `success: false`, which is misleading — that reflects the SDK's `error_max_budget_usd` result subtype (cost crossed the $2 ceiling right at the end), not a failed or incomplete engagement; `status.md` itself says `Completed: yes`.
- **Two real bugs found and fixed** by this first run:
  1. `runner/run-discover.mjs`'s `completed` detection regex (`/Completed:\s*yes/i`) didn't match `status.md`'s actual output (`Completed: **yes`, markdown-bold) — `\s*` doesn't span the `**`. Fixed to `/Completed:\s*\*{0,2}\s*yes/i`.
  2. PDF rendering failed — Puppeteer's bundled Chromium download is broken on this machine (shares a cache path, `~/.cache/puppeteer`, with the earlier failed n8n npm install saga). Fixed by pointing `md-to-pdf`'s `launch_options.executablePath` at the system's installed Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`) instead of relying on Puppeteer's own download. Re-verified by re-rendering both PDFs from the existing report — both succeeded (137KB/288KB, real content).
- The agent's own `status.md` also flagged two infrastructure notes worth acting on: (1) keyless PageSpeed Insights returned HTTP 429 three times — get a free PSI API key before relying on Lighthouse data; (2) `example.com` can't exercise O3–O10 at all (no real business) — use a real small-business site for the next test now that cost/mechanics are proven.

**Not yet done:**
- Workflows are imported but not yet activated/tested with real data — no live webhook trigger, no credential/env wiring confirmed end-to-end yet.
- The optional access-request branch (above) is smoke-tested only via direct CLI calls to `build-resend-payload.mjs access-request <slug>` (both the "ask" and "skip" cases) — not yet run through a live n8n execution or an actual Resend send. Also still missing: any mechanism that later checks whether granted GSC/GA4 access actually showed up and pulls real data with it — today it's ask-and-hope, with a human noticing later.
- The n8n container was created *without* `--env-file automation/.env` (no real `.env` existed yet at creation time) — needs recreating per the setup steps above now that `.env` has a real `ANTHROPIC_API_KEY`, or the `$env.X` expressions in the workflows will resolve empty. As of 2026-08-24 the container is also **stopped** (`docker ps -a` shows `Exited`) and the bridge server isn't running — both need to be (re)started, and the container needs recreating regardless once real Resend/Tally/WooCommerce values exist.
- ~~Tally form not yet created.~~ ~~WooCommerce REST API key not yet generated.~~ ~~`woocommerce-thankyou-snippet.php` not yet installed.~~ All done 2026-08-24 — see the dated note above. **Still open: Resend account/domain not yet set up** (`RESEND_API_KEY`/`RESEND_FROM_EMAIL`/`OPERATOR_EMAIL`/`SENDER_DISPLAY_NAME` all still blank in `.env`) — blocks every email the pipeline sends, including the new intake reminder.
- Full end-to-end dry run (plan Build Order step 6) not yet run.
- DataForSEO funding + first live verified engagement — blocked on the user adding funds.
- No startup automation yet for "container + bridge server both running after a reboot" — currently manual.
- Free PageSpeed Insights API key — not yet obtained.
- Remaining Anthropic credit after this test: **~$2.98 of the original $5.**

## npm install saga (historical — kept for context, don't repeat this path)

Originally tried installing n8n via `npm install -g n8n` / as a local devDependency. Three attempts across several hours: first failed outright (a `puppeteer` postinstall tried to download Chromium and hit `ECONNRESET`); second stalled indefinitely at the same package count with no forward progress for over an hour despite confirmed-working internet (likely disk contention, possibly antivirus real-time scanning fighting npm's tens of thousands of small file writes — never conclusively identified). Abandoned in favor of Docker, which sidesteps native compilation entirely and pulled/started successfully in a few minutes. **Do not go back to a plain npm install of n8n on this machine** — Docker is the validated path.

## Cleanup note
Disposable smoke-test client folders (anything under `clients/` that isn't `mulberry-creek`) are safe to delete once the pipeline is trusted — not real client engagements. The initial ones were already cleaned up as part of the first git commit.
