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

Saved views in use (Content Pipeline, Scrolly Content Tracker):
- Reels to edit (Format Reel + Status Edit, by Publish Order): view://3f9ab38f-4c58-81e3-a763-000cb6af8568
  (query: `{"mode":"view","view_url":"view://3f9ab38f-4c58-81e3-a763-000cb6af8568"}`)
