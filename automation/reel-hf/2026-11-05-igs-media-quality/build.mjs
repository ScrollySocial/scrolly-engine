// Instagram settings 5: Upload at highest quality (planner card c7828d0ea19e). Hook take IMG_2152 (2026-11-04), then
// her screen recording PQXN5173 (2026-11-05): Settings and activity scroll → tap Media quality (130.3) → "Upload at
// highest quality" on. Series look: ../_series/ig-settings.mjs. Honest: sharper uploads, not a reach boost.
// Usage: node build.mjs | node build.mjs review. Footage: prep-footage → grade.mjs → screen.mjs (screen.json)
import { igsReel } from '../_series/ig-settings.mjs';

await igsReel({
  title: 'Instagram settings 5: Upload at highest quality',
  hook: { a: 'Check these', b: 'Secret', c: 'settings', top: 115, swipe: 'secret', punch: 'secret' },
  frames: [
    { part: 0, note: 'Settings and activity scrolls (her recording), path pill; zoom to Media quality, ring, her tap',
      zoom: { at: { part: 1, dt: 0 }, scale: 1.25, origin: '0% 29%' }, rings: [{ x: -1, y: 46, w: 44, h: 13, at: { part: 1, dt: 0.5 } }], tap: { part: 2, dt: 0.3 } },
    { part: 3, note: 'Media quality page: ring around the “Upload at highest quality” switch (on; never across the description), slow push in',
      rings: [{ x: 73, y: 40.5, w: 23, h: 13, at: { part: 3, dt: 0.35 } }], zoom: { at: { part: 3, dt: 0 }, scale: 1.05, origin: '50% 27%', d: 1.2, ease: 'none' } },
  ],
  covers: [
    { text: 'Why your Reels look <m>blurry</m>', aside: 'check this setting' },
    { text: 'Instagram account <m>not growing</m>?' },
    { text: 'Turn on <m>highest quality</m>' },
  ],
  post: {
    caption: `Instagram settings to check, part 5: Upload at highest quality.

Profile > ☰ (top right) > Settings and activity > Media quality > Upload at highest quality

When it's on, Instagram always uploads your photos and videos at the highest quality, even if it takes a little longer. When it's off, Instagram lowers the quality to fit your connection, which is how a sharp video ends up looking soft.

It won't change your reach by itself, but a crisp Reel is easier to keep watching.

Instagram moves these menus around, so if you can't find it, type "Media quality" into the search bar at the top of Settings and activity.`,
    hashtags: '#instagramtips #reelstips #instagramgrowth',
  },
});
