// Reel cover templates, v2 (2026-10-10, from Mercedes's inspiration: @itsmegkilgore, @withnicoleyoung).
// Canvas 1080×1920 (9:16). The profile grid shows the middle 3:4 (y 240 to 1680), so text stays inside y 300 to 1620.
// Every cover is a frame from the reel. Text sits straight on the photo (no cards or bands): a mix of heavy caps,
// big italic serif, a handwritten note with a drawn arrow, and small plain lines, in cream.
// 2026-10-14 (Mercedes): NO italic serif anymore. 'serif', 'title' and 'label' lines and *accents* now use Bricolage
// 800 condensed; an *accent* sits on the peach marker (ink text) instead of turning peach. Line kinds are unchanged,
// so existing reel.json files still work. The review page's cover picker has the same layouts (reel-hf/lib/cover.mjs).
//
// cover.lines = [[kind, text], ...] kinds: script (handwritten note), caps, serif (big italic), title (upright serif),
// word (huge lowercase sans), small, label (serif in a soft highlight box). *word* inside caps = serif accent.
// serifStyle: shadow (default, Mercedes 2026-10-10: thin Instrument Serif + stronger shadow for readability), thin, bold (Fraunces 600).
// Without lines, the hook is split automatically: text before *accent* = caps, accent = serif, after = caps.
import { esc } from './common.mjs';

export const CW = 1080, CH = 1920;
export const TEMPLATES = ['stack', 'title', 'word', 'behind', 'label', 'number'];

const CREAM = '#FFF4DC', PEACH = '#FFC9A8', INK = '#161210';
const inline = (s) => esc(s).replace(/\n/g, '<br>').replace(/\*([^*]+)\*/g, '<em>$1</em>');

const ARROW = `<svg class="arrow" viewBox="0 0 120 170"><path d="M38 8c-30 30-18 70 18 70 26 0 26-34 2-30-30 6-30 60-6 92" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M34 128l18 22 20-20" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const FLAKE = (x, y, r, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none">${[0, 60, 120].map((a) => `<g transform="rotate(${a})"><path d="M0 ${-r}V${r}"/><path d="M${-r * .3} ${-r * .75}L0 ${-r * .5}L${r * .3} ${-r * .75}M${-r * .3} ${r * .75}L0 ${r * .5}L${r * .3} ${r * .75}"/></g>`).join('')}</g>`;
const BOW = (x, y) => `<g transform="translate(${x} ${y}) rotate(-8)" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="-70" y="0" width="140" height="110" rx="6"/><path d="M-78 0h156M0 0v110"/><path d="M0 0c-20-40-70-44-62-12 4 16 40 14 62 12zM0 0c20-40 70-44 62-12-4 16-40 14-62 12z"/></g>`;

function themeLayer(theme, place) {
  if (theme !== 'christmas') return '';
  const dy = place === 'bottom' ? 0 : 900;
  // Hand-drawn, cream, kept small and away from the text block. Snowflakes cross nothing important.
  return `<svg class="doodles" viewBox="0 0 1080 1920"><g transform="translate(0 ${dy})">${FLAKE(140, 380, 34, 10)}${FLAKE(940, 340, 26, -12)}${FLAKE(970, 700, 30, 5)}${BOW(860, 520)}</g></svg>`;
}

function linesFor(cover, hook) {
  if (cover.lines?.length) return cover.lines;
  const m = String(hook).match(/^(.*?)\*([^*]+)\*(.*)$/);
  if (!m) return [['caps', hook]];
  return [m[1].trim() && ['caps', m[1].trim()], ['serif', m[2].trim()], m[3].trim() && ['caps', m[3].trim()]].filter(Boolean);
}

const lineHtml = ([kind, text], i, all, arrow) => {
  const a = kind === 'script' && arrow && i < all.length - 1 ? ARROW : '';
  if (kind === 'label') return `<p class="l label"><span>${inline(text)}</span></p>`;
  return `<p class="l ${kind}">${inline(text)}${a}</p>`;
};

