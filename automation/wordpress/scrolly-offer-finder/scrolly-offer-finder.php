<?php
/**
 * Plugin Name: Scrolly Offer Finder
 * Description: Offer matching, emailed starter plans, response analysis, and optional MailerLite opt-in.
 * Version: 0.5.1
 * Requires at least: 6.4
 * Requires PHP: 8.0
 */
if (!defined('ABSPATH')) exit;
require_once __DIR__.'/mailerlite-router.php';
require_once __DIR__.'/locator-model.php';
require_once __DIR__.'/locator-resource.php';
require_once __DIR__.'/locator-access.php';
final class Scrolly_Offer_Finder {
 const VERSION='0.5.0';
 static function table(){global $wpdb; return $wpdb->prefix.'scrolly_offer_responses';}
 static function catalog(){static $data; if (!$data) $data=json_decode(file_get_contents(__DIR__.'/offers.json'),true); return $data;}
 static function activate(){
  global $wpdb; require_once ABSPATH.'wp-admin/includes/upgrade.php'; $t=self::table();$collate=$wpdb->get_charset_collate();
  dbDelta("CREATE TABLE $t (id bigint unsigned NOT NULL AUTO_INCREMENT, created_at datetime NOT NULL, response_id varchar(36) NOT NULL, token_hash varchar(64) NOT NULL, profile longtext NOT NULL, offer_ids text NOT NULL, chosen_offer varchar(64) NOT NULL DEFAULT '', email varchar(254) NOT NULL DEFAULT '', consent tinyint NOT NULL DEFAULT 0, confirmed_at datetime NULL, mail_status varchar(32) NOT NULL DEFAULT '', sync_status varchar(32) NOT NULL DEFAULT '', version varchar(16) NOT NULL, PRIMARY KEY (id), UNIQUE KEY response_id (response_id), UNIQUE KEY token_hash (token_hash), KEY created_at (created_at)) $collate;");
  wp_clear_scheduled_hook('scrolly_offer_cleanup');
 }
 static function deactivate(){wp_clear_scheduled_hook('scrolly_offer_cleanup');}
 static function boot(){
  add_shortcode('scrolly_offer_finder',[__CLASS__,'shortcode']);
  add_shortcode('scrolly_next_move_quiz',function(){return self::shortcode(['tool'=>'quiz']);});
  add_action('template_redirect',[__CLASS__,'view']);
  add_action('rest_api_init',function(){register_rest_route('scrolly/v1','/offer/bootstrap',['methods'=>'GET','callback'=>[__CLASS__,'bootstrap'],'permission_callback'=>[__CLASS__,'origin_permission']]);foreach(['response','lead'] as $route)register_rest_route('scrolly/v1','/offer/'.$route,['methods'=>'POST','callback'=>[__CLASS__,$route],'permission_callback'=>[__CLASS__,'permission']]);});
  add_action('admin_init',function(){register_setting('scrolly_tools','scrolly_tool_links',['sanitize_callback'=>function($v){$out=[];foreach(['finder','quiz','club1','club10'] as $k)$out[$k]=esc_url_raw($v[$k]??'');return $out;}]);});
  add_action('admin_menu',function(){add_options_page('Scrolly Tools','Scrolly Tools','manage_options','scrolly-tools',[__CLASS__,'settings']);add_management_page('Scrolly Offer Responses','Scrolly Offers','manage_options','scrolly-offers',[__CLASS__,'admin']);});
  add_action('admin_post_scrolly_offer_csv',[__CLASS__,'csv']);
  // Clear the deletion schedule from older versions during normal plugin loading.
  if(wp_next_scheduled('scrolly_offer_cleanup'))wp_clear_scheduled_hook('scrolly_offer_cleanup');
 }
 static function origin_permission($r){
  $origin=$r->get_header('Origin');
  if($origin){$expected=wp_parse_url(home_url());$actual=wp_parse_url($origin);if(($actual['scheme']??'')!==($expected['scheme']??'')||($actual['host']??'')!==($expected['host']??'')||($actual['port']??null)!==($expected['port']??null))return new WP_Error('origin','Invalid request origin.',['status'=>403]);}
  if($r->get_header('Sec-Fetch-Site')==='cross-site')return new WP_Error('origin','Invalid request origin.',['status'=>403]);
  return true;
 }
 static function public_token(){ $stamp=(string)time();$random=bin2hex(random_bytes(16));$payload=$stamp.'.'.$random;return $payload.'.'.hash_hmac('sha256','scrolly-public|'.$payload,wp_salt('nonce')); }
 static function token_valid($token){
  if(!is_string($token)||!preg_match('/^(\d{10})\.([a-f0-9]{32})\.([a-f0-9]{64})$/',$token,$m))return false;
  $age=time()-(int)$m[1];if($age<0||$age>DAY_IN_SECONDS)return false;
  return hash_equals(hash_hmac('sha256','scrolly-public|'.$m[1].'.'.$m[2],wp_salt('nonce')),$m[3]);
 }
 static function bootstrap($r){
  if(!self::rate('bootstrap',120))return new WP_Error('rate','Please wait before trying again.',['status'=>429]);
  $response=rest_ensure_response(['nonce'=>self::public_token()]);$response->header('Cache-Control','no-store, private, max-age=0');return $response;
 }
 static function permission($r){
  $origin=self::origin_permission($r);if(is_wp_error($origin))return $origin;
  if(!self::token_valid($r->get_header('X-Scrolly-Nonce')))return new WP_Error('expired','Your form session expired. Please try again.',['status'=>403]);
  return true;
 }
 static function rate($kind,$max){$key='sq_rate_'.hash_hmac('sha256',$kind.'|'.($_SERVER['REMOTE_ADDR']??''),wp_salt('nonce'));$n=(int)get_transient($key);if($n >= $max)return false;set_transient($key,$n+1,HOUR_IN_SECONDS);return true;}
 static function profile($p){
  if(!is_array($p))return false;
  if(($p['tool']??'')==='quiz')return self::quiz_profile($p);
  $skills=[];$knowledge=[];foreach(self::catalog() as $o){$skills=array_merge($skills,$o['skills']);$knowledge=array_merge($knowledge,$o['knowledge']);}
  $out=[];foreach(['skills'=>$skills,'knowledge'=>$knowledge] as $k=>$allowed){if(!isset($p[$k])||!is_array($p[$k])||count($p[$k])>30)return false;$out[$k]=array_values(array_unique(array_intersect($allowed,array_map('sanitize_key',$p[$k]))));}
  if(!$out['skills'])return false;
  if(!in_array($p['format']??'', ['any','service','digital','physical'],true))return false;
  if(!in_array((int)($p['budget']??-1),[0,25,50,100],true)||!in_array((int)($p['hours']??-1),[3,5,10],true))return false;
  $floor=(float)($p['floor']??0);if($floor<1||$floor>1000)return false;
  $out+=['format'=>$p['format'],'budget'=>(int)$p['budget'],'hours'=>(int)$p['hours'],'floor'=>$floor,'local'=>!empty($p['local'])];return $out;
 }
 static function rank($a){if(($a['tool']??'')==='quiz')return [self::quiz_result($a)];$matches=[];foreach(self::catalog() as $o){if($a['format']!=='any'&&$o['format']!==$a['format'])continue;if(!$a['local']&&$o['local'])continue;if($o['budget']>$a['budget'])continue;$skill=count(array_intersect($o['skills'],$a['skills']));if(!$skill)continue;$o['score']=$skill*4+count(array_intersect($o['knowledge'],$a['knowledge']))*5+($o['hours']<=$a['hours']?2:0);$matches[]=$o;}usort($matches,function($a,$b){return $b['score']<=>$a['score'] ?: strcmp($a['id'],$b['id']);});return array_slice($matches,0,3);}
 static function response($r){
  if(!self::rate('response',30))return new WP_Error('rate','Please wait before submitting another assessment.',['status'=>429]);
  $a=self::profile($r->get_param('profile'));if(!$a)return new WP_Error('profile','Please check your selections.',['status'=>400]);
  global $wpdb;$id=wp_generate_uuid4();$token=bin2hex(random_bytes(32));$ids=array_column(self::rank($a),'id');
  $ok=$wpdb->insert(self::table(),['created_at'=>current_time('mysql',true),'response_id'=>$id,'token_hash'=>hash('sha256',$token),'profile'=>wp_json_encode($a),'offer_ids'=>wp_json_encode($ids),'version'=>self::VERSION]);
  if(!$ok)return new WP_Error('save','Could not save your assessment. Please try again.',['status'=>500]);
  return rest_ensure_response(['response_id'=>$id,'token'=>$token,'offer_ids'=>$ids,'result'=>($a['tool']??'')==='quiz'?self::quiz_result($a):null]);
 }
 static function lead($r){
  if(!self::rate('lead',5))return new WP_Error('rate','Please wait before requesting another email.',['status'=>429]);
  if($r->get_param('website'))return new WP_Error('invalid','Invalid request.',['status'=>400]);
  $token=(string)$r->get_param('token');$email=sanitize_email((string)$r->get_param('email'));$offer=sanitize_key((string)$r->get_param('offer'));if(!preg_match('/^[a-f0-9]{64}$/',$token)||!is_email($email))return new WP_Error('invalid','Enter a valid email and complete the assessment first.',['status'=>400]);
  global $wpdb;$t=self::table();$row=$wpdb->get_row($wpdb->prepare("SELECT * FROM $t WHERE token_hash=%s",hash('sha256',$token)),ARRAY_A);
  if(!$row||strtotime($row['created_at'].' UTC')<time()-DAY_IN_SECONDS||!in_array($offer,json_decode($row['offer_ids'],true),true))return new WP_Error('invalid','Please run the finder again before requesting your plan.',['status'=>400]);
  if($row['mail_status']==='sending')return new WP_Error('sending','Your email is being prepared. Please wait.',['status'=>409]);
  $profile=json_decode($row['profile'],true);if(($profile['quiz_version']??'')===Scrolly_Locator_Model::VERSION)return new WP_Error('signup','Use the disclosed Business Locator signup form to request this kit.',['status'=>400]);$o=($profile['tool']??'')==='quiz'?self::quiz_result($profile):null;foreach(self::catalog() as $x)if($x['id']===$offer)$o=$x;if(!$o)return new WP_Error('offer','Offer not found.',['status'=>400]);
  $consent=$r->get_param('consent')===true && Scrolly_MailerLite_Router::ready();
  $profile['marketing_consent']=['requested'=>$consent,'requested_at'=>current_time('mysql',true),'copy_version'=>'phase1-v1','copy'=>'Also send me Scrolly tips and offers. Unsubscribe anytime.','privacy'=>get_privacy_policy_url()]; $confirm=$consent?bin2hex(random_bytes(32)):'';
  if($consent)set_transient('sq_confirm_'.hash('sha256',$confirm),['response_id'=>$row['response_id'],'email'=>$email,'offer'=>$offer],DAY_IN_SECONDS);
  $wpdb->update($t,['profile'=>wp_json_encode($profile),'email'=>$email,'chosen_offer'=>$offer,'consent'=>$consent?1:0,'confirmed_at'=>null,'mail_status'=>'sending','sync_status'=>$consent?'awaiting_confirmation':'not_requested'],['id'=>$row['id']]);
  $body=($profile['tool']??'')==='quiz'?self::quiz_email($o,$profile):self::email_plan($o,$profile);
  if($consent)$body.='<p>You also requested Scrolly tips and offers. <a href="'.esc_url(add_query_arg('scrolly_offer_confirm',$confirm,home_url('/'))).'">Confirm that subscription</a>. This link expires in 24 hours.</p>';
  $body.='</body></html>';
  $sent=wp_mail($email,(($profile['tool']??'')==='quiz'?'Your free Scrolly kit: ':'Your Scrolly Offer Starter Plan: ').$o['title'],$body,['Content-Type: text/html; charset=UTF-8']);
  $wpdb->update($t,['mail_status'=>$sent?'accepted':'failed'],['id'=>$row['id']]);
  if(!$sent)return new WP_Error('mail','We could not send your email. Your plan is still available on this page. Please try again later.',['status'=>502]);
  return rest_ensure_response(['message'=>'Your plan has been sent. Check your inbox and spam folder.'.($consent?' Confirm the optional subscription using the link in your email.':'')]);
 }
 static function email_plan($o,$p){
  $body='<html><body style="font-family:Arial,sans-serif;max-width:650px;color:#090909"><h1>SCROLLY</h1><h2>'.esc_html($o['title']).'</h2>';
  foreach(['scope'=>'Your offer','buyers'=>'Potential buyers','search'=>'Find prospects on Instagram','signals'=>'Look for an actual need','demo'=>'Your content example','priceBasis'=>'Price guidance','competition'=>'Competition','reason'=>'AI exposure: '.$o['ai'],'strength'=>'Make it stronger','test'=>'Your first sales test'] as $key=>$label)$body.='<h3>'.esc_html($label).'</h3><p>'.esc_html($o[$key]).'</p>';
  if($o['priceRange'])$body.='<p><strong>Suggested '.($o['format']==='digital'?'per-copy price test':'scoped project estimate').': $'.esc_html($o['priceRange'][0]).'–$'.esc_html($o['priceRange'][1]).'</strong></p>';
  $body.='<h3>Keep a simple record</h3><p>Date, source, stated need, inquiries, purchases, revenue, costs, delivery hours, and next action.</p><p><a href="'.esc_url(home_url('/1k-club/')).'">Explore the $1K Club</a> to build your broader plan.</p><p>Suggestions and price tests do not guarantee buyers or earnings.</p>';return $body;
 }
 static function sync($email,$row){
  $p=json_decode($row['profile'],true);$result=($p['tool']??'')==='quiz'?self::quiz_result($p):null;
  return Scrolly_MailerLite_Router::subscribe($email,Scrolly_MailerLite_Router::context($p,$result,$row['chosen_offer']),true);
 }
 static function view(){
  if(isset($_GET['scrolly_offer_confirm'])){
   nocache_headers();$token=sanitize_text_field(wp_unslash($_GET['scrolly_offer_confirm']));if(!preg_match('/^[a-f0-9]{64}$/',$token))wp_die('Invalid confirmation link.');$key='sq_confirm_'.hash('sha256',$token);$info=get_transient($key);if(!$info)wp_die('This confirmation link has expired. Request your plan again.');
   if(($_SERVER['REQUEST_METHOD']??'GET')!=='POST')wp_die('<p>Confirm your optional Scrolly tips and offers subscription.</p><form method="post"><button type="submit">Confirm subscription</button></form>','Confirm Scrolly subscription',['response'=>200]);
   global $wpdb;$t=self::table();$row=$wpdb->get_row($wpdb->prepare("SELECT * FROM $t WHERE response_id=%s",$info['response_id']),ARRAY_A);if(!$row||!$row['consent']||$row['email']!==$info['email'])wp_die('This subscription request is no longer current.');
   $status=self::sync($info['email'],$row);$wpdb->update($t,['confirmed_at'=>current_time('mysql',true),'sync_status'=>$status],['id'=>$row['id']]);if($status==='synced')delete_transient($key);
   wp_die($status==='synced'?'Your Scrolly subscription is confirmed.':($status==='not_configured'?'Your request is confirmed. Email-list setup is still pending.':($status==='not_reactivated'?'Your resource is available. Your existing email-list status was preserved; no marketing subscription was activated.':'We could not complete your subscription. Please retry this link later.')),'Scrolly subscription',['response'=>200]);
  }
  if(!isset($_GET['scrolly_offer_view'])&&!isset($_GET['scrolly_quiz_view']))return;
  nocache_headers();header('Content-Type: text/html; charset=UTF-8');header('X-Frame-Options: SAMEORIGIN');
  $quiz=isset($_GET['scrolly_quiz_view']);$html=file_get_contents(__DIR__.($quiz?(get_option('scrolly_locator_release','legacy')==='1.5'?'/quiz.html':'/quiz-legacy-0.4.2.html'):'/finder.html'));$privacy=get_privacy_policy_url();$config=['api'=>rest_url('scrolly/v1/offer/'),'bootstrap'=>rest_url('scrolly/v1/offer/bootstrap'),'nonce'=>self::public_token(),'marketing'=>Scrolly_MailerLite_Router::ready(),'privacy'=>$privacy,'club1'=>self::link('club1','/1k-club/'),'club10'=>self::link('club10','/10k-club/'),'finder'=>self::link('finder','/quiz/'),'quiz'=>self::link('quiz','/next-move/')];
  $html=str_replace('<style data-scrolly-theme></style>','<style>'.file_get_contents(__DIR__.'/theme.css').'</style>',$html);
  $html=str_replace('<script data-scrolly-api></script>','<script>'.file_get_contents(__DIR__.'/api.js').'</script>',$html);
  echo str_replace('</head>','<script>window.SCROLLY_CONFIG='.wp_json_encode($config,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT).';</script></head>',$html);exit;
 }
 static function shortcode($atts=[]){$quiz=($atts['tool']??'')==='quiz';
  $id='scrolly-finder-'.wp_generate_uuid4();$src=add_query_arg($quiz?'scrolly_quiz_view':'scrolly_offer_view','1',home_url('/'));$origin=wp_parse_url(home_url(),PHP_URL_SCHEME).'://'.wp_parse_url(home_url(),PHP_URL_HOST);$port=wp_parse_url(home_url(),PHP_URL_PORT);if($port)$origin.=':'.$port;
  return '<div class="scrolly-tool-embed" style="width:min(1440px,calc(100vw - 2 * clamp(20px,4.5vw,96px)));max-width:none;position:relative;left:50%;transform:translateX(-50%)"><iframe id="'.esc_attr($id).'" title="'.($quiz?'Find your Club':'Find your first offer').'" src="'.esc_url($src).'" style="width:100%;height:800px;border:0;display:block;scroll-margin-top:110px" loading="lazy"></iframe></div><script>(function(){const f=document.getElementById('.wp_json_encode($id).');window.addEventListener("message",function(e){if(e.origin!=='.wp_json_encode($origin).'||e.source!==f.contentWindow)return;if(e.data&&e.data.type==="scrolly-modal"){f.contentWindow.postMessage({type:"scrolly-modal-space",height:Math.max(240,window.innerHeight-Math.max(0,f.getBoundingClientRect().top)-24)},e.origin);return;}if(e.data&&e.data.type==="scrolly-top"){f.scrollIntoView({behavior:"instant",block:"start"});return;}if(e.data&&e.data.type==="scrolly-height"&&Number.isFinite(e.data.height))f.style.height=Math.min(25000,Math.max(500,e.data.height))+"px";});})();</script>';
 }

