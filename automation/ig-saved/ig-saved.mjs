// Instagram saved folder -> Mercedes's Content Planner (automation/planner, replaced Notion's Content Pipeline 2026-10-27),
// one Idea card per save.
//
//   node ig-saved/ig-saved.mjs scan <export-folder>                    list saved folders + counts
//   node ig-saved/ig-saved.mjs scan <export-folder> --folder "Name"    new posts in that folder -> batch
//   node ig-saved/ig-saved.mjs enrich <batch> [--yes]                  caption lookup via Apify (estimate only without --yes)
//   node ig-saved/ig-saved.mjs rows <batch>                            build rows.json (planner cards; Claude may rewrite titles)
//   node ig-saved/ig-saved.mjs done <batch>                            add the cards to the planner + record them in the ledger
//
// A batch is a folder under ig-saved/data/batches/. The ledger (data/imported.json) stops re-imports across exports.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findExportFiles, parseCollections, parsePosts } from './lib/export.mjs';
import { cleanIdea } from '../planner/lib/ideas.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(here, 'data');
const LEDGER = path.join(DATA, 'imported.json');
const ACTOR = 'apify/instagram-scraper';
const EST_USD_PER_POST = 0.0027; // conservative; check the logged usageTotalUsd after a run and adjust
const NOTES_MAX = 7900; // planner notes hold 8000 characters
const PLANNER = path.join(here, '..', 'planner', 'data', 'ideas.json');

const [cmd, target, ...rest] = process.argv.slice(2);
const flag = (name) => { const i = rest.indexOf(name); return i === -1 ? null : (rest[i + 1] ?? true); };
const readJson = (p, fallback) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fallback);
const writeJson = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2)); };
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'folder';
const batchDir = (b) => (fs.existsSync(b) ? b : path.join(DATA, 'batches', b));

function scan() {
  if (!target) throw new Error('scan needs the extracted export folder');
  const files = findExportFiles(target);
  if (!files.collections && files.html) throw new Error('This export is HTML. Request a new one in JSON format (Accounts Center > Your information and permissions > Download your information > Format: JSON).');
  if (!files.collections) throw new Error('No saved_collections.json found. Make sure the export includes "Saved" and you extracted the zip.');

  const inFolders = parseCollections(files.collections);
  const byCode = new Map((files.posts ? parsePosts(files.posts) : []).map((p) => [p.shortcode, p]));
  const folders = new Map();
  for (const p of inFolders) folders.set(p.collection ?? '(no name)', (folders.get(p.collection ?? '(no name)') || 0) + 1);

  const folder = flag('--folder');
  if (!folder || folder === true) {
    console.log('Saved folders in this export:');
    for (const [name, n] of folders) console.log(`  ${String(n).padStart(4)}  ${name}`);
    console.log('\nRe-run with --folder "<name>" to make a batch.');
    return;
  }
  const match = [...folders.keys()].find((n) => n.toLowerCase() === folder.toLowerCase());
  if (!match) throw new Error(`No folder named "${folder}". Folders: ${[...folders.keys()].join(', ')}`);

  const ledger = readJson(LEDGER, {});
  const seen = new Set();
  const posts = [];
  let already = 0;
  for (const p of inFolders.filter((x) => x.collection === match)) {
    if (seen.has(p.shortcode)) continue;
    seen.add(p.shortcode);
    if (ledger[p.shortcode]) { already++; continue; }
    const fromSaved = byCode.get(p.shortcode);
    posts.push({ ...p, handle: p.handle || fromSaved?.handle || null, savedAt: p.savedAt || fromSaved?.savedAt || null });
  }
  const base = path.join(DATA, 'batches', `${new Date().toISOString().slice(0, 10)}-${slug(match)}`);
  let dir = base;
  for (let n = 2; fs.existsSync(dir); n++) dir = `${base}-${n}`; // never overwrite a batch (it may hold paid captions)
  writeJson(path.join(dir, 'posts.json'), { folder: match, createdAt: new Date().toISOString(), posts });
  console.log(`Folder "${match}": ${seen.size} posts, ${already} already imported, ${posts.length} new.`);
  console.log(`Batch: ${dir}`);
  console.log(`Caption lookup estimate: ~$${(posts.length * EST_USD_PER_POST).toFixed(2)} (${posts.length} x $${EST_USD_PER_POST})`);
}

async function enrich() {
  const dir = batchDir(target);
  const { posts } = readJson(path.join(dir, 'posts.json'));
  const todo = posts.map((p) => p.url);
  // Reuse the reels-test Apify helper (token from automation/.env, capped runs, shared cost log).
  const { apify, runActor } = await import('../reels-test/apify.mjs');
  const lim = (await apify('/users/me/limits')).data;
  const left = (lim.limits?.maxMonthlyUsageUsd ?? 0) - (lim.current?.monthlyUsageUsd ?? 0);
  const est = todo.length * EST_USD_PER_POST;
  console.log(`${todo.length} posts, estimate ~$${est.toFixed(2)}. Apify credit left this cycle: $${left.toFixed(2)} (cycle ends ${lim.monthlyUsageCycle?.endAt?.slice(0, 10)}).`);
  if (!todo.length) return;
  if (est > left - 0.02) throw new Error('Not enough Apify credit for this batch. Split the folder, wait for the cycle to reset, or run "rows" without captions.');
  if (!rest.includes('--yes')) { console.log('Estimate only. Re-run with --yes to start the paid run.'); return; }

  const { items, rec } = await runActor(ACTOR, { directUrls: todo, resultsType: 'posts', resultsLimit: 1, addParentData: false }, {
    maxItems: todo.length, maxTotalChargeUsd: Math.min(left - 0.02, Math.max(0.05, est * 1.5)), timeoutSecs: 600, label: `ig-saved ${path.basename(dir)}`,
  });
  writeJson(path.join(dir, 'enriched.json'), items);
  console.log(`Run ${rec.runId} ${rec.status}: ${items.length} items, usage $${rec.usageTotalUsd ?? '?'}.`);
}

