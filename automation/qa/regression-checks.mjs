#!/usr/bin/env node
/**
 * Lightweight, deterministic regression lint for a finished Discover
 * engagement, per methodology/report-contract.md's Final Quality Gate.
 *
 * Scoped narrowly to what's mechanically pattern-matchable from
 * findings.md's fixed-column tables and report.md/appendix.md's HTML
 * structure. Semantic judgment calls ("was the timing adjustment
 * actually justified?", roadmap dependency ordering in the general
 * case) stay in the prose Final Quality Gate — this script does not
 * attempt to replace that, only to catch the mechanically-checkable
 * subset of it every time, without relying on an LLM re-reading its
 * own output.
 *
 * Usage:
 *   node automation/qa/regression-checks.mjs <client-slug>
 *
 * Exit code: 0 if all checks pass, 1 if any check fails.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', 'Scrolly Organic Engine');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node automation/qa/regression-checks.mjs <client-slug>');
  process.exit(1);
}

const engagementDir = path.join(VAULT_DIR, 'clients', slug, 'discover');
const paths = {
  findings: path.join(engagementDir, 'findings.md'),
  report: path.join(engagementDir, 'report.md'),
  appendix: path.join(engagementDir, 'appendix.md'),
};

async function readIfExists(p) {
  return existsSync(p) ? readFile(p, 'utf8') : null;
}

function extractEyebrows(html) {
  // { label, index } for every section-eyebrow div, in document order.
  const re = /<div class="section-eyebrow[^"]*">([^<]+)<\/div>/g;
  const matches = [];
  let m;
  while ((m = re.exec(html)) !== null) matches.push({ label: m[1].trim(), index: m.index });
  return matches;
}

// report-contract.md's rule targets eyebrows repeated with nothing but a
// heading between them (a stacking mistake), not the normal, documented
// pattern of reusing one eyebrow across every section within a Part
// (report-design-system.md's eyebrow-to-Part mapping). Distinguish the two
// by how little separates them: genuinely adjacent section-openers have a
// small character gap and no intervening `part-divider`; a real section
// with actual content between two same-labeled openers does not.
const ADJACENT_GAP_CHARS = 300;

// Deliberately narrower than "all of Part VII": the regression this check
// exists to catch is a seasonal finding missing from the *near-term*
// Priority Matrix / Roadmap specifically, not merely mentioned somewhere
// in Part VII (e.g. buried in a low-urgency Months-7-12 "directional only"
// note would satisfy a whole-Part-VII search while still failing the
// actual rule in report-contract.md §23/§29).
function priorityMatrixSlice(html) {
  // Match the actual <h2> heading, not a prose cross-reference to it
  // elsewhere in the report (e.g. a "see the Implementation Priority
  // Matrix" pointer from an earlier section).
  const headingMatch = html.match(/<h2>[^<]*Priority Matrix[^<]*<\/h2>/i);
  if (!headingMatch) return null;
  const start = headingMatch.index;
  // End at the next Part divider, or the closing Methodology dark-section
  // (report-design-system.md's fixed final divider) — NOT any "section-dark"
  // block, since that component is also used mid-report for emphasis
  // (e.g. an "Is Organic Search Worth the Investment?" callout).
  const endMarkers = [
    /<div class="part-divider">/i,
    /<h2>\s*Methodology/i,
    /<h2>\s*Scope\s*&amp;\s*Next Steps/i,
  ];
  let end = html.length;
  for (const re of endMarkers) {
    re.lastIndex = 0;
    const m = re.exec(html.slice(start + 50));
    if (m) end = Math.min(end, start + 50 + m.index);
  }
  return html.slice(start, end);
}

function seasonalFindingsRows(findingsMd) {
  return findingsMd
    .split('\n')
    .filter((line) => /seasonal/i.test(line) && /\bHigh\b|\bModerate\b/i.test(line));
}

async function main() {
  const [findings, report, appendix] = await Promise.all([
    readIfExists(paths.findings),
    readIfExists(paths.report),
    readIfExists(paths.appendix),
  ]);

  const results = [];
  const fail = (name, detail) => results.push({ name, pass: false, detail });
  const pass = (name, detail) => results.push({ name, pass: true, detail });

  // --- Check 1: duplicate consecutive eyebrows -----------------------------
  if (report) {
    const eyebrows = extractEyebrows(report);
    const dupes = [];
    for (let i = 1; i < eyebrows.length; i++) {
      const gap = report.slice(eyebrows[i - 1].index, eyebrows[i].index);
      const trulyAdjacent = gap.length < ADJACENT_GAP_CHARS && !gap.includes('part-divider');
      if (eyebrows[i].label === eyebrows[i - 1].label && trulyAdjacent) {
        dupes.push(eyebrows[i].label);
      }
    }
    if (dupes.length) {
      fail('duplicate-eyebrows', `Section-eyebrow labels repeated with essentially no content between them (a stacking mistake, not the normal one-eyebrow-per-Part pattern): ${[...new Set(dupes)].join(', ')}`);
    } else {
      pass('duplicate-eyebrows', `${eyebrows.length} eyebrows checked, no back-to-back stacking duplicates.`);
    }
  } else {
    fail('duplicate-eyebrows', 'report.md not found.');
  }

  // --- Check 2: seasonal-orphan (finding exists but never affects roadmap) -
  if (findings && report) {
    const seasonalRows = seasonalFindingsRows(findings);
    if (seasonalRows.length === 0) {
      pass('seasonal-orphan', 'No Moderate/High-confidence seasonal finding in findings.md — check not applicable.');
    } else {
      const matrix = priorityMatrixSlice(report);
      if (matrix && /seasonal/i.test(matrix)) {
        pass('seasonal-orphan', `${seasonalRows.length} seasonal finding row(s) in findings.md, and the Priority Matrix/near-term Roadmap references "seasonal" — timing cross-reference present.`);
      } else {
        fail(
          'seasonal-orphan',
          `${seasonalRows.length} Moderate/High-confidence seasonal finding row(s) exist in findings.md, but the Implementation Priority Matrix / near-term Roadmap section never mentions "seasonal" (a mention elsewhere in Part VII, e.g. a low-urgency Months-7+ note, does not satisfy this). Per report-contract.md §29, this must either affect near-term roadmap timing or state a reason it doesn't.`
        );
      }
    }
  } else {
    fail('seasonal-orphan', 'findings.md or report.md not found.');
  }

  // --- Check 3: manufactured seasonality (claim with no backing evidence) --
  if (findings) {
    const findingsMentionsSeasonal = /seasonal/i.test(findings);
    for (const [label, doc] of [['report.md', report], ['appendix.md', appendix]]) {
      if (!doc) continue;
      const docMentionsSeasonal = /seasonal/i.test(doc);
      if (docMentionsSeasonal && !findingsMentionsSeasonal) {
        fail('manufactured-seasonality', `${label} makes a seasonal claim, but findings.md has no corresponding "seasonal" evidence row.`);
      } else if (docMentionsSeasonal) {
        pass('manufactured-seasonality', `${label}'s seasonal claim(s) have corresponding evidence in findings.md.`);
      }
    }
    if (!results.some((r) => r.name === 'manufactured-seasonality')) {
      pass('manufactured-seasonality', 'No seasonal claims in report.md/appendix.md — check not applicable.');
    }
  } else {
    fail('manufactured-seasonality', 'findings.md not found.');
  }

  // --- Check 4: keyword count claimed without visible evidence table -------
  if (report) {
    const countClaim = report.match(/[\d,]{3,}\+?\s+(?:keyword|opportunit)\w*/i);
    if (!countClaim) {
      pass('keyword-count-evidence', 'No large keyword/opportunity count claim found — check not applicable.');
    } else {
      const hasVolumeTable = /(Keyword Cluster Summary Table|<th>[^<]*(Volume|Demand)[^<]*<\/th>)/i.test(report);
      if (hasVolumeTable) {
        pass('keyword-count-evidence', `Count claim "${countClaim[0]}" found alongside a volume/demand table.`);
      } else {
        fail(
          'keyword-count-evidence',
          `report.md claims "${countClaim[0]}" but no Keyword Cluster Summary Table or volume/demand table column was found anywhere in report.md. Per report-contract.md §7, the main report must visibly show real keyword data, not just a total count.`
        );
      }
    }
  } else {
    fail('keyword-count-evidence', 'report.md not found.');
  }

  // --- Check 8b: local-demand primacy (local/regional mode only) -----------
  if (report) {
    const structureIdx = report.search(/<ul class="site-structure"/i);
    const isLocalMode = /local pack|Google Business Profile/i.test(report);
    if (!isLocalMode) {
      pass('local-demand-primacy', 'No local/regional signals found — check not applicable (national/e-commerce mode).');
    } else {
      const catchmentIdx = report.search(/realistic customer catchment/i);
      const funnelIdx = report.search(/What People Are Actually Searching For|Keyword Opportunity Analysis/i);
      if (catchmentIdx === -1) {
        fail('local-demand-primacy', 'Local/regional engagement, but no "realistic customer catchment" framing found before the keyword-evidence tables. Per discover.md\'s Local Business Demand Hierarchy, this must lead the section.');
      } else if (funnelIdx !== -1 && catchmentIdx > funnelIdx + 6000) {
        fail('local-demand-primacy', 'Catchment framing found, but it is not positioned near the top of the keyword-opportunity section.');
      } else {
        // Check the first keyword table after the catchment callout has a
        // Core/Secondary-style column, not a bare National-only lead table.
        const afterCatchment = report.slice(catchmentIdx, catchmentIdx + 4000);
        const hasCoreColumn = /Core:|Core Market|Wills Point<\/th>|>Core</i.test(afterCatchment) || /<th>Core/i.test(afterCatchment);
        if (hasCoreColumn) {
          pass('local-demand-primacy', 'Catchment framing present, and the following table leads with a core/secondary geography column.');
        } else {
          fail('local-demand-primacy', 'Catchment framing present, but the immediately-following keyword table does not appear to lead with a core/secondary local column. Verify by eye.');
        }
      }
    }
  } else {
    fail('local-demand-primacy', 'report.md not found.');
  }

  // --- Check 8c: implementation workbook present and checkbox-driven -------
  if (report) {
    const hasWorkbook = /class="workbook-phase"/i.test(report);
    const hasTasks = (report.match(/class="wb-task"/g) || []).length;
    const hasDecisions = (report.match(/class="wb-decision"/g) || []).length;
    if (hasWorkbook && hasTasks >= 3) {
      pass('workbook-present', `Workbook found with ${hasTasks} checkbox task block(s) and ${hasDecisions} client-decision block(s).`);
    } else {
      fail('workbook-present', 'No printable Implementation Workbook (workbook-phase/wb-task blocks) found. Required by report-contract.md §23a.');
    }
  } else {
    fail('workbook-present', 'report.md not found.');
  }

  // --- Check 9: keyword cluster -> page map completeness -------------------
  if (report) {
    const hasMatrixCards = /class="matrix-card"/i.test(report);
    const hasVariantCount = /Variant Count/i.test(report);
    const hasSecondaryKw = /Secondary Keywords|Secondary\/Same-Page Keywords/i.test(report);
    if (hasMatrixCards && hasVariantCount && hasSecondaryKw) {
      pass('cluster-page-map-completeness', 'Matrix cards present with Variant Count and Secondary Keywords fields.');
    } else {
      fail(
        'cluster-page-map-completeness',
        `Missing: ${[!hasMatrixCards && 'matrix-card component', !hasVariantCount && 'Variant Count field', !hasSecondaryKw && 'Secondary Keywords field'].filter(Boolean).join(', ')}. Per report-contract.md §7, the Keyword Cluster → Page Map must be visible, not just cluster names.`
      );
    }
  } else {
    fail('cluster-page-map-completeness', 'report.md not found.');
  }

  // --- Check 10: grouped keyword evidence tables present --------------------
  if (report) {
    const groupedHeadingCount = (report.match(/Top (Commercial|Local|Nursery|Landscaping|Tree)|Informational Questions|Seasonal Keywords|High-Value Subclusters|Unexpected Opportunit|Head,\s*Mid-Tail\s*&(amp;)?\s*Long-Tail Coverage/gi) || []).length;
    if (groupedHeadingCount >= 3) {
      pass('grouped-keyword-tables', `${groupedHeadingCount} themed keyword group heading(s) found.`);
    } else {
      fail('grouped-keyword-tables', `Only ${groupedHeadingCount} themed keyword group heading(s) found (e.g. "Top Commercial Keywords," "Informational Questions"). Per report-contract.md §7, real keyword phrases must be surfaced in grouped thematic tables, not just a cluster summary.`);
    }
  } else {
    fail('grouped-keyword-tables', 'report.md not found.');
  }

  // --- Check 11: AI Search Readiness scorecard completeness -----------------
  if (report) {
    const dims = ['Entity Clarity', 'Website Extractability', 'Third-Party Corroboration', 'Expertise', 'Structured Data', 'Conversational Query Coverage'];
    const missingDims = dims.filter((d) => !new RegExp(d, 'i').test(report));
    if (missingDims.length === 0) {
      pass('ai-scorecard-completeness', 'All 6 core AI Search Readiness dimensions referenced.');
    } else {
      fail('ai-scorecard-completeness', `Missing AI Search Readiness dimension(s): ${missingDims.join(', ')}. Per report-contract.md §16b, these must be rated or explicitly marked not-ratable, independent of platform-testing availability.`);
    }
    const hasNowNextLater = /\bNow\b[\s\S]{0,200}\bNext\b[\s\S]{0,200}\bLater\b/.test(report) || (/>Now</i.test(report) && />Next</i.test(report) && />Later</i.test(report));
    if (hasNowNextLater) {
      pass('ai-action-plan', 'Now/Next/Later action plan structure found.');
    } else {
      fail('ai-action-plan', 'No Now/Next/Later AI action plan structure found. Required by report-contract.md §16b.');
    }
  } else {
    fail('ai-scorecard-completeness', 'report.md not found.');
  }

  // --- Check 12: site architecture uses the visual tree, not a bare list ----
  if (report) {
    const hasSvgNearStructure = /Recommended Website Structure|Recommended Site Structure/i.test(report) && /<svg[\s\S]{0,3000}site-structure|<svg[\s\S]{0,2000}<\/svg>[\s\S]{0,500}<ul class="site-structure"/i.test(report);
    // Looser fallback: an <svg> block appears anywhere before the site-structure <ul>.
    const structureIdx = report.search(/<ul class="site-structure"/i);
    const svgBeforeStructure = structureIdx > -1 && /<svg[\s\S]*<\/svg>/i.test(report.slice(Math.max(0, structureIdx - 12000), structureIdx));
    if (structureIdx === -1) {
      fail('site-architecture-visual', 'No .site-structure list found at all.');
    } else if (svgBeforeStructure || hasSvgNearStructure) {
      pass('site-architecture-visual', 'An SVG diagram precedes the site-structure list.');
    } else {
      fail('site-architecture-visual', 'The site-structure list exists but no SVG tree diagram was found immediately before it. Per report-contract.md §6b, the architecture must lead with a visual tree diagram, not a bare list.');
    }
  } else {
    fail('site-architecture-visual', 'report.md not found.');
  }

  // --- Check 13: minimum font-size floor (9pt anywhere, 10pt normal body) --
  for (const [label, doc] of [['report.md', report], ['appendix.md', appendix]]) {
    if (!doc) continue;
    const subFloor = [...doc.matchAll(/font-size:\s*([0-8])(\.\d+)?pt/gi)].map((m) => m[0]);
    if (subFloor.length === 0) {
      pass(`min-font-size (${label})`, 'No inline font-size below the 9pt floor found.');
    } else {
      fail(`min-font-size (${label})`, `${subFloor.length} inline style(s) below the 9pt floor: ${[...new Set(subFloor)].slice(0, 8).join(', ')}. Per report-contract.md's Presentation Layer typography requirement, nothing may render below 9pt.`);
    }
  }

  // --- Check 5: em-dash usage (report-contract.md's absolute Prose Rule) ---
  for (const [label, doc] of [['report.md', report], ['appendix.md', appendix]]) {
    if (!doc) continue;
    // Both the literal character and its HTML entity render as an em-dash.
    const count = (doc.match(/—|&mdash;/g) || []).length;
    if (count === 0) {
      pass(`em-dash-scan (${label})`, 'No em-dashes found.');
    } else {
      fail(`em-dash-scan (${label})`, `${count} em-dash occurrence(s) found (literal "—" or "&mdash;"). Per report-contract.md's Prose Rule, rewrite with a comma, period, colon, or parentheses instead. (En-dashes, "&ndash;"/"–", used for numeric ranges like "Days 1–30" are fine and not flagged.)`);
    }
  }

  // --- Check 6: client-facing internal-taxonomy leaks -----------------------
  const LEAK_PATTERNS = [
    { re: /\bPOTENTIAL RELEVANCE\b/, label: 'raw relevance_classification value "POTENTIAL RELEVANCE"' },
    { re: /\bCONFIRMED RELEVANCE\b/, label: 'raw relevance_classification value "CONFIRMED RELEVANCE"' },
    { re: /\bIRRELEVANT\s*\/\s*EXCLUDE\b/, label: 'raw relevance_classification value "IRRELEVANT / EXCLUDE"' },
    { re: /\bCategory [A-N]\b/, label: 'bare "Category X" internal audit-category reference' },
    { re: /\bO(?:10|[1-9])\b(?!\d)/, label: 'bare "O1"-"O10" opportunity-engine layer code' },
    { re: /\bfindings\.md\b/, label: 'raw internal filename "findings.md"' },
    { re: /\bevidence_type\b/, label: 'raw internal field name "evidence_type"' },
    { re: /\bno downside\b/i, label: 'banned mechanical-causation phrase "no downside" (report-contract.md\'s named example)' },
  ];
  for (const [label, doc] of [['report.md', report], ['appendix.md', appendix]]) {
    if (!doc) continue;
    const hits = LEAK_PATTERNS.filter((p) => p.re.test(doc));
    if (hits.length === 0) {
      pass(`client-language-leak-scan (${label})`, 'No internal-shorthand or banned-phrase leaks found.');
    } else {
      fail(`client-language-leak-scan (${label})`, `Found: ${hits.map((h) => h.label).join('; ')}. Per report-contract.md's Client Language Rules, translate to the report-facing label instead.`);
    }
  }

  // --- Check 7: Expected Organic Traffic Impact has all 4 stages present ---
  if (report) {
    const start = report.search(/<h2>[^<]*Expected Organic Traffic Impact[^<]*<\/h2>/i);
    if (start === -1) {
      fail('traffic-impact-stages', 'No "Expected Organic Traffic Impact" section (report-contract.md §20) found at all.');
    } else {
      const nextHeading = report.slice(start + 50).search(/<h2>/i);
      const slice = report.slice(start, nextHeading === -1 ? report.length : start + 50 + nextHeading);
      const stageWords = ['baseline', 'near-term', 'mid-term', 'longer-term'];
      const missing = stageWords.filter((w) => !new RegExp(w, 'i').test(slice));
      if (missing.length === 0) {
        pass('traffic-impact-stages', 'All 4 stages (baseline/near-term/mid-term/longer-term) referenced — content may be qualitative or quantitative, both satisfy §20.');
      } else {
        fail('traffic-impact-stages', `Expected Organic Traffic Impact section is missing stage(s): ${missing.join(', ')}. Per report-contract.md §20 (revised 2026-08-16), each stage may be qualitative when data doesn't support numbers, but none may be omitted entirely.`);
      }
    }
  } else {
    fail('traffic-impact-stages', 'report.md not found.');
  }

  // --- Check 8: screenshot-honesty ------------------------------------------
  if (report) {
    const claimsScreenshot = /screenshot/i.test(report);
    const hasImgTag = /<img\b/i.test(report);
    if (claimsScreenshot && !hasImgTag) {
      fail('screenshot-honesty', 'report.md mentions "screenshot" but contains no <img> tag anywhere. Per report-contract.md §25 (revised 2026-08-16), never claim screenshot evidence was delivered when none was captured — a data-driven visualization should be described as exactly that.');
    } else {
      pass('screenshot-honesty', claimsScreenshot ? 'Screenshot mentioned and at least one <img> tag present.' : 'No screenshot claims found — check not applicable.');
    }
  } else {
    fail('screenshot-honesty', 'report.md not found.');
  }

  // --- Check 14: long-tail-discovery-evidence -------------------------------
  if (report) {
    const hasTailLabels = /\b(Head|Mid-tail|Long-tail)\b/.test(report);
    const mentionsLongTail = /long-tail/i.test(report);
    if (hasTailLabels || mentionsLongTail) {
      pass('long-tail-discovery-evidence', 'Long-tail modifier classification (Head/Mid-tail/Long-tail) or explicit long-tail discussion found in report.md.');
    } else {
      fail('long-tail-discovery-evidence', 'No Head/Mid-tail/Long-tail classification or long-tail discussion found anywhere in report.md. Per discover.md\'s Long-Tail Discovery Stage, long-tail terms must be deliberately surfaced and classified, not left implicit.');
    }
  } else {
    fail('long-tail-discovery-evidence', 'report.md not found.');
  }

  // --- Check 15: consolidated-opportunity-matrix ----------------------------
  if (report) {
    const hasMatrix = /Primary Opportunity Matrix|class="matrix-card"/i.test(report);
    function sectionSlice(headingPattern) {
      const start = report.search(headingPattern);
      if (start === -1) return null;
      const nextHeading = report.slice(start + 50).search(/<h2>/i);
      return report.slice(start, nextHeading === -1 ? report.length : start + 50 + nextHeading);
    }
    const difficultySlice = sectionSlice(/<h2>[^<]*Keyword Competition[^<]*<\/h2>/i);
    const competitiveSlice = sectionSlice(/<h2>[^<]*Competitive Landscape[^<]*<\/h2>/i);
    const reTabulated = [difficultySlice, competitiveSlice]
      .filter(Boolean)
      .some((slice) => /<th>[^<]*(Volume|Demand Signal)[^<]*<\/th>/i.test(slice));
    if (hasMatrix && !reTabulated) {
      pass('consolidated-opportunity-matrix', 'Primary Opportunity Matrix present; §8/§10 do not appear to re-tabulate demand/volume columns.');
    } else if (!hasMatrix) {
      fail('consolidated-opportunity-matrix', 'No Primary Opportunity Matrix (matrix-card) found in report.md. Per report-contract.md §7, cluster/demand/visibility/competition must consolidate into one matrix.');
    } else {
      fail('consolidated-opportunity-matrix', 'Keyword Competition or Competitive Landscape section contains its own Volume/Demand-Signal table column, which looks like a re-tabulation of the Primary Opportunity Matrix rather than a reference to it by cluster name. Per report-contract.md §8/§10 (2026-08-17), these sections should reference the matrix, not repeat it.');
    }
  } else {
    fail('consolidated-opportunity-matrix', 'report.md not found.');
  }

  // --- Check 16: backlink-appendix-completeness -----------------------------
  // Tightened 2026-08-19: aggregate domain/link counts are not equivalent to
  // an individual-record list (source URL / destination URL / anchor text
  // per link) — see report-contract.md §15 and data-sources.md's backlink
  // section. This check fails on the specific defect found in Mulberry
  // Creek's first remediation pass: presenting aggregate counts as "the
  // complete, genuine picture" with no individual-record table and no plain
  // statement that individual records weren't retrieved.
  if (appendix) {
    const discussesBacklinks = /backlink|referring domain/i.test(appendix);
    if (!discussesBacklinks) {
      pass('backlink-appendix-completeness', 'No backlink discussion found in appendix.md — check not applicable.');
    } else {
      const hasIndividualRecordTable = /<th>[^<]*(Source URL|Anchor Text|URL From|URL To|Destination URL)[^<]*<\/th>/i.test(appendix);
      const claimsCompleteness = /(complete,? genuine picture|complete (backlink )?list|complete picture)/i.test(appendix);
      const statesGapPlainly = /(were not retrieved|individual link-level records|not retrieved for this engagement|per-link (records|detail))/i.test(appendix);
      if (claimsCompleteness && !hasIndividualRecordTable) {
        fail('backlink-appendix-completeness', 'appendix.md claims a "complete"/"full" backlink picture or list, but has no individual-record table (Source URL/Anchor Text/etc. columns). Aggregate domain/link counts are not equivalent to a complete link list — per report-contract.md §15 (tightened 2026-08-19).');
      } else if (hasIndividualRecordTable) {
        const domainRowCount = (appendix.match(/<tr>/gi) || []).length;
        pass('backlink-appendix-completeness', `Individual backlink-record table found with ~${domainRowCount} rows.`);
      } else if (statesGapPlainly) {
        pass('backlink-appendix-completeness', 'Aggregate-only backlink data presented with an accurate statement that individual link records were not retrieved (no false completeness claim).');
      } else {
        fail('backlink-appendix-completeness', 'appendix.md discusses backlinks with only aggregate data: no individual-record table, and no plain statement that individual link records were not retrieved. Per report-contract.md §15 (tightened 2026-08-19).');
      }
    }
  } else {
    fail('backlink-appendix-completeness', 'appendix.md not found.');
  }

  // --- Check 17: break-even-fallback-tier-disclosed -------------------------
  if (report) {
    const hasCalcBox = /class="calc-box"/i.test(report);
    if (!hasCalcBox) {
      fail('break-even-fallback-tier-disclosed', 'No break-even calc-box found in report.md. Required by report-contract.md §21.');
    } else {
      const calcBoxIdx = report.search(/class="calc-box"/i);
      const nearby = report.slice(calcBoxIdx, calcBoxIdx + 1500);
      const tierStated = /client-provided|client's own numbers|website pricing|industry benchmark|assumption|not provided|tier/i.test(nearby);
      if (tierStated) {
        pass('break-even-fallback-tier-disclosed', 'Break-even section states which economics tier/source was used.');
      } else {
        fail('break-even-fallback-tier-disclosed', 'Break-even calc-box found, but no nearby text discloses which of the 4 fallback tiers (client-provided / website pricing / industry benchmark / labeled assumption) produced the figure. Required by report-contract.md §21 (2026-08-17).');
      }
    }
  } else {
    fail('break-even-fallback-tier-disclosed', 'report.md not found.');
  }

  // --- Check 18: workbook-later-phase-specificity ---------------------------
  if (report) {
    const phaseMatches = [...report.matchAll(/<div class="wp-title">([^<]*)<\/div>/gi)];
    if (phaseMatches.length === 0) {
      fail('workbook-later-phase-specificity', 'No workbook phases found to check.');
    } else {
      const lastPhase = phaseMatches[phaseMatches.length - 1];
      const nextIdx = phaseMatches.length > 1 ? lastPhase.index : lastPhase.index;
      const slice = report.slice(nextIdx, nextIdx + 6000);
      const genericOnly = /monitor and optimize/i.test(slice) && !/(impressions|position|CTR|query|queries|local-pack|GBP action|conversion|internal link|subcluster)/i.test(slice);
      if (genericOnly) {
        fail('workbook-later-phase-specificity', `Last workbook phase ("${lastPhase[1].trim()}") appears to contain only generic "monitor and optimize" language with no page/cluster-specific signal. Required by report-contract.md §23a (2026-08-17).`);
      } else {
        pass('workbook-later-phase-specificity', `Last workbook phase ("${lastPhase[1].trim()}") contains specific, page/cluster-level signal language.`);
      }
    }
  } else {
    fail('workbook-later-phase-specificity', 'report.md not found.');
  }

  // --- Check 19: ai-automation-not-default ----------------------------------
  if (report) {
    const hasSection = /<h2>[^<]*Light AI Automation Opportunity[^<]*<\/h2>/i.test(report);
    if (!hasSection) {
      pass('ai-automation-not-default', 'No Light AI Automation Opportunity section present — valid, expected common outcome per discover.md Category N (2026-08-17).');
    } else {
      const start = report.search(/<h2>[^<]*Light AI Automation Opportunity[^<]*<\/h2>/i);
      const slice = report.slice(start, start + 1500);
      const genericPhrase = /AI (could|can) (automate|assist)|worth naming/i.test(slice);
      const citesSpecificFinding = /\(Part [IVX]+/i.test(slice) || /review-generation push|new-page inquiries/i.test(slice);
      if (citesSpecificFinding && !genericPhrase) {
        pass('ai-automation-not-default', 'Light AI Automation Opportunity section cites a specific, engagement-tied finding.');
      } else {
        fail('ai-automation-not-default', 'Light AI Automation Opportunity section present but does not clearly cite a specific, materially-relevant finding from this engagement. Per report-contract.md §19 (2026-08-17), this section is conditional-only and must not appear as a generic AI idea.');
      }
    }
  } else {
    fail('ai-automation-not-default', 'report.md not found.');
  }

  // --- Check 20: unfinished-research-exposure (blocking) --------------------
  // Per discover.md's No Unfinished-Research Exposure rule: Scrolly-incomplete
  // research must never be exposed client-facing, in any wording. Client-
  // access-dependent language (GSC/GA4/GBP access) is exempt.
  const UNFINISHED_RESEARCH_PATTERNS = [
    { re: /pending validation/i, label: '"Pending Validation"' },
    { re: /not evaluated this round/i, label: '"Not Evaluated This Round"' },
    { re: /requires paid research/i, label: '"requires paid research"' },
    { re: /funded validation (batch|round)/i, label: '"funded validation batch"' },
    { re: /wasn'?t run this round/i, label: '"wasn\'t run this round"' },
    { re: /tool capacity exhausted|capacity again|used up its available capacity/i, label: 'tool-capacity-exhaustion language' },
    { re: /future round/i, label: '"future round"' },
    { re: /what we still need to know/i, label: '"What We Still Need to Know" heading' },
    { re: /not been (independently )?(checked|verified|tested|retrieved) this round/i, label: '"not ... this round" disclosure' },
  ];
  const CLIENT_ACCESS_EXEMPT = /requires client access|available once you grant|granted access|search console access|analytics access|conversion.tracking access|gbp (dashboard )?access/i;
  for (const [label, doc] of [['report.md', report], ['appendix.md', appendix]]) {
    if (!doc) continue;
    const hits = [];
    for (const p of UNFINISHED_RESEARCH_PATTERNS) {
      const matches = [...doc.matchAll(new RegExp(p.re.source, p.re.flags.includes('g') ? p.re.flags : p.re.flags + 'g'))];
      for (const m of matches) {
        const context = doc.slice(Math.max(0, m.index - 150), m.index + 150);
        if (!CLIENT_ACCESS_EXEMPT.test(context)) {
          hits.push(p.label);
          break;
        }
      }
    }
    // AI Discovery scorecard: flag if present with all/nearly-all cells empty.
    const scorecardIdx = doc.search(/class="ai-scorecard"/i);
    if (scorecardIdx !== -1) {
      const slice = doc.slice(scorecardIdx, scorecardIdx + 4000);
      const notEvaluatedCount = (slice.match(/not evaluated/gi) || []).length;
      const badgeCount = (slice.match(/<span class="badge/gi) || []).length;
      if (badgeCount > 0 && notEvaluatedCount >= badgeCount * 0.8) {
        hits.push('AI Discovery Scorecard present with nearly all cells empty/Not-Evaluated (should be omitted entirely per the No Unfinished-Research Exposure rule)');
      }
    }
    if (hits.length === 0) {
      pass(`unfinished-research-exposure (${label})`, 'No client-facing exposure of Scrolly-incomplete research found.');
    } else {
      fail(`unfinished-research-exposure (${label})`, `BLOCKING: found ${[...new Set(hits)].join('; ')}. Per discover.md's No Unfinished-Research Exposure rule, Scrolly-incomplete research must never be exposed client-facing in any wording — complete the research, or omit/restructure the section, never disclose it. (Client-access-dependent language like "Requires Client Access" is exempt and not flagged.)`);
    }
  }

  // --- Report ----------------------------------------------------------------
  console.log(`\nRegression checks for "${slug}"\n${'='.repeat(40)}`);
  for (const r of results) {
    console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.name}\n       ${r.detail}`);
  }
  const failures = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failures.length}/${results.length} checks passed.`);
  process.exit(failures.length ? 1 : 0);
}

main();
