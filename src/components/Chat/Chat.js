import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '¿Qué tipo de comida te gustaría comer hoy?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll hacia abajo cuando se agrega un nuevo mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();
      if (data.reply) {
        const botMessage = { sender: 'bot', text: data.reply };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = { sender: 'bot', text: 'No se recibió una respuesta válida.' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error al obtener la respuesta del bot:', error);
      const errorMessage = { sender: 'bot', text: 'Lo siento, ocurrió un error.' };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Opcional: Función para reiniciar la conversación
  const handleReset = async () => {
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.message) {
        setMessages([
          { sender: 'bot', text: '¿Qué tipo de comida te gustaría comer hoy?' }
        ]);
      }
    } catch (error) {
      console.error('Error al reiniciar la conversación:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="header">
        <h2>Chat con ChefGPT</h2>
        {/* Botón para reiniciar la conversación (opcional) */}
        <button onClick={handleReset} className="reset-button">Reiniciar</button>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend}>Enviar</button>
      </div>
    </div>
  );
};

export default Chat;
