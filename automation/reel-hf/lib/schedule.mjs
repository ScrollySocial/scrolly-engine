// Posting order for the review hub, copied from Notion (the Content Pipeline row's Publish Order / Publish Date).
// Notion is the only place the order is set: whenever Claude reads the "Reels to edit" view (overnight run, or by
// hand), it records each Reel's values here so http://localhost:4320 can number the Reels. Never edit by hand.
// Usage: node lib/schedule.mjs <reel> [order=<number>] [date=<yyyy-mm-dd or ISO>]   (missing = not scheduled)
//        node lib/schedule.mjs --show
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'schedule.json');
export const readSchedule = () => { try { return JSON.parse(readFileSync(FILE, 'utf8')); } catch { return {}; } };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [slug, ...kv] = process.argv.slice(2);
  const all = readSchedule();
  if (slug === '--show' || !slug) { console.log(JSON.stringify(all, null, 1)); process.exit(0); }
  if (!existsSync(path.join(ROOT, slug, 'build.mjs'))) throw new Error(`no Reel folder ${slug}`);
  const v = Object.fromEntries(kv.map((x) => x.split('=')));
  const order = v.order && v.order !== '-' ? +v.order : null, date = v.date && v.date !== '-' ? v.date : null;
  all[slug] = { order: Number.isFinite(order) ? order : null, date, synced: new Date().toISOString() };
  writeFileSync(FILE, JSON.stringify(all, null, 1) + '\n');
  console.log(`${slug}: ${order != null ? '#' + order : 'no order'}${date ? ' · ' + date : ''}`);
}
