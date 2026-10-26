// Rename (2026-10-26): new SEO Site Audit cover (logo instead of the printed "scrolly") on product 24 and on the pages that
// show it (312 Digital products, 316 SEO tools). Old media stay in the library. Usage: node swap-audit-cover.mjs
import fs from 'fs';
import { wp } from './wp-client.mjs';
const ALT = 'The Ambition Department SEO Site Audit cover';
const FILE = 'assets/cover-seo-site-audit-tad.webp';
const PAGES = [312, 316];
const OLD = /https:\/\/theambitiondepartment\.com\/wp-content\/uploads\/2026\/09\/cover-seo-site-audit(-600x900)?\.webp/g;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let media;
for (let i = 1; i <= 4 && !media; i++) {
  const found = (await wp('/wp-json/wp/v2/media?search=cover-seo-site-audit-tad&_fields=id,source_url,media_details')).json;
  if (found.length) { media = found[0]; break; }
  const r = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': 'image/webp', 'Content-Disposition': 'attachment; filename="cover-seo-site-audit-tad.webp"' }, body: fs.readFileSync(FILE) });
  if (r.json.id) media = r.json; else { console.log(`upload try ${i}: ${r.status}`); await sleep(15000); }
}
if (!media) throw new Error('upload failed 4 times');
await wp(`/wp-json/wp/v2/media/${media.id}`, { method: 'POST', body: JSON.stringify({ alt_text: ALT, title: ALT }) });
const s600 = Object.values(media.media_details?.sizes || {}).find((s) => s.width === 600 && s.height === 900);
console.log('media', media.id, media.source_url, '| 600x900:', s600?.source_url || 'none (using full size)');

const p = await wp('/wp-json/wc/v3/products/24', { method: 'PUT', body: JSON.stringify({ images: [{ id: media.id, alt: ALT }] }) });
console.log('product 24 image ->', p.status, (p.json.images || []).map((i) => i.id).join(','));

for (const id of PAGES) {
  const raw = (await wp(`/wp-json/wp/v2/pages/${id}?context=edit`)).json.content.raw;
  const n = (raw.match(OLD) || []).length;
  const out = raw.replace(OLD, (m, small) => (small && s600 ? s600.source_url : media.source_url));
  if (!n) { console.log(`page ${id}: old cover not found`); continue; }
  const r = await wp(`/wp-json/wp/v2/pages/${id}`, { method: 'POST', body: JSON.stringify({ content: out }) });
  console.log(`page ${id}: ${n} image(s) swapped, ${r.status}`);
}
