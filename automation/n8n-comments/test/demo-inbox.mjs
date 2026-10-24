// A demo dashboard for looking at the kit with someone else's brand (no real accounts):
// a made-up "Bloom Studio" profile, two keywords, a few comments and signups, the built-in list.
//   node test/demo-inbox.mjs        → http://localhost:5697/inbox  (password: demo-password)
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { scryptSync } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = mkdtempSync(join(tmpdir(), 'chatmgr-demo-'));
const cfg = join(tmp, 'config');
const data = join(tmp, 'data');
mkdirSync(join(cfg, 'pages'), { recursive: true });
mkdirSync(data);
const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString();
writeFileSync(join(cfg, 'profile.json'), JSON.stringify({
  brand: 'Bloom Studio', handle: 'bloomstudio', owner: 'Jess', privacyUrl: '/privacy',
  look: { background: '#fff4f1', card: '#ffffff', text: '#2b1d1b', muted: '#6b5a57', button: '#c2410c', buttonText: '#ffffff', headingFont: 'Fraunces', bodyFont: 'Inter', fontsUrl: 'https://fonts.googleapis.com/css2?family=Fraunces&family=Inter:wght@400;500;600&display=swap' },
  signup: { consent: 'Add me to Bloom Studio emails (new patterns and offers). I can unsubscribe anytime.' },
}));
writeFileSync(join(cfg, 'keywords-all.json'), JSON.stringify({ keywords: [
  { keyword: 'PATTERN', freebie: 'Free tote bag pattern', url: 'https://example.com/tote.pdf', live: true, dmApproved: true, delivery: 'email', where: { igComments: true, igDms: true }, ask: { on: true, text: 'Want the free pattern? Reply READY and I will send it over.', word: 'READY' }, linkText: 'Here you go! Pop in your email and it opens right away: {link}', reminder: { on: true, minutes: 60, text: 'Just checking you got this: {link}' }, afterSignup: { dm: 'Here is your pattern: {url}' }, list: {} },
  { keyword: 'SIZES', freebie: 'Size chart', url: 'https://example.com/sizes', live: true, dmApproved: true, delivery: 'direct', where: { igComments: true, igDms: true }, dm: 'Here is the size chart: {url}' },
] }));
writeFileSync(join(cfg, 'pages', 'privacy.html'), '<h1>Privacy policy</h1><p>Demo page.</p><h2 id="delete-your-data">Delete your data</h2><p>Email hello@example.com.</p>');
// About two months of made-up keyword activity (more in the last 30 days), so Stats has trends,
// period comparisons and top posts to show. Fixed pattern, no randomness, so videos match.
const POSTS = ['https://www.instagram.com/reel/DEMO-tote-bag/', 'https://www.instagram.com/reel/DEMO-fabric-tips/', 'https://www.instagram.com/p/DEMO-size-guide/'];
const events = [];
const flows = [];
for (let d = 59; d >= 0; d--) {
  const n = d < 30 ? 2 + ((d * 7) % 5) : 1 + ((d * 3) % 3);
  for (let i = 0; i < n; i++) {
    const at = ago(d * 24 + i * 3 + 1);
    const pick = (d + i) % 4;
    const keyword = pick === 3 ? 'SIZES' : 'PATTERN';
    const post = POSTS[pick === 3 ? 2 : pick % 2];
    events.push({ at, keyword, platform: 'Instagram', post, result: 'sent' });
    if (keyword === 'PATTERN') {
      const signed = (d + i) % 3 !== 0;
      flows.push({ token: `demo${d}x${i}`, keyword, platform: 'Instagram', personId: `p${d}${i}`, author: `maker_${d}_${i}`, post, step: signed ? 'signedUp' : 'clicked', history: [], createdAt: at, askedAt: at, linkSentAt: at, clickedAt: at, ...(signed ? { signedUpAt: at } : {}) });
    }
  }
}
writeFileSync(join(data, 'inbox.json'), JSON.stringify({
  rows: [
    { id: 'a1', kind: 'comment', platform: 'Instagram', type: 'Question', priority: true, status: 'New', text: 'Does the pattern work for canvas fabric?', author: 'maya.makes', commentId: 'c1', receivedAt: ago(2), draft: 'Yes! Canvas works well, use a size 16 needle.' },
    { id: 'a2', kind: 'dm', platform: 'Instagram', type: 'Other', status: 'Needs draft', text: 'Hi! Do you ship to Canada?', author: 'sewwithsam', commentId: 'd1', receivedAt: ago(5) },
    { id: 'a3', kind: 'comment', platform: 'TikTok', type: 'Praise', status: 'Reply by hand', text: 'Love this colour combo', author: 'craftycleo', commentId: 't1', receivedAt: ago(20), draft: 'Thank you so much!' },
    { id: 'a4', kind: 'comment', platform: 'YouTube', type: 'Question', status: 'Posted', text: 'What fabric weight do you use for the straps?', author: 'quiltquinn', commentId: 'y1', receivedAt: ago(30), postedAt: ago(29), draft: 'A 10 oz canvas, doubled up. Holds up for years!' },
    { id: 'a5', kind: 'dm', platform: 'Instagram', type: 'Lead', status: 'Posted', text: 'Do you sell the printed version?', author: 'linenlou', commentId: 'd2', receivedAt: ago(52), postedAt: ago(50), draft: 'Yes! The printed one is in my shop, link in bio.' },
    { id: 'a6', kind: 'dm', platform: 'Instagram', type: 'Question', status: 'Error', text: 'Can I use this for a class I teach?', author: 'teachstitch', commentId: 'd3', receivedAt: ago(40), draft: 'Of course, just credit Bloom Studio!', note: "Instagram only allows DM replies within 24 hours of their last message." },
    { id: 'a7', kind: 'comment', platform: 'Instagram', type: 'Other', status: 'Handled', text: 'PATTERN', author: 'maya.makes', commentId: 'c2', receivedAt: ago(3), keyword: 'PATTERN', dm: 'sent: Want it? Reply READY and I will send it over.' },
  ],
  events,
  flows,
  subscribers: [
    { id: '0000000000000001', email: 'maya@example.com', keyword: 'PATTERN', freebie: 'Free tote bag pattern', platform: 'Instagram', consent: 'Add me to Bloom Studio emails (new patterns and offers). I can unsubscribe anytime.', at: ago(3), status: 'kept', provider: 'builtin' },
    { id: '0000000000000002', email: 'sam@example.com', keyword: 'PATTERN', freebie: 'Free tote bag pattern', platform: 'Instagram', consent: 'Add me to Bloom Studio emails (new patterns and offers). I can unsubscribe anytime.', at: ago(26), status: 'kept', provider: 'builtin' },
  ],
  // Demo password (local only): demo-password
  auth: { salt: 'demo', hash: scryptSync('demo-password', 'demo', 64).toString('hex'), setAt: ago(1) },
  sessions: {},
}));
const child = spawn(process.execPath, [join(ROOT, 'inbox', 'server.mjs')], {
  env: { ...process.env, PORT: '5697', DATA_DIR: data, CONFIG_DIR: cfg, INBOX_API_SECRET: 'demo-secret', INBOX_SETUP_CODE: 'demo-code', INBOX_SECURE_COOKIE: 'false', INBOX_DEMO: 'true', N8N_HOST: 'bloomstudio.duckdns.org', EMAIL_LIST: 'builtin', MAILERLITE_API_KEY: '', DMS_ENABLED: 'true' },
  stdio: 'inherit',
});
console.log(`demo dashboard: http://localhost:5697/inbox (password demo-password), data in ${tmp}`);
process.on('SIGTERM', () => child.kill());
