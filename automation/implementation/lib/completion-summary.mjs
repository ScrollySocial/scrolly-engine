/**
 * Final implementation/completion documentation (implementation-agent.md
 * §13). Purely deterministic — reads what earlier components already
 * generated and QA'd, no LLM call. The actual customer-facing final
 * deliverable: one consolidated document instead of five scattered files.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTasks } from './snapshot-store.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', '..', 'Scrolly Organic Engine');

function implDir(slug) {
  return path.join(VAULT_DIR, 'clients', slug, 'implementation');
}

const FIELD_LABELS = {
  seo_title: 'SEO title tag',
  meta_description: 'Meta description',
  alt_text: 'Image alt text',
  wc_product_field: 'WooCommerce product field',
  wc_category_field: 'WooCommerce category field',
  content_append: 'Added content (FAQ/copy)',
  content_replace: 'Rewritten content',
};

export async function generateCompletionSummary(slug) {
  const tasks = await loadTasks(slug);
  const applied = tasks.filter((t) => t.apply?.applied);
  const rolledBack = applied.filter((t) => t.rollback?.rollbackVerified);
  const stillLive = applied.filter((t) => !t.rollback?.rollbackVerified);
  const rejected = tasks.filter((t) => t.approvalState === 'rejected');
  const pending = tasks.filter((t) => !t.apply?.applied && t.approvalState !== 'rejected');

  let files = [];
  try {
    files = await readdir(implDir(slug));
  } catch {
    files = [];
  }
  const path2Docs = files.filter((f) => f.startsWith('path2-'));
  const linkPlans = files.filter((f) => f === 'internal-link-plan.md');
  const briefs = files.filter((f) => f.startsWith('strategic-brief-'));

  return {
    slug,
    generatedAt: new Date().toISOString(),
    counts: { applied: applied.length, live: stillLive.length, rolledBack: rolledBack.length, rejected: rejected.length, pending: pending.length, path2Docs: path2Docs.length, linkPlans: linkPlans.length, briefs: briefs.length },
    stillLive,
    rolledBack,
    rejected,
    pending,
    path2Docs,
    linkPlans,
    briefs,
  };
}

export function renderCompletionSummary(summary) {
  const lines = [
    `# Implementation Completion Summary — ${summary.slug}`,
    '',
    `Generated ${summary.generatedAt}.`,
    '',
    '## What was implemented on your site',
    '',
  ];

  if (summary.stillLive.length === 0) {
    lines.push('_No changes are currently live (see rolled-back / pending sections below)._', '');
  } else {
    for (const t of summary.stillLive) {
      lines.push(`- **${FIELD_LABELS[t.fieldType] || t.fieldType}** — "${(t.originalValue || '(empty)').toString().slice(0, 80)}" → "${t.proposedValue.toString().slice(0, 80)}"`);
    }
    lines.push('', `All ${summary.stillLive.length} change(s) above were verified live and can be rolled back to their original value at any time — the original value is retained for every change made.`, '');
  }

  lines.push('## Ready-to-use content we prepared for you', '');
  if (summary.path2Docs.length === 0 && summary.linkPlans.length === 0 && summary.briefs.length === 0) {
    lines.push('_None generated for this engagement._', '');
  } else {
    for (const f of summary.path2Docs) lines.push(`- Ready-to-paste content: \`${f}\``);
    for (const f of summary.linkPlans) lines.push(`- Internal linking plan: \`${f}\``);
    for (const f of summary.briefs) lines.push(`- Strategic page brief: \`${f}\``);
    lines.push('');
  }

  if (summary.rejected.length > 0) {
    lines.push('## Declined changes', '', ...summary.rejected.map((t) => `- ${FIELD_LABELS[t.fieldType] || t.fieldType} (not implemented, per your decision)`), '');
  }
  if (summary.pending.length > 0) {
    lines.push('## Still awaiting review', '', ...summary.pending.map((t) => `- ${FIELD_LABELS[t.fieldType] || t.fieldType}`), '');
  }

  lines.push('## Rollback', '', 'Every applied change retains its original value. If anything needs to be reverted, that can be done individually per change, at any time.');

  return lines.join('\n');
}

export async function writeCompletionSummary(slug) {
  const summary = await generateCompletionSummary(slug);
  const doc = renderCompletionSummary(summary);
  const outPath = path.join(implDir(slug), 'completion-summary.md');
  await writeFile(outPath, doc);
  return { summary, outPath };
}
