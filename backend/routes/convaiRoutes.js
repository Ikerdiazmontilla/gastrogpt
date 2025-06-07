// backend/routes/convaiRoutes.js

const express = require('express');
const convaiController = require('../controllers/convaiController');

/**
 * @file convaiRoutes.js
 * @description Defines routes for Conversational AI features.
 */

const router = express.Router();

// POST /api/convai/signed-url - Generate a temporary URL for the frontend to connect to the voice chat
router.post('/convai/signed-url', convaiController.handleGetSignedUrl);

// POST /api/convai/webhook - Receive the final transcript and order summary from ElevenLabs
// Using express.raw() middleware specifically for this route to get the raw body for signature verification
router.post('/convai/webhook', express.raw({ type: 'application/json' }), convaiController.handleWebhook);

module.exports = router;