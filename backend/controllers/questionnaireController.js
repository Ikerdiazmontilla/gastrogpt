// <file path="backend/controllers/questionnaireController.js">
const questionnaireRepository = require('../db/questionnaireRepository');
const llmService = require('../services/llmService');
const promptService = require('../services/promptService');
const pool = require('../db/pool'); // To acquire a client if needed

// Prompts / Static data
const questionnaireSystemInstructions = require('../prompts/questionnaire_instructions');

/**
 * @file questionnaireController.js
 * @description Controller for handling questionnaire-related API requests.
 */

/**
 * Handles POST /api/questionnaire
 * Takes user preferences, gets AI recommendations, and stores the interaction.
 */
async function handleQuestionnaireSubmission(req, res) {
  const submissionDataWithLang = req.body; // Contains all form fields + language

  // Basic validation (can be expanded)
  const { tipoComida, precio, alergias, nivelPicante } = submissionDataWithLang;
  if (
    !tipoComida || !Array.isArray(tipoComida) || tipoComida.length === 0 ||
    !precio || !Array.isArray(precio) || precio.length === 0 ||
    !alergias || !Array.isArray(alergias) || // alergias can be empty if "none" is not sent as an item
    !nivelPicante || !Array.isArray(nivelPicante) || nivelPicante.length === 0
    // language field is optional, defaults in promptService
  ) {
    return res.status(400).json({ error: 'Missing required fields or incorrect format for questionnaire.' });
  }

  const client = await pool.connect(); // Manage client for DB operation

  try {
    // Build the user-specific part of the prompt using promptService
    // This prompt will include the "Answer in X language" instruction.
    const userPreferencesPrompt = promptService.buildQuestionnaireUserPrompt(submissionDataWithLang);

    const messagesForQuestionnaireAI = [
      { role: 'system', content: questionnaireSystemInstructions },
      { role: 'user', content: userPreferencesPrompt }
    ];

    // Get AI recommendations
    const recommendationsText = await llmService.getChatbotResponse(messagesForQuestionnaireAI);
    console.log("AI Reply (Questionnaire Controller):", JSON.stringify(recommendationsText));

    // Store the interaction
    await questionnaireRepository.createQuestionnaireInteraction(
      req.sessionID,
      submissionDataWithLang, // Store the full submission data including language
      recommendationsText,
      client
    );

    res.json({ recommendations: recommendationsText });

  } catch (error) {
    console.error('Error in handleQuestionnaireSubmission:', error);
    res.status(500).json({ error: 'Error getting questionnaire recommendations.' });
  } finally {
    client.release();
  }
}

module.exports = {
  handleQuestionnaireSubmission,
};
// </file>