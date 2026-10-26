/**
 * Scrolly — global header + footer (one source, every page).
 *
 * The header nav + drawer come from the "Main Menu" (theme location "Header"); the footer links come from the "Footer Menu".
 * Edit the menus in Appearance > Menus and the site updates. Menu items with the CSS class  scx-drawer-only  are shown in the
 * slide-out drawer only (not in the top bar). CSS, JS and the logo SVG are stored in three private pages so they can be
 * updated without touching this snippet.
 *
 * WPCode: PHP Snippet · Insert method "Auto Insert" · Location "Run Everywhere" (front end only).
 */
if ( ! defined( 'SCXG_CSS_ID' ) ) {
	define( 'SCXG_CSS_ID', __CSS_ID__ );
	define( 'SCXG_JS_ID', __JS_ID__ );
	define( 'SCXG_LOGO_ID', __LOGO_ID__ );

	function scxg_store( $id ) {
		$p = get_post( (int) $id );
		return ( $p && 'page' === $p->post_type ) ? (string) $p->post_content : '';
	}

	function scxg_tree( $location ) {
		$locations = get_nav_menu_locations();
		if ( empty( $locations[ $location ] ) ) {
			return array();
		}
		$items = wp_get_nav_menu_items( $locations[ $location ] );
		if ( empty( $items ) ) {
			return array();
		}
		$by = array();
		foreach ( $items as $item ) {
			$item->scxg_kids = array();
			$by[ (int) $item->ID ] = $item;
		}
		$tree = array();
		foreach ( $items as $item ) {
			$parent = (int) $item->menu_item_parent;
			if ( $parent && isset( $by[ $parent ] ) ) {
				$by[ $parent ]->scxg_kids[] = $item;
			} else {
				$tree[] = $item;
			}
		}
		return $tree;
	}

	function scxg_drawer_only( $item ) {
		return in_array( 'scx-drawer-only', (array) $item->classes, true );
	}

	function scxg_link( $item ) {
		return '<a href="' . esc_url( $item->url ) . '">' . esc_html( $item->title ) . '</a>';
	}

	function scxg_account_url() {
		return function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' );
	}

	function scxg_logo( $extra_class = '' ) {
		return '<a class="' . esc_attr( $extra_class ) . '" href="' . esc_url( home_url( '/' ) ) . '" aria-label="The Ambition Department home">' . scxg_store( SCXG_LOGO_ID ) . '</a>';
	}

	function scxg_header_html() {
		$tree   = scxg_tree( 'menu-1' );
		$nav    = '';
		$drawer = '';
		foreach ( $tree as $item ) {
			if ( ! scxg_drawer_only( $item ) ) {
				$nav .= scxg_link( $item );
			}
			$drawer .= '<li>' . scxg_link( $item );
			if ( ! empty( $item->scxg_kids ) ) {
				$drawer .= '<ul>';
				foreach ( $item->scxg_kids as $kid ) {
					$drawer .= '<li>' . scxg_link( $kid ) . '</li>';
				}
				$drawer .= '</ul>';
			}
			$drawer .= '</li>';
		}
		$acct_label = is_user_logged_in() ? 'My account' : 'Log in';
		$arrow      = '<svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M4 14L14 4M6 4h8v8"/></svg>';
		$burger     = '<svg width="26" height="24" viewBox="0 0 26 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M0 3h26M0 12h26M0 21h26"/></svg>';

		$html  = '<div class="scxg scxg-head" id="scxg-top">';
		$html .= '<header class="scxg-hdr">' . scxg_logo( 'scxg-logo' );
		$html .= '<nav aria-label="Main">' . $nav . '</nav>';
		$html .= '<div class="scxg-right"><a class="scxg-login" href="' . esc_url( scxg_account_url() ) . '"><span>' . esc_html( $acct_label ) . '</span>' . $arrow . '</a>';
		$html .= '<button class="scxg-burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="scxg-drawer" data-scxg-open>' . $burger . '</button></div></header>';
		$html .= '<div class="scxg-bg" data-scxg-close></div>';
		$html .= '<aside class="scxg-drawer" id="scxg-drawer" aria-label="Site menu" aria-hidden="true">';
		$html .= '<div class="scxg-dtop"><span>Menu</span><button class="scxg-dclose" type="button" data-scxg-close aria-label="Close menu">&times;</button></div>';
		$html .= '<ul class="top">' . $drawer . '</ul>';
		$html .= '<div class="acct"><a href="' . esc_url( scxg_account_url() ) . '">' . esc_html( $acct_label ) . '</a></div>';
		$html .= '</aside></div>';
		return $html;
	}

	function scxg_footer_html() {
		$links = '';
		foreach ( scxg_tree( 'menu-2' ) as $item ) {
			$links .= '<li>' . scxg_link( $item ) . '</li>';
		}
		$html  = '<div class="scxg"><footer class="scxg-ftr"><div class="row1">' . scxg_logo( 'logo' );
		$html .= '<nav aria-label="Footer"><ul>' . $links . '</ul></nav></div><hr>';
		$html .= '<div class="copy">&copy; ' . esc_html( gmdate( 'Y' ) ) . ' The Ambition Department. Earn Your Stripes.</div></footer></div>';
		return $html;
	}

	function scxg_print_head() {
		if ( is_admin() ) {
			return;
		}
		echo '<style id="scxg-css">' . scxg_store( SCXG_CSS_ID ) . '</style>';
	}

	function scxg_print_header() {
		if ( is_admin() ) {
			return;
		}
		echo scxg_header_html();
	}

	function scxg_print_footer() {
		if ( is_admin() ) {
			return;
		}
		// Safety net for themes that never fire wp_body_open: inject the header at the top of <body>.
		if ( ! did_action( 'wp_body_open' ) ) {
			echo '<template id="scxg-h">' . scxg_header_html() . '</template><script>(function(){var t=document.getElementById("scxg-h");if(t){document.body.insertBefore(t.content,document.body.firstChild)}})();</script>';
		}
		echo scxg_footer_html();
		echo '<script id="scxg-js">' . scxg_store( SCXG_JS_ID ) . '</script>';
	}

	add_action( 'wp_head', 'scxg_print_head', 99 );
	add_action( 'wp_body_open', 'scxg_print_header', 1 );
	add_action( 'wp_footer', 'scxg_print_footer', 1 );
}
