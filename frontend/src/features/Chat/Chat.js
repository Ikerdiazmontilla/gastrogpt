// <file path="frontend/src/features/Chat/Chat.js">
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

const Chat = ({ currentLanguage, onViewDishDetails }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [limitNotification, setLimitNotification] = useState('');

  const firstMessageText = currentLanguage === 'Español' ? firstMessageSpanish : firstMessageEnglish;
  const currentSuggestions = chatSuggestions[currentLanguage] || chatSuggestions['English'];

  const CustomLink = useMemo(() =>
    createMarkdownLinkRenderer(onViewDishDetails, styles),
    [onViewDishDetails]
  );

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
                ? "Has alcanzado el límite de 15 mensajes. Por favor, inicia un nuevo chat para continuar." 
                : "You have reached the 15-message limit. Please start a new chat to continue." 
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
  }, [currentLanguage, firstMessageText]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, limitNotification]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (isLimitReached) return;
    const trimmedInput = input.trim();
    if (trimmedInput === '') return;

    const userMessage = { sender: 'user', text: trimmedInput };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput(''); 
    setError(null);

    setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, 0);

    try {
      const data = await postChatMessage(trimmedInput);
      if (data.reply) {
        setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: data.reply }]);
      } else if (data.limitExceeded) {
        setError(data.error || (currentLanguage === 'Español' ? "Límite de mensajes alcanzado." : "Message limit reached."));
        setIsLimitReached(true);
        setLimitNotification(data.error || (currentLanguage === 'Español' ? "Por favor, inicia un nuevo chat para continuar." : "Please start a new chat to continue."));
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
    if (!isLimitReached && textareaRef.current) {
      // Focus handled by setTimeout above
    }
  };

  const handleReset = async () => {
    try {
      await resetChatConversation();
      setInput('');
      await loadConversation();
      if (textareaRef.current) {
          textareaRef.current.blur(); 
      }
    } catch (err)      {
      console.error('Error resetting conversation:', err.message);
      setError(`Error resetting: ${err.message}`);
      setInput('');
      await loadConversation();
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    if (isLimitReached) return;
    setInput(suggestionText);
    if (textareaRef.current) {
        textareaRef.current.focus(); 
    }
  };

  const isInputDisabled = (isLoading && messages.length <= 1 && !error) || isLimitReached;
  const isResetDisabled = (isLoading && messages.length <= 1 && !isLimitReached && !error);

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

      <div 
        className={styles.inputWrapper} 
        data-no-tab-swipe="true" // Attribute moved to the entire input wrapper
      >
        <div className={styles.inputArea}>
          <textarea
            ref={textareaRef}
            rows="1"
            placeholder={
              isLimitReached
                ? (currentLanguage === 'Español' ? 'Límite alcanzado. Reinicia.' : 'Limit reached. Reset chat.')
                : (currentLanguage === 'Español' ? 'Escribe tu mensaje...' : 'Write your message...')
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isInputDisabled}
            readOnly={isLimitReached}
            className={styles.chatTextarea}
          />
          <button
            className={styles.sendMessage}
            onClick={handleSend}
            disabled={isInputDisabled || input.trim() === ''}
          >
            <SendIcon className={styles.sendSvg} />
          </button>
        </div>
        <div 
          className={styles.suggestionsContainer}
          // data-no-tab-swipe="true" // Attribute removed from here
        >
          <button
            onClick={handleReset}
            disabled={isResetDisabled} 
            className={styles.resetIconChip} 
            aria-label={currentLanguage === 'Español' ? 'Nuevo chat' : 'New chat'} 
            title={currentLanguage === 'Español' ? 'Nuevo chat' : 'New chat'} 
          >
            ↻
          </button>
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
      </div>
    </>
  );
};

export default Chat;