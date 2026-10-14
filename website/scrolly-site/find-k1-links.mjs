// Read-only: find pages, menu items and products whose content links to ?add-to-cart=582/583/279.
import { wp } from './wp-client.mjs';
const re = /add-to-cart=(?:582|583|279)[^"'<\s]*/g;
for (const type of ['pages', 'posts', 'wp_block', 'wp_template_part']) {
  for (let pg = 1; pg < 6; pg++) {
    const r = await wp(`/wp-json/wp/v2/${type}?context=edit&per_page=50&page=${pg}&status=any`);
    if (!Array.isArray(r.json) || !r.json.length) break;
    for (const p of r.json) {
      const txt = (p.content?.raw || '') + JSON.stringify(p.meta || {});
      const m = [...new Set(txt.match(re) || [])];
      if (m.length) console.log(type, p.id, p.slug, p.status, m.join(' , '));
    }
  }
}
const mi = await wp('/wp-json/wp/v2/menu-items?per_page=100&context=edit');
for (const i of (Array.isArray(mi.json) ? mi.json : [])) if (/add-to-cart/.test(i.url)) console.log('menu-item', i.id, i.title?.raw, i.url);
