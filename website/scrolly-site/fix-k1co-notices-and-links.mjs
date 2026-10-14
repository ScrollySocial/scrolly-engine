// 2026-09-29 (WPCode editor refused pastes, so these go in through page content):
//  1. Checkout page 7: brand-styled WooCommerce notices + field errors for the $1K checkout (k1co-notices.css), idempotent.
//  2. /1k-club/ page 291: Join buttons use long-form add-to-cart links (279 + variation_id), which the live
//     k1-checkout snippet handles (a short ?add-to-cart=583 link made WooCommerce say "You cannot add another").
import fs from 'fs';
import { wp } from './wp-client.mjs';
const backupDir = process.argv[2];

const css = fs.readFileSync(new URL('./k1co-notices.css', import.meta.url), 'utf8').trim();
const p7 = (await wp('/wp-json/wp/v2/pages/7?context=edit')).json.content.raw;
fs.writeFileSync(`${backupDir}/page7-before-notices.html`, p7);
let n7 = p7.replace(/\/\*k1co-notices\*\/[\s\S]*?\/\*\/k1co-notices\*\//, '');
const anchor = '.wc-block-components-button,.wc-block-cart-item__remove-link,input,select{min-height:44px}';
if (!n7.includes(anchor)) throw new Error('page 7 anchor missing');
n7 = n7.replace(anchor, css + anchor);
const r7 = await wp('/wp-json/wp/v2/pages/7', { method: 'POST', body: JSON.stringify({ content: n7 }) });
console.log('page 7', r7.status, (await wp('/wp-json/wp/v2/pages/7?context=edit')).json.content.raw.includes('/*k1co-notices*/'));

const p291 = (await wp('/wp-json/wp/v2/pages/291?context=edit')).json.content.raw;
fs.writeFileSync(`${backupDir}/page291-before-links.html`, p291);
const long = { 582: 'Club%20only', 583: 'Club%20%2B%20Challenge' };
const n291 = p291.replace(/\/checkout\/\?add-to-cart=(582|583)"/g, (m, v) => `/checkout/?add-to-cart=279&amp;variation_id=${v}&amp;attribute_package=${long[v]}"`);
const changed = (p291.match(/add-to-cart=58[23]"/g) || []).length;
const r291 = await wp('/wp-json/wp/v2/pages/291', { method: 'POST', body: JSON.stringify({ content: n291 }) });
const after = (await wp('/wp-json/wp/v2/pages/291?context=edit')).json.content.raw;
console.log('page 291', r291.status, 'links changed', changed, 'short left', (after.match(/add-to-cart=58[23]"/g) || []).length, 'long now', (after.match(/add-to-cart=279&(amp;)?variation_id=58[23]/g) || []).length);