function cleanTitle(caption, handle, kind) {
  const line = (caption || '').split(/\n/).map((l) => l.replace(/#\p{L}[\p{L}\p{N}_]*|@[\w.]+/gu, '').replace(/[^\p{L}\p{N}\p{P}\p{Zs}$%&+=]/gu, '').replace(/\s+/g, ' ').trim()).find((l) => l.length > 3);
  const base = line ? (line.length > 90 ? `${line.slice(0, 87).replace(/\s+\S*$/, '')}...` : line) : `${kind === 'reel' ? 'Reel' : 'Post'} from @${handle || 'unknown'}`;
  return base.replace(/\s*[–—]\s*/g, ', ');
}

function rows() {
  const dir = batchDir(target);
  const { folder, posts } = readJson(path.join(dir, 'posts.json'));
  const enriched = readJson(path.join(dir, 'enriched.json'), []);
  const byCode = new Map(enriched.filter((i) => i.shortCode).map((i) => [i.shortCode, i]));
  const kindLabel = { reel: 'Reel', p: 'Post', tv: 'Video' };
  const typeLabel = { Sidecar: 'Carousel', Image: 'Photo post', Video: 'Reel' };
  const formatFor = { Reel: 'Reel', Video: 'Reel', Carousel: 'Carousel', 'Photo post': 'Single image' };

  const out = posts.map((p) => {
    const e = byCode.get(p.shortcode);
    const handle = e?.ownerUsername || p.handle;
    const kind = (e && typeLabel[e.type]) || kindLabel[p.kind] || 'Post';
    const stats = e ? [
      e.timestamp && `posted ${e.timestamp.slice(0, 10)}`,
      (e.videoPlayCount ?? e.videoViewCount) != null && `${(e.videoPlayCount ?? e.videoViewCount).toLocaleString('en-US')} views`,
      e.likesCount != null && e.likesCount >= 0 && `${e.likesCount.toLocaleString('en-US')} likes`,
    ].filter(Boolean).join(', ') : '';
    const head = `${kind} saved from @${handle || 'unknown'} in IG folder "${folder}"${p.savedAt ? ` on ${p.savedAt.slice(0, 10)}` : ''}.${stats ? ` ${stats[0].toUpperCase()}${stats.slice(1)}.` : ''}`;
    const body = e?.caption ? `\nCaption: ${e.caption}` : (enriched.length ? '\nCaption not found (post may be deleted or private).' : '');
    const notes = (head + body).replace(/\s*[–—]\s*/g, ', ');
    return {
      shortcode: p.shortcode,
      // Planner card (Mercedes 2026-10-13: each save is an Idea; 2026-10-27: in the planner, Instagram lane at Idea).
      card: {
        title: cleanTitle(e?.caption, handle, p.kind),
        format: formatFor[kind] || '',
        link: p.url,
        notes: notes.length > NOTES_MAX ? `${notes.slice(0, NOTES_MAX - 3)}...` : notes,
        lanes: { instagram: { stage: 'Idea' } },
      },
    };
  });
  writeJson(path.join(dir, 'rows.json'), out);
  console.log(`${out.length} rows -> ${path.join(dir, 'rows.json')} (${byCode.size} with captions)`);
}

function done() {
  const dir = batchDir(target);
  const { folder } = readJson(path.join(dir, 'posts.json'));
  const rowsList = readJson(path.join(dir, 'rows.json'));
  const ledger = readJson(LEDGER, {});
  const planner = readJson(PLANNER);
  const at = new Date().toISOString();
  let added = 0;
  for (const r of rowsList) {
    if (ledger[r.shortcode]) continue; // already imported (a re-run of the same batch)
    const card = cleanIdea(r.card);
    planner.ideas.unshift(card);
    ledger[r.shortcode] = { folder, card: card.id, importedAt: at };
    added++;
  }
  // Planner first, then the ledger: a crash in between can only cause a duplicate card, never a lost save.
  fs.writeFileSync(`${PLANNER}.tmp`, JSON.stringify(planner, null, 1));
  fs.renameSync(`${PLANNER}.tmp`, PLANNER);
  writeJson(LEDGER, ledger);
  console.log(`Planner: ${added} Idea cards added (${rowsList.length - added} were already imported). Ledger: ${Object.keys(ledger).length} total.`);
}

const cmds = { scan, enrich, rows, done };
if (!cmds[cmd]) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\nimport ')[0]); process.exit(1); }
try { await cmds[cmd](); } catch (e) { console.error(e.message); process.exit(1); }
