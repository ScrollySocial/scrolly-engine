/**
 * Coverage/dispatch layer (added 2026-08-24 per explicit requirement): the
 * Implementation Agent is the implementation layer for the *entire* Discover
 * audit, not an executor of a predefined subset of generic SEO tasks. Every
 * row in findings.json must receive an explicit, deterministic disposition
 * — never silently dropped because the translator's Path-1 pattern matching
 * didn't recognize it.
 *
 * This does NOT change any Path's internal mechanics (Path 1/2/3/4 all work
 * exactly as built and locked) — it's the classification layer that decides
 * WHICH path (or non-path outcome) each finding belongs to, sitting above
 * translator.mjs rather than replacing it. translator.mjs's existing
 * pattern matching IS this classifier's Path-1 detection for Category H's
 * three known mechanical fields; this file extends coverage to every other
 * row, including two new legitimate Path-1 patterns (H1/heading and broken
 * link — both content_replace-shaped, not new CMS capability) and honest
 * routing to Path 2/3/4/customer-action/not-applicable for everything else.
 *
 * Six disposition classes (the user's 7-item list collapses "implemented"
 * and "staged/awaiting approval" into one PATH_1 class — those are runtime
 * *states* of the same task type, handled by the existing approval
 * machinery, not different dispositions):
 *   PATH_1 (auto-implementable field/content task — safe, direct write)
 *   PATH_2 (ready-to-paste content — no safe direct-write target)
 *   PATH_3 (internal-link opportunity)
 *   PATH_4 (structural/new-page/strategic brief)
 *   CUSTOMER_ACTION_REQUIRED (needs info, access, or a decision only the
 *     customer/operator can provide — never invented, never skipped)
 *   NOT_APPLICABLE (a real, honest classification — not every audit finding
 *     is a website change; competitive intelligence, historical facts,
 *     already-passing checks, and findings explicitly gated against action
 *     by the audit itself all belong here, each with a stated reason)
 */

function match(row, patterns) {
  const haystack = `${row.finding || ''} ${row.recommended_action || ''}`.toLowerCase();
  return patterns.some((p) => haystack.includes(p));
}

