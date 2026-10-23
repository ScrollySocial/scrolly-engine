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
// Freebie signups: the signup page adds the email to the keyword's MailerLite group, and
// MailerLite's own automation for that group emails the freebie.
const MAILERLITE_KEY = env('MAILERLITE_API_KEY');
const MAILERLITE_BASE = env('MAILERLITE_BASE', 'https://connect.mailerlite.com/api');
// Tests only (test/run-inbox.sh): lets the end-to-end test make the next row update fail.
const TEST_HOOKS = env('INBOX_TEST_HOOKS') === 'true';
let failNextPatch = false;
// Read on every visit (small file), so an updated dashboard shows without a restart.
const PAGE_FILE = join(dirname(fileURLToPath(import.meta.url)), 'dashboard.html');

// Handled = answered automatically (a keyword got its freebie DM); kept for the conversation view only.
const STATUSES = ['Needs draft', 'New', 'Approved', 'Posted', 'Reply by hand', 'Not sent (test mode)', 'Skip', 'Error', 'Handled'];
// comment = a public comment, dm = a DM someone sent her, out = a DM she (or the automation) sent.
const KINDS = ['comment', 'dm', 'out'];
const TYPES = ['Question', 'Lead', 'Praise', 'Other'];
const SESSION_DAYS = 30;

// ---- storage: one JSON file, written atomically ----
mkdirSync(DATA_DIR, { recursive: true });
const DATA_FILE = join(DATA_DIR, 'inbox.json');
let db = { rows: [], events: [], flows: [], auth: null, sessions: {} };
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
// A keyword delivers its freebie one of two ways:
//   direct: the DM carries the freebie link ({url}), as MATH and QUIZ did from the start;
//   email:  the DM carries a personal signup link ({link}); the signup page adds the email to the
//           keyword's MailerLite group and MailerLite emails the freebie.
// Optional before either: "ask first" (reply READY), and after an email link: one reminder DM.
const str = (v) => String(v ?? '').trim();
function cleanKeyword(k) {
  const keyword = str(k.keyword).toUpperCase();
  if (!/^[A-Z0-9$]{2,20}$/.test(keyword)) throw new Error(`"${k.keyword}" isn't a keyword: use 2 to 20 letters or numbers, no spaces`);
  const url = str(k.url);
  if (url && !/^https:\/\/\S+$/.test(url)) throw new Error(`${keyword}: the freebie link must start with https://`);
  const delivery = k.delivery === 'email' ? 'email' : 'direct';
  const where = { igComments: k.where?.igComments !== false, igDms: k.where?.igDms !== false };
  const ask = { on: !!k.ask?.on, text: str(k.ask?.text), word: str(k.ask?.word || 'READY').toUpperCase() };
  const reminder = { on: !!k.reminder?.on, hours: Math.min(23, Math.max(1, Number(k.reminder?.hours) || 4)), text: str(k.reminder?.text) };
  const out = {
    ...k,
    keyword,
    freebie: str(k.freebie),
    url,
    leadsTo: str(k.leadsTo),
    live: !!k.live,
    dmApproved: !!k.dmApproved,
    delivery,
    where,
    ask,
    dm: str(k.dm),
    linkText: str(k.linkText),
    signup: { headline: str(k.signup?.headline), text: str(k.signup?.text) },
    mailerliteGroup: str(k.mailerliteGroup),
    mailerliteGroupName: str(k.mailerliteGroupName),
    reminder,
  };
  if (out.live || out.dmApproved) {
    if (!where.igComments && !where.igDms) throw new Error(`${keyword}: pick where it works (comments, DMs or both)`);
    if (ask.on && (!ask.text || !/^[A-Z0-9]{2,20}$/.test(ask.word))) throw new Error(`${keyword}: "ask first" needs its message and a one-word reply`);
    if (delivery === 'direct' && (!url || !out.dm.includes('{url}'))) throw new Error(`${keyword}: direct delivery needs the freebie link and a DM text with {url} in it`);
    if (delivery === 'email' && (!out.linkText.includes('{link}') || !out.mailerliteGroup)) throw new Error(`${keyword}: email delivery needs a DM text with {link} in it and a MailerLite group`);
    if (reminder.on && (!reminder.text || !reminder.text.includes('{link}'))) throw new Error(`${keyword}: the reminder needs its text, with {link} in it`);
  }
  return out;
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
    keywords: clean
      .filter((k) => k.live && k.dmApproved)
      .map(({ keyword, url, dm, delivery, where, ask, linkText, reminder }) => ({ keyword, url, dm, delivery, where, ask, linkText, reminder })),
  });
  return clean;
}
function deleteKeyword(name) {
  const list = readKeywords();
  const rest = list.filter((k) => str(k.keyword).toUpperCase() !== str(name).toUpperCase());
  if (rest.length === list.length) return false;
  saveKeywords(rest);
  return true;
}

