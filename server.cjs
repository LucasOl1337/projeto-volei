const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const startPort = Number(process.env.ISA_DASHBOARD_PORT || 5173);
const host = '127.0.0.1';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${host}`);
    const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const lessonAssetPath = requested === '/assets/lesson.css'
      ? path.resolve(root, './assets/lesson.css')
      : null;
    const publicAssetPath = !lessonAssetPath && requested.startsWith('/assets/')
      ? path.resolve(root, `./public${requested}`)
      : null;
    const fullPath = lessonAssetPath || publicAssetPath || path.resolve(root, `.${requested}`);

    if (!fullPath.startsWith(root)) {
      send(res, 403, 'Forbidden');
      return;
    }

    fs.readFile(fullPath, (error, data) => {
      if (error) {
        send(res, 404, 'Not found');
        return;
      }

      send(res, 200, data, mimeTypes[path.extname(fullPath)] || 'application/octet-stream');
    });
  });
}

function listen(port) {
  const server = createServer();

  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      listen(port + 1);
      return;
    }
    throw error;
  });

  server.listen(port, host, () => {
    console.log(`Projeto Isa rodando em http://${host}:${port}`);
  });
}

listen(startPort);
