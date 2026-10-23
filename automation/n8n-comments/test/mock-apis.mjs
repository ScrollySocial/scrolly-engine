// Stand-in for Instagram Graph, YouTube, Google OAuth, Apify and Anthropic so the
// workflow can be tested end to end without sending anything real. (The Notion
// routes are left from before the comment dashboard; the inbox itself runs for
// real in tests, see test/run-inbox.sh.)
// Every request is recorded; GET /log returns them, POST /reset clears them.
//   node test/mock-apis.mjs            (listens on 5690)
import http from 'node:http';

const PORT = Number(process.env.MOCK_PORT || 5690);
let log = [];
let pages = [];
let failNextPatch = false;
let sentCount = 0;
const FAIL = Symbol('fail');
const hoursAgo = (h) => new Date(Date.now() - h * 3600e3).toISOString();

function claudeAnswer(comment) {
  const t = comment.toLowerCase();
  if (t.includes('crypto') || t.includes('promote')) return { type: 'spam', reply: '', needs_check: false };
  if (t.includes('price') || t.includes('join')) return { type: 'lead', reply: 'So glad you asked! Everything is in the link in my bio.', needs_check: false };
  if (t.includes('?')) return { type: 'question', reply: 'Great question — start with one post a day for a week.', needs_check: true };
  return { type: 'praise', reply: 'Thank you so much!', needs_check: false };
}

