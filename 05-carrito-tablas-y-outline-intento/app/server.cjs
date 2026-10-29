const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', app: 'carrito-05' }));
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
}).listen(3200, '127.0.0.1', () => console.log('Carrito 05: http://127.0.0.1:3200'));