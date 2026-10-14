#!/usr/bin/env node
/**
 * Creates the implementation-track engagement folder and mints the
 * one-time connection token the connector plugin exchanges for a
 * registered site connection (see connector-plugin/scrolly-connector.php).
 *
 * Mirrors n8n/scripts/create-engagement.mjs's shape (slug-based,
 * folder-per-engagement) but for the implementation product — kept as a
 * separate script rather than modified into the existing one, since the
 * two products have genuinely different intake needs (this one has no
 * Tally-field parsing, and needs a distinct WC product ID / price check).
 *
 * Usage: node create-implementation-engagement.mjs --payload-b64 <base64 JSON>
 *   payload: { orderId, orderKey, businessName, contactEmail, contactName, existingDiscoverSlug? }
 * stdout: {"slug": "...", "connectionToken": "...", "engagementDir": "..."}
 */
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');
const CLIENTS_DIR = path.join(VAULT_DIR, 'clients');
const SECRETS_DIR = path.resolve(__dirname, '.secrets');

function getPayloadArg() {
  const idx = process.argv.indexOf('--payload-b64');
  if (idx === -1) return null;
  return Buffer.from(process.argv[idx + 1], 'base64').toString('utf8');
}

function slugify(name) {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unnamed';
}

async function uniqueSlug(base) {
  let candidate = base;
  let n = 2;
  while (true) {
    try {
      await access(path.join(CLIENTS_DIR, candidate));
      candidate = `${base}-${n}`;
      n += 1;
    } catch {
      return candidate;
    }
  }
}

async function main() {
  const raw = getPayloadArg();
  if (!raw) {
    console.error('Usage: node create-implementation-engagement.mjs --payload-b64 <base64 JSON>');
    process.exit(1);
  }
  const payload = JSON.parse(raw);
  const { orderId, orderKey, businessName, contactEmail, contactName, existingDiscoverSlug } = payload;

  if (!businessName || !contactEmail || !orderId) {
    console.error('Missing required field(s): businessName, contactEmail, orderId.');
    process.exit(1);
  }

  // Reuse the Discover engagement's slug if this customer already has one
  // (they bought the audit first) — keeps findings.json, all Discover
  // artifacts, and the implementation artifacts under one folder, matching
  // how the rest of this system already treats a slug as "the engagement."
  const slug = existingDiscoverSlug || (await uniqueSlug(slugify(businessName)));

  const implDir = path.join(CLIENTS_DIR, slug, 'implementation');
  await mkdir(implDir, { recursive: true });

  const connectionToken = randomBytes(24).toString('hex');

  await writeFile(
    path.join(implDir, 'engagement.json'),
    JSON.stringify(
      {
        slug,
        productType: 'implementation',
        orderId,
        orderKey,
        businessName,
        contactName: contactName || null,
        contactEmail,
        createdAt: new Date().toISOString(),
        intakeStatus: 'awaiting_site_connection',
      },
      null,
      2
    )
  );

  await writeFile(path.join(implDir, 'connection-token.json'), JSON.stringify({ token: connectionToken, slug, mintedAt: new Date().toISOString(), consumedAt: null }, null, 2));

  // Small index so register-site-connection.mjs can resolve token -> slug
  // without scanning every client folder. Lives in .secrets/ alongside
  // credentials — not a secret itself, but co-located gitignored state.
  await mkdir(SECRETS_DIR, { recursive: true });
  const indexPath = path.join(SECRETS_DIR, 'connection-tokens-index.json');
  let index = {};
  try {
    index = JSON.parse(await readFile(indexPath, 'utf8'));
  } catch {
    index = {};
  }
  index[connectionToken] = slug;
  await writeFile(indexPath, JSON.stringify(index, null, 2));

  process.stdout.write(JSON.stringify({ slug, connectionToken, engagementDir: implDir }));
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
