// End-to-end test of the Scrolly comments workflow against test/mock-apis.mjs.
// Needs: the mock running (node test/mock-apis.mjs) and the test n8n container
// (see README.md "Local test"). Prints PASS/FAIL per check, exits 1 on any FAIL.
import { createHmac } from 'node:crypto';

const N8N = process.env.N8N_URL || 'http://localhost:5688';
const MOCK = process.env.MOCK_URL || 'http://localhost:5690';
const SECRET = 'test-app-secret';
const RUN = { 'x-run-secret': 'test-run-secret', 'Content-Type': 'application/json' };
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
async function waitFor(fn, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const v = await fn();
    if (v) return v;
    await sleep(1000);
  }
  return null;
}

function igEvent(comments) {
  return JSON.stringify({
    object: 'instagram',
    entry: [{ id: IG_ID, time: Math.floor(Date.now() / 1000), changes: comments.map((c) => ({ field: 'comments', value: c })) }],
  });
}
async function postIg(body, secret = SECRET) {
  const sig = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
  return fetch(`${N8N}/webhook/instagram`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Hub-Signature-256': sig }, body });
}
const runJob = (job) => fetch(`${N8N}/webhook/comments-run`, { method: 'POST', headers: RUN, body: JSON.stringify({ job }) });

await fetch(`${MOCK}/reset`, { method: 'POST' });

// 1. Meta's webhook check
let r = await fetch(`${N8N}/webhook/instagram?hub.mode=subscribe&hub.verify_token=test-verify&hub.challenge=4242`);
check('Meta check answers the challenge', r.status === 200 && (await r.text()) === '4242');
r = await fetch(`${N8N}/webhook/instagram?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=4242`);
check('Meta check refuses a wrong token', r.status === 403, String(r.status));

// 2. Forged event (wrong signature) does nothing
await postIg(igEvent([{ id: 'forged1', text: 'PINS', from: { id: '999', username: 'eve' }, media: { id: 'media1' } }]), 'not-the-secret');
await sleep(6000);
let log = await mockLog();
check('Forged event sends no DM', !log.log.some((x) => x.path.startsWith('/graph/') && x.path.endsWith('/messages')));

// 3. Real-looking event: keyword-only, keyword + question (é and emoji test the raw-body signature), praise, her own comment
const event = igEvent([
  { id: 'c1', text: 'PINS', from: { id: '111', username: 'ana' }, media: { id: 'media1', media_product_type: 'REELS' } },
  { id: 'c2', text: 'pins please! does this work for Etsy café shops? 🙏', from: { id: '222', username: 'bea' }, media: { id: 'media1' } },
  { id: 'c3', text: 'love this', from: { id: '333', username: 'cy' }, media: { id: 'media1' } },
  { id: 'c4', text: 'PINS', from: { id: IG_ID, username: 'scrollysocial' }, media: { id: 'media1' } },
]);
r = await postIg(event);
check('Instagram event accepted', r.status === 200, String(r.status));
log = await waitFor(async () => {
  const l = await mockLog();
  return l.pages.length >= 2 ? l : null;
});
log = log || (await mockLog());
const dms = log.log.filter((x) => x.path.startsWith('/graph/') && x.path.endsWith('/messages'));
check('Two keyword DMs sent (c1, c2), none to her own comment', dms.length === 2 && dms.every((d) => ['c1', 'c2'].includes(d.body.recipient.comment_id)), JSON.stringify(dms.map((d) => d.body)));
check('DM text has the freebie link', dms[0]?.body.message.text === 'Here you go: https://example.com/pins.pdf');
check('DM uses the Instagram token', dms[0]?.auth === 'Bearer test-ig-token', dms[0]?.auth);
const igPages = log.pages.filter((p) => p.properties.Platform.select.name === 'Instagram');
check('Inbox has c2 and c3 only (keyword-only c1 not logged)', igPages.length === 2 && igPages.map((p) => p.properties['Comment ID'].rich_text[0].text.content).sort().join() === 'c2,c3', igPages.map((p) => p.properties.Comment.title[0].text.content).join(' | '));
const c2 = igPages.find((p) => p.properties['Comment ID'].rich_text[0].text.content === 'c2');
check('c2 flagged as a question with priority', c2?.properties.Type.select.name === 'Question' && c2?.properties.Priority.checkbox === true);
if (API) {
  check('API mode: draft written, no em dash, ready for review', c2?.properties.Status.select.name === 'New' && !!c2.properties['Draft reply'].rich_text[0] && !c2.properties['Draft reply'].rich_text[0].text.content.includes('—'), c2?.properties['Draft reply'].rich_text[0]?.text.content);
} else {
  check('Free mode: no draft yet, Status Needs draft', c2?.properties.Status.select.name === 'Needs draft' && c2.properties['Draft reply'].rich_text.length === 0, c2?.properties.Status.select.name);
  const c3 = igPages.find((p) => p.properties['Comment ID'].rich_text[0].text.content === 'c3');
  check('Free mode: "love this" sorted as praise, no priority', c3?.properties.Type.select.name === 'Praise' && c3?.properties.Priority.checkbox === false);
}
check('Instagram row has the post link', c2?.properties.Link?.url === 'https://www.instagram.com/p/TESTPOST/');
check('Note says the DM was sent', (c2?.properties.Note.rich_text[0]?.text.content || '').startsWith('Keyword PINS: sent'));

// 4. Same event again: no second DM, no duplicate rows
await postIg(event);
await sleep(8000);
log = await mockLog();
check('Repeat event: no extra DMs', log.log.filter((x) => x.path.startsWith('/graph/') && x.path.endsWith('/messages')).length === 2);
check('Repeat event: no duplicate rows', log.pages.length === 2, String(log.pages.length));

// 5. YouTube + TikTok polls
await runJob('youtube');
await runJob('tiktok');
log = await waitFor(async () => {
  const l = await mockLog();
  return l.pages.length >= 4 ? l : null;
});
log = log || (await mockLog());
const yt = log.pages.filter((p) => p.properties.Platform.select.name === 'YouTube');
const tt = log.pages.filter((p) => p.properties.Platform.select.name === 'TikTok');
check('YouTube: 1 new comment logged (own + 8-day-old skipped)', yt.length === 1, String(yt.length));
check('YouTube row keeps thread id + link', yt[0]?.properties['Thread ID'].rich_text[0]?.text.content === 'ytThread1' && yt[0]?.properties.Link.url.includes('lc=ytThread1'));
check(`TikTok: 1 logged (spam + own skipped), lead, ${API ? 'Reply by hand' : 'Needs draft'}`, tt.length === 1 && tt[0].properties.Status.select.name === (API ? 'Reply by hand' : 'Needs draft') && tt[0].properties.Type.select.name === 'Lead', JSON.stringify(tt.map((p) => [p.properties.Status.select.name, p.properties.Type.select.name])));
const apify = log.log.find((x) => x.path.includes('apify'));
check('Apify run is capped and asks for 3 newest videos', apify?.query.maxTotalChargeUsd === '0.10' && apify?.body.resultsPerPage === 3 && apify?.body.profiles[0] === 'scrollysocial');
await runJob('youtube');
await sleep(8000);
check('YouTube re-poll adds no duplicates', (await mockLog()).pages.length === 4);

const claudeCalls = log.log.filter((x) => x.path.startsWith('/anthropic')).length;
check(API ? 'API mode: Claude API was called' : 'Free mode: no Claude API calls at all', API ? claudeCalls > 0 : claudeCalls === 0, String(claudeCalls));

// 6. Approve everything (empty drafts filled first, as the subscription routine would), post replies
await fetch(`${MOCK}/test/approve`, { method: 'POST' });
await runJob('replies');
log = await waitFor(async () => {
  const l = await mockLog();
  return l.log.some((x) => x.method === 'PATCH') && l.pages.every((p) => p.properties.Status.select.name !== 'Approved') ? l : null;
});
log = log || (await mockLog());
const igReplies = log.log.filter((x) => x.path.endsWith('/replies'));
const ytReplies = log.log.filter((x) => x.path === '/yt/comments');
check('Instagram replies posted to c2 and c3', igReplies.map((x) => x.path.split('/')[2]).sort().join() === 'c2,c3', igReplies.map((x) => x.path).join());
check('Instagram reply sends the draft text', !!igReplies[0]?.query.message);
check('YouTube reply posted under the thread with an OAuth token', ytReplies.length === 1 && ytReplies[0].body.snippet.parentId === 'ytThread1' && ytReplies[0].auth === 'Bearer yt-access');
check('Statuses: 3 Posted, TikTok Reply by hand', log.pages.filter((p) => p.properties.Status.select.name === 'Posted').length === 3 && tt.length === 1 && log.pages.find((p) => p.properties.Platform.select.name === 'TikTok').properties.Status.select.name === 'Reply by hand', log.pages.map((p) => p.properties.Status.select.name).join());

// 7. Token refresh, then the next DM/reply uses the new token
await runJob('token');
await sleep(6000);
await postIg(igEvent([{ id: 'c9', text: 'PINS', from: { id: '444', username: 'dee' }, media: { id: 'media1' } }]));
await sleep(8000);
log = await mockLog();
check('After refresh, DMs use the new token', log.log.filter((x) => x.path.startsWith('/graph/') && x.path.endsWith('/messages')).pop()?.auth === 'Bearer refreshed-token');

// 8. Status webhook
r = await fetch(`${N8N}/webhook/comments-status`, { headers: RUN });
const status = await r.json().catch(() => ({}));
check('Status webhook answers', r.status === 200 && status.testMode === false && status.dmsSent === 3, JSON.stringify(status).slice(0, 400));
check('Status shows only the forged-signature error', (status.errors || []).every((e) => e.where === 'instagram-signature'), JSON.stringify(status.errors));
r = await fetch(`${N8N}/webhook/comments-status`);
check('Status refuses without the secret', JSON.stringify(await r.json().catch(() => ({}))).includes('forbidden'));

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
