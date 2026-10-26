// Rename (2026-10-26): hello@scrollyseo.com → hello@theambitiondepartment.com on every live page and product, plus the
// WooCommerce sender address. Backs up each changed page to ../backups/pages first. Usage: node swap-email-live.mjs [--dry]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const dry = process.argv.includes('--dry');
const OLD = /hello@scrollyseo\.com/g;
const NEW = 'hello@theambitiondepartment.com';
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = path.join(here, '..', 'backups', 'pages');

const pages = (await wp('/wp-json/wp/v2/pages?per_page=100&status=publish,private&context=edit&_fields=id,slug,content')).json;
for (const p of pages) {
  const raw = p.content.raw || '';
  const n = (raw.match(OLD) || []).length;
  if (!n) continue;
  console.log(`page ${p.id} ${p.slug}: ${n}`);
  if (dry) continue;
  fs.writeFileSync(path.join(dir, `page-${p.id}-${stamp}.html`), raw);
  const r = await wp(`/wp-json/wp/v2/pages/${p.id}`, { method: 'POST', body: JSON.stringify({ content: raw.replace(OLD, NEW) }) });
  console.log(`   saved ${r.status}`);
}
const prodsRes = (await wp('/wp-json/wc/v3/products?per_page=100&status=any&_fields=id,name,description,short_description')).json;
const prods = Array.isArray(prodsRes) ? prodsRes : (console.log("products list failed, re-run later"), []);
for (const p of prods) {
  const n = ((String(p.description) + String(p.short_description)).match(OLD) || []).length;
  if (!n) continue;
  console.log(`product ${p.id} ${p.name}: ${n}`);
  if (dry) continue;
  const r = await wp(`/wp-json/wc/v3/products/${p.id}`, { method: 'PUT', body: JSON.stringify({ description: p.description.replace(OLD, NEW), short_description: p.short_description.replace(OLD, NEW) }) });
  console.log(`   saved ${r.status}`);
}
const from = (await wp('/wp-json/wc/v3/settings/email/woocommerce_email_from_address')).json.value;
console.log(`order email sender: ${from}`);
if (!dry && from !== NEW) {
  const r = await wp('/wp-json/wc/v3/settings/email/woocommerce_email_from_address', { method: 'PUT', body: JSON.stringify({ value: NEW }) });
  console.log(`   now ${r.json.value}`);
}
