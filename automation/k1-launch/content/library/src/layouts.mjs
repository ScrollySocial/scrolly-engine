// Reusable slide/frame layouts for the Challenge templates. Each returns { bg, role, els } for build.mjs.
// Carousel canvas 1080 × 1440 (3:4). Story canvas 1080 × 1920 (9:16), safe zone 269 top / 672 bottom / 65 sides.
// Every layout takes `note` (the blue SWAP IN guidance) and optional `role` (label on the review board).
// Photos: `ph` = placeholder label the customer sees; `ex` = stock key used only in the finished-example preview.
import { C, img, rect, text, note as noteEl, zone as zoneEl } from './design.mjs';

// ---- text fitting: shrink a font size until the words fit the box (approximate glyph widths per face) ----
const CW = { serif: 0.47, serifWide: 0.6, sans: 0.55, sansBold: 0.6, hand: 0.42 }; // serifWide: digits, arrows, big figures
export function fit(s, { w, h, size, lh = 1.1, face = 'serif', min = 26 }) {
  const words = String(s).split(/\s+/);
  for (let z = size; z >= min; z -= 2) {
    const cpl = Math.max(1, Math.floor(w / (z * CW[face])));
    if (words.some((wd) => wd.length > cpl)) continue; // a single word wider than the box
    let lines = 1, cur = 0;
    for (const wd of words) {
      const n = wd.length + (cur ? 1 : 0);
      if (cur + n > cpl) { lines++; cur = wd.length; } else cur += n;
    }
    lines += (String(s).match(/\n/g) || []).length;
    if (lines * z * lh <= h) return z;
  }
  return min;
}
const pillW = (s, size) => Math.min(888, Math.round(String(s).length * size * 0.74 + 80));
const N = (x, y, w, h, s) => (s ? [noteEl(x, y, w, h, s)] : []);
// Blue note height: ~24 characters per line at 29px in a 460px box, plus explicit line breaks.
const noteH = (s, cpl = 24) => (s ? Math.max(120, String(s).split('\n').reduce((n, p) => n + Math.max(1, Math.ceil(p.length / cpl)), 0) * 38 + 46) : 0);
const noteBR = (s) => N(560, 1400 - noteH(s) - 20, 460, noteH(s), s); // bottom-right on carousels
const noteTR = (s) => N(560, 64, 460, noteH(s), s); // top-right (over photos)
const serifH = (s, x, y, w, h, base, color = C.ink, o = {}) => text(x, y, w, h, s, { f: 'serif', size: fit(s, { w, h, size: base, lh: 1.04 }), color, lh: 1.04, ...o });
// Canva drops the inner padding of filled text boxes on import, so filled boxes are fitted 120px narrower
// and centered: the colored box keeps visible breathing room around the words.
const sansT = (s, x, y, w, h, base, o = {}) => text(x, y, w, h, s, { size: fit(s, { w: o.fill ? w - 120 : w, h: o.fill ? h - 40 : h, size: base, lh: o.lh || 1.25, face: o.bold ? 'sansBold' : 'sans' }), lh: 1.25, ...o, ...(o.fill ? { align: 'center' } : {}) });
const kickPill = (s, x, y, size = 36) => text(x, y, pillW(s, size), 76, s.toUpperCase(), { size, bold: true, fill: C.hi, align: 'center', valign: 'middle', radius: 10, charSpacing: 3 });

