// Publish a sales page built with `node build-previews.mjs --live` to scrollyseo.com.
// Usage: node publish-live.mjs halloween|physical [--status publish|draft]
// Uploads each {{img:file}} from img/ once (ids kept in live-media.json), wraps the page in one wp:html block, and creates
// the WP page (or updates it when live-pages.json already has its id). Page settings copy the $1K Club page (291).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { wp } from '../../../website/scrolly-site/wp-client.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PAGES = {
  halloween: { file: 'halloween-sales-live.html', title: 'Halloween Reel Templates', slug: 'halloween-reels' },
  physical: { file: 'physical-sales-live.html', title: 'Product Reel Templates', slug: 'product-reels' },
};
const key = process.argv[2];
const page = PAGES[key];
if (!page) throw new Error('usage: node publish-live.mjs halloween|physical');
const si = process.argv.indexOf('--status');
const status = si > 0 ? process.argv[si + 1] : 'publish';

const mediaFile = path.join(here, 'live-media.json');
const pagesFile = path.join(here, 'live-pages.json');
const media = fs.existsSync(mediaFile) ? JSON.parse(fs.readFileSync(mediaFile, 'utf8')) : {};
const pages = fs.existsSync(pagesFile) ? JSON.parse(fs.readFileSync(pagesFile, 'utf8')) : {};
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', mp4: 'video/mp4' };

let html = fs.readFileSync(path.join(here, page.file), 'utf8');
for (const f of [...new Set([...html.matchAll(/\{\{img:([^}]+)\}\}/g)].map((m) => m[1]))]) {
  if (!media[f]) {
    const r = await wp('/wp-json/wp/v2/media', { method: 'POST', body: fs.readFileSync(path.join(here, 'img', f)),
      headers: { 'Content-Type': MIME[path.extname(f).slice(1)], 'Content-Disposition': `attachment; filename="scrolly-reels-${f}"` } });
    if (r.status !== 201) throw new Error(`upload ${f}: ${r.status} ${JSON.stringify(r.json).slice(0, 200)}`);
    media[f] = { id: r.json.id, url: r.json.source_url };
    fs.writeFileSync(mediaFile, JSON.stringify(media, null, 1));
    console.log('uploaded', f, r.json.id);
  }
  html = html.split(`{{img:${f}}}`).join(media[f].url);
}
// one line, no CSS comments (WordPress turns blank lines into <p> tags)
html = html.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*/g, ' ').replace(/> </g, '><').trim();
if (/<script[\s\S]*?&[\s\S]*?<\/script>/.test(html)) throw new Error('a page script contains &, which WordPress mangles');
const content = `<!-- wp:html -->\n${html}\n<!-- /wp:html -->`;

const ref = (await wp('/wp-json/wp/v2/pages/291?context=edit&_fields=template,meta,comment_status')).json;
const body = { title: page.title, slug: page.slug, status, content, template: ref.template || '', comment_status: 'closed' };
const r = pages[key]
  ? await wp(`/wp-json/wp/v2/pages/${pages[key]}`, { method: 'POST', body: JSON.stringify(body) })
  : await wp('/wp-json/wp/v2/pages', { method: 'POST', body: JSON.stringify(body) });
if (![200, 201].includes(r.status)) throw new Error(`page: ${r.status} ${JSON.stringify(r.json).slice(0, 300)}`);
pages[key] = r.json.id;
fs.writeFileSync(pagesFile, JSON.stringify(pages, null, 1));
console.log(key, '->', r.json.id, r.json.status, r.json.link, 'template:', ref.template || '(default)');
