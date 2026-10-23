// Scrolly comment inbox: Mercedes's private dashboard (https://hooks.scrollyseo.com/inbox)
// and the store n8n writes comments to. Replaced the Notion Comment inbox on 2026-10-23.
// No npm packages: Node's own http, crypto and fs. Runs next to n8n (docker-compose.yml).
//
// Who can call /inbox/api/*:
//   - the dashboard, with the login cookie (same-origin requests only), and
//   - n8n and the draft-comment-replies skill, with header x-inbox-secret: INBOX_API_SECRET.
// Data: DATA_DIR/inbox.json (comments, stats, login). Keywords: CONFIG_DIR/keywords-all.json
// (every keyword, edited from the dashboard) and CONFIG_DIR/keywords.json (only the sendable
// ones, read by n8n on every comment).
import http from 'node:http';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const env = (k, d = '') => (process.env[k] ?? '').trim() || d;
const PORT = Number(env('PORT', '3000'));
const DATA_DIR = env('DATA_DIR', '/data');
const CONFIG_DIR = env('CONFIG_DIR', '/config');
const API_SECRET = env('INBOX_API_SECRET');
const SETUP_CODE = env('INBOX_SETUP_CODE');
const SECURE_COOKIE = env('INBOX_SECURE_COOKIE', 'true') !== 'false';
// YouTube data leaves the inbox well within Google's 30-day limit (privacy page).
const YOUTUBE_KEEP_DAYS = Number(env('YOUTUBE_KEEP_DAYS', '21'));
// "Approve & post" asks n8n to post right away instead of waiting for the 10-minute run.
const N8N_RUN_URL = env('N8N_RUN_URL', 'http://n8n:5678/webhook/comments-run');
const RUN_SECRET = env('RUN_SECRET');
// Tests only (test/run-inbox.sh): lets the end-to-end test make the next row update fail.
const TEST_HOOKS = env('INBOX_TEST_HOOKS') === 'true';
let failNextPatch = false;
const PAGE = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'dashboard.html'), 'utf8');

// Handled = answered automatically (a keyword got its freebie DM); kept for the conversation view only.
const STATUSES = ['Needs draft', 'New', 'Approved', 'Posted', 'Reply by hand', 'Not sent (test mode)', 'Skip', 'Error', 'Handled'];
// comment = a public comment, dm = a DM someone sent her, out = a DM she (or the automation) sent.
const KINDS = ['comment', 'dm', 'out'];
const TYPES = ['Question', 'Lead', 'Praise', 'Other'];
const SESSION_DAYS = 30;

// ---- storage: one JSON file, written atomically ----
mkdirSync(DATA_DIR, { recursive: true });
const DATA_FILE = join(DATA_DIR, 'inbox.json');
let db = { rows: [], events: [], auth: null, sessions: {} };
try {
  db = { ...db, ...JSON.parse(readFileSync(DATA_FILE, 'utf8')) };
} catch {}
function save() {
  writeFileSync(`${DATA_FILE}.tmp`, JSON.stringify(db));
  renameSync(`${DATA_FILE}.tmp`, DATA_FILE);
}
const now = () => new Date().toISOString();
const newId = () => randomBytes(8).toString('hex');

