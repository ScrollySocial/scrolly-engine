// $1K checkout deploy (2026-09-29): check shirt media 596/597, upload the checkout collage, set product 279 sold individually.
import fs from 'fs';
import { wp, BASE } from './wp-client.mjs';

for (const id of [596, 597]) {
  const m = (await wp(`/wp-json/wp/v2/media/${id}`)).json;
  console.log(id, m.slug, m.mime_type, m.media_details?.width + 'x' + m.media_details?.height, m.source_url);
}
const existing = (await wp('/wp-json/wp/v2/media?search=k1-checkout-collage')).json;
let collage = Array.isArray(existing) && existing[0];
if (!collage) {
  const buf = fs.readFileSync(process.argv[2]);
  collage = (await wp('/wp-json/wp/v2/media', { method: 'POST', body: buf, headers: { 'Content-Type': 'image/webp', 'Content-Disposition': 'attachment; filename="k1-checkout-collage.webp"' } })).json;
  await wp(`/wp-json/wp/v2/media/${collage.id}`, { method: 'POST', body: JSON.stringify({ alt_text: 'Scrolly $1K Club Playbook collage with desktop and phone previews' }) });
}
console.log('collage', collage.id, collage.source_url);
const p = (await wp('/wp-json/wc/v3/products/279', { method: 'PUT', body: JSON.stringify({ sold_individually: true }) })).json;
console.log('279 sold_individually', p.sold_individually);
