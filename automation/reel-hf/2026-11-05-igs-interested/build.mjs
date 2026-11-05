// Instagram settings 6: Interested (planner card e64a9a8927f2). Hook take IMG_2137 (2026-11-04), then her screen
// recording JZAC2850 (2026-11-05): Settings and activity → tap Your activity (59.25) → scroll to Suggested content →
// Interested. Series look: ../_series/ig-settings.mjs. Honest (card note): Interested shapes what SHE sees, so she can
// study her niche; it does not push her own Reels.
// Usage: node build.mjs | node build.mjs review. Footage: prep-footage → grade.mjs → screen.mjs (screen.json)
import { igsReel } from '../_series/ig-settings.mjs';

await igsReel({
  title: 'Instagram settings 6: Interested',
  hook: { a: 'Instagram', b: 'hack', c: 'to grow', top: 114, swipe: 'hack', punch: 'hack' },
  frames: [
    { part: 0, note: 'Settings and activity (her recording), path pill; zoom to Your activity, ring, her tap',
      zoom: { at: { part: 0, dt: 0.15 }, scale: 1.25, origin: '0% 52%' }, rings: [{ x: -1, y: 86, w: 44, h: 14, at: { part: 0, dt: 0.55 } }], tap: { part: 0, dt: 1.25 } },
    { part: 1, note: 'Your activity page scrolls to Suggested content; zoom in, ring around “Interested”',
      zoom: { at: { part: 3, dt: 0.05 }, scale: 1.15, origin: '0% 66%' }, rings: [{ x: -1, y: 111, w: 40, h: 14, at: { part: 3, dt: 0.6 } }] },
  ],
  covers: [
    { text: 'Fill your feed with <m>your niche</m>', aside: 'try this' },
    { text: 'The Instagram <m>hack</m> to grow' },
    { text: 'Study your niche <m>faster</m>' },
  ],
  post: {
    caption: `Instagram settings to check, part 6: Interested.

When you see a post in your niche on Explore, tap ⋯ (top right of the post) > Interested. Instagram shows you more posts like it.

To see everything you've marked: Profile > ☰ (top right) > Settings and activity > Your activity > Interested

This shapes what YOU see, not who sees your posts. It fills your Explore page with your niche, so you can study what's working and get ideas for your own Reels faster.

Instagram moves these menus around, so if you can't find it, type "Interested" into the search bar at the top of Settings and activity.`,
    hashtags: '#instagramtips #contentideas #instagramgrowth',
  },
});
