// backend/controllers/chatController.js
const chatRepository = require('../db/chatRepository');
const llmService = require('../services/llmService');
const pool = require('../db/pool');
const { transformMenuForLanguage } = require('../utils/menuTransformer'); // Import the new utility

const USER_MESSAGE_LIMIT = 15;

function countUserMessages(messagesArray) {
  if (!Array.isArray(messagesArray)) return 0;
  return messagesArray.filter(msg => msg.role === 'user').length;
}

async function getConversationHistory(req, res) {
  const client = req.dbClient;
  try {
    const conversation = await chatRepository.getActiveConversation(req.sessionID, client);
    
    // Determine user language from header, default to 'es'
    const userLang = req.get('Accept-Language') || 'es';
    
    const configResult = await client.query("SELECT value FROM configurations WHERE key = 'frontend_welcome_message'");
    const welcomeMessages = JSON.parse(configResult.rows[0]?.value || '{}');
    const welcomeMessage = welcomeMessages[userLang] || welcomeMessages.es || 'Hola, ¿en qué puedo ayudarte?';

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
      res.json({ messages: [{ sender: 'bot', text: welcomeMessage }] });
    }
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    res.status(500).json({ error: 'Error retrieving conversation history.' });
  }
}

async function handleChatMessage(req, res) {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required and must be text.' });
  }
  const userMessageContent = message.trim();
  const client = req.dbClient;
  
  // Get the user's language from the header, defaulting to Spanish.
  const userLang = req.get('Accept-Language') || 'es';

  try {
    await client.query('BEGIN');

    const menuPromise = client.query('SELECT data FROM menu WHERE id = 1');
    const configPromise = client.query("SELECT key, value FROM configurations WHERE key IN ('llm_instructions', 'llm_first_message')");
    
    const [menuResult, configResult] = await Promise.all([menuPromise, configPromise]);

    const fullMenuData = menuResult.rows[0]?.data;
    const configs = configResult.rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
    
    const systemInstructionsTemplate = configs.llm_instructions;
    const firstBotMessage = configs.llm_first_message; 

    if (!fullMenuData || !systemInstructionsTemplate || !firstBotMessage) {
        throw new Error('Configuración esencial para el LLM (menú, instrucciones, primer mensaje) no encontrada en la BBDD.');
    }

    // Use the transformer to get a clean, single-language menu for the LLM.
    const singleLanguageMenu = transformMenuForLanguage(fullMenuData, userLang);
    
    const systemInstructions = systemInstructionsTemplate.replace(
        '__MENU_JSON_PLACEHOLDER__',
        JSON.stringify(singleLanguageMenu, null, 2)
    );

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