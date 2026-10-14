/**
 * The shared shape every product's status adapter must produce. Deliberately
 * small — this is the "shared architecture now" half of the tracker work;
 * product-specific mapping logic (see discover-customer-status.mjs) is what
 * plugs into it, one adapter per product, added only when that product
 * actually needs the tracker.
 *
 * CUSTOMER_STATUS values are the ONLY vocabulary a customer-facing surface
 * may ever see. Nothing here carries internal detail — no error classes,
 * no provider names, no costs, no file paths, no step ids. That detail
 * lives exclusively in the admin/internal record each adapter also produces
 * (see e.g. discover-customer-status.mjs's toAdminStatus).
 */

export const CUSTOMER_STATUSES = /** @type {const} */ ([
  'intake_required',
  'information_received',
  'analysis_in_progress',
  'in_final_review',
  'action_required',
  'ready',
]);

/**
 * @typedef {Object} CustomerStatus
 * @property {string} productType
 * @property {string} orderId
 * @property {typeof CUSTOMER_STATUSES[number]} customerStatus
 * @property {string} customerMessage - calm, plain-language, no jargon
 * @property {boolean} actionRequired
 * @property {string|null} actionLabel - button/link text, e.g. "Complete your intake form"
 * @property {string|null} actionUrl - must be a known-safe external URL (e.g. the order's own Tally link) or null; never a filesystem path
 * @property {boolean} reportAvailable
 */

/** Runtime shape check — used by the sync script before anything is sent to WordPress, so a bug in an adapter can never leak an unexpected field. */
export function assertValidCustomerStatus(obj) {
  const required = ['productType', 'orderId', 'customerStatus', 'customerMessage', 'actionRequired', 'actionLabel', 'actionUrl', 'reportAvailable'];
  for (const key of required) {
    if (!(key in obj)) throw new Error(`CustomerStatus missing required field "${key}"`);
  }
  if (!CUSTOMER_STATUSES.includes(obj.customerStatus)) {
    throw new Error(`CustomerStatus.customerStatus "${obj.customerStatus}" is not one of the approved enum values: ${CUSTOMER_STATUSES.join(', ')}`);
  }
  const allowedKeys = new Set(required);
  for (const key of Object.keys(obj)) {
    if (!allowedKeys.has(key)) throw new Error(`CustomerStatus has an unexpected field "${key}" — only the approved customer-safe fields may be present`);
  }
  return true;
}
