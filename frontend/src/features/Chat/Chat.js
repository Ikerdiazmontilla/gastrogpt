// frontend/src/features/Chat/Chat.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './Chat.module.css';
import { ReactComponent as SendIcon } from '../../assets/up-arrow-icon.svg';
import { firstMessageSpanish, firstMessageEnglish } from './firstMessage'; // Frontend's rich welcome message
import { chatSuggestions } from '../../data/translations';
import { ReactComponent as MicrophoneIcon } from '../../assets/microphone.svg';

import {
  fetchConversation,
  postChatMessage,
  resetChatConversation,
  transcribeAudio,
} from '../../services/apiService';

import { createMarkdownLinkRenderer, markdownUrlTransform } from '../../utils/markdownUtils';

const Chat = ({ currentLanguage, onViewDishDetails }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [limitNotification, setLimitNotification] = useState('');

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false); // New state for transcription phase
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);

  const firstMessageText = currentLanguage === 'Español' ? firstMessageSpanish : firstMessageEnglish;
  const currentSuggestions = chatSuggestions[currentLanguage] || chatSuggestions['English'];

  const CustomLink = useMemo(() =>
    createMarkdownLinkRenderer(onViewDishDetails, styles),
    [onViewDishDetails]
  );

  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsLimitReached(false);
    setLimitNotification('');
    const richWelcomeMessageObject = { sender: 'bot', text: firstMessageText };
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
  }, [currentLanguage, firstMessageText]);

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
      console.log("Microphone stream stopped.");
    }
  }, []);


  const handleSend = async () => {
    if (isLimitReached || isRecording || isTranscribing) return; // Don't send if recording, transcribing, or limit reached
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
        console.error('Unexpected response from backend (no reply):', data);
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
        displayError = err.response.data.error || (currentLanguage === 'Español' ? "Límite de mensajes superado. Inicia un nuevo chat." : "Message limit exceeded. Start a new chat.");
        setIsLimitReached(true);
        setLimitNotification(displayError);
      } else if (err.response && err.response.data && err.response.data.error) {
        displayError = err.response.data.error;
      }
      setError(displayError);
    }
    if (!isLimitReached && textareaRef.current) {
      // Focus handled by setTimeout above
    }
  };

  const handleReset = async () => {
    try {
      await resetChatConversation();
      setInput('');
      if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => { // Ensure a clean onstop
            stopMediaStream();
            audioChunksRef.current = [];
            console.log("Recording stopped due to reset.");
        };
        mediaRecorderRef.current.stop();
      } else {
        stopMediaStream(); // Ensure microphone is released if not actively recording but stream might be open
      }
      setIsRecording(false);
      setIsTranscribing(false); // Reset transcribing state on chat reset
      audioChunksRef.current = [];
      await loadConversation();
      if (textareaRef.current) {
          textareaRef.current.blur(); // Optionally blur to prevent keyboard pop-up
      }
    } catch (err)      {
      console.error('Error resetting conversation:', err.message);
      setError(`Error resetting: ${err.message}`);
      // Attempt to restore a basic state even if reset fails partially
      setInput('');
      setIsRecording(false);
      setIsTranscribing(false);
      await loadConversation(); // Reload to reflect any server-side changes or clear client state
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    if (isLimitReached || isRecording || isTranscribing) return; // Prevent input if recording, transcribing or limit reached
    setInput(suggestionText);
    if (textareaRef.current) {
        textareaRef.current.focus();
    }
  };

  const startAudioRecording = async () => {
    if (isRecording || isTranscribing) return; // Prevent starting if already recording or transcribing
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
      // onstop will be defined by the function that calls stop()

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsTranscribing(false); // Ensure transcribing is false when starting new recording
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(currentLanguage === 'Español' ? 'Error al acceder al micrófono. Asegúrate de dar permiso.' : 'Error accessing microphone. Please ensure permission is granted.');
      stopMediaStream();
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  const stopAudioRecordingAndTranscribe = async () => {
    if (!isRecording || !mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      // If not recording, or recorder isn't active, reset states and stream
      setIsRecording(false);
      setIsTranscribing(false);
      stopMediaStream();
      return;
    }

    setIsRecording(false); // Recording phase ends
    setIsTranscribing(true); // Transcription phase begins

    mediaRecorderRef.current.onstop = async () => {
        stopMediaStream();
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        if (audioBlob.size === 0) {
            console.warn("Audio blob is empty, not sending for transcription.");
            setError(currentLanguage === "Español" ? "No se grabó audio." : "No audio recorded.");
            // No change to isRecording, already false
            setIsTranscribing(false); // Transcription phase ends (due to error/empty blob)
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
            console.error('Error transcribing audio:', err);
            setError(err.message || (currentLanguage === 'Español' ? 'Fallo al transcribir.' : 'Failed to transcribe.'));
        } finally {
            // No change to isRecording, already false
            setIsTranscribing(false); // Transcription phase ends
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    };
    mediaRecorderRef.current.stop();
  };


  const cancelAudioRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setIsRecording(false);
        setIsTranscribing(false);
        stopMediaStream();
        return;
    }
    mediaRecorderRef.current.onstop = () => {
        stopMediaStream();
        audioChunksRef.current = [];
        console.log("Recording cancelled by user.");
    };
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsTranscribing(false); // Ensure transcribing is false if recording is cancelled
  };

  useEffect(() => {
    return () => {
      stopMediaStream();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopMediaStream]);

  const isInputAreaDisabled = (isLoading && messages.length <= 1 && !error) || isLimitReached || isTranscribing;
  const isResetDisabled = (isLoading && messages.length <= 1 && !isLimitReached && !error) || isRecording || isTranscribing;
  // Disable textarea and send button if recording, transcribing, or limit reached
  const isTextareaAndSendDisabled = isLimitReached || isRecording || isTranscribing;
  // Disable mic button if limit reached or transcribing (it has its own recording logic)
  const isMicButtonDisabled = isLimitReached || isTranscribing;
  // Disable suggestion chips if limit reached, recording, or transcribing
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
              isTranscribing
                ? (currentLanguage === 'Español' ? 'Transcribiendo...' : 'Transcribing...')
                : isRecording
                ? (currentLanguage === 'Español' ? 'Grabando...' : 'Recording...')
                : isLimitReached
                ? (currentLanguage === 'Español' ? 'Límite alcanzado. Reinicia.' : 'Limit reached. Reset chat.')
                : (currentLanguage === 'Español' ? 'Escribe tu mensaje...' : 'Write your message...')
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTextareaAndSendDisabled}
            readOnly={isTextareaAndSendDisabled} // Using readOnly is often better for accessibility with disabled
            className={styles.chatTextarea}
          />
          {isTranscribing ? (
            // While transcribing, show disabled mic and send buttons
            <>
              <button
                className={`${styles.micButton} ${styles.micButtonDisabled}`}
                disabled
                title={currentLanguage === 'Español' ? 'Transcribiendo audio...' : 'Transcribing audio...'}
              >
                <MicrophoneIcon className={styles.microphoneSvg}/>
              </button>
              <button
                className={styles.sendMessage}
                disabled
              >
                <SendIcon className={styles.sendSvg} />
              </button>
            </>
          ) : isRecording ? (
            // While recording, show cancel and stop buttons
            <>
              <button
                className={styles.cancelRecordButton}
                onClick={cancelAudioRecording}
                title={currentLanguage === 'Español' ? 'Cancelar grabación' : 'Cancel recording'}
              >
                ❌
              </button>
              <button
                className={styles.stopRecordButton}
                onClick={stopAudioRecordingAndTranscribe}
                title={currentLanguage === 'Español' ? 'Detener y transcribir' : 'Stop and transcribe'}
              >
                ✔️
              </button>
            </>
          ) : (
            // Default state: show functional mic and send buttons
            <>
              <button
                className={`${styles.micButton} ${isMicButtonDisabled ? styles.micButtonDisabled : ''}`}
                onClick={startAudioRecording}
                disabled={isMicButtonDisabled}
                title={currentLanguage === 'Español' ? 'Grabar voz' : 'Record voice'}
              >
                <MicrophoneIcon className={styles.microphoneSvg}/>
              </button>
              <button
                className={styles.sendMessage}
                onClick={handleSend}
                disabled={isTextareaAndSendDisabled || input.trim() === ''}
              >
                <SendIcon className={styles.sendSvg} />
              </button>
            </>
          )}
        </div>
        <div
          className={styles.bottomControlsContainer} // Updated class name for the wrapper
        >
          <button
            onClick={handleReset}
            disabled={isResetDisabled}
            className={styles.resetIconChipFixed} // Updated class name
            aria-label={currentLanguage === 'Español' ? 'Nuevo chat' : 'New chat'}
            title={currentLanguage === 'Español' ? 'Nuevo chat' : 'New chat'}
          >
            ↻
          </button>
          <div className={styles.suggestionsContainerScrollable}> {/* New scrollable container for chips */}
            {currentSuggestions.map((suggestion, index) => (
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