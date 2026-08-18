#!/usr/bin/env node
// Local dev utility: render demo-report.md through the same md-to-pdf config
// run-discover.mjs's renderPdf() uses, without running the full agent
// pipeline (no Anthropic/DataForSEO spend). Re-run after any CSS change:
//   node report-theme/test-render.mjs
import { mdToPdf } from 'md-to-pdf';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const themeDir = path.dirname(fileURLToPath(import.meta.url));
const mdPath = path.join(themeDir, 'demo-report.md');
const pdfPath = path.join(themeDir, 'demo-report.pdf');
const stylesheet = path.join(themeDir, 'scrolly-report.css');

const displayName = 'Mulberry Creek Nursery & Landscaping';
const renderDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const pdfConfig = {
  dest: pdfPath,
  document_title: `${displayName} — Organic Search Opportunity Report`,
  stylesheet: [stylesheet],
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
  console.log('Rendered:', pdfPath);
} catch (err) {
  console.error('FAILED:', err?.stack || err);
  process.exit(1);
}
