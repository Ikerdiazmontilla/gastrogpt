// src/components/Chat/Chat.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './Chat.module.css';
import { ReactComponent as SendIcon } from '../../assets/up-arrow-icon.svg'; // Renamed for clarity
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

// Define CustomLink and urlTransform logic once, to be used by ReactMarkdown
// This could be outside if it didn't need `onViewDishDetails` and `styles`
const createMarkdownLinkRenderer = (onViewDishDetailsCallback, componentStyles) => {
  const CustomLinkComponent = (props) => {
    const { href, children, node, ...rest } = props;

    if (href && href.startsWith('dish:')) {
      const dishIdString = href.split(':')[1];
      const dish = findDishById(dishIdString);
      if (dish) {
        return (
          <button
            className={componentStyles.dishLink} // Use passed styles
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

    if (href) { // Standard external link
      return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
    }

    return <span {...rest}>{children}</span>; // Fallback for link-like text without href
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
  return null; // Disallow other URI schemes by default
};


const Chat = ({ currentLanguage, onViewDishDetails }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const firstMessageText = currentLanguage === 'Español' ? firstMessageSpanish : firstMessageEnglish;

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
      } else { // Handles empty or user-first history
        initialMessages.unshift({ sender: 'bot', text: firstMessageText });
      }
      setMessages(initialMessages);
    } catch (err) {
      console.error('Error al cargar la conversación:', err.message);
      setError('No se pudo cargar el historial. Inténtalo de nuevo más tarde.');
      setMessages([{ sender: 'bot', text: firstMessageText }]); // Fallback to first message
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
    setError(null); // Clear previous errors

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
    setIsLoading(true); // Indicate loading during reset
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
      await fetchConversation(); // Refresh to new conversation state
    } catch (err) {
      console.error('Error al reiniciar la conversación:', err.message);
      setError(`Error al reiniciar: ${err.message}`);
      await fetchConversation(); // Attempt to fetch fresh state even on reset error
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize the link renderer to avoid re-creating it on every render if onViewDishDetails doesn't change
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
            disabled={isLoading && messages.length === 0} // Disable only on initial load
          />
          <button
            className={styles.sendMessage}
            onClick={handleSend}
            disabled={(isLoading && messages.length === 0) || input.trim() === ''}
          >
            <SendIcon className={styles.sendSvg} />
          </button>
        </div>
        <button
          onClick={handleReset}
          disabled={isLoading && messages.length === 0} // Disable only on initial load
          className={styles.resetConversationButton}
          style={{ marginTop: '10px' }}
        >
          {currentLanguage === 'Español' ? 'Nuevo chat' : 'New chat'}
        </button>
      </div>
    </>
  );
};

export default Chat;