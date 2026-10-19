// WCAG contrast check for the rebrand mockup palettes. Run: node contrast.mjs
// AA: 4.5 for normal text, 3 for large text (24px+, or 18.66px+ bold) and UI outlines.
const lum = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const PINK = '#ff2d95', NAVY = '#0e1543', NAVY2 = '#182160', NAVY3 = '#070b26', LAV = '#e3d9ff', LAV2 = '#c9b8ff', LSOFT = '#f4f0ff', OFF = '#f5f1ff', WHITE = '#ffffff';
// [label, text, background, 'normal'|'large']
const PAIRS = {
  'A Navy-led': [
    ['Body text on navy', OFF, NAVY, 'normal'], ['Muted lavender text on navy', '#cdbfff', NAVY, 'normal'],
    ['Pink italic headline on navy', PINK, NAVY, 'large'], ['Card text on card navy', OFF, NAVY2, 'normal'], ['Pink $ on card', PINK, NAVY2, 'large'],
    ['Button: navy on pink', NAVY, PINK, 'normal'], ['Button 2: navy on lavender', NAVY, LAV2, 'normal'],
    ['Band: navy on pink', NAVY, PINK, 'normal'], ['Band button: white on navy', WHITE, NAVY, 'normal'],
  ],
  'B Pink-led': [
    ['Body text on blush', NAVY, '#fff4fa', 'normal'], ['Muted text on blush', '#454a77', '#fff4fa', 'normal'],
    ['Hero headline navy on pink', NAVY, PINK, 'large'], ['Hero italic white on pink', WHITE, PINK, 'large'], ['Hero lede navy on pink', NAVY, PINK, 'normal'],
    ['Navy italic (pink marker) on blush', NAVY, '#fff4fa', 'large'], ['Card text navy on white', NAVY, WHITE, 'normal'],
    ['Button: white on navy', WHITE, NAVY, 'normal'], ['Button 2: navy on pink', NAVY, PINK, 'normal'],
    ['Band: navy on lavender', NAVY, LAV, 'normal'], ['Band italic navy on lavender', NAVY, LAV, 'large'],
  ],
  'C Lavender-led': [
    ['Body text navy on lavender', NAVY, LAV, 'normal'], ['Muted text on lavender', '#3f4573', LAV, 'normal'],
    ['Navy italic (pink marker) on lavender', NAVY, LAV, 'large'], ['Card text navy on soft lavender', NAVY, LSOFT, 'normal'], ['Navy $ on card', NAVY, LSOFT, 'large'],
    ['Button: navy on pink', NAVY, PINK, 'normal'], ['Button 2: white on navy', WHITE, NAVY, 'normal'],
    ['Band: off-white on navy', OFF, NAVY, 'normal'], ['Band italic pink on navy', PINK, NAVY, 'large'],
  ],
  'Footer (all palettes)': [
    ['Footer text on deep navy', OFF, NAVY3, 'normal'], ['Footer links lavender on deep navy', LAV, NAVY3, 'normal'],
    ['Legal row on deep navy', '#d9cfff', NAVY3, 'normal'], ['Pink "Tiger." on deep navy', PINK, NAVY3, 'large'],
    ['Signup button navy on pink', NAVY, PINK, 'normal'], ['Placeholder tag navy on pink', NAVY, PINK, 'normal'],
  ],
  'Do NOT use (fails)': [
    ['Hot pink text on lavender', PINK, LAV, 'normal'], ['Hot pink text on blush', PINK, '#fff4fa', 'normal'], ['White text on hot pink (small)', WHITE, PINK, 'normal'],
  ],
};
let fails = 0;
for (const [group, rows] of Object.entries(PAIRS)) {
  console.log(`\n${group}`);
  for (const [label, fg, bg, size] of rows) {
    const r = ratio(fg, bg), need = size === 'large' ? 3 : 4.5, ok = r >= need;
    if (!ok && !group.startsWith('Do NOT')) fails++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (needs ${need}, ${size})  ${label}  ${fg} on ${bg}`);
  }
}
console.log(`\n${fails} failing pairs in use.`);
process.exitCode = fails ? 1 : 0;
