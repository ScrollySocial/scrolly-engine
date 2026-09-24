// Paste into the browser console on a published page. Lists text elements whose contrast vs. effective background is below WCAG AA.
(() => {
  const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return { c: p.slice(0, 3), a: p[3] === undefined ? 1 : p[3] }; };
  const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const p = parse(getComputedStyle(e).backgroundColor); if (p && p.a > .5) return p.c; } return [251, 248, 243]; };
  const out = [];
  document.querySelectorAll('.scx *').forEach((el) => {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') return;
    if (el.closest('.drawer')) return;
    const fg = parse(cs.color); if (!fg) return;
    const bg = bgOf(el);
    const L1 = lum(fg.c), L2 = lum(bg); const cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
    const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
    if (cr < need && fg.a >= .9) out.push(cr.toFixed(2) + ' need ' + need + ' | ' + el.tagName + '.' + el.className + ' | ' + el.textContent.trim().slice(0, 40));
  });
  return out.length ? out.join('\n') : 'ALL OK';
})();
