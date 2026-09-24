(() => {
  const vis = (e) => e && getComputedStyle(e).display !== 'none';
  const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return { c: p.slice(0, 3), a: p[3] === undefined ? 1 : p[3] }; };
  const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const p = parse(getComputedStyle(e).backgroundColor); if (p && p.a > .5) return p.c; } return [251, 248, 243]; };
  let low = 0; const ex = [];
  document.querySelectorAll('.scx *,.scx-sales *,.footerpage *').forEach((el) => {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || el.closest('.drawer') || el.closest('.scrolly-resource-popup')) return;
    const fg = parse(cs.color); if (!fg || fg.a < .9) return; const bg = bgOf(el);
    const L1 = lum(fg.c), L2 = lum(bg), cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700; const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
    if (cr < need) { low++; if (ex.length < 4) ex.push(cr.toFixed(1) + '/' + need + ' ' + el.tagName + '.' + (el.className || '').toString().slice(0, 20) + ' "' + el.textContent.trim().slice(0, 25) + '"'); }
  });
  return JSON.stringify({
    p: location.pathname, w: innerWidth, overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ourHeaders: document.querySelectorAll('.hdr').length, themeHeaderVisible: vis(document.getElementById('site-header')), themeFooterVisible: vis(document.getElementById('site-footer')),
    ourFooters: document.querySelectorAll('.ftr').length,
    brokenImgs: [...document.images].filter((i) => i.complete && !i.naturalWidth && i.src).map((i) => i.src.split('/').pop()),
    h1: [...document.querySelectorAll('h1')].filter(vis).length, lowContrast: low, ex,
  });
})()
