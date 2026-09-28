// Builds the $1K Club downloads referenced by the Playbook:
//   D-1 Reel Safe-Zone Package (overlay PNG + labeled guide PNG + one-page guide PDF)  -> dist/D-1-reel-safe-zone/
//   D-2 3:4 Carousel Template (blank slide PNG + margin overlay PNG + one-page guide PDF) -> dist/D-2-carousel-template/
//   D-3 Instagram Setup Checklist (PDF)                                                  -> dist/D-3-instagram-setup-checklist.pdf
// D-4 (printable worksheets) is extracted from the final Playbook PDF (see extract-d4.mjs).
// Safe zone: Meta's unified 9:16 safe zone for Reels and Stories (2026): keep 14% top, 35% bottom, 6% each side clear.
// Usage: node downloads/build.mjs
import puppeteer from '../../node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import http from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, 'dist');
for (const d of ['', 'D-1-reel-safe-zone', 'D-2-carousel-template', 'src']) mkdirSync(path.join(dist, d), { recursive: true });

const W = 1080, H = 1920, TOP = Math.round(H * 0.14), BOT = Math.round(H * 0.35), SIDE = Math.round(W * 0.06);
const GRID_T = (H - 1440) / 2; // 3:4 profile-grid crop, centered
const TEAL = '#94ece1', BLACK = '#000', CREAM = '#fbf8f3';
const base = `<meta charset="utf-8"><link rel="stylesheet" href="/fonts/fonts.css"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Scrolly Arrow','Public Sans',Arial,sans-serif;color:#000}
.disp{font-family:'Archivo',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:0;word-spacing:.08em;line-height:1}</style>`;

// ---- D-1 overlay (transparent): shaded no-go bands, teal safe box, 3:4 crop lines. Delete the layer before export.
const overlay = (labels) => `<!doctype html><html><head>${base}<style>html,body{width:${W}px;height:${H}px;background:transparent}
.b{position:absolute;background:rgba(0,0,0,.42);color:#fff;font:800 34px 'Public Sans';letter-spacing:.08em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.3}
.safe{position:absolute;left:${SIDE}px;right:${SIDE}px;top:${TOP}px;bottom:${BOT}px;border:8px dashed ${TEAL}}
.crop{position:absolute;left:0;right:0;border-top:5px dashed rgba(255,255,255,.9)}
.lab{position:absolute;background:${TEAL};color:#000;font:800 30px 'Public Sans';padding:8px 16px;border-radius:10px}
.rail{position:absolute;right:0;width:${Math.round(W * 0.14)}px;top:${H - BOT - 520}px;height:520px;background:rgba(0,0,0,.25)}</style></head><body style="position:relative">
<div class="b" style="left:0;right:0;top:0;height:${TOP}px">${labels ? 'Top interface' : ''}</div>
<div class="b" style="left:0;right:0;bottom:0;height:${BOT}px">${labels ? 'Caption · username · audio<br>buttons · navigation' : ''}</div>
<div class="b" style="left:0;top:${TOP}px;bottom:${BOT}px;width:${SIDE}px"></div><div class="b" style="right:0;top:${TOP}px;bottom:${BOT}px;width:${SIDE}px"></div>
<div class="safe"></div>
<div class="crop" style="top:${GRID_T}px"></div><div class="crop" style="top:${GRID_T + 1440}px"></div>
${labels ? `<div class="lab" style="left:${SIDE + 20}px;top:${TOP + 20}px">Safe box: hook, subject, ask</div><div class="lab" style="left:${SIDE + 20}px;top:${GRID_T + 1440 - 70}px">3:4 grid crop</div>` : ''}
</body></html>`;

const guidePage = (title, sub, img, rows, foot) => `<!doctype html><html><head>${base}<style>@page{size:8.5in 11in;margin:0}html,body{background:${CREAM}}
.pg{width:8.5in;height:11in;padding:48px 56px;position:relative}
.eb{font:800 11px 'Public Sans';letter-spacing:.16em;text-transform:uppercase}
h1{font-size:40px;margin:8px 0 6px}.sub{font:600 15px/1.45 'Public Sans';max-width:600px}
.grid{display:grid;grid-template-columns:250px 1fr;gap:28px;margin-top:22px;align-items:start}
.grid img{width:250px;border-radius:14px;background:#6b645b}
ol{padding-left:20px;font-size:13.5px;line-height:1.5}li{margin:0 0 9px}b{font-weight:800}
.card{background:#fff;border-radius:14px;padding:14px 18px;margin-top:14px;font-size:12.5px;line-height:1.5}
.ft{position:absolute;left:56px;right:56px;bottom:30px;display:flex;justify-content:space-between;font:800 10px 'Public Sans';letter-spacing:.14em;text-transform:uppercase;color:#55504a}</style></head><body>
<div class="pg"><div class="eb">$1K Club download</div><h1 class="disp">${title}</h1><p class="sub">${sub}</p>
<div class="grid"><img src="${img}"><div><ol>${rows.map((r) => `<li>${r}</li>`).join('')}</ol>${foot}</div></div>
<div class="ft"><span>Scrolly · $1K Club Playbook</span><span>scrollyseo.com</span></div></div></body></html>`;

