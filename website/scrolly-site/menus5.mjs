// 2026-10-03 homepage v3: Main Menu = 4 columns (Clubs & Challenges / Resources / Merch / About) that the global header dropdowns,
// drawer and footer columns are all built from; Footer Menu = the legal row. "#coming-soon" URLs render as "Coming soon" text (chrome.js).
// Pre-change backup: website/backups/2026-10-03-pre-homepage-v3/menu-items.json. Items are drafted, never deleted.
import { wp, BASE } from './wp-client.mjs';
const SOON = '#coming-soon';
const up = async (id, body) => { const r = await wp(`/wp-json/wp/v2/menu-items/${id}`, { method: 'POST', body: JSON.stringify(body) }); console.log('item', id, r.status, r.json.title?.raw ?? JSON.stringify(r.json).slice(0, 160), r.json.status); return r; };
const add = async (menus, body) => { const r = await wp('/wp-json/wp/v2/menu-items', { method: 'POST', body: JSON.stringify({ type: 'custom', status: 'publish', menus, ...body }) }); console.log('new', r.status, r.json.id ?? JSON.stringify(r.json).slice(0, 160), body.title); if (!r.json.id) throw new Error('create failed'); return r.json.id; };
const MAIN = 18, FOOT = 19;

// Clubs & Challenges
await up(133, { title: 'Clubs & Challenges', url: BASE + '/#clubs', menu_order: 1, parent: 0 });
await up(321, { title: '$1K Club', parent: 133, menu_order: 2 });
await up(323, { title: '$10K Club', parent: 133, menu_order: 3 });
await up(325, { title: '$24K Club', parent: 133, menu_order: 4 });
// Resources
const res = await add(MAIN, { title: 'Resources', url: BASE + '/#resources', menu_order: 5, parent: 0 });
await add(MAIN, { title: 'Blog', url: SOON, parent: res, menu_order: 6 });
await add(MAIN, { title: 'Downloads', url: SOON, parent: res, menu_order: 7 });
await add(MAIN, { title: 'Calculators', url: SOON, parent: res, menu_order: 8 });
// Merch
await up(328, { title: 'Merch', url: BASE + '/scrolly-shop/', parent: 0, menu_order: 9 });
await add(MAIN, { title: 'Apparel', url: BASE + '/scrolly-shop/', parent: 328, menu_order: 10 });
await up(327, { title: 'Digital Products', url: BASE + '/digital-products/', parent: 328, menu_order: 11 });
// About
const about = await add(MAIN, { title: 'About', url: BASE + '/about/', menu_order: 12, parent: 0 });
await add(MAIN, { title: 'Our Method', url: SOON, parent: about, menu_order: 13 });
await add(MAIN, { title: 'Contact', url: BASE + '/contact/', parent: about, menu_order: 14 });
await add(MAIN, { title: 'FAQ', url: SOON, parent: about, menu_order: 15 });
// Retired from the Main Menu (drafted): Calculator (homepage section), and Digital products' old children, which would now sit 3 levels deep.
for (const id of [444, 329, 197, 134, 135]) await up(id, { status: 'draft' });

// Footer Menu = legal row. About + Contact moved into the Main Menu's About column.
await up(200, { title: 'Privacy', menu_order: 1 });
await up(201, { title: 'Terms', menu_order: 2 });
await up(202, { title: 'Refund Policy', menu_order: 3 });
await up(172, { title: 'Accessibility', menu_order: 4 });
await up(884, { menu_order: 5 });
for (const id of [131, 132]) await up(id, { status: 'draft' });
