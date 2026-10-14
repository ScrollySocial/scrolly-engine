// Usage: node backup-page.mjs <pageId>   Saves the live page's raw content to ../backups/pages/<id>-<timestamp>.html before a publish.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const id = process.argv[2];
const r = await wp(`/wp-json/wp/v2/pages/${id}?context=edit`);
if (r.status !== 200) throw new Error('fetch failed ' + r.status);
const dir = path.join(here, '..', 'backups', 'pages');
fs.mkdirSync(dir, { recursive: true });
const f = path.join(dir, `${id}-${new Date().toISOString().replace(/[:.]/g, '-')}.html`);
fs.writeFileSync(f, r.json.content.raw);
console.log('saved', f, (r.json.content.raw.length / 1024).toFixed(1) + 'KB', 'modified', r.json.modified);
