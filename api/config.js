const { CHANNEL, env } = require('./_siren');

// Public Pusher settings for the browser (the key is not a secret).
module.exports = (req, res) => {
  res.status(200).json({
    key: env('PUSHER_KEY'),
    cluster: env('PUSHER_CLUSTER'),
    channel: CHANNEL,
    needsKey: !!env('SIREN_SECRET'),
  });
};
