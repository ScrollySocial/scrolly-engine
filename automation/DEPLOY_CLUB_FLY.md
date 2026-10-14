# $1K Club — Fly.io private-beta deployment guide

Scope: this deploys a **separate, Club-only** copy of `bridge-server.mjs` +
`club-public-proxy.mjs` to Fly.io. It does not touch, replace, or depend on
the local `bridge-server.mjs` instance `automation/n8n/*.json` workflows
reach via `host.docker.internal` — that keeps running on Mercedes's machine,
completely unaffected. None of the commands below have been run as part of
preparing this repository — this is a guide, not a log.

## What actually runs

One Fly app, one machine, one container, two processes:
- `bridge-server.mjs` — private. Never exposed by `fly.toml` (no port
  declared for it anywhere). Reachable only from `club-public-proxy.mjs`,
  over loopback, inside the same container.
- `club-public-proxy.mjs` — the only public process. Fail-closed exact
  allow-list (`automation/club-public-proxy.mjs`'s `ALLOWLIST`) — everything
  not explicitly listed there 404s before it ever reaches the private
  process.

Member data (`automation/club/members/`) lives on a Fly volume mounted at
`/app/club/members` inside the container — durable across deploys and
restarts, empty on first boot (no real or QA member data is ever baked into
the image; see `automation/.dockerignore`).

## Prerequisites (external, one-time)

1. A Fly.io account (Mercedes's — not created or logged into as part of this
   task).
2. `flyctl` installed locally: https://fly.io/docs/flyctl/install/
3. `fly auth login` — opens a browser, authenticates the CLI. Not run here.
4. Decide the real values for `fly.toml`'s two placeholders: `app` (a
   globally-unique Fly app name — `scrolly-1k-club-beta` is a suggestion,
   not reserved) and `primary_region` (pick from `fly platform regions`).
5. Generate the real `CLUB_ACCESS_TOKEN_SECRET` value if one doesn't already
   exist for this purpose:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   This exact value must later go into the **live** WordPress WPCode
   snippet's `SCROLLY_CLUB_ACCESS_SECRET` constant too — never into any repo
   file, chat message, or log.

## Deploy checklist (exact commands, run from `automation/`)

```bash
cd automation

# 1. Create the app shell (only if it doesn't exist yet). Uses fly.toml's
#    app name/region as defaults; --no-deploy so nothing ships yet.
fly launch --no-deploy --copy-config --name scrolly-1k-club-beta --region iad

# 2. Create the persistent volume BEFORE the first deploy that mounts it.
#    Size is a starting point for a small beta's flat-JSON member files;
#    resize later with `fly volumes extend` if needed, no data loss.
fly volumes create club_members_data --region iad --size 1

# 3. Set the real secret. Never pass this on a shared terminal/screen-share;
#    paste it directly into your own terminal.
fly secrets set CLUB_ACCESS_TOKEN_SECRET=<the real value from Prerequisites step 5>

# 4. Validate the config before shipping it (catches TOML/schema errors
#    without deploying anything).
fly config validate

# 5. Deploy.
fly deploy

# 6. Confirm it's actually healthy.
fly status
fly checks list
```

## Post-deploy verification (reversible, safe to run any time)

```bash
# Replace with the real app hostname fly gives you (fly status shows it).
curl -s https://scrolly-1k-club-beta.fly.dev/health
# expect: {"ok":true}

curl -s -o /dev/null -w "%{http_code}\n" https://scrolly-1k-club-beta.fly.dev/dashboard
# expect: 404 (sensitive route must never be reachable)

# Mint one real token locally (never share the printed URL) and hit an
# approved route through the deployed proxy instead of localhost:
node club/scripts/mint-test-access-token.mjs 1 scrollysocial@outlook.com
# then swap the printed host:port for the deployed https:// hostname when
# testing manually.
```

Only after this is confirmed healthy: update `automation/wordpress/deployed/club-access-route.php`'s
`SCROLLY_CLUB_BRIDGE_URL` to the real deployed URL (see below) and paste the
corrected snippet + the same secret into the live WPCode editor. That step —
and publishing the WooCommerce products — is explicitly **not** part of this
deployment-prep task.

## Exact production URL `club-access-route.php` needs

```
define( 'SCROLLY_CLUB_BRIDGE_URL', 'https://<your-fly-app>.fly.dev/club' );
```
or, once a subdomain DNS record exists pointing at the Fly app (a separate,
external DNS action):
```
define( 'SCROLLY_CLUB_BRIDGE_URL', 'https://club.scrollyseo.com/club' );
```
Either way it must point at the **proxy's** public hostname with the `/club`
path — never at port 5679 directly, which is never exposed.

## Rollback

Fly keeps prior releases. To revert to the last known-good version:
```bash
fly releases           # list past releases with their version numbers
fly deploy --image <previous-release-image-ref>
# or, simpler, if the previous release is the one just before this one:
fly releases rollback
```
Member data on the volume is untouched by a rollback either way — rolling
back the app code never deletes or modifies the volume's contents.

If the volume itself needs to be abandoned (not expected, but for
completeness): `fly volumes list`, then `fly volumes destroy <id>` — this
**does** permanently delete member data on it. Not a step to take casually;
snapshot first if one exists (`fly volumes snapshots list`).

## What this guide deliberately does not cover

- Publishing the WooCommerce products (`$1K Club` / `$1K Challenge`, IDs 279/280).
- Editing/pasting the live WordPress WPCode snippet.
- Any DNS change.
- The Challenge system's missing customer-facing surface (see the prior
  completion audit) — out of scope for getting the existing Club onto a
  real host.
