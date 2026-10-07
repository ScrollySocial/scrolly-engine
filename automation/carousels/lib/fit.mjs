// Shrink-to-fit inside each style's safe area, measuring the text block, its children and any circled/accent words.
// Returns one { i, size, ok, lines } per slide; ok=false means it doesn't fit even at the style minimum (split the slide).
export function fitSlides(pg, sz) {
  return pg.evaluate((sz) => {
    const res = [];
    for (const s of document.querySelectorAll('section.s')) {
      const i = +s.dataset.i, p = s.querySelector('.fit');
      if (!p) { res.push({ i, size: 0, min: 0, ok: true, lines: 0 }); continue; }
      const txt = s.querySelector('.txt'), card = s.querySelector('.card');
      const margin = s.classList.contains('blk') ? 120 : s.classList.contains('fmt-card') ? 60 : 90;
      const sr = s.getBoundingClientRect();
      const fits = () => {
        const rs = (card ? [card] : [...txt.children, ...txt.querySelectorAll('em')].filter((e) => !e.classList.contains('spk'))).map((e) => e.getBoundingClientRect());
        const box = { left: Math.min(...rs.map((r) => r.left)), right: Math.max(...rs.map((r) => r.right)), top: Math.min(...rs.map((r) => r.top)), bottom: Math.max(...rs.map((r) => r.bottom)) };
        const top = sr.top + (s.classList.contains('fmt-notes') ? 0 : margin);
        return box.left >= sr.left + 40 && box.right <= sr.right - 40 && box.top >= top && box.bottom <= sr.bottom - margin;
      };
      let size = parseFloat(getComputedStyle(p).fontSize);
      const min = +s.dataset.min || sz.min;
      while (!fits() && size > min) { size -= 2; p.style.fontSize = size + 'px'; }
      // Avoid a single word alone on the last line (style D already balances its lines).
      if (!s.classList.contains('blk-D')) p.style.textWrap = 'pretty';
      res.push({ i, size, min, ok: fits(), lines: Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight)) });
    }
    return res;
  }, sz);
}
