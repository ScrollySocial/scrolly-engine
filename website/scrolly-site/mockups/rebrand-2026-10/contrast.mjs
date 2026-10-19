// WCAG contrast check for the rebrand mockup (colour shortlist 2026-10-19). Run: node contrast.mjs
// AA: 4.5 for normal text, 3 for large text (24px+, or 18.66px+ bold).
const lum = (hex) => hex.slice(1).match(/../g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const COMBOS = { 'P5 + N1': ['#ff5fae', '#0b1f3f', '#15305a', '#071530'], 'P4 + N1': ['#ff3b7f', '#0b1f3f', '#15305a', '#071530'], 'P4 + N2': ['#ff3b7f', '#0a1930', '#142744', '#050f20'] };
const LAV = '#e3d9ff', LAV2 = '#c9b8ff', LSOFT = '#f4f0ff', OFF = '#f5f1ff', BABY = '#fbd3e4', BLUSH = '#fff4fa', WHITE = '#ffffff';
let fails = 0;
for (const [name, [P, N, N2, N3]] of Object.entries(COMBOS)) {
  console.log(`\n${name}`);
  const rows = [
    ['Button text: navy on pink', N, P, 'normal'], ['Button: white on navy', WHITE, N, 'normal'], ['Button: navy on lilac', N, LAV2, 'normal'],
    ['Text: navy on lavender', N, LAV, 'normal'], ['Muted #3f4573 on lavender', '#3f4573', LAV, 'normal'], ['Text: navy on soft lavender card', N, LSOFT, 'normal'],
    ['Text: navy on blush', N, BLUSH, 'normal'], ['Off-white: navy on cream', N, '#f7f3ec', 'normal'], ['Off-white: muted #4a4e66 on cream', '#4a4e66', '#f7f3ec', 'normal'], ['Text: navy on baby pink band', N, BABY, 'normal'], ['Hero (pink-led): navy on pink', N, P, 'large'],
    ['Text: off-white on navy', OFF, N, 'normal'], ['Text: off-white on navy card', OFF, N2, 'normal'], ['Italic: pink on navy', P, N, 'large'],
    ['Big $: pink on navy card', P, N2, 'large'], ['Baby pink text on navy', BABY, N, 'normal'], ['Footer: baby pink links on deep navy', BABY, N3, 'normal'],
    ['Footer: pink "Tiger." on deep navy', P, N3, 'large'], ['Footer tag: navy on baby pink', N, BABY, 'normal'],
  ];
  for (const [label, fg, bg, size] of rows) {
    const r = ratio(fg, bg), need = size === 'large' ? 3 : 4.5, ok = r >= need; if (!ok) fails++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (needs ${need})  ${label}`);
  }
}
console.log('\nNever used (fail): pink text on lavender, blush or cream (P4 on cream is 3.07, too close), white text on any of the pinks, baby pink next to lavender (too close).');
console.log(`${fails} failing pairs in use.`);
process.exitCode = fails ? 1 : 0;
