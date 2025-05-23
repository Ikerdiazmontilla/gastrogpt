// <file path="backend/routes/index.js">
const express = require('express');
const chatRoutes = require('./chatRoutes');
const questionnaireRoutes = require('./questionnaireRoutes');

/**
 * @file index.js (in routes)
 * @description Main router file that aggregates all feature-specific routers.
 * This helps in organizing routes and mounting them cleanly in server.js.
 */

const router = express.Router();

// Mount feature-specific routers under the /api prefix (or keep them at root if preferred)
router.use('/', chatRoutes); // e.g., /api/chat, /api/conversation
router.use('/', questionnaireRoutes); // e.g., /api/questionnaire

// Example of a simple health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'API is healthy' });
});

module.exports = router;
// </file>