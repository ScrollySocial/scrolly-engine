// Builds storyboard.html (the visual review sheet) from real stills of the take + the planned graphics, drawn in the
// real fonts and colors. Static: no motion. Cells are 9:16; sizes in cqw so 1cqw = 10.8px of the 1080px frame.
// v2 type system (after Mercedes's v1 notes): bold condensed sans for statements, emphasis = marker-highlight swipe
// (never italic colored words), handwritten notes + drawn arrows for asides, real-looking UI; graphics sit AROUND her
// body (above her head first), never over her face.
// Usage: node sketch/build-storyboard.mjs v2
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const V = process.argv[2] || 'v2';
const C = { cream: '#F6EEE5', cream2: '#FFF4DC', peach: '#FFC9A8', ink: '#161210', orange: '#E05A33', blush: '#F8DCE5', mist: '#E7EEF5' };
const S = (f) => `sketch/${f}`;
const SPARK = (x, y, s, c = C.cream2, r = 0) => `<svg class="abs" style="left:${x}cqw;top:${y}cqw;width:${s}cqw;transform:rotate(${r}deg)" viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="${c}"/></svg>`;
// hand-drawn arrow, curving, pointing at (tip) from a label
const ARROW = (x, y, w, r = 0, flip = false, c = C.cream2) => `<svg class="abs" style="left:${x}cqw;top:${y}cqw;width:${w}cqw;transform:rotate(${r}deg) scaleX(${flip ? -1 : 1})" viewBox="0 0 120 90"><path d="M8 12 C40 4 86 18 98 64" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><path d="M80 52 L99 70 L110 46" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// hand-drawn ellipse around something
const RING = (x, y, w, h, c = C.orange) => `<svg class="abs" style="left:${x}cqw;top:${y}cqw;width:${w}cqw;height:${h}cqw" viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M18 52 C14 18 70 6 112 8 C170 11 196 34 190 58 C184 86 120 96 76 92 C34 88 6 70 22 40" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/></svg>`;

const bg = (f, extra = '') => `<img class="bg" src="${S(f)}" style="${extra}">`;
const fadeTop = (h = 40) => `<div class="fade-top" style="background:linear-gradient(180deg,rgba(0,0,0,.6),rgba(0,0,0,.25) ${h * 0.6}%,rgba(0,0,0,0) ${h}%)"></div>`;
// big statement: condensed sans, white; <m>word</m> gets a marker swipe
const big = (html, top, size = 11, color = '#fff') => `<div class="big" style="top:${top}cqw;font-size:${size}cqw;color:${color}">${html.replace(/<m>(.*?)<\/m>/g, '<span class="mk">$1</span>')}</div>`;
const hand = (t, x, y, size = 7, r = -4, c = C.cream2) => `<div class="hand" style="left:${x}cqw;top:${y}cqw;font-size:${size}cqw;transform:rotate(${r}deg);color:${c}">${t}</div>`;
// manila folder handed over: tab with a handwritten label
const folder = (t, x, y, r) => `<div class="folder" style="left:${x}cqw;top:${y}cqw;transform:rotate(${r}deg)"><div class="f-tab">${t}</div><div class="f-body"><i></i><i></i><i></i></div></div>`;
const cap = (t, top = 128) => `<div class="cap" style="top:${top}cqw">${t}</div>`;

// real-looking chat UI (neutral, app-like)
const chat = (top, items) => `<div class="chat" style="top:${top}cqw">${items.map(([who, t]) => who === 'chip' ? `<div class="chip">📄 ${t}</div>` : `<div class="msg ${who}">${t}</div>`).join('')}</div>`;
// markdown file being edited: [gutter, text, kind] kind: '' | 'add' | 'h' | 'no'
const md = (top, file, lines, extra = '') => `<div class="md" style="top:${top}cqw;${extra}"><div class="md-bar"><i></i><i></i><i></i><span>${file}</span></div><div class="md-body">${lines.map(([g, t, k = '']) => `<div class="ln ${k}"><b>${g}</b><span>${t}</span></div>`).join('')}</div></div>`;

