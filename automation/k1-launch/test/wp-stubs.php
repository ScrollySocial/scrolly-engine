<?php
// Minimal stand-ins for the WordPress/WooCommerce functions the My Account snippet calls, so it can run under
// plain PHP for testing. User meta and sent mail persist in a JSON state file between runs, like a database would.
// Env: K1_STATE (state file), K1_VARIATION (583 Club+Challenge | 582 Club only), K1_ORDER (Challenge order id), K1_280 (publish|draft).
$GLOBALS['state_file'] = getenv( 'K1_STATE' ) ?: sys_get_temp_dir() . '/k1-stub-state.json';
$GLOBALS['meta'] = file_exists( $GLOBALS['state_file'] ) ? json_decode( file_get_contents( $GLOBALS['state_file'] ), true ) : array();
$GLOBALS['hooks'] = array();
define( 'DAY_IN_SECONDS', 86400 ); define( 'HOUR_IN_SECONDS', 3600 ); define( 'MB_IN_BYTES', 1048576 ); define( 'EP_ROOT', 1 ); define( 'EP_PAGES', 2 );
function save_state() { file_put_contents( $GLOBALS['state_file'], json_encode( $GLOBALS['meta'] ) ); }
function add_action( $h, $cb ) { $GLOBALS['hooks'][ $h ][] = $cb; } function add_filter( $h, $cb ) { add_action( $h, $cb ); }
function do_hook( $h, ...$args ) { foreach ( $GLOBALS['hooks'][ $h ] ?? array() as $cb ) { $cb( ...$args ); } }
function get_current_user_id() { return 7; }
function get_user_meta( $u, $k, $single ) { return $GLOBALS['meta'][ $k ] ?? ''; }
function update_user_meta( $u, $k, $v ) { $GLOBALS['meta'][ $k ] = $v; save_state(); return true; }
function get_transient( $k ) { return $GLOBALS['meta'][ 't_' . $k ] ?? false; }
function set_transient( $k, $v, $t ) { $GLOBALS['meta'][ 't_' . $k ] = $v; save_state(); }
function delete_transient( $k ) { unset( $GLOBALS['meta'][ 't_' . $k ] ); save_state(); }
class StubItem { function __construct( public $p, public $v ) {} function get_product_id() { return $this->p; } function get_variation_id() { return $this->v; } }
class StubDate { function getTimestamp() { return time() - 40 * 86400; } }
class StubOrder {
	function __construct( public $id ) {}
	function get_items() { return array( new StubItem( 279, (int) ( getenv( 'K1_VARIATION' ) ?: 583 ) ) ); } function get_id() { return $this->id; }
	function get_date_paid() { return new StubDate(); } function get_date_created() { return new StubDate(); }
	function get_meta( $k ) { return $k === '_wc_other/scrolly/shirt-size' ? 'L' : ''; }
	function get_shipping_first_name() { return 'Grace'; } function get_shipping_last_name() { return 'Hopper'; } function get_shipping_address_1() { return '1 Main St'; }
	function get_shipping_address_2() { return ''; } function get_shipping_city() { return 'Austin'; } function get_shipping_state() { return 'TX'; }
	function get_shipping_postcode() { return '78701'; } function get_shipping_country() { return 'US'; }
}
function wc_get_orders( $q ) { return array( new StubOrder( (int) ( getenv( 'K1_ORDER' ) ?: 1001 ) ) ); }
function wc_get_order( $id ) { return $id ? new StubOrder( $id ) : false; }
function wc_get_account_endpoint_url( $e ) { return "https://example.test/my-account/$e/"; } function wc_get_checkout_url() { return 'https://example.test/checkout/'; }
function admin_url( $p ) { return "https://example.test/wp-admin/$p"; } function home_url( $p = '' ) { return "https://example.test$p"; }
function esc_url( $s ) { return htmlspecialchars( $s, ENT_QUOTES ); } function esc_attr( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES ); }
function esc_html( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES ); } function esc_textarea( $s ) { return esc_html( $s ); }
function sanitize_key( $s ) { return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $s ) ); }
function sanitize_text_field( $s ) { return trim( strip_tags( (string) $s ) ); } function sanitize_textarea_field( $s ) { return sanitize_text_field( $s ); }
function sanitize_file_name( $s ) { return preg_replace( '/[^A-Za-z0-9_\-]/', '-', $s ); }
function wp_unslash( $s ) { return $s; } function wp_json_encode( $v ) { return json_encode( $v ); }
function wp_nonce_field() { return '<input type="hidden" name="_k1" value="nonce">'; } function wp_verify_nonce() { return true; }
function selected( $a, $b, $echo = true ) { return (string) $a === (string) $b ? ' selected' : ''; }
function checked( $a, $b, $echo = true ) { return $a === $b ? ' checked' : ''; }
function current_time( $f ) { return $f === 'timestamp' ? time() : ( $f === 'mysql' ? date( 'Y-m-d H:i:s' ) : date( $f ) ); } function wp_date( $f, $t ) { return date( $f, $t ); }
function get_option( $k ) { return '1'; } function update_option() {} function add_rewrite_endpoint() {} function flush_rewrite_rules() {}
function get_post( $id ) { return $id ? (object) array( 'post_content' => '<p>Page ' . $id . ' content</p>' ) : null; }
function get_post_status( $id ) { return getenv( 'K1_280' ) ?: 'draft'; } function get_permalink( $id ) { return "https://example.test/?p=$id"; }
function apply_filters( $h, $v ) { return $v; }
function wp_safe_redirect( $u ) { echo "REDIRECT $u\n"; } function add_query_arg( $k, $v, $u ) { return "$u?$k=$v"; }
function wp_generate_password( $n = 8 ) { return substr( bin2hex( random_bytes( 8 ) ), 0, $n ); } function wp_die( $m ) { echo "DIE $m\n"; exit; }
function get_userdata( $id ) { return (object) array( 'ID' => $id, 'display_name' => 'Grace Hopper', 'user_email' => 'grace@example.test' ); }
function wp_get_current_user() { return (object) array( 'user_login' => 'mercedes' ); } function current_user_can( $c ) { return true; }
function get_temp_dir() { return sys_get_temp_dir(); } function trailingslashit( $s ) { return rtrim( $s, '/\\' ) . '/'; } function wp_mkdir_p( $d ) { return is_dir( $d ) || mkdir( $d, 0777, true ); }
// is_uploaded_file / move_uploaded_file are PHP built-ins (the real security checks). The test copy of the snippet is
// rewritten to call these k1test_ versions instead; the production snippet keeps the built-ins.
function k1test_is_uploaded_file( $f ) { return file_exists( $f ); } function k1test_move_uploaded_file( $a, $b ) { return copy( $a, $b ); } function wp_delete_file( $f ) { @unlink( $f ); }
function wp_check_filetype_and_ext( $file, $name, $mimes ) { $ext = strtolower( pathinfo( $name, PATHINFO_EXTENSION ) ); return array( 'ext' => isset( $mimes[ $ext ] ) ? $ext : false ); }
function wp_mail( $to, $subject, $body, $headers = array(), $attachments = array() ) {
	// Attachment names are the array keys (WordPress 6.2+); record them plus the real source paths to check nothing was copied.
	$GLOBALS['meta']['_mails'][] = array( 'to' => $to, 'subject' => $subject, 'attachments' => array_keys( (array) $attachments ), 'sources' => array_values( (array) $attachments ) );
	save_state();
	return getenv( 'K1_MAIL_FAIL' ) ? false : true;
}
