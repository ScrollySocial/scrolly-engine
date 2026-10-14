// Usage: node check-home.mjs   Sanity checks on dist/home.html: inline script parses, no ampersands (WordPress mangles them), key markup counts.
import fs from 'fs';
const h = fs.readFileSync('dist/home.html', 'utf8');
const s = h.slice(h.indexOf('<script id="scx-js">') + 20, h.lastIndexOf('</script>'));
try { new Function(s); console.log('script syntax ok'); } catch (e) { console.log('SCRIPT ERROR', e.message); }
const live = s.slice(s.indexOf('(function(){var rails'));
console.log('ampersands in live-cards part:', (live.match(/&/g) || []).length, '| && anywhere in page script:', (s.match(/&&/g) || []).length);
const n = (re) => (h.match(re) || []).length;
console.log('tsets', n(/class="tset/g), 'tier-btns', n(/class="tier-btn"/g), 'hsl-pause', n(/hsl-pause/g), 'hsl-prev', n(/hsl-prev/g));
