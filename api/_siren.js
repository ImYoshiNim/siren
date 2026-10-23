const Pusher = require('pusher');

// Tolerate values pasted with surrounding spaces or quotes.
const env = (name) => (process.env[name] || '').trim().replace(/^(["'])(.*)\1$/, '$2');

const pusher = new Pusher({
  appId: env('PUSHER_APP_ID'),
  key: env('PUSHER_KEY'),
  secret: env('PUSHER_SECRET'),
  cluster: env('PUSHER_CLUSTER'),
  useTLS: true,
});

// "cache-" channels make Pusher replay the last event to new subscribers,
// so a page opened mid-alarm still sees it.
const CHANNEL = 'cache-siren';

function setAlarm(alarm) {
  return async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ message: 'POST only' });
    const secret = env('SIREN_SECRET');
    if (secret && req.headers['x-siren-key'] !== secret) {
      return res.status(401).json({ message: 'Wrong or missing key' });
    }
    await pusher.trigger(CHANNEL, 'state', { alarm });
    res.status(200).json({ alarm });
  };
}

module.exports = { setAlarm, CHANNEL, env };
