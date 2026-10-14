#!/usr/bin/env node
/**
 * Receives the connector plugin's callback (scrolly-connector.php),
 * validates the connection token AND the credentials it carries — never
 * accepts an engagement into implementation on trust alone — then stores
 * the credentials and marks the engagement connected.
 *
 * Usage: node register-site-connection.mjs --payload-b64 <base64 JSON>
 *   payload (from the plugin, see scrolly-connector.php's $payload):
 *     { connection_token, site_url, wp_user, wp_app_password, seo_plugin, woocommerce_active }
 * stdout: {"ok": true, "slug": "..."} or {"ok": false, "reason": "..."}
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { timingSafeEqual } from 'node:crypto';
import { storeSiteCredentials } from './lib/site-credentials.mjs';
import { detectPlugin, FIELD_MAPS } from './lib/seo-plugin-adapter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');
const SECRETS_DIR = path.resolve(__dirname, '.secrets');

function getPayloadArg() {
  const idx = process.argv.indexOf('--payload-b64');
  if (idx === -1) return null;
  return Buffer.from(process.argv[idx + 1], 'base64').toString('utf8');
}

function fail(reason) {
  process.stdout.write(JSON.stringify({ ok: false, reason }));
  process.exit(0); // deliberate exit 0 — this is a well-formed "rejected" response, not a crash
}

async function main() {
  const raw = getPayloadArg();
  if (!raw) {
    console.error('Usage: node register-site-connection.mjs --payload-b64 <base64 JSON>');
    process.exit(1);
  }
  const body = JSON.parse(raw);
  const { connection_token, site_url, wp_user, wp_app_password, seo_plugin, woocommerce_active } = body;

  if (!connection_token || !site_url || !wp_user || !wp_app_password) {
    return fail('Missing required field(s) in connector payload.');
  }

  // --- Resolve token -> slug, single-use ------------------------------------
  const indexPath = path.join(SECRETS_DIR, 'connection-tokens-index.json');
  let index;
  try {
    index = JSON.parse(await readFile(indexPath, 'utf8'));
  } catch {
    return fail('No pending connections exist.');
  }
  const slug = index[connection_token];
  if (!slug) return fail('Unknown or already-used connection token.');

  const tokenFilePath = path.join(VAULT_DIR, 'clients', slug, 'implementation', 'connection-token.json');
  const tokenRecord = JSON.parse(await readFile(tokenFilePath, 'utf8'));
  if (tokenRecord.consumedAt) return fail('This connection token has already been used.');
  const a = Buffer.from(tokenRecord.token);
  const b = Buffer.from(connection_token);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return fail('Token mismatch.');

  // --- Real validation, not trust-on-receipt: does auth actually work? -----
  const siteConfig = { baseUrl: site_url, wpUser: wp_user, wpAppPassword: wp_app_password, seoPlugin: seo_plugin };
  let authOk = false;
  let userInfo = null;
  try {
    const token = Buffer.from(`${wp_user}:${wp_app_password}`).toString('base64');
    const res = await fetch(`${site_url.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, { headers: { Authorization: `Basic ${token}` } });
    if (res.ok) {
      authOk = true;
      userInfo = await res.json();
    }
  } catch {
    authOk = false;
  }
  if (!authOk) return fail('Could not authenticate to the site with the provided credentials — the site may be unreachable, or the Application Password may be invalid.');

  // --- Confirm a supported SEO plugin, using the SAME live-detection logic
  // already proven in Realistic V1 (not duplicated, imported) -------------
  let detectedPlugin;
  try {
    detectedPlugin = await detectPlugin(siteConfig);
  } catch (err) {
    return fail(`No supported SEO plugin (Yoast or Rank Math) detected active on this site: ${err.message}`);
  }
  if (!FIELD_MAPS[detectedPlugin]) return fail(`Detected SEO plugin "${detectedPlugin}" is not supported in V1.`);

  // --- All checks passed: store credentials, consume token, update status --
  await storeSiteCredentials(slug, {
    baseUrl: site_url,
    wpUser: wp_user,
    wpAppPassword: wp_app_password,
    seoPlugin: detectedPlugin,
    woocommerceActive: !!woocommerce_active,
  });

  tokenRecord.consumedAt = new Date().toISOString();
  await writeFile(tokenFilePath, JSON.stringify(tokenRecord, null, 2));
  delete index[connection_token];
  await writeFile(indexPath, JSON.stringify(index, null, 2));

  const engagementPath = path.join(VAULT_DIR, 'clients', slug, 'implementation', 'engagement.json');
  const engagement = JSON.parse(await readFile(engagementPath, 'utf8'));
  engagement.intakeStatus = 'connected';
  engagement.connectedAt = new Date().toISOString();
  engagement.detectedSeoPlugin = detectedPlugin;
  engagement.wpUserConnected = userInfo?.name || wp_user;
  await writeFile(engagementPath, JSON.stringify(engagement, null, 2));

  process.stdout.write(JSON.stringify({ ok: true, slug, detectedSeoPlugin: detectedPlugin }));
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