 static function link($key,$fallback){$links=get_option('scrolly_tool_links',[]);return !empty($links[$key])?$links[$key]:home_url($fallback);}
 static function quiz_profile($p){
  if(isset($p['quiz_version']))return Scrolly_Locator_Model::profile($p);
  $allowed=['offer'=>['none','idea','selling'],'revenue'=>['zero','under1k','1kto10k','10kplus'],'bottleneck'=>['offer','customers','conversion','repeat'],'hours'=>['3','5','10'],'goal'=>['first','consistent','scale']];$out=['tool'=>'quiz'];
  foreach($allowed as $k=>$values){if(!in_array($p[$k]??'', $values,true))return false;$out[$k]=$p[$k];}
  $channels=['instagram','facebook','tiktok','youtube','pinterest','threads','search','email','referrals','outreach','ads','none'];
  if(!isset($p['channels'])||!is_array($p['channels'])||!count($p['channels'])||count($p['channels'])>12)return false;foreach($p['channels'] as $channel)if(!is_string($channel)||!in_array($channel,$channels,true))return false;
  if(in_array('none',$p['channels'],true)&&count($p['channels'])>1)return false;
  $out['channels']=array_values(array_unique($p['channels']));
  $branch=$out['offer']!=='selling'?'offer':(in_array($out['revenue'],['zero','under1k'],true)?'customers':'growth');
  $detail_options=['offer'=>['skills','buyer','confidence'],'customers'=>['visibility','inquiries','buying'],'growth'=>['traffic','conversion','retention']];
  if(isset($p['detail'])){if(!is_string($p['detail'])||!in_array($p['detail'],$detail_options[$branch],true))return false;$out['detail']=$p['detail'];}
  $out['branch']=$branch;return $out;
 }
 static function quiz_result($p){
  if(($p['quiz_version']??'')===Scrolly_Locator_Model::VERSION)return Scrolly_Locator_Model::result($p);
  $id=($p['offer']==='none'||$p['offer']==='idea')?'quiz-offer':(($p['revenue']==='zero'||$p['revenue']==='under1k')?'quiz-first':'quiz-grow');
  $titles=['quiz-offer'=>'Your First Offer Test Kit','quiz-first'=>'Your First Customer Sprint','quiz-grow'=>'Your Organic Growth Experiment'];
  $steps=$id==='quiz-offer'?['Choose one buyer and one problem you can solve with a skill you can demonstrate. Use the Offer Finder to compare three starting ideas.','Define a small paid pilot: deliverable, turnaround, exclusions, price and one sample. Validate your price with relevant comparable offers.','Find five relevant Instagram accounts with an active offer or an explicitly stated need. Ask where appropriate whether the problem is a priority; record their words before refining your offer.']:($id==='quiz-first'?['Write one clear offer: who it helps, what they receive, price, turnaround and a simple way to buy.','Publish three demonstrations: the problem, your process and the finished result. Invite suitable people to one clear next step.','Track five relevant prospect conversations, inquiries and purchases. Review objections and actual delivery costs before changing your offer.']:['Choose one existing offer with evidence of purchases and enough margin to deliver profitably. Record your baseline inquiries, sales, revenue and delivery hours.','Choose one bottleneck and run one organic experiment for seven days. Keep your offer and other variables steady so you can learn what changed.','Review qualified visitors, inquiries, sales and margin. Repeat what produced useful evidence; connect a landing page and email follow-up when they solve the measured bottleneck.']);
  $focus=['offer'=>'Clarify the offer and its buyer before increasing output.','customers'=>'Make the offer visible to relevant buyers, then track qualified inquiries.','conversion'=>'Improve the buying path and answer the objections you hear most often.','repeat'=>'Improve follow-up and repeat purchases before adding another channel.'];
  $why=$id==='quiz-offer'?'You do not yet have an actively selling offer, so a small paid test is your next useful milestone.':($id==='quiz-first'?'Your recent revenue is below $1,000 per month. Focus on a repeatable path to your first customers before adding more systems.':'You report at least $1,000 in recent monthly business revenue. Your next step is to improve a proven offer and measure an organic growth experiment.');
  $detail_focus=['skills'=>'Start with one skill you can demonstrate and a small deliverable.','buyer'=>'Choose a specific buyer and confirm which problem matters to them.','confidence'=>'Run one small paid test before building a larger product.','visibility'=>'Publish a useful demonstration where your buyer already spends time.','inquiries'=>'Make your offer and next action clear to people who show relevant interest.','buying'=>'Check the purchase path and answer repeated objections.','traffic'=>'Choose one organic acquisition channel and measure qualified inquiries.','conversion'=>'Improve the offer page and follow-up using actual buyer objections.','retention'=>'Review customer follow-up and a useful repeat-purchase offer.'];
  $focus_text=isset($detail_focus[$p['detail']??''])?$detail_focus[$p['detail']]:$focus[$p['bottleneck']];
  return ['id'=>$id,'title'=>$titles[$id],'why'=>$why,'steps'=>$steps,'focus'=>$focus_text,'club'=>$id==='quiz-grow'?'10':'1'];
 }
 static function quiz_email($o,$p){
  $body='<html><body style="font-family:Arial,sans-serif;max-width:650px"><h1>SCROLLY</h1><h2>'.esc_html($o['title']).'</h2><p>'.esc_html($o['why']).'</p><p><strong>Your focus:</strong> '.esc_html($o['focus']).'</p><ol>';
  foreach($o['steps'] as $step)$body.='<li style="margin-bottom:16px">'.esc_html($step).'</li>';
  $body.='</ol><h3>Your 7-day worksheet</h3><p>Buyer: ____<br>Problem: ____<br>Offer and scope: ____<br>Price and costs: ____<br>One experiment: ____<br>Success measure: ____</p><p>For each day record: activity, source, qualified inquiries, sales, revenue, costs, hours and what you learned.</p><p>Selected acquisition channels: '.esc_html(implode(', ',$p['channels'])).'. Start with one you can maintain within your available time.</p><p>Day 7 review: What produced qualified interest? What objections repeated? What will you keep or change?</p><p><a href="'.esc_url(self::link($o['club']==='10'?'club10':'club1',$o['club']==='10'?'/10k-club/':'/1k-club/')).'">'.($o['club']==='10'?'Explore the $10K next step':'Explore the $1K Club').'</a></p><p>No earnings or customer guarantees. Keep this email or print it to PDF.</p>';return $body;
 }
 static function settings(){
  if(!current_user_can('manage_options'))return;
  echo '<div class="wrap"><h1>Scrolly Tool Links</h1><p>Set the actual published page links before marketing. For $10K, use its sales page or interest-list page.</p><form method="post" action="options.php">';settings_fields('scrolly_tools');$links=get_option('scrolly_tool_links',[]);
  foreach(['finder'=>'Offer Finder page','quiz'=>'Quiz page','club1'=>'$1K Club page','club10'=>'$10K sales or interest page'] as $key=>$label)echo '<p><label>'.esc_html($label).'<br><input type="url" class="large-text" name="scrolly_tool_links['.esc_attr($key).']" value="'.esc_attr($links[$key]??'').'" required></label></p>';
  submit_button();echo '</form><p>Email plans use WordPress mail. Optional MailerLite subscriptions use the shared server-side router described in README.md. No external AI API is needed.</p></div>';
 }

