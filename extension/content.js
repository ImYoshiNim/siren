// Runs on the Siren home page; relays the page's alarm signal to the extension.
document.documentElement.dataset.sirenHelper = '1';

window.addEventListener('message', (e) => {
  if (e.source !== window || !e.data || e.data.source !== 'siren') return;
  if (e.data.type === 'alarm') chrome.runtime.sendMessage({ type: 'siren-alarm' });
  if (e.data.type === 'stop') chrome.runtime.sendMessage({ type: 'siren-stop' });
});
