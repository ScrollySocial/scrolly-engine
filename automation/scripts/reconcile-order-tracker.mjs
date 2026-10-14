#!/usr/bin/env node
/**
 * Lightweight safety net for the event-driven WordPress order-status sync
 * (see lib/wp-tracker-sync.mjs) -- NOT a polling loop. Run manually or on
 * an infrequent schedule (e.g. once a day) to catch any order whose
 * WordPress projection fell behind because a sync event was missed (a
 * crashed run, a WordPress outage during a POST, etc.).
 *
 * Only reconciles orders that already have an order.json -- an order still
 * waiting on intake has no order.json yet and is out of scope here (it
 * already reads correctly as "intake_required" the moment a My Account page
 * queries WooCommerce directly, with no sync needed).
 *
 * syncOrderToWordPress() is already idempotent (skips when the computed
 * projection already matches order.json's wpSync snapshot), so running this
 * against every client on every invocation is safe and cheap -- most calls
 * are no-ops.
 *
 * Usage: node scripts/reconcile-order-tracker.mjs
 */
import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { CLIENTS_DIR, orderPath } from '../lib/order-state.mjs';
import { syncOrderToWordPress } from '../lib/wp-tracker-sync.mjs';

async function main() {
  const entries = await readdir(CLIENTS_DIR, { withFileTypes: true });
  const slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  const results = [];
  for (const slug of slugs) {
    if (!existsSync(orderPath(slug))) continue; // no order.json yet -- nothing to reconcile
    const result = await syncOrderToWordPress(slug);
    results.push({ slug, ...result });
  }

  const synced = results.filter((r) => r.ok);
  const skipped = results.filter((r) => r.skipped);
  const failed = results.filter((r) => r.ok === false);

  console.log(JSON.stringify({ checked: results.length, synced: synced.length, skipped: skipped.length, failed: failed.length, failures: failed }, null, 2));
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
