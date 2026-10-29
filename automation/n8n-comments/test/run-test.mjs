// End-to-end test of the Scrolly comments workflow against test/mock-apis.mjs and the
// real comment inbox (test/run-inbox.sh). Needs: the mock (node test/mock-apis.mjs),
// the test inbox (bash test/run-inbox.sh) and the test n8n container
// (bash test/fresh-container.sh). Prints PASS/FAIL per check, exits 1 on any FAIL.
import { createHmac } from 'node:crypto';

const N8N = process.env.N8N_URL || 'http://localhost:5688';
const MOCK = process.env.MOCK_URL || 'http://localhost:5690';
const INBOX = process.env.INBOX_URL || 'http://localhost:5691';
const SECRET = 'test-app-secret';
const RUN = { 'x-run-secret': 'test-run-secret', 'Content-Type': 'application/json' };
const INBOX_KEY = { 'x-inbox-secret': 'test-inbox-secret', 'Content-Type': 'application/json' };
const IG_ID = '17840000000000001';
// MODE=rules (default: free word rules, drafts come later from the Claude subscription)
// or MODE=api (container started with CLAUDE_API_DRAFTS=true: sorted + drafted by the Claude API)
const API = process.env.MODE === 'api';
console.log(`mode: ${API ? 'Claude API drafts' : 'free rules, Needs draft'}`);
let failed = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !extra ? '' : `  -> ${extra}`}`);
  if (!ok) failed++;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mockLog = async () => (await fetch(`${MOCK}/log`)).json();
const inbox = async (path, opts = {}) => (await fetch(`${INBOX}/inbox/api${path}`, { headers: INBOX_KEY, ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined })).json();
const rows = async () => (await inbox('/rows')).rows || [];
const row = async (id) => (await rows()).find((r) => r.id === id);
const byComment = async (commentId) => (await rows()).find((r) => r.commentId === commentId);
async function waitFor(fn, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const v = await fn();
    if (v) return v;
    await sleep(1000);
  }
  return null;
}
// A freebie link in a DM goes through the inbox's click counter.
const GO = /http:\/\/localhost:5691\/inbox\/go\/[A-Za-z0-9_-]{8,20}/;
const goLink = (text, before) => (String(text || '').startsWith(before) && GO.test(String(text).slice(before.length)) ? String(text).match(GO)[0] : '');
const sentDms = (log) => log.log.filter((x) => x.path.startsWith('/graph/') && x.path.endsWith('/messages'));

function igEvent(comments) {
  return JSON.stringify({
    object: 'instagram',
    entry: [{ id: IG_ID, time: Math.floor(Date.now() / 1000), changes: comments.map((c) => ({ field: 'comments', value: c })) }],
  });
}
function dmEvent(messages) {
  return JSON.stringify({ object: 'instagram', entry: [{ id: IG_ID, time: Date.now(), messaging: messages }] });
}
async function postIg(body, secret = SECRET) {
  const sig = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
  return fetch(`${N8N}/webhook/instagram`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Hub-Signature-256': sig }, body });
}
const runJob = (job) => fetch(`${N8N}/webhook/comments-run`, { method: 'POST', headers: RUN, body: JSON.stringify({ job }) });

await fetch(`${MOCK}/reset`, { method: 'POST' });
// The test keyword list lives in test/config (n8n reads it); the dashboard's keyword
// editor is tested against the inbox's own temp config folder in section 12.

// 1. Meta's webhook check
let r = await fetch(`${N8N}/webhook/instagram?hub.mode=subscribe&hub.verify_token=test-verify&hub.challenge=4242`);
check('Meta check answers the challenge', r.status === 200 && (await r.text()) === '4242');
r = await fetch(`${N8N}/webhook/instagram?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=4242`);
check('Meta check refuses a wrong token', r.status === 403, String(r.status));

// 2. Forged event (wrong signature) does nothing
await postIg(igEvent([{ id: 'forged1', text: 'PINS', from: { id: '999', username: 'eve' }, media: { id: 'media1' } }]), 'not-the-secret');
await sleep(6000);
let log = await mockLog();
check('Forged event sends no DM', sentDms(log).length === 0);

// 3. Real-looking event: keyword-only, keyword + question (é and emoji test the raw-body signature), praise, her own comment
const event = igEvent([
  { id: 'c1', text: 'PINS', from: { id: '111', username: 'ana' }, media: { id: 'media1', media_product_type: 'REELS' } },
  { id: 'c2', text: 'pins please! does this work for Etsy café shops? 🙏', from: { id: '222', username: 'bea' }, media: { id: 'media1' } },
  { id: 'c3', text: 'love this', from: { id: '333', username: 'cy' }, media: { id: 'media1' } },
  { id: 'c4', text: 'PINS', from: { id: IG_ID, username: 'scrollysocial' }, media: { id: 'media1' } },
]);
r = await postIg(event);
check('Instagram event accepted', r.status === 200, String(r.status));
await waitFor(async () => (await rows()).length >= 3);
log = await mockLog();
const dms = sentDms(log);
check('Two keyword DMs sent (c1, c2), none to her own comment', dms.length === 2 && dms.every((d) => ['c1', 'c2'].includes(d.body.recipient.comment_id)), JSON.stringify(dms.map((d) => d.body)));
check('DM text has the freebie link (through the click counter)', !!goLink(dms[0]?.body.message.text, 'Here you go: '), dms[0]?.body.message.text);
check('DM uses the Instagram token', dms[0]?.auth === 'Bearer test-ig-token', dms[0]?.auth);
let all = await rows();
const ig = all.filter((x) => x.platform === 'Instagram');
check('Inbox: c2 and c3 to answer, keyword-only c1 kept as Handled, own c4 skipped', ig.length === 3 && (await byComment('c1'))?.status === 'Handled' && !(await byComment('c4')), ig.map((x) => `${x.commentId}:${x.status}`).join());
const c2 = await byComment('c2');
check('c2 flagged as a question with priority', c2?.type === 'Question' && c2?.priority === true);
if (API) {
  check('API mode: draft written, no em dash, ready for review', c2?.status === 'New' && !!c2.draft && !c2.draft.includes('—'), c2?.draft);
} else {
  check('Free mode: no draft yet, status Needs draft', c2?.status === 'Needs draft' && !c2.draft, c2?.status);
  const c3 = await byComment('c3');
  check('Free mode: "love this" sorted as praise, no priority', c3?.type === 'Praise' && c3?.priority === false);
}
check('Instagram row has the post link and the commenter', c2?.link === 'https://www.instagram.com/p/TESTPOST/' && c2?.author === 'bea');
check('Note says the DM was sent', (c2?.note || '').includes('Keyword PINS: sent'), c2?.note);

// 4. Same event again: no second DM, no duplicate rows
await postIg(event);
await sleep(8000);
log = await mockLog();
check('Repeat event: no extra DMs', sentDms(log).length === 2);
check('Repeat event: no duplicate rows', (await rows()).length === 3, String((await rows()).length));

// 5. YouTube + TikTok polls
await runJob('youtube');
await runJob('tiktok');
await waitFor(async () => (await rows()).length >= 5);
log = await mockLog();
all = await rows();
const yt = all.filter((x) => x.platform === 'YouTube');
const tt = all.filter((x) => x.platform === 'TikTok');
check('YouTube: 1 new comment logged (own + 8-day-old skipped)', yt.length === 1, String(yt.length));
check('YouTube row keeps thread id + link', yt[0]?.threadId === 'ytThread1' && (yt[0]?.link || '').includes('lc=ytThread1'));
check(`TikTok: 1 logged (spam + own skipped), lead, ${API ? 'Reply by hand' : 'Needs draft'}`, tt.length === 1 && tt[0].status === (API ? 'Reply by hand' : 'Needs draft') && tt[0].type === 'Lead', JSON.stringify(tt.map((x) => [x.status, x.type])));
const apify = log.log.find((x) => x.path.includes('apify'));
check('Apify run is capped and asks for 3 newest videos', apify?.query.maxTotalChargeUsd === '0.10' && apify?.body.resultsPerPage === 3 && apify?.body.profiles[0] === 'scrollysocial');
await runJob('youtube');
await sleep(8000);
check('YouTube re-poll adds no duplicates', (await rows()).length === 5);

const claudeCalls = log.log.filter((x) => x.path.startsWith('/anthropic')).length;
check(API ? 'API mode: Claude API was called' : 'Free mode: no Claude API calls at all', API ? claudeCalls > 0 : claudeCalls === 0, String(claudeCalls));

// 6. Approve everything waiting (empty drafts filled first, as the subscription skill would), post replies
for (const x of await rows()) {
  if (x.status === 'Handled') continue;
  await inbox(`/rows/${x.id}`, { method: 'PATCH', body: { draft: x.draft || 'Thank you, so glad it helped!', status: 'Approved' } });
}
await runJob('replies');
await waitFor(async () => (await rows()).every((x) => x.status !== 'Approved'));
log = await mockLog();
all = await rows();
const igReplies = log.log.filter((x) => x.path.endsWith('/replies'));
const ytReplies = log.log.filter((x) => x.path === '/yt/comments');
check('Instagram replies posted to c2 and c3', igReplies.map((x) => x.path.split('/')[2]).sort().join() === 'c2,c3', igReplies.map((x) => x.path).join());
check('Instagram reply sends the draft text', !!igReplies[0]?.query.message);
check('YouTube reply posted under the thread with an OAuth token', ytReplies.length === 1 && ytReplies[0].body.snippet.parentId === 'ytThread1' && ytReplies[0].auth === 'Bearer yt-access');
check('Statuses: 3 Posted, TikTok Reply by hand', all.filter((x) => x.status === 'Posted').length === 3 && all.find((x) => x.platform === 'TikTok')?.status === 'Reply by hand', all.map((x) => x.status).join());

// 7. Token refresh, then the next DM uses the new token
await runJob('token');
await sleep(6000);
await postIg(igEvent([{ id: 'c9', text: 'PINS', from: { id: '444', username: 'dee' }, media: { id: 'media1' } }]));
await sleep(8000);
log = await mockLog();
check('After refresh, DMs use the new token', sentDms(log).pop()?.auth === 'Bearer refreshed-token');

// 8. Status webhook
r = await fetch(`${N8N}/webhook/comments-status`, { headers: RUN });
const status = await r.json().catch(() => ({}));
check('Status webhook answers', r.status === 200 && status.testMode === false && status.dmsSent === 3, JSON.stringify(status).slice(0, 400));
check('Status shows only the forged-signature error', (status.errors || []).every((e) => e.where === 'instagram-signature'), JSON.stringify(status.errors));
r = await fetch(`${N8N}/webhook/comments-status`);
check('Status refuses without the secret', JSON.stringify(await r.json().catch(() => ({}))).includes('forbidden'));

// 9. Finishing replies safely (the failed row update below is logged as an error on purpose)
const seed = async (fields) => inbox('/rows', { method: 'POST', body: { platform: 'Instagram', text: 'seeded comment', draft: 'Thank you!', ...fields } });
const repliesTo = async (commentId) => (await mockLog()).log.filter((x) => x.path === `/graph/${commentId}/replies`).length;

const approved = await seed({ status: 'Approved', commentId: 'c20' });
await inbox('/test/fail-next-patch', { method: 'POST', body: {} });
await runJob('replies');
await waitFor(async () => (await repliesTo('c20')) > 0);
await sleep(3000);
check('Row update fails after posting: row still Approved', (await row(approved.id))?.status === 'Approved');
await runJob('replies');
await waitFor(async () => (await row(approved.id))?.status === 'Posted');
check('Next run marks it Posted without posting it again', (await row(approved.id))?.status === 'Posted' && (await repliesTo('c20')) === 1, String(await repliesTo('c20')));

const testModeRow = await seed({ status: 'Not sent (test mode)', commentId: 'c21' });
await runJob('replies');
await waitFor(async () => (await row(testModeRow.id))?.status === 'New');
const tm = await row(testModeRow.id);
check('Test-mode row goes back to New for a fresh OK, nothing posted', tm?.status === 'New' && (await repliesTo('c21')) === 0 && (tm.note || '').includes('Approve again'), tm?.status);

// 10. YouTube cleanup: only YouTube rows older than YOUTUBE_KEEP_DAYS (21) are deleted
const daysAgo = (d) => new Date(Date.now() - d * 86400e3).toISOString();
const oldYt = await seed({ platform: 'YouTube', commentId: 'yt-old', status: 'Posted', receivedAt: daysAgo(25) });
const newYt = await seed({ platform: 'YouTube', commentId: 'yt-new', status: 'Posted', receivedAt: daysAgo(2) });
const oldIg = await seed({ platform: 'Instagram', commentId: 'ig-old', status: 'Posted', receivedAt: daysAgo(40) });
await runJob('cleanup');
await waitFor(async () => !(await row(oldYt.id)));
check('Cleanup deletes YouTube rows older than 21 days', !(await row(oldYt.id)));
check('Cleanup keeps newer YouTube rows', !!(await row(newYt.id)));
check('Cleanup leaves Instagram rows alone, however old', !!(await row(oldIg.id)));
r = await fetch(`${N8N}/webhook/comments-status`, { headers: RUN });
const afterCleanup = await r.json().catch(() => ({}));
check('Status shows the cleanup run', afterCleanup.lastRuns?.cleanup?.rowsRemoved === 1, JSON.stringify(afterCleanup.lastRuns?.cleanup));

// 11. DMs (DMS_ENABLED=true in test/env.test)
const dmsBefore = sentDms(await mockLog()).length;
await postIg(dmEvent([{ sender: { id: '555' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm1', text: 'pins' } }]));
await waitFor(async () => !!(await byComment('dm1')));
log = await mockLog();
const dmReply = sentDms(log).slice(dmsBefore);
const dm1 = await byComment('dm1');
check('Keyword DM gets the freebie back by DM (to the sender, not a comment)', dmReply.length === 1 && dmReply[0].body.recipient.id === '555' && !!goLink(dmReply[0].body.message.text, 'Here you go: '), JSON.stringify(dmReply.map((d) => d.body)));
check('Keyword DM row: kind dm, Handled, username looked up', dm1?.kind === 'dm' && dm1?.status === 'Handled' && dm1?.author === 'user555', JSON.stringify(dm1));
// Instagram echoes the freebie DM back: it must not show twice.
await postIg(dmEvent([{ sender: { id: IG_ID }, recipient: { id: '555' }, timestamp: Date.now(), message: { mid: dmReply[0] ? `mid-sent-${dmsBefore + 1}` : 'x', text: 'Here you go', is_echo: true } }]));
await postIg(dmEvent([{ sender: { id: '555' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm2', text: 'what should I post first?', reply_to: { story: { id: 's1' } } } }]));
await postIg(dmEvent([{ sender: { id: IG_ID }, recipient: { id: '555' }, timestamp: Date.now(), message: { mid: 'manual1', text: 'hi! typed in the app', is_echo: true } }]));
await waitFor(async () => !!(await byComment('dm2')) && !!(await byComment('manual1')));
const dm2 = await byComment('dm2');
check('Question DM lands as Needs draft, flagged, marked as a Story reply', dm2?.kind === 'dm' && dm2?.status === (API ? 'New' : 'Needs draft') && dm2?.type === 'Question' && (dm2?.note || '').startsWith('Story reply'), JSON.stringify(dm2));
check('Echo of the automatic DM is not stored twice; a DM typed in the app is kept', !(await rows()).some((x) => x.kind === 'out' && x.commentId === `mid-sent-${dmsBefore + 1}`) && (await byComment('manual1'))?.kind === 'out');
await inbox(`/rows/${dm2.id}`, { method: 'PATCH', body: { draft: 'Start with one post a day for a week!', status: 'Approved' } });
await runJob('replies');
await waitFor(async () => (await row(dm2.id))?.status === 'Posted');
log = await mockLog();
const dmAnswer = sentDms(log).pop();
check('Approved DM reply goes out as a DM to the sender', (await row(dm2.id))?.status === 'Posted' && dmAnswer?.body.recipient.id === '555' && dmAnswer?.body.message.text === 'Start with one post a day for a week!', JSON.stringify(dmAnswer?.body));
const { conversations } = await inbox('/conversations');
const conv = conversations.find((x) => x.author === 'user555');
check('Conversation view groups everything from user555 in order', conv?.items.length === 3 && conv.items.map((x) => x.commentId).join() === 'dm1,dm2,manual1', JSON.stringify(conv?.items.map((x) => x.commentId)));

// 12. Dashboard login, cross-site protection, keyword editor, stats
const raw = (path, opts = {}) => fetch(`${INBOX}/inbox${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
check('Dashboard API refuses without login', (await raw('/api/rows')).status === 401);
check('Wrong setup code refused', (await raw('/setup', { method: 'POST', body: JSON.stringify({ code: 'nope', password: 'a-long-password' }) })).status === 403);
r = await raw('/setup', { method: 'POST', body: JSON.stringify({ code: 'test-setup-code', password: 'a-long-password' }) });
const cookie = (r.headers.get('set-cookie') || '').split(';')[0];
check('Setup code + password logs in', r.status === 200 && cookie.startsWith('sid='));
check('Setup can only happen once', (await raw('/setup', { method: 'POST', body: JSON.stringify({ code: 'test-setup-code', password: 'another-password' }) })).status === 409);
check('Wrong password refused', (await raw('/login', { method: 'POST', body: JSON.stringify({ password: 'wrong-password' }) })).status === 403);
check('Logged in: rows load', (await raw('/api/rows', { headers: { Cookie: cookie } })).status === 200);
check('Logged in but cross-site change refused', (await raw(`/api/rows/${dm2.id}`, { method: 'PATCH', headers: { Cookie: cookie, Origin: 'https://evil.example' }, body: JSON.stringify({ status: 'Skip' }) })).status === 403);
const kwPut = (keywords) => raw('/api/keywords', { method: 'PUT', headers: { Cookie: cookie, Origin: INBOX }, body: JSON.stringify({ keywords }) });
check('Keyword editor refuses a keyword with spaces', (await kwPut([{ keyword: 'two words', url: 'https://x.com', dm: 'hi', live: true, dmApproved: true }])).status === 400);
r = await kwPut([
  { keyword: 'math', url: 'https://scrollyseo.com/calculators/income-goal/', dm: 'Here you go: {url}', live: true, dmApproved: true },
  { keyword: 'SPOOKY', url: 'https://scrollyseo.com/x/', dm: 'Boo: {url}', live: true, dmApproved: false },
]);
const saved = await r.json();
check('Keyword editor saves, uppercases, keeps unapproved ones', r.status === 200 && saved.keywords.map((k) => k.keyword).join() === 'MATH,SPOOKY');
const stats = await (await raw('/api/stats?days=30', { headers: { Cookie: cookie } })).json();
const pinsStats = stats.keywords?.find((k) => k.keyword === 'PINS');
check('Stats count keyword comments and DMs sent per keyword and post', pinsStats?.comments >= 4 && pinsStats?.dmsSent === 4 && pinsStats?.posts['https://www.instagram.com/p/TESTPOST/'] >= 3, JSON.stringify(pinsStats));

// 13. Freebie flow: comment FREE → "reply READY" → READY → personal link → signup page → MailerLite → reminder
const freeKw = { keyword: 'FREE', freebie: 'Free guide', url: 'https://example.com/free.pdf', live: true, dmApproved: true, delivery: 'email', where: { igComments: true, igDms: true }, ask: { on: true, text: 'Want it? Reply READY.', word: 'READY' }, linkText: 'Grab it here: {link}', mailerliteGroup: '111', reminder: { on: true, minutes: 60, text: 'Still want it? {link}' }, afterSignup: { dm: 'Here it is: {url}' }, publicReply: { on: true, text: 'Sent you a DM!\nCheck your DMs!' }, followGate: { on: true, text: 'Follow me first, then reply READY again.' } };
const chooseKw = { keyword: 'CHOOSE', freebie: 'Choice guide', url: 'https://example.com/choose.pdf', dm: 'Here you go: {url}', live: true, dmApproved: true, delivery: 'email', where: { igComments: true, igDms: true }, ask: { on: true, text: 'Want it here or by email?', word: 'READY' }, linkText: 'Pop in your email: {link}', mailerliteGroup: '111', choice: { on: true, here: 'Send it here', email: 'By email' } };
const askKw = { keyword: 'ASKME', freebie: 'Ask guide', url: 'https://example.com/ask.pdf', dm: 'Here you go: {url}', live: true, dmApproved: true, delivery: 'email', where: { igComments: true, igDms: true }, ask: { on: true, text: 'Want it? Reply READY.', word: 'READY' }, linkText: 'Sign up here: {link}', mailerliteGroup: '111', questions: [{ text: 'What do you sell?', answers: [{ label: 'Clothes' }, { label: 'Food', url: 'https://example.com/food.pdf' }] }, { text: 'How big is your list?', answers: [{ label: 'Under 100' }, { label: 'Over 100' }] }] };
const ytKw = { keyword: 'YTK', freebie: 'YouTube guide', url: 'https://example.com/yt.pdf', live: true, dmApproved: true, delivery: 'email', where: { igComments: false, igDms: false, ytComments: true }, linkText: 'Grab it here: {link}', mailerliteGroup: '111', yt: { text: 'Grab it here: {link}' } };
r = await fetch(`${INBOX}/inbox/api/keywords`, { method: 'PUT', headers: INBOX_KEY, body: JSON.stringify({ keywords: [freeKw, ytKw, chooseKw, askKw] }) });
check('Flow keyword saved in the dashboard', r.status === 200, await r.text());
const dmCount = async () => sentDms(await mockLog()).length;
let before = await dmCount();
await postIg(igEvent([{ id: 'c30', text: 'FREE', from: { id: '666', username: 'fay' }, media: { id: 'media1' } }]));
await waitFor(async () => (await dmCount()) > before);
let last = sentDms(await mockLog()).pop();
check('Comment FREE: private reply asks them to reply READY', last?.body.recipient.comment_id === 'c30' && last?.body.message.text === 'Want it? Reply READY.', JSON.stringify(last?.body));
await waitFor(async () => (await mockLog()).log.some((x) => x.path === '/graph/c30/replies'));
const under = (await mockLog()).log.filter((x) => x.path === '/graph/c30/replies');
check('Comment FREE: one public reply under the comment, after the DM', under.length === 1 && under[0].query.message === 'Sent you a DM!', JSON.stringify(under.map((x) => x.query)));
let flows = (await inbox('/flows?personId=666')).flows || [];
check('Flow started at "asked"', flows.length === 1 && flows[0].step === 'asked', JSON.stringify(flows));
before = await dmCount();
await postIg(dmEvent([{ sender: { id: '666' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm30', text: 'ready!' } }]));
await waitFor(async () => (await dmCount()) > before);
last = sentDms(await mockLog()).pop();
const link = (last?.body.message.text || '').match(/http:\/\/localhost:5691\/inbox\/f\/[A-Za-z0-9_-]+/)?.[0];
check('READY in a DM: personal signup link sent by DM to them', last?.body.recipient.id === '666' && !!link, JSON.stringify(last?.body));
check('READY DM is Handled (no reply needed)', (await byComment('dm30'))?.status === 'Handled');

// 13b. Only for followers: 999 doesn't follow, replies READY → "follow me first"; follows, READY again → the link
before = await dmCount();
await postIg(igEvent([{ id: 'c50', text: 'FREE', from: { id: '999', username: 'hal' }, media: { id: 'media1' } }]));
await waitFor(async () => (await dmCount()) > before);
before = await dmCount();
await postIg(dmEvent([{ sender: { id: '999' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm50', text: 'READY' } }]));
await waitFor(async () => (await dmCount()) > before);
last = sentDms(await mockLog()).pop();
let hal = ((await inbox('/flows?personId=999')).flows || [])[0];
check('Not a follower yet: READY gets the "follow me first" DM, no link, flow still waiting', last?.body.recipient.id === '999' && last?.body.message.text === 'Follow me first, then reply READY again.' && hal?.step === 'asked' && !!hal?.followGatedAt, JSON.stringify({ msg: last?.body, hal }));
await fetch(`${MOCK}/test/follow/999`, { method: 'POST' });
before = await dmCount();
await postIg(dmEvent([{ sender: { id: '999' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm51', text: 'READY' } }]));
await waitFor(async () => (await dmCount()) > before);
last = sentDms(await mockLog()).pop();
hal = ((await inbox('/flows?personId=999')).flows || [])[0];
check('After following, READY again sends their signup link', last?.body.recipient.id === '999' && /\/inbox\/f\//.test(last?.body.message.text || '') && hal?.step === 'linkSent', JSON.stringify({ msg: last?.body, step: hal?.step }));
// 13c. Let them choose: buttons in the first DM, "Send it here" → the link by DM, "By email" → the signup link
await fetch(`${MOCK}/test/no-buttons-on-comments`, { method: 'POST' });
before = await dmCount();
await postIg(igEvent([{ id: 'c60', text: 'CHOOSE', from: { id: '444', username: 'ivy' }, media: { id: 'media1' } }]));
await waitFor(async () => (await dmCount()) >= before + 2);
let tries = sentDms(await mockLog()).filter((d) => d.body.recipient.comment_id === 'c60');
check('Comment CHOOSE: buttons tried first; refused on a comment reply, the same DM goes as text with the words', tries.length === 2 && tries[0].body.message.quick_replies?.map((q) => q.title).join() === 'Send it here,By email' && tries[1].body.message.text === 'Want it here or by email?\n\nReply HERE or EMAIL.' && !tries[1].body.message.quick_replies, JSON.stringify(tries.map((t) => t.body)));
before = await dmCount();
await postIg(dmEvent([{ sender: { id: '444' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm60', text: 'Send it here', quick_reply: { payload: 'CM_HERE:CHOOSE' } } }]));
await waitFor(async () => (await dmCount()) > before);
last = sentDms(await mockLog()).pop();
let ivy = ((await inbox('/flows?personId=444')).flows || [])[0];
const hereLink = goLink(last?.body.message.text, 'Here you go: ');
check('Tapped "Send it here": the freebie link by DM, flow done at "sent here"', last?.body.recipient.id === '444' && !!hereLink && ivy?.step === 'sentHere', JSON.stringify({ msg: last?.body, step: ivy?.step }));
let go = await fetch(hereLink, { redirect: 'manual', headers: { 'User-Agent': 'facebookexternalhit/1.1' } });
check('Instagram\'s link preview goes to the freebie but isn\'t counted as a click', go.status === 302 && go.headers.get('location') === 'https://example.com/choose.pdf' && !((await inbox('/flows?personId=444')).flows || [])[0]?.freebieClickedAt);
go = await fetch(hereLink, { redirect: 'manual' });
const ivyClicked = ((await inbox('/flows?personId=444')).flows || [])[0];
check('Opening the DM link: counted once, then on to the freebie', go.status === 302 && go.headers.get('location') === 'https://example.com/choose.pdf' && !!ivyClicked?.freebieClickedAt && ivyClicked.history.some((h) => h.step === 'freebieClicked'), JSON.stringify(ivyClicked?.history));
check('An unknown click link shows "expired"', (await fetch(`${INBOX}/inbox/go/notarealid123`, { redirect: 'manual' })).status === 404);
check('The button tap is Handled (no reply needed)', (await waitFor(async () => (await byComment('dm60'))?.status === 'Handled')) === true);
before = await dmCount();
await postIg(dmEvent([{ sender: { id: '445' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm61', text: 'choose' } }]));
await waitFor(async () => (await dmCount()) > before);
last = sentDms(await mockLog()).pop();
check('CHOOSE in a DM: the question with both buttons (a DM conversation takes buttons)', last?.body.recipient.id === '445' && last?.body.message.text === 'Want it here or by email?' && last?.body.message.quick_replies?.length === 2 && last.body.message.quick_replies[1].payload === 'CM_EMAIL:CHOOSE', JSON.stringify(last?.body));
before = await dmCount();
await postIg(dmEvent([{ sender: { id: '445' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm62', text: 'email please' } }]));
await waitFor(async () => (await dmCount()) > before);
last = sentDms(await mockLog()).pop();
check('Typed EMAIL instead of tapping: their signup link', last?.body.recipient.id === '445' && /^Pop in your email: http:\/\/localhost:5691\/inbox\/f\//.test(last?.body.message.text || '') && ((await inbox('/flows?personId=445')).flows || [])[0]?.step === 'linkSent', JSON.stringify(last?.body));
r = await fetch(`${INBOX}/inbox/api/keywords`, { method: 'PUT', headers: INBOX_KEY, body: JSON.stringify({ keywords: [freeKw, ytKw, { ...chooseKw, ask: { on: false } }] }) });
check('"Let them choose" without "ask first" is refused', r.status === 400);
r = await fetch(`${INBOX}/inbox/api/keywords`, { method: 'PUT', headers: INBOX_KEY, body: JSON.stringify({ keywords: [freeKw, ytKw, { ...chooseKw, dm: 'no link' }] }) });
check('"Let them choose" without {url} in the "Send it here" DM is refused', r.status === 400);
const chooseStats = (await inbox('/stats?days=30')).keywords.find((k) => k.keyword === 'CHOOSE');
check('Stats count both answers: 2 asked, 1 sent here, 1 got the signup link', chooseStats?.funnel?.asked === 2 && chooseStats.funnel.sentHere === 1 && chooseStats.funnel.linkSent === 1, JSON.stringify(chooseStats?.funnel));
check('Stats count the "Send it here" link: 1 sent, 1 opened', chooseStats?.links?.here?.sent === 1 && chooseStats.links.here.clicked === 1, JSON.stringify(chooseStats?.links));

// 13d. Questions: READY → two questions with buttons (answers saved) → the signup link; an answer picks the freebie
before = await dmCount();
await postIg(igEvent([{ id: 'c70', text: 'ASKME', from: { id: '321', username: 'quinn' }, media: { id: 'media1' } }]));
await waitFor(async () => (await dmCount()) > before);
before = await dmCount();
await postIg(dmEvent([{ sender: { id: '321' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm70', text: 'READY' } }]));
await waitFor(async () => (await dmCount()) > before);
last = sentDms(await mockLog()).pop();
check('READY with questions: the first question, its answers as buttons', last?.body.recipient.id === '321' && last?.body.message.text === 'What do you sell?' && last.body.message.quick_replies?.map((q) => `${q.title}=${q.payload}`).join() === 'Clothes=CM_Q:ASKME:0:0,Food=CM_Q:ASKME:0:1', JSON.stringify(last?.body));
before = await dmCount();
await postIg(dmEvent([{ sender: { id: '321' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm71', text: 'Food', quick_reply: { payload: 'CM_Q:ASKME:0:1' } } }]));
await waitFor(async () => (await dmCount()) > before);
last = sentDms(await mockLog()).pop();
let quinn = ((await inbox('/flows?personId=321')).flows || [])[0];
check('Tapped an answer: saved, and the next question goes out', last?.body.message.text === 'How big is your list?' && last.body.message.quick_replies?.length === 2 && quinn?.step === 'question' && quinn.qIndex === 1 && quinn.answers?.[0]?.a === 'Food' && quinn.freebieUrl === 'https://example.com/food.pdf', JSON.stringify({ msg: last?.body, quinn }));
check('The button tap is Handled', (await waitFor(async () => (await byComment('dm71'))?.status === 'Handled')) === true);
before = await dmCount();
await postIg(dmEvent([{ sender: { id: '321' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm72', text: '2' } }]));
await waitFor(async () => (await dmCount()) > before);
last = sentDms(await mockLog()).pop();
quinn = ((await inbox('/flows?personId=321')).flows || [])[0];
const quinnLink = (last?.body.message.text || '').match(/http:\/\/localhost:5691\/inbox\/f\/[A-Za-z0-9_-]+/)?.[0];
check('Typed "2" for the last question: saved, then their signup link', !!quinnLink && quinn?.step === 'linkSent' && quinn.answers?.map((x) => `${x.q}=${x.a}`).join() === 'What do you sell?=Food,How big is your list?=Over 100', JSON.stringify(quinn?.answers));
let qpage = await fetch(quinnLink, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'email=quinn%40example.com&consent=yes' });
check('Signup page opens the freebie their answer picked', (await qpage.text()).includes('href="https://example.com/food.pdf"'));
const quinnSub = (await inbox('/subscribers')).subscribers?.find((x) => x.email === 'quinn@example.com');
check('Their answers are kept with the signup', quinnSub?.answers?.length === 2, JSON.stringify(quinnSub));
const csv = await (await fetch(`${INBOX}/inbox/api/subscribers.csv`, { headers: INBOX_KEY })).text();
check('CSV has a column per question with their answers', /,What do you sell\?,How big is your list\?\r\n/.test(csv.split('\r\n')[0] + '\r\n') && csv.includes('quinn@example.com') && /quinn@example\.com.*,Food,Over 100\r\n/.test(csv), csv.split('\r\n').slice(0, 3).join(' | '));
const askStats = (await inbox('/stats?days=30')).keywords.find((k) => k.keyword === 'ASKME');
check('Stats count each answer', askStats?.answers?.['What do you sell?']?.Food === 1 && askStats.answers['How big is your list?']['Over 100'] === 1, JSON.stringify(askStats?.answers));
r = await fetch(`${INBOX}/inbox/api/keywords`, { method: 'PUT', headers: INBOX_KEY, body: JSON.stringify({ keywords: [freeKw, ytKw, chooseKw, { ...askKw, questions: [{ text: 'Only one answer?', answers: [{ label: 'Yes' }] }] }] }) });
check('A question with only one answer is refused', r.status === 400);
await fetch(link, { headers: { 'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' } });
check('Instagram\'s link-preview robot doesn\'t count as opening the link', ((await inbox('/flows?personId=666')).flows || [])[0]?.step === 'linkSent');
let page = await fetch(link);
let html = await page.text();
check('Signup page title reads as a signup (what the DM preview card shows)', /<title>Get your free guide · Scrolly<\/title>/.test(html) && html.includes('og:description'));
check('Signup page opens with an email form', page.status === 200 && html.includes('type="email"') && /free guide/i.test(html));
flows = (await inbox('/flows?personId=666')).flows || [];
check('Opening the link is recorded', flows[0]?.step === 'clicked', flows[0]?.step);
page = await fetch(link, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'email=not-an-email&consent=yes' });
check('Signup page refuses a bad email', page.status === 400);
page = await fetch(link, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'email=Fay%40Example.com&consent=yes' });
html = await page.text();
const ml = (await mockLog()).log.filter((x) => x.path === '/mailerlite/subscribers').pop();
check('Signup adds them to the keyword\'s MailerLite group and shows the freebie right away', page.status === 200 && html.includes('href="https://example.com/free.pdf"') && ml?.body.email === 'fay@example.com' && ml?.body.groups[0] === '111' && ml?.auth === 'Bearer test-ml', JSON.stringify(ml));
flows = (await inbox('/flows?personId=666')).flows || [];
check('Flow ends at "signed up" with the email', flows[0]?.step === 'signedUp' && flows[0]?.email === 'fay@example.com');
const delivered = await waitFor(async () => sentDms(await mockLog()).find((d) => d.body.recipient.id === '666' && !!goLink(d.body.message.text, 'Here it is: ')));
await sleep(3000);
check('After signup the freebie link also goes out by DM, once', !!delivered && !!((await inbox('/flows?personId=666')).flows || [])[0]?.deliveredAt && sentDms(await mockLog()).filter((d) => d.body.recipient.id === '666' && !!goLink(d.body.message.text, 'Here it is: ')).length === 1);
check('An unknown link shows "expired"', (await fetch(`${INBOX}/inbox/f/notarealtoken123`)).status === 404);
// Reminder: a second person gets the link but doesn't sign up.
before = await dmCount();
await postIg(igEvent([{ id: 'c31', text: 'free please', from: { id: '777', username: 'gus' }, media: { id: 'media1' } }]));
await waitFor(async () => (await dmCount()) > before);
before = await dmCount();
await postIg(dmEvent([{ sender: { id: '777' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm31', text: 'READY' } }]));
await waitFor(async () => (await dmCount()) > before);
flows = (await inbox('/flows?personId=777')).flows || [];
await inbox('/test/backdate', { method: 'POST', body: { token: flows[0]?.token, hours: 2 } });
before = await dmCount();
await runJob('reminders');
await waitFor(async () => (await dmCount()) > before);
last = sentDms(await mockLog()).pop();
check('No signup after the hours: one reminder DM with their link', last?.body.recipient.id === '777' && (last?.body.message.text || '').startsWith('Still want it? http://localhost:5691/inbox/f/'), JSON.stringify(last?.body));
before = await dmCount();
await runJob('reminders');
await sleep(6000);
check('Never reminded twice', (await dmCount()) === before);
const freeStats = (await inbox('/stats?days=30')).keywords.find((k) => k.keyword === 'FREE');
check('Stats show the funnel: 3 asked, 1 asked to follow first, 3 got the link, 1 opened, 1 signed up, 1 reminded', JSON.stringify(freeStats?.funnel) === JSON.stringify({ asked: 3, followGated: 1, question: 0, linkSent: 3, clicked: 1, signedUp: 1, reminded: 1, sentHere: 0, delivered: 1 }), JSON.stringify(freeStats?.funnel));
const fay = (await inbox('/conversations')).conversations.find((x) => x.author === 'fay');
check('Conversation shows the flow steps with the person', fay?.flows?.[0]?.history.map((s) => s.step).join() === 'asked,linkSent,clicked,signedUp', JSON.stringify(fay?.flows?.[0]?.history));
await inbox('/conversations/read', { method: 'POST', body: { key: fay.key } });
check('Opening a conversation marks it read', (await inbox('/conversations')).conversations.find((x) => x.key === fay.key)?.unread === 0);

// 14. YouTube keyword: automatic public reply with the keyword's shared signup page
await fetch(`${MOCK}/test/yt-keyword`, { method: 'POST' });
await runJob('youtube');
const ytReply = await waitFor(async () => (await mockLog()).log.filter((x) => x.path === '/yt/comments').find((x) => x.body.snippet.parentId === 'ytThread9'));
check('YouTube keyword: public reply under the comment with the shared signup link', ytReply?.body.snippet.textOriginal === 'Grab it here: http://localhost:5691/inbox/s/YTK' && ytReply?.auth === 'Bearer yt-access', JSON.stringify(ytReply?.body));
check('YouTube keyword comment is Handled (no reply needed from you)', (await byComment('ytThread9'))?.status === 'Handled');
page = await fetch(`${INBOX}/inbox/s/YTK`);
html = await page.text();
check('Shared signup page opens and posts to itself', page.status === 200 && html.includes('action="/inbox/s/YTK"') && html.includes('YouTube guide'));
page = await fetch(`${INBOX}/inbox/s/YTK`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'email=kai%40example.com&consent=yes' });
html = await page.text();
const ytFlow = ((await inbox('/flows')).flows || []).find((f) => f.keyword === 'YTK');
check('Shared signup adds the email to MailerLite and counts as a YouTube signup', page.status === 200 && html.includes('https://example.com/yt.pdf') && ytFlow?.step === 'signedUp' && ytFlow?.platform === 'YouTube', JSON.stringify(ytFlow));
check('Shared page for a keyword that is off or unknown shows "expired"', (await fetch(`${INBOX}/inbox/s/NOPE`)).status === 404);

// 15. Keyword page details: reminder minutes, the MailerLite panel, the new stats
const kw = (await inbox('/keywords')).keywords.find((k) => k.keyword === 'FREE');
check('Reminder is stored in minutes', kw?.reminder.minutes === 60 && kw?.reminder.hours === undefined, JSON.stringify(kw?.reminder));
r = await fetch(`${INBOX}/inbox/api/keywords`, { method: 'PUT', headers: INBOX_KEY, body: JSON.stringify({ keywords: [{ ...ytKw, yt: { text: 'no link here' } }] }) });
check('A YouTube reply without the link is refused', r.status === 400);
const panel = await inbox('/lists/targets/111');
check('MailerLite panel: group size and the sequence it starts, with links', panel.group?.active === 5 && panel.automations?.length === 1 && panel.automations[0].name === 'FREE delivery' && panel.automations[0].url === 'https://dashboard.mailerlite.com/automations/900', JSON.stringify(panel));
const st = await inbox('/stats?days=30');
check('Stats: contacts, new contacts, signups, conversion and 30 daily points', st.totals?.contacts > 0 && st.totals.newContacts > 0 && st.totals.signups === 3 && typeof st.totals.conversion === 'number' && st.series?.length === 30 && st.series.at(-1).signups === 3, JSON.stringify(st.totals));
check('Stats: the previous period, top posts and her reply time', st.previous?.signups === 0 && st.previous.keywordUses === 0 && Array.isArray(st.posts) && st.posts.every((p) => p.post && p.uses >= 0) && typeof st.replies?.answered === 'number' && typeof st.replies.waiting === 'number', JSON.stringify({ previous: st.previous, posts: st.posts, replies: st.replies }));
const hl = await inbox('/health?fresh=1');
check('Connections: n8n answers, each check has a state and a sentence, no keys shown', hl.checks?.find((c) => c.id === 'n8n')?.state !== 'bad' && hl.checks.every((c) => ['ok', 'warn', 'bad', 'off'].includes(c.state) && c.name && c.text) && !/(access_token|api_key)=[^…]/.test(JSON.stringify(hl)), JSON.stringify(hl));

// 16. Welcome DM: the first DM from someone new gets one automatic welcome, never twice
const { writeFileSync, rmSync } = await import('node:fs');
const settingsFile = new URL('./config/settings.json', import.meta.url);
writeFileSync(settingsFile, JSON.stringify({ welcome: { on: true, approved: true, text: 'Hi! Thanks for the message.' } }));
before = await dmCount();
await postIg(dmEvent([{ sender: { id: '888' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm40', text: 'hello there' } }]));
await waitFor(async () => !!(await byComment('dm40')));
last = sentDms(await mockLog()).pop();
const dm40 = await byComment('dm40');
check('First DM from someone new: one automatic welcome, their message still needs a reply', (await dmCount()) === before + 1 && last?.body.recipient.id === '888' && last?.body.message.text === 'Hi! Thanks for the message.' && dm40?.status === 'Needs draft' && (dm40?.note || '').includes('Welcome DM'), JSON.stringify(dm40));
before = await dmCount();
await postIg(dmEvent([{ sender: { id: '888' }, recipient: { id: IG_ID }, timestamp: Date.now(), message: { mid: 'dm41', text: 'are you there?' } }]));
await waitFor(async () => !!(await byComment('dm41')));
check('Second DM from the same person: no second welcome', (await dmCount()) === before);
rmSync(settingsFile);
r = await fetch(`${INBOX}/inbox/api/settings`, { method: 'PUT', headers: INBOX_KEY, body: JSON.stringify({ welcome: { on: true, approved: false, text: '' } }) });
check('Dashboard refuses to switch the welcome on without a message', r.status === 400);

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
