// Usage: node og/publish.mjs [--reupload]
// 1) Uploads og/out/<key>.jpg share cards to the WP media library (once per key; --reupload replaces the record),
// 2) pushes titles/descriptions/images as JSON to the private page "Scrolly link previews data",
// 3) writes og/wpcode-og-snippet.php (paste ONCE into WPCode; later data changes only need this script).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from '../wp-client.mjs';
import { DEFAULT, PAGES } from './og-data.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const mediaFile = path.join(here, 'media.json');
const idsFile = path.join(here, 'ids.json');
const media = fs.existsSync(mediaFile) ? JSON.parse(fs.readFileSync(mediaFile, 'utf8')) : {};
const ids = fs.existsSync(idsFile) ? JSON.parse(fs.readFileSync(idsFile, 'utf8')) : {};
const reupload = process.argv.includes('--reupload');

for (const e of [DEFAULT, ...PAGES]) {
  if (media[e.key] && !reupload) continue;
  const r = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': 'image/jpeg', 'Content-Disposition': `attachment; filename="scrolly-og-${e.key}.jpg"` }, body: fs.readFileSync(path.join(here, 'out', e.key + '.jpg')) });
  if (!r.json.id) throw new Error(`upload ${e.key} failed ${r.status} ${JSON.stringify(r.json).slice(0, 200)}`);
  await wp('/wp-json/wp/v2/media/' + r.json.id, { method: 'POST', body: JSON.stringify({ alt_text: e.title }) });
  media[e.key] = { id: r.json.id, url: r.json.source_url, w: r.json.media_details?.width, h: r.json.media_details?.height };
  fs.writeFileSync(mediaFile, JSON.stringify(media, null, 1));
  console.log('uploaded', e.key, r.json.id);
}

const pack = (e) => ({ title: e.title, desc: e.desc, image: media[e.key].url, w: media[e.key].w, h: media[e.key].h });
const data = { default: pack(DEFAULT), pages: Object.fromEntries(PAGES.map((e) => [String(e.id), pack(e)])) };
const body = JSON.stringify({ title: 'Scrolly link previews data', content: JSON.stringify(data), status: 'private', slug: 'scrolly-og-data', comment_status: 'closed' });
const r = ids.data ? await wp(`/wp-json/wp/v2/pages/${ids.data}`, { method: 'POST', body }) : await wp('/wp-json/wp/v2/pages', { method: 'POST', body });
if (!r.json.id) throw new Error('data page failed ' + JSON.stringify(r.json).slice(0, 200));
ids.data = r.json.id;
fs.writeFileSync(idsFile, JSON.stringify(ids, null, 1));
// Read back the raw content and make sure WordPress stored valid JSON.
const back = await wp(`/wp-json/wp/v2/pages/${ids.data}?context=edit&_fields=content`);
const parsed = JSON.parse(back.json.content.raw);
console.log('data page', ids.data, 'entries', Object.keys(parsed.pages).length, 'json ok');

const tpl = fs.readFileSync(path.join(here, 'snippet.php.tpl'), 'utf8').replace('__DATA_ID__', ids.data);
fs.writeFileSync(path.join(here, 'wpcode-og-snippet.php'), tpl);
console.log('snippet written: og/wpcode-og-snippet.php');
