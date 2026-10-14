#!/usr/bin/env node
/**
 * Pings N8N_INTAKE_WEBHOOK_URL with a GET (n8n replies 404 "not registered for
 * GET requests" when the workflow is alive and reachable — any other response,
 * or no response at all, means the Cloudflare Quick Tunnel has died, which it
 * does silently on every restart since the URL isn't stable (see
 * automation/.env.example's note above N8N_INTAKE_WEBHOOK_URL).
 *
 * Meant to run standalone on a schedule (Windows Task Scheduler), independent
 * of n8n/Docker, since it's specifically checking whether THOSE are reachable
 * from the outside — a check living inside n8n couldn't report n8n being down.
 *
 * Only emails once per outage (tracked in tunnel-alert-state.json next to this
 * script's automation dir) plus one "back up" email on recovery, so a dead
 * tunnel doesn't spam a reminder every run.
 *
 * Usage: node check-webhook-tunnel.mjs
 * Required env: N8N_INTAKE_WEBHOOK_URL, RESEND_API_KEY, RESEND_FROM_EMAIL, ALERT_EMAIL_TO.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';
import { AUTOMATION_DIR } from './_paths.mjs';

const WEBHOOK_URL = process.env.N8N_INTAKE_WEBHOOK_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const SENDER_DISPLAY_NAME = process.env.SENDER_DISPLAY_NAME || 'Scrolly SEO';
const ALERT_EMAIL_TO = process.env.ALERT_EMAIL_TO;

const STATE_PATH = path.join(AUTOMATION_DIR, 'tunnel-alert-state.json');
const EXPECTED_MESSAGE_FRAGMENT = 'not registered for GET requests';

function requireEnv() {
  const missing = ['N8N_INTAKE_WEBHOOK_URL', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'ALERT_EMAIL_TO'].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing required env: ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function readJsonSafe(p, fallback) {
  try {
    return JSON.parse(await readFile(p, 'utf8'));
  } catch {
    return fallback;
  }
}

async function checkWebhook() {
  try {
    const res = await fetch(WEBHOOK_URL, { method: 'GET', signal: AbortSignal.timeout(15000) });
    if (res.status !== 404) return { ok: false, reason: `unexpected status ${res.status}` };
    const body = await res.text();
    if (!body.includes(EXPECTED_MESSAGE_FRAGMENT)) return { ok: false, reason: `unexpected body: ${body.slice(0, 200)}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.message || String(err) };
  }
}

async function sendAlert(subject, text) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${SENDER_DISPLAY_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [ALERT_EMAIL_TO],
      subject,
      text,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend alert send failed: HTTP ${res.status} — ${await res.text()}`);
  }
}

async function main() {
  requireEnv();

  const state = await readJsonSafe(STATE_PATH, { down: false });
  const result = await checkWebhook();
  const now = new Date().toISOString();

  if (!result.ok && !state.down) {
    await sendAlert(
      'ALERT: intake webhook tunnel is down',
      `The n8n intake webhook is unreachable as of ${now}.\n\nURL checked: ${WEBHOOK_URL}\nReason: ${result.reason}\n\nThis means any customer completing the Tally intake form right now will silently fail to create their engagement. Likely cause: the Cloudflare Quick Tunnel died on a restart and needs a fresh URL (see automation/README.md). Restart it and update N8N_INTAKE_WEBHOOK_URL / N8N_ENGAGEMENT_COMPLETE_WEBHOOK_URL / N8N_APPROVE_AND_SEND_WEBHOOK_URL in automation/.env, plus the webhook URL in Tally's D4OVlE form integration settings, to match.`
    );
    await writeFile(STATE_PATH, JSON.stringify({ down: true, since: now, reason: result.reason }, null, 2), 'utf8');
    process.stdout.write(JSON.stringify({ status: 'newly_down', reason: result.reason }));
  } else if (result.ok && state.down) {
    await sendAlert(
      'RESOLVED: intake webhook tunnel is back up',
      `The n8n intake webhook is reachable again as of ${now}.\n\nIt was down since ${state.since} (${state.reason}).`
    );
    await writeFile(STATE_PATH, JSON.stringify({ down: false }, null, 2), 'utf8');
    process.stdout.write(JSON.stringify({ status: 'recovered' }));
  } else {
    process.stdout.write(JSON.stringify({ status: result.ok ? 'ok' : 'still_down', reason: result.ok ? undefined : result.reason }));
  }
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
