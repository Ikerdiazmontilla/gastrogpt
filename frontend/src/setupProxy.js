// frontend/src/setupProxy.js

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // LOG DE ARRANQUE: Si ves esto en la consola del frontend al iniciar,
  // sabremos que Create React App ha encontrado y cargado este archivo.
  console.log('✅ [Proxy] Fichero setupProxy.js cargado correctamente.');

  app.use(
    '/api', // Solo intercepta las peticiones que empiecen por /api
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true, // Esencial para que el backend reciba el Host correcto
      logLevel: 'debug',   // Imprime información detallada del proxy en la consola del frontend
      
      onProxyReq: (proxyReq, req, res) => {
        // LOG DE EJECUCIÓN: Cada vez que una petición es interceptada,
        // veremos esto en la consola del frontend.
        console.log(`✅ [Proxy] Interceptada petición: ${req.method} ${req.originalUrl}`);
        console.log(`✅ [Proxy] Enviando con Host Header: ${req.headers.host}`);
        
        if (req.headers.host) {
          proxyReq.setHeader('Host', req.headers.host);
        }
      },
      onError: (err, req, res) => {
        // LOG DE ERROR: Si el proxy falla, lo veremos aquí.
        console.error('❌ [Proxy] Error en el proxy:', err);
      }
    })
  );
};