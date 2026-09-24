// Build-time availability check against live WooCommerce. Purchase CTAs only render when the product is actually published + purchasable.
import { wp } from './wp-client.mjs';
async function product(id) {
  const r = await wp(`/wp-json/wc/v3/products/${id}`);
  const p = r.json;
  return { id, open: p.status === 'publish' && p.purchasable === true && p.stock_status === 'instock', price: Number(p.price), name: p.name };
}
export const club1k = await product(279);
export const challenge1k = await product(280);
console.log('[status] $1K Club open=%s price=%s | $1K Challenge open=%s price=%s', club1k.open, club1k.price, challenge1k.open, challenge1k.price);
// $1K Club is a variable product (2026-09-23): Package (Club only / Club + Challenge) x Challenge shirt size. Map each combo to its variation id + price.
const vr = await wp('/wp-json/wc/v3/products/279/variations?per_page=50');
export const club1kVariations = (Array.isArray(vr.json) ? vr.json : []).map((v) => ({ id: v.id, price: Number(v.price), pkg: v.attributes.find((a) => a.name === 'Package')?.option, size: v.attributes.find((a) => /shirt size/i.test(a.name))?.option, open: v.status === 'publish' && v.purchasable !== false }));
console.log('[status] $1K Club variations', club1kVariations.map((v) => `${v.id}:${v.pkg}/${v.size}=$${v.price}`).join(' '));
