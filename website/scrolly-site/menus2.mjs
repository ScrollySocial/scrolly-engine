// Make the real WP menus drive the global header/footer (see chrome/snippet.php.tpl).
//  - Main Menu (id 18): SEO tools + Cart are drawer-only (class scx-drawer-only); "Log in" item retired (the header/drawer render a login/My account link themselves).
//  - Footer Menu (id 19): only the legal/about links remain (one row, no duplicate site nav).
import { wp } from './wp-client.mjs';
const up = async (id, body) => { const r = await wp(`/wp-json/wp/v2/menu-items/${id}`, { method: 'POST', body: JSON.stringify(body) }); console.log(id, r.status, r.json.title?.raw ?? JSON.stringify(r.json).slice(0, 100), JSON.stringify(r.json.classes ?? '')); };
await up(320, { classes: ['scx-drawer-only'] });
await up(166, { classes: ['scx-drawer-only'] });
await up(167, { status: 'draft' });
for (const id of [330, 331, 332, 333]) await up(id, { status: 'draft' });
