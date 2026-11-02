<?php
/**
 * Chat Manager affiliates: $40 a sale from an affiliate's 3rd sale (2026-11-02).
 *
 * SliceWP free pays one fixed rate ($30, set in SliceWP → Settings → Commissions). This raises a new sale
 * commission to $40 once the affiliate already has 2 sale commissions that are pending, unpaid or paid.
 * Rejected ones (refunds, tests) don't count. Earlier commissions are never changed.
 *
 * Paste into WPCode as a PHP snippet, "Run everywhere". Decisions: vault products/chat-manager/affiliate-program.md.
 */
add_filter( 'slicewp_calculate_commission_amount', function ( $commission_amount, $amount, $args ) {

	$tier_rate  = 40;
	$tier_after = 2; // sales already earned before the higher rate starts

	if ( empty( $args['type'] ) || $args['type'] !== 'sale' || empty( $args['affiliate_id'] ) ) {
		return $commission_amount;
	}

	// Only the flat rate is replaced, so a percentage setting or another plugin's change is left alone.
	if ( slicewp_get_setting( 'commission_rate_type_sale' ) !== 'fixed_amount' || (float) $commission_amount !== (float) slicewp_get_setting( 'commission_rate_sale' ) ) {
		return $commission_amount;
	}

	$earned = slicewp_get_commissions( array(
		'affiliate_id' => absint( $args['affiliate_id'] ),
		'type'         => 'sale',
		'status'       => array( 'pending', 'unpaid', 'paid' ),
	), true );

	return (int) $earned >= $tier_after ? $tier_rate : $commission_amount;

}, 10, 3 );
