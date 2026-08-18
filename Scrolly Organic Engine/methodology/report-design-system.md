# Report Design System (V1.0)

**This file governs visual presentation only.** It is the companion to [report-contract.md](report-contract.md), which remains the sole authority on *what* the report must contain. Nothing here changes a content requirement, a section, the Core Rule, or the Final Quality Gate.

**Rule, stated once, applies everywhere below:** if a finding or table doesn't cleanly fit one of these components, do not omit it, shorten it, or reorder the report to make it fit — use the plain `.finding-card`/`.tint-block` fallback and move on. A slightly plain-looking finding beats a missing one.

`report.md` and `appendix.md` are plain Markdown rendered by `md-to-pdf`, which passes raw HTML straight through. That means the blocks below can be pasted directly into the Markdown wherever a component is useful — mix freely with normal Markdown headings, prose, and tables around them. The stylesheet implementing every class here is `automation/report-theme/scrolly-report.css` (loaded automatically by the PDF renderer — nothing to import from within the report itself).

---

## Palette & type reference

Copied from `website/index.html`'s real `:root` — this *is* the brand, not an approximation.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#10152b` | headings, primary text, dark sections |
| `--ink-soft` | `#5c6478` | body/secondary text |
| `--line` | `#e1e5f2` | borders |
| `--bg` / `--bg-alt` | `#f5f7fc` / `#eef1fa` | pale section backgrounds |
| `--indigo` | `#4f46e5` | brand accent, links, cover |
| `--blue` | `#2563eb` | Where You Stand |
| `--cyan` | `#0891b2` | Where the Opportunity Is |
| `--pink` | `#db2777` | What to Build / high priority |
| `--violet` | `#7c3aed` | Your Growth Plan / roadmap |
| `--mint` | `#0d9488` | Strong / Passed / wins |
| `--amber` | `#d97706` | Needs Work |
| `--gray` | `#6b7280` | Pending / unknown |

Headings: Manrope 800/700. Body: Inter 400–700. Brand gradient (cover accents, major dividers only — never behind body copy): `linear-gradient(120deg,#3730a3,#4f46e5 45%,#0891b2)`.

**Semantic tokens for new diagrams/SVGs (added 2026-08-16).** `--scrolly-navy/blue/teal/purple/pink` (+ `-soft` tints, + `--scrolly-ink/muted/border/surface`) alias the table above 1:1 — `--scrolly-blue` = `--indigo`, `--scrolly-teal` = `--cyan`, `--scrolly-purple` = `--violet`, `--scrolly-pink` = `--pink`, `--scrolly-navy`/`--scrolly-ink` = `--ink`. **Any new SVG/diagram must pick fills only from this 5-hue family (+ neutrals) — never `--amber`, `--mint`, or `--gray`, and never a one-off hex value not in this table.** Those three stay reserved for the existing, already-established badge/status vocabulary (amber = Needs Work, mint = Strong/Passed, gray = Pending/unknown) — reusing them inside a diagram muddies a distinction readers already rely on elsewhere in the report. Map a diagram's own semantic states onto the 5-hue family using the same logic as the eyebrow system below: foundational/current-state → navy or blue, opportunity/discovery → teal, build/primary-action → blue, informational/secondary/supporting → purple, critical/highest-priority → pink (used selectively, not as a default), not-yet-confirmed/validate-first → neutral gray or a pale tint, never amber. **Contrast is mandatory, not optional:** a dark fill (navy, blue, teal, purple, pink) always pairs with white/near-white text; a pale `-soft` fill always pairs with the matching dark hue or `--scrolly-ink` text — never light-on-light or a saturated fill under same-hue text.

## Four-color eyebrow system (visual grouping, nested inside the seven-part narrative)

Report-contract.md's 29 sections keep their own names, order, and numbering, and now read as seven narrative parts (see report-contract.md's "Seven-part narrative order"). The four colors below are a lighter-weight visual coding layer inside that structure — where useful, a section opener may carry one of these eyebrows so the report echoes the sales page's own framing. **Never repeat the identical eyebrow immediately before two or more consecutive subsections** (report-contract.md's "no duplicate eyebrows in a row" rule) — vary it, merge the sections, or drop the eyebrow rather than let it read as a copy-paste artifact:

| Framework label | Color class | Roughly maps to |
|---|---|---|
| Where You Stand | `.section-eyebrow.blue` | Exec Summary, Current Search Visibility, Technical SEO &amp; Website Health, Performance, Measurement |
| Where the Opportunity Is | `.section-eyebrow.teal` | Keyword &amp; Topic Clusters, Ranking Difficulty, SERP/AI, Competitor Analysis, Google Business Profile &amp; Local SEO |
| What to Build | `.section-eyebrow.pink` | Recommended Website Structure, Pages to Build, Internal Linking Strategy, Content Growth Strategy, Authority/Backlinks, Search Beyond Google |
| Your Growth Plan | `.section-eyebrow.violet` | Traffic/Business-Value Scenarios, Implementation Priorities, Quick Wins, Roadmap, Is Organic Search Worth the Investment, Measurement Plan |

Use judgment for sections that don't fit neatly (e.g. Scope & Next Steps, Appendix) — leave the eyebrow off rather than forcing a mismatched color.

---

## Components

### Cover page

```html
<div class="cover">
  <div class="cover-top">
    <div class="cover-brand">Scrolly<span>SEO</span></div>
    <div class="cover-gradient-bar"></div>
    <div class="cover-eyebrow">Organic Search Opportunity Report</div>
    <h1>[Business Name]</h1>
    <p class="cover-dek">Your personalized search visibility, opportunity, and growth analysis.</p>
  </div>
  <div class="cover-meta">
    <div><span class="cm-label">Website</span><span class="cm-value">[domain]</span></div>
    <div><span class="cm-label">Location</span><span class="cm-value">[city, state / service area]</span></div>
    <div><span class="cm-label">Report Date</span><span class="cm-value">[date]</span></div>
    <div><span class="cm-label">Prepared By</span><span class="cm-value">Scrolly SEO</span></div>
  </div>
</div>
```

### Section opener

```html
<div class="section-opener">
  <div class="section-eyebrow blue">Where You Stand</div>
  <h2>Technical SEO</h2>
  <p class="section-dek">What we tested, what's healthy, and what's actively costing you visibility.</p>
</div>
```

### Evidence & status badges

One `<span class="badge badge-X">` per label, inline, wherever a finding needs one:

```html
<span class="badge badge-observed">Observed</span>
<span class="badge badge-retrieved">Retrieved</span>
<span class="badge badge-calculated">Calculated</span>
<span class="badge badge-inference">Inference</span>
<span class="badge badge-pending">Pending</span>

<span class="badge badge-strong">Strong</span>
<span class="badge badge-needswork">Needs Work</span>
<span class="badge badge-critical">Critical</span>
<span class="badge badge-unknown">Unknown</span>

<span class="badge badge-high">High Priority</span>
<span class="badge badge-high">High Impact</span>
<span class="badge badge-low">Low Effort</span>
<span class="badge badge-outline">Moderate Confidence</span>
```

### Finding card

Accent color picks the framework color for that section (`.teal`, `.pink`, `.violet`; default is blue; `.mint`/`.amber` available for a Wins-adjacent or Needs-Work-flavored card).

