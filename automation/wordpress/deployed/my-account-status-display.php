<?php
/**
 * Live WPCode snippet #274 "Scrolly Order Tracker — My Account status
 * display" on scrollyseo.com — mirrored here verbatim (source of truth is
 * the live snippet; this file is documentation/version-history, not what
 * runs). Deployed via wp-admin > Code Snippets (WPCode, "Run Everywhere").
 *
 * Added: 2026-08-28.
 */

defined( 'ABSPATH' ) || exit;

// Scrolly Order Tracker -- My Account status display.
// Adds a small, calm status box to WooCommerce's native "View Order" page
// in My Account (myaccount/view-order.php), right after the existing order
// details table. Deliberately reuses WooCommerce's OWN native ownership
// gate rather than writing any custom authorization: this hook only ever
// fires from inside woocommerce_account_view_order(), which already ran
// current_user_can( 'view_order', $order_id ) -- WooCommerce's own
// customer-id-match-or-manage_woocommerce check -- and refuses to render
// the page at all (shows "Invalid order.") before this code would ever
// run. No _scrolly_* meta, order number, email, or slug is ever used to
// authorize access here; only WooCommerce's own order-ownership capability.
//
// Scoped to the My Account view-order endpoint specifically (not order
// emails or the guest thank-you page, which also fire the same action
// hook) via is_wc_endpoint_url( 'view-order' ).
//
// Degrades gracefully: an order with no _scrolly_customer_status meta (a
// different product, or a Scrolly order not yet synced) renders nothing.

if ( ! function_exists( 'scrolly_tracker_customer_state_labels' ) ) {
	function scrolly_tracker_customer_state_labels() {
		return array(
			'intake_required'      => 'Information needed',
			'information_received' => 'Information received',
			'analysis_in_progress' => 'Analysis in progress',
			'in_final_review'      => 'Final review',
			'action_required'      => 'Action needed',
			'ready'                => 'Report ready',
		);
	}
}

if ( ! function_exists( 'scrolly_tracker_render_my_account_status' ) ) {
	function scrolly_tracker_render_my_account_status( $order ) {
		if ( ! is_wc_endpoint_url( 'view-order' ) ) {
			return; // only the My Account "View Order" page, not emails/thank-you
		}
		if ( ! ( $order instanceof WC_Order ) ) {
			return;
		}

		$status = $order->get_meta( '_scrolly_customer_status' );
		if ( empty( $status ) ) {
			return; // no tracker metadata on this order -- render nothing
		}

		$labels = scrolly_tracker_customer_state_labels();
		if ( ! isset( $labels[ $status ] ) ) {
			return; // unrecognized value -- fail closed, never show something wrong
		}
		$label = $labels[ $status ];

		$message      = $order->get_meta( '_scrolly_customer_message' );
		$action_label = $order->get_meta( '_scrolly_action_label' );
		$action_url   = $order->get_meta( '_scrolly_action_url' );

		$stage_keys   = array( 'intake_required', 'information_received', 'analysis_in_progress', 'in_final_review', 'ready' );
		$stage_labels = array( 'Order received', 'Information received', 'Analysis', 'Final review', 'Ready' );
		$current_index = array_search( $status, $stage_keys, true );

		echo '<style>
			.scrolly-tracker{margin:24px 0;padding:20px;border:1px solid #ddd;border-radius:8px;background:#fafafa;max-width:100%;box-sizing:border-box;}
			.scrolly-tracker h2{margin:0 0 12px;font-size:1.1em;}
			.scrolly-tracker-status{font-size:1.15em;margin:0 0 8px;}
			.scrolly-tracker-message{margin:0 0 14px;color:#555;}
			.scrolly-tracker-action{display:inline-block;margin:0 0 16px;}
			.scrolly-tracker-stages{list-style:none;margin:16px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:8px 4px;}
			.scrolly-tracker-stages li{flex:1 1 auto;min-width:90px;text-align:center;padding:8px 6px;font-size:0.85em;border-radius:4px;background:#eee;color:#888;}
			.scrolly-tracker-stages li.done{background:#dff0d8;color:#3c763d;}
			.scrolly-tracker-stages li.current{background:#2271b1;color:#fff;font-weight:600;}
			@media (max-width:480px){.scrolly-tracker-stages{flex-direction:column;}.scrolly-tracker-stages li{text-align:left;}}
		</style>';

		echo '<section class="scrolly-tracker">';
		echo '<h2>Report status</h2>';
		echo '<p class="scrolly-tracker-status"><strong>' . esc_html( $label ) . '</strong></p>';
		if ( $message ) {
			echo '<p class="scrolly-tracker-message">' . esc_html( $message ) . '</p>';
		}
		if ( $action_label && $action_url ) {
			echo '<p><a class="scrolly-tracker-action button" href="' . esc_url( $action_url ) . '">' . esc_html( $action_label ) . '</a></p>';
		}
		if ( false !== $current_index ) {
			echo '<ol class="scrolly-tracker-stages">';
			foreach ( $stage_labels as $i => $slabel ) {
				$state_class = $i < $current_index ? 'done' : ( $i === $current_index ? 'current' : '' );
				echo '<li class="' . esc_attr( $state_class ) . '">' . esc_html( $slabel ) . '</li>';
			}
			echo '</ol>';
		}
		echo '</section>';
	}
}
add_action( 'woocommerce_order_details_after_order_table', 'scrolly_tracker_render_my_account_status' );
