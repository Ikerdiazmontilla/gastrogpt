// <file path="backend/routes/questionnaireRoutes.js">
const express = require('express');
const questionnaireController = require('../controllers/questionnaireController');

/**
 * @file questionnaireRoutes.js
 * @description Defines routes related to the questionnaire feature.
 */

const router = express.Router();

// POST /api/questionnaire - Submit questionnaire and get recommendations
router.post('/questionnaire', questionnaireController.handleQuestionnaireSubmission);

module.exports = router;
// </file>