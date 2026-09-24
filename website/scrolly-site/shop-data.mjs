// Build-time product data from live WooCommerce, so merch + digital cards show the real product photo, name, price and link.
// Change a photo, name or price in WooCommerce/Printify, then rebuild + republish the pages that use these cards (home, digital-products, scrolly-shop).
import { wp } from './wp-client.mjs';

const pause = () => new Promise((r) => setTimeout(r, 900)); // host 429s bursts

// Smallest generated size that is still sharp in a 298px-wide card at 2x.
async function cardImage(image) {
  if (!image) return null;
  const m = (await wp(`/wp-json/wp/v2/media/${image.id}`)).json;
  await pause();
  const s = m?.media_details?.sizes || {};
  const pick = s.woocommerce_single || s.medium_large || s.large || s.full;
  return pick ? { src: pick.source_url, w: pick.width, h: pick.height, alt: image.alt || '' } : { src: image.src, w: 600, h: 600, alt: image.alt || '' };
}

const money = (p) => (p === '' || p == null ? '' : '$' + (Number(p) % 1 ? Number(p).toFixed(2) : Number(p)));

async function load(ids) {
  const out = [];
  for (const id of ids) {
    const p = (await wp(`/wp-json/wc/v3/products/${id}`)).json;
    await pause();
    if (p.status !== 'publish' || p.catalog_visibility === 'hidden') continue;
    let price = money(p.price);
    if (p.type === 'variable') {
      // Only show a price when every size costs the same; mixed Printify per-size prices would read as "$21.08".
      const v = (await wp(`/wp-json/wc/v3/products/${id}/variations?per_page=100`)).json;
      await pause();
      const prices = new Set((Array.isArray(v) ? v : []).map((x) => x.price));
      price = prices.size === 1 ? money([...prices][0]) : '';
    }
    out.push({ id, name: p.name, href: new URL(p.permalink).pathname, price, image: await cardImage(p.images[0]) });
  }
  return out;
}

// Public tees from Printify, in display order. Winner shirts (634, 646) are rewards and are never listed.
export const MERCH_IDS = [684, 719, 750, 696, 671, 659];
// Digital products, in display order; href overrides point at their sales pages instead of the Woo product page.
export const DIGITAL = [
  { id: 58, href: '/shopify-seo-workbook/', sub: 'Digital workbook' },
  { id: 69, href: '/pinterest-seo-workbook/', sub: 'Digital workbook' },
  { id: 24, href: '/seo-site-audit/', sub: 'Personalized site audit' },
];

export const merch = await load(MERCH_IDS);
export const digital = (await load(DIGITAL.map((d) => d.id))).map((p) => ({ ...p, ...DIGITAL.find((d) => d.id === p.id) }));
console.log('[shop] merch', merch.map((p) => `${p.name} ${p.price}`).join(' | '));
console.log('[shop] digital', digital.map((p) => `${p.name} ${p.price}`).join(' | '));
