# Scrolly (repo root)

The main instructions live in `Scrolly Organic Engine/CLAUDE.md` (the vault). Read it before saving anything or doing
business work. This file only holds rules that must apply in every session, wherever the work starts.

## Save your work to git when a task is done
Two git repos live here: this project folder (website, automation, reels, skills) and the vault in
`Scrolly Organic Engine/`, which has its own repo. When you finish a task, commit only the files you changed, in the
repo they belong to, with a clear message. Never leave work uncommitted for a later chat, and never ask Mercedes to
click "Commit changes". Before committing, check the diff for passwords and keys: they belong in `.env` or `.secrets/`
only. Video, audio and the photo library stay out of git (see `.gitignore`). Push after committing when a remote is set.

## Notion: read lists through saved views only
The Notion workspace's query allowance is small. To read a list of rows, use a saved view
(`notion-query-data-sources` with mode "view"). Never SQL or rows mode. If no view fits, ask Mercedes before creating
one; don't fall back to a query. Fetching or updating a single page by its URL is fine.

Content ideas and posts moved off Notion's Content Pipeline (2026-10-27): they live in Mercedes's Content Planner,
`automation/planner/` (page http://localhost:4330, data `data/ideas.json`, command line `tracker.mjs`; plan in vault
`products/my-planner/plan.md`). The nightly Reel run reads `node ../planner/tracker.mjs reels-to-edit` instead of the
old "Reels to edit" view. Don't add or change content in the Notion Pipeline; it's being retired.

Saved views in use (Scrolly Content Tracker):
- Reel Style Board (style and editing inspiration, newest first; check before editing a Reel):
  view://3feab38f-4c58-81f9-8429-000c8ddaa849

Comments and DMs are NOT in Notion anymore (2026-10-23): they live in Mercedes's own dashboard at
https://hooks.scrollyseo.com/inbox (`automation/n8n-comments/inbox/`). The draft-comment-replies skill reads and writes
it through its API; the old Notion Comment inbox sits in the Trash bin page.
