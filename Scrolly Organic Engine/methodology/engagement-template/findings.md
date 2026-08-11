# Discover Findings — <business name>

Structured source of truth ("C" in discover.md's Output section). Canonical schema per `discover.md`. Fixed columns, same order, every table — this consistency is what allows a future JSON conversion without redesigning the schema. Use `—` for a field that doesn't apply; never omit or reorder a column.

## Opportunity Engine Records (O1–O10, primary tier)

### Geographic Market (O2) — local/regional businesses only
Columns: `market | distance/drive_time | relevant_business_line(s) | demand_signal | competition | current_visibility | opportunity | recommended_targeting_approach | classification | page_recommendation | evidence_type | confidence`

| market | distance/drive_time | relevant_business_line(s) | demand_signal | competition | current_visibility | opportunity | recommended_targeting_approach | classification | page_recommendation | evidence_type | confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|

### Money Page (O4)
Columns: `recommended_url | purpose | primary_keyword | supporting_keyword_cluster | search_intent | relevant_geography | demand | organic_difficulty | current_visibility | estimated_traffic_opportunity | commercial_value_proxy | client_specific_economics | priority | supporting_content_needed | relevance_classification | evidence_type | confidence`

`relevance_classification`: CONFIRMED RELEVANCE / POTENTIAL RELEVANCE — VERIFY OFFERING / IRRELEVANT-EXCLUDE. `client_specific_economics`: real client figure, or the literal value "Not provided."

| recommended_url | purpose | primary_keyword | supporting_keyword_cluster | search_intent | relevant_geography | demand | organic_difficulty | current_visibility | estimated_traffic_opportunity | commercial_value_proxy | client_specific_economics | priority | supporting_content_needed | relevance_classification | evidence_type | confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

### Content Opportunity (O9)
Columns: `topic_title | primary_keyword | supporting_keywords | search_demand | organic_difficulty | intent | money_page_supported | relevance_classification | why_it_matters | priority | evidence_type | confidence`

Sized to the real opportunity count found — do not pad to fill a tier, do not cap below what the evidence supports.

**First 10 Posts**
| topic_title | primary_keyword | supporting_keywords | search_demand | organic_difficulty | intent | money_page_supported | relevance_classification | why_it_matters | priority | evidence_type | confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|

**Next 20 Posts**
| topic_title | primary_keyword | supporting_keywords | search_demand | organic_difficulty | intent | money_page_supported | relevance_classification | why_it_matters | priority | evidence_type | confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|

**Broader Backlog**
| topic_title | primary_keyword | supporting_keywords | search_demand | organic_difficulty | intent | money_page_supported | relevance_classification | why_it_matters | priority | evidence_type | confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|

### Opportunity Prioritization (O10)
Six distinct rankings — never collapsed into one score.

- **Biggest Search-Demand Opportunity:**
- **Highest Potential Business-Value Opportunity:**
- **Most Favorable Organic Competition:**
- **Best Demand × Difficulty Opportunity:**
- **Best Near-Term SEO Win:**
- **Best Overall Organic Opportunity:**

---

## Supporting Audit Records (A–N)
Columns: `category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations`

### A. Competitive Search Landscape
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### B. Business Value & Prioritization
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### C. Site Architecture
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### D. Page-Level Recommendations
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### E. Content & Topical Strategy
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### F. Internal Linking
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### G. Authority & Trust
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### H. Technical SEO & Indexation
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### I. Local Search
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### J. Site History
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### K. Analytics & Measurement Readiness
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### L. Organic Conversion Readiness
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### M. AI Discovery & Entity Readiness
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|

### N. Chatbot & Light AI Automation Opportunity
| category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations |
|---|---|---|---|---|---|---|---|---|---|---|
