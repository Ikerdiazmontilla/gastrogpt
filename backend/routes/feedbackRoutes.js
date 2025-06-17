// backend/routes/feedbackRoutes.js
const express = require('express');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

// POST /api/feedback - Recibe una nueva valoración
router.post('/feedback', feedbackController.handleFeedbackSubmission);

module.exports = router;