---
status: awaiting approval — resolves edge cases found during prototyping, before full-workbook layout begins
created: 2026-08-19
supplements: design-system.md
---

# Design System — Edge Case Resolutions

## 1. Multi-page worksheet system

**First page**
- Full worksheet title bar (the colored top bar + "WORKSHEET" label + icon, as already defined) — this is the only page that gets it at full size.
- One-line purpose/instruction sentence directly under the bar if the source text has one (e.g., "Work through six rounds of five...").
- Writing fields begin immediately after — no extra decorative space between instruction and first field.

**Continuation page(s)**
- No repeated full-size title bar. Instead: a slim header strip — same accent color as a thin 1px top rule (not the full colored bar), the worksheet's short name in small caps, and an explicit **"continued"** tag plus a page-of-page indicator (e.g., "Content Opportunities — continued · 2 of 3").
- Column headers repeat at the top of any table that continues (a reader shouldn't have to flip back to remember what column 4 means), but only the header row — not the intro paragraph, not the instructions.
- Everything else on the page is writing space. This is the whole point of a continuation page.
- The strip is compact enough (roughly 0.3in) that it doesn't meaningfully eat into writing room.

**Final page**
- Same slim continuation header as any other continuation page, so it doesn't visually jump back to "first-page" weight.
- Ends with the worksheet's actual closing elements as written in the source (a synthesis field, "Check Your Work," an Ask AI box) — these already exist in the content; the layout rule is just: they belong on the last page, not pulled forward onto page 1 to "balance" the layout.
- Where the source text points to a next section, that pointer stays exactly where the author placed it — no invented new field.

**Rule that applies throughout**: a continuation page never repeats the worksheet's teaching/instruction copy. If a reader needs to remember what a worksheet is for, that's what flipping back one page is for — repeating it on every continuation page is the actual page-count risk the multi-page system needs to avoid.

### Tested against the real Section 13 worksheet ("My First 30 Organic Content Opportunities")

Laid out at realistic Letter dimensions (worksheet content area ≈ 7in × 9.2in after margins and the title bar):

- Six rounds × five fill-in lines each, at a writing-line height that's actually usable (not cramped) run to roughly **2.3in per round** including its header. Three rounds fit on the worksheet's first page alongside the instruction line; the remaining three rounds need a second page.
- The 7-column, 10-row qualification table needs real per-cell writing width — at 7 columns across 7in, that's exactly the kind of table that wants its own page rather than being squeezed under Round 6.
- The Ask AI box (two bundled prompts) and Check Your Work paragraph fit on that same third page, after the table.

**Result: this worksheet genuinely needs 3 pages** — Round 1–3, Round 4–6 (continued), and the qualification table + Ask AI + Check Your Work (continued, final). I did not compress the rounds or shrink the table to force it into fewer pages — per your instruction, usability wins. The section's teaching content that precedes the worksheet (the 10-row sourcing table and the idea→opportunity example) needs roughly one more page on top of that. **Section 13 realistically needs ~4–5 pages total**, not the 6 I'd budgeted in the manifest — so the manifest's number was actually generous enough already, once real layout is accounted for. No page-count crisis here, just confirmation that the 3-page worksheet fits inside the existing budget.

---

## 2. All 27 tools, classified by multi-page risk

| # | Tool | Classification | Why |
|---|---|---|---|
| 1 | 3-Question Store Health Check | **Single-page safe** | 3 short items, each with a compact pass/fail block |
| 2 | Where Can Customers Discover Me? | **Single-page safe** | 8-row table, one column of ratings |
| 3 | Customer Acquisition Economics Calculator | **Depends on final content flow** | ~10 compact labeled fields across 3 groups — full but not overflowing |
| 4 | Your Keyword Universe | **Likely multi-page** | 13-row angle table, explicitly repeated for 2–3 products — inherently multi-instance |
| 5 | Search Intent Classification | **Depends on final content flow** | 10-row, 5-column table — tight but plausible on one page |
| 6 | Does This Keyword Deserve Its Own Page? | **Depends on final content flow** | 5 rows but 7 dense columns — width pressure, not height |
| 7 | Draw Your Search-Optimized Store | **Single-page safe** | A sketch/tree template, spatial not list-based |
| 8 | Your Collection Map | **Single-page safe** | 5-row table plus short naming/URL guidance |
| 9 | Optimize One Product With Me | **Likely multi-page** | 7 questions + 8 fields, several needing multi-line answers |
| 10 | Repeatable Catalog Checklist | **Single-page safe** | 9 short checkbox items |
| 11 | Google Product Visibility Checklist | **Single-page safe** | ~17 checkboxes across 5 groups, but each item is one line |
| 12 | Optimize Your Highest-Priority Collection | **Single-page safe** | 7 compact labeled fields |
| 13 | Your Content Clusters | **Likely multi-page** | Explicitly repeated for 3–5 clusters, each with its own mini-table |
| 14 | My First 30 Organic Content Opportunities | **Likely multi-page — confirmed 3 pages** | See full test above |
| 15 | The Page-Optimization Workflow | **Single-page safe** | 14-item single-column checklist |
| 16 | My Internal Linking Plan | **Depends on final content flow** | Worked example table + 7-row blank table together are tight |
| 17 | Google Search Console setup walkthrough | **Single-page safe** | Procedural steps, not a fill-in volume risk |
| 18 | My Shopify Technical SEO Check | **Single-page safe** | 15 checkboxes across 3 compact groups |
| 19 | "Can I Fix This Myself?" decision table | **Single-page safe** | 3 rows, text-heavy but bounded |
| 20 | Turn Search Demand Into Social Content | **Depends on final content flow** | Only 5 rows, but 8 columns — a width problem, not a height one |
| 21 | Your AI Search Self-Test | **Depends on final content flow** | 4-row, 6-column table plus prompt list |
| 22 | AI Search Readiness Checklist | **Depends on final content flow** | ~23 checkboxes across 5 categories — borderline |
| 23 | Monthly Organic Search Scorecard | **Depends on final content flow** | 8-row table plus 3 open-ended synthesis lines |
| 24 | Your 90-Day Plan | **Likely multi-page** | Branching table + 3 phase tables (10 rows total) + summaries — the single largest tool in the book |
| 25 | Printable 90-Day Checklist | **Depends on final content flow** | 20 rows — but explicitly designed to be a single "keep by your desk" reference; worth fighting to keep on one page (denser row treatment or two-column layout) rather than accepting a natural split |
| 26 | My Shopify SEO Plan (Final Workbook) | **Depends on final content flow** | ~15 fields, several compact, but "first 10 articles" alone wants real room |
| 27 | The Buy/Wait/Skip Check | **Single-page safe** | 6 short questions |

**Summary: 10 single-page safe, 5 likely multi-page, 12 depends-on-flow.** The "depends" group isn't a problem to solve now — it's the honest middle category the classification exercise is supposed to produce, and each one gets a real decision once its actual final font size and row height are set in production, using the multi-page system above if it tips over.

---

## 3. Master "Your System So Far" diagram — specification

One master SVG graphic, re-rendered at each of its states rather than built as unrelated diagrams:

- **Layout**: horizontal chain of rounded-rect nodes (12px radius, matching the card system), wrapping to a second row when the chain grows too wide for one line — exactly as prototyped for the Part 4 opener.
- **Completed state** (built in an earlier Part): `--bg-alt` fill, `--line` stroke, `--ink` text — neutral, "already yours."
- **Current state** (added in *this* Part): `--indigo-bg` fill, `--indigo` stroke, `--indigo-dark` bold text — the one state allowed to use the accent color, so "what's new this Part" is visually obvious without reading every label.
- **Future/not-yet-built state**: **not used**. The diagram's job is proof of progress already made, not a preview of what's coming — a row of grayed-out future nodes would add clutter without serving that job, and nothing in the source content previews ahead of the current Part anyway.
- **Connectors**: solid arrow (`--ink-soft`, small triangle marker) between same-row completed nodes; where the chain wraps to a new row, a dashed connector signals "continues" rather than "branches"; the arrow leading into the current-state node(s) is drawn in `--indigo` specifically, so the eye lands on what's new.
- **Labels**: short worksheet names only, no section numbers on the diagram itself — the diagram is for at-a-glance progress, not lookup. (The plain-text version that already exists inline in each Part's opening paragraph — e.g., "Keyword Universe (Sec. 4) → Search Intent (Sec. 5)" — keeps its section numbers; that's the lookup version, this is the progress version. Two renderings of the same information for two different jobs, which is intentional, not a duplication to fix.)

**The six required states** — checked directly against the source document, and this surfaced a real gap:

| State | Appears at | Status |
|---|---|---|
| 1 | Part 4 opening (first full diagram) | Present in source |
| 2 | Part 5 opening | Present in source |
| 3 | Part 6 opening | Present in source |
| 4 | Part 7 opening | Present in source |
| 5 | Part 8 opening | **Missing** — Part 8 currently opens directly into Section 20 with no intro paragraph or diagram placeholder at all, unlike every other Part from 4 through 9 |
| 6 | Part 9 opening (complete, every stage built through Part 8) | Present in source |

**Flagging, not fixing**: your instruction for this pass is that content stays frozen and this is design-system completion only. Adding the missing Part 8 instance is a small, mechanical addition — a one-paragraph intro matching the exact pattern already used at Parts 4–7 (a plain-text chain plus a diagram placeholder tag), not a new lesson or worksheet — but it does touch `workbook-draft.md`, so I'm surfacing it for your explicit go-ahead rather than adding it unilaterally mid-design-phase.

---

## 4. Screenshot production rule — locked

**Rule**: real Shopify / Google Search Console / Google Merchant Center screenshots are captured as late as practical in the production timeline — close to actual publish, not during this design phase — because these interfaces are exactly the fast-moving elements already flagged in the production manifest's freshness-check list.

**What gets decided now instead**: real dimensions, reserved now, so a late screenshot swap never causes a layout scramble.
- Every screenshot page reserves a minimum **5.5in-wide** crop area at the content column width — large enough that real Shopify admin text stays legible, not shrunk to fit decoratively.
- The chrome-bar / highlight-box / numbered-badge / caption-bar system (already defined and prototyped) is fixed independent of what the actual screenshot shows — swapping in a real image later only replaces the pixels inside the frame, not the frame, the highlight positions' relative logic, or the caption.
- Every screenshot spec in the source document already states exactly what must be visible and what gets highlighted (verified during the production-manifest pass) — production crops to that specific UI region, never a full, uncropped browser window shrunk to fit.

---

## 5. Cover — status

**Cover Concept V1 — pending product-owner visual approval.** Treated as provisional. Nothing about it (the gradient-band-plus-plain-bottom split, the specific title treatment) has been propagated into any other page's design rules — Part openers share the *gradient*, because that was a design-system decision made independently (§6 of `design-system.md`), not because the cover happens to use one. The interior system doesn't depend on the cover in either direction.

---

## 6. Updated page-count projection

| | Estimate |
|---|---|
| Previous projection | ~164–175 pages |
| Section 13 real layout | Confirmed ~4–5 pages needed — inside the existing 6-page budget, no increase |
| Section 24 (90-Day Plan) | Already the largest tool in the book at ~9 budgeted pages; confirmed as **Likely multi-page** — no new information changes the estimate, but confidence in the 9-page figure is now higher, not lower |
| Other "depends" tools (12 of them) | Real risk of +0.5–1 page each if several land on the multi-page side once production sets final type size — a plausible worst case of **+4–8 pages** across the whole book if roughly half of the 12 need a second page |

**Updated range: ~164–183 pages**, with **~170–178 the realistic center** once the worksheet system above absorbs the genuine writing-space needs. This is explicitly not a compression target — per your instruction, an increase driven by real writing/work space is acceptable and expected, not something to fight back down.

## Anything that blocks full production

Nothing structural. Two small approvals needed before layout starts, both flagged above rather than decided unilaterally:
1. Whether to add the missing Part 8 "System So Far" instance (a small, frozen-content-adjacent edit).
2. Explicit sign-off that the multi-page worksheet system and the 27-tool classification above are the right approach before it gets applied to all 5 "likely multi-page" and 12 "depends" tools during actual layout.

Everything else in this document is ready to build from.
