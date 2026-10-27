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
- `data/pin-status.json`: her "Seen it live" / "Missing" clicks. `data/buffer-snapshot.json`: last saved Buffer copy.