// ---- keywords ----
const KW_ALL = join(CONFIG_DIR, 'keywords-all.json');
const KW_SEND = join(CONFIG_DIR, 'keywords.json');
function readKeywords() {
  try {
    return JSON.parse(readFileSync(KW_ALL, 'utf8')).keywords || [];
  } catch {
    return [];
  }
}
function cleanKeyword(k) {
  const keyword = String(k.keyword || '').trim().toUpperCase();
  if (!/^[A-Z0-9$]{2,20}$/.test(keyword)) throw new Error(`"${k.keyword}" isn't a keyword: use 2 to 20 letters or numbers, no spaces`);
  const url = String(k.url || '').trim();
  if (url && !/^https:\/\/\S+$/.test(url)) throw new Error(`${keyword}: the link must start with https://`);
  const dm = String(k.dm || '').trim();
  const live = !!k.live;
  const dmApproved = !!k.dmApproved;
  if ((live || dmApproved) && (!url || !dm)) throw new Error(`${keyword}: a keyword that's switched on needs a link and a DM text`);
  return { ...k, keyword, url, dm, live, dmApproved, freebie: String(k.freebie || '').trim(), leadsTo: String(k.leadsTo || '').trim() };
}
function saveKeywords(list) {
  const clean = list.map(cleanKeyword);
  const seen = new Set();
  for (const k of clean) {
    if (seen.has(k.keyword)) throw new Error(`${k.keyword} is in the list twice`);
    seen.add(k.keyword);
  }
  mkdirSync(CONFIG_DIR, { recursive: true });
  const write = (file, data) => {
    writeFileSync(`${file}.tmp`, JSON.stringify(data, null, 2) + '\n');
    renameSync(`${file}.tmp`, file);
  };
  write(KW_ALL, { source: 'comment dashboard (hooks.scrollyseo.com/inbox)', updatedAt: now(), keywords: clean });
  // n8n only ever sees keywords that are switched on AND whose DM text Mercedes approved.
  write(KW_SEND, {
    source: 'comment dashboard (hooks.scrollyseo.com/inbox)',
    keywords: clean.filter((k) => k.live && k.dmApproved).map(({ keyword, url, dm }) => ({ keyword, url, dm })),
  });
  return clean;
}

// ---- login ----
const hashPassword = (pw, salt) => scryptSync(pw, salt, 64).toString('hex');
function checkPassword(pw) {
  if (!db.auth) return false;
  const a = Buffer.from(hashPassword(pw, db.auth.salt), 'hex');
  const b = Buffer.from(db.auth.hash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
const failedLogins = [];
function tooManyFailures() {
  const cutoff = Date.now() - 15 * 60e3;
  while (failedLogins.length && failedLogins[0] < cutoff) failedLogins.shift();
  return failedLogins.length >= 10;
}
function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((p) => p.length === 2));
}
function sessionOk(req) {
  const sid = cookies(req).sid;
  const until = sid && db.sessions[sid];
  return !!until && until > Date.now();
}
function startSession(res) {
  const sid = randomBytes(32).toString('hex');
  for (const [k, until] of Object.entries(db.sessions)) if (until < Date.now()) delete db.sessions[k];
  db.sessions[sid] = Date.now() + SESSION_DAYS * 86400e3;
  save();
  res.setHeader('Set-Cookie', `sid=${sid}; Path=/inbox; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}${SECURE_COOKIE ? '; Secure' : ''}`);
}
function secretOk(req) {
  const given = Buffer.from(String(req.headers['x-inbox-secret'] || ''));
  const want = Buffer.from(API_SECRET);
  return !!API_SECRET && given.length === want.length && timingSafeEqual(given, want);
}
// Cookie calls must come from the dashboard page itself (no cross-site requests).
function sameOrigin(req) {
  const origin = req.headers.origin;
  return req.method === 'GET' || (origin && new URL(origin).host === req.headers.host);
}

// ---- rows ----
// commentId is the comment or message id; personId the commenter's/sender's platform id; replyMid the
// id of the DM that answered a dm row (so Instagram's echo of that DM isn't stored twice).
const ROW_FIELDS = ['kind', 'platform', 'type', 'priority', 'text', 'author', 'personId', 'commentId', 'threadId', 'link', 'post', 'receivedAt', 'status', 'draft', 'note', 'postedAt', 'keyword', 'dm', 'replyMid'];
function pick(body, fields) {
  return Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));
}
function checkRow(r) {
  if (r.status !== undefined && !STATUSES.includes(r.status)) throw new Error(`unknown status "${r.status}"`);
  if (r.type !== undefined && !TYPES.includes(r.type)) throw new Error(`unknown type "${r.type}"`);
  if (r.kind !== undefined && !KINDS.includes(r.kind)) throw new Error(`unknown kind "${r.kind}"`);
}
function addRow(body) {
  const row = { kind: 'comment', type: 'Other', priority: false, status: 'Needs draft', draft: '', note: '', ...pick(body, ROW_FIELDS) };
  checkRow(row);
  // One row per comment or message, however often n8n sees it.
  const dup = db.rows.find((r) => r.platform === row.platform && row.commentId && (r.commentId === row.commentId || r.replyMid === row.commentId));
  if (dup) return dup;
  const created = { id: newId(), createdAt: now(), receivedAt: now(), ...row };
  db.rows.push(created);
  save();
  return created;
}
function updateRow(id, body) {
  const row = db.rows.find((r) => r.id === id);
  if (!row) return null;
  const change = pick(body, ROW_FIELDS);
  checkRow(change);
  if (change.status === 'Posted' && !change.postedAt && !row.postedAt) change.postedAt = now();
  Object.assign(row, change, { updatedAt: now() });
  save();
  return row;
}

