---
status: authored, NOT YET LIVE
target: https://scrollyseo.com/refund/ (WP page ID 66, built with Elementor)
---

# Refund policy addition — $1K Club

**Why this is a text file, not a REST-API push:** the live `/refund/` page is
built with Elementor. Elementor stores and renders its own `_elementor_data`
structure, separate from WordPress's standard `post_content` field — a REST
API write to `post_content` would very likely not appear on the live page at
all (or would create a drift between the "real" content and what Elementor
actually renders), per this repo's own documented Elementor quirk. Safer to
hand you the exact text to paste as a new text block in the Elementor editor
than to risk a silent no-op or corrupting the page's structure.

## Where to add it

As a new section, placed after the existing "Personalized SEO audits"
section and before "Customer delays" — matching the page's existing
heading style (the same visual weight as "Downloadable workbooks" /
"Personalized SEO audits").

## Exact text to add

**Heading:** `$1K Club access purchases`

**Body:**
> The $1K Club is a one-time, $50 purchase that grants ongoing access to
> the Club system through your Scrolly account. Because access is provided
> electronically and immediately upon purchase, $1K Club purchases are
> final and nonrefundable once the order is completed — consistent with
> this policy's treatment of other electronically-delivered products above.

No Challenge-specific language is included here — product 280 isn't
launching yet. Add its own clause when the Challenge actually goes on sale,
not before.