const frames = [
  { n: 1, name: 'Hook', t: '0:00', vo: 'Have you ever asked AI to write something for your business?', cue: 'music A starts · pop',
    html: `${bg('f01.jpg')}${fadeTop(48)}${big('Ever asked <m>AI</m> to write for you?', 6, 10.5)}${chat(29, [['me', 'write a caption for my candle shop']])}${cap('Have you ever asked AI to write something')}` },
  { n: 2, name: 'The bad caption', t: '0:03', vo: 'Read what it gave you and thought, I would literally never write that.', cue: '"nope" buzz · circle draws on',
    html: `${bg('f02.jpg')}${fadeTop(50)}${chat('6cqw;left:13cqw;right:13cqw;top:6', [['ai', 'This isn’t just a candle. It’s an <u>experience</u>. ✨🔥🚀 Elevate your space today!!']])}${RING(1, 0, 98, 30)}${hand('nope.', 66, 31, 11, -8, C.orange)}${ARROW(46, 27, 18, 165, false, C.orange)}${cap('I would literally never write that')}` },
  { n: 3, name: 'Fine, but not you', t: '0:07', vo: '...the grammar is fine, and the information’s fine, it just doesn’t sound like you.', cue: 'tick · tick · buzz',
    html: `${bg('f03.jpg')}${fadeTop(50)}<div class="paper" style="top:6cqw"><div>grammar <span class="tick">✓</span></div><div>information <span class="tick">✓</span></div><div>sounds like you <span class="tick x">✗</span></div></div>${cap('it just doesn’t sound like you')}` },
  { n: 4, name: 'Held: it doesn’t know you', t: '0:15', vo: 'That’s because AI doesn’t automatically know your personality.', cue: 'music dips · soft whoosh',
    html: `<div class="fill" style="background:${C.blush}"></div>${big('doesn’t automatically know your <m>personality</m>', 7, 15.5, C.ink)}<img class="bg" src="${S('f04-cut.png')}">` },
  { n: 5, name: 'Imagine a new hire', t: '0:20', vo: 'Think about it, if you hired someone to write all your social media content...', cue: 'whip whoosh · sticker slap',
    html: `${bg('f05.jpg', 'transform:scale(1.07)')}<div class="badge" style="left:47cqw;top:8cqw"><div class="b-top">HELLO<small>my job is</small></div><div class="b-name">your social media</div></div>${cap('if you hired someone to write your posts')}` },
  { n: 6, name: 'Examples, likes, dislikes', t: '0:27', vo: 'You would show them examples of your writing, tell them what you like, what you don’t like,', cue: 'paper slide × 3 (one per word)',
    html: `${bg('f06.jpg', 'transform:scale(1.07)')}${fadeTop(50)}${folder('examples', 4, 12, -7)}${folder('likes ♥', 35, 7, 1)}${folder('dislikes ✗', 66, 13, 7)}${cap('what you like, what you don’t like', 150)}` },
  { n: 7, name: 'They’d study your feed', t: '0:34', vo: '...look at your feed and see what’s your style, what do your captions look like.', cue: 'three snaps',
    html: `${bg('f07.jpg')}${fadeTop(44)}<img class="post" src="${S('feed1.jpg')}" style="left:4cqw;top:7cqw;transform:rotate(-7deg)"><img class="post" src="${S('feed2.jpg')}" style="left:37cqw;top:4cqw;transform:rotate(2deg)"><img class="post" src="${S('feed3.jpg')}" style="left:69cqw;top:8cqw;transform:rotate(8deg)">${hand('your style', 6, 46, 7, -5)}${hand('your captions', 60, 46, 7, 4)}${cap('what do your captions look like')}` },
  { n: 8, name: 'AI gets one sentence', t: '0:39', vo: 'But for some reason, we just expect AI to figure all of that out from a sentence or two in a prompt.', cue: 'paper rip · typing · music A resolves',
    html: `${bg('f08.jpg', 'transform:scale(1.14);transform-origin:50% 45%')}${fadeTop(48)}<div class="receipt" style="left:3cqw;top:5cqw"><b>the new hire got:</b><br>examples<br>likes<br>dislikes<br>your feed<br>your style<br>your captions<br>...</div><div class="prompt" style="left:40cqw;top:30cqw"><span>write a caption</span><i>↑</i></div>${hand('AI got:', 42, 16, 8, -4)}${cap('a sentence or two in a prompt')}` },
  { n: 9, name: 'The fix: a voice file', t: '0:46', vo: 'So one of the things I recommend to fix this is to create your own voice file,', cue: 'music B starts · bass hit',
    html: `${bg('f09.jpg', 'filter:brightness(.62)')}${big('VOICE<br>FILE', 8, 30, C.cream2)}<img class="bg" src="${S('f09-cut.png')}">${SPARK(84, 10, 8)}` },
  { n: 10, name: 'Writing the voice file', t: '0:51', vo: '...a document that explains how you talk, what you like, what you dislike,', cue: 'keyboard typing',
    html: `${bg('f10.jpg')}${fadeTop(52)}${md(5, 'voice.md', [['1', '# My voice', 'h'], ['2', ''], ['3', '## How I talk', 'h'], ['+', 'warm, clear, a little funny', 'add'], ['+', 'short sentences, real examples', 'add'], ['6', '## What I like', 'h'], ['+', 'specific details, plain words', 'add']])}${cap('how you talk, what you like, what you dislike')}` },
  { n: 11, name: 'Real examples', t: '0:58', vo: 'and it gives your AI real examples of things that you’ve written.', cue: 'paste · paste',
    html: `${bg('f11.jpg')}${fadeTop(52)}${md(5, 'voice.md', [['9', '## Examples', 'h'], ['+', '> New fall scents just landed.', 'add'], ['+', '> Cozy, small batch, gone fast.', 'add'], ['+', '> Packing orders today with a', 'add'], ['+', '> very bossy cat supervising.', 'add']])}${cap('real examples of things you’ve written')}` },
  { n: 12, name: 'Words you’d never use', t: '1:02', vo: 'You can also include a list of words or phrases that you would absolutely never use.', cue: 'error blip × 4',
    html: `${bg('f12.jpg')}${fadeTop(52)}${md(5, 'voice.md', [['15', '## Never say', 'h'], ['✗', 'It’s not X, it’s Y', 'no'], ['✗', 'Let’s dive in', 'no'], ['✗', 'Buckle up', 'no'], ['✗', '🚀🚀🚀!!!', 'no']])}${cap('words you would absolutely never use')}` },
  { n: 13, name: 'Now it sounds like you', t: '1:06', vo: 'And AI can reference that every time that it’s writing information for you.', cue: 'send whoosh · check chime',
    html: `${bg('f13.jpg', 'transform:scale(1.07)')}${fadeTop(54)}${chat(4, [['me', 'write a caption for my candle shop'], ['chip', 'voice.md'], ['ai', 'New fall scents are in. Soft, cozy, made in small batches. Come smell them before they sell out.']])}${hand('sounds like me', 50, 47, 8, -5, C.peach)}${ARROW(28, 44, 18, 200, false, C.peach)}` },
  { n: 14, name: 'It’s in the Business Brain', t: '1:11', vo: 'This is something that I’ve included in my Scrolly Business Brain...', cue: 'music B lifts · scroll · click',
    html: `<img class="bg" src="${S('brain.png')}" style="object-position:50% 18%;filter:saturate(.95)"><div class="fill" style="background:rgba(22,18,16,.12)"></div><img class="bg" src="${S('f14-cut.png')}"><svg class="abs" style="left:66cqw;top:62cqw;width:7cqw" viewBox="0 0 24 24"><path d="M4 2 L4 20 L9 15 L13 23 L16 21.5 L12 14 L19 14 Z" fill="#fff" stroke="${C.ink}" stroke-width="1.5"/></svg>${cap('my Scrolly Business Brain', 150)}` },
  { n: 15, name: 'CTA', t: '1:19', vo: '...check out the Scrolly Business Brain on my website.', cue: 'music C button · chime',
    html: `${bg('f15.jpg', 'transform:scale(1.07)')}${fadeTop(50)}${big('Scrolly<br><m>Business Brain</m>', 6, 11)}<div class="url" style="top:31cqw"><span class="lock">🔒</span>scrollyseo.com</div>${hand('on my website', 56, 44, 7.5, -4)}${ARROW(34, 41, 18, 190)}` },
];