// =============================== CAROUSEL LAYOUTS ===============================
export const L = {
  // Full-bleed photo, dark band, big serif headline (optional small kicker above it).
  cover: ({ ph, ex, h = '', kick, note, role }) => ({ bg: C.ink, role, els: [
    img(0, 0, 1080, 1440, ph, ex),
    rect(0, 720, 1080, 720, C.ink, { alpha: 0.55 }),
    ...(kick ? [kickPill(kick, 76, 790, 32)] : []),
    ...(h ? [serifH(h, 76, kick ? 890 : 820, 928, kick ? 470 : 540, 96, 'FFFFFF', { valign: kick ? 'top' : 'bottom' })] : []),
    ...noteTR(note),
  ]}),
  // Plain statement on paper: optional kicker pill, big serif line, optional sub line.
  statement: ({ kick, h, sub, bg = C.paper, note, role }) => ({ bg, role, els: [
    ...(kick ? [kickPill(kick, 96, 330)] : []),
    serifH(h, 96, 440, 888, sub ? 480 : 640, 112),
    ...(sub ? [sansT(sub, 96, 950, 860, 230, 46)] : []),
    ...noteBR(note),
  ]}),
  // Photo with 3 handwritten labels on yellow tape.
  annotated: ({ title, ph, ex, tags = [], note, role }) => ({ bg: C.white, role, els: [
    sansT(title, 76, 64, 928, 160, 60, { bold: true, lh: 1.12 }),
    img(76, 250, 928, 1110, ph, ex),
    ...tags.map((t, i) => {
      const [x, y, w, r] = [[110, 470, 600, -3], [400, 760, 600, 2], [130, 1030, 520, -2]][i];
      return text(x, y, w, 100, t, { f: 'hand', size: fit(t, { w: w - 40, h: 90, size: 66, face: 'hand', lh: 1 }), fill: C.hi, align: 'center', valign: 'middle', rot: r, radius: 8, shadow: true, lh: 1 });
    }),
    ...N(560, 1360 - noteH(note), 440, noteH(note), note),
  ]}),
  // Looks like a phone Notes-app list.
  notesApp: ({ title, lead, items = [], check, note, role }) => {
    const els = [text(60, 40, 300, 70, '‹ Notes', { size: 44, color: 'C9971A' }), text(820, 40, 200, 70, 'Done', { size: 44, color: 'C9971A', align: 'right' }),
      sansT(title, 86, 150, 908, 230, 72, { bold: true, lh: 1.1 })];
    let y = 410;
    if (lead) { els.push(sansT(lead, 86, y, 908, 80, 52, { bold: true })); y += 100; }
    for (const it of items) {
      if (check) els.push(rect(86, y + 12, 48, 48, null, { line: { color: 'B9B4A9', w: 6 }, radius: 24 }));
      els.push(sansT((check ? '' : '–  ') + it, check ? 160 : 86, y, check ? 834 : 908, 120, 52));
      y += 140;
    }
    return { bg: C.white, role, els: [...els, ...noteBR(note)] };
  },
  // Tilted instant photo with tape and a handwritten caption.
  scrap: ({ ph, ex, cap, sub, tilt, note, role }) => {
    const r = tilt ? 2.5 : -3;
    return { bg: C.paper2, role, els: [
      rect(150, 150, 780, 900, 'FFFFFF', { rot: r, shadow: true }),
      img(185, 185, 710, 710, ph, ex, { rot: r }),
      text(185, 920, 710, 110, cap, { f: 'hand', size: fit(cap, { w: 690, h: 100, size: 76, face: 'hand', lh: 1 }), align: 'center', valign: 'middle', rot: r, color: '2A2A2A', lh: 1 }),
      rect(430, 122, 220, 64, C.hi, { rot: 4, alpha: 0.8 }),
      ...(sub ? [sansT(sub, 150, 1120, 780, 150, 44, { align: 'center' })] : []),
      ...noteBR(note),
    ]};
  },
  // A real customer quote (only with permission).
  quote: ({ q, who, note, role }) => ({ bg: C.paper, role, els: [
    text(90, 230, 300, 260, '“', { f: 'serif', size: 340, color: C.hi, lh: 1 }),
    serifH(q, 96, 500, 888, 520, 92),
    sansT('— ' + who, 96, 1060, 888, 90, 40, { bold: true }),
    ...noteBR(note),
  ]}),
  // The action slide: dark, big line, yellow button-style pill, small second way.
  ask: ({ h, step, sub, note, role = 'Action' }) => ({ bg: C.ink, role, els: [
    text(96, 330, 200, 100, '→', { f: 'hand', size: 100, color: C.hi }),
    serifH(h, 96, 440, 888, 420, 104, 'FFFFFF'),
    ...(step ? [text(96, 900, pillW(step, 46), 110, step, { size: 46, bold: true, fill: C.hi, align: 'center', valign: 'middle', radius: 55 })] : []),
    ...(sub ? [sansT(sub, 96, 1050, 860, 130, 42, { color: 'D9D7D0' })] : []),
    ...noteBR(note),
  ]}),
  // Huge number or short figure, then a line.
  bignum: ({ n, h, sub, bg = C.hi, note, role }) => ({ bg, role, els: [
    // non-breaking spaces keep "40 → 9" on one line (the size shrinks instead)
    text(76, 260, 928, 420, String(n).replace(/ /g, ' '), { f: 'serif', size: fit(String(n).replace(/ /g, ' '), { w: 928, h: 400, size: 340, lh: 0.9, min: 100, face: 'serifWide' }), lh: 0.9, valign: 'bottom' }),
    sansT(h, 76, 720, 900, 240, 70, { bold: true, lh: 1.12 }),
    ...(sub ? [sansT(sub, 76, 980, 880, 200, 46)] : []),
    ...noteBR(note),
  ]}),
  // Two photos side by side with handwritten labels, headline below.
  split: ({ a, b, h, note, role }) => ({ bg: C.paper, role, els: [
    img(76, 76, 452, 860, a.ph, a.ex), img(552, 76, 452, 860, b.ph, b.ex),
    ...(a.label ? [text(96, 850, 400, 96, a.label, { f: 'hand', size: fit(a.label, { w: 380, h: 90, size: 66, face: 'hand', lh: 1 }), fill: 'FFFFFF', align: 'center', valign: 'middle', rot: -3, radius: 8, shadow: true, lh: 1 })] : []),
    ...(b.label ? [text(572, 850, 400, 96, b.label, { f: 'hand', size: fit(b.label, { w: 380, h: 90, size: 66, face: 'hand', lh: 1 }), fill: 'FFFFFF', align: 'center', valign: 'middle', rot: 2, radius: 8, shadow: true, lh: 1 })] : []),
    serifH(h, 76, 1000, 928, 380 - (note ? 0 : 0), 84),
    ...noteTR(note),
  ]}),
  // Numbered list.
  list: ({ title, items = [], bg = C.paper, note, role }) => ({ bg, role, els: [
    sansT(title, 96, 280, 888, 200, 68, { bold: true, lh: 1.12 }),
    ...items.flatMap((it, i) => [text(96, 520 + i * 170, 90, 120, String(i + 1), { f: 'serif', size: 88, lh: 1 }), sansT(it, 200, 528 + i * 170, 790, 150, 54)]),
    ...noteBR(note),
  ]}),
  // Checklist with empty boxes.
  checklist: ({ title, items = [], bg = C.paper2, note, role }) => ({ bg, role, els: [
    sansT(title, 96, 280, 888, 200, 68, { bold: true, lh: 1.12 }),
    ...items.flatMap((it, i) => [rect(96, 538 + i * 160, 60, 60, null, { line: { color: C.ink, w: 7 }, radius: 8 }), sansT(it, 190, 524 + i * 160, 800, 150, 54)]),
    ...noteBR(note),
  ]}),
  // One numbered step with a photo.
  step: ({ n, h, ph, ex, note, role = 'Step' }) => ({ bg: C.paper, role, els: [
    text(56, 10, 300, 440, String(n), { f: 'serif', size: 380, color: C.hi, lh: 1 }),
    serifH(h, 330, 90, 674, 330, 74),
    img(76, 470, 928, 894, ph, ex),
    ...noteBR(note), // bottom-right, over the photo, so the step heading stays readable
  ]}),
  // Before (top) and after (bottom), same angle.
  beforeAfter: ({ before, after, h, note, role = 'Proof' }) => ({ bg: C.paper, role, els: [
    img(0, 0, 1080, 714, before.ph, before.ex), img(0, 726, 1080, 714, after.ph, after.ex),
    text(54, 54, 230, 66, 'BEFORE', { size: 32, bold: true, fill: C.white, align: 'center', valign: 'middle', radius: 33, charSpacing: 4 }),
    text(54, 780, 230, 66, 'AFTER', { size: 32, bold: true, fill: C.white, align: 'center', valign: 'middle', radius: 33, charSpacing: 4 }),
    ...(h ? [sansT(h, 300, 1250, 726, 140, 44, { bold: true, color: 'FFFFFF', fill: C.ink, align: 'right', valign: 'middle', radius: 16 })] : []),
    ...noteTR(note),
  ]}),
  // The myth, crossed out. (The fact goes on the next slide.)
  myth: ({ myth, note, role = 'Hook 1' }) => ({ bg: C.paper, role, els: [
    kickPill('Myth', 96, 330),
    serifH(myth, 96, 440, 888, 480, 112, C.ink, { strike: true }),
    sansT('The truth is on the next slide.', 96, 960, 860, 90, 44),
    ...noteBR(note),
  ]}),
  // Two-column comparison table.
  table: ({ title, cols, rows, note, role }) => ({ bg: C.white, role, els: [
    sansT(title, 96, 280, 888, 120, 68, { bold: true }),
    rect(96, 450, 888, 6, C.ink),
    sansT(cols[0], 380, 470, 300, 90, 46, { bold: true, valign: 'middle' }), sansT(cols[1], 700, 470, 290, 90, 46, { bold: true, valign: 'middle' }),
    ...rows.flatMap((r, i) => [rect(96, 570 + i * 160, 888, 3, 'CFCABF'),
      text(96, 585 + i * 160, 270, 130, r[0].toUpperCase(), { size: 32, bold: true, color: '5A564E', valign: 'middle', charSpacing: 2 }),
      sansT(r[1], 380, 585 + i * 160, 300, 130, 44, { valign: 'middle' }), sansT(r[2], 700, 585 + i * 160, 290, 130, 44, { valign: 'middle' })]),
    ...noteBR(note),
  ]}),
  // Question bubble + answer bubble, like a DM.
  qa: ({ q, a, bg = C.paper2, note, role }) => ({ bg, role, els: [
    sansT(q, 96, 300, 760, 300, 66, { fill: 'FFFFFF', radius: 40, valign: 'middle' }),
    sansT(a, 224, 660, 760, 480, 60, { fill: C.ink, color: 'FFFFFF', radius: 40, valign: 'middle' }),
    ...noteBR(note),
  ]}),
};

