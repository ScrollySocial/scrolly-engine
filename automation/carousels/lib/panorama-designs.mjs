// Designed grid panoramas: one wide canvas (N × 1080 by 1440) with a DIFFERENT design per tile, plus objects that
// cross the seams (photo, phone, shirt card, arrow) so the row reads as one piece on the profile grid.
// Rule: text never crosses a seam (each tile's hook sits fully inside its own tile, 90px from the edges).
import { esc } from './common.mjs';

const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');

export const DESIGNS = {
  // About (warm, grid paper) · $1K Challenge (tangerine sweep) · Views math (warm, dots)
  'pinned-2026-10': ({ brand, photo, shirt, screen, hooks }) => {
    const [h1, h2, h3] = hooks;
    const P = brand.palettes, warm = P.warm, tan = P.tangerine;
    return `
<div class="zone z1"></div>
<svg class="sweep" viewBox="0 0 1300 1440" preserveAspectRatio="none"><path d="M120 0 C 40 420, 220 760, 60 1440 L 1300 1440 L 1300 0 Z" fill="${tan.bg}"/></svg>
<div class="zone z3"></div>

<div class="hook t1"><h1>${rich(h1.big)}</h1><p>${esc(h1.small)}</p></div>
<div class="hook t2"><h1>${rich(h2.big)}</h1><p>${esc(h2.small)}</p></div>
<div class="hook t3"><h1>${rich(h3.big)}</h1><p>${esc(h3.small)}</p></div>

<div class="polaroid"><span class="tape"></span><div class="ph" style="background-image:url('${photo.url}');background-position:${photo.focus || 'center'}"></div></div>
<div class="shirt"><span class="tape"></span><div class="ph" style="background-image:url('${shirt}')"></div><b>You earn this one</b></div>
<div class="phone"><div class="notch"></div><div class="scr" style="background-image:url('${screen.url}');background-position:${screen.focus || '50% 85%'}"></div></div>

<svg class="arrow a1" viewBox="0 0 520 220"><path d="M10 170 C 140 30, 330 10, 470 120" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M420 70 l 55 52 -70 22" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>
<svg class="spark s1" viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="currentColor"/></svg>
<svg class="spark s2" viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="currentColor"/></svg>
<svg class="spark s3" viewBox="0 0 40 40"><path d="M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z" fill="currentColor"/></svg>

<style>
.canvas{position:relative;width:3240px;height:1440px;overflow:hidden;background:${warm.bg};font-family:'${brand.fonts.bold.family}',sans-serif}
.zone{position:absolute;top:0;bottom:0}
.z1{left:0;width:1300px;background-image:linear-gradient(${warm.tex} 3px,transparent 3px),linear-gradient(90deg,${warm.tex} 3px,transparent 3px);background-size:90px 90px}
.z3{left:2240px;right:0;background-image:radial-gradient(${warm.tex} 10px,transparent 11px);background-size:66px 66px}
.sweep{position:absolute;left:1000px;top:0;width:1300px;height:1440px}
.hook{position:absolute;top:150px;width:900px}
.hook h1{font-weight:800;font-stretch:75%;font-variation-settings:'wdth' 75;text-transform:uppercase;line-height:.92;font-size:150px;letter-spacing:-.005em}
.hook em{font-family:'${brand.fonts.serif.family}',serif;font-style:italic;font-weight:400;text-transform:none;font-size:1.12em;letter-spacing:0}
.hook p{margin-top:34px;font-weight:700;font-stretch:88%;font-variation-settings:'wdth' 88;font-size:56px;line-height:1.15}
.t1{left:90px;color:${warm.ink}}.t1 em{color:${warm.accent}}
.t2{left:1170px;color:#fff}.t2 em{color:${tan.accent}}
.t3{left:2250px;color:${warm.ink};text-align:right}.t3 em{color:${warm.accent}}
.tape{position:absolute;top:-30px;left:50%;width:220px;height:64px;translate:-50% 0;rotate:-4deg;background:color-mix(in srgb,${warm.mark} 80%,transparent);z-index:2}
.polaroid{position:absolute;left:640px;top:760px;width:600px;padding:28px 28px 110px;background:#fff;rotate:-6deg;box-shadow:0 24px 50px rgba(60,20,0,.22)}
.polaroid .ph{height:560px;background-size:cover}
.shirt{position:absolute;left:1480px;top:820px;width:560px;padding:24px 24px 90px;background:#fff;rotate:5deg;box-shadow:0 24px 50px rgba(60,20,0,.25)}
.shirt .ph{height:380px;background-size:cover;background-position:center}
.shirt b{position:absolute;left:0;right:0;bottom:24px;text-align:center;font-family:'${brand.fonts.serif.family}',serif;font-style:italic;font-weight:400;font-size:52px;color:${warm.ink}}
.phone{position:absolute;left:2080px;top:520px;width:450px;height:880px;border-radius:70px;background:#151515;padding:16px;rotate:8deg;box-shadow:0 30px 60px rgba(40,10,0,.3)}
.phone .notch{position:absolute;top:28px;left:50%;translate:-50% 0;width:130px;height:34px;border-radius:18px;background:#151515;z-index:2}
.phone .scr{width:100%;height:100%;border-radius:56px;background-size:cover;background-color:#f6eee5}
.arrow{position:absolute;color:${warm.accent}}
.a1{left:820px;top:560px;width:520px;rotate:-4deg}
.spark{position:absolute;color:${warm.accent}}
.s1{left:1230px;top:700px;width:70px;color:#fff}.s2{left:2120px;top:600px;width:56px}.s3{left:3080px;top:1180px;width:80px}
</style>`;
  },
};
