const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 3000);
const page = path.join(__dirname, 'public', 'index.html');

http.createServer((request, response) => {
  if (request.url !== '/') {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('No encontrado');
    return;
  }
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(fs.readFileSync(page));
}).listen(port, '127.0.0.1', () => {
  console.log(`Contador disponible en http://127.0.0.1:${port}`);
});
