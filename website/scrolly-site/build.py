#!/usr/bin/env python3
"""Builds WordPress-ready page fragments (dist/*.wp.html) plus local preview pages
(dist/preview-*.html) from src/. Fragments are self-contained: scoped CSS, inline JS,
absolute media URLs from media-map.json. Run: python website/scrolly-site/build.py"""
import json, re, pathlib

HERE = pathlib.Path(__file__).parent
SRC, DIST = HERE / 'src', HERE / 'dist'
DIST.mkdir(exist_ok=True)
M = {k: v['url'] for k, v in json.load(open(HERE / 'media-map.json')).items()}
UP = 'https://scrollyseo.com/wp-content/uploads/2026/08/'

ARROW = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" aria-hidden="true"><path d="M3 15L15 3M6 3h9v9"/></svg>'
CHEV_L = '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" aria-hidden="true"><path d="M14 4L7 11l7 7"/></svg>'
CHEV_R = '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" aria-hidden="true"><path d="M8 4l7 7-7 7"/></svg>'

CLUBS = [
    dict(k='1k', amt='$1K', tag='Prove it.', tag_html='Prove it.', stripes=1,
         desc='Make your first consistent $1K/month using organic marketing.'),
    dict(k='10k', amt='$10K', tag='Make it your living.', tag_html='Make it<br>your living.', stripes=2,
         desc='Reach consistent $10K profit months using organic marketing.'),
    dict(k='24k', amt='$24K', tag='Scale it.', tag_html='Scale it.', stripes=3,
         desc='Grow to $24K profit months using paid advertising for the next level.'),
]

# ---------- Shirt preview (vector so the fill color can follow the club) ----------
STRIPE_FILL = ['#ff6338', '#ffc233', '#735cff']
def tee_art(c):
    # Custom artwork: drop src/shirt-art/<1k|10k|24k>.svg or .png (transparent bg, ~square) and it replaces the placeholder art.
    import base64
    for ext, mime in (('svg', 'image/svg+xml'), ('png', 'image/png')):
        f = SRC / 'shirt-art' / f"{c['k']}.{ext}"
        if f.exists():
            uri = f'data:{mime};base64,' + base64.b64encode(f.read_bytes()).decode()
            return f'<g class="sx-tee-art" data-art="{c["k"]}"><image href="{uri}" x="110" y="80" width="180" height="230" preserveAspectRatio="xMidYMid meet"/></g>'
    lines = {'1k': ['PROVE IT.'], '10k': ['MAKE IT', 'YOUR LIVING.'], '24k': ['SCALE IT.']}[c['k']]
    size = 26 if len(lines) == 1 else 22
    txt = ''.join(f'<text x="200" y="{236 + i * (size + 4)}" text-anchor="middle" font-size="{size}" letter-spacing="1">{l}</text>' for i, l in enumerate(lines))
    y0 = 236 + (len(lines) - 1) * (size + 4) + 18
    bars = ''.join(f'<rect x="132" y="{y0 + i * 16}" width="136" height="9" fill="{STRIPE_FILL[i]}" transform="skewX(-12) translate({(y0 + i * 16) * 0.2126},0)"/>' for i in range(c['stripes']))
    return (f'<g class="sx-tee-art" data-art="{c["k"]}" font-family="Archivo,sans-serif" font-weight="900" fill="#08152c">'
            f'<text x="200" y="196" text-anchor="middle" font-size="76" letter-spacing="-3">{c["amt"]}</text>{txt}{bars}</g>')

