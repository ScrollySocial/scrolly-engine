---
name: chat-manager-setup
description: Set up, check or update Chat Manager (comment and DM keywords, freebie signups, one inbox for Instagram, YouTube and TikTok) on the buyer's own $6 server. Asks a few plain questions, then either clicks through Meta, Google, DigitalOcean and DuckDNS with Claude in Chrome while the buyer signs in, pastes keys and approves, or walks them through the guide; everything with an API (server, address, install, email list, workflow, tests) runs on its own. Use when someone says "set up my Chat Manager", "install Chat Manager", "update my Chat Manager", "check my Chat Manager", "connect my email list", or a helper prints NEEDS YOU.
---

# Set up my Chat Manager

Chat Manager runs on the buyer's own small server: Instagram comment and DM keywords that send freebies, an email
signup page, reminders, YouTube comment keywords, TikTok comments in the inbox, and one dashboard for everything.
This skill gets it running from nothing in about an hour of the buyer's time. There are no setup calls: everything
the buyer needs is here, in `guide/` and in the helpers.

Run every command from the kit folder (the one with `docker-compose.yml`) with the Bash sandbox off (the helpers use
the network, `ssh`, `tar` and `ssh-keygen`, all built into Windows 10+, macOS and Linux). Helper lines start with
**OK**, **WAIT**, **NEEDS YOU** or **FAILED**.

## Always

- **Keys never go through chat.** The buyer pastes keys into the key page (`node setup/keys.mjs <NAMES>`, a form on
  their own computer) and the helpers read them from `.secrets/keys.json`. Never print, read out or `cat` that
  file, `.secrets/server.env` or a key. If the buyer pastes a key into chat anyway, don't repeat it; tell them to
  revoke it and make a new one later if it was shared anywhere else, and save it through the key page.
- **Values the buyer pastes elsewhere** (Meta's verify token, the dashboard setup code) are shown on their computer
  with `node setup/keys.mjs --show META_VERIFY_TOKEN` (or `INBOX_SETUP_CODE`), never in chat.
- **The buyer does:** creating accounts, signing in, passwords, the card on DigitalOcean, every key or token,
  accepting terms, approving permissions ("Allow", "Continue"), "Publish" on the Meta app and Google's "Publish app".
- **Never:** submit anything for Meta App Review or Google verification, add permissions or "+ Add" features in Meta,
  upload a logo to Google, start Google's "free trial", or switch test mode off without the buyer's OK.
- Plain words, a few questions at a time, recommended option first (AskUserQuestion for choices).

## 0. Where are we?

Run `node setup/cm.mjs check` if `.secrets/server.json` exists. If everything says OK, it's set up: offer the
"Using it" section or an update. Otherwise pick up at the first step that isn't done (each step below says how to
tell). If the buyer said "update my Chat Manager", jump to **Update**.

## 1. Questions (write `config/profile.json`)

Copy `config/profile.example.json` to `config/profile.json` and fill it in from these answers. Keep `_note`.

1. **How should we do the clicking?**
   - *Claude does the clicking (recommended if you have Claude in Chrome):* Claude opens each page in Chrome and
     clicks through it; you sign in, paste keys and press the approve buttons. Needs the Claude in Chrome extension
     connected (check with the Chrome tools; if they're missing, say how to install it from claude.ai/chrome or
     offer the other mode).
   - *I'll do it myself:* Claude opens the matching page of the guide (`guide/index.html`) at each step, with
     screenshots, and checks each step with the helpers. They can switch at any step.
