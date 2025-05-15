
// <file path="backend/routes/chatRoutes.js">
const express = require('express');
const chatController = require('../controllers/chatController');

/**
 * @file chatRoutes.js
 * @description Defines routes related to chat functionalities.
 * Maps HTTP endpoints to controller functions.
 */

const router = express.Router();

// GET /api/conversation - Retrieve conversation history
router.get('/conversation', chatController.getConversationHistory);

// POST /api/chat - Send a new chat message
router.post('/chat', chatController.handleChatMessage);

// POST /api/reset - Reset/archive the current chat conversation
router.post('/reset', chatController.resetChat);

module.exports = router;
// </file>