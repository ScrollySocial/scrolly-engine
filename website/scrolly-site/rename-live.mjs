// Rename Scrolly → The Ambition Department on the LIVE site (2026-10-26), editing each live page/product as it is
// (the generator source has drifted from live on some pages, so pages are not rebuilt). Visible words only: code
// names (scrolly-*, scxg, #scrolly-…, wp-content file names) and the hello@scrollyseo.com mailbox stay.
// Usage: node rename-live.mjs            dry run: lists every change
//        node rename-live.mjs --apply    backs up each page to ../backups/pages, then saves
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes('--apply');
const logo = fs.readFileSync(path.join(here, 'chrome', 'logo.html'), 'utf8').trim();

// Order matters: specific phrases first, then the general word.
const RULES = [
  [/More Scrolly\./g, 'More selling.'],
  [/<span class="scxg-wm">SCROLLY<\/span>/g, logo],
  [/Hi Scrolly, please/g, 'Hi there, please'],
  [/Hi%20Scrolly%2C/g, 'Hi%20there%2C'],
  [/Scrolly SEO Site Audit/g, 'The Ambition Department SEO Site Audit'],
  [/The next Scrolly Club is taking shape/g, 'The next Club is taking shape'],
  [/A focused Scrolly Challenge for/g, 'A focused Challenge for'],
  [/is where Scrolly starts\./g, 'is where it all starts.'],
  [/Contact Scrolly</g, 'Contact us<'],
  [/Two Ways to Work With Scrolly/g, 'Two Ways to Work With Us'],
  [/The Scrolly Reel Engine/g, 'The Reel Engine'],
  [/Scrolly tees/g, 'Ambition Department tees'],
  [/Scrolly<span class="seo">SEO<\/span>/g, 'The Ambition Department'],
  [/(?<![#@\-./_a-z])Scrolly SEO(?![\-\w])/g, 'The Ambition Department'],
  [/(?<![#@\-./_a-z])ScrollySEO(?![\-\w])/g, 'The Ambition Department'],
  [/SCROLLY WORKBOOK SERIES/g, 'THE AMBITION DEPARTMENT WORKBOOK SERIES'],
  [/(?<![#@\-./_a-z])Scrolly's(?![\-\w])/g, "The Ambition Department's"],
  [/(?<![#@\-./_a-z])Scrolly(?![\-\w])/g, 'The Ambition Department'],
];
// Shirt photos really say Scrolly (the shirts do); their alt text stays true until the shirts are redesigned.
const KEEP = /(shirt|tee|T-Shirt)[^"<]{0,80}Scrolly|Scrolly[^"<]{0,40}(Club\.|Challenge Winner|Earned T-Shirt)/i;

function rename(text) {
  const changes = [];
  let out = text;
  for (const [re, to] of RULES) {
    out = out.replace(re, (m, ...rest) => {
      const off = rest[rest.length - 2];
      const ctx = out.slice(Math.max(0, off - 60), off + m.length + 60);
      if (typeof to === 'string' && KEEP.test(ctx)) return m;
      changes.push(ctx.replace(/\s+/g, ' ').slice(0, 170));
      return to;
    });
  }
  return { out, changes };
}

const backup = (kind, id, raw) => {
  const dir = path.join(here, '..', 'backups', 'pages');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${kind}-${id}-${new Date().toISOString().replace(/[:.]/g, '-')}.html`), raw);
};

let total = 0;
const pages = (await wp('/wp-json/wp/v2/pages?per_page=100&status=publish,private&context=edit&_fields=id,slug,status,title,content')).json;
const SKIP = new Set([537, 538, 539]); // header/footer storage pages: published from chrome/ by install-chrome.mjs
for (const p of pages) {
  if (SKIP.has(p.id)) continue;
  const c = rename(p.content.raw || '');
  const t = rename(p.title.raw || '');
  if (!c.changes.length && !t.changes.length) continue;
  total += c.changes.length + t.changes.length;
  console.log(`\nPAGE ${p.id} ${p.slug} (${p.status}): ${c.changes.length} in content${t.changes.length ? `, title "${p.title.raw}" → "${t.out}"` : ''}`);
  c.changes.slice(0, 6).forEach((x) => console.log('   ·', x));
  if (c.changes.length > 6) console.log(`   · …and ${c.changes.length - 6} more`);
  if (apply) {
    backup('page', p.id, p.content.raw);
    const r = await wp(`/wp-json/wp/v2/pages/${p.id}`, { method: 'POST', body: JSON.stringify({ content: c.out, title: t.out }) });
    console.log(`   saved: ${r.status}`);
  }
}
const products = (await wp('/wp-json/wc/v3/products?per_page=100&status=publish&_fields=id,name,description,short_description')).json;
for (const p of products) {
  const d = rename(p.description || ''), s = rename(p.short_description || ''), n = rename(p.name || '');
  const k = d.changes.length + s.changes.length + n.changes.length;
  if (!k) continue;
  total += k;
  console.log(`\nPRODUCT ${p.id} ${p.name}: ${k}`);
  [...n.changes, ...s.changes, ...d.changes].slice(0, 6).forEach((x) => console.log('   ·', x));
  if (apply) {
    backup('product', p.id, JSON.stringify({ name: p.name, description: p.description, short_description: p.short_description }));
    const r = await wp(`/wp-json/wc/v3/products/${p.id}`, { method: 'PUT', body: JSON.stringify({ name: n.out, description: d.out, short_description: s.out }) });
    console.log(`   saved: ${r.status}`);
  }
}
console.log(`\n${total} change(s)${apply ? ' applied' : ' (dry run)'}`);
