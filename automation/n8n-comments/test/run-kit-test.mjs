// Chat Manager kit checks that need no Docker: the inbox (inbox/server.mjs) is started once per
// email tool against an in-process stand-in for that tool's API, then a person signs up through
// the real signup page. Also checks the built-in list + CSV, the webhook, retries, the profile
// look and the public pages.   node test/run-kit-test.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, createHmac } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MOCK_PORT = 5695;
const INBOX_PORT = 5696;
const SECRET = 'kit-secret';
let pass = 0;
let fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : `\n      ${String(detail).slice(0, 400)}`}`);
}

// ---- stand-in email tools: records every request; failNext makes the next add fail ----
let log = [];
let failNext = 0;
// failFields: the next "make a field" request fails (answers then can't go in; the signup still must).
let failFields = 0;
const json = (res, code, body) => (res.writeHead(code, { 'Content-Type': 'application/json' }), res.end(JSON.stringify(body)));
const mock = http.createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    const url = new URL(req.url, 'http://x');
    let body = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {}
    const entry = { method: req.method, path: url.pathname, query: url.search, body, raw, headers: req.headers };
    log.push(entry);
    const p = url.pathname;
    const adding = req.method !== 'GET' && /\/(subscribers|members|subscriptions|hook)/.test(p) && !/\/tags$/.test(p) && !/\/tags\/\d+\/subscribers$/.test(p);
    if (adding && failNext > 0) return failNext--, json(res, 503, { message: 'down for maintenance' });
    if (failFields > 0 && req.method === 'POST' && /\/(fields|custom_fields|custom-fields)$/.test(p)) return failFields--, json(res, 422, { message: 'field limit reached' });
    // MailerLite
    if (p === '/ml/fields' && req.method === 'GET') return json(res, 200, { data: [{ id: 5, name: 'Company', key: 'company', type: 'text' }] });
    if (p === '/ml/fields' && req.method === 'POST') return json(res, 200, { data: { id: 6, name: body.name, key: String(body.name).toLowerCase().replace(/\s+/g, '_'), type: body.type } });
    if (p === '/ml/groups' && req.method === 'GET') return json(res, 200, { data: [{ id: 111, name: 'Freebie: FREE' }] });
    if (p === '/ml/groups' && req.method === 'POST') return json(res, 201, { data: { id: 222, name: body.name } });
    if (p === '/ml/groups/111') return json(res, 200, { data: { id: 111, name: 'Freebie: FREE', active_count: 3 } });
    if (p === '/ml/automations') return json(res, 200, { data: [] });
    if (p === '/ml/subscribers') return json(res, 201, { data: { id: 'x' } });
    // Kit
    if (p === '/kit/v4/tags' && req.method === 'GET') return json(res, 200, { tags: [{ id: 41, name: 'freebie-free' }], pagination: {} });
    if (p === '/kit/v4/tags' && req.method === 'POST') return json(res, 201, { tag: { id: String(body.name).startsWith('sews:') ? 43 : 42, name: body.name } });
    if (p === '/kit/v4/subscribers') return json(res, 201, { subscriber: { id: 1 } });
    if (/^\/kit\/v4\/tags\/\d+\/subscribers$/.test(p)) return json(res, 201, { subscriber: { id: 1 } });
    // Mailchimp
    if (p === '/mc/lists') return json(res, 200, { lists: [{ id: 'aud1', name: 'My audience' }] });
    if (/^\/mc\/lists\/aud1\/members\/[a-f0-9]{32}$/.test(p)) return json(res, 200, { id: 'm1' });
    if (/^\/mc\/lists\/aud1\/members\/[a-f0-9]{32}\/tags$/.test(p)) return res.writeHead(204), res.end();
    // beehiiv
    if (p === '/bh/v2/publications') return json(res, 200, { data: [{ id: 'pub_1', name: 'My newsletter' }] });
    if (p === '/bh/v2/publications/pub_1/custom_fields' && req.method === 'GET') return json(res, 200, { data: [], page: 1, total_pages: 1 });
    if (p === '/bh/v2/publications/pub_1/custom_fields' && req.method === 'POST') return json(res, 200, { data: { id: 'cf1', kind: body.kind, display: body.display } });
    if (p === '/bh/v2/publications/pub_1/subscriptions') return json(res, 201, { data: { id: 'sub_1' } });
    // Flodesk
    if (p === '/fd/v1/segments' && req.method === 'GET') return json(res, 200, { meta: {}, data: [{ id: 'seg1', name: 'Freebie' }] });
    if (p === '/fd/v1/segments' && req.method === 'POST') return json(res, 201, { id: 'seg2', name: body.name });
    if (p === '/fd/v1/custom-fields/all') return json(res, 200, [{ key: 'company', label: 'Company' }]);
    if (p === '/fd/v1/custom-fields' && req.method === 'POST') return json(res, 201, { key: String(body.label).toLowerCase(), label: body.label });
    if (p === '/fd/v1/subscribers') return json(res, 200, { id: 'fd1', email: body.email });
    // Webhook
    if (p === '/hook') return json(res, 200, { ok: true });
    json(res, 404, { message: `no stand-in for ${req.method} ${p}` });
  });
});
await new Promise((r) => mock.listen(MOCK_PORT, r));
const M = `http://localhost:${MOCK_PORT}`;

