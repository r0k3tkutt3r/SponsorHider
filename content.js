(() => {
  const AI_OVERVIEW_SELECTOR = [
    '[data-subtree="aio"]',
    '[data-attrid*="AIOverview"]',
    '#m-x-content'
  ].join(',');

  // Ancestors that look like top-level result sections. When we find the AIO
  // container, we walk up to the nearest one of these and hide it too — that
  // kills the surrounding wrapper (and any sibling "Show more" control) that
  // would otherwise leave a blank gap on the page.
  const AI_WRAPPER_STOP_SELECTOR = [
    '#rcnts > div',
    '#center_col > div',
    '#search > div',
    '#rso > div',
    'div[data-hveid]'
  ].join(',');

  const AI_HEADING_PREFIXES = ['AI Overview', 'AI overview'];

  let hideAi = false;

  function applyAiClass() {
    const root = document.documentElement;
    if (!root) return;
    root.classList.toggle('sh-hide-ai', hideAi);
  }

  function scanAi() {
    if (!hideAi || !document.body) return;
    const headings = document.body.querySelectorAll(
      'h1, h2, h3, [role="heading"]'
    );
    for (const h of headings) {
      const text = (h.textContent || '').trim();
      if (!text) continue;
      if (!AI_HEADING_PREFIXES.some((p) => text.startsWith(p))) continue;
      const container = h.closest(AI_OVERVIEW_SELECTOR);
      if (!container) continue;
      let target = container.closest(AI_WRAPPER_STOP_SELECTOR) || container;
      // Step up to the #rso > div section if we're nested inside one —
      // that section owns the "Show more" sibling and the blank-space wrapper.
      const rsoSection = target.closest('#rso > div');
      if (rsoSection && rsoSection !== target) target = rsoSection;
      if (target.dataset.shAiHidden) continue;
      target.style.setProperty('display', 'none', 'important');
      target.dataset.shAiHidden = '1';
    }
  }

  function restoreAi() {
    document.querySelectorAll('[data-sh-ai-hidden="1"]').forEach((el) => {
      el.style.removeProperty('display');
      el.removeAttribute('data-sh-ai-hidden');
    });
  }

  chrome.storage.sync.get({ hideAi: false }, (items) => {
    hideAi = !!items.hideAi;
    applyAiClass();
    scanAi();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync' || !changes.hideAi) return;
    hideAi = !!changes.hideAi.newValue;
    applyAiClass();
    if (hideAi) scanAi();
    else restoreAi();
  });

  const isAmazon = /(^|\.)amazon\.[a-z.]+$/i.test(location.hostname);

  const AMZ_LABEL_SELECTOR = [
    '.puis-sponsored-label-text',
    '.s-sponsored-label-text',
    'span[aria-label="View sponsored information or leave ad feedback"]',
    'a[aria-label^="View sponsored"]',
    'a[href*="/sspa/click"]'
  ].join(',');

  // Widget wrappers that scope a single result/ad card. When a "Sponsored"
  // label is found, we hide the nearest such wrapper — never an ancestor
  // that merely contains sponsored cards among other results.
  const AMZ_CARD_SELECTOR =
    '.s-result-item, [data-cel-widget], .AdHolder, ' +
    '[data-component-type^="s-sponsored-brand"], ' +
    '[data-component-type="s-brand-footer-slot"], ' +
    '[data-component-type="sbx-launchpad"], ' +
    '[data-component-type="sp-sponsored-result"]';

  function isSponsoredCelWidget(el) {
    const id = el.getAttribute && el.getAttribute('data-cel-widget');
    return !!id && /sponsored|sp_atf|sp_btf|sb_atf|sb_btf|sb-video/i.test(id);
  }

  function hideEl(el) {
    if (!el || el.dataset.shAmazonSponsored) return;
    el.dataset.shAmazonSponsored = '1';
    el.style.setProperty('display', 'none', 'important');
  }

  // A .s-result-item sits directly inside the main results grid; hiding its
  // enclosing widget wrapper would take out unrelated results. For anything
  // else (Sponsored Brand cards, AdHolder, etc.), the enclosing widget is
  // the slot wrapper that also owns the heading / "Trending now" text.
  function hideCardAndWidget(card) {
    if (!card) return;
    hideEl(card);
    if (card.matches('.s-result-item')) return;
    const widget = card.closest('[data-cel-widget], .s-widget-container');
    if (widget && widget !== card) hideEl(widget);
  }

  function scanAmazon() {
    if (!isAmazon || !document.body) return;

    // 1. Label-based detection: hide the nearest card and, for non-result
    //    widgets, the slot wrapper around it (so headings disappear too).
    const labels = document.body.querySelectorAll(AMZ_LABEL_SELECTOR);
    for (const label of labels) {
      const card = label.closest(AMZ_CARD_SELECTOR);
      if (card) hideCardAndWidget(card);
    }

    // 2. Class-based detection for Sponsored Brand inline cards that have
    //    no "Sponsored" text inside the DOM we can see.
    const sbCards = document.body.querySelectorAll(
      '.sb-desktop:not([data-sh-amazon-sponsored]), ' +
        '.sb-mobile:not([data-sh-amazon-sponsored]), ' +
        '[data-card-metrics-id^="sb-"]:not([data-sh-amazon-sponsored])'
    );
    for (const card of sbCards) hideCardAndWidget(card);

    // 3. Widget-id based detection for brand carousels whose own
    //    data-cel-widget already calls itself sponsored.
    const widgets = document.body.querySelectorAll(
      '[data-cel-widget]:not([data-sh-amazon-sponsored])'
    );
    for (const w of widgets) {
      if (isSponsoredCelWidget(w)) hideEl(w);
    }
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      applyAiClass();
      scanAi();
      scanAmazon();
    });
  }

  function start() {
    if (!document.body) return;
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    schedule();
  }

  if (document.body) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  }
})();
