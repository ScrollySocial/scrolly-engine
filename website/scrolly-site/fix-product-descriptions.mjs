// One-off: remove the old direction's injected <style id="scrolly-shared-shell-v1"> block from WooCommerce product descriptions
// (block cart printed its CSS as visible text). Only that style block is removed; the customer-facing description text is untouched.
import { wp } from './wp-client.mjs';
for (const id of [58, 69, 24]) {
  const cur = (await wp(`/wp-json/wc/v3/products/${id}`)).json;
  const cleaned = cur.description.replace(/<style id="scrolly-shared-shell-v1">[\s\S]*?<\/style>/g, '').replace(/^\s+/, '');
  if (cleaned === cur.description) { console.log(id, 'nothing to remove'); continue; }
  const r = await wp(`/wp-json/wc/v3/products/${id}`, { method: 'PUT', body: JSON.stringify({ description: cleaned }) });
  console.log(id, r.status, 'desc', cur.description.length, '->', (r.json.description || '').length, '| price', r.json.price, r.json.status);
}
