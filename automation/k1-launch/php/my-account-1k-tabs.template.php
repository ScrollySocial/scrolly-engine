/**
 * Scrolly: $1K Club + Challenge member tabs in WooCommerce My Account (launch version, 2026-09-26).
 *
 * GENERATED FILE: edit automation/k1-launch/php/my-account-1k-tabs.template.php and run
 * `node automation/k1-launch/build.mjs`. The build inlines the bundled plan logic (reused
 * unchanged from automation/club/lib: Router, $1K Math, Mini Evaluation, First Priority,
 * Growth Review diagnosis) into scrolly_k1_app_js().
 *
 * Adds two My Account tabs, shown only to buyers:
 *   - "My $1K Plan" (anyone who bought product 279, any package): Start Here answers (saved as
 *     user meta scrolly_k1_profile) -> My $1K Plan rendered in the browser, $1K Math calculator,
 *     self-input number log + history.
 *     Challenge buyers also get "Start my 30 days", Day X of 30, and progress toward $1,000 inside their window.
 *   - "This Week's Reels" (Club + Challenge variation 583 or the re-buy product 280): renders private page 633, which
 *     Mercedes edits each week (the 25 reel templates).
 * Replaces the old "Go to $1K Club" button snippet (#288), which linked to the never-deployed Club app.
 * Data lives in user meta (scrolly_k1_plan, scrolly_k1_log, scrolly_k1_chal); ownership is WooCommerce's own order data.
 *
 * WPCode: PHP Snippet · Auto Insert · Run Everywhere.
 */
