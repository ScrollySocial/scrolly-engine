/**
 * Implementation task data model.
 *
 * Field set is fixed by methodology/implementation-agent.md §8 (rollback
 * requirements) and §5 (approval levels) — every task, regardless of field
 * type or path, carries enough to reconstruct what happened and reverse it.
 */

import { randomUUID } from 'node:crypto';

/** @typedef {'auto_implementable'|'implementation_ready_content'|'internal_link_plan'|'strategic_brief'} ImplementationPath */
/** @typedef {'pending'|'approved'|'rejected'|'revision_requested'} ApprovalState */

export function createTask({
  engagementSlug,
  path, // ImplementationPath
  fieldType, // e.g. 'seo_title' | 'meta_description' | 'alt_text' | 'wc_product_field' | 'wc_category_field'
  targetSite,
  targetObjectType, // 'post' | 'page' | 'media' | 'wc_product' | 'wc_category'
  targetObjectId,
  targetField,
  sourceFindingRef, // findings.json row ref, e.g. { table: 'H', index: 2 }
  rationale,
}) {
  return {
    taskId: randomUUID(),
    engagementSlug,
    path,
    fieldType,
    targetSite,
    targetObjectType,
    targetObjectId,
    targetField,
    sourceFindingRef,
    rationale,

    // Populated by propose.mjs
    originalValue: null,
    proposedValue: null,
    snapshotAt: null,

    // Populated by qa-engine.mjs
    qa: { passed: null, checks: [] },

    // Approval (Level 1 for Checkpoint 1: Mercedes-only, no customer token yet)
    approvalState: /** @type {ApprovalState} */ ('pending'),
    approvedBy: null,
    approvedAt: null,

    // Populated by apply.mjs
    apply: {
      applied: false,
      appliedAt: null,
      writeOk: null,
      verifiedAt: null,
      verifiedValue: null,
      verifiedMatch: null,
    },

    // Populated by rollback.mjs
    rollback: {
      available: false, // true once originalValue + snapshotAt are set
      rolledBackAt: null,
      rollbackVerified: null,
    },

    createdAt: new Date().toISOString(),
  };
}

export function markSnapshot(task, originalValue) {
  task.originalValue = originalValue;
  task.snapshotAt = new Date().toISOString();
  task.rollback.available = true;
  return task;
}
