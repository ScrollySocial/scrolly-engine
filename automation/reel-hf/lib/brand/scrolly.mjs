// Scrolly brand kit for Reels: the ONLY file a customer swaps for their own look.
// Colors by role and the three font families (files live in lib/assets/fonts and get copied into each Reel).
// Type roles this kit encodes: statements = Instrument Serif, upright only (2026-10-21, matches the site; never italic in
// her own Reels), emphasis = marker swipe, asides = handwriting (she loves it: keep), captions = Figtree.
// Colors = the 2026-10-20 rebrand (vault brand/visual-system.md). The keys are ROLES, kept from the first kit so every
// component, saved review choice and customer kit keeps working:
//   cream = page ground (off-white)   cream2 = light text on footage / navy   ink = all text on light grounds (navy)
//   peach = the marker swipe behind <m>words</m> (sky blue, navy text on it)   orange = the accent: rings, arrows' pop
//   blush, mist = soft panels (blue mist)   pink = hot pink, means Mercedes. Nothing uses it yet: never a glow around her;
//   maybe only on Reels about her own story (not teaching, not other businesses), still to be decided with her.
// Retired, never back: orange #ff4b16/#e8522b, peach #ffb38f/#FFC9A8, cream #F6EEE5, black as a ground.
export default {
  name: 'scrolly',
  label: 'Scrolly',
  C: { cream: '#f7f3ec', cream2: '#ffffff', peach: '#4da3ff', ink: '#0a1930', orange: '#4da3ff', blush: '#dfe4f0', mist: '#dfe4f0', pink: '#ff3b7f' },
  font: {
    body: 'ScrollyFigtree', // captions + small words
    statement: 'ScrollyInstrument', // big statements, cover titles
    hand: 'ScrollyHand', // handwritten asides, labels on objects
  },
  // how statements are set; a kit without this gets the heavy condensed default (Bricolage 800 at 78% width).
  // thin: true = a light display face: stronger shadow on video, titles never shrink below 60%
  statementType: { file: 'instrument-serif.ttf', format: 'truetype', weight: 400, stretch: '100%', thin: true },
  fontFaces: `@font-face{font-family:'ScrollyFigtree';src:url('assets/fonts/figtree.woff2') format('woff2');font-weight:300 900}
@font-face{font-family:'ScrollyInstrument';src:url('assets/fonts/instrument-serif.ttf') format('truetype')}
@font-face{font-family:'ScrollyHand';src:url('assets/fonts/covered-by-your-grace.woff2') format('woff2')}`,
  fontFiles: ['figtree.woff2', 'instrument-serif.ttf', 'covered-by-your-grace.woff2'],
  site: 'scrollyseo.com',
};
