/* Shared behavior for every $1K Club channel module. v2 (2026-09-18):
   destination-based navigation (replaces numbered sections), a reusable
   annotated-demonstration component, and the real two-column channel
   traffic/conversion calculator (replaces the earlier single-tool
   version). Content still differs per page; this file is the only place
   the mechanics should be edited. */
(function () {
  const TOKEN_KEY = 'scrolly_club_access_token';

  function getToken() {
    const params = new URLSearchParams(location.search);
    if (params.get('token')) { sessionStorage.setItem(TOKEN_KEY, params.get('token')); history.replaceState({}, '', location.pathname); }
    return sessionStorage.getItem(TOKEN_KEY);
  }

  // ---- Local, optional checklist/self-check state. Nothing here is
  // mandatory or gates access to anything else in the Club -- a personal
  // scratchpad per module, not a saved business record, so localStorage
  // (not a server-side plan) is deliberately enough for V1.
  function storeKeyFor(moduleKey) { return `scrolly_channel_${moduleKey}_v1`; }
  function loadState(moduleKey) {
    try { return JSON.parse(localStorage.getItem(storeKeyFor(moduleKey))) || {}; } catch (e) { return {}; }
  }
  function saveState(moduleKey, state) {
    try { localStorage.setItem(storeKeyFor(moduleKey), JSON.stringify(state)); } catch (e) {}
  }

  function wireChecklist(moduleKey, groupKey, ids, onChange) {
    const state = loadState(moduleKey);
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.checked = !!(state[groupKey] && state[groupKey][id]);
      el.addEventListener('change', () => {
        const s = loadState(moduleKey);
        s[groupKey] = s[groupKey] || {};
        s[groupKey][id] = el.checked;
        saveState(moduleKey, s);
        if (onChange) onChange();
      });
    });
  }

  // Saved review exercise for Track & Improve mini-lessons: lets a member
  // record what they observed, the one change they're testing, and the
  // result once they check back, instead of reading a diagnostic table
  // with nowhere to put their own answer. Same localStorage-per-moduleKey
  // pattern as checklists -- a personal log, not a server-side record.
  function wireReviewExercise(moduleKey) {
    document.querySelectorAll('.review-exercise[data-review-key]').forEach((box) => {
      const key = box.dataset.reviewKey;
      const fields = {
        observation: box.querySelector('[data-review="observation"]'),
        change: box.querySelector('[data-review="change"]'),
        result: box.querySelector('[data-review="result"]'),
      };
      const saveBtn = box.querySelector('[data-review-save]');
      const log = box.querySelector('[data-review-log]');
      if (!saveBtn || !log) return;

      function render() {
        const state = loadState(moduleKey);
        const entries = (state.reviewLog && state.reviewLog[key]) || [];
        log.innerHTML = entries.length
          ? entries.slice().reverse().map((e) => `
            <div class="review-entry">
              <div class="review-entry-date">${new Date(e.savedAt).toLocaleDateString()}</div>
              ${e.observation ? `<div><b>Observed:</b> ${escHtml(e.observation)}</div>` : ''}
              ${e.change ? `<div><b>Testing:</b> ${escHtml(e.change)}</div>` : ''}
              ${e.result ? `<div><b>Result:</b> ${escHtml(e.result)}</div>` : '<div class="muted">No result recorded yet. Come back and add one once you\'ve compared.</div>'}
            </div>`).join('')
          : '<p class="muted">No entries saved yet.</p>';
      }
      function escHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

      saveBtn.addEventListener('click', () => {
        const observation = fields.observation ? fields.observation.value.trim() : '';
        const change = fields.change ? fields.change.value.trim() : '';
        const result = fields.result ? fields.result.value.trim() : '';
        if (!observation && !change && !result) return;
        const state = loadState(moduleKey);
        state.reviewLog = state.reviewLog || {};
        state.reviewLog[key] = state.reviewLog[key] || [];
        state.reviewLog[key].push({ observation, change, result, savedAt: new Date().toISOString() });
        saveState(moduleKey, state);
        Object.values(fields).forEach((f) => { if (f) f.value = ''; });
        render();
      });
      render();
    });
  }

  // ======================================================================
  // Destination navigation -- replaces the old numbered-section stack.
  // One panel visible at a time, direct-linkable via #hash, persistent
  // nav, optional Back/Next. These are sections WITHIN a module, not
  // separate modules or completion gates -- nothing here blocks access
  // to any panel.
  // ======================================================================
  function initDestinations(keys) {
    const nav = document.querySelector('.dest-nav');
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll('[data-dest]'));
    const panels = keys.map((k) => document.getElementById('dest-' + k)).filter(Boolean);
    const backBtn = document.querySelector('.dest-back');
    const nextBtn = document.querySelector('.dest-next');
    const endActions = buildEndOfTrackActions();

    function show(key, updateHash, scroll) {
      if (!keys.includes(key)) key = keys[0];
      panels.forEach((p) => { p.hidden = (p.id !== 'dest-' + key); });
      links.forEach((l) => l.setAttribute('aria-current', l.dataset.dest === key ? 'page' : 'false'));
      const idx = keys.indexOf(key);
      const isLast = idx >= keys.length - 1;
      if (backBtn) { backBtn.disabled = idx <= 0; backBtn.dataset.target = keys[idx - 1] || ''; }
      if (nextBtn) { nextBtn.hidden = isLast; nextBtn.dataset.target = keys[idx + 1] || ''; }
      if (endActions) endActions.hidden = !isLast;
      if (updateHash !== false) history.replaceState({}, '', '#' + key);
      if (scroll !== false) window.scrollTo({ top: document.querySelector('.dest-panels').offsetTop - 90, behavior: 'smooth' });
    }

    links.forEach((l) => l.addEventListener('click', (e) => { e.preventDefault(); show(l.dataset.dest); }));
    if (backBtn) backBtn.addEventListener('click', () => { if (backBtn.dataset.target) show(backBtn.dataset.target); });
    if (nextBtn) nextBtn.addEventListener('click', () => { if (nextBtn.dataset.target) show(nextBtn.dataset.target); });

    // A plain page load (no #hash) should start at the natural top of the
    // page -- title and track nav visible -- not auto-scroll straight past
    // them to the tab panels. A real deep link (#how-to-use etc.) still
    // scrolls to it, since that's the point of a direct link.
    const initial = (location.hash || '').replace('#', '');
    const isDeepLink = keys.includes(initial);
    show(isDeepLink ? initial : keys[0], false, isDeepLink);
  }

  // Reached the end of a track: a dead "Next" slot used to just disappear.
  // Replaced with a real forward action -- back to My Plan, plus a Challenge
  // CTA whose label/destination reflects the member's actual entitlement
  // (never a fake "join" link once they're already in one, never silent).
  function buildEndOfTrackActions() {
    const controls = document.querySelector('.dest-controls');
    if (!controls) return null;
    const wrap = document.createElement('div');
    wrap.className = 'dest-end-actions';
    wrap.hidden = true;
    wrap.innerHTML = `
      <a class="dest-end-plan" href="/club/modules">Back to Learn</a>
      <a class="dest-end-challenge" href="/club/challenge" hidden>Continue your Challenge &rarr;</a>
    `;
    controls.insertAdjacentElement('afterend', wrap);
    const challengeLink = wrap.querySelector('.dest-end-challenge');
    fetchChallengeState((state) => {
      if (state && state.active) {
        challengeLink.textContent = `Continue your Challenge (Day ${state.active.day} of ${state.active.windowDays}) →`;
        challengeLink.hidden = false;
      } else if (state && state.history && state.history.length === 0) {
        challengeLink.textContent = 'Explore the $1K Challenge →';
        challengeLink.hidden = false;
      }
    });
    return wrap;
  }

  function fetchChallengeState(onResult) {
    const token = getToken();
    if (!token) return;
    fetch('/club/challenge/state', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.ok) onResult(d); })
      .catch(() => {});
  }

  // ======================================================================
  // Demonstration component -- annotated image + numbered callouts +
  // caption + click-to-enlarge, OR an honest "asset missing" placeholder
  // when no real screenshot/diagram exists yet. Never silently substitute
  // a decorative image for a missing real one.
  // ======================================================================
  function initDemonstrations() {
    document.querySelectorAll('.demo-figure[data-enlargeable]').forEach((fig) => {
      const img = fig.querySelector('img');
      if (!img) return;
      fig.addEventListener('click', () => openLightbox(img.src, img.alt));
      fig.setAttribute('role', 'button');
      fig.setAttribute('tabindex', '0');
      fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(img.src, img.alt); } });
    });
  }

  // ======================================================================
  // 2026-09-21 additions: copy-to-clipboard, downloadable text templates,
  // verified-fact note toggles, and a real swipeable carousel -- the
  // "usable resource" / "finished example" components the content rebuild
  // needs. Each degrades safely (no crash) if the browser API is missing.
  // ======================================================================
  function initCopyButtons() {
    document.querySelectorAll('.copy-block[data-copy]').forEach((block) => {
      if (block.dataset.wired) return;
      block.dataset.wired = '1';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      block.appendChild(btn);
      function selectBlockText() {
        // Real fallback: actually highlight the visible caption text so
        // "select & copy manually" is true, not just a label -- a hidden
        // textarea + execCommand('copy') (the old approach) can silently do
        // nothing when the browser blocks it, leaving the member with
        // neither a copied clipboard nor anything visibly selected.
        const range = document.createRange();
        range.selectNodeContents(block);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      btn.addEventListener('click', async () => {
        const text = block.dataset.copy;
        try {
          if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('no clipboard API');
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copied'; btn.classList.add('copied');
          setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1800);
        } catch (e) {
          selectBlockText();
          btn.textContent = 'Selected — press Ctrl/Cmd+C';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2400);
        }
      });
    });
  }

  function initDownloadButtons() {
    document.querySelectorAll('.dl-btn[data-dl-filename]').forEach((btn) => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = '1';
      btn.addEventListener('click', () => {
        const text = btn.dataset.dlText || '';
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = btn.dataset.dlFilename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      });
    });
  }

  function initVerifiedNotes() {
    document.querySelectorAll('.verified-toggle').forEach((btn) => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = '1';
      const detail = btn.nextElementSibling;
      if (!detail || !detail.classList.contains('verified-detail')) return;
      btn.addEventListener('click', () => {
        const open = detail.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  // Real swipeable/clickable carousel: dot nav, arrow nav, and touch swipe.
  // Slides are pre-authored in the HTML (data-slide elements); this only
  // wires navigation, it never generates slide content.
  function initCarousels() {
    document.querySelectorAll('[data-carousel].ig-carousel').forEach((root) => {
      if (root.dataset.wired) return;
      root.dataset.wired = '1';
      const slides = Array.from(root.querySelectorAll('.ig-slide'));
      const dotsWrap = root.querySelector('.ig-carousel-dots');
      const prevBtn = root.querySelector('.ig-carousel-prev');
      const nextBtn = root.querySelector('.ig-carousel-next');
      if (!slides.length) return;
      let i = 0;
      if (dotsWrap) {
        dotsWrap.innerHTML = slides.map((_, idx) => `<button type="button" aria-label="Slide ${idx + 1}"></button>`).join('');
      }
      const dots = dotsWrap ? Array.from(dotsWrap.children) : [];
      function show(idx) {
        i = Math.max(0, Math.min(slides.length - 1, idx));
        slides.forEach((s, n) => s.classList.toggle('active', n === i));
        dots.forEach((d, n) => d.classList.toggle('active', n === i));
        if (prevBtn) prevBtn.disabled = i === 0;
        if (nextBtn) nextBtn.disabled = i === slides.length - 1;
      }
      dots.forEach((d, idx) => d.addEventListener('click', () => show(idx)));
      if (prevBtn) prevBtn.addEventListener('click', () => show(i - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => show(i + 1));
      const frame = root.querySelector('.ig-carousel-frame');
      if (frame) {
        let startX = null;
        frame.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
        frame.addEventListener('touchend', (e) => {
          if (startX == null) return;
          const dx = e.changedTouches[0].clientX - startX;
          if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
          startX = null;
        }, { passive: true });
      }
      show(0);
    });
  }

  // Insight-note source toggle: keeps the citation to a short link by
  // default, with the fuller methodology/caveat text available on demand
  // rather than printed inline every time (a real complaint: the citation
  // was reading longer than the lesson itself).
  function initInsightNotes() {
    document.querySelectorAll('.insight-source-toggle').forEach((btn) => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = '1';
      const detail = btn.parentElement.nextElementSibling;
      if (!detail || !detail.classList.contains('insight-source-detail')) return;
      btn.addEventListener('click', () => {
        const open = detail.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.textContent = open ? 'Hide source detail' : btn.dataset.label;
      });
    });
  }
  function openLightbox(src, alt) {
    let box = document.getElementById('demoLightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'demoLightbox';
      box.className = 'demo-lightbox';
      box.innerHTML = '<button class="demo-lightbox-close" aria-label="Close">&times;</button><img>';
      box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('demo-lightbox-close')) box.hidden = true; });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') box.hidden = true; });
      document.body.appendChild(box);
    }
    box.querySelector('img').src = src;
    box.querySelector('img').alt = alt || '';
    box.hidden = false;
  }

  // ======================================================================
  // Channel traffic/conversion calculator -- the real two-column table
  // (revenue share / AOV / orders needed / conversion rate / visits
  // needed), replacing the earlier single-output tool. Shared math so
  // every module (including Google + Website SEO, which intentionally
  // read/write the SAME scenario key) stays consistent with each other
  // and with the central $1K Starting Point.
  //
  // Calculation rules (unrounded until the final displayed number, so
  // rounding never compounds):
  //   remainingGoal      = max(0, 1000 - eligibleRecordedRevenue)
  //   channelTarget(share)= remainingGoal * (share / 100)
  //   ordersNeeded        = ceil(channelTarget / aov)
  //   visitsNeeded        = ceil(channelTarget / aov / (rate / 100))
  // ======================================================================
  function computeChannelMath({ remainingGoal, aov, rate, share }) {
    if (!(remainingGoal >= 0) || !(aov > 0) || !(rate > 0) || !(share > 0)) return null;
    const channelTarget = remainingGoal * (share / 100);
    const ordersNeeded = Math.ceil(channelTarget / aov);
    const visitsNeededExact = channelTarget / aov / (rate / 100); // kept unrounded until display
    const visitsNeeded = Math.ceil(visitsNeededExact);
    return { channelTarget, ordersNeeded, visitsNeeded };
  }

  function fmtMoney(n) { return Number.isFinite(n) ? '$' + Math.round(n).toLocaleString('en-US') : 'Unknown'; }
  function fmtNum(n) { return Number.isFinite(n) ? n.toLocaleString('en-US') : 'Unknown'; }

  /**
   * scenarioKey: the localStorage/link key -- pass the SAME key from two
   * different modules (e.g. Google and Website SEO both pass
   * 'organic-search') to genuinely share one scenario between them,
   * rather than each silently keeping its own separate copy.
   * root: container element with the calculator's inputs/outputs inside
   * (see the markup contract in each channel page).
   */
  // Real, sourced planning examples -- not this member's measured
  // performance. Checked specifically for a "stores earning under
  // $1,000/month" cohort per the 2026-09-16 revision instruction; no
  // publisher breaks benchmark data out at that granularity, so the
  // closest genuinely-scoped alternative (newer/smaller stores generally)
  // is used instead, honestly labeled as such rather than invented.
  const RATE_EXAMPLES = [
    { label: 'Newer or smaller online store', rate: 2, detail: 'Closest available scope to a very-early-stage store -- not specifically stores under $1,000/month, which no source we found breaks out separately.' },
    { label: 'Established online store', rate: 3, detail: 'Typical mid-range figure once a store has some order history and repeat traffic.' },
    { label: "You genuinely don't know yet", rate: 1, detail: "A conservative planning floor so the tool doesn't understate how many visits you'd realistically need." },
  ];
  const RATE_EXAMPLES_SOURCE = 'Aggregated 2026 ecommerce industry benchmarks (Triple Whale, Qualimero, Propel Commerce, citing underlying Dynamic Yield/Statista/Shopify data) -- third-party industry aggregation, not a guarantee for your specific niche or traffic source. Overall reported range is roughly 1.4%-4%, with smaller/newer stores trending toward the low end.';

  // Default labels assume a self-checkout ecommerce-style funnel (visit ->
  // order). A channel whose real unit is different (LinkedIn: a qualified
  // conversation that closes into a deal, not a "visit") passes its own
  // labels via opts.labels so the CALCULATOR TABLE ITSELF says the right
  // word -- fixed 2026-09-21: previously every table hardcoded "Visits
  // needed" and "Visit-to-order conversion rate" regardless of what the
  // surrounding page text told the reader to mentally substitute.
  const DEFAULT_CALC_LABELS = {
    orderValue: 'Order value', orderValueHelp: 'What you charge for the offer',
    rate: 'Visit-to-order conversion rate', rateHelp: 'Out of every 100 visits, how many become an order',
    unitPlural: 'visits', unitSingular: 'visit',
  };

  function wireCalculator(scenarioKey, root, opts) {
    if (!root) return;
    opts = opts || {};
    const L = Object.assign({}, DEFAULT_CALC_LABELS, opts.labels || {});
    const storeKey = 'scrolly_calc_' + scenarioKey + '_v1';
    const els = {
      aov: root.querySelector('[data-calc=aov]'),
      rate: root.querySelector('[data-calc=rate]'),
      remaining: root.querySelector('[data-calc=remaining]'),
      share: root.querySelector('[data-calc=share]'),
      resetBtn: root.querySelector('[data-calc=reset]'),
      linkedNote: root.querySelector('[data-calc=linked-note]'),
      table: root.querySelector('[data-calc=table]'),
    };
    if (!els.aov || !els.rate || !els.remaining || !els.share || !els.table) return;

    // "Don't know your conversion rate?" helper -- injected once, next to
    // the rate field, rather than requiring every calculator-bearing page
    // to hand-author this markup. Never silently assumes a rate on the
    // member's behalf; this only fills the field when they explicitly pick
    // an example, and the example is clearly labeled as exactly that, not
    // measured performance. See RATE_EXAMPLES below for sourcing.
    if (opts.showRateHelper !== false && !root.querySelector('.calc-rate-example-toggle')) {
      const wrap = document.createElement('div');
      wrap.className = 'calc-rate-example-wrap';
      wrap.innerHTML = `<button type="button" class="calc-rate-example-toggle">Don't know your conversion rate? See example rates</button>
        <div class="calc-rate-examples" hidden></div>`;
      els.rate.closest('.tool-field')?.insertAdjacentElement('afterend', wrap);
      const toggle = wrap.querySelector('.calc-rate-example-toggle');
      const panel = wrap.querySelector('.calc-rate-examples');
      toggle.addEventListener('click', () => {
        if (panel.hidden) {
          panel.hidden = false;
          panel.innerHTML = RATE_EXAMPLES.map((ex) => `<button type="button" class="calc-rate-example-btn" data-rate="${ex.rate}"><b>${ex.label}: ${ex.rate}%</b><span>${ex.detail}</span></button>`).join('')
            + `<p class="calc-sublabel" style="margin-top:6px">${RATE_EXAMPLES_SOURCE}</p>`;
          panel.querySelectorAll('.calc-rate-example-btn').forEach((btn) => btn.addEventListener('click', () => {
            els.rate.value = btn.dataset.rate;
            els.rate.dispatchEvent(new Event('input', { bubbles: true }));
            panel.hidden = true;
          }));
        } else {
          panel.hidden = true;
        }
      });
    }

    function loadScenario() {
      try { return JSON.parse(localStorage.getItem(storeKey)) || {}; } catch (e) { return {}; }
    }
    function saveScenario(s) {
      try { localStorage.setItem(storeKey, JSON.stringify(s)); } catch (e) {}
    }

    let linked = { aov: null, remaining: null }; // real business data, once fetched
    const saved = loadScenario();
    // Always set (never just "maybe set") -- this function runs every time
    // a scenario is (re)mounted (e.g. the Instagram/Facebook toggle), and
    // the input elements are shared DOM nodes, so a field must be
    // explicitly cleared when the newly-selected scenario has no saved
    // value, or it would keep showing the PREVIOUS scenario's leftover value.
    els.aov.value = saved.aov != null ? saved.aov : '';
    els.rate.value = saved.rate != null ? saved.rate : '';
    els.remaining.value = saved.remaining != null ? saved.remaining : '';
    els.share.value = saved.share != null ? saved.share : '';
    els.aov.dataset.overridden = saved.overridden?.aov ? '1' : '0';
    els.remaining.dataset.overridden = saved.overridden?.remaining ? '1' : '0';

    function persist() {
      saveScenario({
        aov: els.aov.value === '' ? null : Number(els.aov.value),
        rate: els.rate.value === '' ? null : Number(els.rate.value),
        remaining: els.remaining.value === '' ? null : Number(els.remaining.value),
        share: els.share.value === '' ? null : Number(els.share.value),
        // Which fields the member has manually overridden vs. left linked
        // to their real business data -- so a later refresh of linked data
        // never silently clobbers an intentional what-if edit.
        overridden: {
          aov: els.aov.dataset.overridden === '1',
          remaining: els.remaining.dataset.overridden === '1',
        },
      });
    }

    function row(label, sub, allVal, partVal) {
      return `<tr><td>${label}${sub ? `<br><span class="calc-sublabel">${sub}</span>` : ''}</td><td>${allVal}</td><td>${partVal}</td></tr>`;
    }

    // Recomputed on every render (not just once when linked data first
    // arrives) -- this was a real bug: the note used to be set exactly once
    // in applyLinkedData() and then never touched again, so a member who
    // typed a manual $77 into the AOV field kept seeing "linked from $40"
    // forever. Also deliberately never calls the offer price itself "AOV":
    // it's what the member said they charge, not a measured average across
    // real orders (no order-data integration exists to supply that yet).
    function updateLinkedNote() {
      if (!els.linkedNote) return;
      const aovOverridden = els.aov.dataset.overridden === '1';
      const remOverridden = els.remaining.dataset.overridden === '1';
      const parts = [];
      if (aovOverridden) {
        parts.push('Order value: your own what-if entry, not linked.');
      } else if (linked.aov != null) {
        parts.push(`Order value: linked to your saved offer price (${fmtMoney(linked.aov)}), not a measured average order value.`);
      } else {
        parts.push('Order value: no saved offer price yet. Enter your own below.');
      }
      if (remOverridden) {
        parts.push('Remaining goal: your own what-if entry, not linked.');
      } else if (linked.remaining != null) {
        parts.push(`Remaining goal: linked to your recorded revenue (${fmtMoney(linked.remaining)} left toward $1,000).`);
      } else {
        parts.push('Remaining goal: no recorded revenue yet. Defaults to the full $1,000.');
      }
      els.linkedNote.textContent = parts.join(' ');
    }

    function render() {
      const aov = parseFloat(els.aov.value);
      const rate = parseFloat(els.rate.value);
      const remaining = parseFloat(els.remaining.value);
      const share = parseFloat(els.share.value);
      const all = computeChannelMath({ remainingGoal: remaining, aov, rate, share: 100 });
      const part = computeChannelMath({ remainingGoal: remaining, aov, rate, share });
      updateLinkedNote();
      if (!all) {
        els.table.innerHTML = `<tr><td colspan="3" class="calc-empty">Enter ${L.orderValue.toLowerCase()}, ${L.rate.toLowerCase()}, and remaining revenue above to see both scenarios.</td></tr>`;
        return;
      }
      const partShareLabel = (share > 0 && share <= 100) ? `${share}%` : 'Unknown';
      els.table.innerHTML = `
        <tr><th>Measure</th><th>If this channel supplies ALL sales</th><th>If this channel supplies PART of sales</th></tr>
        ${row('Revenue contribution', 'What this channel needs to produce', fmtMoney(all.channelTarget), part ? fmtMoney(part.channelTarget) : `Set a share above`)}
        ${row(L.orderValue, els.aov.dataset.overridden === '1' ? 'Your own what-if value' : (L.orderValueHelp + ' -- not a measured average'), fmtMoney(aov), fmtMoney(aov))}
        ${row('Orders needed', '', fmtNum(all.ordersNeeded), part ? fmtNum(part.ordersNeeded) : 'Unknown')}
        ${row(L.rate, L.rateHelp, Number.isFinite(rate) ? rate + '%' : 'Unknown', Number.isFinite(rate) ? rate + '%' : 'Unknown')}
        ${row(`${L.unitPlural.charAt(0).toUpperCase() + L.unitPlural.slice(1)} needed`, '', fmtNum(all.visitsNeeded), part ? fmtNum(part.visitsNeeded) : 'Unknown')}
        <tr class="calc-share-row"><td>This channel's planned share</td><td colspan="2">${partShareLabel}${share > 100 ? ' <span class="calc-warn">(a single channel\'s share can\'t exceed 100%)</span>' : ''}</td></tr>
      `;
      recordShare(scenarioKey, share);
    }

    [els.aov, els.remaining].forEach((el) => {
      el.addEventListener('input', () => { el.dataset.overridden = '1'; persist(); render(); });
    });
    [els.rate, els.share].forEach((el) => el.addEventListener('input', () => { persist(); render(); }));

    if (els.resetBtn) {
      els.resetBtn.addEventListener('click', () => {
        if (linked.aov != null) { els.aov.value = linked.aov; els.aov.dataset.overridden = '0'; }
        if (linked.remaining != null) { els.remaining.value = linked.remaining; els.remaining.dataset.overridden = '0'; }
        persist();
        render();
      });
    }

    render();

    return {
      // Called once real business data arrives (see onPersonalize below).
      // Only fills a field if the member hasn't already typed a what-if
      // value into it -- an existing override is never silently replaced.
      applyLinkedData(data) {
        linked = data;
        const aovOverridden = els.aov.dataset.overridden === '1' || saved.overridden?.aov;
        const remOverridden = els.remaining.dataset.overridden === '1' || saved.overridden?.remaining;
        if (data.aov != null && !aovOverridden && els.aov.value === '') { els.aov.value = data.aov; }
        if (data.remaining != null && !remOverridden && els.remaining.value === '') { els.remaining.value = data.remaining; }
        render();
      },
    };
  }

  // A tiny shared registry so "does my planned mix exceed 100%?" can be
  // checked across modules without a backend -- each module records its
  // own last-known share under its own key; total is read back for the
  // warning banner. Never forces channels to sum to exactly 100 (most
  // members won't have filled in every channel), only warns if the sum
  // of whatever IS filled in already exceeds it.
  function recordShare(scenarioKey, share) {
    try {
      const all = JSON.parse(localStorage.getItem('scrolly_calc_shares_v1')) || {};
      if (Number.isFinite(share) && share > 0) all[scenarioKey] = share; else delete all[scenarioKey];
      localStorage.setItem('scrolly_calc_shares_v1', JSON.stringify(all));
    } catch (e) {}
  }
  function totalPlannedShare() {
    try {
      const all = JSON.parse(localStorage.getItem('scrolly_calc_shares_v1')) || {};
      return Object.values(all).reduce((a, b) => a + b, 0);
    } catch (e) { return 0; }
  }

  // ---- Personalization: real profile/connection data only, via the
  // existing /club/overview/state endpoint -- never invented specifics.
  function fetchOverviewState(onResult) {
    const token = getToken();
    if (!token) return;
    fetch('/club/overview/state', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.ok) onResult(d); })
      .catch(() => {});
  }

  // Compact title-adjacent nav: a plain link back to My Plan plus a track
  // switcher. Replaces the old large Previous/All modules/Next card row,
  // which consumed too much space above the title and implied a fixed
  // reading order the three core tracks no longer have -- a member picks a
  // focus track and can change it, rather than reading modules in sequence.
  const TRACKS = [
    { key: 'instagram-facebook', label: 'Instagram & Facebook', href: '/club/channel/instagram-facebook' },
    { key: 'tiktok', label: 'TikTok & TikTok Shop', href: '/club/channel/tiktok' },
    { key: 'linkedin', label: 'LinkedIn', href: '/club/channel/linkedin' },
  ];
  // A real return path for pages reached via a "want more depth" link from
  // inside a track (e.g. Instagram & Facebook -> Groups & Communities).
  // Previously this was a dead end: the destination page had no way back
  // to the specific lesson/tab the member came from, only a generic sidebar.
  // The linking page passes ?return=<url-encoded path+hash>&returnLabel=
  // <name>; this renders a real banner and link back to exactly that.
  function initReturnBanner() {
    const params = new URLSearchParams(location.search);
    const ret = params.get('return');
    const label = params.get('returnLabel');
    if (!ret) return;
    const main = document.querySelector('main');
    if (!main) return;
    const banner = document.createElement('a');
    banner.className = 'return-banner';
    banner.href = ret;
    banner.textContent = `← Back to ${label || 'where you came from'}`;
    main.prepend(banner);
  }

  function buildTrackNav(currentTrackKey) {
    const main = document.querySelector('main');
    if (!main) return;
    // Remembers the last track a member actually viewed, so the Challenge
    // page can scope weekly opportunity packs to their chosen track instead
    // of mixing in the other two tracks' platforms. Not a purchase gate or
    // a locked preference -- switching tracks here updates it automatically.
    try { localStorage.setItem('scrolly_focus_track_v1', currentTrackKey); } catch (e) {}
    const nav = document.createElement('div');
    nav.className = 'track-nav';
    nav.innerHTML = `
      <a class="track-nav-plan" href="/club/modules">&larr; Learn</a>
      <div class="track-nav-switch" role="group" aria-label="Switch track">
        ${TRACKS.map((t) => `<a href="${t.href}"${t.key === currentTrackKey ? ' aria-current="page"' : ''}>${t.label}</a>`).join('')}
      </div>`;
    main.prepend(nav);
  }

  function init(opts) {
    const { moduleKey, track, destinations, checklists = {}, calculators = [], onPersonalize } = opts;
    initReturnBanner();
    if (track) buildTrackNav(track);
    if (destinations) initDestinations(destinations);
    initDemonstrations();
    initInsightNotes();
    initCopyButtons();
    initDownloadButtons();
    initVerifiedNotes();
    initCarousels();
    wireReviewExercise(moduleKey);
    Object.keys(checklists).forEach((groupKey) => wireChecklist(moduleKey, groupKey, checklists[groupKey].ids, checklists[groupKey].onChange));
    const calcHandles = calculators.map((c) => wireCalculator(c.scenarioKey, typeof c.root === 'string' ? document.querySelector(c.root) : c.root, c.opts));
    fetchOverviewState((d) => {
      const remaining = (() => {
        const rev = d.metrics && d.metrics.revenueUsd && d.metrics.revenueUsd.state !== 'unknown' ? d.metrics.revenueUsd.value : 0;
        return Math.max(0, 1000 - rev);
      })();
      const aov = d.profile && d.profile.price != null ? d.profile.price : null; // profile.price isn't in the narrow projection yet in all cases; falls back gracefully
      calcHandles.forEach((h) => { if (h) h.applyLinkedData({ aov, remaining }); });
      if (onPersonalize) onPersonalize(d);
    });
  }

  window.ChannelModule = { init, getToken, loadState, saveState, computeChannelMath, totalPlannedShare, openLightbox, wireCalculator, fetchOverviewState };
})();