function classifyRow(row) {
  const table = row.table;

  // --- O4 (Money Page table): the audit's own relevance_classification
  // column already encodes exactly the distinction that matters here.
  if (table === 'O4') {
    if (row.relevance_classification === 'CONFIRMED RELEVANCE') {
      return { disposition: 'PATH_4', reason: 'Confirmed-relevance new-page recommendation from the Money Page analysis.' };
    }
    return { disposition: 'CUSTOMER_ACTION_REQUIRED', reason: `Page recommendation is unconfirmed (${row.relevance_classification || 'not yet verified'}) — needs the customer to confirm this is a real offering before a page is built.` };
  }

  // --- O2 (Geographic Market table): most rows are market analysis; only
  // rows explicitly recommending a dedicated page overlap with Path 4.
  if (table === 'O2') {
    if (/dedicated page/i.test(row.page_recommendation || '')) {
      return { disposition: 'PATH_4', reason: 'Geographic-market analysis recommends a dedicated page for this market.' };
    }
    return { disposition: 'NOT_APPLICABLE', reason: 'Geographic-market analysis row — informs prioritization, not itself a website change.' };
  }

  // --- O9 (Content Opportunity / blog ideas): gated by Category E's own
  // explicit decision not to invest in a blog program this round.
  if (table === 'O9') {
    return { disposition: 'NOT_APPLICABLE', reason: "Content-program gate decision (Category E) currently recommends against blog investment — this is a backlog item, not an authorized action." };
  }

  // --- Category H (Technical): the only category with genuinely mixed
  // dispositions field-by-field — handle by specific pattern, most specific first.
  if (table === 'H') {
    if (match(row, ['title tag'])) return { disposition: 'PATH_1', reason: 'Mechanical SEO field fix — handled by translator.mjs (seo_title).' };
    if (match(row, ['meta description'])) return { disposition: 'PATH_1', reason: 'Mechanical SEO field fix — handled by translator.mjs (meta_description).' };
    if (match(row, ['alt text', 'alt attribute'])) return { disposition: 'PATH_1', reason: 'Mechanical SEO field fix — handled by translator.mjs (alt_text).' };
    // 2026-08-24, wired: content_append (docker/live-test-content-append.mjs)
    // was a proven-but-disconnected capability — schema markup is additive
    // (nothing existing to replace), so it's a safe content_append target:
    // dispatcher generates the JSON-LD fragment and appends it to the page
    // body, gated by the same page-builder safety check as content_replace,
    // falling back to Path 2 (manual paste) if the target page isn't safe
    // for native content edits or generation fails.
    if (match(row, ['structured data', 'schema markup', 'json-ld'])) return { disposition: 'PATH_1', reason: 'Additive structured-data snippet — content_append-eligible; dispatcher generates the fragment and appends it to the page body if the target page is safe for native content edits, falls back to Path 2 (manual paste) otherwise.' };
    if (match(row, ['robots.txt', 'sitemap'])) return { disposition: 'CUSTOMER_ACTION_REQUIRED', reason: 'Requires server/hosting or security-plugin-level access beyond what the WordPress REST API exposes — not a content-field change.' };
    if (match(row, ['pagespeed', 'lighthouse', 'core web vitals', 'quota'])) return { disposition: 'CUSTOMER_ACTION_REQUIRED', reason: 'Blocked on a free-tool API key or retry — an access/setup dependency, not an implementation action.' };
    if (match(row, ['search console', 'requires client access'])) return { disposition: 'CUSTOMER_ACTION_REQUIRED', reason: 'Requires the customer to grant Search Console access.' };
    if (match(row, ['confirmed passes', 'no action needed'])) return { disposition: 'NOT_APPLICABLE', reason: 'Audit confirms this already passes — no action needed.' };
    // Ordering matters: this project's real data has a compound row ("small
    // tap-target... a broken image reference exists on the 404 template...")
    // that would false-match a broken-link pattern if checked first and get
    // mis-classified — caught by inspecting real output, not by the
    // unclassified count, which stays 0 either way. tap-target/theme checks
    // must run before the broken-link/heading checks below.
    if (match(row, ['tap-target', 'tap target', 'natural resolution', '404-error-page'])) return { disposition: 'CUSTOMER_ACTION_REQUIRED', reason: 'Theme/CSS-level polish item, outside this engine\'s content-field scope — needs manual developer/theme work.' };
    // 2026-08-24, wired: content-target-extractor.mjs now attempts automatic
    // target extraction for these two patterns. Classified PATH_1 here
    // because the mechanism now exists — but extraction/uniqueness can
    // still genuinely fail per-finding at dispatch time (e.g. a finding
    // naming multiple headings has no single safe target), in which case
    // the dispatcher falls back to PATH_2 automatically and the
    // reconciliation records the real outcome, not the optimistic one.
    if (match(row, ['h1 tag', 'multiple h1', 'one h1'])) return { disposition: 'PATH_1', reason: 'Heading text fix — content_replace-eligible; dispatcher attempts automatic target extraction, falls back to Path 2 if the finding names multiple candidates or the live page doesn\'t contain a unique match.' };
    if (match(row, ['broken link', 'broken image', 'malformed', 'href='])) return { disposition: 'PATH_1', reason: 'Broken link/reference fix — content_replace-eligible; dispatcher attempts automatic target extraction, falls back to Path 2 if extraction or the live-content uniqueness check fails.' };
    return { disposition: 'CUSTOMER_ACTION_REQUIRED', reason: 'Technical finding without a recognized safe direct-write pattern — needs manual review to determine the right fix.' };
  }

  // --- Category F (Internal Linking): respect the finding's own stated
  // blocker rather than assuming the mechanism can run regardless.
  if (table === 'F') {
    if (match(row, ['not currently possible', 'no separate urls', 'single page'])) {
      return { disposition: 'NOT_APPLICABLE', reason: 'Finding explicitly states internal linking is not yet possible (site is single-page) — becomes Path-3-eligible once the Category C/D pages it depends on exist.' };
    }
    return { disposition: 'PATH_3', reason: 'Internal-linking opportunity — handled by internal-link-planner.mjs.' };
  }

  // --- Category C/D (Site Architecture / Page-Level Recommendations)
  if (table === 'C' || table === 'D') {
    if (match(row, ['create', 'dedicated page', 'create dedicated'])) {
      return { disposition: 'PATH_4', reason: 'New-page recommendation — handled by strategic-brief-generator.mjs.' };
    }
    if (match(row, ['no page-level', 'no client-provided', 'ask the client', 'request the actual', 'gbp category'])) {
      return { disposition: 'CUSTOMER_ACTION_REQUIRED', reason: 'Missing information or access only the customer can provide.' };
    }
    if (match(row, ['resolved', 'superseded', 'kept for history'])) {
      return { disposition: 'NOT_APPLICABLE', reason: 'Superseded by a later, corrected finding — kept for history only.' };
    }
    return { disposition: 'PATH_4', reason: 'Site-structure recommendation — routed to a strategic brief by default for this category.' };
  }

  // --- Category B (Business Value & Prioritization)
  if (table === 'B') {
    if (match(row, ['no client-provided', 'ask the client'])) {
      return { disposition: 'CUSTOMER_ACTION_REQUIRED', reason: 'Missing business-priority data only the customer can provide.' };
    }
    return { disposition: 'NOT_APPLICABLE', reason: 'Business-value/prioritization framing — informs strategy, not itself a website change.' };
  }

  // --- Category I (Local Search)
  if (table === 'I') {
    if (match(row, ['review-generation', 'review requests', 'begin a review'])) {
      return { disposition: 'CUSTOMER_ACTION_REQUIRED', reason: 'Real-world business action (asking customers for reviews), not a website implementation task.' };
    }
    if (match(row, ['gbp category', 'gbp dashboard', 'gbp configuration', 'listings call'])) {
      return { disposition: 'CUSTOMER_ACTION_REQUIRED', reason: 'Needs Google Business Profile dashboard access to diagnose/confirm.' };
    }
    return { disposition: 'NOT_APPLICABLE', reason: 'Local-search market/demand data — informational.' };
  }

  // --- Category E (Content & Topical Strategy): explicit gate decisions
  // and exclusions are themselves the disposition, not a website action.
  if (table === 'E') {
    return { disposition: 'NOT_APPLICABLE', reason: 'Content-strategy gate decision or exclusion rule — a strategic decision the audit made explicit, not an implementation action.' };
  }

  // --- Categories A, G, J: competitive/authority/history — informational by nature.
  if (table === 'A' || table === 'G' || table === 'J') {
    return { disposition: 'NOT_APPLICABLE', reason: 'Competitive, authority, or historical analysis finding — informs the audit\'s narrative and prioritization but does not correspond to a direct website implementation action.' };
  }

  return { disposition: 'CUSTOMER_ACTION_REQUIRED', reason: `No classification rule matched table "${table}" — flagged for manual review rather than silently dropped.` };
}

