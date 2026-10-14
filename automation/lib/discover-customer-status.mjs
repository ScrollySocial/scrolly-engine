/**
 * Discover ($299 report) adapter — the first (and currently only) product
 * plugged into customer-status-contract.mjs. Maps the real, internal
 * clients/<slug>/order.json record into:
 *   (a) a CustomerStatus (customer-safe, per the approved mapping table)
 *   (b) an AdminStatus (full internal detail, for the operator dashboard only)
 *
 * Approved mapping (per Mercedes, 2026-08-28):
 *   no order.json yet (paid, intake missing)      -> "intake_required"
 *   internal status ready_to_run                   -> "information_received"
 *   internal status running                         -> "analysis_in_progress"
 *   internal status needs_attention, recoverable,
 *     no customer action required                  -> "analysis_in_progress"
 *     if a report/appendix draft already exists     -> "in_final_review"
 *     (never the internal error class either way)
 *   internal status awaiting_final_review           -> "in_final_review"
 *   failure.customerActionRequired === true          -> "action_required"
 *   approved / delivering / delivered, or
 *     approval.approvedAt + reportPdfPath set        -> "ready"
 *
 * Nothing here ever reads/echoes: failure.errorClass, failure.message,
 * costUsd, dataforseoCallsUsed, currentStep, reportPdfPath/appendixPdfPath
 * (raw paths), or any other internal field into the CustomerStatus half.
 */
import { assertValidCustomerStatus } from './customer-status-contract.mjs';

const PRODUCT_TYPE = 'discover';

const MESSAGES = {
  intake_required: 'We need your information to begin.',
  information_received: 'We’ve received your information and your report is queued.',
  analysis_in_progress: 'Your analysis is in progress.',
  in_final_review: 'Your report is in final review.',
  action_required: 'We need a bit more information from you to continue.',
  ready: 'Your report is ready.',
};

const READY_INTERNAL_STATUSES = new Set(['approved', 'delivering', 'delivered']);

/**
 * @param {object|null} order - the real order.json object, or null if none exists yet (pre-intake)
 * @param {{ tallyIntakeUrl?: string|null }} [context] - the order-linked Tally URL, if already known (from the WooCommerce order itself, not from order.json)
 * @returns {import('./customer-status-contract.mjs').CustomerStatus}
 */
export function toCustomerStatus(order, context = {}) {
  const orderId = order?.orderId || context.orderId || null;

  let customerStatus;
  let actionRequired = false;
  let actionLabel = null;
  let actionUrl = null;
  let reportAvailable = false;

  if (!order) {
    // No order.json exists yet -- paid but intake not yet received (or
    // Discover hasn't reached the point of creating one). Offer the intake
    // link whenever it's known.
    customerStatus = 'intake_required';
    if (context.tallyIntakeUrl) {
      actionRequired = true;
      actionLabel = 'Complete your intake form';
      actionUrl = context.tallyIntakeUrl;
    }
  } else if (READY_INTERNAL_STATUSES.has(order.status) || (order.approval?.approvedAt && order.reportPdfPath)) {
    customerStatus = 'ready';
    reportAvailable = true;
    actionLabel = 'View your report';
    // actionUrl intentionally left for the caller (sync script) to fill in
    // with the real WooCommerce-mediated download URL once that route
    // exists -- this module never knows about WordPress URLs or file paths.
  } else if (order.failure?.customerActionRequired === true) {
    customerStatus = 'action_required';
    actionRequired = true;
    actionLabel = 'Provide more information';
    // actionUrl: no concrete mechanism exists yet for this case (see
    // methodology/discover-v1-known-followups.md) -- left null rather than guessed.
  } else if (order.status === 'needs_attention') {
    // Per explicit instruction: an internal, recoverable needs_attention
    // (no customer action required) NEVER exposes the error class. Which
    // calm state to show depends on how far the run actually got -- a
    // report/appendix draft on disk means there's something to review;
    // otherwise the honest framing is that analysis is still in progress.
    customerStatus = order.reportPdfPath || order.appendixPdfPath ? 'in_final_review' : 'analysis_in_progress';
  } else if (order.status === 'awaiting_final_review') {
    customerStatus = 'in_final_review';
  } else if (order.status === 'running') {
    customerStatus = 'analysis_in_progress';
  } else if (order.status === 'ready_to_run') {
    customerStatus = 'information_received';
  } else {
    // 'paid' | 'awaiting_intake' | any other/unrecognized internal status
    customerStatus = 'intake_required';
    if (context.tallyIntakeUrl) {
      actionRequired = true;
      actionLabel = 'Complete your intake form';
      actionUrl = context.tallyIntakeUrl;
    }
  }

  const result = {
    productType: PRODUCT_TYPE,
    orderId: orderId != null ? String(orderId) : '',
    customerStatus,
    customerMessage: MESSAGES[customerStatus],
    actionRequired,
    actionLabel,
    actionUrl,
    reportAvailable,
  };
  assertValidCustomerStatus(result);
  return result;
}

/**
 * Full internal detail, for the operator dashboard only. Never sent to
 * WordPress, never sent to a customer. Deliberately a superset that keeps
 * everything order.json already has, plus the last-synced WordPress
 * projection (if any) so an operator can see whether the customer-facing
 * copy is current.
 */
export function toAdminStatus(order) {
  if (!order) return { productType: PRODUCT_TYPE, internalStatus: 'no_order_json', order: null };
  return {
    productType: PRODUCT_TYPE,
    internalStatus: order.status,
    currentStep: order.currentStep,
    lastCheckpoint: order.lastCheckpoint,
    failure: order.failure,
    costUsd: order.costUsd,
    dataforseoCallsUsed: order.dataforseoCallsUsed,
    approval: order.approval,
    delivery: order.delivery,
    reportPdfPath: order.reportPdfPath,
    appendixPdfPath: order.appendixPdfPath,
    timestamps: order.timestamps,
    wpSync: order.wpSync || null,
  };
}
