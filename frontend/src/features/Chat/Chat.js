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

const Chat = ({ onViewDishDetails }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const { tenantConfig } = useTenant();
  const menu = tenantConfig?.menu;
  
  const welcomeMessage = tenantConfig?.welcomeMessage?.[currentLanguage] || tenantConfig?.welcomeMessage?.es || t('chat.placeholder');
  const suggestions = tenantConfig?.suggestionChipsText?.[currentLanguage] || tenantConfig?.suggestionChipsText?.es || [];
  const suggestionCount = tenantConfig?.suggestionChipsCount || 4;
  
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
  
  // --- NUEVO ESTADO PARA EVITAR REPETICIONES ---
  const [feedbackAlreadyShown, setFeedbackAlreadyShown] = useState(false);


  const CustomLink = useMemo(() =>
    createMarkdownLinkRenderer(onViewDishDetails, menu, styles),
    [onViewDishDetails, menu]
  );

  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsLimitReached(false);
    setLimitNotification('');
    setShowFeedbackUI(false);
    setFeedbackAlreadyShown(false); // Reiniciar al cargar nueva conversación
    const richWelcomeMessageObject = { sender: 'bot', text: welcomeMessage };
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
             setLimitNotification(t('chat.limitReachedCta'));
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
  }, [t, welcomeMessage]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, limitNotification, showFeedbackUI]);

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

  const handleSend = async () => {
    if (isLimitReached || isRecording || isTranscribing) return;
    const trimmedInput = input.trim();
    if (trimmedInput === '') return;

    setShowFeedbackUI(false);
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
      
      setActiveConversationId(data.conversationId);
      if (data.reply) {
        setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: data.reply }]);
        
        // --- LÓGICA DE CONTROL DE FEEDBACK MEJORADA ---
        if (data.isFinalMessage && !feedbackAlreadyShown) {
            setShowFeedbackUI(true);
            setFeedbackAlreadyShown(true); // Marcar como mostrado para esta sesión
        }
      } 
      
      else if (data.limitExceeded) {
        setError(data.error || t('chat.limitReached'));
        setIsLimitReached(true);
        setLimitNotification(data.error || t('chat.limitReachedCta'));
      } else {
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
        displayError = err.response.data.error || t('chat.limitReached');
        setIsLimitReached(true);
        setLimitNotification(displayError);
      } else if (err.response && err.response.data && err.response.data.error) {
        displayError = err.response.data.error;
      }
      setError(displayError);
    }
  };

  const handleReset = async () => {
    try {
      await resetChatConversation();
      setInput('');
      if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
            stopMediaStream();
            audioChunksRef.current = [];
        };
        mediaRecorderRef.current.stop();
      } else {
        stopMediaStream();
      }
      setIsRecording(false);
      setIsTranscribing(false);
      audioChunksRef.current = [];
      await loadConversation();
      if (textareaRef.current) {
          textareaRef.current.blur();
      }
    } catch (err) {
      setError(`Error resetting: ${err.message}`);
      await loadConversation();
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    if (isLimitReached || isRecording || isTranscribing) return;
    setInput(suggestionText);
    if (textareaRef.current) {
        textareaRef.current.focus();
    }
  };
  
  // ... (resto de funciones de audio sin cambios)
  const startAudioRecording = async () => {
    if (isRecording || isTranscribing) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsTranscribing(false);
    } catch (err) {
      setError(t('chat.errorAccessingMic'));
      stopMediaStream();
    }
  };

  const stopAudioRecordingAndTranscribe = async () => {
    if (!isRecording || !mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      stopMediaStream();
      return;
    }

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
            if (data.transcription) {
                setInput(prevInput => prevInput + data.transcription + ' ');
            } else {
                setError(data.error || t('chat.errorTranscription'));
            }
        } catch (err) {
            setError(err.message || 'Failed to transcribe.');
        } finally {
            setIsTranscribing(false);
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    };
    mediaRecorderRef.current.stop();
  };

  const cancelAudioRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        stopMediaStream();
        return;
    }
    mediaRecorderRef.current.onstop = () => {
        stopMediaStream();
        audioChunksRef.current = [];
    };
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsTranscribing(false);
  };

  useEffect(() => {
    return () => {
      stopMediaStream();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopMediaStream]);

  const isResetDisabled = (isLoading && messages.length <= 1 && !isLimitReached && !error) || isRecording || isTranscribing;
  const isTextareaAndSendDisabled = isLimitReached || isRecording || isTranscribing;
  const isMicButtonDisabled = isLimitReached || isTranscribing;
  const areSuggestionsDisabled = isLimitReached || isRecording || isTranscribing;
  
  const getPlaceholderText = () => {
    if (isTranscribing) return t('chat.placeholderTranscribing');
    if (isRecording) return t('chat.placeholderRecording');
    if (isLimitReached) return t('chat.placeholderLimit');
    return t('chat.placeholder');
  };

  return (
    <>
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {isLoading && messages.length <= 1 && !error && (
            <div className={`${styles.message} ${styles.system}`}>
              {t('chat.loadingHistory')}
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
          {showFeedbackUI && (
            <Feedback
              conversationId={activeConversationId}
              onFeedbackSent={() => setShowFeedbackUI(false)}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        className={styles.inputWrapper}
        data-no-tab-swipe="true"
      >
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
          {isTranscribing ? (
            <>
              <button className={`${styles.micButton} ${styles.micButtonDisabled}`} disabled> <MicrophoneIcon className={styles.microphoneSvg}/> </button>
              <button className={styles.sendMessage} disabled> <SendIcon className={styles.sendSvg} /> </button>
            </>
          ) : isRecording ? (
            <>
              <button className={styles.cancelRecordButton} onClick={cancelAudioRecording}> ❌ </button>
              <button className={styles.stopRecordButton} onClick={stopAudioRecordingAndTranscribe}> ✔️ </button>
            </>
          ) : (
            <>
              <button className={`${styles.micButton} ${isMicButtonDisabled ? styles.micButtonDisabled : ''}`} onClick={startAudioRecording} disabled={isMicButtonDisabled}> <MicrophoneIcon className={styles.microphoneSvg}/> </button>
              <button className={styles.sendMessage} onClick={handleSend} disabled={isTextareaAndSendDisabled || input.trim() === ''}> <SendIcon className={styles.sendSvg} /> </button>
            </>
          )}
        </div>
        <div className={styles.bottomControlsContainer}>
          <button onClick={handleReset} disabled={isResetDisabled} className={styles.resetIconChipFixed}> ↻ </button>
          <div className={styles.suggestionsContainerScrollable}>
            {suggestions.slice(0, suggestionCount).map((suggestion, index) => (
              <button
                key={index}
                className={styles.suggestionChip}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={areSuggestionsDisabled}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;