// ---- freebie flows: one per person per keyword ----
// Steps: asked (told to reply READY) → linkSent → clicked → signedUp; reminded can happen once after linkSent/clicked.
const FLOW_STEPS = ['asked', 'linkSent', 'clicked', 'signedUp', 'reminded'];
const samePerson = (f, q) => (q.personId && (f.personId === q.personId || f.dmPersonId === q.personId)) || (q.author && f.author && f.author.toLowerCase() === String(q.author).toLowerCase());
function flowStep(f, step, extra = {}) {
  if (!FLOW_STEPS.includes(step)) throw new Error(`unknown step "${step}"`);
  // A later step never moves the flow back (a click after signing up stays signed up).
  const order = (s) => FLOW_STEPS.indexOf(s === 'reminded' ? 'linkSent' : s);
  if (step === 'reminded') f.remindedAt = now();
  else if (order(step) >= order(f.step)) f.step = step;
  f[`${step}At`] = f[`${step}At`] || now();
  f.history.push({ at: now(), step, ...extra });
  Object.assign(f, extra);
}
function startFlow(body) {
  const open = db.flows.find((f) => f.keyword === body.keyword && f.step !== 'signedUp' && samePerson(f, body));
  if (open) return open;
  const f = { token: randomBytes(12).toString('base64url'), keyword: body.keyword, platform: body.platform || 'Instagram', personId: str(body.personId), author: str(body.author), step: body.step || 'linkSent', history: [], createdAt: now() };
  flowStep(f, f.step);
  db.flows.push(f);
  save();
  return f;
}
// Reminders: link sent (or clicked) but no signup after the keyword's hours, still inside
// Instagram's 24-hour window after their last DM, and never reminded before.
function dueReminders() {
  const kws = Object.fromEntries(readKeywords().map((k) => [k.keyword, k]));
  return db.flows.filter((f) => {
    const k = kws[f.keyword];
    if (!k?.live || !k.reminder?.on || f.remindedAt || !['linkSent', 'clicked'].includes(f.step) || !f.lastInboundAt || !f.dmPersonId) return false;
    const sent = Date.parse(f.linkSentAt || f.createdAt);
    return Date.now() - sent >= k.reminder.hours * 3600e3 && Date.now() - Date.parse(f.lastInboundAt) < 23 * 3600e3;
  });
}

