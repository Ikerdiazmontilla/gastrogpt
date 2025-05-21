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
  const textareaRef = useRef(null); // Ref for the textarea element
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

    const richWelcomeMessageObject = { sender: 'bot', text: firstMessageText };

    try {
      const data = await fetchConversation(); 

      let actualConversationHistory = []; 

      if (data.meta && data.messages && data.messages.length > 0) {
        actualConversationHistory = data.messages;

        if (data.meta.limitEffectivelyReached) {
          setIsLimitReached(true);
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
      setMessages([richWelcomeMessageObject, ...actualConversationHistory]);

    } catch (err) {
      console.error('Error loading conversation:', err.message);
      setError(`Failed to load history: ${err.message}. Please try again later.`);
      setMessages([richWelcomeMessageObject]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, firstMessageText]); // onViewDishDetails removed as it's part of CustomLink which is not directly in loadConversation's scope. If CustomLink itself were changing and needed to trigger re-memoization for loadConversation, this might differ.

  // Effect to load conversation when component mounts or dependencies change
  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Effect to scroll to the bottom of messages when messages or notifications change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, limitNotification]);

  // Effect to adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to shrink if text is deleted
      // Set height based on scroll height to fit content, up to CSS max-height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; 
    }
  }, [input]); // Re-run when input text changes

  const handleSend = async () => {
    if (isLimitReached) return;

    const trimmedInput = input.trim();
    if (trimmedInput === '') return;

    const userMessage = { sender: 'user', text: trimmedInput };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setError(null);

    // Reset textarea height after sending if it was multiline
    // This will be handled by the useEffect on `input` change when setInput('') is called.

    try {
      const data = await postChatMessage(trimmedInput);
      if (data.reply) {
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

  // Removed handleKeyPress as per user request for mobile-only focus

  const handleReset = async () => {
    try {
      await resetChatConversation();
      setInput(''); // Clear input field on reset
      await loadConversation(); 
    } catch (err) {
      console.error('Error resetting conversation:', err.message);
      setError(`Error resetting: ${err.message}`);
      setInput(''); // Also clear input on error during reset
      await loadConversation(); 
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    if (isLimitReached) return;
    setInput(suggestionText);
    // Focus the textarea after suggestion click to allow immediate typing/sending
    if (textareaRef.current) {
        textareaRef.current.focus();
    }
  };

  const isInputDisabled = (isLoading && messages.length <= 1 && !error) || isLimitReached;

  return (
    <>
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {isLoading && messages.length <= 1 && !error && ( 
            <div className={`${styles.message} ${styles.system}`}>
              {currentLanguage === 'Español' ? 'Cargando historial...' : 'Loading history...'}
            </div>
          )}
          {error && (!isLimitReached || !limitNotification) && (
            <div className={`${styles.message} ${styles.system} ${styles.error}`}>{error}</div>
          )}

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
          {/* MODIFICATION: Changed input to textarea */}
          <textarea
            ref={textareaRef}
            rows="1" // Start with one row, CSS and JS will handle expansion
            placeholder={
              isLimitReached
                ? (currentLanguage === 'Español' ? 'Límite alcanzado. Reinicia.' : 'Limit reached. Reset chat.')
                : (currentLanguage === 'Español' ? 'Escribe tu mensaje...' : 'Write your message...')
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            // Removed onKeyPress={handleKeyPress}
            disabled={isInputDisabled}
            readOnly={isLimitReached}
            className={styles.chatTextarea} // Added a specific class for styling
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