// Digital Products (312), Merch / Scrolly Shop (313), SEO Tools (316).
// Prices below were verified against live WooCommerce on 2026-09-21: product 58 = $59, 69 = $29, 24 = $299 (all published, in stock, purchasable).
// Merch (2026-09-24): six public Printify tees are live; cards come from live WooCommerce via shop-data.mjs.
import { shell, img, ICON_UR, esc, productCover, endCta, merchCards } from '../lib.mjs';
import { merch, CATS } from '../shop-data.mjs';


const PRODUCTS = {
  shopify: { id: 58, name: 'Shopify SEO Workbook', kind: 'shopify', price: '$59', tag: 'For your online store', blurb: 'Research keywords, organize your store, improve product pages, and build a practical SEO plan.', page: '/shopify-seo-workbook/' },
  pinterest: { id: 69, name: 'Pinterest SEO Workbook', kind: 'pinterest', price: '$29', tag: 'For visual discovery', blurb: 'Turn audience research into an intentional keyword, board, Pin, and publishing system.', page: '/pinterest-seo-workbook/' },
  audit: { id: 24, name: 'SEO Site Audit', kind: 'audit', price: '$299', tag: 'Understand your priorities', blurb: 'Explore a personalized analysis of your site and a prioritized roadmap for what to improve.', page: '/seo-site-audit/' },
};
const cover = (p) => productCover(p.kind, p.name.toUpperCase().replace('SEO ', 'SEO<br>').replace(' WORKBOOK', '<br>WORKBOOK').replace(' SITE AUDIT', '<br>SITE AUDIT'));
const productBox = (p, { buy = true } = {}) => `<article class="box pbox"><div class="pcv" style="background:${{ shopify: '#eafaf7', pinterest: '#efeaff', audit: '#fff0e8' }[p.kind]}">${cover(p)}</div><span class="pill" style="align-self:flex-start">${p.tag}</span><h3>${p.name}</h3><p>${p.blurb}</p><div class="pr">${p.price}</div><div class="actions"><a class="btn btn-pill btn-navy" href="${p.page}"><span>View details</span></a>${buy ? `<a class="btn btn-pill" href="/?add-to-cart=${p.id}"><span>Add to cart</span></a>` : ''}</div></article>`;

const EXTRA_CSS = `<style>.scx .pbox .pcv{display:flex;align-items:center;justify-content:center;border-radius:12px;padding:26px 0;margin-bottom:6px}.scx .pbox{box-shadow:6px 6px 0 var(--black)}.scx .pbox .pr{margin-top:auto}.scx .pbox .actions{margin-top:6px;padding-top:0}.scx .pbox .btn{min-height:50px;padding:0 20px;font-size:18.7px}</style>`;

function digital() {
  const body = `${EXTRA_CSS}
<section class="phero">
 <div class="in">
  <div>
   <div class="eyebrow">Scrolly digital products</div>
   <h1 class="disp h-xl" style="margin-top:12px">Good tools.<br><span class="it or">Useful next steps.</span></h1>
   <p class="lede">Practical workbooks to help you research, plan, and improve how customers discover your business.</p>
   <div class="actions"><a class="btn" href="#workbooks"><span>Browse the workbooks</span>${ICON_UR(20)}</a></div>
   <p class="fine">Revenue figures are goals, not guaranteed results.</p>
  </div>
  <div class="art"><img src="${img('tiger-stride.png')}" alt="" width="1774" height="887"></div>
 </div>
</section>
<section class="sec lv" id="workbooks">
 <div class="in">
  <div class="hd"><span class="eyebrow">The workbook collection</span><h2 class="disp h-md">Choose the platform you want to grow.</h2><p>Explore each workbook for its contents, current price, and purchase details.</p></div>
  <div class="cols c2" style="max-width:920px">${productBox(PRODUCTS.shopify)}${productBox(PRODUCTS.pinterest)}</div>
 </div>
</section>
<section class="sec cr">
 <div class="in split">
  <div><span class="eyebrow or">Need a closer look?</span><h2 class="disp h-md" style="margin-top:12px">Get help with your next SEO priority.</h2><p style="margin-top:16px;font-size:19px;line-height:1.4;font-weight:500">The SEO Site Audit and Implementation services sit alongside our workbooks.</p><div class="actions" style="margin-top:22px"><a class="btn btn-pill btn-navy" href="/seo-tools/"><span>Explore SEO tools</span></a></div></div>
  <div style="max-width:420px;width:100%;margin:0 auto">${productBox(PRODUCTS.audit, { buy: true })}</div>
 </div>
</section>
${endCta({ btn: 'Explore Clubs + Challenges' })}`;
  return { key: 'digital-products', id: 312, title: 'Digital products — Scrolly', html: shell(body) };
}

