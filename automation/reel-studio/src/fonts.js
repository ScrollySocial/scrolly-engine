// Brand fonts served from public/fonts (Google Fonts, OFL), so renders never wait on a slow fonts.googleapis.com.
import { staticFile, delayRender, continueRender } from 'remotion';

export const FIGTREE = 'ScrollyFigtree', SERIF = 'ScrollySerif', BRICOLAGE = 'ScrollyBricolage';
const faces = [
  [FIGTREE, 'figtree.woff2', { weight: '300 900' }],
  [SERIF, 'instrument-serif-italic.woff2', { style: 'italic' }],
  [BRICOLAGE, 'bricolage-800.woff2', { weight: '800', stretch: '75% 100%' }],
];
if (typeof document !== 'undefined') {
  const handle = delayRender('brand fonts');
  Promise.all(faces.map(([family, file, desc]) => new FontFace(family, `url(${staticFile('fonts/' + file)}) format('woff2')`, desc).load()
    .then((f) => document.fonts.add(f))))
    .then(() => continueRender(handle))
    .catch((e) => { console.error('font load failed', e); continueRender(handle); });
}
