#!/usr/bin/env node
/**
 * Finds paid $299 "SEO Site Audit" WooCommerce orders whose customer never
 * clicked through to (or never finished) the Tally intake form, and emails
 * them a reminder with the same order_id/order_key link the thank-you page's
 * button uses (see ../../woocommerce-thankyou-snippet.php).
 *
 * Unlike the other scripts in this folder, this one sends the Resend email
 * itself (via fetch) rather than just building a payload for n8n to POST —
 * it's a batch job over 0..N orders per run, not one deterministic send, so
 * looping inside a single script is simpler than looping inside n8n's graph.
 * The triggering n8n workflow (pending-intake-reminder.json) is deliberately
 * just a Schedule Trigger -> one HTTP call to this via the bridge server.
 *
 * A customer counts as "already handled" if any clients/<slug>/discover/
 * contact.json has this order's id recorded (written by create-engagement.mjs
 * once a matching Tally submission passes verification) — meaning don't ever
 * mark an order "pending" once its real intake has gone through.
 *
 * Repeats: one reminder per day (configurable) until either the customer
 * completes intake (a matching contact.json shows up) or INTAKE_REMINDER_MAX_AGE_DAYS
 * is reached, whichever comes first — not just a single one-and-done nudge.
 *
 * Usage: node check-pending-intakes.mjs
 * stdout: {"checked": N, "reminded": [...orderIds], "skipped": [{"orderId":...,"reason":...}]}
 *
 * Required env: WC_STORE_BASE_URL, WC_AUDIT_CONSUMER_KEY, WC_AUDIT_CONSUMER_SECRET,
 *   WC_AUDIT_PRODUCT_ID, TALLY_FORM_URL, RESEND_API_KEY, RESEND_FROM_EMAIL.
 * Optional env: SENDER_DISPLAY_NAME, INTAKE_REMINDER_DELAY_HOURS (default 3,
 *   wait this long after payment before the FIRST reminder), INTAKE_REMINDER_INTERVAL_HOURS
 *   (default 24, spacing between repeat reminders), INTAKE_REMINDER_MAX_AGE_DAYS (default 7,
 *   stop entirely after this many days and assume a human should follow up manually).
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';
import { AUTOMATION_DIR, CLIENTS_DIR } from './_paths.mjs';

const WC_BASE = (process.env.WC_STORE_BASE_URL || 'scrollyseo.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const WC_KEY = process.env.WC_AUDIT_CONSUMER_KEY;
const WC_SECRET = process.env.WC_AUDIT_CONSUMER_SECRET;
const PRODUCT_ID = String(process.env.WC_AUDIT_PRODUCT_ID || '24');
const TALLY_FORM_URL = process.env.TALLY_FORM_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const SENDER_DISPLAY_NAME = process.env.SENDER_DISPLAY_NAME || 'Scrolly SEO';
const DELAY_HOURS = parseFloat(process.env.INTAKE_REMINDER_DELAY_HOURS || '3');
const INTERVAL_HOURS = parseFloat(process.env.INTAKE_REMINDER_INTERVAL_HOURS || '24');
const MAX_AGE_DAYS = parseFloat(process.env.INTAKE_REMINDER_MAX_AGE_DAYS || '7');

const STATE_PATH = path.join(AUTOMATION_DIR, 'pending-intake-reminders.json');

function requireEnv() {
  const missing = ['WC_AUDIT_CONSUMER_KEY', 'WC_AUDIT_CONSUMER_SECRET', 'TALLY_FORM_URL', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL'].filter(
    (k) => !process.env[k]
  );
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

async function loadState() {
  return readJsonSafe(STATE_PATH, {});
}

async function saveState(state) {
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

// Every order id already tied to a real intake submission, across all client
// engagement folders — never remind a customer who already finished intake.
async function findCompletedOrderIds() {
  const ids = new Set();
  let entries;
  try {
    entries = await readdir(CLIENTS_DIR, { withFileTypes: true });
  } catch {
    return ids;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const contact = await readJsonSafe(path.join(CLIENTS_DIR, entry.name, 'discover', 'contact.json'), null);
    if (contact?.orderId) ids.add(String(contact.orderId));
  }
  return ids;
}

async function fetchCandidateOrders() {
  const after = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const params = new URLSearchParams({
    product: PRODUCT_ID,
    status: 'processing,completed',
    after,
    per_page: '100',
    orderby: 'date',
    order: 'desc',
    consumer_key: WC_KEY,
    consumer_secret: WC_SECRET,
  });
  const res = await fetch(`https://${WC_BASE}/wp-json/wc/v3/orders?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`WooCommerce orders fetch failed: HTTP ${res.status} — ${await res.text()}`);
  }
  return res.json();
}

function orderAgeHours(order) {
  const raw = order.date_created_gmt || order.date_created;
  const iso = /Z|[+-]\d{2}:\d{2}$/.test(raw) ? raw : `${raw}Z`;
  return (Date.now() - new Date(iso).getTime()) / (60 * 60 * 1000);
}

async function sendReminder(order, reminderNumber) {
  const html = await (async () => {
    const raw = await readFile(path.join(AUTOMATION_DIR, 'email-templates', 'intake-reminder.html'), 'utf8').catch(
      () => '<p>Hi {{contact_name}}, just a reminder to finish your SEO Site Audit intake: {{tally_url}}</p>'
    );
    const tallyUrl = `${TALLY_FORM_URL}${TALLY_FORM_URL.includes('?') ? '&' : '?'}order_id=${order.id}&order_key=${encodeURIComponent(order.order_key)}`;
    return raw.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const vars = {
        contact_name: order.billing?.first_name || 'there',
        tally_url: tallyUrl,
        order_number: String(order.id),
      };
      return vars[key] != null ? String(vars[key]) : '';
    });
  })();

  // First reminder reads as a nudge; repeats are worded as a follow-up so daily
  // emails don't sound like the first one got ignored/ForgotUnknown each time.
  const subject =
    reminderNumber <= 1
      ? 'Quick reminder — finish your SEO Site Audit intake'
      : `Still waiting on your SEO Site Audit intake (reminder #${reminderNumber})`;

  const body = {
    from: `${SENDER_DISPLAY_NAME} <${RESEND_FROM_EMAIL}>`,
    to: [order.billing.email],
    subject,
    html,
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Resend send failed for order ${order.id}: HTTP ${res.status} — ${await res.text()}`);
  }
}

async function main() {
  requireEnv();

  const [orders, completedOrderIds, state] = await Promise.all([fetchCandidateOrders(), findCompletedOrderIds(), loadState()]);

  const skipped = [];
  const reminded = [];

  for (const order of orders) {
    const id = String(order.id);
    if (completedOrderIds.has(id)) {
      skipped.push({ orderId: id, reason: 'intake already completed' });
      continue;
    }

    const ageHours = orderAgeHours(order);
    if (ageHours > MAX_AGE_DAYS * 24) {
      skipped.push({ orderId: id, reason: `too old (${(ageHours / 24).toFixed(1)}d) — assume operator follow-up, no more reminders` });
      continue;
    }

    const existing = state[id];
    if (existing) {
      const hoursSinceLast = (Date.now() - new Date(existing.lastRemindedAt).getTime()) / (60 * 60 * 1000);
      if (hoursSinceLast < INTERVAL_HOURS) {
        skipped.push({
          orderId: id,
          reason: `reminded ${existing.count}x already, last ${hoursSinceLast.toFixed(1)}h ago — waiting for ${INTERVAL_HOURS}h spacing`,
        });
        continue;
      }
    } else if (ageHours < DELAY_HOURS) {
      skipped.push({ orderId: id, reason: `too soon for first reminder (${ageHours.toFixed(1)}h old, waiting for ${DELAY_HOURS}h)` });
      continue;
    }

    if (!order.billing?.email) {
      skipped.push({ orderId: id, reason: 'no billing email on order' });
      continue;
    }

    const reminderNumber = (existing?.count || 0) + 1;
    await sendReminder(order, reminderNumber);
    state[id] = { count: reminderNumber, lastRemindedAt: new Date().toISOString(), email: order.billing.email };
    reminded.push(`${id} (#${reminderNumber})`);
  }

  await saveState(state);

  process.stdout.write(JSON.stringify({ checked: orders.length, reminded, skipped }));
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