const routes = [
  ['POST', /^\/graph\/[^/]+\/messages$/, () => ({ recipient_id: 'r1', message_id: `mid-sent-${++sentCount}` })],
  ['POST', /^\/graph\/[^/]+\/replies$/, () => ({ id: 'reply1' })],
  ['GET', /^\/graph\/refresh$/, () => ({ access_token: 'refreshed-token', token_type: 'bearer', expires_in: 5184000 })],
  // A media id answers with its permalink, a person id with a username.
  ['GET', /^\/graph\/[^/]+$/, (req, url) => {
    const id = url.pathname.split('/').pop();
    return { id, permalink: 'https://www.instagram.com/p/TESTPOST/', username: `user${id}` };
  }],
  ['GET', /^\/yt\/commentThreads$/, () => ({
    items: [
      { id: 'ytThread1', snippet: { videoId: 'vid1', topLevelComment: { id: 'ytThread1', snippet: { textOriginal: 'How often should I post Shorts?', authorDisplayName: 'Ana', authorChannelId: { value: 'UCana' }, publishedAt: hoursAgo(1), videoId: 'vid1' } } } },
      { id: 'ytThread2', snippet: { videoId: 'vid1', topLevelComment: { id: 'ytThread2', snippet: { textOriginal: 'my own reply', authorDisplayName: 'Scrolly', authorChannelId: { value: 'UCscrolly' }, publishedAt: hoursAgo(1), videoId: 'vid1' } } } },
      { id: 'ytThread3', snippet: { videoId: 'vid0', topLevelComment: { id: 'ytThread3', snippet: { textOriginal: 'old comment', authorDisplayName: 'Bo', authorChannelId: { value: 'UCbo' }, publishedAt: hoursAgo(200), videoId: 'vid0' } } } },
    ],
  })],
  ['POST', /^\/yt\/comments$/, () => ({ id: 'ytReply1' })],
  ['GET', /^\/mailerlite\/groups$/, () => ({ data: [{ id: '111', name: 'FREE freebie' }] })],
  ['POST', /^\/mailerlite\/subscribers$/, (req, url, body) => ({ data: { id: 'sub1', email: body.email } })],
  ['POST', /^\/google-token$/, () => ({ access_token: 'yt-access', expires_in: 3599 })],
  ['POST', /^\/apify\/acts\/clockworks~tiktok-comments-scraper\/run-sync-get-dataset-items$/, () => [
    { cid: 'tt1', text: 'What price is the club?', uniqueId: 'mia', uid: 'u1', createTimeISO: hoursAgo(3), videoWebUrl: 'https://www.tiktok.com/@scrollysocial/video/1' },
    { cid: 'tt2', text: 'promote it on our page, DM us', uniqueId: 'spambot', uid: 'u2', createTimeISO: hoursAgo(3), videoWebUrl: 'https://www.tiktok.com/@scrollysocial/video/1' },
    { cid: 'tt3', text: 'thanks!', uniqueId: 'scrollysocial', uid: 'me', createTimeISO: hoursAgo(3), videoWebUrl: 'https://www.tiktok.com/@scrollysocial/video/1' },
  ]],
  ['POST', /^\/anthropic\/v1\/messages$/, (req, url, body) => {
    const comment = JSON.parse(body.messages[0].content).comment;
    return { stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: JSON.stringify(claudeAnswer(comment)) }] };
  }],
  ['POST', /^\/notion\/pages$/, (req, url, body) => {
    const page = { id: `page-${pages.length + 1}`, properties: body.properties };
    pages.push(page);
    return page;
  }],
  // Supports the two filters the workflow sends: Status equals X, and
  // Platform equals X + Received before a date (the YouTube cleanup).
  ['POST', /^\/notion\/databases\/[^/]+\/query$/, (req, url, body) => {
    const matches = (p, f) =>
      f.and
        ? f.and.every((g) => matches(p, g))
        : f.date
          ? (p.properties[f.property]?.date?.start || '') < f.date.before
          : p.properties[f.property]?.select?.name === f.select?.equals;
    return { results: pages.filter((p) => !p.archived && matches(p, body.filter || {})), has_more: false };
  }],
  ['PATCH', /^\/notion\/pages\/[^/]+$/, (req, url, body) => {
    if (failNextPatch) return (failNextPatch = false), FAIL;
    const page = pages.find((p) => p.id === url.pathname.split('/').pop());
    if (page && body.properties) Object.assign(page.properties, body.properties);
    if (page && body.archived) page.archived = true;
    return page || {};
  }],
  ['GET', /^\/log$/, () => ({ log, pages })],
  ['POST', /^\/reset$/, () => ((log = []), (pages = []), (failNextPatch = false), (sentCount = 0), { ok: true })],
  ['POST', /^\/test\/approve$/, () => {
    // Stands in for the subscription routine (fills empty drafts) and for Mercedes (approves).
    for (const p of pages) {
      if (!p.properties['Draft reply'].rich_text.length) p.properties['Draft reply'] = { rich_text: [{ type: 'text', text: { content: 'Thank you, so glad it helped!' } }] };
      p.properties.Status = { select: { name: 'Approved' } };
    }
    return { approved: pages.length };
  }],
  // Adds a ready-made inbox row ({properties}), e.g. one at "Not sent (test mode)".
  ['POST', /^\/test\/seed$/, (req, url, body) => {
    const page = { id: `page-${pages.length + 1}`, properties: body.properties };
    pages.push(page);
    return page;
  }],
  // The next Notion row update fails, as when Notion has a hiccup after a reply went out.
  ['POST', /^\/test\/fail-next-patch$/, () => ((failNextPatch = true), { ok: true })],
];

http
  .createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const url = new URL(req.url, 'http://mock');
      let body = {};
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        body = Object.fromEntries(new URLSearchParams(raw));
      }
      const route = routes.find(([m, re]) => m === req.method && re.test(url.pathname));
      if (!['/log', '/reset'].includes(url.pathname)) {
        log.push({ method: req.method, path: url.pathname, query: Object.fromEntries(url.searchParams), auth: req.headers.authorization || req.headers['x-api-key'] || '', body });
      }
      const out = route ? route[2](req, url, body) : { error: 'no mock route' };
      const code = out === FAIL ? 502 : route ? 200 : 404;
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(out === FAIL ? { error: 'test failure' } : out));
    });
  })
  .listen(PORT, () => console.log(`mock APIs on http://localhost:${PORT}`));
