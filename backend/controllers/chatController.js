// <file path="backend/controllers/chatController.js">
const chatRepository = require('../db/chatRepository');
const llmService = require('../services/llmService');
const pool = require('../db/pool'); // To acquire a client for transactions if needed, though repository handles it now

// Prompts / Static data
const systemInstructions = require('../prompts/instructions');
const firstBotMessage = require('../prompts/firstMessage');

/**
 * @file chatController.js
 * @description Controller for handling chat-related API requests.
 * Orchestrates interactions between routes, services (LLM), and repositories (DB).
 */

/**
 * Handles GET /api/conversation
 * Retrieves the current active conversation history for the session.
 */
async function getConversationHistory(req, res) {
  const client = await pool.connect(); // Manage client connection at controller level
  try {
    const conversation = await chatRepository.getActiveConversation(req.sessionID, client);
    if (conversation && conversation.messages && conversation.messages.length > 0) {
      const frontendMessages = [
        // system and first bot message are implicitly handled by the AI prompt construction
        // and not directly sent to frontend from here if they are just setup for AI.
        // The saved messages are the actual user/bot turns.
        ...conversation.messages.map(msg => ({
          sender: msg.role === 'assistant' ? 'bot' : 'user',
          text: msg.content
        }))
      ];
      res.json({ messages: frontendMessages });
    } else {
      // If no active conversation, frontend expects an empty bot message to start.
      // Or, send an empty array and let frontend display the standard first message.
      // Original code sent: { messages: [{ sender: 'bot', text: '' }] } - let's clarify if this is intended or if firstBotMessage should be used.
      // For consistency with how a new chat starts, sending the actual firstBotMessage might be better.
      // However, if the intent is just to show an empty chat, this is fine.
      // Let's stick to original: one empty bot message if no history.
      res.json({ messages: [{ sender: 'bot', text: '' }] }); 
    }
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    res.status(500).json({ error: 'Error retrieving conversation history.' });
  } finally {
    client.release();
  }
}

/**
 * Handles POST /api/chat
 * Processes a new user message, gets an AI response, and updates the conversation.
 */
async function handleChatMessage(req, res) {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required and must be text.' });
  }
  const userMessageContent = message.trim();
  const client = await pool.connect(); // Manage client for potential multiple DB operations

  try {
    await client.query('BEGIN'); // Start transaction

    let activeConversation = await chatRepository.getActiveConversation(req.sessionID, client);
    const userMessageForAI = { role: 'user', content: userMessageContent };
    let messagesForAI;
    let messagesToSaveInDB;
    let conversationId;

    if (activeConversation) {
      conversationId = activeConversation.id;
      messagesToSaveInDB = activeConversation.messages || []; // Existing messages
      messagesToSaveInDB.push(userMessageForAI); // Add new user message

      messagesForAI = [
        { role: 'system', content: systemInstructions },
        { role: 'assistant', content: firstBotMessage }, // Initial bot message to set context
        ...activeConversation.messages, // Spread existing messages from DB
        userMessageForAI
      ];
    } else {
      // No active conversation, start a new one
      messagesToSaveInDB = [userMessageForAI]; // Start with current user message
      messagesForAI = [
        { role: 'system', content: systemInstructions },
        { role: 'assistant', content: firstBotMessage },
        userMessageForAI
      ];
    }

    // Get AI response
    // The llmService will decide which provider (Gemini/OpenAI) to use.
    const replyContent = await llmService.getChatbotResponse(messagesForAI);
    console.log("AI Reply (Chat Controller):", JSON.stringify(replyContent));
    const assistantMessageForAI = { role: 'assistant', content: replyContent };
    messagesToSaveInDB.push(assistantMessageForAI);

    // Save/Update conversation in DB
    if (activeConversation) {
      await chatRepository.updateConversationMessages(conversationId, messagesToSaveInDB, client);
    } else {
      conversationId = await chatRepository.createConversation(req.sessionID, messagesToSaveInDB, client);
    }
    
    await client.query('COMMIT'); // Commit transaction
    res.json({ reply: replyContent });

  } catch (error) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.error('Error in handleChatMessage:', error);
    res.status(500).json({ error: 'Error processing chat message.' });
  } finally {
    client.release();
  }
}

/**
 * Handles POST /api/reset
 * Archives the current active chat conversation for the session.
 */
async function resetChat(req, res) {
  const client = await pool.connect();
  try {
    await chatRepository.archiveActiveConversations(req.sessionID, client);
    res.json({ message: 'Chat conversation archived. A new one will start on the next message.' });
  } catch (error) {
    console.error('Error in resetChat:', error);
    res.status(500).json({ error: 'Error resetting chat conversation.' });
  } finally {
    client.release();
  }
}

module.exports = {
  getConversationHistory,
  handleChatMessage,
  resetChat,
};
// </file>