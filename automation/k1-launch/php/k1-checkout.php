/**
 * Scrolly: $1K Club checkout layout (block checkout, 2026-09-29).
 *
 * Restyles WooCommerce's own block checkout into the approved mockup (Downloads/scrolly-checkout-mockup.html) whenever the
 * cart is exactly one $1K Club package (product 279: variation 582 Club $40 or 583 Club + Challenge $75). Nothing about
 * payment or order processing changes: Stripe, validation, account creation, taxes and order creation are WooCommerce's.
 * Any other cart (merch, workbooks, the $35 re-buy 280, mixed carts) gets the normal checkout.
 *
 *   - Server side: wraps the checkout block in the pitch column (intro + collage + tracker, what's inside, earned shirt,
 *     FAQ) and the "Choose your path" / Challenge upgrade controls; retitles the checkout steps for this cart only.
 *   - "Choose your path" and the upgrade checkbox call WooCommerce's extensionCartUpdate (Store API), which swaps the
 *     cart line between 582 and 583 on the server. WooCommerce then re-renders: shirt size + shirt address appear only
 *     for 583 (583 is shippable; 582 is virtual), totals update, and the entitlements follow the purchased variation
 *     (my-account-1k-tabs.php reads variation 583 as "has the Challenge").
 *   - Shirt size is the existing scrolly/shirt-size field (challenge-shirt-size-checkout.php), which must be v5 (order location).
 *   - Terms: WooCommerce's terms block with its required checkbox, linked to /terms/, for this cart only.
 *
 * WPCode: PHP Snippet · Auto Insert · Run Everywhere. Needs WooCommerce 9.9+ (site runs 11.x).
 */
