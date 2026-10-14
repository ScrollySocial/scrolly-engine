// Scrolly brand kit for Reels: the ONLY file a customer swaps for their own look.
// Colors by role and the three font families (files live in lib/assets/fonts and get copied into each Reel).
// Type roles this kit encodes: statements = condensed heavy grotesque, emphasis = peach marker swipe, asides = handwriting.
export default {
  name: 'scrolly',
  label: 'Scrolly',
  C: { cream: '#F6EEE5', cream2: '#FFF4DC', peach: '#FFC9A8', ink: '#161210', orange: '#E05A33', blush: '#F8DCE5', mist: '#E7EEF5' },
  font: {
    body: 'ScrollyFigtree', // captions + small words
    statement: 'ScrollyBricolage', // big statements
    hand: 'ScrollyHand', // handwritten asides, labels on objects
  },
  fontFaces: `@font-face{font-family:'ScrollyFigtree';src:url('assets/fonts/figtree.woff2') format('woff2');font-weight:300 900}
@font-face{font-family:'ScrollyBricolage';src:url('assets/fonts/bricolage-800.woff2') format('woff2');font-weight:800;font-stretch:75% 100%}
@font-face{font-family:'ScrollyHand';src:url('assets/fonts/covered-by-your-grace.woff2') format('woff2')}`,
  fontFiles: ['figtree.woff2', 'bricolage-800.woff2', 'covered-by-your-grace.woff2'],
  site: 'scrollyseo.com',
};