```html
<div class="finding-card teal">
  <span class="badge badge-retrieved">Retrieved</span>
  <span class="badge badge-high">High Priority</span>
  <h4>No dedicated landing page for "landscape design"</h4>
  <div class="fc-label">Why it matters</div>
  <p>You already win local-pack #1 for this term at Wills Point, but the win rests entirely on the homepage — there's no page to expand it with cost/near-me/company sub-intents.</p>
  <div class="fc-label">Evidence</div>
  <p>SERP pull, 2026-08-10 — local pack #1, Wills Point, "landscape design."</p>
  <div class="fc-label">Recommended action</div>
  <p>Build a dedicated Landscape Design page targeting the confirmed keyword cluster.</p>
</div>
```

### Wins card

```html
<div class="wins-card">
  <h4>You already win local pack #1 for "landscape design"</h4>
  <p>Confirmed at Wills Point — a real, proven ranking to protect and expand, not a hypothetical.</p>
</div>
```

### Callout ("what this means")

Pair with a chart or table — the plain-English takeaway, not decoration.

```html
<div class="callout">
  <div class="callout-label">What this means</div>
  <p>Your competitors are capturing substantially more non-branded search demand, but much of that traffic comes from service pages your site does not currently have.</p>
</div>
```

### KPI stat row

```html
<div class="kpi-row">
  <div class="kpi-card blue"><div class="kpi-num">127</div><div class="kpi-label">Keywords ranking</div></div>
  <div class="kpi-card teal"><div class="kpi-num">18</div><div class="kpi-label">High-priority opportunities</div></div>
  <div class="kpi-card pink"><div class="kpi-num">4</div><div class="kpi-label">Critical technical issues</div></div>
  <div class="kpi-card violet"><div class="kpi-num">3</div><div class="kpi-label">Competitors dominating local</div></div>
</div>
```

### Scorecard grid (Executive Summary)

```html
<div class="scorecard-grid">
  <div class="scorecard-row"><span class="sc-name">Technical SEO</span><span class="badge badge-strong">Strong</span></div>
  <div class="scorecard-row"><span class="sc-name">Website Architecture</span><span class="badge badge-needswork">Needs Work</span></div>
  <div class="scorecard-row"><span class="sc-name">Backlinks / Authority</span><span class="badge badge-critical">Critical</span></div>
  <!-- one row per report-contract.md §1 scorecard area -->
</div>
```

### Branded / competitor table

Add `class="competitor-table"` to a normal Markdown table's rendered `<table>` only if authoring raw HTML; for Markdown-native tables, this is applied automatically by the stylesheet to every table — no class needed for standard branding. Use raw HTML only when a "Your Business" column needs the `you-col` highlight or a row needs `class="highlight-row"` (or `highlight-row teal` / `highlight-row violet`) to flag the standout opportunity.

### Roadmap timeline

```html
<div class="timeline">
  <div class="timeline-step"><div class="timeline-dot">1</div><h4>Week 1</h4><p>Tracking + critical fixes</p></div>
  <div class="timeline-step"><div class="timeline-dot">2</div><h4>Week 2</h4><p>On-page + GBP fixes</p></div>
  <div class="timeline-step"><div class="timeline-dot">3</div><h4>Weeks 3–4</h4><p>Highest-priority page built <span class="badge badge-outline">Time-Sensitive</span></p></div>
  <div class="timeline-step"><div class="timeline-dot">4</div><h4>Days 31–60</h4><p>Core pages + first content</p></div>
  <div class="timeline-step"><div class="timeline-dot">5</div><h4>Days 61–90</h4><p>Content + authority + new markets</p></div>
</div>
```

**Stages, labels, and count must come from the actual roadmap generated for this engagement (report-contract.md §23) — this is a shape to fill in, not a fixed default plan.** The 5-stage Week-1/Week-2/Weeks-3-4/Days-31-60/Days-61-90 example above is illustrative only; a different engagement may generate 3 stages or 8, with entirely different labels (Immediate, Month 3, Quarter 2, etc.) — never reuse this example's specific stage count or day ranges as a default template. Add the existing `badge-outline` badge (reused, no new CSS) next to any stage whose timing was pulled forward by a seasonal or other lead-time constraint per discover.md's Seasonality → Prioritization & Timing rule, labeled "Time-Sensitive," so the client can see at a glance which step has a real external clock attached to it.

### Dark section (Methodology, major dividers — use sparingly)

```html
<div class="section-dark">
  <div class="section-eyebrow blue">Methodology</div>
  <h2>Every finding, clearly explained.</h2>
  <p>Every finding below is labeled by exactly how it was derived.</p>
  <span class="badge badge-observed">Observed</span>
  <span class="badge badge-retrieved">Retrieved</span>
  <span class="badge badge-calculated">Calculated</span>
  <span class="badge badge-inference">Inference</span>
  <span class="badge badge-pending">Pending</span>
</div>
```

### Pale editorial section wrapper

For rhythm between white and tinted "pages" per report-contract.md's page-design guidance — wrap a subsection that should read as visually distinct:

```html
<div class="tint-block">
  ... normal markdown/HTML content ...
</div>
```

### Source citation

```html
Search demand increased 18% year over year.<sup class="cite">2</sup>
```

```html
<div class="source-list">
  <sup>1</sup> Semrush, "AI SEO Statistics" — semrush.com/blog/ai-seo-statistics · <sup>2</sup> DataForSEO, keyword_ideas pull, 2026-08-10
</div>
```

### Appendix density

Wrap dense appendix tables in `<div class="appendix">...</div>` for tighter padding/smaller type than the main report.

### Backlink / referring-domain appendix table (added 2026-08-17)

For report-contract.md §15's size-conditional full-listing requirement. Standard `<table>` inside `<div class="appendix">`, one row per retrieved referring domain — **only columns genuinely retrieved; state plainly, once, above the table, which fields weren't retrieved this round rather than leaving cells blank with no explanation.**

```html
<div class="appendix">
<table>
<thead><tr><th>Referring Domain</th><th>Follow/Nofollow</th><th>First Seen</th><th>Last Seen</th></tr></thead>
<tbody>
<tr><td>example-directory.com</td><td>Nofollow</td><td>2021-09-14</td><td>2026-07-02</td></tr>
</tbody>
</table>
</div>
```

### Legitimate link/citation/mention opportunity table (added 2026-08-17)

For report-contract.md §15's new subsection. Standard table, main report or appendix depending on length:

```html
<table>
<thead><tr><th>Source / Platform</th><th>Currently Present?</th><th>Opportunity Type</th><th>Relevance</th><th>Effort</th><th>Priority</th></tr></thead>
<tbody>
<tr><td>Wills Point Area Chamber of Commerce</td><td>Unconfirmed</td><td>Directory listing + local citation</td><td>Local business organization, direct geographic match</td><td>Low</td><td>Medium</td></tr>
</tbody>
</table>
```

### Recommended site structure

For the required "Recommended Website Structure" section (report-contract.md §6b). **Lead with an SVG visual tree diagram** (same self-contained inline-SVG technique as the seasonality chart — never a nested HTML `<ul>` tree, see the pagination note below for why), so the reader sees the architecture as an actual org-chart/site-map before any list. Status-code every node by fill color matched to a legend: **Build Now** (a confirmed, unbuilt page), **Optimize** (an existing page getting expanded/fixed), **Validate First** (a real candidate gated on inventory/offering confirmation — e.g. a species or product-line sub-page), **Supporting Content** (an informational/resource node), **Future/Conditional** (a longer-term or seasonal-gated branch). Keep the diagram bounded (a root node, one row of main pages, one shallow branch row for any page with real sub-pages) — SVG has none of the nested-HTML-list pagination risk documented below, since it renders as a single atomic image, but an overly tall/complex diagram is still hard to read on a printed page; if the real tree is large, show the top 2 levels in the diagram and move deeper branches to the `.cluster-card` detail below it.

