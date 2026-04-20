const blockSponsorsCheckbox = document.getElementById('blockSponsors');
const checkbox = document.getElementById('hideAi');
const status = document.getElementById('status');
const sponsorHint = document.getElementById('sponsorHint');
const aiHint = document.getElementById('aiHint');

chrome.storage.sync.get({ blockSponsors: true, hideAi: false }, (items) => {
  const blockSponsors = items.blockSponsors !== false;
  blockSponsorsCheckbox.checked = blockSponsors;
  checkbox.checked = !!items.hideAi;
  updateSponsorCopy(blockSponsors);
  updateAiHint(checkbox.checked);
});

blockSponsorsCheckbox.addEventListener('change', () => {
  chrome.storage.sync.set({ blockSponsors: blockSponsorsCheckbox.checked });
  updateSponsorCopy(blockSponsorsCheckbox.checked);
});

checkbox.addEventListener('change', () => {
  chrome.storage.sync.set({ hideAi: checkbox.checked });
  updateAiHint(checkbox.checked);
});

function updateSponsorCopy(on) {
  status.textContent = on
    ? 'Sponsored results on Google Search, Google Shopping, and Amazon are hidden automatically.'
    : 'Sponsored results are currently allowed to appear.';

  sponsorHint.textContent = on
    ? 'Turn this off to temporarily allow sponsored listings and ads.'
    : 'Turn this on to hide sponsored listings and ads again.';
}

function updateAiHint(on) {
  aiHint.textContent = on
    ? 'AI Overview will be removed on the next search.'
    : 'AI Overview is currently shown by Google.';
}
