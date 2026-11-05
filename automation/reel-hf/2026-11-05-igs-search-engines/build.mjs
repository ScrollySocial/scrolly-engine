// Instagram settings 8: Show in search engine results (planner card e1e56e8f9b99). Hook take IMG_2170 (2026-11-04),
// then her screen recording JZAC2850 (2026-11-05): Settings and activity scroll → tap Account privacy (141.7) → "Allow
// public photos and videos to appear in search engine results" on. Series look: ../_series/ig-settings.mjs. Honest:
// Instagram's own wording, search engines like Google CAN show public posts; no ranking promise.
// Hook words above her head (Mercedes 2026-11-05: "moved up, not at the bottom").
// Usage: node build.mjs | node build.mjs review. Footage: prep-footage → grade.mjs → screen.mjs (screen.json)
import { igsReel } from '../_series/ig-settings.mjs';

await igsReel({
  title: 'Instagram settings 8: Show in Google and Bing results',
  // GROW starts small and slowly grows until the screen recording (Mercedes 2026-11-05), growing right and down from its top-left so it
  // never climbs into HACK; it stays above her face
  hook: { a: 'Instagram', b: 'hack', c: 'to <span id="hk1g" style="display:inline-block;transform-origin:0 0">grow</span>', top: 17.5, size: 9.5, sizeA: 6.8, swipe: 'hack', punch: 'hack',
    anim: ({ at, SCR }) => [`tl.fromTo('#hk1g', { scale: 1 }, { scale: 1.55, duration: ${(SCR - at('grow')).toFixed(2)}, ease: 'power1.inOut', immediateRender: false }, ${at('grow')});`] },
  frames: [
    { part: 0, note: 'Settings and activity scrolls (her recording), path pill; zoom to Account privacy, ring, her tap',
      zoom: { at: { part: 1, dt: 0.1 }, scale: 1.25, origin: '0% 67.5%' }, rings: [{ x: -1, y: 113, w: 48, h: 14, at: { part: 1, dt: 0.6 } }], tap: { part: 1, dt: 1.3 } },
    { part: 2, note: 'Account privacy page: ring around “Allow public photos and videos to appear in search engine results” switch (on; never across the description), slow push in',
      rings: [{ x: 75.5, y: 63.5, w: 23, h: 14, at: { part: 2, dt: 0.4 } }], zoom: { at: { part: 2, dt: 0 }, scale: 1.03, origin: '50% 40%', d: 2.5, ease: 'none' } },
  ],
  covers: [
    { text: 'Get your Reels on <m>Google</m>', aside: 'one setting' },
    { text: 'The Instagram <m>hack</m> to grow' },
    { text: 'Show up in <m>Google search</m>' },
  ],
  post: {
    caption: `Instagram settings to check, part 8: Show your posts in search engine results.

Profile > ☰ (top right) > Settings and activity > Account privacy > Allow public photos and videos to appear in search engine results

When it's on, search engines like Google can show your public photos and videos in their results, outside Instagram. That's one more way for people who don't follow you yet to find you. It only works for a public account.

Instagram moves these menus around, so if you can't find it, type "search engine" into the search bar at the top of Settings and activity.`,
    hashtags: '#instagramtips #instagramgrowth #seotips',
  },
});
