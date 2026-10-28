// Content planner: Mercedes's own local page for what's scheduled and posted (Pins + Buffer).
// Run: node automation/planner/server.mjs   then open http://localhost:4330
// No npm packages, same as the Chat Manager inbox. Listens on this computer only.
//
// Reads:
//   - Pin batches: automation/pins/out/batch-*/batch.json + automation/pins/batches/<batch>-media.json
//   - Buffer: live from api.buffer.com when automation/.env has BUFFER_API_KEY, else data/buffer-snapshot.json
//     (Claude refreshes it with the Buffer connector, see buffer-snapshot.mjs)
//   - Ideas: data/ideas.json (one card per idea, a lane per platform)
// Writes: data/pin-status.json (her "Seen it live" / "Missing" clicks) and data/ideas.json (her idea edits).
import http from 'node:http';
import { readFileSync, writeFileSync, renameSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { liveFetch } from './lib/buffer.mjs';
import { plan as queuePlan, run as queueRun } from './lib/queue.mjs';
import { cleanIdea, PLATFORMS, STAGES, PIN_STAGES, FORMATS } from './lib/ideas.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const PINS = join(here, '..', 'pins');
const DATA = join(here, 'data');
const PORT = Number(process.env.PLANNER_PORT || 4330);
mkdirSync(DATA, { recursive: true });

function envKey(name) {
  if (process.env[name]) return process.env[name].trim();
  try {
    const line = readFileSync(join(here, '..', '.env'), 'utf8').split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
    return line ? line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '') : '';
  } catch {
    return '';
  }
}

const readJson = (f, d) => {
  try {
    return JSON.parse(readFileSync(f, 'utf8'));
  } catch {
    return d;
  }
};
function writeJson(f, v) {
  writeFileSync(`${f}.tmp`, JSON.stringify(v, null, 1));
  renameSync(`${f}.tmp`, f);
}

const CAROUSEL_EXPORTS = readJson(join(here, '..', 'carousels', 'config', 'media.json'), {}).exportsDir || '';

// ---- Pins ----
const STATUS_FILE = join(DATA, 'pin-status.json');
const MARKS = ['Live', 'Missing', 'Deleted']; // what she saw on Pinterest; no mark = not checked yet. Deleted = she removed it before it posted.

function pins() {
  const marks = readJson(STATUS_FILE, {});
  const out = [];
  const dirs = readdirSync(join(PINS, 'out')).filter((d) => /^batch-\d+$/.test(d)).sort();
  for (const batch of dirs) {
    const list = readJson(join(PINS, 'out', batch, 'batch.json'), []);
    const media = readJson(join(PINS, 'batches', `${batch}-media.json`), {});
    for (const p of list) {
      out.push({
        ...p,
        batch,
        // batch.json dates are UTC without the Z (Pinterest's CSV format)
        when: new Date(`${p.date}Z`).toISOString(),
        page: p.url.replace(/^https?:\/\/[^/]+/, '').replace(/\?.*$/, ''),
        image: `/pin-img/${batch}/${p.id}.png`,
        mediaId: media[p.id]?.media ?? null,
        uploaded: Boolean(media[p.id]),
        mark: marks[p.id]?.mark ?? null,
        markedAt: marks[p.id]?.at ?? null,
      });
    }
  }
  return out;
}

// ---- Ideas ----
const IDEAS_FILE = join(DATA, 'ideas.json');
const ideas = () => readJson(IDEAS_FILE, { ideas: [] }).ideas;
function saveIdea(input) {
  const list = ideas();
  const i = list.findIndex((x) => x.id === input.id);
  // The nightly Reel run edits ideas.json too (tracker.mjs): refuse a save made from an older copy.
  if (i >= 0 && input.updatedAt && input.updatedAt !== list[i].updatedAt) {
    throw Object.assign(new Error('This card changed since the page loaded. Reload, then make your change again.'), { code: 409 });
  }
  const idea = cleanIdea(input, i >= 0 ? list[i] : null);
  if (i >= 0) list[i] = idea;
  else list.unshift(idea);
  writeJson(IDEAS_FILE, { ideas: list });
  return idea;
}

// Her Delete button: the card leaves the board; a copy goes to data/deleted.json so a mis-click can be undone.
const DELETED_FILE = join(DATA, 'deleted.json');
function deleteIdea(id) {
  const list = ideas();
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) throw Object.assign(new Error('no such card'), { code: 404 });
  const bin = readJson(DELETED_FILE, { deleted: [] });
  bin.deleted.unshift({ ...list[i], deletedAt: new Date().toISOString() });
  writeJson(DELETED_FILE, bin);
  list.splice(i, 1);
  writeJson(IDEAS_FILE, { ideas: list });
}

// ---- Comment words ----
// The repo copy of Chat Manager's keyword list. The dashboard (hooks.scrollyseo.com/inbox) is the real list, so a word
// missing here may still work there; the page says "check it in Chat Manager" instead of calling it wrong.
const keywords = () => readJson(join(here, '..', 'carousels', 'config', 'destinations.json'), {}).commentKeywords
  ?.map((k) => ({ keyword: k.keyword, live: Boolean(k.live && k.dmApproved), freebie: k.freebie })) || [];

// ---- Buffer ----
let cache = null; // live results, kept 60s so reloading the page doesn't spend the rate limit
async function buffer(force) {
  const key = envKey('BUFFER_API_KEY');
  const snapshot = () => ({ ...readJson(join(DATA, 'buffer-snapshot.json'), { takenAt: null, posts: [] }), live: false });
  if (!key) return { ...snapshot(), note: 'No BUFFER_API_KEY yet, showing the last saved copy.' };
  if (!force && cache && Date.now() - cache.at < 60e3) return cache.data;
  try {
    const data = await liveFetch(key);
    cache = { at: Date.now(), data };
    return data;
  } catch (e) {
    return { ...snapshot(), note: `Buffer didn't answer (${e.message}), showing the last saved copy.` };
  }
}

