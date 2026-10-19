// Local HTML previews of the two Reel Template Pack sales-page drafts, laid out in the scrollyseo.com v3 style.
// Never published. Copy source: halloween-sales-draft.md and physical-sales-draft.md (keep them in step).
// Run: node build-previews.mjs  ->  halloween-sales-preview.html, physical-sales-preview.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const v3 = fs.readFileSync(path.join(here, '../../../website/scrolly-site/chrome/v3.css'), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// [PLACEHOLDER] text gets a highlight so it can't be missed in review
const ph = (s) => esc(s).replace(/\[(?!brackets\])([^\]]+)\]/g, '<mark class="ph">[$1]</mark>');

const CSS = `
.draft{background:#090909;color:#fff;padding:20px var(--s3-gut);font:var(--s3-fs-fine)/1.5 var(--s3-sans)}
.draft b{color:var(--s3-orange)}
.draft details{margin-top:8px}
.draft summary{cursor:pointer;font-weight:700}
.draft ul{margin:10px 0 0;padding-left:1.2em}
.draft li+li{margin-top:4px}
mark.ph{background:#ffd9c9;color:var(--s3-ink);padding:0 4px;border-radius:3px}
.s3-dark mark.ph{background:#5a2412;color:#fff}
.s3-btn mark.ph{background:#fff;color:#000}
.hero{padding-top:clamp(40px,5vw,88px)}
.hero h1{margin-bottom:28px}
.hero .s3-lede{margin-bottom:28px}
.hero .buy{display:flex;flex-wrap:wrap;align-items:center;gap:16px 24px;margin-bottom:16px}
.hero .amt{font:400 var(--s3-fs-title)/1.1 var(--s3-serif)}
.reels{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:clamp(10px,1.4vw,20px);align-items:start}
.reels .vid:nth-child(even){margin-top:clamp(24px,4vw,64px)}
.vid{aspect-ratio:9/16;background:#e6dfd3;border-radius:14px;display:flex;align-items:flex-end;padding:14px;font:var(--s3-fs-label)/1.35 var(--s3-sans);color:#3d3a36}
.vid b{display:block;font:400 var(--s3-fs-body)/1.2 var(--s3-serif);color:var(--s3-ink);margin-top:4px}
.tpls{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr));gap:56px clamp(20px,3vw,48px);margin-top:48px}
.tpl .vid{margin-bottom:20px}
.tpl h3{font:400 var(--s3-fs-title)/1.1 var(--s3-serif)!important;margin-bottom:10px}
.tpl p+p{margin-top:10px}
.tpl .meta{color:var(--s3-muted);font-size:var(--s3-fs-fine)}
.incl{margin-top:56px;max-width:46em}
.incl h3{margin-bottom:16px}
.incl ul,.steps{padding-left:1.3em}
.incl li+li,.steps li+li{margin-top:10px}
.steps{max-width:46em;margin-top:32px;font-size:var(--s3-fs-body)}
.steps b{font-weight:700}
.who p+p{margin-top:16px}
.s3-faq{margin-top:32px}
.cta{text-align:center}
.cta h2{margin-bottom:24px}
.cta .s3-btn{margin:8px 0 18px}
.cta p+p{margin-top:12px}
.notes{border-top:1px solid var(--s3-line)}
.notes h2{margin-bottom:20px}
.notes h3{margin:40px 0 14px}
.notes table{width:100%;border-collapse:collapse;font-size:var(--s3-fs-fine)}
.notes th,.notes td{text-align:left;vertical-align:top;padding:10px 12px 10px 0;border-bottom:1px solid var(--s3-line)}
.notes .listing{font:var(--s3-fs-body-serif)/1.55 var(--s3-serif);max-width:40em}
@media(max-width:900px){.reels{--n:2!important}.reels .vid:nth-child(n+5){display:none}}
@media(max-width:700px){.notes table,.notes tbody,.notes tr,.notes td,.notes th{display:block}.notes thead{display:none}.notes td{border:0;padding:4px 0}.notes tr{border-bottom:1px solid var(--s3-line);padding:10px 0}}
`;

