# $1K Club V1: build status

## LIVE STATE (2026-09-16, latest pass): three-track product pivot, not deployed

**Supersedes the earlier ten-module/eight-channel curriculum described further
down this file.** Canonical direction now lives in
`Scrolly Organic Engine/methodology/product-ladder.md`'s "three-track pivot"
section: read that first for the product rationale, this section for what's
actually built against it.

**Curriculum restructure.** Three core, equal-depth tracks replace the eight
channel modules: Instagram & Facebook (Facebook Groups/community
participation folded in, Threads as supporting instruction only), TikTok &
TikTok Shop, and a new LinkedIn track built from scratch
(`club/public/channel-linkedin.html`). Shared foundations (Business &
Connections, $1K Starting Point, Make It Easy to Buy) apply regardless of
track. YouTube, Google, Pinterest, Website SEO, and the old Groups module are
retired from the primary sequence but not deleted: their routes, content,
and any saved member data are untouched, just moved to an "Also available"
list on My Plan instead of the main track grid. A single understated
"Longer-term growth" card on My Plan references future $10K Club material
without implying it's purchasable. `modules.html` and `club-shell.js`'s
`MODULE_SEQUENCE`/`MODULE_PATHS` were updated to match.

**Navigation redesign.** The large Previous/All modules/Next card row above
every track's title (added in the prior pass, correctly criticized as
oversized) is removed entirely from `club-shell.js`. Replaced with a compact
`.track-nav` (a plain "My Plan" link plus a 3-pill track switcher) injected
by `channel-module.js`'s new `buildTrackNav()`, sized to sit next to the
title. Within-track destination tabs (Overview/Setup/How to Use/Numbers/
Track) are unchanged. At the end of a track (the last destination tab), a
new `buildEndOfTrackActions()` replaces the old dead "Next" slot with a real
"Back to My Plan" plus an entitlement-aware Challenge CTA (checks
`/club/challenge/state` live; says "Continue your Challenge (Day X of 30)"
for an active attempt, "Explore the $1K Challenge" for a member with no
attempt yet, or nothing if the check fails). A real bug was found and fixed
in the same pass: `initDestinations()` used to `window.scrollTo` on every
page load, even the default first tab, which scrolled straight past the new
track nav and title; now only scrolls on an actual tab switch or a real
`#hash` deep link.

**Writing rule, now canonical**: no em dashes in customer-facing Club copy
(see product-ladder.md). Swept and fixed across the entire active journey:
`modules.html`, `challenge.html`, `connections.html`, `index.html`,
`overview.html`, `performance.html`, both new/rewritten track pages, the
shared `channel-module.js`/`channel-module.css`, and `opportunity-catalog.mjs`.
**Not swept**: the 5 retired channel pages (google/groups/pinterest/
website-seo/youtube) and the old module2-6/content/review/website pages,
which still contain em dashes from before this pass. These are reachable
(not deleted) but explicitly deprioritized; fixing their copy was judged
lower priority than the new-scope work this pass, and is flagged here
rather than silently left undone.

**Content depth**: Instagram & Facebook and TikTok were rewritten to the new
Overview structure (why consider it / who fits / how discovery-to-purchase
works / 30-day actions / reported results / starting conditions), with the
banned generic-platform-intro phrasing removed and "surface" replaced with
plain terms ("format," "post type"). A new `.insight-note` component (the
brand doc's "accent handwriting" treatment, using the Caveat font already
loaded but never wired into a real component before this pass) surfaces
concise, sourced insights beside the relevant lesson, structured as
takeaway + what to do differently + a source note. Both tracks' Track &
Improve tabs were rewritten from a generic diagnosis table into 3 real
mini-lessons each (situation, where to look, what the data can/can't
establish, plausible explanations, one change to test, what to compare
after), matching LinkedIn's own build from the start. The unsupported
"Instagram weights saves heavily" claim was corrected after live research:
Meta's Adam Mosseri has named watch time, likes-per-reach, and
sends-per-reach as the three primary signals, not saves; the module now
says that. **Not done**: the same Overview/Track-and-Improve depth pass on
the 5 retired tracks (correctly out of scope now) and a full research pass
on every remaining claim across Instagram/Facebook and TikTok; only the
claims explicitly flagged in the directive (Reels vs. carousel, TikTok
seller vs. affiliate, the saves-weighting correction) were independently
verified this pass.

**Calculator**: the "newer/smaller online store" 2% conversion-rate example
was re-checked against its original sourcing (aggregated 2026 industry
benchmarks citing Dynamic Yield/Statista/Shopify) and is labeled
accordingly as the closest available scope, explicitly not a claim about
stores under $1,000/month specifically, since no publisher breaks the data
out at that granularity. AOV/remaining linked-vs-override behavior and the
shared Google/Website-SEO `organic-search` scenario key were re-tested and
still work correctly after all of this pass's changes.

