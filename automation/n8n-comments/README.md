# Scrolly comments (n8n)

What it does, decisions and Mercedes's setup checklist: vault
`products/content-engine/comment-to-dm-n8n-plan.md`. This file is the technical side.

- **Instagram comment with a keyword** → one private-reply DM with the freebie link, sent automatically
  (Meta webhook, signature checked, deduped by comment ID).
- **Every Instagram, YouTube and TikTok comment** → sorted by free word rules (question / lead / praise / spam /
  other; questions and leads flagged) → a row in the Notion **Comment inbox** at Status **Needs draft**. Spam and
  keyword-only comments aren't logged. No AI API is used.
- **Drafts** are written by Claude on Mercedes's subscription with the vault skill `skills/draft-comment-replies`
  ("draft my comment replies", or a scheduled morning task), which sets rows to New (TikTok: Reply by hand).
- **Optional paid route:** `CLAUDE_API_DRAFTS=true` + `ANTHROPIC_API_KEY` makes n8n sort and draft each comment with
  the Claude API instead (rows arrive at New with the draft filled in).
- **Status = Approved in Notion** → the Draft reply (as edited) is posted within 10 minutes; row becomes Posted.
  TikTok has no reply API: those rows say "Reply by hand". Each posted row is remembered in the state file, so if
  Notion fails to save "Posted" the next run only fixes the row and never posts the reply twice. A failed post
  becomes Error, which shows in the "To answer" view.
- **Going live:** once `COMMENTS_DRY_RUN=false`, rows at "Not sent (test mode)" go back to New (with a note) for a
  fresh OK; they are never posted without one.
- **Test mode** (`COMMENTS_DRY_RUN=true`, the default): nothing is sent to Instagram or YouTube.

One workflow, `workflow/scrolly-comments.json`, built from `workflow/src/*.js` by `node workflow/build.mjs`
(`_lib.js` is prepended to every Code node). State (comments seen, DMs sent, refreshed Instagram token, last 20
errors) lives in `/home/node/.n8n/scrolly-comments-state.json` inside the n8n volume, not in workflow static data
(n8n hands a queued run the static data from when it was triggered, so runs close together lost each other's
updates in testing). n8n runs one execution at a time (`N8N_CONCURRENCY_PRODUCTION_LIMIT=1`).

| Trigger | Does |
| --- | --- |
| `GET /webhook/instagram` | Meta's verification check (META_VERIFY_TOKEN) |
| `POST /webhook/instagram` | comment events from Meta |
| every 30 min | YouTube: newest 50 top-level comments on the channel (API key, 1 quota unit) |
| daily 8am | TikTok: Apify `clockworks/tiktok-comments-scraper`, newest 3 videos, 30 comments each, capped at TIKTOK_MAX_USD |
| every 10 min | post Approved replies from Notion |
| weekly | refresh the Instagram long-lived token (60-day tokens) |
| `POST /webhook/comments-run` `{"job": "youtube"\|"tiktok"\|"replies"\|"token"}` | run a job now (header `x-run-secret`) |
| `GET /webhook/comments-status` | test mode, last checks, last runs, last 20 errors (header `x-run-secret`) |

## Keywords

The one list is `commentKeywords` in `automation/carousels/config/destinations.json`. A keyword is only sent when
`live: true` **and** `dmApproved: true` (Mercedes OK'd the DM text). After editing:

```bash
node scripts/sync-keywords.mjs
```

then copy `config/keywords.json` to the server's `config/` folder (read on every comment, no restart).

## Server (DigitalOcean, 1 GB droplet, Ubuntu)

1. DNS: an A record `hooks` → the droplet's IP (Namecheap, scrollyseo.com).
2. On the droplet: install Docker (`curl -fsSL https://get.docker.com | sh`), open ports 22, 80, 443 only
   (`ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable`).
3. Copy this folder to `/opt/n8n-comments` (without `.secrets/`, `test/`), create `.env` from `.env.example`.
4. `docker compose up -d`, open https://hooks.scrollyseo.com, create the n8n owner login (password manager).
5. Import and turn on the workflow:
   `docker compose exec n8n n8n import:workflow --input=/data/workflow/scrolly-comments.json`, then open it in
   the editor and press **Publish** (n8n 2.x). Webhook URLs stay the same on re-import.

Changing `.env` needs `docker compose up -d` (recreates the container). Upgrading n8n: change the exact tag in
`docker-compose.yml`, never `:latest` (see `automation/README.md` "n8n image pin" for why).

## Local test (no real accounts touched)

```bash
node test/mock-apis.mjs
bash test/fresh-container.sh            # add  -e CLAUDE_API_DRAFTS=true  for the API mode
node test/run-test.mjs                  # MODE=api node test/run-test.mjs for the API mode
```

`fresh-container.sh` starts a clean container (the state file remembers comments, so every run needs one), imports
and publishes the workflow. `test/env.test` points every
API at the mock; `test/config/keywords.json` has a test keyword PINS.

## Helper scripts

- `scripts/instagram-setup.mjs`: prints IG_USER_ID and turns on comment notifications for the app.
- `scripts/youtube-auth.mjs`: one-time Google sign-in, saves the refresh token to `.secrets/youtube-token.json`.
