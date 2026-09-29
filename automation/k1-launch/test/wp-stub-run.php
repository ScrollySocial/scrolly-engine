<?php
// Runs the generated My Account snippet outside WordPress with minimal stand-ins for the WP/Woo
// functions it calls. Catches PHP errors and checks the Start Here -> save -> Plan flow.
// Usage: php wp-stub-run.php <snippet.php> <mode: start|save|plan> [statefile]
// State (user meta) persists in a JSON file between runs, like the database would.
$snippet = $argv[1]; $mode = $argv[2]; $state = $argv[3] ?? sys_get_temp_dir() . '/k1-stub-state.json';
$GLOBALS['meta'] = file_exists( $state ) ? json_decode( file_get_contents( $state ), true ) : array();
$GLOBALS['hooks'] = array();
define( 'DAY_IN_SECONDS', 86400 ); define( 'HOUR_IN_SECONDS', 3600 ); define( 'EP_ROOT', 1 ); define( 'EP_PAGES', 2 );
function save_state() { global $state; file_put_contents( $GLOBALS['state_file'], json_encode( $GLOBALS['meta'] ) ); }
$GLOBALS['state_file'] = $state;
function add_action( $h, $cb ) { $GLOBALS['hooks'][ $h ][] = $cb; } function add_filter( $h, $cb ) { add_action( $h, $cb ); }
function do_hook( $h, ...$args ) { foreach ( $GLOBALS['hooks'][ $h ] ?? array() as $cb ) { $cb( ...$args ); } }
function get_current_user_id() { return 7; }
function get_user_meta( $u, $k, $single ) { return $GLOBALS['meta'][ $k ] ?? ''; }
function update_user_meta( $u, $k, $v ) { $GLOBALS['meta'][ $k ] = $v; save_state(); return true; }
function get_transient( $k ) { return $GLOBALS['meta'][ 't_' . $k ] ?? false; }
function set_transient( $k, $v, $t ) { $GLOBALS['meta'][ 't_' . $k ] = $v; save_state(); }
function delete_transient( $k ) { unset( $GLOBALS['meta'][ 't_' . $k ] ); save_state(); }
class StubItem { function __construct( public $p, public $v ) {} function get_product_id() { return $this->p; } function get_variation_id() { return $this->v; } }
class StubDate { function getTimestamp() { return time() - 3 * 86400; } }
function get_post_status( $id ) { return 'draft'; } function get_permalink( $id ) { return "https://example.test/?p=$id"; }
class StubOrder { function get_items() { return array( new StubItem( 279, (int) ( getenv( 'K1_VARIATION' ) ?: 583 ) ) ); } function get_id() { return 1001; } function get_date_paid() { return new StubDate(); } function get_date_created() { return new StubDate(); } function get_meta( $k ) { return ''; } }
function wc_get_orders( $q ) { return array( new StubOrder() ); }
function wc_get_order( $id ) { return $id ? new StubOrder() : false; }
function wc_get_account_endpoint_url( $e ) { return "https://example.test/my-account/$e/"; }
function admin_url( $p ) { return "https://example.test/wp-admin/$p"; } function home_url( $p = '' ) { return "https://example.test$p"; }
function esc_url( $s ) { return htmlspecialchars( $s, ENT_QUOTES ); } function esc_attr( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES ); }
function esc_html( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES ); } function esc_textarea( $s ) { return esc_html( $s ); }
function sanitize_key( $s ) { return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $s ) ); }
function sanitize_text_field( $s ) { return trim( strip_tags( (string) $s ) ); } function sanitize_textarea_field( $s ) { return sanitize_text_field( $s ); }
function wp_unslash( $s ) { return $s; } function wp_json_encode( $v ) { return json_encode( $v ); }
function wp_nonce_field() { return '<input type="hidden" name="_k1" value="nonce">'; } function wp_verify_nonce() { return true; }
function selected( $a, $b, $echo = true ) { return (string) $a === (string) $b ? ' selected' : ''; }
function checked( $a, $b, $echo = true ) { return $a === $b ? ' checked' : ''; }
function current_time( $f ) { return $f === 'timestamp' ? time() : date( $f ); } function wp_date( $f, $t ) { return date( $f, $t ); }
function get_option( $k ) { return '1'; } function update_option() {} function add_rewrite_endpoint() {} function flush_rewrite_rules() {}
function get_post( $id ) { return (object) array( 'post_content' => '<p>Week 1 reels placeholder</p>' ); }
function apply_filters( $h, $v ) { return $v; }
function wp_safe_redirect( $u ) { echo "REDIRECT $u\n"; } function add_query_arg( $k, $v, $u ) { return "$u?$k=$v"; }
function wp_generate_password() { return 'abcd1234'; } function wp_die( $m ) { echo "DIE $m\n"; exit; }

require $snippet;

if ( $mode === 'save' ) {
	$_POST = array( '_k1' => 'nonce', 'do' => 'profile', 'offer' => 'Family & portrait sessions', 'price' => '350', 'route' => 'services', 'stage' => 'C',
		'audience' => 'Local families', 'where' => 'booking', 'channel' => 'instagram', 'found' => array( 'instagram', 'referral', 'bogus' ), 'business' => 'Golden Hour Studio',
		'revenue' => '700', 'closePct' => '', 'reviews' => '12', 'emailList' => 'no' );
	do_hook( 'admin_post_scrolly_k1_save' );
} elseif ( $mode === 'review' ) {
	// One $350 session was already logged this week; the check-in reports $700, so only $350 should be added to the log.
	$GLOBALS['meta']['scrolly_k1_log'] = array( array( 'id' => 'x1', 'date' => date( 'Y-m-d' ), 'rev' => 350, 'sales' => 1, 'posts' => 0, 'note' => 'logged earlier' ) );
	$_POST = array( '_k1' => 'nonce', 'do' => 'review', 'period_end' => date( 'Y-m-d' ), 'actions' => array( 'published_content', 'hacked' ),
		'created' => '4', 'distributed' => '10', 'rev' => '700', 'sales' => '2', 'cap' => 'no', 'attr' => 'partially_known', 'note' => 'Reels worked',
		'm' => array( '1200', '', '9' ), 'ml' => array( 'Instagram reach', 'Inquiries/leads', 'Sales conversations' ) );
	do_hook( 'admin_post_scrolly_k1_save' );
} elseif ( $mode === 'save-bad' ) {
	$_POST = array( '_k1' => 'nonce', 'do' => 'profile', 'offer' => 'Something', 'price' => '0', 'route' => 'services', 'where' => 'phone' );
	do_hook( 'admin_post_scrolly_k1_save' );
} else {
	$_GET = array( 'k1' => $argv[4] ?? '' );
	do_hook( $mode === 'checkin' ? 'woocommerce_account_weekly-check-in_endpoint' : 'woocommerce_account_my-1k-plan_endpoint' );
}