// ---- one inbox per tool ----
let child = null;
let cfgDir = '';
async function startInbox(extraEnv, keywordList) {
  if (child) child.kill(), await new Promise((r) => child.once('exit', r));
  const tmp = mkdtempSync(join(tmpdir(), 'chatmgr-'));
  cfgDir = join(tmp, 'config');
  mkdirSync(cfgDir);
  mkdirSync(join(cfgDir, 'pages'));
  writeFileSync(join(cfgDir, 'keywords-all.json'), JSON.stringify({ keywords: keywordList }));
  writeFileSync(join(cfgDir, 'profile.json'), JSON.stringify({ brand: 'Bloom Studio', handle: 'bloomstudio', privacyUrl: '/privacy', look: { background: '#fff0f5', button: '#aa3366', headingFont: 'Fraunces', fontsUrl: 'https://fonts.googleapis.com/css2?family=Fraunces&display=swap' }, signup: { consent: 'Add me to Bloom Studio emails. I can unsubscribe anytime.' } }));
  writeFileSync(join(cfgDir, 'pages', 'privacy.html'), '<h1>Privacy policy</h1><p id="delete-your-data">Email me to delete your data.</p>');
  child = spawn(process.execPath, [join(ROOT, 'inbox', 'server.mjs')], {
    env: { ...process.env, PORT: String(INBOX_PORT), DATA_DIR: join(tmp, 'data'), CONFIG_DIR: cfgDir, INBOX_API_SECRET: SECRET, INBOX_SETUP_CODE: 'code', INBOX_SECURE_COOKIE: 'false', RUN_SECRET: '', N8N_HOST: 'bloom.duckdns.org', EMAIL_LIST: '', MAILERLITE_API_KEY: '', ...extraEnv },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(`http://localhost:${INBOX_PORT}/inbox/health`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('inbox did not start');
}
const I = `http://localhost:${INBOX_PORT}`;
const api = async (path, opts = {}) => {
  const res = await fetch(`${I}/inbox/api${path}`, { ...opts, headers: { 'x-inbox-secret': SECRET, 'Content-Type': 'application/json' }, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const text = await res.text();
  try {
    return { status: res.status, ...JSON.parse(text) };
  } catch {
    return { status: res.status, text, headers: res.headers };
  }
};
const kw = (list) => ({ keyword: 'FREE', freebie: 'Free guide', url: 'https://example.com/free.pdf', live: true, dmApproved: true, delivery: 'email', where: { igComments: true, igDms: true }, linkText: 'Grab it: {link}', list });
// A keyword with one question (needs "ask first"), as the dashboard saves it.
const kwQ = (list) => ({ ...kw(list), ask: { on: true, text: 'Want it? Reply READY.', word: 'READY' }, questions: [{ text: 'What do you sew most?', field: 'sews', answers: [{ label: 'Quilts' }, { label: 'Bags' }] }] });
// A person gets a personal link (as n8n would make it), answers (optional), opens it and signs up.
async function signUp(email, answer) {
  const flow = await api('/flows', { method: 'POST', body: { keyword: 'FREE', platform: 'Instagram', personId: `p-${email}`, author: email.split('@')[0] } });
  if (answer) await api(`/flows/${flow.token}`, { method: 'PATCH', body: { answer: { q: 'What do you sew most?', a: answer } } });
  await fetch(`${I}/inbox/f/${flow.token}`, { headers: { 'User-Agent': 'Mozilla/5.0 (iPhone)' } });
  const res = await fetch(`${I}/inbox/f/${flow.token}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `email=${encodeURIComponent(email)}&consent=yes` });
  return { status: res.status, html: await res.text(), flow };
}

// 1. Built-in list: no tool, no key
await startInbox({}, [kw({})]);
let info = await api('/lists');
check('No key set: the built-in list is used and needs no list picked', info.id === 'builtin' && info.connected && !info.needsTarget, JSON.stringify(info));
let r = await signUp('ana@example.com');
check('Built-in: signup shows the freebie right away', r.status === 200 && r.html.includes('https://example.com/free.pdf'), r.html.slice(0, 300));
check('Signup page uses the profile: brand, consent wording, colors, fonts, no Scrolly', r.html.includes('BLOOM STUDIO') && r.html.includes('#aa3366') && r.html.includes('Fraunces') && !/scrolly/i.test(r.html));
const form = await (await fetch(`${I}/inbox/f/${(await api('/flows', { method: 'POST', body: { keyword: 'FREE', personId: 'p-new', author: 'newbie' } })).token}`)).text();
check('Signup form shows their consent line and privacy link', form.includes('Add me to Bloom Studio emails.') && form.includes('href="/privacy"') && form.includes('Bloom Studio</title>'));
await signUp('bo@example.com');
await signUp('ana@example.com');
let subs = await api('/subscribers');
check('Built-in list keeps each email once per keyword', subs.subscribers?.length === 2 && subs.subscribers.every((s) => s.status === 'kept'), JSON.stringify(subs.subscribers));
const csv = await fetch(`${I}/inbox/api/subscribers.csv`, { headers: { 'x-inbox-secret': SECRET } });
const csvBytes = Buffer.from(await csv.arrayBuffer());
const csvText = csvBytes.toString("utf8");
check('CSV download: header, one line per signup, attachment name, opens in Excel (BOM)', csv.headers.get('content-disposition')?.includes('email-list-') && csvBytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])) && csvText.split('\r\n').filter(Boolean).length === 3 && csvText.includes('email,keyword,freebie') && csvText.includes('ana@example.com,FREE,Free guide'), csvText);
const del = await api(`/subscribers/${subs.subscribers[0].id}`, { method: 'DELETE' });
check('Deleting a subscriber (deletion request) removes them', del.deleted === 1 && (await api('/subscribers')).subscribers.length === 1);
const anon = await fetch(`${I}/inbox/api/subscribers.csv`);
check('The list needs the login (no secret, no cookie: refused)', anon.status === 401);

// 2. Public pages
const priv = await fetch(`${I}/privacy/`);
const privHtml = await priv.text();
check('Privacy page served in their look, with the deletion anchor', priv.status === 200 && privHtml.includes('id="delete-your-data"') && privHtml.includes('BLOOM STUDIO') && privHtml.includes('<title>Privacy policy · Bloom Studio</title>'));
const home = await fetch(`${I}/`);
check('Home page works with no file (their brand and handle)', home.status === 200 && (await home.text()).includes('@bloomstudio'));
check('Terms page is 404 until it exists', (await fetch(`${I}/terms`)).status === 404);
const me = await api('/me');
check('Dashboard gets the profile, public address and list info (no keys)', me.profile?.brand === 'Bloom Studio' && me.publicHost === 'bloom.duckdns.org' && me.list?.id === 'builtin' && !JSON.stringify(me).includes('KEY'));

// 3. Each email tool: list its targets, add a signup into the keyword's target
const tools = [
  { id: 'mailerlite', env: { EMAIL_LIST: 'mailerlite', MAILERLITE_API_KEY: 'ml-key', MAILERLITE_BASE: `${M}/ml` }, target: '111', created: '222',
    sent: (l) => l.some((x) => x.path === '/ml/subscribers' && x.body.email === 'cy@example.com' && x.body.groups?.[0] === '111' && x.headers.authorization === 'Bearer ml-key'),
    answered: (l) => l.some((x) => x.method === 'POST' && x.path === '/ml/fields' && x.body.name === 'sews' && x.body.type === 'text') && l.some((x) => x.path === '/ml/subscribers' && x.body.fields?.sews === 'Quilts') },
  { id: 'kit', env: { EMAIL_LIST: 'kit', KIT_API_KEY: 'kit-key', KIT_BASE: `${M}/kit` }, target: '41', created: '42',
    sent: (l) => l.some((x) => x.path === '/kit/v4/subscribers' && x.body.email_address === 'cy@example.com' && x.headers['x-kit-api-key'] === 'kit-key') && l.some((x) => x.path === '/kit/v4/tags/41/subscribers' && x.body.email_address === 'cy@example.com'),
    answered: (l) => l.some((x) => x.method === 'POST' && x.path === '/kit/v4/tags' && x.body.name === 'sews: Quilts') && l.some((x) => x.path === '/kit/v4/tags/43/subscribers' && x.body.email_address === 'cy@example.com') },
  { id: 'mailchimp', env: { EMAIL_LIST: 'mailchimp', MAILCHIMP_API_KEY: 'abc123-us21', MAILCHIMP_BASE: `${M}/mc` }, target: 'aud1',
    sent: (l) => {
      const hash = createHash('md5').update('cy@example.com').digest('hex');
      return l.some((x) => x.method === 'PUT' && x.path === `/mc/lists/aud1/members/${hash}` && x.body.status_if_new === 'subscribed' && x.headers.authorization === `Basic ${Buffer.from('chatmanager:abc123-us21').toString('base64')}`) && l.some((x) => x.path === `/mc/lists/aud1/members/${hash}/tags` && x.body.tags?.[0]?.name === 'freebie-FREE');
    },
    answered: (l) => l.some((x) => /\/mc\/lists\/aud1\/members\/[a-f0-9]{32}\/tags$/.test(x.path) && x.body.tags?.some((t) => t.name === 'sews: Quilts' && t.status === 'active')) },
  { id: 'beehiiv', env: { EMAIL_LIST: 'beehiiv', BEEHIIV_API_KEY: 'bh-key', BEEHIIV_BASE: `${M}/bh` }, target: 'pub_1',
    sent: (l) => l.some((x) => x.path === '/bh/v2/publications/pub_1/subscriptions' && x.body.email === 'cy@example.com' && x.body.utm_campaign === 'FREE' && x.headers.authorization === 'Bearer bh-key'),
    answered: (l) => l.some((x) => x.method === 'POST' && x.path === '/bh/v2/publications/pub_1/custom_fields' && x.body.display === 'sews' && x.body.kind === 'string') && l.some((x) => x.path === '/bh/v2/publications/pub_1/subscriptions' && x.body.custom_fields?.[0]?.name === 'sews' && x.body.custom_fields[0].value === 'Quilts') },
  { id: 'flodesk', env: { EMAIL_LIST: 'flodesk', FLODESK_API_KEY: 'fd-key', FLODESK_BASE: `${M}/fd` }, target: 'seg1', created: 'seg2',
    sent: (l) => l.some((x) => x.path === '/fd/v1/subscribers' && x.body.email === 'cy@example.com' && x.body.segment_ids?.[0] === 'seg1' && x.headers.authorization === `Basic ${Buffer.from('fd-key:').toString('base64')}`),
    answered: (l) => l.some((x) => x.method === 'POST' && x.path === '/fd/v1/custom-fields' && x.body.label === 'sews') && l.some((x) => x.path === '/fd/v1/subscribers' && x.body.custom_fields?.sews === 'Quilts' && x.body.segment_ids?.[0] === 'seg1') },
];
for (const t of tools) {
  await startInbox(t.env, [kw({ id: t.target, name: 'x' })]);
  log = [];
  info = await api('/lists');
  const targets = await api('/lists/targets');
  check(`${t.id}: connected and lists its ${info.label}s`, info.id === t.id && info.connected && targets.connected && targets.targets?.[0]?.id === t.target, JSON.stringify({ info, targets }));
  if (t.created) {
    const made = await api('/lists/targets', { method: 'POST', body: { name: 'Freebie: NEW' } });
    check(`${t.id}: "+ New ${info.label}" makes one`, made.id === t.created && made.name === 'Freebie: NEW', JSON.stringify(made));
  } else {
    const made = await api('/lists/targets', { method: 'POST', body: { name: 'x' } });
    check(`${t.id}: no "+ New" (made in the tool itself), says so`, made.status === 400 && made.error.includes(info.label));
  }
  r = await signUp('cy@example.com');
  subs = await api('/subscribers');
  check(`${t.id}: signup reaches the tool in the keyword's ${info.label}`, r.status === 200 && t.sent(log) && subs.subscribers[0]?.status === 'sent' && subs.subscribers[0]?.provider === t.id, JSON.stringify(log.map((x) => [x.method, x.path, x.body])));
  // The same keyword with a question: their answer goes along (a field, or a "sews: Quilts" tag).
  await startInbox(t.env, [kwQ({ id: t.target, name: 'x' })]);
  log = [];
  r = await signUp('cy@example.com', 'Quilts');
  subs = await api('/subscribers');
  check(`${t.id}: their answer reaches the tool (${['kit', 'mailchimp'].includes(t.id) ? 'tag "sews: Quilts"' : 'field "sews"'})`, r.status === 200 && t.answered(log) && subs.subscribers[0]?.status === 'sent' && !subs.subscribers[0]?.answersError, JSON.stringify({ log: log.map((x) => [x.method, x.path, x.body]), sub: subs.subscribers[0] }));
}
// Saving an email keyword without a target is refused when the tool needs one.
const noTarget = await api('/keywords', { method: 'PUT', body: { keywords: [kw({})] } });
check('A keyword can\'t go live without its list picked (Flodesk segment)', noTarget.status === 400 && noTarget.error.includes('segment'), JSON.stringify(noTarget));
// The tool won't make the field: the email still goes in (with its group), the answer stays here, health says so.
await startInbox({ EMAIL_LIST: 'mailerlite', MAILERLITE_API_KEY: 'ml-key', MAILERLITE_BASE: `${M}/ml` }, [kwQ({ id: '111', name: 'x' })]);
log = [];
failFields = 1;
r = await signUp('flo@example.com', 'Bags');
subs = await api('/subscribers');
const flo = subs.subscribers.find((s) => s.email === 'flo@example.com');
check('Field refused: the signup still reaches the tool, the answer is kept here with the reason', r.status === 200 && flo?.status === 'sent' && flo.answers?.[0]?.a === 'Bags' && /422/.test(flo.answersError || '') && log.some((x) => x.path === '/ml/subscribers' && x.body.groups?.[0] === '111' && !x.body.fields), JSON.stringify(flo));
const hl = await api('/health?fresh=1');
check('Connections check says some answers didn\'t reach the tool', hl.checks?.find((c) => c.id === 'email')?.state === 'warn' && /answers didn't/.test(hl.checks.find((c) => c.id === 'email').text), JSON.stringify(hl.checks?.find((c) => c.id === 'email')));
const named = await api('/keywords', { method: 'PUT', body: { keywords: [{ ...kwQ({ id: '111', name: 'x' }), questions: [{ text: 'What do you sew most?', answers: [{ label: 'Quilts' }, { label: 'Bags' }] }] }] } });
check('A question with no name gets one from its words ("sew_most")', named.keywords?.[0]?.questions?.[0]?.field === 'sew_most', JSON.stringify(named.keywords?.[0]?.questions));
// Keywords saved before the kit (mailerliteGroup) keep working.
await startInbox({ MAILERLITE_API_KEY: 'ml-key', MAILERLITE_BASE: `${M}/ml` }, [{ ...kw(undefined), mailerliteGroup: '111', mailerliteGroupName: 'Freebie: FREE' }]);
log = [];
info = await api('/lists');
r = await signUp('dee@example.com');
check('Old setup: a MailerLite key alone means MailerLite, old mailerliteGroup still used', info.id === 'mailerlite' && log.some((x) => x.path === '/ml/subscribers' && x.body.groups?.[0] === '111'), JSON.stringify(log.map((x) => x.path)));
const saved = await api('/keywords', { method: 'PUT', body: { keywords: (await api('/keywords')).keywords } });
check('Saving converts mailerliteGroup to the general list field', saved.keywords?.[0]?.list?.id === '111' && saved.keywords[0].mailerliteGroup === undefined, JSON.stringify(saved));
const detail = await api('/lists/targets/111');
check('MailerLite keeps its group panel (size, sequences)', detail.group?.active === 3 && Array.isArray(detail.automations), JSON.stringify(detail));

// 4. The tool is down: the person still gets the freebie; the signup waits and is retried
failNext = 1;
r = await signUp('eve@example.com');
subs = await api('/subscribers');
const eve = subs.subscribers.find((s) => s.email === 'eve@example.com');
check('Tool down: the person still sees the freebie, signup waits with the reason', r.status === 200 && r.html.includes('free.pdf') && eve?.status === 'waiting' && eve.error.includes('503'), JSON.stringify(eve));
check('Dashboard counts signups that didn\'t go through', (await api('/me')).waitingSignups === 1);
const retry = await api('/subscribers/retry', { method: 'POST' });
check('"Try again now" sends it once the tool is back', retry.waiting === 0 && (await api('/subscribers')).subscribers.find((s) => s.email === 'eve@example.com').status === 'sent');

// 5. Webhook (Zapier, Make, n8n): one signed POST per signup, plus a test button
await startInbox({ EMAIL_LIST: 'webhook', LIST_WEBHOOK_URL: `${M}/hook`, LIST_WEBHOOK_SECRET: 'hook-secret' }, [kw({})]);
log = [];
r = await signUp('fay@example.com');
const hook = log.find((x) => x.path === '/hook');
const sig = `sha256=${createHmac('sha256', 'hook-secret').update(hook?.raw || '').digest('hex')}`;
check('Webhook: signup posted with email, keyword, freebie, consent, date, signature', hook?.body.email === 'fay@example.com' && hook.body.keyword === 'FREE' && hook.body.freebie === 'Free guide' && hook.body.consent.includes('Bloom') && hook.body.signedUpAt && hook.headers['x-signature'] === sig, JSON.stringify(hook));
const tested = await api('/lists/test', { method: 'POST', body: { email: 'me@example.com' } });
check('"Send a test signup" posts a test and isn\'t kept in the list', tested.ok && log.filter((x) => x.path === '/hook').at(-1)?.body.test === true && (await api('/subscribers')).subscribers.length === 1);

child.kill();
mock.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
