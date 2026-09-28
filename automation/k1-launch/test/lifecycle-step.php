<?php
// One lifecycle step per run (handlers end with exit, like real requests). Usage:
//   php lifecycle-step.php <snippet.php> <step> [args]
// Steps: setup <day> <revenue>   start a Challenge on <day> with <revenue> logged inside the window
//        claim | claim-nofile | refund <amount> | verify | reject <reason> | accept | decline | merch-ordered
//        newattempt <orderId> | start | render | admin
require __DIR__ . '/wp-stubs.php';
$snippet = $argv[1]; $step = $argv[2];
// "…@2002" = run this step as if the customer's latest Challenge order is #2002 (a newly bought attempt).
if ( str_contains( $step, '@' ) ) { [ $step, $order ] = explode( '@', $step ); putenv( 'K1_ORDER=' . $order ); }
$rest = implode( ' ', array_slice( $argv, 3 ) );
if ( $step === 'setup' ) {
	$day = (int) $argv[3]; $rev = (float) $argv[4];
	$start = strtotime( date( 'Y-m-d', time() - ( $day - 1 ) * 86400 ) . ' 00:00:00' );
	$GLOBALS['meta'] = array(
		'scrolly_k1_profile' => array( 'business' => 'Golden Hour Studio', 'route' => 'services', 'stage' => 'C', 'offer' => 'Portrait sessions', 'price' => 350, 'audience' => 'Families', 'where' => 'booking', 'channel' => 'instagram', 'found' => array( 'instagram' ), 'revenue' => '', 'closePct' => '', 'reviews' => '', 'emailList' => '' ),
		'scrolly_k1_chal'    => array( 'order' => (int) ( getenv( 'K1_ORDER' ) ?: 1001 ), 'start' => $start, 'achievement' => array( 'claim' => null, 'verified' => false, 'rewardChoice' => 'pending', 'merchUnlocked' => false, 'reviews' => array() ) ),
		// Dated today, or the last window day if the window is over (so day-30 sales land on day 30).
		'scrolly_k1_log'     => array( array( 'id' => 'a1', 'date' => date( 'Y-m-d', min( time(), $start + 29 * 86400 ) ), 'rev' => $rev, 'sales' => 3, 'posts' => 0, 'note' => 'sales' ) ),
	);
	save_state(); echo "setup day $day revenue $rev\n"; exit;
}
require $snippet;
$post = function ( $arr ) { $_POST = array_merge( array( '_k1' => 'nonce' ), $arr ); do_hook( 'admin_post_scrolly_k1_save' ); };
switch ( $step ) {
	case 'claim':
	case 'claim-nofile':
		$tmp = tempnam( sys_get_temp_dir(), 'k1up' ); file_put_contents( $tmp, 'fake png' );
		$_FILES = $step === 'claim' ? array( 'proof' => array( 'name' => array( 'stripe payout.png', 'notes.exe' ), 'tmp_name' => array( $tmp, $tmp ), 'error' => array( 0, 0 ), 'size' => array( 1000, 1000 ) ) ) : array();
		$post( array( 'do' => 'claim', 'claimed' => '1050', 'confirm' => '1', 'note' => 'Stripe + invoices' ) ); break;
	case 'refund':  $post( array( 'do' => 'log', 'date' => date( 'Y-m-d' ), 'rev' => $argv[3], 'refund' => '1', 'note' => 'client refund' ) ); break;
	case 'verify':  $_POST = array( '_k1admin' => 'n', 'k1_decision' => 'verified' ); scrolly_k1_admin_save( 7 ); echo "verified\n"; break;
	case 'reject':  $_POST = array( '_k1admin' => 'n', 'k1_decision' => 'not_verified', 'k1_reason' => $rest ); scrolly_k1_admin_save( 7 ); echo "rejected\n"; break;
	case 'merch-ordered': $_POST = array( '_k1admin' => 'n', 'k1_merch_ordered' => '1' ); scrolly_k1_admin_save( 7 ); echo "merch ordered\n"; break;
	case 'accept':  $post( array( 'do' => 'reward', 'choice' => 'accepted', 'size' => 'L', 'ship_name' => 'Grace Hopper', 'ship_address1' => '1 Main St', 'ship_city' => 'Austin', 'ship_state' => 'TX', 'ship_postcode' => '78701', 'ship_country' => 'US' ) ); break;
	case 'decline': $post( array( 'do' => 'reward', 'choice' => 'declined' ) ); break;
	case 'start':   $post( array( 'do' => 'start' ) ); break;
	case 'render':
		ob_start(); $_GET = array( 'k1' => $argv[3] ?? '' ); do_hook( 'woocommerce_account_my-1k-plan_endpoint' ); $html = ob_get_clean();
		preg_match( '/<p class="chip">(.*?)<\/p>/', $html, $chip ); preg_match( '/<div class="sec black" id="k1-challenge">(.*?)<\/div><div id="k1-week"/s', $html, $card );
		$text = trim( preg_replace( '/\s+/', ' ', html_entity_decode( strip_tags( str_replace( array( '<li', '<h2', '<h3', '<p', '<label' ), array( ' |<li', ' |<h2', ' |<h3', ' |<p', ' |<label' ), $card[1] ?? '' ) ) ) ) );
		if ( preg_match( '/<div class="(?:warn|ok)" role="(?:alert|status)">(.*?)<\/div>/', $html, $banner ) ) { echo 'BANNER: ' . html_entity_decode( $banner[1] ) . "\n"; }
		echo 'STATUS CHIP: ' . ( $chip[1] ?? '(none)' ) . "\nCARD: " . substr( $text, 0, 900 ) . "\n";
		echo 'has proof upload form: ' . ( str_contains( $html, 'name="proof[]"' ) ? 'yes' : 'no' ) . ' | has merch form: ' . ( str_contains( $html, 'name="ship_address1"' ) ? 'yes' : 'no' ) . ' | retry button: ' . ( preg_match( '/add-to-cart=280/', $html ) ? 'yes' : 'no' ) . ' | warnings: ' . preg_match_all( '/(Warning|Notice|Fatal error|Deprecated):/', $html ) . "\n";
		break;
	case 'admin':
		ob_start(); scrolly_k1_admin_section( (object) array( 'ID' => 7 ) ); $html = ob_get_clean();
		echo 'ADMIN: ' . substr( trim( preg_replace( '/\s+/', ' ', html_entity_decode( strip_tags( str_replace( array( '<tr', '<option' ), array( ' |<tr', ' /<option' ), $html ) ) ) ) ), 0, 700 ) . "\n"; break;
}
