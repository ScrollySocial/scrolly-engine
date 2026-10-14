# $1K Club — DigitalOcean Basic Droplet deployment guide

Scope: **one** DigitalOcean Basic Droplet ($4/mo, Regular CPU, 512MB/1vCPU/10GB/500GB), running the existing, unmodified `Dockerfile.club` image behind a native Caddy reverse proxy for HTTPS. No DigitalOcean Volume, no Load Balancer, no managed database, no backups/snapshots, no second Droplet — nothing beyond the $4 Droplet itself without explicit approval first. `scrollyseo.com`'s existing EasyWP WordPress site is untouched by anything in this document.

None of the commands below have been run against a real Droplet as of writing this file — this is the plan, prepared in advance so setup is fast and mistake-free once the Droplet exists.

## What's reused unmodified vs. what's new

**Unmodified, reused exactly as built for Fly:**
- `Dockerfile.club` — no Fly-specific code inside it; builds and runs identically under plain Docker.
- `club-fly-entrypoint.sh` — starts `bridge-server.mjs` privately in the background, execs `club-public-proxy.mjs` in the foreground. Nothing Fly-specific in it either (the name is a holdover; left as-is rather than renamed, to avoid unrelated diff noise).
- `club-public-proxy.mjs`'s allow-list and fail-closed logic — **completely untouched**. Caddy is a dumb TLS-terminating pass-through in front of it; the allow-list stays the sole authority on which routes are reachable, so there's no second enforcement point to drift out of sync.
- `.dockerignore` — unchanged; already excludes real member data, secrets, and unrelated products' code from the build context.

**New (this session, local files only, nothing deployed yet):**
- `automation/docker-compose.club.yml` — runs the existing image with a loopback-only published port, a bind-mounted host directory for member data, and conservative memory limits for a 512MB host.
- `automation/Caddyfile.club` — the entire reverse-proxy config; TLS is automatic.
- This file.

## Server-side layout (once deployed)

```
/opt/club-app/                        <- application root, NOT inside any web-served path
  ├─ (uploaded app files: bridge-server.mjs, club-public-proxy.mjs, club/, lib/, Dockerfile.club, docker-compose.club.yml, package.json, package-lock.json)
  ├─ .env.club                        <- created by hand over SSH, never uploaded, never in this repo
  └─ data/
      └─ members/                     <- bind-mounted into the container at /app/club/members
/etc/caddy/Caddyfile                  <- copy of Caddyfile.club
```

## Prerequisites (your action, before I can do anything remote)

1. **Create the DigitalOcean account** (or sign in if you already have one) and add a payment method — DO requires this to create any Droplet, including the $4 one. **Stop and confirm with me before entering payment details if you want me to re-check anything first; I won't be present for this step regardless, since I don't handle payment info.**
2. **Create the Droplet:**
   - Image: **Ubuntu 24.04 LTS** (or whatever current LTS DO offers — avoid anything marked beta).
   - Plan: **Basic → Regular (Disk type: SSD) → $4/mo (512MB/1vCPU/10GB/500GB)**. Do not select "Premium" CPU options or any plan without a flat monthly cap.
   - **Datacenter region:** any US region is fine (e.g., NYC or SFO) — not worth optimizing for a small beta.
   - **Authentication: SSH Key**, not password. Paste this exact public key (generated locally for this Droplet specifically, private key never leaves this machine):
     ```
     ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEMZCwx1qGoIHO6j1sBYYZPYtjXeXqCYNtSitfCObsF2 scrolly-club-droplet
     ```
   - **Before clicking "Create Droplet," check the order summary for anything beyond $4.00/mo** — backups, monitoring, or other add-ons are sometimes pre-ticked by default in DO's UI. Uncheck all of them. If anything is unclear or can't be unchecked, stop and show me the summary before creating it.
3. **Give me the Droplet's public IPv4 address** once it's created (not sensitive — fine to share). I do not need your DO login, password, or payment details at any point.

Once I have that IP, I can SSH in directly (using the private half of the key above, already on this machine) and run the rest of this guide myself — you won't need to type deployment commands, only the one secret-entry step below.

## Exact remote setup sequence (run once I have the Droplet IP)

