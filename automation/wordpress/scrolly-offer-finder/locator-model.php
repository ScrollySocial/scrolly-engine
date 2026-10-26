<?php
if(!defined('ABSPATH'))exit;
final class Scrolly_Locator_Model {
 const VERSION='1.5';const RESOURCE_VERSION='1.5.0';
 const CHANNELS=['instagram'=>'Instagram','facebook'=>'Facebook','tiktok'=>'TikTok','youtube'=>'YouTube','pinterest'=>'Pinterest','threads'=>'Threads','search'=>'Search / SEO','website'=>'My website','email'=>'Email','referrals'=>'Referrals / word of mouth','outreach'=>'Direct outreach','other'=>'Another channel','none'=>"I'm not marketing yet"];
 const PRIORITIES=['clarity'=>"Decide exactly what I'm selling and who it's for.",'pricing'=>'Work out the price, scope and how customers can buy.','visibility'=>'Get my offer in front of potential customers.','website'=>'Turn more website visitors into customers.','messages'=>'Turn more messages and questions into purchases.','repeat'=>'Get more repeat business.'];
 static function profile($p){
  if(!is_array($p)||($p['quiz_version']??'')!==self::VERSION||!in_array($p['offer']??'', ['none','idea','selling','direction'],true))return false;
  $out=['tool'=>'quiz','quiz_version'=>self::VERSION,'resource_version'=>self::RESOURCE_VERSION,'offer'=>$p['offer']];
  if($p['offer']==='direction')return $out;
  $text=$p['offer_text']??null;if(!is_string($text)||strlen($text)>640)return false;$text=sanitize_text_field($text);if(trim($text)===''||mb_strlen($text)>160)return false;$out['offer_text']=$text;
  if(!in_array($p['revenue']??'', ['zero','under1k','1kto10k','10kplus','unknown'],true))return false;$out['revenue']=$p['revenue'];
  $allowed=$p['offer']==='selling'?['visibility','website','messages','repeat']:['clarity','pricing','visibility'];if(!in_array($p['priority']??'', $allowed,true))return false;$out['priority']=$p['priority'];
  $channels=$p['channels']??null;if(!is_array($channels)||!count($channels)||count($channels)>13)return false;foreach($channels as $c)if(!is_string($c)||!isset(self::CHANNELS[$c]))return false;$channels=array_values(array_unique($channels));if(in_array('none',$channels,true)&&count($channels)>1)return false;$out['channels']=$channels;
  $primary=$p['primary_channel']??'';if(!is_string($primary))return false;
  if(count($channels)===1){if($primary!==''&&$primary!==$channels[0])return false;$primary=$channels[0];}elseif(!in_array($primary,$channels,true))return false;$out['primary_channel']=$primary;
  $paid=$p['paid']??'no';if($primary==='none'){$paid='no';$ads=[];}else{
   if(!in_array($paid,['no','yes','past'],true))return false;$ads=$p['ad_platforms']??[];
   if(!is_array($ads)||count($ads)>5)return false;foreach($ads as $ad)if(!is_string($ad)||!in_array($ad,['meta','google','tiktok','pinterest','other'],true))return false;
   $ads=array_values(array_unique($ads));if($paid==='yes'&&!$ads)return false;if($paid!=='yes'&&$ads)return false;
  }
  $out['paid']=$paid;$out['ad_platforms']=$ads;return $out;
 }
 static function result($p){
  if($p['offer']==='direction')return ['id'=>'quiz-direction','title'=>'Choose a chargeable direction first.','why'=>'Your next step is to identify something useful you can demonstrate or deliver. You do not need a growth plan before you have a starting direction.','focus'=>'Find one capability, useful asset or problem you could help someone with.','steps'=>['List three things people ask you to help with, or things you can show that you have made.','Pick one you could turn into a small, clear deliverable.','If you are still comparing possibilities, explore Offer Finder.'],'club'=>'unknown','resource'=>false];
  $id=$p['offer']!=='selling'?'quiz-offer':(in_array($p['revenue'],['1kto10k','10kplus'],true)?'quiz-grow':'quiz-first');$club=$id==='quiz-grow'?'10':($id==='quiz-first'&&$p['revenue']==='unknown'?'unknown':'1');
  $title=['quiz-offer'=>'Your First Offer Plan','quiz-first'=>'Your Next Customer Sprint','quiz-grow'=>'Your Revenue Growth Experiment'][$id];
  $why=$id==='quiz-offer'?'Turn your stated capability or idea into one offer people can understand and buy. Your description is a starting direction, not proof of demand.':($id==='quiz-first'?($p['revenue']==='unknown'?'You already have paying customers. Your recent revenue is unknown, so focus on the next useful sales improvement without assigning an income band.':'You already have paying customers and report less than $1,000 in the last 30 days. Improve one part of the path to your next sale.'):'You report paying customers and at least $1,000 in the last 30 days. Improve one part of the business that already earns revenue; this does not establish profitability.');
  $modules=self::module($p);return ['id'=>$id,'title'=>$title,'headline'=>$id==='quiz-offer'?'Turn your starting direction into a clear offer.':($id==='quiz-first'?'Make your next sale easier to repeat.':'Improve one part of the business that already earns revenue.'),'why'=>$why,'focus'=>$modules['focus'],'steps'=>$modules['steps'],'club'=>$club,'resource'=>true];
 }
 static function module($p){
  $modules=[
   'clarity'=>['focus'=>'Define one buyer and one deliverable they can understand.','steps'=>['Choose one buyer with a specific problem you can help solve.','Write what they receive, the delivery expectation and what is excluded.','Give them one clear way to ask or buy.'],'change'=>'Replace a broad description with one buyer, one deliverable and one buying action.','measure'=>'Relevant replies or questions about the named deliverable.'],
   'pricing'=>['focus'=>'Make the scope, starting price and buying action clear.','steps'=>['List included work, exclusions and required customer inputs.','Estimate time and direct costs; compare similarly scoped offers.','Publish or share a clear price/scope statement and one next action.'],'change'=>'Clarify the price, included scope and next buying step together as one offer card.','measure'=>'Questions about scope or price and completed purchases.'],
   'visibility'=>['focus'=>'Put a clear offer in front of more suitable buyers.','steps'=>['Identify a relevant audience on one primary channel.','Show one useful example and the offer it connects to.','Invite one clear next action and record relevant responses.'],'change'=>'Add one targeted distribution action for the existing offer.','measure'=>'Qualified visits, replies or inquiries from the primary channel.'],
   'website'=>['focus'=>'Make the website path from understanding to buying easier.','steps'=>['Open the offer page on a phone and follow the buying/contact path.','Clarify one obstacle: deliverable, price/scope, proof or next action.','Keep the primary traffic source steady and compare visitor actions.'],'change'=>'Improve one chosen element on the offer page; keep other variables steady.','measure'=>'Offer-page visitors who take the intended buying/contact action.'],
   'messages'=>['focus'=>'Help interested people understand the offer and take the next step.','steps'=>['Review recurring questions from recent relevant conversations.','Answer one repeated objection with scope, proof or delivery information.','Use one respectful follow-up and a clear purchase/contact action.'],'change'=>'Improve the reply to one recurring buying question.','measure'=>'Qualified conversations that progress to a purchase or clear next step.'],
   'repeat'=>['focus'=>'Give suitable existing customers a useful reason to return.','steps'=>['Choose customers for whom another purchase would genuinely help.','Define the repeat need, timing and a relevant next offer.','Use a permitted, respectful follow-up and record responses.'],'change'=>'Add one relevant repeat-purchase invitation for an eligible customer group.','measure'=>'Eligible customers who respond or purchase again.'],
  ];return $modules[$p['priority']];
 }
 static function channel($p){return self::CHANNELS[$p['primary_channel']]??'Choose one buyer-discovery route';}
 static function channel_action($p){
  $c=$p['primary_channel'];$actions=[
   'instagram'=>'Use one demonstration post or reel that shows the deliverable. Add one clear buying/contact action. Share it where relevant people already engage; do not mass-message accounts.',
   'facebook'=>'Use one relevant page or permitted community post with a real example and clear next action. Respect group rules; do not duplicate the promotion across unrelated groups.',
   'tiktok'=>'Create one short demonstration of the problem and deliverable. Make the next step clear in the supported profile or contact path.',
   'youtube'=>'Publish or improve one focused demonstration and its description. Connect it to the exact offer/contact page; do not start a separate channel plan.',
   'pinterest'=>'Create or improve one useful pin leading to the matching offer page. Check that the destination explains the deliverable and buying action.',
   'threads'=>'Share one specific example or useful explanation connected to the offer. Invite a relevant next step without repeated unsolicited pitches.',
   'search'=>'Improve one existing relevant page to match the buyer question and offer. Check its contact/purchase action. Search changes may need longer than seven days to show useful effects.',
   'website'=>'Use one offer page as the execution surface. Clarify the deliverable and buying/contact action, then use existing visitors to observe what happens. A website alone does not create traffic.',
   'email'=>'Send one relevant invitation only to people you have permission to email. Connect it to the offer and one action. Do not add purchased lists or silently enroll customers.',
   'referrals'=>'Ask a small number of relevant existing contacts whether they know someone with this specific need. Give a concise offer description they can pass on without pressure.',
   'outreach'=>'Identify a small number of genuinely relevant prospects and a specific reason the offer may help. Respect contact rules and preferences; use an individual, permission-aware approach.',
   'other'=>'Name the selected channel and its permitted buying/contact route below. Use one relevant example and one next action on that channel only.',
   'none'=>'Choose ONE starting route: relevant people you already know, OR individually identified suitable prospects. Write the chosen route below before continuing. No platform or ad budget is assumed.',
  ];return $actions[$c];
 }
 static function fields($p,$r){$rev=['zero'=>'pre_1k','under1k'=>'pre_1k','1kto10k'=>'1k_to_10k','10kplus'=>'10k_plus','unknown'=>'unknown'];return ['acquisition_source'=>'Business Locator','source_page'=>'/next-move/','placement'=>'quiz-result','lead_magnet'=>$r['id'],'revenue_stage'=>$rev[$p['revenue']]??'unknown','business_stage'=>['none'=>'no_offer','idea'=>'idea','selling'=>'selling'][$p['offer']]??'unknown','recommended_club'=>['1'=>'1k','10'=>'10k','unknown'=>'unknown'][$r['club']]];}
}
