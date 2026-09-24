// 2026-09-23: $1K Club (279) becomes one variable product: Package (Club only $40 / Club + Challenge $75) + Challenge shirt size (Adult Men's, Comfort Colors 1717 S-4XL).
// Woo hides impossible combos, so "No shirt" only pairs with Club only and S-4XL only with Club + Challenge. Backup: ../backups/2026-09-23-pre-variation/.
import { wp } from './wp-client.mjs';
const ID = 279, SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'], NONE = 'No shirt (Club only)';
const PKG = 'Package', SIZE = "Challenge shirt size (Adult Men's)";
const p = await wp(`/wp-json/wc/v3/products/${ID}`, { method: 'PUT', body: JSON.stringify({
  type: 'variable',
  short_description: 'A one-time system to get organic traffic to your offer, understand what happens when people show up, and move toward real revenue. Add the 30-day $1K Challenge to put it into action and earn your stripe shirt. No subscription, ever.',
  attributes: [
    { name: PKG, position: 0, visible: true, variation: true, options: ['Club only', 'Club + Challenge'] },
    { name: SIZE, position: 1, visible: true, variation: true, options: [NONE, ...SIZES] },
  ],
  default_attributes: [{ name: PKG, option: 'Club + Challenge' }],
}) });
console.log('product', p.status, p.json.type, JSON.stringify(p.json.attributes?.map(a => a.name + ':' + a.options.length)));
const existing = await wp(`/wp-json/wc/v3/products/${ID}/variations?per_page=50`);
if (existing.json.length) { console.log('variations already exist:', existing.json.length, '- not creating'); process.exit(0); }
const v = (pkg, size, price, desc) => ({ regular_price: String(price), virtual: true, manage_stock: false, description: desc,
  attributes: [{ name: PKG, option: pkg }, { name: SIZE, option: size }] });
const create = [v('Club only', NONE, 40, 'The $1K Club, one-time.'),
  ...SIZES.map(s => v('Club + Challenge', s, 75, `The $1K Club + 30-day $1K Challenge. Stripe shirt size ${s} (Adult Men's, Comfort Colors 1717), shipped free in the US if you earn it.`))];
const b = await wp(`/wp-json/wc/v3/products/${ID}/variations/batch`, { method: 'POST', body: JSON.stringify({ create }) });
console.log('batch', b.status, (b.json.create || []).map(x => x.id + ' ' + x.attributes.map(a => a.option).join('/') + ' $' + x.regular_price + (x.error ? ' ERR ' + x.error.message : '')).join('\n'));
