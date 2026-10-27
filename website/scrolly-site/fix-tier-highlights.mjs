// 2026-10-26: on the $10K and $24K Club pages (304, 306) the block-level highlighted words ("Coming soon.", "They're earned.")
// stretched the marker across the whole column. width:fit-content keeps the highlight on the words, as on the catalog pages.
// Edits LIVE page content (backups saved first). Usage: node fix-tier-highlights.mjs [--apply]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const RULES = ['.s3 .cl-hero h1 em{display:block}', '.s3 .cl-earned h2 em{display:block}'];
for (const id of [304, 306]) {
  const before = (await wp(`/wp-json/wp/v2/pages/${id}?context=edit`)).json.content.raw;
  let raw = before;
  for (const r of RULES) {
    const n = raw.split(r).length - 1;
    if (n !== 1) { console.log(`page ${id}: ${n} match(es) for ${r}, skipped`); continue; }
    raw = raw.replace(r, r.replace('display:block', 'display:block;width:fit-content'));
  }
  if (raw === before) continue;
  if (!process.argv.includes('--apply')) { console.log(`page ${id}: ready`); continue; }
  fs.writeFileSync(path.join(here, '..', 'backups', 'pages', `page-${id}-${new Date().toISOString().replace(/[:.]/g, '-')}.html`), before);
  const r = await wp(`/wp-json/wp/v2/pages/${id}`, { method: 'POST', body: JSON.stringify({ content: raw }) });
  console.log(`page ${id}: saved ${r.status}`);
}