function page(d) {
  const reels = d.templates.slice(0, 4).map((t) => `<div class="vid"><span>Demo to film<b>${esc(t.name)}</b></span></div>`).join('');
  const tpls = d.templates.map((t) => `<div class="tpl"><div class="vid"><span>Demo to film<b>${esc(t.name)}</b></span></div>
    <h3>${esc(t.name)}</h3><p>${ph(t.job)}</p><p class="meta">You film ${esc(t.film)}. About ${t.len} seconds.</p></div>`).join('');
  const faq = d.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div>${ph(a)}</div></details>`).join('');
  const steps = d.steps.map(([b, t]) => `<li><b>${esc(b)}</b> ${esc(t)}</li>`).join('');
  const demo = d.demo.map((r) => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.title)}</title><style>${v3}</style><style>${CSS}</style></head><body style="margin:0;background:#f7f3ec">
<div class="draft"><b>DRAFT PREVIEW.</b> Local file only, not published. Highlighted [brackets] are open decisions. The site's global header and footer are left out.
<details><summary>Open decisions (${d.decisions.length})</summary><ul>${d.decisions.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details></div>
<div class="s3"><div id="main">
<section class="s3-sec hero"><div class="s3-wrap s3-split">
  <div><h1 class="s3-display or">${esc(d.headline)}</h1>
  <p class="s3-lede">${esc(d.sub)}</p>
  <div class="buy"><span class="amt">${ph('[PRICE]')}</span><a class="s3-btn" href="#buy">${esc(d.button)}</a></div>
  <p class="s3-fine">${ph(d.priceLine)}</p></div>
  <div class="reels" style="--n:${Math.min(d.templates.length, 4)}">${reels}</div>
</div></section>
<section class="s3-sec"><div class="s3-wrap">
  <h2 class="s3-h2">${esc(d.getTitle)}</h2>
  <p class="s3-lede" style="margin-top:20px">${esc(d.getLede)}</p>
  <div class="tpls">${tpls}</div>
  <div class="incl"><h3 class="s3-h3">Every template comes with</h3><ul>
    <li>The CapCut project, with ${esc(d.projectNote)}</li>
    <li>A Windows installer that puts the template on CapCut's home screen with your clips already in it</li>
    <li>A recipe card: every clip, how long it is and what to film</li>
    <li>A one-page How to use guide</li></ul>
    ${d.formatNote ? `<p style="margin-top:20px">${ph(d.formatNote)}</p>` : ''}</div>
</div></section>
<section class="s3-sec"><div class="s3-wrap"><h2 class="s3-h2">How it works</h2><ol class="steps">${steps}</ol></div></section>
<section class="s3-sec"><div class="s3-wrap s3-split who"><h2 class="s3-h2">Who it's for</h2>
  <div><p class="s3-lede">${esc(d.who)}</p><p>You'll need CapCut for computer on a Windows PC. Mac isn't supported yet.</p></div></div></section>
<section class="s3-sec"><div class="s3-read"><h2 class="s3-h2">Questions</h2><div class="s3-faq">${faq}</div></div></section>
<section class="s3-sec s3-dark cta" id="buy"><div class="s3-read">
  <h2 class="s3-h2 or">${esc(d.ctaHead)}</h2>
  <a class="s3-btn" href="#buy">${esc(d.button)}, ${ph('[PRICE]')}</a>
  <p class="s3-fine">${ph('[LAUNCH FORMAT line].')} Windows only for now.</p>
  <p class="s3-fine">${ph('[REEL EDITOR UPSELL: one line once it has a name, link and launch date]')}</p>
</div></section>
<section class="s3-sec notes"><div class="s3-wrap">
  <h2 class="s3-h2">Review notes (not part of the page)</h2>
  <h3 class="s3-h3">Other headline options</h3><ul class="steps" style="margin-top:0">${d.headlines.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
  <h3 class="s3-h3">Listing description</h3><p class="listing">${esc(d.listing)}</p>
  <h3 class="s3-h3">Demo footage to film (your own product only)</h3>
  <p style="max-width:46em;margin-bottom:16px">${esc(d.demoNote)}</p>
  <table><thead><tr><th>Template</th><th>Clips to film</th><th>Real material it needs</th></tr></thead><tbody>${demo}</tbody></table>
</div></section>
</div></div></body></html>`;
}

