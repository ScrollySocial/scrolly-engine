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
check('DM text has the freebie link', dms[0]?.body.message.text === 'Here you go: https://example.com/pins.pdf');
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
check('Keyword DM gets the freebie back by DM (to the sender, not a comment)', dmReply.length === 1 && dmReply[0].body.recipient.id === '555' && dmReply[0].body.message.text === 'Here you go: https://example.com/pins.pdf', JSON.stringify(dmReply.map((d) => d.body)));
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

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
