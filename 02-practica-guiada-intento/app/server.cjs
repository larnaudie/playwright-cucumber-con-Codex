const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end('{"status":"ok"}');
  }
  if (req.url === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let data;
      try { data = JSON.parse(body); } catch {
        res.writeHead(400);
        return res.end();
      }
      setTimeout(() => {
        const valid = data.email === 'senior@example.test' && data.password === 'Correcta123!';
        res.writeHead(valid ? 200 : 401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(valid ? { name: 'Alex' } : { error: 'Credenciales incorrectas' }));
      }, 350 + Math.floor(Math.random() * 1050));
    });
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
});
server.listen(3100, '127.0.0.1', () => console.log('App: http://127.0.0.1:3100'));