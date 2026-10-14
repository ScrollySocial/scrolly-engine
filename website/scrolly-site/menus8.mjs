// 2026-10-03 round 4 (Mercedes): "Downloads" = the 3 free MailerLite lead magnets. Each links straight to its signup section.
import { wp, BASE } from './wp-client.mjs';
const up = async (id, body) => { const r = await wp(`/wp-json/wp/v2/menu-items/${id}`, { method: 'POST', body: JSON.stringify(body) }); console.log('item', id, r.status, r.json.title?.raw ?? JSON.stringify(r.json).slice(0, 160), r.json.menu_order); return r; };
const add = async (body) => { const r = await wp('/wp-json/wp/v2/menu-items', { method: 'POST', body: JSON.stringify({ type: 'custom', status: 'publish', menus: 18, ...body }) }); console.log('new', r.status, r.json.id ?? JSON.stringify(r.json).slice(0, 160), body.title); if (!r.json.id) throw new Error('create failed'); return r.json.id; };
await up(1088, { title: 'Pinterest SEO Scorecard', url: BASE + '/pinterest-seo-workbook/#srp-title-pinterest', menu_order: 2 });
await add({ title: 'Shopify SEO Self-Audit', url: BASE + '/shopify-seo-workbook/#srp-title-shopify', parent: 1086, menu_order: 3 });
await add({ title: 'Organic Traffic Scorecard', url: BASE + '/seo-site-audit/#srp-title-organic', parent: 1086, menu_order: 4 });
await up(1087, { menu_order: 5 }); // Blog (coming soon)
await up(1089, { menu_order: 6 }); // Calculators (coming soon)
let o = 7;
for (const id of [133, 321, 323, 325, 328, 1090, 327]) await up(id, { menu_order: o++ });