// ---- stats: keyword comments and DMs, per keyword and per post ----
function stats(days) {
  const cutoff = new Date(Date.now() - days * 86400e3).toISOString();
  const by = {};
  for (const e of db.events) {
    if (e.at < cutoff) continue;
    const k = (by[e.keyword] ||= { keyword: e.keyword, comments: 0, dmsSent: 0, dmsFailed: 0, posts: {} });
    k.comments++;
    if (e.result === 'sent') k.dmsSent++;
    if (e.result === 'failed') k.dmsFailed++;
    if (e.post) k.posts[e.post] = (k.posts[e.post] || 0) + 1;
  }
  const open = (s) => db.rows.filter((r) => r.status === s && r.kind !== 'out').length;
  return {
    days,
    keywords: Object.values(by).sort((a, b) => b.comments - a.comments),
    inbox: { toAnswer: open('New') + open('Error'), needsDraft: open('Needs draft'), tiktok: open('Reply by hand'), approved: open('Approved') },
  };
}

// ---- daily YouTube cleanup (real delete on this server) ----
function youtubeCleanup() {
  const cutoff = new Date(Date.now() - YOUTUBE_KEEP_DAYS * 86400e3).toISOString();
  const before = db.rows.length;
  db.rows = db.rows.filter((r) => !(r.platform === 'YouTube' && (r.receivedAt || r.createdAt) < cutoff));
  const removed = before - db.rows.length;
  db.lastCleanup = { at: now(), keepDays: YOUTUBE_KEEP_DAYS, removed };
  // Stats keep counts only (keyword, post link, result), never comment text or names; a year is plenty.
  const yearAgo = new Date(Date.now() - 366 * 86400e3).toISOString();
  db.events = db.events.filter((e) => e.at >= yearAgo);
  save();
  return removed;
}
setInterval(youtubeCleanup, 6 * 3600e3).unref();
youtubeCleanup();

async function postNow() {
  if (!RUN_SECRET) return;
  try {
    await fetch(N8N_RUN_URL, { method: 'POST', headers: { 'x-run-secret': RUN_SECRET, 'Content-Type': 'application/json' }, body: JSON.stringify({ job: 'replies' }) });
  } catch {
    // n8n's own 10-minute run picks it up anyway.
  }
}

