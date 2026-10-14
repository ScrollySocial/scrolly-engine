// 2026-10-03 round 3 (Mercedes): no About column for now (About + Our Method + Contact + FAQ drafted, restorable);
// Contact goes in the footer's bottom legal row (old Footer Menu item 132 re-published).
import { wp } from './wp-client.mjs';
const up = async (id, body) => { const r = await wp(`/wp-json/wp/v2/menu-items/${id}`, { method: 'POST', body: JSON.stringify(body) }); console.log('item', id, r.status, r.json.title?.raw ?? JSON.stringify(r.json).slice(0, 160), r.json.status, r.json.menu_order); return r; };
for (const id of [1092, 1093, 1094, 1091]) await up(id, { status: 'draft' });
await up(132, { status: 'publish', title: 'Contact', menu_order: 5 });
await up(884, { menu_order: 6 });
