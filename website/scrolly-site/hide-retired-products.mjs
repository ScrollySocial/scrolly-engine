// Hide products Mercedes stopped selling (2026-10-26): Business Brain, Shopify + Pinterest SEO Workbooks.
// Products and their sales pages go private (reversible: set back to publish); menu items go to draft; SEO Tools (316)
// and About (119) lose their workbook mentions, edited on the LIVE content (the generator source already carries the
// unpublished rename). Backups: website/backups/pages/*-2026-10-26T16-51-*. Usage: node hide-retired-products.mjs [--dry]
import { wp } from './wp-client.mjs';
const dry = process.argv.includes('--dry');
const PRODUCTS = [1387, 69, 58];
const PAGES = [50, 71];
const MENU_ITEMS = [134, 135];
const EDITS = {
  316: [
    [/<section class="s3-sec"><div class="s3-wrap"><div class="cat-head"><h2 class="s3-h2">Build with a workbook\.<\/h2>[\s\S]*?<\/section>/, ''],
    ['Keep moving with a site audit, implementation help, or a practical platform workbook.', 'Keep moving with a site audit or implementation help.'],
  ],
  119: [
    ['the <a href="/shopify-seo-workbook/">Shopify</a> and <a href="/pinterest-seo-workbook/">Pinterest</a> SEO Workbooks, a personalized <a href="/seo-site-audit/">SEO Site Audit</a>, and <a href="/calculators/">free calculators</a>.',
      'a personalized <a href="/seo-site-audit/">SEO Site Audit</a> and <a href="/calculators/">free calculators</a>.'],
  ],
};
const ok = (r, what) => { if (r.status >= 300) throw new Error(`${what}: ${r.status} ${JSON.stringify(r.json).slice(0, 200)}`); return r; };

// Text edits first, checked before anything is changed.
const newContent = {};
for (const [id, edits] of Object.entries(EDITS)) {
  let c = ok(await wp(`/wp-json/wp/v2/pages/${id}?context=edit`), `read ${id}`).json.content.raw;
  for (const [from, to] of edits) {
    const n = typeof from === 'string' ? c.split(from).length - 1 : (c.match(new RegExp(from.source, 'g')) || []).length;
    if (n !== 1) throw new Error(`page ${id}: expected 1 match, found ${n} for ${String(from).slice(0, 60)}`);
    c = c.replace(from, to);
  }
  if (/workbook/i.test(c)) throw new Error(`page ${id} still mentions a workbook`);
  newContent[id] = c;
  console.log(`page ${id}: edits match`);
}
if (dry) { console.log('dry run, nothing changed'); process.exit(0); }

for (const id of PRODUCTS) {
  const r = ok(await wp(`/wp-json/wc/v3/products/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'private' }) }), `product ${id}`);
  console.log(`product ${id} ${r.json.name}: ${r.json.status}`);
}
for (const id of PAGES) {
  const r = ok(await wp(`/wp-json/wp/v2/pages/${id}`, { method: 'POST', body: JSON.stringify({ status: 'private' }) }), `page ${id}`);
  console.log(`page ${id} ${r.json.slug}: ${r.json.status}`);
}
for (const id of MENU_ITEMS) {
  const r = ok(await wp(`/wp-json/wp/v2/menu-items/${id}`, { method: 'POST', body: JSON.stringify({ status: 'draft' }) }), `menu item ${id}`);
  console.log(`menu item ${id} ${r.json.title?.rendered}: ${r.json.status}`);
}
for (const [id, content] of Object.entries(newContent)) {
  const r = ok(await wp(`/wp-json/wp/v2/pages/${id}`, { method: 'POST', body: JSON.stringify({ content }) }), `update ${id}`);
  console.log(`page ${id} ${r.json.slug}: content updated`);
}
