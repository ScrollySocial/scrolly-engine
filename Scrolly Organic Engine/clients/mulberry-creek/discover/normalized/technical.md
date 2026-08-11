# Normalized — Technical/Site-Error Audit (Category H, free tools only)

Source: `raw/technical_probes_2026-08-10.md`, `raw/technical_dom_extract_2026-08-10.json` · All retrieved fact unless marked otherwise · No DataForSEO calls used · No GSC/GA access used or assumed.

## Confirmed issues (real, retrieved)
1. **robots.txt does not exist** (404, confirmed via 2 independent clients).
2. **sitemap.xml, sitemap_index.xml, and wp-sitemap.xml are all actively blocked (403 Forbidden)** — confirmed distinct from simple absence via a control test against a genuinely nonexistent URL, which correctly returned a themed 404. Something (WAF/security plugin/server rule) is deliberately blocking sitemap-shaped paths. Whether this specifically blocks Googlebot's own crawl requests cannot be confirmed without Search Console (our fetch clients aren't Googlebot).
3. **Title tag is generic**: "Landscaping and Garden Center" — no brand name ("Mulberry Creek"), no location ("Wills Point, TX").
4. **Meta description is entirely missing.**
5. **Three H1 tags on one page** ("Landscaping and Garden Center," "About Mulberry Creek Garden Center," "Contact Us") — best-practice violation (one H1 per page expected).
6. **No structured data/schema markup anywhere** (0 JSON-LD blocks, no microdata/RDFa detected in the full page HTML).
7. **Broken Facebook social link**: `href="https://mulberrycreek/"` — malformed (no TLD), would fail to resolve. Easy one-line fix.
8. **Product/about images are hosted on a third-party site-builder bucket ("bronkbuilder-website-assets") with several literal placeholder alt attributes** ("Placeholder image for ABOUT/PRODUCT") or raw camera-roll/screenshot filenames as alt text ("IMG_5862.PNG," "ChatGPT Image Jul 23, 2026..."). All 6 images do technically have non-empty alt attributes (passes a strict "alt present" check), but several appear to be unfinished template placeholders rather than real photography of Mulberry Creek's actual plants/site.
9. **Minor: one broken image reference on the theme's custom 404 error page** (`404-image.webp` → 404) — scoped to the error-page template only, does not affect the live homepage.
10. **Minor: small mobile tap targets** on the address/email/phone contact links (~15px tall, below the ~24-44px comfort threshold) at 375px viewport width.
11. **Minor: some product images are served at a notably larger natural resolution than their display size** (e.g., a 1086×1448 source image displayed at 321×241) — a potential bandwidth/performance inefficiency, though actual performance impact is unconfirmed (see gap below).

## Confirmed passes (real, retrieved — no issue found)
- HTTPS loads cleanly; no genuine mixed-content resources (the only `http://` string matches are inert SVG namespace declarations, not fetched subresources).
- HTTP→HTTPS and www→non-www both redirect correctly to a single canonical host (`https://mulberrycreektx.com`) — no duplicate-host issue.
- Canonical tag is present and correctly self-referencing.
- Meta robots contains only the WordPress-core default `max-image-preview:large` — no noindex/nofollow directive; the page is indexable per its own on-page signal.
- No horizontal-overflow / layout-breaking issue at a 375px mobile viewport.
- All homepage asset requests (CSS/JS/images) return 200 OK — no broken resources on the live page itself.
- All images have non-empty alt attributes (quality issue noted separately above; presence check passes).

## Explicitly unavailable this round
- **Core Web Vitals / page performance (lab or field):** attempted via Google's free PageSpeed Insights public API — blocked by a hard daily quota exhaustion on the shared/unauthenticated API project used by this session's tools (`quota_limit_value: 0`, confirmed via direct error response). This is a tool-access constraint, not a statement about the site's actual performance, and not GSC-gated. No lab or field (CrUX) data was obtained; none should be assumed or estimated.
- **True indexation/Coverage status:** a `site:mulberrycreektx.com` sanity check via the WebSearch tool returned no results, but per the approved safeguard this is treated as inconclusive only — the search backend isn't confirmed to reflect Google's own index, and `site:` operators are an unreliable indexation signal generally. Definitive indexing status requires Search Console / URL Inspection — **requires client access, not available.**
- **Crawl stats / crawl budget:** requires Search Console — **requires client access, not available.**
- **Manual actions / penalty signals:** requires Search Console — **requires client access, not available.**
- **Click/impression data tying technical issues to actual search performance:** requires Search Console — **requires client access, not available.**

## Confidence
High on all directly-observed facts above (HTTP status codes, DOM content, redirect behavior) — cross-checked via two independent fetch clients (WebFetch + Browser) where it mattered (robots.txt, sitemap paths). Moderate on the "placeholder/unfinished imagery" characterization (retrieved fact: the alt text and filenames; inference: that this indicates templated/unfinished content). Low/not applicable on anything requiring GSC or PSI, both explicitly marked unavailable rather than guessed.

## Explicit safeguard notes (per approved methodology)
- The missing-schema finding is presented strictly as a technical/relevance enhancement opportunity. It is **not** used to explain or support the Category I local-pack visibility gap, which remains an unconfirmed, separately-hedged hypothesis pending the held GBP-listings call.
- The `site:` search result is not used as proof of indexation status in either direction.
