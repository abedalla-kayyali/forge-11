const http = require('http');
const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname);
const MIME = { html:'text/html', js:'application/javascript', css:'text/css', json:'application/json', png:'image/png', ico:'image/x-icon', svg:'image/svg+xml' };

http.createServer((req, res) => {
  // Allow CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // POST /save-icons — accepts { icon192: base64, icon512: base64 }
  if (req.method === 'POST' && req.url === '/save-icons') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.icon192) fs.writeFileSync(path.join(ROOT, 'icons', 'icon-192.png'), Buffer.from(data.icon192, 'base64'));
        if (data.icon512) fs.writeFileSync(path.join(ROOT, 'icons', 'icon-512.png'), Buffer.from(data.icon512, 'base64'));
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({ok:true}));
        console.log('[FORGE] Icons saved to icons/ folder');
      } catch(e) {
        res.writeHead(500); res.end('Error: ' + e.message);
      }
    });
    return;
  }

  const url  = req.url === '/' ? '/index.html' : req.url;
  const file = path.join(ROOT, url.split('?')[0]);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + file); return; }
    const ext = path.extname(file).slice(1).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
}).listen(8765, () => console.log('FORGE server running at http://localhost:8765'));
