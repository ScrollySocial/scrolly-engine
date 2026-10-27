// v3 covers (2026-10-27): upload the rebuilt Playbook and Quality Tips PDFs and point the $1K products at them. Only those two
// downloads change; each keeps its id, so existing buyers' links serve the new file. Old media stay in the library.
// Usage: node downloads/swap-v3-covers.mjs   (from automation/k1-launch). Updates downloads/live-media.json.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const { wp } = await import(pathToFileURL(path.resolve(here, '../../../website/scrolly-site/wp-client.mjs')).href);
const ED2 = path.resolve(here, '../../../Scrolly Organic Engine/products/1k-club/playbook/edition-2/out');
const FILES = [
  { src: path.join(ED2, '1K-Club-Playbook.pdf'), base: '1K-Club-Playbook', name: 'The $1K Club Playbook (PDF)' },
  { src: path.join(ED2, 'Social-Media-Quality-Tips.pdf'), base: 'Social-Media-Quality-Tips', name: 'Social Media Quality Tips (PDF)' },
];
const TARGETS = [['/products/279/variations/582', 'Club only'], ['/products/279/variations/583', 'Club + Challenge'], ['/products/280', 'Challenge re-attempt']];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// The host sometimes answers 502 even though the request went through, so check before retrying.
async function get(u) { for (let i = 0; i < 5; i++) { const r = await wp(u); if (r.status === 200) return r.json; await sleep(12000); } throw new Error('gave up ' + u); }

const up = {};
for (const f of FILES) {
  const fname = `${f.base}-${crypto.randomBytes(8).toString('hex')}.pdf`;
  let m;
  for (let i = 1; i <= 3 && !m; i++) {
    const r = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${fname}"` }, body: fs.readFileSync(f.src) });
    if (r.json?.id) m = r.json;
    else { console.log(`upload try ${i} for ${f.base}: ${r.status}`); await sleep(15000); m = (await get(`/wp-json/wp/v2/media?search=${fname.replace('.pdf', '')}`))[0]; }
  }
  if (!m) throw new Error('upload failed for ' + f.name);
  up[f.name] = { media: m.id, file: m.source_url, name: f.name };
  console.log('uploaded', m.id, f.name, m.source_url);
}
for (const [ep, label] of TARGETS) {
  const cur = await get(`/wp-json/wc/v3${ep}`);
  const dls = cur.downloads.map((d) => ({ id: d.id, name: d.name, file: up[d.name]?.file || d.file }));
  const r = await wp(`/wp-json/wc/v3${ep}`, { method: 'PUT', body: JSON.stringify({ downloads: dls }) });
  const back = await get(`/wp-json/wc/v3${ep}`);
  console.log(`${label}: ${r.status}`);
  for (const d of back.downloads) console.log(`  - ${d.name} | ${d.file.split('/').pop()}`);
}
const recPath = path.join(here, 'live-media.json');
const rec = JSON.parse(fs.readFileSync(recPath, 'utf8')).map((x) => up[x.name] || x);
fs.writeFileSync(recPath, JSON.stringify(rec, null, 1));
console.log('recorded in live-media.json');
