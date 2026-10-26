// Rename (2026-10-26): upload the The Ambition Department versions of every $1K Club download and point the products at
// them. Each download keeps its id, so existing buyers' links serve the new file. Old media stay in the library (reversible).
// Usage: node downloads/swap-renamed.mjs [--dry]   (from automation/k1-launch). Records the result in downloads/live-media.json.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const { wp } = await import(pathToFileURL(path.resolve(here, '../../../website/scrolly-site/wp-client.mjs')).href);
const dry = process.argv.includes('--dry');
const ED2 = path.resolve(here, '../../../Scrolly Organic Engine/products/1k-club/playbook/edition-2/out');
const DIST = path.join(here, 'dist');
const FILES = [
  { src: path.join(ED2, '1K-Club-Playbook.pdf'), base: '1K-Club-Playbook', name: 'The $1K Club Playbook (PDF)', type: 'application/pdf' },
  { src: path.join(ED2, 'Social-Media-Quality-Tips.pdf'), base: 'Social-Media-Quality-Tips', name: 'Social Media Quality Tips (PDF)', type: 'application/pdf' },
  { src: path.join(ED2, 'Auto-Posting-With-Your-AI.pdf'), base: 'Auto-Posting-With-Your-AI', name: 'Auto-Posting with Your AI (PDF)', type: 'application/pdf' },
  { src: path.join(DIST, 'D-1-Reel-Safe-Zone-Package.zip'), base: 'D-1-Reel-Safe-Zone-Package', name: 'D-1 Reel Safe-Zone Package', type: 'application/zip' },
  { src: path.join(DIST, 'D-2-Carousel-Template-3x4.zip'), base: 'D-2-Carousel-Template-3x4', name: 'D-2 3:4 Carousel Template', type: 'application/zip' },
  { src: path.join(DIST, 'D-3-Instagram-Setup-Checklist.pdf'), base: 'D-3-Instagram-Setup-Checklist', name: 'D-3 Instagram Setup Checklist', type: 'application/pdf' },
  { src: path.join(DIST, 'D-4-Printable-Worksheets.pdf'), base: 'D-4-Printable-Worksheets', name: 'D-4 Printable Worksheets', type: 'application/pdf' },
];
const TARGETS = [['/products/279/variations/582', 'Club only'], ['/products/279/variations/583', 'Club + Challenge'], ['/products/280', 'Challenge re-attempt']];

for (const f of FILES) if (!fs.existsSync(f.src)) throw new Error(`missing ${f.src}`);
// Every download name on the products must have a new file, so nothing is left on an old version by accident.
for (const [ep] of TARGETS) {
  const cur = (await wp(`/wp-json/wc/v3${ep}`)).json;
  for (const d of cur.downloads) if (!FILES.some((f) => f.name === d.name)) throw new Error(`${ep}: no new file for "${d.name}"`);
}
if (dry) { console.log('dry run: all files present, every product download has a new file'); process.exit(0); }

const up = {};
for (const f of FILES) {
  const ext = path.extname(f.src);
  const fname = `${f.base}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const r = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': f.type, 'Content-Disposition': `attachment; filename="${fname}"` }, body: fs.readFileSync(f.src) });
  if (!r.json.id) throw new Error(`upload failed for ${f.name}: ${r.status} ${JSON.stringify(r.json).slice(0, 200)}`);
  up[f.name] = { media: r.json.id, file: r.json.source_url, name: f.name };
  console.log('uploaded', r.json.id, f.name);
}
for (const [ep, label] of TARGETS) {
  const cur = (await wp(`/wp-json/wc/v3${ep}`)).json;
  const dls = cur.downloads.map((d) => ({ id: d.id, name: d.name, file: up[d.name].file }));
  const r = await wp(`/wp-json/wc/v3${ep}`, { method: 'PUT', body: JSON.stringify({ downloads: dls }) });
  console.log(`${label}: ${r.status}`);
  for (const d of r.json.downloads || []) console.log(`  - ${d.name} | ${d.file.split('/').pop()}`);
}
fs.writeFileSync(path.join(here, 'live-media.json'), JSON.stringify(Object.values(up), null, 1));
console.log('recorded in live-media.json');
