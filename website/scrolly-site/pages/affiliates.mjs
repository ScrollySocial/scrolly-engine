// Chat Manager affiliate pages (2026-11-02): sign-up 2090, account 2091, terms 2092. SliceWP free renders the forms
// and the account dashboard from its shortcodes. Same restrained reading layout as pages/legal.mjs.
// Copy source: vault products/chat-manager/affiliate-launch-copy.md (decisions in affiliate-program.md).
import { s3shell } from '../lib.mjs';

const CSS = `
.s3 .af-h1{font-size:var(--s3-fs-h2)!important;line-height:1.02!important;letter-spacing:-.035em!important}
.s3 .af-head .s3-lede{margin-top:22px}
.s3 .af-body{margin-top:clamp(40px,5vw,64px)}
.s3 .af-body table{width:100%;border-collapse:collapse;margin:16px 0 8px}
.s3 .af-body th,.s3 .af-body td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--s3-line)}
.s3 .af-form{margin-top:clamp(40px,5vw,64px);padding-top:clamp(40px,5vw,64px);border-top:1px solid var(--s3-line)}
.s3 .af-form h2{font:400 var(--s3-fs-h3)/1.08 var(--s3-serif)!important}
.s3 .af-form>p{margin-top:12px}
.s3 .slicewp-field-wrapper{margin-top:18px}
.s3 .slicewp-field-wrapper input,.s3 .slicewp-field-wrapper textarea,.s3 .slicewp-field-wrapper select{font-size:16px;max-width:100%}
`;

// Shortcodes must stay on their own lines, so they are put back after s3shell collapses newlines.
function page(key, id, title, html) {
  const keep = [];
  html = html.replace(/\[slicewp_[a-z_]+\]/g, (sc) => { keep.push(sc); return `@@SC${keep.length - 1}@@`; });
  const out = s3shell(html, CSS).replace(/@@SC(\d+)@@/g, (_, i) => `\n${keep[Number(i)]}\n`);
  return { key, id, title, meta: { _elementor_edit_mode: '' }, html: out };
}

const head = (h1, lede) => `<header class="af-head"><h1 class="af-h1">${h1}</h1><p class="s3-lede">${lede}</p></header>`;
const wrap = (inner) => `<article class="af s3-sec tight"><div class="s3-read">${inner}</div></article>`;

const signup = wrap(`${head('Earn with Chat Manager', 'Already using Chat Manager? Share it with people who want their comments turned into DMs and earn on every sale.')}
<div class="s3-prose af-body">
<h2>How it works</h2>
<table><thead><tr><th>Your sales</th><th>You earn per sale</th></tr></thead>
<tbody><tr><td>1st and 2nd sale</td><td>$30</td></tr><tr><td>3rd sale onward</td><td>$40</td></tr></tbody></table>
<ul>
<li>A sale counts when someone buys within 60 days of clicking your link.</li>
<li>Each commission is held for 30 days, then paid by PayPal in the monthly payout once you've earned $30.</li>
<li>The program is open to Chat Manager buyers. Mercedes reviews every application by hand.</li>
</ul>
<p>Read the <a href="/affiliate-terms/">Affiliate Terms</a> before you apply. Already an affiliate? <a href="/affiliate-account/">Go to your account</a>.</p>
</div>
<section class="af-form" aria-labelledby="af-apply"><h2 id="af-apply">Apply</h2><p>Use the email you bought Chat Manager with, so we can match your order.</p>
[slicewp_affiliate_registration]
</section>`);

const account = wrap(`${head('Your affiliate account', 'Your link, visits, sales and payouts.')}
<div class="af-body">
[slicewp_affiliate_account]
</div>`);

const terms = wrap(`${head('Chat Manager Affiliate Terms', 'Effective November 2, 2026. These terms cover the Chat Manager affiliate program run by The Ambition Department (theambitiondepartment.com). By applying you agree to them.')}
<div class="s3-prose af-body">
<h2>Who can join</h2>
<p>The program is open to people who have bought Chat Manager. We review every application and may decline any.</p>
<h2>What you earn</h2>
<table><thead><tr><th>Your sales</th><th>Commission per sale</th></tr></thead>
<tbody><tr><td>1st and 2nd sale</td><td>$30</td></tr><tr><td>3rd sale onward</td><td>$40</td></tr></tbody></table>
<p>Commissions are a fixed dollar amount per Chat Manager order. We may change the rates with email notice; a change never lowers a commission you have already earned.</p>
<h2>How a sale is credited to you</h2>
<ul>
<li>Someone clicks your affiliate link and buys Chat Manager within 60 days.</li>
<li>If they click more than one affiliate's link, the last link they clicked gets the sale.</li>
<li>Buying through your own link earns nothing.</li>
<li>Tracking uses a browser cookie, so a sale can be missed when the buyer blocks cookies, switches device or clears their browser. We can't add sales by hand.</li>
</ul>
<h2>When you get paid</h2>
<ul>
<li>A commission counts once the order is complete.</li>
<li>Each commission is held for 30 days, then paid in our monthly PayPal payout once your balance reaches $30. A smaller balance carries over to the next month.</li>
<li>We pay to the PayPal email in your affiliate account. Keep it up to date.</li>
<li>If an order is refunded or disputed, its commission is removed. If it was already paid, we take it off your next payout.</li>
</ul>
<h2>How to tell people (required by law in the US)</h2>
<p>When you share your link, say clearly and close to the link that you earn money when someone buys. For example: "I get a commission if you buy through my link." In a video, say it out loud and also put it next to the link in the description. "Affiliate link" on its own isn't clear enough to many people.</p>
<h2>Not allowed</h2>
<ul>
<li>Bidding on "Chat Manager", "The Ambition Department" or similar names in ads.</li>
<li>Posting your link or codes on coupon or deal sites.</li>
<li>Promising income or results ("make $X with this").</li>
<li>Spam: unwanted DMs, comments or emails.</li>
<li>Speaking as The Ambition Department or suggesting you work for us.</li>
<li>Sharing, reselling or giving away the Chat Manager files. Your buyer licence still applies.</li>
</ul>
<p>We may withhold commissions earned by breaking these rules and close the account.</p>
<h2>Taxes</h2>
<p>You are responsible for taxes on your commissions. Before your first payout, US affiliates send us a W-9 and affiliates outside the US send a W-8BEN. You join as an independent partner, not an employee.</p>
<h2>Ending</h2>
<p>You can leave at any time from your affiliate account or by email. We can end the program or your account with email notice. Commissions you earned under these terms are still paid, unless they came from breaking them.</p>
<h2>Changes</h2>
<p>We'll email you before these terms change. Staying in the program after the change means you accept it.</p>
<p>Questions: reply to any affiliate email, or use the <a href="/contact/">contact page</a>.</p>
</div>`);

export function buildAll() {
  return [
    page('affiliates', 2090, 'Earn with Chat Manager', signup),
    page('affiliate-account', 2091, 'Affiliate Account', account),
    page('affiliate-terms', 2092, 'Affiliate Terms', terms),
  ];
}