**Never place a bare number next to a node (added 2026-08-17).** A raw number (e.g. a keyword-variant count) reads as monthly search volume to an unfamiliar reader. Where a variant count adds genuine value inside the diagram, spell it out in the node's own label text (e.g. `Oak — 55 keyword variants`, never `Oak — 55`) — or leave it out of the SVG entirely and keep it in the Primary Opportunity Matrix's Variant Count column, where it's already correctly labeled.

**Supporting-content to money-page relationship, shown as a directional flow (added 2026-08-17).** Where a content hub/cluster exists specifically to feed a commercial page (e.g. a buying-guide hub feeding "Trees for Sale"), connect them with a downward connector line and a small "supports" label rather than drawing them as visually equal sibling boxes — the reader must see the informational node feeding the commercial one, not competing with it:

```html
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="20" width="200" height="50" rx="6" fill="var(--scrolly-purple-soft)" stroke="var(--scrolly-purple)"/>
  <text x="140" y="50" text-anchor="middle" fill="var(--scrolly-ink)">Tree Buying Guide (Supporting)</text>
  <line x1="140" y1="70" x2="140" y2="120" stroke="var(--scrolly-purple)" stroke-width="2"/>
  <text x="155" y="98" fill="var(--scrolly-muted)" font-size="11">supports</text>
  <rect x="40" y="130" width="200" height="50" rx="6" fill="var(--scrolly-blue)"/>
  <text x="140" y="160" text-anchor="middle" fill="#fff">Trees for Sale (Money Page)</text>
</svg>
```