const STEPS = (extra) => [
  ['Film your clips.', `Hold your phone upright${extra} and start each clip right on the action. The recipe card says what to film and for how long.`],
  ['Drop them in.', 'Unzip the template and put your clips in the folder "1 Put your clips here", named 1, 2, 3 in the order on the card.'],
  ['Double-click the installer.', '"2 Double-click to install" copies the template into CapCut under a new name and adds your clips. It never touches your other projects.'],
  ['Open CapCut.', 'The template is on the home screen. Double-click each text box, type over the [brackets], and export at 1080p.'],
  ['Add a sound in Instagram', 'and post.'],
];
const FAQ = (fonts, extra = []) => [
  ['Do I need CapCut on a computer?', 'Yes. The templates open in CapCut for computer (the free download). Install it and open it once before you run the installer.'],
  ['Does it work on a Mac?', 'Not yet. The installer is Windows only for now. [MAC: waitlist link or date, if you decide on one]'],
  ['Can I use it on my phone?', '[PHONE DECISION: with the phone kit in the zip, "rebuild each template in the CapCut phone app with the shot guide video and the artwork files"; without it, "the full template needs CapCut on a Windows computer; you can film everything on your phone"]'],
  ['Is music included?', "No sound files are included, so your Reel never gets muted for a song you don't have the rights to. Each template suggests a sound [SOUND PICKS]. Add it in Instagram after you upload: on a business account, Instagram only shows sounds cleared for business use."],
  ['Do I need to install any fonts?', fonts],
  ['How do I change the words?', 'Double-click a text box in CapCut and type over the [brackets]. Keep it to a few words so people can read it in time.'],
  ...extra,
  ['Windows says it protected my PC. Is that normal?', "Yes, Windows shows this for installers it hasn't seen before. Choose More info, then Run anyway."],
  ['What if I want a different clip in one shot?', 'Right-click the clip on CapCut\'s timeline, choose Replace, and pick another.'],
];
const DEMO_NOTE = "One finished demo Reel per template, made from your own clips run through the real installer. Never the after.mp4 previews (they show other brands' products). Real words only: where you have no real material yet, leave the template's [brackets] showing. Also film a short screen recording of the install for the page.";

