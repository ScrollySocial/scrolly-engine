// Cover options for her pick (her cut-out from the hook take on a brand color). Usage: node cover-options.mjs
import { renderCovers } from '../lib/cover.mjs';
const options = [
  { text: 'Instagram account <m>not growing</m>?', aside: 'check this first', style: 'cut', bg: 'mist' },
  { text: 'Can Instagram <m>recommend</m> your Reels?', style: 'side', bg: 'cream' },
  { text: '<m>Not growing</m>? Check this setting', style: 'behind', bg: 'ink' },
];
await renderCovers({ options, cut: 'sketch/f01-cut.png', outDir: 'review/covers' });
