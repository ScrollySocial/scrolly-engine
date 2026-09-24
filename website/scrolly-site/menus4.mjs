// 2026-09-23: Clubs + Challenges dropdown = the three combined tier pages only (separate Challenge pages and All Clubs/All Challenges now forward).
import { wp } from './wp-client.mjs';
const up = async (id, body) => { const r = await wp(`/wp-json/wp/v2/menu-items/${id}`, { method: 'POST', body: JSON.stringify(body) }); console.log(id, r.status, r.json.title?.raw, r.json.status, r.json.menu_order); };
await up(321, { title: '$1K Club + Challenge', menu_order: 1 });
await up(323, { title: '$10K Club + Challenge', menu_order: 2 });
await up(325, { title: '$24K Club + Challenge', menu_order: 3 });
for (const id of [443, 318, 322, 324, 326]) await up(id, { status: 'draft' });
