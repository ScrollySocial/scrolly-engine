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
