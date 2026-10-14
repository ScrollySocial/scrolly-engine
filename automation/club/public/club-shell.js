/* Scrolly $1K Club — shared header + sidebar for every signed-in Club page
   except Home (overview.html), which keeps its own frozen implementation
   of the same visual system. Single source of truth for the other pages'
   navigation, so destinations can't drift between pages the way the old
   per-page copied <nav> markup did (e.g. module3-6 all wrongly highlighting
   "Organic Growth" regardless of which module page was actually open). */
(function () {
  const TOKEN_KEY = 'scrolly_club_access_token';
  const ICONS = {
    'ic-home': '<path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9"/>',
    'ic-box': '<path d="m12 2 8 5v10l-8 5-8-5V7zM4 7l8 5 8-5M12 12v10"/>',
    'ic-list': '<path d="M9 5h12M9 12h12M9 19h12M3 4v2M2 5h2M3 11v2M2 12h2M3 18v2M2 19h2"/>',
    'ic-monitor': '<rect x="2" y="3" width="20" height="14" rx="1"/><path d="M12 17v4M8 21h8"/>',
    'ic-bars': '<rect x="3" y="14" width="3" height="7"/><rect x="10" y="8" width="3" height="13"/><rect x="17" y="2" width="3" height="19"/>',
    'ic-cart': '<path d="M2 3h3l3 13h11l3-10H6M8 10h13"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>',
    'ic-user': '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2z"/>',
    'ic-target': '<circle cx="11" cy="13" r="9"/><circle cx="11" cy="13" r="5"/><path d="m11 13 10-10M17 3h4v4"/>',
    'ic-robot': '<rect x="3" y="7" width="18" height="15" rx="3"/><path d="M12 7V3M9 17q3 3 6 0"/><circle cx="12" cy="2" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/>',
    'ic-menu': '<path d="M4 7h16M4 12h16M4 17h16"/>',
    'ic-close': '<path d="M6 6l12 12M18 6L6 18"/>',
    'ic-chevron': '<path d="m7 10 5 5 5-5"/>',
  };
  function icon(name, cls) {
    return `<svg class="${cls || 'club-shell-icon'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  // Dashboard / My Plan / Learn / Challenge -- restructured 2026-09-22
  // around the core product architecture: DASHBOARD = my business + my
  // progress, MY PLAN = my business/data/connections/route to $1K
  // (executing plan-building, not curriculum), LEARN = what Scrolly
  // teaches (the channel curriculum, formerly mislabeled "My Plan"),
  // CHALLENGE = the timed $25 execution layer on top of the same plan.
  // Connections is no longer a top-level destination -- it's part of My
  // Plan's operating layer (linked prominently from /club itself, which is
  // now the My Plan page); Performance is no longer top-level either --
  // its Your Numbers / Growth Review content is surfaced as Dashboard
  // tabs (see overview.html), though /club/performance still works as its
  // own page for anyone with an old link/bookmark. Nothing here deletes
  // those routes -- see PERFORMANCE_PATHS/computeActiveHref below, which
  // still recognizes them so a bookmark highlights something sane.
  // "Account" stays dropped -- the real site-wide WordPress header
  // already has its own "My Account" link. "Opportunities"/"Tracking"/
  // "Community"/"Shop" still have no real standalone home for the reasons
  // recorded in the 2026-09-15 sprint notes (superseded by this comment).
  const NAV_ITEMS = [
    { label: 'Dashboard', href: '/club/overview', icon: 'ic-home' },
    { label: 'My Plan', href: '/club', icon: 'ic-box' },
    { label: 'Learn', href: '/club/modules', icon: 'ic-list' },
    { label: 'Challenge', href: '/club/challenge', icon: 'ic-target' },
  ];
  // 2026-09-16 pivot: the Club is now three equal-depth core tracks
  // (Instagram & Facebook / TikTok & TikTok Shop / LinkedIn) instead of
  // eight freely-orderable channel modules -- see product-ladder.md's
  // "three-track pivot" entry. Retired tracks (YouTube/Pinterest/Google/
  // Website SEO/Groups) keep their routes and any saved member data --
  // nothing is deleted -- they're just no longer part of the primary
  // sidebar/nav journey. Kept in LEARN_PATHS only so an old bookmark still
  // highlights "Learn" in the sidebar rather than highlighting nothing.
  // /club/modules itself is now Learn's curriculum index; /club (Business
  // & $1K Starting Point/My Plan) moved OUT of this list and into its own
  // NAV_ITEMS entry above, since it's a destination in its own right now,
  // not a "module" that falls back to highlighting something else.
  const LEARN_PATHS = [
    '/club/modules',
    '/club/channel/instagram-facebook', '/club/channel/tiktok', '/club/channel/linkedin',
    '/club/channel/youtube', '/club/channel/google', '/club/channel/pinterest',
    '/club/channel/website-seo', '/club/channel/groups', '/club/channel/purchase-path',
    '/club/module2', '/club/module3', '/club/module4', '/club/module5', '/club/module6',
  ];
  const PERFORMANCE_PATHS = ['/club/website', '/club/review', '/club/performance'];
  const CONNECTIONS_PATHS = ['/club/connections'];
  // 2026-09-16: no longer used to render a cross-module Previous/Next bar
  // (see channel-module.js's buildTrackNav for the compact title-adjacent
  // replacement -- tracks are chosen, not read in a fixed sequence, so
  // "next module" stopped being a meaningful action). Kept only as a label
  // lookup for the mobile utility bar's "current module" text.
  const MODULE_SEQUENCE = [
    { href: '/club', label: 'Your Business & $1K Starting Point' },
    { href: '/club/channel/instagram-facebook', label: 'Instagram & Facebook' },
    { href: '/club/channel/tiktok', label: 'TikTok & TikTok Shop' },
    { href: '/club/channel/linkedin', label: 'LinkedIn' },
    { href: '/club/channel/youtube', label: 'YouTube & Shorts' },
    { href: '/club/channel/google', label: 'Google Search & Business Profile' },
    { href: '/club/channel/pinterest', label: 'Pinterest' },
    { href: '/club/channel/website-seo', label: 'Website SEO & AI Discovery' },
    { href: '/club/channel/groups', label: 'Groups & Communities' },
    { href: '/club/channel/purchase-path', label: 'Make It Easy to Buy' },
  ];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function computeActiveHref() {
    const path = location.pathname;
    if (NAV_ITEMS.some((n) => n.href === path)) return path;
    // Any channel/curriculum page (including Module 5, now that
    // /club/content -- not /club/module5 -- is the Content Studio
    // destination) falls back to highlighting "Learn".
    if (LEARN_PATHS.includes(path)) return '/club/modules';
    // Connections is part of My Plan's operating layer now, not a
    // top-level destination -- highlight My Plan while on it.
    if (CONNECTIONS_PATHS.includes(path)) return '/club';
    // Performance folded into Dashboard tabs; the page itself still works
    // for an old bookmark, and highlights Dashboard while on it.
    // /club/website and /club/review 302-redirect server-side to
    // /club/performance before this script ever runs, so only the last
    // entry ever actually matches in practice -- the first two are kept
    // only as a defensive fallback.
    if (PERFORMANCE_PATHS.includes(path)) return '/club/overview';
    return null;
  }

  // Real scrollyseo.com site-wide header/footer markup + stylesheets --
  // the same theme.css/header-footer.css every other page on the site
  // loads, PLUS the "scrolly-shared-shell-v1" WPCode snippet CSS (found
  // live on scrollyseo.com 2026-09-15 -- NOT the same as the WordPress
  // Customizer "Additional CSS" field, a separate source that was already
  // known; this one is what actually paints the footer black and swaps
  // the cart/account nav icons for emoji). Injected once into <head> here
  // rather than duplicated per-page, so every Club page (except Home,
  // which keeps its own already-synced frozen copy) stays in sync from
  // one source. Re-sync both blocks below if the live site's snippets
  // change.
  const CHROME_LINKS = [
    'https://scrollyseo.com/wp-content/themes/hello-biz/assets/css/theme.css?ver=1.2.2',
    'https://scrollyseo.com/wp-content/themes/hello-biz/assets/css/header-footer.css?ver=1.2.2',
  ];
  const CHROME_CSS = `
:root{--si-indigo:#4f46e5;--si-indigo-dark:#3c34b5;--si-cyan:#0891b2;--si-ink:#10152b;--si-ink-soft:#5c6478;--si-line:#e1e5f2;--si-bg-alt:#eef1fa}
.site-branding .site-title a{font-size:0;line-height:1;display:inline-block;text-decoration:none}
.site-branding .site-title a::before{content:"Scrolly";font-size:1.3rem;font-weight:800;color:var(--si-ink);font-family:'Manrope',sans-serif}
.site-branding .site-title a::after{content:"SEO";font-size:1.3rem;font-weight:800;color:var(--si-indigo);font-family:'Manrope',sans-serif}
.site-header{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;background:rgba(245,247,252,.92);border-bottom:none;padding:14px max(24px, calc((100% - 1160px)/2))}
.site-header::after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:4px;background:#94ece1}
.site-header .site-navigation{display:flex;align-items:center}
.site-header #menu-main-menu{display:flex;align-items:center;flex-wrap:wrap;gap:4px}
.site-header #menu-main-menu > li{display:flex;align-items:center}
.site-header nav a,.main-navigation a{color:var(--si-ink-soft)!important;font-weight:600;font-size:.92rem;text-decoration:none;line-height:1}
.site-header nav a:hover{color:var(--si-indigo)!important}
.site-header .menu-cta-btn{margin-left:8px}
body.club-shell-page .site-header .menu-cta-btn a,body.club-shell-page .site-header .menu-cta-btn a:hover{display:inline-block;background:#000000!important;color:#ffffff!important;padding:13px 26px!important;border-radius:999px!important;font-family:'Manrope',sans-serif!important;font-weight:800!important;font-size:.95rem!important;line-height:1;border:none!important;text-decoration:none!important}
.site-header .menu-cta-btn a:hover{background:#1a1a1a!important}
.site-header .sub-menu{min-width:230px;background:#fefeff;border:1px solid var(--si-line);border-radius:12px;box-shadow:0 14px 30px rgba(16,21,43,.14);padding:6px}
.site-header .sub-menu li{list-style:none}
.site-header .sub-menu a{white-space:nowrap;display:block;padding:10px 14px!important;border-radius:8px;font-size:.88rem!important}
.site-header .sub-menu a:hover{background:var(--si-bg-alt)}
.site-footer,footer{padding:14px max(24px, calc((100% - 1160px)/2))}
#site-header{background:#f5f7fc!important;border-bottom:4px solid #94ece1!important}
#site-header .site-navigation .menu{display:flex!important;align-items:center!important;gap:8px!important}
#menu-item-34,#menu-item-34>a,#menu-item-34>a:link,#menu-item-34>a:visited,#menu-item-34>a:hover,#menu-item-34>a:focus,#menu-item-34>a:active,#menu-item-34>a *{color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important;filter:none!important}
#menu-item-34>a{background:#000000!important;border-radius:999px!important;padding:12px 24px!important}
.menu-cart-icon>a,.menu-account-icon>a{font-size:0!important;width:44px!important;height:44px!important;display:grid!important;place-items:center!important}
.menu-cart-icon>a:before{content:"\\1F6D2";font-size:21px!important}
.menu-account-icon>a:before{content:"\\1F464";font-size:20px!important}
.menu-disabled>a{opacity:.72!important;cursor:default!important;pointer-events:none!important}
#site-footer{background:#11131b!important;border-top:4px solid transparent!important;border-image:linear-gradient(90deg,#4f46e5,#8b5cf6,#db2777,#ef4444) 1!important;margin-top:-18px!important;position:relative!important;z-index:5!important;padding:30px clamp(22px,5vw,72px)!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:0!important;text-align:left!important}
#site-footer:before{content:"Scrolly";font:900 clamp(1.3rem,2.5vw,1.8rem) Manrope,sans-serif;line-height:1;color:#fff!important;white-space:nowrap}
#site-footer:after{display:none!important}
#site-footer .site-navigation{display:flex!important;align-items:center!important;gap:30px!important}
#site-footer .site-navigation:before{content:"SEO";font:900 clamp(1.3rem,2.5vw,1.8rem) Manrope,sans-serif;line-height:1;background:linear-gradient(90deg,#818cf8,#a78bfa,#e879f9,#fb7185);-webkit-background-clip:text;background-clip:text;color:transparent;white-space:nowrap}
#site-footer .menu{display:flex!important;align-items:center!important;justify-content:center!important;flex-wrap:wrap!important;gap:10px 24px!important;margin:0!important}
#site-footer a,#site-footer a:visited{color:#fff!important;-webkit-text-fill-color:#fff!important;text-decoration:none!important}
#site-footer a:hover,#site-footer a:focus{color:#fda4af!important;-webkit-text-fill-color:#fda4af!important}
@media(max-width:850px){#site-header .site-navigation .menu{flex-wrap:wrap!important}#site-footer{flex-wrap:wrap!important;row-gap:18px!important}#site-footer .site-navigation{flex-wrap:wrap!important;justify-content:center!important;gap:18px 24px!important}}
`;
  // theme.css (loaded above) ships a generic
  // [type=button],[type=submit],button{border:1px solid #c36;color:#c36}
  // reset, plus a :hover/:focus variant -- meant for the theme's own
  // unstyled WordPress content, not for Club's own already-designed
  // buttons across these 11 pages. That selector's specificity is
  // equivalent to one class (0,1,0). Rather than fight it with another
  // dynamically-inserted reset (tested and found unreliable: a JS-inserted
  // <style> did not consistently lose same-specificity ties against
  // statically-parsed page <style> blocks here, !important or not, making
  // any reset-and-let-pages-reapply strategy from this injected sheet
  // fragile regardless of source order), every real Club button rule
  // across these pages was instead given genuinely higher specificity
  // (prefixed with `body.club-shell-page`, e.g. (0,1,2) beats theme's
  // (0,1,0) outright, not on a tie) -- see club-shell.css and each page's
  // own <style> block.

  function injectChrome() {
    if (document.getElementById('club-shell-chrome-css')) return;
    // Prepended, not appended, so theme.css/header-footer.css load before
    // every page's own <link>/<style> in source order, same as
    // overview.html's already-correct static link placement -- the
    // generic button-specificity fix above still needs this for anything
    // that isn't a tie (e.g. this sheet's own #site-header/#site-footer
    // rules against a page accidentally reusing those ids).
    const nodes = CHROME_LINKS.map((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      return link;
    });
    const style = document.createElement('style');
    style.id = 'club-shell-chrome-css';
    style.textContent = CHROME_CSS;
    nodes.push(style);
    document.head.prepend(...nodes);
  }

  function buildSiteHeader() {
    const header = document.createElement('header');
    header.id = 'site-header';
    header.className = 'site-header';
    header.innerHTML = `
	<div class="site-branding">
			<div class="site-title">
				<a href="https://scrollyseo.com/" title="Home" rel="home">
					Scrolly SEO				</a>
			</div>
					</div>

		<nav class="site-navigation" aria-label="Main menu">
		<ul id="menu-main-menu" class="menu"><li id="menu-item-133" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-133"><a href="#">Guides</a>
<ul class="sub-menu">
	<li id="menu-item-134" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-134"><a href="https://scrollyseo.com/shopify-seo-workbook/">Shopify SEO Workbook</a></li>
	<li id="menu-item-135" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-135"><a href="https://scrollyseo.com/pinterest-seo-workbook/">Pinterest SEO Workbook</a></li>
</ul>
</li>
<li id="menu-item-34" class="menu-cta-btn menu-item menu-item-type-custom menu-item-object-custom menu-item-34"><a href="https://scrollyseo.com/seo-site-audit/">Audit My Site</a></li>
<li id="menu-item-197" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-197"><a href="https://scrollyseo.com/implementation/">Implementation</a></li>
<li id="menu-item-166" class="menu-cart-icon menu-item menu-item-type-custom menu-item-object-custom menu-item-166"><a href="https://scrollyseo.com/cart/">Cart</a></li>
<li id="menu-item-167" class="menu-account-icon menu-item menu-item-type-custom menu-item-object-custom menu-item-167"><a href="https://scrollyseo.com/my-account/">My Account</a></li>
</ul>		</nav>
	`;
    return header;
  }

  function buildSiteFooter() {
    const footer = document.createElement('footer');
    footer.id = 'site-footer';
    footer.className = 'site-footer';
    footer.innerHTML = `
		<nav class="site-navigation" aria-label="Footer menu">
		<ul id="menu-footer-menu" class="menu"><li id="menu-item-131" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-131"><a href="https://scrollyseo.com/about/">About</a></li>
<li id="menu-item-132" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-132"><a href="https://scrollyseo.com/contact/">Contact</a></li>
<li id="menu-item-172" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-172"><a href="https://scrollyseo.com/accessibility/">Accessibility</a></li>
<li id="menu-item-200" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-200"><a href="https://scrollyseo.com/privacy/">Privacy Policy</a></li>
<li id="menu-item-201" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-201"><a href="https://scrollyseo.com/terms/">Terms of Service</a></li>
<li id="menu-item-202" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-202"><a href="https://scrollyseo.com/refund/">Refund Policy</a></li>
</ul>		</nav>
	`;
    return footer;
  }

  // Slim utility bar for the one Club-specific control the real site
  // header has no room for: the mobile sidebar-drawer toggle (needed on
  // every page so the sidebar nav stays reachable on small screens).
  // Quick Actions was removed here in the 2026-09-15 sprint -- three
  // navigation systems (WP header, Club sidebar, Quick Actions) was one
  // too many; only shown on mobile now (desktop has the sidebar visible).
  // Sticky at mobile widths (see club-shell.css) so "All modules" access and
  // the current module's name stay reachable while scrolling, not just at
  // the top of the page -- the desktop sidebar already does this via its own
  // position:sticky, but mobile has no equivalent persistent element without
  // this.
  function buildUtilityBar() {
    const bar = document.createElement('div');
    bar.className = 'club-shell-utilitybar';
    const currentLabel = currentPageLabel();
    bar.innerHTML = `<button type="button" class="club-shell-menu-btn" aria-label="Open Club menu" aria-expanded="false" aria-controls="club-shell-sidebar">${icon('ic-menu')} Menu</button>${currentLabel ? `<span class="club-shell-current-module">${esc(currentLabel)}</span>` : ''}`;
    return bar;
  }

  function currentPageLabel() {
    const path = location.pathname;
    const navItem = NAV_ITEMS.find((n) => n.href === path);
    if (navItem) return navItem.label;
    const moduleItem = MODULE_SEQUENCE.find((m) => m.href === path);
    if (moduleItem) return moduleItem.label;
    return null;
  }

  function buildSidebar() {
    const aside = document.createElement('aside');
    aside.className = 'club-shell-sidebar';
    aside.id = 'club-shell-sidebar';
    const active = computeActiveHref();
    const navHtml = NAV_ITEMS.map((n) => {
      return `<a href="${esc(n.href)}"${n.href === active ? ' aria-current="page"' : ''}>${icon(n.icon)}${esc(n.label)}</a>`;
    }).join('');
    aside.innerHTML = `
      <div class="club-shell-club-label">$1K CLUB<small>Permanent Access</small></div>
      <nav class="club-shell-nav" aria-label="Club">${navHtml}</nav>
      <a class="club-shell-promo" id="club-shell-stripe-promo" href="/club/challenge"><span class="arrow">&rarr;</span><strong>Earn Your Stripes</strong>Start a $25 Challenge</a>`;
    return aside;
  }

  // "Earn Your Stripes" evolves with real Challenge state (reuses the
  // already-built /club/challenge/state endpoint -- no new backend here):
  //   no active/past attempt  -> "Start a $25 Challenge"
  //   active attempt          -> "Day X of 30 -- $Y of $1,000"
  //   verified winner         -> "Stripe earned"
  //   otherwise (completed/expired, not verified, none active) -> "Start another attempt"
  // Fails silently (leaves the static default above) on any error/no token
  // -- this is a progressive enhancement, never a blocking fetch.
  async function updateChallengePromo() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const el = document.getElementById('club-shell-stripe-promo');
    if (!token || !el) return;
    try {
      const res = await fetch('/club/challenge/state', { headers: { Authorization: `Bearer ${token}` } });
      const body = await res.json();
      if (!res.ok || !body.ok) return;
      const label = el.querySelector('strong');
      const line = el.lastChild; // trailing text node after <strong>
      if (body.active) {
        const a = body.active;
        const goalLine = a.goal.known ? `$${Math.max(0, Math.round(a.goal.gained)).toLocaleString('en-US')} of $${a.goal.usd.toLocaleString('en-US')}` : 'Track your progress';
        if (label) label.textContent = `Day ${a.day} of ${a.windowDays}`;
        if (line) line.textContent = `${goalLine} — View Challenge`;
        return;
      }
      const verified = (body.history || []).some((h) => h.achievement && h.achievement.verified);
      if (verified) {
        if (label) label.textContent = 'Stripe Earned';
        if (line) line.textContent = 'View your achievement';
        return;
      }
      if ((body.history || []).length > 0 && body.canStartNewAttempt) {
        if (label) label.textContent = 'Earn Your Stripes';
        if (line) line.textContent = 'Start another attempt';
      }
      // Else: no history at all -- default markup ("Start a $25 Challenge") already correct.
    } catch (e) {
      // Silent -- static default stays.
    }
  }

  function wireMobileDrawer(sidebar, menuBtn) {
    const backdrop = document.createElement('div');
    backdrop.className = 'club-shell-backdrop';
    document.body.appendChild(backdrop);

    function open() {
      sidebar.classList.add('club-shell-open');
      backdrop.classList.add('club-shell-open');
      menuBtn.setAttribute('aria-expanded', 'true');
      const firstLink = sidebar.querySelector('a');
      if (firstLink) firstLink.focus();
      document.addEventListener('keydown', onKeydown);
    }
    function close(returnFocus) {
      sidebar.classList.remove('club-shell-open');
      backdrop.classList.remove('club-shell-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKeydown);
      if (returnFocus) menuBtn.focus();
    }
    function onKeydown(e) {
      if (e.key === 'Escape') close(true);
    }
    menuBtn.addEventListener('click', () => {
      const isOpen = sidebar.classList.contains('club-shell-open');
      if (isOpen) close(true); else open();
    });
    backdrop.addEventListener('click', () => close(false));
    window.matchMedia('(min-width:901px)').addEventListener('change', (e) => {
      if (e.matches) close(false);
    });
  }

  function init() {
    // A fresh token can arrive as ?token=... on any Club page, not just
    // Home -- capture it into sessionStorage the same way every page's own
    // inline script already does, before that page's own script runs its
    // own (harmless, idempotent) copy of this same check.
    const params = new URLSearchParams(location.search);
    if (params.get('token')) {
      sessionStorage.setItem(TOKEN_KEY, params.get('token'));
    }

    injectChrome();

    document.body.classList.add('club-shell-page');
    // Some legacy pages set their own body{padding:...} for their un-shelled
    // layout; that padding would otherwise inset the injected full-bleed
    // header/sidebar too. An inline style always wins the cascade, so this
    // neutralizes it without needing to touch each page's own <style>.
    document.body.style.padding = '0';
    document.body.style.margin = '0';

    const existing = Array.from(document.body.childNodes);
    const siteHeader = buildSiteHeader();
    const utilityBar = buildUtilityBar();
    const bodyRow = document.createElement('div');
    bodyRow.className = 'club-shell-body';
    const sidebar = buildSidebar();
    const content = document.createElement('div');
    content.className = 'club-shell-content';
    existing.forEach((node) => content.appendChild(node));
    bodyRow.appendChild(sidebar);
    bodyRow.appendChild(content);
    document.body.appendChild(siteHeader);
    document.body.appendChild(utilityBar);
    document.body.appendChild(bodyRow);
    document.body.appendChild(buildSiteFooter());

    wireMobileDrawer(sidebar, utilityBar.querySelector('.club-shell-menu-btn'));
    updateChallengePromo();
  }

  // Shared "your session isn't valid" recovery state -- every page used to
  // write its own slightly different version of this ("Your access link is
  // missing or expired" as plain text, sometimes with no recovery action at
  // all). Real bug this fixes: My Plan showed this text in its token-gated
  // status area while the static channel list rendered normally right below
  // it, reading as broken/contradictory rather than as one coherent state.
  // This does NOT bypass access control -- it's shown only when the token is
  // genuinely missing/invalid/expired, same as before, just with one
  // consistent look and a real recovery action instead of dead text.
  function renderAccessExpired(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="club-shell-access-expired">
        <strong>Your session has ended.</strong>
        <p>This can happen after a few hours, or if this link was opened in a new browser/device. Your $1,000 Club access itself hasn't changed.</p>
        <a href="https://scrollyseo.com/my-account/">Reconnect from My Account &rarr;</a>
      </div>`;
  }

  window.ClubShell = { renderAccessExpired };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
