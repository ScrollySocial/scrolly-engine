/**
 * Scrolly: permanent (301) redirects for retired pages.
 *
 * WPCode: PHP Snippet · Insert method "Auto Insert" · Location "Run Everywhere".
 * Replaces the old JavaScript forwards on these pages, so visitors and search engines go straight to the right place.
 * Keyed by page ID, so it keeps working even if a slug changes. Add a line to retire another page.
 */
add_action( 'template_redirect', function () {
	if ( is_admin() || ! is_page() ) {
		return;
	}
	$map = array(
		303 => '/1k-club/#join',  // /1k-challenge/
		305 => '/10k-club/#join', // /10k-challenge/
		307 => '/24k-club/#join', // /24k-challenge/
		314 => '/#clubs',         // /clubs/
		315 => '/#clubs',         // /challenges/
	);
	$id = (int) get_queried_object_id();
	if ( isset( $map[ $id ] ) ) {
		wp_safe_redirect( home_url( $map[ $id ] ), 301, 'Scrolly' );
		exit;
	}
} );
