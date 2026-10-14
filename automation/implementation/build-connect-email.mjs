#!/usr/bin/env node
/**
 * Builds the ready-to-POST Resend payload for the post-purchase
 * "connect your site" email — the implementation-track sibling of
 * n8n/scripts/build-resend-payload.mjs (kept separate rather than
 * extending that script, since it's hardwired to the Discover
 * engagement's clients/<slug>/discover/ path, not implementation's).
 *
 * Usage: node build-connect-email.mjs <slug>
 * Required env: RESEND_FROM_EMAIL, SENDER_DISPLAY_NAME,
 *   SCROLLY_CONNECTOR_PLUGIN_URL, SCROLLY_CONNECTOR_CALLBACK_URL
 * stdout: the full JSON body for POST https://api.resend.com/emails
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');
const AUTOMATION_DIR = path.resolve(__dirname, '..');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node build-connect-email.mjs <slug>');
  process.exit(1);
}

function fillTemplate(html, vars) {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] != null ? String(vars[key]) : ''));
}

const implDir = path.join(VAULT_DIR, 'clients', slug, 'implementation');
const engagement = JSON.parse(await readFile(path.join(implDir, 'engagement.json'), 'utf8'));
const tokenRecord = JSON.parse(await readFile(path.join(implDir, 'connection-token.json'), 'utf8'));
const template = await readFile(path.join(AUTOMATION_DIR, 'email-templates', 'implementation-connect-site.html'), 'utf8');

const html = fillTemplate(template, {
  contactName: engagement.contactName || 'there',
  businessName: engagement.businessName,
  pluginDownloadUrl: process.env.SCROLLY_CONNECTOR_PLUGIN_URL || '',
  connectionToken: tokenRecord.token,
  callbackUrl: process.env.SCROLLY_CONNECTOR_CALLBACK_URL || '',
});

process.stdout.write(
  JSON.stringify({
    from: `${process.env.SENDER_DISPLAY_NAME || 'Scrolly'} <${process.env.RESEND_FROM_EMAIL}>`,
    to: [engagement.contactEmail],
    subject: `Connect your site to start your SEO implementation — ${engagement.businessName}`,
    html,
  })
);
