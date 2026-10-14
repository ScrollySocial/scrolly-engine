/**
 * One-off, idempotent script: creates the $1K Club and $1K Challenge
 * WooCommerce products as DRAFTS (never published) on the live site, using
 * the existing WP_LIVE_APP_USER/WP_LIVE_APP_PASSWORD Application Password
 * (already used for the lead-magnet media uploads and Elementor page edits
 * — see current-state.md's 2026-08-25 entries). WooCommerce's REST API
 * accepts WordPress core auth (Basic auth with an Application Password) for
 * a user with manage_woocommerce capability, so no separate WC consumer
 * key/secret is needed just to create a product.
 *
 * Deliberately does NOT publish/set status:"publish" -- these are new
 * customer-facing offers and publishing them is a founder-approval decision
 * per the standing stop conditions, not something this script decides.
 *
 * Idempotent: searches by exact name first and skips creation if the
 * product already exists, so re-running this is always safe.
 *
 * Usage: node automation/club/scripts/create-club-products.mjs
 */

import 'dotenv/config';

const BASE = process.env.WP_LIVE_BASE_URL;
const USER = process.env.WP_LIVE_APP_USER;
const PASS = process.env.WP_LIVE_APP_PASSWORD;

if (!BASE || !USER || !PASS) {
  console.error('Missing WP_LIVE_BASE_URL / WP_LIVE_APP_USER / WP_LIVE_APP_PASSWORD in automation/.env');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');

async function wc(pathAndQuery, options = {}) {
  const url = `${BASE.replace(/\/$/, '')}/wp-json/wc/v3/${pathAndQuery}`;
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: authHeader, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`WooCommerce API ${res.status} for ${pathAndQuery}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function findByExactName(name) {
  const results = await wc(`products?search=${encodeURIComponent(name)}&per_page=20`);
  return results.find((p) => p.name === name) || null;
}

async function ensureProduct({ name, price, description, shortDescription }) {
  const existing = await findByExactName(name);
  if (existing) {
    console.log(`SKIP (already exists): "${name}" -- WooCommerce product ID ${existing.id}, status ${existing.status}`);
    return existing;
  }
  const created = await wc('products', {
    method: 'POST',
    body: JSON.stringify({
      name,
      type: 'simple',
      status: 'draft', // never auto-publish
      catalog_visibility: 'hidden', // extra belt-and-braces: hidden from shop/search even if status ever flips
      virtual: true,
      regular_price: String(price),
      description,
      short_description: shortDescription,
    }),
  });
  console.log(`CREATED (draft): "${name}" -- WooCommerce product ID ${created.id}`);
  return created;
}

const club = await ensureProduct({
  name: '$1K Club',
  price: 50,
  description: 'Placeholder description -- replace before publishing. The $1K Club helps an online business validate demand and build a practical path to its first/next $1,000 in revenue.',
  shortDescription: 'Validate demand and build a practical path to your first/next $1,000. One-time purchase, yours permanently.',
});

const challenge = await ensureProduct({
  name: '$1K Challenge',
  price: 25,
  description: 'Placeholder description -- replace before publishing. A 30-day guided execution attempt for $1K Club members. Requires an active $1K Club purchase. Does not auto-renew -- each attempt is purchased separately.',
  shortDescription: '30 days of personalized execution support toward your $1K goal. Requires the $1K Club. No auto-renewal.',
});

console.log('\nDone. Both products are DRAFT + hidden -- not visible on the live site until explicitly published.');
console.log(JSON.stringify({ clubProductId: club.id, challengeProductId: challenge.id }, null, 2));
