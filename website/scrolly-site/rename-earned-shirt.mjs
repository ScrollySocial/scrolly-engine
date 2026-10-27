// 2026-10-26: /1k-club/ (page 291) calls the earned shirt "Earned shirt" (was "Stripe shirt") and the card's shirt fills its tile.
// Second pass (same day): the FAQ blank is Comfort Colors 1717 in Chambray, not Graphite.
// Edits LIVE page content (backup saved first). Usage: node rename-earned-shirt.mjs [--apply]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes('--apply');
const CSS_AT = '.s3 .cl-prod .pic.full img{object-fit:cover}';
const CARD = '<h3>Stripe shirt</h3><div class="pic">';
let raw = (await wp('/wp-json/wp/v2/pages/291?context=edit')).json.content.raw;
const done = raw.includes('.pic.shirt{'); // first pass already applied: skip the card + CSS edits
if (!done) for (const k of [CSS_AT, CARD]) if (raw.split(k).length - 1 !== 1) throw new Error('match count off: ' + k);
const before = raw;
if (!done) raw = raw.replace(CARD, '<h3>Stripe shirt</h3><div class="pic shirt">')
  .replace(CSS_AT, CSS_AT + '\n.s3 .cl-prod .pic.shirt{padding:0}\n.s3 .cl-prod .pic.shirt img{transform:scale(1.3)}');
raw = raw.replace(/Stripe shirt/g, 'Earned shirt').replace(/stripe shirt/g, 'earned shirt')
  .replace('Comfort Colors 1717 (Graphite)', 'Comfort Colors 1717 (Chambray)');
console.log('stripe left:', (raw.match(/[Ss]tripe shirt/g) || []).length);
if (apply) {
  fs.writeFileSync(path.join(here, '..', 'backups', 'pages', `page-291-${new Date().toISOString().replace(/[:.]/g, '-')}.html`), before);
  const r = await wp('/wp-json/wp/v2/pages/291', { method: 'POST', body: JSON.stringify({ content: raw }) });
  console.log('page 291 saved', r.status);
}
