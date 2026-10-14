#!/usr/bin/env node
/**
 * Reads a raw Tally webhook payload from stdin, creates
 * clients/<slug>/discover/ from methodology/engagement-template/, and writes
 * input.md populated from the submission — mirroring engagement-template's
 * section layout. Unanswered fields are left blank, never guessed, per
 * discover.md's O1 rules.
 *
 * Called from the "Intake & Kickoff" n8n workflow AFTER the WooCommerce order
 * has already been verified as paid — this script does not itself check payment.
 *
 * stdout (on success): {"slug": "...", "engagementDir": "...", "businessName": "...", "contactEmail": "...", "contactName": "..."}
 * Exits non-zero with an error message on stderr on failure.
 */
import { mkdir, readdir, copyFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { CLIENTS_DIR, TEMPLATE_DIR, engagementDir } from './_paths.mjs';
import { recordIntakeReceived } from '../../lib/order-state.mjs';
import { syncOrderToWordPress } from '../../lib/wp-tracker-sync.mjs';

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

// MULTIPLE_CHOICE/CHECKBOXES/DROPDOWN fields carry option-UUIDs as their value
// with a separate `options: [{id, text}]` array for the id -> label lookup —
// resolve through it so input.md gets "Leads", not "9866a536-...".
function resolveOptionText(f, rawValue) {
  const options = Array.isArray(f.options) ? f.options : null;
  if (!options) return rawValue;
  const match = options.find((o) => o.id === rawValue);
  return match ? match.text : rawValue;
}

// Normalized-label -> value lookup, tolerant of minor label edits.
function buildFieldMap(fields) {
  const map = new Map();
  for (const f of fields || []) {
    const key = String(f.label || '').trim().toLowerCase();
    let value = f.value;
    if (Array.isArray(value)) {
      value = value.map((v) => resolveOptionText(f, v)).join(', '); // multi-select answers
    } else {
      value = resolveOptionText(f, value);
    }
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
    // Textarea answers can contain literal newlines, which would otherwise
    // break a "- label: value" line into a second, unprefixed markdown line.
    .map(([label, value]) => `- ${label}: ${(value || '').replace(/\r?\n+/g, ' / ')}`)
    .join('\n');
  return `## ${title}\n${body}\n`;
}

function buildInputMd(businessName, map, contactName, contactEmail) {
  const parts = [];
  parts.push(`# Discover Input — ${businessName}\n`);

  // Each `get()` call below tries tally-form-spec.md's original Section wording
  // first, then the live form's actual (differently-worded) question — the live
  // form predates the spec doc and was never rebuilt to match it exactly.
  parts.push(
    section('Absolute Minimum Required Intake (O1/O2 — the only hard requirement for the $299 product)', [
      ['Website/domain (leave blank if none)', get(map, 'website / domain', 'website/domain', 'website', 'website (optional)')],
      ['Physical location(s), if the business is local/regional', get(map, 'physical location(s), if local/regional', 'physical location(s)', 'physical location (s)')],
    ])
  );

  parts.push(
    section("Optional, Helpful (improves O1's confirmed tier and O2's confidence)", [
      ['Short business description', get(map, 'short business description', 'business description')],
      ['Known service area / radius, if the client has one in mind', get(map, 'known service area / radius', 'service area (towns/regions you serve or specifically exclude)')],
      ['Products/services the client most wants to grow (soft O10 priority signal)', get(map, 'products/services you most want to grow', 'products or services you most want to grow')],
      ['Markets definitely served', get(map, 'markets definitely served')],
      ['Markets definitely excluded', get(map, 'markets definitely excluded')],
      ['Target customers', get(map, 'target customers')],
      ['Business model', get(map, 'business model', 'how do you sell to customers?')],
      ['Main desired outcome (calls / leads / bookings / store visits / ecommerce sales / revenue / awareness)', get(map, 'main desired outcome')],
      ['Current marketing channels', get(map, 'current marketing channels')],
      ['Current marketing budget', get(map, 'current marketing budget')],
      ['Known business constraints', get(map, 'known business constraints')],
      ['Seasonality', get(map, 'seasonality', 'seasonality of your products/services')],
      [
        'Brand/business-structure considerations',
        get(
          map,
          'brand/business-structure considerations (do related service lines share one site or operate separately?)',
          'brand/business-structure considerations',
          'is this the only website for your business, or do you have separate sites for different services?'
        ),
      ],
      ['Google Business Profile access/status', get(map, 'google business profile access/status', 'google business profile access')],
      ['Google Search Console access/status', get(map, 'google search console access/status', 'google search console access')],
      ['GA4 access/status', get(map, 'ga4 access/status', 'ga4 access')],
      [
        'Existing call/form/conversion tracking',
        get(map, 'existing call/form/conversion tracking (what, if anything)', 'existing call/form/conversion tracking', 'existing call/form/conversion tracking if any'),
      ],
    ])
  );

  parts.push(
    section("Enhanced Optional Intake (improves O8's business-value modeling only — never required)", [
      ['Detailed inventory / product categories', get(map, 'detailed inventory / product categories', 'detailed inventory or product categories')],
      ['Best sellers', get(map, 'best sellers')],
      ['Highest-value / highest-margin products or services', get(map, 'highest-value / highest-margin products or services', 'highest-value or highest-margin products/services')],
      ['Average transaction/project values', get(map, 'average transaction/project value', 'average transaction/project values', 'average transaction or project value')],
      ['Margins', get(map, 'margins')],
      ['Conversion/close rate', get(map, 'conversion/close rate', 'conversion or close rate')],
      ['Capacity constraints', get(map, 'capacity constraints')],
    ])
  );

  parts.push(section('Niche', [['Category/niche', get(map, 'category/niche', 'category or niche')]]));

  parts.push(
    section('Optional Client-Provided Context', [
      ['Named competitors (signal only, not verified)', get(map, 'named competitors, if any (signal only, not verified)', 'named competitors', 'named competitors if any')],
      [
        'Known site history (redesigns, migrations, past issues)',
        get(map, 'known site history (redesigns, migrations, past issues)', 'known site history such as redesigns migrations past issues'),
      ],
      ['Hard constraints (e.g., domain is fixed, excluded services/categories)', get(map, 'hard constraints (e.g., domain is fixed, excluded services/categories)', 'hard constraints')],
    ])
  );

  parts.push(
    section('Contact (operational — not part of the Discover schema)', [
      ['Contact name', contactName],
      ['Contact email', contactEmail],
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
  // The live Tally form (tally.so/r/D4OVlE) asks "Your Name" / "Email Address",
  // not the "Contact name" / "Contact email" wording tally-form-spec.md's
  // Section 0 describes — both accepted so older/spec-matching payloads still work.
  const contactName = get(map, 'contact name', 'your name');
  const contactEmail = get(map, 'contact email', 'email address');

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

  await writeFile(path.join(dir, 'input.md'), buildInputMd(businessName, map, contactName, contactEmail), 'utf8');

  // Persisted separately from input.md because delivery (build-resend-payload.mjs)
  // needs it long after intake, and input.md's format is governed by the
  // Discover methodology, not by delivery's needs.
  await writeFile(
    path.join(dir, 'contact.json'),
    JSON.stringify(
      {
        businessName,
        contactName,
        contactEmail,
        orderId: payload?.data?.fields ? get(map, 'order_id') : undefined,
        orderKey: payload?.data?.fields ? get(map, 'order_key') : undefined,
        // Raw Tally self-report status, read by build-resend-payload.mjs's
        // access-request mode to decide which (if any) access to ask for.
        accessStatus: {
          gbp: get(map, 'google business profile access/status', 'google business profile access'),
          gsc: get(map, 'google search console access/status', 'google search console access'),
          ga4: get(map, 'ga4 access/status', 'ga4 access'),
        },
      },
      null,
      2
    ),
    'utf8'
  );

  // Real intake->ready-to-run transition (see order-state.mjs's
  // recordIntakeReceived doc comment). Best-effort sync afterward -- a
  // WordPress/network failure here must never break intake itself.
  const orderId = get(map, 'order_id') || undefined;
  const orderKey = get(map, 'order_key') || undefined;
  await recordIntakeReceived(slug, 'discover', { orderId, orderKey, businessName, contactName, contactEmail });
  const syncResult = await syncOrderToWordPress(slug);
  if (!syncResult.ok && !syncResult.skipped) {
    console.error(`[wp-tracker] sync failed after intake for "${slug}": ${syncResult.reason || syncResult.error || syncResult.status}`);
  }

  process.stdout.write(
    JSON.stringify({ slug, engagementDir: dir, businessName, contactName, contactEmail })
  );
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
