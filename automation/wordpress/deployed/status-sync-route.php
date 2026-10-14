<?php
/**
 * Live WPCode snippet #273 "Scrolly Order Tracker — status sync route" on
 * scrollyseo.com — mirrored here verbatim (source of truth is the live
 * snippet; this file is documentation/version-history, not what runs).
 * Deployed via wp-admin > Code Snippets (WPCode, "Run Everywhere"), not a
 * filesystem mu-plugin — see ../scrolly-order-tracker-mu-plugin.php for why.
 *
 * Last synced with live content: 2026-08-28 (null-clearing fix + renamed
 * customer_status enum: intake_required / information_received /
 * analysis_in_progress / in_final_review / action_required / ready).
 */

defined( 'ABSPATH' ) || exit;

// Scrolly Order Tracker -- Phase 2 (status sync route only).
// Registers a dedicated capability + one narrow REST route that lets the
// automation backend write customer-safe status onto a WooCommerce order.
// Deployed via WPCode (Run Everywhere) rather than a filesystem mu-plugin.
// See automation/wordpress/scrolly-order-tracker-mu-plugin.php in the
// Scrolly Organic Engine repo for full design notes and the report-file
// upload/download routes, deliberately NOT included here yet pending
// separate approval.
//
// 2026-08-28 update: (1) customer_status enum renamed to match the revised
// mapping (intake_required / information_received / analysis_in_progress /
// in_final_review / action_required / ready) -- see
// automation/lib/customer-status-contract.mjs. (2) null-clearing fix:
// action_label/action_url are now explicitly written as '' when the caller
// sends null, since WC_Order::update_meta_data() silently drops a null
// value rather than persisting/clearing it -- confirmed empirically after
// the first live write left both keys entirely absent from the order.

if ( ! function_exists( 'scrolly_tracker_ensure_role' ) ) {
	function scrolly_tracker_ensure_role() {
		if ( ! get_role( 'scrolly_tracker' ) ) {
			add_role( 'scrolly_tracker', 'Scrolly Tracker', array(
				'read' => true,
				'scrolly_manage_order_tracker' => true,
			) );
		}
	}
}
add_action( 'init', 'scrolly_tracker_ensure_role' );

if ( ! function_exists( 'scrolly_tracker_permission_write' ) ) {
	function scrolly_tracker_permission_write() {
		return current_user_can( 'scrolly_manage_order_tracker' );
	}
}

if ( ! function_exists( 'scrolly_tracker_register_routes' ) ) {
	function scrolly_tracker_register_routes() {
		register_rest_route(
			'scrolly-tracker/v1',
			'/order-status',
			array(
				'methods'             => 'POST',
				'permission_callback' => 'scrolly_tracker_permission_write',
				'callback'            => 'scrolly_tracker_handle_order_status',
				'args'                => array(
					'order_id'         => array( 'required' => true, 'type' => 'integer' ),
					'customer_status'  => array( 'required' => true, 'type' => 'string' ),
					'customer_message' => array( 'required' => true, 'type' => 'string' ),
					'action_label'     => array( 'required' => false, 'type' => array( 'string', 'null' ) ),
					'action_url'       => array( 'required' => false, 'type' => array( 'string', 'null' ) ),
					'report_available' => array( 'required' => true, 'type' => 'boolean' ),
				),
			)
		);
	}
}
add_action( 'rest_api_init', 'scrolly_tracker_register_routes' );

if ( ! function_exists( 'scrolly_tracker_handle_order_status' ) ) {
	function scrolly_tracker_handle_order_status( WP_REST_Request $request ) {
		$order = wc_get_order( $request->get_param( 'order_id' ) );
		if ( ! $order ) {
			return new WP_Error( 'scrolly_no_order', 'Order not found.', array( 'status' => 404 ) );
		}

		$allowed_statuses = array(
			'intake_required', 'information_received', 'analysis_in_progress',
			'in_final_review', 'action_required', 'ready',
		);
		$status = $request->get_param( 'customer_status' );
		if ( ! in_array( $status, $allowed_statuses, true ) ) {
			return new WP_Error( 'scrolly_bad_status', 'customer_status is not one of the approved values.', array( 'status' => 400 ) );
		}

		$message = sanitize_text_field( $request->get_param( 'customer_message' ) );
		if ( strlen( $message ) > 300 ) {
			return new WP_Error( 'scrolly_bad_message', 'customer_message too long.', array( 'status' => 400 ) );
		}

		$action_label = $request->get_param( 'action_label' );
		$action_label = $action_label ? sanitize_text_field( $action_label ) : null;
		if ( $action_label && strlen( $action_label ) > 60 ) {
			return new WP_Error( 'scrolly_bad_action_label', 'action_label too long.', array( 'status' => 400 ) );
		}

		$action_url = $request->get_param( 'action_url' );
		if ( $action_url ) {
			$action_url = esc_url_raw( $action_url );
			$host = wp_parse_url( $action_url, PHP_URL_HOST );
			$allowed_hosts = array( 'tally.so', wp_parse_url( home_url(), PHP_URL_HOST ) );
			if ( ! in_array( $host, $allowed_hosts, true ) ) {
				return new WP_Error( 'scrolly_bad_action_url', 'action_url host is not on the allowed list.', array( 'status' => 400 ) );
			}
		} else {
			$action_url = null;
		}

		$report_available = (bool) $request->get_param( 'report_available' );

		// Explicit '' rather than null -- WC_Order::update_meta_data() does
		// not reliably persist/clear a null value, so a null here must
		// still deterministically clear any previously-set label/url.
		$order->update_meta_data( '_scrolly_customer_status', $status );
		$order->update_meta_data( '_scrolly_customer_message', $message );
		$order->update_meta_data( '_scrolly_action_label', $action_label === null ? '' : $action_label );
		$order->update_meta_data( '_scrolly_action_url', $action_url === null ? '' : $action_url );
		$order->update_meta_data( '_scrolly_report_available', $report_available );
		$order->save();

		return array( 'ok' => true, 'order_id' => $order->get_id(), 'customer_status' => $status );
	}
}