function shop() {
  const hero = merch.find((p) => p.name === 'Goal Digger') || merch[0];
  const body = `
<section class="phero" style="background:var(--sand)">
 <div class="in">
  <div>
   <div class="eyebrow">Scrolly merch</div>
   <h1 class="disp h-xl" style="margin-top:12px">For the builders.<br><span class="it">For the doers.</span></h1>
   <p class="lede">Tees printed to order. Free shipping in the US.</p>
   <div class="actions"><a class="btn btn-pill btn-navy" href="#tees"><span>Shop the tees</span></a></div>
  </div>
  <div class="art"><img src="${hero.image.src}" alt="${esc(hero.name)} t-shirt" width="${hero.image.w}" height="${hero.image.h}" style="border-radius:16px"></div>
 </div>
</section>
<section class="railsec" id="tees" style="padding-top:clamp(40px,5vw,64px)">
 <div class="railhd" style="justify-content:flex-start"><h2 class="disp">The tees</h2></div>
 <div class="rail grid" data-live="${CATS.merch}" data-live-kind="merch">${merchCards(merch)}</div>
 <p class="fine" style="margin-top:22px">Free US shipping. International shipping is added at checkout.</p>
</section>
<section class="sec lv">
 <div class="in">
  <div class="hd"><h2 class="disp h-md">Wear the brand. Earn the stripe.</h2></div>
  <div class="cols c2">
   <div class="box" style="border:0;box-shadow:none"><h3>Scrolly tees</h3><p>Open to everyone.</p></div>
   <div class="box" style="border:0;box-shadow:none"><h3>Challenge stripe shirts</h3><p>Earned by hitting a verified Challenge goal. Not sold here.</p><div class="actions"><a class="ulink" href="/challenges/">Explore the Challenges ↗</a></div></div>
  </div>
 </div>
</section>
${endCta()}`;
  return { key: 'scrolly-shop', id: 313, title: 'Scrolly merch', html: shell(body) };
}

function seoTools() {
  const body = `${EXTRA_CSS}
<section class="phero">
 <div class="in">
  <div>
   <div class="eyebrow">SEO tools &amp; services</div>
   <h1 class="disp h-xl" style="margin-top:12px">Be easier<br><span class="it or">to discover.</span></h1>
   <p class="lede">SEO is one part of organic growth. Keep moving with a site audit, implementation help, or a practical platform workbook.</p>
   <div class="actions"><a class="btn" href="#tools"><span>Explore the tools</span>${ICON_UR(20)}</a></div>
  </div>
  <div class="art"><img src="${img('tiger-hero.png')}" alt="" width="638" height="418" style="border-radius:16px"></div>
 </div>
</section>
<section class="sec pe" id="tools">
 <div class="in">
  <div class="hd"><span class="eyebrow">Find the right support</span><h2 class="disp h-md">A focused plan for your search presence.</h2></div>
  <div class="cols c2" style="max-width:920px">
   ${productBox(PRODUCTS.audit)}
   <article class="box pbox"><div class="pcv" style="background:#ffeaf1">${productCover('impl', 'IMPLEMENT<br>ATION')}</div><span class="pill pill-navy" style="align-self:flex-start">Coming soon</span><h3>Implementation</h3><p>Support for turning approved recommendations into real website changes. Still in development — join the early-access list to hear when it is ready.</p><div class="actions"><a class="btn btn-pill btn-navy" href="/implementation/"><span>View Implementation</span></a></div></article>
  </div>
 </div>
</section>
<section class="sec lv">
 <div class="in">
  <div class="hd"><span class="eyebrow">Prefer to work through it yourself?</span><h2 class="disp h-md">Build with a workbook.</h2><p>Choose Shopify or Pinterest.</p></div>
  <div class="cols c2" style="max-width:920px">${productBox(PRODUCTS.shopify)}${productBox(PRODUCTS.pinterest)}</div>
 </div>
</section>
${endCta({ btn: 'Explore Clubs + Challenges' })}`;
  return { key: 'seo-tools', id: 316, title: 'SEO tools & services — Scrolly', html: shell(body) };
}

export function buildAll() {
  return [digital(), shop(), seoTools()];
}
