# Reel Engine

This folder is a Reel engine: it turns one talking-head take into a finished Instagram Reel with HyperFrames.
Start with `README.md` (what the person sees) and `lib/README.md` (every engine file).

## Rules
- Everything about this person lives in `reel-settings.json`: names, folders, posting, tracker, rules. Read it first.
  Never hard-code their details into `lib/`.
- If `owner.name` is empty or `node lib/doctor.mjs --check` doesn't end in "All set", run the **reel-engine-setup**
  skill before anything else.
- Read `rules.list` (and `rules.doc` if set) before planning any Reel, and follow it.
- Run engine commands from this folder with the Bash sandbox off (npm, pip, the browser, ffmpeg need it).
- Never add sound or music files to the package for someone; they download their own (`sounds.md`).

## Making a Reel ("make a Reel from <file>")
1. `node lib/doctor.mjs --check`. Fix anything marked NEEDS YOU first.
2. `node lib/transcribe-footage.mjs "<Folder>/<File>"` → read the `.txt` transcript.
3. **Rough cut:** pick the best take of each line, write `plans/<id>/plan.json` (format in `lib/README.md`), and show
   the person the kept lines as plain text. Wait for an OK.
4. `node lib/new-reel.mjs <yyyy-mm-dd-slug>`, then `node lib/prep-footage.mjs <slug> <slug>`.
5. **Plan the moments:** frames at the start of each idea (`R.frames([0, R.at('words'), …])`), one or two components
   per frame from `lib/components.mjs`, captions, a few sounds (`R.fx`), never the same sound back to back. Write it in
   `<slug>/build.mjs`. Graphics go around the person's body, never over their face.
6. `cd <slug> && node build.mjs && npm run check` (long takes: the timeout env vars in `lib/README.md`).
7. Review: give `build.mjs` a `review` branch (the pattern is at the top of `lib/review/export.mjs`), run
   `node build.mjs review` and `node ../lib/review/server.mjs .`, and give them http://localhost:4321. Their choices
   save to `review/decisions.json` and apply on the next `node build.mjs`; `node ../lib/review/import.mjs .` lists them.
8. `node lib/render-ready.mjs --only <slug>`: first a quick draft for their review (15 fps, draft quality, ~3× faster,
   in `folders.exports/draft/`; the page says it's choppy on purpose), then, after they approve it, the same command
   makes the full-quality render in `folders.exports/final/` and the cover. Never hand over or post a draft as the finished
   Reel. `"render": { "draft": false }` in reel-settings.json ("turn off draft renders") renders full quality straight away.
