// 2026-10-27: the homepage highlights ("They're earned.", "More selling.") still used the old flat sky bar; they now use the
// same highlighter swipe as every other page (--s3-mark from chrome/v3.css). home.css carries the same change.
// Edits LIVE page 161 (backup saved first). Usage: node home-marker.mjs [--apply]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const OLD = '.hp .or{color:var(--ink);background:linear-gradient(transparent 60%,var(--sky) 60%,var(--sky) 90%,transparent 90%);-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:0 .08em}';
const NEW = '.hp .or{color:var(--ink);background:var(--s3-mark);-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:0 .14em;margin:0 -.06em}';
const before = (await wp('/wp-json/wp/v2/pages/161?context=edit')).json.content.raw;
const n = before.split(OLD).length - 1;
if (n !== 1) { console.log('match count', n, '(already applied?)'); process.exit(0); }
if (process.argv.includes('--apply')) {
  fs.writeFileSync(path.join(here, '..', 'backups', 'pages', `page-161-${new Date().toISOString().replace(/[:.]/g, '-')}.html`), before);
  const r = await wp('/wp-json/wp/v2/pages/161', { method: 'POST', body: JSON.stringify({ content: before.replace(OLD, NEW) }) });
  console.log('page 161 saved', r.status);
}
