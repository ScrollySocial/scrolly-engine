<?php
/**
 * Scrolly — SEO Site Audit: post-purchase intake handoff.
 *
 * WHERE THIS GOES: paste into a code-snippets plugin (e.g. WPCode) as a new
 * PHP snippet, scope "Run Everywhere" / frontend, and activate it. Do not
 * paste raw into a page/post — this is PHP, not HTML. If you'd rather not
 * use a snippets plugin, this can also go in your active theme's
 * functions.php (child theme, not the parent, so it survives updates).
 *
 * WHAT IT DOES: WooCommerce is now the checkout (Stripe runs as a payment
 * method inside it), not a standalone Stripe Payment Link — so there's no
 * Stripe-hosted redirect to carry payment proof to the Tally intake form
 * anymore. WooCommerce's own order-received/thank-you page is the
 * equivalent moment. This hooks that page and, only when the order contains
 * the $299 "SEO Site Audit" product and is actually paid, shows a button to
 * the Tally form with order_id + order_key appended as URL params — Tally's
 * hidden fields pick these up, and automation/n8n/intake-and-kickoff.json
 * independently re-verifies them against the WooCommerce REST API before
 * trusting the submission (the real payment gate; this button is just the
 * hand-off).
 *
 * BEFORE ACTIVATING: the Tally form URL below (https://tally.so/r/D4OVlE,
 * the real existing intake form as of 2026-08-24) only works once its
 * hidden-fields block is updated from the old single `session_id` field to
 * two fields, `order_id` and `order_key` — see automation/tally-form-spec.md.
 * Also double-check AUDIT_PRODUCT_ID against the live product (24 as of
 * 2026-08-20 — verify in wp-admin → Products).
 */

add_action( 'woocommerce_thankyou', function ( $order_id ) {
	if ( ! $order_id ) {
		return;
	}

	$order = wc_get_order( $order_id );
	if ( ! $order ) {
		return;
	}

	$audit_product_id = 24; // "SEO Site Audit" — confirm in wp-admin before relying on this.

	$has_audit = false;
	foreach ( $order->get_items() as $item ) {
		if ( (int) $item->get_product_id() === $audit_product_id ) {
			$has_audit = true;
			break;
		}
	}
	if ( ! $has_audit ) {
		return; // Not an audit purchase — don't show the intake button on other product receipts.
	}

	if ( ! $order->has_status( array( 'processing', 'completed' ) ) ) {
		return; // Not actually paid yet (e.g. a failed/pending payment) — nothing to hand off.
	}

	$tally_base = 'https://tally.so/r/D4OVlE';

	$url = add_query_arg(
		array(
			'order_id'  => $order->get_id(),
			'order_key' => $order->get_order_key(),
		),
		$tally_base
	);

	echo '<div style="margin:24px 0;padding:20px;border:1px solid #ddd;border-radius:8px;text-align:center;">';
	echo '<p style="margin:0 0 12px;font-weight:600;">One more step — tell us about your business</p>';
	echo '<p style="margin:0 0 16px;color:#555;font-size:14px;">Your $299 SEO Site Audit is confirmed. Fill out this short intake form so we know what to look at — your report starts as soon as you submit it.</p>';
	echo '<a href="' . esc_url( $url ) . '" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Start Your Intake Form</a>';
	echo '</div>';
}, 5 );
