// 2026-10-03 round 2 (Mercedes): "Free Resources" first, "Merch" -> "Shop", About hidden from the top bar (class scx-drawer-only keeps it
// in the mobile drawer + footer columns). Header dropdowns are switched off in chrome.js.
import { wp } from './wp-client.mjs';
const up = async (id, body) => { const r = await wp(`/wp-json/wp/v2/menu-items/${id}`, { method: 'POST', body: JSON.stringify(body) }); console.log('item', id, r.status, r.json.title?.raw ?? JSON.stringify(r.json).slice(0, 160), r.json.menu_order, (r.json.classes || []).join(' ')); return r; };
// Free Resources (1086) + Blog/Downloads/Calculators (1087-1089)
await up(1086, { title: 'Free Resources', menu_order: 1 });
await up(1087, { menu_order: 2 }); await up(1088, { menu_order: 3 }); await up(1089, { menu_order: 4 });
// Clubs & Challenges (133) + $1K/$10K/$24K (321/323/325)
await up(133, { menu_order: 5 });
await up(321, { menu_order: 6 }); await up(323, { menu_order: 7 }); await up(325, { menu_order: 8 });
// Shop (328) + Apparel (1090) / Digital Products (327)
await up(328, { title: 'Shop', menu_order: 9 });
await up(1090, { menu_order: 10 }); await up(327, { menu_order: 11 });
// About (1091): footer + drawer only
await up(1091, { menu_order: 12, classes: ['scx-drawer-only'] });
