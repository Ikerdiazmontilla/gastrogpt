// src/components/Chat/Chat.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import './Chat.css';
    
import { ReactComponent as Send} from '../../assets/up-arrow-icon.svg';

const Chat = () => {
  const [messages, setMessages] = useState([]); // <--- Inicializa vacío
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true); // <--- Estado de carga inicial
  const [error, setError] = useState(null); // <--- Estado para errores de carga/envío
  const messagesEndRef = useRef(null);

  // Función para cargar el historial de conversación
  const fetchConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Limpiar errores previos
    try {
      // Usamos 'credentials: include' para enviar la cookie de sesión
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/conversation`, { 
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include', // <--- IMPORTANTE para enviar/recibir cookies de sesión
      });

      if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // Asegurarse de que data.messages sea siempre un array
      setMessages(data.messages || []);

    } catch (err) {
      console.error('Error al cargar la conversación:', err);
      setError('No se pudo cargar el historial. Inténtalo de nuevo más tarde.');
      // Podrías mostrar un mensaje de error genérico o el firstMessage por defecto
      // setMessages([{ sender: 'bot', text: 'Lo siento, no pude cargar tu conversación.' }]);
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback para evitar re-creación innecesaria

  // Cargar la conversación al montar el componente
  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]); // Incluir fetchConversation en las dependencias

  // Scroll hacia abajo cuando se agrega un nuevo mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput === '') return;

    const userMessage = { sender: 'user', text: trimmedInput };
    // Añadir mensaje de usuario inmediatamente a la UI para mejor UX
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null); // Limpiar errores previos al enviar

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
         // IMPORTANTE: incluir credenciales para enviar la cookie de sesión
        credentials: 'include',
        body: JSON.stringify({ message: trimmedInput })
      });

       if (!response.ok) {
          // Intentar leer el mensaje de error del backend si existe
          let errorData;
          try {
            errorData = await response.json();
          } catch(e) {
            // Si el cuerpo no es JSON o está vacío
             errorData = { error: `Error HTTP ${response.status}: ${response.statusText}` };
          }
           throw new Error(errorData.error || 'Error desconocido del servidor');
      }

      const data = await response.json();

      if (data.reply) {
        const botMessage = { sender: 'bot', text: data.reply };
        // Añadir solo la respuesta del bot (el mensaje del user ya se añadió)
        setMessages(prev => [...prev, botMessage]);
      } else {
         // Esto no debería ocurrir si el backend siempre responde con 'reply' o un error
         console.error('Respuesta inesperada del backend:', data);
         setError('Respuesta inesperada del servidor.');
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setError(`Error al enviar: ${error.message}`);
      // Opcional: Podrías añadir un mensaje de error al chat
      const errorMessage = { sender: 'bot', text: `Lo siento, ocurrió un error al procesar tu mensaje. (${error.message})` };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Enviar con Enter (no con Shift+Enter)
      e.preventDefault(); // Prevenir nueva línea en input
      handleSend();
    }
  };

  // Función para reiniciar la conversación
  const handleReset = async () => {
    setIsLoading(true); // Mostrar carga mientras se reinicia
    setError(null);
    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Enviar cookie de sesión
        });

         if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch(e) {
             errorData = { error: `Error HTTP ${response.status}: ${response.statusText}` };
          }
           throw new Error(errorData.message || 'Error desconocido al reiniciar');
        }

        // const data = await response.json(); // Leer respuesta (e.g., { message: '...' })
        // console.log(data.message);

        // Volver a cargar la conversación (que ahora debería ser solo el mensaje inicial)
        await fetchConversation();

    } catch (error) {
        console.error('Error al reiniciar la conversación:', error);
        setError(`Error al reiniciar: ${error.message}`);
    } finally {
        // setIsLoading(false); // fetchConversation ya lo hace
    }
  };

  return (
    <>
      {/* Añadir un botón de reset (opcional) */}
      {/* <button onClick={handleReset} style={{ position: 'absolute', top: '10px', right: '10px' }}>Reiniciar Chat</button> */}

      <div className="chat-container">
        <div className="messages">
          {isLoading && <div className="message system">Cargando historial...</div>}
          {error && <div className="message system error">{error}</div>}
          {!isLoading && messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {/* Usar ReactMarkdown solo para mensajes del bot */}
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
      <div className="input-area">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading} // Deshabilitar input mientras carga/envía
        />
        <button className='send-message' onClick={handleSend} disabled={isLoading || input.trim() === ''}>
            <Send className='send-svg'/>
        </button>
      </div>
      {/* Botón Reset como ejemplo - Puedes integrarlo mejor en tu UI */}
      <button onClick={handleReset} disabled={isLoading} style={{ marginTop: '10px' }}>
        Iniciar Nueva Conversación
      </button>
    </>
  );
};

export default Chat;