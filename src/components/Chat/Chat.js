// src/components/Chat/Chat.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './Chat.module.css'; // Changed import
    
import { ReactComponent as Send} from '../../assets/up-arrow-icon.svg';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/conversation`, { 
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include',
      });

      if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setMessages(data.messages || []);

    } catch (err) {
      console.error('Error al cargar la conversación:', err);
      setError('No se pudo cargar el historial. Inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ message: trimmedInput })
      });

       if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch(e) {
             errorData = { error: `Error HTTP ${response.status}: ${response.statusText}` };
          }
           throw new Error(errorData.error || 'Error desconocido del servidor');
      }

      const data = await response.json();

      if (data.reply) {
        const botMessage = { sender: 'bot', text: data.reply };
        setMessages(prev => [...prev, botMessage]);
      } else {
         console.error('Respuesta inesperada del backend:', data);
         setError('Respuesta inesperada del servidor.');
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setError(`Error al enviar: ${error.message}`);
      const errorMessage = { sender: 'bot', text: `Lo siento, ocurrió un error al procesar tu mensaje. (${error.message})` };
      setMessages(prev => [...prev, errorMessage]);
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
        let errorData;
        try { errorData = await response.json(); } catch(e) { /* noop */ }
        throw new Error(errorData?.message || `Error HTTP ${response.status}`);
      }
      await fetchConversation();

  } catch (error) {
      console.error('Error al reiniciar la conversación:', error);
      setError(`Error al reiniciar: ${error.message}`);
  }
};

  return (
    // Removed the outer chat-component-wrapper div
    <> 
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {isLoading && <div className={`${styles.message} ${styles.system}`}>Cargando historial...</div>}
          {error && <div className={`${styles.message} ${styles.system} ${styles.error}`}>{error}</div>}
          {!isLoading && messages.map((msg, index) => (
            <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
              {msg.sender === 'bot' ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
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
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button className={styles.sendMessage} onClick={handleSend} disabled={isLoading || input.trim() === ''}>
              <Send className={styles.sendSvg}/>
          </button>
        </div>
        <button onClick={handleReset} disabled={isLoading} className={styles.resetConversationButton} style={{ marginTop: '10px' }}>
        Nuevo chat
      </button>
      </div>

    </>
  );
};

export default Chat;