**Weekly Challenge packs, previously a flat all-at-once list, now real.**
`opportunity-service.mjs`'s `getOpportunityState()` gates the ranked
opportunity list to `week * 4` cumulative opportunities, where week is
computed from the attempt's actual `day` (1-7/8-14/15-21/22-30). A real bug
was found and fixed during testing: `recommendOpportunities()` has an
internal default `limit:8`, so weeks 3 and 4 would have silently stayed
capped at 8 regardless of the real weekly budget until the call site
explicitly passed the computed `unlockedCount` as `limit`. A second bug was
found and fixed: the function used to return every assignment ever created
for an attempt regardless of the current `activePlatforms` filter, so
switching focus track never actually narrowed what showed; the return set
is now filtered by the requested platforms too, while the underlying
per-assignment state (planned/posted, timestamps) is never deleted, so
switching back to a previous track still shows prior progress on it.
`channel-module.js`'s `buildTrackNav()` now persists the last-viewed track
to `localStorage` (`scrolly_focus_track_v1`), and `challenge.html` reads it
to scope opportunity requests to that track's platform. `opportunity-
catalog.mjs` gained a 4th platform adaptation (`linkedin`), reframing the
same underlying angle as a written post/document structure (opening line /
post structure / post copy) rather than a video script, since LinkedIn's
real deliverables (text posts, document posts, case-study structure) are
genuinely different from a video script; `challenge.html` shows the
different field labels accordingly. Verified end-to-end: opportunity counts
scale correctly week to week (4/8/12/16), platform filtering works, the
full plan/posted/record-result lifecycle still works, and persistence
survives reload.

**Achievement claim flow** (a real, previously-missing gap: `claim_available`
existed as a computed status with no way to actually submit a claim) is
unchanged from the prior pass and still verified working: claim submission,
founder-review "under review" state, verified reward accept/decline.

**Connections**: reconciled the earlier "OAuth out of scope for Friday"
decision against this pass's "prepare the connection work as far as
credentials allow" instruction by surfacing, not building, what already
existed: `connections-import-service.mjs`'s
`describeAuthorizedIntegrationRequirements()` (real, exact Shopify Admin
API and Google Analytics setup requirements) was built in an earlier pass
but never actually wired into any page. `connections.html` now fetches it
and shows a "What would it take to connect this for real?" expandable per
integration, with the three states (catalog import / authorized connection
/ manual entry) explained plainly at the top of the page so a catalog
import is never confused with verified revenue tracking. No OAuth code was
written; no credentials exist in this environment for any provider. See the
session's final report for the precise founder action list.

**Not built this pass** (see final report for the complete list): the
$1K Challenge Agent (advisory LLM endpoint, still not wired to any
Club-side route), 5 SEO Quick Wins (still "Coming soon," needs real content
authoring), shipping-address collection for accepted merch rewards, and any
real OAuth connector.

Full test suite: 441/443 (same 2 pre-existing, unrelated Discover-pipeline
fixture failures as every prior pass, untouched).

---

**⚠ Everything below this notice (from "Started 2026-09-11") predates the
production deploy and the 2026-09-15 launch sprint and is stale in several
real ways** (it says the site isn't live, `club-access-route.php` isn't
pasted live, etc. — all now false). Root `current-state.md` is *also* stale
for Club/Challenge work — it doesn't mention this product at all. **This
file's top section is the actual current source of truth; read it, not the
history below, before resuming Club/Challenge work.**

## LIVE STATE — most recent pass, this session's own clock says 2026-09-16 (bug-fix + Challenge-frontend pass, not deployed)

**Read this entry first regardless of the date label below** — it is the
most recent work in this file. The entry immediately below this one is
labeled "2026-09-18," two days later than this session's own system clock;
that label was set by the prior pass and is not corrected here to avoid
rewriting another entry's history, but chronologically this entry comes
after it.

Continuation pass responding to a Friday-launch-focused directive: fix real
interaction bugs, deepen content with research, and build the previously
100%-unbuilt Challenge customer experience. Full detail in the session's own
final report; summary here for future resumption.

**Real bugs found and fixed:**
- `club-shell.js`'s `MODULE_SEQUENCE` still listed the retired module2-6
  funnel — none of the 8 real `/club/channel/*` routes were in it, so
  cross-module Next/Back rendered **nothing at all** (not even Back) on
  every channel page. Rewritten to the real 9-item journey (`/club` + 8
  channels); the last module's "next" slot now reads "You've reached the
  end → All modules" instead of going blank.
- Calculator's `.calc-linked-note` was set once (on initial data fetch) and
  never updated again — a manually-overridden $77 value could keep
  claiming "linked from $40" indefinitely. `updateLinkedNote()` now
  recomputes on every render from live override state; also stopped
  calling the offer price an "average order value" (it's an assumption,
  not measured order data) and separated the AOV/remaining linked-state
  messages so either can be independently overridden/linked.
- Instagram/Facebook's 3-way scenario toggle re-wired `wireCalculator`
  against the same live DOM nodes on every switch without removing prior
  listeners — editing one scenario's field could silently corrupt a
  *different* scenario's saved value (confirmed: editing Facebook's AOV
  after visiting Instagram overwrote Instagram's stored value). Fixed by
  resetting the calculator root from a saved template before every
  re-mount.
- My Plan's "Your access link is missing or expired" rendered inside the
  token-gated status area while the static (never token-gated, by design)
  channel list rendered normally right below it — looked broken/
  contradictory. New shared `ClubShell.renderAccessExpired()` (branded
  panel + a real "Reconnect from My Account" link) replaces every page's
  own ad hoc version (My Plan, Performance, Content Studio). Root token-TTL
  cause also fixed: `DEFAULT_TTL_SECONDS` (and the not-yet-live WordPress
  mirror in `club-access-route.php`) bumped from 60min to 4h — a
  multi-module reading session could plausibly outlast an hour.
- Mobile had no persistent "All modules"/current-module indicator while
  scrolling (only the sticky desktop sidebar had this) — `.club-shell-
  utilitybar` is now `position:sticky` and shows the current module's name.

**Visual consistency (brand tokens, `brand/visual-system.md`):**
off-brand orange `.warn-box` and brown `.demo-missing` recolored to the
brand's blue/gold family; Instagram/Facebook's red/green weak-vs-strong
comparison cards recolored to neutral/teal (teal = success per the token
table); My Plan's "Open" badges are now solid blue/white real buttons
(was a low-contrast pale pill) with hover/focus-visible states. Removed
all 8 "You already listed X — direct match" personalization banners
(low editorial value per instruction) and reworded every `.evidence-gap`
block out of internal/CMS-sounding phrasing ("aren't loaded into this
module yet" → plain member-facing language).

**Calculator substance:** added a "Don't know your conversion rate? See
example rates" helper (injected once by `channel-module.js`, appears on
every calculator automatically) with 3 sourced planning examples —
checked specifically for a credible "stores under $1,000/month" benchmark
per instruction; none exists at that granularity from any publisher found,
so the closest genuinely-scoped alternative ("newer/smaller online store,"
~2%) is used with an honest scope label rather than inventing that cohort.
Source: aggregated 2026 industry benchmarks (Triple Whale/Qualimero/Propel
Commerce, citing Dynamic Yield/Statista/Shopify underlying data).

**Content research applied (not exhaustive across all 8 modules — see
final report for what's deep vs. what's still a Friday-blocker-free but
thinner pass):** removed the unsupported candle "competitors lose scent
after 2 weeks" claim, replaced with a demonstrable/documentable claim
structure; added sourced Reels-vs-carousel reach/engagement data
(Metricool 2026 study) to Instagram/Facebook; added a real TikTok
seller-vs-affiliate breakdown (was entirely missing) to TikTok/Shop.

**New: the $1K Challenge customer-facing page (`club/public/challenge.html`,
`/club/challenge`)** — the single biggest gap from the 2026-09-15 sprint's
"Not started yet" list, now built end-to-end against the already-existing,
already-tested backend (`challenge-service.mjs`, `opportunity-service.mjs`):
Day X/30 progress, the real ranked-opportunity grid (hook/execution notes/
caption/CTA per platform, plan → posted → record-result lifecycle, all
wired to real endpoints), and the full achievement lifecycle (claim
submission → "under review" → verified → reward accept/decline). Two new
service functions (`submitAchievementClaim`, `submitRewardChoice` in
`challenge-service.mjs`) plus two new bridge-server routes close a real
gap: `claim_available` status already existed in the status machine but
had no way for a customer to actually submit a claim. "$1K Stripe" is the
achievement/merch reward's *name*, not the payment processor — no payment
integration involved anywhere in this flow. Verified end-to-end locally via
3 hand-seeded fake challenge records (bypassing only the real-WooCommerce-
order entitlement check, which has its own separate passing test coverage)
covering active/claim/verify/reward states; the honest "not open yet" path
(real product 280 still unpublished) was also verified against the live
WC-REST API.

**Explicitly not built this pass (see final report for full blocker list):**
5 SEO Quick Wins (still "Coming soon" — needs real content authoring, not
wiring), the $1K Challenge Agent (advisory LLM endpoint — no live wiring
exists yet; deliberately not rushed given the safety/cost-ceiling
requirements around it), real OAuth for any provider (zero registered
apps/credentials exist anywhere in this environment for Shopify Admin,
Google, or any social platform — also an explicit non-goal in the prior
Friday-sprint decision), shipping-address collection for accepted merch
rewards (reward accept/decline works; physical fulfillment details are a
manual follow-up for now).

Full test suite: 441/443 (same 2 pre-existing, unrelated Discover-pipeline
fixture failures as every prior pass in this project — untouched).

## LIVE STATE — 2026-09-18: Club-wide teaching/navigation/calculator upgrade (not deployed)

Full coordinated pass across all 8 channel modules plus My Plan, responding to combined Instagram/Facebook + Pinterest feedback. Did not stop after Instagram/Facebook/Pinterest — all 8 channel pages were rebuilt.

- **Navigation**: customer-facing module numbers (`3`-`10`) removed from
  `modules.html`'s channel cards, replaced with short letter/symbol badges
  (`IG`, `TT`, `YT`, `G`, `P`, `SEO`, `✦`, `$`); channel-page `<h1>`s already
  had no numbering. The old numbered-section-stack layout inside every
  channel module was replaced with a shared destination-nav pattern (`Overview
  & Results` / `Set Up` / `How to Use It` / `Your $1K Numbers` / `Track &
  Improve`, adapted per page — Groups and Make It Easy to Buy have no
  calculator so their numbers section differs or is omitted). One panel
  visible at a time, hash-linkable, sticky nav, optional Back/Next. New in
  `channel-module.js`/`channel-module.css`: `initDestinations()`,
  `.dest-nav`/`.dest-panels`/`.dest-controls`. Mobile: nav switched from
  equal-width truncating tabs to a horizontally-scrollable strip of
  full-label pills (`@media(max-width:600px)` in `channel-module.css`) after
  the first version was found truncating "Overview & Results" to "Over...".
- **Demonstration component**: reusable `.demo-figure`/`.demo-media`/
  `.demo-callout`/`.demo-caption` (click-to-enlarge lightbox via
  `initDemonstrations()`/`openLightbox()`, keyboard-operable) and an honest
  `.demo-missing` block for teaching moments that need a real screenshot this
  environment can't produce. **No real platform screenshots exist anywhere
  in this project** (no logged-in Instagram/Facebook/TikTok/YouTube/Google/
  Pinterest access, no reference-asset library) — every genuine screenshot
  moment uses `.demo-missing` naming the exact asset needed instead of a
  fabricated or stock image. Because of this, the click-to-enlarge lightbox
  has no live instances yet (nothing to enlarge without a real `<img>`) —
  built and tested, ready for the first real screenshot. Illustrative
  diagrams (Pinterest's autocomplete pattern, Trends curve) are CSS/SVG,
  explicitly labeled "Diagram"/"illustrative," never presented as
  screenshots.
- **Traffic/conversion calculator v2** (replaces the old single-output
  tool): `computeChannelMath()` implements the exact two-column ALL-sales
  vs. PART-of-sales table and formulas from the rebuild spec (unrounded
  division until final `Math.ceil`). `wireCalculator(scenarioKey, root)`
  persists per-scenario state to `localStorage` (`scrolly_calc_<key>_v1`),
  distinguishes linked (auto-updating from real business data) vs.
  manually-overridden fields, and exposes "Use my current business data" to
  restore linked values. Linked from `/club/overview/state`'s `profile.price`
  (AOV) and recorded revenue (remaining goal toward $1,000) — `price` was
  added to that endpoint's profile projection in `member-growth-state.mjs`
  for this. **Google Search & Website SEO share one calculation** (both use
  `scenarioKey: 'organic-search'`) rather than double-counting organic
  traffic — verified live: editing the scenario on one page and loading the
  other shows identical persisted values. **Instagram/Facebook** get a
  3-way toggle (Instagram-only / Facebook-only / labeled Combined) reusing
  one calculator UI against three independent scenario keys.
  Groups & Communities and Make It Easy to Buy intentionally have no
  calculator (documented in-page via `.evidence-gap`/lede copy) since
  neither produces a modelable visit-to-order number.
- **Bug found and fixed during this pass**: the Instagram/Facebook
  scenario-toggle re-wired the calculator against the same live DOM nodes on
  every switch without removing prior listeners, so typing into one
  scenario's field could silently overwrite a *different* scenario's saved
  value (confirmed: editing Facebook's AOV after visiting Instagram
  corrupted Instagram's stored AOV). Fixed in `channel-instagram-facebook.html`
  by resetting the calculator root's `innerHTML` from a saved template
  before every re-mount, guaranteeing clean listeners; re-tested and
  confirmed isolated afterward. (An earlier, already-fixed version of a
  related bug — stale values persisting across a scenario switch — is
  documented in `channel-module.js`'s `wireCalculator` comments.)
- **Instagram & Facebook** (`channel-instagram-facebook.html`, full rebuild):
  a `.surface-grid` replacing prose definitions for 6 surfaces (feed/Reels/
  Stories/Highlights, FB Page post/Group) each stating what/where/purpose/
  next-step/measure; Instagram setup separates account-type switch, Shopping
  eligibility, and FB Page connection as three distinct, non-interchangeable
  actions; Facebook setup replaces Page/profile/Group definitions with a
  capability table; an unsupported "Reels always reach substantially more
  non-followers" claim was replaced with an honestly-qualified statement;
  "How to Use It" has 5 worked examples per business type across 2 contrasting
  business types (candle shop / local plumber) — carousel, Reel, Story, FB
  Page post, annotated profile — plus a weak-vs-strong before/after
  comparison; the old generic "section 6" was folded into Track & Improve
  with an explanatory rationale rather than kept as an unexplained template
  section.
- **Pinterest** (`channel-pinterest.html`, full rebuild): illustrated setup
  walkthroughs (not checkbox-only), an autocomplete diagram and Trends-curve
  diagram both explicitly labeled illustrative, a `.pin-anatomy-visual` with
  numbered callouts discussing the Pin-promise-vs-destination match, case
  studies with metric *types* explicitly distinguished (impressions vs.
  outbound clicks vs. sales — no single case study treated as an average), a
  4-tier metric ladder (Discovery/Interest/Traffic/Business result), and an
  adaptive closing action (`updateFirstAction()`) that checks the member's
  actual saved setup-checklist state and swaps the absolute "nothing else
  matters until setup is finished" copy for a next-step appropriate to
  members who've already finished setup. The unreadable dark closing-card
  heading is fixed (see CSS note below).
- **TikTok, YouTube, Google, Website SEO, Groups, Make It Easy to Buy**: all
  converted to the same destination-based structure with appropriate
  calculator wiring (or none, where inappropriate); `.demo-missing` flags
  added for their real platform-UI teaching moments (see missing-asset list
  below).
- **CSS cascade-tie bug fixed** (`channel-module.css`): the real
  scrollyseo.com `theme.css` (loaded via `club-shell.js`) was unreliably
  winning the color tie against `.first-action h2`/`p`, making every
  module's closing-card heading unreadable (the user-reported "unreadable
  heading on the dark closing card"). Fixed the same way as an earlier,
  identical issue this project hit in `club-shell.css`:
  `body.club-shell-page .first-action h2{color:#fff!important}` (higher
  specificity, not `!important` alone — an `!important`-only attempt was
  previously shown not to reliably win in this environment).

**Verified locally** (not deployed, using a disposable seeded test member,
deleted after use): all 8 channel routes load with no new console errors;
destination nav switches correctly on every page; the shared
Google/Website-SEO `organic-search` calculator scenario persists identical
values across both pages; the Instagram/Facebook scenario toggle correctly
isolates state after the listener-stacking fix; the "Use my current business
data" reset restores linked AOV/remaining and clears override flags;
Pinterest's adaptive closing action correctly switches copy once its setup
checklist is complete; mobile (375px) has no horizontal overflow anywhere
and the destination nav no longer truncates labels; full test suite still
441/443 (same 2 pre-existing, unrelated Discover-pipeline failures as every
prior pass — not touched).

**Missing screenshot assets** (each already flagged in-page via
`.demo-missing`, listed here per the rebuild spec's explicit reporting
requirement — no logged-in platform access or reference-asset library exists
in this project to source them from):
Instagram Settings → account-type screen · Facebook Page setup screen +
Shop-tab eligibility panel · TikTok Settings → Business Account screen ·
TikTok Seller Center eligibility/onboarding screen · YouTube Studio channel
customization + Shopping-tab screen · Google Business Profile Manager
verification/category screen · Google Search Console verification +
Coverage report · Pinterest "Convert to business account" screen · Pinterest
catalog/Rich Pins validator screen · real Pinterest Trends interest-over-time
graph · a real Pinterest Pin-builder screenshot · Pinterest Analytics
overview dashboard.

**Not done in this pass**: no new sourced case studies were added for any
channel besides Pinterest's pre-existing two — every other channel still
correctly says "evidence not yet loaded" rather than fabricate one; the
cross-module "planned share exceeds 100%" registry (`totalPlannedShare()`)
exists in `channel-module.js` but nothing yet surfaces it as a combined
channel-mix view anywhere in the UI; per-field alt-text/contrast audit was
spot-checked, not exhaustively run through an automated accessibility
checker.

## LIVE STATE — 2026-09-17: full ten-module rebuild (customer journey replaced, not deployed)

The old 7-module strategy funnel (Offer/Discovery/Channel-Plan/Messaging/
Sales-Path, Modules 2-6) is **retired from the customer-facing journey**.
The real product is now the ten-module structure from the inspection
report, fully built and locally verified:

1. **Your Business & Connections** + 2. **Your $1K Starting Point** — one
   page, `club/public/index.html` (was "Module 1", now does double duty).
   Onboarding gained `businessName`/`websiteUrl` fields (new schema fields
   in `business-profile-schema.mjs`, with a load-time backfill in
   `business-profile-store.mjs` so any pre-existing profile missing them
   still loads and re-saves cleanly); lost the required `timeAvailable
   HoursPerWeek`/`currentRevenueUsd` questions the rebuild spec explicitly
   forbade. Submitting shows a "Module 1 complete" recap (business name +
   a simple connected/not-connected line, fetched from `/club/overview/
   state`) directly above the existing $1K Math results, now labeled
   "Module 2."
3-10. **Eight channel modules**, `club/public/channel-*.html`, served at
   `/club/channel/<name>` (route map in `bridge-server.mjs`): Instagram &
   Facebook, TikTok & TikTok Shop, YouTube & Shorts, Google Search & GBP,
   Pinterest (built 2026-09-16, refactored here to use the shared files
   below), Website SEO & AI Discovery, Groups & Communities, Make It Easy
   to Buy. **Freely accessible, not gated behind each other or Modules
   1-2** — matches the inspection report's Founder Decision #3. Each is
   real, distinct content (not a templated repeat) — see the actual files
   for the per-channel depth; none invents a statistic it can't source
   (channels other than Pinterest honestly say "evidence not yet loaded"
   rather than fabricate a case study).
   - Shared infrastructure: `channel-module.css` + `channel-module.js`
     (checklist persistence via localStorage, the personalization fetch,
     and the single-vs-mixed-channel traffic calculator) — one place to
     edit, not nine. Traffic tool appears only on genuine acquisition
     channels (Instagram/FB, TikTok, YouTube, Google, Pinterest); Website
     SEO deliberately has none (it feeds Google's bucket, not its own,
     per the rebuild spec's traffic-math rules) and neither does Make It
     Easy to Buy (a conversion module, not an acquisition one).
   - Make It Easy to Buy does a light bonus-reuse of the OLD Module 6
     (`/club/module6/results`) sales-path diagnosis if a member happens to
     have it (most won't, since that chain is no longer part of
     onboarding) — graceful no-op otherwise, confirmed via manual test.

**My Plan** (`modules.html`) is rebuilt around this real structure — no
more server-driven 7-item list. **Connections'** Shopify-import result no
longer headlines product counts/price ranges (a real, confirmed conflict
from the inspection report, now fixed). `club-shell.js`'s `MODULE_PATHS`
updated so the sidebar highlights "My Plan" correctly on every new route;
old `/club/module2-6` routes still resolve (existing customer data/tests
untouched) but are no longer linked from anywhere.

**Verified locally** (not deployed): full onboarding flow end-to-end with
the new fields, all 8 channel routes return 200, no console errors, no
mobile overflow, full test suite 441/443 passing (2 pre-existing
unrelated Discover-pipeline failures, untouched) including 2 new
regression tests for the schema change (field capture + backward
compatibility).

**Still open from the inspection report, not done in this pass**: the
`$1K Math` traffic-column comparison (single vs. mixed) lives only inside
each channel module right now, not yet in the shared `thousand-k-math.mjs`
itself; old Module 2-6 generator engines (offer-positioning, customer-
language hypotheses, messaging) were left in place as unlinked pages
rather than extracted into reusable library calls anywhere new; the
`club-access-route.php` live/not-live documentation discrepancy flagged in
the inspection report (§G) is still unresolved.

## LIVE STATE — 2026-09-16 update: first channel module built

A rebuild-inspection report (`CLUB_REBUILD_INSPECTION_2026-09-16.md`, this
directory) found the existing 7 "modules" are a strategy/positioning funnel,
not the channel-education curriculum the product is moving toward, and
recommended Pinterest as the first channel module to build (real, sourced
evidence already existed for it). That module is now built:
`club/public/channel-pinterest.html`, served at `/club/channel/pinterest`
(route added in `bridge-server.mjs`), linked from a new "Channels" section
on My Plan (`modules.html`) — **freely accessible, not gated behind
Modules 1-7**, per the inspection report's Founder Decision #3. Uses real
`/club/overview/state` data for personalization (no fake connector, no
invented business data); self-check/checklist state is plain
`localStorage` (a personal scratchpad, not a saved business record — no
new backend/schema/test needed for it). Evidence content (category-fit
stats, two attributed real case studies, honest CAN/CANNOT framing) is
reused from the already-published Pinterest workbook sales page
(scrollyseo.com), not fabricated. The $1K traffic-column calculator
(single-channel vs. mixed-channel) is new, client-side, and does not yet
exist in the shared `thousand-k-math.mjs` — still a to-do for that file
per the inspection report's §B rebuild matrix. Not yet deployed to
production.

## LIVE STATE — 2026-09-15 Friday-launch sprint (in progress)

**Production:** `club.scrollyseo.com` is live on the DigitalOcean Droplet
(Docker + Caddy) — real WooCommerce → account → signed-token → Club access
flow already passed end-to-end. See `DEPLOY_CLUB_DROPLET.md`'s Prerequisites
for SSH access. **Last deployed image is from *before* this sprint's Batch
1-2 changes below** — none of this sprint's work is live yet.

**This sprint's contract** (full text was a one-off chat directive, not
saved verbatim anywhere — the summary here is canonical going forward):
ship a genuinely sellable $50 Club + $25 Challenge by Friday. Explicit
non-goals: $10K/$24K anything, autonomous social posting, full autonomous
trend research, real OAuth connector suite, automated POD fulfillment,
further dashboard redesign.

**Batch 1 — Club launch cleanup (DONE, tested):**
- Quick Actions removed entirely (was a 3rd nav system alongside the WP
  header + Club sidebar). `club-shell.js`'s `buildUtilityBar()` now only
  holds the mobile sidebar-drawer toggle.
- My Plan/module pages: `club-shell.js`'s `buildPrevNext()` is now called
  twice (top of content + bottom) with a `My Plan` index link added in the
  middle — no more scrolling to navigate between modules.
- Footer spacing: `club-shell.css`'s `.club-shell-content` bottom padding
  raised to 56px (one shared rule, not per-page).
- Sidebar label `Growth Review` → `Performance` (`club-shell.js` NAV_ITEMS
  + `overview.html`'s own hardcoded sidebar) — the page has always been
  Your Numbers + Growth Review tabs; the nav item should name the page.
- Module 1 onboarding (`club/public/index.html`): business-type dropdown
  relabeled to the 6 requested categories (mapped onto the *existing*
  `BUSINESS_MODEL_ROUTES` enum, unchanged — see the option `value`s vs
  labels in the file, e.g. `local_hybrid` is now labeled "Appointments /
  bookings"); the old comma-separated "where do people buy/hire you" and
  "where do people discover you" text inputs replaced with real multi-select
  checkbox groups (`business-profile-schema.mjs`'s `sellingSurfaces`/
  `discoveryChannels` were *already* arrays — no schema change); the
  "what share of interested people actually buy" conversion question
  removed outright (module1.mjs already treats it as optional/unknown-safe).
- Connections (`club/public/connections.html`) rebuilt: Store/Revenue +
  Website Analytics merged into one "Your Store & Website" card (still two
  separate technical integrations underneath, per
  `public-store-import.mjs`), Pinterest + LinkedIn added, intro copy no
  longer implies automatic measurement, real Shopify catalog import kept.
- Test fixes: `test/club-foundation.test.mjs`'s nav-shape assertions
  updated to match (Content Studio no longer in NAV_ITEMS — was already
  true from an earlier pass, this test just hadn't been updated for it).

**Batch 2 — paid Challenge entitlement (DONE, tested):**
- `club/lib/club-order-verify.mjs` gained `findAvailableChallengeOrder()`
  — the read-only WC-REST equivalent of `wc_customer_bought_product()`,
  attempt-aware (won't reuse an order a past attempt already consumed).
  Same `WC_AUDIT_CONSUMER_KEY/SECRET` credential as everything else here,
  no new credential, no new WordPress deploy.
- `club/lib/challenge-service.mjs`'s `startChallengeAttempt()` now calls
  it and refuses with `no_valid_challenge_purchase` if there's no real,
  unused product-**280** order for that customer — Club membership alone
  is no longer sufficient (this was the real, confirmed gap: previously
  `startChallenge(auth.slug, {})` discarded the `wcOrderId`/`wcOrderKey`
  params `club-state.mjs` already accepted). `getChallengeState()` (read
  path) deliberately still only requires Club membership — viewing history
  shouldn't cost a live WC round trip.
- New tests in `test/club-challenge.test.mjs`: non-purchaser rejected,
  one purchase funds exactly one attempt, a genuine second purchase funds
  a genuine second attempt. Every pre-existing test in that file now runs
  against a mocked "5 valid orders" fetch so none of them needed rewriting.
- **Product 280 is still genuinely unpublished** (confirmed live via the
  public Store API: 404). The Club-only Dashboard CTA ("Join the $1K
  Challenge") deliberately still shows its honest "Not open yet — check
  back soon" response rather than linking to a checkout that would 404.
  **Ready-to-activate destination once published: `https://scrollyseo.com/
  cart/?add-to-cart=280`** (WooCommerce's universal add-to-cart query
  pattern — works without knowing the product's eventual slug). Swapping
  the CTA's click handler to this URL is a one-line change in
  `overview.html`'s `wireChallengeNotOpenCta`/`renderChallengeHeroDefault`.

**Not started yet (Batches 3-5 of this sprint):** the customer-facing
Challenge experience page (Day X/30, weekly opportunities, 5 SEO Quick
Wins, Agent access, Growth Review/Game Plan — backend lifecycle exists,
frontend doesn't), the data-driven Weekly Pack model (current
`opportunity-catalog.mjs` is a static 48-item array, default `limit=8` —
contract is up to 100 across 4 attempt-relative weekly unlocks), 5 SEO
Quick Wins V1 (currently a hardcoded "Coming soon" card), the $1K Challenge
Agent V1 (package.json already has `@anthropic-ai/claude-agent-sdk`;
`ANTHROPIC_API_KEY` already configured locally — not yet wired to any
Club-side endpoint), the Challenge sales/rules/refund page. **Resume here
in the next session** rather than rediscovering this state.

---

Started 2026-09-11. Canonical product spec: the build directive recorded in
`current-state.md`'s 2026-09-11 entry (not duplicated here) and summarized
durably in `methodology/product-ladder.md`. This is a new, separate product
line alongside the existing SEO products (Discover/$299 Audit, Shopify/
Pinterest Workbooks, SEO Implementation Agent) — nothing here touches them.

Real customer data under `club/members/` is gitignored (added to
`automation/.gitignore`) — never commit it.

## Built (this session)

- `lib/business-profile-schema.mjs` — the Business Model Router's data
  contract (6 routes, onboarding stage A/B/C, only-what's-known fields).
  Reusable by $10K/$24K onboarding later without a rewrite.
- `lib/business-model-router.mjs` — per-route funnel shape / relevant
  metrics / default channel pair (one primary + one secondary + one
  compounding asset). Table-driven, not a rules engine.
- `lib/thousand-k-math.mjs` — the $1K Math tool. price -> required sales ->
  backward funnel. Uses the customer's own conversion data when supplied;
  otherwise uses labeled, wide planning-range assumptions (Conservative/
  Base/Upside, matching the Discover product's existing scenario-framing
  convention) — never a fabricated single number presented as fact.
- `lib/club-state.mjs` — per-member file-backed state
  (`club/members/<slug>/state.json` + `events.ndjson`), same convention as
  `automation/lib/order-state.mjs`. Club / Challenge / Achievement are
  independent fields: a member can decline the physical reward and keep
  verified achievement status + unlocked merch; a new Challenge attempt
  never requires repurchasing the Club.
- `scripts/create-club-products.mjs` — idempotent one-off script, already
  run. Created two **draft, catalog-hidden** WooCommerce products via the
  existing `WP_LIVE_APP_USER`/`WP_LIVE_APP_PASSWORD` credential (no new
  credential needed — WooCommerce's REST API accepts WP Application
  Password auth for a `manage_woocommerce` user):
  - **$1K Club** — WooCommerce product ID **279** — $50, draft, hidden.
  - **$1K Challenge** — WooCommerce product ID **280** — $25, draft, hidden.
  Neither is visible or purchasable on the live site. Both have placeholder
  descriptions (explicitly marked "replace before publishing" in the
  product content itself) — publishing and real sales copy are a founder
  decision per the standing stop conditions, not something automated here.

## Vertical slice 2 (2026-09-11, same day): onboarding -> Router -> Math -> Mini Evaluation -> results

Decision taken: native Scrolly onboarding, not Tally — inspection found no
technical blocker (WooCommerce REST already gives everything needed: order
verification via the existing read-only `WC_AUDIT_CONSUMER_KEY/SECRET`,
same pattern as the $299 product's payment gate). Eligibility is the same
order_id+order_key pattern already proven for that product — no new auth
system was built.

**Built:**
- `lib/club-order-verify.mjs` — verifies a WC order_id/order_key against a
  required product ID (real network code; unit-tested with a stubbed fetch).
- `lib/business-profile-store.mjs` — load/save `profile.json` per member.
- `lib/mini-evaluation.mjs` — the Mini Organic Presence Evaluation. 8
  canonical dimensions, labels only (`growth_opportunity` / `on_track` /
  `growth_strength` / `insufficient_data`), no numeric scores. A dimension
  only gets a growth_opportunity/growth_strength verdict when the profile
  actually has a supporting signal; otherwise it's `insufficient_data`
  (never a penalty for data Scrolly never asked for). `business-model-router.mjs`
  gained two small additive fields (`closingMetricKey`, `searchIsFoundational`)
  to support this and $1K Math's real-data mapping — no existing behavior
  changed.
- `lib/onboarding-service.mjs` — the vertical-slice orchestrator:
  `submitOnboarding()` (verify order -> validate answers -> persist profile
  -> compute results) and `getResultsForSlug()` (idempotent re-fetch,
  results are always derived fresh, never cached stale).
- `public/index.html` + 3 new `bridge-server.mjs` routes (`GET /club`,
  `POST /club/onboarding`, `GET /club/results`) — a real, if unstyled,
  customer-facing page. Extends `bridge-server.mjs` rather than starting a
  second server.
- `scripts/create-test-club-order.mjs` — QA-only, creates one real (no real
  payment) WooCommerce order for product 279 via the admin REST API, since
  279 must stay draft/unpurchasable and can't be bought through checkout.
- 15 tests in `test/club-onboarding.test.mjs`, including one regression test
  (`etsy` as a channel wrongly read as "no search presence" for a
  marketplace-first business — found via live QA, fixed, tested).

**Live-QA'd end to end** (see current-state.md's entry for the walkthrough)
answering all 5 required questions (business type, $1K Math, biggest
opportunity, what's already working, what to do first). WC products 279/280
confirmed still `draft`/`hidden` after this slice.

## Fast-follow (2026-09-11, same day): WooCommerce-account gating replaces order_id+order_key

The temporary order-code gate from slice 2 is gone. Identity is now the
customer's stable **WooCommerce/WordPress user id** (`customer-<id>`), not
an order or email — required so Club ownership, Challenge attempts,
progress, achievements, merch, and future $10K/$24K entitlements all attach
to the same durable record no matter how many separate orders a customer
places over time.

**How it works (stateless, no session store, no cookies):**
1. WordPress (a new, **not-yet-live** WPCode snippet,
   `automation/wordpress/deployed/club-access-route.php`) adds a "Go to $1K
   Club" button to My Account, shown only when
   `is_user_logged_in() && wc_customer_bought_product(..., WC_CLUB_PRODUCT_ID)`
   — WooCommerce's own real ownership check, not a parallel auth system.
2. The button's link carries a short-lived (60 min) HMAC-SHA256-signed token
   proving `{customerId, email}` — minted in PHP, verified in Node
   (`club/lib/club-access-token.mjs`), same byte-for-byte format on both
   sides.
3. The browser stores the token in `sessionStorage` (tab-scoped, never
   `localStorage`) and sends it as `Authorization: Bearer <token>` on every
   `/club/*` call. `/club/results` and `/club/onboarding` both derive the
   customer's slug **only** from the verified token — a client-supplied
   slug/order id is never trusted (closes an IDOR hole the old design would
   have had if it were ever extended carelessly).
4. Revisiting later just means clicking "Go to $1K Club" again — WordPress
   mints a fresh token every time. No order numbers, ever.

**Action needed from you before this is live-testable end to end:** paste
`club-access-route.php` into a new WPCode snippet ("Run Everywhere"), and
replace its `SCROLLY_CLUB_ACCESS_SECRET` placeholder with the real value of
this machine's `automation/.env` `CLUB_ACCESS_TOKEN_SECRET` line (copy it
yourself — it was deliberately not written into this repo file, and is
never printed in chat/status reports). Until then, test with
`node automation/club/scripts/mint-test-access-token.mjs` (see "Customer
testing path" below) — it mints tokens the exact same way the live snippet
will, using the same secret from `.env`.

**Preserved, not deleted:** `club-order-verify.mjs` (the old order_id/
order_key check) is untouched and still exported — WordPress now does
ownership verification before minting a token, so the bridge server no
longer calls it on the normal path, but it's kept for a future need to
verify a *specific* order (e.g. confirming which order just paid for a new
Challenge attempt).

**Customer testing path (until the WordPress snippet is pasted live):**
```
cd automation
node club/scripts/mint-test-access-token.mjs
```
This prints a `http://localhost:5679/club?token=...` URL good for 60
minutes. Open it in a browser (bridge server must be running:
`node bridge-server.mjs`) — it goes straight to onboarding (first visit) or
straight to results (return visit), exactly like a real customer clicking
"Go to $1K Club" from My Account will. Run the script again any time the
token expires or to simulate a different test customer (pass a customer id
and email as arguments). Never share a minted token/URL outside this
machine.

**Real customer testing path (once the WordPress snippet is pasted live):**
log into a WooCommerce account on scrollyseo.com that owns WC product 279,
go to My Account, click "Go to $1K Club".

## Module 1 — Your $1K Starting Point (2026-09-11, same day)

Turned the functional prototype into the actual first paid-product module,
against a detailed customer-facing content/UX spec. Reused the Router,
$1K Math, profile store, Mini Evaluation, and token identity exactly as
built — no auth/foundation changes.

**New:** `lib/module1.mjs` — the customer-facing interpretation layer
(Starting State, Data Confidence, First Priority, the "What the Math Tells
Us" paragraph). Pure function of a BusinessProfile; no new state is
persisted separately — it's re-derived fresh every time from the same
profile the Router/Math/Evaluation already use, so it can never drift.
`onboarding-service.mjs`'s `computeResults` now just re-exports this.

**Real bug found and fixed in `mini-evaluation.mjs`:** a customer's own
supplied conversion rate was being compared against `$1K Math`'s own
computed benchmark — which, once a rate is supplied, becomes that same rate
reflected back. So ANY real rate, including a genuine 0%, satisfied "meets
or beats the benchmark" and was misclassified `growth_strength`. Fixed by
comparing against a new independent reference
(`thousand-k-math.mjs`'s exported `CLOSING_STEP_DEFAULT_RANGE`) instead of
the self-referential one. Covered by a named regression test.

**Model change:** every dimension in `mini-evaluation.mjs` now carries a
`kind`: `'existence'` (exists / not_established — Offer, Customer,
Discovery channel, Follow-up) or `'performance'` (insufficient_data /
growth_opportunity / on_track / growth_strength — Conversion, Trust).
Existence is never treated as proof of performance. The old Search/Content
dimensions and the route-based `searchIsFoundational` auto-priority were
removed — Module 1's "First Priority" is now a pure evidence-driven decision
tree (`module1.mjs`'s `determineFirstPriority`) that never assumes Search/
SEO/website just because of the business model.

**Front end** (`public/index.html`): full rewrite of the results view to
the spec's structure (Starting State card → prominent $1K Math + resulting
revenue + Data Confidence → "What the Math Tells Us" → "What We Know So
Far" with ✓/?/○ icons → "Your First Priority" → "Do this next"). No
internal terms (stage letters, raw metric keys, "benchmark (0)") in any
customer-facing string — verified by a test that greps the generated copy
for them.

22 new/updated focused tests in `test/club-onboarding.test.mjs` (32 total in
the file), covering every case listed in the spec's test section: no
conversion data never yields growth_strength, a real 0% is not treated as
meeting a 0 benchmark, offer existence isn't performance, sales-count
rounds up, low-price/high-count is flagged without prescribing a price
change, ecommerce/marketplace paths never get Search/website language by
default, and missing performance data lands on "Establishing a baseline" +
"Generate qualified buying activity."

**Live-QA'd** end to end via locally-minted test tokens (no live purchase
needed) across three scenarios: no-data ("Ready to Sell"), a strong real
conversion rate, and the exact 0%-conversion edge case the spec called out
by name — all rendered correctly, screenshotted.

## Module 1 completion pass (2026-09-11, same day)

Turned the diagnostic-shaped prototype into the actual completed module,
against a live customer bug report. Auth/access untouched (frozen per
explicit instruction).

**Two real bugs found and fixed, both via live QA on real customer data:**
1. `thousand-k-math.mjs`'s Conservative/Upside scenario labels were
   assigned to the wrong rate picks -- a *better*-converting (upside)
   scenario required *more* upstream reach than a *worse*-converting
   (conservative) one. Root cause was backwards on both sides of the
   assignment; fixed (`conservative` now uses the low/worse rate pick,
   `upside` the high/better one). Regression test asserts
   conservative > base > upside for a fixed sales target.
2. Once a customer supplies a real 0% closing rate, `null / rate` in
   `volumesFor()` coerced to `0` in JS arithmetic, silently showing "0
   people needed" upstream of a step that is actually mathematically
   undefined (a real 0% rate implies infinite volume, not zero). Fixed by
   propagating `null` once it appears rather than letting it get divided
   again. Caught live: a $9.99/0%-conversion test profile showed "0" reach
   before the fix, "—" (correctly "can't be computed") after.

**New in `module1.mjs`:** `determineNextClubStep()` (always points to
Module 2, with a priority-specific bridge sentence -- the STRATEGIC
priority and the NEXT CURRICULUM STEP are no longer the same field, so a
"generate buying activity" diagnosis no longer jumps the customer straight
to a channel-selection CTA that doesn't exist as Module 1 output);
`buildStartingPointPlan()` (the consolidated "Your $1K Starting Point Plan"
artifact -- purely derived from already-computed fields, nothing new
persisted); `baselineMetricsFor()` (route-adapted "what to start measuring"
list, reusing `routeConfig.funnelStages` rather than a separate hardcoded
list per route).

**Front end:** assumption rates now shown per funnel step (conservative/
base/upside %, or "your own reported rate") under the scenario table;
"Your First Priority" section no longer ends in a tactical "do this next"
that belongs to a later module; new "Your $1K Starting Point Plan" card;
"Module 1 of 7" added to the header eyebrow. No visual redesign --
same card/table/badge patterns as before, per the explicit boundary that a
canonical visual system is coming separately.

9 new/updated tests (40 total in the file), covering every case in the
spec's test list: exact $9.99→101→$1,008.99, better-scenario-needs-less-
volume, a generic sweep that no performance dimension goes positive without
evidence, route-adapted baseline metrics for both ecommerce and services,
Module 1 always pointing to Module 2, the Starting Point Plan's structured
content, and a pre-existing customer's reload still working.

`npm test` (whole suite): 121/123 pass. The 2 failures are the
already-documented, pre-existing `mulberry-creek-2` fixture status drift in
`order-aggregator.test.mjs`/`discover-customer-status.test.mjs`, unrelated
to and not caused by this work -- left untouched per instruction.

**No real blocker for Module 1.** Left for the future visual-system pass:
the Starting Point Plan card, assumption-rate list, and Module 2 CTA are
functional but plain (same ad-hoc CSS as the rest of the page) -- expected
to be restyled wholesale once the canonical Scrolly visual system lands,
not touched further here.

## Module 2 — Build Something People Want to Buy (2026-09-11, same day)

The Offer Builder. Reuses Module 1's math/route-config/Trust-dimension
directly rather than re-deriving them; Module 1's own files
(`module1.mjs`, `mini-evaluation.mjs`, `onboarding-service.mjs`,
`club/public/index.html`) were **not modified** except one necessary
integration change: the "Continue to Module 2" text in Module 1's results
is now a real link (`<a href="/club/module2">`) now that the page exists.

**New files:**
- `lib/offer-plan-schema.mjs` / `lib/offer-plan-store.mjs` — the persisted
  OfferPlan (`club/members/<slug>/offer-plan.json`), same one-file-per-
  concern convention as the BusinessProfile. Only deliberate customer
  decisions live here (confirmed/refined offer facts, stated beliefs,
  objections with observed/hypothesis basis, proof inventory, selected
  positioning) -- no judgments are stored.
- `lib/offer-positioning.mjs` — 3 distinct, route-adapted one-sentence
  positioning options; never invents a differentiator (uses an honest
  placeholder phrase when none is stated).
- `lib/offer-evaluation.mjs` — the 6-dimension offer evaluation (Offer
  Clarity, Buyer Fit, Reason to Choose, Price/$1K Economics, Proof/Trust,
  Buying Friction) plus Fix First/Keep/Learn and the Offer Experiment.
  Extends Module 1's existence-vs-performance discipline with one more
  honest state this domain needed: `working_hypothesis` (a customer's
  stated belief, real information but not validated evidence -- distinct
  from both `insufficient_data`, meaning no answer at all, and the
  performance labels, which require real evidence).
- `lib/module2.mjs` — the pure orchestrator (`computeModule2Results`),
  mirroring `module1.mjs`'s shape and never-cache-always-derive principle.
- `lib/module2-service.mjs` — auth/persistence orchestration, kept separate
  from `onboarding-service.mjs` (Module 1 territory, frozen this slice).
- `public/module2.html` — the guided form (prepopulated from Module 1,
  confirm-or-refine, never forced re-entry) through positioning selection
  to the final "Your $1K Offer" artifact and the Module 3 transition.
- 3 new bridge routes: `GET /club/module2` (page), `GET /club/module2/context`
  + `GET /club/module2/results`, `POST /club/module2/positioning` +
  `POST /club/module2/submit`.

**Product-philosophy guardrails actually enforced in code, not just docs:**
never auto-recommends a price change (Price/$1K Economics always reports
`on_track`, regardless of transaction count); a stated differentiator is
`working_hypothesis`, never invented when absent (`status: 'unknown'` ->
`insufficient_data`, feeding Learn); proof existing does not imply Trust
performance (Proof/Trust reports existence and Module 1's own real
Trust-performance state separately -- existence alone never upgrades it);
observed vs. hypothesized objections produce different Buying Friction
verdicts; Keep defaults to "keep the price" absent real contrary evidence.

19 new tests (`test/club-module2.test.mjs`), covering every case in the
spec's list, run together with Module 1's 40 (59 total, all pass). Full
suite: 141/143 (the 2 failures are the same pre-existing, unrelated
`mulberry-creek-2` fixture drift, untouched).

**Live-verified against the real, WooCommerce-account-linked test order**
(customer id 1, the `scrollysocial` account, real order #281 from the
account-gating fast-follow) and that account's own real Module 1 data
(a real "soaps" ecommerce profile she entered herself) -- not a synthetic
throwaway customer. One real copy bug found and fixed this way: the
Price/$1K Economics rationale was missing a `$` before the price. Full
click-through verified: prepopulation -> confirm/refine -> positioning
generation -> selection -> Your $1K Offer artifact -> Module 3 CTA ->
reload later shows the saved result directly, matching Module 1's pattern.

Note: full re-verification via an actual browser login (rather than a
token minted for that same real account id) needs Mercedes to click
through herself, since this session has no way to enter her real
WordPress password -- the identity and all data exercised were hers, only
the "click Go to $1K Club" step itself was substituted.

## Module 2 output-quality correction pass (2026-09-12)

Two real bugs found via Mercedes's own real-browser QA, fixed without
touching Module 2's architecture/scope:

1. **Positioning generator grammar bug.** Every differentiator slot sat
   inside a grammatically rigid connector ("designed to {diff}", "featuring
   {diff}"), which assumes the customer's free-text answer is a bare
   infinitive/noun object. A real customer's "Made with all-natural,
   locally sourced ingredients" produced "designed to Made with...".
   Fixed generator-wide in `offer-positioning.mjs`: every differentiator is
   now appended as an independent, comma-joined trailing clause (never the
   object of a specific verb/preposition), which reads naturally regardless
   of whether the customer typed a noun phrase, adjective phrase, verb
   phrase, full sentence, feature, method, or benefit. A `normalizeClause()`
   helper drops a trailing sentence-stop and lowercases the first letter so
   any fragment composes into a larger sentence; applied consistently to
   `whatTheyGet`/`buyingMotivation` too once the same class of bug turned up
   there in live verification (raw capitalized text stranded mid-sentence).
   A narrow, explicit `PHRASING_FIXES` list also normalizes "healthy
   conscious" -> "health-conscious" (not a general grammar engine — one
   documented, safe, common-case fix). 12 regression tests across every
   differentiator grammatical form named in the request, plus the exact
   real-world case.
2. **Fix First was defaulting to a generic clarity line too eagerly.**
   `determineFixFirst()` only checked 2 specific growth_opportunity
   branches before falling through to one hardcoded "tighten the
   description" string — which fired for nearly every real profile, since
   most early offers sit at "stated but unvalidated" everywhere, never
   escalating to a real observed problem. Rewritten as a full, ordered,
   still-deterministic scan across all 6 dimensions (no LLM): foundational
   gaps first, then any real evidenced problem, then unused proof sitting
   idle, then a stated-but-unvalidated differentiator, then buyer fit
   (deliberately not defaulted to), then offer clarity, then the generic
   catch-all only as a true last resort. Fix First and Learn stay
   distinct even when they touch related dimensions (verified by test).

34 Module 2 tests (73 across both club files), all pass. Full suite:
156/158 (same 2 pre-existing, unrelated `mulberry-creek-2` fixture-drift
failures). Live-verified against the real account's exact original wording
— both the corrected positioning and the corrected Fix First now read
naturally and specifically.

## Module 3 — Find the People Most Likely to Buy It (2026-09-12)

The Customer Discovery Map. Module 1 and Module 2 are both frozen and
untouched by this slice except one necessary integration change (mirroring
the Module 1 -> 2 precedent): Module 2's "Continue to Module 3" text in
`public/module2.html` is now a real link (`<a href="/club/module3">`) now
that the page exists.

**New files:**
- `lib/discovery-plan-schema.mjs` / `lib/discovery-plan-store.mjs` — the
  persisted DiscoveryMap decisions (`club/members/<slug>/discovery-plan.json`),
  same one-file-per-concern convention as the BusinessProfile/OfferPlan. Only
  deliberate customer decisions live here (confirmed buyer facts, selected
  trigger/criteria/discovery-environment/evidence-source categories,
  generated-then-selected customer-language hypotheses) -- no judgments are
  stored. Objections reuse Module 2's exact `OBJECTION_BASES` enum rather
  than inventing a parallel one; Module 2's `offer-plan.json` is never
  written to by this module -- objections are carried forward into Module
  3's own copy for confirm/refine.
- `lib/discovery-content.mjs` — the reference data (trigger categories,
  buying-criteria categories, discovery environments, evidence sources) plus
  route-adapted language/suggested-relevance per the spec's explicit
  instruction not to force all businesses into the same customer-discovery
  language (a service business gets "decision-maker" + a business-problem
  prompt; a marketplace-first business gets an occasion/use-case prompt;
  etc.). Suggested categories only affect ordering/highlighting -- the full
  category lists always remain selectable regardless of route.
- `lib/customer-language-hypotheses.mjs` — generates search-style
  phrases/questions from the customer's own confirmed offer/audience/result
  data. Never fabricates search volumes or "validated keyword" claims --
  everything it returns is surfaced to the customer as a hypothesis.
- `lib/discovery-evaluation.mjs` — confidence classification
  (Evidence-Backed / Partially Validated / Working Hypothesis, never a
  numeric score) driven by how many independent, REAL buyer-evidence sources
  the customer selected (`STRONG_EVIDENCE_SOURCES` in discovery-content.mjs
  deliberately excludes intuition/personal-experience/competitor-observation
  -- a founder's own belief is real information but never counted as buyer
  evidence); the evidence-gated "What This Tells Us" interpretation (each
  note only fires when the underlying answers actually support it); the
  ordered Discovery Gap decision tree (never manufactures a gap once
  evidence is already strong -- names the most useful remaining refinement
  instead); the Customer Discovery Experiment (adapts by starting state, one
  small practical action, never an elaborate research requirement); and
  `deriveTopBuyingCriteria` (surfaces the route-relevant subset of what the
  customer actually checked, never dumps every checked item).
- `lib/module3.mjs` — the pure orchestrator (`computeModule3Results`),
  mirroring module1.mjs/module2.mjs's shape and never-cache-always-derive
  principle. Produces the consolidated "Your Customer Discovery Map" and the
  Module 4 transition.
- `lib/module3-service.mjs` — auth/persistence orchestration, kept separate
  from `module2-service.mjs` (Module 2 territory, frozen this slice).
  Gates on a completed Module 2 (`offerPlan.selectedPositioning` set) the
  same way Module 2 gated on a completed Module 1.
- `public/module3.html` — the guided form (prepopulated from Module 2's
  offer/audience/objections, confirm-or-refine, never forced re-entry)
  through trigger/criteria/discovery-environment/evidence selection and
  hypothesis generation to the final Customer Discovery Map artifact and the
  Module 4 transition (plain text, not a link -- Module 4 doesn't exist yet,
  same convention Module 2's page originally used for its Module 3 link).
- 3 new bridge routes: `GET /club/module3` (page), `GET /club/module3/context`
  + `GET /club/module3/results`, `POST /club/module3/language-hypotheses` +
  `POST /club/module3/submit`.

**Product-philosophy guardrails actually enforced in code, not just docs:**
no demographic/persona trivia fields exist anywhere in the DiscoveryPlan
schema (age, income, hobbies, etc. -- verified by a test that greps the
schema's own keys); discovery environments are mapped as plausible places to
look, never as a channel recommendation (no "recommended channel" or "best
channel" language anywhere in the computed results -- verified by test);
customer-language hypotheses are always labeled hypotheses, never "validated
keywords," and never carry a fabricated search-volume number; observed vs.
hypothesized objections remain distinct all the way through to the rendered
map; a customer whose only basis is "best guess/intuition" still completes
the module successfully and gets an honest Working Hypothesis confidence
verdict, never blocked and never silently upgraded.

40 new tests (`test/club-module3.test.mjs`), covering every case in the
spec's test list (prepopulation, refinement, no persona fields, route-adapted
triggers/criteria, observed/hypothesis distinction, discovery environments
vs. channel recommendation, hypothesis labeling, evidence-driven confidence
at all three levels, What-This-Tells-Us's evidence gating, the Discovery Gap
decision tree, the Discovery Experiment's stage/route adaptation, the Map's
structured output, and the Module 4 transition), run together with Module
1/2's 74 (114 total across all three club test files, all pass). Full suite:
196/198 (the same 2 pre-existing, unrelated `mulberry-creek-2` fixture-drift
failures, untouched).

**Live-verified against the real, WooCommerce-account-linked test account**
(customer id 1, the `scrollysocial` account, the real "soaps" ecommerce
profile and offer from Modules 1/2) via a locally-minted test token -- full
click-through: Module 1 results -> real "Continue to Module 3" link on
Module 2's page -> Module 3 prepopulated with the real carried-forward
audience/objection -> hypothesis generation using the real offer/audience
data -> full submission -> Customer Discovery Map rendered -> reload later
shows the saved result directly, matching Module 1/2's pattern. One real bug
found and fixed this way: the Confidence badge's text was invisible (white
text with no background color defined for the three confidence-level CSS
classes) -- fixed in `public/module3.html`'s stylesheet.

## Module 4 — Choose How People Will Find You (2026-09-12)

The Channel Selector + $1K Channel Plan. Modules 1-3 are frozen and untouched
except one necessary integration change (mirroring the Module 2->3
precedent): Module 3's "Continue to Module 4" text in `public/module3.html`
is now a real link (`<a href="/club/module4">`).

This is a PRIORITIZATION system, not a channel-availability checklist -- the
core product principle (available/popular/contains-some-of-the-target-
customer never automatically means recommended) is enforced by construction:
recommendations come from a deterministic internal weighted sum across the
spec's seven reasoning dimensions (customer presence, discovery/buying
intent, offer/format fit, owner execution fit, existing traction, time to
feedback, compounding potential) -- used ONLY to rank candidates. No
score/total/rank is ever exposed in the public result shape (verified by a
test that recursively scans the whole computed result for those keys).

**New files:**
- `lib/channel-plan-schema.mjs` / `lib/channel-plan-store.mjs` — the
  persisted ChannelPlan (`club/members/<slug>/channel-plan.json`). Unlike
  Modules 2/3, almost everything here is genuinely NEW owner-execution input
  (marketing hours/week, feasible formats, existing assets, hard
  constraints) rather than confirmed/refined prior answers -- the actual
  recommendation (Primary/Secondary/Compounding/Not Now/jobs/confidence/
  strategy/experiment) is never persisted, only ever derived fresh by
  `module4.mjs`, same discipline as Module 2/3's Fix-First/Discovery-Gap-
  style judgments. `existingAssets[].level: 'account_only' | 'real_traction'`
  is the explicit mechanism that keeps "an account exists" from silently
  reading as "traction exists" (a named spec requirement).
- `lib/channel-content.mjs` — the channel universe (Module 3's own
  `DISCOVERY_ENVIRONMENTS`, imported rather than duplicated, per the spec's
  explicit "start with Module 3's plausible discovery environments"), the
  new owner-execution enums (`FEASIBLE_FORMATS`, `EXISTING_ASSET_TYPES`,
  `CHANNEL_JOBS`), and `CHANNEL_REFERENCE` — static, general per-channel
  reasoning data (typical buying intent, offer/format fit, production
  effort, time-to-feedback, compounding potential, supported jobs, and
  behavioral early-evidence examples) used purely as deterministic reasoning
  inputs, never fabricated statistics and never shown to the customer.
  Business-model context only ever adjusts which format-fit tags apply to
  THIS offer (`baseOfferFormatTagsForRoute`, layered with real Module 2
  proof-inventory and Module 3 buying-criteria signals in
  `channel-evaluation.mjs`) -- it never hard-codes "route X -> channel Y."
  The one exception, explicitly named by the spec itself, is
  `ROUTE_SURFACED_CHANNELS`: marketplace-first surfaces a marketplace
  channel and local/hybrid surfaces Google Maps/local search when neither
  was already a confirmed candidate -- always flagged as business-model-
  surfaced, never presented as customer-confirmed evidence.
- `lib/channel-evaluation.mjs` — the reasoning engine: candidate gathering
  (Module 3's confirmed discovery environments + Module 1's existing
  channels + the limited route-surfacing above), offer/format-tag
  derivation, the deterministic per-candidate scorer, Primary/Secondary/
  Compounding/Not-Now selection (a channel can serve both Primary and
  Compounding without implying duplicate work; a hard-constrained channel is
  still scored so a genuine tradeoff can be explained, but is never
  selected), evidence-driven confidence classification (Evidence-Backed/
  Partially Validated/Working Hypothesis, reusing prior modules' language,
  never a numeric score), job assignment (derived from what each channel
  actually supports -- never a blanket "Discovery" for every platform), the
  ordered Not-Now reason decision tree (specific, never "bad channel"), the
  natural-language strategy synthesis, and the Channel Experiment (adapts by
  the primary channel's buying-intent category and by starting state; one
  small evidence-generating action, never a 30-day plan or a revenue
  promise).
- `lib/module4.mjs` — the pure orchestrator (`computeModule4Results`),
  mirroring module1-3.mjs's shape and never-cache-always-derive principle.
  Assembles the carried-forward Module 1/2/3 context (starting state, data
  confidence, first priority, baseline metrics, deliverable, positioning,
  Fix First/Keep/Learn, offer experiment, likely buyer, buying trigger,
  desired result, top buying criteria, discovery environments, customer-
  language hypotheses, Module 3 confidence/gap/experiment/interpretation)
  plus the final "Your $1K Channel Plan" artifact and the Module 5
  transition.
- `lib/module4-service.mjs` — auth/persistence orchestration, kept separate
  from `module3-service.mjs` (Module 3 territory, frozen this slice). Gates
  on a completed Module 3 (`discoveryPlan.discoveryEnvironments` non-empty)
  the same way Module 3 gated on a completed Module 2. No "generate then
  select" round trip like Modules 2/3's positioning/hypothesis steps --
  Module 4's whole job is deterministic reasoning over already-known state
  plus the 4 small new owner inputs, so context + submit + results is the
  complete surface (mirroring Module 1's simpler shape).
- `public/module4.html` — the guided form (marketing hours, feasible
  formats, existing assets with an explicit account-only/real-traction
  toggle per asset, hard constraints) through to the final Channel Plan
  artifact and the Module 5 transition (plain text, not a link -- Module 5
  doesn't exist yet, same convention every module has used for its
  not-yet-built next-module CTA).
- 2 new bridge routes: `GET /club/module4` (page), `GET /club/module4/context`
  + `GET /club/module4/results`, `POST /club/module4/submit`.

**Product-philosophy guardrails actually enforced in code, not just docs:**
no numeric score/total/rank ever appears in the public result (recursive
scan test); an existing channel/account is a candidate but contributes
nothing to the Existing Traction dimension unless a `real_traction`-level
asset explicitly maps to it; two channels with identical customer-presence
("both confirmed in Module 3") are still differentiated correctly by the
other six dimensions -- presence alone never decides Primary; a
hard-constrained channel is fully excluded from Primary/Secondary but is
still scored, so a genuinely-would-have-won constrained channel produces an
explicit "would otherwise have looked like the strongest option, but you
said you won't use it, here's the best realistic alternative" explanation,
never a silent substitution; compounding potential is structurally a small
factor (its maximum weight is smaller than the intent-weight range) so it
can influence but never single-handedly decide Primary; Secondary Channel
legitimately renders "No Secondary Channel Yet" under low capacity, and
Compounding Asset legitimately renders "Not Yet" when nothing eligible
compounds; Not Now reasons are channel-specific and never say "bad channel."

48 new tests (`test/club-module4.test.mjs`), covering every case in the
spec's test list across multiple business models (ecommerce, services,
marketplace-first, local/hybrid, creator/affiliate all appear), run together
with Modules 1-3's 114 (162 total across all four club test files, all
pass). Full suite: 265/267 (the same 2 pre-existing, unrelated
`mulberry-creek-2` fixture-drift failures, untouched).

**Live-verified against the real, WooCommerce-account-linked test account**
(customer id 1, the `scrollysocial` account, the real "soaps" ecommerce
profile/offer/discovery-map from Modules 1-3) via a locally-minted token:
full click-through from Module 3's real "Continue to Module 4" link into
Module 4, submitting real capacity/format/asset answers, producing a
coherent, non-generic plan (Primary: Instagram for discovery, Secondary:
Google Search reasoned specifically as a trust/credibility-check role once
Instagram is primary, Compounding Asset: Google Search, same as Secondary),
and a persisted reload showing the identical saved plan -- matching every
prior module's pattern. No bugs found this pass.

## Module 5 — Give Them a Reason to Pay Attention (2026-09-12)

The Messaging & Content Builder. Modules 1-4 are frozen and untouched except
one necessary integration change (mirroring the Module 3->4 precedent):
Module 4's "Continue to Module 5" text in `public/module4.html` is now a real
link (`<a href="/club/module5">`).

Content is not the objective -- revenue-producing customer movement is. This
module turns everything Modules 1-4 already know into a reusable messaging
system (Core Message, Message Angles, prioritized Content Roles, a
Channel -> Message Map built from Module 4's *actual* persisted schema, a
Proof Plan, Objection Messaging, CTA Strategy, a reusable idea formula, and
10-15 personalized starter ideas) rather than a content calendar or a pile of
generic post ideas.

**New files:**
- `lib/messaging-plan-schema.mjs` / `lib/messaging-plan-store.mjs` — the
  persisted MessagingPlan. Unlike every other module's plan, this one is
  almost empty by design: the spec's only real customer DECISION is the Core
  Message (generate 3 directions, then select/edit/write one -- Module 2's
  positioning-selection shape, reused). Every other output (angles, role
  priorities, the channel map, the proof plan, objection messaging, CTA
  strategy, the idea formula, starter ideas, the messaging experiment) is
  derived fresh every time by `module5.mjs`, never persisted separately --
  same discipline as every prior module's Fix-First/Discovery-Gap/Channel-
  Plan-style judgments.
- `lib/messaging-text-utils.mjs` — shared safe-text-embedding helpers
  (`clause()`/`topic()`), re-applied here rather than imported from
  `offer-positioning.mjs` (frozen Module 2 surface). Module 5 embeds far more
  free-text fields into generated sentences than Module 2 did, so this
  class of bug was a bigger risk here, not a smaller one -- see the grammar
  fixes below.
- `lib/messaging-safety.mjs` — the explicit claims-guardrail scanner
  (`scanForUnsafeClaims`/`isSafeCopy`). Structural safety comes first (no
  LLM anywhere in this codebase; every string is a deterministic template
  that only ever echoes customer-SUPPLIED facts as topic/context, never an
  invented or upgraded claim) -- this scanner is the defense-in-depth layer
  every generator is tested against. Tuned to catch a real product-efficacy
  claim shape (verb + determiner + condition, e.g. "clears your skin")
  while never false-positiving on a buyer's own stated desire echoed back
  descriptively (e.g. "a way to clear, calm skin without breakouts," lifted
  from their own Module 3 answer -- "clear" there is an adjective before
  "skin," not a verb acting on a determined object, a structurally
  different and safe shape).
- `lib/messaging-content.mjs` — the seven canonical Content Roles, the
  Channel-Job -> Content-Role and Channel-Job -> CTA-category maps (reusing
  Module 4's own job vocabulary), objection-type safe-messaging directions,
  and proof-type usage guidance -- all FUNCTIONS, not quotas.
- `lib/core-message-generator.mjs`, `lib/message-angle-generator.mjs`,
  `lib/content-role-prioritizer.mjs`, `lib/channel-message-map-builder.mjs`
  (imports Module 4's own `JOB_PHRASES` rather than re-describing jobs),
  `lib/proof-plan-builder.mjs`, `lib/objection-messaging-builder.mjs`,
  `lib/idea-generator.mjs` (the reusable Trigger + Role + Angle + Channel Job
  + CTA formula, plus bounded 10-15 starter-idea generation), and
  `lib/messaging-experiment.mjs`.
- `lib/module5.mjs` — the pure orchestrator (`computeModule5Results`),
  reading Module 4's *actual* field names verbatim (`primaryChannel`,
  `primaryChannelKey`, `primaryJob`, `secondaryChannel`, `secondaryJob`,
  `compoundingAsset`, `compoundingAssetKey`, `compoundingIsPrimary`/
  `compoundingIsSecondary`, `notNow`, `availableCapacity`, `earlyEvidence`,
  `strategySynthesis`, `channelExperiment`, `confidence`) rather than
  inventing new names for the same concepts.
- `lib/module5-service.mjs` — auth/persistence orchestration, kept separate
  from `module4-service.mjs` (Module 4 territory, frozen this slice). Gates
  on a completed Module 4 (`channelPlan.marketingHoursPerWeek != null`) the
  same way Module 4 gated on a completed Module 3. Like Modules 2/3, has one
  "generate then select" round trip (the Core Message) -- unlike Module 4,
  which had none.
- `public/module5.html` — a short form (Core Message selection only) then
  the full Messaging & Content Plan output, plus the Module 6 transition
  (plain text, not a link -- Module 6 doesn't exist yet).
- 4 new bridge routes: `GET /club/module5` (page), `GET /club/module5/context`
  + `GET /club/module5/results`, `POST /club/module5/core-message` +
  `POST /club/module5/submit`.

**Real grammar bugs found and fixed via live QA (the same class of bug as
Module 2's "designed to Made with..." regression, but a bigger risk here
since Module 5 embeds far more free-text fields into generated sentences):**
a raw customer-typed noun (the offer, the buyer description) can be singular
or plural, so pairing it directly with a Scrolly-written conjugated verb
("soaps actually becomes...", "healthy conscious people aren't...") breaks
subject-verb agreement roughly half the time. Every Core Message/angle/idea
template was rewritten so the only conjugated verb in each sentence attaches
to a fixed, invariant subject ("the moment that matters," "the real goal
isn't X -- it's this: Y") and customer text is only ever an appositive/
object, never the subject of a Scrolly-written verb and never the
completion of a bare "to VERB" infinitive (which additionally assumes a
verb-phrase shape the customer's text may not have -- e.g. "a gentle, truly
natural soap" is a noun phrase). Also fixed: the "Education" starter-idea
template's "how {angle} actually works" framing produced real nonsense
("how what they have isn't enough actually works") once the bounded
starter-idea top-up logic paired it with a trigger-labeled angle that isn't
a mechanism/differentiator -- fixed by dropping the angle-name interpolation
from that template entirely (the angle stays visible as separate idea
metadata instead of being forced into a sentence frame it doesn't fit), and
applying the same fix to the "Proof & Process" template, which had become
circular ("proof behind real proof, not just claims").

52 new tests (`test/club-module5.test.mjs`), covering every case in the
spec's test list across multiple business models (ecommerce, services,
marketplace-first), plus the explicitly-required safety regression test
(a soap buyer's stated "worried about breakouts" concern, proven never to
become an unsupported efficacy claim anywhere in the full computed output),
run together with Modules 1-4's 162 (214 total across all five club test
files, all pass). Full suite: 317/319 (the same 2 pre-existing, unrelated
`mulberry-creek-2` fixture-drift failures, untouched).

**Live-verified against the real, WooCommerce-account-linked test account**
(customer id 1, the `scrollysocial` account, the real "soaps" ecommerce
profile/offer/discovery-map/channel-plan from Modules 1-4) via a
locally-minted token: full click-through from Module 4's real link into
Module 5, generating 3 real Core Message options from her actual data,
selecting one, and producing a coherent, natural, non-generic Messaging &
Content Plan (Instagram for Problem/Desire/Offer content, Google Search for
Proof/Objection/Story content, both grammar bugs above caught and fixed
during this exact live pass, re-verified clean after each fix) and a
persisted reload showing the identical saved plan.

**2026-09-12, same day, user-reported bug: the "Continue to Module 6" link
was effectively invisible.** Mercedes reported no link from Module 5 to
Module 6 after using the real page herself. The `<a href="/club/module6">`
was genuinely present in the HTML and functionally correct (confirmed via
`find`/click-through earlier the same session) -- the real defect was
layout order: `renderResults()` placed the "Personalized Starter Ideas"
card AFTER the final "Your $1K Messaging & Content Plan" card that contains
the link, so a user scrolling to the actual bottom of the page never
reached it -- every other module (`index.html` through `module4.html`)
renders its final plan-card-with-CTA-link as the literal last element on
the page; Module 5 was the one exception. Fixed by moving "Personalized
Starter Ideas" to render before the final plan card, matching the
established convention. Re-verified live: "Continue to Module 6 — Turn
Attention Into Sales" is now the last line on the page. No test caught this
because it's a pure rendering-order issue in static HTML, not backend
logic -- full suite re-confirmed green (356/358, same 2 pre-existing
unrelated failures) after the fix.

## Public proxy discovered mid-task (2026-09-12) -- built by concurrent work, not documented anywhere

Before starting Module 6, inspection turned up `automation/club-public-proxy.mjs`
and `test/club-public-proxy.test.mjs` -- real, tested infrastructure (an
exact method+path allow-list proxy sitting in front of `bridge-server.mjs`,
fail-closed by design) that did not exist when Module 5 shipped and is
mentioned nowhere in this README or `current-state.md`. Timestamps confirm
it was added by separate, concurrent work shortly before this Module 6
session started. Its own allow-list only went up through Module 4 and its
own test explicitly proved `/club/module5/context` was still blocked --
i.e., it pre-dates Module 5 and had never been updated for it. Per this
task's explicit instruction ("inspect whether Module 5 added new public
routes and confirm the proxy currently permits every customer-facing route
actually required for Modules 1–6"), fixed as part of this slice:
- Added Module 5's 5 routes (`GET /club/module5`, `GET /club/module5/context`,
  `GET /club/module5/results`, `POST /club/module5/core-message`,
  `POST /club/module5/submit`) to `ALLOWLIST` -- retroactively closing the
  gap the proxy had carried since before this session.
- Added Module 6's 4 routes (`GET /club/module6`, `GET /club/module6/context`,
  `GET /club/module6/results`, `POST /club/module6/submit`).
- Updated the proxy's own "blocks a hypothetical future module route" test
  to point at `/club/module7/context` (Module 5's route is now legitimately
  allowed, so it could no longer serve as the "not yet built" example).
- No other change to `club-public-proxy.mjs` -- its architecture (exact
  allow-list, fail-closed, header allow-list, no cookie forwarding) is
  sound and untouched; this was purely inspecting it and extending the list
  it explicitly asks future work to extend.
- Verified live: Module 6 served correctly through the proxy (port 5680 ->
  bridge-server.mjs on 5679) against the real `scrollysocial` account, and
  all 14 sensitive bridge-server routes remain blocked (21/21 proxy tests
  pass, including the "every allow-listed route reaches upstream" test now
  covering all of Modules 1-6).

## Module 6 — Turn Attention Into Sales (2026-09-12)

The Sales Path Builder. Modules 1-5 are frozen and untouched except one
necessary integration change (mirroring every prior module's transition
precedent): Module 5's "Continue to Module 6" text in `public/module5.html`
is now a real link (`<a href="/club/module6">`).

Attention is not the objective -- revenue-producing customer movement is.
This module connects the customer's actual discovery -> interest ->
consideration -> purchase/inquiry path using real Module 1-5 state, favoring
the simplest viable path for the actual business/offer/price rather than
building funnels for their own sake.

**MODULE 4 INTEGRATION RULE, enforced structurally, not just in copy:**
Primary/Secondary are resource priority, not dependency. Every selected
Module 4 channel (Primary, Secondary if present, Compounding Asset if
distinct) gets its OWN path straight to the same canonical destination --
`buildChannelPaths()` never chains one channel through another (no "Google
Search -> supports Instagram -> sale"). Verified live: the real customer-1
account's Instagram (Primary) and Google Search (Secondary) both produced
independent, complete paths to the same Product Page destination.

**New files:**
- `lib/sales-path-plan-schema.mjs` / `lib/sales-path-plan-store.mjs` — the
  persisted SalesPathPlan. Only 3 genuinely NEW customer inputs (Module 6
  needs no more): `conversionDestinations` (where someone can currently buy/
  book/order/contact -- `not_set_up_yet` is itself a valid, honest answer),
  `mobileStatus` (the OWNER's own honest read -- 'confirmed' | 'likely' |
  'unknown_needs_checking' -- never a Scrolly technical verification), and
  `followUpMechanism`. Everything else (the constructed path, path type, the
  Sales Path Check, the CTA -> Destination Map, the Conversion Gap, Direct
  vs Nurture, trust placement guidance, the $1K Connection, metrics, Fix
  Now/Keep/Measure, the experiment) is derived fresh every time, same
  discipline as every prior module.
- `lib/sales-path-content.mjs` — the conversion-destination universe, the
  step sequence and descriptive Path Type each destination implies, and
  trust-asset categories per destination shape (purchase/inquiry/local/
  other) -- static reasoning data, never a customer-facing score.
- `lib/sales-path-evaluation.mjs` — the reasoning engine: canonical-
  destination selection (the most specific selected destination anchors the
  path when several are selected), the price/complexity-driven
  qualification-step heuristic (`needsQualificationStep` -- never automatic;
  a $9.99 product never gets one, a $500+ service or customization/
  expertise-weighted offer legitimately can), `buildChannelPaths` (the
  Module 4 integration rule's actual enforcement point), the Sales Path
  Check dimensions (Offer Clarity reused directly from Module 2, not
  re-evaluated; Next-Step Clarity; Purchase/Contact Ability with an explicit
  `customer_reported` vs a technical-verification state Scrolly never
  claims; Contextual Friction, evaluated against price/complexity/
  qualification-need rather than "more steps = bad"; Trust at the Decision
  Point, which explicitly separates "proof exists" from "proof is placed
  where the buyer decides" -- always `exists_placement_unknown` unless no
  proof exists at all), the CTA -> Destination Map (flags a real buy/convert
  CTA pointed at a non-transactional destination, never invents a "generic
  homepage" that wasn't reported), the ordered Conversion Gap decision tree
  (insufficient-qualified-activity is checked FIRST, before any friction/
  trust/mismatch nuance -- the exact guardrail that keeps "we don't have
  enough activity to know" from ever being silently replaced by "your
  checkout isn't converting"), Direct vs Nurture reasoning (direct /
  marketplace_native / qualification_led / nurture_supported, each from
  real evidence), Fix Now/Keep/Measure-First, the Sales-Path Experiment, and
  path-specific metrics (Module 4's own Early Evidence Signals preserved
  verbatim as the upstream layer, feeding Module 7 later).
- `lib/module6.mjs` — the pure orchestrator (`computeModule6Results`),
  reading Module 4/5's actual field names verbatim (`primaryChannelKey`,
  `primaryJob`, `secondaryChannelKey`, `compoundingAssetKey`,
  `compoundingIsPrimary`/`compoundingIsSecondary`, `earlyEvidence`,
  `coreMessage`, `ctaStrategy`, `proofPlan`, `objectionsToAddress`) rather
  than inventing new names.
- `lib/module6-service.mjs` — auth/persistence orchestration, kept separate
  from `module5-service.mjs` (Module 5 territory, frozen this slice). Gates
  on a completed Module 5 (`messagingPlan.selectedCoreMessage` set), same
  pattern as every prior gate. No "generate then select" round trip -- the
  three new inputs are direct selections, matching Module 4's simpler shape.
- `public/module6.html` — destination/mobile/follow-up form, then the full
  Sales Path artifact including a simple `Channel → Destination → Action →
  Purchase`-style path visualization, and the Module 7 transition (plain
  text, not a link -- Module 7 doesn't exist yet).
- 3 new bridge routes: `GET /club/module6` (page), `GET /club/module6/context`
  + `GET /club/module6/results`, `POST /club/module6/submit`.

**Bug found and fixed via live QA (not a grammar bug this time, a content-
accuracy gap):** `TRUST_ASSET_CATEGORIES_BY_DESTINATION_KIND.purchase`
omitted `'Testimonials'` -- a real product page routinely features
testimonials, but the category list only recognized reviews/ratings/photos/
demos/policies/before-after. Caught live against the real customer-1
account (her only real proof is Testimonials): the Trust guidance said her
proof "may not be the type most relevant" to a product page, which
understates a completely standard product-page trust element. Fixed by
adding `'Testimonials'` to the `purchase` category list; re-verified live,
now correctly reads "You have relevant proof (Testimonials) for this kind
of decision point..."

39 new tests (`test/club-module6.test.mjs`), covering every case in the
spec's test list across multiple business models (ecommerce, services,
marketplace-first), run together with Modules 1-5's 214 plus 21 proxy tests
(274 total, all pass). Full suite: 356/358 (the same 2 pre-existing,
unrelated `mulberry-creek-2` fixture-drift failures, untouched).

**Live-verified against the real, WooCommerce-account-linked test account**
(customer id 1, the `scrollysocial` account, the real "soaps" ecommerce
profile/offer/discovery-map/channel-plan/messaging-plan from Modules 1-5),
served THROUGH the public proxy (port 5680 -> bridge-server.mjs on 5679),
not directly against bridge-server.mjs: full click-through from Module 5's
real link into Module 6, submitting real destination/mobile/follow-up
answers (website product page, likely-mobile, no follow-up -- all honest to
her real $0-revenue, no-email-list account state), producing a coherent
Sales Path (Instagram and Google Search each with their own independent
path to Product Page, Path Type "Direct Conversion", Conversion Gap
correctly "Insufficient Qualified Activity" rather than a fabricated
conversion complaint, since she has zero real revenue/traction evidence)
and a persisted reload showing the identical saved plan after the
Testimonials fix.

## Not built yet (next steps, in build-order sequence)

1. **Module 7 — Find What Works & Do More of It.** Not started (explicitly
   out of scope for this slice). Module 6's `nextClubStep` already produces
   the correct bridge sentence and CTA label pointing to it.
2. **Challenge Agent.** Context-assembly (business profile + route + $1K
   Math + evaluation + challenge day + recent activity) is straightforward
   to build from the modules above. The actual LLM call should reuse
   `automation/implementation/lib/llm-router.mjs`'s existing
   provider-neutral pattern (`LLM_PROVIDER`/`LLM_MODEL_ANTHROPIC` env vars
   already exist) rather than a new integration. Advisory only, per the
   canonical rule — never wired to publish/purchase/login actions. Not
   started; needs the ~$2/participant cost ceiling designed into the prompt/
   call budget before it's wired live.
3. **Current Content Opportunities.** Architecture only, per the directive:
   one central/shared dataset refreshed independently of any customer,
   cheap per-business filtering against it, Agent personalizes the filtered
   result. Not started — do not build 100 live searches per participant.
4. **Lightweight tracker/dashboard** (revenue, sales, leads, activity,
   challenge day, current priority) — manual weekly entry is acceptable for
   V1. Could extend the existing operator-dashboard pattern
   (`automation/dashboard/index.html` + `bridge-server.mjs`) rather than a
   new UI. Not started.
5. **Achievement claim workflow** (claim -> review -> verify, per
   `club-state.mjs`'s `recordAchievementClaim`/`recordAchievementVerification`)
   — the state model exists; the actual submission surface and operator
   review UI don't yet.
6. **Merch entitlement** — the state model (`merchUnlocked`, independent of
   `rewardChoice`) exists; no WooCommerce coupon/access-restriction wiring
   built yet. Deliberately minimal scope per the directive (entitlement
   model, not a merch fulfillment system).
7. **Site work** (positioning, $1K Club explainer, purchase path) — not
   started. No curriculum copy was invented anywhere in this build; content
   slots are structural only.
8. **Pasting `club-access-route.php` live** — see the fast-follow section
   above; this is the one remaining step between "works with a minted test
   token" and "a real customer can use it."

## Explicitly left untouched

Everything under `automation/lib/`, `automation/runner/`, `automation/n8n/`,
`automation/implementation/`, and the live SEO sales pages/products
(WooCommerce IDs 24/58/69, the Implementation Agent) — no shared
infrastructure was modified, only reused by reference.

## Unrelated finding from this session (not touched)

`npm test` currently has one pre-existing failure unrelated to this build:
`order-aggregator.test.mjs` expects the `mulberry-creek-2` fixture's status
to be `awaiting_final_review` but it's now `delivered` — that real fixture's
`order.json` has apparently advanced since the test was last green. Not
caused by anything in this session (no Discover/order-state files were
touched) and out of scope for the Club build; flagging for whoever next
touches the Discover test suite.
