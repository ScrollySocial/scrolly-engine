<?php
// Runs php/k1-reviews.php under plain PHP with the shared WP stubs (+ the generated My Account snippet it reads from).
// Usage: php reviews-run.php <form|save|save-bad|cron> [days-since-purchase] [chal: none|active|done|verified]
// Env as wp-stubs.php (K1_STATE, K1_VARIATION). Prints the HTML / redirects / mails so a script can check them.
require __DIR__ . '/wp-stubs.php';
$mode = $argv[1] ?? 'form'; $days = (int) ( $argv[2] ?? 8 ); $chal = $argv[3] ?? 'none';
$GLOBALS['posts'] = array(); $GLOBALS['postmeta'] = array();
function is_user_logged_in() { return true; }
function register_post_type( $t, $a ) {} function add_meta_box() {} function wp_next_scheduled( $h ) { return false; } function wp_schedule_event() {}
function wp_insert_post( $p ) { $id = 500 + count( $GLOBALS['posts'] ); $GLOBALS['posts'][ $id ] = $p; return $id; } function is_wp_error( $x ) { return false; }
function get_post_meta( $id, $k, $s ) { return $GLOBALS['postmeta'][ $id ][ $k ] ?? ''; } function update_post_meta( $id, $k, $v ) { $GLOBALS['postmeta'][ $id ][ $k ] = $v; }
function wp_hash( $s ) { return md5( 'salt' . $s ); }
if ( ! function_exists( 'is_account_page' ) ) { function is_account_page() { return false; } function is_wc_endpoint_url() { return true; } }
// Purchase date for the stub order = now - $days.
putenv( "K1_PAID_DAYS=$days" );
$GLOBALS['meta']['first_name'] = 'Grace';

$src = file_get_contents( dirname( __DIR__ ) . '/dist/my-account-1k-tabs.php' );
$tmp = sys_get_temp_dir() . '/k1-main-lint.php'; file_put_contents( $tmp, "<?php\n" . $src ); require $tmp;
$rv = sys_get_temp_dir() . '/k1-reviews-lint.php'; file_put_contents( $rv, "<?php\n" . file_get_contents( dirname( __DIR__ ) . '/php/k1-reviews.php' ) ); require $rv;

// Challenge state for this run.
if ( 'none' !== $chal ) {
	$start = 'active' === $chal ? time() - 5 * 86400 : time() - 35 * 86400;
	$GLOBALS['meta']['scrolly_k1_chal'] = array( 'order' => (int) ( getenv( 'K1_ORDER' ) ?: 1001 ), 'start' => $start,
		'achievement' => array( 'claim' => 'verified' === $chal ? array( 'x' => 1 ) : null, 'verified' => 'verified' === $chal ) );
}
do_hook( 'init' );

if ( 'form' === $mode ) {
	$_GET['k1r'] = $argv[4] ?? '';
	do_hook( 'woocommerce_account_leave-a-review_endpoint' );
	echo "\n---CARD---\n"; do_hook( 'woocommerce_after_account_downloads' );
} elseif ( 'save' === $mode || 'save-bad' === $mode ) {
	$_POST = 'save' === $mode
		? array( '_k1r' => 'n', 'rating' => '5', 'useful' => 'The weekly Reel ideas.', 'changed' => 'I post 4x a week now.', 'display' => 'business', 'business' => 'Golden Hour', 'ok_site' => '1', 'result' => '' )
		: array( '_k1r' => 'n', 'rating' => '9', 'useful' => '' );
	register_shutdown_function( function () { echo "\nPOSTS " . json_encode( $GLOBALS['posts'] ) . "\nMETA " . json_encode( $GLOBALS['postmeta'] ) . "\nMAILS " . json_encode( $GLOBALS['meta']['_mails'] ?? array() ) . "\nDONE " . json_encode( $GLOBALS['meta']['scrolly_k1r_done'] ?? null ) . "\n"; } );
	do_hook( 'admin_post_scrolly_k1r_save' );
} elseif ( 'cron' === $mode ) {
	do_hook( 'scrolly_k1r_daily' );
	echo 'MAILS ' . json_encode( array_map( function ( $m ) { return $m['subject']; }, $GLOBALS['meta']['_mails'] ?? array() ) ) . "\nSENT " . json_encode( $GLOBALS['meta']['scrolly_k1r_sent'] ?? null ) . "\n";
}
