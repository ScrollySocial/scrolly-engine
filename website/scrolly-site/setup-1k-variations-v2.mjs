// 2026-09-23 v2: shirt size moves to checkout (block checkout field, see chrome/../automation/wordpress/deployed/challenge-shirt-size-checkout.php).
// Product 279 keeps ONE attribute, Package: Club only (582, $40) / Club + Challenge (583, $75). The 7 per-size variations (584-589) are deleted.
import { wp } from './wp-client.mjs';
const ID = 279, PKG = 'Package';
const p = await wp(`/wp-json/wc/v3/products/${ID}`, { method: 'PUT', body: JSON.stringify({
  attributes: [{ name: PKG, position: 0, visible: true, variation: true, options: ['Club only', 'Club + Challenge'] }],
  default_attributes: [],
}) });
console.log('product', p.status, JSON.stringify(p.json.attributes?.map((a) => a.name + ':' + a.options.join('/'))));
const b = await wp(`/wp-json/wc/v3/products/${ID}/variations/batch`, { method: 'POST', body: JSON.stringify({
  update: [
    { id: 582, attributes: [{ name: PKG, option: 'Club only' }], regular_price: '40', description: 'The $1K Club, one-time.' },
    { id: 583, attributes: [{ name: PKG, option: 'Club + Challenge' }], regular_price: '75', description: 'The $1K Club + the 30-day $1K Challenge. Earn your stripe shirt (Adult Men\u2019s, Comfort Colors 1717) by hitting $1,000; ships free in the US.' },
  ],
  delete: [584, 585, 586, 587, 588, 589],
}) });
console.log('update', (b.json.update || []).map((x) => x.id + ' ' + x.attributes.map((a) => a.option).join('/') + ' $' + x.regular_price + (x.error ? ' ERR ' + x.error.message : '')).join(' | '));
console.log('delete', (b.json.delete || []).map((x) => x.id + (x.error ? ' ERR ' + x.error.message : ' ok')).join(' '));
const left = await wp(`/wp-json/wc/v3/products/${ID}/variations?per_page=50`);
console.log('remaining', left.json.map((v) => v.id + ':' + v.attributes.map((a) => a.option).join('/') + '=$' + v.price).join(' '));