TEE = ('<svg class="sx-preview__shirt" viewBox="0 0 400 420" role="img" aria-label="$1K tee: one stripe">'
       '<defs><linearGradient id="sxsh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#08152c" stop-opacity=".14"/><stop offset=".22" stop-color="#08152c" stop-opacity="0"/><stop offset=".78" stop-color="#08152c" stop-opacity="0"/><stop offset="1" stop-color="#08152c" stop-opacity=".16"/></linearGradient></defs>'
       '<path class="sx-tee" d="M130 24C150 42 170 50 200 50C230 50 250 42 270 24L340 52L392 128L340 160L308 138L308 396Q308 404 300 404L100 404Q92 404 92 396L92 138L60 160L8 128L60 52Z"/>'
       '<path d="M130 24C150 42 170 50 200 50C230 50 250 42 270 24L340 52L392 128L340 160L308 138L308 396Q308 404 300 404L100 404Q92 404 92 396L92 138L60 160L8 128L60 52Z" fill="url(#sxsh)"/>'
       '<path d="M92 138L60 52M308 138L340 52" stroke="#08152c" stroke-opacity=".16" stroke-width="2" fill="none"/>'
       '<path d="M130 24C150 66 250 66 270 24C255 46 145 46 130 24Z" fill="#08152c" fill-opacity=".28"/>'
       '<path d="M130 24C150 42 170 50 200 50C230 50 250 42 270 24" fill="none" stroke="#08152c" stroke-opacity=".3" stroke-width="3"/>'
       + ''.join(tee_art(c) for c in CLUBS) + '</svg>')

# ---------- Homepage ----------
def slide(i, c):
    h_tag = 'h1' if i == 0 else 'h2'
    stripes = ''.join(f'<i class="{"on" if n < c["stripes"] else ""}"></i>' for n in range(3))
    return f'''<div class="sx-slide{' is-active' if i == 0 else ''}" data-club="{c['k']}" role="group" aria-roledescription="slide" aria-label="{i + 1} of 3: {c['amt']}">
<div class="sx-slide__copy">
<p class="sx-slide__eyebrow"><span class="sx-chip">{c['amt']} Club</span><span>{c['tag']}</span></p>
<{h_tag} class="sx-slide__h">I want to <em>make {c['amt']}</em></{h_tag}>
<p class="sx-slide__sub">{c['desc']}</p>
<a class="btn sx-slide__cta" href="/{c['k']}-club/">Show me how {ARROW}</a>
<p class="sx-fine sx-slide__fine">Revenue figures are goals, not guaranteed results.</p>
</div>
<div class="sx-slide__art" aria-hidden="true">
<span class="sx-art__label">Goal {i + 1} of 3</span>
<span class="sx-art__amt">{c['amt']}</span>
<span class="sx-art__tag">{c['tag_html']}</span>
<span class="sx-art__earned">{stripes}</span>
</div>
</div>'''

def club_card(i, c):
    # The tile body is a real link to the club page (click = visit). On touch devices home.js turns the first tap into a preview.
    return f'''<article class="sx-club{' is-sel' if i == 0 else ''}" data-club="{c['k']}">
<a class="sx-club__pick" href="/{c['k']}-club/">
<span class="sx-club__amt">{c['amt']}</span>
<span><span class="sx-club__tag">{c['tag_html']}</span><span class="sx-club__desc">{c['desc']}</span></span>
<span class="sx-club__go">{c['amt']} Club {ARROW}</span>
</a>
<div class="sx-club__links"><a href="/{c['k']}-challenge/">{c['amt']} Challenge ↗</a></div>
</article>'''

STEPS = ['01 Start', '02 Build', '03 Progress', '04 Verify', '05 Stripe earned']
def steps(now=2):
    return ''.join(f'<li{" class=is-now" if i == now else ""}>{s}</li>' for i, s in enumerate(STEPS))

def product_card(href, img, alt, name, sub, tee=False):
    cls = 'sx-card__img sx-card__img--tee' if tee else 'sx-card__img'
    return f'<a class="sx-card" href="{href}"><span class="{cls}"><img src="{img}" alt="{alt}" loading="lazy"></span><span class="sx-card__name">{name}</span><span class="sx-card__sub">{sub}</span></a>'

