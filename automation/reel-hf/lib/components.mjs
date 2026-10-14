// Studio component library: real-looking objects and marks that sit AROUND her body (never over her face).
// Each component returns { html, anim } where anim is a list of timeline lines using the helpers in motion.mjs
// (pop, up, draw, swipe, words, typeLines). Pass `in` (seconds) to animate the entrance; leave it out for a static piece.
// Sizes are in cqw (1cqw = 10.8px on the 1080 canvas). First proven in 2026-10-13-bb-voice-file (storyboard v4).
//
// Catalog (slots → what it looks like):
//   fade(h)                      soft top darkening behind anything above her head
//   fill(color)                  full-frame panel (background swap, sits under a cut-out of her)
//   statement(id, text, …)       big condensed statement; <m>word</m> = peach marker swipe
//   hand(id, text, …)            handwritten aside
//   arrow / ring / spark         drawn arrow, drawn circle (goes AROUND text, never across it), sparkle sticker
//   chat(msgs, …)                chat thread: me / ai bubbles + attachment chip
//   paper(id, items, …)          lined-paper checklist with ✓ / ✗ ticks
//   badge(id, …)                 HELLO name badge
//   folder(id, label, …)         manila folder with a handwritten tab
//   post(id, src, …)             her real IG cover as a white-bordered print
//   receipt(id, title, lines, …) receipt that unrolls
//   prompt(id, text, …)          AI prompt bar that types
//   mdFile(id, file, lines, …)   a .md file being edited (lines type in; + added, ✗ banned)
//   scrollPage(id, src, …)       a full-page screenshot scrolling behind her (pair with a cut-out)
//   cursor(id, …)                mouse cursor that glides in and clicks
//   urlBar(id, text, …)          browser URL pill (end card)
//   ctaUi(id, ui, …)             end-card Instagram piece: follow button, comment bar, share row, saved toast, bio link

// Wrap <m>…</m> in the marker spans, then split into word spans for the word-by-word entrance (marker stays whole).
const marker = (html) => html.replace(/<m>(.*?)<\/m>/g, '<span class="mk"><span class="mkbg"></span><span class="mkt">$1</span></span>');
const splitWords = (inner) => inner.split(/(<span class="mk">.*?<\/span><\/span>)/).map((part) => part.startsWith('<span class="mk">') ? `<span class="w">${part}</span>` : part.split(/\s+/).filter(Boolean).map((w) => `<span class="w">${w}</span>`).join(' ')).join(' ');
const h = (html, anim = []) => ({ html, anim });

