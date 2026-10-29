// Chat Manager inbox: the owner's private dashboard (https://<N8N_HOST>/inbox), the public
// signup pages, and the store n8n writes comments to. Started as Mercedes's Scrolly inbox
// (replaced her Notion Comment inbox on 2026-10-23); everything about one person lives in
// CONFIG_DIR/profile.json and the server's .env.
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
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { provider, listInfo } from './lists.mjs';

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
// The address people see in links (signup pages, previews).
const PUBLIC_HOST = env('N8N_HOST', env('PUBLIC_HOST', 'localhost'));
// Tests only (test/run-inbox.sh): lets the end-to-end test make the next row update fail.
const TEST_HOOKS = env('INBOX_TEST_HOOKS') === 'true';
// Demo dashboards (test/demo-inbox.mjs, the public demo.scrollyseo.com): made-up data, no login,
// nothing saved or sent, sample connection checks. DEMO_BUY_URL: where "Get Chat Manager" goes.
const DEMO = env('INBOX_DEMO') === 'true';
const DEMO_BUY_URL = env('DEMO_BUY_URL');
// Sites allowed to show the demo in a frame (the sales page), e.g. "https://scrollyseo.com https://www.scrollyseo.com".
const DEMO_FRAME_ANCESTORS = env('DEMO_FRAME_ANCESTORS').replace(/[^a-z0-9:/. *-]/gi, '');
const DEMO_READONLY = "Demo: changes aren't saved here. In your own Chat Manager this works right away.";
// The public demo restarts once a day (Docker brings it back), so its made-up activity stays recent.
if (DEMO && env('DEMO_RESTART_HOURS')) setTimeout(() => process.exit(0), Number(env('DEMO_RESTART_HOURS')) * 3600e3).unref();
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
let db = { rows: [], events: [], flows: [], subscribers: [], auth: null, sessions: {} };
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
//   email:  the DM carries a personal signup link ({link}); the signup page keeps the email, adds it
//           to the keyword's list in the connected email tool (lists.mjs) and shows the freebie.
// Optional before either: "ask first" (reply READY), and after an email link: one reminder DM.
const str = (v) => String(v ?? '').trim();
function cleanKeyword(k) {
  const keyword = str(k.keyword).toUpperCase();
  if (!/^[A-Z0-9$]{2,20}$/.test(keyword)) throw new Error(`"${k.keyword}" isn't a keyword: use 2 to 20 letters or numbers, no spaces`);
  const url = str(k.url);
  if (url && !/^https:\/\/\S+$/.test(url)) throw new Error(`${keyword}: the freebie link must start with https://`);
  const delivery = k.delivery === 'email' ? 'email' : 'direct';
  // YouTube has no DMs: a keyword there gets an automatic public reply with the freebie link
  // (direct) or the keyword's shared signup page (email), never a personal link.
  const where = { igComments: k.where?.igComments !== false, igDms: k.where?.igDms !== false, ytComments: !!k.where?.ytComments };
  const ask = { on: !!k.ask?.on, text: str(k.ask?.text), word: str(k.ask?.word || 'READY').toUpperCase() };
  // Minutes since 2026-10-23 (it was hours); Instagram's 24-hour window caps it at 23 hours.
  const minutes = Number(k.reminder?.minutes) || (Number(k.reminder?.hours) || 4) * 60;
  const reminder = { on: !!k.reminder?.on, minutes: Math.min(1380, Math.max(5, Math.round(minutes))), text: str(k.reminder?.text) };
  const yt = { text: str(k.yt?.text) };
  // Email signup hands the freebie over right away (on the page, plus a DM when Instagram allows),
  // so no MailerLite sequence is needed (the free plan allows only 3; Mercedes 2026-10-23).
  const afterSignup = { dm: str(k.afterSignup?.dm) };
  // A short public reply under the Instagram comment ("Sent you a DM!"), one wording per line, used in turn.
  // Only for followers: the DM people get when they reply READY but don't follow yet (needs "ask first").
  const followGate = { on: !!k.followGate?.on, text: str(k.followGate?.text) };
  const publicReply = { on: !!k.publicReply?.on, text: str(k.publicReply?.text).split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 10).join('\n') };
  // "Let them choose": the first DM gets two buttons, "Send it here" (the freebie link by DM, the
  // keyword's DM text) or "By email" (the signup link). Instagram cuts button titles at 20 characters.
  const choice = { on: !!k.choice?.on, here: str(k.choice?.here || 'Send it here').slice(0, 20), email: str(k.choice?.email || 'By email').slice(0, 20) };
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
    // The keyword's group / tag / audience / publication / segment in the connected email tool.
    // Keywords saved before 2026-10-24 kept it as mailerliteGroup(Name).
    list: { id: str(k.list?.id || k.mailerliteGroup), name: str(k.list?.name || k.mailerliteGroupName) },
    reminder,
    yt,
    afterSignup,
    publicReply,
    followGate,
    choice,
  };
  delete out.reminder.hours;
  delete out.mailerliteGroup;
  delete out.mailerliteGroupName;
  if (out.live || out.dmApproved) {
    if (!where.igComments && !where.igDms && !where.ytComments) throw new Error(`${keyword}: pick where it works`);
    if (where.ytComments && !yt.text.includes(delivery === 'email' ? '{link}' : '{url}')) throw new Error(`${keyword}: the YouTube reply needs ${delivery === 'email' ? '{link}' : '{url}'} in it`);
    if (ask.on && (!ask.text || !/^[A-Z0-9]{2,20}$/.test(ask.word))) throw new Error(`${keyword}: "ask first" needs its message and a one-word reply`);
    if (delivery === 'direct' && (!url || !out.dm.includes('{url}'))) throw new Error(`${keyword}: direct delivery needs the freebie link and a DM text with {url} in it`);
    const p = provider();
    if (delivery === 'email' && (!out.linkText.includes('{link}') || !url)) throw new Error(`${keyword}: email signup needs the freebie link and a DM text with {link} in it`);
    if (delivery === 'email' && p.needsTarget && !out.list.id) throw new Error(`${keyword}: pick the ${p.name} ${p.label} people join`);
    if (choice.on && (!ask.on || delivery !== 'email')) throw new Error(`${keyword}: "let them choose" needs "ask them to reply first" and email signup`);
    if (choice.on && !out.dm.includes('{url}')) throw new Error(`${keyword}: "let them choose" needs the "Send it here" DM text, with {url} in it`);
    if (followGate.on && !ask.on) throw new Error(`${keyword}: "only for followers" needs "ask them to reply first" switched on`);
    if (followGate.on && !followGate.text) throw new Error(`${keyword}: write the "follow me first" message`);
    if (publicReply.on && !publicReply.text) throw new Error(`${keyword}: write at least one reply for under the comment`);
    if (afterSignup.dm && !afterSignup.dm.includes('{url}')) throw new Error(`${keyword}: the DM after signup needs {url} in it`);
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
      .map(({ keyword, freebie, url, dm, delivery, where, ask, linkText, reminder, yt, afterSignup, publicReply, followGate, choice }) => ({ keyword, freebie, url, dm, delivery, where, ask, linkText, reminder, yt, afterSignup, publicReply, followGate, choice })),
  });
  return clean;
}
// ---- profile (CONFIG_DIR/profile.json): who this is and how their pages look ----
// Written by the setup skill (example: config/profile.example.json). Read on every request, so an
// edit shows without a restart. Neutral defaults so a missing file never shows someone else's brand.
const PROFILE = join(CONFIG_DIR, 'profile.json');
const PROFILE_DEFAULTS = {
  brand: 'My freebies',
  handle: '',
  privacyUrl: '/privacy',
  look: { background: '#f6f4f0', card: '#ffffff', text: '#1d1d1f', muted: '#55555c', button: '#2f6fed', buttonText: '#ffffff', headingFont: '', bodyFont: '', fontsUrl: '' },
  signup: { consent: 'Send me your emails too. I can unsubscribe anytime.' },
};
function readProfile() {
  let p = {};
  try {
    p = JSON.parse(readFileSync(PROFILE, 'utf8'));
  } catch {}
  return { ...PROFILE_DEFAULTS, ...p, look: { ...PROFILE_DEFAULTS.look, ...p.look }, signup: { ...PROFILE_DEFAULTS.signup, ...p.signup } };
}
const cssColor = (v, d) => (/^#[0-9a-f]{3,8}$/i.test(String(v || '')) ? v : d);
const cssFont = (v) => String(v || '').replace(/[^A-Za-z0-9 \-]/g, '').trim();
// The look of every public page (signup, privacy, home), from profile.look.
function pageStyle(pr) {
  const L = pr.look;
  const D = PROFILE_DEFAULTS.look;
  const head = cssFont(L.headingFont);
  const bodyF = cssFont(L.bodyFont);
  const fonts = /^https:\/\/fonts\.googleapis\.com\/\S+$/.test(L.fontsUrl || '') ? `<link rel="stylesheet" href="${esc(L.fontsUrl)}">` : '';
  return `${fonts}<style>
:root{--bg:${cssColor(L.background, D.background)};--card:${cssColor(L.card, D.card)};--ink:${cssColor(L.text, D.text)};--muted:${cssColor(L.muted, D.muted)};--btn:${cssColor(L.button, D.button)};--btn-ink:${cssColor(L.buttonText, D.buttonText)}}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.5 ${bodyF ? `'${bodyF}',` : ''}system-ui,sans-serif}
main{max-width:460px;margin:10vh auto 0;padding:0 16px}
main.wide{max-width:720px;margin-top:6vh;padding-bottom:60px}
.card{background:var(--card);border-radius:20px;padding:24px}
.brand{font-family:${head ? `'${head}',` : ''}Georgia,serif;font-size:1.3rem;letter-spacing:.04em;margin:0 0 12px}
h1,h2{font-family:${head ? `'${head}',` : ''}Georgia,serif;font-weight:400;line-height:1.1;letter-spacing:-.01em}
h1{font-size:2rem;margin:0 0 8px}h2{font-size:1.4rem;margin:24px 0 6px}
label{display:block;font-weight:500;margin:14px 0 6px;font-size:15px}
input[type=email]{width:100%;box-sizing:border-box;border:1px solid var(--muted);border-radius:12px;padding:12px;font:inherit}
.consent{display:flex;gap:10px;align-items:flex-start;font-weight:400}
.consent input{width:20px;height:20px;margin-top:3px;accent-color:var(--btn);flex:none}
button{margin-top:16px;width:100%;border:0;border-radius:999px;padding:13px;background:var(--btn);color:var(--btn-ink);font-weight:500;font-size:17px;font-family:inherit;cursor:pointer}
button:focus-visible,input:focus-visible,a:focus-visible{outline:3px solid var(--btn);outline-offset:2px}
.btn{display:inline-block;margin-top:6px;border-radius:999px;padding:13px 28px;background:var(--btn);color:var(--btn-ink);font-weight:500;text-decoration:none}.error{color:#b3261e}.small{font-size:14px;color:var(--muted);margin-top:14px}a{color:var(--ink)}
</style>`;
}

// ---- settings (CONFIG_DIR/settings.json, read by n8n too): the first-DM welcome message ----
const SETTINGS = join(CONFIG_DIR, 'settings.json');
function readSettings() {
  try {
    return JSON.parse(readFileSync(SETTINGS, 'utf8'));
  } catch {
    return {};
  }
}
function saveSettings(body) {
  const welcome = { on: !!body.welcome?.on, approved: !!body.welcome?.approved, text: str(body.welcome?.text).slice(0, 1000) };
  if (welcome.on && !welcome.text) throw new Error('Write the welcome message first.');
  const out = { ...readSettings(), welcome, updatedAt: now() };
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(`${SETTINGS}.tmp`, JSON.stringify(out, null, 2) + '\n');
  renameSync(`${SETTINGS}.tmp`, SETTINGS);
  return out;
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
// sentHere: they tapped "Send it here" (let them choose), so the link went by DM and the flow is done.
const FLOW_STEPS = ['asked', 'linkSent', 'clicked', 'signedUp', 'reminded', 'sentHere'];
const flowDone = (f) => f.step === 'signedUp' || f.step === 'sentHere';
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
  const open = db.flows.find((f) => f.keyword === body.keyword && !flowDone(f) && samePerson(f, body));
  if (open) return open;
  const f = { token: randomBytes(12).toString('base64url'), keyword: body.keyword, platform: body.platform || 'Instagram', personId: str(body.personId), author: str(body.author), post: str(body.post), step: body.step || 'linkSent', history: [], createdAt: now() };
  flowStep(f, f.step);
  db.flows.push(f);
  save();
  return f;
}
// After signup: the freebie link by DM too, when the keyword has an "after signup" DM and
// Instagram's 24-hour window is still open (only people who DMed can get one).
function dueDeliveries() {
  const kws = Object.fromEntries(readKeywords().map((k) => [k.keyword, k]));
  return db.flows.filter((f) => {
    const k = kws[f.keyword];
    return k?.live && k.afterSignup?.dm && f.step === 'signedUp' && !f.deliveredAt && f.dmPersonId && f.lastInboundAt && Date.now() - Date.parse(f.lastInboundAt) < 23 * 3600e3;
  });
}
// Reminders: link sent (or clicked) but no signup after the keyword's hours, still inside
// Instagram's 24-hour window after their last DM, and never reminded before.
function dueReminders() {
  const kws = Object.fromEntries(readKeywords().map((k) => [k.keyword, k]));
  return db.flows.filter((f) => {
    const k = kws[f.keyword];
    if (!k?.live || !k.reminder?.on || f.remindedAt || !['linkSent', 'clicked'].includes(f.step) || !f.lastInboundAt || !f.dmPersonId) return false;
    const sent = Date.parse(f.linkSentAt || f.createdAt);
    const wait = (Number(k.reminder.minutes) || (Number(k.reminder.hours) || 4) * 60) * 60e3;
    return Date.now() - sent >= wait && Date.now() - Date.parse(f.lastInboundAt) < 23 * 3600e3;
  });
}

// ---- the email list: every signup is kept here, and sent on to the connected tool ----
// A tool being down never costs a signup: the person still gets the freebie, the signup waits
// here and is retried (every 15 minutes, up to 8 times); the dashboard shows what didn't go through.
const MAX_TRIES = 8;
async function sendSignup(sub) {
  const p = provider();
  sub.provider = p.id;
  if (p.id === 'builtin') {
    sub.status = 'kept';
    return;
  }
  sub.tries = (sub.tries || 0) + 1;
  try {
    if (p.needsTarget && !sub.listId) throw new Error(`no ${p.name} ${p.label} picked for ${sub.keyword}`);
    await p.add(sub);
    sub.status = 'sent';
    sub.sentAt = now();
    delete sub.error;
  } catch (e) {
    sub.status = sub.tries >= MAX_TRIES ? 'failed' : 'waiting';
    sub.error = String(e.message || e).slice(0, 300);
    console.error('email list', sub.error);
  }
}
function keepSignup({ email, keyword, freebie, platform, listId, consent }) {
  // One entry per email per keyword; signing up again only refreshes the date.
  let sub = db.subscribers.find((x) => x.email === email && x.keyword === keyword);
  if (sub) sub.at = now();
  else db.subscribers.push((sub = { id: newId(), email, keyword, freebie, platform, listId, consent, at: now(), status: 'new' }));
  return sub;
}
async function retrySignups() {
  const waiting = db.subscribers.filter((x) => x.status === 'waiting' || x.status === 'new');
  for (const sub of waiting) await sendSignup(sub);
  if (waiting.length) save();
}
setInterval(() => retrySignups().catch(() => {}), 15 * 60e3).unref();
const csvCell = (v) => (/[",\r\n]/.test(String(v ?? '')) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
function subscribersCsv() {
  const head = ['email', 'keyword', 'freebie', 'platform', 'signed_up', 'consent_wording', 'sent_to', 'status'];
  const lines = db.subscribers.map((x) => [x.email, x.keyword, x.freebie, x.platform, x.at, x.consent, x.provider || '', x.status].map(csvCell).join(','));
  // A byte-order mark so Excel opens the file as UTF-8.
  return String.fromCharCode(0xfeff) + [head.join(','), ...lines].join('\r\n') + '\r\n';
}

// ---- the public signup page (no login: anyone with the personal link) ----
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// action: where the form posts (/inbox/f/<token> for a personal link, /inbox/s/<KEYWORD> for the shared one).
function signupPage(k, action, state = {}) {
  const pr = readProfile();
  const brand = pr.brand;
  // "Free tote bag pattern" reads as "Get your free tote bag pattern", never "free Free".
  const headline = k?.signup?.headline || `Get your free ${String(k?.freebie || "freebie").replace(/^free\s+/i, "")}`;
  const text = k?.signup?.text || 'Pop in your email and you can open it right away.';
  const body = state.demo
    ? `<h1>That's the demo</h1><p>In your own Chat Manager, their email goes to your list and the freebie opens right here.</p>`
    : state.expired
    ? `<h1>This link has expired</h1><p>Comment the keyword again and you'll get a fresh one.</p>`
    : state.done
    ? `<h1>Here's your ${esc(k?.freebie || 'freebie')}</h1><p><a class="btn" href="${esc(k?.url || '#')}" target="_blank" rel="noopener">Open it</a></p><p>You're on the list with <strong>${esc(state.email)}</strong>. Save this page or the link so you can come back to it anytime.</p>`
    : `<h1>${esc(headline)}</h1><p>${esc(text)}</p>
       <form method="post" action="${esc(action)}">
         <label for="email">Your email</label>
         <input id="email" name="email" type="email" required autocomplete="email" value="${esc(state.email || '')}">
         <label class="consent"><input type="checkbox" name="consent" value="yes" required> ${esc(pr.signup.consent)}</label>
         ${state.error ? `<p class="error" role="alert">${esc(state.error)}</p>` : ''}
         <button type="submit">Get it now</button>
       </form>
       <p class="small">See the <a href="${esc(pr.privacyUrl)}">privacy policy</a>.</p>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(state.done ? `Here's your ${k?.freebie || 'freebie'}` : state.expired ? 'Link expired' : headline)} · ${esc(brand)}</title>
<meta name="description" content="${esc(state.done || state.expired ? brand : text)}">
<meta property="og:title" content="${esc(state.done || state.expired ? brand : headline)}">
<meta property="og:description" content="${esc(state.done || state.expired ? brand : text)}">
${pageStyle(pr)}</head><body><main><p class="brand">${esc(brand.toUpperCase())}</p><div class="card">${body}</div></main></body></html>`;
}
// The owner's public pages (/, /privacy, /terms): HTML they own in CONFIG_DIR/pages/<name>.html
// (the setup skill fills in templates/privacy.html), shown in their look. Meta and Google need
// a privacy policy, terms and a home page link even when someone has no website.
const PAGES = { '/': 'home', '/privacy': 'privacy', '/terms': 'terms' };
function publicPage(name) {
  const pr = readProfile();
  const file = join(CONFIG_DIR, 'pages', `${name}.html`);
  const inner = existsSync(file) ? readFileSync(file, 'utf8') : name === 'home' ? `<h1>${esc(pr.brand)}</h1><p>Freebies and replies for ${esc(pr.handle ? `@${pr.handle}` : pr.brand)}.</p>` : null;
  if (inner === null) return null;
  const title = (inner.match(/<h1[^>]*>([^<]{1,120})<\/h1>/) || [])[1] || pr.brand;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · ${esc(pr.brand)}</title>
${pageStyle(pr)}</head><body><main class="wide"><p class="brand">${esc(pr.brand.toUpperCase())}</p><div class="card">${inner}</div></main></body></html>`;
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
// Link-preview robots (Instagram/Facebook fetch every link in a DM) aren't people opening it.
const isRobot = (req) => /facebookexternalhit|meta-externalagent|facebot|bot\b|crawler|spider|preview|whatsapp/i.test(String(req.headers['user-agent'] || ''));
const signupTries = [];
async function handleSignup(req, res, token) {
  const f = db.flows.find((x) => x.token === token);
  const k = f && readKeywords().find((x) => x.keyword === f.keyword);
  if (!f || !k) return send(res, 404, signupPage(null, '', { expired: true }), 'text/html; charset=utf-8');
  const action = f.shared ? `/inbox/s/${f.keyword}` : `/inbox/f/${token}`;
  if (req.method === 'GET') {
    if (f.step !== 'signedUp' && !isRobot(req)) {
      flowStep(f, 'clicked');
      save();
    }
    return send(res, 200, signupPage(k, action, f.step === 'signedUp' ? { done: true, email: f.email } : {}), 'text/html; charset=utf-8');
  }
  // POST: a few tries a minute is plenty for a person; bots get slowed down.
  const cutoff = Date.now() - 60e3;
  while (signupTries.length && signupTries[0] < cutoff) signupTries.shift();
  signupTries.push(Date.now());
  if (signupTries.length > 30) return send(res, 429, signupPage(k, action, { error: 'Too many tries right now. Wait a minute and try again.' }), 'text/html; charset=utf-8');
  const form = await readForm(req);
  const email = str(form.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return send(res, 400, signupPage(k, action, { email, error: "That email doesn't look right." }), 'text/html; charset=utf-8');
  if (form.consent !== 'yes') return send(res, 400, signupPage(k, action, { email, error: 'Tick the box so I can email it to you.' }), 'text/html; charset=utf-8');
  // Kept here first, then sent on to the email tool; if the tool fails, retrySignups tries again.
  const sub = keepSignup({ email, keyword: k.keyword, freebie: k.freebie, platform: f.platform, listId: k.list?.id || k.mailerliteGroup || '', consent: readProfile().signup.consent });
  await sendSignup(sub);
  flowStep(f, 'signedUp', { email });
  // The DM with the freebie link goes out from n8n right away (its reminder job also sends these).
  runJob('reminders');
  save();
  return send(res, 200, signupPage(k, action, { done: true, email }), 'text/html; charset=utf-8');
}
// The shared signup page for a keyword (/inbox/s/KEYWORD), used in public YouTube replies:
// anyone can open it, so it starts a flow only when someone actually signs up.
async function handleSharedSignup(req, res, name) {
  const k = readKeywords().find((x) => x.keyword === name.toUpperCase() && x.live && x.dmApproved && x.delivery === 'email');
  if (!k) return send(res, 404, signupPage(null, '', { expired: true }), 'text/html; charset=utf-8');
  const f = { token: `s-${randomBytes(9).toString('base64url')}`, keyword: k.keyword, platform: 'YouTube', personId: '', author: '', step: 'linkSent', history: [], createdAt: now(), shared: true };
  if (req.method === 'GET') {
    if (!isRobot(req)) {
      db.events.push({ at: now(), keyword: k.keyword, platform: 'YouTube', post: '', result: 'opened' });
      save();
    }
    return send(res, 200, signupPage(k, `/inbox/s/${k.keyword}`), 'text/html; charset=utf-8');
  }
  // POST: same checks as the personal page; a flow is recorded only for a real signup.
  db.flows.push(f);
  flowStep(f, 'linkSent');
  flowStep(f, 'clicked');
  const before = res.statusCode;
  await handleSignup(req, res, f.token);
  if (f.step !== 'signedUp') db.flows = db.flows.filter((x) => x !== f);
  save();
  return before;
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
  if (DEMO) return true;
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
    if (e.at < cutoff || e.result === 'opened') continue;
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
    const fun = (k.funnel ||= { asked: 0, followGated: 0, linkSent: 0, clicked: 0, signedUp: 0, reminded: 0, sentHere: 0, delivered: 0 });
    if (f.followGatedAt) fun.followGated++;
    for (const s of ['asked', 'linkSent', 'clicked', 'signedUp', 'sentHere']) if (f[`${s}At`]) fun[s]++;
    if (f.remindedAt) fun.reminded++;
    if (f.deliveredAt) fun.delivered++;
  }
  const open = (s) => db.rows.filter((r) => r.status === s && r.kind !== 'out').length;
  // Contacts = people who commented or messaged (like ManyChat's contacts), counted by first contact.
  const firstSeen = {};
  for (const r of db.rows) {
    if (r.kind === 'out') continue;
    const who = `${r.platform}:${(r.author || r.personId || r.id).toLowerCase()}`;
    const at = r.receivedAt || r.createdAt || '';
    if (!firstSeen[who] || at < firstSeen[who]) firstSeen[who] = at;
  }
  // Daily series for the trend charts (local server dates, oldest first).
  const day = (iso) => String(iso || '').slice(0, 10);
  const series = {};
  for (let i = days - 1; i >= 0; i--) series[day(new Date(Date.now() - i * 86400e3).toISOString())] = { newContacts: 0, keywordUses: 0, dmsSent: 0, signups: 0 };
  const bump = (iso, key) => series[day(iso)] && series[day(iso)][key]++;
  for (const at of Object.values(firstSeen)) bump(at, 'newContacts');
  for (const e of db.events) if (e.result !== 'opened') bump(e.at, 'keywordUses');
  for (const e of db.events) if (e.result === 'sent') bump(e.at, 'dmsSent');
  for (const f of db.flows) if (f.signedUpAt) bump(f.signedUpAt, 'signups');
  // Totals for this period and the one before it (same length), for "+18% vs the previous 30 days".
  const span = (from, to) => {
    const inside = (iso) => !!iso && iso >= from && iso < to;
    const linkSent = db.flows.filter((f) => inside(f.linkSentAt));
    return {
      newContacts: Object.values(firstSeen).filter(inside).length,
      keywordUses: db.events.filter((e) => e.result !== 'opened' && inside(e.at)).length,
      dmsSent: db.events.filter((e) => e.result === 'sent' && inside(e.at)).length,
      signups: db.flows.filter((f) => inside(f.signedUpAt)).length,
      conversion: linkSent.length ? Math.round((linkSent.filter((f) => f.signedUpAt).length / linkSent.length) * 100) : null,
    };
  };
  const end = new Date(Date.now() + 60e3).toISOString();
  const prevCutoff = new Date(Date.now() - 2 * days * 86400e3).toISOString();
  // Top posts: which Reel or post brought the keyword comments, DMs and (from 2026-10-24) signups.
  const posts = {};
  const post = (link, platform) => (posts[link] ||= { post: link, platform, keywords: [], uses: 0, dmsSent: 0, signups: 0 });
  for (const e of db.events) {
    if (!e.post || e.at < cutoff || e.result === 'opened') continue;
    const p = post(e.post, e.platform);
    p.uses++;
    if (e.result === 'sent') p.dmsSent++;
    if (!p.keywords.includes(e.keyword)) p.keywords.push(e.keyword);
  }
  for (const f of db.flows) if (f.post && (f.signedUpAt || '') >= cutoff) post(f.post, f.platform).signups++;
  // Her reply time: comments and DMs she answered herself (not keywords), from arriving to posted.
  const answered = db.rows.filter((r) => r.kind !== 'out' && r.status === 'Posted' && r.postedAt && r.receivedAt && r.postedAt >= cutoff);
  const waits = answered.map((r) => (Date.parse(r.postedAt) - Date.parse(r.receivedAt)) / 60e3).filter((m) => m >= 0).sort((a, b) => a - b);
  return {
    days,
    totals: {
      contacts: Object.keys(firstSeen).length,
      ...span(cutoff, end),
      subscribersAllTime: db.flows.filter((f) => f.signedUpAt).length,
    },
    previous: span(prevCutoff, cutoff),
    series: Object.entries(series).map(([date, v]) => ({ date, ...v })),
    keywords: Object.values(by).sort((a, b) => b.comments - a.comments),
    posts: Object.values(posts).sort((a, b) => b.signups - a.signups || b.uses - a.uses).slice(0, 10),
    replies: { answered: waits.length, medianMinutes: waits.length ? Math.round(waits[Math.floor(waits.length / 2)]) : null, waiting: db.rows.filter((r) => r.kind !== 'out' && ['New', 'Needs draft', 'Error', 'Reply by hand'].includes(r.status)).length },
    inbox: { toAnswer: open('New') + open('Error'), needsDraft: open('Needs draft'), tiktok: open('Reply by hand'), approved: open('Approved'), unread: db.rows.filter((r) => r.kind !== 'out' && !r.read && !['Handled', 'Skip'].includes(r.status)).length },
  };
}

// ---- health: is every connection working? (the "Connections" card on Stats, a banner on Inbox) ----
// Read from n8n's status webhook (test mode, last checks, its last 20 errors) and this server's own
// data. Each check: state ok | warn | bad | off, a plain sentence, and what to do about it.
const N8N_STATUS_URL = env('N8N_STATUS_URL', N8N_RUN_URL.replace(/comments-run$/, 'comments-status'));
// Error texts can carry a key from a failed request URL; never show one.
const redact = (s) => String(s || '').replace(/(access_token|refresh_token|api_key|key|token)=[^&\s"']+/gi, '$1=…').replace(/\b[A-Za-z0-9_-]{60,}\b/g, '…').slice(0, 300);
let healthCache = null;
const DEMO_HEALTH = {
  state: 'ok',
  checks: [
    { id: 'n8n', name: 'Automation', state: 'ok', text: 'Running.', fix: '' },
    { id: 'instagram', name: 'Instagram', state: 'ok', text: 'Working. Last keyword DM 12 min ago.', fix: '' },
    { id: 'youtube', name: 'YouTube', state: 'ok', text: 'Working. Last checked 9 min ago.', fix: '' },
    { id: 'tiktok', name: 'TikTok', state: 'off', text: 'Not connected.', fix: '' },
    { id: 'email', name: 'Email list', state: 'ok', text: 'Built-in list: signups are kept here (Email list tab).', fix: '' },
  ],
  errors: [],
};
async function health() {
  if (DEMO) return { ...DEMO_HEALTH, at: now() };
  if (healthCache && Date.now() - healthCache.at < 60e3) return healthCache.value;
  const checks = [];
  const add = (id, name, state, text, fix = '') => checks.push({ id, name, state, text, fix });
  const since = (h) => new Date(Date.now() - h * 3600e3).toISOString();
  const agoText = (iso) => {
    const m = Math.round((Date.now() - Date.parse(iso)) / 60e3);
    return m < 90 ? `${Math.max(m, 1)} min ago` : m < 2880 ? `${Math.round(m / 60)} hours ago` : `${Math.round(m / 1440)} days ago`;
  };
  let st = null;
  let stError = '';
  if (!RUN_SECRET) stError = 'RUN_SECRET is missing from the server settings';
  else {
    try {
      const r = await fetch(N8N_STATUS_URL, { headers: { 'x-run-secret': RUN_SECRET }, signal: AbortSignal.timeout(6000) });
      st = await r.json();
      if (st.error) throw new Error(st.error);
    } catch (e) {
      st = null;
      stError = redact(e.message || e);
    }
  }
  const errs = (st?.errors || []).map((e) => ({ ...e, error: redact(e.error) }));
  const latest = (re, h) => errs.filter((e) => re.test(e.where) && e.at >= since(h)).sort((a, b) => b.at.localeCompare(a.at));
  // 1. The automation itself.
  if (!st) add('n8n', 'Automation', 'bad', `Can't reach it (${stError}). Nothing gets answered until it's back.`, 'Ask Claude: "check my Chat Manager server".');
  else if (st.testMode) add('n8n', 'Automation', 'warn', 'Test mode is on: keyword DMs and replies are not really sent.', 'Ask Claude to switch test mode off when you are ready.');
  else add('n8n', 'Automation', 'ok', 'Running.');
  if (st) {
    // 2. Instagram: key renewal, message checks, DMs that didn't go out.
    const token = latest(/^instagram-token$/, 8 * 24);
    const sig = latest(/^instagram-signature$/, 24);
    const dms = latest(/^instagram-(dm|reminder|delivery|welcome)$/, 7 * 24);
    const lastDm = db.events.filter((e) => e.platform === 'Instagram' && e.result === 'sent').map((e) => e.at).sort().pop();
    const keyAge = st.igTokenRefreshedAt ? (Date.now() - Date.parse(st.igTokenRefreshedAt)) / 86400e3 : null;
    if (token.length) add('instagram', 'Instagram', 'bad', `The Instagram key couldn't be renewed: ${token[0].error}`, 'Ask Claude: "renew my Instagram key". Keys run out 60 days after the last renewal.');
    else if (keyAge != null && keyAge > 50) add('instagram', 'Instagram', 'bad', `The Instagram key was last renewed ${Math.round(keyAge)} days ago and runs out at 60.`, 'Ask Claude: "renew my Instagram key".');
    else if (sig.length) add('instagram', 'Instagram', 'bad', 'Instagram messages are being ignored: the app secret check failed.', 'Ask Claude: "check my Meta app secret".');
    else if (dms.length) add('instagram', 'Instagram', 'warn', `${dms.length} DM${dms.length === 1 ? '' : 's'} didn't send this week. Last reason: ${dms[0].error}`, 'Instagram only allows DMs within 24 hours of their last message; other reasons: ask Claude.');
    else add('instagram', 'Instagram', 'ok', lastDm ? `Working. Last keyword DM ${agoText(lastDm)}.` : 'Working. No keyword DMs yet.');
    // 3. YouTube (checked every 30 minutes) and TikTok (daily), when connected.
    const feed = (id, name, checkedAt, re, maxHours, fixText) => {
      const err = latest(re, 48)[0];
      if (!checkedAt && !err) return add(id, name, 'off', 'Not connected.');
      if (err && (!checkedAt || err.at > checkedAt)) {
        const expired = /invalid_grant|expired|revoked/i.test(err.error);
        return add(id, name, 'bad', expired ? `The ${name} sign-in ran out (${err.error}).` : `The last check failed: ${err.error}`, expired && id === 'youtube' ? 'If your Google app is still in "Testing", sign-ins end after 7 days: publish it, then ask Claude to reconnect YouTube.' : fixText);
      }
      if (Date.now() - Date.parse(checkedAt) > maxHours * 3600e3) return add(id, name, 'warn', `Last checked ${agoText(checkedAt)}.`, fixText);
      add(id, name, 'ok', `Working. Last checked ${agoText(checkedAt)}.`);
    };
    feed('youtube', 'YouTube', st.youtubeCheckedAt, /^youtube-/, 2, 'Ask Claude: "check my YouTube connection".');
    feed('tiktok', 'TikTok', st.tiktokCheckedAt, /^tiktok-/, 26, 'Ask Claude: "check my TikTok import".');
    // 4. n8n writing to this dashboard.
    const link = latest(/^inbox-/, 24);
    if (link.length) add('inbox', 'Dashboard link', 'warn', `The automation couldn't reach this dashboard ${link.length} time${link.length === 1 ? '' : 's'} today. Last: ${link[0].error}`, 'Usually a restart; ask Claude: "check my Chat Manager server".');
  }
  // 5. The email tool.
  const p = provider();
  const stuck = db.subscribers.filter((x) => ['waiting', 'failed'].includes(x.status));
  if (p.id === 'builtin') add('email', 'Email list', 'ok', 'Built-in list: signups are kept here (Email list tab).');
  else if (!p.connected()) add('email', p.name, 'bad', `No ${p.name} key on the server, so signups wait here.`, `Ask Claude: "connect ${p.name}".`);
  else {
    let reach = '';
    if (p.targets) {
      try {
        await p.targets();
      } catch (e) {
        reach = redact(e.message || e);
      }
    }
    if (reach) add('email', p.name, 'bad', `Can't reach ${p.name}: ${reach}`, `Ask Claude: "check my ${p.name} connection".`);
    else if (stuck.length) add('email', p.name, 'warn', `${stuck.length} signup${stuck.length === 1 ? '' : 's'} haven't reached ${p.name} yet (they got their freebie). Last reason: ${redact(stuck[0].error) || 'unknown'}`, 'Email list tab → "Try again now".');
    else add('email', p.name, 'ok', 'Connected.');
  }
  // 6. Replies she approved that didn't post.
  const failed = db.rows.filter((r) => r.kind !== 'out' && r.status === 'Error');
  if (failed.length) add('replies', 'Replies you sent', 'warn', `${failed.length} repl${failed.length === 1 ? 'y' : 'ies'} didn't send. ${redact(failed[0].note)}`, 'Open them in the Inbox to try again.');
  const recent = errs.filter((e) => e.at >= since(7 * 24)).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10);
  const value = { at: now(), state: checks.some((c) => c.state === 'bad') ? 'bad' : checks.some((c) => c.state === 'warn') ? 'warn' : 'ok', checks, errors: recent };
  healthCache = { at: Date.now(), value };
  return value;
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
  return runJob('replies');
}
async function runJob(job) {
  if (!RUN_SECRET) return;
  try {
    await fetch(N8N_RUN_URL, { method: 'POST', headers: { 'x-run-secret': RUN_SECRET, 'Content-Type': 'application/json' }, body: JSON.stringify({ job }) });
  } catch {
    // n8n's own scheduled run picks it up anyway.
  }
}

// ---- http ----
function send(res, code, body, type = 'application/json') {
  res.writeHead(code, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    // The public demo may be shown inside the sales page; every other dashboard never in a frame.
    ...(DEMO && DEMO_FRAME_ANCESTORS ? { 'Content-Security-Policy': `frame-ancestors ${DEMO_FRAME_ANCESTORS}` } : { 'X-Frame-Options': 'DENY' }),
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
  if (req.method === 'GET' && PAGES[path]) {
    const page = publicPage(PAGES[path]);
    return page ? send(res, 200, page, 'text/html; charset=utf-8') : send(res, 404, 'Not found', 'text/plain');
  }
  if (req.method === 'GET' && path === '/inbox') return send(res, 200, readFileSync(PAGE_FILE, 'utf8'), 'text/html; charset=utf-8');
  const signup = path.match(/^\/inbox\/f\/([A-Za-z0-9_-]{8,40})$/);
  if (DEMO && (signup || path.startsWith('/inbox/s/')) && req.method === 'POST') return send(res, 200, signupPage(null, '', { demo: true }), 'text/html; charset=utf-8');
  if (signup && ['GET', 'POST'].includes(req.method)) return handleSignup(req, res, signup[1]);
  const shared = path.match(/^\/inbox\/s\/([A-Za-z0-9$]{2,20})$/);
  if (shared && ['GET', 'POST'].includes(req.method)) return handleSharedSignup(req, res, shared[1]);

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
    // Logged out: /me only says whether a password exists. Logged in, it falls through to the full answer.
    if (path === '/inbox/api/me' && !sessionOk(req)) return send(res, 200, { loggedIn: false, passwordSet: !!db.auth });
    if (!sessionOk(req)) return send(res, 401, { error: 'Please log in.' });
    if (!sameOrigin(req)) return send(res, 403, { error: 'forbidden' });
  }
  const api = path.slice('/inbox/api'.length);
  if (DEMO && req.method !== 'GET') return send(res, 403, { error: DEMO_READONLY, demo: true });
  const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await readBody(req) : {};

  if (api === '/health' && req.method === 'GET') {
    if (url.searchParams.get('fresh')) healthCache = null;
    return send(res, 200, await health());
  }
  if (api === '/me') return send(res, 200, { loggedIn: true, demo: DEMO, demoBuyUrl: DEMO ? DEMO_BUY_URL : '', passwordSet: !!db.auth, dmsEnabled: env('DMS_ENABLED') === 'true', list: listInfo(), profile: readProfile(), publicHost: PUBLIC_HOST, waitingSignups: db.subscribers.filter((x) => ['waiting', 'failed'].includes(x.status)).length });
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
  if (api === '/flows/delivery-due' && req.method === 'GET') return send(res, 200, { flows: dueDeliveries() });
  // Every DM someone sends restarts Instagram's 24-hour window for their open flows.
  if (api === '/flows/touch' && req.method === 'POST') {
    let n = 0;
    for (const f of db.flows) {
      if (flowDone(f) || !samePerson(f, body)) continue;
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
      if (body.delivered) f.deliveredAt = f.deliveredAt || now();
      // Replied READY but didn't follow yet: told to follow first (counted, the flow stays at "asked").
      if (body.followGated) {
        f.followGatedAt = f.followGatedAt || now();
        f.history.push({ at: now(), step: 'followGated' });
      }
      save();
      return send(res, 200, f);
    } catch (e) {
      return send(res, 400, { error: e.message });
    }
  }
  // The email list: which tool is connected, its groups / tags / audiences / publications / segments.
  if (api === '/lists' && req.method === 'GET') return send(res, 200, listInfo());
  if (api === '/lists/targets' && req.method === 'GET') {
    const p = provider();
    if (!p.targets) return send(res, 200, { connected: p.connected(), targets: [] });
    try {
      return send(res, 200, { connected: true, targets: await p.targets() });
    } catch (e) {
      return send(res, 200, { connected: false, targets: [], error: e.message });
    }
  }
  // "+ New group / tag / segment" on a keyword page.
  if (api === '/lists/targets' && req.method === 'POST') {
    const p = provider();
    const name = str(body.name).slice(0, 100);
    if (!p.create) return send(res, 400, { error: `Make the ${p.label} in ${p.name}, then pick it here.` });
    if (!name) return send(res, 400, { error: `Give the ${p.label} a name.` });
    try {
      return send(res, 200, await p.create(name));
    } catch (e) {
      return send(res, 400, { error: e.message });
    }
  }
  // One target's extra panel (MailerLite: group size and the email sequences it starts).
  const lt = api.match(/^\/lists\/targets\/([A-Za-z0-9_-]{1,60})$/);
  if (lt && req.method === 'GET') {
    const p = provider();
    if (!p.detail) return send(res, 200, { connected: p.connected() });
    try {
      return send(res, 200, { connected: true, ...(await p.detail(lt[1])) });
    } catch (e) {
      return send(res, 200, { connected: false, error: e.message });
    }
  }
  // "Send a test signup": proves the connection without a real person (not kept in the list).
  if (api === '/lists/test' && req.method === 'POST') {
    const p = provider();
    if (p.id === 'builtin') return send(res, 200, { ok: true, note: 'The built-in list needs no connection.' });
    const test = { email: str(body.email).toLowerCase(), keyword: str(body.keyword || 'TEST').toUpperCase(), freebie: 'Test signup', platform: 'Instagram', listId: str(body.listId), consent: readProfile().signup.consent, at: now(), test: true };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(test.email)) return send(res, 400, { error: 'Type the email to test with (yours).' });
    try {
      if (p.needsTarget && !test.listId) throw new Error(`Pick the ${p.label} first.`);
      await p.add(test);
      return send(res, 200, { ok: true });
    } catch (e) {
      return send(res, 400, { error: e.message });
    }
  }
  // Everyone who signed up (kept on this server whatever tool is connected).
  if (api === '/subscribers' && req.method === 'GET') return send(res, 200, { subscribers: [...db.subscribers].sort((a, b) => b.at.localeCompare(a.at)), list: listInfo() });
  if (api === '/subscribers.csv' && req.method === 'GET') {
    res.setHeader('Content-Disposition', `attachment; filename="email-list-${now().slice(0, 10)}.csv"`);
    return send(res, 200, subscribersCsv(), 'text/csv; charset=utf-8');
  }
  // "Try again now" for signups the email tool didn't take.
  if (api === '/subscribers/retry' && req.method === 'POST') {
    for (const x of db.subscribers) if (x.status === 'failed') x.tries = 0, (x.status = 'waiting');
    await retrySignups();
    return send(res, 200, { waiting: db.subscribers.filter((x) => x.status === 'waiting').length });
  }
  // Deletion requests: removes the email from this server (they also need removing in the email tool).
  const sd = api.match(/^\/subscribers\/([a-f0-9]{16})$/);
  if (sd && req.method === 'DELETE') {
    const gone = db.subscribers.find((x) => x.id === sd[1]);
    db.subscribers = db.subscribers.filter((x) => x.id !== sd[1]);
    for (const f of db.flows) if (gone && f.email === gone.email) delete f.email;
    save();
    return send(res, gone ? 200 : 404, { deleted: gone ? 1 : 0 });
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
  if (api === '/settings' && req.method === 'GET') return send(res, 200, readSettings());
  if (api === '/settings' && req.method === 'PUT') {
    try {
      return send(res, 200, saveSettings(body));
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