```bash
# 1. Initial hardening. Operating as root on this one small, single-purpose
# beta box (DigitalOcean's own default for a key-created Droplet) rather
# than adding a separate sudo user -- that's extra setup complexity this
# task didn't ask for, on top of the one hardening step that actually
# matters here: no password auth, key-only.
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl restart sshd

# 2. Firewall -- allow only SSH, HTTP (for Caddy's TLS challenge + redirect), HTTPS
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
# (DigitalOcean's own Cloud Firewall is free to add as a second layer in the
#  DO dashboard -- same 3 ports -- worth doing but not required for this to work.)

# 3. Swap -- a 512MB box running Docker + Caddy + Node has little slack.
#    This is a safety net against an OOM kill of the whole system (including
#    sshd) during a brief spike, not a performance feature -- swap is slow,
#    and this app's normal working set should rarely touch it.
fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 4. Docker
curl -fsSL https://get.docker.com | sh

# 5. Caddy (native install, not a container -- see Caddyfile.club's own header comment for why)
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# 6. Application files
mkdir -p /opt/club-app/data/members
# (upload bridge-server.mjs, club-public-proxy.mjs, club-fly-entrypoint.sh,
#  club/, lib/, Dockerfile.club, docker-compose.club.yml, package.json,
#  package-lock.json to /opt/club-app -- via scp/rsync from this machine)

# 7. Build, then determine the container's actual runtime UID so the
#    bind-mounted host directory is owned correctly (bind mounts share
#    real file ownership between host and container -- this is NOT
#    knowable in advance without building the actual image).
cd /opt/club-app
docker compose -f docker-compose.club.yml build
docker run --rm scrolly-club:latest id scrolly    # note the uid= it prints
chown -R <that-uid>:<that-gid> /opt/club-app/data/members
```

## Secret — your one manual step, never through me

`CLUB_ACCESS_TOKEN_SECRET` must exactly match the value already used by the live WordPress `$1K Club` access snippet. **You do this step yourself, directly on the server, never through this conversation:**

```bash
ssh -i ~/.ssh/scrolly_club_droplet root@<droplet-ip>
nano /opt/club-app/.env.club
```
Type exactly one line. I don't know whether a real shared secret has already been established between this app and the live WordPress snippet — `automation/wordpress/deployed/club-access-route.php`'s `SCROLLY_CLUB_ACCESS_SECRET` still shows a placeholder as of the last time I read it. If a real value already exists in your local `automation/.env`, use that one; if not, generate a fresh one now (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) and use it consistently everywhere. Either way, this line must end up byte-identical here and in the live WordPress snippet — that WordPress edit is a separate, later, explicit step, not part of this one:
```
CLUB_ACCESS_TOKEN_SECRET=<the real value>
```
Save (`Ctrl+O`, Enter, `Ctrl+X`). That's the whole step. I never see this value.

## Start the app and point Caddy at it

```bash
cp /opt/club-app/Caddyfile.club /etc/caddy/Caddyfile
systemctl reload caddy
cd /opt/club-app && docker compose -f docker-compose.club.yml up -d
```
(Caddy won't be able to get a real TLS certificate for `club.scrollyseo.com` until DNS actually points at this Droplet — that's the explicit later step you're withholding until the server itself is verified. Everything below is verified over plain HTTP against the Droplet's IP first.)

## Verification (before anything touches WordPress or DNS)

| # | Check | Command |
|---|---|---|
| 1 | Image builds/runs | `docker compose -f docker-compose.club.yml up -d` exits clean, `docker ps` shows it `Up` |
| 2 | Restarts automatically | `docker kill scrolly-club` then `docker ps` — should show a fresh `Up` within seconds (`restart: unless-stopped`) |
| 3 | `/health` → 200 | `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/health` |
| 4 | `/dashboard` blocked | `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/dashboard` → expect `404` |
| 5 | Authenticated route works | mint a test token locally (same `mint-test-access-token.mjs` script, same secret) → `curl http://127.0.0.1:8080/club/overview/state -H "Authorization: Bearer <token>"` |
| 6 | Data survives restart | write test data via #5's account → `docker restart scrolly-club` → re-fetch, same data |
| 7 | Data survives rebuild | `docker compose -f docker-compose.club.yml up -d --build` (full rebuild) → re-fetch again, same data (proves the bind mount, not the container, is what's actually persisting it) |
| 8 | Bridge not externally reachable | from **this machine**, not the server: `curl` the Droplet's public IP on port `5679` and `8080` directly — both should time out / connection-refused, since `8080` is bound to `127.0.0.1` only and `5679` is never published at all |
| 9 | Fits in 512MB | `docker stats scrolly-club --no-stream` under light load, plus `free -h` on the host, while exercising #5/#6 a few times |

**A dedicated test identity, not a real customer account, for all of #5–#7** — same convention as every prior verification pass.

## What's deliberately not done yet

- DNS for `club.scrollyseo.com` — you get the exact record to add only after #1–#9 above pass.
- Editing the live WordPress WPCode snippet.
- Publishing WooCommerce product 279.
- Any DigitalOcean add-on beyond the $4 Droplet itself (backups, snapshots, Volumes, Load Balancer, monitoring, a second Droplet) — if the DO UI ever shows a charge beyond $4.00/mo at any point in this process, that's a stop-and-ask moment, not a proceed-and-mention-it-later one.
