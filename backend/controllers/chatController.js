// <file path="backend/controllers/chatController.js">
const chatRepository = require('../db/chatRepository');
const llmService = require('../services/llmService');
const pool = require('../db/pool');

const systemInstructions = require('../prompts/chatInstructions');
const firstBotMessage = require('../prompts/firstMessage');

const USER_MESSAGE_LIMIT = 15; // Define the limit - CHANGED FROM 10 to 15

/**
 * @file chatController.js
 * @description Controller for handling chat-related API requests.
 */

// Helper function to count user messages
function countUserMessages(messagesArray) {
  if (!Array.isArray(messagesArray)) return 0;
  return messagesArray.filter(msg => msg.role === 'user').length;
}

/**
 * Handles GET /api/conversation
 * Retrieves the current active conversation history for the session.
 */
async function getConversationHistory(req, res) {
  const client = await pool.connect();
  try {
    const conversation = await chatRepository.getActiveConversation(req.sessionID, client);
    let userMessagesCount = 0;
    let limitReachedNotified = false; // Flag to see if limit was already hit in this convo

    if (conversation && conversation.messages && conversation.messages.length > 0) {
      userMessagesCount = countUserMessages(conversation.messages);
      // Check if the last message from the bot in history contains the special notification
      // This is a bit of a heuristic; a dedicated DB flag would be more robust for persisted state.
      const lastBotMessageInHistory = conversation.messages.slice().reverse().find(m => m.role === 'assistant');
      if (lastBotMessageInHistory && lastBotMessageInHistory.limitReachedNotification) {
          limitReachedNotified = true;
      }

      const frontendMessages = conversation.messages.map(msg => ({
        sender: msg.role === 'assistant' ? 'bot' : 'user',
        text: msg.content,
        // Pass through the notification flag if it exists
        limitReachedNotification: msg.limitReachedNotification 
      }));

      res.json({
        messages: frontendMessages,
        // Send current user message count and whether limit was already reached for UI logic
        meta: {
          userMessagesCount: userMessagesCount,
          // If the count of user messages that *led to a bot response* is >= limit,
          // and the limit was already signaled, then the limit is effectively active.
          limitEffectivelyReached: limitReachedNotified && userMessagesCount >= USER_MESSAGE_LIMIT
        }
      });
    } else {
      res.json({ messages: [{ sender: 'bot', text: firstBotMessage }] });
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
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let activeConversation = await chatRepository.getActiveConversation(req.sessionID, client);
    let messagesToSaveInDB = [];
    let currentUserMessageCount = 0; // Count of user messages BEFORE adding the current one

    if (activeConversation) {
      messagesToSaveInDB = activeConversation.messages || [];
      currentUserMessageCount = countUserMessages(messagesToSaveInDB);
    }

    // Check if limit was already reached and signaled for this conversation
    // A more robust way would be a flag on the conversation record itself.
    // For now, we re-check if the last bot message had the notification.
    const limitAlreadySignaled = messagesToSaveInDB.length > 0 &&
                               messagesToSaveInDB[messagesToSaveInDB.length -1].role === 'assistant' &&
                               messagesToSaveInDB[messagesToSaveInDB.length -1].limitReachedNotification;


    if (currentUserMessageCount >= USER_MESSAGE_LIMIT && limitAlreadySignaled) {
      // If limit was hit and signaled, and user tries to send another message
      await client.query('ROLLBACK'); // No changes to DB
      return res.status(403).json({
        error: `Message limit of ${USER_MESSAGE_LIMIT} reached. Please start a new chat to continue.`, // Updated message
        limitExceeded: true // Special flag for frontend
      });
    }

    const userMessageForAI = { role: 'user', content: userMessageContent };
    let messagesForAI;
    let conversationId;

    messagesToSaveInDB.push(userMessageForAI);
    const updatedUserMessageCount = currentUserMessageCount + 1; // Count AFTER adding the current one

    if (activeConversation) {
      conversationId = activeConversation.id;
      messagesForAI = [
        { role: 'system', content: systemInstructions },
        { role: 'assistant', content: firstBotMessage },
        ...(activeConversation.messages || []), // existing messages before current user message
        userMessageForAI
      ];
    } else {
      messagesForAI = [
        { role: 'system', content: systemInstructions },
        { role: 'assistant', content: firstBotMessage },
        userMessageForAI
      ];
    }

    const replyContent = await llmService.getChatbotResponse(messagesForAI);
    const assistantMessageForAI = { role: 'assistant', content: replyContent };
    
    let limitReachedThisTurn = false;
    let notificationMessageForFrontend = null;

    if (updatedUserMessageCount === USER_MESSAGE_LIMIT) {
      limitReachedThisTurn = true;
      // Updated notification message to use the constant
      notificationMessageForFrontend = `You have reached the ${USER_MESSAGE_LIMIT}-message limit. Please start a new chat to continue.`; 
      // Add a marker to the assistant's message in DB for future reference
      assistantMessageForAI.limitReachedNotification = true;
    }

    messagesToSaveInDB.push(assistantMessageForAI);

    if (activeConversation) {
      await chatRepository.updateConversationMessages(conversationId, messagesToSaveInDB, client);
    } else {
      conversationId = await chatRepository.createConversation(req.sessionID, messagesToSaveInDB, client);
    }
    
    await client.query('COMMIT');
    
    const responsePayload = { reply: replyContent };
    if (limitReachedThisTurn) {
      responsePayload.limitReached = true;
      responsePayload.notification = notificationMessageForFrontend;
    }
    responsePayload.currentUserMessageCount = updatedUserMessageCount; // Send updated count

    res.json(responsePayload);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in handleChatMessage:', error);
    // Distinguish API errors from our limit logic if possible
    if (error.message.includes("LLM service") || error.message.includes("API")) {
        res.status(500).json({ error: 'Error processing your message with the AI assistant.' });
    } else {
        res.status(500).json({ error: 'Error processing chat message.' });
    }
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