// 2026-10-26: /1k-club/ (page 291) calls the earned shirt "Earned shirt" (was "Stripe shirt") and the card's shirt fills its tile.
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
for (const [k, want] of [[CSS_AT, 1], [CARD, 1]]) if (raw.split(k).length - 1 !== want) throw new Error('match count off: ' + k);
const before = raw;
raw = raw.replace(CARD, '<h3>Stripe shirt</h3><div class="pic shirt">')
  .replace(CSS_AT, CSS_AT + '\n.s3 .cl-prod .pic.shirt{padding:0}\n.s3 .cl-prod .pic.shirt img{transform:scale(1.3)}')
  .replace(/Stripe shirt/g, 'Earned shirt').replace(/stripe shirt/g, 'earned shirt');
console.log('stripe left:', (raw.match(/[Ss]tripe shirt/g) || []).length);
if (apply) {
  fs.writeFileSync(path.join(here, '..', 'backups', 'pages', `page-291-${new Date().toISOString().replace(/[:.]/g, '-')}.html`), before);
  const r = await wp('/wp-json/wp/v2/pages/291', { method: 'POST', body: JSON.stringify({ content: raw }) });
  console.log('page 291 saved', r.status);
}
