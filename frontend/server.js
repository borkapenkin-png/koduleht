const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const BUILD_DIR = path.join(__dirname, 'build');
const BACKEND_URL = process.env.BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const PORT = Number(process.env.PORT || 3000);
const ENABLE_BACKEND_SSR_REFRESH = process.env.ENABLE_BACKEND_SSR_REFRESH === 'true';

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.map': 'application/json',
};

function fetchSSR(pagePath) {
  return new Promise((resolve, reject) => {
    const ssrPath = pagePath === '/' ? '/api/ssr/home' : `/api/ssr${pagePath}`;
    const client = BACKEND_URL.startsWith('https://') ? https : http;
    const req = client.get(`${BACKEND_URL}${ssrPath}`, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && data.length > 500) {
          resolve(data);
        } else {
          reject(new Error(`SSR status ${res.statusCode}, len ${data.length}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function proxyToBackend(req, res) {
  const target = new URL(req.url, BACKEND_URL);
  const client = target.protocol === 'https:' ? https : http;
  const headers = { ...req.headers, host: target.host };

  const proxyReq = client.request(target, {
    method: req.method,
    headers,
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      detail: 'Backend unavailable',
      message: error.message,
    }));
  });

  req.pipe(proxyReq);
}

function serveStaticFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return false;
    }
    // Cache static assets (JS/CSS/images) for 1 year, HTML never
    if (ext === '.html') {
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
    } else {
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000',
      });
    }
    res.end(data);
    return true;
  });
  return true;
}

function sendSPAFallback(res) {
  const indexPath = path.join(BUILD_DIR, 'index.html');
  fs.readFile(indexPath, 'utf-8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  let reqPath = parsedUrl.pathname;

  // Diagnostic endpoint - helps verify which server is running
  if (reqPath === '/__server-info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      server: 'node-static-server',
      time: new Date().toISOString(),
      build_exists: fs.existsSync(BUILD_DIR),
      backend_ssr_refresh: ENABLE_BACKEND_SSR_REFRESH,
    }));
    return;
  }

  if (reqPath.startsWith('/api/')) {
    proxyToBackend(req, res);
    return;
  }

  // Static files (JS, CSS, images, fonts, etc.)
  if (reqPath.startsWith('/static/') || reqPath.startsWith('/images/')) {
    const filePath = path.join(BUILD_DIR, reqPath);
    if (fs.existsSync(filePath)) {
      serveStaticFile(filePath, res);
      return;
    }
  }

  // Known static files at root
  const rootStatics = ['/manifest.json', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/logo192.png', '/logo512.png'];
  if (rootStatics.includes(reqPath) || reqPath.endsWith('.map')) {
    const filePath = path.join(BUILD_DIR, reqPath);
    if (fs.existsSync(filePath)) {
      serveStaticFile(filePath, res);
      return;
    }
  }

  // Admin panel & login - always serve SPA
  if (reqPath === '/admin' || reqPath.startsWith('/admin/') || reqPath === '/login') {
    sendSPAFallback(res);
    return;
  }

  // SPA runtime: always serve the React shell for app routes.
  // Old prerendered HTML files may exist in build/ for legacy SEO export paths,
  // but serving them causes stale markup and broken asset URLs on routes like
  // /hintalaskuri. Static assets are already handled above.
  sendSPAFallback(res);
});

// Optional startup refresh from backend SSR for environments that still rely on it.
function refreshBuildFiles() {
  const pages = [
    { path: '/', file: 'index.html' },
    { path: '/referenssit', file: 'referenssit/index.html' },
    { path: '/ukk', file: 'ukk/index.html' },
  ];

  let attempts = 0;
  const maxAttempts = 12;

  function tryRefresh() {
    attempts++;
    console.log(`[SSG-refresh] Attempt ${attempts}/${maxAttempts} - fetching SSR pages from backend...`);

    let completed = 0;
    let failed = 0;

    pages.forEach(({ path: pagePath, file }) => {
      fetchSSR(pagePath)
        .then((html) => {
          const filePath = path.join(BUILD_DIR, file);
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(filePath, html, 'utf-8');
          console.log(`[SSG-refresh] Updated build/${file}`);
          completed++;
        })
        .catch((err) => {
          failed++;
          console.log(`[SSG-refresh] Failed ${pagePath}: ${err.message}`);
        })
        .finally(() => {
          if (completed + failed === pages.length) {
            if (failed > 0 && attempts < maxAttempts) {
              console.log(`[SSG-refresh] ${failed} pages failed, retrying in 10s...`);
              setTimeout(tryRefresh, 10000);
            } else {
              console.log(`[SSG-refresh] Done: ${completed} updated, ${failed} failed`);
            }
          }
        });
    });
  }

  // Wait 5 seconds for backend to start
  setTimeout(tryRefresh, 5000);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend static server running on port ${PORT} (no-express, pure Node.js)`);
  if (ENABLE_BACKEND_SSR_REFRESH) {
    refreshBuildFiles();
  }
});
