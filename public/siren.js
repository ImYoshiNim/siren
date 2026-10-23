// Shared by the home and button pages: Pusher connection + password + trigger/stop calls.

// The /button password, remembered in this browser after a successful login.
const savedPassword = {
  get() { try { return localStorage.getItem('sirenKey') || ''; } catch { return ''; } },
  set(v) { try { v ? localStorage.setItem('sirenKey', v) : localStorage.removeItem('sirenKey'); } catch {} },
};

async function getConfig() {
  return (await fetch('/api/config')).json();
}

// Resolves true if the password is accepted (or none is required).
async function checkPassword(password) {
  const r = await fetch('/api/login', { method: 'POST', headers: { 'X-Siren-Key': password } });
  return r.ok;
}

// Resolves false if the server rejected the saved password.
async function sendAlarm(on) {
  const r = await fetch(on ? '/api/trigger' : '/api/stop', {
    method: 'POST',
    headers: { 'X-Siren-Key': savedPassword.get() },
  });
  if (r.status === 401) return false;
  if (!r.ok) alert((await r.json().catch(() => ({}))).message || 'Request failed');
  return true;
}

// Calls onAlarm(true|false) on every state change, onStatus(text, connected) on connection changes.
async function connectSiren({ onAlarm, onStatus }) {
  const config = await getConfig();
  if (!config.key) return onStatus('Pusher is not configured on the server', false);

  const pusher = new Pusher(config.key, { cluster: config.cluster });
  const channel = pusher.subscribe(config.channel);
  channel.bind('state', (msg) => onAlarm(msg.alarm));
  channel.bind('pusher:cache_miss', () => onAlarm(false));
  pusher.connection.bind('state_change', ({ current }) => {
    if (current === 'connected') onStatus(null, true);
    else onStatus(current === 'connecting' ? 'Connecting…' : 'Disconnected — retrying…', false);
  });
}
