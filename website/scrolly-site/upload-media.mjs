// Usage: node upload-media.mjs <file-in-assets> [alt text]   Uploads assets/<file> to the WP media library and records it in media-map.json.
import fs from 'fs';
import path from 'path';
import { wp } from './wp-client.mjs';
const [file, alt = ''] = process.argv.slice(2);
const mapFile = './media-map.json';
const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
const ext = path.extname(file).slice(1).toLowerCase();
const mime = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml' }[ext];
const r = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': mime, 'Content-Disposition': `attachment; filename="scrolly-${file}"` }, body: fs.readFileSync('./assets/' + file) });
if (!r.json.id) throw new Error(`upload failed ${r.status} ${JSON.stringify(r.json).slice(0, 200)}`);
if (alt) await wp('/wp-json/wp/v2/media/' + r.json.id, { method: 'POST', body: JSON.stringify({ alt_text: alt }) });
map[file] = { id: r.json.id, url: r.json.source_url, w: r.json.media_details?.width, h: r.json.media_details?.height };
fs.writeFileSync(mapFile, JSON.stringify(map, null, 1));
console.log(file, r.json.id, r.json.source_url, `${map[file].w}x${map[file].h}`);