export function makeComponents(B) {
  const { C } = B;
  const K = {};

  K.fade = (hgt) => h(`<div class="fade" style="background:linear-gradient(180deg,rgba(0,0,0,.6),rgba(0,0,0,.25) ${hgt * 0.6}%,rgba(0,0,0,0) ${hgt}%)"></div>`);
  K.fill = (color) => h(`<div class="fill" style="background:${color}"></div>`);

  // enter: 'words' (word-by-word rise, default) | 'slam' (scales down into place) | false. swipe = time of the marker swipe.
  K.statement = (id, text, { top, size, color = '#fff', in: t, enter = 'words', swipe } = {}) => {
    const anim = [];
    if (t != null && enter === 'words') anim.push(`words('#${id}', ${t});`);
    if (t != null && enter === 'slam') anim.push(`tl.fromTo('#${id}', { scale: 1.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power4.out' }, ${t});`);
    if (swipe != null) anim.push(`swipe('#${id}', ${swipe});`);
    return h(`<div id="${id}" class="big" style="top:${top}cqw;font-size:${size}cqw;color:${color}">${splitWords(marker(text))}</div>`, anim);
  };

  K.hand = (id, text, { x, y, size = 7, r = -4, color = C.cream2, in: t, rise = 16 } = {}) =>
    h(`<div id="${id}" class="hand" style="left:${x}cqw;top:${y}cqw;font-size:${size}cqw;rotate:${r}deg;color:${color}">${text}</div>`, t != null ? [`up('#${id}', ${t}, ${rise});`] : []);

  K.spark = (id, { x, y, s, color = C.cream2, in: t } = {}) =>
    h(`<svg id="${id}" class="abs blk" style="left:${x}cqw;top:${y}cqw;width:${s}cqw;height:${s}cqw" viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="${color}"/></svg>`, t != null ? [`pop('#${id}', ${t});`] : []);

  K.arrow = (id, { x, y, w, r = 0, color = C.cream2, in: t, d = 0.35 } = {}) =>
    h(`<div id="${id}" class="abs blk" style="left:${x}cqw;top:${y}cqw;width:${w}cqw;height:${w * 0.75}cqw;rotate:${r}deg"><svg viewBox="0 0 120 90" style="width:100%;height:100%"><path class="draw" pathLength="1" d="M8 12 C40 4 86 18 98 64" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/><path class="draw" pathLength="1" d="M80 52 L99 70 L110 46" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`, t != null ? [`draw('#${id}', ${t}, ${d});`] : []);

  K.ring = (id, { x, y, w, h: hh, color = C.orange, in: t, d = 0.5 } = {}) =>
    h(`<svg id="${id}" class="abs blk" style="left:${x}cqw;top:${y}cqw;width:${w}cqw;height:${hh}cqw" viewBox="0 0 200 100" preserveAspectRatio="none"><path class="draw" pathLength="1" d="M18 52 C14 18 70 6 112 8 C170 11 196 34 190 58 C184 86 120 96 76 92 C34 88 6 70 22 40" fill="none" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/></svg>`, t != null ? [`draw('#${id}', ${t}, ${d});`] : []);

  // msgs: [{ id, kind: 'me'|'ai'|'chip', text, in, enter: 'pop'|'up', rise }]
  K.chat = (msgs, { top, left, right } = {}) => {
    const pos = `top:${top}cqw${left != null ? `;left:${left}cqw` : ''}${right != null ? `;right:${right}cqw` : ''}`;
    const html = `<div class="chat" style="${pos}">${msgs.map((m) => `<div id="${m.id}" class="${m.kind === 'chip' ? 'chip' : `msg ${m.kind}`}">${m.text}</div>`).join('')}</div>`;
    const anim = msgs.filter((m) => m.in != null).map((m) => (m.enter === 'up' ? `up('#${m.id}', ${m.in}, ${m.rise ?? 24});` : `pop('#${m.id}', ${m.in});`));
    return h(html, anim);
  };

  // items: [{ id, text, ok: true|false, in }]
  K.paper = (id, items, { top, in: t } = {}) => {
    const html = `<div id="${id}" class="paper" style="top:${top}cqw">${items.map((it) => `<div>${it.text} <span id="${it.id}" class="tick${it.ok ? '' : ' x'}">${it.ok ? '✓' : '✗'}</span></div>`).join('')}</div>`;
    const anim = [];
    if (t != null) anim.push(`tl.fromTo('#${id}', { y: -60, opacity: 0, rotation: 4 }, { y: 0, opacity: 1, rotation: -2, duration: 0.5, ease: B }, ${t});`);
    for (const it of items) if (it.in != null) anim.push(`pop('#${it.id}', ${it.in});`);
    return h(html, anim);
  };

  K.badge = (id, { x, y, top = 'HELLO', small = 'my job is', name, in: t } = {}) =>
    h(`<div id="${id}" class="badge" style="left:${x}cqw;top:${y}cqw"><div class="b-top">${top}<small>${small}</small></div><div class="b-name">${name}</div></div>`,
      t != null ? [`tl.fromTo('#${id}', { scale: 1.6, rotation: 22, opacity: 0 }, { scale: 1, rotation: 6, opacity: 1, duration: 0.35, ease: 'power4.out' }, ${t});`] : []);

  K.folder = (id, label, { x, y, r = 0, in: t } = {}) =>
    h(`<div id="${id}" class="folder" style="left:${x}cqw;top:${y}cqw;rotate:${r}deg"><div class="f-tab">${label}</div><div class="f-body"><i></i><i></i><i></i></div></div>`,
      t != null ? [`tl.fromTo('#${id}', { y: -260, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: B }, ${t});`] : []);

  K.post = (id, src, { x, y, r = 0, in: t } = {}) =>
    h(`<img id="${id}" class="post" src="${src}" style="left:${x}cqw;top:${y}cqw;rotate:${r}deg">`, t != null ? [`pop('#${id}', ${t}, 0);`] : []);

  K.receipt = (id, title, lines, { x, y, in: t } = {}) =>
    h(`<div id="${id}" class="receipt" style="left:${x}cqw;top:${y}cqw"><b>${title}</b><br>${lines.join('<br>')}</div>`,
      t != null ? [`tl.fromTo('#${id}', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power1.inOut' }, ${t});`] : []);

  // in = bar pops in; typeAt = the text types (15 steps over 1s)
  K.prompt = (id, text, { x, y, in: t, typeAt } = {}) => {
    const anim = [];
    if (t != null) anim.push(`pop('#${id}', ${t});`);
    if (typeAt != null) anim.push(`tl.fromTo('#${id} .ptxt', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: 'steps(15)' }, ${typeAt});`);
    return h(`<div id="${id}" class="prompt" style="left:${x}cqw;top:${y}cqw"><span class="ptxt">${text}</span><i>↑</i></div>`, anim);
  };

  // lines: [[gutter, text, kind]] with kind 'h' (heading) | 'add' (+ green) | 'no' (✗ orange) | ''.
  K.mdFile = (id, file, lines, { top, in: t, rise = 20, typeAt, gap = 0.7 } = {}) => {
    const body = lines.map(([g, txt, k = '']) => `<div class="ln ${k}"><b>${g}</b><span class="lt">${txt}</span></div>`).join('');
    const anim = [];
    if (t != null) anim.push(`up('#${id}', ${t}, ${rise});`);
    if (typeAt != null) anim.push(`typeLines('#${id}', ${typeAt}, ${gap});`);
    return h(`<div id="${id}" class="md" style="top:${top}cqw"><div class="md-bar"><i></i><i></i><i></i><span>${file}</span></div><div class="md-body">${body}</div></div>`, anim);
  };

  // A tall screenshot that scrolls up by `to` percent over `dur` seconds. Put a cut-out of her on top.
  K.scrollPage = (id, src, { in: t, dur, to = -38, tint = 0.12 } = {}) =>
    h(`<div class="brainwrap"><img id="${id}" class="brain" src="${src}" data-layout-allow-overflow></div><div class="fill" style="background:rgba(22,18,16,${tint})"></div>`,
      t != null ? [`tl.fromTo('#${id}', { yPercent: 0 }, { yPercent: ${to}, duration: ${dur}, ease: 'none' }, ${t});`] : []);

  // glides in over 0.8s ending at `click`, then clicks
  K.cursor = (id, { x, y, size = 7, click } = {}) =>
    h(`<svg id="${id}" class="abs blk" style="left:${x}cqw;top:${y}cqw;width:${size}cqw;height:${size}cqw" viewBox="0 0 24 24"><path d="M4 2 L4 20 L9 15 L13 23 L16 21.5 L12 14 L19 14 Z" fill="#fff" stroke="${C.ink}" stroke-width="1.5"/></svg>`,
      click != null ? [
        `tl.fromTo('#${id}', { x: 160, y: 220, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: E }, ${click - 0.8});`,
        `tl.fromTo('#${id}', { scale: 1 }, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1, immediateRender: false }, ${click + 0.5});`,
      ] : []);

  // Inline placeholder inside a chat bubble ("[PRICE]") with a drawn circle around it. Returns a STRING for chat text;
  // animate with K.markAt(id, t). (Added for 2026-10-13-bb-know-what-you-sell; promote after approval.)
  K.placeholder = (id, text, color = C.orange) => `<span id="${id}" class="ph">${text}<svg class="ph-ring" viewBox="0 0 200 100" preserveAspectRatio="none"><path class="draw" pathLength="1" d="M18 52 C14 18 70 6 112 8 C170 11 196 34 190 58 C184 86 120 96 76 92 C34 88 6 70 22 40" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/></svg></span>`;
  K.markAt = (id, t, d = 0.4) => h('', [`draw('#${id}', ${t}, ${d});`]);

  K.urlBar = (id, text, { top, in: t } = {}) =>
    h(`<div id="${id}" class="url" style="top:${top}cqw"><span class="lock">🔒</span>${text}</div>`, t != null ? [`pop('#${id}', ${t});`] : []);

  // End-card action UI (lib/cta.mjs): a real-looking Instagram piece for the action the Reel asks for, centered at `top`.
  // ui: 'follow' | 'comment' | 'dm' | 'share' | 'save' | 'link'. word = the comment word, handle/site from the brand kit.
  // Icons are inline SVG (emoji render as boxes). Animation: pops in at `in`; the word types, the bookmark fills.
  const ICON = {
    send: '<svg viewBox="0 0 24 24"><path d="M22 3 9.2 10.1M22 3l-7.4 18-3.2-8.2L3 9.7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    save: '<svg viewBox="0 0 24 24"><path class="bmk" d="M19 21 12 15.5 5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1z" fill="transparent" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };
  const avatar = (ch) => `<span class="ig-av">${ch}</span>`;
  K.ctaUi = (id, ui, { top, word = '', handle = '', site = '', name = '', in: t } = {}) => {
    const who = handle || name || '@yourname', ini = (handle.replace(/^@/, '')[0] || name[0] || 'Y').toUpperCase();
    const body = {
      follow: `${avatar(ini)}<span class="ig-who"><b>${who}</b><small>Suggested for you</small></span><span class="ig-btn">Follow</span>`,
      comment: `${avatar(ini)}<span class="ig-in"><span class="ctw">${word}</span><span class="ig-caret"></span></span><span class="ig-post">Post</span>`,
      share: `<span class="ig-ico">${ICON.send}</span><span class="ig-who"><b>Send to</b><small>Share with a friend</small></span><span class="ig-avs">${avatar('A')}${avatar('J')}${avatar('M')}</span>`,
      save: `<span class="ig-ico">${ICON.save}</span><span class="ig-who"><b>Saved</b><small>Find it in your saved posts</small></span>`,
      link: `<span class="ig-ico">${ICON.link}</span><span class="ig-who"><b>${who}</b><small class="ig-url">${site}</small></span>`,
    }[ui === 'dm' ? 'comment' : ui];
    const anim = [];
    if (t != null) {
      anim.push(`pop('#${id}', ${t});`);
      if (ui === 'comment' || ui === 'dm') anim.push(`tl.fromTo('#${id} .ctw', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: ${Math.max(0.3, word.length * 0.09).toFixed(2)}, ease: 'steps(${Math.max(1, word.length)})' }, ${t} + 0.35);`);
      if (ui === 'save') anim.push(`tl.to('#${id} .bmk', { fill: '${C.ink}', duration: 0.2 }, ${t} + 0.45);`);
      if (ui === 'follow') anim.push(`tl.to('#${id} .ig-btn', { backgroundColor: '#EFEFEF', color: '#000', duration: 0.01 }, ${t} + 0.9); tl.set('#${id} .ig-btn', { textContent: 'Following' }, ${t} + 0.9);`);
    }
    return h(`<div id="${id}" class="ig-card" style="top:${top}cqw">${body}</div>`, anim);
  };

  return K;
}

