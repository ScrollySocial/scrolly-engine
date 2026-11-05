// Instagram settings 4: Sharing and reuse (planner card fb7d176ea8ef). Hook take IMG_2164 (2026-11-04), then her screen
// recording PQXN5173 (2026-11-05): Settings and activity → tap Sharing and reuse (98.7) → the sharing toggles → scroll to
// Downloads. Series look: ../_series/ig-settings.mjs (card 1's approved v7). Honest: these let people share, repost,
// remix and download your posts; more sharing can put them in front of more people, no promise of a reach boost.
// Usage: node build.mjs | node build.mjs review. Footage: prep-footage → grade.mjs → screen.mjs (screen.json)
import { igsReel } from '../_series/ig-settings.mjs';

await igsReel({
  title: 'Instagram settings 4: Sharing and reuse',
  hook: { a: 'Instagram', b: 'hack', c: 'to grow', top: 96, swipe: 'hack', punch: 'hack' },
  frames: [
    { part: 0, note: 'Settings and activity (her recording), path pill; zoom to Sharing and reuse, ring, her tap',
      zoom: { at: { part: 0, dt: 0.35 }, scale: 1.25, origin: '0% 73.7%' }, rings: [{ x: -1, y: 126, w: 54, h: 10, at: { part: 0, dt: 0.9 } }], tap: { part: 0, dt: 1.7 } },
    { part: 1, note: 'Sharing and reuse page: ring around “Posts and reels to stories” + “Reposts” (both on)',
      rings: [{ x: -1.5, y: 104, w: 101, h: 24, at: { part: 1, dt: 0.5 } }] },
    { part: 2, note: 'Scroll down to Downloads (on): ring around its switch (never across the description), slow push in',
      rings: [{ x: 73, y: 93, w: 23, h: 14, at: { part: 3, dt: 0.15 } }], zoom: { at: { part: 3, dt: 0 }, scale: 1.05, origin: '50% 59%', d: 1.4, ease: 'none' } },
  ],
  covers: [
    { text: 'Let people <m>share</m> your Reels', aside: 'check this setting' },
    { text: 'The Instagram <m>hack</m> to grow' },
    { text: 'Is <m>sharing</m> turned on?' },
  ],
  post: {
    caption: `Instagram settings to check, part 4: Sharing and reuse.

Profile > ☰ (top right) > Settings and activity > Sharing and reuse

Turn these on:
1. Posts and reels to stories, so people can share your posts to their Story
2. Reposts on posts and reels, so people can repost them to their followers
3. Posts and Reels under "create with and reuse", so people can remix them
4. Downloads, so people can save your public Reels

Every share, repost and remix shows your post to someone else's audience. With these off, people who want to pass your post along can't.

Instagram moves these menus around, so if you can't find it, type "Sharing" into the search bar at the top of Settings and activity.`,
    hashtags: '#instagramtips #instagramgrowth #reelstips',
  },
});
