(function(){
  if(window.__scxg)return;window.__scxg=1;
  var root=function(){return document.querySelector('.scxg.scxg-head')};
  function set(o){var r=root();if(!r)return;r.classList.toggle('scxg-open',o);var b=r.querySelector('[data-scxg-open]');if(b)b.setAttribute('aria-expanded',o?'true':'false');var d=r.querySelector('.scxg-drawer');if(d)d.setAttribute('aria-hidden',o?'false':'true');document.documentElement.style.overflow=o?'hidden':'';if(o){var c=r.querySelector('.scxg-dclose');c&&c.focus()}else if(b&&r.__was){b.focus()}r.__was=o}
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-scxg-open],[data-scxg-close]');
    if(t){set(t.hasAttribute('data-scxg-open'));return}
    var a=e.target.closest('.scxg-drawer a');if(a)set(false);
  });
  /* Desktop dropdowns: built from the drawer's nested menu lists (the WP Main Menu's child items), so no snippet change is needed. */
  function dd(){var r=root();if(!r||r.__dd)return;r.__dd=1;var nav=r.querySelector('.scxg-hdr nav');if(!nav)return;
    r.querySelectorAll('.scxg-drawer .top>li').forEach(function(li){var sub=li.querySelector(':scope>ul');var a=li.querySelector(':scope>a');if(!sub||!a)return;
      var t=[].slice.call(nav.querySelectorAll(':scope>a')).filter(function(x){return x.getAttribute('href')===a.getAttribute('href')&&x.textContent===a.textContent})[0];if(!t)return;
      var w=document.createElement('div');w.className='scxg-dd';t.parentNode.insertBefore(w,t);w.appendChild(t);t.setAttribute('aria-haspopup','true');
      var p=document.createElement('div');p.className='scxg-ddp';var u=sub.cloneNode(true);p.appendChild(u);w.appendChild(p);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',dd);else dd();
  /* Cart drawer: a header cart button opens a side panel filled from the WooCommerce Store API (no page change). */
  var API='/wp-json/wc/store/v1/cart',nonce='',cd,cbg,cbtn;
  function money(v,c){var d=Math.pow(10,c.currency_minor_unit||2);return (c.currency_prefix||'$')+(Number(v)/d).toFixed(2)+(c.currency_suffix||'')}
  function esc(t){var e=document.createElement('div');e.textContent=t==null?'':String(t);return e.innerHTML}
  function badge(n){if(!cbtn)return;var b=cbtn.querySelector('b');b.textContent=n;b.hidden=!n;cbtn.setAttribute('aria-label','Cart, '+n+' item'+(n===1?'':'s'))}
  function row(i){var im=i.images&&i.images[0]?'<img src="'+esc(i.images[0].thumbnail)+'" alt="">':'<span class="ph"></span>';var v=(i.variation||[]).map(function(x){return esc(x.attribute)+': '+esc(x.value)}).join(', ');
    return '<div class="it">'+im+'<div><div class="n">'+i.name+'</div>'+(v?'<div class="v">'+v+'</div>':'')+(i.quantity>1?'<div class="q">Qty '+i.quantity+'</div>':'')+'<button class="rm" type="button" data-key="'+esc(i.key)+'">Remove</button></div><div class="p">'+money(i.totals.line_subtotal,i.totals)+'</div></div>'}
  function render(c){if(!cd)return;var box=cd.querySelector('.items'),ft=cd.querySelector('.ft');badge(c.items_count||0);
    if(!c.items||!c.items.length){box.innerHTML='<p class="empty">Your cart is empty.</p>';ft.hidden=true;return}
    ft.hidden=false;box.innerHTML=c.items.map(row).join('');cd.querySelector('.sub b').textContent=money(c.totals.total_items,c.totals)}
  function keep(r){var n=r.headers.get('Nonce');if(n)nonce=n;return r.json()}
  function load(){return fetch(API,{credentials:'same-origin'}).then(keep).then(function(c){render(c);return c}).catch(function(){})}
  function remove(key){fetch(API+'/remove-item',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','Nonce':nonce},body:JSON.stringify({key:key})}).then(keep).then(function(c){if(c.items){render(c)}else{load()}}).catch(load)}
  function cset(o){if(!cd)return;cd.classList.toggle('open',o);cbg.classList.toggle('open',o);cd.setAttribute('aria-hidden',o?'false':'true');document.documentElement.style.overflow=o?'hidden':'';if(o){load();cd.querySelector('.x').focus()}else if(cbtn){cbtn.focus()}}
  function cart(){var r=root();if(!r||r.__cart)return;r.__cart=1;var right=r.querySelector('.scxg-right');if(!right)return;
    cbtn=document.createElement('button');cbtn.type='button';cbtn.className='scxg-cart';cbtn.setAttribute('aria-label','Cart');
    cbtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg><b hidden>0</b>';
    right.insertBefore(cbtn,right.querySelector('.scxg-burger'));
    cbg=document.createElement('div');cbg.className='scxg-cbg';
    cd=document.createElement('aside');cd.className='scxg-cd';cd.setAttribute('aria-label','Your cart');cd.setAttribute('aria-hidden','true');
    cd.innerHTML='<div class="hd"><span>Your cart</span><button class="x" type="button" aria-label="Close cart">&times;</button></div><div class="items"></div><div class="ft" hidden><div class="sub"><span>Subtotal</span><b></b></div><div class="note">Shipping and tax are shown at checkout.</div><a class="go" href="/checkout/">Checkout</a><a class="vc" href="/cart/">View full cart</a></div>';
    document.body.appendChild(cbg);document.body.appendChild(cd);
    cbtn.addEventListener('click',function(){cset(true)});cbg.addEventListener('click',function(){cset(false)});cd.querySelector('.x').addEventListener('click',function(){cset(false)});
    cd.addEventListener('click',function(e){var b=e.target.closest('.rm');if(b)remove(b.getAttribute('data-key'))});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(cd.classList.contains('open'))cset(false)}});
    load()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cart);else cart();
  /* Checkout: give the Challenge shirt-size field (registered in the Contact section) its own "Your stripe shirt" heading.
     Finds the select by id, climbs to the row that sits beside the email field, and tags it; CSS draws the heading. */
  function shirtSec(){var s=document.querySelector('select[id*="shirt-size"]');if(!s)return;var el=s;
    while(el.parentElement){if(el.parentElement.querySelector('input[type="email"]'))break;el=el.parentElement}
    if(el.parentElement){if(!el.classList.contains('scxg-shirt-sec'))el.classList.add('scxg-shirt-sec')}}
  if(document.querySelector('.wp-block-woocommerce-checkout,.wc-block-checkout')){shirtSec();new MutationObserver(function(){shirtSec()}).observe(document.body,{childList:true,subtree:true})}
  document.addEventListener('keydown',function(e){var r=root();if(e.key==='Escape'&&r&&r.classList.contains('scxg-open'))set(false)});
})();
