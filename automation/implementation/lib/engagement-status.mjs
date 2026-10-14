/**
 * The clean backend status contract a future My Account page (or anything
 * else) can consume — deliberately decoupled from any WordPress UI code.
 * Nothing in this file knows about page templates, REST controllers, or
 * account-dashboard markup; it only reads engagement.json plus the
 * artifacts each pipeline stage already produces and returns plain JSON.
 *
 * `stage` is authoritative and explicit — written by whichever script
 * transitions the engagement (see run-implementation.mjs) — rather than
 * inferred from file presence alone, since several transitions (e.g.
 * "awaiting customer approval") aren't reliably distinguishable from disk
 * state alone. Everything else here is derived/presentational.
 */

import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', '..', 'Scrolly Organic Engine');

function implDir(slug) {
  return path.join(VAULT_DIR, 'clients', slug, 'implementation');
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}
async function readJsonIfExists(p) {
  try {
    return JSON.parse(await readFile(p, 'utf8'));
  } catch {
    return null;
  }
}

const STAGE_MESSAGES = {
  created: 'Your engagement has been created. Waiting for you to connect your website.',
  awaiting_site_connection: "We're waiting for you to securely connect your WordPress site.",
  connected: 'Your site is connected. Preparing your implementation plan.',
  auditing: "We're running your SEO audit now.",
  analyzing: "We're reviewing your audit results and preparing recommended changes.",
  awaiting_customer_approval: 'A batch of changes is ready for your review and approval.',
  implementing: "We're implementing your approved changes now.",
  verifying: "We're verifying the changes were applied correctly.",
  generating_deliverables: "We're preparing your ready-to-use content and final report.",
  complete: 'Your implementation engagement is complete.',
  failed: 'Something went wrong — this engagement needs manual review.',
};

const ACTION_STAGES = {
  awaiting_site_connection: { actionType: 'connect_site', message: 'Install the Scrolly connector plugin and enter your connection token.' },
  awaiting_customer_approval: { actionType: 'approve_changes', message: 'Review and approve the proposed changes.' },
};

/**
 * @returns {Promise<{
 *   engagementId: string, productType: string, status: string,
 *   customerMessage: string, stage: string, actionRequired: boolean,
 *   actionType: string|null, actionUrl: string|null,
 *   intakeStatus: string, approvalStatus: string, implementationStatus: string,
 *   completionStatus: string, deliverableUrl: string|null
 * }>}
 */
export async function getEngagementStatus(slug) {
  const dir = implDir(slug);
  const engagement = await readJsonIfExists(path.join(dir, 'engagement.json'));
  if (!engagement) return null;

  const stage = engagement.stage || engagement.intakeStatus || 'created';
  const tasks = (await readJsonIfExists(path.join(dir, 'tasks.json'))) || [];
  const completionExists = await exists(path.join(dir, 'completion-summary.md'));
  const pendingApprovalUrl = engagement.pendingApprovalUrl || null;

  const approvalStatus = completionExists
    ? 'resolved'
    : tasks.some((t) => t.approvalState === 'pending')
    ? 'awaiting_approval'
    : tasks.length > 0
    ? 'in_progress'
    : 'not_started';

  const implementationStatus = completionExists
    ? 'complete'
    : tasks.some((t) => t.apply?.applied)
    ? 'in_progress'
    : 'not_started';

  const actionInfo = ACTION_STAGES[stage];

  return {
    engagementId: engagement.orderId || slug,
    productType: engagement.productType || 'implementation',
    status: stage,
    customerMessage: STAGE_MESSAGES[stage] || 'Your engagement is being processed.',
    stage,
    actionRequired: !!actionInfo,
    actionType: actionInfo?.actionType || null,
    actionUrl: stage === 'awaiting_customer_approval' ? pendingApprovalUrl : stage === 'awaiting_site_connection' ? engagement.connectSiteUrl || null : null,
    intakeStatus: engagement.intakeStatus || 'unknown',
    approvalStatus,
    implementationStatus,
    completionStatus: completionExists ? 'complete' : 'not_complete',
    deliverableUrl: completionExists ? `clients/${slug}/implementation/completion-summary.md` : null,
  };
}
