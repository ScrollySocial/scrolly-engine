/**
 * Scrolly: Challenge shirt size at checkout (block checkout).
 *
 * Adds a required "Earned shirt size (US men's sizing)" dropdown to the WooCommerce block checkout, shown ONLY when the cart holds
 * the $1K Club + Challenge variation (583) or the members-only Challenge re-buy (280). Club-only buyers never see it.
 * The chosen size is saved on the order and shows in wp-admin order screens and order emails automatically, so Mercedes can
 * place the Printify order by hand once a member's $1K is verified.
 *
 * Uses WooCommerce's Additional Checkout Fields API with JSON-schema rules (WooCommerce 9.9+; the site runs 11.x).
 * cart.items in the rules document is the list of cart item ids, which for variations is the variation id.
 *
 * WPCode: PHP Snippet · Auto Insert · Run Everywhere. Created 2026-09-23; v4 same day: field moved to the top (contact section), debug route removed.
 * v5 2026-09-29: order section + mockup label, for the $1K checkout layout (k1-checkout.php). my-account-1k-tabs reads both locations.
 */
$scrolly_shirt_size_field = function () {
	if ( ! function_exists( 'woocommerce_register_additional_checkout_field' ) ) {
		return;
	}
	$challenge_ids = array( 583, 280 ); // $1K Club + Challenge variation, $1K Challenge re-buy.
	// Rules are JSON Schema documents evaluated against { cart, checkout, customer }; they must be rooted in type/properties.
	$cart_has_challenge = array(
		'type'       => 'object',
		'properties' => array(
			'cart' => array(
				'type'       => 'object',
				'properties' => array(
					'items' => array(
						'type'     => 'array',
						'contains' => array( 'enum' => $challenge_ids ),
					),
				),
			),
		),
	);
	$cart_has_no_challenge = array(
		'type'       => 'object',
		'properties' => array(
			'cart' => array(
				'type'       => 'object',
				'properties' => array(
					'items' => array(
						'type' => 'array',
						'not'  => array( 'contains' => array( 'enum' => $challenge_ids ) ),
					),
				),
			),
		),
	);
	$options = array();
	foreach ( array( 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL' ) as $size ) {
		$options[] = array( 'value' => $size, 'label' => $size );
	}
	woocommerce_register_additional_checkout_field(
		array(
			'id'          => 'scrolly/shirt-size',
			'label'       => "Earned shirt size (US men's sizing)",
			'location'    => 'order', // under the Challenge upgrade on the $1K checkout (k1-checkout.php); stored as _wc_other/scrolly/shirt-size
			'type'        => 'select',
			'placeholder' => 'Select your size',
			'options'     => $options,
			'required'    => $cart_has_challenge,
			'hidden'      => $cart_has_no_challenge,
		)
	);
};
// WPCode may run this after woocommerce_init has already fired, so register right away in that case.
if ( did_action( 'woocommerce_init' ) ) {
	$scrolly_shirt_size_field();
} else {
	add_action( 'woocommerce_init', $scrolly_shirt_size_field );
}