const halloween = {
  file: 'halloween-sales-preview.html',
  title: 'Halloween Reels draft',
  headline: 'Halloween Reels with a selling job',
  headlines: ['Cute Halloween Reels for your shop, ready for your clips', 'Four Halloween Reels. Your clips, your words, posted before the 31st.', 'Bats, webs and a blood moon, all working for your sales', 'Spooky-cute Reels for your October sale'],
  sub: 'Film a few clips on your phone, drop them in a folder, and each template opens in CapCut with your clips already in place.',
  button: 'Get the Halloween pack',
  priceLine: '4 CapCut templates. [LAUNCH FORMAT line]. Windows only for now.',
  getTitle: 'Four Reels, four jobs',
  getLede: 'Each template is a whole Reel with a business job and an ending that tells people where to buy. Cute and playful.',
  projectNote: 'real photographed props and the playful layer (washi tape, sticker edges, handwritten words)',
  formatNote: '',
  templates: [
    { name: 'Once in a blood moon', job: 'Open a rare, once-a-year sale. A full moon turns blood red, becomes your video, and the deal arrives with bats and a haunted house.', film: '3 clips: your product, you or your shop, your product again', len: 14 },
    { name: 'Caught in our web', job: "Show what's included or why people love it. A friendly spider drops in, the web forms, and each point gets caught in it.", film: '5 clips: your product held up, then four points', len: 15 },
    { name: "Things I'm batty about", job: 'Share your favourites: best-sellers, a gift guide, the tools you use. Real cute bats carry each one in.', film: '4 clips: an opening, then three favourites', len: 15 },
    { name: 'Trick or treat', job: 'Fix a common mistake, then make your offer. Door 1 opens on the trick, door 2 on the treat.', film: '3 clips: the mistake, your product, the proof', len: 17.5 },
  ],
  steps: STEPS(''),
  who: 'Online business owners and creators who want a Halloween Reel that sells something: a product, a sale, a freebie or an offer. It works for physical products, digital products and services, since every clip is your own footage.',
  faq: FAQ('No. The big Halloween lettering is part of the artwork, and the words you edit use Arial, which comes with Windows. [h6: confirm after the font test]'),
  ctaHead: 'Post your Halloween Reel before the 31st',
  listing: "Four cute Halloween Reel templates for CapCut on Windows, each with a selling job: open a once-a-year sale, show what's included, share your favourites, or turn a common mistake into your offer. Film 3 to 5 clips on your phone, drop them in a folder and double-click the installer: the template opens in CapCut with your clips in place. Type your words over the brackets and export. Includes a recipe card and a one-page guide for each template. Each template suggests a sound to add in Instagram (no sound files included). Windows only for now; Mac isn't supported yet.",
  decisions: [
    'Price.', 'Launch format: sell the 4 finished templates now, or pre-order with h1 to follow.',
    'h1 Now you see it: on hold for smoke.mp4; the page lists 4.', 'Bonus: none planned; add only if you choose one.',
    'Phone buyers: the zips hold no phone kit. Add it, or sell as computer-only.', 'Mac: waitlist, date, or nothing.',
    'Sound picks: none chosen for Halloween yet.', 'Reel Editor upsell: no name, link or launch yet.',
    'Before live: check h2 and h5 in CapCut, the highlight boxes, and the h6 font on a second computer (it points at your own CapCut cache).',
  ],
  demoNote: DEMO_NOTE,
  demo: [
    ['Once in a blood moon', 'Your product close up (4 s+), you or your workspace (5 s+), your product again (3 s+)', 'A real sale you will run, or the [brackets]'],
    ['Caught in our web', 'Your product held up (15 s+), then four things it includes or does (12, 10, 8, 6 s+)', 'Four real features'],
    ["Things I'm batty about", 'An opening shot (3 s+), then three favourite products or tools (4 s+ each)', 'Three real favourites'],
    ['Trick or treat', 'The trick: a common mistake acted out (5 s+), the treat: your product (6 s+), the proof: it working (6 s+)', 'A real mistake and a real offer'],
  ],
};

