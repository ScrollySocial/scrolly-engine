---
status: architecture approved with revisions (round 2) — NO CODE WRITTEN YET
created: 2026-08-19
revised: 2026-08-19
---

# Shopify SEO Workbook — Sales Page Architecture & Copy Direction (Rev. 2)

Round 1 architecture approved with 15 revisions. This version supersedes the round-1 plan. Still no HTML written for the sales page itself.

## Revision log (round 1 → round 2)

1. Big Idea unchanged; **BUILD** made the dominant verb across H1, tagline, and section headlines.
2. Hero H1 rewritten to be outcome/problem-led; the "one worksheet at a time" line demoted to a supporting product tagline.
3. "SEO vs. Paid Traffic" section reframed as **rented vs. owned/compounding assets** — not adversarial, not mutually exclusive.
4. "You Could Google All of This" kept and strengthened as a core value-justification section with a fragmented-topics → ordered-system visual.
5. Product ladder cut to **two** tiers ($59 / $299) — the undefined implementation offer removed from the customer-facing page entirely.
6. CTA system simplified to **one consistent purchase CTA wording** ("Get the Shopify SEO Workbook — $59") at five purchase points; secondary nav CTAs may still vary.
7. Delivery assumption locked to **downloadable PDF only** at launch (printable + tablet/digital-usable), no promise of an interactive HTML version.
8. Checkout assumption locked to **self-service: payment → immediate download**, no intake form, no manual fulfillment. Checkout URL marked as an implementation placeholder.
9. Refund copy given a placeholder-but-directional policy (digital goods, generally final, exceptions for duplicates/technical failure) — flagged for real legal language before publish, not written as final.
10. Page count removed from all customer-facing copy — verified counts only (29 / 27 / 13 / 1).
11. Implementation offer removed entirely from this page.
12. Confirmed: **own dedicated page**, sibling to the $299 page, reusing the existing design system — not a replacement, not a hub conversion.
13. $299 naming conflict: use current live customer-facing term ("SEO Site Audit") on this page; canonical rename is out of scope here, flagged separately.
14. Visual product proof restructured from one gallery section into a **progressive reveal that runs through the whole page** — the visitor effectively opens the workbook as they scroll.
15. Reframed the entire page's job: not "175 pages of information," but the transformation from *"I know I should do SEO but don't know what to do"* to *"I have my keywords, architecture, optimized pages, content strategy, technical priorities, measurement system, and 90-day plan."*

---

## 1. Positioning / Big Idea — unchanged, sharpened

> "The work in this workbook is yours to keep — your keyword universe, your architecture, your content pipeline, your roadmap. That's the actual product." — `workbook-draft.md`, Section 29

**Big Idea:** You don't finish this workbook having read about SEO. You finish it having **built** it — specific to your store, yours to run forever.

BUILD is the throughline: it appears in the H1's job (implicitly, via "from scratch"), the tagline, at least six section headlines, the price-section headline, and the closing CTA. The page should never let the reader forget that the deliverable is something they *make*, not something they *read*.

---

## 2. Hero — revised

**Eyebrow:** `SHOPIFY SEO WORKBOOK`

**H1 (problem/outcome-led, not mechanism-led):**
**Build Your Shopify SEO Strategy From Scratch — Without Guessing What to Do Next**

**Branded supporting tagline (smaller, sits under or beside the H1, not competing with it):**
*Build your store's organic growth system — one worksheet at a time.*

**Sub-hero (lede):** A guided, 29-section workbook that turns "I know I should be doing SEO" into a keyword universe, a decided site architecture, optimized product and collection pages, a content system, and a 90-day plan — built by you, for your store.

