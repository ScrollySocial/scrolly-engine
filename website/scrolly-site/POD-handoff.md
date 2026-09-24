# Print-on-demand: handoff for a fresh session (nothing has been started)

Goal: evaluate POD providers for Scrolly merch and connect the chosen one to WooCommerce with ONE unpublished test product. No orders, no price changes, nothing published.

## What is already known
- Store: scrollyseo.com, WordPress + WooCommerce. Existing products are Simple + Virtual digital downloads (ids 24 SEO Site Audit, 58 Shopify workbook, 69 Pinterest workbook, 279 $1K Club $50, 280 $1K Challenge draft). No physical products, shipping zones or POD plugin exist yet.
- Public merch is shown as "Coming soon" on /scrolly-shop/ (4 preview tees: Earn Your Stripes, Scrolly Logo, More Do. Less Blah., Big Cat Energy). Previews are small raster mockups, NOT print-ready.
- Earned/achievement shirts (Challenge winners, "Earned Edition" tiger tee) are a separate reward collection. The "$1K Stripe" is a verified achievement plus optional merch, never a cash payout. Keep that distinction in any merch copy.
- Brand: `Scrolly Organic Engine/brand/visual-system.md`. Club colors: $1K teal #94ece1, $10K lavender #c1aefc, $24K orange. Earned Stripe / Rank Mark icon is undecided; do not invent one for merch.
- Another Claude session ("ScrollySEO homepage redesign") owns the live homepage, page 291 and the WP menus. Do not publish to those from a POD session.
- Live WP credentials exist in `automation/.env` (WP_LIVE_*), meant for that session's work. Ask Mercedes before using them.

## Decisions needed from Mercedes before any setup
1. Provider (candidates to compare: Printful, Printify, Gelato). Compare: WooCommerce plugin quality, blank/tee quality, shipping cost and times to her main markets, branded packaging/inserts, mockup generator, per-item base cost vs. retail.
2. Provider account (she creates it; never enter credentials for her).
3. Print-ready artwork: vector/hi-res PNG with transparent background, ideally 4500x5400 px at 150+ dpi for DTG. Current tee art is placeholder only.
4. Which single product to test first (suggestion: one plain-text tee such as "Earn Your Stripes", cheapest to get right).
5. Shipping regions, tax handling, payment/payout for the provider (she decides; no paid test orders without her say-so).

## Suggested first steps in the new session
- Read this file, `brand/visual-system.md` (section 14, Merch system) and `website/scrolly-site/README.md`.
- Research and compare providers, then present a short recommendation before touching WordPress.
- Only after she picks a provider and creates the account: install/connect the plugin, create ONE product as a draft, verify mockups and variants, and stop.
