// YOUR brand kit for Reels: the one file that decides your look. The "set up my Reel engine" skill fills it in with you.
// Until then it holds neutral starter values (marked EDIT ME), so a test Reel builds and renders.
//
// Colors are by ROLE, not by name: every component and cover reads these seven, so keep all seven keys.
//   cream   main light background (panels, cards, cover background)
//   cream2  a second, warmer light tone (paper, receipts)
//   peach   the marker swipe behind emphasized words (<m>word</m>): pick a light color dark text reads on
//   ink     text and outlines (near-black works best)
//   orange  the rare accent splash (an ✗, a circle, one sticker): use it sparingly
//   blush   a soft panel color
//   mist    a second soft panel color
//
// Fonts: three roles. Font files go in lib/assets/fonts and need a license that allows use in video (Google Fonts are
// all fine; a paid desktop font may not be: check before using it). Keep the license file next to the font.
// The starter fonts below are SIL Open Font License 1.1 (license files in lib/assets/fonts).
export default {
  name: 'my-brand', // keep this id: brand/index.mjs and reel-settings.json use it (change label instead)
  label: 'My brand', // EDIT ME: the name shown in the review page's Brand kit dropdown
  C: {
    cream: '#F4F1EC', // EDIT ME
    cream2: '#FBF8F2', // EDIT ME
    peach: '#FFD98A', // EDIT ME (marker)
    ink: '#141414', // EDIT ME
    orange: '#D9482B', // EDIT ME (accent)
    blush: '#F2E1DC', // EDIT ME
    mist: '#E3EAF0', // EDIT ME
  },
  font: {
    body: 'BrandBody', // captions + small words
    statement: 'BrandStatement', // big statements (a heavy, condensed sans works best)
    hand: 'BrandHand', // handwritten asides, labels on objects
  },
  // EDIT ME if you change fonts: one @font-face per role, the file name in assets/fonts/
  fontFaces: `@font-face{font-family:'BrandBody';src:url('assets/fonts/figtree.woff2') format('woff2');font-weight:300 900}
@font-face{font-family:'BrandStatement';src:url('assets/fonts/bricolage-800.woff2') format('woff2');font-weight:800;font-stretch:75% 100%}
@font-face{font-family:'BrandHand';src:url('assets/fonts/covered-by-your-grace.woff2') format('woff2')}`,
  fontFiles: ['figtree.woff2', 'bricolage-800.woff2', 'covered-by-your-grace.woff2'],
  // EDIT ME: the default caption font, by role: 'body' (clean, the default), 'statement' (big and bold) or 'hand'
  // (handwritten). The review page can still switch it for one Reel.
  captionFont: 'body',
  site: '', // EDIT ME: your website, shown on end cards (e.g. 'yoursite.com'), or leave empty
};