**Primary CTA (purchase #1):** `Get the Shopify SEO Workbook — $59`
**Secondary CTA:** `See What's Inside ↓`

**Trust line (verified counts only):** `29 guided sections · 27 worksheets & decision tools · 13 Ask AI prompts · 1 finished SEO plan`

**Hero visual — unchanged, still correct:** the real approved cover (`build/shell.html`, `.cover2`) with its already-coded floating cards (Keyword Universe, site architecture SVG, technical checklist, SERP preview).

$59 sits above the fold twice — once inline in the price-stated eyebrow/trust context, once inside the primary CTA button itself — satisfying "keep $59 above fold" without a separate price callout competing with the H1.

---

## 3. Section sequence — revised

The biggest structural change from round 1: visual proof is no longer one "See Inside" gallery section. It's distributed — the page reveals real workbook pages progressively as the visitor scrolls, so the experience mirrors opening the actual workbook (cover → system → worksheets → diagrams → Ask AI → technical framework → content system → 90-day plan → final plan).

| # | Section | Headline | Purpose | Visual (real asset unless noted) | CTA |
|---|---|---|---|---|---|
| 1 | Header / nav | — | Wayfinding | Reused component | Purchase #1 |
| 2 | Hero | *Build Your Shopify SEO Strategy From Scratch — Without Guessing What to Do Next* | Hook | Cover + floating real cards | Purchase #2 |
| 3 | The Problem | *Everyone Tells You What to Do. Nobody Tells You What to Build First.* | Agitate scattered-advice overwhelm; tone stays "you can build this" | Light original micro-illustration (scattered tags → line) | — |
| 4 | Rented vs. Owned | *Paid Traffic Stops When You Stop Paying. Organic Assets Don't.* | Reframe paid/organic as rented vs. compounding, not adversarial; no invented ad-cost figures | Real Section 2 tradeoff table, restyled | — |
| 5 | The System | *The System You're About to Build* | Centerpiece reveal: Keyword Universe → Search Intent → Architecture → Products & Collections → Content → Technical → Google Visibility → Measurement → AI Readiness → 90-Day Plan | Sales-page build of the real "Your System So Far" chain diagram | Secondary — `See What You'll Build ↓` |
| 6 | Built, Section by Section | *You Don't Finish With Pages. You Finish With a Built System.* | The progressive-reveal proof gallery — each build output shown paired with its real corresponding page: Keyword Universe worksheet (Sec 4), Draw-Your-Store architecture worksheet (Sec 6), Google Product Visibility checklist (Sec 9), the "Anatomy of a Search-Optimized Shopify Page" signature spread (Sec 14), 30-Content-Opportunities worksheet (Sec 13), Technical RED/YELLOW/GREEN triage (Sec 18) | 6 real workbook pages, revealed in scroll order | — |
| 7 | Your SEO Co-Pilot | *Your SEO Co-Pilot Is Built In* | AI differentiation without overpromising | Real Ask AI box (violet) with an actual prompt + its real guardrail line | — |
| 8 | Search Expanded | *Search Didn't Disappear. It Expanded.* | "Does SEO still matter" objection, via the workbook's actual Merchant Center/social/AI coverage | Reused `orbit6` diagram (verbatim) | — |
| 9 | The Information Isn't the Scarce Part | *You Could Google All of This.* | Strengthened value-justification section (see §4 below) | Fragmented-topics → ordered-chain visual (13 nodes collapsing into one system) | Purchase #3 |
| 10 | This Is What You'll Be Holding | *This Is What You'll Be Holding When You're Done* | Closing proof beat, right before the ask — shows the *finished* artifact | Real 90-Day Plan (Sec 24) + Final Consolidated Plan (Sec 26) pages | — |
| 11 | Who It's For | *Built for Store Owners Who'll Do the Work* | Honest qualification | Reused `.fit-split` pattern | — |
| 12 | Price | *$59. Everything You Need to Build It.* | Conversion moment; verified counts only, PDF delivery note | Price-stack card | Purchase #4 |
| 13 | Product Ladder | *Teach Me vs. Analyze Mine* | Honest, two-tier relationship to the $299 audit (see §5) | Two-step ladder, real Section 29 language | Soft link to $299 page only |
| 14 | FAQ | *Questions? We've Got Answers.* | Objection handling | Reused `.faq-list` | — |
| 15 | Final CTA | *Stop Reading About SEO. Start Building It.* | Close | Reused `.final-cta` band | Purchase #5 |
| 16 | Footer | — | Legal/trust | Reused component | — |

---

## 4. "You Could Google All of This" — strengthened

Core argument, unchanged in spirit, sharpened in wording:

**The information isn't the scarce part. Knowing what applies to your store, what order to do it in, and turning it into a plan is.**

Visual: a chain of the fragmented topics a reader would otherwise have to piece together from scattered tutorials —

`Keyword research → Search intent → Shopify architecture → Collection SEO → Product SEO → Merchant Center → Technical SEO → Content strategy → Internal linking → Search Console → AI search → Social search → Prioritization`

— shown first as scattered/disconnected, then visually collapsing into the single ordered system already established in Section 5's diagram. This directly reuses the page's own established visual language rather than introducing a new metaphor, and it's the section that earns the "$59 for all of this" conclusion without inventing a fake dollar-value comparison.

---

## 5. Product ladder — cut to two tiers

Per revision #5, the undefined implementation offer is removed from the page entirely.

| Tier | Price | Framing | Product |
|---|---|---|---|
| 1 | $59 | "Teach me" | Shopify SEO Workbook (this page) |
| 2 | $299 | "Analyze mine" | Personalized SEO analysis — customer-facing name **"SEO Site Audit"** (matches live `index.html`; the "Organic Search Opportunity Report" name used internally is a separate naming decision, out of scope here) |

Still grounded in the workbook's own Section 29 language ("Where this workbook taught you the method... the Site Audit applies deeper research... directly to your real store"), just without the third, undefined step. A third tier can be added later once that offer actually exists — the ladder component should be built so a third card can slot in without a redesign, but nothing about it should be visible or implied to today's visitor.

---

## 6. CTA system — revised

**One consistent purchase CTA, used at all 5 purchase points:**
`Get the Shopify SEO Workbook — $59`

Purchase points: (1) header nav, (2) hero, (3) after "The Information Isn't the Scarce Part," (4) price section, (5) final CTA band. Same wording every time — the transaction should never be ambiguous.

**Secondary/navigational CTAs may vary, since they aren't purchase actions:**
- Hero secondary: `See What's Inside ↓`
- After "The System": `See What You'll Build ↓`

**Implementation placeholder (per revision #8):** the actual checkout/payment link isn't wired yet. Every purchase CTA's `href` ships as a clearly labeled placeholder (e.g. `<!-- TODO: replace with live Stripe Payment Link for the $59 workbook -->`) rather than a dead `#` link presented as functional — matching the existing pattern already used in `website/index.html` for its own unwired CTA.

---

## 7. Delivery, checkout, and refund — assumptions for this build

- **Delivery:** downloadable PDF only at launch. Copy should describe it as printable and usable digitally on a laptop or tablet, available immediately after purchase. No promise of an interactive HTML version at launch.
- **Checkout:** self-service. Payment → immediate access/download. No intake form, no manual fulfillment step, no questionnaire — this is a structural difference from the $299 product's flow, not an oversight.
- **Refund policy (placeholder language for architecture purposes only):** "Digital product purchases are generally final once delivered or accessed, with exceptions for duplicate purchases or genuine technical delivery issues." **This is not final legal language** — flagged for owner review before publish, per revision #9. The existing `refund.html` (written for the bespoke $299 research product) does not apply here and should not be linked to as-is; the workbook page needs its own short policy statement or its own refund page once the real language is approved.

---

## 8. Page count & counts policy

No specific page number appears anywhere on the page. Only verified counts are used: **29 sections · 27 worksheets & decision tools · 13 Ask AI prompts · 1 finished Shopify SEO plan.**

---

## 9. Site structure

The workbook gets its **own dedicated page/URL**, built as a sibling to `website/index.html`, reusing the existing design system and shared components (header, footer, buttons, FAQ accordion, orbit diagram, color/type tokens). `index.html` is not modified, not converted into a multi-product hub, and not replaced as part of this build. Broader navigation/hub restructuring (e.g., whether `index.html` eventually links out to the workbook page) is a separate, later task.

---

## 10. Visual product proof — the progressive-reveal principle

Per revision #14, this is the most important structural change. Rather than clustering all real workbook assets into one "proof" section, the page should feel like it's opening the workbook as the visitor scrolls:

`Cover (hero) → System diagram (§5) → Worksheets (§6) → Signature diagram (§6) → Ask AI (§7) → Technical framework (§6) → Content system (§6) → 90-Day Plan (§10) → Final Plan (§10)`

Every one of these is a real, already-designed asset pulled from `build/workbook-print.html` — none are generic marketing illustrations. The only newly-designed (non-workbook) visual on the whole page is the small scattered-to-ordered micro-illustration in "The Problem" (§3), which is intentionally light and typographic rather than a competing piece of art.

---

## 11. Remaining open items (unchanged from round 1, now formally deferred rather than blocking)

- Exact final legal refund language (owner review required before publish).
- Live checkout/payment URL (implementation placeholder until wired).
- Canonical $299 product name ("SEO Site Audit" vs. "Organic Search Opportunity Report") — out of scope for this build, flagged separately.
- Whether/how `index.html` eventually cross-links to the workbook page — separate, later task.

---

*No HTML has been written. Awaiting final sign-off on this revised plan before implementation begins.*
