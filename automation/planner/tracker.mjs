// The planner's Ideas, from the command line: what the nightly Reel run and the skills use in place of the
// Notion Content Pipeline (switched 2026-10-27). Works with or without the planner server running.
//   node tracker.mjs reels-to-edit         Reels to draft: Format Reel, Instagram lane at Edit, by posting order (JSON)
//   node tracker.mjs show <id>             one card (JSON)
//   node tracker.mjs find <text>           cards whose title, hook or notes contain the text (id + title + stages)
//   node tracker.mjs list [format=Carousel] [stage=Idea] [platform=instagram]
//                                          cards matching all filters given (stage on that platform, or any lane)
//   node tracker.mjs update <id> <patch>   merge a JSON patch file into a card
//   node tracker.mjs new <patch>           make a card from a JSON patch file, prints its id
// Patch: any card fields (title, hook, cta, series, product, link, filmingNotes, editNotes, reelFolder, mediaUrl,
// mediaUsed, order, format), "notesAppend": "text" to add a paragraph to notes, and
// "lanes": { "instagram": { "stage": "Scheduled", "date": "2026-10-30", "caption": "...", "bufferId": "..." } }
// (only the lane fields given change; "instagram": null takes the platform off).
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanIdea } from './lib/ideas.mjs';

const FILE = join(dirname(fileURLToPath(import.meta.url)), 'data', 'ideas.json');
const load = () => JSON.parse(readFileSync(FILE, 'utf8'));
function save(data) {
  writeFileSync(`${FILE}.tmp`, JSON.stringify(data, null, 1));
  renameSync(`${FILE}.tmp`, FILE);
}
const out = (v) => console.log(JSON.stringify(v, null, 1));
const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};
const stages = (i) => Object.entries(i.lanes).filter(([, l]) => l).map(([p, l]) => `${p} ${l.stage}`).join(', ');

function applyPatch(idea, patch) {
  const next = { ...idea, ...patch, lanes: { ...idea.lanes } };
  delete next.notesAppend;
  if (patch.notesAppend) next.notes = [idea.notes, patch.notesAppend].filter(Boolean).join('\n\n');
  for (const [p, l] of Object.entries(patch.lanes || {})) next.lanes[p] = l === null ? null : { ...(idea.lanes[p] || {}), ...l };
  return next;
}

const [cmd, a, b] = process.argv.slice(2);
const data = load();
const byId = (id) => data.ideas.find((i) => i.id === id) || fail(`no card ${id}`);

if (cmd === 'reels-to-edit') {
  const list = data.ideas
    .filter((i) => !i.archived && i.format === 'Reel' && i.lanes.instagram?.stage === 'Edit')
    .sort((x, y) => (x.order ?? 1e9) - (y.order ?? 1e9) || (x.lanes.instagram.date || '9').localeCompare(y.lanes.instagram.date || '9') || x.createdAt.localeCompare(y.createdAt));
  out(list.map((i) => ({
    id: i.id, title: i.title, order: i.order, date: i.lanes.instagram.date || null, drafted: i.reelFolder || null,
    hook: i.hook, cta: i.cta, series: i.series, product: i.product, filmingNotes: i.filmingNotes, editNotes: i.editNotes, notes: i.notes,
  })));
} else if (cmd === 'show') {
  out(byId(a));
} else if (cmd === 'find') {
  const q = (a || '').toLowerCase();
  const hit = (x) => `${x.title}\n${x.hook}\n${x.notes}`.toLowerCase().includes(q);
  for (const i of data.ideas.filter(hit)) console.log(`${i.id}  ${i.title}  [${stages(i)}]${i.archived ? ' (archived)' : ''}`);
} else if (cmd === 'list') {
  const f = Object.fromEntries(process.argv.slice(3).map((kv) => kv.split('=')));
  const lanes = (i) => (f.platform ? [i.lanes[f.platform]] : Object.values(i.lanes)).filter(Boolean);
  const list = data.ideas.filter((i) => !i.archived
    && (!f.format || i.format.toLowerCase() === f.format.toLowerCase())
    && (!f.platform || i.lanes[f.platform])
    && (!f.stage || lanes(i).some((l) => l.stage.toLowerCase() === f.stage.toLowerCase())));
  for (const i of list) console.log(`${i.id}  ${i.title}  [${stages(i)}]`);
  console.log(`${list.length} cards`);
} else if (cmd === 'update' || cmd === 'new') {
  const patch = JSON.parse(readFileSync(cmd === 'new' ? a : b, 'utf8'));
  if (cmd === 'new') {
    const idea = cleanIdea(applyPatch({ lanes: {} }, patch));
    data.ideas.unshift(idea);
    save(data);
    console.log(idea.id);
  } else {
    const k = data.ideas.indexOf(byId(a));
    data.ideas[k] = cleanIdea(applyPatch(data.ideas[k], patch), data.ideas[k]);
    save(data);
    console.log(`${a}: ${data.ideas[k].title} [${stages(data.ideas[k])}]`);
  }
} else {
  fail('usage: node tracker.mjs reels-to-edit | show <id> | find <text> | update <id> <patch.json> | new <patch.json>');
}
