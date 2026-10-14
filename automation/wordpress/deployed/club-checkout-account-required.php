<?php
/**
 * NOT YET LIVE. New WPCode snippet -- paste via wp-admin > Code Snippets
 * (WPCode, "Run Everywhere") when ready. Follows the same deployment
 * pattern as the other snippets in this folder: source of truth becomes
 * the live snippet once pasted; this file is the authored/reviewed
 * version, kept for version history.
 *
 * Purpose: the $1K Club's only post-purchase access path is the "Go to
 * $1K Club" My Account button in club-access-route.php, which is gated on
 * a logged-in WordPress user owning product 279 (wc_customer_bought_product).
 * WooCommerce's default guest checkout lets a customer buy product 279
 * without ever creating an account -- leaving them with no way to reach
 * what they paid for. This snippet forces account creation, but ONLY when
 * the cart contains product 279, so every other product's checkout
 * (the $299 audit, both workbooks) keeps working exactly as it does today.
 *
 * Scoped to product 279 only, deliberately -- product 280 (the $1K
 * Challenge) is not launching yet and is untouched by this snippet.
 */

defined( 'ABSPATH' ) || exit;

if ( ! defined( 'SCROLLY_CLUB_CHECKOUT_PRODUCT_ID' ) ) {
	define( 'SCROLLY_CLUB_CHECKOUT_PRODUCT_ID', 279 );
}

if ( ! function_exists( 'scrolly_club_require_account_at_checkout' ) ) {
	function scrolly_club_require_account_at_checkout( $required ) {
		if ( is_user_logged_in() ) {
			return $required; // already has an account -- nothing to force
		}
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return $required;
		}
		foreach ( WC()->cart->get_cart() as $cart_item ) {
			if ( (int) $cart_item['product_id'] === SCROLLY_CLUB_CHECKOUT_PRODUCT_ID ) {
				return true; // cart contains the $1K Club -- must create an account to receive access
			}
		}
		return $required;
	}
}
add_filter( 'woocommerce_checkout_registration_required', 'scrolly_club_require_account_at_checkout' );
