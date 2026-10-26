// Live sweep (rename 2026-10-26): fetch every public page and product as a visitor and list visible "Scrolly" left in
// text, alt/title/aria-label attributes and <title>. Ignores class names, file paths, URLs and the @scrollysocial handle.
// Usage: node sweep-live.mjs
import { wp, BASE } from './wp-client.mjs';
const urls = new Set([BASE + '/']);
for (const t of ['pages', 'posts']) {
  const r = await wp(`/wp-json/wp/v2/${t}?per_page=100&status=publish&_fields=link`);
  if (Array.isArray(r.json)) r.json.forEach((p) => urls.add(p.link));
}
const prods = await wp('/wp-json/wc/v3/products?per_page=100&status=publish&_fields=permalink,catalog_visibility');
prods.json.forEach((p) => urls.add(p.permalink));
['/shop/', '/cart/', '/my-account/', '/checkout/'].forEach((u) => urls.add(BASE + u));

let found = 0;
for (const u of urls) {
  await new Promise((r) => setTimeout(r, 2500)); // the host rate-limits fast crawls (429)
  const res = await fetch(u + (u.includes('?') ? '&' : '?') + 'nc=' + Date.now());
  const html = await res.text();
  const vis = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]*?\b(alt|title|aria-label|content)="([^"]*)"[^>]*>/g, ' $2 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8217;|&rsquo;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const hits = [...(vis + ' ' + title).matchAll(/.{0,50}\bScrolly(?!social|seo\.com)\b.{0,50}/gi)].map((m) => m[0].trim());
  const keep = hits.filter((h) => !/https?:\/\/|\.webp|\.png|\.jpe?g|wp-content|@scrolly/i.test(h));
  console.log(`${res.status} ${u.replace(BASE, '')}${keep.length ? `  ← ${keep.length}` : ''}`);
  keep.slice(0, 4).forEach((h) => console.log('     ·', h));
  found += keep.length;
}
console.log(`\n${urls.size} URLs, ${found} visible Scrolly left`);