/**
 * Normalizes a raw findings.json row into {finding, recommended_action} text
 * for the Path 2/3/4 LLM generators, which were written against Category
 * H/C/D's `finding`/`recommended_action` fields. O2 (Geographic Market) and
 * O4 (Money Page) rows use entirely different field names and have neither
 * — passing them through unchanged sent the LLM a literal
 * `Audit finding: "undefined"` prompt (confirmed live: Mulberry Creek O2/O4
 * Path-4 briefs all collapsed onto slugs like "undefined-page", silently
 * overwriting each other on disk, because the LLM had nothing but the word
 * "undefined" to key a distinct slug off of).
 */
export function describeFinding(row) {
  if (row.finding || row.recommended_action) {
    return { finding: row.finding || '', recommended_action: row.recommended_action || '' };
  }
  if (row.table === 'O4') {
    return {
      finding: `New-page opportunity at ${row.recommended_url || '(URL not yet assigned)'} — ${row.purpose || ''} Primary keyword: "${row.primary_keyword || ''}". Demand: ${row.demand || 'not sized'}. Priority: ${row.priority || 'unspecified'}.`,
      recommended_action: `Create a page at ${row.recommended_url || '(URL not yet assigned)'} targeting "${row.primary_keyword || ''}" (supporting cluster: ${row.supporting_keyword_cluster || 'none'}).${row.supporting_content_needed ? ` Needs: ${row.supporting_content_needed}.` : ''}`,
    };
  }
  if (row.table === 'O2') {
    return {
      finding: `Geographic-market opportunity in ${row.market || 'an unspecified market'} — ${row.opportunity || ''}. Current visibility: ${row.current_visibility || 'unknown'}.`,
      recommended_action: row.recommended_targeting_approach || row.page_recommendation || 'Evaluate a dedicated page for this market.',
    };
  }
  return { finding: JSON.stringify(row), recommended_action: '' };
}

/**
 * @param {object[]} findingsRows - parsed findings.json
 * @returns {{ classified: Array, counts: Record<string, number>, unclassifiedCount: number }}
 */
export function classifyFindings(findingsRows) {
  const classified = findingsRows.map((row, index) => ({
    index,
    table: row.table,
    finding: row.finding || row.recommended_url || row.purpose || row.page_recommendation || row.topic_title || '(no finding text)',
    ...classifyRow(row),
  }));

  const counts = {};
  for (const c of classified) counts[c.disposition] = (counts[c.disposition] || 0) + 1;

  const unclassifiedCount = classified.filter((c) => !c.disposition).length;

  return { classified, counts, unclassifiedCount };
}