// =============================== STORY LAYOUTS ===============================
const SN = (s) => N(140, 1290, 800, noteH(s, 44), s);
// White Story text bar. Words fitted to 660px inside the 800px bar (Canva drops the bar's inner padding).
const pill = (s, y) => { const two = String(s).length > 22, h = two ? 210 : 130; return text(140, y, 800, h, s, { size: fit(s, { w: 660, h: h - 30, size: two ? 58 : 64, lh: 1.2, face: 'sansBold' }), bold: true, fill: 'FFFFFF', align: 'center', valign: 'middle', radius: 22, lh: 1.2 }); };
const pillH = (s) => (String(s).length > 22 ? 210 : 130);
// zone: { kind: 'poll' | 'question box' | 'quiz' | 'emoji slider' | 'countdown' | 'link sticker', sample: '…' }
const Z = (z, y) => zoneEl(150, y, 780, 360, z.kind, z.sample);
export const S = {
  // Full-screen photo or video, a white text bar, optional sticker placeholder.
  photo: ({ ph, ex, pillText, zone, note, role }) => ({ bg: C.ink, role, els: [
    img(0, 0, 1080, 1920, ph, ex),
    ...(pillText ? [pill(pillText, 330)] : []),
    ...(zone ? [Z(zone, pillText ? 330 + pillH(pillText) + 90 : 400)] : []),
    ...SN(note),
  ]}),
  // Two photos stacked (this-or-that), sticker placeholder at the top, text bar on the seam.
  split: ({ a, b, pillText, zone, note, role }) => ({ bg: C.ink, role, els: [
    img(0, 0, 1080, 960, a.ph, a.ex), img(0, 966, 1080, 954, b.ph, b.ex),
    ...(zone ? [Z(zone, 290)] : []),
    ...(pillText ? [pill(pillText, 895)] : []),
    ...SN(note),
  ]}),
  // Solid-color text frame (Instagram "Create" style), optional sticker placeholder.
  text: ({ bg = 'dark', big, sub, serif, zone, note, role }) => {
    const B = { dark: C.ink, yel: C.hi, paper: C.paper }[bg];
    const col = bg === 'dark' ? 'FFFFFF' : C.ink;
    const subCol = bg === 'dark' ? C.hi : C.ink;
    const top = zone ? 300 : 440, bh = zone ? 400 : 520;
    return { bg: B, role, els: [
      ...(big ? [text(110, top, 860, bh, big, { f: serif ? 'serif' : 'sans', bold: !serif, size: fit(big, { w: 860, h: bh, size: serif ? 150 : 110, lh: 1.04, face: serif ? 'serif' : 'sansBold' }), color: col, lh: 1.04, valign: 'bottom' })] : []),
      ...(sub ? [sansT(sub, 110, top + bh + 30, 860, zone ? 130 : 200, 60, { color: subCol, bold: true })] : []),
      ...(zone ? [Z(zone, 890)] : []),
      ...SN(note),
    ]};
  },
};

