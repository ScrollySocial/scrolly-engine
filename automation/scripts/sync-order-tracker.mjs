#!/usr/bin/env node
/**
 * Reads clients/<slug>/order.json, maps it to the customer-safe status
 * (via lib/discover-customer-status.mjs), and pushes it to the WordPress
 * mu-plugin endpoints described in automation/wordpress/scrolly-order-tracker-mu-plugin.php.
 *
 * Defaults to --dry-run: computes and prints the exact payload(s) that
 * would be sent, makes zero network calls. Pass --live to actually call
 * WordPress. This script must not be run with --live until: (a) the
 * mu-plugin is installed on scrollyseo.com, (b) the dedicated service
 * user + Application Password exist, and (c) Mercedes has approved the
 * specific first live write.
 *
 * Usage:
 *   node scripts/sync-order-tracker.mjs <slug>            # dry-run
 *   node scripts/sync-order-tracker.mjs <slug> --live      # real write
 *
 * Required env for --live (see .env.example's "WordPress order tracker" block):
 *   WP_TRACKER_BASE_URL, WP_TRACKER_USER, WP_TRACKER_APP_PASSWORD
 */
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { loadOrder, clientDir, resolveVaultRelativePath } from '../lib/order-state.mjs';
import { toCustomerStatus } from '../lib/discover-customer-status.mjs';
import { assertValidCustomerStatus } from '../lib/customer-status-contract.mjs';

const TALLY_FORM_URL = process.env.TALLY_FORM_URL;

function buildTallyUrl(orderId, orderKey) {
  if (!TALLY_FORM_URL || !orderId || !orderKey) return null;
  return `${TALLY_FORM_URL}${TALLY_FORM_URL.includes('?') ? '&' : '?'}order_id=${orderId}&order_key=${encodeURIComponent(orderKey)}`;
}

function wpAuthHeader() {
  const user = process.env.WP_TRACKER_USER;
  const pass = process.env.WP_TRACKER_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error('WP_TRACKER_USER / WP_TRACKER_APP_PASSWORD are not set — cannot make a --live call.');
  }
  return 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
}

function wpBaseUrl() {
  const base = process.env.WP_TRACKER_BASE_URL;
  if (!base) throw new Error('WP_TRACKER_BASE_URL is not set — cannot make a --live call.');
  return base.replace(/\/+$/, '');
}

async function postJson(pathname, body) {
  const url = `${wpBaseUrl()}${pathname}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: wpAuthHeader() },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from ${pathname} (status ${res.status}): ${text.slice(0, 300)}`);
  }
  if (!res.ok) {
    throw new Error(`${pathname} returned ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  const args = process.argv.slice(2);
  const live = args.includes('--live');
  const slug = args.find((a) => !a.startsWith('--'));
  if (!slug) {
    console.error('Usage: node scripts/sync-order-tracker.mjs <slug> [--live]');
    process.exit(1);
  }

  const order = await loadOrder(slug);
  if (!order) {
    console.error(`No order.json for "${slug}" — nothing to sync.`);
    process.exit(1);
  }
  if (!order.orderId) {
    console.error(`order.json for "${slug}" has no orderId (WooCommerce order id) — cannot sync until intake has recorded one.`);
    process.exit(1);
  }

  const context = { tallyIntakeUrl: buildTallyUrl(order.orderId, order.orderKey) };
  const customer = toCustomerStatus(order, context);
  assertValidCustomerStatus(customer); // redundant with toCustomerStatus's own check, kept as a hard gate at the network boundary

  const statusPayload = {
    order_id: Number(order.orderId),
    customer_status: customer.customerStatus,
    customer_message: customer.customerMessage,
    action_label: customer.actionLabel,
    action_url: customer.actionUrl,
    report_available: customer.reportAvailable,
  };

  console.log(`[${slug}] computed customer status:`);
  console.log(JSON.stringify(customer, null, 2));
  console.log(`\n[${slug}] POST /wp-json/scrolly-tracker/v1/order-status payload:`);
  console.log(JSON.stringify(statusPayload, null, 2));

  let filePayloads = [];
  if (customer.reportAvailable) {
    for (const [fileType, relPath] of [
      ['report', order.reportPdfPath],
      ['appendix', order.appendixPdfPath],
    ]) {
      if (!relPath) continue;
      const absPath = resolveVaultRelativePath(relPath);
      filePayloads.push({ fileType, relPath, absPath });
    }
  }
  for (const f of filePayloads) {
    console.log(`\n[${slug}] would upload ${f.fileType} from ${f.relPath} to POST /wp-json/scrolly-tracker/v1/report-file`);
  }

  if (!live) {
    console.log('\n[dry-run] no network calls made. Pass --live to actually send these.');
    return;
  }

  const statusResult = await postJson('/wp-json/scrolly-tracker/v1/order-status', statusPayload);
  console.log(`\n[${slug}] order-status result:`, statusResult);

  for (const f of filePayloads) {
    const bytes = await readFile(f.absPath);
    const result = await postJson('/wp-json/scrolly-tracker/v1/report-file', {
      order_id: Number(order.orderId),
      file_type: f.fileType,
      file_base64: bytes.toString('base64'),
    });
    console.log(`[${slug}] report-file (${f.fileType}) result:`, result);
  }
}

main().catch((err) => {
  console.error('sync-order-tracker failed:', err.message);
  process.exit(1);
});
