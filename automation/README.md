# Scrolly $300 Report — Automation Pipeline

Turns `methodology/discover-engine.md`'s manual 13-step protocol into an unattended pipeline: Tally intake → Stripe verification → headless Discover agent → PDF report → operator review → client delivery.

See the approved plan at the top of this session for the full architecture. This file tracks **current build/verification status** — update it as pieces land.

## Layout
```
automation/
  runner/run-discover.mjs        - headless agent runner (Claude Agent SDK)
  n8n/
    intake-and-kickoff.json       - Tally webhook -> Stripe verify -> create client folder -> launch runner
    engagement-complete.json      - runner's completion webhook -> operator review email (or auto-send)
    approve-and-send.json         - operator's one-click approval -> client email
    scripts/                      - small Node helpers the n8n workflows shell out to (Execute Command)
  email-templates/                - source HTML for both pipeline emails (read by build-resend-payload.mjs)
  tally-form-spec.md              - exact fields to build in your own Tally account
  stripe-setup.md                 - exact Payment Link / webhook config for your own Stripe account
  .env.example                    - copy to .env and fill in
```

## Setup (do this once)
1. `cd automation && npm install`
2. Copy `.env.example` → `.env`, fill in real values. **`ANTHROPIC_API_KEY` is required** — get one from console.anthropic.com/settings/keys with billing enabled. This is separate from any Claude.ai/Claude Code subscription login; the runner does not use interactive OAuth (confirmed 2026-08-10 — see "Known issues" below).
3. Build the Tally form per `tally-form-spec.md`; note its webhook URL target will be n8n's intake webhook (set up in step 5).
4. Set up Stripe per `stripe-setup.md`.
5. Install n8n locally (`npx n8n` or `npm i -g n8n`, then `n8n start` — or `npm run n8n` from this folder once n8n is installed). Import the three workflow JSON files from `n8n/`. **Hand-authored JSON — after import, open each workflow in the n8n editor and eyeball every node before trusting it; they haven't been round-tripped through a live n8n import yet.**
6. Fill in each workflow's webhook URLs into `.env` (`N8N_*_WEBHOOK_URL`).
7. Run the local dry run (see plan's Build Order step 6) before touching real Stripe/Tally.

## Status (2026-08-10)

**Done and verified directly (outside n8n):**
- `discover-engine.md`'s Automated/Unattended Mode section written (V0.5).
- `runner/run-discover.mjs` — runs, enforces the DataForSEO call ceiling via a PreToolUse hook, renders `report.pdf`/`appendix.pdf` via `md-to-pdf`, posts a completion webhook, writes `run-result.json`. Verified end-to-end against a disposable synthetic client (`clients/_test-dryrun`) with `DATAFORSEO_ENABLED=false`.
- All `n8n/scripts/*.mjs` helpers tested directly via CLI against a synthetic client (`clients/test-nursery-co`): `create-engagement.mjs` (both stdin and `--payload-b64` paths, including slug-collision handling), `build-resend-payload.mjs` (both operator-review and client-delivery), `check-and-consume-token.mjs` (valid, replay-rejected, wrong-token-rejected), `mark-delivered.mjs`.

**Known issue — under investigation:**
- `n8n/scripts/launch-runner.mjs` detaches the runner via `child_process.spawn(..., { detached: true })` so the webhook responder doesn't block for the full engagement. In testing, the detached child process starts (confirmed alive via `tasklist`, memory growing) but never progresses past the runner's first log line — no completion, no error, indefinitely. The same runner invoked directly in the foreground (`node runner/run-discover.mjs <slug>`) completes normally in ~15s (even failing fast on missing auth). Root cause not yet confirmed; suspected interaction between Windows process detachment and the Claude Agent SDK's own nested subprocess spawn. **Do not treat "Launch runner" as reliable in the n8n workflow until this is resolved** — `intake-and-kickoff.json`'s last node calls this script as currently written.
- **`ANTHROPIC_API_KEY` is mandatory.** A run with no key set fails immediately with `Not logged in · Please run /login` — confirmed the bundled executable does not fall back to any interactive Claude Code login on this machine.

**Not yet done:**
- n8n never actually installed/run locally yet (first `npx n8n` invocation was still completing as of this writing — large package, slow first install).
- None of the 3 workflow JSON files have been imported into a live n8n instance yet — they're hand-authored against n8n's documented node schema, unverified by an actual import.
- Tally form, Stripe Payment Link/webhook, and Resend account are not yet created (all require the user's own account setup — see each spec file).
- Full end-to-end dry run (plan Build Order step 6) not yet run.
- DataForSEO funding + first live verified engagement (plan Build Order step 7) — blocked on the user adding funds.

## Cleanup note
`clients/_test-dryrun/` and `clients/test-nursery-co*/` in the vault are disposable smoke-test artifacts from building this pipeline — safe to delete once the pipeline is trusted; not real client engagements.
