// One-time copy of the Notion Content Pipeline into data/ideas.json (Mercedes 2026-10-27).
// Claude reads the Pipeline through its saved view "All rows (planner copy)"
// (view://406ab38f-4c58-81a3-a23a-000c76e8df8d), saves each page of results, then:
//   node automation/planner/import-notion.mjs <page1.json> [page2.json ...]
// A card that already has the row's notionId is updated: Notion fills the fields, but any lane the
// planner already has (Buffer ids, newer stages) is kept. Prints what it did; changes nothing in Notion.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanIdea } from './lib/ideas.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const FILE = join(here, 'data', 'ideas.json');

const STAGE = {
  Idea: 'Idea', Approved: 'Idea', Research: 'Idea', Script: 'Script', Film: 'Film', Edit: 'Edit', Ready: 'Ready',
  Scheduled: 'Scheduled', Published: 'Posted', Analyze: 'Posted', Repurpose: 'Posted', Complete: 'Posted',
};
const FORMAT = { Reel: 'Reel', Short: 'Short', Carousel: 'Carousel', 'YouTube Long-form': 'YouTube long-form', Live: 'Live' };
const LANE = { Instagram: 'instagram', TikTok: 'tiktok', YouTube: 'youtube', Pinterest: 'pinterest' };
// Fields with a planner home; everything else non-empty goes to fromNotion.
const MAPPED = new Set(['Content', 'Status', 'Format', 'Platforms', 'Hook', 'CTA', 'Notes', 'Filming Notes', 'Edit Notes',
  'Product', 'Series', 'Script / Working File', 'Research / Source File', 'userDefined:URL', 'Publish Order',
  'Carousel ID', 'Media Used', 'Instagram Caption', 'TikTok Caption', 'YouTube Title', 'YouTube Description',
  'Pinterest Title', 'Pinterest Description', 'url', 'date:Publish Date:start', 'date:Publish Date:end',
  'date:Publish Date:is_datetime', 'date:Expiration Date:is_datetime']);

// Notion's text comes back Markdown-escaped (\$, \[) with <br /> line breaks.
const txt = (v) => (v == null ? '' : String(v)).replace(/\\([\\`*_{}[\]()#+\-.!$|<>~])/g, '$1').replace(/<br\s*\/?>/g, '\n').trim();
const list = (v) => {
  try {
    return JSON.parse(v || '[]');
  } catch {
    return [];
  }
};

function toIdea(r) {
  const formats = list(r.Format);
  const platforms = list(r.Platforms);
  const stage = STAGE[r.Status] || 'Idea';
  const date = (r['date:Publish Date:start'] || '').slice(0, 10);
  let lanes = platforms.map((p) => LANE[p]).filter(Boolean);
  if (!lanes.length) {
    // No platforms ticked: go by format (lives run on YouTube since 2026-10-21)
    if (formats.includes('YouTube Long-form') || formats.includes('Live')) lanes = ['youtube'];
    else if (formats.length) lanes = ['instagram'];
  }
  const lane = (p) => ({
    stage: p === 'pinterest' ? 'Needs Pins' : stage,
    date,
    caption: p === 'instagram' ? txt(r['Instagram Caption']) : p === 'tiktok' ? txt(r['TikTok Caption']) : p === 'youtube' ? txt(r['YouTube Description']) : '',
    title: p === 'youtube' ? txt(r['YouTube Title']) : '',
  });
  const notes = [
    txt(r.Notes),
    r['Filming Notes'] && `Filming notes: ${txt(r['Filming Notes'])}`,
    r['Edit Notes'] && `Edit notes: ${txt(r['Edit Notes'])}`,
    r['Pinterest Title'] && `Pinterest title: ${txt(r['Pinterest Title'])}`,
    r['Pinterest Description'] && `Pinterest description: ${txt(r['Pinterest Description'])}`,
    platforms.some((p) => !LANE[p]) && `Also planned in Notion for: ${platforms.filter((p) => !LANE[p]).join(', ')}`,
    formats.length > 1 && `Notion formats: ${formats.join(', ')}`,
    r.Status && STAGE[r.Status] !== r.Status && `Notion status was ${r.Status}`,
  ].filter(Boolean).join('\n\n');
  const extras = {};
  for (const [k, v] of Object.entries(r)) {
    if (MAPPED.has(k) || v === '' || v == null || v === 0 || v === '[]') continue;
    extras[k.replace(/^date:(.*):start$/, '$1')] = txt(Array.isArray(list(v)) && String(v).startsWith('[') ? list(v).join(', ') : v);
  }
  return {
    title: txt(r.Content),
    format: FORMAT[formats.find((f) => FORMAT[f])] || '',
    hook: txt(r.Hook),
    cta: txt(r.CTA),
    notes,
    product: list(r.Product).map(txt).join(', '),
    series: txt(r.Series),
    link: txt(r['Script / Working File'] || r['Research / Source File'] || r['userDefined:URL']),
    order: r['Publish Order'] ?? null,
    carouselId: txt(r['Carousel ID']),
    mediaUsed: txt(r['Media Used']),
    notionId: r.url.slice(-32),
    fromNotion: extras,
    lanes: Object.fromEntries(lanes.map((p) => [p, lane(p)])),
  };
}

const rows = process.argv.slice(2).flatMap((f) => JSON.parse(readFileSync(f, 'utf8')).results);
const data = JSON.parse(readFileSync(FILE, 'utf8'));
let added = 0;
let merged = 0;
for (const r of rows) {
  const input = toIdea(r);
  const i = data.ideas.findIndex((x) => x.notionId === input.notionId);
  if (i >= 0) {
    const old = data.ideas[i];
    for (const [p, l] of Object.entries(old.lanes)) if (l) input.lanes[p] = l; // the planner's lanes win
    data.ideas[i] = cleanIdea(input, { ...old, fromNotion: null });
    merged++;
  } else {
    data.ideas.push(cleanIdea(input));
    added++;
  }
}
writeFileSync(`${FILE}.tmp`, JSON.stringify(data, null, 1));
renameSync(`${FILE}.tmp`, FILE);
console.log(`${rows.length} Notion rows: ${added} added, ${merged} merged into existing cards. ${data.ideas.length} cards now.`);
