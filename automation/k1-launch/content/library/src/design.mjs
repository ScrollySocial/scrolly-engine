// Shared starter look for every Challenge template. Neutral on purpose: customers recolor it to their brand
// in Canva (select a color → "Change all"). No Scrolly branding on customer templates.
// Fonts must exist in Canva's FREE library (custom font upload is Pro-only).
export const C = {
  paper: 'F4F2EC', paper2: 'E7E3D9', ink: '17171A', hi: 'F3D24E', white: 'FBFAF7',
  guide: '2F6BFF', // blue = guide layer (notes + sticker boxes). Customers delete everything blue before download.
};
export const F = { serif: 'DM Serif Display', sans: 'DM Sans', hand: 'Caveat' };

// Element helpers. All coordinates are px on the template's own canvas (1080 wide).
export const img = (x, y, w, h, ph, ex, o = {}) => ({ t: 'img', x, y, w, h, ph, ex, ...o });
export const rect = (x, y, w, h, fill, o = {}) => ({ t: 'rect', x, y, w, h, fill, ...o });
export const text = (x, y, w, h, s, o = {}) => ({ t: 'text', x, y, w, h, s, f: 'sans', size: 48, color: C.ink, align: 'left', valign: 'top', lh: 1.15, ...o });
// A blue "swap in" note: tells the customer what to write here. Hidden in the finished example.
export const note = (x, y, w, h, s) => ({ t: 'note', x, y, w, h, s });
// A dashed blue box marking where a real Instagram sticker goes. Never a fake sticker.
export const zone = (x, y, w, h, title, sub) => ({ t: 'zone', x, y, w, h, title, sub });
