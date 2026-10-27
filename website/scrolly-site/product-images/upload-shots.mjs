// Usage (from website/scrolly-site): node product-images/upload-shots.mjs
// Uploads the shared-style product photos from out-v3/ (made by shots.mjs) and sets each as its WooCommerce product's main image.
// Pass slugs to upload only those (e.g. seo-site-audit). Old images stay in the media library (ids printed), so this is reversible. 2026-10-27, Mercedes's OK.
import fs from 'fs';
import { wp } from '../wp-client.mjs';

const SHOTS = [
  { id: 1764, name: 'Chat Manager', slug: 'chat-manager', alt: 'Chat Manager: a keyword comment sends the freebie by DM and the person joins your email list' },
  { id: 1498, name: 'Halloween Reel Template Pack', slug: 'halloween-reel-pack', alt: 'Halloween Reel Template Pack: three of the Reel covers on phones' },
  { id: 1500, name: 'Product Reel Template Pack', slug: 'product-reel-pack', alt: 'Product Reel Template Pack: three of the Reel covers on phones' },
  { id: 24, name: 'SEO Site Audit', slug: 'seo-site-audit', alt: 'The Ambition Department SEO Site Audit report' },
];

const only = process.argv.slice(2);
for (const s of SHOTS.filter((x) => !only.length || only.includes(x.slug))) {
  const before = (await wp(`/wp-json/wc/v3/products/${s.id}`)).json;
  if (before.name !== s.name) throw new Error(`product ${s.id} is "${before.name}", expected "${s.name}"`);
  const file = `product-images/out-v3/${s.slug}.webp`;
  const up = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': 'image/webp', 'Content-Disposition': `attachment; filename="product-${s.slug}-v3.webp"` }, body: fs.readFileSync(file) });
  if (!up.json.id) throw new Error(`upload failed for ${s.name}: ${up.status} ${JSON.stringify(up.json).slice(0, 200)}`);
  await wp(`/wp-json/wp/v2/media/${up.json.id}`, { method: 'POST', body: JSON.stringify({ alt_text: s.alt, title: s.alt }) });
  // Keep any gallery images after the first; only the main image changes.
  const rest = (before.images || []).slice(1).map((i) => ({ id: i.id }));
  const put = await wp(`/wp-json/wc/v3/products/${s.id}`, { method: 'PUT', body: JSON.stringify({ images: [{ id: up.json.id, alt: s.alt }, ...rest] }) });
  console.log(s.name, 'old', before.images.map((i) => i.id).join(','), '-> new', up.json.id, 'status', put.status, 'now', (put.json.images || []).map((i) => i.id).join(','));
}