// ---- http ----
function send(res, code, body, type = 'application/json') {
  res.writeHead(code, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
  });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e6) reject(new Error('too big'));
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('not JSON'));
      }
    });
  });
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://inbox');
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (path === '/inbox/health') return send(res, 200, { ok: true });
  if (req.method === 'GET' && path === '/inbox') return send(res, 200, PAGE, 'text/html; charset=utf-8');

  // First visit: set the password, with the one-time setup code from the server's .env.
  if (path === '/inbox/setup' && req.method === 'POST') {
    if (db.auth) return send(res, 409, { error: 'The password is already set.' });
    const body = await readBody(req);
    if (!SETUP_CODE || body.code !== SETUP_CODE) {
      failedLogins.push(Date.now());
      return send(res, 403, { error: 'That setup code is wrong.' });
    }
    if (String(body.password || '').length < 10) return send(res, 400, { error: 'Use at least 10 characters.' });
    const salt = randomBytes(16).toString('hex');
    db.auth = { salt, hash: hashPassword(body.password, salt), setAt: now() };
    startSession(res);
    return send(res, 200, { ok: true });
  }
  if (path === '/inbox/login' && req.method === 'POST') {
    if (tooManyFailures()) return send(res, 429, { error: 'Too many tries. Wait 15 minutes.' });
    const body = await readBody(req);
    if (!checkPassword(String(body.password || ''))) {
      failedLogins.push(Date.now());
      return send(res, 403, { error: 'Wrong password.' });
    }
    startSession(res);
    return send(res, 200, { ok: true });
  }
  if (path === '/inbox/logout' && req.method === 'POST') {
    delete db.sessions[cookies(req).sid];
    save();
    res.setHeader('Set-Cookie', 'sid=; Path=/inbox; Max-Age=0');
    return send(res, 200, { ok: true });
  }

  if (!path.startsWith('/inbox/api/')) return send(res, 404, { error: 'not found' });
  const viaSecret = secretOk(req);
  if (!viaSecret) {
    if (path === '/inbox/api/me') return send(res, 200, { loggedIn: sessionOk(req), passwordSet: !!db.auth });
    if (!sessionOk(req)) return send(res, 401, { error: 'Please log in.' });
    if (!sameOrigin(req)) return send(res, 403, { error: 'forbidden' });
  }
  const api = path.slice('/inbox/api'.length);
  const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await readBody(req) : {};

  if (api === '/me') return send(res, 200, { loggedIn: true, passwordSet: !!db.auth });
  if (api === '/rows' && req.method === 'GET') {
    const status = url.searchParams.getAll('status');
    const rows = status.length ? db.rows.filter((r) => status.includes(r.status)) : db.rows;
    return send(res, 200, { rows: [...rows].sort((a, b) => (b.receivedAt || '').localeCompare(a.receivedAt || '')) });
  }
  if (api === '/rows' && req.method === 'POST') return send(res, 200, addRow(body));
  // Conversations: everything from one person on one platform, newest conversation first.
  if (api === '/conversations' && req.method === 'GET') {
    const by = {};
    for (const r of db.rows) {
      const key = `${r.platform}:${(r.author || r.personId || r.id).toLowerCase()}`;
      const c = (by[key] ||= { key, platform: r.platform, author: r.author || '', personId: r.personId || '', items: [], waiting: 0, last: '' });
      c.items.push(r);
      if (!c.author && r.author) c.author = r.author;
      if (['New', 'Needs draft', 'Error'].includes(r.status) && r.kind !== 'out') c.waiting++;
      const at = r.receivedAt || r.createdAt || '';
      if (at > c.last) c.last = at;
    }
    const list = Object.values(by).sort((a, b) => b.last.localeCompare(a.last));
    for (const c of list) c.items.sort((a, b) => (a.receivedAt || '').localeCompare(b.receivedAt || ''));
    return send(res, 200, { conversations: list });
  }
  const m = api.match(/^\/rows\/([a-f0-9]+)$/);
  if (TEST_HOOKS && api === '/test/fail-next-patch') return (failNextPatch = true), send(res, 200, { ok: true });
  if (m && req.method === 'PATCH') {
    if (failNextPatch) return (failNextPatch = false), send(res, 502, { error: 'test failure' });
    const row = updateRow(m[1], body);
    if (!row) return send(res, 404, { error: 'not found' });
    if (body.status === 'Approved' && body.postNow) postNow();
    return send(res, 200, row);
  }
  // Deleting is for someone's deletion request or a mistake: it's gone for good.
  if (m && req.method === 'DELETE') {
    const before = db.rows.length;
    db.rows = db.rows.filter((r) => r.id !== m[1]);
    save();
    return send(res, before === db.rows.length ? 404 : 200, { deleted: before - db.rows.length });
  }
  if (api === '/events' && req.method === 'POST') {
    db.events.push({ at: now(), ...pick(body, ['keyword', 'platform', 'post', 'result']) });
    save();
    return send(res, 200, { ok: true });
  }
  if (api === '/stats' && req.method === 'GET') return send(res, 200, stats(Number(url.searchParams.get('days') || 30)));
  if (api === '/keywords' && req.method === 'GET') return send(res, 200, { keywords: readKeywords() });
  if (api === '/keywords' && req.method === 'PUT') {
    try {
      return send(res, 200, { keywords: saveKeywords(body.keywords || []) });
    } catch (e) {
      return send(res, 400, { error: e.message });
    }
  }
  if (api === '/cleanup' && req.method === 'POST') return send(res, 200, { removed: youtubeCleanup(), ...db.lastCleanup });
  return send(res, 404, { error: 'not found' });
}

http
  .createServer((req, res) => {
    handle(req, res).catch((e) => send(res, 400, { error: e.message }));
  })
  .listen(PORT, () => console.log(`comment inbox on :${PORT}`));
