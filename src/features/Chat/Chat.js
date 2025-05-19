// <file path="src/features/Chat/Chat.js">
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './Chat.module.css';
import { ReactComponent as SendIcon } from '../../assets/up-arrow-icon.svg';
import { firstMessageSpanish, firstMessageEnglish } from './firstMessage';
import { chatSuggestions } from '../../data/translations';

import {
  fetchConversation,
  postChatMessage,
  resetChatConversation,
} from '../../services/apiService';

import { createMarkdownLinkRenderer, markdownUrlTransform } from '../../utils/markdownUtils';

const USER_MESSAGE_LIMIT = 10; // Keep a reference on frontend if needed for UI logic

const Chat = ({ currentLanguage, onViewDishDetails }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [isLimitReached, setIsLimitReached] = useState(false); // New state for limit
  const [limitNotification, setLimitNotification] = useState(''); // New state for notification message

  const firstMessageText = currentLanguage === 'Español' ? firstMessageSpanish : firstMessageEnglish;
  const currentSuggestions = chatSuggestions[currentLanguage] || chatSuggestions['English'];

  const CustomLink = useMemo(() =>
    createMarkdownLinkRenderer(onViewDishDetails, styles),
    [onViewDishDetails] // Removed styles from deps as it's module-scoped
  );

  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsLimitReached(false); // Reset limit state on load
    setLimitNotification('');
    try {
      const data = await fetchConversation();

      // MODIFICATION: Refined logic for handling fetched conversation data.
      // If data.meta exists and there are messages, it's an existing conversation.
      // The backend's getConversationHistory already maps DB messages to the {sender, text} format.
      if (data.meta && data.messages && data.messages.length > 0) {
        setMessages(data.messages); // Use the fetched history as is.

        // Handle limit state from backend meta data
        if (data.meta.limitEffectivelyReached) {
          setIsLimitReached(true);
          // Attempt to find if the limit notification was part of the persisted history
          // Backend should ideally ensure the notification text or a clear flag is present.
          // For now, using a generic message if the flag is true.
          const lastBotMsgWithNotification = data.messages.slice().reverse().find(
            m => m.sender === 'bot' && m.limitReachedNotification // Check for the flag set by backend
          );
          if (lastBotMsgWithNotification) { // If flag found, means limit was reached and noted
             setLimitNotification(
                currentLanguage === 'Español'
                ? "Has alcanzado el límite de 10 mensajes. Por favor, inicia un nuevo chat para continuar."
                : "You have reached the 10-message limit. Please start a new chat to continue."
            );
          }
        }
      }
      // MODIFICATION: If no data.meta, it implies a new chat initialization from the backend.
      // The backend sends its basic `firstBotMessage` (defined in backend/prompts/firstMessage.js).
      // We replace this basic text message with the frontend's rich markdown `firstMessageText`.
      else if (data.messages && data.messages.length === 1 && data.messages[0].sender === 'bot') {
        setMessages([{ sender: 'bot', text: firstMessageText }]);
      }
      // MODIFICATION: Fallback if data.messages is empty or structure is unexpected after backend call.
      // This ensures the chat always starts with some initial message.
      else {
        console.warn("Chat.js: Unexpected data from fetchConversation or empty messages array, initializing with default first message:", data);
        setMessages([{ sender: 'bot', text: firstMessageText }]);
      }

    } catch (err) {
      console.error('Error loading conversation:', err.message);
      setError(`Failed to load history: ${err.message}. Please try again later.`);
      // On error, always initialize with the frontend's rich first message.
      setMessages([{ sender: 'bot', text: firstMessageText }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, firstMessageText, onViewDishDetails]); // Added onViewDishDetails to useCallback deps

  useEffect(() => {
    loadConversation();
  }, [loadConversation]); // loadConversation dependency is now correct due to useCallback

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, limitNotification]); // Scroll when notification appears too

  const handleSend = async () => {
    if (isLimitReached) return; // Prevent sending if limit is already flagged

    const trimmedInput = input.trim();
    if (trimmedInput === '') return;

    const userMessage = { sender: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null);
    // Temporarily re-enable loading state for AI response
    // setIsLoading(true); // This might be too flickery, manage carefully

    try {
      const data = await postChatMessage(trimmedInput);
      if (data.reply) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      } else if (data.limitExceeded) { // Specific handler for 11th+ message
        setError(data.error || (currentLanguage === 'Español' ? "Límite de mensajes alcanzado." : "Message limit reached."));
        setIsLimitReached(true); // Ensure UI is locked
        // The backend already sent the error, we might add a generic bot message here if data.error is not user-friendly
        // MODIFICATION: Using data.error directly as the limit notification for consistency
        setLimitNotification(data.error || (currentLanguage === 'Español' ? "Por favor, inicia un nuevo chat para continuar." : "Please start a new chat to continue."));
        return; // Stop further processing for this send
      } else {
        console.error('Unexpected response from backend (no reply):', data);
        setError('Unexpected server response.');
      }

      if (data.limitReached && data.notification) {
        setIsLimitReached(true);
        // MODIFICATION: Ensure notification is localized if backend sends it in one language
        // For now, if backend notification is generic, we use frontend localization.
        // If backend sends specific text, we can choose to use it or override.
        // Assuming data.notification might be backend's generic string.
        setLimitNotification(data.notification);
      }
       // The currentUserMessageCount from backend can be used if needed, but isLimitReached is primary flag
    } catch (err) {
      console.error('Error sending message:', err);
      let displayError = `Error: ${err.message || 'Failed to send message.'}`;
      if (err.response && err.response.data && err.response.data.limitExceeded) {
        displayError = err.response.data.error || (currentLanguage === 'Español' ? "Límite de mensajes superado. Inicia un nuevo chat." : "Message limit exceeded. Start a new chat.");
        setIsLimitReached(true);
        setLimitNotification(displayError); // Use the error message as the notification
      } else if (err.response && err.response.data && err.response.data.error) {
        displayError = err.response.data.error;
      }
      setError(displayError);
      // Removed adding bot message on error to avoid duplicate error displays
      // setMessages(prev => [...prev, { sender: 'bot', text: `Sorry, an error occurred: ${err.message}` }]);
    } finally {
      // setIsLoading(false); // Reset loading state
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLimitReached) { // Only send if limit not reached
          handleSend();
      }
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await resetChatConversation();
      // MODIFICATION: loadConversation will now correctly reset limit states.
      await loadConversation();
    } catch (err) {
      console.error('Error resetting conversation:', err.message);
      setError(`Error resetting: ${err.message}`);
      // MODIFICATION: Attempt to reload even on error to get a clean state.
      await loadConversation();
    }
    // setIsLoading(false) is handled by loadConversation's finally block
  };

  const handleSuggestionClick = (suggestionText) => {
    if (isLimitReached) return; // Prevent using suggestions if limit is reached
    setInput(suggestionText);
  };

  // Determine if input area should be disabled
  const isInputDisabled = (isLoading && messages.length === 0) || isLimitReached;

  return (
    <>
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {isLoading && messages.length === 0 && (
            <div className={`${styles.message} ${styles.system}`}>
              {currentLanguage === 'Español' ? 'Cargando historial...' : 'Loading history...'}
            </div>
          )}
          {/* MODIFICATION: Ensure general errors are not shown if a specific limit notification is already active */}
          {error && (!isLimitReached || !limitNotification) && (
            <div className={`${styles.message} ${styles.system} ${styles.error}`}>{error}</div>
          )}

          {(!isLoading || messages.length > 0) &&
            messages.map((msg, index) => (
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
          
          {/* Display limit notification distinctly */}
          {/* MODIFICATION: The content of limitNotification is now set by logic considering backend responses and current language */}
          {isLimitReached && limitNotification && (
            <div className={`${styles.message} ${styles.system} ${styles.limitNotification}`}>
              {/* The limitNotification state should now hold the appropriate localized message */}
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
            readOnly={isLimitReached} // Make it explicitly readOnly too
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
              disabled={isInputDisabled} // Suggestions should also be disabled if input is
            >
              {suggestion}
            </button>
          ))}
        </div>
        <button
          onClick={handleReset}
          // MODIFICATION: Reset button logic refined.
          // Should be enabled if messages are loaded, OR if limit is reached (to allow user to start over),
          // but disabled if it's the initial load (no messages yet) AND limit not reached.
          disabled={(isLoading && messages.length === 0 && !isLimitReached)}
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