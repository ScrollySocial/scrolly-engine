<?php
/** Shared Scrolly subscriber router. No public endpoint accepts marketing subscriptions. */
if (!defined('ABSPATH')) exit;
final class Scrolly_MailerLite_Router {
 const OPTION='scrolly_ml_router_v1';
 const GROUP_NAMES=['Scrolly Subscribers','Interest: 10K Club','Interest: 24K Club','Customer: 1K Club','Customer: 1K Challenge'];
 static function boot(){
  add_action('rest_api_init',function(){
   register_rest_route('scrolly/v1','/mailerlite/config',[
    ['methods'=>'GET','callback'=>[__CLASS__,'configuration'],'permission_callback'=>function(){return current_user_can('manage_options');}],
    ['methods'=>'POST','callback'=>[__CLASS__,'configure'],'permission_callback'=>function(){return current_user_can('manage_options');}],
   ]);
  });
  add_action('woocommerce_payment_complete',[__CLASS__,'paid_order'],20);
  add_action('woocommerce_order_status_changed',function($id,$from,$to){if(in_array($to,['processing','completed'],true))self::paid_order($id);},20,3);
  add_action('scrolly_ml_customer_retry',[__CLASS__,'paid_order'],10,2);
 }
 static function configuration(){
  $c=get_option(self::OPTION,[]);
  return rest_ensure_response(['configured'=>self::ready(),'groups'=>$c['groups']??[],'tool_links'=>get_option('scrolly_tool_links',[]),'version'=>'1.0']);
 }
 static function configure($r){
  $c=get_option(self::OPTION,[]);$groups=$r->get_param('groups');
  if(!is_array($groups)||array_diff(self::GROUP_NAMES,array_keys($groups)))return new WP_Error('invalid','All approved group IDs are required.',['status'=>400]);
  $clean=[];foreach(self::GROUP_NAMES as $name){$id=(string)$groups[$name];if(!preg_match('/^\d{5,25}$/',$id))return new WP_Error('invalid','Invalid group ID.',['status'=>400]);$clean[$name]=$id;}
  $key=$r->get_param('api_key');
  if($key!==null){
   if(!is_string($key)||strlen($key)<20||strlen($key)>4096||preg_match('/[\r\n]/',$key))return new WP_Error('invalid','Invalid API configuration.',['status'=>400]);
   if(!function_exists('openssl_encrypt'))return new WP_Error('crypto','Server encryption is unavailable.',['status'=>500]);
   $iv=random_bytes(12);$tag='';$cipher=openssl_encrypt($key,'aes-256-gcm',hash('sha256',wp_salt('auth'),true),OPENSSL_RAW_DATA,$iv,$tag);
   if($cipher===false)return new WP_Error('crypto','Could not protect API configuration.',['status'=>500]);
   $c['encrypted_key']=base64_encode($iv.$tag.$cipher);
  }
  $c['groups']=$clean;update_option(self::OPTION,$c,false);
  $links=get_option('scrolly_tool_links',[]);$links['finder']=home_url('/quiz/');$links['quiz']=home_url('/next-move/');update_option('scrolly_tool_links',$links,false);
  return self::configuration();
 }
 static function key(){
  if(defined('SCROLLY_MAILERLITE_API_KEY')&&SCROLLY_MAILERLITE_API_KEY)return SCROLLY_MAILERLITE_API_KEY;
  $c=get_option(self::OPTION,[]);$bytes=base64_decode($c['encrypted_key']??'',true);
  if(!$bytes||strlen($bytes)<29||!function_exists('openssl_decrypt'))return '';
  return openssl_decrypt(substr($bytes,28),'aes-256-gcm',hash('sha256',wp_salt('auth'),true),OPENSSL_RAW_DATA,substr($bytes,0,12),substr($bytes,12,16))?:'';
 }
 static function ready(){return (bool)(self::key()&&!empty(get_option(self::OPTION,[])['groups']['Scrolly Subscribers']));}
 static function groups(){return get_option(self::OPTION,[])['groups']??[];}
 static function api($method,$path,$data=null){
  $key=self::key();if(!$key)return new WP_Error('not_configured','Email-list setup is pending.');
  $args=['method'=>$method,'timeout'=>15,'headers'=>['Authorization'=>'Bearer '.$key,'Content-Type'=>'application/json','Accept'=>'application/json']];
  if($data!==null)$args['body']=wp_json_encode($data);
  $res=wp_remote_request('https://connect.mailerlite.com/api/'.$path,$args);
  if(is_wp_error($res))return new WP_Error('unavailable','Email-list service is temporarily unavailable.');
  $code=wp_remote_retrieve_response_code($res);
  if($code===404)return null;
  if($code<200||$code>=300)return new WP_Error('api_error','Email-list service could not complete the request.');
  $body=json_decode(wp_remote_retrieve_body($res),true);
  if(!is_array($body)||!isset($body['data']))return new WP_Error('invalid_response','Email-list service returned an unexpected response.');
  return $body['data'];
 }
 static function subscriber($email){return self::api('GET','subscribers/'.rawurlencode($email).'?include=groups');}
 static function group_ids($subscriber){return array_map('strval',array_column($subscriber['groups']??[],'id'));}
 static function fields($old,$incoming){
  $out=[];
  $allowed=['source_page','placement','lead_magnet','acquisition_source','revenue_stage','recommended_club','business_stage'];
  $enums=['revenue_stage'=>['pre_1k','1k_to_10k','10k_plus','unknown'],'recommended_club'=>['1k','10k','24k','unknown'],'business_stage'=>['no_offer','idea','selling','unknown']];
  foreach($allowed as $key){
   if(!isset($incoming[$key])||!is_scalar($incoming[$key]))continue;
   $value=trim((string)$incoming[$key]);if($value==='')continue;
   if(isset($enums[$key])&&!in_array($value,$enums[$key],true))continue;
   $known=isset($old[$key])&&trim((string)$old[$key])!==''&&$old[$key]!=='unknown';
   if($key==='acquisition_source'&&$known)continue;
   if($value==='unknown'&&$known)continue;
   $out[$key]=sanitize_text_field($value);
  }
  return $out;
 }
 static function context($profile,$result,$chosen){
  if(($profile['tool']??'')!=='quiz')return ['acquisition_source'=>'Offer Finder','source_page'=>'/quiz/','placement'=>'offer-modal','lead_magnet'=>'selected-offer-plan'];
  $revenue=['zero'=>'pre_1k','under1k'=>'pre_1k','1kto10k'=>'1k_to_10k','10kplus'=>'10k_plus'];
  $stage=['none'=>'no_offer','idea'=>'idea','selling'=>'selling'];
  return ['acquisition_source'=>'Business Locator','source_page'=>'/next-move/','placement'=>'quiz-result','lead_magnet'=>$result['id'],'revenue_stage'=>$revenue[$profile['revenue']]??'unknown','recommended_club'=>$result['club']==='10'?'10k':'1k','business_stage'=>$stage[$profile['offer']]??'unknown'];
 }
 /** Consent must be explicitly confirmed by the calling acquisition handler. */
 static function subscribe($email,$fields,$confirmed=false,$interests=[]){
  if(!$confirmed)return 'not_requested';
  $email=strtolower(sanitize_email($email));if(!is_email($email))return 'invalid';
  if(!self::ready())return 'not_configured';
  $old=self::subscriber($email);if(is_wp_error($old))return 'failed';
  // Unknown/non-active statuses, including suppression, always fail closed.
  if($old&&($old['status']??'')!=='active')return 'not_reactivated';
  $g=self::groups();$names=['Scrolly Subscribers'];
  foreach($interests as $interest)if(in_array($interest,['Interest: 10K Club','Interest: 24K Club'],true))$names[]=$interest;
  $names=array_merge($names,self::customer_names($email));
  $ids=array_values(array_unique(array_merge(self::group_ids($old?:[]),array_map(function($name)use($g){return $g[$name];},$names))));
  $payload=['email'=>$email,'fields'=>self::fields($old['fields']??[],$fields),'groups'=>$ids];
  // POST is an additive email upsert; never PUT a replacement group array or force status active.
  $result=self::api('POST','subscribers',$payload);
  return is_wp_error($result)||!is_array($result)?'failed':(($result['status']??'')==='active'?'synced':'not_reactivated');
 }
 static function order_names($order){
  if(!$order||!$order->has_status(['processing','completed'])||!$order->is_paid()||!$order->get_date_paid())return [];
  $names=[];
  foreach($order->get_items() as $item_id=>$item){
   $qty=(int)$item->get_quantity()+(int)$order->get_qty_refunded_for_item($item_id);
   $net=(float)$item->get_total()-(float)$order->get_total_refunded_for_item($item_id);
   if($qty<=0||$net<=0)continue;
   $product=(int)$item->get_product_id();$variation=(int)$item->get_variation_id();
   if($product===279){$names[]='Customer: 1K Club';if($variation===583)$names[]='Customer: 1K Challenge';}
   if($product===280)$names[]='Customer: 1K Challenge';
  }
  return array_values(array_unique($names));
 }
 static function customer_names($email){
  if(!function_exists('wc_get_orders'))return [];
  // Only this newly consented person's orders; no historical subscriber migration.
  $orders=wc_get_orders(['billing_email'=>$email,'status'=>['processing','completed'],'limit'=>-1]);$names=[];
  foreach($orders as $order)$names=array_merge($names,self::order_names($order));
  return array_values(array_unique($names));
 }
 static function paid_order($order_id,$attempt=0){
  if(!function_exists('wc_get_order')||!self::ready())return;
  $order=wc_get_order($order_id);$names=self::order_names($order);if(!$names)return;
  $email=strtolower(sanitize_email($order->get_billing_email()));if(!is_email($email))return;
  $subscriber=self::subscriber($email);
  if(is_wp_error($subscriber)){self::retry($order,$attempt);return;}
  $g=self::groups();$existing=self::group_ids($subscriber?:[]);
  // No subscriber creation from checkout. Only consented, active master-group members qualify.
  if(!$subscriber||($subscriber['status']??'')!=='active'||!in_array($g['Scrolly Subscribers'],$existing,true)){
   $order->update_meta_data('_scrolly_ml_customer_sync','not_marketing_subscriber');$order->save_meta_data();return;
  }
  $needed=array_values(array_diff(array_map(function($name)use($g){return $g[$name];},$names),$existing));
  if(!$needed){$order->update_meta_data('_scrolly_ml_customer_sync','synced');$order->save_meta_data();return;}
  // Additive upsert and all prior groups preserved. No status or marketing permission changes.
  $result=self::api('POST','subscribers',['email'=>$email,'groups'=>array_values(array_unique(array_merge($existing,$needed)))]);
  if(is_wp_error($result)||!is_array($result)){self::retry($order,$attempt);return;}
  $order->update_meta_data('_scrolly_ml_customer_sync','synced');$order->save_meta_data();
 }
 static function retry($order,$attempt){
  $order->update_meta_data('_scrolly_ml_customer_sync','failed');$order->save_meta_data();
  if((int)$attempt<3){$args=[(int)$order->get_id(),(int)$attempt+1];if(!wp_next_scheduled('scrolly_ml_customer_retry',$args))wp_schedule_single_event(time()+300,'scrolly_ml_customer_retry',$args);}
 }
}
Scrolly_MailerLite_Router::boot();
