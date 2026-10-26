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
	// Content Tracker (public Notion template, never a private workspace URL) + its companion guide, Auto-Posting with Your AI
	// (2026-10-08, replaced the Make blueprint): a protected WooCommerce download on 583 and 280 whose file name contains
	// SCROLLY_K1_GUIDE_FILE. Video URL: set once recorded.
	define( 'SCROLLY_K1_TRACKER_URL', 'https://antique-sweater-bd0.notion.site/Content-Planner-3f6ab38f4c58814aa91cc340ceb304d6' );
	define( 'SCROLLY_K1_GUIDE_FILE', 'Auto-Posting-With-Your-AI' );
	define( 'SCROLLY_K1_TRACKER_VIDEO', '' );
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
	define( 'SCROLLY_K1_ADMIN_EMAIL', 'hello@theambitiondepartment.com' );

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
			// Mercedes 2026-10-09: the start step read as optional, so it is now "Step 2" with the orange primary button.
			return $h . '<p class="chip">Step 2 of 2</p><h2>Start your 30 days</h2><p>Your 30 consecutive days begin the moment you press start, and only sales inside those days count toward your $1,000. Start today, or come back here when you’re ready.</p>'
				. scrolly_k1_form_open( 'start' ) . '<button class="btn or" type="submit">Start my 30 days</button></form>' . scrolly_k1_size_form( scrolly_k1_shirt_size( $uid, (int) $a['chal_order'] ) ) . '</div>';
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
		$h .= '<div class="stripe"><div class="track" role="img" aria-label="' . (int) $pct . ' percent of $1,000"><i style="width:' . (int) $pct . '%"></i></div><b>' . (int) $pct . '%</b></div><ul class="milestones">';
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
		$h = '<details style="margin-top:16px"><summary style="color:#fff">Your stripe shirt size: ' . esc_html( $current ? $current : 'not chosen' ) . ' (change)</summary>' . scrolly_k1_form_open( 'size' ) . '<label for="k1-mysize" style="color:#fff;margin-top:10px">Shirt size (Adult Men&#39;s, Comfort Colors 1717, Graphite)</label><select id="k1-mysize" name="size" style="max-width:220px">';
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
		echo '<div class="k1ty">';
		echo '<p class="t">' . ( $chal ? 'You’re in. Your $1K Challenge is ready.' : 'You’re in. Your $1K Club is ready.' ) . '</p>';
		echo '<p>' . ( $chal
			? 'Open My $1K Plan to answer a few questions about your business, get your plan, and start your 30 days when you’re ready. Your playbook PDF is in Downloads.'
			: 'Your playbook PDF is in Downloads, and your $1K Math calculator is in My $1K Plan.' ) . '</p>';
		echo '<div class="acts"><a class="go" href="' . esc_url( $plan ) . '">Open My $1K Plan</a>';
		echo '<a class="alt" href="' . esc_url( wc_get_account_endpoint_url( 'downloads' ) ) . '">Go to Downloads</a></div>';
		echo '<p class="small">Your access is saved to your account under ' . esc_html( $order->get_billing_email() ) . '. To come back later, log in at ' . esc_html( wc_get_page_permalink( 'myaccount' ) ) . ' (use “Lost your password?” if you need a new one).</p>';
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
		unset( $items['dashboard'], $items['orders'] );
		$new = array( SCROLLY_K1_EP_PLAN => 'My $1K Plan' );
		if ( $a['challenge'] ) {
			$new[ SCROLLY_K1_EP_CHECKIN ] = 'Weekly Check-in';
			$new[ SCROLLY_K1_EP_NUMBERS ] = 'My Numbers';
			$new[ SCROLLY_K1_EP_REELS ]   = 'Challenge Content';
		}
		return $new + $items;
	}, 20 );
	add_action( 'woocommerce_before_edit_account_form', function () {
		echo '<p style="margin:0 0 18px"><a href="' . esc_url( wc_get_account_endpoint_url( 'orders' ) ) . '">Orders</a> · <a href="' . esc_url( wc_get_account_endpoint_url( 'edit-address' ) ) . '">Billing and shipping addresses</a> · <a href="' . esc_url( wc_get_account_endpoint_url( 'payment-methods' ) ) . '">Saved payment methods</a></p>';
	} );
	// My Account layout (menu column + content column) lives in website/scrolly-site/chrome/k1-account.css (v3, 2026-10-03).
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
				"Order the graphite \$1K Club winner shirt in Printify (Comfort Colors 1717, Graphite):\nhttps://printify.com/app/product-details/6acad00ccebf0fc23e019c79\n\nSize: $size\n" . $ship['name'] . "\n" . $ship['address1'] . "\n" . ( $ship['address2'] ? $ship['address2'] . "\n" : '' ) . $ship['city'] . ', ' . $ship['state'] . ' ' . $ship['postcode'] . "\n" . $ship['country']
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
(()=>{var L=["ecommerce","services","digital_product","creator_affiliate","marketplace_first","local_hybrid"];function Q(){return{businessName:null,websiteUrl:null,route:null,stage:null,offer:null,oneSentenceOffer:null,price:null,audience:null,currentRevenueUsd:null,sellingSurfaces:[],discoveryChannels:[],hasEmailList:null,emailListSize:null,timeAvailableHoursPerWeek:null,existingMetrics:{},notes:null}}var X={ecommerce:{label:"Ecommerce / physical products",funnelStages:["reach","product_view","add_to_cart","purchase"],relevantMetrics:["visitors","conversionRate","averageOrderValue","repeatPurchaseRate"],defaultChannels:{primary:"seo_or_marketplace_search",secondary:"social_content",compoundingAsset:"email_list"},discoverabilityAngle:"product-level search (own site and/or marketplace) plus shareable content",closingMetricKey:"conversionRate",searchIsFoundational:!0},services:{label:"Services / freelance",funnelStages:["reach","lead_or_inquiry","qualified_conversation","booked_client"],relevantMetrics:["inquiries","conversationToClientRate","averageClientValue"],defaultChannels:{primary:"referral_or_niche_content",secondary:"local_or_search_presence",compoundingAsset:"case_studies_portfolio"},discoverabilityAngle:"being found for the specific problem solved, plus referral surface area",closingMetricKey:"conversationToClientRate",searchIsFoundational:!1},digital_product:{label:"Digital product / course",funnelStages:["reach","lead_capture","sales_page_view","purchase"],relevantMetrics:["visitors","optInRate","salesPageConversionRate"],defaultChannels:{primary:"content_that_teaches",secondary:"email_list",compoundingAsset:"search_or_evergreen_content"},discoverabilityAngle:"content that answers the exact question the product solves",closingMetricKey:"salesPageConversionRate",searchIsFoundational:!0},creator_affiliate:{label:"Creator / affiliate",funnelStages:["reach","engagement","click_through","conversion_or_commission"],relevantMetrics:["reach","engagementRate","clickThroughRate"],defaultChannels:{primary:"platform_native_content",secondary:"cross_post_to_search_indexed_surface",compoundingAsset:"audience_list"},discoverabilityAngle:"platform algorithm fit plus at least one search-indexed surface (not platform-only)",closingMetricKey:"affiliateConversionRate",searchIsFoundational:!1},marketplace_first:{label:"Marketplace-first (e.g. Etsy)",funnelStages:["marketplace_search_impression","listing_view","add_to_cart","purchase"],relevantMetrics:["impressions","clickThroughRate","listingConversionRate"],defaultChannels:{primary:"marketplace_search_optimization",secondary:"social_content_driving_marketplace_traffic",compoundingAsset:"repeat_buyer_list_if_platform_allows"},discoverabilityAngle:"marketplace search/tag optimization first \u2014 that surface is the primary discovery channel",closingMetricKey:"listingConversionRate",searchIsFoundational:!0},local_hybrid:{label:"Local / hybrid selling online",funnelStages:["reach","local_discovery","inquiry_or_visit","purchase"],relevantMetrics:["localDiscoveryViews","inquiryRate","closeRate"],defaultChannels:{primary:"local_search_and_maps_presence",secondary:"community_or_local_social",compoundingAsset:"review_and_referral_base"},discoverabilityAngle:"local discovery surfaces (Maps/local search) plus community presence",closingMetricKey:"closeRate",searchIsFoundational:!0}};function k(e){if(!L.includes(e))throw new Error(`Unknown business model route "${e}" \u2014 cannot route without a valid BusinessProfile.route`);return X[e]}function O(){return L.map(e=>({route:e,label:X[e].label}))}var q=[{low:.15,base:.25,high:.4},{low:.08,base:.15,high:.25},{low:.02,base:.05,high:.1}],J=q[0],Ae=20;function Me(e){return q[Math.min(e,q.length-1)]}function Z({price:e,route:t,knownRates:n={},targetUsd:i=1e3}){if(!e||e<=0)throw new Error("computeThousandKMath requires a positive price");let o=k(t),r=Math.ceil(i/e),a=o.funnelStages,d=[];for(let u=a.length-1;u>0;u--){let c=a[u-1],p=a[u],y=`${c}->${p}`,f=a.length-1-u,m=n[y],v=Me(f);d.unshift({from:c,to:p,source:m!=null?"your_own_data":"planning_assumption",rate:m!=null?{low:m,base:m,high:m}:v})}function h(u){let c=r,p=[{stage:a[a.length-1],count:c}];for(let y=d.length-1;y>=0;y--){let f=d[y],m=f.rate[u];c=c!=null&&m>0?Math.ceil(c/m):null,p.unshift({stage:f.from,count:c})}return p}let l=d.some(u=>u.source==="planning_assumption");return{price:e,targetUsd:i,requiredSales:r,resultingRevenue:Math.round(e*r*100)/100,isHighTransactionCount:r>=Ae,route:t,routeLabel:o.label,transitions:d,scenarios:{conservative:h("low"),base:h("base"),upside:h("high")},disclosure:l?'One or more steps use a labeled planning-range assumption, not your own measured data. Replace any "planning_assumption" transition with your real numbers as soon as you have them \u2014 these ranges exist to make the goal actionable, not to predict your actual results.':"Every funnel step below used your own supplied conversion data."}}var Ie=["reviewCount","testimonialCount","repeatPurchaseRate"],Pe={exists:"\u2713",not_established:"\u25CB"},Le={insufficient_data:"?",growth_opportunity:"!",on_track:"\u2713",growth_strength:"\u2605"};function w(e,t,n,i,o={}){return{name:e,kind:"existence",state:t,icon:Pe[t],headline:n,rationale:i,evidence:o}}function _(e,t,n,i,o={}){return{name:e,kind:"performance",state:t,icon:Le[t],headline:n,rationale:i,evidence:o}}function Oe(e){return!!e.offer&&e.price!=null?w("Offer","exists","Offer exists","You have a priced offer people can actually buy.",{offer:e.offer,price:e.price}):w("Offer","not_established","Offer not yet defined","There's no clearly priced offer yet.",{})}function qe(e){return e.audience?w("Customer","exists","Customer defined","You've identified who you believe is most likely to buy.",{audience:e.audience}):w("Customer","not_established","Customer not yet defined","The likely buyer hasn't been described yet.",{})}function Fe(e){return(e.discoveryChannels||[]).length>0?w("Discovery channel","exists","Discovery channel exists","At least one way for people to find you is already in use.",{discoveryChannels:e.discoveryChannels}):w("Discovery channel","not_established","Discovery channel not established","No way for new people to find you is in active use yet.",{})}function Be(e){return e.hasEmailList===!0?w("Follow-up","exists","Follow-up exists","You have a way to stay in touch with people after they show interest.",{emailListSize:e.emailListSize}):w("Follow-up","not_established","Follow-up not established","You don't currently have a follow-up mechanism. We won't assume you need one until we understand your sales path.",{})}function Ue(e,t){let n=t.closingMetricKey,i=e.existingMetrics?e.existingMetrics[n]:null;if(i==null)return _("Conversion","insufficient_data","Conversion unknown","We don't have enough buying activity yet to know how effectively the offer converts.",{});let o=J;return i>=o.base?_("Conversion","growth_strength","Conversion is a strength","The real conversion rate you reported is at or above what a typical early-stage business sees at this step.",{known:i}):i<o.low?_("Conversion","growth_opportunity","Conversion needs work","The real conversion rate you reported is meaningfully below what a typical early-stage business sees at this step -- a concrete, evidenced gap.",{known:i}):_("Conversion","on_track","Conversion is on track","The real conversion rate you reported is in a reasonable range for an early-stage business.",{known:i})}function We(e){let t=e.existingMetrics||{},n=Ie.find(o=>t[o]!=null);if(!n)return _("Trust","insufficient_data","Trust unknown","We don't yet have enough information about proof or buyer confidence.",{});let i=t[n];return n==="repeatPurchaseRate"?i>=.2?_("Trust","growth_strength","Trust is a strength","Real repeat-purchase evidence suggests buyers already trust this business.",{[n]:i}):_("Trust","growth_opportunity","Trust needs work","Real repeat-purchase evidence is low -- a concrete trust/retention gap.",{[n]:i}):i>0?_("Trust","on_track","Trust is on track","Some real trust signal exists, though not yet a strong one.",{[n]:i}):_("Trust","growth_opportunity","Trust needs work","The trust signal we have is reported as zero.",{[n]:i})}function ee(e,t){return{dimensions:[Oe(e),qe(e),Fe(e),Be(e),Ue(e,t),We(e)]}}var te={A:{key:"starting_from_zero",title:"Starting From Zero",copy:"You're building the foundation. Your first goal is not to scale. It's to get something clear enough in front of real people that you can start collecting evidence about what they want and what they will buy.",focus:"Offer \u2192 customer \u2192 sales path \u2192 first buying activity"},B:{key:"ready_to_sell",title:"Ready to Sell",copy:"You have something to sell. Now we need proof. The goal is to put the offer in front of qualified people, watch what produces interest, and learn what creates buying intent.",focus:"Qualified exposure \u2192 interest \u2192 buying activity \u2192 evidence"},C:{key:"building_momentum",title:"Building Momentum",copy:"You've already proven someone will pay. Now the job is to identify what is driving sales, what is limiting growth, and what deserves more effort.",focus:"Find the bottleneck \u2192 repeat what works \u2192 improve the constraint"}};function Ye(e){return te[e]||te.A}function De(e,t){let n=e.existingMetrics?e.existingMetrics[t.closingMetricKey]!=null:!1,i=e.currentRevenueUsd!=null&&e.currentRevenueUsd>0;return n&&i?{key:"strong_baseline",title:"Strong baseline",copy:"We have enough real performance data to model the path with reasonable confidence."}:n||i?{key:"partial_baseline",title:"Partial baseline",copy:"Some of the model is based on real customer data and some still uses estimates."}:{key:"establishing_baseline",title:"Establishing a baseline",copy:"There isn't enough real activity yet to know conversion or volume requirements reliably."}}function je({startingStateKey:e,discoveryExists:t,conversionState:n}){return e==="starting_from_zero"?{type:"clarify_offer",label:"Clarify the offer",rationale:"There's no clearly defined, priced offer yet \u2014 everything else depends on that being in place first."}:t?n==="insufficient_data"?{type:"generate_buying_activity",label:"Generate qualified buying activity",rationale:"Right now we don't have enough evidence to say whether your primary constraint is discovery, the offer, conversion, trust, or something else. Your next objective is to put the offer in front of enough relevant people to start learning where the real constraint is."}:n==="growth_opportunity"?{type:"improve_conversion",label:"Improve conversion",rationale:"People are already finding the offer, and real evidence shows conversion is the current constraint."}:{type:"increase_discovery",label:"Increase qualified discovery",rationale:"The offer already converts reasonably well \u2014 the more likely lever now is reaching more of the right people."}:{type:"increase_discovery",label:"Increase qualified discovery",rationale:"You have an offer, but no way yet for the right people to find it."}}var ne={label:"Module 2 \u2014 Build Something People Want to Buy",cta:"Continue to Module 2 \u2014 Build Your Offer"},oe={clarify_offer:"Module 2 is exactly where we'll do that \u2014 building an offer clear enough to test.",generate_buying_activity:"Next, we'll evaluate the offer itself before deciding where and how to promote it.",improve_conversion:"Before changing how you reach people, Module 2 will check whether the offer itself is part of why conversion is low.",increase_discovery:"Module 2 will sharpen the offer itself first, so the extra reach you generate next converts as well as possible."};function Ge(e){return{moduleLabel:ne.label,transition:oe[e.type]||oe.generate_buying_activity,cta:ne.cta}}var He={reach:"people reached",product_view:"product views",add_to_cart:"cart adds",purchase:"purchases",lead_or_inquiry:"leads or inquiries",qualified_conversation:"qualified conversations",booked_client:"booked clients",lead_capture:"leads",sales_page_view:"sales page views",engagement:"engaged people",click_through:"clicks",conversion_or_commission:"conversions",marketplace_search_impression:"search impressions",listing_view:"listing views",local_discovery:"people who discovered the business locally",inquiry_or_visit:"inquiries or visits"};function Ke(e){return He[e]||e.replace(/_/g," ")}var Ve={reach:"Qualified reach/visits",product_view:"Product views",add_to_cart:"Add-to-cart activity",purchase:"Purchases",lead_or_inquiry:"Inquiries/leads",qualified_conversation:"Sales conversations",booked_client:"Clients",lead_capture:"Leads",sales_page_view:"Sales page views",engagement:"Audience engagement",click_through:"Clicks",conversion_or_commission:"Conversions",marketplace_search_impression:"Search impressions",listing_view:"Listing views",local_discovery:"Local discovery views",inquiry_or_visit:"Inquiries/visits"};function ze(e){return[...e.funnelStages.map(t=>Ve[t]||t.replace(/_/g," ")),"Revenue"]}function F(e){return`$${Number(e).toLocaleString("en-US",{minimumFractionDigits:e%1===0?0:2,maximumFractionDigits:2})}`}function Qe(e,t){var n,i;return(i=(n=e.scenarios.base.find(o=>o.stage===t))==null?void 0:n.count)!=null?i:null}function Xe({math:e,conversionDim:t,firstPriority:n}){let i=e.requiredSales===1?"1 sale":`${e.requiredSales} sales`,o=e.isHighTransactionCount?` At ${F(e.price)}, that's a relatively high transaction count for an early-stage business. That's mathematically possible, and it's worth keeping in mind as a later question about the offer \u2014 not something to solve today.`:"";if(t.state==="insufficient_data")return`You need approximately ${i} at ${F(e.price)} to cross $1,000. Because you don't yet have reliable conversion data, your first objective isn't hitting an arbitrary traffic target \u2014 it's generating enough qualified activity to learn what percentage of interested people actually buy.`+o;let r=e.transitions[e.transitions.length-1],a=Math.round(t.evidence.known*1e3)/10,d=Ke(r.from),h=Qe(e,r.from),l=n.type==="improve_conversion"?"conversion":n.type==="increase_discovery"?"discovery volume":"the offer itself",u=`You already convert about ${a}% of qualified ${d}. At your current ${F(e.price)} price, you need approximately ${i}.`;return h!=null&&(u+=` If that rate holds, that implies roughly ${h} qualified ${d}.`),u+=` Your primary constraint appears more likely to be ${l} than rebuilding the offer.${o}`,u}var Je={Conversion:"Actual conversion performance",Trust:"Whether trust/proof is sufficient"};function Ze({profile:e,startingState:t,math:n,dataConfidence:i,dimensions:o,firstPriority:r,nextClubStep:a,routeConfig:d}){var p,y;let h=o.filter(f=>f.kind==="existence"&&f.state==="exists").map(f=>f.headline),l=o.filter(f=>f.kind==="performance"&&f.state==="insufficient_data").map(f=>Je[f.name]||f.headline),u=((p=o.find(f=>f.name==="Discovery channel"))==null?void 0:p.state)==="exists",c=((y=o.find(f=>f.name==="Conversion"))==null?void 0:y.state)==="insufficient_data";return u&&c&&l.push("Whether existing discovery produces qualified traffic"),{startingState:{title:t.title},primaryOffer:{name:e.offer||null,price:n.price},target:{salesRequired:n.requiredSales,resultingRevenue:n.resultingRevenue},dataConfidence:{title:i.title},whatExists:h,whatsUnknown:l,currentPriority:r.label,baselineMetrics:ze(d),nextClubStep:a}}function et(e,t){let n=t.closingMetricKey,i=e.existingMetrics?e.existingMetrics[n]:null;if(i==null)return{};let o=t.funnelStages;return{[`${o[o.length-2]}->${o[o.length-1]}`]:i}}function T(e){let t=k(e.route),n=Z({price:e.price,route:e.route,knownRates:et(e,t)}),{dimensions:i}=ee(e,t),o=Ye(e.stage),r=i.find(p=>p.name==="Discovery channel"),a=i.find(p=>p.name==="Conversion"),d=De(e,t),h=je({startingStateKey:o.key,discoveryExists:r.state==="exists",conversionState:a.state}),l=Xe({math:n,conversionDim:a,firstPriority:h}),u=Ge(h),c=Ze({profile:e,startingState:o,math:n,dataConfidence:d,dimensions:i,firstPriority:h,nextClubStep:u,routeConfig:t});return{businessType:{route:e.route,label:t.label},moduleProgress:{current:1,total:7},startingState:o,math:n,dataConfidence:d,whatWeKnow:i,interpretation:l,firstPriority:h,nextClubStep:u,startingPointPlan:c}}var tt={"Qualified reach/visits":"Instagram reach","Search impressions":"Instagram reach","Local discovery views":"Instagram profile visits"},R=e=>tt[e]||e,ie="people reached on Instagram",re={local_discovery:"Instagram profile visits"},N="Make the Reel once for Instagram. If useful, repost the finished video to TikTok and YouTube Shorts, or pin it to Pinterest, for extra reach. It still counts as 1 created.";var nt="instagram",x={instagram:"Instagram",tiktok:"TikTok",linkedin:"LinkedIn",other:"another channel"},C=e=>nt||(x[e.channel]?e.channel:"instagram"),$={own_site:"your website",etsy:"your Etsy shop",marketplace:"your marketplace listing",booking:"your booking link",quote:"your quote or inquiry form",dm:"a DM or message",phone:"a call or text"},ae={instagram:"Instagram",facebook:"Facebook",tiktok:"TikTok",linkedin:"LinkedIn",google:"Google",marketplace_search:"Etsy or marketplace search",referral:"Word of mouth or referrals",local:"Local events or in person"};function M(e){let t=e.route,n=k(t),i={},o=Number(e.closePct);e.closePct!==""&&e.closePct!=null&&Number.isFinite(o)&&o>=0&&(i[n.closingMetricKey]=o/100);let r=Number(e.reviews);e.reviews!==""&&e.reviews!=null&&Number.isFinite(r)&&(i.reviewCount=r);let a=Number(e.revenue);return{...Q(),businessName:e.business||null,route:t,stage:e.stage==="C"?"C":"B",offer:e.offer||null,price:Number(e.price)>0?Number(e.price):null,audience:e.audience||null,currentRevenueUsd:e.revenue!==""&&e.revenue!=null&&Number.isFinite(a)?a:null,sellingSurfaces:e.where?[e.where]:[],discoveryChannels:Array.isArray(e.found)?e.found:[],hasEmailList:e.emailList==="yes"?!0:e.emailList==="no"?!1:null,existingMetrics:i}}var B=e=>e.where==="booking"?"booking":"outreach";function A(e){return e.route==="services"?B(e)==="booking"?{avg:"booking",one:"client",many:"clients"}:{avg:"job",one:"job",many:"jobs"}:e.route==="marketplace_first"||e.route==="ecommerce"?{avg:"order",one:"sale",many:"sales"}:e.route==="local_hybrid"?{avg:"order",one:"order",many:"orders"}:e.route==="creator_affiliate"?{avg:"payout",one:"conversion",many:"conversions"}:{avg:"sale",one:"sale",many:"sales"}}var S=e=>e==null?e:String(e).replace(/\s*(?:—|–|--)\s*/g,", ").replace(/,\s*,/g,","),ot={reach:"people reached",product_view:"product views",add_to_cart:"cart adds",purchase:"sales",lead_or_inquiry:"inquiries",qualified_conversation:"sales conversations",booked_client:"clients",lead_capture:"email or lead signups",sales_page_view:"sales page visits",engagement:"engaged viewers",click_through:"link clicks",conversion_or_commission:"conversions",marketplace_search_impression:"search impressions",listing_view:"listing views",local_discovery:"people who find you locally",inquiry_or_visit:"inquiries or visits"},it=e=>re[e]||ot[e]||e.replace(/_/g," "),se={ecommerce:['Bundles ("buy 2, save")',"Matching add-ons at checkout","A gift or multi-item set"],marketplace_first:["Bundle listings (2 or 3 items)","A premium or personalized version","Matching add-ons in the same listing"],digital_product:["A bundle of related templates or resources","A premium version (for example with a setup walkthrough)","A small add-on at checkout"],local_hybrid:["Party or event packs","A minimum order box","Add-ons like delivery or personalization"],services:["Packages (for example 3 sessions instead of 1)","A monthly option for ongoing work"]};function rt(e,t){let n={highVolume:e.isHighTransactionCount,note:null,levers:[],scenarios:[],trustNote:null};return e.isHighTransactionCount&&se[t]?(n.levers=se[t],n.note="At your average sale it takes a lot of sales to reach $1,000, which is a high-volume path for a new organic presence. Raising what the average customer spends (without simply raising your price) can shorten it a lot."):e.isHighTransactionCount&&t==="creator_affiliate"&&(n.note="For creator income, volume of clicks is the main lever, so pick offers with a higher payout where you can."),e.price>=300&&t!=="creator_affiliate"&&(n.trustNote="Each sale is a bigger decision for your buyers. Proof (results, reviews, examples) and an easy next step matter more for you than raw reach."),n}function st(e){return(String(e||"").match(/[^.!?]+[.!?]+/g)||[]).map(n=>n.trim()).filter(n=>!/[0-9$%]/.test(n)&&!/^That's mathematically possible/.test(n)).join(" ")}var at={clarify_offer:()=>"Write one clear sentence: what you sell, who it is for, and the price.",increase_discovery:e=>`Make ${e.channel} your one main channel and post there several times this week, with every post pointing to ${e.destination}.`,generate_buying_activity:e=>`Put your offer in front of potential buyers on ${e.channel} every day this week, and ask for the next step (${e.destination}) every time.`,improve_conversion:e=>`People already find you. Fix the moment they decide: make ${e.destination} quick, clear, and full of proof.`},lt={services:()=>"Tell past clients and contacts you have openings this month and ask who they know. Referrals are usually the fastest route to a booked service.",ecommerce:()=>"Link straight to your best-selling product page (not your homepage) and make sure it shows the price, clear photos, and one line of proof.",digital_product:()=>"Show the product working: a short screen recording of the result it gives, with a direct link to checkout.",marketplace_first:()=>"Refresh the titles and first photo of your top 3 listings with the words buyers actually search, and send social traffic straight to those listings.",local_hybrid:()=>"Make ordering or booking effortless: one link in your Instagram bio that goes straight to ordering or booking.",creator_affiliate:()=>"Pick the one product you will recommend this week and end every post with the link to it."},ct=["Paid ads (wait until you know what converts)","Building separate strategies for additional platforms (create once, then cross-post)","Redesigning your logo, brand, or website","SEO and blogging (a later-stage lever)"],ut={services:"Creating a course or digital product on the side",ecommerce:"Adding lots of new products before your best seller sells steadily",digital_product:"Building a long email funnel before your first 10 sales",marketplace_first:"Opening your own website before your shop is working",local_hybrid:"Expanding to a new area or new locations",creator_affiliate:"Chasing follower counts instead of link clicks"};function U(e){let t=M(e);if(!t.price)throw new Error("A price above $0 is required to build your plan.");let n=T(t),i=k(t.route),o=C(e),r={channel:x[o],destination:$[e.where]||"the place people buy from you"},{math:a}=n,d=i.funnelStages,h=(c,p)=>{var y,f;return(f=(y=a.scenarios[c][p])==null?void 0:y.count)!=null?f:null},l=[];for(let c=d.length-1;c>=1;c--)l.push({stage:d[c],label:it(d[c]),base:h("base",c),low:h("upside",c),high:h("conservative",c),isSale:c===d.length-1});let u={stage:d[0],label:ie,low:h("upside",0),high:h("conservative",0)};return{business:t.businessName,offer:t.offer,price:a.price,goalUsd:a.targetUsd,route:{key:t.route,label:i.label},channel:{key:o,label:r.channel},destination:r.destination,number:{requiredSales:a.requiredSales,saleNoun:a.requiredSales===1?A(e).one:A(e).many,resultingRevenue:a.resultingRevenue},funnel:{steps:l,reach:u,usesYourData:!a.transitions.some(c=>c.source==="planning_assumption")},economics:rt(a,t.route),startingState:{title:n.startingState.title,copy:S(n.startingState.copy)},dataConfidence:{title:n.dataConfidence.title,copy:S(n.dataConfidence.copy)},interpretation:S(n.interpretation),guidance:S(st(n.interpretation)),whatWeKnow:n.whatWeKnow.map(c=>({icon:c.icon,headline:c.headline,rationale:S(c.rationale),kind:c.kind})),firstPriority:{type:n.firstPriority.type,label:n.firstPriority.label,rationale:S(n.firstPriority.rationale)},workOnNow:[at[n.firstPriority.type](r),lt[t.route](r)],notYet:[...ct,ut[t.route]],crossPost:o==="instagram"||o==="tiktok"?N:null,checkInMetrics:n.startingPointPlan.baselineMetrics.map(R),executionKey:{route:t.route,channel:o,constraint:n.firstPriority.type}}}function W(){return{periodStart:null,periodEnd:null,activity:{channelsUsed:[],actions:[],capacityConstrained:null,notes:null},revenueUsd:null,salesCount:null,pathMetrics:[],revenueAttribution:{state:"unknown",breakdown:[]},experimentUpdates:[]}}function le({measure:e=[],earlyEvidenceCount:t=0}){return e.filter(i=>i!=="Revenue").map((i,o)=>({label:i,tier:o<t?"attention":"buying_intent",order:o}))}function ce(e,t=[]){let n=new Map(t.map(i=>[i.label,i]));return e.map(i=>{let o=n.get(i.label);return{...i,value:o&&o.known?o.value:null,known:!!(o&&o.known)}})}var g={insufficient_data:"Insufficient Data",discovery_constraint:"Discovery Constraint",message_interest_constraint:"Message / Interest Constraint",cta_movement_constraint:"CTA / Movement Constraint",conversion_trust_constraint:"Conversion / Trust Constraint",economics_volume_constraint:"Economics / Volume Constraint",capacity_constraint:"Capacity Constraint",repeatability_constraint:"Repeatability Constraint",path_healthy:"Path Appears Healthy \u2014 Scale Current Winner"};function I(e,t){return e.some(t)}function de({didAnyActivity:e,attentionMetrics:t=[],intentMetrics:n=[],revenueUsd:i,salesCount:o,capacityConstrained:r,isHighTransactionCount:a,repeatabilityRegression:d}){let h=i!=null&&i>0,l=o!=null&&o>0,u=I(t,v=>v.known),c=I(t,v=>v.known&&v.value>0),p=I(n,v=>v.known),y=I(n,v=>v.known&&v.value>0),f=n[n.length-1],m=!!(f&&f.known&&f.value>0);return!e&&!u&&!p&&i==null&&o==null?{category:"insufficient_data",label:g.insufficient_data,rationale:"Nothing was reported for this period yet -- there is nothing here to diagnose from."}:d&&!h&&!l?{category:"repeatability_constraint",label:g.repeatability_constraint,rationale:"A prior review showed real sales/revenue, but this period did not reproduce it -- the win exists, but it has not yet become repeatable."}:h||l?a?{category:"economics_volume_constraint",label:g.economics_volume_constraint,rationale:"Real sales are happening, but the transaction volume required at this price to reach $1,000 is high enough to be the actual constraint, not conversion."}:{category:"path_healthy",label:g.path_healthy,rationale:"Real sales/revenue occurred this period and nothing else in the evidence points to a constraint -- this looks like a winner worth scaling, not a problem to fix."}:r===!0&&(y||c)?{category:"capacity_constraint",label:g.capacity_constraint,rationale:"You reported more interest/demand than you could take on this period -- the constraint is execution/fulfillment capacity, not marketing."}:t.length>0&&!u?{category:"insufficient_data",label:g.insufficient_data,rationale:"We don't yet know whether qualified people are reaching you at all -- that has to be known before anything downstream can be diagnosed."}:u&&!c&&!y?{category:"discovery_constraint",label:g.discovery_constraint,rationale:"Not enough relevant people are currently reaching the business/offer to evaluate anything downstream yet."}:n.length>0&&!p?{category:"insufficient_data",label:g.insufficient_data,rationale:"Relevant discovery appears to exist, but we don't yet know whether it produced any real buying interest -- that has to be known before diagnosing conversion."}:(c||t.length===0)&&p&&!y?{category:"message_interest_constraint",label:g.message_interest_constraint,rationale:"Relevant discovery exists, but meaningful buying interest is weak -- the message/audience fit is the more likely lever than the path itself."}:y&&!m?{category:"cta_movement_constraint",label:g.cta_movement_constraint,rationale:"Interest exists, but people are not meaningfully progressing toward the final step of the buying path."}:m&&!h&&!l?{category:"conversion_trust_constraint",label:g.conversion_trust_constraint,rationale:"Qualified consideration reached the final step of the path, but purchase/inquiry completion did not follow -- worth investigating trust/offer at that exact decision point."}:{category:"insufficient_data",label:g.insufficient_data,rationale:"The evidence reported this period does not clearly point to one specific constraint yet."}}function pe({attentionMetrics:e=[],intentMetrics:t=[],revenueUsd:n,salesCount:i}){if(n!=null&&n>0)return{label:"Revenue",tier:"revenue",rationale:`Real revenue ($${n}) is the strongest evidence available this period.`};if(i!=null&&i>0)return{label:"Sales",tier:"sales",rationale:`${i} real sale(s)/order(s) is the strongest evidence available this period.`};let o=[...t].reverse().find(a=>a.known&&a.value>0);if(o)return{label:o.label,tier:"buying_intent",rationale:`"${o.label}" is your strongest observed buying-intent signal this period.`};let r=e.find(a=>a.known&&a.value>0);return r?{label:r.label,tier:"attention",rationale:`You generated real attention (${r.label}), but there isn't yet enough downstream activity to identify a buying signal -- this is attention, not evidence of buying intent.`}:{label:null,tier:"none",rationale:"No meaningful signal -- attention or downstream -- was reported this period."}}function fe({constraintCategory:e,attributionState:t,hasMultipleReviews:n,patternConsistent:i}){return e==="insufficient_data"?{key:"insufficient_data",label:"Insufficient Data",explanation:"There isn't enough reported evidence yet to responsibly diagnose what's limiting growth."}:t==="known"&&n&&i?{key:"evidence_backed",label:"Evidence-Backed",explanation:"This is based on real, attributed data that has shown a consistent pattern across more than one review."}:t==="unknown"&&!n?{key:"working_hypothesis",label:"Working Hypothesis",explanation:"This is a reasonable read of a single period with unattributed data -- worth testing, not yet a settled pattern."}:{key:"partially_validated",label:"Partially Validated",explanation:"Some real evidence supports this read, but not enough yet (in attribution or repetition) to call it fully confirmed."}}function ye({constraint:e,strongestSignal:t,primaryChannelLabel:n,ranExperiments:i=[]}){let o=[];for(let r of i)r.status==="ran"&&r.result&&o.push({title:`Continue the "${r.experimentText}" experiment.`,rationale:`You ran it and it produced a real result: ${r.result}`});return e.category==="path_healthy"&&t.tier!=="none"&&o.push({title:`Repeat what you did on ${n||"your primary channel"} this period.`,rationale:"Real sales/revenue resulted and no constraint was identified -- this is worth doing again, not changing."}),(t.tier==="buying_intent"||t.tier==="sales"||t.tier==="revenue")&&o.push({title:`Keep whatever produced "${t.label}" -- it's your strongest real evidence this period.`,rationale:t.rationale}),o.length===0?[{title:"Not enough evidence yet to confidently repeat anything specific.",rationale:"No meaningful positive signal was reported this period to justify repeating a specific action."}]:[...new Map(o.map(r=>[r.title,r])).values()]}function ge({experimentUpdates:e=[]}){let t=e.filter(n=>n.status==="no_longer_relevant");return t.length===0?[{title:"Nothing to stop yet.",rationale:"No evidence of clearly misaligned effort, duplicated work, or a resolved experiment has surfaced yet."}]:t.map(n=>({title:`Stop the "${n.experimentText}" experiment.`,rationale:"You indicated this is no longer relevant -- no need to keep spending effort on it."}))}var ue={insufficient_data:"Track the specific metrics relevant to your path for one more period before diagnosing anything further.",discovery_constraint:"Send a small, deliberate amount of qualified traffic through your primary channel and confirm it actually reaches your destination.",message_interest_constraint:"Test a different message/angle on your primary channel and see whether buying interest improves.",cta_movement_constraint:"Simplify or clarify the next step from your channel to your destination and see whether movement improves.",conversion_trust_constraint:"Place your strongest proof directly at the final decision point and see whether completion improves.",economics_volume_constraint:"Test whether a repeat-purchase or bundle approach changes the transaction volume needed, rather than changing the path.",capacity_constraint:"Test a small process change to handle existing demand before generating more of it.",repeatability_constraint:"Deliberately repeat the exact activity that worked before and see whether the result reproduces.",path_healthy:"Test putting slightly more effort behind exactly what worked, and confirm the result holds at a larger scale."};function me({constraint:e,notRunExperiments:t=[]}){let i={discovery_constraint:"module4_channel",message_interest_constraint:"module5_messaging",cta_movement_constraint:"module6_sales_path",conversion_trust_constraint:"module6_sales_path"}[e.category];if(i){let o=t.find(r=>r.source===i);if(o)return`Run the experiment you already have queued for this: "${o.experimentText}"`}return ue[e.category]||ue.insufficient_data}var he={insufficient_data:()=>"Establish basic tracking for your path before trying to optimize anything.",discovery_constraint:e=>`Generate enough qualified reach from ${e.primaryChannelLabel} to have real activity to evaluate.`,message_interest_constraint:e=>`Sharpen what you're saying on ${e.primaryChannelLabel} so it produces real buying interest, not just reach.`,cta_movement_constraint:e=>`Make the next step from ${e.primaryChannelLabel} to ${e.destinationLabel} as obvious as possible.`,conversion_trust_constraint:e=>`Get real proof visible right at ${e.destinationLabel} before changing anything else.`,economics_volume_constraint:()=>"Focus on transaction volume and repeat purchases -- the path itself is already working.",capacity_constraint:()=>"Prioritize fulfilling the demand you already have before generating more of it.",repeatability_constraint:()=>"Deliberately repeat exactly what produced the prior result before assuming anything else needs to change.",path_healthy:e=>`Keep doing what worked on ${e.primaryChannelLabel} -- nothing here needs to change yet.`};function ve({constraint:e,primaryChannelLabel:t,destinationLabel:n}){return(he[e.category]||he.insufficient_data)({primaryChannelLabel:t||"your primary channel",destinationLabel:n||"your destination"})}var ht=new Set(["Qualified reach/visits","Product views","Audience engagement","Search impressions","Listing views","Local discovery views","Instagram reach","Instagram profile visits"]);function Y(e){let t=e.startingPointPlan.baselineMetrics.map(R),n=0;for(let i of t)if(ht.has(i))n++;else break;return le({measure:t,earlyEvidenceCount:n})}function be(e,t,n){let i=ce(Y(e),n.pathMetrics),o=i.filter(u=>u.tier==="attention"),r=i.filter(u=>u.tier==="buying_intent"),a=t.primaryChannelLabel||null,d=t.destinationLabel||null,h=de({didAnyActivity:n.activity.actions.length>0,attentionMetrics:o,intentMetrics:r,revenueUsd:n.revenueUsd,salesCount:n.salesCount,capacityConstrained:n.activity.capacityConstrained,isHighTransactionCount:e.math.isHighTransactionCount,repeatabilityRegression:!1}),l=pe({attentionMetrics:o,intentMetrics:r,revenueUsd:n.revenueUsd,salesCount:n.salesCount});return{input:n,reportableMetrics:i,strongestSignal:l,constraint:h,confidence:fe({constraintCategory:h.category,attributionState:n.revenueAttribution.state,hasMultipleReviews:!1,patternConsistent:!1}),repeat:ye({constraint:h,strongestSignal:l,primaryChannelLabel:a,ranExperiments:[]}),stop:ge({experimentUpdates:[]}),test:me({constraint:h,notRunExperiments:[]}),nextWeekFocus:ve({constraint:h,primaryChannelLabel:a,destinationLabel:d}),context:{price:e.math.price,requiredSales:e.math.requiredSales,primaryChannelLabel:a,destinationLabel:d}}}var _e=1e3,D=30,E=e=>"$"+Number(e).toLocaleString("en-US",{maximumFractionDigits:2});function P(e,t={}){let n=Number(e.price),i=Math.max(0,Number(t.revenue)||0),o=Math.max(0,_e-i),r=o>0?Math.ceil(o/n):0,{avg:a,one:d,many:h}=A(e),l=Number(t.day)||0,u=t.started?Math.max(0,D-l):D,c=Math.max(1,Math.ceil(u/7)),p={started:!!t.started,day:l,revenue:i,remaining:o,reached:o===0,moreSales:r,headline:`${E(i)} of ${E(_e)}`,toGo:o>0?`${E(o)} to go`:"Goal reached",salesLine:o>0?`At your current ${E(n)} average ${a}, ${r===1?`1 more ${d}`:`about ${r} more ${h}`} ${r===1?"gets":"get"} you there.`:"You reached $1,000. Submit your proof to claim your stripe.",paceLine:null,projection:null};if(t.started&&o>0&&u>0){let y=Math.ceil(r/c);p.paceLine=`With ${u} ${u===1?"day":"days"} left, that is about ${y} ${y===1?d:h} a week.`}return t.started&&l>=7&&o>0&&(p.projection=`Planning estimate only: at your pace so far, day 30 lands around ${E(Math.round(i/l*D))}.`),p}var dt={clarify_offer:"reach",increase_discovery:"reach",generate_buying_activity:"reach",improve_conversion:"decision",insufficient_data:"track",discovery_constraint:"reach",message_interest_constraint:"interest",cta_movement_constraint:"next_step",conversion_trust_constraint:"decision",economics_volume_constraint:"volume",capacity_constraint:"capacity",repeatability_constraint:"scale",path_healthy:"scale"},pt={reach:{reels:5,carousels:1,stories:3,angle:"Pick Reels that show your offer to new people. Discovery is the job this week."},track:{reels:4,carousels:1,stories:3,angle:"Keep posting at a steady pace so next week has real numbers to read."},interest:{reels:4,carousels:2,stories:3,angle:"Pick Reels whose hook names your buyer's problem in their own words. Use carousels to explain and answer doubts."},next_step:{reels:3,carousels:1,stories:5,angle:"Every piece should end with one clear next step. Stories with a link sticker do the heavy lifting this week."},decision:{reels:3,carousels:2,stories:5,angle:"Lead with proof: results, reviews, and answers to the questions people ask before buying."},scale:{reels:5,carousels:1,stories:3,angle:"Repeat the format and message that just produced a sale. Change as little as possible."},volume:{reels:4,carousels:1,stories:4,angle:"Feature your bundle or bigger option so each sale is worth more."},capacity:{reels:2,carousels:1,stories:2,angle:"Post lightly. Your time is better spent handling the demand you already have."}},ft={reach:e=>`End every post with one clear next step: ${e.destination}. Put the same link or instruction in your bio.`,track:e=>`Check that ${e.destination} works on your phone from start to finish, so interest is not lost at the last step.`,interest:()=>"Rewrite the first line of your 3 most recent posts so it names the problem your buyer has, not your product.",next_step:e=>`Put ${e.destination} in your bio, a pinned comment, and a Story link sticker. Say exactly what happens after they click.`,decision:e=>`Add 3 pieces of proof right where people decide (${e.destination}): reviews, results, or a short client quote.`,scale:()=>"Keep the call to action that produced your sale. Do not change it this week.",volume:e=>`Offer your bundle or bigger option right at ${e.destination}, so the upgrade is one tap away.`,capacity:()=>'Add a waitlist, booking window, or "next available" note so new interest is not lost while you catch up.'},yt={"services:outreach":{"*":"Message 10 past clients or contacts: say you have openings this month and ask who they know.",decision:"Ask 2 happy clients for a short review or testimonial you can post this week.",scale:"Ask this week's client for a referral and a review while the result is fresh.",capacity:"Batch your jobs into set days so you can take on the demand without burning out."},"services:booking":{"*":'Share 3 recent results (photos, a client quote, or a before-and-after), each ending with "book yours" and your booking link.',decision:"Add 2 client testimonials and your next available dates to your booking page.",next_step:"Make your booking page show real availability and exactly what happens after someone books.",scale:"Ask this week's client for a review and a referral while the result is fresh.",capacity:"Open a waitlist or set booking windows so new interest is not lost."},marketplace_first:{"*":"Refresh the titles and first photo of your top 3 listings with the words buyers actually search.",decision:"Add a size or in-use photo to your best listing and answer its most common question in the description.",volume:"Create one bundle listing (2 or 3 items) from your best sellers."},ecommerce:{"*":"Link straight to your best-selling product page and make sure it shows the price, clear photos, and one line of proof.",decision:"Add reviews and a shipping or returns line near the buy button on your best seller.",volume:'Add a "buy 2, save" bundle or a matching add-on to your best seller.'},digital_product:{"*":"Record a 20-second screen recording that shows the result your product gives, and link it to checkout.",decision:'Add one real example of the finished result and a short "who this is for" line to your sales page.',volume:"Create a bundle or premium version of your product."},local_hybrid:{"*":"Make ordering or booking effortless: one link in your Instagram bio that goes straight to ordering or booking.",decision:"Add recent reviews and photos where people order or book online.",volume:"Create a party pack, minimum box, or add-on option for online orders."},creator_affiliate:{"*":"Pick the one product you will recommend this week and end every post with the link to it."}};function j(e,t,n,i={},o=""){let r=n?n.d.constraint.category:t.firstPriority.type,a=dt[r]||"reach",d=C(e),h={channel:x[d],destination:$[e.where]||"the place people buy from you"},l=pt[a],u=yt[e.route==="services"?`services:${B(e)}`:e.route]||{},c=d==="linkedin",p=c?[{kind:"posts",count:Math.min(3,l.reels),text:`Write ${Math.min(3,l.reels)} LinkedIn posts. Borrow ideas from this week's 25 Reel opportunities and turn them into text or short video posts.`,job:"Reach and discovery"},{kind:"carousels",count:l.carousels,text:`Post ${l.carousels} document ${l.carousels===1?"post":"posts"} from the 30 carousel templates.`,job:"Education, trust, and answering doubts"},{kind:"engage",count:10,text:"Leave 10 thoughtful comments on posts by the people you want as clients.",job:"Being seen by the right people"}]:[{kind:"reels",count:l.reels,text:`Film ${l.reels} Reels from this week's 25 fresh Reel opportunities.`,job:"Reach and discovery"},{kind:"carousels",count:l.carousels,text:`Post ${l.carousels} ${l.carousels===1?"carousel":"carousels"} from the 30 carousel templates.`,job:"Education, trust, and answering doubts"},{kind:"stories",count:l.stories,text:`Post Stories on ${l.stories} days from the 30 Story templates.`,job:"Staying in touch, proof, and your call to action"}],y=i.started?Math.min(5,Math.max(1,Math.ceil((Number(i.day)||1)/7))):null,f=c?"LinkedIn is your main channel, so write for LinkedIn first. Short videos you make can still go to Instagram Reels, TikTok, and Shorts.":N;return{executionKey:{route:e.route,channel:d,constraint:r},mode:a,week:y,focus:n?n.d.nextWeekFocus:t.workOnNow[0],focusSource:n?`From your check-in for the week ending ${n.rec.periodEnd}`:"From your $1K Plan",goalGap:P(e,i),content:{angle:c?l.angle.replace("Stories with a link sticker do the heavy lifting this week.","A clear last line pointing to your next step does the heavy lifting this week.").replace(/Reels/g,"posts"):l.angle,items:p,crossPost:f},conversion:ft[a](h),business:u[a]||u["*"]||null,track:{metrics:t.checkInMetrics.slice(0,-2),alsoTrack:["Revenue and sales","Posts created and placements (cross-posts)"]},nextCheckIn:o}}var s=e=>String(e!=null?e:"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]),G=e=>e==null?"?":Number(e).toLocaleString("en-US"),gt=e=>"$"+Number(e).toLocaleString("en-US",{maximumFractionDigits:2});function xe(e){let t=e.economics,n=t.note?`<div class="sec cream"><h3>Your offer economics</h3><p>${s(t.note)}</p>
    ${t.levers.length?`<p><b>Ways businesses like yours raise the average order:</b></p><ul>${t.levers.map(o=>`<li>${s(o)}</li>`).join("")}</ul>`:""}</div>`:"",i=t.trustNote?`<div class="sec cream"><h3>Your offer economics</h3><p>${s(t.trustNote)}</p></div>`:"";return`
  <div id="k1-calc-slot"></div>
  ${e.guidance?`<div class="sec"><h2>What it takes</h2>
    <p class="note">${e.business?s(e.business)+" \xB7 ":""}${s(e.offer)}</p>
    <p>${s(e.guidance)}</p></div>`:""}
  ${n}${i}
  <div class="sec teal"><h2>My first priority</h2><h3>${s(e.firstPriority.label)}</h3><p>${s(e.firstPriority.rationale)}</p>
    <h3>Work on this now</h3><ul>${e.workOnNow.map(o=>`<li>${s(o)}</li>`).join("")}</ul>
    ${e.crossPost?`<p class="note">${s(e.crossPost)}</p>`:""}</div>
  <div class="sec"><h2>Don't worry about these yet</h2><ul>${e.notYet.map(o=>`<li>${s(o)}</li>`).join("")}</ul></div>
  <div class="sec"><h2>What we know so far</h2><ul class="known">${e.whatWeKnow.map(o=>`<li><span class="ic">${s(o.icon)}</span> <b>${s(o.headline)}.</b> ${s(o.rationale)}</li>`).join("")}</ul>
    <p class="note">Numbers to track each week: ${e.checkInMetrics.map(s).join(", ")}.</p></div>`}function Se(e,t){let n=T(M(e));return be(n,{primaryChannelLabel:x[C(e)],destinationLabel:$[e.where]},t)}function K(e){return Y(T(M(e)))}var b=e=>String(e!=null?e:"").replace(/\s*(?:—|–|--)\s*/g,", "),V={insufficient_data:"Not enough numbers yet to tell",discovery_constraint:"Not enough of the right people are seeing you yet",message_interest_constraint:"People see you, but not enough are interested yet",cta_movement_constraint:"People are interested, but not taking the next step",conversion_trust_constraint:"People reach the last step, but do not buy",economics_volume_constraint:"Sales are working. Volume is now the limit",capacity_constraint:"You have more interest than you can handle",repeatability_constraint:"A past win has not repeated yet",path_healthy:"It is working. Keep going"},we={"Instagram reach":"Accounts reached this week, from Instagram Insights","Instagram profile visits":"Profile visits this week, from Instagram Insights","Qualified reach/visits":"Views or reach on your posts (Instagram Insights or your platform stats)","Product views":"Visits to your product pages","Add-to-cart activity":"Times someone added to cart","Inquiries/leads":"Messages, calls, quote or booking requests","Sales conversations":"Real back-and-forth conversations about buying",Leads:"Email signups or people who asked about it","Sales page views":"Visits to your sales or checkout page","Audience engagement":"Likes, comments, shares, and saves",Clicks:"Link clicks","Search impressions":"Times your listings showed in search (from your shop stats)","Listing views":"Views of your listings","Local discovery views":"Profile or map views from people nearby","Inquiries/visits":"Orders started, messages, or booking requests"};function $e(e){return K(e).slice(0,-1).map((n,i)=>`<div><label for="k1-m${i}">${s(n.label)} this week</label>
    <input id="k1-m${i}" name="m[${i}]" type="number" min="0" step="1"><input type="hidden" name="ml[${i}]" value="${s(n.label)}">
    ${we[n.label]?`<p class="note">${s(we[n.label])}</p>`:""}</div>`).join("")}function Te(e){let t=K(e.snapshot),n=new Map((e.metrics||[]).map(r=>[r.label,r.value])),i=r=>r!==""&&r!=null,o=i(e.sales);return{...W(),periodStart:e.periodStart,periodEnd:e.periodEnd,activity:{channelsUsed:[],actions:e.actions||[],capacityConstrained:e.cap==="yes"?!0:e.cap==="no"?!1:null,notes:e.note||null},revenueUsd:i(e.rev)?Number(e.rev):null,salesCount:o?Number(e.sales):null,pathMetrics:t.map((r,a)=>{if(a===t.length-1)return{label:r.label,value:o?Number(e.sales):null,known:o};let d=n.get(r.label);return{label:r.label,value:i(d)?Number(d):null,known:i(d)}}),revenueAttribution:{state:e.attr||"unknown",breakdown:[]}}}function Ce(e){return Se(e.snapshot,Te(e))}function z(e){let t=Math.max(0,Math.min(100,Math.round(e.revenue/1e3*100)));return`<div class="gap"><div class="big">${s(e.headline)}</div><div class="stripe"><div class="track" role="img" aria-label="${t} percent of $1,000"><i style="width:${t}%"></i></div><b>${t}%</b></div><p><b>${s(e.toGo)}.</b> ${s(e.salesLine)}${e.paceLine?" "+s(e.paceLine):""}</p>
    ${e.started?"":'<p class="note">Your Challenge has not started yet, so this counts from $0.</p>'}
    ${e.projection?`<p class="note">${s(e.projection)}</p>`:""}</div>`}function Ee(e,t,n){let i=r=>r.map(a=>`<li><b>${s(b(a.title))}</b> ${s(b(a.rationale))}</li>`).join(""),o=t.stop.filter(r=>!/^Nothing to stop/.test(r.title));return`<div class="sec teal"><h2>Your check-in for the week ending ${s(e.periodEnd)}</h2>
    ${n?`<h3>Where you are against $1,000</h3>${z(n)}`:""}
    <h3>What happened</h3><p>${s(b(t.strongestSignal.rationale))}</p>
    <h3>What is holding you back</h3><p><b>${s(V[t.constraint.category]||t.constraint.label)}.</b> ${s(b(t.constraint.rationale))}</p>
    <h3>Keep doing</h3><ul>${i(t.repeat)}</ul>
    ${o.length?`<h3>Stop doing</h3><ul>${i(o)}</ul>`:""}
    <h3>Try this next week</h3><p>${s(b(t.test))}</p>
    <h3>Your focus for next week</h3><p class="focus"><b>${s(b(t.nextWeekFocus))}</b></p>
    <p class="note">How sure we are: ${s(t.confidence.label)}. ${s(b(t.confidence.explanation))}</p></div>`}function Re(e){return e.length<2?"":`<div class="sec"><h3>Past check-ins</h3><table><thead><tr><th>Week ending</th><th>Revenue</th><th>Sales</th><th>Created / placed</th><th>What held you back</th></tr></thead><tbody>${e.slice().reverse().map(({rec:t,d:n})=>`<tr><td>${s(t.periodEnd)}</td><td>${t.rev===""?"?":gt(t.rev)}</td><td>${t.sales===""?"?":G(t.sales)}</td><td>${t.created===""?"?":G(t.created)} / ${t.distributed===""?"?":G(t.distributed)}</td><td>${s(V[n.constraint.category]||n.constraint.label)}</td></tr>`).join("")}</tbody></table></div>`}function mt(e,t){return`<div class="sec black"><h2>Your focus this week</h2><p><b>${s(b(t.nextWeekFocus))}</b></p><p>Try: ${s(b(t.test))}</p><p class="note">From your check-in for the week ending ${s(e.periodEnd)}.</p></div>`}function Ne(e,t="#",n="#k1-review-sec"){let i=e.content.items.map(o=>`<li><b>${s(o.text)}</b> <span class="note">${s(o.job)}.</span></li>`).join("");return`<div class="sec black" id="k1-this-week"><h2>This week${e.week?` (week ${e.week} of your Challenge)`:""}</h2>
    <p class="note">${s(e.focusSource)}:</p><p class="focus"><b>${s(b(e.focus))}</b></p>
    ${z(e.goalGap)}</div>
  <div class="sec"><h3>1. Create</h3><p>${s(e.content.angle)}</p><ul>${i}</ul>
    <p class="note">${s(e.content.crossPost)}</p>
    <a class="btn teal" href="${s(t)}">Open this week's Reels, carousels, and Stories</a>
    <h3 style="margin-top:22px">2. Make it easy to buy</h3><p>${s(e.conversion)}</p>
    ${e.business?`<h3>3. Business move</h3><p>${s(e.business)}</p>`:""}
    <h3>${e.business?"4":"3"}. Track these for your check-in</h3><ul>${e.track.metrics.map(o=>`<li>${s(o)}</li>`).join("")}${e.track.alsoTrack.map(o=>`<li>${s(o)}</li>`).join("")}</ul>
    <p class="note">${s(e.nextCheckIn)} <a href="${s(n)}">Go to your weekly check-in</a>.</p></div>`}function H(e,t){try{return JSON.parse(e)}catch{return t}}function ke(){let e=document.getElementById("k1-week"),t=document.getElementById("k1-plan"),n=document.getElementById("k1-review"),i=document.getElementById("k1-checkin-metrics"),o=t||n,r=o?H(o.dataset.saved,null):null,a=o?H(o.dataset.reviews,[]):[],d=e?H(e.dataset.challenge,{}):{},h=[];try{h=a.map(p=>({rec:p,d:Ce(p)}))}catch{h=[]}let l=h[h.length-1],u=null;if(t&&r)try{u=U(r),t.innerHTML=xe(u);let p=document.getElementById("k1-calc"),y=document.getElementById("k1-calc-slot");p&&y&&y.appendChild(p)}catch(p){t.innerHTML=`<div class="sec cream"><p>We couldn't build your plan from these answers (${s(p.message)}). Please check your business details below.</p></div>`}if(e&&r&&u)try{e.innerHTML=Ne(j(r,u,l||null,d,e.dataset.next||""),e.dataset.content||"#",e.dataset.checkin||"#k1-review-sec")}catch{e.innerHTML=""}if(i&&r)try{i.innerHTML=$e(r)}catch{}let c=document.getElementById("k1-final-focus");c&&l&&(c.innerHTML=`<p><b>Your latest focus:</b> ${s(b(l.d.nextWeekFocus))}</p><p class="note" style="color:#fff">What held you back most recently: ${s(V[l.d.constraint.category]||l.d.constraint.label)}.</p>`),n&&(n.innerHTML=l?Ee(l.rec,l.d,r?P(r,d):null)+Re(h):"")}typeof window!="undefined"&&(window.ScrollyK1={computePlanView:U,renderPlan:xe,computeReviewForSaved:Se,checkInMetricsForSaved:K,renderCheckInMetrics:$e,reviewInputFromRecord:Te,diagnoseRecord:Ce,renderReviewResult:Ee,renderReviewHistory:Re,renderFocusBox:mt,renderGoalGap:z,renderThisWeek:Ne,computeGoalGap:P,computeThisWeek:j,newGrowthReviewInput:W,CHANNELS:x,WHERE_THEY_BUY:$,FOUND_VIA:ae,listRoutes:O},document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ke):ke());})();
K1JS;
	}

	/**
	 * Member-area styles live in website/scrolly-site/chrome/k1-account.css (v3 look, 2026-10-03), printed site-wide by the
	 * global chrome snippet and pushed over REST with install-chrome.mjs, so restyles never need a WPCode re-paste.
	 * Kept as a function so the call sites stay unchanged.
	 */
	function scrolly_k1_css() {
		return '';
	}

	// ---- My $1K Plan tab
	/**
	 * My $1K Plan calculator (2026-09-29): ONE card that replaces the black "My $1K Plan" number and the teal "$1K Math"
	 * calculator. Goal -> sales, then videos/day x days x platforms -> publishing opportunities, then a planning scenario
	 * (or the member's own rates) works back to sales-page visitors, cumulative views and average views per published post.
	 * Math: src/plan-calc.mjs (bundled with src/calc-entry.mjs into scrolly_k1_calc_js() by build.mjs). Planning math only.
	 *
	 * @param float  $price Average sale from Start Here (0 = unknown, defaults to $50).
	 * @param string $model online_checkout (built) or lead_service (same math, plus a note on how to read it).
	 */
	function scrolly_k1_calc_html( $price, $model = 'online_checkout' ) {
		$h  = '<div class="sec black k1calc" id="k1-calc"><h2>My $1K Plan</h2><div class="grid3">';
		$h .= '<div><label for="c-goal">Goal ($)</label><input id="c-goal" type="number" min="1" step="1" inputmode="decimal" value="1000"></div>';
		$h .= '<div><label for="c-price">Average sale ($)</label><input id="c-price" type="number" min="0" step="0.01" inputmode="decimal" value="' . esc_attr( $price ? $price : 50 ) . '"></div>';
		$h .= '<div><label for="c-days">Days</label><input id="c-days" type="number" min="1" step="1" inputmode="numeric" value="30"></div></div>';
		$h .= '<div class="calc-out" id="c-out" aria-live="polite"></div><p id="c-per"></p>';
		$h .= '<p class="note">Planning math only. Revenue before costs.</p>';

		$h .= '<div class="calc-panel"><h3>Your distribution plan</h3>';
		$h .= '<div class="grid"><div><label for="c-vpd">Original videos per day</label><input id="c-vpd" type="number" min="0" step="1" inputmode="numeric" value="3"></div></div>';
		$h .= '<fieldset><legend>Distribute each video to</legend><div class="calc-pills">';
		foreach ( array( 'instagram' => 'Instagram', 'facebook' => 'Facebook', 'tiktok' => 'TikTok', 'youtube' => 'YouTube Shorts', 'pinterest' => 'Pinterest' ) as $key => $label ) {
			$h .= '<label class="calc-pill"><input type="checkbox" name="c-platform" value="' . esc_attr( $key ) . '" checked><span>' . esc_html( $label ) . '</span></label>';
		}
		$h .= '</div></fieldset>';
		$h .= '<p class="calc-eq" id="c-orig"></p><p class="calc-eq" id="c-pub"></p><p class="warnline" id="c-dist-issue" role="status"></p><p class="note" id="c-pubnote"></p></div>';

		$h .= '<div class="calc-panel"><h3>What could it take?</h3>';
		$h .= '<div class="calc-scen" role="radiogroup" aria-label="Planning scenario">';
		foreach ( array( 'conservative' => 'Conservative', 'planning' => 'Planning', 'strong' => 'Strong' ) as $key => $label ) {
			$h .= '<button type="button" role="radio" data-scenario="' . esc_attr( $key ) . '" aria-checked="' . ( 'planning' === $key ? 'true' : 'false' ) . '">' . esc_html( $label ) . '</button>';
		}
		$h .= '</div><p class="note" id="c-rates"></p>';
		if ( 'lead_service' === $model ) {
			$h .= '<p class="note">This math is written for online checkout. For booked or quoted work, read "sales-page visitors" as people who reach your booking or quote page.</p>';
		}
		$h .= '<div class="calc-funnel" id="c-funnel" hidden>';
		$h .= '<div class="calc-step"><b id="c-f-sales"></b><span id="c-f-sales-noun">sales</span></div><div class="calc-up" aria-hidden="true">↑</div>';
		$h .= '<div class="calc-step"><b id="c-f-visitors"></b><span>sales-page visitors</span></div><div class="calc-up" aria-hidden="true">↑</div>';
		$h .= '<div class="calc-step"><b id="c-f-views"></b><span>cumulative views</span></div></div>';
		$h .= '<div class="calc-hero" id="c-hero" hidden><span>About</span><b id="c-vpp"></b><span>average views per published post</span></div>';
		$h .= '<p class="warnline" id="c-vpp-issue" role="status"></p>';
		$h .= '<p class="note">These are planning scenarios, not expected results. Actual performance varies by offer, audience, content, platform, and sales process.</p>';
		$h .= '<details class="calc-own"><summary>Use my own conversion rates</summary><p class="note">If you have real numbers, use them instead of the scenarios above.</p><div class="grid">';
		$h .= '<div><label for="c-cv">View to site visit (%)</label><input id="c-cv" type="number" min="0" max="100" step="0.1" inputmode="decimal" placeholder="e.g. 1.5"></div>';
		$h .= '<div><label for="c-cs">Visitor to purchase (%)</label><input id="c-cs" type="number" min="0" max="100" step="0.1" inputmode="decimal" placeholder="e.g. 5"></div>';
		$h .= '</div></details></div></div>';
		// Printed in the footer, not inline: WordPress content filters can rewrite "&&" in inline scripts to "&#038;&#038;".
		if ( ! has_action( 'wp_footer', 'scrolly_k1_calc_print_js' ) ) {
			add_action( 'wp_footer', 'scrolly_k1_calc_print_js', 99 );
		}
		return $h;
	}

	function scrolly_k1_calc_print_js() {
		echo '<script id="scrolly-k1-calc-js">' . scrolly_k1_calc_js() . '</script>';
	}

	/** Calculator script (src/calc-entry.mjs + src/plan-calc.mjs), inlined by build.mjs. */
	function scrolly_k1_calc_js() {
		return <<<'K1CALC'
(()=>{var E={online_checkout:{label:"Online checkout",steps:[{rate:"viewToVisit",label:"View to site visit",noun:"sales-page visitors"},{rate:"visitToSale",label:"Site visitor to purchase",noun:"sales"}],scenarios:{conservative:{label:"Conservative",viewToVisit:.005,visitToSale:.02},planning:{label:"Planning",viewToVisit:.015,visitToSale:.05},strong:{label:"Strong",viewToVisit:.03,visitToSale:.07}}}},h=o=>typeof o=="number"?o:parseFloat(o),g=o=>Number.isFinite(o);function M(o){let l=E[o.model||"online_checkout"],y=h(o.goal),v=h(o.avgSale),p=h(o.days),r=h(o.videosPerDay),f=Array.isArray(o.platforms)?o.platforms.length:Math.max(0,Math.floor(h(o.platforms)||0)),c={},e={sales:null,perDay:null,perWeek:null,originals:null,published:null,platformCount:f,funnel:null,views:null,viewsPerPost:null,rates:null,rateSource:null,issues:c};!(g(y)&&y>0)||!(g(v)&&v>0)||!(g(p)&&p>0)?c.plan="Enter a goal, an average sale, and a number of days above 0.":(e.sales=Math.ceil(y/v-1e-9),e.perDay=Math.round(e.sales/p*10)/10,e.perWeek=Math.round(e.sales/p*7*10)/10),g(r)&&r>=0?g(p)&&p>0?(e.originals=Math.round(r*p),f<1?c.distribution="Pick at least one platform.":e.published=e.originals*f):c.distribution="Enter a number of days above 0.":c.distribution="Videos per day must be 0 or more.";let d=null;if(o.custom){let t={};for(let n of l.steps){let a=h(o.custom[n.rate]);if(!(g(a)&&a>0&&a<=100)){c.rates=`${n.label} must be above 0% and at most 100%.`;break}t[n.rate]=a/100}c.rates||(d=t,e.rateSource="custom")}else{let t=l.scenarios[o.scenario||"planning"];t?(d=t,e.rateSource=o.scenario||"planning"):c.rates="Pick a scenario."}if(e.rates=d?Object.fromEntries(l.steps.map(t=>[t.rate,d[t.rate]])):null,e.sales!=null&&d){let t=[{noun:l.steps[l.steps.length-1].noun,count:e.sales}],n=e.sales;for(let a=l.steps.length-1;a>=0;a--)n=Math.ceil(n/d[l.steps[a].rate]-1e-9),a>0&&t.unshift({noun:l.steps[a-1].noun,count:n});e.views=n,e.funnel=t}return e.views!=null&&e.published!=null&&(e.published>0?e.viewsPerPost=Math.ceil(e.views/e.published-1e-9):c.viewsPerPost="Add at least one video per day to see views per post."),e}var u=o=>Number(o).toLocaleString("en-US");function D(o){let l=t=>o.querySelector("#"+t),y=E.online_checkout,v=["c-goal","c-price","c-days","c-vpd","c-cv","c-cs"].map(l),p=[...o.querySelectorAll('input[name="c-platform"]')],r=[...o.querySelectorAll("[data-scenario]")],f="planning",c=(t,n)=>{t&&(t.hidden=!n)},e=(t,n)=>{let a=l(t);a&&(a.innerHTML=n)};function d(){let[t,n,a,b,m,S]=v.map(i=>i?i.value:""),P=m!==""&&m!=null||S!==""&&S!=null,s=M({goal:t,avgSale:n,days:a,videosPerDay:b,platforms:p.filter(i=>i.checked).map(i=>i.value),scenario:f,custom:P?{viewToVisit:m,visitToSale:S}:null}),k=s.issues;e("c-out",s.sales!=null?`${u(s.sales)} ${s.sales===1?"sale":"sales"}`:""),e("c-per",s.sales!=null?`About ${s.perDay} a day, or ${s.perWeek} a week, over ${u(a)} days.`:k.plan||"");let w=s.platformCount;e("c-orig",s.originals!=null?`${u(b)} ${Number(b)===1?"video":"videos"}/day \xD7 ${u(a)} days = <b>${u(s.originals)} original ${s.originals===1?"video":"videos"}</b>`:""),e("c-pub",s.published!=null?`Distributed across ${w} ${w===1?"platform":"platforms"} = <b>${u(s.published)} publishing ${s.published===1?"opportunity":"opportunities"}</b>`:""),e("c-dist-issue",k.distribution||""),e("c-pubnote",s.published!=null&&s.originals>0&&w>1?`You don't need ${u(s.published)} different videos. You're creating ${u(s.originals)} original videos and distributing them across ${w===5?"five":w} platforms.`:""),r.forEach(i=>{let L=!P&&i.dataset.scenario===f;i.setAttribute("aria-checked",L?"true":"false")});let A=r.find(i=>i.getAttribute("aria-checked")==="true")||r[0];r.forEach(i=>{i.tabIndex=i===A?0:-1}),o.classList.toggle("c-custom",P);let T=i=>`${Math.round(i*1e3)/10}%`;e("c-rates",s.rates?`${P?"Your own rates":y.scenarios[f].label}: ${T(s.rates.viewToVisit)} of views visit your sales page, ${T(s.rates.visitToSale)} of visitors buy.`:k.rates||"");let $=s.funnel;c(l("c-funnel"),!!$&&s.views!=null),$&&s.views!=null&&(e("c-f-sales",u(s.sales)),e("c-f-sales-noun",s.sales===1?"sale":"sales"),e("c-f-visitors","~"+u($[0].count)),e("c-f-views","~"+u(s.views))),c(l("c-hero"),s.viewsPerPost!=null),s.viewsPerPost!=null&&e("c-vpp",u(s.viewsPerPost)),e("c-vpp-issue",s.viewsPerPost==null?k.viewsPerPost||(s.views!=null&&k.distribution?"Views per post appear once at least one platform is picked.":""):"")}v.forEach(t=>t&&t.addEventListener("input",d)),p.forEach(t=>t.addEventListener("change",d)),r.forEach(t=>t.addEventListener("click",()=>{f=t.dataset.scenario,[l("c-cv"),l("c-cs")].forEach(n=>{n&&(n.value="")}),d()})),r.forEach((t,n)=>t.addEventListener("keydown",a=>{let b={ArrowRight:n+1,ArrowDown:n+1,ArrowLeft:n-1,ArrowUp:n-1,Home:0,End:r.length-1};if(!(a.key in b))return;a.preventDefault();let m=r[(b[a.key]+r.length)%r.length];m.click(),m.focus()})),d()}if(typeof document!="undefined"){let o=()=>{let l=document.getElementById("k1-calc");l&&!l.dataset.ready&&(l.dataset.ready="1",D(l))};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",o):o()}})();
K1CALC;
	}

	/** Which calculator model fits the saved profile (same rule as modelForSaved() in src/plan-calc.mjs). */
	function scrolly_k1_calc_model( $profile ) {
		$where = (string) ( $profile['where'] ?? '' );
		return ( in_array( $where, array( 'booking', 'quote', 'dm', 'phone' ), true ) || 'services' === ( $profile['route'] ?? '' ) ) ? 'lead_service' : 'online_checkout';
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
		echo scrolly_k1_css() . '<div class="k1a k1v3">';
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
		// Other Challenge tabs: a reminder until the 30 days are started (the start button itself lives on My $1K Plan).
		if ( $need_challenge && $c['profile'] && ( ! $c['w'] || empty( $c['w']['started'] ) ) ) {
			echo scrolly_k1_start_nudge();
		}
		return $c;
	}

	/** Reminder shown until the Challenge's 30 days are started: sales only count inside the window. */
	function scrolly_k1_start_nudge() {
		return '<div class="sec black"><h2>Your 30 days haven’t started yet</h2><p>Sales only count toward your $1,000 once you press Start my 30 days.</p>'
			. scrolly_k1_form_open( 'start' ) . '<button class="btn or" type="submit">Start my 30 days</button></form></div>';
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
			echo '<div class="sec black"><h2>Your $1K Club</h2><p>Your playbook is ready in <a href="' . esc_url( wc_get_account_endpoint_url( 'downloads' ) ) . '">Downloads</a>. It walks through the whole system: your $1K math, fixing your buying path, what to post, and how to track and improve.</p></div>';
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
		echo scrolly_k1_calc_html( $price, scrolly_k1_calc_model( $profile ) );

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
	// ---- Downloads tab (Challenge buyers): the Content Tracker (public Notion template) and the Auto-Posting with Your AI
	//   guide sit as rows in the WooCommerce downloads table with everything else (Mercedes 2026-10-09: the separate block
	//   below the table was easy to miss). The setup steps follow the table.
	/** Setup steps for the Content Tracker + AI auto-posting rows above. */
	function scrolly_k1_automation_html( $uid ) {
		$h   = '<h2>Set up your Content Planner + auto-posting</h2><p>The Content Planner and the Auto-Posting with Your AI guide in the list above work together. Plan your posts in Notion, and your AI sends them to Buffer.</p>';
		if ( SCROLLY_K1_TRACKER_VIDEO ) {
			$h .= '<p><a href="' . esc_url( SCROLLY_K1_TRACKER_VIDEO ) . '" target="_blank" rel="noopener">Watch the setup video</a></p>';
		}
		$h  .= '<h3>Set it up in 4 steps</h3><ol>'
			. '<li><strong>Duplicate the Content Planner.</strong> Click its button in the list above, then click Duplicate at the top right in Notion.</li>'
			. '<li><strong>Connect Notion and Buffer to your AI.</strong> Step 2 of the guide has the settings for Claude and ChatGPT.</li>'
			. '<li><strong>Get one post ready.</strong> Delete the example rows, fill in one finished post with its captions and media, and set its Status to Ready.</li>'
			. '<li><strong>Send it.</strong> Copy the message from Step 5 of the guide to your AI. Check that the post shows up in Buffer and its Status changes to Queued.</li></ol>';
		$h  .= '<div class="sec teal"><h3>How it works</h3>'
			. '<p>Your AI takes your Ready posts in Publish Order (lowest number first), adds them to your Buffer queue, and marks them Queued. Ask for it any time, or set it to run once a day (Step 6 of the guide).</p>'
			. '<p><strong>Status:</strong> Idea → Ready → Queued → Published. Mark a post Published once it’s live, or ask your AI to check Buffer and update it.</p>'
			. '<p style="margin:16px 0 0;padding-left:14px;border-left:4px solid var(--s3-orange);font-size:var(--s3-fs-fine)"><strong>Keep these field names:</strong> Status, Publish Order, Platforms, Instagram Caption, TikTok Caption, YouTube Title, YouTube Description, Media Links. Your AI reads them by name. Everything else in the planner is yours to change.</p></div>';
		return $h;
	}
	// Adds the Content Planner as a row for Challenge buyers: just before the guide row when the order has the guide,
	// otherwise after the last Challenge row (2026-10-15: an order without the guide row showed no planner button at all).
	add_filter( 'woocommerce_customer_get_downloadable_products', function ( $downloads ) {
		$uid = get_current_user_id();
		if ( ! $uid || ! scrolly_k1_access( $uid )['challenge'] ) {
			return $downloads;
		}
		$row = function ( $d ) {
			return array_merge( (array) $d, array(
				'download_url'        => SCROLLY_K1_TRACKER_URL,
				'download_id'         => 'k1-content-tracker',
				'download_name'       => 'Content Planner (Notion template)',
				'downloads_remaining' => '',
				'access_expires'      => null,
				'file'                => array( 'name' => 'Content Planner (Notion template)', 'file' => SCROLLY_K1_TRACKER_URL ),
			) );
		};
		$out  = array();
		$done = false;
		$last = null; // index in $out of the last row from a $1K Challenge product
		foreach ( (array) $downloads as $d ) {
			if ( ! $done && isset( $d['file']['file'] ) && false !== strpos( $d['file']['file'], SCROLLY_K1_GUIDE_FILE ) ) {
				$out[] = $row( $d );
				$done  = true;
			}
			$out[] = $d;
			if ( isset( $d['product_name'] ) && false !== stripos( $d['product_name'], 'Challenge' ) ) {
				$last = count( $out ) - 1;
			}
		}
		if ( ! $done ) {
			$base = null !== $last ? $out[ $last ] : ( $out ? end( $out ) : array( 'product_name' => '$1K Challenge', 'product_url' => '', 'order_id' => 0, 'order_key' => '', 'product_id' => 0 ) );
			$new  = $row( $base );
			if ( null !== $last ) {
				array_splice( $out, $last + 1, 0, array( $new ) );
			} else {
				$out[] = $new;
			}
		}
		return $out;
	} );
	add_action( 'woocommerce_after_account_downloads', function () {
		$uid = get_current_user_id();
		$a   = scrolly_k1_access( $uid );
		if ( $a['challenge'] ) {
			echo scrolly_k1_css() . '<div class="k1a k1v3" id="k1-tracker" style="margin-top:32px"><div class="sec">' . scrolly_k1_automation_html( $uid ) . '</div></div>';
		}
	} );
	add_action( 'woocommerce_account_' . SCROLLY_K1_EP_REELS . '_endpoint', function () {
		$uid = get_current_user_id();
		$a   = scrolly_k1_access( $uid );
		echo scrolly_k1_css() . '<div class="k1a k1v3">';
		if ( ! $a['challenge'] ) {
			echo '<div class="sec teal"><h2>Challenge Content</h2><p>Fresh Reel opportunities every week, plus carousel and Story templates, come with the $1K Challenge.</p><a class="btn" href="' . esc_url( scrolly_k1_add_challenge_url() ) . '">Add the $1K Challenge</a></div></div>';
			return;
		}
		$w = scrolly_k1_window( $uid, $a );
		if ( ( ! $w || empty( $w['started'] ) ) && get_user_meta( $uid, 'scrolly_k1_profile', true ) ) {
			echo scrolly_k1_start_nudge();
		}
		echo '<div class="sec black"><h2>Challenge Content</h2><p>' . ( $w && $w['started'] ? 'Week ' . (int) min( 5, ceil( $w['day'] / 7 ) ) . ' of your Challenge. ' : '' ) . 'Use the pieces that fit your business. Your <a href="' . esc_url( wc_get_account_endpoint_url( SCROLLY_K1_EP_PLAN ) . '#k1-this-week' ) . '">This Week</a> list says how many of each to make.</p>';
		echo '<p class="note">Make each video once for Instagram Reels, then post the same video to TikTok and YouTube Shorts if you use them.</p></div>';
		echo '<div class="k1tabs" role="tablist" aria-label="Challenge content"><button type="button" role="tab" id="k1-tab-reels" aria-controls="k1-reels" data-t="k1-reels" aria-selected="true">Reels (25)</button><button type="button" role="tab" id="k1-tab-carousels" aria-controls="k1-carousels" data-t="k1-carousels" aria-selected="false" tabindex="-1">Carousels (30)</button><button type="button" role="tab" id="k1-tab-stories" aria-controls="k1-stories" data-t="k1-stories" aria-selected="false" tabindex="-1">Stories (30)</button></div>';
		echo '<div class="reels" id="k1-reels" role="tabpanel" aria-labelledby="k1-tab-reels"><h2>This week’s 25 Reel opportunities</h2><p class="note">Reach and discovery. A new set drops every week.</p>' . scrolly_k1_page_html( SCROLLY_K1_REELS_PAGE, 'This week’s Reels are on the way.' ) . '</div>';
		echo '<div class="reels" id="k1-carousels" role="tabpanel" aria-labelledby="k1-tab-carousels" hidden><h2>30 carousel templates</h2><p class="note">Education, trust, and answering the doubts people have before buying.</p>' . scrolly_k1_page_html( SCROLLY_K1_CAROUSELS_PAGE, 'Your carousel templates are on the way.' ) . '</div>';
		echo '<div class="reels" id="k1-stories" role="tabpanel" aria-labelledby="k1-tab-stories" hidden><h2>30 Story templates</h2><p class="note">Staying in touch, proof, and your call to action.</p>' . scrolly_k1_page_html( SCROLLY_K1_STORIES_PAGE, 'Your Story templates are on the way.' ) . '</div>';
		echo '<script>(function(){var b=document.querySelectorAll(".k1tabs button");function show(id){b.forEach(function(x){var on=x.dataset.t===id;x.setAttribute("aria-selected",on?"true":"false");x.tabIndex=on?0:-1;document.getElementById(x.dataset.t).hidden=!on;});}b.forEach(function(x,i){x.addEventListener("click",function(){show(x.dataset.t);history.replaceState(null,"","#"+x.dataset.t);});x.addEventListener("keydown",function(e){var n=e.key==="ArrowRight"?i+1:e.key==="ArrowLeft"?i-1:e.key==="Home"?0:e.key==="End"?b.length-1:null;if(n===null)return;e.preventDefault();var t=b[(n+b.length)%b.length];show(t.dataset.t);t.focus();history.replaceState(null,"","#"+t.dataset.t);});});var h=location.hash.slice(1);if(document.getElementById(h)&&/^k1-(reels|carousels|stories)$/.test(h))show(h);})();</script><script>(function(){function load(src,cb){var s=document.createElement("script");s.async=true;s.src=src;s.onload=cb;document.body.appendChild(s);}document.addEventListener("click",function(e){var b=e.target.closest(".k1c .ex button");if(!b)return;var slot=b.parentNode.querySelector(".slot");if(slot.dataset.done)return;slot.dataset.done="1";b.textContent="Loading…";if(b.dataset.ig){slot.innerHTML=\'<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/\'+b.dataset.ig+\'/" data-instgrm-version="14" style="margin:0;min-width:280px;max-width:340px;width:100%"></blockquote>\';if(window.instgrm){window.instgrm.Embeds.process();}else{load("https://www.instagram.com/embed.js",function(){window.instgrm&&window.instgrm.Embeds.process();});}}else{var id=b.dataset.tt.split("/video/")[1];slot.innerHTML=\'<blockquote class="tiktok-embed" cite="\'+b.dataset.tt+\'" data-video-id="\'+id+\'" style="margin:0;max-width:340px;min-width:280px"><section></section></blockquote>\';load("https://www.tiktok.com/embed.js");}slot.tabIndex=-1;slot.setAttribute("role","group");slot.setAttribute("aria-label","Example video");b.style.display="none";slot.focus();});})();</script></div>';
	} );
}
