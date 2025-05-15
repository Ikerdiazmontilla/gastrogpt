// src/features/Chat/Chat.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './Chat.module.css';
import { ReactComponent as SendIcon } from '../../assets/up-arrow-icon.svg';
import { firstMessageSpanish, firstMessageEnglish } from './firstMessage'; // Local import
import { chatSuggestions } from '../../data/translations'; // Import chat suggestions

// API service functions
import {
  fetchConversation,
  postChatMessage,
  resetChatConversation,
} from '../../services/apiService';

// Markdown utilities
import { createMarkdownLinkRenderer, markdownUrlTransform } from '../../utils/markdownUtils';

const Chat = ({ currentLanguage, onViewDishDetails }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true); // True initially to load conversation
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const firstMessageText = currentLanguage === 'Español' ? firstMessageSpanish : firstMessageEnglish;
  const currentSuggestions = chatSuggestions[currentLanguage] || chatSuggestions['English'];


  // Memoized custom link renderer for ReactMarkdown
  const CustomLink = useMemo(() =>
    createMarkdownLinkRenderer(onViewDishDetails, styles),
    [onViewDishDetails, styles] // styles object from Chat.module.css
  );

  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchConversation();
      let initialMessages = data.messages || [];

      // Replace the first bot message with the language-specific one if necessary,
      // or prepend it if the history is empty or doesn't start with a bot.
      if (initialMessages.length > 0 && initialMessages[0].sender === 'bot') {
        initialMessages[0].text = firstMessageText;
      } else {
        // Ensure there's always an initial bot message displayed
        initialMessages.unshift({ sender: 'bot', text: firstMessageText });
      }
      setMessages(initialMessages);
    } catch (err) {
      console.error('Error loading conversation:', err.message);
      setError(`Failed to load history: ${err.message}. Please try again later.`);
      // Fallback to showing only the first message on error
      setMessages([{ sender: 'bot', text: firstMessageText }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, firstMessageText]); // Added firstMessageText dependency

  useEffect(() => {
    loadConversation();
  }, [loadConversation]); // loadConversation is memoized

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput === '') return;

    const userMessage = { sender: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null); // Clear previous errors on new send

    try {
      const data = await postChatMessage(trimmedInput);
      if (data.reply) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        // This case should ideally be handled by apiService error throwing
        console.error('Unexpected response from backend (no reply):', data);
        setError('Unexpected server response.');
      }
    } catch (err) {
      console.error('Error sending message:', err.message);
      setError(`Error sending message: ${err.message}`);
      // Optionally add a bot message indicating the error
      setMessages(prev => [...prev, { sender: 'bot', text: `Sorry, an error occurred: ${err.message}` }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = async () => {
    setIsLoading(true); // Show loading state during reset
    setError(null);
    try {
      await resetChatConversation();
      // After resetting, reload the conversation which will show the initial bot message
      await loadConversation();
    } catch (err) {
      console.error('Error resetting conversation:', err.message);
      setError(`Error resetting: ${err.message}`);
      // Still try to load conversation to ensure a consistent state
      await loadConversation();
    } finally {
      // setIsLoading(false); // loadConversation will set this
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    setInput(suggestionText);
    // Consider focusing the input field here if desired
    // e.g., document.querySelector(`.${styles.inputArea} input`)?.focus();
  };

  return (
    <>
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {isLoading && messages.length === 0 && ( // Show loading only if messages are empty
            <div className={`${styles.message} ${styles.system}`}>
              {currentLanguage === 'Español' ? 'Cargando historial...' : 'Loading history...'}
            </div>
          )}
          {error && <div className={`${styles.message} ${styles.system} ${styles.error}`}>{error}</div>}

          {/* Render messages if not loading or if messages exist */}
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
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={styles.inputWrapper}>
        <div className={styles.inputArea}>
          <input
            type="text"
            placeholder={currentLanguage === 'Español' ? 'Escribe tu mensaje...' : 'Write your message...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading && messages.length === 0} // Disable input during initial full load
          />
          <button
            className={styles.sendMessage}
            onClick={handleSend}
            disabled={(isLoading && messages.length === 0) || input.trim() === ''}
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
              disabled={isLoading && messages.length === 0}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <button
          onClick={handleReset}
          disabled={isLoading && messages.length === 0}
          className={styles.resetConversationButton}
        >
          {currentLanguage === 'Español' ? 'Nuevo chat' : 'New chat'}
        </button>
      </div>
    </>
  );
};

export default Chat;