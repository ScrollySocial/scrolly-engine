# Scrolly (repo root)

The main instructions live in `Scrolly Organic Engine/CLAUDE.md` (the vault). Read it before saving anything or doing
business work. This file only holds rules that must apply in every session, wherever the work starts.

## Notion: read lists through saved views only
The Notion workspace's query allowance is small. To read a list of rows, use a saved view
(`notion-query-data-sources` with mode "view"). Never SQL or rows mode. If no view fits, ask Mercedes before creating
one; don't fall back to a query. Fetching or updating a single page by its URL is fine.

Saved views in use (Content Pipeline, Scrolly Content Tracker):
- Reels to edit (Format Reel + Status Edit, by Publish Order): view://3f9ab38f-4c58-81e3-a763-000cb6af8568
  (query: `{"mode":"view","view_url":"view://3f9ab38f-4c58-81e3-a763-000cb6af8568"}`)
