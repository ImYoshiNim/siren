const { authorized } = require('./_siren');

// Lets the button page check a password before showing the button.
module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'POST only' });
  if (!authorized(req)) return res.status(401).json({ message: 'Wrong password' });
  res.status(200).json({ ok: true });
};
