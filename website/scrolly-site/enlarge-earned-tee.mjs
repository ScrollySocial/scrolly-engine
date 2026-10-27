// 2026-10-26: the /1k-club/ earned band (page 291) shows the cut-out shirt bigger than the model photo beside it.
// Edits LIVE page content (backup saved first). Usage: node enlarge-earned-tee.mjs [--apply]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const AT = '.s3 .cl-tees img{width:50%;border-radius:6px}';
const ADD = '\n.s3 .cl-tees img:first-child{width:56%;transform:scale(1.3);position:relative;z-index:1}\n.s3 .cl-tees img:last-child{width:44%}';
const before = (await wp('/wp-json/wp/v2/pages/291?context=edit')).json.content.raw;
if (before.includes(ADD.trim().split('\n')[0])) { console.log('already applied'); process.exit(0); }
if (before.split(AT).length !== 2) throw new Error('anchor rule not found exactly once');
if (process.argv.includes('--apply')) {
  fs.writeFileSync(path.join(here, '..', 'backups', 'pages', `page-291-${new Date().toISOString().replace(/[:.]/g, '-')}.html`), before);
  const r = await wp('/wp-json/wp/v2/pages/291', { method: 'POST', body: JSON.stringify({ content: before.replace(AT, AT + ADD) }) });
  console.log('page 291 saved', r.status);
}
