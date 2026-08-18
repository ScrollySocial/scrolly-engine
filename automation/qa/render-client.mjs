#!/usr/bin/env node
// One-off/manual PDF re-render for an existing client engagement, using the
// exact same mdToPdf config as runner/run-discover.mjs's renderPdf()
// function, without running the full agent pipeline (no Anthropic/DataForSEO
// spend). Useful after hand-editing report.md/appendix.md directly.
//
// Usage: node automation/qa/render-client.mjs <client-slug>
import { mdToPdf } from 'md-to-pdf';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node automation/qa/render-client.mjs <client-slug>');
  process.exit(1);
}

const engagementDir = path.join(VAULT_DIR, 'clients', slug, 'discover');
const REPORT_STYLESHEET = path.resolve(__dirname, '..', 'report-theme', 'scrolly-report.css');
const displayName = slug
  .split(/[-_]+/)
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ');
const renderDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

async function renderPdf(mdName, pdfName) {
  const mdPath = path.join(engagementDir, mdName);
  const pdfPath = path.join(engagementDir, pdfName);
  if (!existsSync(mdPath)) {
    console.log(`Skipping ${mdName} — does not exist.`);
    return false;
  }
  const pdfConfig = {
    dest: pdfPath,
    document_title: `${displayName} — Organic Search Opportunity Report`,
    stylesheet: [REPORT_STYLESHEET],
    pdf_options: {
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.75in', bottom: '0.75in', left: '0.6in', right: '0.6in' },
      displayHeaderFooter: true,
      headerTemplate:
        '<div style="font-family:Arial,sans-serif;font-size:7px;color:#5c6478;width:100%;text-align:center;padding-top:6px;">ScrollySEO | Organic Search Opportunity Report</div>',
      footerTemplate:
        `<div style="font-family:Arial,sans-serif;font-size:7px;color:#5c6478;width:100%;text-align:center;padding-bottom:6px;">${displayName} &bull; Confidential &bull; ${renderDate} &bull; Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
    },
  };
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (existsSync(edgePath)) {
    pdfConfig.launch_options = { executablePath: edgePath };
  }
  try {
    await mdToPdf({ path: mdPath }, pdfConfig);
    console.log(`Rendered ${pdfName}`);
    return true;
  } catch (err) {
    console.error(`FAILED ${mdName}:`, err?.stack || err);
    return false;
  }
}

await renderPdf('report.md', 'report.pdf');
await renderPdf('appendix.md', 'appendix.pdf');
