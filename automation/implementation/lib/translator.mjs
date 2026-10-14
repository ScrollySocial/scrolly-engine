/**
 * findings.json -> implementation tasks (Path 1, Checkpoint-1 field types only:
 * seo_title, meta_description, alt_text, wc_product_field, wc_category_field).
 *
 * KNOWN GAP, not a blocker for Checkpoint 1: findings.md/findings.json
 * describe WHAT is wrong ("Title tag is generic") but Discover has no
 * concept of WordPress post/media IDs, so a finding alone can't say which
 * object to write to. For a single-page site (Mulberry Creek) that mapping
 * is trivial and supplied explicitly per engagement via `siteMap` below.
 * For a multi-page Realistic-scope site this needs a real answer — most
 * likely tagging findings.json rows with the actual page URL at Discover
 * time (a small, additive report-contract.md change, same spirit as the
 * findings.json addition itself) rather than inferring it here from prose.
 * Flagged for the Realistic-scope build, not solved in Checkpoint 1.
 */

import { createTask } from './task-schema.mjs';

const RULES = [
  { fieldType: 'seo_title', match: /title tag/i, objectType: 'post' },
  { fieldType: 'meta_description', match: /meta description/i, objectType: 'post' },
  { fieldType: 'alt_text', match: /alt text|alt attribute/i, objectType: 'media' },
];

/**
 * @param {object[]} findingsRows - parsed findings.json (or backfilled equivalent)
 * @param {{engagementSlug: string, targetSite: string, siteMap: Record<string, {objectType: string, objectId: number|string}>}} ctx
 */
export function translateFindingsToTasks(findingsRows, ctx) {
  const tasks = [];

  findingsRows.forEach((row, index) => {
    if (row.table !== 'H') return; // Checkpoint-1 field types all live in Category H (technical/on-page) in this schema.
    const haystack = `${row.finding} ${row.recommended_action}`;
    const rule = RULES.find((r) => r.match.test(haystack));
    if (!rule) return;

    const target = ctx.siteMap[rule.objectType === 'media' ? 'primary_media' : 'primary_page'];
    if (!target) return; // No site-map entry for this object type — skip rather than guess.

    tasks.push(
      createTask({
        engagementSlug: ctx.engagementSlug,
        path: 'auto_implementable',
        fieldType: rule.fieldType,
        targetSite: ctx.targetSite,
        targetObjectType: target.objectType,
        targetObjectId: target.objectId,
        targetField: rule.fieldType,
        sourceFindingRef: { table: row.table, index },
        rationale: row.recommended_action,
      })
    );
  });

  return tasks;
}
