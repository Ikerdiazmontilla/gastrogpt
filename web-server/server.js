// <file path="gastrogpts/web-server/server.js">
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();

// PORT for this web-server service (Railway injects this as $PORT)
const PORT = process.env.PORT || 3001; // Default to 3001 for local dev if $PORT isn't set

// URL of your INTERNAL backend service.
// This will be an environment variable set in Railway.
// For local development, it will point to your local backend instance.
// const INTERNAL_BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000'; // Default for local dev
const INTERNAL_BACKEND_URL = process.env.INTERNAL_BACKEND_URL;


if (!INTERNAL_BACKEND_URL && process.env.NODE_ENV === 'production') {
  console.error('FATAL ERROR: INTERNAL_BACKEND_URL environment variable is not set for production.');
  process.exit(1);
} else if (!INTERNAL_BACKEND_URL) {
  console.warn('Warning: INTERNAL_BACKEND_URL is not set. Using default for local development.');
}

console.log(`[Web Server] Starting up...`);
console.log(`[Web Server] Frontend will be served from this service.`);
console.log(`[Web Server] API requests to /api will be proxied to: ${INTERNAL_BACKEND_URL}`);

// 1. Proxy API requests to the backend
// Any request to /api/* will be forwarded to your backend service
app.use('/api', createProxyMiddleware({
  target: INTERNAL_BACKEND_URL,
  changeOrigin: true, // Important for virtual hosted sites and correct cookie domain behavior if backend sets them explicitly
  // No pathRewrite needed because your backend already expects /api routes
  // (app.use('/api', mainRoutes) in backend/server.js)
  onProxyReq: (proxyReq, req, res) => {
    // You can add custom headers here if needed
    // For example, if your backend needs to know the original host:
    // proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
    console.log(`[Web Server Proxy] Forwarding request from ${req.originalUrl} to ${INTERNAL_BACKEND_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Web Server Proxy] Received response from ${INTERNAL_BACKEND_URL}${req.url} - Status: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('[Web Server Proxy] Proxy error:', err);
    // Send a generic error response to the client
    // Check if headers have already been sent
    if (res.headersSent) {
      return;
    }
    res.writeHead(502, { // Bad Gateway, common for proxy errors
      'Content-Type': 'text/plain',
    });
    res.end('Proxy Error: Could not connect to the backend service.');
  }
}));

// 2. Serve static files from the React frontend build
// The path here is relative to where this web-server/server.js is running.
// gastrogpts/web-server/server.js -> ../frontend/build
const frontendBuildPath = path.join(__dirname, '../frontend/build');
console.log(`[Web Server] Serving static files from: ${frontendBuildPath}`);
app.use(express.static(frontendBuildPath));

// 3. The "catchall" handler for SPA routing:
// For any request that doesn't match /api/* or a static file in ../frontend/build,
// send back React's index.html file.
app.get('/*', (req, res) => {
  console.log(`[Web Server] Serving index.html for non-API, non-static route: ${req.path}`);
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Web Server] Frontend server with API proxy listening on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production' && !process.env.INTERNAL_BACKEND_URL) {
    console.warn(`[Web Server] Reminder: For local development, ensure your backend (target for /api) is running at ${INTERNAL_BACKEND_URL}`);
  }
});
// </file>