const D1 = guidePage('Reel safe-zone package', 'Instagram puts its buttons, username, caption and menus on top of your video. Keep your hook, your subject and your ask inside the teal box, and they stay visible.',
  '/dist/D-1-reel-safe-zone/reel-safe-zone-labeled-guide.png',
  ['<b>In this package:</b> <i>reel-safe-zone-overlay-1080x1920.png</i> (transparent, for editing) and <i>reel-safe-zone-labeled-guide.png</i> (this picture, for reference).',
    '<b>Editing with layers</b> (CapCut, Canva, Premiere, and similar): put the overlay on the top layer, full screen. Keep hook text, faces, the product and your ask inside the teal box. <b>Delete the overlay layer before you export.</b>',
    '<b>No layers?</b> Follow three rules: hooks go high; stay clear of the right edge; keep the bottom third free of anything important.',
    '<b>Covers:</b> your profile grid crops Reel covers to 3:4 (the white dashed lines). Keep cover text and faces between them.',
    '<b>The numbers:</b> on a 1080 × 1920 frame, keep the top 269 px, the bottom 672 px and 65 px on each side clear. That is Meta\'s published safe zone for Reels and Stories (14% top, 35% bottom, 6% sides).'],
  '<div class="card"><b>Interface layouts change</b> and differ a little by phone. This is a planning guide, not a guarantee: after posting, check your first Reel on your own phone.</div>');

// ---- D-2: 3:4 carousel (1080 × 1440) blank + margin overlay
const CW = 1080, CH = 1440, M = Math.round(CW * 0.05);
const slide = (overlay) => `<!doctype html><html><head>${base}<style>html,body{width:${CW}px;height:${CH}px;background:${overlay ? 'transparent' : CREAM}}
.m{position:absolute;left:${M}px;right:${M}px;top:${M}px;bottom:${M}px;border:6px dashed ${overlay ? TEAL : 'rgba(0,0,0,.18)'}}
.lab{position:absolute;left:${M + 16}px;top:${M + 16}px;background:${TEAL};font:800 28px 'Public Sans';padding:8px 14px;border-radius:10px}</style></head>
<body style="position:relative"><div class="m"></div>${overlay ? '<div class="lab">Keep text inside</div>' : ''}</body></html>`;
const D2 = guidePage('3:4 carousel template', 'Your profile grid is 3:4 and Instagram supports 3:4 photos in the feed. Slides made at 1080 × 1440 look the same in both places.',
  '/dist/D-2-carousel-template/carousel-margin-overlay-1080x1440.png',
  ['<b>In this package:</b> <i>carousel-blank-1080x1440.png</i> (a cream starting slide) and <i>carousel-margin-overlay-1080x1440.png</i> (transparent guide).',
    '<b>In Canva:</b> Create a design → Custom size → 1080 × 1440 px. Upload the overlay, drop it on top of each slide while you design, and delete it before you download.',
    '<b>The skeleton:</b> slide 1 is the first hook; slide 2 is a second first impression and must make sense on its own; the middle explains and proves; the last slide is the action.',
    '<b>Keep it readable:</b> about 25 words or fewer per slide, text inside the dashed margin, and at least one real photo or proof slide.',
    '<b>The action</b> goes on the last slide <b>and</b> in the caption. Use as many slides as the argument needs, and no more.'],
  '<div class="card">Your 30 carousel templates (with the $1K Challenge) are in My Account → Challenge Content.</div>');