// ---- MailerLite ----
async function mailerlite(method, path, body) {
  if (!MAILERLITE_KEY) throw new Error('MailerLite is not connected yet');
  const res = await fetch(`${MAILERLITE_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${MAILERLITE_KEY}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `MailerLite answered ${res.status}`);
  return data;
}

// ---- the public signup page (no login: anyone with the personal link) ----
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function signupPage(k, token, state = {}) {
  const headline = k?.signup?.headline || `Where should I send ${k?.freebie || 'your freebie'}?`;
  const text = k?.signup?.text || 'Pop in your email and it lands in your inbox in a minute.';
  const body = state.expired
    ? `<h1>This link has expired</h1><p>Comment the keyword again and you'll get a fresh one.</p>`
    : state.done
    ? `<h1>Check your inbox</h1><p>It's on its way to <strong>${esc(state.email)}</strong>. If you don't see it in a few minutes, look in Promotions or Spam.</p>`
    : `<h1>${esc(headline)}</h1><p>${esc(text)}</p>
       <form method="post" action="/inbox/f/${esc(token)}">
         <label for="email">Your email</label>
         <input id="email" name="email" type="email" required autocomplete="email" value="${esc(state.email || '')}">
         <label class="consent"><input type="checkbox" name="consent" value="yes" required> Send me this freebie and Scrolly emails. I can unsubscribe anytime.</label>
         ${state.error ? `<p class="error" role="alert">${esc(state.error)}</p>` : ''}
         <button type="submit">Send it to me</button>
       </form>
       <p class="small">See the <a href="https://scrollyseo.com/privacy/">privacy policy</a>.</p>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(k?.freebie || 'Your freebie')} · Scrolly</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Jost:wght@400;500&display=swap">
<style>
body{margin:0;background:#f7f3ec;color:#0a1930;font:17px/1.5 Jost,system-ui,sans-serif}
main{max-width:460px;margin:10vh auto 0;padding:0 16px}
.card{background:#fff;border-radius:20px;padding:24px}
.brand{font-family:'Instrument Serif',Georgia,serif;font-size:1.3rem;letter-spacing:.04em;margin:0 0 12px}
h1{font-family:'Instrument Serif',Georgia,serif;font-weight:400;font-size:2rem;line-height:1.1;margin:0 0 8px;letter-spacing:-.01em}
label{display:block;font-weight:500;margin:14px 0 6px;font-size:15px}
input[type=email]{width:100%;box-sizing:border-box;border:1px solid #8f8a83;border-radius:12px;padding:12px;font:17px Jost,sans-serif}
.consent{display:flex;gap:10px;align-items:flex-start;font-weight:400}
.consent input{width:20px;height:20px;margin-top:3px;accent-color:#4da3ff;flex:none}
button{margin-top:16px;width:100%;border:0;border-radius:999px;padding:13px;background:#4da3ff;color:#0a1930;font:500 17px Jost,sans-serif;cursor:pointer}
button:focus-visible,input:focus-visible,a:focus-visible{outline:3px solid #4da3ff;outline-offset:2px}
.error{color:#b3261e}.small{font-size:14px;color:#4a4e66;margin-top:14px}a{color:#0a1930}
</style></head><body><main><p class="brand">SCROLLY</p><div class="card">${body}</div></main></body></html>`;
}
function readForm(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e4) req.destroy();
    });
    req.on('end', () => resolve(Object.fromEntries(new URLSearchParams(raw))));
  });
}
const signupTries = [];
async function handleSignup(req, res, token) {
  const f = db.flows.find((x) => x.token === token);
  const k = f && readKeywords().find((x) => x.keyword === f.keyword);
  if (!f || !k) return send(res, 404, signupPage(null, '', { expired: true }), 'text/html; charset=utf-8');
  if (req.method === 'GET') {
    if (f.step !== 'signedUp') {
      flowStep(f, 'clicked');
      save();
    }
    return send(res, 200, signupPage(k, token, f.step === 'signedUp' ? { done: true, email: f.email } : {}), 'text/html; charset=utf-8');
  }
  // POST: a few tries a minute is plenty for a person; bots get slowed down.
  const cutoff = Date.now() - 60e3;
  while (signupTries.length && signupTries[0] < cutoff) signupTries.shift();
  signupTries.push(Date.now());
  if (signupTries.length > 30) return send(res, 429, signupPage(k, token, { error: 'Too many tries right now. Wait a minute and try again.' }), 'text/html; charset=utf-8');
  const form = await readForm(req);
  const email = str(form.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return send(res, 400, signupPage(k, token, { email, error: "That email doesn't look right." }), 'text/html; charset=utf-8');
  if (form.consent !== 'yes') return send(res, 400, signupPage(k, token, { email, error: 'Tick the box so I can email it to you.' }), 'text/html; charset=utf-8');
  try {
    await mailerlite('POST', '/subscribers', { email, groups: [k.mailerliteGroup], status: 'active' });
  } catch (e) {
    console.error('mailerlite', e.message);
    return send(res, 502, signupPage(k, token, { email, error: "Something went wrong on my side. Please try again in a minute." }), 'text/html; charset=utf-8');
  }
  flowStep(f, 'signedUp', { email });
  save();
  return send(res, 200, signupPage(k, token, { done: true, email }), 'text/html; charset=utf-8');
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
const ROW_FIELDS = ['kind', 'platform', 'type', 'priority', 'text', 'author', 'personId', 'commentId', 'threadId', 'link', 'post', 'receivedAt', 'status', 'draft', 'note', 'postedAt', 'keyword', 'dm', 'replyMid', 'read'];
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

// ---- conversations: everything from one person on one platform, newest first ----
function conversations() {
  const by = {};
  for (const r of db.rows) {
    const key = `${r.platform}:${(r.author || r.personId || r.id).toLowerCase()}`;
    const c = (by[key] ||= { key, platform: r.platform, author: r.author || '', personId: r.personId || '', items: [], waiting: 0, unread: 0, last: '' });
    c.items.push(r);
    if (!c.author && r.author) c.author = r.author;
    if (r.kind !== 'out' && ['New', 'Needs draft', 'Error', 'Reply by hand'].includes(r.status)) c.waiting++;
    if (r.kind !== 'out' && !r.read) c.unread++;
    const at = r.receivedAt || r.createdAt || '';
    if (at > c.last) c.last = at;
  }
  const list = Object.values(by).sort((a, b) => b.last.localeCompare(a.last));
  for (const c of list) {
    c.items.sort((a, b) => (a.receivedAt || '').localeCompare(b.receivedAt || ''));
    c.flows = db.flows.filter((f) => f.platform === c.platform && samePerson(f, { personId: c.personId, author: c.author }));
  }
  return list;
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
  // The signup funnel per keyword: how far people got.
  for (const f of db.flows) {
    if ((f.createdAt || '') < cutoff) continue;
    const k = (by[f.keyword] ||= { keyword: f.keyword, comments: 0, dmsSent: 0, dmsFailed: 0, posts: {} });
    const fun = (k.funnel ||= { asked: 0, linkSent: 0, clicked: 0, signedUp: 0, reminded: 0 });
    for (const s of ['asked', 'linkSent', 'clicked', 'signedUp']) if (f[`${s}At`]) fun[s]++;
    if (f.remindedAt) fun.reminded++;
  }
  const open = (s) => db.rows.filter((r) => r.status === s && r.kind !== 'out').length;
  return {
    days,
    keywords: Object.values(by).sort((a, b) => b.comments - a.comments),
    inbox: { toAnswer: open('New') + open('Error'), needsDraft: open('Needs draft'), tiktok: open('Reply by hand'), approved: open('Approved'), unread: db.rows.filter((r) => r.kind !== 'out' && !r.read).length },
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
  if (req.method === 'GET' && path === '/inbox') return send(res, 200, readFileSync(PAGE_FILE, 'utf8'), 'text/html; charset=utf-8');
  const signup = path.match(/^\/inbox\/f\/([A-Za-z0-9_-]{8,40})$/);
  if (signup && ['GET', 'POST'].includes(req.method)) return handleSignup(req, res, signup[1]);

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
  if (api === '/conversations' && req.method === 'GET') return send(res, 200, { conversations: conversations() });
  // Opening a conversation marks it read; "Mark as unread" puts it back.
  if (api === '/conversations/read' && req.method === 'POST') {
    const c = conversations().find((x) => x.key === body.key);
    if (!c) return send(res, 404, { error: 'not found' });
    for (const r of c.items) r.read = body.read !== false;
    save();
    return send(res, 200, { ok: true });
  }
  // Freebie flows (n8n starts them and moves them on; the signup page records clicks and signups).
  if (api === '/flows' && req.method === 'POST') {
    try {
      return send(res, 200, startFlow(body));
    } catch (e) {
      return send(res, 400, { error: e.message });
    }
  }
  if (api === '/flows' && req.method === 'GET') {
    const q = { personId: url.searchParams.get('personId') || '', author: url.searchParams.get('author') || '' };
    const step = url.searchParams.getAll('step');
    return send(res, 200, { flows: db.flows.filter((f) => (!q.personId && !q.author ? true : samePerson(f, q)) && (!step.length || step.includes(f.step))) });
  }
  if (api === '/flows/due' && req.method === 'GET') return send(res, 200, { flows: dueReminders() });
  // Every DM someone sends restarts Instagram's 24-hour window for their open flows.
  if (api === '/flows/touch' && req.method === 'POST') {
    let n = 0;
    for (const f of db.flows) {
      if (f.step === 'signedUp' || !samePerson(f, body)) continue;
      f.lastInboundAt = now();
      if (body.personId) f.dmPersonId = body.personId;
      n++;
    }
    save();
    return send(res, 200, { touched: n });
  }
  const fm = api.match(/^\/flows\/([A-Za-z0-9_-]{8,40})$/);
  if (fm && req.method === 'PATCH') {
    const f = db.flows.find((x) => x.token === fm[1]);
    if (!f) return send(res, 404, { error: 'not found' });
    try {
      if (body.step) flowStep(f, body.step);
      if (body.dmPersonId) f.dmPersonId = str(body.dmPersonId);
      if (body.lastInboundAt) f.lastInboundAt = now();
      save();
      return send(res, 200, f);
    } catch (e) {
      return send(res, 400, { error: e.message });
    }
  }
  if (api === '/mailerlite/groups' && req.method === 'GET') {
    try {
      const data = await mailerlite('GET', '/groups?limit=100&sort=name');
      return send(res, 200, { connected: true, groups: (data.data || []).map((g) => ({ id: String(g.id), name: g.name })) });
    } catch (e) {
      return send(res, 200, { connected: false, groups: [], error: e.message });
    }
  }
  const m = api.match(/^\/rows\/([a-f0-9]+)$/);
  if (TEST_HOOKS && api === '/test/fail-next-patch') return (failNextPatch = true), send(res, 200, { ok: true });
  if (TEST_HOOKS && api === '/test/backdate') {
    const f = db.flows.find((x) => x.token === body.token);
    if (f) f.linkSentAt = new Date(Date.now() - body.hours * 3600e3).toISOString();
    return send(res, f ? 200 : 404, { ok: !!f });
  }
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
  const km = api.match(/^\/keywords\/([A-Za-z0-9$]{1,20})$/);
  if (km && req.method === 'DELETE') return send(res, deleteKeyword(km[1]) ? 200 : 404, { ok: true });
  if (api === '/cleanup' && req.method === 'POST') return send(res, 200, { removed: youtubeCleanup(), ...db.lastCleanup });
  return send(res, 404, { error: 'not found' });
}

http
  .createServer((req, res) => {
    handle(req, res).catch((e) => send(res, 400, { error: e.message }));
  })
  .listen(PORT, () => console.log(`comment inbox on :${PORT}`));
