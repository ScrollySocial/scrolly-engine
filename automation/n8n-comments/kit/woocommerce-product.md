# Chat Manager: WooCommerce product (draft, not created)

Create only with Mercedes's OK, after the from-zero test passes. Same pattern as the Reel Engine: a downloadable
product, no shipping, no setup calls.

| Field | Value |
| --- | --- |
| Name | Chat Manager |
| Type | Simple, Virtual + Downloadable |
| Price | Her decision (evaluated: $97 launch, about $147 later) |
| Download | `kit/dist/chat-manager-<version>.zip` from `node kit/build-package.mjs` (name the file "Chat Manager <version>") |
| Download limit / expiry | Unlimited / never (updates are re-downloads from My Account → Downloads) |
| Category | Same as the Reel Engine |
| Short description | Your freebie goes out when someone comments or DMs a keyword. Email signups, one inbox for Instagram, YouTube and TikTok, on your own $6 server. Claude sets it up with you. |
| Product page | `website/scrolly-site/pages/chat-manager.mjs` (draft; buttons point at this product's add-to-cart link) |

## Updating buyers

1. Bump `kit/VERSION`, add a `kit/CHANGELOG.md` entry, `node kit/build-package.mjs`.
2. Replace the file on the product (same download name, so existing buyers get the new zip in My Account).
3. Buyers unzip it over their folder and say "update my Chat Manager".
