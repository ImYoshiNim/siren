chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!sender.tab) return;
  if (msg.type === 'siren-alarm') takeOver(sender.tab);
  if (msg.type === 'siren-stop') restore(sender.tab);
});

async function takeOver(sirenTab) {
  const tabs = await chrome.tabs.query({});

  // Pause media and leave fullscreen in every other web page.
  await Promise.all(
    tabs
      .filter((t) => t.id !== sirenTab.id && /^(https?|file):/.test(t.url || ''))
      .map((t) =>
        chrome.scripting
          .executeScript({
            target: { tabId: t.id, allFrames: true },
            func: () => {
              document.querySelectorAll('video, audio').forEach((m) => m.pause());
              if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            },
          })
          .catch(() => {})
      )
  );

  // Remember the window's state so it can be put back when the alarm stops.
  const win = await chrome.windows.get(sirenTab.windowId);
  const { prevState } = await chrome.storage.session.get('prevState');
  if (!prevState) {
    await chrome.storage.session.set({
      prevState: { windowId: win.id, state: win.state === 'minimized' ? 'normal' : win.state },
    });
  }

  // Bring the Siren tab to the front and make the window fullscreen.
  await chrome.tabs.update(sirenTab.id, { active: true });
  if (win.state === 'minimized') await chrome.windows.update(win.id, { state: 'normal' });
  await chrome.windows.update(win.id, { focused: true, state: 'fullscreen' });
}

async function restore(sirenTab) {
  const { prevState } = await chrome.storage.session.get('prevState');
  if (!prevState) return;
  await chrome.storage.session.remove('prevState');
  if (prevState.windowId !== sirenTab.windowId || prevState.state === 'fullscreen') return;
  await chrome.windows.update(prevState.windowId, { state: prevState.state }).catch(() => {});
}
