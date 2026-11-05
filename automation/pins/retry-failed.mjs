// Re-uploads Pins that Pinterest's bulk upload rejected, slotted into the gaps of what is already scheduled.
// Usage: node retry-failed.mjs <folder in out/> <first day YYYY-MM-DD> [batch-05:6,16-34 batch-02:12 ...]
//   out/<folder>/scheduled.json = what Pinterest already has queued: [["YYYY-MM-DD", hour Eastern, link path], ...]
//   (read it from Pinterest's /v3/users/me/scheduledpins/ in a logged-in tab). Writes out/<folder>/<folder>.csv.
// Why rows fail: Pinterest rejects a row as "Duplicate Pin link" when an earlier row in the same CSV has the same
// link (found 2026-11-05). Every link here gets its own utm_content, and each day gets 5 Pins with no link twice.
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { HERE } from './lib/templates.mjs';

const [folder, firstDay, ...specs] = process.argv.slice(2);
if (!folder || !firstDay || !specs.length) { console.log('Usage: node retry-failed.mjs <folder> <first day> batch-05:6,16-34 ...'); process.exit(1); }
const dir = path.join(HERE, 'out', folder);
const pathOf = (u) => new URL(u).pathname;
const nums = (s) => s.split(',').flatMap((p) => { const [a, b] = p.split('-').map(Number); return Array.from({ length: (b || a) - a + 1 }, (_, i) => a + i); });
const pins = specs.flatMap((s) => {
  const [batch, list] = s.split(':');
  const rows = JSON.parse(readFileSync(path.join(HERE, 'out', batch, 'batch.json'), 'utf8'));
  const rec = JSON.parse(readFileSync(path.join(HERE, 'batches', batch + '-media.json'), 'utf8'));
  return nums(list).map((n) => { const r = rows[n - 1]; return { ...r, media: rec[r.id].url }; });
});

// Day by day from firstDay: top each day up to 5, never the same link path twice in a day.
const sched = JSON.parse(readFileSync(path.join(dir, 'scheduled.json'), 'utf8'));
const HOURS = [8, 11, 14, 17, 20, 10, 13, 16, 19, 9]; // Eastern; the first five are the usual slots
const left = [...pins], out = [];
for (let d = new Date(firstDay + 'T12:00:00Z'); left.length; d.setUTCDate(d.getUTCDate() + 1)) {
  const day = d.toISOString().slice(0, 10);
  const taken = sched.filter((s) => s[0] === day);
  const used = new Set(taken.map((s) => s[2]));
  const hours = HOURS.filter((h) => !taken.some((s) => s[1] === h));
  for (let k = taken.length; k < 5 && left.length; k++) {
    let i = left.findIndex((p) => !used.has(pathOf(p.url)));
    if (i < 0) i = 0; // only one topic left: allow it rather than leave a gap
    const p = left.splice(i, 1)[0];
    used.add(pathOf(p.url));
    const h = hours.shift();
    // Eastern is UTC-5 from Nov 2 (standard time).
    const utc = new Date(Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10), h + 5));
    out.push({ ...p, date: utc.toISOString().slice(0, 19), et: `${day} ${h}:00` });
  }
}

const link = (p) => p.url + (p.url.includes('?') ? '&' : '?') + 'utm_content=' + p.id;
if (new Set(out.map(link)).size !== out.length) throw new Error('two rows share a link');
for (const p of out) {
  for (const u of [p.media, link(p)]) {
    const s = (await fetch(u)).status;
    if (s !== 200) throw new Error(`${p.id}: ${u} returns ${s}`);
  }
}
const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
const csv = ['Title,Media URL,Pinterest board,Thumbnail,Description,Link,Publish date,Keywords',
  ...out.map((p) => [p.title, p.media, p.board, p.video ? '00:01' : '', p.description, link(p), p.date, p.keywords].map(q).join(','))].join('\r\n') + '\r\n';
writeFileSync(path.join(dir, folder + '.csv'), csv);
copyFileSync(path.join(dir, folder + '.csv'), `C:/Users/merce/OneDrive/Scrolly Media/exports/pins/pinterest-${folder}.csv`);
out.forEach((p) => console.log(p.et.padEnd(17), p.video ? 'V' : ' ', pathOf(p.url).padEnd(42), p.title));
console.log(`${out.length} rows -> OneDrive Scrolly Media/exports/pins/pinterest-${folder}.csv`);
