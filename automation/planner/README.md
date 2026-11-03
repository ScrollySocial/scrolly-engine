# Content planner (Mercedes's own)

Local page showing batch Pins (scheduled / check it's live / live / missing) and the Buffer queue,
drafts, errors and recent posts. Plan and next steps: vault `products/my-planner/plan.md`.

Run from the project folder, then open http://localhost:4330:

    node automation/planner/server.mjs

- `server.mjs`: no npm packages; listens on 127.0.0.1 only.
- `planner.html`: the page (read on every visit, so edits show without a restart).
- `lib/buffer.mjs`: post shape + live Buffer read when `BUFFER_API_KEY` is in `automation/.env`.
- `buffer-snapshot.mjs`: "refresh my planner" without a key. Claude runs the Buffer connector's
  `list_posts` twice (queue statuses, then the last 30 sent) and `get_channel` for the three channels,
  saves the results, and runs `node automation/planner/buffer-snapshot.mjs <channels.json> <queue.json> <sent.json>`.
- `lib/ideas.mjs` + `data/ideas.json`: the Ideas board, one card per idea with a lane per platform
  (Instagram, TikTok, YouTube, Pinterest). Claude may edit `ideas.json` directly; the page re-reads it on load.
- `data/pin-status.json`: her "Seen it live" / "Missing" clicks. `data/buffer-snapshot.json`: last saved Buffer copy.

## Calendar (built 2026-11-03)
Top of the page (`#calendar`). A month grid, weeks start Monday, US Eastern days. Each day shows how many posts and, on
"All", the split per app (IG, TT, YT, Pins). Filter chips: All, Instagram, TikTok, YouTube, Pinterest (saved per browser).
What counts: Buffer posts with a time (queued, sent, failed; drafts don't), planner lanes with a `date` whose Buffer post
isn't already counted (Planned / Ready / Posted / Buffer draft), and every batch Pin except Deleted. Pinterest lanes
don't count (their Pins do). A Ready card with no date isn't on the calendar. Tap a day for its posts in time order
(date-only cards say "No time yet"); tap a post for the same popup as the feed preview, or a Pin for its image. Each
day links to that app's feed preview.

## Carousels review (built 2026-11-03)
`#carousels`: every carousel already made, so she can pick what to post. Sources: the carousel engine's exports
(OneDrive `exports/carousels/<date>-<slug>` plus `sample-what-to-post`, each with `automation/carousels/posts/<id>/post.json`;
`_test-*` and pinned concept boards left out). The date shown is the last render, not the folder date. The old-look $1K
Club promo carousels are left out (Mercedes 2026-11-03: outdated). Filters: To review, Will post, Needs fixing, Skipped,
Posted (a card with that `carouselId` has a Posted lane), All. Tap one for every slide + the caption.
They also sit top left on the Instagram feed preview as **To review** tiles (tap = the same review) until picked; Skip takes one off.
Her choices go to `data/carousel-review.json`. **Post it** makes a card at Ready on Instagram with the
export's caption, or moves the existing card's Instagram lane up to Ready; Queue it from the grid as usual.

**Old UGC posts:** Buffer still lists the July-August UGC account posts she deleted from Instagram. `FEED_START`
(2026-10-01) in `planner.html` keeps anything Buffer sent before it off the grid and the calendar.

## Feed preview (built 2026-11-02)
The Buffer section is now a phone-style profile per app (Instagram, TikTok, YouTube; the nav links `#ch-Instagram` etc.
open it). Top left = posts last: Ready cards not in Buffer yet (blue dashed), Buffer drafts, Buffer's queue (navy time
label), failed, then posted. Tap a post for its caption, "Open the card" and, when Ready, Queue it. Pictures come from the
card (carousel slide 1, `mediaUrl`, the finished image linked in OneDrive Scrolly Media via `/media/...`, or the Reel
cover in exports/reels) or Buffer's thumbnail. Handles are set in `lib/buffer.mjs` `HANDLES` (@ambitiondepthq), because
Buffer still reports the old "scrollysocial" names.

- **Stories stay off the grid (2026-11-03):** Buffer's `metadata.type` (story / post / reel) is read as `igType`; story
  posts show on the calendar only. Story cards (format Story) were already left out.
- **Drag to reorder (2026-11-03):** Ready posts (and Buffer drafts that have a card) can be dragged on the grid; on a phone,
  tap one and use "Earlier/Later on the grid". `POST /api/feed-order` saves `feedOrder` 1, 2, 3... (1 posts first) on that
  app's lane, all cards in one write, refused whole if a card changed since the page loaded. Cards with no `feedOrder` sit
  top left (post after the ordered ones).
- **Move posts in Buffer (2026-11-03):** queued (scheduled) tiles drag among themselves only. The group's times are
  handed out in the new order and shown as "old → new" with Confirm; `POST /api/buffer-move` → `lib/buffer.mjs movePosts`
  reads each post in full, refuses all of it if any post isn't scheduled or isn't at the time the page showed, then
  `editPost` with the full text, assets (alt text, user tags, video thumbnail), tags and app settings, `mode
  customScheduled` + the new `dueAt`, schedulingType left out so "Notify me" stays. Moved posts become custom-timed in
  Buffer. Checked with a pretend Buffer and against Buffer's schema (nonexistent id); not yet run on a real queued post.
- **Posted on the grid:** reads Buffer's last 100 sent posts (was 30), and a card lane at Posted shows even when Buffer
  no longer lists it.

## Queue it (built 2026-10-28)
A Ready Instagram or TikTok lane gets a **Queue it** button (card editor and the platform board).
1. `POST /api/queue-plan` shows the preview: slides (carousel export) or the card's `mediaUrl`, the lane's caption, alt
   texts, the comment-word check (Instagram posts need a live Chat Manager word), Buffer's free-plan count. Changes nothing.
2. Her **Confirm** → `POST /api/queue`: uploads slides WordPress doesn't have yet as `tad-carousel-*` (record in
   `automation/carousels/posts/<id>/wp-media.json`; re-rendered slides get a new name), then `lib/buffer.mjs queuePost`:
   updates her Buffer draft if the card has one (still a draft, same channel), else creates the post; always
   `addToQueue`, never "post now". The card's lane becomes Scheduled with the Buffer id and date.
Needs `BUFFER_API_KEY` in `automation/.env` (Buffer: profile icon > API > Personal Access > + New Key; free plan = 1 key).
YouTube and Reels aren't covered (YouTube needs a title + category; Reels go through the nightly run).
- **Post it myself (2026-10-28):** each Instagram/TikTok lane has "I'll post it myself (to add music)". When ticked, Queue it
  sends the post to Buffer as "Notify me" (`schedulingType: notification`): at the time, the Buffer phone app reminds her and
  hands the post to Instagram/TikTok, where she adds music and shares. Carousels default to ticked; everything else posts
  automatically. Saved on the lane as `byHand`.
