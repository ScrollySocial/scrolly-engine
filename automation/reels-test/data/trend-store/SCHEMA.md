# Trend store schema (v0, test)

JSON files, matching the repo's existing `automation/club/lib/*-store.mjs` pattern. Everything is append-only: a past snapshot or release is never rewritten.

| File | One row per | Key fields |
|---|---|---|
| `snapshots.json` | weekly collection | `snapshotId` (ISO week, e.g. `2026-W39`), `sequence`, `collectedAt`, `source`, `stageCounts`, `rules`, file paths |
| `observations.json` | sound seen in a snapshot (whole raw pool, not just winners) | `fingerprint`, `snapshotId`, `videosSeen`, `creators`, `maxPlays`, `passedFilters` |
| `trends.json` | trend we have assessed | `fingerprint`, `soundId`, `formatTag` (our label), `trendName`, `firstSeenSnapshot`, `snapshotsSeen[]`, `releasedIn[]` |
| `releases.json` | trend published to members in a given week | `releaseId` (ISO week), `fingerprint`, `publishedAt` |

## Fingerprint

`primary = "tiktok:sound:<soundId>"`, with `soundId` taken as the exact string from Clockworks (`musicMeta.musicId`). Never use apidojo's sound IDs, which arrive rounded.

`formatTag` (for example `transition:glow-up-before-after`) is an AI-assigned label from a controlled list. It groups different sounds used for the same format. It is used as a soft duplicate warning, not a hard block, because it is judgment rather than data.

## Repeat rule (production)

Exclude trend T from week W if `releases.json` contains T in any of weeks W-1 to W-4.

Exception: T becomes eligible if `observations.json` shows T with `passedFilters: true` in each of the 5 consecutive snapshots W-4 to W.

Test selections are never written to `releases.json`. Only real publishes are.

## Current state

1 snapshot (`2026-W39`), 0 releases. The exclusion and the sustained exception both have nothing to act on until real weeks accumulate.
