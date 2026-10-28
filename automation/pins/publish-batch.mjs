// Uploads an approved batch's Pin images to WordPress media and writes Pinterest's bulk-create CSV.
// Usage: node publish-batch.mjs batch-01
//  1) uploads out/<batch>/<pin id>.png once each (record kept in batches/<batch>-media.json; never delete these files,
//     Pinterest fetches each image when the Pin publishes)
//  2) checks every row: board on the allowed list, title <= 100, description <= 500, date format, future date,
//     image URL and link both return 200
//  3) writes out/<batch>/<batch>.csv and copies it to OneDrive Scrolly Media/exports/pins/ for upload on desktop
//     (pinterest.com Settings > Import content > Upload .csv)
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { HERE } from './lib/templates.mjs';
import { wp } from '../../website/scrolly-site/wp-client.mjs';

// Optional: --pins 16-30 writes a CSV with only those Pin numbers (e.g. to re-add Pins deleted on Pinterest).
const batch = process.argv[2];
if (!batch) { console.log('Usage: node publish-batch.mjs <batch, e.g. batch-01> [--pins 16-30]'); process.exit(1); }
const dir = path.join(HERE, 'out', batch);
const pinsArg = process.argv[process.argv.indexOf('--pins') + 1];
const [lo, hi] = process.argv.includes('--pins') ? pinsArg.split('-').map(Number) : [1, Infinity];
const rows = JSON.parse(readFileSync(path.join(dir, 'batch.json'), 'utf8')).filter((r) => { const n = Number(r.id.slice(4, 6)); return n >= lo && n <= (hi || lo); });
const csvName = process.argv.includes('--pins') ? `${batch}-pins-${pinsArg}` : batch;
const recFile = path.join(HERE, 'batches', batch + '-media.json');
mkdirSync(path.dirname(recFile), { recursive: true });
const rec = existsSync(recFile) ? JSON.parse(readFileSync(recFile, 'utf8')) : {};
const BOARDS = ['Small Business Goal Setting', 'Pricing your Products and Services', 'Website SEO for Small Business', 'Business Marketing Ideas',
  'Social Media Content Planning', 'Instagram Growth Tips for Small Businesses', 'Instagram DM Automation', 'CapCut Reel Templates',
  'Instagram Reel Ideas for Businesses', 'Instagram Carousel and Canva Templates', 'AI Tools for Small Business', 'Holiday Marketing Ideas for Small Business',
  'Pinterest Marketing for Small Business'];

// 1. Upload.
// The host often answers 502 while the upload still lands (2026-10-27), so after an error look the file up by name
// before trying again; that way a retry never makes a duplicate.
const findUploaded = async (id) => {
  const s = await wp(`/wp-json/wp/v2/media?search=${encodeURIComponent(id)}&per_page=5&_fields=id,source_url`);
  return Array.isArray(s.json) ? s.json.find((m) => m.source_url.endsWith('/' + id + '.png')) : null;
};
for (const r of rows) {
  if (rec[r.id]) continue;
  let m = null;
  for (let tries = 0; tries < 3 && !m; tries++) {
    m = await findUploaded(r.id);
    if (m) break;
    const r1 = await wp('/wp-json/wp/v2/media', { method: 'POST', headers: { 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename="${r.id}.png"` }, body: readFileSync(path.join(dir, r.id + '.png')) });
    if (r1.json?.id) m = r1.json;
    else { console.log(`retry  ${r.id} (${r1.status})`); await new Promise((ok) => setTimeout(ok, 8000)); }
  }
  if (!m) throw new Error(`upload ${r.id} failed 3 times`);
  await wp('/wp-json/wp/v2/media/' + m.id, { method: 'POST', body: JSON.stringify({ alt_text: r.title, title: 'Pinterest Pin: ' + r.title }) });
  rec[r.id] = { media: m.id, url: m.source_url };
  writeFileSync(recFile, JSON.stringify(rec, null, 1) + '\n');
  console.log('upload ' + r.id + ' -> ' + m.id);
}

// 2. Checks.
const errs = [];
const now = Date.now();
// One request at a time with a pause, retrying a 5xx: the shared host 502s when hit quickly (2026-10-27).
const status = async (u) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((ok) => setTimeout(ok, 1200 * (i + 1)));
    try { const s = (await fetch(u, { method: 'GET', redirect: 'follow' })).status; if (s < 500) return s; } catch {}
  }
  return 502;
};
for (const r of rows) {
  if (!BOARDS.includes(r.board)) errs.push(`${r.id}: board "${r.board}" is not one of her boards`);
  if (r.title.length > 100) errs.push(`${r.id}: title too long`);
  if (r.description.length > 500) errs.push(`${r.id}: description too long`);
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(r.date)) errs.push(`${r.id}: bad date ${r.date}`);
  if (Date.parse(r.date + 'Z') < now + 3600e3) errs.push(`${r.id}: publish date ${r.date} UTC is not at least an hour away (move START in the batch script)`);
  const img = await status(rec[r.id].url), link = await status(r.url);
  if (img !== 200) errs.push(`${r.id}: image URL returns ${img}`);
  if (link !== 200) errs.push(`${r.id}: link returns ${link}`);
}
if (new Set(rows.map((r) => r.title)).size !== rows.length) errs.push('duplicate titles');
if (errs.length) { errs.forEach((e) => console.log('ERROR  ' + e)); process.exit(1); }

// 3. CSV (column names from Pinterest's bulk upload help page; Thumbnail is for video only, so blank).
const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
const csv = ['Title,Media URL,Pinterest board,Thumbnail,Description,Link,Publish date,Keywords',
  ...rows.map((r) => [r.title, rec[r.id].url, r.board, '', r.description, r.url, r.date, r.keywords].map(q).join(','))].join('\r\n') + '\r\n';
const out = path.join(dir, csvName + '.csv');
writeFileSync(out, csv);
const od = 'C:/Users/merce/OneDrive/Scrolly Media/exports/pins';
mkdirSync(od, { recursive: true });
copyFileSync(out, path.join(od, `pinterest-${csvName}.csv`));
console.log(`csv    ${rows.length} rows, all checks passed -> ${path.join(od, `pinterest-${csvName}.csv`)}`);
