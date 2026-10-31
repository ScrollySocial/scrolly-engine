// v3 $1K Club hero (2026-10-31): upload assets/k1-hero-v3.webp (made by mockups/k1-hero-v3/render.mjs) and swap it for the
// old orange k1-hero-fan.webp on the live /1k-club/ page (291). Updates media-map.json + offers.mjs source. Backs up first.
// Usage: node swap-k1-hero-v3.mjs [--apply]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes('--apply');
const OLD = 'https://theambitiondepartment.com/wp-content/uploads/2026/10/scrolly-k1-hero-fan.webp';
const FILE = 'assets/k1-hero-v3.webp';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(u) { for (let i = 0; i < 5; i++) { const r = await wp(u); if (r.status === 200) return r.json; await sleep(12000); } throw new Error('gave up ' + u); }

let raw = (await get('/wp-json/wp/v2/pages/291?context=edit')).content.raw;
const n = raw.split(OLD).length - 1;
if (n < 1) throw new Error(`page 291: old hero not found`);
console.log(`page 291: old hero found ${n}x`);
if (!apply) { console.log('dry run'); } else {
fs.writeFileSync(path.join(here, '..', 'backups', 'pages', `291-${new Date().toISOString().replace(/[:.]/g, '-')}.html`), raw);
const fname = path.basename(FILE);
let m;
for (let i = 1; i <= 3 && !m; i++) {
  const r = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': 'image/webp', 'Content-Disposition': `attachment; filename="${fname}"` }, body: fs.readFileSync(path.join(here, FILE)) });
  if (r.json?.id) m = r.json; else { console.log('upload try', i, r.status); await sleep(15000); m = (await get(`/wp-json/wp/v2/media?search=${fname.replace('.webp', '')}`))[0]; }
}
const alt = 'Everything in the $1K Challenge: two PDF guides, Canva templates, content planner, $1K Math calculator, weekly Reel ideas and the earned shirt';
await wp(`/wp-json/wp/v2/media/${m.id}`, { method: 'POST', body: JSON.stringify({ alt_text: alt, title: '$1K Club hero v3' }) });
raw = raw.split(OLD).join(m.source_url);
const r = await wp('/wp-json/wp/v2/pages/291', { method: 'POST', body: JSON.stringify({ content: raw }) });
console.log('uploaded', m.id, m.source_url, '| page 291 saved', r.status);
const map = JSON.parse(fs.readFileSync(path.join(here, 'media-map.json'), 'utf8'));
map[fname] = { id: m.id, url: m.source_url, w: 1536, h: 1024 };
fs.writeFileSync(path.join(here, 'media-map.json'), JSON.stringify(map, null, 1));
const off = path.join(here, 'pages', 'offers.mjs');
fs.writeFileSync(off, fs.readFileSync(off, 'utf8').replace("'1k': 'k1-hero-fan.webp'", "'1k': 'k1-hero-v3.webp'"));
}
