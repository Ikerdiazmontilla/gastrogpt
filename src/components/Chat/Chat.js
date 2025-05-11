// src/components/Chat/Chat.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './Chat.module.css';
import { ReactComponent as SendIcon } from '../../assets/up-arrow-icon.svg';
import { firstMessageSpanish, firstMessageEnglish } from './firstMessage';
import { findDishById } from '../../data/menuData';

// Helper function to process API responses and extract errors
const getErrorFromResponse = async (response) => {
  try {
    const errorData = await response.json();
    return errorData.error || `Error HTTP ${response.status}: ${response.statusText || 'Unknown server error'}`;
  } catch (e) {
    return `Error HTTP ${response.status}: ${response.statusText || 'Failed to parse error response'}`;
  }
};

// Define CustomLink and urlTransform logic
const createMarkdownLinkRenderer = (onViewDishDetailsCallback, componentStyles) => {
  const CustomLinkComponent = (props) => {
    const { href, children, node, ...rest } = props;

    if (href && href.startsWith('dish:')) {
      const dishIdString = href.split(':')[1];
      const dish = findDishById(dishIdString);
      if (dish) {
        return (
          <button
            className={componentStyles.dishLink}
            onClick={() => {
              if (onViewDishDetailsCallback) {
                onViewDishDetailsCallback(dish);
              } else {
                console.error("onViewDishDetailsCallback not provided to CustomLinkComponent");
              }
            }}
            {...rest}
          >
            {children}
          </button>
        );
      } else {
        console.warn(`Dish with ID '${dishIdString}' not found. Markdown: [${children}](${href})`);
        return <span {...rest}>{children} (detalle no disponible)</span>;
      }
    }

    if (href) {
      return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
    }

    return <span {...rest}>{children}</span>;
  };
  return CustomLinkComponent;
};

const markdownUrlTransform = (uri) => {
  if (uri.startsWith('dish:')) {
    return uri;
  }
  try {
    const parsedUrl = new URL(uri);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return uri;
    }
  } catch (e) {
    // Not a standard absolute URL
  }
  return null;
};

// Suggestions
const suggestions = {
  Español: [
    'dame opciones veganas',
    '¿cuáles son los platos más populares?',
    '¿qué postres tienen?',
    'recomiéndame algo ligero',
  ],
  English: [
    'give me vegan options',
    'what are the most popular dishes?',
    'what desserts do you have?',
    'recommend something light',
  ],
};


const Chat = ({ currentLanguage, onViewDishDetails }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const firstMessageText = currentLanguage === 'Español' ? firstMessageSpanish : firstMessageEnglish;
  const currentSuggestions = suggestions[currentLanguage] || suggestions['English'];

  const fetchConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/conversation`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorMessage = await getErrorFromResponse(response);
        throw new Error(errorMessage);
      }
      const data = await response.json();
      let initialMessages = data.messages || [];

      if (initialMessages.length > 0 && initialMessages[0].sender === 'bot') {
        initialMessages[0].text = firstMessageText;
      } else {
        initialMessages.unshift({ sender: 'bot', text: firstMessageText });
      }
      setMessages(initialMessages);
    } catch (err) {
      console.error('Error al cargar la conversación:', err.message);
      setError('No se pudo cargar el historial. Inténtalo de nuevo más tarde.');
      setMessages([{ sender: 'bot', text: firstMessageText }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, firstMessageText]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput === '') return;

    const userMessage = { sender: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: trimmedInput }),
      });
      if (!response.ok) {
        const errorMessage = await getErrorFromResponse(response);
        throw new Error(errorMessage);
      }
      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        console.error('Respuesta inesperada del backend (sin reply):', data);
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error('Error al enviar mensaje:', err.message);
      setError(`Error al enviar: ${err.message}`);
      setMessages(prev => [...prev, { sender: 'bot', text: `Lo siento, ocurrió un error. (${err.message})` }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorMessage = await getErrorFromResponse(response);
        throw new Error(errorMessage);
      }
      await fetchConversation();
    } catch (err) {
      console.error('Error al reiniciar la conversación:', err.message);
      setError(`Error al reiniciar: ${err.message}`);
      await fetchConversation();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    setInput(suggestionText);
    // Optionally, focus the input field after clicking a suggestion
    // document.querySelector(`.${styles.inputArea} input`)?.focus();
  };

  const CustomLink = React.useMemo(() => createMarkdownLinkRenderer(onViewDishDetails, styles), [onViewDishDetails]);

  return (
    <>
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {isLoading && messages.length === 0 && (
            <div className={`${styles.message} ${styles.system}`}>
              {currentLanguage === 'Español' ? 'Cargando historial...' : 'Loading history...'}
            </div>
          )}
          {error && <div className={`${styles.message} ${styles.system} ${styles.error}`}>{error}</div>}
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
            disabled={isLoading && messages.length === 0}
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
          disabled={isLoading && messages.length === 0} // Keep disabled logic for initial load
          className={styles.resetConversationButton}
        >
          {currentLanguage === 'Español' ? 'Nuevo chat' : 'New chat'}
        </button>
      </div>
    </>
  );
};

export default Chat;