<?php
/**
 * NOT YET LIVE. New WPCode snippet -- paste via wp-admin > Code Snippets
 * (WPCode, "Run Everywhere") when ready to test $1K Club account gating.
 * Mirrors the deployment pattern of snippets #273-275 in this same folder:
 * source of truth becomes the live snippet once pasted; this file is the
 * authored/reviewed version, kept for version history.
 *
 * Purpose: replaces the temporary order_id+order_key gate on the bridge
 * server's /club page with real WooCommerce-account-based access. Adds a
 * "Go to $1K Club" button to the My Account dashboard, shown only to a
 * logged-in customer who owns the $1K Club product -- checked with
 * WooCommerce's own wc_customer_bought_product(), the same real ownership
 * infrastructure the rest of this project already trusts (see
 * my-account-status-display.php's header comment for the identical
 * reasoning on the existing $299 product). No custom auth system, no
 * _scrolly_* meta involved in the eligibility decision.
 *
 * The button's link carries a short-lived signed token (HMAC-SHA256) so the
 * bridge server -- a separate origin WordPress sessions can't reach -- can
 * trust the customer's identity without them ever typing an order number.
 * Token format matches automation/club/lib/club-access-token.mjs exactly
 * (unpadded base64url JSON payload + "." + unpadded base64url HMAC-SHA256
 * signature over the payload part) -- if this drifts from that file, every
 * token silently fails verification (fails closed, not open, so that's
 * safe, just confusing to debug).
 *
 * ACTION NEEDED BEFORE PASTING THIS LIVE:
 *   Replace SCROLLY_CLUB_ACCESS_SECRET's placeholder below with the real
 *   value of automation/.env's CLUB_ACCESS_TOKEN_SECRET on THIS machine.
 *   They must be byte-for-byte identical. Never commit the real value to
 *   this repo file -- copy it in only on the live WPCode snippet itself.
 *
 * SCROLLY_CLUB_BRIDGE_URL now points at the production Droplet
 * (club.scrollyseo.com) instead of localhost. DO NOT PASTE THIS SNIPPET
 * LIVE until https://club.scrollyseo.com has a valid TLS certificate --
 * confirmed separately, outside this file.
 *
 * Destination path is "/club" (Module 1, "Your $1K Starting Point"), NOT
 * "/club/overview" -- verified against the actual running application,
 * not assumed. "/club/overview"'s own nav bar and page logic have no link
 * back to Module 1 onboarding anywhere, so a brand-new purchaser landed
 * there would have no in-app way to reach onboarding at all. "/club"
 * (Module 1) carries the full nav bar (Overview / Organic Growth /
 * Website & Conversion / Growth Review / Connections), so a RETURNING
 * member landing here can reach their dashboard in one click, while a
 * FIRST-TIME purchaser correctly lands on onboarding. Asymmetric cost
 * (one extra click for returning members) is the safe direction to be
 * wrong in; the reverse loses new members entirely.
 */

defined( 'ABSPATH' ) || exit;

define( 'SCROLLY_CLUB_ACCESS_SECRET', 'REPLACE_WITH_THE_REAL_VALUE_OF_AUTOMATION_ENV_CLUB_ACCESS_TOKEN_SECRET' );
define( 'SCROLLY_CLUB_PRODUCT_ID', 279 );
define( 'SCROLLY_CLUB_BRIDGE_URL', 'https://club.scrollyseo.com/club' );
// 2026-09-16: bumped from 3600 (60 min) to match automation/club/lib/
// club-access-token.mjs's DEFAULT_TTL_SECONDS -- a 60-minute token expired
// mid-session for members reading through multiple modules. Keep these two
// values in sync; a mismatch is harmless (each side only enforces its own
// signed exp claim) but confusing to debug if they drift.
define( 'SCROLLY_CLUB_TOKEN_TTL_SECONDS', 3600 * 4 );

if ( ! function_exists( 'scrolly_club_base64url' ) ) {
	function scrolly_club_base64url( $binary ) {
		return rtrim( strtr( base64_encode( $binary ), '+/', '-_' ), '=' );
	}
}

if ( ! function_exists( 'scrolly_club_sign_access_token' ) ) {
	function scrolly_club_sign_access_token( $customer_id, $email ) {
		$payload = array(
			'customerId' => $customer_id,
			'email'      => $email,
			'iat'        => time(),
			'exp'        => time() + SCROLLY_CLUB_TOKEN_TTL_SECONDS,
		);
		$payload_part = scrolly_club_base64url( wp_json_encode( $payload ) );
		$signature    = scrolly_club_base64url( hash_hmac( 'sha256', $payload_part, SCROLLY_CLUB_ACCESS_SECRET, true ) );
		return $payload_part . '.' . $signature;
	}
}

if ( ! function_exists( 'scrolly_club_render_my_account_button' ) ) {
	function scrolly_club_render_my_account_button() {
		if ( ! is_user_logged_in() ) {
			return;
		}
		$user = wp_get_current_user();

		if ( ! wc_customer_bought_product( $user->user_email, $user->ID, SCROLLY_CLUB_PRODUCT_ID ) ) {
			return; // not a Club owner -- render nothing, same fail-closed pattern as the order-status tracker box
		}

		$token = scrolly_club_sign_access_token( $user->ID, $user->user_email );
		$url   = add_query_arg( 'token', $token, SCROLLY_CLUB_BRIDGE_URL );

		echo '<p style="margin:16px 0;"><a class="button" href="' . esc_url( $url ) . '">Go to $1K Club</a></p>';
	}
}
add_action( 'woocommerce_account_dashboard', 'scrolly_club_render_my_account_button' );
