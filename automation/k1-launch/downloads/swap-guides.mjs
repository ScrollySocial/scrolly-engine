// Upload the new Playbook and Quality Tips PDFs and attach them to the $1K Club variations (582 Club only, 583 Club + Challenge).
// The Playbook entry keeps its download id (existing buyers' links serve the new file); Quality Tips is added as a new download.
// Usage: node downloads/swap-guides.mjs     (from automation/k1-launch). Records the result in downloads/live-media.json.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const { wp } = await import(pathToFileURL(path.resolve(here, '../../../website/scrolly-site/wp-client.mjs')).href);
const ED2 = path.resolve(here, '../../../Scrolly Organic Engine/products/1k-club/playbook/edition-2/out');
const FILES = [
  { key: 'playbook', src: path.join(ED2, '1K-Club-Playbook.pdf'), base: '1K-Club-Playbook-ed2', name: 'The $1K Club Playbook (PDF)' },
  { key: 'tips', src: path.join(ED2, 'Social-Media-Quality-Tips.pdf'), base: 'Social-Media-Quality-Tips', name: 'Social Media Quality Tips (PDF)' },
];
const up = {};
for (const f of FILES) {
  const fname = `${f.base}-${crypto.randomBytes(8).toString('hex')}.pdf`;
  fs.copyFileSync(f.src, path.join(here, 'dist', path.basename(f.src)));
  const r = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${fname}"` }, body: fs.readFileSync(f.src) });
  if (!r.json.id) throw new Error(`upload failed for ${f.key}: ${r.status} ${JSON.stringify(r.json).slice(0, 200)}`);
  up[f.key] = { media: r.json.id, file: r.json.source_url, name: f.name };
  console.log('uploaded', f.key, r.json.id, r.json.source_url);
}
for (const v of [582, 583]) {
  const cur = await wp(`/wp-json/wc/v3/products/279/variations/${v}`);
  const dls = cur.json.downloads.map(d => d.name === up.playbook.name ? { id: d.id, name: d.name, file: up.playbook.file } : { id: d.id, name: d.name, file: d.file });
  if (!dls.some(d => d.name === up.tips.name)) dls.splice(1, 0, { name: up.tips.name, file: up.tips.file });
  const r = await wp(`/wp-json/wc/v3/products/279/variations/${v}`, { method: 'PUT', body: JSON.stringify({ downloads: dls }) });
  console.log(`variation ${v}: ${r.status}`);
  for (const d of r.json.downloads || []) console.log(`  - ${d.name} | ${d.file}`);
}
const live = JSON.parse(fs.readFileSync(path.join(here, 'live-media.json'), 'utf8')).filter(x => x.name !== up.playbook.name && x.name !== up.tips.name);
live.unshift(up.playbook, up.tips);
fs.writeFileSync(path.join(here, 'live-media.json'), JSON.stringify(live, null, 1));
console.log('recorded in live-media.json');
