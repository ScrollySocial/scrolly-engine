/**
 * Scrolly: $1K Club + Challenge reviews (2026-10-09).
 *
 * Separate WPCode snippet (PHP Snippet · Auto Insert · Run Everywhere). It only READS the frozen My Account snippet's
 * data (scrolly_k1_access / _window / _status), so that snippet stays untouched. Needs it active.
 *
 * Mercedes 2026-10-09: collect reviews ASAP. Buyers can review any time once they've gone through the content, and they
 * get asked again after the Challenge.
 *   - Form: My Account > leave-a-review (no menu item; linked from a card under My $1K Plan and Downloads, and from emails).
 *   - Storage: private post type scrolly_review, saved as Pending. Mercedes reads them under Reviews in wp-admin and
 *     approves by publishing. Nothing is shown publicly by this snippet.
 *   - Emails (daily WP-Cron), at most one per person per day, each sent once:
 *       content   7 days after their first $1K purchase, unless they already left a review
 *       after     their 30-day Challenge window ended without a verified $1K (asked whatever the result)
 *       verified  Mercedes verified their $1K
 *     Every email has a one-click opt-out. No incentives, and everyone is asked the same way whatever they might say
 *     (FTC 16 CFR 465).
 */
if ( ! defined( 'SCROLLY_K1R_EP' ) ) {
	define( 'SCROLLY_K1R_EP', 'leave-a-review' );
	define( 'SCROLLY_K1R_TYPE', 'scrolly_review' );
	define( 'SCROLLY_K1R_CONTENT_DAYS', 7 );
	define( 'SCROLLY_K1R_TO', defined( 'SCROLLY_K1_ADMIN_EMAIL' ) ? SCROLLY_K1_ADMIN_EMAIL : 'hello@scrollyseo.com' );

	function scrolly_k1r_ready() {
		return function_exists( 'scrolly_k1_access' ) && function_exists( 'scrolly_k1_window' ) && function_exists( 'scrolly_k1_status' );
	}

	/** Where this buyer is: club | challenge_active | challenge_done | verified. Recorded with each review. */
	function scrolly_k1r_stage( $uid, $a = null ) {
		$a = $a ? $a : scrolly_k1_access( $uid );
		if ( ! $a['challenge'] ) {
			return 'club';
		}
		$w    = scrolly_k1_window( $uid, $a );
		$chal = get_user_meta( $uid, 'scrolly_k1_chal', true );
		$log  = get_user_meta( $uid, 'scrolly_k1_log', true );
		$rev  = scrolly_k1_window_revenue( is_array( $log ) ? $log : array(), $w );
		$st   = scrolly_k1_status( is_array( $chal ) ? $chal : array(), $w, $rev );
		if ( 'stripe_verified' === $st ) {
			return 'verified';
		}
		return ( $w && ! empty( $w['over'] ) ) ? 'challenge_done' : 'challenge_active';
	}
	function scrolly_k1r_stage_label( $s ) {
		$l = array( 'club' => 'Club only', 'challenge_active' => 'Challenge, not finished yet', 'challenge_done' => 'Challenge finished', 'verified' => 'Verified $1K' );
		return $l[ $s ] ?? $s;
	}

	// ---- private post type (wp-admin > Reviews)
	add_action( 'init', function () {
		register_post_type( SCROLLY_K1R_TYPE, array(
			'labels'          => array( 'name' => 'Reviews', 'singular_name' => 'Review', 'menu_name' => 'Reviews', 'edit_item' => 'Review', 'all_items' => 'All reviews' ),
			'public'          => false,
			'show_ui'         => true,
			'show_in_menu'    => true,
			'show_in_rest'    => false,
			'menu_icon'       => 'dashicons-star-filled',
			'supports'        => array( 'title', 'editor' ),
			'capability_type' => 'post',
			'map_meta_cap'    => true,
		) );
		add_rewrite_endpoint( SCROLLY_K1R_EP, EP_ROOT | EP_PAGES );
		if ( get_option( 'scrolly_k1r_rw' ) !== '1' ) {
			flush_rewrite_rules( false );
			update_option( 'scrolly_k1r_rw', '1' );
		}
		if ( ! wp_next_scheduled( 'scrolly_k1r_daily' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'scrolly_k1r_daily' );
		}
	} );
	add_filter( 'woocommerce_get_query_vars', function ( $vars ) {
		$vars[ SCROLLY_K1R_EP ] = SCROLLY_K1R_EP;
		return $vars;
	} );
	add_filter( 'woocommerce_endpoint_' . SCROLLY_K1R_EP . '_title', function () { return 'Leave a review'; } );

	function scrolly_k1r_fields( $id ) {
		$m = array();
		foreach ( array( 'user', 'rating', 'stage', 'useful', 'changed', 'result', 'display', 'business', 'ok_site', 'ok_social', 'ok_edit' ) as $k ) {
			$m[ $k ] = get_post_meta( $id, '_k1r_' . $k, true );
		}
		return $m;
	}
	function scrolly_k1r_public_name( $m ) {
		if ( 'anon' === $m['display'] ) {
			return 'Anonymous';
		}
		$u     = get_userdata( (int) $m['user'] );
		$first = $u ? ( get_user_meta( $u->ID, 'first_name', true ) ?: $u->display_name ) : 'Customer';
		return ( 'business' === $m['display'] && $m['business'] ) ? $first . ', ' . $m['business'] : $first;
	}

	// Admin list: rating, stage and what they agreed to, at a glance.
	add_filter( 'manage_' . SCROLLY_K1R_TYPE . '_posts_columns', function ( $cols ) {
		return array( 'cb' => $cols['cb'], 'title' => 'Review', 'k1r_rating' => 'Rating', 'k1r_stage' => 'Stage', 'k1r_ok' => 'OK to quote', 'date' => 'Date' );
	} );
	add_action( 'manage_' . SCROLLY_K1R_TYPE . '_posts_custom_column', function ( $col, $id ) {
		$m = scrolly_k1r_fields( $id );
		if ( 'k1r_rating' === $col ) {
			echo esc_html( str_repeat( '★', (int) $m['rating'] ) . str_repeat( '☆', 5 - (int) $m['rating'] ) );
		} elseif ( 'k1r_stage' === $col ) {
			echo esc_html( scrolly_k1r_stage_label( $m['stage'] ) );
		} elseif ( 'k1r_ok' === $col ) {
			$ok = array_filter( array( $m['ok_site'] ? 'Website' : '', $m['ok_social'] ? 'Social' : '', $m['ok_edit'] ? 'Can trim' : '' ) );
			echo esc_html( $ok ? implode( ', ', $ok ) : 'Private only' );
		}
	}, 10, 2 );
	add_action( 'add_meta_boxes', function () {
		add_meta_box( 'k1r-details', 'Review details', function ( $post ) {
			$m = scrolly_k1r_fields( $post->ID );
			$u = get_userdata( (int) $m['user'] );
			echo '<p><strong>' . esc_html( str_repeat( '★', (int) $m['rating'] ) ) . '</strong> · ' . esc_html( scrolly_k1r_stage_label( $m['stage'] ) ) . '</p>';
			echo '<p><strong>Show as:</strong> ' . esc_html( scrolly_k1r_public_name( $m ) ) . ( $u ? ' · <a href="' . esc_url( admin_url( 'user-edit.php?user_id=' . $u->ID ) ) . '">' . esc_html( $u->user_email ) . '</a>' : '' ) . '</p>';
			echo '<p><strong>Most useful:</strong><br>' . nl2br( esc_html( $m['useful'] ) ) . '</p>';
			if ( $m['changed'] ) {
				echo '<p><strong>What changed:</strong><br>' . nl2br( esc_html( $m['changed'] ) ) . '</p>';
			}
			if ( '' !== $m['result'] ) {
				echo '<p><strong>30-day total they shared:</strong> ' . esc_html( function_exists( 'scrolly_k1_money' ) ? scrolly_k1_money( $m['result'] ) : '$' . $m['result'] ) . '</p>';
			}
			echo '<p><strong>Agreed to:</strong> ' . ( $m['ok_site'] ? 'quote on scrollyseo.com. ' : '' ) . ( $m['ok_social'] ? 'quote on social media. ' : '' ) . ( $m['ok_edit'] ? 'trimming/typo fixes. ' : '' ) . ( ! $m['ok_site'] && ! $m['ok_social'] ? 'private feedback only (do not quote).' : '' ) . '</p>';
			echo '<p class="description">Publish = approved. Publishing does not show it anywhere on the site; it only marks it as one you can use, within what they agreed to above.</p>';
		}, SCROLLY_K1R_TYPE, 'normal', 'high' );
	} );

	// ---- the form
	function scrolly_k1r_form_html( $uid ) {
		$a     = scrolly_k1_access( $uid );
		$stage = scrolly_k1r_stage( $uid, $a );
		$done  = in_array( $stage, array( 'challenge_done', 'verified' ), true );
		$msg   = sanitize_key( $_GET['k1r'] ?? '' );
		$h     = '<div class="k1a k1v3 k1r"><div class="sec">';
		if ( 'thanks' === $msg ) {
			return $h . '<h2>Thank you!</h2><p>Your review is in. We read every one, and it really does shape what gets better next.</p><p><a href="' . esc_url( wc_get_account_endpoint_url( SCROLLY_K1_EP_PLAN ) ) . '">Back to My $1K Plan</a></p></div></div>';
		}
		$h .= '<h2>' . ( 'verified' === $stage ? 'You did it. Would you share your story?' : ( $done ? 'How did your 30 days go?' : 'What do you think so far?' ) ) . '</h2>';
		$h .= '<p>Honest is best. Good or bad, every review helps us make the ' . ( $a['challenge'] ? 'Club and Challenge' : 'Club' ) . ' better. It takes about 2 minutes.</p>';
		if ( 'need' === $msg ) {
			$h .= '<p class="k1r-warn" role="alert">Please pick a star rating and tell us what was most useful.</p>';
		}
		$h .= '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="scrolly_k1r_save">' . wp_nonce_field( 'scrolly_k1r', '_k1r', false, false );
		$h .= '<fieldset class="k1r-stars"><legend>Your rating</legend>';
		$words = array( 5 => 'Loved it', 4 => 'Really good', 3 => 'It was OK', 2 => 'Not great', 1 => 'Disappointed' );
		foreach ( $words as $n => $word ) {
			$h .= '<label><input type="radio" name="rating" value="' . $n . '" required> <span aria-hidden="true">' . str_repeat( '★', $n ) . '</span> ' . esc_html( $word ) . '</label>';
		}
		$h .= '</fieldset>';
		$h .= '<label for="k1r-useful">What was most useful?</label><textarea id="k1r-useful" name="useful" rows="4" required></textarea>';
		$h .= '<label for="k1r-changed">What changed for your business? (optional)</label><textarea id="k1r-changed" name="changed" rows="3"></textarea>';
		if ( $done ) {
			$h .= '<label for="k1r-result">Your 30-day total, if you\'d like to share it ($, optional)</label><input id="k1r-result" name="result" type="number" min="0" step="0.01">';
		}
		$h .= '<fieldset><legend>If we share your review, show your name as</legend>'
			. '<label><input type="radio" name="display" value="first" checked> First name only</label>'
			. '<label><input type="radio" name="display" value="business"> First name and business</label>'
			. '<label><input type="radio" name="display" value="anon"> Don\'t show my name</label>'
			. '<label for="k1r-business" class="k1r-sub">Business name (if you picked that)</label><input id="k1r-business" name="business" type="text" maxlength="80"></fieldset>';
		$h .= '<fieldset><legend>Can we share it? (tick any, or none to keep it private)</legend>'
			. '<label class="chk"><input type="checkbox" name="ok_site" value="1"> You can quote my review on theambitiondepartment.com</label>'
			. '<label class="chk"><input type="checkbox" name="ok_social" value="1"> You can quote my review on The Ambition Department\'s social media</label>'
			. '<label class="chk"><input type="checkbox" name="ok_edit" value="1"> You can shorten it or fix typos, as long as the meaning stays the same</label></fieldset>';
		$h .= '<button class="btn" type="submit">Send my review</button></form></div></div>';
		return $h;
	}
	add_action( 'woocommerce_account_' . SCROLLY_K1R_EP . '_endpoint', function () {
		$uid = get_current_user_id();
		if ( ! scrolly_k1r_ready() || ! scrolly_k1_access( $uid )['club'] ) {
			echo '<p>Reviews are for $1K Club members.</p>';
			return;
		}
		echo ( function_exists( 'scrolly_k1_css' ) ? scrolly_k1_css() : '' ) . scrolly_k1r_css() . scrolly_k1r_form_html( $uid );
	} );

	add_action( 'admin_post_scrolly_k1r_save', function () {
		$uid = get_current_user_id();
		if ( ! $uid || ! isset( $_POST['_k1r'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_k1r'] ) ), 'scrolly_k1r' ) ) {
			wp_die( 'Please reload the page and try again.' );
		}
		$back = wc_get_account_endpoint_url( SCROLLY_K1R_EP );
		if ( ! scrolly_k1r_ready() || ! scrolly_k1_access( $uid )['club'] ) {
			wp_safe_redirect( $back );
			exit;
		}
		$rating = (int) ( $_POST['rating'] ?? 0 );
		$useful = sanitize_textarea_field( wp_unslash( $_POST['useful'] ?? '' ) );
		if ( $rating < 1 || $rating > 5 || '' === trim( $useful ) ) {
			wp_safe_redirect( add_query_arg( 'k1r', 'need', $back ) );
			exit;
		}
		$display = (string) wp_unslash( $_POST['display'] ?? 'first' );
		$display = in_array( $display, array( 'first', 'business', 'anon' ), true ) ? $display : 'first';
		$stage   = scrolly_k1r_stage( $uid );
		$m       = array(
			'user'      => $uid,
			'rating'    => $rating,
			'stage'     => $stage,
			'useful'    => mb_substr( $useful, 0, 3000 ),
			'changed'   => mb_substr( sanitize_textarea_field( wp_unslash( $_POST['changed'] ?? '' ) ), 0, 3000 ),
			'result'    => ( isset( $_POST['result'] ) && '' !== $_POST['result'] ) ? max( 0, round( (float) $_POST['result'], 2 ) ) : '',
			'display'   => $display,
			'business'  => sanitize_text_field( wp_unslash( $_POST['business'] ?? '' ) ),
			'ok_site'   => empty( $_POST['ok_site'] ) ? 0 : 1,
			'ok_social' => empty( $_POST['ok_social'] ) ? 0 : 1,
			'ok_edit'   => empty( $_POST['ok_edit'] ) ? 0 : 1,
		);
		$name = scrolly_k1r_public_name( $m );
		$id   = wp_insert_post( array(
			'post_type'    => SCROLLY_K1R_TYPE,
			'post_status'  => 'pending',
			'post_title'   => str_repeat( '★', $rating ) . ' ' . $name . ' (' . scrolly_k1r_stage_label( $stage ) . ')',
			'post_content' => $m['useful'] . ( $m['changed'] ? "\n\n" . $m['changed'] : '' ),
			'post_author'  => $uid,
		) );
		if ( ! $id || is_wp_error( $id ) ) {
			wp_safe_redirect( add_query_arg( 'k1r', 'need', $back ) );
			exit;
		}
		foreach ( $m as $k => $v ) {
			update_post_meta( $id, '_k1r_' . $k, $v );
		}
		$done   = get_user_meta( $uid, 'scrolly_k1r_done', true );
		$done   = is_array( $done ) ? $done : array();
		$done[] = array( 'id' => $id, 'stage' => $stage, 'at' => current_time( 'timestamp' ) );
		update_user_meta( $uid, 'scrolly_k1r_done', $done );
		$u = get_userdata( $uid );
		wp_mail( SCROLLY_K1R_TO, 'New review: ' . str_repeat( '★', $rating ) . ' from ' . $name,
			$name . ' <' . $u->user_email . '> · ' . scrolly_k1r_stage_label( $stage ) . "\n\nMost useful:\n" . $m['useful']
			. ( $m['changed'] ? "\n\nWhat changed:\n" . $m['changed'] : '' )
			. "\n\nOK to quote: " . ( $m['ok_site'] || $m['ok_social'] ? implode( ', ', array_filter( array( $m['ok_site'] ? 'website' : '', $m['ok_social'] ? 'social' : '' ) ) ) : 'no, private feedback only' )
			. "\n\nApprove it here: " . admin_url( 'post.php?post=' . $id . '&action=edit' ),
			array( 'Reply-To: ' . $u->user_email ) );
		wp_safe_redirect( add_query_arg( 'k1r', 'thanks', $back ) );
		exit;
	} );

	// ---- the "leave a review" card under My $1K Plan and Downloads (after the main snippet's own output)
	function scrolly_k1r_card() {
		$uid = get_current_user_id();
		if ( ! $uid || ! scrolly_k1r_ready() || ! scrolly_k1_access( $uid )['club'] ) {
			return;
		}
		echo scrolly_k1r_css() . '<div class="k1a k1v3 k1r-card"><p><strong>Been through the content?</strong> Tell us what you think. Good or bad, it helps.</p><a class="btn" href="' . esc_url( wc_get_account_endpoint_url( SCROLLY_K1R_EP ) ) . '">Leave a review</a></div>';
	}
	add_action( 'woocommerce_account_' . ( defined( 'SCROLLY_K1_EP_PLAN' ) ? SCROLLY_K1_EP_PLAN : 'my-1k-plan' ) . '_endpoint', 'scrolly_k1r_card', 20 );
	add_action( 'woocommerce_after_account_downloads', 'scrolly_k1r_card', 20 );

	function scrolly_k1r_css() {
		static $done = false;
		if ( $done ) {
			return '';
		}
		$done = true;
		// Same v3 tokens as the member area (website/scrolly-site/chrome/k1-account.css); nothing under 15px.
		return '<style>.k1r form{display:grid;gap:10px;max-width:640px}.k1r fieldset{border:0;margin:14px 0 0;padding:0;display:grid;gap:8px}'
			. '.k1r legend,.k1r label[for]{font-weight:700;font-size:var(--s3-fs-ui,1.125rem);margin:12px 0 2px}.k1r fieldset label{display:flex;gap:10px;align-items:center;font-size:var(--s3-fs-body,1.125rem)}'
			. '.k1r .k1r-stars span{color:#e8522b;letter-spacing:2px;min-width:5.5em}.k1r textarea,.k1r input[type=text],.k1r input[type=number]{width:100%;padding:12px 14px;border:1px solid var(--s3-line,#d9d3ca);border-radius:12px;background:#fff;font:inherit}'
			. '.k1r .k1r-sub{font-weight:400!important}.k1r .k1r-warn{background:#fff1ec;border-left:4px solid #e8522b;padding:10px 14px}.k1r button.btn{justify-self:start;margin-top:16px}'
			. '.k1r-card{margin-top:32px;padding:20px 24px;border:1px solid var(--s3-line,#d9d3ca);border-radius:16px;background:#fff;display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between}.k1r-card p{margin:0}</style>';
	}

	// ---- daily review requests
	function scrolly_k1r_optout_url( $uid ) {
		return add_query_arg( 'k1r_optout', $uid . '-' . substr( wp_hash( 'k1r-optout-' . $uid ), 0, 16 ), home_url( '/' ) );
	}
	add_action( 'template_redirect', function () {
		if ( empty( $_GET['k1r_optout'] ) ) {
			return;
		}
		$parts = explode( '-', sanitize_text_field( wp_unslash( $_GET['k1r_optout'] ) ) );
		$uid   = (int) ( $parts[0] ?? 0 );
		if ( $uid && hash_equals( substr( wp_hash( 'k1r-optout-' . $uid ), 0, 16 ), (string) ( $parts[1] ?? '' ) ) ) {
			update_user_meta( $uid, 'scrolly_k1r_optout', 1 );
			wp_die( 'Done. We won\'t send you any more review requests.', 'Unsubscribed', array( 'response' => 200 ) );
		}
	} );

	/** Which request (if any) this buyer is due today. Returns array( key, kind ) or null. */
	function scrolly_k1r_due( $uid, $first_paid ) {
		if ( get_user_meta( $uid, 'scrolly_k1r_optout', true ) ) {
			return null;
		}
		$sent = get_user_meta( $uid, 'scrolly_k1r_sent', true );
		$sent = is_array( $sent ) ? $sent : array();
		$done = get_user_meta( $uid, 'scrolly_k1r_done', true );
		$done = is_array( $done ) ? $done : array();
		$a    = scrolly_k1_access( $uid );
		if ( ! $a['club'] ) {
			return null;
		}
		$now = current_time( 'timestamp' );
		if ( $a['challenge'] ) {
			$w     = scrolly_k1_window( $uid, $a );
			$stage = scrolly_k1r_stage( $uid, $a );
			$order = (int) $a['chal_order'];
			if ( 'verified' === $stage && empty( $sent[ 'verified:' . $order ] ) ) {
				return array( 'verified:' . $order, 'verified' );
			}
			// After the window: ask once, within 30 days of it ending, unless they already reviewed after it ended.
			if ( 'challenge_done' === $stage && empty( $sent[ 'after:' . $order ] ) && $now - $w['end'] < 30 * DAY_IN_SECONDS ) {
				$after = array_filter( $done, function ( $d ) use ( $w ) { return (int) $d['at'] >= $w['end']; } );
				if ( ! $after ) {
					return array( 'after:' . $order, 'after' );
				}
			}
		}
		if ( empty( $sent['content'] ) && ! $done && $first_paid && $now - $first_paid >= SCROLLY_K1R_CONTENT_DAYS * DAY_IN_SECONDS && $now - $first_paid < 60 * DAY_IN_SECONDS ) {
			return array( 'content', 'content' );
		}
		return null;
	}

	function scrolly_k1r_email( $uid, $kind ) {
		$u     = get_userdata( $uid );
		$first = get_user_meta( $uid, 'first_name', true ) ?: $u->display_name;
		$link  = wc_get_account_endpoint_url( SCROLLY_K1R_EP );
		$w     = 'after' === $kind ? scrolly_k1_window( $uid, scrolly_k1_access( $uid ) ) : null;
		$copy  = array(
			'content'  => array( 'How is the $1K Club going so far?',
				"You've had the \$1K Club for a week now. Once you've been through the Playbook and your plan, we'd love to know what you think." ),
			'after'    => array( 'How did your 30 days go?',
				'Your $1K Challenge finished on ' . ( $w ? wp_date( 'F j', $w['end'] - DAY_IN_SECONDS ) : 'recently' ) . ". Whatever your number was, we'd love to hear how it went: what helped, what didn't, and what you'd change." ),
			'verified' => array( 'You did it. Would you share your story?',
				"Congratulations on your verified \$1,000! Your story could show someone else that it's possible. Would you take 2 minutes to tell it?" ),
		);
		list( $subject, $line ) = $copy[ $kind ];
		$body = "Hi $first,\n\n$line\n\nIt takes about 2 minutes: $link\n\nHonest is best. Good or bad, every review helps us make it better.\n\nThe Ambition Department\ntheambitiondepartment.com\n\n"
			. 'Rather not get these? ' . scrolly_k1r_optout_url( $uid );
		return wp_mail( $u->user_email, $subject, $body );
	}

	add_action( 'scrolly_k1r_daily', function () {
		if ( ! scrolly_k1r_ready() || ! function_exists( 'wc_get_orders' ) ) {
			return;
		}
		// Buyers from the last ~4 months (covers 60-day content asks and the 30-day window + 30 days after it).
		$orders = wc_get_orders( array( 'status' => array( 'wc-completed', 'wc-processing' ), 'date_created' => '>' . ( time() - 120 * DAY_IN_SECONDS ), 'limit' => -1, 'orderby' => 'date', 'order' => 'ASC' ) );
		$first  = array();
		foreach ( $orders as $o ) {
			$uid = (int) $o->get_customer_id();
			if ( ! $uid || isset( $first[ $uid ] ) ) {
				continue;
			}
			foreach ( $o->get_items() as $item ) {
				$pid = (int) $item->get_product_id();
				if ( SCROLLY_K1_PRODUCT === $pid || SCROLLY_K1_REBUY === $pid ) {
					$paid          = $o->get_date_paid() ? $o->get_date_paid() : $o->get_date_created();
					$first[ $uid ] = $paid ? $paid->getTimestamp() : 0;
					break;
				}
			}
		}
		foreach ( $first as $uid => $ts ) {
			$due = scrolly_k1r_due( $uid, $ts );
			if ( ! $due ) {
				continue;
			}
			if ( scrolly_k1r_email( $uid, $due[1] ) ) {
				$sent            = get_user_meta( $uid, 'scrolly_k1r_sent', true );
				$sent            = is_array( $sent ) ? $sent : array();
				$sent[ $due[0] ] = current_time( 'mysql' );
				if ( 'content' !== $due[1] ) {
					$sent['content'] = $sent['content'] ?? current_time( 'mysql' ); // a later ask replaces the 7-day one
				}
				update_user_meta( $uid, 'scrolly_k1r_sent', $sent );
			}
		}
	} );
}