 static function admin(){
  if(!current_user_can('manage_options'))return;global $wpdb;$t=self::table();$page=max(1,(int)($_GET['paged']??1));$rows=$wpdb->get_results($wpdb->prepare("SELECT * FROM $t ORDER BY id DESC LIMIT 50 OFFSET %d",($page-1)*50),ARRAY_A);
  echo '<div class="wrap"><h1>Scrolly Tool Responses</h1><p>Responses are retained until you choose to delete them. Email delivery marked accepted means WordPress handed the message to its mail transport; it does not prove inbox delivery.</p><p><a class="button" href="'.esc_url(wp_nonce_url(admin_url('admin-post.php?action=scrolly_offer_csv'),'scrolly_offer_csv')).'">Export CSV</a></p><table class="widefat striped"><thead><tr><th>UTC date</th><th>Email</th><th>Answers</th><th>Recommendations</th><th>Chosen offer</th><th>Email / subscription</th></tr></thead><tbody>';
  foreach($rows as $r)echo '<tr><td>'.esc_html($r['created_at']).'</td><td>'.esc_html($r['email']).'</td><td><code>'.esc_html($r['profile']).'</code></td><td>'.esc_html($r['offer_ids']).'</td><td>'.esc_html($r['chosen_offer']).'</td><td>'.esc_html($r['mail_status'].' / '.$r['sync_status']).'</td></tr>';
  echo '</tbody></table><p><a href="'.esc_url(add_query_arg(['page'=>'scrolly-offers','paged'=>max(1,$page-1)],admin_url('tools.php'))).'">Previous</a> · <a href="'.esc_url(add_query_arg(['page'=>'scrolly-offers','paged'=>$page+1],admin_url('tools.php'))).'">Next</a></p></div>';
 }
 static function csv(){
  if(!current_user_can('manage_options'))wp_die('Not authorized.',403);check_admin_referer('scrolly_offer_csv');global $wpdb;$t=self::table();nocache_headers();header('Content-Type: text/csv; charset=UTF-8');header('Content-Disposition: attachment; filename="scrolly-offer-responses.csv"');$f=fopen('php://output','w');$columns=['response_id','created_at','tool','revenue','channels','bottleneck','goal','hours','branch','detail','profile','offer_ids','chosen_offer','email','consent','confirmed_at','mail_status','sync_status','version'];fputcsv($f,$columns);$last=0;do{$rows=$wpdb->get_results($wpdb->prepare("SELECT * FROM $t WHERE id>%d ORDER BY id ASC LIMIT 500",$last),ARRAY_A);foreach($rows as $r){$answers=json_decode($r['profile'],true);foreach(['tool','revenue','channels','bottleneck','goal','hours','branch','detail'] as $key)$r[$key]=is_array($answers[$key]??null)?implode('; ',$answers[$key]):($answers[$key]??($key==='tool'?'finder':''));$out=[];foreach($columns as $col){$v=(string)($r[$col]??'');if(preg_match('/^[\s]*[=+@-]/',$v))$v="'".$v;$out[]=$v;}fputcsv($f,$out);$last=$r['id'];}}while(count($rows)===500);fclose($f);exit;
 }
}
register_activation_hook(__FILE__,['Scrolly_Offer_Finder','activate']);register_deactivation_hook(__FILE__,['Scrolly_Offer_Finder','deactivate']);Scrolly_Offer_Finder::boot();
