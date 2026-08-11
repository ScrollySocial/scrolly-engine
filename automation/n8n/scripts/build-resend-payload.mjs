#!/usr/bin/env node
/**
 * Builds a ready-to-POST Resend API JSON body for one of the two pipeline
 * emails, so the n8n workflow only has to HTTP Request it — no templating
 * or file reads inside n8n itself.
 *
 * Usage:
 *   node build-resend-payload.mjs operator-review <slug>
 *   node build-resend-payload.mjs client-delivery <slug>
 *
 * Required env: RESEND_FROM_EMAIL, SENDER_DISPLAY_NAME.
 * operator-review additionally requires OPERATOR_EMAIL and
 * N8N_APPROVE_AND_SEND_WEBHOOK_URL (to build the one-click approve link —
 * this script mints the token itself via mint-approve-token's logic inline).
 *
 * stdout: the full JSON body for POST https://api.resend.com/emails
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { AUTOMATION_DIR, engagementDir } from './_paths.mjs';

const [mode, slug] = process.argv.slice(2);
if (!mode || !slug || !['operator-review', 'client-delivery'].includes(mode)) {
  console.error('Usage: node build-resend-payload.mjs <operator-review|client-delivery> <slug>');
  process.exit(1);
}

const dir = engagementDir(slug);

async function readJsonSafe(p, fallback = {}) {
  try {
    return JSON.parse(await readFile(p, 'utf8'));
  } catch {
    return fallback;
  }
}

async function readTextSafe(p, fallback = '') {
  try {
    return await readFile(p, 'utf8');
  } catch {
    return fallback;
  }
}

function fillTemplate(html, vars) {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] != null ? String(vars[key]) : ''));
}

async function attachmentFromPdf(filePath, filename) {
  try {
    const buf = await readFile(filePath);
    return { filename, content: buf.toString('base64') };
  } catch {
    return null; // PDF may not exist yet (e.g. render failed) — omit rather than fail the send
  }
}

const contact = await readJsonSafe(path.join(dir, 'contact.json'));
const businessName = contact.businessName || slug;

const reportPdfPath = path.join(dir, 'report.pdf');
const appendixPdfPath = path.join(dir, 'appendix.pdf');

if (mode === 'operator-review') {
  const runResult = await readJsonSafe(path.join(dir, 'run-result.json'));
  const statusText = await readTextSafe(path.join(dir, 'status.md'));

  const qualityGateStatus = runResult.quality_gate_ran
    ? runResult.ceiling_hit
      ? 'Ran — ceiling-limited (DataForSEO call cap reached)'
      : 'Ran'
    : 'NOT RUN — do not send without reviewing manually';

  const gapMatches = [...statusText.matchAll(/(.+Not Evaluated.+)/gi)].map((m) => m[1].trim());
  const gapSummary = gapMatches.length ? gapMatches.slice(0, 15).join('; ') : 'None recorded in status.md';

  const templateHtml = await readTextSafe(
    path.join(AUTOMATION_DIR, 'email-templates', 'operator-review.html'),
    '<p>Report ready for {{business_name}}. Approve: {{approve_url}}</p>'
  );

  // Mint a single-use approval token inline (same mechanism as
  // mint-approve-token.mjs) so this one script produces a complete,
  // ready-to-send payload.
  const token = randomBytes(24).toString('hex');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'approve-token.txt'), token, 'utf8');

  const approveBase = process.env.N8N_APPROVE_AND_SEND_WEBHOOK_URL || '';
  const approveUrl = `${approveBase}${approveBase.includes('?') ? '&' : '?'}slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`;

  const html = fillTemplate(templateHtml, {
    business_name: businessName,
    slug,
    mode: runResult.mode || 'See status.md',
    quality_gate_status: qualityGateStatus,
    gap_summary: gapSummary,
    dataforseo_enabled: String(runResult.dataforseo_enabled),
    approve_url: approveUrl,
    report_pdf_url: `(attached — report.pdf)`,
    appendix_pdf_url: `(attached — appendix.pdf)`,
  });

  const attachments = (
    await Promise.all([
      attachmentFromPdf(reportPdfPath, 'report.pdf'),
      attachmentFromPdf(appendixPdfPath, 'appendix.pdf'),
    ])
  ).filter(Boolean);

  const body = {
    from: `${process.env.SENDER_DISPLAY_NAME || 'Scrolly Automation'} <${process.env.RESEND_FROM_EMAIL}>`,
    to: [process.env.OPERATOR_EMAIL],
    subject: `Discover report ready for review — ${businessName}`,
    html,
    attachments,
  };

  process.stdout.write(JSON.stringify(body));
} else {
  const templateHtml = await readTextSafe(
    path.join(AUTOMATION_DIR, 'email-templates', 'client-delivery.html'),
    '<p>Hi {{contact_name}}, your report for {{business_name}} is attached.</p>'
  );

  const html = fillTemplate(templateHtml, {
    contact_name: contact.contactName || 'there',
    business_name: businessName,
    sender_name: process.env.SENDER_DISPLAY_NAME || '',
  });

  const attachments = (
    await Promise.all([
      attachmentFromPdf(reportPdfPath, 'report.pdf'),
      attachmentFromPdf(appendixPdfPath, 'appendix.pdf'),
    ])
  ).filter(Boolean);

  if (!contact.contactEmail) {
    console.error(`No contact.json / contactEmail found for slug "${slug}" — cannot address the delivery email.`);
    process.exit(1);
  }

  const body = {
    from: `${process.env.SENDER_DISPLAY_NAME || 'Scrolly Social'} <${process.env.RESEND_FROM_EMAIL}>`,
    to: [contact.contactEmail],
    subject: `Your SEO Discovery Report is ready — ${businessName}`,
    html,
    attachments,
  };

  process.stdout.write(JSON.stringify(body));
}
