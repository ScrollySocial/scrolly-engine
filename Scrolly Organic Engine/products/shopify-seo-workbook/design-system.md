---
status: awaiting approval
created: 2026-08-19
---

# Scrolly Shopify SEO Workbook — Visual Design System

Built by extending Scrolly's existing brand system (`website/index.html`, `automation/report-theme/scrolly-report.css`) rather than inventing a new one — same color tokens, same type pairing, same card/shadow language the $299 report already uses. This is a sibling product, not a new brand.

## Design plan (summary)

- **Color**: the existing Scrolly palette — ink navy, six accent hues (indigo/blue/cyan/violet/pink/mint) each with a light tint — plus one addition this product needs that the marketing site didn't: a true red, for the technical triage system's "fix this now" tier.
- **Type**: Manrope (800 weight) for every heading, Inter (400–700) for everything else — the exact pairing already live on scrolly's site and report. Not reinvented; extended.
- **Layout**: US Letter, generous single-column teaching pages, worksheets that visibly break the grid into a "write here" mode, Part openers that use color the way the rest of the book deliberately doesn't.

---

## 1. Page size & format

**Recommendation: US Letter (8.5" × 11" / 816 × 1056px at 96dpi reference).**

Rationale: the customer base is explicitly US-based; worksheets need real writing width for tables like the Collection Map, the 90-Day Plan, and the Technical Check; Letter is what a US customer's home/office printer defaults to; and a workbook this content-dense (dense comparison tables, multi-column checklists) needs the extra ~0.3" of width Letter has over A4 more than it needs any aesthetic gained from an unconventional trim size. This is a working document people will print pages from, not a coffee-table object — the format should disappear into that job.

## 2. Margins & grid

- Outer margins: 0.85in top, 0.75in bottom, 0.75in left/right on teaching pages.
- Worksheets and dense tables may bleed closer to 0.5in on the sides — the content needs the room more than the page needs the white space there.
- Body copy sits in a single column, capped near 65 characters per line even though the page is wider — extra width goes to tables/worksheets, not to stretching prose.
- Footer band: 0.5in reserved, always.

## 3. Color

Reusing the live token set from `scrolly-report.css` exactly, plus one new pair:

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#10152b` | Primary text, headings |
| `--ink-soft` | `#5c6478` | Secondary/supporting text |
| `--bg` | `#f5f7fc` | Page background |
| `--bg-alt` | `#eef1fa` | Section tint, table headers |
| `--surface` | `#ffffff` | Cards, worksheets |
| `--line` | `#e1e5f2` | Hairlines, borders |
| `--indigo` / `--indigo-bg` | `#4f46e5` / `#edeafe` | Primary accent — CTAs, "Important," Part openers |
| `--blue` / `--blue-bg` | `#2563eb` / `#e7f0fe` | Informational accent, links, "you are here" |
| `--cyan` / `--cyan-bg` | `#0891b2` / `#e1f6fb` | "Quick Win," technical/data emphasis |
| `--violet` / `--violet-bg` | `#7c3aed` / `#f2ecfe` | **Reserved exclusively for Ask AI** — nowhere else uses violet, so its appearance always means "AI-assisted step" |
| `--pink` / `--pink-bg` | `#db2777` / `#fde7f2` | "Watch Out" / caution (distinct from hard stop) |
| `--mint` / `--mint-bg` | `#0d9488` / `#dff5f1` | "Shopify Handles This" / Green triage / positive |
| `--amber` / `--amber-bg` | `#d97706` / `#fdf0dc` | "You Should Check This" / Yellow triage |
| `--red` / `--red-bg` **(new)** | `#dc2626` / `#fde8e8` | Red triage tier only ("fix/investigate now") — the one hue the marketing site never needed |
| `--gray` / `--gray-bg` | `#6b7280` / `#eef0f4` | Neutral tags (New Store / Existing Store branches), disabled states |

**Gradient**: reserved for exactly two moments in the whole book — the cover, and Part openers. `linear-gradient(120deg, #3730a3 0%, #4f46e5 45%, #0891b2 100%)`, matching the site's existing hero gradient. Nowhere else. A 165-page book where every page has a gradient stops feeling premium by page 20; a book where only 11 pages (cover + 10 Part openers) get one makes those pages actually land as thresholds.

