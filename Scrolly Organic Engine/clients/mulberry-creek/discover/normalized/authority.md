# Normalized — Authority & Backlinks (backlinks_summary)

Source: `raw/backlinks_summary_2026-08-10.json` · target: mulberrycreektx.com · Retrieved fact

| metric | value |
|---|---|
| first seen | 2021-09-14 |
| total backlinks | 21 |
| referring domains | 18 |
| referring domains (nofollow) | 13 |
| referring main domains | 18 |
| referring IPs / subnets | 10 / 10 |
| referring pages | 21 (15 nofollow) |
| backlinks_spam_score | 43 |
| target_spam_score | 5 |
| CMS detected | WordPress |
| server | openresty |

## Notes
- Small, thin backlink profile — 18 referring domains total, consistent with a small local business with no active link-building history.
- `backlinks_spam_score: 43` is elevated relative to `target_spam_score: 5` — the score attaches to the referring backlink pool's quality, not to Mulberry Creek's own domain. Referring domain TLD mix includes some lower-trust patterns (`.party`, `.pages.dev`, `.fyi`, `.cloud`, `.world` — 6 of 18 referring domains). Flagged as informational only, per discover.md's rule against auto-recommending disavowal — no disavow action implied.
- 13 of 18 referring domains are nofollow — link equity passed is limited.
- CMS/server info (WordPress on openresty) is incidental technical metadata, not part of Category G but noted for Category H context since Lighthouse (DataForSEO) was skipped this round in favor of a free source.

## Confidence
High — single authoritative source, directly retrieved. No competitor backlink comparison run this round (correctly out of scope per data-plan.md's "Explicitly Not Planned" section).
