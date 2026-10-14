#!/usr/bin/env node
/**
 * Records delivery after the client email successfully sends. Canonical
 * structured state (order.json, via recordDelivery) is now the source of
 * truth this feeds the customer-facing WordPress projection from; the
 * status.md append is kept alongside it since no inspection has proven it's
 * safe to remove (nothing else in this repo currently reads it back, but
 * it's the existing human-readable audit trail for this engagement and
 * removing it wasn't asked for).
 *
 * Usage: node mark-delivered.mjs <slug>
 */
import { appendFile } from 'node:fs/promises';
import path from 'node:path';
import { engagementDir } from './_paths.mjs';
import { recordDelivery } from '../../lib/order-state.mjs';
import { syncOrderToWordPress } from '../../lib/wp-tracker-sync.mjs';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node mark-delivered.mjs <slug>');
  process.exit(1);
}

await appendFile(
  path.join(engagementDir(slug), 'status.md'),
  `\n- Delivered to client: yes (${new Date().toISOString()})\n`,
  'utf8'
);

await recordDelivery(slug, 'discover', { method: 'email' }).catch((err) => {
  console.error(`[order-state] recordDelivery failed for "${slug}": ${err.message}`);
});
const syncResult = await syncOrderToWordPress(slug);
if (!syncResult.ok && !syncResult.skipped) {
  console.error(`[wp-tracker] sync failed after delivery for "${slug}": ${syncResult.reason || syncResult.error || syncResult.status}`);
}

process.stdout.write(JSON.stringify({ slug, delivered: true }));
