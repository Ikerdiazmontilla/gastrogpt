// gastrogpt/web-server/server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();

// PORT for this web-server service (Railway injects this as $PORT)
const PORT = process.env.PORT || 3001;

// URL of your INTERNAL backend service.
// Railway will inject this as INTERNAL_BACKEND_URL in production.
const INTERNAL_BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000';

if (!INTERNAL_BACKEND_URL && process.env.NODE_ENV === 'production') {
  console.error(
    'FATAL ERROR: INTERNAL_BACKEND_URL environment variable is not set for production.'
  );
  process.exit(1);
} else if (!INTERNAL_BACKEND_URL) {
  console.warn(
    'Warning: INTERNAL_BACKEND_URL is not set. Using default for local development.'
  );
}

console.log(`[Web Server] Starting up...`);
console.log(`[Web Server] Frontend will be served from this service.`);
console.log(
  `[Web Server] API requests to /api will be proxied to: ${INTERNAL_BACKEND_URL}`
);

// 1. Proxy API requests to the backend
app.use(
  '/api',
  createProxyMiddleware({
    target: INTERNAL_BACKEND_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      console.log(
        `[Web Server Proxy] Forwarding request from ${req.originalUrl} to ${INTERNAL_BACKEND_URL}${req.url}`
      );
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(
        `[Web Server Proxy] Received response from ${INTERNAL_BACKEND_URL}${req.url} - Status: ${proxyRes.statusCode}`
      );
    },
    onError: (err, req, res) => {
      console.error('[Web Server Proxy] Proxy error:', err);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Proxy Error: Could not connect to the backend service.');
      }
    }
  })
);

// 2. Serve static files from the React frontend build
const frontendBuildPath = path.join(__dirname, '../frontend/build');
console.log(`[Web Server] Serving static files from: ${frontendBuildPath}`);
app.use(express.static(frontendBuildPath));

// 3. Catch-all for SPA routing via app.use
app.use((req, res) => {
  console.log(
    `[Web Server] Serving index.html for non-API, non-static route: ${req.path}`
  );
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(
    `[Web Server] Frontend server with API proxy listening on port ${PORT}`
  );
  if (
    process.env.NODE_ENV !== 'production' &&
    !process.env.INTERNAL_BACKEND_URL
  ) {
    console.warn(
      `[Web Server] Reminder: For local development, ensure your backend (target for /api) is running at ${INTERNAL_BACKEND_URL}`
    );
  }
});
