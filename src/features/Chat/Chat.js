// <file path="src/features/Chat/Chat.js">
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './Chat.module.css';
import { ReactComponent as SendIcon } from '../../assets/up-arrow-icon.svg';
import { firstMessageSpanish, firstMessageEnglish } from './firstMessage'; // Frontend's rich welcome message
import { chatSuggestions } from '../../data/translations';

import {
  fetchConversation,
  postChatMessage,
  resetChatConversation,
} from '../../services/apiService';

import { createMarkdownLinkRenderer, markdownUrlTransform } from '../../utils/markdownUtils';

// const USER_MESSAGE_LIMIT = 10; // This constant is defined in backend, frontend uses isLimitReached flag

const Chat = ({ currentLanguage, onViewDishDetails }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Manages loading state, especially for initial history fetch
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [limitNotification, setLimitNotification] = useState('');

  // Determine the rich welcome message text based on the current language
  const firstMessageText = currentLanguage === 'Español' ? firstMessageSpanish : firstMessageEnglish;
  const currentSuggestions = chatSuggestions[currentLanguage] || chatSuggestions['English'];

  // Memoized markdown link renderer
  const CustomLink = useMemo(() =>
    createMarkdownLinkRenderer(onViewDishDetails, styles),
    [onViewDishDetails]
  );

  // useCallback for loading conversation history
  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsLimitReached(false);
    setLimitNotification('');

    // MODIFICATION: Define the rich welcome message object. This will always be the first message.
    const richWelcomeMessageObject = { sender: 'bot', text: firstMessageText };

    try {
      const data = await fetchConversation(); // API call to get conversation history

      let actualConversationHistory = []; // To store messages from DB, excluding any initial bot prompts

      // Check if an existing conversation history was returned (signaled by data.meta)
      if (data.meta && data.messages && data.messages.length > 0) {
        // If history exists, use it.
        // We assume data.messages from backend is the pure turn-by-turn history
        // and does not include the backend's plain `firstBotMessage`.
        actualConversationHistory = data.messages;

        // Handle limit state from backend meta data
        if (data.meta.limitEffectivelyReached) {
          setIsLimitReached(true);
          // Try to find the notification message if it was part of the history
          const lastBotMsgWithNotification = actualConversationHistory.slice().reverse().find(
            m => m.sender === 'bot' && m.limitReachedNotification
          );
          if (lastBotMsgWithNotification) {
             setLimitNotification(
                currentLanguage === 'Español'
                ? "Has alcanzado el límite de 10 mensajes. Por favor, inicia un nuevo chat para continuar."
                : "You have reached the 10-message limit. Please start a new chat to continue."
            );
          }
        }
      }
      // If `data.meta` is not present, it means the backend signaled a new chat
      // by sending its plain `firstBotMessage`. In this case, `actualConversationHistory` remains empty.

      // MODIFICATION: Always prepend the frontend's rich welcome message.
      // If `actualConversationHistory` is empty (new chat), `messages` will be `[richWelcomeMessageObject]`.
      // If `actualConversationHistory` has items, `richWelcomeMessageObject` is added at the start.
      setMessages([richWelcomeMessageObject, ...actualConversationHistory]);

    } catch (err) {
      console.error('Error loading conversation:', err.message);
      setError(`Failed to load history: ${err.message}. Please try again later.`);
      // MODIFICATION: On error, ensure the chat UI still starts with the rich welcome message.
      setMessages([richWelcomeMessageObject]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, firstMessageText, onViewDishDetails]); // Dependencies for useCallback

  // Effect to load conversation when component mounts or dependencies change
  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Effect to scroll to the bottom of messages when messages or notifications change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, limitNotification]);

  const handleSend = async () => {
    if (isLimitReached) return;

    const trimmedInput = input.trim();
    if (trimmedInput === '') return;

    const userMessage = { sender: 'user', text: trimmedInput };
    // MODIFICATION: Add user message to current messages.
    // The rich welcome message is already part of `messages` state.
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setError(null);

    try {
      const data = await postChatMessage(trimmedInput);
      if (data.reply) {
        // MODIFICATION: Add bot's reply to current messages.
        setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: data.reply }]);
      } else if (data.limitExceeded) {
        setError(data.error || (currentLanguage === 'Español' ? "Límite de mensajes alcanzado." : "Message limit reached."));
        setIsLimitReached(true);
        setLimitNotification(data.error || (currentLanguage === 'Español' ? "Por favor, inicia un nuevo chat para continuar." : "Please start a new chat to continue."));
        return;
      } else {
        console.error('Unexpected response from backend (no reply):', data);
        setError('Unexpected server response.');
      }

      if (data.limitReached && data.notification) {
        setIsLimitReached(true);
        setLimitNotification(data.notification);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      let displayError = `Error: ${err.message || 'Failed to send message.'}`;
      if (err.response && err.response.data && err.response.data.limitExceeded) {
        displayError = err.response.data.error || (currentLanguage === 'Español' ? "Límite de mensajes superado. Inicia un nuevo chat." : "Message limit exceeded. Start a new chat.");
        setIsLimitReached(true);
        setLimitNotification(displayError);
      } else if (err.response && err.response.data && err.response.data.error) {
        displayError = err.response.data.error;
      }
      setError(displayError);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLimitReached) {
          handleSend();
      }
    }
  };

  const handleReset = async () => {
    // Don't set isLoading(true) here if loadConversation does it, to avoid double setting.
    // loadConversation will handle resetting states.
    try {
      await resetChatConversation();
      await loadConversation(); // Reloads and prepends rich welcome message.
    } catch (err) {
      console.error('Error resetting conversation:', err.message);
      setError(`Error resetting: ${err.message}`);
      await loadConversation(); // Attempt to reload even on error.
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    if (isLimitReached) return;
    setInput(suggestionText);
  };

  const isInputDisabled = (isLoading && messages.length <= 1 && !error) || isLimitReached; // Adjust messages.length check since welcome message might be present

  return (
    <>
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {/* MODIFICATION:isLoading check considers that `messages` might contain the welcome message during load */}
          {isLoading && messages.length <= 1 && !error && ( // Only show "Loading..." if only welcome message is there (or fewer) and no error
            <div className={`${styles.message} ${styles.system}`}>
              {currentLanguage === 'Español' ? 'Cargando historial...' : 'Loading history...'}
            </div>
          )}
          {error && (!isLimitReached || !limitNotification) && (
            <div className={`${styles.message} ${styles.system} ${styles.error}`}>{error}</div>
          )}

          {/* Map and display messages. This will include the prepended rich welcome message. */}
          {messages.map((msg, index) => (
              <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
                {msg.sender === 'bot' ? (
                  <ReactMarkdown components={{ a: CustomLink }} urlTransform={markdownUrlTransform}>
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>
            ))}
          
          {isLimitReached && limitNotification && (
            <div className={`${styles.message} ${styles.system} ${styles.limitNotification}`}>
              {limitNotification}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={styles.inputWrapper}>
        <div className={styles.inputArea}>
          <input
            type="text"
            placeholder={
              isLimitReached
                ? (currentLanguage === 'Español' ? 'Límite alcanzado. Reinicia el chat.' : 'Limit reached. Reset chat.')
                : (currentLanguage === 'Español' ? 'Escribe tu mensaje...' : 'Write your message...')
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isInputDisabled}
            readOnly={isLimitReached}
          />
          <button
            className={styles.sendMessage}
            onClick={handleSend}
            disabled={isInputDisabled || input.trim() === ''}
          >
            <SendIcon className={styles.sendSvg} />
          </button>
        </div>
        <div className={styles.suggestionsContainer}>
          {currentSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className={styles.suggestionChip}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isInputDisabled}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <button
          onClick={handleReset}
          // MODIFICATION: Adjusted disabled logic for reset button.
          // It's disabled if still loading initial state (messages array only has welcome or is empty) AND not limit reached.
          disabled={(isLoading && messages.length <= 1 && !isLimitReached && !error)}
          className={styles.resetConversationButton}
        >
          {currentLanguage === 'Español' ? 'Nuevo chat' : 'New chat'}
        </button>
      </div>
    </>
  );
};

export default Chat;
// </file>