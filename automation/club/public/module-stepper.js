/* Generic Back/Next stepper for Club module forms. Operates only on
   explicit `.step[data-step]` wrapper divs already placed inside a
   `form.stepper-form` -- it never invents field groupings, renames fields,
   or changes what gets submitted. The existing submit handler, validation,
   and POST endpoint for each module are completely untouched; this only
   toggles which step is visible and gates advancing on the current step's
   own native HTML validity. Current step is remembered per-page in
   sessionStorage so returning to the same tab lands where you left off --
   no new persistent draft storage, matching the app's existing (session-
   scoped, not cross-device) save conventions. */
(function () {
  // Exact-match validation messages -> the step that actually contains the
  // offending field, read directly from each module's own (unchanged)
  // error strings. A stricter, more useful fix than jumping to step 1:
  // the member lands exactly where the problem is, with every field they
  // already filled in still intact (hiding a step only toggles CSS
  // visibility -- it never clears input values).
  const ERROR_STEP_MAPS = {
    '/club/module2': {
      "Please fill in what you sell, what the buyer receives, and who it's for.": 1,
    },
    '/club/module3': {
      'Please describe who is most likely to buy this.': 1,
      'Please describe the functional result the buyer wants.': 3,
      'Please check at least one buying trigger.': 2,
      'Please pick the single strongest current hypothesis.': 2,
      'Please check at least one buying criterion.': 5,
      'Please check at least one place they may discover this.': 6,
      'Please check what your answers above are based on (best guess/intuition is a valid, honest answer).': 8,
    },
    '/club/module4': {
      'Please enter your available marketing hours per week.': 1,
      'Please check at least one format you can realistically create (or "none/unsure").': 2,
    },
    '/club/module6': {
      'Please check at least one (or "not set up yet").': 1,
      'Please select whether the path works on mobile.': 2,
      'Please select what happens for an interested-but-not-ready buyer.': 3,
    },
  };

  function init() {
    const form = document.querySelector('form.stepper-form');
    if (!form) return;
    const steps = Array.from(form.querySelectorAll(':scope > .step'));
    if (steps.length < 2) return;
    // The form's primary action button isn't always type="submit" (module2's
    // is a type="button" that reveals a second, separate card via its own
    // existing JS) -- the last top-level <button> in the form is always the
    // real "do the thing" action regardless of its type, so target that
    // rather than assuming a specific type.
    const formButtons = Array.from(form.children).filter((el) => el.tagName === 'BUTTON');
    const submitBtn = formButtons[formButtons.length - 1];
    if (!submitBtn) return;

    const storeKey = 'scrolly_step_' + location.pathname;
    let current = 0;
    const saved = Number(sessionStorage.getItem(storeKey));
    if (Number.isInteger(saved) && saved >= 0 && saved < steps.length) current = saved;

    const progress = document.createElement('div');
    progress.className = 'stepper-progress';
    form.insertBefore(progress, form.firstChild);

    const nav = document.createElement('div');
    nav.className = 'stepper-nav';
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'stepper-back';
    backBtn.textContent = '← Back';
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'stepper-next';
    nextBtn.textContent = 'Next →';
    nav.appendChild(backBtn);
    nav.appendChild(nextBtn);
    submitBtn.insertAdjacentElement('beforebegin', nav);

    function render() {
      steps.forEach((s, i) => { s.hidden = i !== current; });
      progress.textContent = `Step ${current + 1} of ${steps.length}`;
      backBtn.disabled = current === 0;
      nextBtn.hidden = current === steps.length - 1;
      submitBtn.hidden = current !== steps.length - 1;
      sessionStorage.setItem(storeKey, String(current));
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function stepValid(i) {
      const fields = steps[i].querySelectorAll('input, select, textarea');
      for (const el of fields) {
        if (!el.checkValidity()) { el.reportValidity(); return false; }
      }
      return true;
    }

    backBtn.addEventListener('click', () => { current = Math.max(0, current - 1); render(); });
    nextBtn.addEventListener('click', () => {
      if (!stepValid(current)) return;
      current = Math.min(steps.length - 1, current + 1);
      render();
    });
    form.addEventListener('submit', () => { sessionStorage.removeItem(storeKey); });
    // Some modules validate business rules across the whole form on submit
    // (e.g. "check at least one buying trigger") that native HTML can't
    // express, so a failure can belong to an earlier, now-hidden step.
    // Rather than leaving the member stuck on the last step looking at an
    // error that names a field they can't see -- or just guessing and
    // sending them to step 1 -- look up the exact step that error message
    // belongs to (each module's own unchanged text) and land there, with
    // every already-entered value still intact (hiding a step only
    // toggles visibility, it never clears inputs).
    const errorEl = form.querySelector('#formError, #submitError');
    const errorMap = ERROR_STEP_MAPS[location.pathname] || {};
    submitBtn.addEventListener('click', () => {
      sessionStorage.removeItem(storeKey);
      if (!errorEl) return;
      setTimeout(() => {
        if (errorEl.hidden || !errorEl.textContent.trim()) return;
        const message = errorEl.textContent.trim();
        const targetStep = errorMap[message];
        current = targetStep != null ? Math.max(0, Math.min(steps.length - 1, targetStep - 1)) : 0;
        render();
        // Best-effort: focus the first empty text-ish field, or the first
        // unchecked checkbox in a checklist, so the member's eye lands on
        // roughly the right spot -- not exact for every error type, but
        // better than leaving them to re-scan the whole step.
        const stepEl = steps[current];
        const emptyField = stepEl.querySelector('input[type=text]:placeholder-shown, input[type=number]:placeholder-shown, textarea:placeholder-shown, select');
        const target = emptyField || stepEl.querySelector('input, select, textarea');
        if (target) target.focus({ preventScroll: true });
      }, 400);
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
