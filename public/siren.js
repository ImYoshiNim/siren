// Shared by the home and button pages: Pusher connection + trigger/stop calls.

// Opening a page with ?key=... once remembers the key in this browser.
const urlKey = new URLSearchParams(location.search).get('key');
try { if (urlKey) localStorage.setItem('sirenKey', urlKey); } catch {}
function sirenKey() {
  try { return urlKey || localStorage.getItem('sirenKey') || ''; } catch { return urlKey || ''; }
}

async function sendAlarm(on) {
  const r = await fetch(on ? '/api/trigger' : '/api/stop', {
    method: 'POST',
    headers: { 'X-Siren-Key': sirenKey() },
  });
  if (!r.ok) alert((await r.json().catch(() => ({}))).message || 'Request failed');
}

// Calls onAlarm(true|false) on every state change, onStatus(text, connected) on connection changes.
async function connectSiren({ onAlarm, onStatus }) {
  const config = await (await fetch('/api/config')).json();
  if (!config.key) return onStatus('Pusher is not configured on the server', false);
  if (config.needsKey && !sirenKey()) onStatus('Missing key — open this page with ?key=…', false);

  const pusher = new Pusher(config.key, { cluster: config.cluster });
  const channel = pusher.subscribe(config.channel);
  channel.bind('state', (msg) => onAlarm(msg.alarm));
  channel.bind('pusher:cache_miss', () => onAlarm(false));
  pusher.connection.bind('state_change', ({ current }) => {
    if (current === 'connected') onStatus(null, true);
    else onStatus(current === 'connecting' ? 'Connecting…' : 'Disconnected — retrying…', false);
  });
}
