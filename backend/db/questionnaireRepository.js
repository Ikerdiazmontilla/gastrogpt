
// <file path="backend/db/questionnaireRepository.js">
const pool = require('./pool');
const { v4: uuidv4 } = require('uuid');

/**
 * @file questionnaireRepository.js
 * @description Repository for handling database interactions related to questionnaire submissions.
 */

/**
 * Creates a new questionnaire interaction record.
 * @param {string} sessionId - The session ID.
 * @param {object} submissionData - The data submitted by the user (includes language).
 * @param {string} recommendationText - The AI-generated recommendation text.
 * @param {object} [existingClient] - Optional existing DB client for transactions.
 * @returns {Promise<string>} The ID of the newly created interaction.
 */
async function createQuestionnaireInteraction(sessionId, submissionData, recommendationText, existingClient) {
  const client = existingClient || await pool.connect();
  const interactionId = uuidv4();
  try {
    await client.query(
      'INSERT INTO questionnaire_interactions (id, session_id, submission_data, recommendation_text) VALUES ($1, $2, $3, $4)',
      [interactionId, sessionId, JSON.stringify(submissionData), recommendationText]
    );
    console.log(`New questionnaire interaction ${interactionId} created for session ${sessionId} with language ${submissionData.language || 'N/A'}`);
    return interactionId;
  } finally {
    if (!existingClient) client.release();
  }
}

module.exports = {
  createQuestionnaireInteraction,
};
// </file>