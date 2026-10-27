/**
 * The Ambition Department: link previews (Open Graph + meta description) on every page.
 *
 * Titles, descriptions and share images live in a private WP page as JSON ("Link previews data"),
 * pushed by  node og/publish.mjs , so they can change without touching this snippet.
 * Pages without their own entry use their WP title + the default description + the default card.
 * Products use their own photo and short description.
 *
 * WPCode: PHP Snippet Â· Insert method "Auto Insert" Â· Location "Run Everywhere" (front end only).
 */
if ( ! defined( 'SCXOG_DATA_ID' ) ) {
	define( 'SCXOG_DATA_ID', __DATA_ID__ );

	function scxog_data() {
		static $data = null;
		if ( null === $data ) {
			$p    = get_post( (int) SCXOG_DATA_ID );
			$data = ( $p && 'page' === $p->post_type ) ? json_decode( (string) $p->post_content, true ) : null;
			if ( ! is_array( $data ) ) {
				$data = array();
			}
		}
		return $data;
	}

	function scxog_print() {
		if ( is_admin() || is_feed() || is_404() ) {
			return;
		}
		$data  = scxog_data();
		$def   = isset( $data['default'] ) ? $data['default'] : array();
		$id    = (int) get_queried_object_id();
		$entry = ( $id && isset( $data['pages'][ (string) $id ] ) ) ? $data['pages'][ (string) $id ] : array();

		$title = ! empty( $entry['title'] ) ? $entry['title'] : ( is_singular() ? get_the_title( $id ) : ( isset( $def['title'] ) ? $def['title'] : '' ) );
		$desc  = ! empty( $entry['desc'] ) ? $entry['desc'] : '';
		$img   = ! empty( $entry['image'] ) ? $entry : array();

		if ( ! $entry && function_exists( 'is_product' ) && is_product() ) {
			$product = wc_get_product( $id );
			if ( $product ) {
				$desc = wp_trim_words( wp_strip_all_tags( $product->get_short_description() ? $product->get_short_description() : $product->get_description() ), 30, '...' );
				$src  = wp_get_attachment_image_src( $product->get_image_id(), 'large' );
				if ( $src ) {
					$img = array( 'image' => $src[0], 'w' => $src[1], 'h' => $src[2] );
				}
			}
		}
		if ( '' === $desc && isset( $def['desc'] ) ) {
			$desc = $def['desc'];
		}
		if ( ! $img && ! empty( $def['image'] ) ) {
			$img = $def;
		}
		$url = is_singular() ? get_permalink( $id ) : home_url( '/' );

		$out  = "\n<!-- Link previews -->\n";
		$out .= '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
		$out .= '<meta property="og:site_name" content="The Ambition Department">' . "\n";
		$out .= '<meta property="og:type" content="website">' . "\n";
		$out .= '<meta property="og:title" content="' . esc_attr( $title ) . '">' . "\n";
		$out .= '<meta property="og:description" content="' . esc_attr( $desc ) . '">' . "\n";
		$out .= '<meta property="og:url" content="' . esc_url( $url ) . '">' . "\n";
		if ( $img ) {
			$out .= '<meta property="og:image" content="' . esc_url( $img['image'] ) . '">' . "\n";
			if ( ! empty( $img['w'] ) ) {
				$out .= '<meta property="og:image:width" content="' . (int) $img['w'] . '">' . "\n";
				$out .= '<meta property="og:image:height" content="' . (int) $img['h'] . '">' . "\n";
			}
			$out .= '<meta property="og:image:alt" content="' . esc_attr( $title ) . '">' . "\n";
		}
		$out .= '<meta name="twitter:card" content="summary_large_image">' . "\n";
		echo $out;
	}

	add_action( 'wp_head', 'scxog_print', 5 );
}
