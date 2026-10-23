// Local stand-in for Vercel: serves public/ and runs the api/ functions.
// Run with `npm start` (loads .env). Not used when deployed.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mp3': 'audio/mpeg' };

// Gives the api/ handlers the res.status().json() helpers Vercel provides.
function vercelRes(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };
  return res;
}

http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  const api = pathname.match(/^\/api\/([a-z]+)$/);
  if (api) {
    const file = path.join(__dirname, 'api', `${api[1]}.js`);
    if (!fs.existsSync(file)) return vercelRes(res).status(404).json({ message: 'Not found' });
    try {
      await require(file)(req, vercelRes(res));
    } catch (err) {
      console.error(err);
      vercelRes(res).status(500).json({ message: err.message });
    }
    return;
  }

  // Clean URLs like Vercel: / → index.html, /button → button.html
  const name = pathname === '/' ? 'index.html' : pathname.slice(1);
  const candidates = [name, `${name}.html`].map((n) => path.join(PUBLIC, n));
  const file = candidates.find((f) => f.startsWith(PUBLIC) && fs.existsSync(f) && fs.statSync(f).isFile());
  if (!file) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Siren running locally:`);
  console.log(`  Home:   http://localhost:${PORT}/`);
  console.log(`  Button: http://localhost:${PORT}/button`);
});