**The restraint rule**: any single page uses ink + one accent, occasionally a second for a specific semantic reason (e.g., a comparison table's "you" column in blue while everything else is neutral). Never more than two accents plus ink on one page outside a Part opener.

## 4. Typography

| Role | Face | Weight | Size (print-equivalent) |
|---|---|---|---|
| H1 (Part opener title) | Manrope | 800 | 32–40pt |
| H2 (Section title) | Manrope | 800 | 20–22pt |
| H3 (subhead) | Manrope | 700 | 13–14pt |
| Body | Inter | 400 | 10.5–11pt, line-height 1.55 |
| Body emphasis | Inter | 600 | same size |
| Labels/eyebrows | Inter | 700, uppercase, +0.05em tracking | 8–8.5pt |
| Worksheet field labels | Inter | 600 | 9.5pt |
| Table headers | Inter | 700, uppercase | 8.5pt |
| Captions/source tags | Inter | 500 | 8pt |

Both faces are already Scrolly's brand pairing — live on the marketing site and the $299 report — so this isn't a new decision, it's continuity. Numeric columns (prices, page counts, dates) use `font-variant-numeric: tabular-nums` so figures align in the Scorecard and 90-Day tables.

Never drop body text below 10pt to fit more on a page — the design principle here is explicitly "a beautiful page that's exhausting to read is a failed page," and shrinking type is the most common way to fail it.

## 5. Cover

One clean concept: the top ~55% of the page carries the brand gradient (same gradient as Part openers — the cover is visually "Part −1"), with the workbook title set in white Manrope 800, large, plus one short outcome line beneath it in a lighter weight. The bottom ~45% drops to the plain light background with the Scrolly wordmark, a short one-line positioning statement, and nothing else — no bullet list of contents, no crowded value-prop stack. The cover's job is "Shopify SEO Workbook + the core outcome," not the sales page; Section 29 already carries the fuller pitch.

## 6. Part openers

Distinct from every other page in the book — this is where the gradient and the "Your System So Far" diagram earn their keep:
- Gradient band across roughly the top third (same treatment as the cover).
- Large Part number (Manrope 800, oversized, white, low-opacity — numbering here is meaningful, it's literally sequence) + Part title.
- One-sentence orientation statement in white/light text.
- Below the gradient, on the plain background: the "Your System So Far" diagram, updated to show everything built through the previous Part, with this Part's additions visually appended.
- No body teaching content on a Part opener — it's a threshold page, not a lesson.

## 7. Section openers

Deliberately light — this is the lever that controls page count. No new page, no decorative band. A Section opens with:
- A small eyebrow tag: `SECTION 9` in the relevant accent color, uppercase, small.
- The Section title as an H2, immediately below.
- Body copy starts right after — no orientation paragraph required, since the Part opener already gave that context.

## 8. Standard teaching page

- H2/H3 hierarchy as defined above.
- Body copy in the capped-width column; bullets use a small accent-colored dash/dot, not default browser bullets.
- Numbered steps use a small filled circular badge (accent color, white number) rather than plain "1. 2. 3." — this is the one place numbering is genuinely sequential and worth the visual weight.
- **LEARN / SEE / DO / CHECK YOUR WORK** rhythm markers render as small uppercase eyebrow labels in ink-soft, not boxed — they're wayfinding, not callouts.

## 9. Worksheet page

The single most important differentiation in the whole system — a reader flipping through should be able to tell a worksheet page from a teaching page without reading a word.

- A colored top bar (2–3mm) in the section's accent color, with a small pencil-glyph icon and "WORKSHEET" label.
- Card surface sits on `--surface` (pure white) even when the surrounding page is `--bg` — worksheets are visually "lifted."
- Fillable lines: a clean bottom-border rule (`--line`, 1px), spaced with real line-height (never cramped) — works identically whether someone types over it digitally or writes on a printed page.
- Checkboxes: 14×14px rounded-3px outline boxes in ink-soft, sitting inline with their label — never smaller than comfortably tappable/markable.
- Table-style worksheets keep generous row height (minimum ~28pt) specifically because they're fill-in rows, not reference rows.
- A small numbered-action treatment ("1. 2. 3.") reused from teaching pages when a worksheet has sequential steps before the fill-in fields.

## 10. Ask AI box

Violet is reserved for this alone, so the color itself becomes the signal.

- Card with a violet left-border (4px) and a very light violet-tint background — same "finding-card" pattern the report already uses, recolored.
- A small chat-bubble/spark icon, tasteful, not a robot mascot.
- The prompt itself sits in an inset white sub-card with a subtle dashed border, styled like a copyable quote block — visually says "this is text to lift out," distinct from the surrounding instructional copy.
- Any guardrail sentence ("don't ask AI to invent search volume") sits below the prompt in smaller ink-soft text, visually quieter than the prompt itself.

## 11. Worked example vs. "Your Turn"

- **Example**: a small tag reading "JUNIPER LANE CANDLE CO." in gray/ink-soft with a tiny candle glyph — this exact tag appears every time the running example shows up, across all 165+ pages, so it becomes instantly recognizable without needing to be read closely.
- **Your Turn**: is simply the Worksheet treatment (§9) — the two systems together are the full distinction. A page is either tagged as the fictional example or it's a lifted-white worksheet card; there's no ambiguity about which one a reader is looking at.

## 12. Callout family

One coherent system — colored left-border card + icon + short label, never a fully different visual language per type:

| Callout | Color | Icon concept |
|---|---|---|
| IMPORTANT | indigo | (i) |
| DO THIS NOW | indigo, filled (not just bordered — the one "urgent" variant) | arrow |
| DON'T DO THIS | red | slash/x |
| WATCH OUT | pink | triangle |
| SHOPIFY HANDLES THIS | mint | shield-check |
| YOU SHOULD CHECK THIS | amber | magnifier |
| QUICK WIN | cyan | lightning |

**New Store / Existing Store** branches are lighter still — small inline pill tags (gray/blue), not full callout cards, since they're short one-line branches, not warnings.

## 13. Table system

- **Standard info table**: `--bg-alt` header row, hairline row dividers, no zebra striping (it competes with the accent system).
- **Comparison table**: neutral otherwise, with the "recommended/you" column given a `--blue-bg` tint — same pattern as the report's competitor table.
- **Worksheet table**: taller rows, header labels in caps-small, empty cells show a very faint dotted fill cue rather than staying visually blank/ambiguous.
- **Priority table**: priority shown as a small colored pill (High = indigo, Medium = blue, Low = gray-bg) — never the whole row tinted.
- **RED/YELLOW/GREEN triage table**: grouped under three labeled section headers (not a color-fill column) — each row carries a small colored dot **plus** the word "Red/Yellow/Green" and an icon, satisfying the never-color-alone accessibility rule from three directions at once.
- **Roadmap table**: week number as a small badge, effort shown as 1–3 filled dots (small/medium/large weight, not just color) plus the words Quick/Moderate/Substantial on hover-equivalent (i.e., always visible as text, not just the dot).

## 14. Checklist system

- Unchecked: 14px rounded-square outline.
- "Completed" concept (shown once in the prototype for the Printable Checklist, since the real product is blank-for-fill): filled indigo square with a white check glyph.
- Section reference: small gray pill tag, e.g. `Sec. 9`.
- Effort indicator: reuses the roadmap table's dot system.
- The Printable 90-Day Checklist is the system's culmination — every element (checkbox, effort dot, section pill) appears together there at its most compact.

## 15. Diagram system

All 21 diagrams share:
- **Nodes**: rounded-rect (12px radius, matching the card radius), `--line` stroke, `--surface` or `--bg-alt` fill; the one node/path being emphasized in a diagram gets an accent fill instead — never more than one accent per diagram.
- **Arrows**: `currentColor` (resolves to `--ink-soft`), small triangle marker, always labeled when the connection means something specific ("links to," "syncs," "reaches") rather than just "relates to."
- **Text**: Inter, 11–13px at drawn scale, short labels only — explanation lives in the caption below, never crammed into the drawing.
- **Gradient**: reserved for exactly one diagram — the "Anatomy of a Search-Optimized Shopify Page" signature visual — as the single high-value moment in the diagram system, echoing the cover/Part-opener gradient rule.
- Every diagram is `<svg>` wrapped in `<figure>`/`<figcaption>`, `role="img"` + `aria-label`, sized by `viewBox` — no external images, no libraries.

## 16. Screenshot system

- Frame: a simple rounded-top browser/admin chrome bar (three small dots, a faint fake address/breadcrumb strip) around every screenshot — gives every image the same "this is software" context without needing a real browser screenshot of the chrome itself.
- Highlights: rounded-rect outline callouts in indigo (2.5px stroke) around the specific field/button being taught.
- Annotation: small numbered circular badges (same style as teaching-page numbered steps) when a screenshot needs multiple ordered callouts.
- Every screenshot ships with a caption bar directly beneath it (`--bg-alt`) carrying the "what you're looking for" line already written into the source document — never a decorative image with no caption.
- Screenshots are sized generously — minimum roughly 5.5in wide on the Letter page — cropped tightly to the relevant admin panel rather than shrinking a full browser window to fit.

## 17. Running navigation

- Footer only (no running header, to save vertical space on a book this long): page number (tabular nums) centered or right-aligned, Part name on the left in `--ink-soft`, small Section number pill on the right.
- A single hairline (`--line`) above the footer band, nothing else — no page tabs, no colored footer strip. On a 165-page book, a quiet footer is more useful than a loud one.

## 18. Source / research treatment

Reuses the report's existing `.cite`-style pattern: a small superscript tag in indigo, e.g. `2026`, next to a time-sensitive claim, rather than a footnote block or academic citation list. Where a claim needs more context than that (rare in customer-facing copy — most sourcing lives in `research-notes.md`, not the book itself), it gets one small ink-soft caption line directly under the claim, never a separate references page.

## 19. Accessibility & practicality rules

- Every RED/YELLOW/GREEN or priority signal pairs color with a label and/or icon — never color alone.
- Minimum body text 10pt equivalent; minimum caption text 8pt.
- Contrast: ink (`#10152b`) on `--bg`/`--surface` and white text only on the gradient/indigo-filled surfaces — no light-gray-on-white body text anywhere.
- Fillable areas always sit on white or very light surfaces — never a dark or saturated background behind something the reader needs to write on, digitally or by hand.
- All interactive-feeling elements (checkboxes, the "completed" checklist state) render clearly as such even in a static/printed context.

---

*Design system defined. Prototype (8–12 representative pages, real content, US Letter) follows as a separate HTML artifact for review. No full-workbook layout begins until both are approved.*
