<?php
/**
 * NOT YET LIVE. New WPCode snippet -- paste via wp-admin > Code Snippets
 * (WPCode, "Run Everywhere") when ready. Follows the same deployment
 * pattern as the other snippets in this folder: source of truth becomes
 * the live snippet once pasted; this file is the authored/reviewed
 * version, kept for version history.
 *
 * Purpose: mirrors woocommerce-thankyou-snippet.php's existing pattern for
 * the $299 SEO Site Audit, but for the $1K Club (product 279). Right now a
 * Club buyer's WooCommerce order-received page shows nothing product-
 * specific -- this tells them plainly that their Club is available and
 * gives a direct button to My Account, where club-access-route.php's
 * "Go to $1K Club" button lives once that snippet is activated.
 *
 * Scoped to product 279 only, deliberately -- product 280 (the $1K
 * Challenge) is not launching yet and is untouched by this snippet.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'woocommerce_thankyou', function ( $order_id ) {
	if ( ! $order_id ) {
		return;
	}

	$order = wc_get_order( $order_id );
	if ( ! $order ) {
		return;
	}

	$club_product_id = 279; // "$1K Club" -- confirm in wp-admin before relying on this.

	$has_club = false;
	foreach ( $order->get_items() as $item ) {
		if ( (int) $item->get_product_id() === $club_product_id ) {
			$has_club = true;
			break;
		}
	}
	if ( ! $has_club ) {
		return; // Not a Club purchase -- don't show this on other product receipts.
	}

	if ( ! $order->has_status( array( 'processing', 'completed' ) ) ) {
		return; // Not actually paid yet -- nothing to hand off.
	}

	$my_account_url = wc_get_page_permalink( 'myaccount' );

	echo '<div style="margin:24px 0;padding:20px;border:1px solid #ddd;border-radius:8px;text-align:center;">';
	echo '<p style="margin:0 0 12px;font-weight:600;">Your $1K Club is ready</p>';
	echo '<p style="margin:0 0 16px;color:#555;font-size:14px;">Head to My Account and look for the &ldquo;Go to $1K Club&rdquo; button to get started.</p>';
	echo '<a href="' . esc_url( $my_account_url ) . '" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Go to My Account</a>';
	echo '</div>';
}, 5 );
