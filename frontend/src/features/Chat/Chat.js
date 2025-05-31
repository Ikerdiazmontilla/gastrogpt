// <file path="frontend/src/features/Chat/Chat.js">
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
  transcribeAudio, // Import the new service
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

  // --- Voice Recording State ---
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null); // To store the stream for cleanup
  // --- End Voice Recording State ---

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

  // Cleanup function to stop media stream tracks
  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      console.log("Microphone stream stopped.");
    }
  }, []);


  const handleSend = async () => {
    if (isLimitReached || isRecording) return; // Don't send if recording or limit reached
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
      if (isRecording && mediaRecorderRef.current) {
        // No need to define onstop here, stopMediaStream will be called by cancelAudioRecording
        mediaRecorderRef.current.stop();
      }
      stopMediaStream(); // Ensure microphone is released
      setIsRecording(false);
      setIsTranscribing(false);
      audioChunksRef.current = [];
      await loadConversation();
      if (textareaRef.current) {
          textareaRef.current.blur();
      }
    } catch (err)      {
      console.error('Error resetting conversation:', err.message);
      setError(`Error resetting: ${err.message}`);
      setInput('');
      await loadConversation();
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    if (isLimitReached || isRecording) return;
    setInput(suggestionText);
    if (textareaRef.current) {
        textareaRef.current.focus();
    }
  };

  // --- Voice Recording Functions ---
  const startAudioRecording = async () => {
    if (isRecording) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream; // Store the stream
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // The onstop event will be dynamically assigned by the function that calls stop()
      // (either stopAudioRecordingAndTranscribe or cancelAudioRecording)

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(currentLanguage === 'Español' ? 'Error al acceder al micrófono. Asegúrate de dar permiso.' : 'Error accessing microphone. Please ensure permission is granted.');
      stopMediaStream(); // Clean up if permission failed after stream was partially acquired
      setIsRecording(false);
    }
  };

  const stopAudioRecordingAndTranscribe = async () => {
    if (!isRecording || !mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      setIsRecording(false);
      stopMediaStream(); // Ensure stream is stopped if somehow in inconsistent state
      return;
    }

    setIsTranscribing(true);
    // Assign the onstop handler specifically for transcription
    mediaRecorderRef.current.onstop = async () => {
        stopMediaStream(); // Stop the tracks once recording is truly finished
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        if (audioBlob.size === 0) {
            console.warn("Audio blob is empty, not sending for transcription.");
            setError(currentLanguage === "Español" ? "No se grabó audio." : "No audio recorded.");
            setIsRecording(false);
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
            console.error('Error transcribing audio:', err);
            setError(err.message || (currentLanguage === 'Español' ? 'Fallo al transcribir.' : 'Failed to transcribe.'));
        } finally {
            setIsRecording(false);
            setIsTranscribing(false);
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    };
    mediaRecorderRef.current.stop(); // This triggers the onstop handler above
  };


  const cancelAudioRecording = () => {
    if (!isRecording || !mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      setIsRecording(false);
      stopMediaStream(); // Ensure stream is stopped
      return;
    }
    // Assign the onstop handler specifically for cancellation
    mediaRecorderRef.current.onstop = () => {
        stopMediaStream(); // Stop the tracks
        audioChunksRef.current = [];
        console.log("Recording cancelled by user.");
    };
    mediaRecorderRef.current.stop(); // This triggers the onstop handler above
    setIsRecording(false);
    setIsTranscribing(false);
  };

  // Effect for cleaning up media stream on component unmount or language change (which reloads)
  useEffect(() => {
    return () => {
      stopMediaStream();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopMediaStream]); // Add stopMediaStream to dependency array

  // --- End Voice Recording Functions ---


  const isInputAreaDisabled = (isLoading && messages.length <= 1 && !error) || isLimitReached || isTranscribing;
  const isResetDisabled = (isLoading && messages.length <= 1 && !isLimitReached && !error) || isRecording || isTranscribing;

  return (
    <>
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {isLoading && messages.length <= 1 && !error && (
            <div className={`${styles.message} ${styles.system}`}>
              {currentLanguage === 'Español' ? 'Cargando historial...' : 'Loading history...'}
            </div>
          )}
          {error && (!isLimitReached || !limitNotification) && ( // Show general errors if not a limit notification case
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
              isRecording
                ? (currentLanguage === 'Español' ? 'Grabando...' : 'Recording...')
                : isTranscribing
                ? (currentLanguage === 'Español' ? 'Transcribiendo...' : 'Transcribing...')
                : isLimitReached
                ? (currentLanguage === 'Español' ? 'Límite alcanzado. Reinicia.' : 'Limit reached. Reset chat.')
                : (currentLanguage === 'Español' ? 'Escribe tu mensaje...' : 'Write your message...')
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isInputAreaDisabled || isRecording} // Also disable textarea while recording
            readOnly={isLimitReached || isRecording || isTranscribing}
            className={styles.chatTextarea}
          />
          {!isRecording ? (
            <>
              <button
                className={`${styles.micButton} ${isTranscribing ? styles.micButtonDisabled : ''}`}
                onClick={startAudioRecording}
                disabled={isInputAreaDisabled || isTranscribing}
                title={currentLanguage === 'Español' ? 'Grabar voz' : 'Record voice'}
              >
                <MicrophoneIcon className={styles.microphoneSvg}/>
              </button>
              <button
                className={styles.sendMessage}
                onClick={handleSend}
                disabled={isInputAreaDisabled || input.trim() === ''}
              >
                <SendIcon className={styles.sendSvg} />
              </button>
            </>
          ) : (
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
          )}
        </div>
        <div
          className={styles.suggestionsContainer}
        >
          <button
            onClick={handleReset}
            disabled={isResetDisabled}
            className={styles.resetIconChip}
            aria-label={currentLanguage === 'Español' ? 'Nuevo chat' : 'New chat'}
            title={currentLanguage === 'Español' ? 'Nuevo chat' : 'New chat'}
          >
            ↻
          </button>
          {currentSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className={styles.suggestionChip}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isInputAreaDisabled || isRecording} // Disable suggestions when recording/transcribing
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Chat;
// </file>