export function coverHtml({ template = 'stack', lines, pos = 'bottom', photoUrl, matteUrl, theme, accent = 'peach', arrow = true, serifStyle = 'shadow' }, brand) {
  const f = brand.fonts;
  const fams = [...new Set([...Object.values(f).map((x) => x.google), 'Covered By Your Grace', 'Inter Tight:wght@700;800', 'Fraunces:ital,opsz,wght@1,9..144,500;1,9..144,600'])].map((g) => `family=${g.replace(/ /g, '+')}`).join('&');
  const serifColor = accent === 'peach' ? PEACH : CREAM;
  const place = template === 'title' ? 'top' : pos;
  const body = lines.map((l, i) => lineHtml(l, i, lines, arrow && template !== 'title')).join('');
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fams}&display=block">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:${CW}px;height:${CH}px;overflow:hidden;background:#222}
.c{position:relative;width:${CW}px;height:${CH}px;overflow:hidden;--k:1}
.ph,.matte{position:absolute;inset:0;background-size:cover;background-position:center}
.ph{background-image:url('${photoUrl}');filter:saturate(.92) contrast(1.02)}
.dim{position:absolute;inset:0;background:rgba(20,14,10,.2)}
.shade{position:absolute;left:0;right:0;height:900px;background:radial-gradient(ellipse 75% 50% at 50% 50%,rgba(15,10,8,.58),rgba(15,10,8,0) 74%)}
.shade.top{top:180px}.shade.center{top:510px}.shade.bottom{top:840px}
.matte{background-image:url('${matteUrl || ''}')}
.doodles{position:absolute;inset:0;width:100%;height:100%;color:${CREAM};opacity:.9}
.t{position:absolute;left:80px;right:80px;display:flex;flex-direction:column;align-items:center;text-align:center;color:${CREAM};text-shadow:0 3px 24px rgba(0,0,0,.28)}
.t.top{top:310px}.t.center{top:50%;transform:translateY(-50%)}.t.bottom{bottom:310px}
.l{position:relative}
em{font-family:'${f.bold.family}',sans-serif;font-style:normal;font-weight:800;font-stretch:78%;text-transform:none;letter-spacing:-.01em;color:${INK};background:${PEACH};padding:0 .12em;border-radius:.08em;display:inline-block;rotate:-1.5deg;text-shadow:none!important;font-size:1em;line-height:1}
.caps{font:800 calc(104px*var(--k))/1.0 '${f.bold.family}',sans-serif;font-stretch:88%;text-transform:uppercase;letter-spacing:-.01em}
.serif{font:800 calc(200px*var(--k))/.86 '${f.bold.family}',sans-serif;font-stretch:78%;color:${CREAM};letter-spacing:-.015em;margin:.02em 0 .06em}
.title{font:800 calc(150px*var(--k))/.92 '${f.bold.family}',sans-serif;font-stretch:78%;letter-spacing:-.015em}
.title em{font-size:1em}
.word{font:800 calc(280px*var(--k))/.9 'Inter Tight',sans-serif;letter-spacing:-.01em;text-transform:lowercase}
.small{font:500 calc(44px*var(--k))/1.25 '${f.highlight.family}',sans-serif;margin-top:18px;letter-spacing:.005em}
.script{font:400 calc(76px*var(--k))/1.02 'Covered By Your Grace',cursive;letter-spacing:.03em;text-transform:uppercase;transform:rotate(-5deg);align-self:flex-start;margin:0 0 6px 40px;text-align:left;max-width:560px}
.t.title-t .script{align-self:center;transform:none;margin:14px 0 0;text-transform:none;letter-spacing:.06em;font-size:calc(58px*var(--k))}
.script .arrow{position:absolute;left:38%;top:92%;width:96px;color:${CREAM};transform:rotate(8deg)}
.script:has(.arrow){margin-bottom:120px}
.label{font:800 calc(92px*var(--k))/1.2 '${f.bold.family}',sans-serif;font-stretch:78%;color:${INK};text-shadow:none;margin-top:10px}
.label span{background:${PEACH};padding:.02em .22em .06em;border-radius:.18em;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.label em{background:none;padding:0;rotate:0deg}
.behind-t .serif,.behind-t .caps{font-size:calc(330px*var(--k));line-height:.82}
.number-t .serif{font-size:calc(300px*var(--k))}
${serifStyle === 'thin' ? '' : '.serif,.c em:not(.label em){text-shadow:0 0 46px rgba(0,0,0,.55),0 4px 16px rgba(0,0,0,.45)}'}
${serifStyle === 'bold' ? ".serif,.c em:not(.label em){font-family:'Fraunces',serif!important;font-weight:600;font-variation-settings:'opsz' 144;letter-spacing:-.025em}.serif{line-height:.9}" : ''}
</style></head><body><div class="c">
<div class="ph"></div><div class="dim"></div>${template === 'behind' ? '' : `<div class="shade ${place}"></div>`}
<div class="t ${place} ${template}-t">${body}</div>
${template === 'behind' && matteUrl ? '<div class="matte"></div>' : ''}
${themeLayer(theme, place)}
</div>
<script>
// Scale the whole text block down until it fits the grid-safe band (y 300 to 1620) and the 920px width.
(async () => {
  await document.fonts.ready;
  const c = document.querySelector('.c'), t = document.querySelector('.t');
  let k = 1;
  const ok = () => { const r = t.getBoundingClientRect(); return r.top >= 300 && r.bottom <= 1620 && [...t.children].every((el) => el.scrollWidth <= t.clientWidth + 4); };
  while (!ok() && k > .5) { k -= .03; c.style.setProperty('--k', k); }
  document.body.dataset.fit = (ok() ? 'ok:' : 'fail:') + k.toFixed(2);
})();
</script></body></html>`;
}

export { linesFor };
