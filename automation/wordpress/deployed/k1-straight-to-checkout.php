/**
 * Scrolly: $1K Club / Challenge buttons go straight to checkout (2026-09-28).
 *
 * The store setting "Redirect to the cart page after successful addition" stays on for everything else (merch, workbooks).
 * Only the $1K Club (product 279 and its variations 582/583) and the $35 Challenge add-on (280) skip the cart, so
 * "Join the Club" / "Join the Challenge" / "Add the $1K Challenge" land on checkout in one click.
 *
 * WPCode: PHP Snippet · Auto Insert · Run Everywhere.
 */
add_filter( 'woocommerce_add_to_cart_redirect', function ( $url, $product = null ) {
	if ( $product instanceof WC_Product ) {
		$id = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();
		if ( in_array( (int) $id, array( 279, 280 ), true ) ) {
			return wc_get_checkout_url();
		}
	}
	return $url;
}, 20, 2 );
