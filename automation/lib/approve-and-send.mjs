/**
 * The operator dashboard's single "Approve & Send" action: approve, email
 * the real report+appendix (via build-resend-payload.mjs's client-delivery
 * mode and a real Resend API call), confirm Resend accepted the send, and
 * only then mark the order Delivered -- which also syncs the customer-
 * facing WordPress tracker (see mark-delivered.mjs, called at the end of
 * this flow, unchanged).
 *
 * Extracted out of bridge-server.mjs (which now just calls this) so the
 * Resend call and the two child-process scripts it shells out to
 * (build-resend-payload.mjs, mark-delivered.mjs) can be injected/stubbed
 * and the whole flow unit-tested -- same philosophy as wp-tracker-sync.mjs's
 * stubbed global.fetch. No real network call, no real email, ever, from
 * the test suite (see test/approve-and-send.test.mjs).
 *
 * Ordering is deliberate and is the actual fix over the prior
 * implementation (which called recordApproval + syncOrderToWordPress
 * BEFORE even attempting the Resend send): nothing is approved, nothing is
 * marked delivered, and the customer tracker is not touched until Resend
 * has genuinely confirmed acceptance. On any failure before that point,
 * order.status is left exactly where it was (normally
 * awaiting_final_review) -- a genuine, deliberate operator retry (clicking
 * the same button again) is the only way forward, never an automatic one.
 * recordDeliveryFailure records what happened, without touching status,
 * for the dashboard/audit trail.
 */
import { existsSync } from 'node:fs';
import { loadOrder, recordApproval, recordDeliveryFailure, resolveVaultRelativePath } from './order-state.mjs';

export class ApproveAndSendError extends Error {}

/**
 * @param {string} slug
 * @param {{ runScript: (scriptName: string, args: string[]) => Promise<string> }} deps
 *   runScript must run the given script (from automation/n8n/scripts/) with
 *   the given args and resolve with its trimmed stdout, or reject on a
 *   non-zero exit -- exactly bridge-server.mjs's existing runScript().
 */
export async function approveAndSend(slug, { runScript }) {
  if (!slug) throw new ApproveAndSendError('Missing "slug".');
  if (typeof runScript !== 'function') throw new ApproveAndSendError('approveAndSend requires a runScript dependency.');

  // Freshly reloaded from disk -- never a cached/prior read.
  const order = await loadOrder(slug);
  if (!order) throw new ApproveAndSendError(`No order.json found for slug "${slug}"`);
  if (order.status !== 'awaiting_final_review') {
    throw new ApproveAndSendError(`Order "${slug}" is not awaiting final review (current status: "${order.status}") — refusing to send.`);
  }

  // Hard requirement: both PDFs must genuinely exist on disk right now --
  // never trust order.json's path fields alone, and never let a missing
  // deliverable reach build-resend-payload.mjs's silent-omission behavior
  // (it drops a missing attachment rather than failing the send).
  if (!order.reportPdfPath || !existsSync(resolveVaultRelativePath(order.reportPdfPath))) {
    throw new ApproveAndSendError(`Order "${slug}" has no report.pdf on disk — refusing to approve/send.`);
  }
  if (!order.appendixPdfPath || !existsSync(resolveVaultRelativePath(order.appendixPdfPath))) {
    throw new ApproveAndSendError(`Order "${slug}" has no appendix.pdf on disk — refusing to approve/send.`);
  }

  let payload;
  try {
    const payloadOut = await runScript('build-resend-payload.mjs', ['client-delivery', slug]);
    payload = JSON.parse(payloadOut);
  } catch (err) {
    await recordDeliveryFailure(slug, order.productType, { reason: 'payload_build_failed', message: err.message });
    throw new ApproveAndSendError(`Failed to build the delivery email for "${slug}": ${err.message}`);
  }

  // Belt-and-braces on top of the disk checks above: never send an email
  // that ended up with fewer than both PDF attachments.
  if (!Array.isArray(payload.attachments) || payload.attachments.length < 2) {
    await recordDeliveryFailure(slug, order.productType, {
      reason: 'attachments_incomplete',
      message: `Expected 2 PDF attachments (report + appendix), got ${payload.attachments ? payload.attachments.length : 0}.`,
    });
    throw new ApproveAndSendError(`Refusing to send "${slug}" — the built email is missing one or both PDF attachments.`);
  }

  let resendRes;
  try {
    resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    await recordDeliveryFailure(slug, order.productType, { reason: 'resend_request_failed', message: err.message });
    throw new ApproveAndSendError(`Resend request failed for "${slug}": ${err.message}`);
  }

  if (!resendRes.ok) {
    const errText = await resendRes.text().catch(() => '');
    await recordDeliveryFailure(slug, order.productType, {
      reason: 'resend_rejected',
      message: `HTTP ${resendRes.status}: ${errText.slice(0, 300)}`,
    });
    throw new ApproveAndSendError(`Resend send failed (${resendRes.status}): ${errText.slice(0, 300)}`);
  }
  const resendBody = await resendRes.json().catch(() => ({}));

  // Resend has now confirmed acceptance -- and only now do we approve and
  // mark delivered. mark-delivered.mjs syncs the customer tracker itself,
  // AFTER delivery, not before.
  await recordApproval(slug, order.productType, { approvedBy: 'dashboard' });
  const markOut = await runScript('mark-delivered.mjs', [slug]);
  const result = JSON.parse(markOut);
  return { ...result, resendId: resendBody.id || null };
}
