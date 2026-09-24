// Usage: node publish.mjs <key> [<key>...]   Publishes dist/<key>.html to the WP page whose id is exported by pages/<key>.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const keys = process.argv.slice(2);
const registry = {};
for (const f of fs.readdirSync(path.join(here, 'pages')).filter((f) => f.endsWith('.mjs'))) {
  const mod = await import(pathToFileURL(path.join(here, 'pages', f)).href);
  const outs = mod.buildAll ? mod.buildAll() : [{ key: f.replace('.mjs', ''), id: mod.id }];
  for (const o of outs) registry[o.key || f.replace('.mjs', '')] = { id: o.id, meta: o.meta };
}
for (const k of keys) {
  const { id, meta } = registry[k] || {};
  if (!id) { console.log('no id for', k); continue; }
  const html = fs.readFileSync(path.join(here, 'dist', k + '.html'), 'utf8');
  const r = await wp(`/wp-json/wp/v2/pages/${id}`, { method: 'POST', body: JSON.stringify(meta ? { content: html, meta } : { content: html }) });
  console.log(k, '->', id, r.status, r.json.modified || JSON.stringify(r.json).slice(0, 200), r.json.link || '');
}
