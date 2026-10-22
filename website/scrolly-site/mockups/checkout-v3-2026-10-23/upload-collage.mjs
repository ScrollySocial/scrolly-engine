// Upload the v3 checkout collage to the media library (adds a file only; no page changes). Prints the new media id.
import fs from 'fs';
import { wp } from '../../wp-client.mjs';
const name = 'k1-checkout-collage-v3.webp';
const found = (await wp('/wp-json/wp/v2/media?search=k1-checkout-collage-v3')).json;
let m = Array.isArray(found) && found.find((x) => x.slug.startsWith('k1-checkout-collage-v3'));
if (!m) {
  const buf = fs.readFileSync(new URL('./' + name, import.meta.url));
  m = (await wp('/wp-json/wp/v2/media', { method: 'POST', body: buf, headers: { 'Content-Type': 'image/webp', 'Content-Disposition': `attachment; filename="${name}"` } })).json;
  await wp(`/wp-json/wp/v2/media/${m.id}`, { method: 'POST', body: JSON.stringify({ alt_text: 'Three phones showing the Content Planner, Week 1 Reel ideas and the free calculators' }) });
}
console.log('MEDIA', m.id, m.source_url);
