// Hand-drawn doodles in a marker look (Mercedes 2026-10-21): stars, a circle and a tick box. Shared by templates.mjs
// (doodle layer) and layouts.mjs (cover layouts). Seeded, so a rebuild draws the same shapes.
// Hand-drawn stars (Mercedes 2026-10-21: "more like hand drawn elements rather than computer shapes", and fewer):
// jittered points, two loose marker passes, a wobble filter, optional scribbled fill. Seeded so a rebuild looks the same.
export function handStar(c, { pts = 4, fill = false, sw = 3.4, seed = 3 } = {}) {
  let hs = seed; const hr = () => ((hs = (hs * 9301 + 49297) % 233280) / 233280);
  const path = (j) => {
    const p = [];
    for (let i = 0; i < pts * 2; i++) {
      const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 9 + hr() * 3 : 46 + hr() * 6;
      p.push([50 + Math.cos(a) * r + (hr() - .5) * j, 50 + Math.sin(a) * r + (hr() - .5) * j]);
    }
    return 'M' + p.map(([x, y], i) => {
      if (!i) return `${x.toFixed(1)} ${y.toFixed(1)}`;
      const [px, py] = p[i - 1];
      return `Q${((px + x) / 2 + (hr() - .5) * 6).toFixed(1)} ${((py + y) / 2 + (hr() - .5) * 6).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ') + ` Q${(p[0][0] + 3).toFixed(1)} ${(p[0][1] + 2).toFixed(1)} ${(p[0][0] + 1.5).toFixed(1)} ${(p[0][1] + 5).toFixed(1)}`;
  };
  const id = 'hs' + seed + '_' + Math.round(hr() * 1e6);
  const scrib = fill ? Array.from({ length: 9 }, (_, i) => `<path d="M${(30 + hr() * 8).toFixed(1)} ${22 + i * 7} L${(70 - hr() * 8).toFixed(1)} ${32 + i * 7}" stroke="${c}" stroke-width="${(sw * .8).toFixed(2)}" stroke-linecap="round" opacity=".75"/>`).join('') : '';
  return `<svg viewBox="0 0 100 100" overflow="visible"><defs><filter id="${id}"><feTurbulence baseFrequency=".06" numOctaves="2" seed="${Math.round(hr() * 99)}"/><feDisplacementMap in="SourceGraphic" scale="3.5"/></filter><clipPath id="c${id}"><path d="${path(0)}"/></clipPath></defs><g filter="url(#${id})" fill="none" stroke-linecap="round" stroke-linejoin="round"><g clip-path="url(#c${id})">${scrib}</g><path d="${path(4)}" stroke="${c}" stroke-width="${sw}"/><path d="${path(7)}" stroke="${c}" stroke-width="${(sw * .55).toFixed(2)}" opacity=".7"/></g></svg>`;
}

// Hand-drawn circle and tick box, same marker look as handStar. Doodles must do a job (circle the key number,
// tick a choice, point at something), never decorate or touch text (Mercedes 2026-10-21).
export function wobble(id, seed, body) {
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible"><defs><filter id="${id}"><feTurbulence baseFrequency=".05" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter></defs><g filter="url(#${id})" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
}
export function handCircle(c, { sw = 3, seed = 5 } = {}) {
  const loop = (r, o) => `M${50 - r + o} 52 C${50 - r} ${18 + o}, ${50 + r - 6} 6, ${50 + r} 46 S${58} ${96 - o}, ${18 + o} 74 S${30} ${12 + o}, ${64} 10`;
  return wobble('hc' + seed, seed, `<path d="${loop(46, 0)}" stroke="${c}" stroke-width="${sw}" vector-effect="non-scaling-stroke"/><path d="${loop(44, 4)}" stroke="${c}" stroke-width="${sw * .5}" opacity=".7" vector-effect="non-scaling-stroke"/>`);
}
export function handBox(c, { tick = false, sw = 3.4, seed = 9 } = {}) {
  return wobble('hb' + seed, seed, `<path d="M8 10 L92 6 L95 90 L6 94 Z" stroke="${c}" stroke-width="${sw}"/><path d="M10 13 L90 9 L92 88 L9 91" stroke="${c}" stroke-width="${sw * .5}" opacity=".6"/>${tick ? `<path d="M22 52 L44 76 L96 -8" stroke="${c}" stroke-width="${sw * 1.6}"/>` : ''}`);
}