**After the diagram, use a flat, single-level `<ul class="site-structure">` for the main menu detail, never nested `<ul>` inside `<li>`.** An earlier nested-tree version reliably broke PDF pagination (Chromium's print engine refused to fragment the nested block, pushing the whole tree to a fresh page and leaving a large blank gap on the page before it — the same failure mode documented for `.section-dark` earlier in this file, but this one survived several CSS fixes because the trigger was the nesting itself, not a single fixable property). For any page that has its own sub-pages, add a separate `.cluster-card` box titled "Sub-Pages Under [Page Name]" right after the flat list — this also matches how most sites are actually structured (a short main menu, with real depth under only one or two sections), and reuses a component already proven to paginate cleanly.

```html
<ul class="site-structure">
  <li><div class="ss-page"><span class="ss-name">Home</span><span class="ss-type">Existing</span></div></li>
  <li><div class="ss-page"><span class="ss-name">Nursery / Garden Center</span><span class="ss-type">Money Page</span><span class="badge badge-retrieved">Confirmed</span><span class="badge badge-high">High Priority</span></div>
    <div class="ss-detail">Confirmed offering. Targets "plant nursery," "garden center."</div>
  </li>
  <li><div class="ss-page"><span class="ss-name">Trees for Sale</span><span class="ss-type">Money Page</span><span class="badge badge-retrieved">Confirmed</span><span class="badge badge-high">High Priority</span></div>
    <div class="ss-detail">Has sub-pages, see below.</div>
  </li>
  <li><div class="ss-page"><span class="ss-name">Landscape Design</span><span class="ss-type">Money Page</span></div></li>
</ul>

<div class="cluster-card">
  <div class="cc-pillar">Sub-Pages Under Trees for Sale</div>
  <ul class="cc-supporting">
    <li>Oak species pages</li>
    <li>Maple species pages</li>
  </ul>
</div>
```

Every menu item should carry, where applicable, `.ss-type` (Money/Service Page, Supporting Page, Location Page, Informational Resource, Hub) and a priority badge; use `.ss-detail` for a one-line purpose/keyword note. Whether a page is CONFIRMED or needs client verification uses the same badge system as everywhere else (`badge-retrieved`/`badge-observed` vs. `badge-inference`). If a recommended structure is unusually large (many branches with real sub-pages), use one `.cluster-card` per branch rather than trying to force it all into a single list or reintroducing nesting.

### Internal-linking strategy

For the required "Internal Linking Strategy" section. Plain relationship rows, not a graph — reads correctly at any number of relationships.

```html
<div class="link-map">
  <div class="lm-row"><span class="lm-from">"Best Trees for North Texas"</span><span class="lm-arrow">links to</span><span class="lm-to">Trees for Sale</span></div>
  <div class="lm-row"><span class="lm-from">"How Much Does Landscape Design Cost?"</span><span class="lm-arrow">links to</span><span class="lm-to">Landscape Design</span></div>
  <div class="lm-row"><span class="lm-from">Landscape Design</span><span class="lm-arrow">links to</span><span class="lm-to">Landscape Installation</span></div>
</div>
```

Open with one or two plain-English sentences on *why* internal linking matters (report-contract.md's Client Language Rules require this — most readers have never heard the term) before the component, e.g.: "Internal links help Google understand which pages are related and most important, and they guide potential customers from educational content toward the services they can buy." Every row must trace to an actual recommended page from the Site Structure section, never an invented one.

### Keyword universe funnel diagram (required, opens the keyword-depth section — added 2026-08-16)

For report-contract.md §7's Evidence Density requirement. One compact SVG diagram (viewBox pattern, no external assets — same technique as the seasonality chart below), teaching the actual progression from raw research to finished site, with the real count at each stage for this engagement:

```
Raw Keyword Universe (6,477 phrases)
  → Search Intent (commercial / informational / local / seasonal)
    → Keyword Clusters (grouped by shared intent)
      → Page Clusters (which cluster becomes which page)
        → Primary + Secondary Keywords (per page)
          → Supporting Content (where a real informational gap exists)
            → Site Architecture (the recommended structure, next section)
```

Render as a vertical or horizontal SVG flow with 5-7 labeled stages and the real number found at each (never invented — use "not separately counted this round" rather than a fabricated figure for a stage that wasn't measured). This single diagram is what answers report-contract.md's "why doesn't 6,477 keywords mean 6,477 pages" question visually before the grouped tables and cluster map below make it concrete.

### Grouped keyword evidence tables (required — added 2026-08-16)

Immediately after the funnel diagram, surface real keyword phrases grouped by theme (only themes with genuine evidence — never invent a category to fill a slot): Top Commercial Keywords, Top Local-Intent Keywords, category-specific groups relevant to this business (e.g. Top Nursery/Retail, Top Landscaping, Top Tree Keywords), Informational Questions, Seasonal Keywords (cross-reference §29 if applicable), High-Value Subclusters, a dedicated **Long-Tail Opportunities** group (per discover.md's Long-Tail Discovery Stage — Head/Mid-tail/Long-tail classification, low-volume-but-specific terms included, never discarded for low/zero reported volume alone), and any Unexpected Opportunity worth flagging (a surprising sub-cluster the research surfaced). Standard `<table>` is fine here (short cell content — a keyword, a volume figure or "not tested," an intent label, a tail-length label). **Show volume/CPC/difficulty only where it was genuinely retrieved; show the bare phrase, honestly, where it wasn't** — never blend a real number and an absent one without the reader being able to tell which is which.

```html
<table>
<thead><tr><th>Keyword</th><th>Volume</th><th>Intent</th><th>Tail Length</th></tr></thead>
<tbody>
<tr><td>landscaping</td><td>165,000/mo (National)</td><td>Commercial</td><td>Head</td></tr>
<tr><td>trees for sale near me</td><td>Not separately volume-tested this round</td><td>Transactional</td><td>Mid-tail</td></tr>
<tr><td>20 ft palm trees for sale Wills Point</td><td>Not separately volume-tested this round</td><td>Transactional</td><td>Long-tail</td></tr>
</tbody>
</table>
```

### Primary Opportunity Matrix (required, replaces a bare cluster-name list — added 2026-08-16, renamed and consolidated 2026-08-17)

The core evidence-of-depth component for report-contract.md §7, and now the single table carrying cluster identity, demand, visibility, and competition together (§8/§10 reference it by cluster name rather than re-tabulating). For every real cluster (including a validate-first sub-cluster like a species or product-line breakdown), one `.matrix-card` (see the Matrix card component) with: Cluster · Primary Keyword · Best Secondary/Long-Tail Keywords · Intent · Local/Regional Demand (catchment-ordered where geographically bound) · Current Visibility · Competition/Difficulty · Recommended Page · Priority, plus Variant Count only where genuinely useful (always labeled, e.g. "953 real phrase variants," never a bare number). Follow immediately with a short "why one page, not many" callout using the same worked example, e.g.: *"953 real 'trees for sale' phrase variants exist in this research. They target the same buying intent, so they become one strong page, not 953 pages. A sub-cluster like oak or palm may earn its own page later, but only if inventory, demand, and differentiation justify it — that's a Validate First action, not a default."*

### Keyword cluster summary table (required, comes BEFORE detail cards)

For report-contract.md §7. **The reader sees the whole opportunity landscape before the highest-priority detail — the forest before the trees.** This table covers every major cluster (not just the highest-priority ones); the detailed kwcluster-cards below it then zoom into the top few. Every volume figure needs an explicit geography label (see report-contract.md §7's geography rule) — never let a national and a local figure sit in the same column without the reader being able to tell which is which at a glance.

```html
<table class="kw-summary-table">
<thead><tr><th>Cluster</th><th>Representative Searches</th><th>Demand Signal</th><th>Intent</th><th>Current Visibility</th><th>Recommended URL</th><th>Priority</th></tr></thead>
<tbody>
<tr><td>Nursery / Garden Center</td><td>plant nursery, garden center</td><td>90,500/mo (national)</td><td>Local, transactional</td><td>Not present</td><td><code>/nursery-garden-center/</code></td><td>High</td></tr>
</tbody>
</table>
```

### Keyword cluster card (demand-to-page mapping, detail tier)

For report-contract.md §7, Keyword Opportunity Analysis. **This is a different object from the topic/content cluster card below it** — it maps related search demand to one page; it never lists proposed article titles. Reuses the blueprint-card's `dl`-based spec layout for a compact, consistent look. Build full detail cards for the highest-priority clusters only (the summary table above already covers every cluster).

```html
<div class="kwcluster-card">
  <div class="kwc-title">Trees for Sale</div>
  <dl class="kwc-spec">
    <dt>Search Intent</dt><dd>Transactional</dd>
    <dt>Primary Keyword</dt><dd>trees for sale</dd>
    <dt>Related Searches</dt><dd>trees for sale near me &middot; large trees for sale &middot; mature trees for sale &middot; shade trees for sale</dd>
    <dt>Recommended URL</dt><dd><code>/trees-for-sale/</code></dd>
  </dl>
  <p class="kwc-implementation">These searches are closely related enough to target together with one strong commercial page rather than creating a separate page for every keyword variation.</p>
</div>
```

**Field renamed 2026-08-16:** "Recommended Destination" → **"Recommended URL"** — the client should immediately understand this is the page path being recommended, not an ambiguous "destination." Use "Recommended URL" in every instance of this component going forward.

Build one full card for each highest-priority commercial cluster — do not build one for every keyword, only for genuine clusters worth their own page. Close the section with a plain-language line making the consolidation point explicit, e.g. "6,477 keywords do not mean 6,477 pages — clustering is how that demand gets organized into a manageable site."

### Topic/keyword cluster card

For "Keyword & Topic Clusters" and "Content Growth Strategy" (report-contract.md §6-§7 area). Replaces a flat blog-idea list — one card per cluster.

```html
<div class="cluster-card">
  <div class="cc-pillar"><span class="badge badge-high">Pillar / Money Page</span> Trees for Sale</div>
  <p>Search intent: transactional. Why it matters: the largest keyword cluster found in this engagement.</p>
  <div class="cc-label">Supporting articles</div>
  <ul class="cc-supporting">
    <li>Best Trees for North Texas</li>
    <li>Fast-Growing Shade Trees for Texas</li>
    <li>Mature vs. Young Trees: What to Buy</li>
  </ul>
</div>
```

### Glossary / plain-English definitions

Two patterns, use both where relevant per report-contract.md's Client Language Rules:

**Inline, first use of a term:**
```html
<p><span class="def-term">Keyword cluster</span>: a group of closely related searches that can usually be targeted by one strong page rather than a separate page for every keyword.</p>
```

**Upfront glossary card**, for a handful of terms used repeatedly through the report (place near the Executive Summary):
```html
<div class="glossary-card">
  <h4>A Few Terms Used in This Report</h4>
  <dl>
    <dt>SERP</dt><dd>Search Engine Results Page. What someone sees after they search.</dd>
    <dt>Schema</dt><dd>Structured data added to a page's code that helps search engines understand exactly what it's about.</dd>
    <dt>Crawlability</dt><dd>Whether search engines can actually reach and read a page at all.</dd>
  </dl>
</div>
```

### Scope-of-analysis chips

For the Executive Summary, replaces a bare "N checks completed" claim with the actual categories analyzed. List only what was genuinely run for this engagement; dashed/gray `.gap` chips mark categories not evaluated this round (methodology gap, stated plainly, never hidden).

```html
<div class="chip-row">
  <span class="scope-chip"><span class="sc-dot"></span>Search Demand</span>
  <span class="scope-chip"><span class="sc-dot"></span>Current Google Visibility</span>
  <span class="scope-chip"><span class="sc-dot"></span>Technical SEO</span>
  <span class="scope-chip gap"><span class="sc-dot"></span>Core Web Vitals (data unavailable this round)</span>
</div>
```

### Break-even / implementation-economics display

For "Traffic / Lead / Business-Value Scenarios" (report-contract.md §21) when framing the value of implementation (report §18-area "Is Organic Search Worth the Investment?"). Never fill in a dollar figure the client hasn't provided.

```html
<div class="calc-box">
  <div class="cb-formula">Implementation cost &divide; average profit per new customer = customers needed to break even</div>
  <div class="cb-note">Based on your website's listed landscape-design project pricing (tier 2 &mdash; client-specific economics weren't provided this round). Actual figures may vary; ask us to recompute with your real numbers.</div>
</div>
```

**4-tier fallback disclosure, required in the note (revised 2026-08-17, per report-contract.md §21).** The `.cb-note` always states which tier produced the figure shown: client-provided, client website pricing, industry benchmark, or a clearly labeled assumption — never a bare number with no source stated. When tier 1 (client-provided) is used, the note simply states the figure came from the client's own numbers.

### Investment-level badge

For "Is Organic Search Worth the Investment?" (replaces the old binary Go/Selective-Go/Hold/No-Go verdict — see report-contract.md §1). Reuses the existing badge system, no new CSS:

```html
<span class="badge badge-high">High Priority</span>
<span class="badge badge-medium">Moderate Priority</span>
<span class="badge badge-outline">Foundational</span>
<span class="badge badge-high">Aggressive Growth Opportunity</span>
```

### Page blueprint (full detail — highest-priority pages only)

For report-contract.md §6b's Page Blueprints requirement. **Tier the depth to priority** — this full card is for the highest-priority CREATE/OPTIMIZE/EXPAND pages only.

```html
<div class="blueprint-card">
  <div class="bp-title"><span class="badge badge-high">High Priority</span> Nursery / Garden Center</div>
  <div class="bp-url">/nursery-garden-center/</div>
  <dl class="bp-spec">
    <dt>Search Intent</dt><dd>Local transactional</dd>
    <dt>Primary Keyword</dt><dd>plant nursery</dd>
    <dt>Suggested Title</dt><dd>Plant Nursery &amp; Garden Center in Wills Point, TX | Mulberry Creek</dd>
    <dt>Suggested Meta</dt><dd>Browse trees, shrubs &amp; plants at our Wills Point nursery. Local, in-person selection with expert advice.</dd>
    <dt>Recommended H1</dt><dd>Your Wills Point Plant Nursery &amp; Garden Center</dd>
  </dl>
  <div class="bp-label">Suggested page outline</div>
  <ol class="bp-outline">
    <li>Intro: what makes this nursery different, service area</li>
    <li>H2: Plants, Trees &amp; Shrubs We Carry</li>
    <li>H2: Why Buy Local</li>
    <li>H2: Visit Us / Hours</li>
    <li>FAQ</li>
    <li>Final CTA: Visit or Call</li>
  </ol>
  <div class="bp-label">Also needed</div>
  <ul class="bp-extras">
    <li>Real photos of inventory and the property (not stock images)</li>
    <li>Reviews/testimonials block</li>
    <li>LocalBusiness schema</li>
  </ul>
</div>
```

For lower-priority pages, use a compact table row instead of a full card — same information, much less space:

```html
<table class="blueprint-lite">
<thead><tr><th>Page</th><th>Intent</th><th>Primary Keyword</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Shrubs, Perennials &amp; Flowering Plants</td><td>Commercial</td><td>flowering shrubs</td><td>Confirmed by existing site copy</td></tr>
</tbody>
</table>
```

### Anatomy of a search-optimized page (redesigned 2026-08-16 — one page, webpage mockup)

One static, reusable educational diagram (report-contract.md §6b) — write it once, reuse the same HTML unchanged across every client. **Must fit on one page.** The earlier version (a tall vertical stack of colored label bubbles connected by arrows) ran long and read as visually tiring — this version instead looks like an actual webpage with numbered callouts, so the concept lands in seconds rather than requiring the reader to scroll through eleven bubbles.

Structure: one small "Google result" snippet mockup (title/meta — these don't appear on the page itself, so they sit outside the page-mockup box, clearly labeled as such), then one `.page-mockup` box styled like a browser window containing a nav bar and eleven numbered content rows in actual page order. Each row pairs a numbered circle with a miniature visual preview of that page element (not just a text label) plus a one-line explanation — a reader recognizes "oh, that's a webpage" immediately rather than decoding an abstract diagram.

```html
<div class="serp-snippet">
  <div class="serp-label">What Google shows before anyone clicks (doesn't appear on the page itself)</div>
  <div class="serp-title">Landscape Design Services in Wills Point, TX | Mulberry Creek</div>
  <div class="serp-url">mulberrycreektx.com &rsaquo; landscape-design</div>
  <div class="serp-desc">Professional landscape design for Wills Point &amp; surrounding areas. See our process and get a quote.</div>
</div>

<div class="page-mockup">
  <div class="pm-browser-bar"><span></span><span></span><span></span></div>
  <div class="pm-nav"><span class="pm-logo">Business Logo</span><span class="pm-navlinks">Home &nbsp; Services &nbsp; About &nbsp; Contact</span></div>
  <div class="pm-body">
    <div class="pm-row"><span class="pm-num">1</span><div class="pm-preview pm-h1-preview">Your Main Page Headline</div><div class="pm-desc"><strong>H1</strong> &mdash; the one clear headline stating what this page is</div></div>
    <div class="pm-row"><span class="pm-num">2</span><div class="pm-preview pm-text-preview"></div><div class="pm-desc"><strong>Intent-matching intro</strong> &mdash; confirms in the first few lines this page has what the visitor searched for</div></div>
    <div class="pm-row"><span class="pm-num">3</span><div class="pm-preview pm-cta-preview">Get a Quote &rarr;</div><div class="pm-desc"><strong>Primary CTA</strong> &mdash; a clear next step, visible without scrolling</div></div>
    <div class="pm-row"><span class="pm-num">4</span><div class="pm-preview pm-section-preview"></div><div class="pm-desc"><strong>H2 content sections</strong> + real images &mdash; the real substance, actual photos, not stock art</div></div>
    <div class="pm-row"><span class="pm-num">5</span><div class="pm-preview pm-proof-preview">&#9733;&#9733;&#9733;&#9733;&#9733; &ldquo;Great experience&rdquo;</div><div class="pm-desc"><strong>Proof / reviews / credentials</strong> &mdash; why a visitor should trust this business</div></div>
    <div class="pm-row"><span class="pm-num">6</span><div class="pm-preview pm-text-preview short"></div><div class="pm-desc"><strong>Local relevance</strong> &mdash; service area, location-specific detail where applicable</div></div>
    <div class="pm-row"><span class="pm-num">7</span><div class="pm-preview pm-faq-preview">+ &nbsp;Question one<br>+ &nbsp;Question two</div><div class="pm-desc"><strong>FAQ</strong> &mdash; answers the questions a real customer would still have</div></div>
    <div class="pm-row"><span class="pm-num">8</span><div class="pm-preview pm-related-preview"><span></span><span></span><span></span></div><div class="pm-desc"><strong>Related services / products</strong> &mdash; keeps visitors exploring instead of leaving</div></div>
    <div class="pm-row"><span class="pm-num">9</span><div class="pm-preview pm-links-preview">Related: Link &middot; Link &middot; Link</div><div class="pm-desc"><strong>Internal links</strong> &mdash; connects to other relevant pages on the site</div></div>
    <div class="pm-row"><span class="pm-num">10</span><div class="pm-preview pm-cta-preview final">Ready to get started? &nbsp;Contact Us &rarr;</div><div class="pm-desc"><strong>Final CTA</strong> &mdash; one last clear invitation to take action</div></div>
  </div>
</div>
```

### Mini page-blueprint wireframe (top commercial/money pages only — added 2026-08-17)

For report-contract.md §6b's mini visual page blueprints. Reuses the Anatomy-of-a-page diagram's visual language (`.page-mockup`/`.pm-row` browser-window mockup) at a smaller, per-page scale — this is NOT the one static reusable Anatomy diagram; it's a compact, personalized mockup for one specific top-priority CREATE/OPTIMIZE page, populated from that page's own existing Page Blueprint content. **Reserve this for genuine top-priority commercial/money pages (e.g. a nursery/garden-center page, a primary service page) — never for every blueprint, and never for blog/supporting content.** Every field must come from the page's existing full `.blueprint-card` — this component never introduces a second, independently-invented set of recommendations for the same page.

```html
<div class="serp-snippet">
  <div class="serp-label">Suggested Google result</div>
  <div class="serp-title">Plant Nursery &amp; Garden Center in Wills Point, TX | Mulberry Creek</div>
  <div class="serp-url">mulberrycreektx.com &rsaquo; nursery-garden-center</div>
  <div class="serp-desc">Browse trees, shrubs &amp; plants at our Wills Point nursery. Local, in-person selection with expert advice.</div>
</div>

<div class="page-mockup compact">
  <div class="pm-browser-bar"><span></span><span></span><span></span></div>
  <div class="pm-body">
    <div class="pm-row"><span class="pm-num">1</span><div class="pm-desc"><strong>URL</strong> &mdash; <code>/nursery-garden-center/</code></div></div>
    <div class="pm-row"><span class="pm-num">2</span><div class="pm-desc"><strong>H1</strong> &mdash; Your Wills Point Plant Nursery &amp; Garden Center</div></div>
    <div class="pm-row"><span class="pm-num">3</span><div class="pm-desc"><strong>Intro</strong> &mdash; what makes this nursery different, service area</div></div>
    <div class="pm-row"><span class="pm-num">4</span><div class="pm-desc"><strong>H2 sections</strong> &mdash; Plants/Trees/Shrubs We Carry &middot; Why Buy Local &middot; Visit Us/Hours</div></div>
    <div class="pm-row"><span class="pm-num">5</span><div class="pm-desc"><strong>Primary CTA</strong> &mdash; Visit or Call</div></div>
    <div class="pm-row"><span class="pm-num">6</span><div class="pm-desc"><strong>Proof</strong> &mdash; reviews/testimonials block</div></div>
    <div class="pm-row"><span class="pm-num">7</span><div class="pm-desc"><strong>Local relevance</strong> &mdash; Wills Point service area detail</div></div>
    <div class="pm-row"><span class="pm-num">8</span><div class="pm-desc"><strong>Media needed</strong> &mdash; real photos of inventory/property, not stock images</div></div>
    <div class="pm-row"><span class="pm-num">9</span><div class="pm-desc"><strong>FAQ</strong> &mdash; from the mapped conversational questions (Part V)</div></div>
    <div class="pm-row"><span class="pm-num">10</span><div class="pm-desc"><strong>Related services / internal links</strong> &mdash; Trees for Sale, Landscape Design</div></div>
    <div class="pm-row"><span class="pm-num">11</span><div class="pm-desc"><strong>Schema</strong> &mdash; LocalBusiness</div></div>
    <div class="pm-row"><span class="pm-num">12</span><div class="pm-desc"><strong>Final CTA</strong> &mdash; Visit or Call</div></div>
  </div>
</div>
```

This is strategy/specification, matching the full Page Blueprint's own scope boundary — never finished page copy.

### Directional Impact / Opportunity Scenarios (Conservative / Base / Upside — added 2026-08-17)

For report-contract.md §21a. Three cards, one row, labeled by degree — never a promised outcome. Quantify only where the underlying evidence supports it; otherwise state the scenario qualitatively inside the same card shape.

```html
<div class="kpi-row">
  <div class="kpi-card"><div class="kpi-label">Conservative</div><div class="kpi-num">Modest gain</div><div class="kpi-label">Minimal ranking movement, foundational fixes only</div></div>
  <div class="kpi-card teal"><div class="kpi-num">15&ndash;30</div><div class="kpi-label">Base / Plausible &mdash; if this page reached page-1 local pack and captured an estimated 10&ndash;15% of measured local demand, that would imply roughly 15&ndash;30 monthly contacts</div></div>
  <div class="kpi-card violet"><div class="kpi-num">40+</div><div class="kpi-label">Upside &mdash; if the full recommended structure is built and ranks well across the core + secondary markets</div></div>
</div>
```

Every quantified card states its own assumption inline, in the card text itself, not in a separate footnote a reader might miss.

### Implementation workbook (printable, checkbox-driven — added 2026-08-17)

For report-contract.md's Implementation Workbook requirement (Part VII). **This operationalizes the Priority Matrix/Page Blueprints/GBP/technical findings — it never invents a recommendation not already made elsewhere in the report.** One `.workbook-phase` per roadmap phase (reuse the same phase labels already generated for the Priority Matrix/Roadmap — do not reintroduce a fixed 30/60/90 template here either), containing `.wb-task` blocks and, where a Validate First item needs a client answer, a `.wb-decision` block.

```html
<div class="workbook-phase">
  <div class="wp-title">Days 1&ndash;30: Fix the Foundation</div>
  <p class="wp-dek">Print this page. Check items off as you complete them.</p>

  <div class="wb-task">
    <div class="wb-check-row"><span class="wb-box">&#9744;</span><span class="wb-action">Update the homepage title tag</span></div>
    <dl class="wb-spec">
      <dt>Why</dt><dd>Currently generic, no business name or location (Part III, Website Health)</dd>
      <dt>Exact Task</dt><dd>Replace with: [the actual recommended title from the relevant finding/blueprint]</dd>
      <dt>Owner</dt><dd>You, or your web developer</dd>
      <dt>Input Needed From You</dt><dd>None &mdash; ready to implement as written</dd>
      <dt>Deliverable</dt><dd>Updated &lt;title&gt; tag live on the homepage</dd>
      <dt>Success Criteria</dt><dd>View page source and confirm the new title appears</dd>
      <dt>When To Check</dt><dd>Immediately after publishing</dd>
    </dl>
  </div>

  <div class="wb-decision">
    <div class="wd-q">Do you actually sell palm trees?</div>
    <div class="wd-options"><span>&#9744; Yes</span><span>&#9744; No</span><span>&#9744; Seasonal / limited</span><span>&#9744; Need to confirm</span></div>
    <p class="wd-note">Unlocks or eliminates the Palm Trees Validate First item in Part II's Keyword Cluster &rarr; Page Map.</p>
  </div>
</div>
```

`&#9744;` (☐) is the printable checkbox character — plain Unicode, no interactivity needed since this is meant to be printed and checked by hand. Every `wb-task`'s Exact Task/Deliverable content must trace to a specific finding, Page Blueprint, or Priority Matrix row elsewhere in the report — cite it inline if helpful, never re-derive it independently. Every gated (Validate First) item gets exactly one `.wb-decision` block; its outcome is stated to visibly unlock/eliminate the corresponding item, never left disconnected from the rest of the report.

**Later phases stay just as specific as the first (added 2026-08-17, per report-contract.md §23a).** A Days-61-90-or-later `.wb-task` must never read as generic "monitor and optimize" — use the same `.wb-spec` fields, populated with the page/cluster-specific signal to check (e.g. `<dt>What Signal To Look For</dt><dd>Are "trees for sale near me" and species-modifier queries appearing in Search Console impressions yet? Which terms are sitting in positions 8-20?</dd>`), not a placeholder like "continue monitoring performance."

### Priority implementation matrix

For report-contract.md §23. A plain Markdown table is auto-styled — no special class needed. Use `highlight-row` (report-design-system.md's existing table convention) on the single highest-priority row if one should stand out.

```
| Priority | Action | Deliverable | Why | Impact | Effort | Dependencies | Timing |
|---|---|---|---|---|---|---|---|
| High | Build Nursery/Garden Center page | New page per blueprint above | Largest confirmed visibility gap | High | Medium | Inventory photos from client | Days 31-60 |
```

### Measurement plan

For report-contract.md §27's baseline-vs-post-access distinction — two `.scorecard-grid`-style blocks (or a two-column `tint-block` pair) side by side, labeled "Baseline Available Now" and "Measurable After GSC/GA4/GBP Access," reusing the existing scorecard-grid/tint-block components rather than a new one.

### Seasonality chart (build per-engagement, only when triggered)

For report-contract.md §29's Seasonal Search Opportunities section (Part VI, Additional & Conditional Opportunities — this section must not appear earlier and interrupt the core demand → foundation → build → discovery narrative, no matter how dramatic the numbers look). **Only chart values actually retrieved — never interpolate or invent a monthly series that wasn't researched, and never imply a multi-year trend from a single year of data.** Lead with the finding, not the chart:

**BIG FINDING** (one sentence, the number itself, in a `.stat-callout`) → **CHART** → **WHAT IT MEANS** (one short callout, explicitly scoped: this is broad-geography demand, not the client's capturable volume, and ranking/feasibility still requires deeper validation) → **competitive reality** → **limitations/feasibility note**.

**Preferred form: a trend line, X-axis = month/date, Y-axis = search volume**, with actual month labels — plot every point the research actually retrieved for a representative term or two, connected by a line, with each point's real value labeled. If the underlying research only captured two points per term (e.g. one off-season month and one peak month), plot exactly those two points connected by one line segment — that is still an honest trend line, just a short one; do not fabricate intermediate months to make the curve look fuller. If multiple years of monthly history exist, use them (e.g. one line per year); if they don't, a single year's two-or-more retrieved points is the correct, complete chart — do not invent a second year. If volumes across terms differ by orders of magnitude, feature the one or two most dramatic terms in the chart itself and put every term's numbers in a compact table underneath for completeness:

```
| Search Term | [Month] Volume | [Month] Volume | Peak Month |
|---|---|---|---|
```

No fixed CSS component for the plot itself (the term count, point count, and value range differ too much per engagement) — hand-build the SVG per report (a polyline or a sequence of short line segments plus point markers and value labels), keep it inside a `<div class="season-chart">` wrapper for consistent padding/border, and reuse `.callout` for the "what it means" takeaway immediately below it.

### 29-point coverage index (required closing section of the main report)

For report-contract.md's "Customer-facing coverage index" requirement. A single table, one row per numbered area in report-contract.md, using the client-friendly status vocabulary from that requirement (never internal tooling/budget language):

```html
<table class="coverage-table">
<thead><tr><th>#</th><th>Analysis Area</th><th>Result / Status</th><th>Where to Find It</th></tr></thead>
<tbody>
<tr><td>1</td><td>Executive Opportunity Summary</td><td><span class="badge badge-strong">Completed</span></td><td>Part I</td></tr>
<tr><td>2</td><td>Current Wins</td><td><span class="badge badge-strong">Completed</span></td><td>Part II</td></tr>
</tbody>
</table>
```

Reuse the existing badge classes for status color (`badge-strong` for Completed/No Material Issue Found, `badge-high`/`badge-critical` for Issue Found, `badge-needswork` for Opportunity Found, `badge-pending` for Pending Validation/Requires Client Access, `badge-outline` for Partially Evaluated/Conditional). `.coverage-table` applies tighter row padding than a standard table so 29 rows stay skimmable rather than sprawling across several pages.

### Quick Wins table

For report-contract.md §22. A plain table is sufficient and auto-styled — no special component needed:

```
| Action | Why | Impact | Effort | Timing |
|---|---|---|---|---|
| Fix the missing meta description | Google is currently left to guess what to show searchers | Medium | Low | This week |
```

Keep this list short (roughly 5-7 items) and limited to genuinely low-dependency, immediately actionable items — this is the report's most skimmable section by design, not a place to reprint the full priority matrix.

### Badge / pill density (design discipline, not a new component)

Badges exist to carry a genuine status signal, not to decorate every line. Before finalizing a section, check whether any single item is carrying three or more stacked badges — if the second and third aren't adding new information (e.g. a page marked "Confirmed" that's also marked "High Priority" that's also color-coded amber, all saying roughly the same thing three ways), drop the redundant one. Site-structure list items in particular should default to **at most one status badge** unless a second genuinely different fact needs signaling (e.g. offering-confirmation status *and* priority tier are both new information; two badges that are both restating priority are not). Favor white space and plain text over an additional pill wherever the badge wouldn't teach the reader anything the surrounding text doesn't already say.

### Stat callout

For any genuinely noteworthy single number — used throughout the report wherever a strong quantitative finding would otherwise be buried inside a paragraph (report-contract.md's Report Design Principles). **Use only when the evidence is genuinely noteworthy** — do not fill the report with stat callouts for unremarkable numbers; that dilutes the ones that matter.

```html
<div class="stat-callout teal">
  <div class="sc-num">6,477</div>
  <div class="sc-text"><strong>Unique keyword phrases found</strong> across your nursery/retail and landscaping lines &mdash; 5,402 of them relate to the nursery/retail side of the business, your largest single opportunity.</div>
</div>
```

Color follows the section's eyebrow color (`.blue`, `.teal`, `.pink`, `.violet`).

### Quote / source callout

For a direct, useful customer/site/source statement, where relevant — distinct from the existing footnote-style `.cite`/`.source-list` pattern, which is for citing a data source inline, not for setting a quoted statement apart visually.

```html
<div class="quote-callout">
  "Placeholder image for ABOUT" &mdash; alt text found on the homepage's about-section image, evidence of unreplaced template content.
  <span class="qc-source">Source: Technical SEO audit, mulberrycreektx.com, 2026-08-10</span>
</div>
```

### Search Data at a Glance table

Required near the front of the report (Part I, immediately after or alongside the Executive Summary) — a personalized, high-density fact table using only figures already established elsewhere in the report. This is what makes the report feel data-driven within the first minute.

```html
<table class="glance-table">
<thead><tr><th>Finding</th><th>Result</th><th>Why It Matters</th></tr></thead>
<tbody>
<tr><td>Unique keyword phrases found</td><td>6,477</td><td>Broad search universe</td></tr>
<tr><td>Nursery/retail-related phrases</td><td>5,402</td><td>Largest opportunity area</td></tr>
<tr><td>Landscape Design local-pack position</td><td>#1</td><td>Existing proven visibility</td></tr>
<tr><td>Nursery local-pack visibility</td><td>0 of markets tested</td><td>Major confirmed gap</td></tr>
</tbody>
</table>
```

Only include facts already supported elsewhere in the report — this table summarizes, it never introduces a new unverified claim. `.glance-table` right-aligns and bolds the Result column so the numbers read at a glance.

### AI Search Readiness (umbrella — redesigned 2026-08-16, report-contract.md §16-§17)

One Part V umbrella covering two conceptually distinct, clearly labeled subsections — never blur them together:

1. **AI Discovery & Platform Visibility** — did the business actually get mentioned/recommended/cited when real platforms were queried. This is presence-testing, and it stays honestly "Not Evaluated" when untested (see the AI Discovery scorecard below, essentially unchanged from before).
2. **AI Search Readiness & Optimization** — independent of whether platform testing happened, this is a real, evidence-based assessment of the *factors* that make a business easy for any AI system to understand, trust, and cite. This subsection is never "Not Evaluated" wholesale just because platform testing wasn't — most of its inputs (schema, page content, entity consistency, third-party corroboration) are directly checkable from evidence already gathered elsewhere in the report (Categories H, I, D).

#### AI Discovery scorecard (platform-visibility testing)

**The platform column list is configurable per engagement — never hard-code a fixed platform set into the template.** Populate a cell only when that platform was genuinely tested this round.

```html
<table class="ai-scorecard">
<thead><tr><th>Query / Intent</th><th>ChatGPT</th><th>Perplexity</th><th>Gemini</th><th>Grok</th><th>Google AI</th><th>Key Observation</th></tr></thead>
<tbody>
<tr><td>Best plant nursery near Wills Point, TX</td><td><span class="badge badge-pending">Not Evaluated</span></td><td><span class="badge badge-pending">Not Evaluated</span></td><td><span class="badge badge-pending">Not Evaluated</span></td><td><span class="badge badge-pending">Not Evaluated</span></td><td><span class="badge badge-pending">Not Evaluated</span></td><td>Multi-platform AI testing requires either paid AI-search API access or manual per-platform testing, neither performed this round.</td></tr>
</tbody>
</table>
```

**When no multi-platform testing was performed this round, every cell reads "Not Evaluated" — never a simulated, inferred, or "likely" result.** The query/intent rows themselves should still be real, drawn from the client's actual keyword/business research (not generic placeholder questions), so the scorecard's *structure* still teaches the client what a funded or future round would check.

#### AI Search Readiness scorecard (optimization factors — new component)

Reuses `.scorecard-grid`/`.scorecard-row`, rated only where this engagement's evidence actually supports a rating (per discover.md Category M's 7-dimension framework): Entity Clarity, Website Extractability, Third-Party Corroboration, Expertise/Experience Signals, Structured Data, Conversational Query Coverage, Local Authority (where applicable). Follow with a **Now / Next / Later** action list (reuse `.tint-block` or a small ordered list) — concrete, evidence-based steps, never a generic "add more schema" filler item.

```html
<div class="scorecard-grid">
  <div class="scorecard-row"><span class="sc-name">Entity Clarity</span><span class="badge badge-needswork">Needs Work</span></div>
  <div class="scorecard-row"><span class="sc-name">Website Extractability</span><span class="badge badge-needswork">Needs Work</span></div>
  <div class="scorecard-row"><span class="sc-name">Third-Party Corroboration</span><span class="badge badge-outline">Not Evaluated This Round</span></div>
  <div class="scorecard-row"><span class="sc-name">Structured Data</span><span class="badge badge-critical">Critical Gap</span></div>
</div>
```

**Ethical guardrail, non-negotiable:** third-party corroboration recommendations must only ever describe legitimate participation (answering real questions transparently, earning genuine mentions, encouraging real customers to share real experiences, authentic community/trade/PR involvement). **Never recommend or imply fabricated reviews, fake forum/Q&A threads, astroturfing, or any simulated third-party content** — this is a hard line, not a style preference.

### Pagination — the stranded-header lesson (documentation, no new component)

Two separate print-pagination bugs have hit this stylesheet so far, both worth understanding before touching the CSS again:

1. **Tall components with `break-inside: avoid`** (the original site-structure/anatomy-diagram bug) — if a component taller than the remaining page space is told never to fragment, Chromium jumps it whole to a fresh page, stranding a blank gap on the page before it. Fix: only apply `break-inside: avoid` to components that are reliably short (a single card, a single table row, a compact bounded diagram) — never to a component whose height varies with content length.
2. **Section headers stranded from their content** (found 2026-08-16) — even with `.section-opener` itself protected by `break-inside: avoid`, nothing stopped the browser from placing that small, valid block as the very last thing on a page while its actual content (which didn't fit) started fresh on the next page. A heading's own `break-after: avoid` only protects content still inside the same element — it has no effect on the boundary between that element and its next sibling. Fix: `.section-opener { break-after: avoid; }`, which tells the engine not to break immediately after a section-opener, pushing the whole header+content pairing together.

Both lessons point the same direction: **short, bounded components get `break-inside`/`break-after: avoid` freely; tall or variable-height components never do.**

**Fourth lesson, and a standing rule (2026-08-16, after visual PDF QA still found orphaned section-openers and Parts not starting on fresh pages despite the fixes above).** Two deterministic rules, not soft hints, now apply everywhere:
- **Every major Part starts on its own page.** `.part-divider ~ .part-divider { break-before: page; }` — deliberately scoped to exclude the first Part (Part I already opens on its own page because `.cover` forces a break after itself, and forcing Part I too would strand the "About This Report" callout alone between them).
- **A section-opener's very next sibling may never break away from it**, reinforcing lesson 2 from the opposite direction: `.section-opener + * { break-before: avoid; }`. Two converging signals (break-after on the opener, break-before on what follows) are more reliable than one, consistent with lesson 3's finding that single `avoid` hints degrade in a long, dense document.

**Standing QA requirement, not just a CSS fix:** given lesson 3's finding that overall pagination can be sensitive to small changes anywhere in a large report for reasons never fully isolated, CSS rules alone are not sufficient assurance. **Every rendered PDF must be visually inspected page by page before delivery** (font size, clipping, page breaks, table readability, orphaned headings) — this is a required QA step per report-contract.md's Final Quality Gate, not optional polish. If a specific orphan/break issue is found on a specific component, prefer the deterministic `break-before: page` fix proven in lesson 3 over further `avoid`-tuning.

**Third lesson (2026-08-16) — this document's overall pagination became measurably fragile.** After the site-structure and section-opener fixes above, a small, unrelated content edit late in one report caused the total page count to jump from 21 to 29, with a site-structure list rendering only its first item before continuing on the next page (an "orphaned single item," a variant of lesson 1/2 above). Direct experiments ruled out the specific edit's content, the `break-after:avoid` rule, and `font-display` font-load timing as the sole cause — the honest conclusion is that a long, component-dense report (12+ tables/cards, 25+ section-openers, each individually break-protected) can land in a pagination state that's sensitive to small changes anywhere in the document, for reasons not fully isolated. **The reliable fix that worked:** for the specific component that was orphaning (the site-structure list), force a deterministic full-page break before it (`break-before: page`) rather than relying on `avoid`-style soft hints that depend on exact remaining-space arithmetic. This trades a small amount of page efficiency for a guaranteed-correct render. If a similar orphaned-item symptom appears in a future report on a different component, prefer this same deterministic approach over more `avoid` tuning, which has proven unreliable once the document is already large and dense.

### Typography floor (2026-08-16, required)

**10pt is the normal body-text minimum.** Table/card content the client is meant to actually read targets **9.5–10pt**. **9pt is the absolute smallest size permitted anywhere in the document**, reserved only for genuine captions, footnotes, or very minor metadata (a chart axis label, a source citation) — never for primary content. **If a table cannot fit its content at this floor, redesign it** — split it into two tables, or convert it to the `.matrix-card` stacked-card pattern below. Shrinking text to fit a table is never an acceptable fix. `automation/report-theme/scrolly-report.css` enforces this floor directly (every `font-size` declaration below 9pt was audited and raised 2026-08-16); do not reintroduce a sub-9pt value when adding new components.

### Matrix card (stacked-table fallback)

Use whenever a table would need 8+ columns, or a column's real content (e.g. a list of secondary/related keywords) is too long to stay readable in a table cell at the type floor above. Lay multiple cards in `.matrix-grid` for a 2-column responsive layout so density stays comparable to a table.

```html
<div class="matrix-grid">
  <div class="matrix-card">
    <div class="mc-title">Trees for Sale <span class="badge badge-high">High Priority</span></div>
    <dl class="mc-spec">
      <dt>Primary Keyword</dt><dd>trees for sale</dd>
      <dt>Best Secondary / Long-Tail Keywords</dt><dd>trees for sale near me (Mid-tail) &middot; large trees for sale (Mid-tail) &middot; 20 ft palm trees for sale Wills Point (Long-tail)</dd>
      <dt>Intent</dt><dd>Transactional</dd>
      <dt>Variant Count</dt><dd>953 real phrase variants identified</dd>
      <dt>Local/Regional Demand</dt><dd>Not separately volume-tested this round</dd>
      <dt>Current Visibility</dt><dd>Not present</dd>
      <dt>Competition/Difficulty</dt><dd>Pending Validation</dd>
      <dt>Recommended Page</dt><dd><code>/trees-for-sale/</code></dd>
      <dt>Action</dt><dd>Build Now</dd>
      <dt>Priority</dt><dd>High</dd>
    </dl>
  </div>
</div>
```

This is the required format for report-contract.md §7's Primary Opportunity Matrix (see above) — never force that many fields into a single wide table.

---

## Header / footer

Interior-page header/footer branding ("ScrollySEO | Organic Search Opportunity Report" and "[Business Name] • Confidential • [Date] • Page X") is applied automatically at PDF-render time by `run-discover.mjs` via Puppeteer's header/footer templates — not authored inside report.md/appendix.md.
