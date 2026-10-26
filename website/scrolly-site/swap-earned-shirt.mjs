// Earned $1K shirt (2026-10-26): the chambray "Dared to Succeed" shirt replaces the graphite one on the homepage Earned band
// (option B: framed model photo) and the /1k-club/ page. Edits LIVE page content (backups saved first).
// Usage: node swap-earned-shirt.mjs           dry run (counts matches)
//        node swap-earned-shirt.mjs --apply   backs up and saves pages 161 and 291
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wp } from './wp-client.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes('--apply');
const U = 'https://theambitiondepartment.com/wp-content/uploads/2026/10/';
const MODEL = `${U}shirt-1k-dared-model.webp`;
const CUT = `${U}shirt-1k-dared-front-cut.webp`;
const ALT_MODEL = 'A woman wearing the chambray $1K Challenge earned shirt: a knight riding a leaping tiger above Dared to Succeed.';
const ALT_CUT = 'Front of the chambray $1K Challenge earned shirt: a knight riding a leaping tiger above Dared to Succeed.';
const FRAME = 'border:12px solid #fff;border-radius:6px;box-shadow:0 24px 50px rgba(10,25,48,.35);transform:rotate(2.5deg);aspect-ratio:1/1;object-fit:cover;width:100%;max-width:420px;height:auto';

export const EDITS = {
  161: [
    [`<img class="cut" src="${U}scrolly-shirt-1k-graphite-front-cut-clean.webp" alt="The graphite $1K Club winner shirt: a white line tiger above The $1k Club and Earn your stripes." width="1553" height="1594" loading="lazy">`,
      `<img class="cut framed" src="${MODEL}" alt="${ALT_MODEL}" width="1200" height="1200" loading="lazy" style="${FRAME}">`, 1],
  ],
  291: [
    [`<img src="${U}scrolly-shirt-1k-graphite-front-cut.webp" alt="Stripe shirt" width="1553" height="1594" loading="lazy">`,
      `<img src="${CUT}" alt="Stripe shirt" width="1600" height="1435" loading="lazy">`, 1],
    [`<img src="${U}scrolly-shirt-1k-graphite-front-cut.webp" alt="Front of the graphite $1K Club winner shirt: a white line tiger above The $1k Club and Earn your stripes." width="1553" height="1594" loading="lazy">`,
      `<img src="${CUT}" alt="${ALT_CUT}" width="1600" height="1435" loading="lazy">`, 1],
    [`<img src="${U}scrolly-shirt-1k-graphite-model.webp" alt="A man wearing the graphite $1K Club winner shirt." width="1400" height="1400" loading="lazy">`,
      `<img src="${MODEL}" alt="${ALT_MODEL}" width="1200" height="1200" loading="lazy">`, 1],
    // Slider covers still showed the old Scrolly wordmark; rebuilt from the renamed PDFs (make_cover_cards.py).
    [`${U}scrolly-k1-cover-playbook-fill.webp`, `${U}k1-cover-playbook-tad.webp`, 1],
    [`${U}scrolly-k1-cover-quality-tips-fill-1.webp`, `${U}k1-cover-quality-tips-tad.webp`, 1],
  ],
};

if (process.argv[1] && process.argv[1].endsWith('swap-earned-shirt.mjs')) {
  for (const [id, edits] of Object.entries(EDITS)) {
    let raw = (await wp(`/wp-json/wp/v2/pages/${id}?context=edit`)).json.content.raw;
    for (const [from, to, want] of edits) {
      const n = raw.split(from).length - 1;
      if (n !== want) throw new Error(`page ${id}: expected ${want} match, found ${n}: ${from.slice(0, 90)}`);
      raw = raw.split(from).join(to);
    }
    console.log(`page ${id}: ${edits.length} edit(s) match`);
    if (!apply) continue;
    const dir = path.join(here, '..', 'backups', 'pages');
    const before = (await wp(`/wp-json/wp/v2/pages/${id}?context=edit`)).json.content.raw;
    fs.writeFileSync(path.join(dir, `page-${id}-${new Date().toISOString().replace(/[:.]/g, '-')}.html`), before);
    const r = await wp(`/wp-json/wp/v2/pages/${id}`, { method: 'POST', body: JSON.stringify({ content: raw }) });
    console.log(`page ${id}: saved ${r.status}`);
  }
}
