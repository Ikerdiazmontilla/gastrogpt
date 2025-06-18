// backend/routes/feedbackRoutes.js
const express = require('express');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

// POST /api/feedback - Receives a new rating submission
router.post('/feedback', feedbackController.handleFeedbackSubmission);

// NEW: POST /api/feedback/track-click - Tracks a click on the Google Review link
router.post('/feedback/track-click', feedbackController.handleGoogleReviewClick);

module.exports = router;