// frontend/src/features/Chat/Chat.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import styles from './Chat.module.css';
import { useTenant } from '../../context/TenantContext';
// La importación de useOrder ha sido eliminada
import { fetchConversation, postChatMessage, resetChatConversation } from '../../services/apiService';
import { createMarkdownLinkRenderer, markdownUrlTransform } from '../../utils/markdownUtils';
import Feedback from './Feedback';
import InitialFlow from './InitialFlow';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import ChatInput from './components/ChatInput';

const Chat = ({ onViewDishDetails }) => {
  const { t, i18n } = useTranslation();
  const { tenantConfig } = useTenant();
  // openDrawer ha sido eliminado

  // Obtiene las sugerencias de chips de la configuración del tenant, con fallback a español.
  const suggestions = tenantConfig?.suggestionChipsText?.[i18n.language] || tenantConfig?.suggestionChipsText?.es || [];
  // Obtiene el número de sugerencias a mostrar, con fallback a 4.
  const suggestionCount = tenantConfig?.suggestionChipsCount || 4;
  // Obtiene la configuración para el flujo inicial de bebidas.
  const initialDrinkPromptConfig = tenantConfig?.initialDrinkPrompt;

  // Estados del chat
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null); // Ref para hacer scroll al final de los mensajes
  const [isLimitReached, setIsLimitReached] = useState(false); // Estado para el límite de mensajes
  const [limitNotification, setLimitNotification] = useState(''); // Mensaje de notificación de límite
  const [showFeedbackUI, setShowFeedbackUI] = useState(false); // Controla la visibilidad de la UI de feedback
  const [activeConversationId, setActiveConversationId] = useState(null); // ID de la conversación actual
  const [feedbackAlreadyShown, setFeedbackAlreadyShown] = useState(false); // Evita mostrar feedback múltiple veces
  const [isBotTyping, setIsBotTyping] = useState(false); // Indicador de que el bot está escribiendo

  // Hook para la grabación y transcripción de audio
  const handleTranscription = (transcribedText) => setInput(prev => prev + transcribedText + ' ');
  const { isRecording, isTranscribing, startAudioRecording, stopAudioRecordingAndTranscribe, cancelAudioRecording, stopMediaStream } = useAudioRecorder(handleTranscription, setError, t);
  
  // CustomLink para renderizar enlaces de Markdown (para platos)
  const CustomLink = useMemo(() => createMarkdownLinkRenderer(onViewDishDetails), [onViewDishDetails]);

  // Función para enviar mensajes al backend y recibir la respuesta del bot
  const triggerBotResponse = useCallback(async (messageText) => {
    setIsBotTyping(true); // Activa el indicador de "escribiendo"
    try {
      const data = await postChatMessage(messageText);
      setActiveConversationId(data.conversationId); // Guarda el ID de la conversación
      if (data.reply) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]); // Añade la respuesta del bot a los mensajes
        // Si el mensaje del bot es el final y el feedback no se ha mostrado, activarlo
        if (data.isFinalMessage && !feedbackAlreadyShown) {
          setShowFeedbackUI(true);
          setFeedbackAlreadyShown(true); // Marca que el feedback ya se mostró
        }
      } else if (data.limitExceeded) { // Si el backend indica que se excedió el límite
        setError(data.error || t('chat.limitReached'));
        setIsLimitReached(true);
        setLimitNotification(data.error || t('chat.limitReachedCta'));
      }
      if (data.limitReached && data.notification) { // Si el límite se alcanzó y hay una notificación
        setIsLimitReached(true);
        setLimitNotification(data.notification);
      }
    } catch (err) {
      let displayError = `Error: ${err.message || 'Failed to send message.'}`;
      if (err.response?.data?.limitExceeded) { // Errores específicos del límite
        displayError = err.response.data.error || t('chat.limitReached');
        setIsLimitReached(true);
        setLimitNotification(displayError);
      } else if (err.response?.data?.error) { // Otros errores del backend
        displayError = err.response.data.error;
      }
      setError(displayError);
    } finally {
      setIsBotTyping(false); // Desactiva el indicador de "escribiendo"
    }
  }, [t, feedbackAlreadyShown]); // Dependencias del callback

  // Maneja el envío del mensaje del usuario (ya sea por texto o transcripción)
  const handleSendMessage = useCallback(async () => {
    const trimmedInput = input.trim();
    if (trimmedInput === '' || isBotTyping) return; // No enviar mensajes vacíos o si el bot está escribiendo
    setInput(''); // Limpia el input
    const userMessage = { sender: 'user', text: trimmedInput };
    // Añade el mensaje del usuario y filtra cualquier mensaje de flujo inicial que pudiera estar pendiente.
    setMessages(prev => [...prev.filter(m => m.type !== 'initial_flow'), userMessage]);
    await triggerBotResponse(trimmedInput); // Llama a la función para obtener la respuesta del bot
  }, [input, isBotTyping, triggerBotResponse]); // Dependencias del callback

  // Maneja la selección de una opción en el flujo inicial (ej. "¿Qué te apetece beber?")
  const handleInitialFlowSelection = useCallback((messageText, originalConfig) => {
    // La lógica de `toggleDishSelection` para el pedido ha sido eliminada.
    const questionText = originalConfig.question[i18n.language] || originalConfig.question.en || originalConfig.question.es;
    const staticBotMessage = { sender: 'bot', text: questionText }; // El mensaje estático del bot para la pregunta inicial
    const userMessage = { sender: 'user', text: messageText }; // El mensaje del usuario basado en su selección
    // Añade el mensaje estático y el del usuario, filtrando cualquier mensaje de flujo inicial anterior
    setMessages(prev => [...prev.filter(m => m.type !== 'initial_flow'), staticBotMessage, userMessage]);
    triggerBotResponse(messageText); // Envía la selección del usuario al LLM
  }, [i18n.language, triggerBotResponse]); // Dependencias del callback

  // Carga el historial de conversación al inicio o al reiniciar el chat
  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMessages([]);
    setIsLimitReached(false);
    setLimitNotification('');
    setShowFeedbackUI(false);
    setFeedbackAlreadyShown(false);
    try {
      const data = await fetchConversation();
      const conversationHistory = data.messages || [];
      // Si no hay historial y el flujo inicial está habilitado, muestra el flujo inicial
      if (conversationHistory.length === 0 && initialDrinkPromptConfig?.enabled) {
        setMessages([{ type: 'initial_flow', sender: 'bot', config: initialDrinkPromptConfig }]);
      } else {
        // Si hay historial, cargarlo
        setMessages(conversationHistory);
        // Si el límite se alcanzó en una conversación previa, notificarlo
        if (data.meta?.limitEffectivelyReached) {
          setIsLimitReached(true);
          setLimitNotification(t('chat.limitReachedCta'));
        }
      }
    } catch (err) {
      setError(`Failed to load history: ${err.message}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  }, [t, initialDrinkPromptConfig]); // Dependencias del callback

  // Efecto para cargar la conversación al montar el componente
  useEffect(() => { loadConversation(); }, [loadConversation]);

  // Efecto para hacer scroll al final de los mensajes cuando se actualizan
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isBotTyping]);

  // Efecto para detener el micrófono si la grabación está activa al desmontar el componente
  useEffect(() => { return () => { stopMediaStream(); }; }, [stopMediaStream]);

  // Maneja el reinicio completo del chat
  const handleReset = async () => {
    if (isRecording) cancelAudioRecording(); // Cancela grabación si está activa
    await resetChatConversation(); // Llama a la API para resetear la conversación en el backend
    await loadConversation(); // Recarga la conversación (iniciará una nueva)
  };

  // Maneja el clic en un chip de sugerencia
  const handleSuggestionClick = (suggestionText) => setInput(suggestionText);

  return (
    <>
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {/* Muestra mensaje de carga si no hay mensajes y está cargando */}
          {isLoading && messages.length === 0 && !error && (<div className={`${styles.message} ${styles.system}`}>{t('chat.loadingHistory')}</div>)}
          {/* Muestra mensaje de error si ocurre uno */}
          {error && <div className={`${styles.message} ${styles.system} ${styles.error}`}>{error}</div>}
          {/* Mapea y renderiza los mensajes */}
          {messages.map((msg, index) => {
            // Si el mensaje es de tipo 'initial_flow', renderiza el componente InitialFlow
            if (msg.type === 'initial_flow') {
              return <InitialFlow key={`initial-flow-${index}`} config={msg.config} onSelection={(text, config) => handleInitialFlowSelection(text, config)} />;
            }
            // Renderiza mensajes normales de usuario o bot
            return (
              <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
                {/* Renderiza Markdown para mensajes del bot, con enlaces personalizados para platos */}
                {msg.sender === 'bot' ? (
                  <ReactMarkdown components={{ a: CustomLink }} urlTransform={markdownUrlTransform} unwrapDisallowed={true}>
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <span>{msg.text}</span> // Mensajes de usuario como texto plano
                )}
              </div>
            );
          })}
          {/* Indicador de "bot escribiendo" */}
          {isBotTyping && (<div className={`${styles.message} ${styles.bot} ${styles.typingIndicator}`}><div className={styles.dot}></div><div className={styles.dot}></div><div className={styles.dot}></div></div>)}
          {/* Notificación de límite de mensajes alcanzado */}
          {isLimitReached && limitNotification && (<div className={`${styles.message} ${styles.system} ${styles.limitNotification}`}>{limitNotification}</div>)}
          {/* Componente de feedback si showFeedbackUI es true */}
          {showFeedbackUI && <Feedback conversationId={activeConversationId} onFeedbackSent={() => setShowFeedbackUI(false)} />}
          <div ref={messagesEndRef} /> {/* Elemento para el scroll automático */}
        </div>
      </div>

      {/* Componente de entrada del chat */}
      <ChatInput
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        handleReset={handleReset}
        handleSuggestionClick={handleSuggestionClick}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        isBotTyping={isBotTyping}
        isLimitReached={isLimitReached}
        startAudioRecording={startAudioRecording}
        stopAudioRecordingAndTranscribe={stopAudioRecordingAndTranscribe}
        cancelAudioRecording={cancelAudioRecording}
        suggestions={suggestions}
        suggestionCount={suggestionCount}
        // onOpenOrder ha sido eliminado
      />
    </>
  );
};

export default Chat;