const physical = {
  file: 'physical-sales-preview.html',
  title: 'Product Reels draft',
  headline: 'Reels for the things you make, pack and ship',
  headlines: ['Your product, in a Reel people stop for', 'Film a few clips. Drop them in. Post a Reel that sells.', 'Collage Reels for physical products, ready for your clips', 'Seven Reels your product can star in this week'],
  sub: 'Real photographed props, playful collage and fast cuts. You film your product on your phone, and each template opens in CapCut with your clips already in place.',
  button: 'Get the pack',
  priceLine: '7 CapCut templates. [LAUNCH FORMAT line]. Windows only for now.',
  getTitle: 'Seven Reels, seven selling jobs',
  getLede: "Made for small businesses that sell physical products. Each one ends with your product's name and where to buy it.",
  projectNote: 'real photographed props, collage and motion already built',
  formatNote: '[LAUNCH FORMAT: for pre-order or early access, add "More templates are added to your download as they\'re finished, up to 25." Leave it out for Volume 1.]',
  templates: [
    { name: 'A real customer question', job: 'Answer the question you keep getting in DMs and reviews, by showing it.', film: '3 clips: the answer shown, more of the answer, your product in use', len: 24 },
    { name: "Who it's for", job: 'Call out your buyer so the right people see themselves in it.', film: '4 clips: you talking to camera, the everyday problem, your product, you again', len: 24 },
    { name: 'Three people to gift it to', job: 'A ready-made gift guide for your product.', film: '6 clips: wrapping a gift, your shop scrolling on screen, your product, three people it suits', len: 24 },
    { name: 'Your order just arrived', job: 'Show the unboxing your customer gets.', film: '4 clips: the doorstep, on its way, the unboxing, in use', len: 25 },
    { name: 'What buyers said', job: 'Put your real reviews on screen, word for word.', film: '3 clips: your product, in use, the ending', len: 22 },
    { name: 'Put it to the test', job: 'Prove a claim you already make (waterproof, sturdy, long-lasting) in one uncut take.', film: '4 clips: the setup, the test, the result, you at the end', len: 25 },
    { name: 'Every option in 10 seconds', job: 'Show every colour, scent, size or design.', film: '7 clips: six options, then your shop scrolling', len: 25 },
  ],
  steps: STEPS(', keep your product in the middle of the frame,'),
  who: 'Small business owners who sell physical products: makers, small-batch brands and anyone who packs and ships orders. If you can film your product on your phone, you can make these.',
  faq: FAQ('No. The words you edit use Montserrat, which comes inside each template, and the big lettering is part of the artwork.', [
    ['Can I use made-up reviews or results?', "Use real ones only. What buyers said is for real reviews, word for word, with the reviewer's name hidden unless they said yes. Put it to the test is for a claim you already make, shown uncut."],
  ]),
  ctaHead: 'Your next product Reel starts here',
  listing: "Seven Reel templates for CapCut on Windows, made for shops that sell physical products. Answer a customer question, show who it's for, make a gift guide, film the unboxing, share real reviews, prove a claim, or show every option. Film 3 to 7 clips on your phone, drop them in a folder and double-click the installer: the template opens in CapCut with your clips in place. Type your words over the brackets and export. Includes a recipe card and a one-page guide for each template. Each template suggests a sound to add in Instagram (no sound files included). Windows only for now; Mac isn't supported yet.",
  decisions: [
    'Price.', 'Launch format: Volume 1, or pre-order / early access with the rest of the 25 as free updates. The page promises nothing beyond 7 until you choose.',
    '01, 02, 03 are built but not zipped (older look): include them? The page then says 10.', 'Bonus: none planned; add only if you choose one.',
    'Phone buyers: the zips hold no phone kit. Add it, or sell as computer-only.', 'Mac: waitlist, date, or nothing.',
    'Sound picks: none for the 7 zipped templates yet.', 'Reel Editor upsell: no name, link or launch yet.',
    'Before live: the CapCut check of the highlight boxes, and Montserrat on a computer that never had it.',
  ],
  demoNote: DEMO_NOTE + ' Use one physical product of your own throughout, for example a Scrolly tee.',
  demo: [
    ['A real customer question', 'The answer, shown (7 s), more of the answer (4 s), in use (3 s)', 'A question a customer really asked'],
    ["Who it's for", 'You talking to camera (7 s), the everyday problem (3 s), your product (3 s), you again (4 s)', ''],
    ['Three people to gift it to', 'Wrapping it as a gift (4 s), your shop scrolling on screen (4 s), your product (4 s), three people it suits (10 s each)', 'Your shop page to record'],
    ['Your order just arrived', 'The package on a doorstep (6 s), on its way (3 s), the unboxing (7 s), in use (4 s)', 'A real shipped package'],
    ['What buyers said', 'Your product (10 s), in use (6 s), the ending (4 s)', 'Real reviews, word for word, with permission'],
    ['Put it to the test', 'The setup (4 s), the test in one uncut take (7 s), the result (5 s), you at the end (4 s)', 'A claim you already make'],
    ['Every option in 10 seconds', 'Six options, same framing (4 s each, option 4 for 10 s), your shop scrolling (3 s)', 'Six colours or designs of one product; skip this demo if you have fewer'],
  ],
};

for (const d of [halloween, physical]) {
  fs.writeFileSync(path.join(here, d.file), page(d));
  console.log('wrote', d.file);
}