def home_body():
    slides = ''.join(slide(i, c) for i, c in enumerate(CLUBS))
    tabs = ''.join(f'<button type="button" class="sx-hero__tab" role="tab" aria-selected="{"true" if i == 0 else "false"}" data-club="{c["k"]}">{c["amt"]}</button>' for i, c in enumerate(CLUBS))
    cards = ''.join(club_card(i, c) for i, c in enumerate(CLUBS))
    tees = ''.join(product_card('/scrolly-shop/', M[f], a, n, 'T-shirt · Coming soon', True) for f, a, n in [
        ('tee-earn-your-stripes.png', 'Earn Your Stripes tee', 'Earn Your Stripes Tee'),
        ('tee-scrolly-logo.png', 'Scrolly logo tee', 'Scrolly Logo Tee'),
        ('tee-more-do-less-blah.png', 'More do. Less blah. tee', 'More Do. Less Blah. Tee'),
        ('tee-big-cat-energy.png', 'Big Cat Energy tee', 'Big Cat Energy Tee')])
    return f'''<div class="sx">
<section class="sx-hero" data-club="1k" aria-roledescription="carousel" aria-label="Choose a revenue goal">
<div class="sx-hero__viewport" aria-live="off">{slides}</div>
<div class="sx-hero__bar">
<button type="button" class="sx-hero__nav sx-hero__prev" aria-label="Previous goal">{CHEV_L}</button>
<div class="sx-hero__tabs" role="tablist" aria-label="Choose a goal">{tabs}</div>
<button type="button" class="sx-hero__nav sx-hero__next" aria-label="Next goal">{CHEV_R}</button>
<button type="button" class="sx-hero__pause" aria-pressed="false" hidden>Pause slideshow</button>
</div>
</section>
<div class="sx-stripes-rule" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
<section class="sx-picker sx-navy" id="clubs" data-club="1k" aria-labelledby="sx-picker-h">
<div class="sx-wrap">
<div class="sx-picker__top">
<h2 class="sx-picker__title" id="sx-picker-h">Choose your challenge<small>One stripe at a time.</small></h2>
<p class="sx-picker__hint">Hover a goal to preview its progress bar and shirt, then click to visit its Club. On a phone, tap to preview and tap again to go.</p>
</div>
<div class="sx-picker__grid">
<div class="sx-clubs">{cards}</div>
<aside class="sx-preview" id="sx-preview" data-club="1k" aria-live="polite">
{TEE}
<p class="sx-preview__name">Previewing $1K Club</p>
<div class="sx-prog" style="--pct:62%">
<div class="sx-prog__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="62" aria-label="Example progress toward goal"><span class="sx-prog__fill"></span></div>
<ol class="sx-prog__steps">{steps()}</ol>
<div class="sx-preview__meta"><span class="sx-prog__num">62%</span><span class="sx-prog__cap">towards goal</span></div>
<p class="sx-prog__note">Example progress. Progress tracking is coming with the Clubs.</p>
</div>
<div class="sx-preview__cta">
<a class="btn btn--club sx-preview__club" href="/1k-club/"><span>Visit $1K Club</span> {ARROW}</a>
<a class="btn btn--ghost sx-preview__chal" href="/1k-challenge/"><span>$1K Challenge</span> {ARROW}</a>
</div>
</aside>
</div>
<p class="sx-fine" style="color:rgba(255,255,255,.7);margin-top:28px">Revenue figures are goals, not guaranteed results.</p>
</div>
</section>
<section class="sx-earned" id="merch" aria-labelledby="sx-earned-h">
<div class="sx-wrap sx-earned__grid">
<div>
<p class="sx-earned__k">Some things can’t be bought.</p>
<h2 class="sx-earned__h" id="sx-earned-h">They’re earned</h2>
<a class="btn" href="/challenges/">See how to earn yours {ARROW}</a>
</div>
<div class="sx-earned__shirt">
<img src="{M['shirt-earned-edition.png']}" alt="Earned Edition shirt with an illustrated tiger" loading="lazy" width="454" height="347">
<p class="sx-earned__cap">Free, exclusive T-shirts for Challenge winners.</p>
<p class="sx-hand sx-earned__hand" aria-hidden="true">Success<br>looks good<br>on you!</p>
</div>
</div>
</section>
<section class="sx-cat" aria-label="Big cat energy">
<div class="sx-wrap sx-cat__grid">
<img src="{M['tiger-stride.png']}" alt="Illustrated tiger mid-stride" loading="lazy" width="852" height="426">
<h2>Big cat<br>energy.</h2>
</div>
</section>
<section class="sx-section sx-calc" id="calculator" aria-labelledby="sx-calc-h">
<div class="sx-wrap sx-calc__grid">
<div>
<p class="sx-calc__k">Goal planning made<em>Easy tiger.</em></p>
<div class="sx-calc__card">
<div class="sx-calc__row">
<div><label for="sx-goal">Your goal ($)</label><input id="sx-goal" inputmode="decimal" value="10000" autocomplete="off"></div>
<div><label for="sx-avg">Average sale amount ($)</label><input id="sx-avg" inputmode="decimal" value="200" autocomplete="off"></div>
</div>
<div class="sx-calc__timeframe"><label for="sx-days">Timeframe</label>
<select id="sx-days"><option value="7">7 days</option><option value="14">14 days</option><option value="30" selected>30 days</option><option value="60">60 days</option><option value="90">90 days</option></select></div>
<div class="sx-calc__out" aria-live="polite"><span class="sx-calc__big">50</span><span class="sx-calc__unit">sales required</span><span class="sx-calc__per">About 1.7 per day over 30 days</span></div>
<p class="sx-fine" style="margin-top:14px">Illustrative calculation. Revenue before costs.</p>
</div>
</div>
<div class="sx-calc__text">
<h2 id="sx-calc-h">Free business<br>calculators</h2>
<p>Turn a big number into a daily to-do. More calculators are on the way.</p>
</div>
</div>
</section>
<section class="sx-section" id="products" aria-labelledby="sx-prod-h">
<div class="sx-wrap">
<div class="sx-rail__head"><h2 id="sx-prod-h">Digital products</h2><a href="/digital-products/">View all</a></div>
<div class="sx-cards">
{product_card('/shopify-seo-workbook/', UP + 'real-shopify-workbook-preview.png', 'Pages from the Shopify SEO Workbook', 'Shopify SEO Workbook', 'Digital workbook')}
{product_card('/pinterest-seo-workbook/', UP + 'real-pinterest-workbook-preview.png', 'Pages from the Pinterest SEO Workbook', 'Pinterest SEO Workbook', 'Digital workbook')}
<a class="sx-card" href="/seo-site-audit/"><span class="sx-card__img sx-card__img--type"><span>SEO<br>Site<br>Audit</span></span><span class="sx-card__name">SEO Site Audit</span><span class="sx-card__sub">Report</span></a>
<div class="sx-card sx-card--more">More guides<br>coming soon</div>
</div>
</div>
</section>
<section class="sx-section sx-merch" id="shop-merch" aria-labelledby="sx-merch-h">
<div class="sx-wrap">
<div class="sx-rail__head"><h2 id="sx-merch-h">Merch <span class="sx-chip sx-chip--line" style="vertical-align:middle;margin-left:10px">Coming soon</span></h2><a href="/scrolly-shop/">View all</a></div>
<div class="sx-cards">{tees}</div>
</div>
</section>
<section class="sx-tagline sx-navy" aria-label="Less scrolling, more Scrolly">
<div class="sx-wrap">
<h2>Less scrolling,<br><em>More Scrolly!</em></h2>
<a class="btn btn--orange" href="#clubs">Explore Clubs + Challenges {ARROW}</a>
</div>
</section>
</div>'''