if ( ! defined( 'SCROLLY_K1_PRODUCT' ) ) {
	define( 'SCROLLY_K1_PRODUCT', 279 );
	define( 'SCROLLY_K1_CHAL_VARIATION', 583 );
	define( 'SCROLLY_K1_REBUY', 280 );
	define( 'SCROLLY_K1_REELS_PAGE', 633 );      // private page: this week's 25 fresh Reel opportunities (replaced each weekly drop)
	define( 'SCROLLY_K1_CAROUSELS_PAGE', 845 );  // private page: 30 evergreen carousel templates (automation/k1-launch/content)
	define( 'SCROLLY_K1_STORIES_PAGE', 846 );    // private page: 30 evergreen Story templates (automation/k1-launch/content)
	define( 'SCROLLY_K1_EP_PLAN', 'my-1k-plan' );
	define( 'SCROLLY_K1_EP_REELS', 'weekly-reels' );
	define( 'SCROLLY_K1_EP_CHECKIN', 'weekly-check-in' );
	define( 'SCROLLY_K1_EP_NUMBERS', 'my-numbers' );
	define( 'SCROLLY_K1_ENDPOINTS_V', '3' ); // bump whenever an endpoint is added, so rewrite rules are rebuilt once

	/** What this customer owns: club, challenge, and their most recent Challenge order id. */
	function scrolly_k1_access( $user_id ) {
		$out = array( 'club' => false, 'challenge' => false, 'chal_order' => 0, 'chal_paid' => 0 );
		if ( ! $user_id || ! function_exists( 'wc_get_orders' ) ) {
			return $out;
		}
		$orders = wc_get_orders( array( 'customer_id' => $user_id, 'status' => array( 'wc-completed', 'wc-processing' ), 'limit' => -1, 'orderby' => 'date', 'order' => 'ASC' ) );
		foreach ( $orders as $order ) {
			foreach ( $order->get_items() as $item ) {
				$pid = (int) $item->get_product_id();
				$vid = (int) $item->get_variation_id();
				if ( SCROLLY_K1_PRODUCT === $pid ) {
					$out['club'] = true;
				}
				if ( SCROLLY_K1_CHAL_VARIATION === $vid || SCROLLY_K1_REBUY === $pid ) {
					$out['challenge']  = true;
					$out['chal_order'] = $order->get_id();
					$paid              = $order->get_date_paid() ? $order->get_date_paid() : $order->get_date_created();
					$out['chal_paid']  = $paid ? $paid->getTimestamp() : time();
				}
			}
		}
		return $out;
	}

	/** Challenge window for the latest Challenge order: null until the member presses Start. */
	function scrolly_k1_window( $user_id, $access ) {
		if ( ! $access['challenge'] ) {
			return null;
		}
		$c = get_user_meta( $user_id, 'scrolly_k1_chal', true );
		if ( ! is_array( $c ) || (int) ( $c['order'] ?? 0 ) !== (int) $access['chal_order'] ) {
			return array( 'started' => false );
		}
		$start = (int) $c['start'];
		$end   = $start + 30 * DAY_IN_SECONDS;
		$day   = (int) floor( ( current_time( 'timestamp' ) - $start ) / DAY_IN_SECONDS ) + 1;
		return array( 'started' => true, 'start' => $start, 'end' => $end, 'day' => max( 1, min( 30, $day ) ), 'over' => current_time( 'timestamp' ) >= $end );
	}

	function scrolly_k1_money( $v ) {
		return '$' . number_format( (float) $v, ( floor( (float) $v ) == (float) $v ) ? 0 : 2 );
	}

	// ---- Challenge lifecycle (port of automation/club/lib/challenge-lifecycle.mjs computeChallengeStatus)
	// Same status names, $1,000 goal, 30-day window, and 14-day claim grace period, and the same achievement shape as
	// club-state.mjs (claim, verified, verifiedAt, verificationMethod, rewardChoice pending|accepted|declined, merchUnlocked).
	// One deliberate difference: the original only allowed a claim after day 30; here a claim opens as soon as $1,000 is logged.
	define( 'SCROLLY_K1_GOAL', 1000 );
	define( 'SCROLLY_K1_CLAIM_GRACE_DAYS', 14 );
	define( 'SCROLLY_K1_ADMIN_EMAIL', 'hello@scrollyseo.com' );

	/** Revenue logged with a date inside the Challenge window (refunds are logged as negative amounts). */
	function scrolly_k1_window_revenue( $log, $w ) {
		$sum = 0;
		if ( $w && ! empty( $w['started'] ) ) {
			foreach ( $log as $e ) {
				$t = strtotime( $e['date'] . ' 12:00:00' );
				if ( $t >= $w['start'] && $t < $w['end'] ) {
					$sum += (float) $e['rev'];
				}
			}
		}
		return round( $sum, 2 );
	}

	/** not_started | active | claim_available | stripe_submitted | stripe_verified | completed | expired */
	function scrolly_k1_status( $chal, $w, $revenue ) {
		if ( ! $w || empty( $w['started'] ) ) {
			return 'not_started';
		}
		$ach = is_array( $chal['achievement'] ?? null ) ? $chal['achievement'] : array();
		if ( ! empty( $ach['verified'] ) ) {
			return 'stripe_verified';
		}
		if ( ! empty( $ach['claim'] ) ) {
			return 'stripe_submitted';
		}
		$met = $revenue >= SCROLLY_K1_GOAL;
		if ( ! $w['over'] ) {
			return $met ? 'claim_available' : 'active';
		}
		if ( ! $met ) {
			return 'completed';
		}
		$days_past = (int) floor( ( current_time( 'timestamp' ) - $w['end'] ) / DAY_IN_SECONDS ) + 1;
		return $days_past <= SCROLLY_K1_CLAIM_GRACE_DAYS ? 'claim_available' : 'expired';
	}

	/** Customer-facing labels for the internal statuses. */
	function scrolly_k1_status_label( $status ) {
		$labels = array(
			'not_started'      => 'Ready to start',
			'active'           => 'In progress',
			'claim_available'  => '$1K reached: submit your proof',
			'stripe_submitted' => 'Proof submitted: under review',
			'stripe_verified'  => 'Verified winner',
			'completed'        => 'Completed',
			'expired'          => 'Completed',
		);
		return $labels[ $status ] ?? $status;
	}

	/** Winner shirt size: the member's own latest choice (My $1K Plan), else the size picked at checkout. */
	function scrolly_k1_shirt_size( $uid, $order_id ) {
		$mine = (string) get_user_meta( $uid, 'scrolly_k1_shirt_size', true );
		return $mine ? $mine : scrolly_k1_order_shirt_size( $order_id );
	}

	/** Shirt size chosen at checkout (block checkout additional field scrolly/shirt-size), if the order has one. */
	function scrolly_k1_order_shirt_size( $order_id ) {
		$order = $order_id ? wc_get_order( $order_id ) : null;
		if ( ! $order ) {
			return '';
		}
		foreach ( array( '_wc_other/scrolly/shirt-size', '_wc_contact/scrolly/shirt-size' ) as $key ) {
			$v = $order->get_meta( $key );
			if ( $v ) {
				return (string) $v;
			}
		}
		return '';
	}

	/** The Challenge card: progress + milestones + the step for the current lifecycle state. */
	function scrolly_k1_challenge_card( $uid, $a, $w, $log, $profile ) {
		$chal   = get_user_meta( $uid, 'scrolly_k1_chal', true );
		$chal   = is_array( $chal ) ? $chal : array();
		$rev    = scrolly_k1_window_revenue( $log, $w );
		$status = scrolly_k1_status( $chal, $w, $rev );
		$ach    = is_array( $chal['achievement'] ?? null ) ? $chal['achievement'] : array();
		$price  = (float) ( $profile['price'] ?? 0 );
		$h      = '<div class="sec black" id="k1-challenge">';

		if ( 'not_started' === $status ) {
			return $h . '<h2>Your 30-day Challenge</h2><p>Start when you’re ready. Your 30 consecutive days begin today when you press start. Hit $1,000 in qualifying revenue inside those 30 days to earn your stripe.</p>'
				. scrolly_k1_form_open( 'start' ) . '<button class="btn teal" type="submit">Start my 30 days</button></form>' . scrolly_k1_size_form( scrolly_k1_shirt_size( $uid, (int) $a['chal_order'] ) ) . '</div>';
		}

		// Primary display: day, revenue, what is left, milestones.
		$remaining = max( 0, SCROLLY_K1_GOAL - $rev );
		$more      = ( $remaining > 0 && $price > 0 ) ? (int) ceil( $remaining / $price ) : 0;
		$pct       = max( 0, min( 100, round( $rev / SCROLLY_K1_GOAL * 100 ) ) );
		$h .= '<p class="chip">' . esc_html( scrolly_k1_status_label( $status ) ) . '</p>';
		$h .= '<h2>' . ( $w['over'] ? 'Your 30 days are done' : 'Day ' . (int) $w['day'] . ' of 30' ) . '</h2>';
		$h .= '<div class="big">' . esc_html( scrolly_k1_money( $rev ) ) . ' <span style="font-size:.45em">of $1,000</span></div>';
		$gap_line = $remaining <= 0 ? 'You passed $1,000.'
			: ( $w['over'] ? esc_html( scrolly_k1_money( $remaining ) ) . ' short of $1,000.'
				: esc_html( scrolly_k1_money( $remaining ) ) . ' to go' . ( $more ? ', about ' . (int) $more . ' more ' . ( 1 === $more ? 'sale' : 'sales' ) . ' at your ' . esc_html( scrolly_k1_money( $price ) ) . ' average.' : '.' ) );
		$h .= '<p>' . $gap_line
			. ' <span class="note" style="color:#fff">(' . esc_html( gmdate( 'M j', $w['start'] ) ) . ' to ' . esc_html( gmdate( 'M j', $w['end'] - DAY_IN_SECONDS ) ) . ')</span></p>';
		$h .= '<div class="track" role="img" aria-label="' . (int) $pct . ' percent of $1,000"><i style="width:' . (int) $pct . '%"></i></div><ul class="milestones">';
		foreach ( array( 250, 500, 750, 1000 ) as $m ) {
			$h .= '<li class="' . ( $rev >= $m ? 'hit' : '' ) . '">' . ( $rev >= $m ? '✓ ' : '' ) . esc_html( scrolly_k1_money( $m ) ) . '</li>';
		}
		$h .= '</ul>';

		// A declined review is shown until the next submission.
		$last_review = ! empty( $ach['reviews'] ) ? end( $ach['reviews'] ) : null;
		if ( $last_review && 'not_verified' === $last_review['decision'] && in_array( $status, array( 'active', 'claim_available', 'completed', 'expired' ), true ) ) {
			$h .= '<div class="warn" style="color:#000">We could not verify your last submission' . ( $last_review['reason'] ? ': ' . esc_html( $last_review['reason'] ) : '.' ) . '</div>';
		}

		if ( 'active' === $status ) {
			$h .= '<p>Keep going. Log sales as they come in, and do your weekly check-in.</p>';
		} elseif ( 'claim_available' === $status ) {
			$h .= '<h3>You reached $1,000. Submit your proof to earn your stripe.</h3>';
			$h .= '<p>' . ( $w['over'] || 30 === (int) $w['day'] ? 'Submit now, or within ' . SCROLLY_K1_CLAIM_GRACE_DAYS . ' days of your Challenge ending.' : 'You can submit now. No need to wait for day 30.' ) . '</p>';
			$h .= scrolly_k1_form_open( 'claim', true ) . '<div class="proof">';
			$h .= '<label for="k1-claimed">Qualifying revenue in your 30 days ($)</label><input id="k1-claimed" name="claimed" type="number" min="0" step="0.01" value="' . esc_attr( $rev ) . '" required>';
			$h .= '<label for="k1-proof" style="margin-top:12px">Screenshots or PDFs of your sales records (up to 5 files, 8 MB each)</label><input id="k1-proof" name="proof[]" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple required>';
			$h .= '<p class="note" style="color:#fff">From Stripe, Shopify, Etsy, Square, PayPal, your booking software, or invoices. Sales can be processed anywhere; Instagram is how people found you.</p>';
			$h .= '<p class="note" style="color:#fff"><strong>Only upload what we need to verify your Challenge revenue.</strong> We need to see the dates and the qualifying sale amounts. Crop or cover account numbers, customer names, addresses, payment details, and anything else private that is not needed. Files are emailed to us for review and not stored on the site.</p>';
			$h .= '<label for="k1-cnote" style="margin-top:12px">Anything we should know? (optional)</label><textarea id="k1-cnote" name="note"></textarea>';
			$h .= '<label class="chk" style="margin-top:12px;color:#fff"><input type="checkbox" name="confirm" value="1" required> These sales are dated inside my 30 days and total at least $1,000, not counting sales tax, shipping I charged, or refunds.</label>';
			$h .= '</div><button class="btn teal" type="submit">Submit my proof</button></form>';
		} elseif ( 'stripe_submitted' === $status ) {
			$claim = $ach['claim'];
			$h .= '<h3>Proof received. We are reviewing it.</h3><p>You submitted ' . esc_html( scrolly_k1_money( $claim['claimedRevenueUsd'] ) ) . ' on ' . esc_html( wp_date( 'M j', strtotime( $claim['claimedAt'] ) ) ) . ' (' . count( (array) $claim['files'] ) . ' ' . ( 1 === count( (array) $claim['files'] ) ? 'file' : 'files' ) . '). This page updates when it is verified.</p>';
		} elseif ( 'stripe_verified' === $status ) {
			$h .= '<h3>You earned your stripe. Verified $1K winner.</h3>';
			$choice = $ach['rewardChoice'] ?? 'pending';
			if ( ! empty( $ach['merchOrdered'] ) ) {
				$h .= '<p>Your winner shirt has been ordered. Watch your email for tracking.</p>';
			} elseif ( 'accepted' === $choice ) {
				$s  = $ach['shipping'];
				$h .= '<p>Shirt confirmed: size ' . esc_html( $s['size'] ) . ', shipping to ' . esc_html( $s['name'] . ', ' . $s['city'] . ', ' . $s['country'] ) . '. We will email you when it ships.</p>';
			} elseif ( 'declined' === $choice ) {
				$h .= '<p>You chose not to receive the shirt. Your win still counts.</p>';
			}
			if ( empty( $ach['merchOrdered'] ) && 'accepted' !== $choice ) {
				$order = wc_get_order( (int) ( $chal['order'] ?? 0 ) );
				$size  = scrolly_k1_shirt_size( $uid, (int) ( $chal['order'] ?? 0 ) );
				$pre   = array(
					'name'     => $order ? trim( $order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name() ) : '',
					'address1' => $order ? $order->get_shipping_address_1() : '', 'address2' => $order ? $order->get_shipping_address_2() : '',
					'city'     => $order ? $order->get_shipping_city() : '', 'state' => $order ? $order->get_shipping_state() : '',
					'postcode' => $order ? $order->get_shipping_postcode() : '', 'country' => $order ? $order->get_shipping_country() : 'US',
				);
				// After a decline, the form stays available (they can change their mind) but tucked away.
				$h .= ( 'declined' === $choice ? '<details><summary style="color:#fff">Changed your mind? Claim your shirt</summary>' : '<h3>Claim your winner shirt</h3>' )
					. '<p class="note" style="color:#fff">Free shipping in the lower 48. Anywhere else, we will email you to arrange shipping.</p>' . scrolly_k1_form_open( 'reward' ) . '<input type="hidden" name="choice" value="accepted"><div class="grid proof">';
				$h .= '<div><label for="k1-size">Shirt size (Adult Men\'s)</label><select id="k1-size" name="size" required>';
				foreach ( array( 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL' ) as $sz ) {
					$h .= '<option' . selected( $size, $sz, false ) . '>' . $sz . '</option>';
				}
				$h .= '</select></div>';
				foreach ( array( 'name' => 'Full name', 'address1' => 'Address', 'address2' => 'Apartment, suite (optional)', 'city' => 'City', 'state' => 'State', 'postcode' => 'ZIP / postcode', 'country' => 'Country code (e.g. US)' ) as $k => $label ) {
					$h .= '<div><label for="k1-ship-' . $k . '">' . esc_html( $label ) . '</label><input id="k1-ship-' . $k . '" name="ship_' . $k . '" value="' . esc_attr( $pre[ $k ] ) . '"' . ( in_array( $k, array( 'address2', 'state' ), true ) ? '' : ' required' ) . '></div>';
				}
				$h .= '</div><button class="btn teal" type="submit">Send my shirt</button></form>' . ( 'declined' === $choice ? '</details>' : '' );
				if ( 'declined' !== $choice ) {
					$h .= scrolly_k1_form_open( 'reward' ) . '<input type="hidden" name="choice" value="declined"><button class="x" style="color:#fff;margin-top:12px" type="submit">No thanks, I do not want the shirt</button></form>';
				}
			}
		} else { // completed or expired: finished without a verified win
			$h .= '<h3>Your 30 days are complete.</h3><p>You made ' . esc_html( scrolly_k1_money( $rev ) ) . ' toward $1,000 (' . (int) $pct . '%).' . ( 'expired' === $status ? ' The window to submit proof has closed.' : '' ) . ' That is real progress, and your plan, check-ins, and numbers all stay here.</p>';
			$h .= '<div id="k1-final-focus"></div>';
			$h .= '<p>Before your next attempt, look back at your check-ins: which weeks brought inquiries or sales, and what were you posting then? Start there.</p>';
			$retry = scrolly_k1_retry_url();
			$h .= $retry
				? '<a class="btn teal" href="' . esc_url( $retry ) . '">Start another 30 days ($35)</a>'
				: '<p class="note" style="color:#fff">A new 30-day attempt ($35) opens soon. We will email you when it is available.</p>';
		}
		if ( empty( $ach['merchOrdered'] ) && 'accepted' !== ( $ach['rewardChoice'] ?? '' ) && ! in_array( $status, array( 'completed', 'expired' ), true ) ) {
			$h .= scrolly_k1_size_form( scrolly_k1_shirt_size( $uid, (int) $a['chal_order'] ) );
		}
		return $h . '</div>';
	}

	/** Change the winner shirt size any time before the shirt is ordered. */
	function scrolly_k1_size_form( $current ) {
		$h = '<details style="margin-top:16px"><summary style="color:#fff">Your stripe shirt size: ' . esc_html( $current ? $current : 'not chosen' ) . ' (change)</summary>' . scrolly_k1_form_open( 'size' ) . '<label for="k1-mysize" style="color:#fff;margin-top:10px">Shirt size (Adult Men\x27s, Comfort Colors 1717)</label><select id="k1-mysize" name="size" style="max-width:220px">';
		foreach ( array( 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL' ) as $sz ) {
			$h .= '<option' . selected( $current, $sz, false ) . '>' . $sz . '</option>';
		}
		return $h . '</select><button class="btn teal" type="submit">Save size</button></form></details>';
	}

	/** Retry = a new $35 Challenge (product 280). Returns the add-to-cart URL once 280 is published, otherwise null. */
	function scrolly_k1_retry_url() {
		return get_post_status( SCROLLY_K1_REBUY ) === 'publish' ? add_query_arg( 'add-to-cart', SCROLLY_K1_REBUY, wc_get_checkout_url() ) : null;
	}

	// ---- checkout: an account is required, because access lives in My Account (replaces club-checkout-account-required.php)
	function scrolly_k1_cart_has_k1() {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return false;
		}
		foreach ( WC()->cart->get_cart() as $item ) {
			if ( in_array( (int) $item['product_id'], array( SCROLLY_K1_PRODUCT, SCROLLY_K1_REBUY ), true ) ) {
				return true;
			}
		}
		return false;
	}
	add_filter( 'woocommerce_checkout_registration_required', function ( $required ) {
		return ( ! is_user_logged_in() && scrolly_k1_cart_has_k1() ) ? true : $required;
	} );

	// The $35 Challenge (product 280) is an add-on for people who already own the $1K Club.
	add_filter( 'woocommerce_add_to_cart_validation', function ( $ok, $product_id ) {
		if ( SCROLLY_K1_REBUY === (int) $product_id && ! scrolly_k1_access( get_current_user_id() )['club'] ) {
			wc_add_notice( 'The $35 Challenge is for $1K Club members. Log in to the account you bought the Club with, or get the Club + Challenge together.', 'error' );
			return false;
		}
		return $ok;
	}, 10, 2 );
	add_action( 'woocommerce_check_cart_items', function () {
		if ( ! function_exists( 'WC' ) || ! WC()->cart || scrolly_k1_access( get_current_user_id() )['club'] ) {
			return;
		}
		foreach ( WC()->cart->get_cart() as $key => $item ) {
			if ( SCROLLY_K1_REBUY === (int) $item['product_id'] ) {
				WC()->cart->remove_cart_item( $key );
				wc_add_notice( 'The $35 Challenge is for $1K Club members. Log in to the account you bought the Club with, or get the Club + Challenge together.', 'error' );
			}
		}
	} );

	/** Where a Club-only member adds the Challenge: the $35 add-on once it is published, otherwise the sales page. */
	function scrolly_k1_add_challenge_url() {
		return get_post_status( SCROLLY_K1_REBUY ) === 'publish' ? add_query_arg( 'add-to-cart', SCROLLY_K1_REBUY, wc_get_checkout_url() ) : home_url( '/1k-club/#join' );
	}

	// ---- order received page: where to go next (replaces club-thankyou-snippet.php)
	add_action( 'woocommerce_thankyou', function ( $order_id ) {
		$order = $order_id ? wc_get_order( $order_id ) : null;
		if ( ! $order || ! $order->has_status( array( 'processing', 'completed' ) ) ) {
			return;
		}
		$club = false;
		$chal = false;
		foreach ( $order->get_items() as $item ) {
			$pid = (int) $item->get_product_id();
			$club = $club || SCROLLY_K1_PRODUCT === $pid;
			$chal = $chal || SCROLLY_K1_CHAL_VARIATION === (int) $item->get_variation_id() || SCROLLY_K1_REBUY === $pid;
		}
		if ( ! $club && ! $chal ) {
			return;
		}
		$plan = wc_get_account_endpoint_url( SCROLLY_K1_EP_PLAN );
		echo '<div style="margin:24px 0;padding:24px;border-radius:16px;background:#000;color:#fff">';
		echo '<p style="margin:0 0 8px;font-weight:800;font-size:20px;color:#fff">' . ( $chal ? 'You’re in. Your $1K Challenge is ready.' : 'You’re in. Your $1K Club is ready.' ) . '</p>';
		echo '<p style="margin:0 0 16px;color:#fff">' . ( $chal
			? 'Open My $1K Plan to answer a few questions about your business, get your plan, and start your 30 days when you’re ready. Your playbook PDF is in Downloads.'
			: 'Your playbook PDF is in Downloads, and your $1K Math calculator is in My $1K Plan.' ) . '</p>';
		echo '<a href="' . esc_url( $plan ) . '" style="display:inline-block;background:#94ece1;color:#000;padding:12px 24px;border-radius:32px;text-decoration:none;font-weight:800">Open My $1K Plan</a> ';
		echo '<a href="' . esc_url( wc_get_account_endpoint_url( 'downloads' ) ) . '" style="display:inline-block;color:#fff;padding:12px 16px;font-weight:700">Go to Downloads</a>';
		echo '<p style="margin:14px 0 0;font-size:14px;color:#fff;opacity:.85">Your access is saved to your account under ' . esc_html( $order->get_billing_email() ) . '. To come back later, log in at ' . esc_html( wc_get_page_permalink( 'myaccount' ) ) . ' (use “Lost your password?” if you need a new one).</p>';
		echo '</div>';
	}, 5 );

	// ---- endpoints + menu
	add_action( 'init', function () {
		foreach ( array( SCROLLY_K1_EP_PLAN, SCROLLY_K1_EP_REELS, SCROLLY_K1_EP_CHECKIN, SCROLLY_K1_EP_NUMBERS ) as $ep ) {
			add_rewrite_endpoint( $ep, EP_ROOT | EP_PAGES );
		}
		if ( get_option( 'scrolly_k1_endpoints_v' ) !== SCROLLY_K1_ENDPOINTS_V ) {
			flush_rewrite_rules( false );
			update_option( 'scrolly_k1_endpoints_v', SCROLLY_K1_ENDPOINTS_V );
		}
	} );
	add_filter( 'woocommerce_get_query_vars', function ( $vars ) {
		foreach ( array( SCROLLY_K1_EP_PLAN, SCROLLY_K1_EP_REELS, SCROLLY_K1_EP_CHECKIN, SCROLLY_K1_EP_NUMBERS ) as $ep ) {
			$vars[ $ep ] = $ep;
		}
		return $vars;
	} );
	add_filter( 'woocommerce_endpoint_' . SCROLLY_K1_EP_PLAN . '_title', function () { return 'My $1K Plan'; } );
	add_filter( 'woocommerce_endpoint_' . SCROLLY_K1_EP_REELS . '_title', function () { return 'Challenge Content'; } );
	add_filter( 'woocommerce_endpoint_' . SCROLLY_K1_EP_CHECKIN . '_title', function () { return 'Weekly Check-in'; } );
	add_filter( 'woocommerce_endpoint_' . SCROLLY_K1_EP_NUMBERS . '_title', function () { return 'My Numbers'; } );

	// Menu: addresses and payment methods live inside Account details for everyone. $1K members get their tabs first and
	// no Dashboard (it isn't the $1K dashboard; the real one is the Club app, later).
	add_filter( 'woocommerce_account_menu_items', function ( $items ) {
		unset( $items['edit-address'], $items['payment-methods'] );
		$a = scrolly_k1_access( get_current_user_id() );
		if ( ! $a['club'] ) {
			return $items;
		}
		unset( $items['dashboard'] );
		$new = array( SCROLLY_K1_EP_PLAN => 'My $1K Plan' );
		if ( $a['challenge'] ) {
			$new[ SCROLLY_K1_EP_CHECKIN ] = 'Weekly Check-in';
			$new[ SCROLLY_K1_EP_NUMBERS ] = 'My Numbers';
			$new[ SCROLLY_K1_EP_REELS ]   = 'Challenge Content';
		}
		return $new + $items;
	}, 20 );
	add_action( 'woocommerce_before_edit_account_form', function () {
		echo '<p style="margin:0 0 18px"><a href="' . esc_url( wc_get_account_endpoint_url( 'edit-address' ) ) . '">Billing and shipping addresses</a> · <a href="' . esc_url( wc_get_account_endpoint_url( 'payment-methods' ) ) . '">Saved payment methods</a></p>';
	} );
	// My Account layout: wider page, a slim menu column, and a wide content column (all account pages).
	add_action( 'wp_head', function () {
		if ( ! function_exists( 'is_account_page' ) || ! is_account_page() || ! is_user_logged_in() ) {
			return;
		}
		echo '<style id="scrolly-k1-account-layout">body.woocommerce-account .page-content>.woocommerce{max-width:1240px!important}body.woocommerce-account .woocommerce-MyAccount-navigation{float:left;width:190px!important;margin-right:0}body.woocommerce-account .woocommerce-MyAccount-navigation ul{list-style:none;margin:0;padding:0}body.woocommerce-account .woocommerce-MyAccount-navigation li{margin:0 0 4px}body.woocommerce-account .woocommerce-MyAccount-navigation li a{display:block;padding:9px 14px;border-radius:10px;text-decoration:none!important;font-weight:700}body.woocommerce-account .woocommerce-MyAccount-navigation li.is-active a{background:#000;color:#fff!important}body.woocommerce-account .woocommerce-MyAccount-content{float:right;width:calc(100% - 230px)!important}@media(max-width:768px){body.woocommerce-account .woocommerce-MyAccount-navigation,body.woocommerce-account .woocommerce-MyAccount-content{float:none;width:100%!important}body.woocommerce-account .woocommerce-MyAccount-navigation ul{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px}body.woocommerce-account .woocommerce-MyAccount-navigation li{margin:0}}</style>';
	} );
	// $1K members land on My $1K Plan instead of the Dashboard.
	add_action( 'template_redirect', function () {
		if ( ! is_user_logged_in() || ! function_exists( 'is_account_page' ) || ! is_account_page() || is_wc_endpoint_url() ) {
			return;
		}
		if ( scrolly_k1_access( get_current_user_id() )['club'] ) {
			wp_safe_redirect( wc_get_account_endpoint_url( SCROLLY_K1_EP_PLAN ) );
			exit;
		}
	} );

	// ---- saving (plain form posts, nonce-checked, current user only)
	function scrolly_k1_back( $msg = '', $anchor = '', $ep = SCROLLY_K1_EP_PLAN ) {
		$url = wc_get_account_endpoint_url( $ep );
		$url = $msg ? add_query_arg( 'k1', $msg, $url ) : $url;
		wp_safe_redirect( $anchor ? $url . '#' . $anchor : $url );
		exit;
	}
	add_action( 'admin_post_scrolly_k1_save', function () {
		$uid = get_current_user_id();
		if ( ! $uid || ! isset( $_POST['_k1'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_k1'] ) ), 'scrolly_k1' ) ) {
			wp_die( 'Please reload the page and try again.' );
		}
		$a = scrolly_k1_access( $uid );
		if ( ! $a['club'] ) {
			wp_die( 'This is for $1K Club members.' );
		}
		$do = sanitize_key( wp_unslash( $_POST['do'] ?? '' ) );
		if ( 'profile' === $do ) {
			$o     = scrolly_k1_options();
			// Exact whitelist match (sanitize_key would lowercase the stage keys "B"/"C").
			$pick  = function ( $key, $allowed, $default = '' ) {
				$v = (string) wp_unslash( $_POST[ $key ] ?? '' );
				return ( '' !== $v && array_key_exists( $v, $allowed ) ) ? $v : $default;
			};
			$num   = function ( $key ) {
				$v = trim( (string) wp_unslash( $_POST[ $key ] ?? '' ) );
				return ( '' === $v || ! is_numeric( $v ) ) ? '' : max( 0, (float) $v );
			};
			$found = array_values( array_intersect( array_map( 'sanitize_key', (array) wp_unslash( $_POST['found'] ?? array() ) ), array_keys( $o['found'] ) ) );
			$p     = array(
				'business'  => sanitize_text_field( wp_unslash( $_POST['business'] ?? '' ) ),
				'route'     => $pick( 'route', $o['routes'] ),
				'stage'     => $pick( 'stage', $o['stages'], 'B' ),
				'offer'     => sanitize_text_field( wp_unslash( $_POST['offer'] ?? '' ) ),
				'price'     => $num( 'price' ),
				'audience'  => sanitize_text_field( wp_unslash( $_POST['audience'] ?? '' ) ),
				'where'     => $pick( 'where', $o['where'] ),
				'channel'   => $pick( 'channel', $o['channels'], 'instagram' ),
				'found'     => $found,
				'revenue'   => $num( 'revenue' ),
				'closePct'  => $num( 'closePct' ),
				'reviews'   => $num( 'reviews' ),
				'emailList' => $pick( 'emailList', array( 'yes' => 1, 'no' => 1 ) ),
			);
			// Something to sell + a price are required: the Club is for people who already have an offer.
			if ( '' === $p['route'] || '' === $p['offer'] || '' === $p['price'] || $p['price'] <= 0 || '' === $p['where'] ) {
				set_transient( 'scrolly_k1_draft_' . $uid, $p, HOUR_IN_SECONDS );
				scrolly_k1_back( 'need' );
			}
			update_user_meta( $uid, 'scrolly_k1_profile', $p );
			delete_transient( 'scrolly_k1_draft_' . $uid );
			scrolly_k1_back( 'profile' );
		}
		if ( 'review' === $do && $a['challenge'] ) {
			$profile = get_user_meta( $uid, 'scrolly_k1_profile', true );
			if ( ! is_array( $profile ) || ! $profile ) {
				scrolly_k1_back();
			}
			$num  = function ( $v ) {
				$v = trim( (string) $v );
				return ( '' === $v || ! is_numeric( $v ) ) ? '' : max( 0, (float) $v );
			};
			// Activity types match club/lib/growth-review-schema.mjs ACTIVITY_ACTION_TYPES.
			$allowed = array( 'published_content', 'sent_outreach', 'updated_listing', 'ran_messaging_experiment', 'changed_cta', 'added_proof', 'did_nothing', 'other' );
			$actions = array_values( array_intersect( array_map( 'sanitize_key', (array) wp_unslash( $_POST['actions'] ?? array() ) ), $allowed ) );
			$end     = sanitize_text_field( wp_unslash( $_POST['period_end'] ?? '' ) );
			$end     = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $end ) ? $end : current_time( 'Y-m-d' );
			$vals    = (array) wp_unslash( $_POST['m'] ?? array() );
			$labels  = (array) wp_unslash( $_POST['ml'] ?? array() );
			$metrics = array();
			foreach ( array_slice( $labels, 0, 8, true ) as $i => $label ) {
				$metrics[] = array( 'label' => sanitize_text_field( $label ), 'value' => $num( $vals[ $i ] ?? '' ) );
			}
			$cap  = (string) wp_unslash( $_POST['cap'] ?? '' );
			$attr = (string) wp_unslash( $_POST['attr'] ?? 'unknown' );
			$rec  = array(
				'id'          => wp_generate_password( 8, false ),
				'submitted'   => current_time( 'mysql' ),
				'periodEnd'   => $end,
				'periodStart' => gmdate( 'Y-m-d', strtotime( $end . ' 12:00:00' ) - 6 * DAY_IN_SECONDS ),
				'actions'     => $actions,
				'created'     => $num( $_POST['created'] ?? '' ),
				'distributed' => $num( $_POST['distributed'] ?? '' ),
				'rev'         => $num( $_POST['rev'] ?? '' ),
				'sales'       => $num( $_POST['sales'] ?? '' ),
				'cap'         => in_array( $cap, array( 'yes', 'no' ), true ) ? $cap : '',
				'attr'        => in_array( $attr, array( 'known', 'partially_known', 'unknown' ), true ) ? $attr : 'unknown',
				'note'        => sanitize_text_field( wp_unslash( $_POST['note'] ?? '' ) ),
				'metrics'     => $metrics,
				'snapshot'    => $profile, // diagnose against the details as they were this week, so old reviews never shift
			);
			$reviews   = get_user_meta( $uid, 'scrolly_k1_reviews', true );
			$reviews   = is_array( $reviews ) ? $reviews : array();
			$reviews[] = $rec;
			update_user_meta( $uid, 'scrolly_k1_reviews', array_slice( $reviews, -60 ) );

			// Keep the Challenge total right without double counting: log only revenue/sales not already logged that week.
			$log    = get_user_meta( $uid, 'scrolly_k1_log', true );
			$log    = is_array( $log ) ? $log : array();
			$logged = scrolly_k1_logged_in_week( $log, $end );
			$extra  = ( '' === $rec['rev'] ) ? 0 : $rec['rev'] - $logged['rev'];
			if ( $extra > 0 ) {
				$log[] = array(
					'id'    => wp_generate_password( 8, false ),
					'date'  => $end,
					'rev'   => round( $extra, 2 ),
					'sales' => ( '' === $rec['sales'] ) ? 0 : max( 0, (int) $rec['sales'] - $logged['sales'] ),
					'posts' => ( '' === $rec['created'] ) ? 0 : (int) $rec['created'],
					'note'  => 'Weekly check-in',
				);
				usort( $log, function ( $x, $y ) { return strcmp( $y['date'], $x['date'] ); } );
				update_user_meta( $uid, 'scrolly_k1_log', array_slice( $log, 0, 500 ) );
			}
			scrolly_k1_back( 'review', 'k1-review', SCROLLY_K1_EP_CHECKIN );
		}
		if ( 'log' === $do ) {
			$log   = get_user_meta( $uid, 'scrolly_k1_log', true );
			$log   = is_array( $log ) ? $log : array();
			$date  = sanitize_text_field( wp_unslash( $_POST['date'] ?? '' ) );
			$log[] = array(
				'id'    => wp_generate_password( 8, false ),
				'date'  => preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) ? $date : current_time( 'Y-m-d' ),
				// A refund is logged as a negative amount so it comes off the Challenge total (refunds never count).
				'rev'   => ( ! empty( $_POST['refund'] ) ? -1 : 1 ) * max( 0, (float) ( $_POST['rev'] ?? 0 ) ),
				'sales' => ! empty( $_POST['refund'] ) ? 0 : max( 0, (int) ( $_POST['sales'] ?? 0 ) ),
				'posts' => max( 0, (int) ( $_POST['posts'] ?? 0 ) ),
				'note'  => ( ! empty( $_POST['refund'] ) ? 'Refund. ' : '' ) . sanitize_text_field( wp_unslash( $_POST['note'] ?? '' ) ),
			);
			usort( $log, function ( $x, $y ) { return strcmp( $y['date'], $x['date'] ); } );
			update_user_meta( $uid, 'scrolly_k1_log', array_slice( $log, 0, 500 ) );
			scrolly_k1_back( 'log', '', SCROLLY_K1_EP_NUMBERS );
		}
		if ( 'del' === $do ) {
			$id  = sanitize_text_field( wp_unslash( $_POST['id'] ?? '' ) );
			$log = get_user_meta( $uid, 'scrolly_k1_log', true );
			$log = is_array( $log ) ? array_values( array_filter( $log, function ( $e ) use ( $id ) { return ( $e['id'] ?? '' ) !== $id; } ) ) : array();
			update_user_meta( $uid, 'scrolly_k1_log', $log );
			scrolly_k1_back( 'del', '', SCROLLY_K1_EP_NUMBERS );
		}
		if ( 'start' === $do && $a['challenge'] ) {
			$w = scrolly_k1_window( $uid, $a );
			if ( $w && ! $w['started'] ) {
				// A new paid attempt: keep the previous attempt (and any win) in history instead of overwriting it.
				$prev = get_user_meta( $uid, 'scrolly_k1_chal', true );
				if ( is_array( $prev ) && ! empty( $prev['order'] ) ) {
					$hist   = get_user_meta( $uid, 'scrolly_k1_chal_history', true );
					$hist   = is_array( $hist ) ? $hist : array();
					$hist[] = $prev;
					update_user_meta( $uid, 'scrolly_k1_chal_history', $hist );
				}
				update_user_meta( $uid, 'scrolly_k1_chal', array(
					'order'       => (int) $a['chal_order'],
					'start'       => (int) strtotime( current_time( 'Y-m-d' ) . ' 00:00:00' ),
					'achievement' => array( 'claim' => null, 'verified' => false, 'verifiedAt' => null, 'verificationMethod' => null, 'rewardChoice' => 'pending', 'merchUnlocked' => false, 'reviews' => array() ),
				) );
			}
			scrolly_k1_back( 'start' );
		}

		// Proof submission: screenshots/PDFs are emailed to Mercedes as attachments and never stored on the site.
		if ( 'claim' === $do && $a['challenge'] ) {
			$w    = scrolly_k1_window( $uid, $a );
			$chal = get_user_meta( $uid, 'scrolly_k1_chal', true );
			$log  = get_user_meta( $uid, 'scrolly_k1_log', true );
			$rev  = scrolly_k1_window_revenue( is_array( $log ) ? $log : array(), $w );
			if ( 'claim_available' !== scrolly_k1_status( $chal, $w, $rev ) ) {
				scrolly_k1_back( '', 'k1-challenge' );
			}
			if ( empty( $_POST['confirm'] ) ) {
				scrolly_k1_back( 'claimneed', 'k1-challenge' );
			}
			// Privacy: files are never copied anywhere. Each upload stays in PHP's own temporary upload file (outside the
			// website, deleted by PHP at the end of the request) and is attached from there under a clean name
			// (wp_mail uses array keys as attachment names, WordPress 6.2+). We also delete it explicitly after sending.
			$allowed = array( 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'pdf' => 'application/pdf' );
			$files   = $_FILES['proof'] ?? null;
			$attach  = array();
			$names   = array();
			if ( $files && is_array( $files['name'] ) ) {
				foreach ( array_slice( array_keys( $files['name'] ), 0, 5 ) as $i ) {
					if ( UPLOAD_ERR_OK !== $files['error'][ $i ] || ! is_uploaded_file( $files['tmp_name'][ $i ] ) || $files['size'][ $i ] > 8 * MB_IN_BYTES ) {
						continue;
					}
					$check = wp_check_filetype_and_ext( $files['tmp_name'][ $i ], $files['name'][ $i ], $allowed );
					if ( empty( $check['ext'] ) ) {
						continue; // not an image or PDF
					}
					$name = ( count( $attach ) + 1 ) . '-' . sanitize_file_name( pathinfo( $files['name'][ $i ], PATHINFO_FILENAME ) ) . '.' . $check['ext'];
					$attach[ $name ] = $files['tmp_name'][ $i ];
					$names[]         = $name;
				}
			}
			if ( ! $attach ) {
				scrolly_k1_back( 'claimfiles', 'k1-challenge' );
			}
			$user    = get_userdata( $uid );
			$claimed = max( 0, (float) ( $_POST['claimed'] ?? 0 ) );
			$note    = sanitize_textarea_field( wp_unslash( $_POST['note'] ?? '' ) );
			$body    = "New \$1K Challenge proof.\n\nCustomer: " . $user->display_name . ' <' . $user->user_email . ">\nChallenge order: #" . (int) $a['chal_order']
				. "\nWindow: " . gmdate( 'M j', $w['start'] ) . ' to ' . gmdate( 'M j, Y', $w['end'] - DAY_IN_SECONDS )
				. "\nRevenue they logged in the window: " . scrolly_k1_money( $rev ) . "\nRevenue they are claiming: " . scrolly_k1_money( $claimed )
				. "\nNote: " . ( $note ? $note : '(none)' ) . "\n\nCheck the attached screenshots: qualifying sales dated inside the window totaling at least \$1,000, excluding sales tax, shipping charged, and refunds."
				. "\n\nApprove or decline here: " . admin_url( 'user-edit.php?user_id=' . $uid ) . '#k1-challenge-admin';
			$sent = wp_mail( SCROLLY_K1_ADMIN_EMAIL, '$1K Challenge proof: ' . $user->display_name . ' (' . scrolly_k1_money( $claimed ) . ')', $body, array( 'Reply-To: ' . $user->user_email ), $attach );
			foreach ( $attach as $f ) {
				wp_delete_file( $f ); // PHP would remove it at request end anyway; do it now
			}
			if ( ! $sent ) {
				scrolly_k1_back( 'claimmail', 'k1-challenge' ); // nothing recorded, so they can simply try again
			}
			$chal['achievement']          = is_array( $chal['achievement'] ?? null ) ? $chal['achievement'] : array();
			$chal['achievement']['claim'] = array( 'claimedRevenueUsd' => $claimed, 'loggedRevenueUsd' => $rev, 'note' => $note, 'files' => $names, 'claimedAt' => current_time( 'mysql' ) );
			update_user_meta( $uid, 'scrolly_k1_chal', $chal );
			scrolly_k1_back( 'claimed', 'k1-challenge' );
		}

		if ( 'size' === $do && $a['challenge'] ) {
			$size = (string) wp_unslash( $_POST['size'] ?? '' );
			if ( in_array( $size, array( 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL' ), true ) ) {
				update_user_meta( $uid, 'scrolly_k1_shirt_size', $size );
			}
			scrolly_k1_back( 'size', 'k1-challenge' );
		}

		// Winner merch: accept (size + shipping details) or decline. Fulfillment is manual (Printify by hand).
		if ( 'reward' === $do && $a['challenge'] ) {
			$chal = get_user_meta( $uid, 'scrolly_k1_chal', true );
			if ( empty( $chal['achievement']['verified'] ) || ! empty( $chal['achievement']['merchOrdered'] ) ) {
				scrolly_k1_back( '', 'k1-challenge' );
			}
			$choice = (string) wp_unslash( $_POST['choice'] ?? '' );
			$user   = get_userdata( $uid );
			if ( 'declined' === $choice ) {
				$chal['achievement']['rewardChoice'] = 'declined';
				$chal['achievement']['shipping']     = null;
				update_user_meta( $uid, 'scrolly_k1_chal', $chal );
				wp_mail( SCROLLY_K1_ADMIN_EMAIL, '$1K winner declined the shirt: ' . $user->display_name, $user->display_name . ' <' . $user->user_email . '> declined the winner shirt. No order needed.' );
				scrolly_k1_back( 'reward', 'k1-challenge' );
			}
			$sizes = array( 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL' );
			$ship  = array();
			foreach ( array( 'name', 'address1', 'address2', 'city', 'state', 'postcode', 'country' ) as $k ) {
				$ship[ $k ] = sanitize_text_field( wp_unslash( $_POST[ 'ship_' . $k ] ?? '' ) );
			}
			$size = (string) wp_unslash( $_POST['size'] ?? '' );
			if ( 'accepted' !== $choice || ! in_array( $size, $sizes, true ) || '' === $ship['name'] || '' === $ship['address1'] || '' === $ship['city'] || '' === $ship['postcode'] || '' === $ship['country'] ) {
				scrolly_k1_back( 'rewardneed', 'k1-challenge' );
			}
			$ship['size']                        = $size;
			$chal['achievement']['rewardChoice'] = 'accepted';
			$chal['achievement']['shipping']     = $ship;
			update_user_meta( $uid, 'scrolly_k1_chal', $chal );
			wp_mail( SCROLLY_K1_ADMIN_EMAIL, '$1K winner shirt to order: ' . $ship['name'] . ' (' . $size . ')',
				"Order the teal winner shirt in Printify.\n\nSize: $size\n" . $ship['name'] . "\n" . $ship['address1'] . "\n" . ( $ship['address2'] ? $ship['address2'] . "\n" : '' ) . $ship['city'] . ', ' . $ship['state'] . ' ' . $ship['postcode'] . "\n" . $ship['country']
				. "\n\nCustomer: " . $user->user_email . "\nMark it ordered: " . admin_url( 'user-edit.php?user_id=' . $uid ) . '#k1-challenge-admin' );
			scrolly_k1_back( 'reward', 'k1-challenge' );
		}
		scrolly_k1_back();
	} );

	function scrolly_k1_form_open( $do, $multipart = false ) {
		return '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"' . ( $multipart ? ' enctype="multipart/form-data"' : '' ) . '><input type="hidden" name="action" value="scrolly_k1_save"><input type="hidden" name="do" value="' . esc_attr( $do ) . '">' . wp_nonce_field( 'scrolly_k1', '_k1', false, false );
	}

	/** Start Here choices. Keys must match automation/k1-launch/src/plan-view.mjs and club/lib/business-model-router.mjs. */
	function scrolly_k1_options() {
		return array(
			'routes'   => array(
				'services'          => 'Services (freelance, consulting, coaching, trades, photography)',
				'local_hybrid'      => 'Local business that also sells online (bakery, salon, shop)',
				'ecommerce'         => 'Physical products from my own online shop',
				'marketplace_first' => 'Products on Etsy or another marketplace',
				'digital_product'   => 'Digital products or courses',
				'creator_affiliate' => 'Creator or affiliate income',
			),
			'stages'   => array(
				'B' => 'I have something to sell, but little or no revenue from it yet',
				'C' => 'I have made sales, but not $1,000 consistently',
			),
			'where'    => array(
				'own_site'    => 'My website or online shop',
				'etsy'        => 'Etsy',
				'marketplace' => 'Another marketplace (Amazon, eBay, etc.)',
				'booking'     => 'A booking link or calendar',
				'quote'       => 'A quote, estimate, inquiry, or application form',
				'dm'          => 'DMs or messages',
				'phone'       => 'Phone call or text',
			),
			'channels' => array(
				'instagram' => 'Instagram (+ Facebook)',
				'tiktok'    => 'TikTok',
				'linkedin'  => 'LinkedIn',
				'other'     => 'Somewhere else',
			),
			'found'    => array(
				'instagram'          => 'Instagram',
				'facebook'           => 'Facebook',
				'tiktok'             => 'TikTok',
				'linkedin'           => 'LinkedIn',
				'google'             => 'Google',
				'marketplace_search' => 'Etsy or marketplace search',
				'referral'           => 'Word of mouth or referrals',
				'local'              => 'Local events or in person',
			),
		);
	}

	/** Start Here form. $p = saved (or draft) answers. */
	function scrolly_k1_profile_form( $p, $button = 'Build my plan' ) {
		$o   = scrolly_k1_options();
		$v   = function ( $k ) use ( $p ) { return esc_attr( (string) ( $p[ $k ] ?? '' ) ); };
		$sel = function ( $name, $opts, $cur, $placeholder = 'Choose one' ) {
			$h = '<select id="k1-' . $name . '" name="' . $name . '" required><option value="">' . esc_html( $placeholder ) . '</option>';
			foreach ( $opts as $key => $label ) {
				$h .= '<option value="' . esc_attr( $key ) . '"' . selected( $cur, $key, false ) . '>' . esc_html( $label ) . '</option>';
			}
			return $h . '</select>';
		};
		$found = (array) ( $p['found'] ?? array() );
		$h  = scrolly_k1_form_open( 'profile' );
		$h .= '<div class="grid">';
		$h .= '<div><label for="k1-offer">What do you sell?</label><input id="k1-offer" name="offer" required value="' . $v( 'offer' ) . '" placeholder="e.g. custom cookie boxes"></div>';
		$h .= '<div><label for="k1-price">Average price per sale ($)</label><input id="k1-price" name="price" type="number" min="1" step="0.01" required value="' . $v( 'price' ) . '"><p class="note">For services, your average job or package price.</p></div>';
		$h .= '<div><label for="k1-route">What kind of business is it?</label>' . $sel( 'route', $o['routes'], $p['route'] ?? '' ) . '</div>';
		$h .= '<div><label for="k1-stage">Where are you starting from?</label>' . $sel( 'stage', $o['stages'], $p['stage'] ?? '' ) . '</div>';
		$h .= '<div><label for="k1-audience">Who buys it?</label><input id="k1-audience" name="audience" value="' . $v( 'audience' ) . '" placeholder="e.g. local party planners"></div>';
		$h .= '<div><label for="k1-where">When someone finds you on Instagram, how do they take the next step?</label>' . $sel( 'where', $o['where'], $p['where'] ?? '' ) . '<p class="note">The sale itself can happen anywhere (Etsy, Shopify, Stripe, an invoice). This is the step Instagram sends people to.</p></div>';
		// V1 is Instagram-first: no channel question. The save handler stores 'instagram' (see scrolly_k1_options channels).
		$h .= '<div><label for="k1-business">Business name (optional)</label><input id="k1-business" name="business" value="' . $v( 'business' ) . '"></div>';
		$h .= '</div><fieldset class="k1-found"><legend>Where do customers find you today? (tick any, or none if you are just starting on Instagram)</legend>';
		foreach ( $o['found'] as $key => $label ) {
			$h .= '<label class="chk"><input type="checkbox" name="found[]" value="' . esc_attr( $key ) . '"' . checked( in_array( $key, $found, true ), true, false ) . '> ' . esc_html( $label ) . '</label>';
		}
		$h .= '</fieldset><details class="k1-more"><summary>Optional: add real numbers for a sharper plan</summary><div class="grid">';
		$h .= '<div><label for="k1-revenue">Revenue in the last 30 days ($)</label><input id="k1-revenue" name="revenue" type="number" min="0" step="0.01" value="' . $v( 'revenue' ) . '"></div>';
		$h .= '<div><label for="k1-close">Of people who ask, visit, or add to cart, about what % buy?</label><input id="k1-close" name="closePct" type="number" min="0" max="100" step="0.1" value="' . $v( 'closePct' ) . '"></div>';
		$h .= '<div><label for="k1-reviews">How many reviews or testimonials do you have?</label><input id="k1-reviews" name="reviews" type="number" min="0" step="1" value="' . $v( 'reviews' ) . '"></div>';
		$h .= '<div><label for="k1-email">Do you have an email or customer list?</label><select id="k1-email" name="emailList"><option value="">Not sure</option><option value="yes"' . selected( $p['emailList'] ?? '', 'yes', false ) . '>Yes</option><option value="no"' . selected( $p['emailList'] ?? '', 'no', false ) . '>No</option></select></div>';
		$h .= '</div></details><button class="btn" type="submit">' . esc_html( $button ) . '</button></form>';
		return $h;
	}

	/** Bundled plan logic (reused from automation/club/lib), inlined by build.mjs. */
	function scrolly_k1_app_js() {
		return <<<'K1JS'
__K1_APP_JS__
K1JS;
	}

	function scrolly_k1_css() {
		return '<style id="scrolly-k1-acct">
.k1a{--teal:#94ece1;--cream:#fbf8f3;--or:#ff6338;color:#000;font-family:"Public Sans",system-ui,Arial,sans-serif}
.k1a *{box-sizing:border-box}
.k1a h2{font-family:"Archivo","Arial Black",sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-.01em;font-size:clamp(24px,2.4vw,32px);line-height:1;margin:0 0 14px;color:#000}
.k1a h3{font-family:"Archivo","Arial Black",sans-serif;font-weight:900;font-size:19px;margin:0 0 10px;color:#000}
.k1a p{margin:0 0 12px;font-size:16px;line-height:1.45;color:#000}
.k1a .sec{background:#fff;border-radius:16px;padding:clamp(18px,2.4vw,28px);margin:0 0 22px}
.k1a .sec.teal{background:var(--teal)}
.k1a .sec.black{background:#000;color:#fff}.k1a .sec.black h2,.k1a .sec.black p,.k1a .sec.black h3{color:#fff}
.k1a .big{font-family:"Archivo","Arial Black",sans-serif;font-weight:900;font-size:clamp(40px,5vw,64px);line-height:.95;color:#000}
.k1a .sec.black .big{color:var(--teal)}
.k1a .track{height:26px;border-radius:13px;background:var(--cream);overflow:hidden;margin:14px 0 8px}
.k1a .track i{display:block;height:100%;background:var(--teal)}
.k1a .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.k1a .grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.k1a label{display:block;font-weight:700;font-size:14px;margin:0 0 6px;color:#000}
.k1a input,.k1a select,.k1a textarea{width:100%;min-height:48px;padding:10px 14px;border:1px solid rgba(0,0,0,.2);border-radius:10px;background:#fff;font:inherit;font-size:16px;color:#000}
.k1a textarea{min-height:90px}
.k1a .btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 26px;border:0;border-radius:32px;background:#000;color:#fff!important;font:800 16px "Public Sans",Arial,sans-serif;text-decoration:none!important;cursor:pointer;margin-top:14px}
.k1a .btn.teal{background:var(--teal);color:#000!important}
.k1a .btn.or{background:var(--or);color:#000!important}
.k1a .note{font-size:13px;opacity:.8}
.k1a .ok{background:var(--teal);color:#000;border-radius:12px;padding:10px 14px;font-weight:700;margin:0 0 16px}
.k1a table{width:100%;border-collapse:collapse;font-size:15px}
.k1a th,.k1a td{text-align:left;padding:10px 8px;border-bottom:1px solid rgba(0,0,0,.1);vertical-align:top;color:#000}
.k1a th{font-weight:800}
.k1a td .x{border:0;background:none;padding:0;font:600 13px "Public Sans",Arial,sans-serif;text-decoration:underline;cursor:pointer;color:#000}
.k1a .calc-out{font-family:"Archivo","Arial Black",sans-serif;font-weight:900;font-size:clamp(34px,4vw,48px);line-height:1;margin-top:12px}
.k1a .reels{background:#fff;border-radius:16px;padding:clamp(18px,2.4vw,28px)}
.k1a .sec.cream{background:var(--cream);border:1px solid rgba(0,0,0,.08)}
.k1a ul{margin:0 0 12px;padding-left:20px}.k1a li{margin:0 0 6px;line-height:1.45}
.k1a ul.funnel{list-style:none;padding:0}.k1a ul.funnel li{padding:8px 0;border-bottom:1px solid rgba(0,0,0,.08)}
.k1a ul.known{list-style:none;padding:0}.k1a .ic{display:inline-block;width:22px;font-weight:800}
.k1a fieldset{border:0;padding:0;margin:16px 0 0}.k1a legend{font-weight:700;font-size:14px;margin:0 0 8px}
.k1a label.chk{display:inline-flex;align-items:center;gap:6px;font-weight:500;margin:0 16px 8px 0}.k1a label.chk input{width:auto;min-height:0}
.k1a details{margin:16px 0 0}.k1a summary{cursor:pointer;font-weight:700}
.k1a .warn{background:#fff3c4;color:#000;border-radius:12px;padding:10px 14px;font-weight:700;margin:0 0 16px}
.k1a .chip{display:inline-block;background:var(--teal);color:#000;border-radius:20px;padding:4px 12px;font-weight:800;font-size:13px;margin:0 0 10px}
.k1a ul.milestones{list-style:none;padding:0;display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.k1a ul.milestones li{border:1px solid rgba(255,255,255,.4);border-radius:20px;padding:4px 12px;font-weight:700;color:#fff}.k1a ul.milestones li.hit{background:var(--teal);color:#000;border-color:var(--teal)}
.k1a .k1tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}.k1a .k1tabs button{min-height:44px;padding:0 20px;border-radius:30px;border:0;background:#fff;color:#000;font:800 15px "Public Sans",Arial,sans-serif;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15)}.k1a .k1tabs button[aria-selected=true]{background:#000;color:#fff!important;box-shadow:none}
.k1a .sec.black .proof label{color:#fff}.k1a .sec.black textarea,.k1a .sec.black input[type=file]{color:#000;background:#fff}
@media(max-width:700px){.k1a .grid,.k1a .grid3{grid-template-columns:1fr}.k1a table{font-size:14px}.k1a th:nth-child(4),.k1a td:nth-child(4){display:none}}
</style>';
	}

	// ---- My $1K Plan tab
	/** Client-side $1K Math calculator (unchanged from the 2026-09-23 launch version). */
	function scrolly_k1_calc_html( $price ) {
		$h  = '<div class="sec teal" id="k1-calc"><h2>$1K Math</h2><p>Try different prices and see how many sales it takes.</p><div class="grid3">';
		$h .= '<div><label for="c-goal">Goal ($)</label><input id="c-goal" type="number" min="1" value="1000"></div>';
		$h .= '<div><label for="c-price">Average sale ($)</label><input id="c-price" type="number" min="0" step="0.01" value="' . esc_attr( $price ?: 50 ) . '"></div>';
		$h .= '<div><label for="c-days">Days</label><input id="c-days" type="number" min="1" value="30"></div></div>';
		$h .= '<div class="calc-out" id="c-out"></div><p id="c-per"></p>';
		$h .= '<p class="note">Planning math only. Revenue before costs.</p></div>';
		$h .= '<script>(function(){var g=document.getElementById("c-goal"),p=document.getElementById("c-price"),d=document.getElementById("c-days"),o=document.getElementById("c-out"),e=document.getElementById("c-per");if(!g)return;function n(x){x=parseFloat(x.value);return isFinite(x)?x:0}function run(){var G=n(g),P=n(p),D=n(d);if(G>0){if(P>0){var s=Math.ceil(G/P);o.textContent=s.toLocaleString("en-US")+" sales";e.textContent=D>0?"About "+(Math.round(s/D*10)/10)+" a day, or "+(Math.round(s/D*7*10)/10)+" a week, over "+D+" days.":""}else{o.textContent="";e.textContent="Enter an average sale."}}}[g,p,d].forEach(function(i){i.addEventListener("input",run)});run()})();</script>';
		return $h;
	}

	/** Revenue/sales already logged for the 7 days ending $end (Y-m-d). */
	function scrolly_k1_logged_in_week( $log, $end ) {
		$to   = strtotime( $end . ' 12:00:00' );
		$from = $to - 6 * DAY_IN_SECONDS;
		$sum  = array( 'rev' => 0, 'sales' => 0 );
		foreach ( $log as $e ) {
			$t = strtotime( $e['date'] . ' 12:00:00' );
			if ( $t >= $from && $t <= $to ) {
				$sum['rev']   += (float) $e['rev'];
				$sum['sales'] += (int) $e['sales'];
			}
		}
		return $sum;
	}

	/** Weekly check-in form. Route-specific funnel inputs are inserted by the bundle into #k1-checkin-metrics. */
	function scrolly_k1_checkin_form( $logged ) {
		$acts = array(
			'published_content' => 'Posted content',
			'sent_outreach'     => 'Reached out to people directly',
			'updated_listing'   => 'Updated my listing, page, or profile link',
			'changed_cta'       => 'Changed my call to action',
			'added_proof'       => 'Added reviews, results, or other proof',
			'other'             => 'Something else',
			'did_nothing'       => 'I did not get to it this week',
		);
		$h  = scrolly_k1_form_open( 'review' );
		$h .= '<div class="grid"><div><label for="k1-rend">Week ending</label><input id="k1-rend" name="period_end" type="date" value="' . esc_attr( current_time( 'Y-m-d' ) ) . '"></div></div>';
		$h .= '<fieldset><legend>What did you do this week?</legend>';
		foreach ( $acts as $key => $label ) {
			$h .= '<label class="chk"><input type="checkbox" name="actions[]" value="' . esc_attr( $key ) . '"> ' . esc_html( $label ) . '</label>';
		}
		$h .= '</fieldset><div class="grid" style="margin-top:14px">';
		$h .= '<div><label for="k1-created">Posts or videos created</label><input id="k1-created" name="created" type="number" min="0" step="1"></div>';
		$h .= '<div><label for="k1-dist">Placements, counting optional cross-posts</label><input id="k1-dist" name="distributed" type="number" min="0" step="1"><p class="note">One video on Instagram, TikTok, and Shorts is 1 created, 3 placements.</p></div>';
		$h .= '</div><h3 style="margin-top:18px">Your numbers this week</h3><p class="note">Leave a box blank if you do not know. Blank and zero mean different things.</p>';
		$h .= '<div class="grid" id="k1-checkin-metrics"></div><div class="grid">';
		$h .= '<div><label for="k1-rrev">Revenue this week ($)</label><input id="k1-rrev" name="rev" type="number" min="0" step="0.01" value="' . esc_attr( $logged['rev'] ? $logged['rev'] : '' ) . '"></div>';
		$h .= '<div><label for="k1-rsales">Sales this week (#)</label><input id="k1-rsales" name="sales" type="number" min="0" step="1" value="' . esc_attr( $logged['sales'] ? $logged['sales'] : '' ) . '"></div>';
		$h .= '</div>' . ( $logged['rev'] ? '<p class="note">Pre-filled from sales you already logged this week. Anything extra you add here is logged for you.</p>' : '' );
		$h .= '<div class="grid" style="margin-top:14px">';
		$h .= '<div><label for="k1-cap">Did you get more interest than you could handle?</label><select id="k1-cap" name="cap"><option value="">Not sure</option><option value="no">No</option><option value="yes">Yes</option></select></div>';
		$h .= '<div><label for="k1-attr">Do you know where this week\'s sales came from?</label><select id="k1-attr" name="attr"><option value="unknown">Not really</option><option value="partially_known">Partly</option><option value="known">Yes</option></select></div>';
		$h .= '</div><div style="margin-top:14px"><label for="k1-rnote">Anything worth remembering? (optional)</label><input id="k1-rnote" name="note" placeholder="What seemed to work, or not"></div>';
		$h .= '<p class="note" style="margin-top:10px">Count money collected for your products or services. Leave out sales tax, shipping you charge, and refunds.</p>';
		$h .= '<button class="btn" type="submit">Save my check-in</button></form>';
		return $h;
	}

	/** Shared context for the $1K tabs: access, saved data, notices. Returns null (after printing) when the tab can't render. */
	function scrolly_k1_tab_open( $need_challenge ) {
		$uid = get_current_user_id();
		$a   = scrolly_k1_access( $uid );
		echo scrolly_k1_css() . '<div class="k1a">';
		if ( ! $a['club'] || ( $need_challenge && ! $a['challenge'] ) ) {
			echo '<div class="sec teal"><h2>' . ( $a['club'] ? 'Part of the $1K Challenge' : 'My $1K Plan' ) . '</h2><p>' . ( $a['club'] ? 'The weekly check-in and your numbers come with the $1K Challenge.' : 'This tab is for $1K Club members.' ) . '</p><a class="btn" href="' . esc_url( $a['club'] ? scrolly_k1_add_challenge_url() : home_url( '/1k-club/' ) ) . '">' . ( $a['club'] ? 'Add the $1K Challenge' : 'See the $1K Club' ) . '</a></div></div>';
			return null;
		}
		$c = array( 'uid' => $uid, 'a' => $a );
		foreach ( array( 'profile' => 'scrolly_k1_profile', 'log' => 'scrolly_k1_log', 'reviews' => 'scrolly_k1_reviews' ) as $k => $meta ) {
			$v       = get_user_meta( $uid, $meta, true );
			$c[ $k ] = is_array( $v ) ? $v : array();
		}
		$msgs = array( 'profile' => 'Your plan is ready.', 'review' => 'Check-in saved. Your focus for next week is below.', 'log' => 'Numbers logged.', 'del' => 'Entry removed.', 'start' => 'Your 30 days have started. Go get it.', 'claimed' => 'Proof received. We will review it and update this page.', 'reward' => 'Thanks. Your winner shirt choice is saved.', 'size' => 'Shirt size saved.' );
		$errs = array( 'claimneed' => 'Please tick the box confirming your sales qualify.', 'claimfiles' => 'Please attach at least one screenshot or PDF (JPG, PNG, WEBP, or PDF, up to 8 MB each).', 'claimmail' => 'Your proof did not go through. Nothing was saved, so please try again, or email ' . SCROLLY_K1_ADMIN_EMAIL . '.', 'rewardneed' => 'Please choose a size and fill in your name, address, city, postcode, and country.' );
		$c['k1'] = sanitize_key( wp_unslash( $_GET['k1'] ?? '' ) );
		if ( isset( $msgs[ $c['k1'] ] ) ) {
			echo '<div class="ok" role="status">' . esc_html( $msgs[ $c['k1'] ] ) . '</div>';
		}
		if ( isset( $errs[ $c['k1'] ] ) ) {
			echo '<div class="warn" role="alert">' . esc_html( $errs[ $c['k1'] ] ) . '</div>';
		}
		$c['w']  = scrolly_k1_window( $uid, $a );
		$last    = $c['reviews'] ? end( $c['reviews'] ) : null;
		$last_t  = $last ? strtotime( $last['periodEnd'] . ' 12:00:00' ) : 0;
		$c['due'] = ! $last || ( current_time( 'timestamp' ) - $last_t ) >= 6 * DAY_IN_SECONDS;
		$c['due_line'] = ! $last
			? 'Do your first check-in at the end of your first week, or now to set a starting point.'
			: ( $c['due'] ? 'Your weekly check-in is due.' : 'Next check-in: ' . wp_date( 'l, M j', $last_t + 7 * DAY_IN_SECONDS ) . '.' );
		return $c;
	}

	/** Challenge members who haven't done Start Here yet are sent to it from the other tabs. */
	function scrolly_k1_need_profile_note() {
		echo '<div class="sec black"><h2>Start here first</h2><p>Answer a few questions about your business in My $1K Plan, and this tab fills in.</p><a class="btn teal" href="' . esc_url( wc_get_account_endpoint_url( SCROLLY_K1_EP_PLAN ) ) . '">Go to My $1K Plan</a></div></div>';
	}

	add_action( 'woocommerce_account_' . SCROLLY_K1_EP_PLAN . '_endpoint', function () {
		$c = scrolly_k1_tab_open( false );
		if ( ! $c ) {
			return;
		}
		$a       = $c['a'];
		$uid     = $c['uid'];
		$profile = $c['profile'];
		$log     = $c['log'];
		$price   = (float) ( $profile['price'] ?? 0 );

		// Club only: the playbook is the product; the personalized plan and weekly loop come with the Challenge.
		if ( ! $a['challenge'] ) {
			echo '<div class="sec black"><h2>Your $1K Club</h2><p>Your playbook is ready in <a style="color:#94ece1" href="' . esc_url( wc_get_account_endpoint_url( 'downloads' ) ) . '">Downloads</a>. It walks through the whole system: your $1K math, fixing your buying path, what to post, and how to track and improve.</p></div>';
			echo '<div class="sec teal"><h2>Make your first $1K with Instagram</h2><p>The $1K Challenge builds your personal $1K Plan from your business details, tells you what to post and fix each week, gives you a weekly check-in that shows what to change next, and 25 fresh Reel ideas every week for 30 days.</p><a class="btn" href="' . esc_url( scrolly_k1_add_challenge_url() ) . '">Add the $1K Challenge</a></div>';
			echo scrolly_k1_calc_html( 0 ) . '</div>';
			return;
		}

		// Start Here: no plan until we know what they sell, the price, and how people buy.
		if ( ! $profile ) {
			$draft = get_transient( 'scrolly_k1_draft_' . $uid );
			echo '<div class="sec black"><h2>Start here</h2><p>Make your first $1K with Instagram. Tell us about what you sell, and in about two minutes we will work out your $1K number, what it takes to get there, and what to focus on first.</p><p class="note">For businesses that already sell something with a price, have an Instagram account (new is fine), and give people a trackable next step: buy, book, request a quote, apply, or get in touch.</p></div>';
			if ( 'need' === $c['k1'] ) {
				echo '<div class="warn" role="alert">Please fill in what you sell, a price above $0, the kind of business, and where people buy.</div>';
			}
			echo '<div class="sec">' . scrolly_k1_profile_form( is_array( $draft ) ? $draft : array() ) . '</div></div>';
			return;
		}

		// Challenge lifecycle card (progress, milestones, shirt size, proof, winner, retry).
		$w = $c['w'];
		if ( $w ) {
			echo scrolly_k1_challenge_card( $uid, $a, $w, $log, $profile );
		}

		// Challenge progress for the goal gap (same revenue function as the Challenge card).
		$chal = array( 'started' => false, 'day' => 0, 'revenue' => 0, 'over' => false );
		if ( $w && $w['started'] ) {
			$chal = array( 'started' => true, 'day' => (int) $w['day'], 'revenue' => scrolly_k1_window_revenue( $log, $w ), 'over' => (bool) $w['over'] );
		}

		// This Week: Plan / latest check-in -> this week's execution list (rendered by the bundle).
		echo '<div id="k1-week" data-challenge="' . esc_attr( wp_json_encode( $chal ) ) . '" data-next="' . esc_attr( $c['due_line'] ) . '" data-content="' . esc_attr( wc_get_account_endpoint_url( SCROLLY_K1_EP_REELS ) ) . '" data-checkin="' . esc_attr( wc_get_account_endpoint_url( SCROLLY_K1_EP_CHECKIN ) ) . '"></div>';

		// My $1K Plan (rendered in the browser by the reused Club logic); the calculator moves in right under the plan box.
		echo '<div id="k1-plan" data-saved="' . esc_attr( wp_json_encode( $profile ) ) . '" data-reviews="' . esc_attr( wp_json_encode( $c['reviews'] ) ) . '"><div class="sec"><p>Building your plan…</p></div></div>';
		echo '<noscript><div class="sec cream"><p>Your plan needs JavaScript to display. Please enable it and reload.</p></div></noscript>';
		echo scrolly_k1_calc_html( $price );

		echo '<div class="sec"><details><summary>Edit my business details</summary>' . scrolly_k1_profile_form( $profile, 'Update my plan' ) . '</details></div>';
		echo '<p class="note">Your playbook PDF is in <a href="' . esc_url( wc_get_account_endpoint_url( 'downloads' ) ) . '">Downloads</a>.</p>';
		echo '<script>' . scrolly_k1_app_js() . '</script></div>';
	} );

	// Weekly check-in tab: form -> deterministic diagnosis (Module 7 engine, bundled) -> next week's focus, plus past check-ins.
	add_action( 'woocommerce_account_' . SCROLLY_K1_EP_CHECKIN . '_endpoint', function () {
		$c = scrolly_k1_tab_open( true );
		if ( ! $c ) {
			return;
		}
		if ( ! $c['profile'] ) {
			scrolly_k1_need_profile_note();
			return;
		}
		echo '<div class="sec" id="k1-review-sec"><h2>Weekly check-in</h2><p>' . esc_html( $c['due_line'] ) . ' It takes about 5 minutes: what you did, your numbers, and we tell you what to change next.</p>';
		echo '<details' . ( $c['due'] ? ' open' : '' ) . '><summary>' . ( $c['due'] ? 'Check in for this week' : 'Check in early' ) . '</summary>' . scrolly_k1_checkin_form( scrolly_k1_logged_in_week( $c['log'], current_time( 'Y-m-d' ) ) ) . '</details></div>';
		echo '<div id="k1-review" data-saved="' . esc_attr( wp_json_encode( $c['profile'] ) ) . '" data-reviews="' . esc_attr( wp_json_encode( $c['reviews'] ) ) . '"></div>';
		echo '<script>' . scrolly_k1_app_js() . '</script></div>';
	} );

	// My numbers tab: log a sale as it happens (feeds the Challenge total) + the history.
	add_action( 'woocommerce_account_' . SCROLLY_K1_EP_NUMBERS . '_endpoint', function () {
		$c = scrolly_k1_tab_open( true );
		if ( ! $c ) {
			return;
		}
		$log = $c['log'];
		echo '<div class="sec"><h2>Log a sale as it happens</h2><p>Add revenue as it comes in so your Challenge total stays current. Only you can see it.</p>' . scrolly_k1_form_open( 'log' ) . '<div class="grid3">';
		echo '<div><label for="k1-date">Date</label><input id="k1-date" name="date" type="date" value="' . esc_attr( current_time( 'Y-m-d' ) ) . '"></div>';
		echo '<div><label for="k1-rev">Revenue ($)</label><input id="k1-rev" name="rev" type="number" min="0" step="0.01" required></div>';
		echo '<div><label for="k1-sales">Sales (#)</label><input id="k1-sales" name="sales" type="number" min="0" step="1"></div>';
		echo '<div><label for="k1-posts">Posts published (#)</label><input id="k1-posts" name="posts" type="number" min="0" step="1"></div>';
		echo '<div style="grid-column:span 2"><label for="k1-note">Note</label><input id="k1-note" name="note" placeholder="What worked?"></div>';
		echo '</div><label class="chk" style="margin-top:12px"><input type="checkbox" name="refund" value="1"> This is a refund (it comes off your Challenge total)</label>';
		echo '<button class="btn" type="submit">Log it</button><p class="note" style="margin-top:10px">Count money collected for your products or services. Leave out sales tax and shipping you charge. Log refunds with the box above.</p></form></div>';
		echo '<div class="sec"><h2>My numbers log</h2>';
		if ( ! $log ) {
			echo '<p>No numbers yet. Your first entry will show up here.</p>';
		} else {
			$tr = 0; $ts = 0; $tp = 0;
			foreach ( $log as $e ) { $tr += (float) $e['rev']; $ts += (int) $e['sales']; $tp += (int) $e['posts']; }
			echo '<p><strong>All time:</strong> ' . esc_html( scrolly_k1_money( $tr ) ) . ' revenue, ' . (int) $ts . ' sales, ' . (int) $tp . ' posts.</p>';
			echo '<table><thead><tr><th>Date</th><th>Revenue</th><th>Sales</th><th>Posts</th><th>Note</th><th></th></tr></thead><tbody>';
			foreach ( $log as $e ) {
				echo '<tr><td>' . esc_html( wp_date( 'M j, Y', strtotime( $e['date'] . ' 12:00:00' ) ) ) . '</td><td>' . esc_html( scrolly_k1_money( $e['rev'] ) ) . '</td><td>' . (int) $e['sales'] . '</td><td>' . (int) $e['posts'] . '</td><td>' . esc_html( $e['note'] ) . '</td><td>' . scrolly_k1_form_open( 'del' ) . '<input type="hidden" name="id" value="' . esc_attr( $e['id'] ) . '"><button class="x" type="submit">Remove</button></form></td></tr>';
			}
			echo '</tbody></table>';
		}
		echo '</div></div>';
	} );

	// ---- Admin: verify winners and track the shirt from the user's profile screen (Users -> Edit user).
	function scrolly_k1_admin_section( $user ) {
		if ( ! current_user_can( 'edit_users' ) ) {
			return;
		}
		$chal = get_user_meta( $user->ID, 'scrolly_k1_chal', true );
		if ( ! is_array( $chal ) || empty( $chal['order'] ) ) {
			return;
		}
		$a    = scrolly_k1_access( $user->ID );
		$w    = scrolly_k1_window( $user->ID, $a );
		$log  = get_user_meta( $user->ID, 'scrolly_k1_log', true );
		$rev  = scrolly_k1_window_revenue( is_array( $log ) ? $log : array(), $w );
		$ach  = is_array( $chal['achievement'] ?? null ) ? $chal['achievement'] : array();
		$st   = scrolly_k1_status( $chal, $w, $rev );
		$hist = get_user_meta( $user->ID, 'scrolly_k1_chal_history', true );
		echo '<h2 id="k1-challenge-admin">$1K Challenge</h2>' . wp_nonce_field( 'scrolly_k1_admin', '_k1admin', true, false ) . '<table class="form-table">';
		echo '<tr><th>Status</th><td><strong>' . esc_html( scrolly_k1_status_label( $st ) ) . '</strong> (' . esc_html( $st ) . ')' . ( is_array( $hist ) && $hist ? ' · ' . count( $hist ) . ' earlier attempt(s)' : '' ) . '</td></tr>';
		echo '<tr><th>Shirt size</th><td>' . esc_html( scrolly_k1_shirt_size( $user->ID, (int) $chal['order'] ) ?: 'not chosen' ) . ' <span class="description">(the member can change it until you mark the shirt ordered)</span></td></tr>';
		if ( $w && ! empty( $w['started'] ) ) {
			echo '<tr><th>Window</th><td>Order #' . (int) $chal['order'] . ' · ' . esc_html( gmdate( 'M j', $w['start'] ) . ' to ' . gmdate( 'M j, Y', $w['end'] - DAY_IN_SECONDS ) ) . ' · day ' . (int) $w['day'] . '</td></tr>';
			echo '<tr><th>Revenue they logged in the window</th><td>' . esc_html( scrolly_k1_money( $rev ) ) . ( $rev < SCROLLY_K1_GOAL ? ' <strong style="color:#b32d2e">(below $1,000)</strong>' : '' ) . '</td></tr>';
		}
		if ( ! empty( $ach['claim'] ) ) {
			$c = $ach['claim'];
			echo '<tr><th>Proof submitted</th><td>' . esc_html( wp_date( 'M j, Y g:ia', strtotime( $c['claimedAt'] ) ) ) . ' · claims ' . esc_html( scrolly_k1_money( $c['claimedRevenueUsd'] ) ) . ' · files (emailed to ' . esc_html( SCROLLY_K1_ADMIN_EMAIL ) . '): ' . esc_html( implode( ', ', (array) $c['files'] ) ) . ( $c['note'] ? '<br>Note: ' . esc_html( $c['note'] ) : '' ) . '</td></tr>';
		}
		if ( in_array( $st, array( 'stripe_submitted', 'stripe_verified' ), true ) ) {
			echo '<tr><th><label for="k1-decision">Decision</label></th><td><select name="k1_decision" id="k1-decision"><option value="">No change</option>' . ( 'stripe_submitted' === $st ? '<option value="verified">Verified: qualifying sales total $1,000+ inside the window</option><option value="not_verified">Cannot verify</option>' : '<option value="not_verified">Undo verification</option>' ) . '</select>';
			echo '<p><input type="text" class="regular-text" name="k1_reason" placeholder="Reason shown to the customer if you cannot verify"></p></td></tr>';
		}
		if ( ! empty( $ach['verified'] ) ) {
			$choice = $ach['rewardChoice'] ?? 'pending';
			$ship   = $ach['shipping'] ?? null;
			echo '<tr><th>Winner shirt</th><td>' . esc_html( ucfirst( $choice ) ) . ( $ship ? ': size ' . esc_html( $ship['size'] ) . ', ' . esc_html( implode( ', ', array_filter( array( $ship['name'], $ship['address1'], $ship['address2'], $ship['city'], $ship['state'], $ship['postcode'], $ship['country'] ) ) ) ) : '' );
			echo '<p><label><input type="checkbox" name="k1_merch_ordered" value="1"' . checked( ! empty( $ach['merchOrdered'] ), true, false ) . '> Shirt ordered in Printify</label></p></td></tr>';
		}
		echo '</table>';
	}
	add_action( 'show_user_profile', 'scrolly_k1_admin_section' );
	add_action( 'edit_user_profile', 'scrolly_k1_admin_section' );

	function scrolly_k1_admin_save( $user_id ) {
		if ( ! current_user_can( 'edit_users' ) || ! isset( $_POST['_k1admin'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_k1admin'] ) ), 'scrolly_k1_admin' ) ) {
			return;
		}
		$chal = get_user_meta( $user_id, 'scrolly_k1_chal', true );
		if ( ! is_array( $chal ) || empty( $chal['order'] ) ) {
			return;
		}
		$chal['achievement'] = is_array( $chal['achievement'] ?? null ) ? $chal['achievement'] : array();
		$ach                 = &$chal['achievement'];
		$ach['reviews']      = is_array( $ach['reviews'] ?? null ) ? $ach['reviews'] : array();
		$decision            = (string) wp_unslash( $_POST['k1_decision'] ?? '' );
		$operator            = wp_get_current_user()->user_login;
		if ( 'verified' === $decision && ! empty( $ach['claim'] ) ) {
			$ach['verified']           = true;
			$ach['verifiedAt']         = current_time( 'mysql' );
			$ach['verificationMethod'] = 'customer_claim_reviewed'; // same default as club-state.mjs
			$ach['merchUnlocked']      = true;
			$ach['reviews'][]          = array( 'decision' => 'verified', 'at' => current_time( 'mysql' ), 'operator' => $operator, 'claim' => $ach['claim'] );
		} elseif ( 'not_verified' === $decision ) {
			// Clearing the claim reopens submission if their logged revenue is still $1,000+ and the window/grace allows it.
			$ach['reviews'][]    = array( 'decision' => 'not_verified', 'reason' => sanitize_text_field( wp_unslash( $_POST['k1_reason'] ?? '' ) ), 'at' => current_time( 'mysql' ), 'operator' => $operator, 'claim' => $ach['claim'] ?? null );
			$ach['claim']        = null;
			$ach['verified']     = false;
			$ach['verifiedAt']   = null;
			$ach['merchUnlocked'] = false;
		}
		if ( ! empty( $ach['verified'] ) ) {
			$ach['merchOrdered'] = ! empty( $_POST['k1_merch_ordered'] );
		}
		unset( $ach );
		update_user_meta( $user_id, 'scrolly_k1_chal', $chal );
	}
	add_action( 'personal_options_update', 'scrolly_k1_admin_save' );
	add_action( 'edit_user_profile_update', 'scrolly_k1_admin_save' );

	// ---- Challenge Content tab: one shared collection for every Challenge member (never per-customer).
	//   Reels: page SCROLLY_K1_REELS_PAGE, replaced with each weekly drop (25 a week, 4 drops = 100).
	//   Carousels / Stories: evergreen pages (30 each), set their IDs above once created.
	function scrolly_k1_page_html( $id, $empty ) {
		$post = $id ? get_post( $id ) : null;
		return $post ? apply_filters( 'the_content', $post->post_content ) : '<p>' . esc_html( $empty ) . '</p>';
	}
	add_action( 'woocommerce_account_' . SCROLLY_K1_EP_REELS . '_endpoint', function () {
		$uid = get_current_user_id();
		$a   = scrolly_k1_access( $uid );
		echo scrolly_k1_css() . '<div class="k1a">';
		if ( ! $a['challenge'] ) {
			echo '<div class="sec teal"><h2>Challenge Content</h2><p>Fresh Reel opportunities every week, plus carousel and Story templates, come with the $1K Challenge.</p><a class="btn" href="' . esc_url( scrolly_k1_add_challenge_url() ) . '">Add the $1K Challenge</a></div></div>';
			return;
		}
		$w = scrolly_k1_window( $uid, $a );
		echo '<div class="sec black"><h2>Challenge Content</h2><p>' . ( $w && $w['started'] ? 'Week ' . (int) min( 5, ceil( $w['day'] / 7 ) ) . ' of your Challenge. ' : '' ) . 'Use the pieces that fit your business. Your <a style="color:#94ece1" href="' . esc_url( wc_get_account_endpoint_url( SCROLLY_K1_EP_PLAN ) . '#k1-this-week' ) . '">This Week</a> list says how many of each to make.</p>';
		echo '<p class="note">Make each video once for Instagram Reels, then post the same video to TikTok and YouTube Shorts if you use them.</p></div>';
		echo '<div class="k1tabs" role="tablist"><button type="button" role="tab" data-t="k1-reels" aria-selected="true">Reels (25)</button><button type="button" role="tab" data-t="k1-carousels" aria-selected="false">Carousels (30)</button><button type="button" role="tab" data-t="k1-stories" aria-selected="false">Stories (30)</button></div>';
		echo '<div class="reels" id="k1-reels"><h2>This week’s 25 Reel opportunities</h2><p class="note">Reach and discovery. A new set drops every week.</p>' . scrolly_k1_page_html( SCROLLY_K1_REELS_PAGE, 'This week’s Reels are on the way.' ) . '</div>';
		echo '<div class="reels" id="k1-carousels" hidden><h2>30 carousel templates</h2><p class="note">Education, trust, and answering the doubts people have before buying.</p>' . scrolly_k1_page_html( SCROLLY_K1_CAROUSELS_PAGE, 'Your carousel templates are on the way.' ) . '</div>';
		echo '<div class="reels" id="k1-stories" hidden><h2>30 Story templates</h2><p class="note">Staying in touch, proof, and your call to action.</p>' . scrolly_k1_page_html( SCROLLY_K1_STORIES_PAGE, 'Your Story templates are on the way.' ) . '</div>';
		echo '<script>(function(){var b=document.querySelectorAll(".k1tabs button");function show(id){b.forEach(function(x){var on=x.dataset.t===id;x.setAttribute("aria-selected",on?"true":"false");document.getElementById(x.dataset.t).hidden=!on;});}b.forEach(function(x){x.addEventListener("click",function(){show(x.dataset.t);history.replaceState(null,"","#"+x.dataset.t);});});var h=location.hash.slice(1);if(document.getElementById(h)&&/^k1-(reels|carousels|stories)$/.test(h))show(h);})();</script></div>';
	} );
}