// =============================== REEL LAYOUTS (1080 × 1920) ===============================
// Cover text stays inside y 300–1620: the part that survives the 4:5 feed crop and the 3:4 profile-grid crop.
const centerPill = (s, y, size) => kickPill(s, Math.round((1080 - pillW(s, size)) / 2), y, size);
export const R = {
  // Reel cover: photo, dark wash, series name pill, big episode title, episode number. Note sits in the cropped-off top.
  cover: ({ ph, ex, series, title, ep, note, role }) => ({ bg: C.ink, role, els: [
    img(0, 0, 1080, 1920, ph, ex),
    rect(0, 0, 1080, 1920, C.ink, { alpha: 0.45 }),
    centerPill(series, 440, 40),
    text(110, 545, 860, 140, ep, { f: 'hand', size: 116, color: C.hi, align: 'center', valign: 'middle', lh: 1 }),
    serifH(title, 110, 700, 860, 600, 132, 'FFFFFF', { align: 'center', valign: 'top' }),
    ...N(40, 40, 1000, noteH(note, 52), note),
  ]}),
  // First 2 seconds: your clip, the series tag, and this episode's hook, inside the Reel safe zone.
  open: ({ ph, ex, tag, hook, note, role }) => ({ bg: C.ink, role, els: [
    img(0, 0, 1080, 1920, ph, ex),
    centerPill(tag, 300, 34),
    pill(hook, 410),
    ...SN(note),
  ]}),
};
