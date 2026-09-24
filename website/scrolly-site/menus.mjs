// Align the theme's real WP menus (used only on pages that still render the theme header: product pages, /shop/, 404) with the new nav.
// Original menu-items are backed up in website/backups/2026-09-21-pre-redesign/menu-items.json.
import { wp, BASE } from './wp-client.mjs';
const up = async (id, body) => { const r = await wp(`/wp-json/wp/v2/menu-items/${id}`, { method: 'POST', body: JSON.stringify(body) }); console.log('item', id, r.status, r.json.title?.raw ?? JSON.stringify(r.json).slice(0, 120)); return r; };
const add = async (body) => { const r = await wp('/wp-json/wp/v2/menu-items', { method: 'POST', body: JSON.stringify({ type: 'custom', status: 'publish', menus: 18, ...body }) }); console.log('new', r.status, r.json.id, body.title); return r.json.id; };
const allClubs = await add({ title: 'All Clubs', url: BASE + '/clubs/', parent: 133, menu_order: 1 });
await up(133, { title: 'Clubs + Challenges', url: BASE + '/#clubs', menu_order: 1, parent: 0 });
await up(321, { menu_order: 2, parent: 133 }); await up(323, { menu_order: 3, parent: 133 }); await up(325, { menu_order: 4, parent: 133 });
await up(318, { title: 'All Challenges', menu_order: 5, parent: 133 });
await up(322, { menu_order: 6, parent: 133 }); await up(324, { menu_order: 7, parent: 133 }); await up(326, { menu_order: 8, parent: 133 });
await add({ title: 'Calculator', url: BASE + '/#calculator', parent: 0, menu_order: 2 });
await up(327, { title: 'Digital products', parent: 0, menu_order: 3 });
await up(328, { title: 'Merch', url: BASE + '/scrolly-shop/', parent: 0, menu_order: 4 });
await up(319, { status: 'draft' });
await up(320, { title: 'SEO tools', menu_order: 5 });
await up(166, { menu_order: 6 }); await up(167, { title: 'Log in', menu_order: 7 });
await up(332, { title: 'Merch' }); // footer menu
