// 2026-10-27: hero headings brought to one standard (shared rules live in chrome/v3.css). Edits LIVE page content, backups first:
// $1K Club (291) brush moves to "We've got you.", SEO Site Audit (16) gets "without paying for clicks." on the brush,
// homepage (161) hero lines up with the site (rules also in home.css). Chat Manager is rebuilt from pages/chat-manager.mjs.
// Usage: node hero-standard-live.mjs [--apply]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const HOME_AT = '.hp-hero h1 .or{background:none;padding:0}';
const HOME_ADD = `/* hero matches the rest of the site (2026-10-27): left edge, headline size, brush on the italic word, intro size */
.hp .hp-hero .copy{justify-self:start}
.hp .hp-hero h1.one{font-size:clamp(3rem,6vw,6.2rem);line-height:.95;letter-spacing:-.02em}
.hp .hp-hero h1 .or{background:var(--s3-mark);padding:0 .14em;margin:0 -.06em}
.hp .hp-hero .lede{font-size:var(--s3-fs-lede)}
@media(max-width:900px){.hp .hp-hero h1.one{font-size:3rem}}`; // same block as home.css
const EDITS = {
  291: [['<h1><em class="or">Want to start making money online?</em><span>We’ve got you.</span></h1>', '<h1>Want to start making money online? <em class="or">We’ve got you.</em></h1>']],
  16: [['<h1>Find out how to increase your traffic, without paying for clicks.</h1>', '<h1>Find out how to increase your traffic, <em class="or">without paying for clicks.</em></h1>']],
  161: [[HOME_AT, HOME_AT + '\n' + HOME_ADD.trim()]],
};
for (const [id, edits] of Object.entries(EDITS)) {
  const before = (await wp(`/wp-json/wp/v2/pages/${id}?context=edit`)).json.content.raw;
  let raw = before;
  for (const [a, b] of edits) {
    if (raw.includes(b)) { console.log(id, 'already applied'); continue; }
    if (raw.split(a).length !== 2) throw new Error(`page ${id}: anchor not found once: ${a.slice(0, 60)}`);
    raw = raw.replace(a, b);
  }
  if (raw === before || !process.argv.includes('--apply')) { console.log(id, raw === before ? 'no change' : 'ready'); continue; }
  fs.writeFileSync(path.join(here, '..', 'backups', 'pages', `page-${id}-${new Date().toISOString().replace(/[:.]/g, '-')}.html`), before);
  console.log(id, 'saved', (await wp(`/wp-json/wp/v2/pages/${id}`, { method: 'POST', body: JSON.stringify({ content: raw }) })).status);
}
