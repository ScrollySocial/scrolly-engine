<?php
/**
 * NOTE (2026-08-28): what's actually LIVE on scrollyseo.com is deployed as
 * two WPCode snippets, not this file -- see automation/wordpress/deployed/
 * (status-sync-route.php + my-account-status-display.php) for their exact
 * current content. This file remains the fuller original design (including
 * the report-file upload/download routes), which is NOT yet deployed.
 *
 * Plugin Name: Scrolly Order Tracker
 * Description: Narrow REST endpoints for the Scrolly automation backend to
 *               (1) write customer-safe order status onto a WooCommerce
 *               order, and (2) privately store a per-order generated report
 *               file and grant that order's owning customer access to it.
 *               Also exposes the authenticated, ownership-checked download
 *               route the customer's own browser hits from My Account.
 *
 * NOT YET INSTALLED. This file lives in the repo for review. To deploy:
 * copy to wp-content/mu-plugins/scrolly-order-tracker-mu-plugin.php on
 * scrollyseo.com. Requires the dedicated service user + custom capability
 * described below to already exist (see "Setup" at the bottom of this file)
 * — do not install this plugin before that user exists, its REST calls
 * would simply 401/403.
 *
 * WHY A CUSTOM CAPABILITY INSTEAD OF A GENERIC WOOCOMMERCE WRITE KEY:
 * WooCommerce's own REST API key system has no fine-grained scoping —
 * "Write" grants access to every field on every order (totals, payment
 * status, billing, refunds, everything), which is far broader than this
 * integration needs. A dedicated WordPress user, holding ONLY a custom
 * capability this plugin invented and checks for, authenticated via a
 * WordPress Application Password (native auth, not a bespoke shared
 * secret), can do exactly the two things below and nothing else — even
 * with valid credentials, there is no code path in this file that can
 * touch an order's total, status, payment, billing, shipping, products,
 * or any meta key other than the five `_scrolly_*` keys named below.
 *
 * WHY FILES AREN'T SERVED THROUGH WOOCOMMERCE'S OWN DOWNLOAD URL SYSTEM:
 * WooCommerce's native "Downloads require login" setting is the correct,
 * native way to guarantee login+ownership on a download — but it is a
 * GLOBAL, site-wide setting that would also force login on the existing
 * guest-purchasable $27/$59 digital workbooks, which is explicitly out of
 * scope right now. Instead: a WC_Customer_Download permission record is
 * still created (the real, native WooCommerce permission data model, per
 * the approved design) — but the actual bytes are served by this plugin's
 * own /report-file/{order_id}/{file_type} route, which independently
 * re-checks the requesting user IS the order's owning customer (or an
 * admin) before ever reading the file. The underlying PDF is stored
 * outside wp-content/uploads (never in the public Media Library, never at
 * a guessable public URL) — knowing the order id, file type, or even the
 * exact storage path does not grant access; only an authenticated session
 * that owns the order does.
 */

defined( 'ABSPATH' ) || exit;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SCROLLY_TRACKER_CAPABILITY = 'scrolly_manage_order_tracker';
const SCROLLY_TRACKER_NAMESPACE  = 'scrolly-tracker/v1';

// Outside wp-content/uploads on purpose -- never web-served directly by
// anything other than this plugin's own authenticated route. Adjust the
// path to wherever is actually outside the public webroot on the live host;
// this default assumes a standard wp-content sibling directory.
function scrolly_tracker_private_storage_dir() {
	return trailingslashit( WP_CONTENT_DIR ) . '../scrolly-private-reports/';
}

const SCROLLY_ALLOWED_CUSTOMER_STATUSES = array(
	'order_received',
	'awaiting_intake',
	'analysis_in_progress',
	'in_final_review',
	'action_required',
	'ready',
	'delivered',
);
const SCROLLY_ALLOWED_FILE_TYPES = array( 'report', 'appendix' );
const SCROLLY_MAX_UPLOAD_BYTES   = 20 * 1024 * 1024; // 20 MB -- real reports run 1-3 MB; generous headroom, not unlimited.

// The exact, fixed set of order meta keys this plugin will ever write.
// Nothing else -- this list is the enforcement of "customer-safe fields
// only," not just documentation of intent.
const SCROLLY_STATUS_META_KEYS = array(
	'_scrolly_customer_status',
	'_scrolly_customer_message',
	'_scrolly_action_label',
	'_scrolly_action_url',
	'_scrolly_report_available',
);

