// frontend/src/setupProxy.js (CRA)
// v3-ready version – CommonJS keep-working

const {
  createProxyMiddleware,     // normal v3 API
  /* legacyCreateProxyMiddleware */  // uncomment only if you want runtime warnings
} = require('http-proxy-middleware');

module.exports = function (app) {
  console.log('✅ [Proxy] setupProxy.js loaded');

  app.use(
    // CRA still passes requests that start with /api
    '/api',

    createProxyMiddleware({
      // v3 **no longer** keeps '/api', so include it yourself…
      target: 'http://localhost:5000/api',
      changeOrigin: true,

      // …or keep target as-is and restore the path explicitly
      // target: 'http://localhost:5000',
      // pathRewrite: (path) => `/api${path}`,

      /** ---- new v3 logger ---- */
      logger: console,

      /** ---- event hooks now live inside `on` ---- */
      on: {
        proxyReq(proxyReq, req, res) {
          console.log(`[Proxy] ${req.method} ${req.originalUrl}`);
          if (req.headers.host) {
            proxyReq.setHeader('Host', req.headers.host);
          }
        },
        error(err, req, res) {
          console.error('[Proxy] error:', err);
        },
      },
      // Any http-proxy options (ws, secure, headers, …) are still valid
    }),
  );
};
