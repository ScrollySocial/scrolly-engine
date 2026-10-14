# scrollyseo.com page rules (READ BEFORE DESIGNING OR PUBLISHING ANY PAGE)

Two vault files are the source of truth. Read both first; don't duplicate their content here.

- **`Scrolly Organic Engine/brand/visual-system.md`**: the v3 design system (colors, type scale with the 15px floor, components, imagery, retired styles).
- **`Scrolly Organic Engine/website.md`**: which pages are on v3, the migration order, open items, and how to build and publish (including the WordPress traps).

If a page idea breaks one of their rules, don't do it. When something changes, update those files in place.

## Working rules for this folder

- **New or migrated pages:** wrap the body with `s3shell(body, css, script)` from `lib.mjs` and use the `.s3-*` components and `--s3-*` tokens from `chrome/v3.css`; page CSS is for layout only. A pattern needed on more than one page belongs in `v3.css`, not in a page.
- **Homepage:** `pages/home.mjs` + `home.css` (its own `.hp` styles, on the same scale).
- **Header and footer:** `chrome/chrome.css` + `chrome.js`.
- **Never** put a header or footer in page content, and never hide the global ones.
- **Old pages** still on `shared.css` (`.scx`) keep working until they're migrated; don't extend that system.
- **Do not run `legacy.mjs` for cart, checkout or my-account (6/7/8):** it rebuilds from a stale 2026-09-21 backup.
- **Copy:**
  - Preserve products, prices, links, downloads and legal wording.
  - Remove em dashes.
  - Never promise $1,000.
  - The shirt is earned, not won.
  - No homepage "results not guaranteed" line; Club pages keep one near the price.
  - Say "30 consecutive days" where the Challenge window is described.
  - Flag awkward copy instead of rewriting product claims.
- **Checkout friction:** page buttons add straight to the cart or checkout; extras such as shirt size are asked at checkout.
- **Other sessions edit these files at the same time.** Re-read from disk before editing, diff against live before publishing a page someone else may have changed, and remember that `install-chrome.mjs` publishes `v3.css` and `chrome.css` together.
- **Process:** preview locally (`website` launch config), check desktop + 375px (no sideways scroll, nothing under 15px, AA contrast), publish, then confirm the live page's inline scripts still parse.
