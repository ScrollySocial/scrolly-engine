<?php
if(!defined('ABSPATH'))exit;
final class Scrolly_Locator_Access {
 const DISCLOSURE='By signing up, you join Scrolly\'s email list and agree to receive practical business tips and marketing offers. Confirm your email to unlock your kit. Unsubscribe anytime.';
 static function boot(){
  add_action('rest_api_init',function(){foreach(['signup','resend'] as $route)register_rest_route('scrolly/v1','/locator/'.$route,['methods'=>'POST','callback'=>[__CLASS__,$route],'permission_callback'=>['Scrolly_Offer_Finder','permission']]);});
  add_action('rest_api_init',function(){register_rest_route('scrolly/v1','/locator/release',[
   ['methods'=>'GET','callback'=>function(){return rest_ensure_response(['release'=>get_option('scrolly_locator_release','legacy')]);},'permission_callback'=>function(){return current_user_can('manage_options');}],
   ['methods'=>'POST','callback'=>function($r){$release=$r->get_param('release');if(!in_array($release,['legacy','1.5'],true))return new WP_Error('invalid','Invalid release.',['status'=>400]);update_option('scrolly_locator_release',$release,false);return rest_ensure_response(['release'=>$release]);},'permission_callback'=>function(){return current_user_can('manage_options');}],
  ]);});
  add_action('template_redirect',[__CLASS__,'view'],0);
  add_action('scrolly_locator_sync_retry',[__CLASS__,'retry_sync'],10,3);
 }
 static function row($id){global $wpdb;return $wpdb->get_row($wpdb->prepare('SELECT * FROM '.Scrolly_Offer_Finder::table().' WHERE response_id=%s',$id),ARRAY_A);}
 static function update($row,$data){global $wpdb;return $wpdb->update(Scrolly_Offer_Finder::table(),$data,['id'=>$row['id']]);}
 static function from_request($r){
  $token=$r->get_param('token');if(!is_string($token)||!preg_match('/^[a-f0-9]{64}$/',$token))return false;
  global $wpdb;$row=$wpdb->get_row($wpdb->prepare('SELECT * FROM '.Scrolly_Offer_Finder::table().' WHERE token_hash=%s',hash('sha256',$token)),ARRAY_A);
  if(!$row||strtotime($row['created_at'].' UTC')<time()-7*DAY_IN_SECONDS)return false;$p=json_decode($row['profile'],true);
  return ($p['quiz_version']??'')===Scrolly_Locator_Model::VERSION&&($p['offer']??'')!=='direction'?$row:false;
 }
 static function signup($r){
  if(!Scrolly_Offer_Finder::rate('locator_signup',5))return new WP_Error('rate','Please wait before requesting another confirmation.',['status'=>429]);
  if($r->get_param('website'))return new WP_Error('invalid','Invalid request.',['status'=>400]);
  if($r->get_param('signup_intent')!==true)return new WP_Error('consent','Please use the disclosed Scrolly signup form.',['status'=>400]);
  $row=self::from_request($r);$raw=$r->get_param('email');$email=is_string($raw)?strtolower(sanitize_email($raw)):'';
  if(!$row||!is_email($email))return new WP_Error('invalid','Enter a valid email and complete the assessment first.',['status'=>400]);
  if($row['mail_status']==='sending')return new WP_Error('sending','Your confirmation is being prepared. Please wait.',['status'=>409]);
  return self::send_confirmation($row,$email);
 }
 static function resend($r){
  if(!Scrolly_Offer_Finder::rate('locator_resend',3))return new WP_Error('rate','Please wait before requesting another confirmation.',['status'=>429]);
  if($r->get_param('website'))return new WP_Error('invalid','Invalid request.',['status'=>400]);$row=self::from_request($r);
  if(!$row||!$row['consent']||!is_email($row['email']))return new WP_Error('invalid','Request a confirmation from your result first.',['status'=>400]);
  return self::send_confirmation($row,$row['email']);
 }
 static function send_confirmation($row,$email){
  $p=json_decode($row['profile'],true);$r=Scrolly_Locator_Model::result($p);$token=bin2hex(random_bytes(32));
  $p['consent_events'][]=['requested_at'=>current_time('mysql',true),'email'=>$email,'copy_version'=>'locator-1.5-v1','disclosure'=>self::DISCLOSURE,'privacy_url'=>get_privacy_policy_url()?:home_url('/privacy-policy/'),'source_page'=>'/next-move/','resource_version'=>Scrolly_Locator_Model::RESOURCE_VERSION];
  $p['locator_confirmation']=['hash'=>hash('sha256',$token),'expires'=>time()+DAY_IN_SECONDS,'resend_until'=>time()+7*DAY_IN_SECONDS];unset($p['locator_access']);
  if(self::update($row,['profile'=>wp_json_encode($p),'email'=>$email,'chosen_offer'=>$r['id'],'consent'=>1,'confirmed_at'=>null,'sync_status'=>'awaiting_confirmation','mail_status'=>'sending'])===false)return new WP_Error('save','Could not save your request. Please retry.',['status'=>500]);
  $url=add_query_arg(['locator_confirm'=>$row['response_id'],'token'=>$token],home_url('/'));
  $body='<html><body><h1>SCROLLY</h1><h2>Confirm and unlock '.esc_html($r['title']).'</h2><p>You signed up for your personalized kit and practical Scrolly business tips and marketing offers. Unsubscribe anytime.</p><p><a href="'.esc_url($url).'">Confirm &amp; unlock my kit</a></p><p>Opening the link does not complete signup. Confirm on the page to unlock the kit. This link expires in 24 hours; an expired link can request a replacement for seven days.</p><p><a href="'.esc_url(get_privacy_policy_url()?:home_url('/privacy-policy/')).'">Privacy policy</a></p></body></html>';
  $sent=wp_mail($email,'Confirm your Scrolly signup to unlock '.$r['title'],$body,['Content-Type: text/html; charset=UTF-8']);self::update($row,['mail_status'=>$sent?'accepted':'failed']);
  if(!$sent)return new WP_Error('mail','We could not send the confirmation email. Your free result is still here. Check your address and retry later.',['status'=>502]);
  return rest_ensure_response(['message'=>'Your confirmation email was accepted for sending. Check your inbox and spam folder, then confirm to unlock '.$r['title'].'.','state'=>'awaiting_confirmation']);
 }
 static function token_state($row,$token){
  if(!$row||!is_string($token)||!preg_match('/^[a-f0-9]{64}$/',$token))return 'invalid';$p=json_decode($row['profile'],true);$c=$p['locator_confirmation']??[];
  if(($p['quiz_version']??'')!==Scrolly_Locator_Model::VERSION||!$row['consent']||!isset($c['hash'])||!hash_equals($c['hash'],hash('sha256',$token)))return 'invalid';
  if(time()>($c['resend_until']??0))return 'invalid';return time()>($c['expires']??0)?'expired':'valid';
 }
 static function confirm($row,$token){
  $state=self::token_state($row,$token);if($state!=='valid')return new WP_Error($state,'This confirmation is invalid or expired.',['status'=>403]);
  $p=json_decode($row['profile'],true);$access=bin2hex(random_bytes(32));$p['locator_access']=['hash'=>hash('sha256',$access),'expires'=>time()+7*DAY_IN_SECONDS,'email'=>$row['email']];
  if(!$row['confirmed_at'])$p['consent_events'][]=['confirmed_at'=>current_time('mysql',true),'copy_version'=>'locator-1.5-v1','email'=>$row['email']];
  if(self::update($row,['profile'=>wp_json_encode($p),'confirmed_at'=>$row['confirmed_at']?:current_time('mysql',true)])===false)return new WP_Error('save','Could not confirm access. Please retry.',['status'=>500]);
  $row=self::row($row['response_id']);$status=$row['sync_status']==='synced'?'synced':self::sync($row,0);
  return ['status'=>$status,'url'=>add_query_arg(['locator_resource'=>$row['response_id'],'access'=>$access],home_url('/')),'resource'=>Scrolly_Locator_Model::result($p)['title']];
 }
 static function authorized($row,$access){
  if(!$row||!$row['confirmed_at']||!$row['consent']||!is_string($access)||!preg_match('/^[a-f0-9]{64}$/',$access))return false;
  $p=json_decode($row['profile'],true);$a=$p['locator_access']??[];
  return ($p['quiz_version']??'')===Scrolly_Locator_Model::VERSION&&isset($a['hash'])&&hash_equals($a['hash'],hash('sha256',$access))&&($a['expires']??0)>=time()&&($a['email']??'')===$row['email'];
 }
 static function sync($row,$attempt){
  if(!$row||!$row['confirmed_at']||!$row['consent'])return 'not_requested';$p=json_decode($row['profile'],true);$r=Scrolly_Locator_Model::result($p);
  try{$status=Scrolly_MailerLite_Router::subscribe($row['email'],Scrolly_Locator_Model::fields($p,$r),true);}catch(Throwable $e){$status='failed';}
  self::update($row,['sync_status'=>$status]);
  if(in_array($status,['failed','not_configured'],true)&&(int)$attempt<3){$args=[$row['response_id'],$p['locator_confirmation']['hash'],(int)$attempt+1];if(!wp_next_scheduled('scrolly_locator_sync_retry',$args))wp_schedule_single_event(time()+300,'scrolly_locator_sync_retry',$args);}
  return $status;
 }
 static function retry_sync($id,$hash,$attempt){$row=self::row($id);$p=json_decode($row['profile']??'{}',true);if(!$row||($p['quiz_version']??'')!==Scrolly_Locator_Model::VERSION||!$row['confirmed_at']||!hash_equals($p['locator_confirmation']['hash']??'',$hash)||!in_array($row['sync_status'],['failed','not_configured'],true))return;self::sync($row,$attempt);}
 static function post_origin(){
  if(($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site')return false;
  if(!empty($_SERVER['HTTP_ORIGIN'])){$a=wp_parse_url($_SERVER['HTTP_ORIGIN']);$b=wp_parse_url(home_url());return ($a['scheme']??'')===($b['scheme']??'')&&($a['host']??'')===($b['host']??'')&&($a['port']??null)===($b['port']??null);}return true;
 }
 static function page($title,$content,$status=200){status_header($status);nocache_headers();header('Content-Type: text/html; charset=UTF-8');echo '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'.esc_html($title).'</title><style>body{font:18px/1.55 Arial;background:#fffaf2;color:#232022;max-width:650px;margin:8vh auto;padding:24px}h1{font:38px/1.1 Georgia}button,a.button{display:inline-block;background:#59346c;color:white;padding:14px 20px;border:0;border-radius:5px;font-size:16px;margin:8px 8px 8px 0}a{color:#59346c}</style><b>SCROLLY</b><h1>'.esc_html($title).'</h1>'.$content.'</html>';exit;}
 static function view(){
  if(!isset($_GET['locator_confirm'])&&!isset($_GET['locator_resource']))return;
  header('Referrer-Policy: no-referrer');header('X-Robots-Tag: noindex, nofollow');header('X-Frame-Options: SAMEORIGIN');header('Cache-Control: no-store, private');
  if(isset($_GET['locator_resource'])){
   $id=sanitize_text_field(wp_unslash($_GET['locator_resource']));$access=sanitize_text_field(wp_unslash($_GET['access']??''));$row=self::row($id);
   if(!self::authorized($row,$access))self::page('This kit link is unavailable','<p>Use your confirmation email to verify access, or request a new confirmation from your saved result. For older expired requests, complete a new assessment.</p>',403);
   $p=json_decode($row['profile'],true);nocache_headers();header('Content-Type: text/html; charset=UTF-8');if(isset($_GET['download']))header('Content-Disposition: attachment; filename="scrolly-'.sanitize_key($row['chosen_offer']).'-'.Scrolly_Locator_Model::RESOURCE_VERSION.'.html"');echo Scrolly_Locator_Resource::render($p);exit;
  }
  $id=sanitize_text_field(wp_unslash($_GET['locator_confirm']));$token=sanitize_text_field(wp_unslash($_GET['token']??''));$row=self::row($id);$state=self::token_state($row,$token);
  if($state==='invalid')self::page('This link is unavailable','<p>Use the latest confirmation email. This request may have been replaced or its seven-day recovery period has ended.</p>',403);
  $p=json_decode($row['profile'],true);$title=Scrolly_Locator_Model::result($p)['title'];
  if(($_SERVER['REQUEST_METHOD']??'GET')==='POST'){
   if(!self::post_origin())self::page('Request not accepted','<p>Open the confirmation link directly and retry.</p>',403);
   if(($_POST['action']??'')==='resend'){
    if(!Scrolly_Offer_Finder::rate('locator_resend',3))self::page('Please wait','<p>Please wait before requesting another confirmation.</p>',429);
    $res=self::send_confirmation($row,$row['email']);self::page(is_wp_error($res)?'Email could not be sent':'Check your inbox',is_wp_error($res)?'<p>We could not send a replacement. Retry later.</p>':'<p>A new confirmation was accepted for sending to the address used for this signup. Use the latest email to unlock your kit.</p>');
   }
   if($state==='expired')self::page('This link has expired','<p>Request a new confirmation below. You do not need to retake the quiz.</p><form method="post"><button name="action" value="resend">Send a new confirmation</button></form>');
   if(($_POST['action']??'')!=='confirm')self::page('Request not accepted','<p>Use the confirmation button.</p>',400);
   $out=self::confirm($row,$token);if(is_wp_error($out))self::page('Could not confirm','<p>Please retry this link.</p>',500);
   $note=$out['status']==='synced'?'Your Scrolly email signup is complete.':($out['status']==='not_reactivated'?'Your existing email preferences were preserved. No inactive marketing subscription was activated.':'Your kit is ready. We are finishing your email signup; temporary sync problems are recorded for retry.');
   self::page('Your email is confirmed. '.$out['resource'].' is ready.','<p>'.esc_html($note).'</p><a class="button" href="'.esc_url($out['url']).'">View my kit</a><a class="button" href="'.esc_url(add_query_arg('download','1',$out['url'])).'">Download my kit</a><p>Your kit link is valid for seven days. You can keep the downloaded file.</p>');
  }
  if($state==='expired')self::page('This link has expired','<p>Request a new confirmation to unlock '.$title.'. You do not need to retake the quiz.</p><form method="post"><button name="action" value="resend">Send a new confirmation</button></form>');
  self::page('Confirm & unlock your kit','<p>Confirm your Scrolly email signup and unlock '.esc_html($title).'. You will receive practical business tips and marketing offers. Unsubscribe anytime.</p><form method="post"><button name="action" value="confirm">Confirm &amp; unlock my kit</button></form><p><a href="'.esc_url(get_privacy_policy_url()?:home_url('/privacy-policy/')).'">Privacy policy</a></p>');
 }
}
Scrolly_Locator_Access::boot();
