// backend/controllers/chatController.js
const chatRepository = require('../db/chatRepository');
const llmService = require('../services/llmService');
const pool = require('../db/pool');
// Se elimina la importación de 'transformMenuForLanguage' ya que no se usa aquí.
const { preparePromptsForLlm } = require('../services/promptBuilderService'); // Se importa el nuevo servicio

const USER_MESSAGE_LIMIT = 15;

function countUserMessages(messagesArray) {
  if (!Array.isArray(messagesArray)) return 0;
  return messagesArray.filter(msg => msg.role === 'user').length;
}

async function getConversationHistory(req, res) {
  const client = req.dbClient;
  try {
    const conversation = await chatRepository.getActiveConversation(req.sessionID, client);

    if (conversation && conversation.messages && conversation.messages.length > 0) {
      const userMessagesCount = countUserMessages(conversation.messages);
      const lastBotMessageInHistory = conversation.messages.slice().reverse().find(m => m.role === 'assistant');
      const limitReachedNotified = lastBotMessageInHistory && lastBotMessageInHistory.limitReachedNotification;

      const frontendMessages = conversation.messages.map(msg => ({
        sender: msg.role === 'assistant' ? 'bot' : 'user',
        text: msg.content,
        limitReachedNotification: msg.limitReachedNotification 
      }));

      res.json({
        messages: frontendMessages,
        meta: {
          userMessagesCount: userMessagesCount,
          limitEffectivelyReached: limitReachedNotified && userMessagesCount >= USER_MESSAGE_LIMIT
        }
      });
    } else {
      res.json({ messages: [] });
    }
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    res.status(500).json({ error: 'Error retrieving conversation history.' });
  }
}

async function handleChatMessage(req, res) {
  const { message, language, menu: providedMenu, initialFlowClick } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required and must be text.' });
  }
  if (!language || !providedMenu) {
      return res.status(400).json({ error: 'Language and menu are required in the payload.' });
  }

  const userMessageContent = message.trim();
  const client = req.dbClient;

  try {
    await client.query('BEGIN');

    // MODIFIED: The query now fetches the llm_first_message as a JSON string.
    const configResult = await client.query("SELECT key, value FROM configurations WHERE key IN ('llm_instructions', 'llm_first_message')");
    
    // MODIFIED: This reducer now correctly parses the JSON for llm_first_message.
    const configs = configResult.rows.reduce((acc, row) => {
      if (row.key === 'llm_first_message') {
        try {
          acc[row.key] = JSON.parse(row.value);
        } catch (e) {
          console.error(`Failed to parse llm_first_message JSON for tenant:`, e);
          acc[row.key] = {}; // Fallback to an empty object
        }
      } else {
        acc[row.key] = row.value;
      }
      return acc;
    }, {});
    
    if (!configs.llm_instructions || !configs.llm_first_message) {
        throw new Error('Configuración esencial para el LLM no encontrada en la BBDD.');
    }

    // --- The rest of the logic is now handled by promptBuilderService ---
    const { systemInstructions, firstBotMessage } = preparePromptsForLlm({
        language,
        providedMenu,
        initialFlowClick,
        systemInstructionsTemplate: configs.llm_instructions,
        firstBotMessageTemplate: configs.llm_first_message // Pass the parsed object
    });
    
    // The rest of the function continues as before, but now using the prepared prompts.
    let activeConversation = await chatRepository.getActiveConversation(req.sessionID, client);
    
    let messagesToSaveInDB = [];
    let currentUserMessageCount = 0;

    if (activeConversation) {
      messagesToSaveInDB = activeConversation.messages || [];
      currentUserMessageCount = countUserMessages(messagesToSaveInDB);
    }
    
    const limitAlreadySignaled = messagesToSaveInDB.length > 0 &&
                               messagesToSaveInDB[messagesToSaveInDB.length - 1].role === 'assistant' &&
                               messagesToSaveInDB[messagesToSaveInDB.length - 1].limitReachedNotification;

    if (currentUserMessageCount >= USER_MESSAGE_LIMIT && limitAlreadySignaled) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        error: `Message limit of ${USER_MESSAGE_LIMIT} reached. Please start a new chat to continue.`,
        limitExceeded: true
      });
    }

    const userMessageForAI = { role: 'user', content: userMessageContent };
    let messagesForAI;
    let conversationId;

    messagesToSaveInDB.push(userMessageForAI);
    const updatedUserMessageCount = currentUserMessageCount + 1;

    if (activeConversation) {
      conversationId = activeConversation.id;
      messagesForAI = [
        { role: 'system', content: systemInstructions },
        { role: 'assistant', content: firstBotMessage },
        ...(activeConversation.messages || []),
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
      notificationMessageForFrontend = `You have reached the ${USER_MESSAGE_LIMIT}-message limit. Please start a new chat to continue.`; 
      assistantMessageForAI.limitReachedNotification = true;
    }

    messagesToSaveInDB.push(assistantMessageForAI);

    if (activeConversation) {
      await chatRepository.updateConversationMessages(conversationId, messagesToSaveInDB, client);
    } else {
      conversationId = await chatRepository.createConversation(req.sessionID, messagesToSaveInDB, client);
    }
    
    const responsePayload = { 
        reply: replyContent,
        conversationId: conversationId,
        isFinalMessage: false
    };

    if (replyContent.toLowerCase().includes('llama al camarero')) {
        const feedbackCheck = await pool.query(
            'SELECT id FROM public.feedback WHERE conversation_id = $1 LIMIT 1',
            [conversationId]
        );
        if (feedbackCheck.rows.length === 0) {
            responsePayload.isFinalMessage = true;
        }
    }

    if (limitReachedThisTurn) {
      responsePayload.limitReached = true;
      responsePayload.notification = notificationMessageForFrontend;
    }
    responsePayload.currentUserMessageCount = updatedUserMessageCount;
    
    await client.query('COMMIT');

    res.json(responsePayload);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in handleChatMessage:', error);
    if (error.message.includes("LLM service") || error.message.includes("API")) {
        res.status(500).json({ error: 'Error processing your message with the AI assistant.' });
    } else {
        res.status(500).json({ error: 'Error processing chat message.' });
    }
  }
}

async function resetChat(req, res) {
  const client = req.dbClient;
  try {
    await chatRepository.archiveActiveConversations(req.sessionID, client);
    res.json({ message: 'Chat conversation archived. A new one will start on the next message.' });
  } catch (error) {
    console.error('Error in resetChat:', error);
    res.status(500).json({ error: 'Error resetting chat conversation.' });
  }
}

module.exports = {
  getConversationHistory,
  handleChatMessage,
  resetChat,
};