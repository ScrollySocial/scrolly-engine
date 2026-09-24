// 2026-09-23: merge "SEO tools" into "Digital products" (one menu item). SEO tools children move under Digital products; SEO tools top item retired (draft).
import { wp } from './wp-client.mjs';
const up = async (id, body) => { const r = await wp(`/wp-json/wp/v2/menu-items/${id}`, { method: 'POST', body: JSON.stringify(body) }); console.log(id, r.status, r.json.title?.raw, 'parent=' + r.json.parent, r.json.status); };
for (const [id, order] of [[329, 1], [197, 2], [134, 3], [135, 4]]) await up(id, { parent: 327, menu_order: order });
await up(320, { status: 'draft' });
