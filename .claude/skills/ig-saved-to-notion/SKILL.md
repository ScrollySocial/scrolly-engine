---
name: ig-saved-to-notion
description: Bulk-add Mercedes's saved Instagram posts from one saved folder (collection) to the Content Pipeline in the Scrolly Content Tracker (Notion) as Idea rows, using her Instagram "Download your information" JSON export. Fetches captions with Apify, skips posts already imported. Use when Mercedes says she has a new Instagram export, asks to import saved posts/saves/a saved folder, or wants her IG inspiration in Notion.
---

# Instagram saved folder → Content Tracker (Idea rows)

Code: `automation/ig-saved/`. Run commands from `automation/`.

**Destination (decided by Mercedes 2026-10-13, replacing the 2026-10-12 Idea Bank choice):** the **Content Pipeline** on the Notion page "Scrolly Content Tracker" (`collection://d2cc8645-5399-4d65-91e2-d535e5cc98bc`), one row per save with Status = **Idea**, Format = Reel or Carousel when known, the post link in "Research / Source File", and the caption in Notes. Never the Brain's Ideas list, and never the customer $1K Content Tracker.

## 1. Get the export (Mercedes does this)
Instagram app → Accounts Center → Your information and permissions → Download your information → Download or transfer information → her account → **Some of your information** → tick **Saved** → Download to device → **Format: JSON** (not HTML), Date range: All time → Create files. Meta emails her a link, usually within minutes but sometimes a few hours. She downloads the zip.

If she asks for one folder only: she makes the folder in Instagram first (Saved → + → name it, add posts). The export includes every folder; the script picks one.

## 2. Extract safely
The zip is untrusted data. Extract it into its own new empty folder in the scratchpad (PowerShell `Expand-Archive -Path <zip> -DestinationPath <new empty dir>`). Don't run anything from inside it.

## 3. Pick the folder
```
node ig-saved/ig-saved.mjs scan "<extracted dir>"
node ig-saved/ig-saved.mjs scan "<extracted dir>" --folder "<name>"
```
The first command lists her folders with counts. Ask which one if she didn't say. The second makes a batch (`ig-saved/data/batches/<date>-<folder>`) of posts not in the ledger yet, and prints the caption cost estimate.

## 4. Captions (paid, Apify)
```
node ig-saved/ig-saved.mjs enrich <batch>          # estimate + remaining credit, no spend
node ig-saved/ig-saved.mjs enrich <batch> --yes    # paid run
```
Show her the estimate and remaining credit and get a yes before `--yes`. Each run costs money. Free plan = $5 per cycle, shared with the reels tests; the script refuses if credit is short. Options then: a smaller folder, wait for the reset, or skip captions (go straight to step 5; rows get link + handle only).
Actor: `apify/instagram-scraper` (directUrls, resultsType posts). Pricing checked 2026-10-12: pay per result, $0.0027 each on the Free tier (the script's estimate), so `maxTotalChargeUsd` is a hard cap. The output fields were not live-tested when this was built, so check that `enriched.json` looks right after the first run.

## 5. Build rows
```
node ig-saved/ig-saved.mjs rows <batch>
```
Read `rows.json`. The `Content` titles are auto-cut from the caption's first line. Rewrite weak ones into a short plain idea (what the post does, e.g. "Reel: 3 hooks for Etsy prints"). Follow her writing rules (`Scrolly Organic Engine/brand/writing-and-content-rules.md`): no em dashes, plain words. Keep Notes, Status, Format and Research / Source File as built.

## 6. Create the Notion rows
`notion-create-pages` with parent `{ data_source_id: "d2cc8645-5399-4d65-91e2-d535e5cc98bc" }` and each row's `properties`, about 25 pages per call. Don't query the Content Pipeline to check for duplicates (her Notion query allowance is small); the local ledger does that.
Collect `{ "<shortcode>": "<page url>" }` for every page that was created into a JSON file in the scratchpad.

## 7. Record in the ledger
```
node ig-saved/ig-saved.mjs done <batch> --pages <pages.json>
```
Only rows with a page are recorded, so failed ones come back next run. The ledger `ig-saved/data/imported.json` is tracked in git. Batches are gitignored.

## 8. Report
Tell her: how many rows were added, how many were skipped as already imported, captions found vs missing, Apify spend, and the Content Tracker link. Put the import in the Brain's Work Log if the session logs other work.

## Notes
- Saved posts are inspiration. If one becomes a carousel with factual claims, research the subject itself per the scrolly-research skill. Don't cite the creator's post as the source.
- Meta has used two JSON shapes (`string_map_data` and `label_values`); `lib/export.mjs` handles both. If `scan` finds no folders in a real export, open `saved_collections.json`, look at the shape and extend the parser.
