// frontend/src/features/Chat/Chat.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import styles from './Chat.module.css';
import { useTenant } from '../../context/TenantContext';
import { fetchConversation, postChatMessage, resetChatConversation } from '../../services/apiService';
import { createMarkdownLinkRenderer, markdownUrlTransform } from '../../utils/markdownUtils';
import Feedback from './Feedback';
import InitialFlow from './InitialFlow';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import ChatInput from './components/ChatInput';

const Chat = ({ onViewDishDetails, setSendMessageApi }) => {
  const { t, i18n } = useTranslation();
  const { tenantConfig } = useTenant();

  const suggestions = tenantConfig?.suggestionChipsText?.[i18n.language] || tenantConfig?.suggestionChipsText?.es || [];
  const suggestionCount = tenantConfig?.suggestionChipsCount || 4;
  const initialDrinkPromptConfig = tenantConfig?.initialDrinkPrompt;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [limitNotification, setLimitNotification] = useState('');
  const [showFeedbackUI, setShowFeedbackUI] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [feedbackAlreadyShown, setFeedbackAlreadyShown] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  
  // MODIFICADO: La función ahora llama a programmaticSendMessage.
  const handleTranscription = useCallback((transcribedText) => {
    if (transcribedText && transcribedText.trim()) {
      programmaticSendMessage(transcribedText.trim());
    }
  }, []); // El callback se define una vez. programmaticSendMessage se obtiene de un ref o de una función estable, pero para simplificar, lo definimos dentro y lo hacemos estable.

  const { isRecording, isTranscribing, startAudioRecording, stopAudioRecordingAndTranscribe, cancelAudioRecording, stopMediaStream } = useAudioRecorder(handleTranscription, setError, t);
  
  const CustomLink = useMemo(() => createMarkdownLinkRenderer(onViewDishDetails), [onViewDishDetails]);

  const triggerBotResponse = useCallback(async (messageText) => {
    setIsBotTyping(true);
    try {
      const data = await postChatMessage(messageText);
      setActiveConversationId(data.conversationId);
      if (data.reply) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        if (data.isFinalMessage && !feedbackAlreadyShown) {
          setShowFeedbackUI(true);
          setFeedbackAlreadyShown(true);
        }
      } else if (data.limitExceeded) {
        setError(data.error || t('chat.limitReached'));
        setIsLimitReached(true);
        setLimitNotification(data.error || t('chat.limitReachedCta'));
      }
      if (data.limitReached && data.notification) {
        setIsLimitReached(true);
        setLimitNotification(data.notification);
      }
    } catch (err) {
      let displayError = `Error: ${err.message || 'Failed to send message.'}`;
      if (err.response?.data?.limitExceeded) {
        displayError = err.response.data.error || t('chat.limitReached');
        setIsLimitReached(true);
        setLimitNotification(displayError);
      } else if (err.response?.data?.error) {
        displayError = err.response.data.error;
      }
      setError(displayError);
    } finally {
      setIsBotTyping(false);
    }
  }, [t, feedbackAlreadyShown]);
  
  const programmaticSendMessage = useCallback(async (messageText) => {
    if (messageText.trim() === '' || isBotTyping) return;
    const userMessage = { sender: 'user', text: messageText };
    setMessages(prev => [...prev.filter(m => m.type !== 'initial_flow'), userMessage]);
    await triggerBotResponse(messageText);
  }, [isBotTyping, triggerBotResponse]);

  useEffect(() => {
    if (setSendMessageApi) {
      setSendMessageApi({ sendMessage: programmaticSendMessage });
    }
  }, [setSendMessageApi, programmaticSendMessage]);

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = input.trim();
    if (trimmedInput === '') return;
    setInput('');
    await programmaticSendMessage(trimmedInput);
  }, [input, programmaticSendMessage]);

  const handleInitialFlowSelection = useCallback((messageText, originalConfig) => {
    const questionText = originalConfig.question[i18n.language] || originalConfig.question.en || originalConfig.question.es;
    const staticBotMessage = { sender: 'bot', text: questionText };
    const userMessage = { sender: 'user', text: messageText };
    setMessages(prev => [...prev.filter(m => m.type !== 'initial_flow'), staticBotMessage, userMessage]);
    triggerBotResponse(messageText);
  }, [i18n.language, triggerBotResponse]);

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
      if (conversationHistory.length === 0 && initialDrinkPromptConfig?.enabled) {
        setMessages([{ type: 'initial_flow', sender: 'bot', config: initialDrinkPromptConfig }]);
      } else {
        setMessages(conversationHistory);
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
  }, [t, initialDrinkPromptConfig]);

  useEffect(() => { loadConversation(); }, [loadConversation]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isBotTyping]);

  useEffect(() => { return () => { stopMediaStream(); }; }, [stopMediaStream]);

  const handleReset = async () => {
    if (isRecording) cancelAudioRecording();
    await resetChatConversation();
    await loadConversation();
  };

  const handleSuggestionClick = (suggestionText) => setInput(suggestionText);

  return (
    <>
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {isLoading && messages.length === 0 && !error && (<div className={`${styles.message} ${styles.system}`}>{t('chat.loadingHistory')}</div>)}
          {error && <div className={`${styles.message} ${styles.system} ${styles.error}`}>{error}</div>}
          {messages.map((msg, index) => {
            if (msg.type === 'initial_flow') {
              return <InitialFlow key={`initial-flow-${index}`} config={msg.config} onSelection={(text, config) => handleInitialFlowSelection(text, config)} />;
            }
            return (
              <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
                {msg.sender === 'bot' ? (
                  <ReactMarkdown components={{ a: CustomLink }} urlTransform={markdownUrlTransform} unwrapDisallowed={true}>
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>
            );
          })}
          {isBotTyping && (<div className={`${styles.message} ${styles.bot} ${styles.typingIndicator}`}><div className={styles.dot}></div><div className={styles.dot}></div><div className={styles.dot}></div></div>)}
          {isLimitReached && limitNotification && (<div className={`${styles.message} ${styles.system} ${styles.limitNotification}`}>{limitNotification}</div>)}
          {showFeedbackUI && <Feedback conversationId={activeConversationId} onFeedbackSent={() => setShowFeedbackUI(false)} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

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
      />
    </>
  );
};

export default Chat;