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

// Cards are driven by WooCommerce categories: tick "Merch" or "Digital products" on a product and it shows up
// (sorted by the product's menu order). Private products, e.g. the Winner reward shirts, never appear.
// The build bakes a snapshot into the page; lib.mjs LIVE_SCRIPT refreshes it from the public Store API on every page view.
export const CATS = { merch: 'merch', digital: 'digital-products' };
// Digital products whose card should link to a sales page instead of the Woo product page, plus a short label.
export const DIGITAL_MAP = {
  58: { href: '/shopify-seo-workbook/', sub: 'Digital workbook' },
  69: { href: '/pinterest-seo-workbook/', sub: 'Digital workbook' },
  24: { href: '/seo-site-audit/', sub: 'Personalized site audit' },
};

async function idsIn(slug) {
  const cat = (await wp(`/wp-json/wc/v3/products/categories?slug=${slug}`)).json[0];
  await pause();
  const list = (await wp(`/wp-json/wc/v3/products?category=${cat.id}&status=publish&orderby=menu_order&order=asc&per_page=50`)).json;
  await pause();
  return list.filter((p) => p.images.length).map((p) => p.id);
}

export const merch = await load(await idsIn(CATS.merch));
export const digital = (await load(await idsIn(CATS.digital))).map((p) => ({ ...p, ...(DIGITAL_MAP[p.id] || {}) }));
console.log('[shop] merch', merch.map((p) => `${p.name} ${p.price}`).join(' | '));
console.log('[shop] digital', digital.map((p) => `${p.name} ${p.price}`).join(' | '));
