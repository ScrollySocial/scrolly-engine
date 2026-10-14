/**
 * Maps DataForSEO v3 REST endpoint paths (as called through
 * mcp__dataforseo__api_request(method, path, data) on dataforseo-mcp-server
 * 3.x) to the logical Discover capabilities methodology/data-sources.md and
 * the Completeness Gate are actually written against.
 *
 * Why this exists: dataforseo-mcp-server 3.0.0 (2026-08-11) replaced dozens
 * of named per-endpoint tools (serp_locations, kw_data_google_ads_search_volume,
 * dataforseo_labs_google_related_keywords, backlinks_summary, etc.) with one
 * generic api_request tool. The methodology still cares about the same
 * logical capabilities -- this module is the only place that knows how those
 * capabilities map onto v3's REST paths, so nothing else has to change.
 *
 * Every path below was confirmed against docs.dataforseo.com (2026-08-27),
 * not guessed. Where a family has multiple real variants (live vs.
 * task_post/task_get, or several sibling endpoints under one capability),
 * the regex matches the shared path prefix rather than one exact suffix, so
 * whichever variant the agent actually calls still classifies correctly.
 */

// Ordered most-specific first: /v3/backlinks/backlinks/ must be checked
// before a hypothetical broader /v3/backlinks/ catch-all would ever exist
// (there isn't one here -- every backlinks sub-family is listed explicitly,
// on purpose, so an unrecognized backlinks path still comes back 'unknown'
// rather than silently satisfying the wrong requirement).
const CAPABILITY_RULES = [
  // --- SERP ---------------------------------------------------------------
  { capability: 'google_organic_serp', re: /^\/v3\/serp\/google\/organic\// },
  { capability: 'serp_locations_reference', re: /^\/v3\/serp\/google\/locations/ },

  // --- Keywords Data --------------------------------------------------------
  { capability: 'google_ads_search_volume', re: /^\/v3\/keywords_data\/google_ads\/search_volume\// },
  { capability: 'google_ads_locations_reference', re: /^\/v3\/keywords_data\/google_ads\/locations/ },

  // --- DataForSEO Labs (keyword research) ------------------------------------
  { capability: 'related_keywords', re: /^\/v3\/dataforseo_labs\/google\/related_keywords\// },
  { capability: 'keyword_ideas', re: /^\/v3\/dataforseo_labs\/google\/keyword_ideas\// },
  { capability: 'keyword_suggestions', re: /^\/v3\/dataforseo_labs\/google\/keyword_suggestions\// },
  { capability: 'keyword_overview', re: /^\/v3\/dataforseo_labs\/google\/keyword_overview\// },
  { capability: 'keywords_for_site', re: /^\/v3\/dataforseo_labs\/google\/keywords_for_site\// },
  { capability: 'bulk_keyword_difficulty', re: /^\/v3\/dataforseo_labs\/google\/bulk_keyword_difficulty\// },
  { capability: 'search_intent', re: /^\/v3\/dataforseo_labs\/google\/search_intent\// },

  // --- DataForSEO Labs (competitor research) ---------------------------------
  { capability: 'serp_competitors', re: /^\/v3\/dataforseo_labs\/google\/serp_competitors\// },
  { capability: 'ranked_keywords', re: /^\/v3\/dataforseo_labs\/google\/ranked_keywords\// },
  { capability: 'domain_intersection', re: /^\/v3\/dataforseo_labs\/google\/domain_intersection\// },

  // --- DataForSEO Labs (historical, optional enrichment tier) ----------------
  { capability: 'historical_rank_overview', re: /^\/v3\/dataforseo_labs\/google\/historical_rank_overview\// },
  { capability: 'historical_serps', re: /^\/v3\/dataforseo_labs\/google\/historical_serps\// },

  // --- Backlinks --------------------------------------------------------------
  { capability: 'backlinks_summary', re: /^\/v3\/backlinks\/summary\// },
  { capability: 'backlinks_individual', re: /^\/v3\/backlinks\/backlinks\// },
  { capability: 'backlinks_referring_domains', re: /^\/v3\/backlinks\/referring_domains\// },
  { capability: 'backlinks_bulk_referring_domains', re: /^\/v3\/backlinks\/bulk_referring_domains\// },
  { capability: 'backlinks_competitors', re: /^\/v3\/backlinks\/competitors\// },
  { capability: 'backlinks_bulk_spam_score', re: /^\/v3\/backlinks\/bulk_spam_score\// },

  // --- Business Data ------------------------------------------------------
  { capability: 'business_listings_search', re: /^\/v3\/business_data\/business_listings\/search\// },
  { capability: 'business_gbp_profile', re: /^\/v3\/business_data\/google\/my_business_info\// },
  { capability: 'business_reviews', re: /^\/v3\/business_data\/google\/reviews\// },

  // --- On-Page (crawl-task based -- content_parsing and lighthouse are ----
  // deliberately kept as separate capabilities, matching the Completeness
  // Gate's existing separate "Technical crawl" / "Lighthouse" checks).
  { capability: 'on_page_lighthouse', re: /^\/v3\/on_page\/lighthouse\// },
  { capability: 'on_page_content', re: /^\/v3\/on_page\/content_parsing/ },

  // --- Domain Analytics (optional enrichment tier) ---------------------------
  { capability: 'domain_whois', re: /^\/v3\/domain_analytics\/whois\/overview\// },
];

/**
 * @param {string} method HTTP method passed to api_request (informational only -- classification is path-based)
 * @param {string} path The `path` argument passed to mcp__dataforseo__api_request, e.g. "/v3/serp/google/organic/live/advanced"
 * @returns {string} a capability id from CAPABILITY_RULES, or 'unknown' if no rule matches. Never guesses.
 */
export function classifyEndpoint(method, path) {
  if (!path || typeof path !== 'string') return 'unknown';
  // Normalize: strip query string, ensure a single leading slash, tolerate a
  // full URL being passed instead of a bare path (defensive -- api_request's
  // own contract is a bare path, but don't misclassify if it isn't).
  let normalized = path.split('?')[0];
  const urlMatch = normalized.match(/^https?:\/\/[^/]+(\/.*)$/);
  if (urlMatch) normalized = urlMatch[1];
  if (!normalized.startsWith('/')) normalized = '/' + normalized;

  for (const { capability, re } of CAPABILITY_RULES) {
    if (re.test(normalized)) return capability;
  }
  return 'unknown';
}

/** Every known capability id, for tests/tooling that need the full set. */
export const KNOWN_CAPABILITIES = CAPABILITY_RULES.map((r) => r.capability);

/**
 * The Completeness Gate's required-capability checks, replacing the old
 * literal 2.x tool-name regexes. Each entry's `capabilities` array is an OR
 * — any one of them being a recorded SUCCESS satisfies that check, mirroring
 * the old code's own `(bulk_keyword_difficulty|search_intent)` OR pattern.
 * `always` checks apply to every engagement; `existingSite`/`localRegional`
 * checks apply per the same mode-detection logic run-discover.mjs already
 * has (hasExistingSite / isLocalRegional) -- unchanged, only the DETECTION
 * mechanism (structured log vs. regex) changed.
 */
export const REQUIRED_CAPABILITY_CHECKS = {
  always: [
    { label: 'Geographically appropriate keyword-demand validation', capabilities: ['google_ads_search_volume'] },
    { label: 'Ranking difficulty / SERP competition validation', capabilities: ['bulk_keyword_difficulty', 'search_intent'] },
    { label: 'Competitor comparison / keyword-gap data', capabilities: ['domain_intersection'] },
    { label: 'Backlink baseline', capabilities: ['backlinks_summary'] },
  ],
  existingSite: [
    { label: 'Current visibility / ranking baseline', capabilities: ['ranked_keywords'] },
    { label: 'Technical crawl', capabilities: ['on_page_content'] },
    { label: 'Lighthouse / Core Web Vitals', capabilities: ['on_page_lighthouse'] }, // 3-tier fallback (free PSI etc.) still handled by findingsText check in the gate itself, unchanged
  ],
  localRegional: [
    { label: 'GBP category/profile completeness', capabilities: ['business_gbp_profile'] },
    { label: 'Review analysis', capabilities: ['business_reviews'] },
  ],
};