// ---- http ----
const TYPES = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.json': 'application/json' };
function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((ok, fail) => {
    let s = '';
    req.on('data', (c) => (s += c));
    req.on('end', () => {
      try {
        ok(JSON.parse(s || '{}'));
      } catch (e) {
        fail(e);
      }
    });
  });
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (req.method === 'GET' && url.pathname === '/') {
        return send(res, 200, readFileSync(join(here, 'planner.html')), TYPES['.html']);
      }
      if (req.method === 'GET' && url.pathname === '/api/data') {
        return send(res, 200, {
          now: new Date().toISOString(),
          options: { platforms: PLATFORMS, stages: STAGES, pinStages: PIN_STAGES, formats: FORMATS, keywords: keywords() },
          ideas: ideas(),
          pins: pins(),
          buffer: await buffer(url.searchParams.has('refresh')),
        });
      }
      // Writes: same-origin only, the page is the one caller.
      if (req.method === 'POST' && req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) {
        return send(res, 403, { error: 'origin' });
      }
      if (req.method === 'POST' && url.pathname === '/api/idea') {
        return send(res, 200, { idea: saveIdea(await readBody(req)) });
      }
      // Queue it, step 1: the preview. Changes nothing.
      if (req.method === 'POST' && url.pathname === '/api/queue-plan') {
        const { id, platform } = await readBody(req);
        const card = ideas().find((x) => x.id === id);
        if (!card) return send(res, 404, { error: 'no such card' });
        const key = envKey('BUFFER_API_KEY');
        const b = await buffer(false);
        const scheduled = b.posts.filter((p) => ['scheduled', 'sending'].includes(p.status)).length;
        const p = queuePlan(card, platform, { keywords: keywords(), scheduled });
        if (!key) p.problems.unshift('Add BUFFER_API_KEY to automation/.env first (Buffer > profile icon > API > + New Key), then restart the planner.');
        return send(res, 200, { ...p, ok: p.problems.length === 0, updatedAt: card.updatedAt });
      }
      // Queue it, step 2: her Confirm click. Uploads missing slides, adds the post to the Buffer queue, updates the card.
      if (req.method === 'POST' && url.pathname === '/api/queue') {
        const { id, platform, updatedAt } = await readBody(req);
        const key = envKey('BUFFER_API_KEY');
        if (!key) return send(res, 400, { error: 'No BUFFER_API_KEY in automation/.env yet.' });
        const card = ideas().find((x) => x.id === id);
        if (!card) return send(res, 404, { error: 'no such card' });
        if (updatedAt !== card.updatedAt) return send(res, 409, { error: 'This card changed since the preview. Reload and preview again.' });
        const post = await queueRun(card, platform, key, keywords());
        const lane = { ...card.lanes[platform], stage: 'Scheduled', bufferId: post.id, date: (post.dueAt || '').slice(0, 10) };
        const saved = saveIdea({ ...card, lanes: { ...card.lanes, [platform]: lane } });
        cache = null; // next page load reads Buffer fresh
        return send(res, 200, { post, byHand: post.byHand, idea: saved });
      }
      if (req.method === 'POST' && url.pathname === '/api/idea-delete') {
        deleteIdea((await readBody(req)).id);
        return send(res, 200, { ok: true });
      }
      if (req.method === 'POST' && url.pathname === '/api/pin-mark') {
        const { id, mark } = await readBody(req);
        if (!pins().some((p) => p.id === id)) return send(res, 404, { error: 'unknown pin' });
        if (mark !== null && !MARKS.includes(mark)) return send(res, 400, { error: 'bad mark' });
        const marks = readJson(STATUS_FILE, {});
        if (mark === null) delete marks[id];
        else marks[id] = { mark, at: new Date().toISOString() };
        writeJson(STATUS_FILE, marks);
        return send(res, 200, { ok: true });
      }
      const img = url.pathname.match(/^\/pin-img\/(batch-\d+)\/(pin\d*-[a-z0-9-]+\.png)$/);
      if (req.method === 'GET' && img) {
        const f = join(PINS, 'out', img[1], img[2]);
        if (existsSync(f)) return send(res, 200, readFileSync(f), TYPES[extname(f)]);
      }
      // Rendered carousel slides (carousel engine exports folder), for previews before anything is posted
      const slide = url.pathname.match(/^\/carousel-img\/([\w-]+)\/(slide-\d+\.png)$/);
      if (req.method === 'GET' && slide) {
        const f = join(CAROUSEL_EXPORTS, slide[1], slide[2]);
        if (existsSync(f)) return send(res, 200, readFileSync(f), TYPES['.png']);
      }
      // Preview pages Claude writes before queueing (previews/<name>.html), shown to her for approval
      const prev = url.pathname.match(/^\/previews\/([\w-]+\.html)$/);
      if (req.method === 'GET' && prev && existsSync(join(here, 'previews', prev[1]))) {
        return send(res, 200, readFileSync(join(here, 'previews', prev[1])), TYPES['.html']);
      }
      send(res, 404, { error: 'not found' });
    } catch (e) {
      send(res, [400, 404, 409].includes(e.code) ? e.code : 500, { error: e.message });
    }
  })
  .listen(PORT, '127.0.0.1', () => console.log(`Content planner: http://localhost:${PORT}`));
