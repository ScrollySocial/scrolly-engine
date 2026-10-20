// WCAG AA contrast check for every text/background pair the 2026-10 rebrand uses (v3.css, chrome.css, home.css, k1-account.css, Club pages),
// in the "less girly" tone of 2026-10-20 (blue mist instead of lavender, no baby pink, hot pink only as a rare signature on navy).
// Run: node chrome/contrast.mjs   AA: 4.5 for normal text, 3 for large text (24px+, or 18.66px+ bold). Exit code 1 if any pair fails.
const lum = (hex) => hex.slice(1).match(/../g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const C = { cream: '#f7f3ec', navy: '#0a1930', fnavy: '#0b142c', sky: '#4da3ff', pink: '#ff3b7f', mist: '#dfe4f0', mistInk: '#c9d1e6', muted: '#4a4e66', white: '#ffffff', soft: '#f5f1ff', panel: '#ece6dc', line: '#d9d3ca', warn: '#fff3c4' };
const ROWS = [
  ['Body text: navy on off-white', C.navy, C.cream],
  ['Muted text on off-white', C.muted, C.cream],
  ['Muted text on white card', C.muted, C.white],
  ['Muted text on blue-mist panel', C.muted, C.mist],
  ['Muted text on account panel #ece6dc', C.muted, C.panel],
  ['Text on blue-mist card / panel / light button', C.navy, C.mist],
  ['Primary button, tags, sign-up button: navy on sky', C.navy, C.sky],
  ['Button hover, sale badge: white on navy', C.white, C.navy],
  ['Earned band text: white on navy', C.white, C.navy],
  ['Earned word "They’re earned." hot pink on navy (large)', C.pink, C.navy, 'large'],
  ['Footer "Tiger." hot pink on footer navy (large)', C.pink, C.fnavy, 'large'],
  ['Big numbers on navy (member area, dark bands): sky', C.sky, C.navy],
  ['Footer links + sign-up line: mist on footer navy', C.mist, C.fnavy],
  ['Footer legal, notes, coming soon: mist-ink on footer navy', C.mistInk, C.fnavy],
  ['Footer headings: soft white on footer navy', C.soft, C.fnavy],
  ['Drawer links: white on navy', C.white, C.navy],
  ['Drawer hover: sky on navy', C.sky, C.navy],
  ['Drawer "coming soon", fine text on dark band: mist-ink on navy', C.mistInk, C.navy],
  ['Footer field: navy on white', C.navy, C.white],
  ['Footer placeholder #595959 on white', '#595959', C.white],
  ['Dropdown "coming soon": muted on white', C.muted, C.white],
  ['Disabled button text on line gray', '#3d3a36', C.line],
  ['Warning note: navy on #fff3c4', C.navy, C.warn],
];
let fails = 0;
for (const [label, fg, bg, size] of ROWS) {
  const r = ratio(fg, bg), need = size === 'large' ? 3 : 4.5, ok = r >= need;
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (needs ${need})  ${label}`);
}
console.log('\nNever used (fail): hot pink on off-white (3.07), white on sky (2.63), white on hot pink, sky text on off-white (2.37).');
console.log(`${fails} failing pairs in use.`);
process.exitCode = fails ? 1 : 0;
