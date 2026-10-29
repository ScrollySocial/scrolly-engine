// The made-up "Bloom Studio" shop behind every Chat Manager demo: the local one
// (test/demo-inbox.mjs) and the public one (demo.scrollyseo.com, docker-compose.demo.yml).
//   node demo/seed.mjs <configDir> <dataDir>
// Writes a profile, three keywords, about two months of keyword activity, a handful of
// conversations and an email list. Times are relative to now, with a fixed pattern (no
// randomness), so the demo always looks recent and screen recordings match.
// Every handle ends in ".demo" and every email is @example.com: nobody real is shown.
import { mkdirSync, writeFileSync } from 'node:fs';
import { scryptSync } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function seed(cfg, data) {
  mkdirSync(join(cfg, 'pages'), { recursive: true });
  mkdirSync(data, { recursive: true });
  const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString();
  const consent = 'Add me to Bloom Studio emails (new patterns and offers). I can unsubscribe anytime.';
  writeFileSync(join(cfg, 'profile.json'), JSON.stringify({
    brand: 'Bloom Studio', handle: 'bloomstudio', owner: 'Jess', privacyUrl: '/privacy',
    look: { background: '#fff4f1', card: '#ffffff', text: '#2b1d1b', muted: '#6b5a57', button: '#c2410c', buttonText: '#ffffff', headingFont: 'Fraunces', bodyFont: 'Inter', fontsUrl: 'https://fonts.googleapis.com/css2?family=Fraunces&family=Inter:wght@400;500;600&display=swap' },
    signup: { consent },
  }));
  writeFileSync(join(cfg, 'keywords-all.json'), JSON.stringify({ keywords: [
    { keyword: 'PATTERN', freebie: 'Free tote bag pattern', url: 'https://example.com/tote.pdf', live: true, dmApproved: true, delivery: 'email', where: { igComments: true, igDms: true }, ask: { on: true, text: 'Want the free pattern? Reply READY and I\'ll send it over.', word: 'READY' }, linkText: 'Here you go! Pop in your email and it opens right away: {link}', signup: { headline: 'Get your free tote bag pattern', text: 'Pop in your email and you can open it right away.' }, reminder: { on: true, minutes: 60, text: 'Just checking you got this. Your link is still here: {link}' }, afterSignup: { dm: 'Here\'s your pattern, as promised: {url}' }, list: {} },
    { keyword: 'FABRIC', freebie: 'Fabric cheat sheet', url: 'https://example.com/fabric.pdf', live: true, dmApproved: true, delivery: 'email', where: { igComments: true, igDms: true }, ask: { on: true, text: 'Want the fabric cheat sheet right here, or by email so it’s saved in your inbox?', word: 'READY' }, choice: { on: true, here: 'Send it here', email: 'By email' }, dm: 'Here you go! {url}', linkText: 'Pop in your email and it opens right away: {link}', signup: { headline: 'Get the fabric cheat sheet' }, reminder: { on: true, minutes: 60, text: 'Just checking you got this. Your link is still here: {link}' }, afterSignup: { dm: 'Here it is, as promised: {url}' }, publicReply: { on: true, text: 'Sent you a DM! 💌' }, questions: [{ text: 'What do you sew most?', answers: [{ label: 'Bags', url: '' }, { label: 'Clothes', url: '' }, { label: 'Quilts', url: 'https://example.com/quilting-fabric.pdf' }] }], list: {} },
    { keyword: 'SIZES', freebie: 'Size chart', url: 'https://example.com/sizes', live: true, dmApproved: true, delivery: 'direct', where: { igComments: true, igDms: true }, dm: 'Here\'s the size chart: {url}' },
  ] }));
  writeFileSync(join(cfg, 'pages', 'privacy.html'), '<h1>Privacy policy</h1><p>Demo page.</p><h2 id="delete-your-data">Delete your data</h2><p>Email hello@example.com.</p>');

  // About two months of keyword activity (busier in the last 30 days), for trends, comparisons and top posts.
  const POSTS = ['https://www.instagram.com/reel/DEMO-tote-bag/', 'https://www.instagram.com/reel/DEMO-fabric-tips/', 'https://www.instagram.com/p/DEMO-size-guide/'];
  const events = [];
  const flows = [];
  const subscribers = [];
  const links = [];
  for (let d = 59; d >= 1; d--) {
    const n = d < 30 ? 2 + ((d * 7) % 5) : 1 + ((d * 3) % 3);
    for (let i = 0; i < n; i++) {
      const at = ago(d * 24 + i * 3 + 1);
      const pick = (d + i) % 4;
      const keyword = pick === 3 ? 'SIZES' : 'PATTERN';
      const post = POSTS[pick === 3 ? 2 : pick % 2];
      events.push({ at, keyword, platform: 'Instagram', post, result: 'sent' });
      // SIZES sends its link straight in the DM: about two in three people open it.
      if (keyword === 'SIZES') links.push({ id: `demoS${d}x${i}`, keyword, flow: '', kind: 'direct', at, clicks: (d + i) % 3 ? 1 : 0, ...((d + i) % 3 ? { clickedAt: at } : {}) });
      if (keyword !== 'PATTERN') continue;
      const signed = (d + i) % 3 !== 0;
      const author = `maker${d}${i}.demo`;
      flows.push({ token: `demo${d}x${i}`, keyword, platform: 'Instagram', personId: `p${d}${i}`, author, post, step: signed ? 'signedUp' : 'clicked', history: [], createdAt: at, askedAt: at, linkSentAt: at, clickedAt: at, ...(signed ? { signedUpAt: at, email: `maker${d}${i}@example.com` } : {}) });
      if (signed) subscribers.push({ id: `${String(d).padStart(8, '0')}${String(i).padStart(8, '0')}`, email: `maker${d}${i}@example.com`, keyword, freebie: 'Free tote bag pattern', platform: 'Instagram', consent, at, status: 'kept', provider: 'builtin' });
    }
  }

  // Today: one person's whole freebie journey (comment → READY → link → signed up), shown as a conversation.
  const step = (s, h, extra = {}) => ({ at: ago(h), step: s, ...extra });
  events.push({ at: ago(3), keyword: 'PATTERN', platform: 'Instagram', post: POSTS[0], result: 'sent' }, { at: ago(2.9), keyword: 'PATTERN', platform: 'Instagram', post: '', result: 'sent' });
  flows.push({ token: 'demoMaya000001', keyword: 'PATTERN', platform: 'Instagram', personId: 'p-maya', dmPersonId: 'p-maya', author: 'maya.makes.demo', post: POSTS[0], step: 'signedUp', email: 'maya@example.com', createdAt: ago(3), askedAt: ago(3), linkSentAt: ago(2.9), clickedAt: ago(2.8), signedUpAt: ago(2.7), deliveredAt: ago(2.7), history: [step('asked', 3), step('linkSent', 2.9), step('clicked', 2.8), step('signedUp', 2.7, { email: 'maya@example.com' })] });
  subscribers.push({ id: 'ffffffffffffff01', email: 'maya@example.com', keyword: 'PATTERN', freebie: 'Free tote bag pattern', platform: 'Instagram', consent, at: ago(2.7), status: 'kept', provider: 'builtin' });
  // FABRIC (here or by email, from three weeks ago): people pick, about half want it by email.
  for (let d = 21; d >= 1; d--) {
    const at = ago(d * 24 + 5);
    const who = `sewer${d}.demo`;
    const way = d % 5 === 0 ? 'asked' : d % 2 ? 'here' : 'email';
    events.push({ at, keyword: 'FABRIC', platform: 'Instagram', post: POSTS[1], result: 'sent' });
    const sews = ['Bags', 'Clothes', 'Quilts'][d % 3];
    const token = `demoFab${String(d).padStart(4, '0')}`;
    const base = { token, keyword: 'FABRIC', platform: 'Instagram', personId: `f${d}`, dmPersonId: `f${d}`, author: who, post: POSTS[1], history: [], createdAt: at, askedAt: at };
    const answered = { questionAt: at, answers: [{ q: 'What do you sew most?', a: sews }], ...(sews === 'Quilts' ? { freebieUrl: 'https://example.com/quilting-fabric.pdf' } : {}) };
    if (way === 'asked') flows.push({ ...base, step: 'asked' });
    else if (way === 'here') {
      flows.push({ ...base, ...answered, step: 'sentHere', sentHereAt: at });
      links.push({ id: `demoL${token}`, keyword: 'FABRIC', flow: token, kind: 'here', at, clicks: d % 3 ? 1 : 0, ...(d % 3 ? { clickedAt: at } : {}) });
    }
    else {
      const signed = d % 4 !== 0;
      if (signed) links.push({ id: `demoA${token}`, keyword: 'FABRIC', flow: token, kind: 'after', at, clicks: 1, clickedAt: at });
      flows.push({ ...base, ...answered, step: signed ? 'signedUp' : 'clicked', linkSentAt: at, clickedAt: at, ...(signed ? { signedUpAt: at, deliveredAt: at, email: `sewer${d}@example.com` } : { remindedAt: at }) });
      if (signed) subscribers.push({ id: `fab${String(d).padStart(13, '0')}`, email: `sewer${d}@example.com`, keyword: 'FABRIC', freebie: 'Fabric cheat sheet', platform: 'Instagram', consent, at, status: 'kept', provider: 'builtin', answers: answered.answers });
    }
  }
  subscribers.sort((a, b) => b.at.localeCompare(a.at));

  const row = (r) => ({ type: 'Other', priority: false, draft: '', note: '', read: false, ...r });
  writeFileSync(join(data, 'inbox.json'), JSON.stringify({
    rows: [
      row({ id: 'a7', kind: 'comment', platform: 'Instagram', status: 'Handled', text: 'PATTERN', author: 'maya.makes.demo', personId: 'p-maya', commentId: 'c2', receivedAt: ago(3), keyword: 'PATTERN', dm: 'sent: Want the free pattern? Reply READY and I\'ll send it over.', link: POSTS[0], read: true }),
      row({ id: 'a8', kind: 'dm', platform: 'Instagram', status: 'Handled', text: 'READY', author: 'maya.makes.demo', personId: 'p-maya', commentId: 'd8', receivedAt: ago(2.95), keyword: 'PATTERN', dm: 'sent: Here you go! Pop in your email and it opens right away: bloomstudio.duckdns.org/inbox/f/…', read: true }),
      row({ id: 'a1', kind: 'comment', platform: 'Instagram', type: 'Question', priority: true, status: 'New', text: 'Does the pattern work for canvas fabric?', author: 'maya.makes.demo', personId: 'p-maya', commentId: 'c1', receivedAt: ago(2), link: POSTS[0], draft: 'Yes! Canvas works really well, just use a size 16 needle.' }),
      row({ id: 'a2', kind: 'dm', platform: 'Instagram', type: 'Question', status: 'Needs draft', text: 'Hi! Do you ship to Canada?', author: 'sewwithsam.demo', commentId: 'd1', receivedAt: ago(5) }),
      row({ id: 'a9', kind: 'dm', platform: 'Instagram', type: 'Lead', priority: true, status: 'New', text: 'Is the beginner bundle still on sale? I want to get it for my daughter', author: 'nina.stitches.demo', commentId: 'd9', receivedAt: ago(7), note: 'Story reply', draft: 'It is, until Sunday! Here\'s the link: example.com/bundle. She\'s going to love it.' }),
      row({ id: 'a3', kind: 'comment', platform: 'TikTok', type: 'Praise', status: 'Reply by hand', text: 'Love this colour combo', author: 'craftycleo.demo', commentId: 't1', receivedAt: ago(20), link: 'https://www.tiktok.com/', draft: 'Thank you so much! It\'s the sage and rust set.' }),
      row({ id: 'a6', kind: 'dm', platform: 'Instagram', type: 'Question', status: 'Error', text: 'Can I use this for a class I teach?', author: 'teachstitch.demo', commentId: 'd3', receivedAt: ago(40), draft: 'Of course, just credit Bloom Studio!', note: 'Instagram only allows DM replies within 24 hours of their last message.' }),
      row({ id: 'a4', kind: 'comment', platform: 'YouTube', type: 'Question', status: 'Posted', text: 'What fabric weight do you use for the straps?', author: 'quiltquinn.demo', commentId: 'y1', receivedAt: ago(30), postedAt: ago(29), link: 'https://www.youtube.com/', draft: 'A 10 oz canvas, doubled up. Holds up for years!', read: true }),
      row({ id: 'a5', kind: 'dm', platform: 'Instagram', type: 'Lead', status: 'Posted', text: 'Do you sell the printed version?', author: 'linenlou.demo', commentId: 'd2', receivedAt: ago(52), postedAt: ago(50), draft: 'Yes! The printed one is in my shop, link in bio.', read: true }),
      row({ id: 'a10', kind: 'comment', platform: 'Instagram', type: 'Praise', status: 'Skip', text: 'So cute 😍', author: 'rosie.demo', commentId: 'c10', receivedAt: ago(60), link: POSTS[1], read: true }),
    ],
    events,
    flows,
    subscribers,
    links,
    // Local demo password (the public demo needs none): demo-password
    auth: { salt: 'demo', hash: scryptSync('demo-password', 'demo', 64).toString('hex'), setAt: ago(1) },
    sessions: {},
  }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cfg, data] = process.argv.slice(2);
  if (!cfg || !data) {
    console.error('usage: node demo/seed.mjs <configDir> <dataDir>');
    process.exit(1);
  }
  seed(cfg, data);
  console.log(`demo data written to ${cfg} and ${data}`);
}
