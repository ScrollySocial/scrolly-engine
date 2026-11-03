// Makes the label-maker quotes (out/quotes-labels, Mercedes picked them 2026-11-03) the real quote posts for the cards
// still waiting to post: keeps the old image in out/quotes-old, copies the new one into OneDrive exports, hosts it in
// WordPress media as tad-quote-<n>-label.png (looks first, so a rerun never duplicates) and points the planner card's
// mediaUrl at it. Quotes 1 and 3 are already posted on Instagram and stay as they are.
// Usage: node swap-labels.mjs
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cfg } from '../carousels/lib/common.mjs';
import { wp } from '../../website/scrolly-site/wp-client.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EXPORTS = path.resolve(cfg('media').exportsDir, '../ig-posts/quotes');
const NEW = path.join(HERE, 'out', 'quotes-labels'), OLD = path.join(HERE, 'out', 'quotes-old');
const TRACKER = path.join(HERE, '../planner/tracker.mjs');
const REC = path.join(HERE, 'wp-media.json');
const rec = existsSync(REC) ? JSON.parse(readFileSync(REC, 'utf8')) : {};
mkdirSync(OLD, { recursive: true });

const cards = execFileSync('node', [TRACKER, 'find', 'Quote'], { encoding: 'utf8' }).split('\n')
  .map((l) => l.match(/^(\w+)\s+(Quote \d+:.*?)\s+\[/)).filter(Boolean)
  .map(([, id]) => JSON.parse(execFileSync('node', [TRACKER, 'show', id], { encoding: 'utf8' })));
const find = async (n) => {
  const s = (await wp(`/wp-json/wp/v2/media?search=${encodeURIComponent(n)}&per_page=10&_fields=id,source_url`)).json;
  return Array.isArray(s) ? s.find((x) => x.source_url.endsWith(`/${n}.png`)) : null;
};

for (let n = 4; n <= 14; n++) {
  const card = cards.find((c) => new RegExp(`^Quote ${n}:`).test(c.title));
  if (!card) { console.log(`quote ${n}: no planner card, skipped`); continue; }
  const exp = path.join(EXPORTS, `quote-${n}.png`);
  if (existsSync(exp) && !existsSync(path.join(OLD, `quote-${n}.png`))) copyFileSync(exp, path.join(OLD, `quote-${n}.png`));
  copyFileSync(path.join(NEW, `quote-${n}.png`), exp);
  copyFileSync(path.join(NEW, `quote-${n}.png`), path.join(HERE, 'out', 'quotes', `quote-${n}.png`));

  const name = `tad-quote-${n}-label`;
  let hit = await find(name);
  if (!hit) {
    const r = await wp('/wp-json/wp/v2/media', {
      method: 'POST',
      headers: { 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename="${name}.png"` },
      body: readFileSync(exp),
    });
    hit = r.status < 300 ? r.json : await find(name); // the host can answer 502 on uploads that still land
    if (!hit) throw new Error(`Upload failed for quote ${n} (${r.status})`);
    await wp(`/wp-json/wp/v2/media/${hit.id}`, { method: 'POST', body: JSON.stringify({ alt_text: card.title.replace(/^Quote \d+: /, ''), title: `Quote ${n} (label)` }) });
  }
  rec[`quote-${n}`] = { id: hit.id, url: hit.source_url, uploadedAt: rec[`quote-${n}`]?.uploadedAt || new Date().toISOString() };
  writeFileSync(REC, JSON.stringify(rec, null, 1) + '\n');

  const patch = path.join(OLD, `.patch-${n}.json`);
  writeFileSync(patch, JSON.stringify({ mediaUrl: hit.source_url }));
  execFileSync('node', [TRACKER, 'update', card.id, patch]);
  console.log(`quote ${n}: ${card.id} -> ${hit.source_url}`);
}
