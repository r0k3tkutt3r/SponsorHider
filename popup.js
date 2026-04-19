const checkbox = document.getElementById('hideAi');
const hint = document.getElementById('hint');

chrome.storage.sync.get({ hideAi: false }, (items) => {
  checkbox.checked = !!items.hideAi;
  updateHint(checkbox.checked);
});

checkbox.addEventListener('change', () => {
  chrome.storage.sync.set({ hideAi: checkbox.checked });
  updateHint(checkbox.checked);
});

function updateHint(on) {
  hint.textContent = on
    ? 'AI Overview will be removed on the next search.'
    : 'AI Overview is currently shown by Google.';
}
