#!/usr/bin/env node
/**
 * Reads a raw Tally webhook payload from stdin, creates
 * clients/<slug>/discover/ from methodology/engagement-template/, and writes
 * input.md populated from the submission — mirroring engagement-template's
 * section layout. Unanswered fields are left blank, never guessed, per
 * discover.md's O1 rules.
 *
 * Called from the "Intake & Kickoff" n8n workflow AFTER Stripe payment has
 * already been verified — this script does not itself check payment.
 *
 * stdout (on success): {"slug": "...", "engagementDir": "...", "businessName": "...", "contactEmail": "...", "contactName": "..."}
 * Exits non-zero with an error message on stderr on failure.
 */
import { mkdir, readdir, copyFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { CLIENTS_DIR, TEMPLATE_DIR, engagementDir } from './_paths.mjs';

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

// n8n's Execute Command node has no native stdin wiring, so the workflow
// passes the webhook body base64-encoded as an argument instead — avoids
// shell-quoting a large arbitrary JSON blob. Stdin still works for local
// testing/dry runs (see automation's smoke-test notes).
function getPayloadArg() {
  const idx = process.argv.indexOf('--payload-b64');
  if (idx === -1) return null;
  const b64 = process.argv[idx + 1];
  if (!b64) return null;
  return Buffer.from(b64, 'base64').toString('utf8');
}

function slugify(name) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unnamed'
  );
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
      return candidate; // doesn't exist yet
    }
  }
}

// Normalized-label -> value lookup, tolerant of minor label edits.
function buildFieldMap(fields) {
  const map = new Map();
  for (const f of fields || []) {
    const key = String(f.label || '').trim().toLowerCase();
    let value = f.value;
    if (Array.isArray(value)) value = value.join(', '); // multi-select answers
    map.set(key, value == null ? '' : String(value).trim());
  }
  return map;
}

function get(map, ...labels) {
  for (const label of labels) {
    const v = map.get(label.toLowerCase());
    if (v) return v;
  }
  return '';
}

function section(title, rows) {
  const body = rows
    .map(([label, value]) => `- ${label}: ${value || ''}`)
    .join('\n');
  return `## ${title}\n${body}\n`;
}

function buildInputMd(businessName, map) {
  const parts = [];
  parts.push(`# Discover Input — ${businessName}\n`);

  parts.push(
    section('Absolute Minimum Required Intake (O1/O2 — the only hard requirement for the $299 product)', [
      ['Website/domain (leave blank if none)', get(map, 'website / domain', 'website/domain', 'website')],
      ['Physical location(s), if the business is local/regional', get(map, 'physical location(s), if local/regional', 'physical location(s)')],
    ])
  );

  parts.push(
    section("Optional, Helpful (improves O1's confirmed tier and O2's confidence)", [
      ['Short business description', get(map, 'short business description')],
      ['Known service area / radius, if the client has one in mind', get(map, 'known service area / radius')],
      ['Products/services the client most wants to grow (soft O10 priority signal)', get(map, 'products/services you most want to grow')],
      ['Markets definitely served', get(map, 'markets definitely served')],
      ['Markets definitely excluded', get(map, 'markets definitely excluded')],
      ['Target customers', get(map, 'target customers')],
      ['Business model', get(map, 'business model')],
      ['Main desired outcome (calls / leads / bookings / store visits / ecommerce sales / revenue / awareness)', get(map, 'main desired outcome')],
      ['Current marketing channels', get(map, 'current marketing channels')],
      ['Current marketing budget', get(map, 'current marketing budget')],
      ['Known business constraints', get(map, 'known business constraints')],
      ['Seasonality', get(map, 'seasonality')],
      ['Brand/business-structure considerations', get(map, 'brand/business-structure considerations (do related service lines share one site or operate separately?)', 'brand/business-structure considerations')],
      ['Google Business Profile access/status', get(map, 'google business profile access/status')],
      ['Google Search Console access/status', get(map, 'google search console access/status')],
      ['GA4 access/status', get(map, 'ga4 access/status')],
      ['Existing call/form/conversion tracking', get(map, 'existing call/form/conversion tracking (what, if anything)', 'existing call/form/conversion tracking')],
    ])
  );

  parts.push(
    section("Enhanced Optional Intake (improves O8's business-value modeling only — never required)", [
      ['Detailed inventory / product categories', get(map, 'detailed inventory / product categories')],
      ['Best sellers', get(map, 'best sellers')],
      ['Highest-value / highest-margin products or services', get(map, 'highest-value / highest-margin products or services')],
      ['Average transaction/project values', get(map, 'average transaction/project value', 'average transaction/project values')],
      ['Margins', get(map, 'margins')],
      ['Conversion/close rate', get(map, 'conversion/close rate')],
      ['Capacity constraints', get(map, 'capacity constraints')],
    ])
  );

  parts.push(section('Niche', [['Category/niche', get(map, 'category/niche')]]));

  parts.push(
    section('Optional Client-Provided Context', [
      ['Named competitors (signal only, not verified)', get(map, 'named competitors, if any (signal only, not verified)', 'named competitors')],
      ['Known site history (redesigns, migrations, past issues)', get(map, 'known site history (redesigns, migrations, past issues)')],
      ['Hard constraints (e.g., domain is fixed, excluded services/categories)', get(map, 'hard constraints (e.g., domain is fixed, excluded services/categories)')],
    ])
  );

  parts.push(
    section('Contact (operational — not part of the Discover schema)', [
      ['Contact name', get(map, 'contact name')],
      ['Contact email', get(map, 'contact email')],
    ])
  );

  return parts.join('\n');
}

async function main() {
  const raw = getPayloadArg() ?? (await readStdin());
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    console.error(`Invalid JSON on stdin: ${err.message}`);
    process.exit(1);
  }

  const fields = payload?.data?.fields;
  if (!Array.isArray(fields)) {
    console.error('Payload missing data.fields — is this a Tally FORM_RESPONSE webhook body?');
    process.exit(1);
  }

  const map = buildFieldMap(fields);
  const businessName = get(map, 'business name');
  const contactName = get(map, 'contact name');
  const contactEmail = get(map, 'contact email');

  if (!businessName) {
    console.error('Missing required field "Business name" in submission.');
    process.exit(1);
  }
  if (!contactEmail) {
    console.error('Missing required field "Contact email" in submission.');
    process.exit(1);
  }

  const slug = await uniqueSlug(slugify(businessName));
  const dir = engagementDir(slug);
  await mkdir(dir, { recursive: true });

  const templateFiles = await readdir(TEMPLATE_DIR);
  for (const file of templateFiles) {
    if (file === 'input.md') continue; // written below with real content
    await copyFile(path.join(TEMPLATE_DIR, file), path.join(dir, file));
  }

  await writeFile(path.join(dir, 'input.md'), buildInputMd(businessName, map), 'utf8');

  // Persisted separately from input.md because delivery (build-resend-payload.mjs)
  // needs it long after intake, and input.md's format is governed by the
  // Discover methodology, not by delivery's needs.
  await writeFile(
    path.join(dir, 'contact.json'),
    JSON.stringify({ businessName, contactName, contactEmail, sessionId: payload?.data?.fields ? get(map, 'session_id') : undefined }, null, 2),
    'utf8'
  );

  process.stdout.write(
    JSON.stringify({ slug, engagementDir: dir, businessName, contactName, contactEmail })
  );
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