if ( ! defined( 'SCROLLY_K1CO_V' ) ) {
	define( 'SCROLLY_K1CO_V', '2' );
	define( 'SCROLLY_K1CO_PRODUCT', 279 );
	define( 'SCROLLY_K1CO_CLUB', 582 );
	define( 'SCROLLY_K1CO_BUNDLE', 583 );
	// Media library attachment ids: checkout collage, winner shirt front, winner shirt back.
	if ( ! defined( 'SCROLLY_K1CO_MEDIA' ) ) {
		define( 'SCROLLY_K1CO_MEDIA', array( 'collage' => 1679, 'front' => 597, 'back' => 596 ) );
	}

	/** The cart is exactly one $1K Club package, quantity 1. */
	function scrolly_k1co_cart_package() {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return '';
		}
		$items = WC()->cart->get_cart();
		if ( 1 !== count( $items ) ) {
			return '';
		}
		$item = reset( $items );
		if ( SCROLLY_K1CO_PRODUCT !== (int) $item['product_id'] || 1 !== (int) $item['quantity'] ) {
			return '';
		}
		$vid = (int) $item['variation_id'];
		return SCROLLY_K1CO_BUNDLE === $vid ? 'bundle' : ( SCROLLY_K1CO_CLUB === $vid ? 'club' : '' );
	}

	function scrolly_k1co_active() {
		static $on = null;
		if ( null !== $on ) {
			return $on;
		}
		if ( ! did_action( 'wp' ) ) {
			return false; // page not resolved yet; don't cache
		}
		$on = ! is_admin() && function_exists( 'is_checkout' ) && is_checkout() && ! is_wc_endpoint_url() && '' !== scrolly_k1co_cart_package();
		return $on;
	}

	/**
	 * Switch the $1K Club cart line to the chosen package (called by the Store API with data.package = club|bundle).
	 * The package is changed on the existing line rather than removed and re-added: re-adding runs WooCommerce's
	 * "sold individually" check, which on the live store reported "You cannot add another" even though the swap worked.
	 */
	function scrolly_k1co_set_package( $data ) {
		$want      = ( isset( $data['package'] ) && 'bundle' === $data['package'] ) ? SCROLLY_K1CO_BUNDLE : SCROLLY_K1CO_CLUB;
		$variation = wc_get_product( $want );
		if ( ! $variation ) {
			return;
		}
		$cart     = WC()->cart;
		$attrs    = $variation->get_variation_attributes();
		$contents = array();
		$found    = false;
		foreach ( $cart->get_cart_contents() as $key => $item ) {
			if ( SCROLLY_K1CO_PRODUCT !== (int) $item['product_id'] ) {
				$contents[ $key ] = $item;
				continue;
			}
			if ( $found ) { // never more than one package line
				continue;
			}
			$found = true;
			// Rebuild the line as WooCommerce would have added it: key and data_hash must match the new variation,
			// or WooCommerce drops the line on the next request ("removed because it has since been modified").
			$new_key                = $cart->generate_cart_id( SCROLLY_K1CO_PRODUCT, $want, $attrs, array() );
			$item['key']            = $new_key;
			$item['variation_id']   = $want;
			$item['variation']      = $attrs;
			$item['data']           = $variation;
			$item['data_hash']      = wc_get_cart_item_data_hash( $variation );
			$item['quantity']       = 1;
			$contents[ $new_key ]   = $item;
		}
		if ( ! $found ) {
			$cart->add_to_cart( SCROLLY_K1CO_PRODUCT, 1, $want, $variation->get_variation_attributes() );
			return;
		}
		$cart->set_cart_contents( $contents );
		$cart->set_session();
	}
	$scrolly_k1co_register = function () {
		if ( function_exists( 'woocommerce_store_api_register_update_callback' ) ) {
			woocommerce_store_api_register_update_callback( array( 'namespace' => 'scrolly-k1', 'callback' => 'scrolly_k1co_set_package' ) );
		}
	};
	// WPCode may run this after woocommerce_blocks_loaded has already fired.
	if ( did_action( 'woocommerce_blocks_loaded' ) ) {
		$scrolly_k1co_register();
	} else {
		add_action( 'woocommerce_blocks_loaded', $scrolly_k1co_register );
	}

	// A "Join" click replaces any $1K package already in the cart (one package per order; 279 is sold individually),
	// so clicking Club, going back and clicking Challenge never errors or leaves two packages in the cart.
	add_filter( 'woocommerce_add_to_cart_validation', function ( $ok, $product_id ) {
		// Links like ?add-to-cart=583 pass the variation id here, not 279.
		$adding = wc_get_product( $product_id );
		$parent = ( $adding && $adding->get_parent_id() ) ? $adding->get_parent_id() : (int) $product_id;
		if ( $ok && SCROLLY_K1CO_PRODUCT === (int) $parent && function_exists( 'WC' ) && WC()->cart ) {
			foreach ( WC()->cart->get_cart() as $key => $item ) {
				if ( SCROLLY_K1CO_PRODUCT === (int) $item['product_id'] ) {
					WC()->cart->remove_cart_item( $key );
				}
			}
		}
		return $ok;
	}, 20, 2 );

	// Buyers who already have an account never have to leave checkout to log in. If a logged-out buyer enters an email
	// that already has an account, WooCommerce would stop with "An account is already registered". Instead: skip creating
	// an account for this request, place the order as usual, then attach it to the existing account (only for $1K orders),
	// so the Club/Challenge tabs appear when they next log in. Nobody is logged in and the account's details aren't changed.
	add_filter( 'rest_request_before_callbacks', function ( $response, $handler, $request ) {
		if ( $request instanceof WP_REST_Request && '/wc/store/v1/checkout' === $request->get_route() && 'POST' === $request->get_method() && ! is_user_logged_in() ) {
			$billing = (array) $request->get_param( 'billing_address' );
			$email   = sanitize_email( $billing['email'] ?? '' );
			$user    = $email ? get_user_by( 'email', $email ) : false;
			if ( $user ) {
				$GLOBALS['scrolly_k1co_existing_user'] = (int) $user->ID;
				$request->set_param( 'create_account', false );
			}
		}
		return $response;
	}, 10, 3 );
	add_filter( 'woocommerce_checkout_registration_required', function ( $required ) {
		return empty( $GLOBALS['scrolly_k1co_existing_user'] ) ? $required : false;
	}, 99 );
	add_action( 'woocommerce_store_api_checkout_order_processed', function ( $order ) {
		$uid = (int) ( $GLOBALS['scrolly_k1co_existing_user'] ?? 0 );
		if ( ! $uid || $order->get_customer_id() ) {
			return;
		}
		$is_k1 = false;
		foreach ( $order->get_items() as $item ) {
			$is_k1 = $is_k1 || in_array( (int) $item->get_product_id(), array( SCROLLY_K1CO_PRODUCT, 280 ), true );
		}
		if ( $is_k1 ) {
			$order->set_customer_id( $uid );
			$order->add_order_note( 'Buyer checked out without logging in; order linked to the existing account for ' . $order->get_billing_email() . '.' );
			$order->save();
		}
	} );

	// "Join" buttons land straight on checkout (k1-straight-to-checkout.php), where "added to your cart" is noise.
	add_filter( 'wc_add_to_cart_message_html', function ( $message, $products ) {
		foreach ( array_keys( (array) $products ) as $id ) { // 279, or 582/583 from ?add-to-cart=583 links
			$p = wc_get_product( $id );
			if ( $p && SCROLLY_K1CO_PRODUCT === ( $p->get_parent_id() ? $p->get_parent_id() : (int) $id ) ) {
				return '';
			}
		}
		return $message;
	}, 10, 2 );

	function scrolly_k1co_money( $amount ) {
		return '$' . rtrim( rtrim( number_format( (float) $amount, 2, '.', '' ), '0' ), '.' );
	}

	function scrolly_k1co_prices() {
		$club   = wc_get_product( SCROLLY_K1CO_CLUB );
		$bundle = wc_get_product( SCROLLY_K1CO_BUNDLE );
		$c      = $club ? (float) $club->get_price() : 40;
		$b      = $bundle ? (float) $bundle->get_price() : 75;
		return array( 'club' => $c, 'bundle' => $b, 'add' => $b - $c );
	}

	function scrolly_k1co_img( $key, $alt, $class ) {
		$id  = (int) ( SCROLLY_K1CO_MEDIA[ $key ] ?? 0 );
		$src = $id ? wp_get_attachment_image_url( $id, 'full' ) : '';
		return $src ? '<img class="' . esc_attr( $class ) . '" src="' . esc_url( $src ) . '" alt="' . esc_attr( $alt ) . '" decoding="async">' : '';
	}

	// ---- retitle the checkout steps (this cart only). WooCommerce turns these block attributes into data-* the checkout reads.
	add_filter( 'render_block_data', function ( $block ) {
		if ( empty( $block['blockName'] ) || 0 !== strpos( $block['blockName'], 'woocommerce/checkout-' ) || ! scrolly_k1co_active() ) {
			return $block;
		}
		$set = array(
			'woocommerce/checkout-contact-information-block'   => array( 'title' => 'Contact information', 'description' => '' ),
			'woocommerce/checkout-payment-block'               => array( 'title' => 'Payment', 'description' => '' ),
			'woocommerce/checkout-shipping-address-block'      => array( 'title' => '', 'description' => '' ),
			'woocommerce/checkout-additional-information-block' => array( 'title' => '', 'description' => '' ),
			'woocommerce/checkout-terms-block'                 => array( 'checkbox' => true, 'text' => 'I agree to the <a href="' . esc_url( home_url( '/terms/' ) ) . '" target="_blank" rel="noopener">Terms &amp; Conditions</a>' ),
			'woocommerce/checkout-actions-block'               => array( 'showReturnToCart' => false ),
		);
		if ( isset( $set[ $block['blockName'] ] ) ) {
			$block['attrs'] = array_merge( (array) ( $block['attrs'] ?? array() ), $set[ $block['blockName'] ] );
		}
		return $block;
	} );

	// Name first, country last, "Street address" label in the address form on this checkout (WooCommerce puts country first).
	// The block checkout reads field order per country (priority becomes its index).
	add_filter( 'woocommerce_get_country_locale', function ( $locale ) {
		if ( scrolly_k1co_active() ) {
			foreach ( array_keys( WC()->countries->get_allowed_countries() ) as $cc ) {
				$locale[ $cc ]['country']   = array_merge( (array) ( $locale[ $cc ]['country'] ?? array() ), array( 'priority' => 95 ) );
				$locale[ $cc ]['address_1'] = array_merge( (array) ( $locale[ $cc ]['address_1'] ?? array() ), array( 'label' => 'Street address' ) );
			}
		}
		return $locale;
	}, 20 );

	// ---- the page around WooCommerce's checkout block
	add_filter( 'render_block', function ( $html, $block ) {
		if ( 'woocommerce/checkout' !== ( $block['blockName'] ?? '' ) || ! scrolly_k1co_active() ) {
			return $html;
		}
		$pkg   = scrolly_k1co_cart_package();
		$p     = scrolly_k1co_prices();
		$cfg   = array( 'club' => SCROLLY_K1CO_CLUB, 'bundle' => SCROLLY_K1CO_BUNDLE, 'pkg' => $pkg );
		$club  = scrolly_k1co_money( $p['club'] );
		$both  = scrolly_k1co_money( $p['bundle'] );
		$add   = scrolly_k1co_money( $p['add'] );
		$check = function ( $on ) {
			return $on ? ' checked' : '';
		};

		$intro = '<section class="k1co-intro">'
			. '<h1>Earn your first stripe.</h1>'
			. '<p class="k1co-sub">Choose the $1K Club plan or add your first 30-day Challenge attempt. Make the next move for your business.</p>'
			. '<div class="k1co-art">' . scrolly_k1co_img( 'collage', 'Scrolly $1K Club Playbook collage with desktop and phone previews', 'k1co-collage' ) . '</div>'
			. '<div class="k1co-tracker" aria-hidden="true"><div class="k1co-tracker-head"><strong>Your first $1K</strong><strong class="k1co-target">$1K</strong></div>'
			. '<div class="k1co-track"><span></span></div>'
			. '<div class="k1co-stages"><span>01 Start</span><span>02 Build</span><span>03 Progress</span><span>04 Verify</span><span>05 Stripe earned</span></div></div>'
			. '</section>';

		$extras = '<section class="k1co-extras">'
			. '<h2>What’s inside</h2>'
			. '<p class="k1co-tick"><b aria-hidden="true">✓</b><span>The $1K Club Playbook, setup checklist, and worksheets.</span></p>'
			. '<p class="k1co-tick"><b aria-hidden="true">✓</b><span>Reel and carousel templates, plus the $1K Math calculator.</span></p>'
			. '<p class="k1co-tick"><b aria-hidden="true">✓</b><span>Add the Challenge for a personal $1K Plan, weekly check-ins, and 25 current Reel ideas each week.</span></p>'
			. '<div class="k1co-earned"><div class="k1co-earned-shirt">' . scrolly_k1co_img( 'front', 'Winner shirt front', '' ) . scrolly_k1co_img( 'back', 'Winner shirt back', '' ) . '</div>'
			. '<h2>The shirt is earned.</h2>'
			. '<p>Reach $1,000 in total revenue during your 30 consecutive Challenge days, complete verification, and claim your winner shirt. Shipping is included in the lower 48.</p></div>'
			. '<div class="k1co-faq"><h2>Before you join</h2>'
			. '<details><summary>Is $1,000 guaranteed?</summary><p>No. Your results depend on your business and execution.</p></details>'
			. '<details><summary>When do the 30 days start?</summary><p>When you press “Start my 30 days” in My $1K Plan, after checkout. Your 30 consecutive days begin that day.</p></details>'
			. '<details><summary>When do I pick my shirt size?</summary><p>Shirts use US men’s sizing. Choose a preferred size at checkout. You can change it in My $1K Plan until your shirt is ordered.</p></details>'
			. '<details><summary>Can I try again?</summary><p>Additional Challenge attempts are ' . esc_html( $add ) . ' each.</p></details>'
			. '</div></section>';

		$path = '<div class="k1co-path" role="radiogroup" aria-labelledby="k1co-path-h">'
			. '<h2 id="k1co-path-h">Choose your path</h2>'
			. '<label class="k1co-option"><input type="radio" name="k1co-offer" value="club"' . $check( 'club' === $pkg ) . '><span><strong>The $1K Club</strong><small>Your plan, yours to keep. One-time.</small></span><span class="k1co-amt">' . esc_html( $club ) . '</span></label>'
			. '<label class="k1co-option"><input type="radio" name="k1co-offer" value="bundle"' . $check( 'bundle' === $pkg ) . '><span><strong>Club + Challenge</strong><small>Everything in the Club, plus one 30-day attempt.</small></span><span class="k1co-amt">' . esc_html( $both ) . '</span></label>'
			. '</div>';

		$bump = '<div class="k1co-bump"><h2>Go for your first stripe.</h2>'
			. '<p>Add your first $1K Challenge attempt for ' . esc_html( $add ) . '. Get your personal $1K Plan, weekly check-ins, and 25 current Reel ideas each week. A verified win makes you eligible to claim the exclusive shirt.</p>'
			. '<label><input type="checkbox" class="k1co-bump-check"' . $check( 'bundle' === $pkg ) . '><span>Yes, add the Challenge to my Club order: ' . esc_html( $add ) . '</span></label></div>';

		// Challenge only: the shirt ships to the billing address unless the buyer unticks this and enters another address.
		$shipto = '<div class="k1co-shipto"><h2>Potential shirt shipping address</h2>'
			. '<p class="k1co-fine">Only used if you complete and verify the Challenge, then claim the shirt. Nothing ships today.</p>'
			. '<label><input type="checkbox" class="k1co-shipto-check" checked><span>Ship my shirt to my billing address</span></label></div>';

		$lines = '<div class="k1co-lines"><div class="k1co-line"><span>$1K Club</span><strong>' . esc_html( $club ) . '</strong></div>'
			. '<div class="k1co-line k1co-chal-line"><span>First Challenge attempt</span><strong>' . esc_html( $add ) . '</strong></div></div>';

		$fine = '<p class="k1co-fine k1co-foot">One-time purchase. Results not guaranteed. Revenue before costs. Future Challenge attempts are ' . esc_html( $add ) . ' each.</p>';

		return '<div class="k1co k1co-' . esc_attr( $pkg ) . '" data-k1co="' . esc_attr( wp_json_encode( $cfg ) ) . '">'
			. '<div class="k1co-bar"><span>Secure checkout · One-time purchase</span></div>'
			. $intro . '<div class="k1co-main">' . $path . $html . $bump . $shipto . $lines . $fine . '</div>' . $extras . '</div>';
	}, 20, 2 );

	add_filter( 'body_class', function ( $classes ) {
		if ( scrolly_k1co_active() ) {
			$classes[] = 'scrolly-k1co';
		}
		return $classes;
	} );

	add_action( 'wp_enqueue_scripts', function () {
		if ( ! scrolly_k1co_active() ) {
			return;
		}
		wp_register_style( 'scrolly-k1co', false, array(), SCROLLY_K1CO_V );
		wp_enqueue_style( 'scrolly-k1co' );
		wp_add_inline_style( 'scrolly-k1co', scrolly_k1co_css() );
		wp_register_script( 'scrolly-k1co', false, array( 'wp-data', 'wp-hooks', 'wc-blocks-checkout', 'wc-blocks-data-store' ), SCROLLY_K1CO_V, true );
		wp_enqueue_script( 'scrolly-k1co' );
		wp_add_inline_script( 'scrolly-k1co', scrolly_k1co_js() );
	}, 20 );

	function scrolly_k1co_js() {
		return <<<'JS'
(function () {
	var root = document.querySelector('.k1co');
	if (!root || !window.wp || !wp.data || !window.wc || !wc.blocksCheckout) { return; }
	var cfg = JSON.parse(root.getAttribute('data-k1co'));
	var CART = 'wc/store/cart';
	var busy = false;
	function current() {
		var items = (wp.data.select(CART).getCartData() || {}).items || [];
		if (items.length !== 1) { return ''; }
		return items[0].id === cfg.bundle ? 'bundle' : (items[0].id === cfg.club ? 'club' : '');
	}
	// Cart total for the button, whole dollars without cents ($40, not $40.00).
	function total() {
		var t = (wp.data.select(CART).getCartData() || {}).totals || {};
		var n = parseInt(t.total_price || '0', 10) / Math.pow(10, t.currency_minor_unit || 0);
		var prefix = t.currency_prefix || '$';
		return prefix + (n % 1 ? n.toFixed(2) : String(n)) + (t.currency_suffix || '');
	}
	var last = null;
	function paint() {
		var pkg = current();
		var key = pkg + '|' + total();
		if (key === last) { return; }
		last = key;
		filters();
		root.classList.toggle('k1co-bundle', pkg === 'bundle');
		root.classList.toggle('k1co-club', pkg === 'club');
		root.classList.toggle('k1co-off', pkg === '');
		root.querySelectorAll('input[name="k1co-offer"]').forEach(function (r) { r.checked = r.value === pkg; });
		root.querySelector('.k1co-bump-check').checked = pkg === 'bundle';
	}
	function choose(pkg) {
		if (busy) { paint(); return; }
		if (pkg === current()) { return; }
		busy = true;
		root.classList.add('k1co-busy');
		wc.blocksCheckout.extensionCartUpdate({ namespace: 'scrolly-k1', data: { package: pkg } })
			.catch(function () {})
			.then(function () { busy = false; root.classList.remove('k1co-busy'); last = null; paint(); });
	}
	root.querySelectorAll('input[name="k1co-offer"]').forEach(function (r) {
		r.addEventListener('change', function () { choose(r.value); });
	});
	root.querySelector('.k1co-bump-check').addEventListener('change', function (e) { choose(e.target.checked ? 'bundle' : 'club'); });
	// Keyboard order: CSS order shows the upgrade box, shirt size, shirt-address toggle and shirt address after Payment,
	// so they must also sit there in the DOM, or Tab reaches them only after the place-order button (the shirt address is
	// WooCommerce's, normally above billing; it is moved within the same form). Kept in place while WooCommerce re-renders.
	var bump = root.querySelector('.k1co-bump');
	var shipto = root.querySelector('.k1co-shipto');
	function placeAfter(node, prev) {
		if (!node || !prev || prev.nextElementSibling === node) { return; }
		var had = node.contains(document.activeElement) ? document.activeElement : null;
		prev.after(node);
		if (had) { had.focus(); }
	}
	function placeBump() {
		var form = root.querySelector('.wc-block-checkout__form');
		var pay = form ? form.querySelector(':scope > .wc-block-checkout__payment-method') : null;
		if (!pay) { return; }
		placeAfter(bump, pay);
		placeAfter(shipto, form.querySelector(':scope > .wc-block-checkout__order-fields') || bump);
		placeAfter(form.querySelector(':scope > .wc-block-checkout__shipping-fields'), shipto);
	}
	new MutationObserver(placeBump).observe(root, { childList: true, subtree: true });
	placeBump();
	// Coupons show above Terms but WooCommerce renders them in the order summary, after the whole form (so after the
	// place-order button in the DOM, and in another React parent, so not moved). Tab/Shift+Tab are routed to meet them
	// where they appear: ... -> coupons -> Terms -> place order -> what follows the summary.
	var TABBABLE = 'a[href],button,input,select,textarea,iframe,summary,[tabindex]';
	function tabbables() {
		return Array.prototype.filter.call(document.querySelectorAll(TABBABLE), function (el) {
			return el.tabIndex >= 0 && !el.disabled && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
		});
	}
	document.addEventListener('keydown', function (e) {
		if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey) { return; }
		var summary = root.querySelector('.wp-block-woocommerce-checkout-order-summary-block');
		var terms = root.querySelector('.wc-block-checkout__terms') || root.querySelector('.wc-block-checkout__actions');
		if (!summary || !terms) { return; }
		var all = tabbables();
		var inSum = all.filter(function (el) { return summary.contains(el); });
		var t = all.findIndex(function (el) { return terms.contains(el); });
		if (!inSum.length || t < 1) { return; }
		var s0 = all.indexOf(inSum[0]);
		var s1 = all.indexOf(inSum[inSum.length - 1]);
		if (s0 < t) { return; } // already in visual order
		var a = document.activeElement;
		var to = null;
		if (!e.shiftKey) {
			to = a === all[t - 1] ? inSum[0] : (a === all[s1] ? all[t] : (a === all[s0 - 1] ? all[s1 + 1] : null));
		} else {
			to = a === all[t] ? all[s1] : (a === all[s0] ? all[t - 1] : (a === all[s1 + 1] ? all[s0 - 1] : null));
		}
		if (to) {
			e.preventDefault();
			to.focus();
		}
	}, true);
	// A package swap replaces the cart line; don't announce the old package as "removed from your cart".
	wp.hooks.addFilter('woocommerce_show_cart_item_removed_notice', 'scrolly-k1', function (show, item) {
		return busy ? false : show;
	});
	function filters() {
		// Re-registering clears WooCommerce's filter cache, so the button label follows the package and total.
		wc.blocksCheckout.registerCheckoutFilters('scrolly-k1', {
			placeOrderButtonLabel: function (label) {
				var pkg = current();
				return pkg === 'bundle' ? 'Get the Club + Challenge: ' + total() : (pkg === 'club' ? 'Get the $1K Club: ' + total() : label);
			},
			totalLabel: function (label) { return current() ? 'Total today' : label; }
		});
	}
	// Challenge shirt address. WooCommerce's model is "shipping first, billing same as shipping"; this checkout shows
	// billing first, so keep billing its own form and copy it into the shipping address while the box is ticked.
	var shipSame = true;
	var ADDR = ['first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'phone'];
	function syncAddress() {
		root.classList.toggle('k1co-shipsame', shipSame);
		if (current() !== 'bundle') { return; }
		var wcSame = document.querySelector('.wc-block-checkout__use-address-for-billing input');
		if (wcSame ? wcSame.checked : false) { wcSame.click(); }
		if (!shipSame) { return; }
		var c = wp.data.select(CART).getCustomerData() || {};
		var b = c.billingAddress || {};
		var s = c.shippingAddress || {};
		if (!b.country) { return; } // billing not loaded yet; never copy a blank address over the shipping one
		var differs = ADDR.some(function (k) { return (b[k] || '') !== (s[k] || ''); });
		if (differs) {
			var copy = {};
			ADDR.forEach(function (k) { copy[k] = b[k] || ''; });
			wp.data.dispatch(CART).setShippingAddress(copy);
		}
	}
	root.querySelector('.k1co-shipto-check').addEventListener('change', function (e) {
		shipSame = e.target.checked;
		syncAddress();
		if (!shipSame) {
			// Open the shirt address as a form, not WooCommerce's filled-in address card.
			setTimeout(function () {
				var edit = document.querySelector('.wc-block-checkout__shipping-fields .wc-block-components-address-card__edit');
				if (edit) { edit.click(); }
			}, 50);
		}
	});
	// Copy only after typing pauses, so the copy rides along with WooCommerce's own address update instead of adding
	// requests per keystroke (the host answers bursts with 429 "Too Many Requests", shown as "Something went wrong").
	var syncTimer = null;
	function syncSoon() {
		clearTimeout(syncTimer);
		syncTimer = setTimeout(syncAddress, 1200);
	}
	// ...and right before the order is placed, so the shirt address is never a stale copy.
	['pointerdown', 'keydown'].forEach(function (type) {
		document.addEventListener(type, function (e) {
			if (e.target.closest ? e.target.closest('.wc-block-components-checkout-place-order-button') : false) {
				clearTimeout(syncTimer);
				syncAddress();
			}
		}, true);
	});
	filters();
	wp.data.subscribe(function () { paint(); syncSoon(); }, CART);
	paint();
	syncAddress();
})();
JS;
	}

	function scrolly_k1co_css() {
		return <<<'CSS'
body.scrolly-k1co{background:#f7f3ec}
body.scrolly-k1co .page-content>h1:first-of-type,body.scrolly-k1co .page-content>.wp-block-heading:first-of-type,body.scrolly-k1co h1:has(+ .k1co),body.scrolly-k1co .wp-block-post-title,body.scrolly-k1co .entry-title{display:none!important}
body.scrolly-k1co .page-content>.k1co{max-width:1040px!important;padding:0!important}
.k1co{--ink:#0a1930;--cream:#f7f3ec;--mist:#dfe4f0;--sky:#4da3ff;--muted:#4a4e66;--field:#8f8a83;--line:#d9d3ca;font-family:'Jost',system-ui,Arial,sans-serif;color:var(--ink);background:#fff;max-width:1040px;margin:clamp(16px,3vw,32px) auto 64px;box-shadow:0 12px 34px rgba(10,25,48,.10);border-radius:18px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;grid-template-areas:"bar bar" "intro main" "extras main";grid-template-rows:auto auto 1fr;text-align:left}
.k1co *{box-sizing:border-box}
.k1co p,.k1co summary,.k1co label,.k1co-main .wc-block-components-checkout-step__content{font-size:16px}
.k1co-main input[type=checkbox],.k1co-main input[type=radio]{min-height:0!important}
.k1co h1,.k1co h2{font-family:'Instrument Serif',Georgia,serif;font-weight:400;text-transform:none;letter-spacing:-.01em;color:var(--ink);margin:0}
.k1co h1{font-size:46px;line-height:1.02;margin:0 0 12px}
.k1co h2{font-size:30px;line-height:1.08;margin:24px 0 10px}
.k1co p{line-height:1.45;margin:0 0 12px;color:var(--ink)}
.k1co-bar{grid-area:bar;height:52px;display:flex;align-items:center;justify-content:flex-end;padding:0 30px;border-bottom:1px solid var(--line);font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.k1co-intro{grid-area:intro;padding:34px 34px 0;border-right:1px solid var(--line);background:var(--cream)}
.k1co-extras{grid-area:extras;padding:0 34px 46px;border-right:1px solid var(--line);background:var(--cream)}
.k1co-main{grid-area:main;background:#fff;padding:32px;display:flex;flex-direction:column;min-width:0}
.k1co-sub{font-size:16px;max-width:410px}
.k1co-art{margin:16px -12px 17px}
.k1co-collage{display:block;width:100%;height:auto}
.k1co-tracker{padding:16px 18px 18px;background:var(--mist);color:var(--ink);border-radius:14px;margin-bottom:20px}
.k1co-tracker-head{display:flex;justify-content:space-between;align-items:flex-end;font-family:'Instrument Serif',Georgia,serif;font-weight:400;font-size:24px}
.k1co-target{color:var(--ink);font-size:32px}
.k1co-track{height:12px;background:#fff;border-radius:999px;margin:13px 0 8px;overflow:hidden}
.k1co-track span{display:block;width:39%;height:100%;background:var(--sky);border-radius:999px}
.k1co-stages{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;font-size:15px;font-weight:500;line-height:1.2}
.k1co-stages span{text-align:center}
.k1co-tick{display:flex;gap:10px;margin:14px 0;font-size:17px;line-height:1.35}
.k1co-tick b{font-size:19px;color:var(--sky)}
.k1co-earned{background:#fff;border-radius:14px;box-shadow:inset 0 0 0 1px var(--line);padding:22px;margin-top:18px;overflow:hidden}
.k1co-earned h2{margin-top:0}
.k1co-earned-shirt{float:right;width:142px;height:115px;display:flex;align-items:center;margin:-10px -8px 4px 8px}
.k1co-earned-shirt img{width:70px;height:108px;object-fit:contain;filter:drop-shadow(0 2px 3px #0004)}
.k1co-faq{margin-top:26px}
.k1co-faq details{border-bottom:1px solid var(--line);padding:12px 0}
.k1co-faq summary{cursor:pointer;font-weight:700}
.k1co-faq details p{margin:10px 0 0}
.k1co-main>h2:first-child,.k1co-path h2{margin-top:0}
.k1co-option{display:flex;gap:11px;align-items:flex-start;padding:14px;border:1px solid var(--field);border-radius:12px;margin:9px 0;cursor:pointer;background:#fff}
.k1co-option:has(input:checked){border:2px solid var(--ink);background:var(--mist)}
.k1co-option input{accent-color:var(--ink);margin:3px 0 0;min-height:0}
.k1co-option small{display:block;color:var(--muted);line-height:1.35;margin-top:4px;font-size:15px}
.k1co-option strong{display:block;font-size:16px;font-weight:700;line-height:1.3}
.k1co-amt{margin-left:auto;font-weight:600;font-size:16px}
.k1co-busy .k1co-path,.k1co-busy .k1co-bump{opacity:.6;pointer-events:none}
.k1co-bump{background:var(--mist);border-radius:14px;padding:18px;margin:8px 0 15px}
.k1co-bump h2{margin:0 0 8px}
.k1co-bump label{display:flex;align-items:flex-start;gap:10px;background:#fff;border-radius:10px;padding:12px;margin-top:12px;cursor:pointer;font-weight:700}
.k1co-bump input{accent-color:var(--ink);margin-top:3px;min-height:0}
.k1co-lines{margin-top:4px}
/* Billing address sits inside Contact information: no heading of its own. */
.k1co-main .wc-block-checkout__billing-fields .wc-block-components-checkout-step__heading,.k1co-main .wc-block-checkout__billing-fields .wc-block-components-checkout-step__description{display:none}
.k1co-main .wc-block-checkout__billing-fields{margin-top:12px}
/* Password strength meter in brand colours (WooCommerce uses red/yellow/green): sky = weak, navy = OK/strong; label text navy. */
.k1co-main .wc-block-components-password-strength .wc-block-components-password-strength__meter{color:var(--sky)!important}
.k1co-main .wc-block-components-password-strength .wc-block-components-password-strength__meter[value="3"],.k1co-main .wc-block-components-password-strength .wc-block-components-password-strength__meter[value="4"]{color:var(--ink)!important}
.k1co-main .wc-block-components-password-strength .wc-block-components-password-strength__result{color:var(--ink)!important}
/* Country moved below ZIP: WooCommerce gives it no top gap because it is normally first. */
.k1co-main .wc-block-components-address-form .wc-block-components-address-form__country{margin-top:12px!important}
/* Challenge shirt address: our toggle replaces WooCommerce's "Use same address for billing". */
.k1co-shipto{display:none}
.k1co-bundle .k1co-shipto{display:block}
.k1co-shipto h2{margin:24px 0 6px}
.k1co-shipto label{display:flex;align-items:flex-start;gap:10px;font-weight:700;cursor:pointer;margin:4px 0 8px}
.k1co-shipto input{accent-color:var(--ink);margin-top:3px}
.k1co-main .wc-block-checkout__use-address-for-billing{display:none!important}
.k1co-main .wc-block-checkout__shipping-fields .wc-block-components-checkout-step__heading{display:none}
.k1co-shipsame .k1co-main .wc-block-checkout__shipping-fields,.k1co-club .k1co-main .wc-block-checkout__shipping-fields{display:none!important}
.k1co-line{display:flex;justify-content:space-between;margin:10px 0;font-size:16px}
.k1co-chal-line{display:none}
.k1co-bundle .k1co-chal-line{display:flex}
.k1co p.k1co-fine{font-size:15px;color:var(--muted);line-height:1.4}
.k1co-off .k1co-path,.k1co-off .k1co-bump,.k1co-off .k1co-lines{display:none}
/* Flatten WooCommerce's checkout so its steps and our pieces stack in mockup order inside .k1co-main. */
.k1co-main .wp-block-woocommerce-checkout,.k1co-main .wc-block-checkout,.k1co-main .wc-block-components-sidebar-layout,.k1co-main .wc-block-components-main,.k1co-main .wc-block-checkout__form,.k1co-main .wc-block-components-sidebar,.k1co-main .wp-block-woocommerce-checkout-fields-block,.k1co-main .wp-block-woocommerce-checkout-totals-block{display:contents!important}
.k1co-main>*,.k1co-main .wc-block-checkout__form>*,.k1co-main .wc-block-components-main>*,.k1co-main .wc-block-components-sidebar>*{order:50}
.k1co-path{order:1}
.k1co-main .wc-block-components-notices,.k1co-main .wc-block-store-notices{order:2}
.k1co-main .wc-block-checkout__contact-fields{order:3}
.k1co-main .wc-block-checkout__billing-fields{order:4}
.k1co-main .wc-block-checkout__payment-method{order:5}
.k1co-main .k1co-bump{order:6}
.k1co-main .wc-block-checkout__order-fields{order:7}
.k1co-main .k1co-shipto{order:8}
.k1co-main .wc-block-checkout__shipping-fields{order:9}
.k1co-lines{order:9}
.k1co-main .wp-block-woocommerce-checkout-order-summary-block,.k1co-main .wc-block-components-order-summary{order:10}
.k1co-main .wc-block-checkout__terms{order:11}
.k1co-main .wc-block-checkout__actions{order:12}
.k1co-foot{order:13;margin-top:10px}
/* Hidden for this cart: express pay (skips the Terms box), the method picker (one method per zone), item list and subtotal (the lines above say the same). */
.k1co-main .wp-block-woocommerce-checkout-express-payment-block,.k1co-main .wc-block-components-express-payment,.k1co-main .wc-block-components-express-payment-continue-rule,.k1co-main .wc-block-checkout__shipping-option,.k1co-main .wc-block-components-order-summary__button-text,.k1co-main .wc-block-components-checkout-order-summary__title,.k1co-main .wp-block-woocommerce-checkout-order-summary-cart-items-block,.k1co-main .wc-block-components-order-summary,.k1co-main .wp-block-woocommerce-checkout-order-summary-subtotal-block,.k1co-main .wp-block-woocommerce-checkout-order-summary-shipping-block,.k1co-main .wc-block-checkout__order-notes,.k1co-main .wc-block-checkout__actions .checkout-order-summary-block-fill-wrapper{display:none!important}
.k1co-main .wp-block-woocommerce-checkout-order-summary-block{border:0!important;padding:0!important;margin:0!important;background:none!important}
.k1co-main .wc-block-components-totals-wrapper{border:0!important;padding:0!important}
.k1co-main .wc-block-components-totals-footer-item{border-top:1px solid var(--line);padding-top:14px!important;margin-top:4px;font-family:'Instrument Serif',Georgia,serif}
.k1co-main .wc-block-components-totals-footer-item .wc-block-components-totals-item__label{font-weight:400;font-size:28px}
.k1co-main .wc-block-components-totals-footer-item .wc-block-components-totals-item__value{font-weight:400;font-size:28px}
.k1co-main .wc-block-components-checkout-step{margin:0;padding:0;border:0}
.k1co-main .wc-block-components-checkout-step__heading{margin:24px 0 10px}
.k1co-main .wc-block-components-checkout-step__title{font-family:'Instrument Serif',Georgia,serif!important;font-weight:400!important;font-size:30px!important;text-transform:none;letter-spacing:-.01em;color:var(--ink)}
.k1co-main .wc-block-components-checkout-step__container:before,.k1co-main .wc-block-components-checkout-step__heading:before,.k1co-main .wc-block-components-checkout-step:after{display:none!important}
.k1co-main .wc-block-components-checkout-step__description{font-size:15px;color:var(--muted);line-height:1.35;margin-bottom:8px}
.k1co-main .wc-block-checkout__order-fields .wc-block-components-checkout-step__heading{display:none}
.k1co-main .wc-block-checkout__order-fields .wc-block-components-select-input:after{content:"Shirts use US men’s sizing. We save this preference now; you can confirm it after a verified win.";display:block;font-size:15px;color:var(--muted);line-height:1.4;margin-top:6px}
.k1co-main .wc-block-checkout__terms{margin:17px 0 8px;font-size:15px;font-weight:500}
.k1co-main .wc-block-checkout__terms a{color:var(--ink);text-decoration:underline}
.k1co-main .wc-block-checkout__actions_row{display:block}
body.scrolly-k1co .k1co-main .wc-block-components-button.wc-block-components-checkout-place-order-button{width:100%;background:var(--sky)!important;color:var(--ink)!important;border:0!important;border-radius:999px!important;padding:19px!important;font:700 17px/1 'Jost',sans-serif!important;letter-spacing:.06em;min-height:0}
body.scrolly-k1co .k1co-main .wc-block-components-button.wc-block-components-checkout-place-order-button:hover{background:var(--ink)!important;color:#fff!important}
body.scrolly-k1co .k1co-main .wc-block-components-button.wc-block-components-checkout-place-order-button *{color:inherit!important}
/* WooCommerce's own small text up to the 15px floor; fields in the site style. */
.k1co-main .wc-block-checkout__guest-checkout-notice,.k1co-main .wc-block-components-checkbox__label,.k1co-main .wc-block-components-address-card,.k1co-main .wc-block-components-address-card *,.k1co-main .wc-block-components-address-form__address_2-toggle,.k1co-main .wc-block-components-radio-control__label,.k1co-main .wc-block-components-radio-control-accordion-option span,.k1co-main .wc-block-checkout__terms a,.k1co-main .wc-block-components-panel__button{font-size:15px!important}
.k1co-main .wc-block-components-text-input input,.k1co-main .wc-block-components-combobox .components-combobox-control input,.k1co-main .wc-blocks-components-select__select{border:1px solid var(--field)!important;border-radius:10px!important;font-family:'Jost',sans-serif!important;color:var(--ink)!important}
.k1co-main .wc-block-components-text-input label,.k1co-main .wc-blocks-components-select__label{font-size:15px!important;color:var(--muted)!important}
.k1co-main .wc-block-components-radio-control-accordion-option,.k1co-main .wc-block-components-radio-control__option{border-color:var(--field)!important;border-radius:12px!important}
@media (max-width:780px){
	.k1co{grid-template-columns:1fr;grid-template-areas:"bar" "intro" "main" "extras";grid-template-rows:auto;margin:0 auto;border-radius:0}
	.k1co-bar{padding:0 17px;justify-content:flex-start}
	.k1co-intro{padding:22px 22px 0;border:0}
	.k1co-intro .k1co-tracker{margin:0}
	.k1co-art{margin:12px -10px 0}
	.k1co-main{padding:20px}
	.k1co-extras{padding:22px;border:0}
	.k1co h1{font-size:38px}
	.k1co-stages{grid-template-columns:repeat(3,1fr);row-gap:4px}
	.k1co-earned-shirt{width:100px;height:90px}
	.k1co-earned-shirt img{width:50px;height:88px}
}
CSS;
	}
}