# ---------- $1K Club page ----------
def club_body():
    c = CLUBS[0]
    return f'''<div class="sx sx-clubpage" data-club="1k">
<section class="sx-hero" aria-labelledby="sx-c-h">
<div class="sx-hero__viewport"><div class="sx-slide is-active" data-club="1k">
<div class="sx-slide__copy">
<p class="sx-slide__eyebrow"><span class="sx-chip">$1K Club</span><span>Coming soon · Not open for purchase</span></p>
<h1 class="sx-slide__h" id="sx-c-h">Build toward <em>your first $1K</em></h1>
<p class="sx-slide__sub">Find relevant ways to reach buyers, useful drafts to get started, and a plan you can put to work for your business.</p>
<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px"><a class="btn" href="#launch">Get launch details {ARROW}</a><a class="btn btn--ghost" href="/1k-challenge/">Explore the Challenge</a></div>
<p class="sx-fine sx-slide__fine">Revenue figures are goals, not guaranteed results.</p>
</div>
<div class="sx-slide__art" aria-hidden="true">
<span class="sx-art__label">Your next revenue goal</span>
<span class="sx-art__amt">$1K</span>
<span class="sx-art__tag">Prove it.</span>
<span class="sx-art__earned"><i class="on"></i><i></i><i></i></span>
</div>
</div></div>
</section>
<div class="sx-stripes-rule" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
<section class="sx-picker sx-navy sx-cprog" aria-labelledby="sx-cp-h">
<div class="sx-wrap sx-cprog__grid">
<div>
<h2 id="sx-cp-h" class="sx-cprog__title">The path to<br>your first stripe</h2>
<p class="sx-cprog__lede">Every Scrolly goal follows the same five steps. Verified achievements unlock recognition under the Challenge rules.</p>
</div>
<div class="sx-prog" id="sx-progress" style="--pct:0%" data-progress="0">
<div class="sx-prog__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="$1K Club progress"><span class="sx-prog__fill"></span></div>
<ol class="sx-prog__steps">{steps(-1)}</ol>
<div class="sx-preview__meta"><span class="sx-prog__num">Soon</span><span class="sx-prog__cap">progress tracking opens with the Club</span></div>
</div>
</div>
</section>
<section class="sx-section" aria-labelledby="sx-d-h">
<div class="sx-wrap">
<p class="sx-eyebrow">The direction</p>
<h2 class="sx-h2" id="sx-d-h">A useful next step<br>for your business.</h2>
<p class="sx-lede">Scrolly is being built around places to find buyers and useful things to do there.</p>
<div class="sx-tiles">
<article class="sx-tile"><span class="sx-tile__n">01</span><h3>Find opportunities</h3><p>Explore relevant communities, customer follow-up, referrals, partnerships, social content, and search.</p></article>
<article class="sx-tile"><span class="sx-tile__n">02</span><h3>Put ideas to work</h3><p>Use practical drafts, briefs, and instructions to move from an idea to something you can try.</p></article>
<article class="sx-tile"><span class="sx-tile__n">03</span><h3>Learn as you go</h3><p>Save actions, track what you try, and review sales progress when you have the data.</p></article>
</div>
</div>
</section>
<section class="sx-section sx-white" id="club-vs-challenge" aria-labelledby="sx-v-h">
<div class="sx-wrap">
<p class="sx-eyebrow">Choose your way forward</p>
<h2 class="sx-h2" id="sx-v-h">Club or Challenge?</h2>
<p class="sx-lede">Start with your goal. Then choose how you want to work toward it.</p>
<div class="sx-tiles sx-tiles--2">
<article class="sx-tile sx-tile--club"><h3>Club: build your approach</h3><p>Practical guidance, marketing ideas, and tools to help you decide what to try for your business. Work through the opportunities at your own pace.</p></article>
<article class="sx-tile sx-tile--chal"><h3>Challenge: put it into action</h3><p>A focused attempt with a defined goal, actions to try, and progress to review. The $1K Challenge is planned around 30 days.</p><a class="sx-tile__link" href="/1k-challenge/">Explore the $1K Challenge ↗</a></article>
</div>
<p class="sx-note">All six Club and Challenge offers are coming soon. They are separate offers; access, requirements, and final inclusions will be confirmed before enrollment opens.</p>
</div>
</section>
<section class="sx-section" aria-labelledby="sx-w-h">
<div class="sx-wrap sx-who">
<div><p class="sx-eyebrow">Who it is for</p><h2 class="sx-h2" id="sx-w-h">For owners ready<br>to do the work.</h2></div>
<div><p class="sx-lede" style="margin-top:0">You have an offer, or one close to launch, and want practical ways to reach buyers. Scrolly supports your work; outcomes depend on your business, market, and execution.</p>
<p class="sx-note">No sales, profit, or timing outcome is guaranteed. The $1K figure describes a revenue goal, not the price of this offer.</p></div>
</div>
</section>
<section class="sx-section sx-white" aria-labelledby="sx-f-h">
<div class="sx-wrap sx-faqwrap">
<h2 class="sx-h2" id="sx-f-h">Before<br>you join.</h2>
<div class="sx-faq">
<details><summary>Can I buy $1K Club today?</summary><p>No. $1K Club is coming soon and is not open for purchase. Request launch news below.</p></details>
<details><summary>Is $1K a guaranteed outcome?</summary><p>No. It is a revenue goal. Revenue is not profit, and results vary with your offer, customers, market, and execution.</p></details>
<details><summary>What will it cost and include?</summary><p>Final pricing, features, access terms, and support will be confirmed before checkout opens.</p></details>
<details><summary>Can I use the existing SEO tools meanwhile?</summary><p>Yes. Explore the <a href="/digital-products/">Shopify and Pinterest workbooks</a> or the <a href="/seo-tools/">SEO Audit and Implementation services</a>.</p></details>
</div>
</div>
</section>
<section class="sx-picker sx-navy" id="launch" aria-labelledby="sx-l-h" style="background:var(--navy)">
<div class="sx-wrap sx-launch">
<div>
<p class="sx-eyebrow" style="color:var(--club)">Next up</p>
<h2 id="sx-l-h" class="sx-h2" style="color:#fff">$1K Club is<br>coming soon.</h2>
<p class="sx-lede" style="color:rgba(255,255,255,.86)">Enrollment is not open yet. Request launch news by email, or use our contact form to ask a question. Final features, pricing, and launch details will be confirmed before checkout opens.</p>
<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px"><a class="btn btn--club" href="mailto:hello@scrollyseo.com?subject=Launch%20updates%3A%20%241K%20Club&amp;body=Hi%20Scrolly%2C%20please%20let%20me%20know%20when%20%241K%20Club%20is%20ready%20to%20launch.%20Thank%20you!">Request launch news {ARROW}</a><a class="btn btn--ghost" href="/contact/">Contact Scrolly</a></div>
<p class="sx-fine" style="color:rgba(255,255,255,.7);margin-top:16px">The launch-news button opens your email app. Your request is sent only when you send the email.</p>
</div>
<nav class="sx-more" aria-label="Other goals">
<p class="sx-eyebrow">Other goals</p>
<a class="sx-more__a" data-club="10k" href="/10k-club/"><strong>$10K</strong><span>Make it your living.</span></a>
<a class="sx-more__a" data-club="24k" href="/24k-club/"><strong>$24K</strong><span>Scale it.</span></a>
</nav>
</div>
</section>
</div>'''

