(function(){
var root=document.querySelector('.sx');if(!root)return;
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ---------- Hero slider ---------- */
var hero=root.querySelector('.sx-hero');
if(hero){
var slides=[].slice.call(hero.querySelectorAll('.sx-slide'));
var tabs=[].slice.call(hero.querySelectorAll('.sx-hero__tab'));
var bar=hero.querySelector('.sx-hero__bar');
var pauseBtn=hero.querySelector('.sx-hero__pause');
var idx=0,timer=null,userStopped=reduce,hovering=false;
function show(n,fromUser){
idx=(n+slides.length)%slides.length;
slides.forEach(function(s,i){var on=i===idx;s.classList.toggle('is-active',on);s.setAttribute('aria-hidden',on?'false':'true');if(on){s.removeAttribute('inert')}else{s.setAttribute('inert','')}});
tabs.forEach(function(t,i){t.setAttribute('aria-selected',i===idx?'true':'false');t.tabIndex=i===idx?0:-1});
hero.setAttribute('data-club',slides[idx].getAttribute('data-club'));
if(fromUser){stop(true)}
}
function tick(){if(!hovering&&!document.hidden){show(idx+1)}}
function start(){if(userStopped||timer)return;timer=setInterval(tick,7000);if(pauseBtn){pauseBtn.textContent='Pause slideshow';pauseBtn.setAttribute('aria-pressed','false')}}
function stop(byUser){clearInterval(timer);timer=null;if(byUser){userStopped=true}if(pauseBtn){pauseBtn.textContent='Play slideshow';pauseBtn.setAttribute('aria-pressed','true')}}
hero.querySelector('.sx-hero__prev').addEventListener('click',function(){show(idx-1,true)});
hero.querySelector('.sx-hero__next').addEventListener('click',function(){show(idx+1,true)});
tabs.forEach(function(t,i){t.addEventListener('click',function(){show(i,true)});t.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();show(idx+d,true);tabs[idx].focus()}})});
if(pauseBtn){pauseBtn.hidden=false;pauseBtn.addEventListener('click',function(){if(timer){stop(true)}else{userStopped=false;start()}});if(reduce){pauseBtn.textContent='Play slideshow';pauseBtn.setAttribute('aria-pressed','true')}}
hero.addEventListener('mouseenter',function(){hovering=true});hero.addEventListener('mouseleave',function(){hovering=false});
hero.addEventListener('focusin',function(){hovering=true});hero.addEventListener('focusout',function(){hovering=false});
var vp=hero.querySelector('.sx-hero__viewport'),sx0=null,sy0=null;
vp.addEventListener('touchstart',function(e){sx0=e.touches[0].clientX;sy0=e.touches[0].clientY},{passive:true});
vp.addEventListener('touchend',function(e){if(sx0===null)return;var dx=e.changedTouches[0].clientX-sx0,dy=e.changedTouches[0].clientY-sy0;sx0=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5){show(idx+(dx<0?1:-1),true)}},{passive:true});
show(0);start();
}
/* ---------- Club picker: hover / focus previews, tap to select ---------- */
var picker=root.querySelector('.sx-picker');
if(picker){
var preview=picker.querySelector('.sx-preview');
var clubs=[].slice.call(picker.querySelectorAll('.sx-club'));
var data={
'1k':{name:'$1K Club',prog:'62%',club:'/1k-club/',chal:'/1k-challenge/',cName:'$1K Challenge',shirt:'$1K tee: one stripe'},
'10k':{name:'$10K Club',prog:'62%',club:'/10k-club/',chal:'/10k-challenge/',cName:'$10K Challenge',shirt:'$10K tee: two stripes'},
'24k':{name:'$24K Club',prog:'62%',club:'/24k-club/',chal:'/24k-challenge/',cName:'$24K Challenge',shirt:'$24K tee: three stripes'}
};
var sel='1k',shown=null;
var fill=picker.querySelector('.sx-prog__fill'),track=picker.querySelector('.sx-prog__track');
var nameEl=picker.querySelector('.sx-preview__name'),cta=picker.querySelector('.sx-preview__club'),cta2=picker.querySelector('.sx-preview__chal');
function apply(k){
if(shown===k)return;shown=k;var d=data[k];
picker.setAttribute('data-club',k);preview.setAttribute('data-club',k);
nameEl.textContent='Previewing '+d.name;
cta.querySelector('span').textContent='Visit '+d.name;cta.setAttribute('href',d.club);
cta2.querySelector('span').textContent=d.cName;cta2.setAttribute('href',d.chal);
preview.querySelector('svg').setAttribute('aria-label',d.shirt);
}
function select(k){
sel=k;clubs.forEach(function(c){c.classList.toggle('is-sel',c.getAttribute('data-club')===k)});apply(k)}
var canHover=function(){return window.matchMedia('(hover:hover) and (pointer:fine)').matches};
clubs.forEach(function(c){
var k=c.getAttribute('data-club'),link=c.querySelector('.sx-club__pick');
c.addEventListener('mouseenter',function(){if(canHover())apply(k)});
c.addEventListener('mouseleave',function(){if(canHover())apply(sel)});
c.addEventListener('focusin',function(){apply(k)});
c.addEventListener('focusout',function(e){if(!c.contains(e.relatedTarget)){apply(sel)}});
/* Mouse/keyboard: the tile is a normal link, so click/Enter visits the club. Touch: first tap previews, tapping the selected tile (or the Visit button) goes. */
link.addEventListener('click',function(e){
if(canHover()||sel===k)return;
e.preventDefault();select(k);
var r=preview.getBoundingClientRect();
if(window.matchMedia('(max-width:1000px)').matches&&(r.top<0||r.bottom>window.innerHeight)){preview.scrollIntoView({behavior:reduce?'auto':'smooth',block:'nearest'})}
});
});
select('1k');
}
/* ---------- Goal calculator ---------- */
var calc=root.querySelector('.sx-calc__card');
if(calc){
var g=calc.querySelector('#sx-goal'),a=calc.querySelector('#sx-avg'),t=calc.querySelector('#sx-days');
var big=calc.querySelector('.sx-calc__big'),per=calc.querySelector('.sx-calc__per');
function num(el){return parseFloat(String(el.value).replace(/[^0-9.]/g,''))||0}
function fmt(n){return n.toLocaleString('en-US')}
function run(){
var goal=num(g),avg=num(a),days=parseInt(t.value,10);
if(goal>0&&avg>0){var n=Math.ceil(goal/avg);big.textContent=fmt(n);var p=Math.ceil(n/days*10)/10;per.textContent='About '+(p%1===0?p:p.toFixed(1))+' per day over '+days+' days'}
else{big.textContent='–';per.textContent='Enter a goal and an average sale amount'}
}
[g,a].forEach(function(el){el.addEventListener('input',run)});t.addEventListener('change',run);run();
}
})();
