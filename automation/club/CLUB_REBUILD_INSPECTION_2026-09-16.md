# $1K Club Rebuild — Inspection Report

**Date:** 2026-09-16. **Scope:** inspection and planning only — no code, content, prices, or data were changed to produce this report. All paths relative to `automation/` unless noted. Every claim below is traced to real code or a real, dated repo file; anything not directly verified is marked as such.

---

## A. Current product map

### Architecture
`automation/club/` is a Node/Express-style app (`bridge-server.mjs` + `club-public-proxy.mjs`, Docker-deployed to `club.scrollyseo.com`). Each of the current 7 modules follows one consistent pattern:

- `lib/moduleN.mjs` — pure `computeModuleNResults()` function, no I/O.
- `lib/moduleN-service.mjs` — auth (signed token), prerequisite gating (Module N requires Module N-1's plan to exist), persistence.
- `lib/*-plan-schema.mjs` + `*-store.mjs` — the module's saved "Plan" shape + file-backed store.
- `public/moduleN.html` — the front end (static HTML/CSS/JS hitting the service via fetch).

Every module recomputes 1..N-1 fresh rather than caching. This scaffolding (auth/gating/persistence/recompute) is solid and reusable regardless of what content sits inside it.

### The current 7 "modules" (what they actually are, not what their names suggest)

| # | Title | What it actually is |
|---|---|---|
| 1 | Your $1K Starting Point | **Onboarding form** + $1K Math + a 6-dimension "mini-evaluation" (offer/customer/discovery/follow-up/conversion/trust) + one auto-picked priority. Not a channel module. |
| 2 | Build Something People Want to Buy | **Offer/positioning workshop** — 3 generated positioning options (template text, no LLM), Fix-First/Keep/Learn triage. |
| 3 | Find the People Most Likely to Buy It | **Customer-discovery workshop** — buyer description, triggers, objections, "customer language hypotheses" (never fabricates search volume), confidence tiers. |
| 4 | Choose How People Will Find You | **Channel-selection scoring engine** — scores ~16 channel *labels* (name + intent tag only, see §D) from `channel-content.mjs` on presence/traction/format-fit/execution-fit/compounding, picks Primary/Secondary/Compounding-asset + a "Not Now" list. No raw score ever shown (tested). |
| 5 | Give Them a Reason to Pay Attention | **Messaging workshop** — one real new input (Core Message, 3 generated options), everything else (angles, content-role priority, channel→message map, proof plan, CTA strategy, "idea formula", 10-15 starter ideas) is derived from 1-4. |
| 6 | Turn Attention Into Sales | **Sales-path workshop** — one canonical purchase/booking destination, CTA→destination map, "Conversion Gap" diagnosis. |
| 7 | Growth Review | **Append-only diagnostic log**, not a page a member "completes" — single-submission constraint diagnosis (Discovery/Conversion/Capacity/Economics/Repeatability/Insufficient-Data) is real; **cross-period trend detection is a hard-coded `false` stub** (`module7-service.mjs`, explicit in the file's own header). |

**This is a strategy/positioning funnel, not a channel-education curriculum.** It maps to **none** of the target spec's 8 channel modules (Instagram/FB, TikTok, YouTube, Google/GBP, Pinterest, Website SEO, Groups, Purchase-path). The current Module 4 chooses *which* channel a business should focus on; it never teaches *how* to run any specific channel.

### Onboarding (current Module 1) — exact field list
`business-profile-schema.mjs`: `route, stage, offer, oneSentenceOffer (null, filled later), price, audience, currentRevenueUsd, sellingSurfaces[], discoveryChannels[], hasEmailList, emailListSize, timeAvailableHoursPerWeek, existingMetrics{}, notes`.

**Not captured:** business name, general website URL. A `storeUrl` field exists only on the separate Connections page (optional Shopify catalog import), decoupled from onboarding.

### $1K Math (`thousand-k-math.mjs`)
- Sales needed: `Math.ceil(targetUsd / price)` — **already matches the new spec's formula exactly.**
- AOV is never averaged from a catalog — correct discipline, already matches spec.
- Traffic: walks backward through a **multi-step funnel** (e.g. ecommerce: reach→product_view→add_to_cart→purchase) using either real customer rates or **position-based generic assumption ranges** (`DEFAULT_STEP_RANGE_FROM_END`: closing step 15/25/40%, mid 8/15/25%, top 2/5/10% — not channel- or niche-specific), producing labeled conservative/base/upside scenarios. Assumptions are visible (labeled `your_own_data` vs `planning_assumption`), not hidden.
- **Single-channel vs. mixed-channel comparison is entirely absent** — one funnel, one set of volumes, no per-channel split.
- **Remaining-revenue progress math** (`max(0, 1000 - revenue)` → sales-remaining) is not implemented as such; `member-growth-state.mjs`'s `revenueGoalSignal()` computes gained-since-Challenge-start, a related but different calculation.

### Revenue/AOV data model (`member-growth-state.mjs`)
Revenue is **whole-business**, never hero-product-locked (`computeRevenue30Day()` sums all reported Growth Review revenue) — already matches the new spec. All revenue is customer-self-reported or explicit zero; nothing is ever inferred from a catalog or guessed.

### Connections (`connections.html`, rebuilt this week)
Read-only, no write permissions requested anywhere. One real capability: Shopify **public** `/products.json` fetch (titles + price range only, no OAuth) that pre-fills the business profile on request. Instagram/TikTok/YouTube/Pinterest/LinkedIn/Website-Analytics/Store-Revenue-live-feed are all honestly "Coming soon" — `describeAuthorizedIntegrationRequirements()` documents exactly what real OAuth would need (Shopify Partner app, GA4 client) and confirms `notConfigured: true` for both. No fake connector anywhere.

### Challenge system
- **Entitlement (real, deployed to code this week, not yet live):** `startChallengeAttempt()` requires a real, unused WooCommerce order for product 280 (`findAvailableChallengeOrder()` in `club-order-verify.mjs`) — Club membership alone is no longer sufficient. One purchase funds exactly one attempt.
- **Opportunity catalog:** 16 core opportunities × 3 platforms (Reels/TikTok/YouTube Shorts) = **48 total**, flat, `limit=8` default recommendation, **no week/day input anywhere in the ranking or service code** — confirmed absent, not partial.
- **Achievement/winner-shirt:** full state model exists in `club-state.mjs` (`qualified/verified/rewardChoice/merchUnlocked`, real writer functions) — but **zero customer-facing UI** calls any of it. The Dashboard's shirt-reward promo is static copy only.
- **Challenge Agent:** `@anthropic-ai/claude-agent-sdk` is a listed dependency but **imported nowhere** under `club/`. Zero agent code exists.
- **Weekly review:** single-submission diagnosis is real; the actual "weekly reviews and adjustments" loop (comparing week over week) has no built comparison logic beyond the hard-coded-false stub in Module 7.

### WooCommerce / commerce
Product 279 ($1K Club, $50) and 280 ($1K Challenge, $25) both **draft/catalog-hidden**; 280 confirmed unreachable via the live public Store API (404) as of this week. `.env.example`'s `WC_CLUB_PRODUCT_ID`/`WC_CHALLENGE_PRODUCT_ID` are blank placeholders — the real IDs are hardcoded literals in `club-access-route.php` (279) and `challenge-service.mjs` (280).

**Flag, not resolved here:** `club-access-route.php`'s own file header says "NOT YET LIVE," but separate deployment work this week verified a live, working WooCommerce→account→token→Club-access flow in production. One of these is stale. Needs a direct live check before the next build session relies on either claim — see §G.

### Tests
7 dedicated module test files (one per current module, 40-57 tests each) plus `club-foundation.test.mjs`, `club-challenge.test.mjs`, `club-module7.test.mjs`, `club-overview-dashboard.test.mjs`. All real behavioral tests (enum rejection, state-machine correctness, isolation-by-identity, "never fabricates a number" regressions) — not smoke tests. **No test file exists for Connections** (`public-store-import.mjs`/`connections-import-service.mjs` are untested).

---

## B. Rebuild matrix

| Area | Current implementation | Required direction | Keep / Adapt / Replace / Remove / Build | Reason |
|---|---|---|---|---|
| Module scaffolding (auth/gating/persistence/recompute pattern) | 7× `moduleN.mjs`+`service.mjs`+`plan-schema.mjs`+`store.mjs`+`html`, consistent, tested | Same technical pattern, applied to 10 channel modules instead of 7 strategy modules | **Keep the pattern, replace the content** | The scaffolding is genuinely good engineering; the problem is entirely what's inside it, not how it's built |
| Onboarding (current M1) | Route/stage/offer/price/audience/revenue/hours/email-list + selling-surfaces + discovery-channels; no business name or website URL; no website scan | Business name + website/store URL + quiet analysis; explicitly drop hours/margins/revenue/bottleneck questions | **Replace** | Wrong fields captured (missing name/URL), wrong fields required (hours/revenue explicitly forbidden by new spec) |
| $1K Math — sales needed | `ceil(target/price)` | Same formula | **Keep** | Already correct, verbatim match |
| $1K Math — AOV handling | Never averaged from catalog; never required at onboarding | Same discipline | **Keep** | Already correct |
| $1K Math — traffic planning | One funnel, position-based generic rate assumptions, no per-channel comparison | Two visible columns (single-channel / mixed-channel) per applicable channel | **Adapt** | The underlying "visible labeled scenario" discipline is good and reusable; the single-channel/mixed-channel comparison layer must be built new |
| Revenue/progress tracking | Whole-business, self-reported, honest-unknown-safe | Same | **Keep** | Already correct |
| Business Model Router (6 routes) | Real, table-driven, reused by every module | Continue reusing for personalization | **Keep** | Directly reusable, matches "use the existing Business Model Router where appropriate" instruction |
| Module 2 (Offer) | Full offer-positioning workshop, 7 questions, 3 generated positioning options | Not part of the 10-module spec at all (no "offer building" module) | **Remove as a module; assess `offer-positioning.mjs`'s generator for reuse inside relevant channel lessons** (e.g. product-page copy in Website SEO, offer clarity in Purchase-path) | Doesn't map to any target module; logic may still be a useful building block, not a customer-facing page |
| Module 3 (Customer Discovery) | Buyer/trigger/objection workshop | Not part of the 10-module spec | **Remove as a module; fold relevant personalization signal into onboarding/channel modules** | Same reasoning |
| Module 4 (Channel Plan / scoring engine) | Real scoring engine picking Primary/Secondary/Compounding from ~16 channel labels (no lesson content) | Customer picks channels to learn directly from the 10-module list; no funnel-recommendation step needed | **Remove as a gating module.** Its channel-fit signals (presence/traction/format-fit) could inform which channel modules are *recommended first* inside the new M2, not a prerequisite score | The new spec explicitly says "Customers should be able to understand a channel and take useful action without completing the entire Club" — a mandatory channel-selection gate before reaching any channel contradicts that |
| Module 5 (Messaging) | Full messaging/content-role/CTA workshop | Not a target module; some pieces (Core Message) are broadly reusable across channel lessons | **Remove as a module; keep Core Message generator as a shared component** if channel modules want to reference "your message" | Doesn't map 1:1; salvageable parts are small |
| Module 6 (Sales Path) | Canonical-destination + CTA mapping | This is almost exactly target Module 10 ("Make It Easy to Buy") | **Adapt into Module 10** | Closest existing match to any target module — real logic, just needs reframing as its own standalone, non-gated module |
| Module 7 (Growth Review) | Real single-review diagnosis; cross-period trend detection stubbed false | "Progress tracking" (Club) + "Weekly reviews and adjustments" (Challenge) | **Keep single-review diagnosis; build the cross-period comparison that's currently stubbed** | Foundation is real and tested; the gap is a known, already-documented stub, not a design flaw |
| `channel-content.mjs` (~16 channel labels) | Name + intent tag only, used for scoring | Full lesson content per channel | **Replace with real curriculum**; the label list itself is a reasonable starting taxonomy to map against the 8 target channels | Zero lesson content exists under any current label — this is pure content work, not code work |
| Connections — Shopify import | Real, narrow, public-catalog-only, shown via a "check this URL" flow that surfaces product count/price range | Same real capability but must NOT display these as onboarding "wow" audit findings | **Adapt (relocate/reframe), don't remove** | The capability is genuinely real and useful; the *presentation* (surfacing catalog counts/price ranges as a quiet-analysis result) is exactly what §C flags as a direct conflict |
| Connections — social/analytics/Shopify OAuth | All honestly "Coming soon," zero fake connectors | Same honesty; may eventually support real read-only imports | **Keep as-is for this rebuild** | Already correctly honest; building real OAuth is explicitly out of scope per your own Challenge-sprint precedent (do not build the connector suite) |
| Opportunity catalog (Challenge) | 48 static items, flat `limit=8`, no week logic | ~100 items, 4 attempt-relative weekly unlocks of 25 | **Build** (data-driven pack-loading mechanism, not hardcoded weeks) | Confirmed absent; this is the single largest Challenge gap |
| 5 SEO Quick Wins | Not found anywhere as a built feature (prior session's own report also found only a static "Coming soon" card) | 5 personalized search opportunities per member | **Build** | Confirmed absent |
| Challenge Agent | Zero code, dependency installed but unused | Narrow, advisory-only, read-only-context agent | **Build** | Confirmed absent; product-ladder.md already specifies exact scope/cost ceiling (~$2/participant, ~$5 hard ceiling) — reuse that spec, don't re-derive |
| Achievement claim/verification/shirt-choice UI | Data model + writers exist, zero UI | Real submission + verification + shirt-choice flow | **Build UI on top of existing data model** | Backend is already correct and tested; only the customer-facing surface is missing |
| Paid Challenge entitlement | Real, tested, gates on a live WC order for product 280 | Same | **Keep** | Already correct as of this week |
| Club purchase gate (`club-access-route.php`) | File says "NOT YET LIVE"; separately verified live in production | Confirmed, working gate | **Verify which is true, then keep** | Can't rebuild-plan around an unconfirmed fact — see §G |

---

## C. Conflicts with the new direction

1. **Onboarding asks for exactly what the new spec forbids.** Current Module 1 requires `timeAvailableHoursPerWeek` and `currentRevenueUsd` — the new spec explicitly says "Do not require questions about weekly execution time, fulfillment capacity, margins, historical revenue, or perceived bottlenecks." Direct, line-for-line conflict.

2. **The Connections "check this URL" flow shows exactly the "wow" findings the new spec bans.** It surfaces product count and price range as a headline result of checking a URL — the new spec's own banned-list is "Product or collection counts. Product price ranges." This is not a hypothetical risk; it's the literal current behavior.

3. **Module 4 is a mandatory gate in front of every channel**, contradicting "Customers should be able to understand a channel and take useful action without completing the entire Club." A member currently cannot reach any channel-specific content without first completing Modules 1-3 and having Module 4's engine assign them a channel — there's no direct "go read the Instagram module" path at all, because no Instagram module exists yet, but the *architecture* (sequential prerequisite gating, one module unlocking the next) would recreate this problem if applied unchanged to 10 channel modules.

4. **Single hero-product-style funnel modeling survives in the backend even though revenue itself is correctly whole-business.** The $1K Math traffic walk is built on one funnel with one price — reasonable for a first pass, but doesn't yet reflect "sales count across the eligible business."

5. **No duplicate-module risk found** in the current 7 modules relative to each other (each covers genuinely distinct ground) — but the *new* 10-module spec explicitly warns against duplicating Instagram/TikTok community material into Module 9; since none of that content exists yet, this is a forward risk to design against, not a current defect.

6. **No essential Club value is currently locked behind the Challenge** — Modules 1-7 are entirely Club-scope; the Challenge only adds the opportunity catalog/agent (both currently empty shells). This is actually already correct and should be preserved as the rebuild proceeds — a genuine "keep this property" finding, not a conflict.

7. **No misleading connection/revenue state found** — every "not connected" state read as honest "Coming soon," and revenue is honestly unknown rather than defaulted to zero. Worth explicitly preserving as a rebuild constraint, since it would be easy to regress while adding new channel-specific connection concepts.

---

## D. Content and evidence inventory

**What exists, usable as-is or as raw material:**
- **Pinterest**: a full 34-section, ~63-page workbook (`products/pinterest-seo-workbook/workbook-draft.md`) with **real, source-checked evidence** — Hootsuite- and Shopify-blog-cited benchmarks, one attributed real case study (Steel Spoon Farm / Jen Kibler), and an explicit "advice you can stop following" section that already models the kind of honest, non-hyped tone the new spec wants. Sections 26-28 (Analytics/Diagnose/How-Long) are close in spirit to the required niche-evidence format (time-to-result, measurement period) but were written for a different, deeper $29-workbook product — needs heavy compression, not reproduction.
- **Shopify workbook** (`products/shopify-seo-workbook/`): similar depth/quality, ecommerce/SEO-focused rather than channel-specific — useful for Module 8 (Website SEO) background, not a channel module itself.
- **`channel-content.mjs`**: a reasonable starting taxonomy (~16 channels including Google Search, Google Maps, YouTube, Instagram, TikTok, Pinterest, Threads, Facebook, Reddit/forums, Etsy, Amazon, referrals, email, professional communities, marketplaces, in-person) — no lesson content, but a usable checklist of "channels we already thought about" to reconcile against the 8 target modules.
- **`products/1k-club/launch-package/`**: scripts/hooks for Scrolly's *own* marketing videos (messaging angles, YouTube long-form, short-form bank, Threads, launch sequence) — this is marketing-Scrolly-to-customers content, explicitly NOT customer-facing curriculum. Do not confuse the two when scoping content work.

**What's missing entirely (confirmed absent, not just unpolished):**
- Any lesson, screenshot, worked example, or checklist for Instagram, Facebook, TikTok/TikTok Shop, YouTube/Shorts, Google Search/GBP, Groups/Communities, or Purchase-path optimization. Zero content exists for 7 of the 8 target channel modules.
- Any niche-specific evidence (traffic volumes, time-to-result, publishing cadence) for any channel other than Pinterest.
- Any TikTok Shop mechanics/fee research (TikTok Shop is new territory even relative to the Pinterest/Shopify workbooks).

**Conclusion:** content work is almost entirely greenfield outside Pinterest. Software work (new module scaffolding reusing the existing pattern) is comparatively small; **the real bottleneck for shipping 10 real channel modules is content research and writing, not code.**

---

## E. Recommended reference module: **Pinterest**

Assessed against the actual code and content (not just "reference material exists," per your instruction to verify before deciding):

- It's the only channel with real, sourced, non-fabricated evidence already in the repo — building it first means the evidence-inventory problem (§4 of your brief) is smallest here, not zero-from-scratch.
- Its existing workbook already demonstrates the honest-sourcing discipline (real case study, explicit "average vs. case study" distinction, dated sources) the whole product needs to model — a template for how to write evidence panels correctly.
- It's a self-contained channel (unlike Instagram/Facebook, which the new spec deliberately treats as one module with two different surfaces — more design surface area to get right).
- It doesn't require new commerce-adjacent research the way TikTok Shop does.

**What a complete Pinterest reference module should contain** (mapped to the 7-question depth requirement in §3 of your brief):
1. Fit check — "Should your business even be on Pinterest?" (real content exists, Section 1 of the workbook, needs compression from workshop-depth to lesson-depth).
2. How discovery/selling works — search, recommendations, saves, outbound traffic (Sections 3, 6, 9 — compress).
3. Setup — business profile, website/Shopify claim, catalog/Rich Pins if applicable (Sections 13-14 — compress; the existing Shopify-catalog-import Connection can genuinely feed this step, once its presentation is fixed per §C.2).
4. Specific approaches — keyword-driven pin creation, board strategy, seasonal planning (Sections 6-12 — compress into a short lesson + checklist, not a 30-pin-idea generator).
5. What good execution looks like — worked example(s), possibly the existing case study reframed as an in-product evidence panel.
6. First action — one clear "do this first" (existing "5-Minute Readiness Check" is a strong candidate, already built).
7. What to watch — Pinterest Analytics basics (Section 26 — compress).

New work required beyond compression: the "two traffic columns" (single-channel/mixed-channel) applied specifically to Pinterest, a genuine connected-vs-unconnected content split (today's workbook doesn't distinguish these at all), and re-sourcing/re-verifying any benchmark older than "current" for a live product launch.

**Do not build it yet**, per your instruction — this is the recommendation, not the build.

---

## F. Implementation sequence (proposed stages)

Each stage is meant to be reviewable independently and to preserve existing customer access/data throughout — no stage requires taking the Club offline or migrating existing member records destructively.

1. **Resolve the `club-access-route.php` live/not-live discrepancy** (§G, blocking — needed before any customer-facing claim in this report can be trusted). No code change, just a live check.
2. **Onboarding rebuild**: add business name + website URL fields, remove hours/revenue/margin questions, keep the existing multi-select selling-surfaces/discovery-channels UI (already correct from the recent sprint). Validate against existing test member states — `business-profile-schema.mjs`'s shape barely changes (add 2 fields, remove reliance on 2 others), so old records should still load.
3. **Fix the Connections "wow" disclosure problem**: same real Shopify-import capability, reframed so catalog counts/price ranges never surface as a headline result — smallest safe fix for the most concrete conflict found.
4. **Retire Modules 2-5 as customer-facing gates** (keep their generator logic available as internal library code where genuinely reusable — Core Message generator, offer-positioning text engine — rather than deleting outright); adapt Module 6 into the new Module 10 ("Make It Easy to Buy"), since it's the closest existing match.
5. **Build the Pinterest reference module** (per §E) as the first real channel module — proves the new content/module pattern once before repeating it 7 more times.
6. **Build remaining 7 channel modules**, reusing the Pinterest module's structure — this stage is dominated by content research/writing, not new architecture.
7. **$1K Math traffic-column rebuild**: add the single-channel/mixed-channel comparison, reusing the existing labeled-scenario discipline.
8. **Challenge deliverables**: Weekly Pack data model (data-driven, not hardcoded), 5 SEO Quick Wins, Challenge Agent V1, achievement/shirt UI on top of the existing data model — each independently shippable, none blocks Club launch.

Dependency note: stages 2-4 (onboarding/Connections/module retirement) should land before stage 5-6 (channel modules), since the new modules will read the corrected onboarding profile shape. Stage 7-8 (Challenge/math) can proceed in parallel with 5-6 once stage 1-4 are settled.

---

## G. Founder decisions

Only genuine open decisions that materially change implementation — nothing already answered in your brief is re-asked here.

1. **Is `club-access-route.php` actually live in production or not?** Its own file header says no; a separate deployment session this week verified a live end-to-end flow. **Recommendation:** do a direct live check (attempt the real My-Account → "Go to $1K Club" flow as a real or test buyer) before writing the next implementation prompt, since several downstream claims about "the Club already works" depend on this being true. Low cost to check, high cost to build on a wrong assumption.

2. **What happens to Modules 2, 3, and 5's generator logic** (offer-positioning text engine, customer-language hypotheses, Core Message/messaging generators) — delete outright, or keep as internal library code referenced by the new channel modules where relevant (e.g., a "sharpen your caption" tool inside Instagram, reusing the messaging generator)? **Recommendation:** keep as library code, not customer-facing pages — deleting working, tested generation logic outright would be wasteful, but resurrecting the old modules as gates would recreate the exact conflict in §C.3. This doesn't require a full rewrite of that logic, just a decision not to route to it as a standalone page.

3. **Should the existing sequential prerequisite-gating pattern (Module N requires N-1) be dropped for the new channel modules, or kept but loosened** (e.g., Module 1 always required, then any of Modules 3-10 accessible in any order)? **Recommendation:** keep Module 1 (Business & Connections) and Module 2 ($1K Starting Point) as required, sequential, since they establish the business profile and $1K math every channel module personalizes against — then make Modules 3-10 freely orderable, directly matching "customers should be able to understand a channel and take useful action without completing the entire Club."

4. **How much of the Pinterest/Shopify workbook content is licensed for reuse inside the Club product versus needs a fresh, shorter pass written specifically for this format?** This is a content/product decision, not something the code reveals. **Recommendation:** treat the workbooks as research/evidence source material to cite and compress from, not as text to copy-paste — the new spec's tone (short lessons, checklists, evidence panels) is structurally different from the workbook's worksheet-heavy format, so a fresh compression pass is likely needed regardless of licensing.

---

## Completion summary

- **Reusable as-is:** module scaffolding pattern (auth/gating/persistence), Business Model Router, $1K Math's sales-needed formula and AOV discipline, whole-business revenue tracking, Connections' honest "Coming soon" states and real (if narrow) Shopify import, Module 6's sales-path logic (→ new Module 10), all 7 module-specific generator engines as internal library code, the entire paid-entitlement gate for the Challenge, the existing test suite's behavioral rigor as a bar to hold new modules to.
- **Needs replacement:** the entire module *content* layer (Modules 2-5 as customer-facing pages), the onboarding field set, the Connections "wow findings" presentation, the mandatory sequential-gating architecture as applied to channel modules.
- **Content/research missing:** essentially all of it, for 7 of 8 target channels — this is the dominant remaining cost, not code.
- **Reference module to build first:** Pinterest.
- **Genuine blockers:** none that block *this* report; one open factual question (Club access gate live-or-not) that should be resolved before the next implementation prompt is written, so that prompt isn't built on an unverified assumption.
