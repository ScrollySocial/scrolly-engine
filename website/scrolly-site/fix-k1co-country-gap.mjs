// 2026-09-29: add the $1K checkout country-field gap to the checkout page's own <style> (page 7), because the WPCode
// snippet couldn't be re-pasted. Same rule as automation/k1-launch/php/k1-checkout.php. Idempotent.
import fs from 'fs';
import { wp } from './wp-client.mjs';

const RULE = '.k1co-main .wc-block-components-address-form .wc-block-components-address-form__country{margin-top:12px!important}';
const page = (await wp('/wp-json/wp/v2/pages/7?context=edit')).json;
const raw = page.content.raw;
fs.writeFileSync(process.argv[2], raw); // backup before editing
if (raw.includes(RULE)) { console.log('already present'); process.exit(0); }
const i = raw.indexOf('.wc-block-components-button,.wc-block-cart-item__remove-link,input,select{min-height:44px}');
if (i < 0) throw new Error('anchor not found');
const out = raw.slice(0, i) + RULE + raw.slice(i);
const r = await wp('/wp-json/wp/v2/pages/7', { method: 'POST', body: JSON.stringify({ content: out }) });
const after = (await wp('/wp-json/wp/v2/pages/7?context=edit')).json.content.raw;
console.log(r.status, 'rule saved:', after.includes(RULE), 'length', raw.length, '->', after.length, 'styles', (after.match(/<style/g) || []).length);