// All component CSS (always included; unused rules cost nothing).
export const componentCss = ({ C, font: F }) => `.big{position:absolute;left:5cqw;right:5cqw;text-align:center;font-family:'${F.statement}';font-weight:800;font-stretch:78%;line-height:.9;letter-spacing:-.01em;text-shadow:0 .4cqw 2cqw rgba(0,0,0,.35)}
.big .w{display:inline-block}
.mk{position:relative;display:inline-block;padding:0 .12em}
.mkbg{position:absolute;left:-.04em;right:-.04em;top:.1em;bottom:.02em;background:${C.peach};transform-origin:0 50%;border-radius:.08em;display:block}
.mk{rotate:-1.5deg}.mkbg{skew:-6deg}
.mkt{position:relative;color:${C.ink};text-shadow:none}
.hand{position:absolute;font-family:'${F.hand}';line-height:1;text-shadow:0 0 1.1cqw rgba(0,0,0,.6),0 .3cqw 1.6cqw rgba(0,0,0,.55);white-space:nowrap}
.cap{position:absolute;left:6cqw;right:6cqw;text-align:center;z-index:8}
.cap span{display:inline-block;font:800 5.4cqw/1.15 '${F.body}';color:#fff;text-shadow:0 0 .6cqw rgba(0,0,0,.8),0 .5cqw 1.8cqw rgba(0,0,0,.6)}
.chat{position:absolute;left:6cqw;right:6cqw;display:flex;flex-direction:column;gap:1.6cqw}
.msg{font:500 4cqw/1.3 'Segoe UI','${F.body}',sans-serif;padding:2.4cqw 3.2cqw;border-radius:4.4cqw;max-width:84%;box-shadow:0 .8cqw 2.4cqw rgba(0,0,0,.25)}
.msg.me{align-self:flex-end;background:#2f2f2f;color:#fff;border-bottom-right-radius:1.2cqw}
.msg.ai{align-self:flex-start;background:#fff;color:#1c1c1c;border-bottom-left-radius:1.2cqw}
.chip{align-self:flex-end;font:600 3.2cqw 'Segoe UI','${F.body}';background:#fff;color:#333;padding:1.2cqw 2.4cqw;border-radius:2cqw;border:.3cqw solid #ddd}
.paper{position:absolute;left:14cqw;right:14cqw;background:#fffdf7;background-image:repeating-linear-gradient(180deg,transparent 0 8.4cqw,#cfe0ee 8.4cqw 8.7cqw);padding:2.6cqw 5cqw 3cqw;font:400 7.6cqw/8.7cqw '${F.hand}';color:#2b2724;box-shadow:0 1.4cqw 3.6cqw rgba(0,0,0,.35)}
.paper div{display:flex;justify-content:space-between}.tick{display:inline-block;color:#2e7d4f;font-family:'${F.body}';font-weight:800}.tick.x{color:${C.orange}}
.badge{position:absolute;width:46cqw;border-radius:2.4cqw;overflow:hidden;box-shadow:0 1.4cqw 3.6cqw rgba(0,0,0,.4);background:#fff}
.b-top{background:${C.orange};color:#fff;text-align:center;font:800 9cqw/1 '${F.body}';padding:2cqw 0 1.4cqw}.b-top small{display:block;font:600 3.4cqw '${F.body}';margin-top:.6cqw}
.b-name{font:400 7.4cqw/1 '${F.hand}';color:${C.ink};text-align:center;padding:4cqw 2cqw 4.6cqw}
.folder{position:absolute;width:30cqw;filter:drop-shadow(0 1.4cqw 2.4cqw rgba(0,0,0,.4))}
.f-tab{display:inline-block;background:#E9C98E;font:400 6.4cqw/1 '${F.hand}';color:#2b2724;padding:1.6cqw 3cqw 1cqw 2.4cqw;border-radius:1.6cqw 3cqw 0 0;white-space:nowrap}
.f-body{height:20cqw;border-radius:0 1.6cqw 1.6cqw 1.6cqw;position:relative;overflow:hidden;background:linear-gradient(180deg,#F2D7A3,#E2BE80)}
.f-body i{position:absolute;left:12%;right:12%;display:block}.f-body i:nth-child(1){top:-.6cqw;height:4cqw;background:#fffdf7;border-radius:.4cqw}.f-body i:nth-child(2){top:7cqw;height:.5cqw;background:rgba(138,106,58,.35)}.f-body i:nth-child(3){top:10cqw;height:.5cqw;right:30%;background:rgba(138,106,58,.35)}
.post{position:absolute;width:27cqw;border-radius:1cqw;border:.8cqw solid #fff;box-shadow:0 1.4cqw 3cqw rgba(0,0,0,.4)}
.receipt{position:absolute;width:30cqw;background:#fffdf7;padding:3cqw 3.2cqw 6cqw;font:400 5.4cqw/1.12 '${F.hand}';color:#2b2724;rotate:-3deg;box-shadow:0 1.4cqw 3cqw rgba(0,0,0,.35)}
.receipt b{font-weight:400;color:${C.orange}}
.prompt{position:absolute;width:56cqw;display:flex;align-items:center;justify-content:space-between;background:#2f2f2f;color:#fff;border-radius:99px;padding:2.4cqw 2.4cqw 2.4cqw 4cqw;font:500 4.4cqw 'Segoe UI','${F.body}';box-shadow:0 1cqw 3cqw rgba(0,0,0,.4)}
.prompt .ptxt{display:inline-block}
.prompt i{font-style:normal;width:6.4cqw;height:6.4cqw;border-radius:50%;background:#fff;color:#2f2f2f;display:grid;place-items:center;font-weight:800}
.md{position:absolute;left:5cqw;right:5cqw;background:#1f1d1b;border-radius:2cqw;overflow:hidden;box-shadow:0 1.6cqw 4cqw rgba(0,0,0,.45);font:500 3.7cqw/1.55 Consolas,'Cascadia Mono',monospace}
.md-bar{display:flex;align-items:center;gap:1.2cqw;padding:1.6cqw 2.4cqw;background:#2b2826}.md-bar i{width:2cqw;height:2cqw;border-radius:50%;background:#5a5450;display:block}.md-bar span{margin-left:1.6cqw;font:600 3.2cqw '${F.body}';color:#cfc6bd}
.md-body{padding:1.8cqw 0 2.4cqw}.ln{display:flex;gap:3cqw;padding:0 3cqw;color:#e9e1d8;min-height:5.7cqw}.ln b{width:4cqw;text-align:right;color:#6f6862;font-weight:400}.lt{display:inline-block}
.ln.h .lt{color:${C.peach};font-weight:700}.ln.add{background:rgba(110,190,130,.16)}.ln.add b{color:#7fcf93}.ln.no{background:rgba(224,90,51,.16)}.ln.no b{color:${C.orange}}
.brainwrap{position:absolute;inset:0;overflow:hidden;background:#efe6da}.brain{position:absolute;left:0;top:0;width:100%;display:block}
.url{position:absolute;left:14cqw;right:14cqw;display:flex;align-items:center;gap:2cqw;background:#fff;border-radius:99px;padding:2.4cqw 4cqw;font:600 5cqw 'Segoe UI','${F.body}';color:#1c1c1c;box-shadow:0 1cqw 3cqw rgba(0,0,0,.35)}.lock{font-size:3.6cqw}
.ph{position:relative;display:inline-block;font-weight:700;color:#8a3b22;background:#fbe9df;border-radius:1cqw;padding:0 .8cqw;margin:1.3cqw .6cqw}
.ph-ring{position:absolute;left:-12%;top:-38%;width:124%;height:176%;overflow:visible;pointer-events:none}
.draw{stroke-dasharray:1;stroke-dashoffset:1}
.ig-card{position:absolute;left:12cqw;right:12cqw;display:flex;align-items:center;gap:3cqw;background:#fff;border-radius:4cqw;padding:3.2cqw 4cqw;font:400 4.4cqw/1.2 'Segoe UI','${F.body}',sans-serif;color:#000;box-shadow:0 1.2cqw 4cqw rgba(0,0,0,.22)}
.ig-av{flex:none;display:inline-flex;align-items:center;justify-content:center;width:10cqw;height:10cqw;border-radius:50%;background:${C.peach};color:${C.ink};font-weight:700;font-size:4.6cqw;box-shadow:0 0 0 .5cqw #fff,0 0 0 .9cqw ${C.orange}}
.ig-avs{display:flex;margin-left:auto}.ig-avs .ig-av{width:8.5cqw;height:8.5cqw;font-size:3.8cqw;margin-left:-2cqw;box-shadow:0 0 0 .6cqw #fff}
.ig-who{display:flex;flex-direction:column;min-width:0;flex:1}.ig-who b{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ig-who small{font-size:3.6cqw;color:#737373}
.ig-url{color:#00376B!important;font-weight:600}
.ig-btn{flex:none;background:#0095F6;color:#fff;font-weight:700;border-radius:2.2cqw;padding:2cqw 4.4cqw}
.ig-in{flex:1;display:flex;align-items:center;border:.3cqw solid #dbdbdb;border-radius:99px;padding:2.2cqw 3.6cqw;font-weight:700;letter-spacing:.02em;min-height:10cqw}
.ig-caret{width:.4cqw;height:5cqw;background:#0095F6;margin-left:.4cqw}
.ig-post{flex:none;color:#0095F6;font-weight:700}
.ig-ico{flex:none;width:10cqw;height:10cqw;color:#000}.ig-ico svg{width:100%;height:100%;display:block}`;
