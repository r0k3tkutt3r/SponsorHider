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
      const target = container.closest(AI_WRAPPER_STOP_SELECTOR) || container;
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

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      applyAiClass();
      scanAi();
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
