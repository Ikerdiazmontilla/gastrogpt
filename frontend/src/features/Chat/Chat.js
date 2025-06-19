// frontend/src/features/Chat/Chat.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import styles from './Chat.module.css';
import { ReactComponent as SendIcon } from '../../assets/up-arrow-icon.svg';
import { ReactComponent as MicrophoneIcon } from '../../assets/microphone.svg';
import { useTenant } from '../../context/TenantContext';
import {
  fetchConversation,
  postChatMessage,
  resetChatConversation,
  transcribeAudio,
} from '../../services/apiService';
import { createMarkdownLinkRenderer, markdownUrlTransform } from '../../utils/markdownUtils';
import Feedback from './Feedback';
import InitialFlow from './InitialFlow';

const Chat = ({ onViewDishDetails }) => {
  const { t, i18n } = useTranslation();
  
  const { tenantConfig } = useTenant();
  const menu = tenantConfig?.menu;
  
  const suggestions = tenantConfig?.suggestionChipsText?.[i18n.language] || tenantConfig?.suggestionChipsText?.es || [];
  const suggestionCount = tenantConfig?.suggestionChipsCount || 4;
  const initialDrinkPromptConfig = tenantConfig?.initialDrinkPrompt;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [limitNotification, setLimitNotification] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);

  const [showFeedbackUI, setShowFeedbackUI] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [feedbackAlreadyShown, setFeedbackAlreadyShown] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const CustomLink = useMemo(() =>
    createMarkdownLinkRenderer(onViewDishDetails, menu, styles),
    [onViewDishDetails, menu]
  );

  // Función refactorizada para enviar el mensaje a la API y manejar la respuesta
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
  
  // Maneja un mensaje normal del input de texto
  const handleSendMessage = useCallback(async () => {
    const trimmedInput = input.trim();
    if (trimmedInput === '' || isBotTyping) return;
    
    setInput('');
    const userMessage = { sender: 'user', text: trimmedInput };
    setMessages(prev => [...prev.filter(m => m.type !== 'initial_flow'), userMessage]);
    
    await triggerBotResponse(trimmedInput);
  }, [input, isBotTyping, triggerBotResponse]);
  
  // Maneja la selección desde el flujo inicial
  const handleInitialFlowSelection = useCallback((messageText, originalConfig) => {
    const questionText = originalConfig.question[i18n.language] || originalConfig.question.en || originalConfig.question.es;
    const staticBotMessage = { sender: 'bot', text: questionText };
    const userMessage = { sender: 'user', text: messageText };

    // Reemplaza el prompt interactivo por la pregunta estática y añade el mensaje del usuario
    setMessages(prev => [
      ...prev.filter(m => m.type !== 'initial_flow'),
      staticBotMessage,
      userMessage
    ]);
    
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
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const handleReset = async () => {
    if (isRecording) cancelAudioRecording();
    await resetChatConversation();
    await loadConversation();
  };

  const handleSuggestionClick = (suggestionText) => {
    setInput(suggestionText);
    if (textareaRef.current) textareaRef.current.focus();
  };
  
 
  const startAudioRecording = async () => {
    if (isRecording || isTranscribing || isBotTyping) return;
    setError(null);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
    } catch (err) {
        setError(t('chat.errorAccessingMic'));
        stopMediaStream();
    }
  };

  const stopAudioRecordingAndTranscribe = async () => {
    if (!isRecording || !mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    setIsRecording(false);
    setIsTranscribing(true);
    mediaRecorderRef.current.onstop = async () => {
        stopMediaStream();
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        if (audioBlob.size === 0) {
            setError(t('chat.errorNoAudio'));
            setIsTranscribing(false);
            return;
        }
        try {
            const data = await transcribeAudio(audioBlob, 'recording.webm');
            if (data.transcription) setInput(prev => prev + data.transcription + ' ');
        } catch (err) {
            setError(err.message || 'Failed to transcribe.');
        } finally {
            setIsTranscribing(false);
        }
    };
    mediaRecorderRef.current.stop();
  };

  const cancelAudioRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    mediaRecorderRef.current.onstop = () => {
        stopMediaStream();
        audioChunksRef.current = [];
    };
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsTranscribing(false);
  };

  const getPlaceholderText = () => {
    if (isTranscribing) return t('chat.placeholderTranscribing');
    if (isRecording) return t('chat.placeholderRecording');
    if (isLimitReached) return t('chat.placeholderLimit');
    return t('chat.placeholder');
  };
  
  const isResetDisabled = isLoading || isRecording || isTranscribing || isBotTyping;
  const isTextareaAndSendDisabled = isLimitReached || isRecording || isTranscribing || isBotTyping;
  const isMicButtonDisabled = isLimitReached || isTranscribing || isBotTyping;
  const areSuggestionsDisabled = isLimitReached || isRecording || isTranscribing || isBotTyping;

  return (
    <>
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {isLoading && messages.length === 0 && !error && (
            <div className={`${styles.message} ${styles.system}`}>{t('chat.loadingHistory')}</div>
          )}
          {error && <div className={`${styles.message} ${styles.system} ${styles.error}`}>{error}</div>}

          {messages.map((msg, index) => {
            if (msg.type === 'initial_flow') {
              return <InitialFlow key={`initial-flow-${index}`} config={msg.config} onSelection={(text) => handleInitialFlowSelection(text, msg.config)} />;
            }
            return (
              <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
                {msg.sender === 'bot' ? (
                  <ReactMarkdown components={{ a: CustomLink }} urlTransform={markdownUrlTransform}>{msg.text}</ReactMarkdown>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>
            );
          })}

          {isBotTyping && (
            <div className={`${styles.message} ${styles.bot} ${styles.typingIndicator}`}>
              <div className={styles.dot}></div><div className={styles.dot}></div><div className={styles.dot}></div>
            </div>
          )}
          {isLimitReached && limitNotification && (
            <div className={`${styles.message} ${styles.system} ${styles.limitNotification}`}>{limitNotification}</div>
          )}
          {showFeedbackUI && <Feedback conversationId={activeConversationId} onFeedbackSent={() => setShowFeedbackUI(false)} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={styles.inputWrapper} data-no-tab-swipe="true">
        <div className={styles.inputArea}>
          <textarea
            ref={textareaRef}
            rows="1"
            placeholder={getPlaceholderText()}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTextareaAndSendDisabled}
            readOnly={isTextareaAndSendDisabled}
            className={styles.chatTextarea}
          />
          {isRecording ? (
             <>
              <button className={styles.cancelRecordButton} onClick={cancelAudioRecording}> ❌ </button>
              <button className={styles.stopRecordButton} onClick={stopAudioRecordingAndTranscribe}> ✔️ </button>
            </>
          ) : (
            <>
              <button className={`${styles.micButton} ${isMicButtonDisabled ? styles.micButtonDisabled : ''}`} onClick={startAudioRecording} disabled={isMicButtonDisabled}> <MicrophoneIcon className={styles.microphoneSvg}/> </button>
              <button className={styles.sendMessage} onClick={handleSendMessage} disabled={isTextareaAndSendDisabled || input.trim() === ''}> <SendIcon className={styles.sendSvg} /> </button>
            </>
          )}
        </div>
        <div className={styles.bottomControlsContainer}>
          <button onClick={handleReset} disabled={isResetDisabled} className={styles.resetIconChipFixed}> ↻ </button>
          <div className={styles.suggestionsContainerScrollable}>
            {suggestions.slice(0, suggestionCount).map((suggestion, index) => (
              <button key={index} className={styles.suggestionChip} onClick={() => handleSuggestionClick(suggestion)} disabled={areSuggestionsDisabled}>{suggestion}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;