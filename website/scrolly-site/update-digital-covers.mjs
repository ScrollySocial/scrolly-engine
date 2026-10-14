// Usage: node update-digital-covers.mjs   Uploads the new digital-product cover art and sets it as each WooCommerce product's image.
// Previous cover media ids (573 Shopify, 575 Pinterest, 788 SEO Site Audit) stay in the media library, so this is reversible.
import fs from 'fs';
import { wp } from './wp-client.mjs';

const COVERS = [
  { id: 58, name: 'Shopify SEO Workbook', file: 'assets/cover-shopify-seo-workbook.webp', alt: 'Scrolly Shopify SEO Workbook cover' },
  { id: 69, name: 'Pinterest SEO Workbook', file: 'assets/cover-pinterest-seo-workbook.webp', alt: 'Scrolly Pinterest SEO Workbook cover' },
  { id: 24, name: 'SEO Site Audit', file: 'assets/cover-seo-site-audit.webp', alt: 'Scrolly SEO Site Audit cover' },
];

for (const c of COVERS) {
  const before = (await wp(`/wp-json/wc/v3/products/${c.id}`)).json;
  if (before.name !== c.name) throw new Error(`product ${c.id} is "${before.name}", expected "${c.name}"`);
  const up = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': 'image/webp', 'Content-Disposition': `attachment; filename="${c.file.split('/').pop()}"` }, body: fs.readFileSync(c.file) });
  if (!up.json.id) throw new Error(`upload failed for ${c.name}: ${up.status} ${JSON.stringify(up.json).slice(0, 200)}`);
  await wp(`/wp-json/wp/v2/media/${up.json.id}`, { method: 'POST', body: JSON.stringify({ alt_text: c.alt, title: c.alt }) });
  const put = await wp(`/wp-json/wc/v3/products/${c.id}`, { method: 'PUT', body: JSON.stringify({ images: [{ id: up.json.id, alt: c.alt }] }) });
  const now = put.json.images || [];
  console.log(c.name, `product ${c.id}`, 'old image', before.images.map((i) => i.id).join(','), '-> new media', up.json.id, `(${up.json.media_details?.width}x${up.json.media_details?.height})`, 'status', put.status, 'images now:', now.map((i) => i.id).join(','));
}