// ---- D-3: Instagram setup checklist (Playbook chapters 7 and 16)
const box = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #000;border-radius:4px;margin-right:10px;vertical-align:-3px"></span>';
const sec = (h, items) => `<h2 class="disp" style="font-size:20px;margin:20px 0 8px">${h}</h2><div class="card" style="margin-top:0">${items.map((i) => `<p style="margin:0 0 9px;padding-left:26px;text-indent:-26px">${box}${i}</p>`).join('')}</div>`;
const D3 = `<!doctype html><html><head>${base}<style>@page{size:8.5in 11in;margin:0}html,body{background:${CREAM}}
.pg{width:8.5in;height:11in;padding:44px 56px 60px;position:relative;page-break-after:always}
.eb{font:800 11px 'Public Sans';letter-spacing:.16em;text-transform:uppercase}h1{font-size:38px;margin:8px 0 6px}
.sub{font:600 14.5px/1.45 'Public Sans';max-width:620px}.card{background:#fff;border-radius:14px;padding:14px 18px;font-size:13px;line-height:1.45}b{font-weight:800}
.ft{position:absolute;left:56px;right:56px;bottom:26px;display:flex;justify-content:space-between;font:800 10px 'Public Sans';letter-spacing:.14em;text-transform:uppercase;color:#55504a}</style></head><body>
<div class="pg"><div class="eb">$1K Club download · D-3</div><h1 class="disp">Instagram setup checklist</h1>
<p class="sub">About 30 minutes, once. It protects everything you post afterward. Chapters 7 and 16 of the playbook explain why each step matters.</p>
${sec('1. Account type', ['<b>Switch to a professional account</b> if you haven\'t: Profile → menu (the three lines) → Account type and tools → Switch to professional account → pick a category.', '<b>Creator or Business?</b> Choose <b>Business</b> if you need product tags or a shop, lead forms, an address on your profile, or a tool that requires Business. Otherwise choose <b>Creator</b>. Neither gets more reach, and neither gives you music rights.'])}
${sec('2. Four settings that matter', ['<b>Keep the account public.</b> Private accounts can\'t be recommended to new people.', '<b>Check Account Status</b> (in Settings). It shows whether your account can be recommended to people who don\'t follow you, and what to fix if not. Check again if your reach suddenly collapses.', '<b>Allow search engines:</b> leave "Allow public photos and videos to appear in search engine results" on.', '<b>Connect Facebook sharing</b> (section 4).'])}
${sec('3. Your profile is your buying hub', ['<b>Name field</b> says what you do: "Frank | Handyman in Austin."', '<b>Bio</b> passes the 10-second test: what you sell, who it\'s for, the price or "from $__," and what to do next.', '<b>First link</b> goes straight to your one next step (a product, booking, quote, or checkout page, never a generic homepage).', '<b>Action button</b> (if your booking tool supports one), <b>3 pinned posts</b> (best proof, clearest offer explainer, most-asked question), and <b>Highlights</b>: "How to buy," "Reviews," "FAQ."'])}
<div class="ft"><span>Scrolly · $1K Club Playbook</span><span>1 / 2</span></div></div>
<div class="pg">
${sec('4. Facebook: set it once (5 minutes)', ['Instagram → Profile → menu (the three lines) → <b>Accounts Center</b> → <b>Connected experiences</b> → <b>Sharing across profiles</b>.', 'Choose your Instagram account as the source and your <b>Facebook Page</b> as the destination.', 'Turn on automatic sharing for <b>posts</b> and <b>Reels</b>. Stories are optional: check how yours look on Facebook first.', 'Confirm your Facebook Reels audience is <b>Public</b> (in Facebook\'s Reels settings).', 'After your first few Reels, look at them on Facebook: video, audio and caption. If a Reel\'s music didn\'t carry over, reshare it with original or cleared audio.'])}
${sec('5. Before you post anything', ['A folder outside Instagram (Google Drive, Dropbox, or iCloud) for clean master files, carousel source files, photos, hooks that worked, and proof screenshots (with permission).', 'Your one next step and its exact link, written down.', 'The phone test done: open your profile as a customer, tap your link, try to buy, book, or request a quote, and fix the first friction point.', 'Insights location found: Profile → Professional dashboard (account-wide), and "View insights" under any post.'])}
<div class="card" style="margin-top:18px"><b>Menu names change.</b> Instagram moves and renames settings from time to time, and they can differ between iPhone and Android. If a step doesn't match your app, search for the setting's name in Settings.</div>
<div class="ft"><span>Scrolly · $1K Club Playbook</span><span>2 / 2</span></div></div></body></html>`;

// ---- render
const files = { '/src/overlay.html': overlay(false), '/src/overlay-labeled.html': overlay(true), '/src/d1.html': D1, '/src/slide.html': slide(false), '/src/slide-overlay.html': slide(true), '/src/d2.html': D2, '/src/d3.html': D3 };
for (const [k, v] of Object.entries(files)) writeFileSync(path.join(dist, k), v);
const MIME = { '.html': 'text/html', '.css': 'text/css', '.ttf': 'font/ttf', '.png': 'image/png' };
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  const f = u.startsWith('/fonts/') ? path.join(here, u) : path.join(dist, u.replace(/^\/dist/, ''));
  if (!existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new' });
const page = await browser.newPage();
async function png(src, out, w, h) {
  await page.setViewport({ width: w, height: h }); await page.goto(origin + src, { waitUntil: 'networkidle0' }); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(dist, out), omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
}
async function pdf(src, out) {
  await page.goto(origin + src, { waitUntil: 'networkidle0' }); await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(dist, out), printBackground: true, preferCSSPageSize: true });
}
await png('/src/overlay.html', 'D-1-reel-safe-zone/reel-safe-zone-overlay-1080x1920.png', W, H);
await png('/src/overlay-labeled.html', 'D-1-reel-safe-zone/reel-safe-zone-labeled-guide.png', W, H);
await pdf('/src/d1.html', 'D-1-reel-safe-zone/reel-safe-zone-guide.pdf');
await png('/src/slide.html', 'D-2-carousel-template/carousel-blank-1080x1440.png', CW, CH);
await png('/src/slide-overlay.html', 'D-2-carousel-template/carousel-margin-overlay-1080x1440.png', CW, CH);
await pdf('/src/d2.html', 'D-2-carousel-template/carousel-template-guide.pdf');
await pdf('/src/d3.html', 'D-3-Instagram-Setup-Checklist.pdf');
await browser.close(); server.close();
console.log('D-1, D-2, D-3 rendered to', dist);