CLUB_CSS = '''
.sx-clubpage .sx-slide{min-height:520px}
.sx-clubpage .sx-slide__h{font-size:clamp(40px,5.4vw,80px)}
.sx-who .sx-h2{font-size:clamp(32px,4.2vw,58px)}
.sx-cprog__grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.3fr);gap:56px;align-items:center}
.sx-cprog{padding:56px 0 64px}
.sx-cprog__title{font-size:clamp(34px,4.4vw,60px);line-height:.92}
.sx-cprog__lede{margin-top:18px;font-size:18px;opacity:.86;max-width:440px}
.sx-h2{font-size:clamp(34px,5vw,68px);line-height:.94;margin-top:14px}
.sx-eyebrow{color:var(--navy)}
.sx-lede{margin-top:20px;font-size:clamp(18px,2vw,22px);line-height:1.4;font-weight:500;max-width:680px}
.sx-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-top:40px}
.sx-tiles--2{grid-template-columns:repeat(2,minmax(0,1fr))}
.sx-tile{background:#fff;border:2px solid var(--navy);border-radius:16px;padding:32px;box-shadow:8px 8px 0 var(--navy);position:relative}
.sx-tile:nth-child(1){background:var(--teal)}.sx-tile:nth-child(2){background:#fff}.sx-tile:nth-child(3){background:var(--cream)}
.sx-tiles--2 .sx-tile:nth-child(1){background:var(--teal)}.sx-tiles--2 .sx-tile:nth-child(2){background:var(--peach)}
.sx-tile__n{display:block;font-family:'Archivo',sans-serif;font-weight:900;font-size:44px;line-height:1;margin-bottom:18px;color:var(--navy)}
.sx-tile h3{font-size:28px;line-height:1}
.sx-tile p{margin-top:16px;font-size:18px;line-height:1.4;font-weight:500}
.sx-tile__link{display:inline-block;margin-top:18px;font-weight:800;font-size:19px}
.sx-white{background:#fff}
.sx-note{margin-top:32px;padding:22px 26px;border-left:6px solid var(--club);background:rgba(148,236,225,.28);border-radius:0 12px 12px 0;font-size:16px;line-height:1.5;font-weight:500;max-width:760px}
.sx-who{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:56px;align-items:start}
.sx-faqwrap{display:grid;grid-template-columns:minmax(0,.7fr) minmax(0,1.3fr);gap:56px}
.sx-faq details{border-bottom:2px solid var(--line);padding:22px 0}
.sx-faq details:first-child{border-top:2px solid var(--line)}
.sx-faq summary{cursor:pointer;font-weight:800;font-size:21px;list-style:none;display:flex;justify-content:space-between;gap:16px;align-items:center}
.sx-faq summary::-webkit-details-marker{display:none}
.sx-faq summary::after{content:'+';font-family:'Archivo',sans-serif;font-weight:900;font-size:32px;line-height:1;flex:none}
.sx-faq details[open] summary::after{content:'\\2013'}
.sx-faq details p{margin-top:14px;font-size:18px;line-height:1.5;max-width:640px}
.sx-launch{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:56px;align-items:center}
.sx-launch .sx-eyebrow{color:var(--club)}
.sx-more{display:flex;flex-direction:column;gap:14px}
.sx-more .sx-eyebrow{color:rgba(255,255,255,.8)}
.sx-more__a{display:flex;align-items:center;gap:20px;text-decoration:none;background:var(--club);color:var(--navy);border-radius:16px;padding:20px 26px;transition:transform .2s}
.sx-more__a:hover,.sx-more__a:focus-visible{transform:translateX(6px)}
.sx-more__a strong{font-family:'Archivo',sans-serif;font-weight:900;font-size:56px;line-height:.9;letter-spacing:-.03em}
.sx-more__a span{font-weight:800;font-size:20px}
@media(max-width:900px){.sx-cprog__grid,.sx-who,.sx-faqwrap,.sx-launch{grid-template-columns:1fr;gap:32px}.sx-tiles,.sx-tiles--2{grid-template-columns:1fr}}
@media(max-width:600px){.sx-tile{padding:24px}.sx-tile{box-shadow:5px 5px 0 var(--navy)}}
'''

