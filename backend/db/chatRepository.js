// backend/db/chatRepository.js
const pool = require('./pool');
const { v4: uuidv4 } = require('uuid');

/**
 * @file chatRepository.js
 * @description Repository for handling all database interactions related to chat conversations.
 * Uses the shared connection pool.
 */

/**
 * Retrieves the most recent active chat conversation for a given session ID.
 * @param {string} sessionId - The session ID.
 * @param {object} [existingClient] - Optional existing DB client for transactions.
 * @returns {Promise<object|null>} The conversation object or null if not found.
 */
async function getActiveConversation(sessionId, existingClient) {
  const client = existingClient || await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, messages FROM chat_conversations WHERE session_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
      [sessionId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    if (!existingClient) client.release();
  }
}

/**
 * New: Retrieves a conversation by its UUID.
 * @param {string} conversationId - The UUID of the conversation.
 * @param {object} [existingClient] - Optional existing DB client for transactions.
 * @returns {Promise<object|null>} The conversation object or null if not found.
 */
async function getConversationById(conversationId, existingClient) {
  const client = existingClient || await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, messages FROM chat_conversations WHERE id = $1 LIMIT 1',
      [conversationId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    if (!existingClient) client.release();
  }
}

/**
 * Creates a new active chat conversation.
 * @param {string} sessionId - The session ID.
 * @param {Array<object>} messages - The initial messages for the conversation.
 * @param {object} [existingClient] - Optional existing DB client for transactions.
 * @returns {Promise<string>} The ID of the newly created conversation.
 */
async function createConversation(sessionId, messages, existingClient) {
  const client = existingClient || await pool.connect();
  const conversationId = uuidv4();
  try {
    const result = await client.query(
      'INSERT INTO chat_conversations (id, session_id, messages, is_active) VALUES ($1, $2, $3, TRUE) RETURNING id',
      [conversationId, sessionId, JSON.stringify(messages)]
    );
    console.log(`New chat conversation ${result.rows[0].id} created for session ${sessionId}`);
    return result.rows[0].id;
  } finally {
    if (!existingClient) client.release();
  }
}

/**
 * Updates an existing chat conversation's messages.
 * @param {string} conversationId - The ID of the conversation to update.
 * @param {Array<object>} messages - The new set of messages.
 * @param {object} [existingClient] - Optional existing DB client for transactions.
 * @returns {Promise<void>}
 */
async function updateConversationMessages(conversationId, messages, existingClient) {
  const client = existingClient || await pool.connect();
  try {
    await client.query(
      'UPDATE chat_conversations SET messages = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(messages), conversationId]
    );
    console.log(`Chat conversation ${conversationId} updated.`);
  } finally {
    if (!existingClient) client.release();
  }
}

/**
 * Marks all active chat conversations for a session as inactive.
 * @param {string} sessionId - The session ID.
 * @param {object} [existingClient] - Optional existing DB client for transactions.
 * @returns {Promise<Array<string>>} Array of IDs of conversations marked inactive.
 */
async function archiveActiveConversations(sessionId, existingClient) {
  const client = existingClient || await pool.connect();
  try {
    const updateResult = await client.query(
      'UPDATE chat_conversations SET is_active = FALSE, updated_at = NOW() WHERE session_id = $1 AND is_active = TRUE RETURNING id',
      [sessionId]
    );
    const deactivatedIds = updateResult.rows.map(r => r.id);
    if (deactivatedIds.length > 0) {
      console.log(`Chat conversation(s) ${deactivatedIds.join(', ')} marked as inactive for session ${sessionId}.`);
    } else {
      console.log(`No active chat conversations found to mark as inactive for session ${sessionId}.`);
    }
    return deactivatedIds;
  } finally {
    if (!existingClient) client.release();
  }
}

module.exports = {
  getActiveConversation,
  getConversationById,
  createConversation,
  updateConversationMessages,
  archiveActiveConversations,
};