// ---------------------------------------------------------------------------
// Auth: dedicated capability check, used as the permission_callback for the
// two write endpoints. Relies entirely on WordPress's own Application
// Password authentication (already resolved into the current user by the
// time permission_callback runs) plus a capability that ONLY the dedicated
// service user (or an admin, who can do anything anyway) actually holds.
// ---------------------------------------------------------------------------
function scrolly_tracker_permission_write() {
	return current_user_can( SCROLLY_TRACKER_CAPABILITY );
}

/** Customer-facing download auth: the requester must be logged in AND own the order (or be an admin). No token/slug/order-number bypass of any kind. */
function scrolly_tracker_permission_download( $request ) {
	if ( ! is_user_logged_in() ) {
		return false;
	}
	$order = wc_get_order( (int) $request['order_id'] );
	if ( ! $order ) {
		return new WP_Error( 'scrolly_no_order', 'Order not found.', array( 'status' => 404 ) );
	}
	if ( current_user_can( 'manage_woocommerce' ) ) {
		return true; // admin/operator exception, explicitly approved
	}
	return (int) $order->get_customer_id() === get_current_user_id() && $order->get_customer_id() > 0;
}

// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------
add_action( 'rest_api_init', function () {

	register_rest_route(
		SCROLLY_TRACKER_NAMESPACE,
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

	register_rest_route(
		SCROLLY_TRACKER_NAMESPACE,
		'/report-file',
		array(
			'methods'             => 'POST',
			'permission_callback' => 'scrolly_tracker_permission_write',
			'callback'            => 'scrolly_tracker_handle_report_upload',
			'args'                => array(
				'order_id'    => array( 'required' => true, 'type' => 'integer' ),
				'file_type'   => array( 'required' => true, 'type' => 'string' ),
				'file_base64' => array( 'required' => true, 'type' => 'string' ),
			),
		)
	);

	register_rest_route(
		SCROLLY_TRACKER_NAMESPACE,
		'/report-file/(?P<order_id>\d+)/(?P<file_type>report|appendix)',
		array(
			'methods'             => 'GET',
			'permission_callback' => 'scrolly_tracker_permission_download',
			'callback'            => 'scrolly_tracker_handle_report_download',
		)
	);
} );

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function scrolly_tracker_handle_order_status( WP_REST_Request $request ) {
	$order = wc_get_order( $request->get_param( 'order_id' ) );
	if ( ! $order ) {
		return new WP_Error( 'scrolly_no_order', 'Order not found.', array( 'status' => 404 ) );
	}

	$status = $request->get_param( 'customer_status' );
	if ( ! in_array( $status, SCROLLY_ALLOWED_CUSTOMER_STATUSES, true ) ) {
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
		// Only ever allow linking to Tally (intake) or back to this site's
		// own My Account -- never an arbitrary destination.
		$host = wp_parse_url( $action_url, PHP_URL_HOST );
		$allowed_hosts = array( 'tally.so', wp_parse_url( home_url(), PHP_URL_HOST ) );
		if ( ! in_array( $host, $allowed_hosts, true ) ) {
			return new WP_Error( 'scrolly_bad_action_url', 'action_url host is not on the allowed list.', array( 'status' => 400 ) );
		}
	} else {
		$action_url = null;
	}

	$report_available = (bool) $request->get_param( 'report_available' );

	// Exactly these five keys, nothing else -- no arbitrary meta write path exists.
	$order->update_meta_data( '_scrolly_customer_status', $status );
	$order->update_meta_data( '_scrolly_customer_message', $message );
	$order->update_meta_data( '_scrolly_action_label', $action_label );
	$order->update_meta_data( '_scrolly_action_url', $action_url );
	$order->update_meta_data( '_scrolly_report_available', $report_available );
	$order->save();

	return array( 'ok' => true, 'order_id' => $order->get_id(), 'customer_status' => $status );
}

function scrolly_tracker_handle_report_upload( WP_REST_Request $request ) {
	$order = wc_get_order( $request->get_param( 'order_id' ) );
	if ( ! $order ) {
		return new WP_Error( 'scrolly_no_order', 'Order not found.', array( 'status' => 404 ) );
	}
	$customer_id = $order->get_customer_id();
	if ( ! $customer_id ) {
		return new WP_Error( 'scrolly_no_customer', 'Order has no associated customer account -- cannot grant a download permission.', array( 'status' => 409 ) );
	}

	$file_type = $request->get_param( 'file_type' );
	if ( ! in_array( $file_type, SCROLLY_ALLOWED_FILE_TYPES, true ) ) {
		return new WP_Error( 'scrolly_bad_file_type', 'file_type must be "report" or "appendix".', array( 'status' => 400 ) );
	}

	$raw = base64_decode( $request->get_param( 'file_base64' ), true );
	if ( false === $raw ) {
		return new WP_Error( 'scrolly_bad_upload', 'file_base64 did not decode.', array( 'status' => 400 ) );
	}
	if ( strlen( $raw ) > SCROLLY_MAX_UPLOAD_BYTES ) {
		return new WP_Error( 'scrolly_too_large', 'File exceeds the size limit.', array( 'status' => 400 ) );
	}
	if ( 0 !== strncmp( $raw, '%PDF-', 5 ) ) {
		return new WP_Error( 'scrolly_not_pdf', 'File does not look like a PDF (missing %PDF- header).', array( 'status' => 400 ) );
	}

	// Deterministic, plugin-controlled path -- the caller supplies only
	// order_id + file_type (a 2-value enum), never a path or filename.
	$dir = scrolly_tracker_private_storage_dir();
	if ( ! file_exists( $dir ) ) {
		wp_mkdir_p( $dir );
	}
	$filename = $order->get_id() . '-' . $file_type . '.pdf';
	$path     = $dir . $filename;
	if ( false === file_put_contents( $path, $raw ) ) {
		return new WP_Error( 'scrolly_write_failed', 'Could not write the file to private storage.', array( 'status' => 500 ) );
	}

	// Real, native WooCommerce permission record -- ties this exact file to
	// this exact order/customer, matching the approved "use WC_Customer_Download" design.
	$download = new WC_Customer_Download();
	$download->set_download_id( wc_get_random_username() ); // WC expects a unique per-permission id string; content is never derived from this
	$download->set_product_id( 0 ); // not tied to a catalog product -- this is a generated, per-order file
	$download->set_user_id( $customer_id );
	$download->set_user_email( $order->get_billing_email() );
	$download->set_order_id( $order->get_id() );
	$download->set_order_key( $order->get_order_key() );
	$download->set_downloads_remaining( '' ); // unlimited re-downloads of their own report
	$download->set_access_granted( time() );
	$download->save();

	return array( 'ok' => true, 'order_id' => $order->get_id(), 'file_type' => $file_type, 'bytes' => strlen( $raw ) );
}

function scrolly_tracker_handle_report_download( WP_REST_Request $request ) {
	$order_id  = (int) $request['order_id'];
	$file_type = $request['file_type'];
	if ( ! in_array( $file_type, SCROLLY_ALLOWED_FILE_TYPES, true ) ) {
		return new WP_Error( 'scrolly_bad_file_type', 'Invalid file type.', array( 'status' => 400 ) );
	}

	// permission_callback already confirmed the requester owns this order
	// (or is an admin) -- this handler only has to confirm the file exists.
	$path = scrolly_tracker_private_storage_dir() . $order_id . '-' . $file_type . '.pdf';
	if ( ! file_exists( $path ) ) {
		return new WP_Error( 'scrolly_not_ready', 'This report is not available yet.', array( 'status' => 404 ) );
	}

	// Stream, don't redirect -- the raw path/URL is never revealed to the client.
	header( 'Content-Type: application/pdf' );
	header( 'Content-Disposition: inline; filename="' . $file_type . '.pdf"' );
	header( 'Content-Length: ' . filesize( $path ) );
	header( 'X-Content-Type-Options: nosniff' );
	readfile( $path );
	exit;
}

/*
 * ---------------------------------------------------------------------------
 * SETUP (not yet performed -- documented here for the approval step):
 *
 * 1. Create a custom role with exactly one meaningful capability:
 *      add_role( 'scrolly_service', 'Scrolly Service', array(
 *          'read' => true, // baseline WP requirement for any authenticated user
 *          SCROLLY_TRACKER_CAPABILITY => true,
 *      ) );
 *    (run once, e.g. via WP-CLI or a one-time activation hook -- NOT
 *    included as an auto-running add_role() call above, so installing this
 *    file doesn't silently create a role as a side effect)
 *
 * 2. Create a dedicated WordPress user (e.g. "scrolly-tracker-bot") with
 *    that role and NO other role.
 *
 * 3. Generate a WordPress Application Password for that user (wp-admin ->
 *    Users -> that user -> Application Passwords). Store as
 *    SCROLLY_TRACKER_WP_USER / SCROLLY_TRACKER_WP_APP_PASSWORD in
 *    automation/.env -- new, separate from WP_LIVE_APP_* and every other
 *    existing credential in this repo.
 *
 * 4. Install this file at wp-content/mu-plugins/scrolly-order-tracker-mu-plugin.php.
 *
 * 5. Confirm scrolly_tracker_private_storage_dir() actually resolves
 *    outside the public webroot on the real host (EasyWP) before relying
 *    on it -- path assumptions should be verified against the real
 *    filesystem layout, not assumed from a generic WP_CONTENT_DIR sibling.
 * ---------------------------------------------------------------------------
 */
