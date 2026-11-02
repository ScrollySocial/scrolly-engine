<?php
/**
 * Chat Manager affiliates: only Chat Manager buyers can apply (2026-11-02).
 *
 * Runs before SliceWP's own sign-up handler (priority 50). If the applicant's account or email has no paid
 * Chat Manager order, it shows a message and stops the sign-up, so no account or affiliate is created.
 * Buyers still land as Pending and wait for approval (SliceWP setting).
 *
 * Paste into WPCode as a PHP snippet, "Run Everywhere". Decisions: vault products/chat-manager/affiliate-program.md.
 */
add_action( 'slicewp_user_action_register_affiliate', function () {

	$product_id = 1764; // Chat Manager

	if ( ! function_exists( 'wc_customer_bought_product' ) ) {
		return;
	}

	if ( is_user_logged_in() ) {
		$user_id = get_current_user_id();
		$email   = wp_get_current_user()->user_email;
	} else {
		$user_id = 0;
		$email   = isset( $_POST['user_email'] ) ? sanitize_email( wp_unslash( $_POST['user_email'] ) ) : '';
	}

	// Empty email: let SliceWP's own required-field check answer.
	if ( ! $user_id && ! $email ) {
		return;
	}

	if ( wc_customer_bought_product( $email, $user_id, $product_id ) ) {
		return;
	}

	remove_action( 'slicewp_user_action_register_affiliate', 'slicewp_user_action_register_affiliate', 50 );

	$message = '<p>' . sprintf(
		'The affiliate program is open to Chat Manager buyers, and we couldn\'t find a Chat Manager order for <strong>%s</strong>.',
		esc_html( $email )
	) . '</p><p>Use the email you bought with, or <a href="' . esc_url( wc_get_page_permalink( 'myaccount' ) ) . '">log in</a> first. Bought with a different email? <a href="' . esc_url( home_url( '/contact/' ) ) . '">Contact us</a>.</p>';

	slicewp_user_notices()->register_notice( 'chat_manager_buyers_only', $message, 'error' );
	slicewp_user_notices()->display_notice( 'chat_manager_buyers_only' );

}, 10 );
