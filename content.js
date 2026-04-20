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

  let blockSponsors = true;
  let hideAi = false;

  function applyRootClasses() {
    const root = document.documentElement;
    if (!root) return;
    root.classList.toggle('sh-hide-sponsored', blockSponsors);
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

  function restoreSponsored() {
    document
      .querySelectorAll(
        '[data-sh-google-sponsored="1"], [data-sh-amazon-sponsored="1"]'
      )
      .forEach((el) => {
        el.style.removeProperty('display');
        el.removeAttribute('data-sh-google-sponsored');
        el.removeAttribute('data-sh-amazon-sponsored');
      });
  }

  chrome.storage.sync.get({ blockSponsors: true, hideAi: false }, (items) => {
    blockSponsors = items.blockSponsors !== false;
    hideAi = !!items.hideAi;
    applyRootClasses();
    scanAi();
    scanGoogle();
    scanAmazon();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;

    if (changes.blockSponsors) {
      blockSponsors = changes.blockSponsors.newValue !== false;
    }

    if (changes.hideAi) {
      hideAi = !!changes.hideAi.newValue;
    }

    applyRootClasses();

    if (changes.blockSponsors) {
      if (blockSponsors) {
        scanGoogle();
        scanAmazon();
      } else {
        restoreSponsored();
      }
    }

    if (changes.hideAi) {
      if (hideAi) scanAi();
      else restoreAi();
    }
  });

  const isGoogle = /(^|\.)google\.[a-z.]+$/i.test(location.hostname);

  function scanGoogle() {
    if (!blockSponsors || !isGoogle || !document.body) return;
    const candidates = document.body.querySelectorAll(
      '.MjjYud:not([data-sh-google-sponsored])'
    );
    for (const el of candidates) {
      const headings = el.querySelectorAll('h1,h2,h3,[role="heading"]');
      for (const h of headings) {
        if (/sponsored result/i.test(h.textContent || '')) {
          el.dataset.shGoogleSponsored = '1';
          el.style.setProperty('display', 'none', 'important');
          break;
        }
      }
    }
  }

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

  function hasOrganicAmazonResults(el) {
    return !!el?.querySelector(
      '.s-result-item:not([data-component-type="sp-sponsored-result"])'
    );
  }

  function findAmazonTextShell(el) {
    let current = el;
    while (current && current !== document.body) {
      if (
        current.matches?.('.a-section.a-spacing-none') &&
        current.parentElement?.classList.contains('sg-col-inner')
      ) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  // A .s-result-item sits directly inside the main results grid; hiding its
  // enclosing widget wrapper would take out unrelated results. For anything
  // else (Sponsored Brand cards, AdHolder, etc.), the enclosing widget is
  // the slot wrapper that also owns the heading / "Trending now" text.
  function hideCardAndWidget(card) {
    if (!card) return;
    hideEl(card);
    if (card.matches('.s-result-item')) return;
    const textShell = findAmazonTextShell(card);
    if (textShell && textShell !== card && !hasOrganicAmazonResults(textShell)) {
      hideEl(textShell);
    }
    const widget = card.closest('[data-cel-widget], .s-widget-container');
    if (widget && widget !== card && !hasOrganicAmazonResults(widget)) {
      hideEl(widget);
    }
  }

  function scanAmazon() {
    if (!blockSponsors || !isAmazon || !document.body) return;

    // 1. Label-based detection: hide the nearest card and, for non-result
    //    widgets, the slot wrapper around it (so headings disappear too).
    const labels = document.body.querySelectorAll(AMZ_LABEL_SELECTOR);
    for (const label of labels) {
      const textShell = findAmazonTextShell(label);
      if (textShell && !hasOrganicAmazonResults(textShell)) hideEl(textShell);
      const card = label.closest(AMZ_CARD_SELECTOR);
      if (card) {
        hideCardAndWidget(card);
      } else {
        // Section-level sponsored label (e.g. "Customers frequently viewed")
        const section = label.closest(
          '[data-cel-widget], [data-component-type], .s-widget-container'
        );
        if (
          section &&
          !section.dataset.shAmazonSponsored &&
          !section.matches('.s-main-slot, [data-cel-widget="MAIN-SEARCH-RESULTS"]')
        ) {
          hideEl(section);
        }
      }
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

    // 4. Text-based: detect section-level "Sponsored" labels that aren't
    //    caught by selector-based passes (e.g. "Customers frequently viewed").
    const secondarySpans = document.body.querySelectorAll(
      '.a-size-base.a-color-secondary:not([data-sh-amazon-sponsored]), ' +
      'span.puis-sponsored-label-text:not([data-sh-amazon-sponsored])'
    );
    for (const span of secondarySpans) {
      const ownText = [...span.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent.trim())
        .join('');
      if (ownText !== 'Sponsored') continue;
      const section = span.closest(
        '[data-cel-widget], [data-component-type], .s-widget-container'
      );
      if (
        section &&
        !section.dataset.shAmazonSponsored &&
        !section.matches('.s-main-slot, [data-cel-widget="MAIN-SEARCH-RESULTS"]')
      ) {
        hideEl(section);
      }
    }
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      applyRootClasses();
      scanAi();
      scanGoogle();
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
