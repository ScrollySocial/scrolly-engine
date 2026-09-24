// Digital Products (312), Merch / Scrolly Shop (313), SEO Tools (316).
// Prices below were verified against live WooCommerce on 2026-09-21: product 58 = $59, 69 = $29, 24 = $299 (all published, in stock, purchasable).
// Merch: no public merch products exist in WooCommerce -> "coming soon", no purchase CTAs, no prices.
import { shell, img, ICON_UR, esc, productCover, endCta } from '../lib.mjs';

const mailto = (name) => `mailto:hello@scrollyseo.com?subject=${encodeURIComponent('Launch updates: ' + name)}&body=${encodeURIComponent(`Hi Scrolly, please let me know when ${name} is ready to launch. Thank you!`)}`;

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
  const tees = [['tee-earn-your-stripes.png', 'Earn Your Stripes Tee', 'Earn your stripes shirt'], ['tee-scrolly-logo.png', 'Scrolly Logo Tee', 'Scrolly logo shirt'], ['tee-more-do-less-blah.png', 'More Do. Less Blah. Tee', 'More do. Less blah. shirt'], ['tee-big-cat-energy.png', 'Big Cat Energy Tee', 'Big Cat Energy shirt']];
  const body = `
<section class="phero" style="background:var(--sand)">
 <div class="in">
  <div>
   <div class="st"><span class="pill pill-navy">Coming soon · Not open for purchase</span></div>
   <div class="eyebrow">Scrolly merch</div>
   <h1 class="disp h-xl" style="margin-top:12px">For the builders.<br><span class="it or">For the doers.</span></h1>
   <p class="lede">Public Scrolly merch is on the way. A place for everyday brand gear as you build, grow, and work toward your next goal.</p>
   <div class="actions"><a class="btn" href="#launch"><span>Get shop launch details</span></a><a class="btn btn-line" href="/challenges/"><span>Explore the Challenges</span>${ICON_UR(18)}</a></div>
  </div>
  <div class="art"><img src="${img('shirt-earned-edition.png')}" alt="Earned Edition shirt" width="454" height="347" style="border-radius:16px"></div>
 </div>
</section>
<section class="railsec" id="designs" style="padding-top:clamp(40px,5vw,64px)">
 <div class="railhd" style="justify-content:flex-start"><h2 class="disp">Design previews</h2></div>
 <div class="rail grid">${tees.map(([f, t, alt]) => `<div class="card merch"><div class="cv"><span class="soon">Coming soon</span><img src="${img(f)}" alt="${alt}" width="232" height="322" loading="lazy"></div><h3>${t}</h3><div class="sub">T-shirt design preview</div></div>`).join('')}</div>
 <p class="fine" style="margin-top:22px">These are design previews, not products for sale. Products, prices, sizes, delivery, and returns will be listed before purchase.</p>
</section>
<section class="sec lv">
 <div class="in">
  <div class="hd"><span class="eyebrow">Two distinct collections</span><h2 class="disp h-md">Wear the brand. Earn the achievement.</h2></div>
  <div class="cols c2">
   <div class="box"><h3>Public Scrolly merch</h3><p>The planned print-on-demand collection will be open to everyone when it launches. Products, prices, sizes, delivery, and returns will be listed before purchase.</p></div>
   <div class="box"><h3>Verified achievement merch</h3><p>Winner gear belongs to the Challenge achievement system. It is earned through verification under the Challenge rules and is not part of the public merchandise catalog.</p><div class="actions"><a class="ulink" href="/challenges/">Explore the Challenges ↗</a></div></div>
  </div>
 </div>
</section>
<section class="cta-end" id="launch">
 <span class="eyebrow" style="color:var(--lav)">Next up</span>
 <h2 class="disp" style="margin-top:14px">Scrolly Shop is <span class="it or">coming soon.</span></h2>
 <p>Public merch is not open for purchase yet. Request launch news by email, or use our contact form to ask a question. Products, pricing, and launch details will be confirmed before checkout opens.</p>
 <div class="actions"><a class="btn btn-pill" href="${mailto('Scrolly Shop')}"><span>Request launch news</span></a><a class="btn btn-pill btn-line" href="/contact/"><span>Contact Scrolly</span></a><a class="btn btn-pill btn-line" href="/digital-products/"><span>Browse digital products</span></a></div>
 <p class="fine" style="color:#c8d1e3;margin-top:18px;font-size:13.5px">The launch-news button opens your email app. Your request is sent only when you send the email.</p>
</section>
<div class="stripes" aria-hidden="true"></div>`;
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
