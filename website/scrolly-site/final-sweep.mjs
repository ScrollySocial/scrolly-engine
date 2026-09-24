const pages = ['', '1k-club', '10k-club', '24k-club', '1k-challenge', '10k-challenge', '24k-challenge', 'clubs', 'challenges', 'digital-products', 'scrolly-shop', 'seo-tools', 'seo-site-audit', 'shopify-seo-workbook', 'pinterest-seo-workbook', 'implementation', 'about', 'contact', 'accessibility', 'privacy', 'terms', 'refund', 'cart', 'my-account'];
for (const p of pages) {
  await new Promise((r) => setTimeout(r, 1500));
  const r = await fetch(`https://scrollyseo.com/${p}${p ? '/' : ''}?nocache=${Date.now()}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const h = await r.text();
  const n = (re) => (h.match(re) || []).length;
  console.log(String(r.status), ('/' + p).padEnd(26), 'hdr', n(/<header class="hdr"/g), 'ftr', n(/<footer class="ftr"/g), 'css', n(/id="scx-css"/g), 'oldShell', n(/scrolly-shared-shell-v1|scrolly-launch-system/g), 'leak', n(/!important[^<]{0,3}<\/p>/g));
}
