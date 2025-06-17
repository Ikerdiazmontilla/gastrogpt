// backend/routes/index.js
const express = require('express');
const chatRoutes = require('./chatRoutes');
const audioRoutes = require('./audioRoutes');
const configRoutes = require('./configRoutes');
const feedbackRoutes = require('./feedbackRoutes'); // NUEVO

/**
 * @file index.js (in routes)
 * @description Main router file that aggregates all feature-specific routers.
 * This helps in organizing routes and mounting them cleanly in server.js.
 */

const router = express.Router();

// Mount feature-specific routers
router.use('/', chatRoutes);      // e.g., /api/chat, /api/conversation
router.use('/', audioRoutes);     // e.g., /api/transcribe-audio
router.use('/', configRoutes);    // e.g., /api/config
router.use('/', feedbackRoutes);  // NUEVO: e.g., /api/feedback

// Example of a simple health check endpoint
// Lo usamos para verificar que el tenantResolver funciona.
router.get('/health', (req, res) => {
  // req.tenant es añadido por nuestro middleware
  const tenantName = req.tenant ? req.tenant.restaurant_name : 'No Tenant';
  res.status(200).json({ status: 'UP', message: `API is healthy for tenant: ${tenantName}` });
});

module.exports = router;