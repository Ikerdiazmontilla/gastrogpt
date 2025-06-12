// frontend/src/features/Chat/Chat.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
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

const Chat = ({ currentLanguage, onViewDishDetails }) => {
  const { tenantConfig } = useTenant();
  const menu = tenantConfig?.menu;
  const welcomeMessage = tenantConfig?.welcomeMessage || (currentLanguage === 'Español' ? 'Hola...' : 'Hello...');
  
  // Obtenemos las configuraciones para los chips de sugerencia, con fallbacks.
  const suggestions = tenantConfig?.suggestionChipsText || [];
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

  const CustomLink = useMemo(() =>
    createMarkdownLinkRenderer(onViewDishDetails, menu, styles),
    [onViewDishDetails, menu]
  );

  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsLimitReached(false);
    setLimitNotification('');
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
  }, [currentLanguage, welcomeMessage]);

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
        displayError = err.response.data.error || (currentLanguage === 'Español' ? "Límite superado." : "Message limit exceeded.");
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
      setError(currentLanguage === 'Español' ? 'Error al acceder al micrófono.' : 'Error accessing microphone.');
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
            setError(currentLanguage === "Español" ? "No se grabó audio." : "No audio recorded.");
            setIsTranscribing(false);
            return;
        }

        try {
            const data = await transcribeAudio(audioBlob, 'recording.webm');
            if (data.transcription) {
                setInput(prevInput => prevInput + data.transcription + ' ');
            } else {
                setError(data.error || (currentLanguage === 'Español' ? 'Error en la transcripción.' : 'Transcription error.'));
            }
        } catch (err) {
            setError(err.message || (currentLanguage === 'Español' ? 'Fallo al transcribir.' : 'Failed to transcribe.'));
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
        data-no-tab-swipe="true"
      >
        <div className={styles.inputArea}>
          <textarea
            ref={textareaRef}
            rows="1"
            placeholder={
              isTranscribing ? 'Transcribiendo...' :
              isRecording ? 'Grabando...' :
              isLimitReached ? 'Límite alcanzado. Reinicia.' :
              'Escribe tu mensaje...'
            }
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
            {/* Renderizamos los chips dinámicamente */}
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