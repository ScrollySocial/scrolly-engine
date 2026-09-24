<?php
define('ABSPATH','/');
$GLOBALS['hooks']=[];
function add_action($h,$f,$p=10){$GLOBALS['hooks'][$h][]=$f;}
function did_action($h){return 1;}
function is_admin(){return false;}
function is_user_logged_in(){return false;}
function esc_url($u){return htmlspecialchars($u);}
function esc_html($s){return htmlspecialchars($s);}
function esc_attr($s){return htmlspecialchars($s);}
function home_url($p='/'){return 'https://scrollyseo.com'.$p;}
function get_nav_menu_locations(){return ['menu-1'=>18,'menu-2'=>19];}
function mk($id,$t,$u,$par=0,$cls=[]){$o=new stdClass;$o->ID=$id;$o->title=$t;$o->url=$u;$o->menu_item_parent=$par;$o->classes=$cls;return $o;}
function wp_get_nav_menu_items($m){
 if($m==18) return [mk(1,'Clubs + Challenges','/#clubs'),mk(2,'All Clubs','/clubs/',1),mk(3,'$1K Club','/1k-club/',1),mk(4,'Calculator','/#calculator'),mk(5,'Digital products','/digital-products/'),mk(6,'Merch','/scrolly-shop/'),mk(7,'SEO tools','/seo-tools/',0,['scx-drawer-only']),mk(8,'SEO Audit','/seo-site-audit/',7),mk(9,'Cart','/cart/',0,['scx-drawer-only'])];
 return [mk(20,'About','/about/'),mk(21,'Terms','/terms/'),mk(22,'Privacy','/privacy/'),mk(23,'Refunds','/refund/'),mk(24,'Accessibility','/accessibility/'),mk(25,'Contact','/contact/')];
}
function get_post($id){$m=['CSS'=>'css','JS'=>'js','LOGO'=>'logo'];$p=new stdClass;$p->post_type='page';
 $map=json_decode(file_get_contents(__DIR__.'/ids.json'),true);
 foreach($map as $k=>$v) if($v==$id) $p->post_content=file_get_contents(__DIR__.'/.store-'.$k); return $p;}
require __DIR__.'/.lint.php';
echo '<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">';
scxg_print_head();
echo '</head><body>';
scxg_print_header();
echo '<div style="padding:60px 88px;font:18px sans-serif">PAGE CONTENT HERE</div>';
scxg_print_footer();
echo '</body></html>';
