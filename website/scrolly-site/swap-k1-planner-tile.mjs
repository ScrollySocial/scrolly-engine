// Content Planner card (2026-10-27): the /1k-club/ "Notion content tracker" card showed the OLD green planner. Swap in a 900x1200
// screenshot of the published On set planner (assets/k1-tile3-notion-onset.webp) on page 291. Updates media-map.json. Backs up first.
// Usage: node swap-k1-planner-tile.mjs [--apply]   (first run swapped scrolly-k1-tile3-notion.webp; this run replaces that too-small crop)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes('--apply');
const U = 'https://theambitiondepartment.com/wp-content/uploads/2026/10/';
const SWAPS = [
  { key: 'k1-tile3-notion.webp', file: 'assets/k1-tile3-notion-onset.webp', old: `${U}k1-tile3-notion-onset.webp`, alt: 'The Content Planner in Notion: film-strip cover, planner menu and this week posts' },
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(u) { for (let i = 0; i < 5; i++) { const r = await wp(u); if (r.status === 200) return r.json; await sleep(12000); } throw new Error('gave up ' + u); }

let raw = (await get('/wp-json/wp/v2/pages/291?context=edit')).content.raw;
for (const s of SWAPS) { const n = raw.split(s.old).length - 1; if (n !== 1) throw new Error(`page 291: expected 1 match of ${s.old}, found ${n}`); }
console.log('page 291: old planner image found once');
if (!apply) { console.log('dry run'); } else {

fs.writeFileSync(path.join(here, '..', 'backups', 'pages', `291-${new Date().toISOString().replace(/[:.]/g, '-')}.html`), raw);
const map = JSON.parse(fs.readFileSync(path.join(here, 'media-map.json'), 'utf8'));
for (const s of SWAPS) {
  const fname = path.basename(s.file);
  let m;
  for (let i = 1; i <= 3 && !m; i++) {
    const r = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': 'image/webp', 'Content-Disposition': `attachment; filename="${fname}"` }, body: fs.readFileSync(path.join(here, s.file)) });
    if (r.json?.id) m = r.json; else { console.log('upload try', i, r.status); await sleep(15000); m = (await get(`/wp-json/wp/v2/media?search=${fname.replace('.webp', '')}`))[0]; }
  }
  await wp(`/wp-json/wp/v2/media/${m.id}`, { method: 'POST', body: JSON.stringify({ alt_text: s.alt, title: s.alt }) });
  raw = raw.split(s.old).join(m.source_url);
  map[s.key] = { id: m.id, url: m.source_url, w: 900, h: 1200 };
  console.log('uploaded', m.id, m.source_url);
}
const r = await wp('/wp-json/wp/v2/pages/291', { method: 'POST', body: JSON.stringify({ content: raw }) });
console.log('page 291 saved', r.status);
fs.writeFileSync(path.join(here, 'media-map.json'), JSON.stringify(map, null, 1));
}
