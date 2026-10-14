// Build the My Account $1K snippet: bundle the reused Club logic, inline it into the PHP template.
// Output (never touches the live snippet file):
//   dist/k1-app.js                  the bundled logic (IIFE)
//   dist/my-account-1k-tabs.php     ready-to-paste WPCode snippet
//   dist/preview.html               local visual check: the 5 harness businesses rendered with the snippet's CSS
// Run: node automation/k1-launch/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, 'dist');
fs.mkdirSync(dist, { recursive: true });

execSync(`npx --yes esbuild@0.28.2 "${path.join(here, 'src', 'k1-entry.mjs')}" --bundle --format=iife --minify --target=es2019 --legal-comments=none --outfile="${path.join(dist, 'k1-app.js')}"`, { stdio: 'inherit' });
const js = fs.readFileSync(path.join(dist, 'k1-app.js'), 'utf8').trim();
if (/<\/script/i.test(js)) throw new Error('bundle contains </script, cannot inline');
if (/^K1JS;?$/m.test(js)) throw new Error('bundle contains the PHP nowdoc terminator');

// The My $1K Plan calculator is its own small bundle: it also runs on the Club-only view, which doesn't load the plan bundle.
execSync(`npx --yes esbuild@0.28.2 "${path.join(here, 'src', 'calc-entry.mjs')}" --bundle --format=iife --minify --target=es2019 --legal-comments=none --outfile="${path.join(dist, 'k1-calc.js')}"`, { stdio: 'inherit' });
const calcJs = fs.readFileSync(path.join(dist, 'k1-calc.js'), 'utf8').trim();
if (/<\/script/i.test(calcJs)) throw new Error('calc bundle contains </script, cannot inline');
if (/^K1CALC;?$/m.test(calcJs)) throw new Error('calc bundle contains the PHP nowdoc terminator');

const template = fs.readFileSync(path.join(here, 'php', 'my-account-1k-tabs.template.php'), 'utf8');
const placeholder = /^__K1_APP_JS__$/m; // only the placeholder line inside the nowdoc, never a mention in a comment
if ((template.match(/^__K1_APP_JS__$/gm) || []).length !== 1) throw new Error('template must contain exactly one __K1_APP_JS__ line');
if ((template.match(/^__K1_CALC_JS__$/gm) || []).length !== 1) throw new Error('template must contain exactly one __K1_CALC_JS__ line');
fs.writeFileSync(path.join(dist, 'my-account-1k-tabs.php'), template.replace(placeholder, () => js).replace(/^__K1_CALC_JS__$/m, () => calcJs));

// Preview: the live member styles (global chrome CSS: v3 tokens + k1-account.css, as install-chrome.mjs publishes them) + the 5 harness businesses.
const chromeDir = path.join(here, '..', '..', 'website', 'scrolly-site', 'chrome');
const css = ['v3.css', 'k1-account.css'].map((f) => fs.readFileSync(path.join(chromeDir, f), 'utf8')).join('\n');
const businesses = [
  { business: 'Fix-It Frank', route: 'services', stage: 'C', offer: 'Home repair jobs', price: 250, audience: 'Homeowners in town', where: 'phone', channel: 'instagram', found: ['referral', 'facebook'], revenue: 600, closePct: '', reviews: '', emailList: '' },
  { business: 'Ops Clarity', route: 'services', stage: 'B', offer: 'Operations audit', price: 500, audience: 'Agency owners', where: 'booking', channel: 'linkedin', found: ['linkedin'], revenue: '', closePct: '', reviews: '', emailList: '' },
  { business: 'Paw Tees', route: 'marketplace_first', stage: 'C', offer: 'Dog-lover T-shirts', price: 28, audience: 'Dog owners', where: 'etsy', channel: 'instagram', found: ['marketplace_search', 'instagram'], revenue: 300, closePct: '', reviews: '', emailList: '' },
  { business: 'Plan Pretty', route: 'digital_product', stage: 'B', offer: 'Notion budget template', price: 25, audience: 'Young professionals', where: 'own_site', channel: 'instagram', found: [], revenue: '', closePct: '', reviews: '', emailList: '' },
  { business: 'Golden Hour Studio', route: 'services', stage: 'C', offer: 'Family and portrait sessions', price: 350, audience: 'Local families', where: 'booking', channel: 'instagram', found: ['instagram', 'referral'], revenue: 700, closePct: '', reviews: '', emailList: '' },
];
// Two sample weekly check-ins per business (stored-record shape, as PHP saves them): week 1 = reach but no
// interest; week 2 = interest and one sale. Funnel values are filled by position (the sale stage comes from "sales").
const sampleReviews = (b) => [
  { periodStart: '2026-09-21', periodEnd: '2026-09-27', actions: ['published_content'], created: 4, distributed: 10, rev: 0, sales: 0, cap: 'no', attr: 'unknown', note: '', vals: [900, 0, 0], snapshot: b },
  { periodStart: '2026-09-28', periodEnd: '2026-10-04', actions: ['published_content', 'changed_cta'], created: 5, distributed: 13, rev: b.price, sales: 1, cap: 'no', attr: 'partially_known', note: '', vals: [1400, 9, 3], snapshot: b },
];
const blocks = businesses.map((b, i) => `<h1 style="font:800 20px Arial;margin:32px 0 12px">Test business ${i + 1}: ${b.business}</h1><div class="k1a k1v3" id="p${i}"></div>`).join('');
fs.writeFileSync(path.join(dist, 'preview.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My $1K Plan Preview</title>
<style>body{margin:0;background:#f7f3ec}main{max-width:820px;margin:0 auto;padding:16px}${css}</style></head><body><main>${blocks}</main>
<script>${js}</script><script>
var B=${JSON.stringify(businesses)}, R=${JSON.stringify(businesses.map(sampleReviews))};
var C=[{started:true,day:9,revenue:250},{started:true,day:10,revenue:500},{started:true,day:16,revenue:532},{started:true,day:8,revenue:175},{started:true,day:12,revenue:700}];
B.forEach(function(b,i){var el=document.getElementById('p'+i);try{
  var recs=R[i].map(function(r){var labels=ScrollyK1.checkInMetricsForSaved(b).map(function(m){return m.label});r.metrics=labels.slice(0,-1).map(function(l,j){return {label:l,value:r.vals[j]}});return r});
  var d=recs.map(function(r){return {rec:r,d:ScrollyK1.diagnoseRecord(r)}});
  var pv=ScrollyK1.computePlanView(b), w1=d[0];
  el.innerHTML='<p><b>This Week before any check-in (from the Plan):</b></p>'+ScrollyK1.renderThisWeek(ScrollyK1.computeThisWeek(b,pv,null,C[i],'Do your first check-in at the end of your first week.'),'#')
    +'<p><b>My $1K Plan:</b></p>'+ScrollyK1.renderPlan(pv)
    +'<p><b>Check-in result (week 1: reach, no interest), with goal gap:</b></p>'+ScrollyK1.renderReviewResult(w1.rec,w1.d,ScrollyK1.computeGoalGap(b,C[i]))
    +'<p><b>This Week after that check-in:</b></p>'+ScrollyK1.renderThisWeek(ScrollyK1.computeThisWeek(b,pv,w1,C[i],'Next check-in: Sunday, Oct 4.'),'#');
}catch(e){el.textContent='ERROR: '+e.message}});
</script></body></html>`);

console.log(`bundle ${(js.length / 1024).toFixed(1)} KB -> dist/my-account-1k-tabs.php, dist/preview.html`);