const cell = (f) => `<figure id="frame-${String(f.n).padStart(2, '0')}"><div class="frame">${f.html}</div>
<figcaption><div class="lab"><b>${String(f.n).padStart(2, '0')} · ${f.name}</b><span>${f.t}</span></div><div class="vo">“${f.vo}”</div><div class="cue">♪ ${f.cue}</div></figcaption></figure>`;

writeFileSync(path.join(HERE, '..', 'storyboard.html'), `<!doctype html><html><head><meta charset="utf-8"><title>Give your AI a voice file · storyboard ${V}</title>
<style>
@font-face{font-family:Fig;src:url(assets/fonts/figtree.woff2) format('woff2');font-weight:300 900}
@font-face{font-family:Bri;src:url(assets/fonts/bricolage-800.woff2) format('woff2');font-weight:800;font-stretch:75% 100%}
@font-face{font-family:Hand;src:url(assets/fonts/covered-by-your-grace.woff2) format('woff2')}
*{box-sizing:border-box;margin:0;padding:0}
body{background:${C.cream};font-family:Fig,sans-serif;color:${C.ink};padding:28px 28px 40px;width:1800px}
header{display:flex;align-items:baseline;gap:18px;margin-bottom:22px}
h1{font:800 40px Bri;font-stretch:80%}header p{font-size:17px;color:#5a4f47}.tag{margin-left:auto;font-size:15px;background:${C.ink};color:${C.cream};padding:6px 12px;border-radius:99px}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:22px}
figure{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.07)}
.frame{position:relative;aspect-ratio:9/16;container-type:inline-size;overflow:hidden;background:#222}
.bg,.fill{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.abs{position:absolute}
.fade-top{position:absolute;inset:0;z-index:1}
.frame>*:not(.bg):not(.fill):not(.fade-top){z-index:2}
.frame>.bg:last-of-type[src*=cut]{z-index:2}
.big{position:absolute;left:5cqw;right:5cqw;text-align:center;font-family:Bri;font-weight:800;font-stretch:78%;line-height:.9;letter-spacing:-.01em;text-shadow:0 .4cqw 2cqw rgba(0,0,0,.35)}
.mk{position:relative;z-index:0;color:${C.ink};text-shadow:none;padding:0 .12em}
.mk::before{content:'';position:absolute;z-index:-1;left:-.04em;right:-.04em;top:.1em;bottom:.02em;background:${C.peach};transform:skew(-6deg) rotate(-1.5deg);border-radius:.08em}
.hand{position:absolute;font-family:Hand;line-height:1;text-shadow:0 0 1.1cqw rgba(0,0,0,.6),0 .3cqw 1.6cqw rgba(0,0,0,.55);white-space:nowrap}
.cap{position:absolute;left:6cqw;right:6cqw;text-align:center;font:800 5.4cqw/1.15 Fig;color:#fff;text-shadow:0 0 .6cqw rgba(0,0,0,.8),0 .5cqw 1.8cqw rgba(0,0,0,.6)}
.chat{position:absolute;left:6cqw;right:6cqw;display:flex;flex-direction:column;gap:1.6cqw}
.msg{font:500 4cqw/1.3 -apple-system,'Segoe UI',Fig,sans-serif;padding:2.4cqw 3.2cqw;border-radius:4.4cqw;max-width:84%;box-shadow:0 .8cqw 2.4cqw rgba(0,0,0,.25)}
.msg.me{align-self:flex-end;background:#2f2f2f;color:#fff;border-bottom-right-radius:1.2cqw}
.msg.ai{align-self:flex-start;background:#fff;color:#1c1c1c;border-bottom-left-radius:1.2cqw}.msg u{text-decoration:none}
.chip{align-self:flex-end;font:600 3.2cqw -apple-system,'Segoe UI',Fig;background:#fff;color:#333;padding:1.2cqw 2.4cqw;border-radius:2cqw;border:.3cqw solid #ddd}
.paper{position:absolute;left:14cqw;right:14cqw;background:#fffdf7;background-image:repeating-linear-gradient(180deg,transparent 0 8.4cqw,#cfe0ee 8.4cqw 8.7cqw);padding:2.6cqw 5cqw 3cqw;font:400 7.6cqw/8.7cqw Hand;color:#2b2724;transform:rotate(-2deg);box-shadow:0 1.4cqw 3.6cqw rgba(0,0,0,.35)}
.paper div{display:flex;justify-content:space-between}.tick{color:#2e7d4f;font-family:Fig;font-weight:800}.tick.x{color:${C.orange}}
.badge{position:absolute;width:46cqw;border-radius:2.4cqw;overflow:hidden;transform:rotate(6deg);box-shadow:0 1.4cqw 3.6cqw rgba(0,0,0,.4);background:#fff}
.b-top{background:${C.orange};color:#fff;text-align:center;font:800 9cqw/1 Fig;padding:2cqw 0 1.4cqw}.b-top small{display:block;font:600 3.4cqw Fig;margin-top:.6cqw}
.b-name{font:400 7.4cqw/1 Hand;color:${C.ink};text-align:center;padding:4cqw 2cqw 4.6cqw}
.post{position:absolute;width:27cqw;border-radius:1cqw;border:.8cqw solid #fff;box-shadow:0 1.4cqw 3cqw rgba(0,0,0,.4)}
.receipt{position:absolute;width:30cqw;background:#fffdf7;padding:3cqw 3.2cqw 6cqw;font:400 5.4cqw/1.12 Hand;color:#2b2724;transform:rotate(-3deg);box-shadow:0 1.4cqw 3cqw rgba(0,0,0,.35);clip-path:polygon(0 0,100% 0,100% 96%,90% 100%,80% 96%,70% 100%,60% 96%,50% 100%,40% 96%,30% 100%,20% 96%,10% 100%,0 96%)}
.receipt b{font-weight:400;color:${C.orange}}
.prompt{position:absolute;width:56cqw;display:flex;align-items:center;justify-content:space-between;background:#2f2f2f;color:#fff;border-radius:99px;padding:2.4cqw 2.4cqw 2.4cqw 4cqw;font:500 4.4cqw -apple-system,'Segoe UI',Fig;box-shadow:0 1cqw 3cqw rgba(0,0,0,.4)}
.prompt i{font-style:normal;width:6.4cqw;height:6.4cqw;border-radius:50%;background:#fff;color:#2f2f2f;display:grid;place-items:center;font-weight:800}
.md{position:absolute;left:5cqw;right:5cqw;background:#1f1d1b;border-radius:2cqw;overflow:hidden;box-shadow:0 1.6cqw 4cqw rgba(0,0,0,.45);font:500 3.7cqw/1.55 Consolas,'Cascadia Mono',monospace}
.md-bar{display:flex;align-items:center;gap:1.2cqw;padding:1.6cqw 2.4cqw;background:#2b2826}.md-bar i{width:2cqw;height:2cqw;border-radius:50%;background:#5a5450}.md-bar span{margin-left:1.6cqw;font:600 3.2cqw Fig;color:#cfc6bd}
.md-body{padding:1.8cqw 0 2.4cqw}.ln{display:flex;gap:3cqw;padding:0 3cqw;color:#e9e1d8}.ln b{width:4cqw;text-align:right;color:#6f6862;font-weight:400}
.ln.h span{color:${C.peach};font-weight:700}.ln.add{background:rgba(110,190,130,.16)}.ln.add b{color:#7fcf93}.ln.no{background:rgba(224,90,51,.16)}.ln.no b{color:${C.orange}}
.url{position:absolute;left:14cqw;right:14cqw;display:flex;align-items:center;gap:2cqw;background:#fff;border-radius:99px;padding:2.4cqw 4cqw;font:600 5cqw -apple-system,'Segoe UI',Fig;color:#1c1c1c;box-shadow:0 1cqw 3cqw rgba(0,0,0,.35)}.lock{font-size:3.6cqw}
.folder{position:absolute;width:30cqw;filter:drop-shadow(0 1.4cqw 2.4cqw rgba(0,0,0,.4))}
.f-tab{display:inline-block;background:#E9C98E;font:400 6.4cqw/1 Hand;color:#2b2724;padding:1.6cqw 3cqw 1cqw 2.4cqw;border-radius:1.6cqw 3cqw 0 0;white-space:nowrap}
.f-body{background:#E9C98E;height:20cqw;border-radius:0 1.6cqw 1.6cqw 1.6cqw;position:relative;overflow:hidden;background-image:linear-gradient(180deg,#F2D7A3,#E2BE80)}
.f-body i{position:absolute;left:12%;right:12%;height:1.4cqw;background:rgba(255,253,247,.9);border-radius:.4cqw}.f-body i:nth-child(1){top:-0.6cqw;height:4cqw;background:#fffdf7}.f-body i:nth-child(2){top:7cqw;opacity:.35;background:#8a6a3a;height:.5cqw}.f-body i:nth-child(3){top:10cqw;opacity:.35;background:#8a6a3a;height:.5cqw;right:30%}
figcaption{padding:10px 12px 12px;font-size:14px;line-height:1.35}
.lab{display:flex;justify-content:space-between;margin-bottom:4px;font-size:14px}.lab span{color:#8a7d72}
.vo{color:#3d342e;margin-bottom:4px}.cue{color:#a0623f;font-size:13px}
</style></head><body>
<header><h1>Give your AI a voice file</h1><p>Studio Reel · Business Brain · storyboard sketches (static: no motion yet)</p><span class="tag">${V} · 1080×1920 · 85.7s · 15 frames</span></header>
<div class="g">${frames.map(cell).join('\n')}</div></body></html>`);
console.log('storyboard.html written');
