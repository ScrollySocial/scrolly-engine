// Content-slide layouts for style D/E (content-rules 7c). Slides 1-2 use the big-type cover; content slides pick a
// `layout` so a post switches formats: text, number, formula, chart, phone, chat, checklist, photo.
// Paragraph text is left-aligned. Mock app screens show labels and shapes, never invented numbers.
import { esc } from './common.mjs';

const rich = (s) => esc(s).replace(/\n/g, '<br>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
const ICON = {
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  comment: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M20 12a8 8 0 1 1-3.2-6.4L20 4l-.6 4A8 8 0 0 1 20 12z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M21 3 3 10l7 3 3 7z"/><path d="m10 13 4-4"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
};

const para = (s) => `<div class="txt"><p class="fit">${rich(s.text)}</p></div>`;

function screen(sc = {}, media) {
  const img = media ? `background-image:url('${media.url}');background-position:${media.focus || 'center'};background-size:cover` : '';
  switch (sc.type) {
    case 'image':
      return `<div class="scr scr-img" style="${img}"></div>`;
    case 'bio':
      return `<div class="scr scr-bio"><div class="bio-top"><div class="av" style="${img}"></div><div class="bars"><i></i><i></i><i></i></div></div>
        <div class="bio-name">${esc(sc.name || 'Your Business')}</div>
        ${(sc.lines || []).map((l) => `<div class="bio-line">${esc(l)}</div>`).join('')}
        ${sc.link ? `<div class="bio-link">${ICON.link}<span>${esc(sc.link)}</span></div>` : ''}
        <div class="bio-btns"><span>Follow</span><span>Message</span></div>
        <div class="bio-grid">${'<i></i>'.repeat(6)}</div></div>`;
    case 'story-link':
      return `<div class="scr scr-story" style="${img || 'background:linear-gradient(160deg,#4da3ff,#0a1930)'}"><div class="story-bars"><i></i><i></i><i></i></div>
        ${sc.caption ? `<div class="story-cap">${esc(sc.caption)}</div>` : ''}
        <div class="sticker">${ICON.link}<span>${esc(sc.link || 'yourshop.com')}</span></div></div>`;
    case 'insights':
      return `<div class="scr scr-ins"><div class="ins-h">Insights</div>
        ${(sc.rows || []).map((r, i) => `<div class="ins-row${i === sc.hi ? ' hi' : ''}"><span>${esc(r)}</span><b></b></div>`).join('')}</div>`;
    case 'reel':
      return `<div class="scr scr-reel" style="${img || 'background:linear-gradient(170deg,#24406e,#0a1930)'}">
        <div class="rail">${ICON.heart}${ICON.comment}${ICON.send}</div>
        ${sc.onscreen ? `<div class="reel-ost">${esc(sc.onscreen)}</div>` : ''}
        <div class="reel-cap"><b>${esc(sc.name || 'your.business')}</b> ${esc(sc.caption || '')}</div></div>`;
    default:
      throw new Error(`phone screen type "${sc.type}" unknown (image, bio, story-link, insights, reel)`);
  }
}

export const LAYOUTS = {
  // Slide 2 second hook: two text sections, top right-aligned, bottom left-aligned (content-rules 5).
  hook2: (s) => `<div class="txt fit"><p class="h-top">${rich(s.top)}</p><p class="h-bot">${rich(s.bottom)}</p></div>`,
  text: (s) => para(s),
  number: (s) => `<div class="big">${esc(s.big)}</div>${para(s)}`,
  formula: (s) => `<div class="formula">${(s.formula || []).map((t) => (/^[÷×=+−-]$/.test(t)
    ? `<span class="op">${t}</span>`
    : `<span class="term"><b>${esc(t.split('|')[0])}</b>${t.includes('|') ? `<small>${esc(t.split('|')[1])}</small>` : ''}</span>`)).join('')}</div>${para(s)}`,
  chart: (s) => {
    const rows = s.chart.rows, max = Math.max(...rows.map((r) => r[1]));
    return `${para(s)}<div class="chart">${rows.map(([l, v, d], i) => `<div class="bar${i === s.chart.hi ? ' hi' : ''}"><span class="bl">${esc(l)}</span><span class="bt"><i style="width:${(v / max) * 100}%"></i></span><span class="bv">${esc(d ?? String(v))}</span></div>`).join('')}</div>
      ${s.chart.note ? `<div class="cnote">${esc(s.chart.note)}</div>` : ''}`;
  },
  phone: (s, m) => `${para(s)}<div class="phone"><div class="notch"></div>${screen(s.screen, m)}</div>`,
  chat: (s) => `${para(s)}<div class="chat">${(s.chat || []).map((c) => `<div class="bub ${c.me ? 'me' : 'them'}">${esc(c.text)}</div>`).join('')}</div>`,
  checklist: (s) => `${para(s)}<ul class="checks">${(s.items || []).map((t) => `<li><span class="ck">${ICON.check}</span>${esc(t)}</li>`).join('')}</ul>`,
  // Walking-through-slides: one wide photo split across consecutive slides (s._pano = {i, n} set by templates).
  pano: (s, m) => `<div class="bg" style="background-image:url('${m.url}');background-size:${s._pano.n * 100}% auto;background-position:${s._pano.n > 1 ? (s._pano.i / (s._pano.n - 1)) * 100 : 50}% ${(m.focus || '').split(/\s+/)[1] || '50%'}"></div><div class="txt"><p class="fit hl"><span>${esc(s.text)}</span></p></div>`,
  // Finished artwork with its text baked in (e.g. a designed grid-panorama tile). s.text is kept as alt text only.
  image: (s, m) => `<div class="bg" style="background-image:url('${m.url}');background-size:cover;background-position:center"></div>`,
  photo: (s, m) => `<div class="bg" style="background-image:url('${m.url}');background-position:${m.focus || 'center'}"></div><div class="txt"><p class="fit hl"><span>${esc(s.text)}</span></p></div>`,
};

export const LAYOUT_CSS = (brand) => `
.s.lay{font-family:'${brand.fonts.display.family}',sans-serif;padding:120px 96px;justify-content:center;gap:56px}
.s.lay .txt{position:relative;left:auto;right:auto;transform:none;text-align:left;align-items:flex-start}
.s.lay .fit{font-size:82px;font-weight:500;line-height:1.16;letter-spacing:-.005em;text-transform:none;text-wrap:pretty}
.s.lay em{font:inherit;color:inherit;background:none;padding:0}
/* hook2: serif hook top right, Jost swipe line bottom left */
.s.lay-hook2 .txt{position:absolute;top:150px;bottom:170px;left:96px;right:96px;display:flex;flex-direction:column;justify-content:space-between}
.s.lay-hook2 .fit{font-size:140px}
.h-top{text-align:right;font-family:'${brand.fonts.headline.family}',serif;font-weight:400;line-height:.98;letter-spacing:-.01em;text-wrap:balance}
.h-bot{text-align:left;text-wrap:balance;font-weight:500;font-size:.54em;line-height:1.2;max-width:82%}
/* number */
.lay-number .big{font-family:'${brand.fonts.headline.family}',serif;font-weight:400;font-size:360px;line-height:.85;color:var(--accent);letter-spacing:-.01em}
/* formula */
.formula{display:flex;flex-wrap:nowrap;align-items:center;gap:16px}
.formula .term{display:flex;flex-direction:column;align-items:center;background:var(--paper);color:var(--paper-ink);border-radius:24px;padding:24px 24px 20px}
.formula .term b{font-family:'${brand.fonts.headline.family}',serif;font-size:108px;font-weight:400;line-height:1}
.formula .term small{font-size:34px;font-weight:500;margin-top:8px;color:#4a4e66}
.formula .term:last-child{background:var(--pop);color:#0a1930}
.formula .term:last-child small{color:#0a1930}
.formula .op{font-family:'${brand.fonts.headline.family}',serif;font-size:84px;font-weight:400;color:var(--ink)}
/* chart */
.chart{display:flex;flex-direction:column;gap:26px;width:100%}
.bar{display:grid;grid-template-columns:250px 1fr 190px;align-items:center;gap:20px;font-size:40px;font-weight:500}
.bt{height:78px;background:color-mix(in srgb,var(--ink) 9%,transparent);border-radius:14px;overflow:hidden}
.bt i{display:block;height:100%;background:color-mix(in srgb,var(--ink) 30%,transparent);border-radius:14px}
.bar.hi .bt i{background:var(--pop)}
.bar.hi{font-weight:700}
.bv{text-align:right;font-family:'${brand.fonts.headline.family}',serif;font-weight:400;font-size:56px}
.cnote{font-size:34px;font-weight:500;opacity:.8}
/* phone */
.s.lay-phone{justify-content:flex-start;padding-top:140px}
.s.lay-phone .fit{font-size:76px}
.phone{position:absolute;left:50%;bottom:-170px;translate:-50% 0;width:540px;height:960px;border-radius:78px;background:#151515;padding:18px;box-shadow:0 30px 60px rgba(10,25,48,.25)}
.notch{position:absolute;top:30px;left:50%;translate:-50% 0;width:150px;height:38px;border-radius:20px;background:#151515;z-index:2}
.scr{width:100%;height:100%;border-radius:62px;overflow:hidden;position:relative;background:#fff;color:#111;font-family:'${brand.fonts.highlight.family}',sans-serif}
.scr-bio{padding:110px 40px 0}
.bio-top{display:flex;align-items:center;gap:30px}.av{width:140px;height:140px;border-radius:50%;background:#dfe4f0;flex:none}
.bars{display:flex;gap:22px;flex:1}.bars i{flex:1;height:54px;border-radius:10px;background:#eee}
.bio-name{font-weight:700;font-size:34px;margin-top:26px}
.bio-line{font-size:30px;line-height:1.35;margin-top:6px}
.bio-link{display:flex;align-items:center;gap:10px;color:#2f55d4;font-weight:600;font-size:30px;margin-top:10px}.bio-link svg{width:30px}
.bio-btns{display:flex;gap:14px;margin-top:26px}.bio-btns span{flex:1;text-align:center;background:#efefef;border-radius:14px;padding:16px;font-weight:600;font-size:28px}
.bio-btns span:first-child{background:#2f6fea;color:#fff}
.bio-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:30px -40px 0}.bio-grid i{aspect-ratio:3/4;background:#e4e7ee}
.scr-story{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:40px}
.story-bars{position:absolute;top:70px;left:30px;right:30px;display:flex;gap:8px}.story-bars i{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.6)}
.story-cap{background:#fff;color:#111;font-weight:600;font-size:36px;padding:10px 22px;border-radius:12px;max-width:80%;text-align:center}
.sticker{display:flex;align-items:center;gap:14px;background:#fff;color:#2f55d4;font-weight:700;font-size:34px;padding:22px 34px;border-radius:22px;box-shadow:0 8px 20px rgba(0,0,0,.2)}.sticker svg{width:40px}
.scr-ins{padding:120px 40px 0;background:#fff}.ins-h{font-weight:700;font-size:40px;margin-bottom:30px}
.ins-row{display:flex;justify-content:space-between;align-items:center;padding:26px 6px;border-bottom:2px solid #eee;font-size:32px;font-weight:500}
.ins-row b{width:120px;height:28px;border-radius:8px;background:#e6e6e6}
.ins-row.hi{background:color-mix(in srgb,var(--pop) 18%,#fff);border-radius:16px;padding:26px 20px;border:4px solid var(--pop);font-weight:700}
.ins-row.hi b{background:var(--pop)}
.scr-img{background-color:#ddd}
.scr-reel{color:#fff}
.rail{position:absolute;right:26px;bottom:230px;display:flex;flex-direction:column;gap:36px}.rail svg{width:58px}
.reel-ost{position:absolute;top:34%;left:40px;right:110px;background:#fff;color:#111;font-weight:600;font-size:38px;padding:12px 20px;border-radius:12px}
.reel-cap{position:absolute;left:36px;right:110px;bottom:120px;font-size:28px;line-height:1.35}
/* chat */
.chat{display:flex;flex-direction:column;gap:22px;width:100%}
.bub{max-width:82%;font-family:'${brand.fonts.highlight.family}',sans-serif;font-size:46px;font-weight:400;line-height:1.3;padding:24px 32px;border-radius:40px}
.bub.them{align-self:flex-start;background:var(--paper);color:var(--paper-ink);border-bottom-left-radius:10px}
.bub.me{align-self:flex-end;background:#3f6df0;color:#fff;border-bottom-right-radius:10px}
/* checklist */
.checks{list-style:none;display:flex;flex-direction:column;gap:26px;width:100%}
.checks li{display:flex;align-items:center;gap:26px;background:var(--paper);color:var(--paper-ink);border-radius:24px;padding:26px 30px;font-size:50px;font-weight:500}
.ck{width:58px;height:58px;border-radius:50%;background:var(--pop);color:#0a1930;display:grid;place-items:center;flex:none}.ck svg{width:34px}
/* image */
.lay-image{padding:0}
/* pano */
.lay-pano{padding:0}
.lay-pano .bg{background-repeat:no-repeat}
.s.lay-pano .txt{position:absolute;left:80px;right:80px;bottom:150px}
.lay-pano.cover .fit{font-size:88px}
.s.lay-pano.cover .txt{top:200px;bottom:auto}
.lay-pano .fit{font-family:'${brand.fonts.highlight.family}',sans-serif;font-weight:500;font-size:66px;line-height:1.42;text-transform:none}
/* photo */
.lay-photo{padding:0}
.s.lay-photo .txt{position:absolute;left:80px;right:80px;bottom:150px}
.lay-photo .fit{font-family:'${brand.fonts.highlight.family}',sans-serif;font-weight:500;font-size:66px;line-height:1.42;text-transform:none}
`;