WP_FIX = lambda s: re.sub(r'\n\s*\n+', '\n', s)  # wpautop-safe: no blank lines

def fragment(body, css_parts, js):
    style = '\n'.join(css_parts)
    parts = [f'<!-- wp:html --><style id="sx-system">{style}</style>', body]
    if js: parts.append(f'<script id="sx-js">{js}</script>')
    parts.append('<!-- /wp:html -->')
    return WP_FIX('\n'.join(parts))

PREVIEW_HEAD = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{t}</title>
<style>body{{margin:0}}#site-header{{display:flex;flex-wrap:wrap;gap:6px 18px;align-items:center;padding:14px 16px;font:700 16px 'Public Sans',sans-serif}}#site-header b{{font-size:26px;margin-right:auto;font-family:Archivo,sans-serif;letter-spacing:-.03em}}#site-footer{{padding:32px;color:#fff;font:14px sans-serif}}#site-header a{{text-decoration:none}}</style></head><body>
<header id="site-header"><b>scrolly</b><a href="#">Clubs</a><a href="#">Challenges</a><a href="#">Shop</a><a href="#">SEO Tools</a><a href="#">Cart</a></header>
<main id="content"><div class="page-content">'''
PREVIEW_TAIL = '</div></main><footer id="site-footer">(theme footer)</footer></body></html>'

def main():
    shared = (SRC / 'shared.css').read_text(encoding='utf-8')
    homecss = (SRC / 'home.css').read_text(encoding='utf-8')
    js = (SRC / 'home.js').read_text(encoding='utf-8')
    pages = {
        'home': fragment(home_body(), [shared, homecss], js),
        '1k-club': fragment(club_body(), [shared, homecss, CLUB_CSS], None),
    }
    for name, frag in pages.items():
        (DIST / f'{name}.wp.html').write_text(frag, encoding='utf-8')
        inner = frag.replace('<!-- wp:html -->', '').replace('<!-- /wp:html -->', '')
        (DIST / f'preview-{name}.html').write_text(PREVIEW_HEAD.format(t=name) + inner + PREVIEW_TAIL, encoding='utf-8')
        print(name, len(frag), 'bytes')

main()