2. Their first name → `owner`. Their brand or business name → `brand`. Instagram username → `handle`.
3. **Web address:** *A free address (recommended): yourname.duckdns.org* or *a subdomain of my own website*
   (for example `hooks.theirsite.com`; they'll add one DNS "A record"): `node setup/cm.mjs set host=hooks.theirsite.com ownDomain=true`.
4. **Email list** (where freebie signups go):
   - *Keep the list here, no email tool (default):* the dashboard's Email list tab with a CSV download.
   - *MailerLite, Kit, Mailchimp, beehiiv or Flodesk:* a direct connection (key later).
   - *Something else:* a webhook URL for Zapier, Make, n8n or any tool that takes one.
   Save it: `node setup/cm.mjs set EMAIL_LIST=builtin` (or mailerlite, kit, mailchimp, beehiiv, flodesk, webhook).
5. **Which platforms?** Instagram comments (always); Instagram DMs and Story replies (recommended: needed for "reply
   READY", reminders and the welcome message); YouTube comments; TikTok comments (copy and paste replies; needs a
   free Apify account). Save: `node setup/cm.mjs set DMS_ENABLED=true YOUTUBE=true TIKTOK=false COMMENTS_DRY_RUN=true`.
6. **Look of the signup page and dashboard:** their brand colors (background, text, button, button text as hex) and
   fonts (any Google Font; build the `fontsUrl` as `https://fonts.googleapis.com/css2?family=Name+One&family=Name+Two&display=swap`).
   No brand colors yet: keep the example's.
7. **Signup consent line** (the box people tick): offer "Add me to <brand>'s emails too. I can unsubscribe anytime."
8. **For the privacy page** → `legal`: `businessName` (as people know it), `location` (state or region and country),
   `contactEmail` (where deletion requests go). Say once: the page is a plain-words starting point modelled on a
   setup Meta and Google accepted, not legal advice.
9. **About them** → `about` (one or two sentences: who they help and what they sell; only used for automatic API
   drafts).

Show a short plain summary of what you saved (no JSON).

## 2. The server (DigitalOcean + DuckDNS)

Done when `node setup/cm.mjs check` shows "HTTPS and dashboard" OK.

1. **DigitalOcean account** (buyer): sign up at digitalocean.com with their card. Guide page: `guide/index.html#digitalocean`.
   Chrome mode: open the sign-up page; they do the rest. Then open cloud.digitalocean.com/account/api/tokens →
   "Generate New Token", name "Chat Manager", Full Access; **they** click Generate and copy it.
   `node setup/keys.mjs DO_TOKEN` → they paste it → `node setup/cm.mjs check-token`.
2. Ask which city is closest (New York `nyc1`, San Francisco `sfo3`, Toronto `tor1`, London `lon1`, Amsterdam
   `ams3`, Frankfurt `fra1`, Singapore `sgp1`, Sydney `syd1`, Bangalore `blr1`), then `node setup/cm.mjs create <region>`.
   Say: this starts the $6/month charge on their DigitalOcean account.
3. **DuckDNS** (skip with their own domain): duckdns.org → they sign in (Google, GitHub or others) → type their name
   in "sub domain" → **add domain**. `node setup/keys.mjs DUCKDNS_NAME DUCKDNS_TOKEN` → `node setup/cm.mjs address`.
   Own domain: tell them the A record (`host` → the server IP from `check`), then `node setup/cm.mjs address` until OK.
4. `node setup/pages.mjs` (privacy, terms, home page from the profile) → `node setup/cm.mjs install`
   (5 to 10 minutes: Docker, HTTPS certificate, workflow). Ends with `check`.
5. Show them https://<host>/privacy and https://<host>/inbox. Dashboard first visit: `node setup/keys.mjs --show
   INBOX_SETUP_CODE`; they type it and choose a password (password manager).

## 3. Instagram (Meta app)

Guide: `guide/index.html#meta`. Done when `node scripts/instagram-setup.mjs` prints their account and
"Notifications ON".

Read the traps aloud at the step where they happen (they are all in the guide in bold):

1. **Instagram account must be Professional** (Creator or Business): Instagram app → Settings → Account type and
   tools → Switch to professional account. **Turn on** Settings → Messages and story replies → Message controls →
   Connected tools → Allow access to messages.
2. developers.facebook.com → they log in with Facebook. **"Account confirmation needed… unusual activity"** on a first
   visit is normal: Confirm Account and follow the steps.
3. My Apps → Create app. **"There's a new way to create apps"** popup: Create app. Name: "<brand> Chat Manager".
   Use case: **"Manage messaging & content on Instagram"**. Business portfolio: **"I don't want to connect a business
   portfolio yet"**. They click Create (and re-enter their Facebook password if asked).
4. App roles → Roles → Add people → **Instagram Tester** → their Instagram username. **Then accept the invite in
   Instagram:** instagram.com/accounts/manage_access → Tester invites → Accept. (Not Administrator, Developer or
   Tester.)
5. Use cases → Customize → **API setup with Instagram login**:
   - Step 1 "Generate access tokens": Add account → they sign in to Instagram and allow → **Generate token** → copy.
   - Step 3: **Instagram app secret** → Show → copy.
   `node setup/keys.mjs IG_ACCESS_TOKEN META_APP_SECRET`.
   - Step 2 "Configure webhooks": Callback URL `https://<host>/webhook/instagram`; Verify token: they paste it from
     `node setup/keys.mjs --show META_VERIFY_TOKEN`; Verify and save. Then **Webhook fields: only `comments`** (plus
     `messages` if DMs are on). **Meta pre-ticks several message fields: turn the others off.** Turn on the account's
     **Webhook Subscription** switch.
   - **Skip step 4 "Set up Instagram business login" and step 5 "Complete app review"**: not needed for your own account.
6. App settings → Basic (all five are needed to publish): Contact email; **Privacy policy URL**
   `https://<host>/privacy`; **Terms of Service URL** `https://<host>/terms` (easy to miss); **User data deletion:
   pick "Data deletion instructions URL"** (not the callback) → `https://<host>/privacy#delete-your-data`; **App icon
   1024 × 1024 PNG** (their logo on a square; Canva → Custom size 1024 × 1024 → Download PNG; unlike Google, this
   starts no review); **Category: Business and pages**; App domains: their host. Skip "Data Protection Officer".
   **Save changes** and wait for the green "Changes saved".
7. **Publish** (left menu): the page links to "Customize use case" with "+ Add" buttons (Human Agent, Instagram
   Public Content Access…). **Don't add any**: extra permissions can send the app to App Review. They click the blue
   **Publish** button. Webhooks only arrive once the app is published.
8. `node scripts/instagram-setup.mjs` (add `--with-dms` when DMs are on). It saves their account ID.
   **Two app IDs:** the dashboard's App ID differs from the Instagram app ID in API setup; use the one a step asks for.

## 4. YouTube (only if they picked it)

Guide: `guide/index.html#google`. Done when `node scripts/youtube-auth.mjs` prints their channel.

1. **Go straight to console.cloud.google.com.** Google's "Get started for free" button is the $300 trial, whose step 2
   asks for a card. Nothing here needs billing: tick only the plain Terms of Service.
2. New project "chat-manager". APIs & Services → Library → **YouTube Data API v3** → Enable.
3. Credentials → Create credentials → API key. In the wizard, **"What data will you be accessing?" → Public data**.
   The "sensitive data… verification 4-6 weeks" popup there doesn't apply to your own channel. Copy the key.
4. Google Auth Platform → Get started: app name "<brand> Chat Manager", support email, Audience **External**,
   contact email, agree. **Branding: no logo, ever** (a logo forces Google verification, 4 to 6 weeks); home page
   `https://<host>/`; privacy policy `https://<host>/privacy`; authorized domain: their host (for DuckDNS that's
   `<name>.duckdns.org`). Save.
5. **Audience → Publish app → In production.** Left in "Testing", the YouTube sign-in expires every 7 days and replies
   silently stop. **Never "Submit for verification".**
6. Clients → Create client → **Desktop app**, name "Chat Manager". **Untick "Use this client for an AI-powered agent"**
   if it's there. Copy Client ID and Client secret.
   `node setup/keys.mjs YT_API_KEY YT_CLIENT_ID YT_CLIENT_SECRET`.
7. `node scripts/youtube-auth.mjs` → open the link, sign in with the account that owns the channel. **"Google hasn't
   verified this app" is expected: Advanced → Go to <app name> (unsafe)** (it's their own app) → Allow.

## 5. TikTok (only if they picked it)

apify.com → free account (it includes $5 of monthly credit; Chat Manager caps each daily check at $0.10). Settings →
API & Integrations → Personal API token. `node setup/keys.mjs APIFY_TOKEN TIKTOK_HANDLE`. Say plainly: TikTok gives
no way to reply automatically, so TikTok comments arrive in the inbox with a suggested reply and a "Copy & open
TikTok" button.

## 6. Email list (skip for the built-in list)

| Tool | Key | Where |
| --- | --- | --- |
| MailerLite | `MAILERLITE_API_KEY` | Integrations → MailerLite API → Generate new token |
| Kit | `KIT_API_KEY` | Settings → Developer → API keys (a v4 key) |
| Mailchimp | `MAILCHIMP_API_KEY` | Profile → Extras → API keys (ends in -us21 or similar) |
| beehiiv | `BEEHIIV_API_KEY` | Settings → Workspace settings → API |
| Flodesk | `FLODESK_API_KEY` | Account settings → Integrations → API keys |
| Webhook | `LIST_WEBHOOK_URL` | Zapier: "Webhooks by Zapier" → Catch Hook; Make: "Custom webhook"; n8n: Webhook node (production URL) |

Menus move; if a path above doesn't match, find "API" in the tool's settings and tell the buyer what you found.
`node setup/keys.mjs <KEY>`. Then in the dashboard's Email list tab, **Send a test signup** to their own email.

## 7. Switch it on

1. `node setup/pages.mjs` again (the privacy page now matches what's on) → `node setup/cm.mjs push-config`.
2. `node setup/cm.mjs push-env` (sends every key and setting; test mode stays ON) → `node setup/cm.mjs check`.
3. **First keyword together** in the dashboard (Keywords → + New keyword): freebie name and link, where it works,
   "Ask first" (recommended with DMs on), Email signup or Link in the DM, list or tag, read the preview, tick
   "I approve these messages", switch it on.
4. **Test in test mode** from a second Instagram account (a friend's, or a spare one; it needs no role on the app):
   comment the keyword on a post. The inbox shows what would have been sent. A question comment lands as
   "Needs reply".
5. **Test mode off, with their OK:** `node setup/cm.mjs set COMMENTS_DRY_RUN=false`, `node setup/cm.mjs push-env`, and
   repeat the test: the DM arrives for real, the signup page works, the email shows in the Email list (and their
   email tool).

## 8. Hand over

One short message: their dashboard link, their privacy page link, what runs on its own (keyword DMs, YouTube keyword
replies, reminders, welcome message if on), what waits for them (every other reply, TikTok copy and paste), how to
get drafts ("draft my comment replies", the draft-comment-replies skill on their Claude plan), how to update
("update my Chat Manager"), and that the DigitalOcean token can now be deleted in DigitalOcean (they make a new one
for updates). Running cost: $6 a month for the server.

## Update ("update my Chat Manager")

1. The buyer downloads the newest zip from their account on theambitiondepartment.com (My Account → Downloads) and unzips it
   over this folder (their `.secrets` and `config` stay; the zip has neither).
2. If the DigitalOcean token expired, they don't need a new one: updates go over SSH with the kit's own key.
3. `node setup/cm.mjs update`: backs up their settings, keys and inbox to `.secrets/backups`, uploads the new code,
   adds new settings with their defaults, keeps keywords, inbox, email list and keys, re-imports the workflow, checks.
4. Read `CHANGELOG.md` for the new version and tell them what's new in two lines.

## When something fails

- `check` names the failing part. HTTPS not answering right after install: the certificate can take a few minutes
  after the address starts pointing at the server; run `check` again. DuckDNS "KO": the name isn't added on
  duckdns.org or the token is wrong.
- Meta "The callback URL or verify token couldn't be validated": the workflow isn't published yet (`check` → the
  "Instagram webhook check" line) or the verify token was pasted with a space.
- n8n editor (rarely needed): `node setup/cm.mjs editor`, then http://localhost:5678. It's never public.
- The `.secrets` folder is the only copy of their keys and server key: suggest they copy it to a USB stick or their
  password manager's file storage.
