// backend/routes/index.js
const express = require('express');
const chatRoutes = require('./chatRoutes');
const questionnaireRoutes = require('./questionnaireRoutes');
const audioRoutes = require('./audioRoutes');
const convaiRoutes = require('./convaiRoutes'); // New: Import the new routes

/**
 * @file index.js (in routes)
 * @description Main router file that aggregates all feature-specific routers.
 * This helps in organizing routes and mounting them cleanly in server.js.
 */

const router = express.Router();

// Mount feature-specific routers
router.use('/', chatRoutes);
router.use('/', questionnaireRoutes);
router.use('/', audioRoutes);
router.use('/', convaiRoutes); // New: Use the new routes

// Example of a simple health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'API is healthy' });
});

module.exports = router;