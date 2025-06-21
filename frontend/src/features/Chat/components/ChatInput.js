// frontend/src/features/Chat/components/ChatInput.js
import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../Chat.module.css';
import { ReactComponent as SendIcon } from '../../../assets/up-arrow-icon.svg';
import { ReactComponent as MicrophoneIcon } from '../../../assets/microphone.svg';
// OrderButton ha sido eliminado

const ChatInput = ({
  input,
  setInput,
  handleSendMessage,
  handleReset,
  handleSuggestionClick,
  isRecording,
  isTranscribing,
  isBotTyping,
  isLimitReached,
  startAudioRecording,
  stopAudioRecordingAndTranscribe,
  cancelAudioRecording,
  suggestions,
  suggestionCount,
  // onOpenOrder ha sido eliminado
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef(null);

  // Ajusta la altura del textarea dinámicamente
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Restablece la altura para calcular el scrollHeight correctamente
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Establece la altura al scrollHeight
    }
  }, [input]); // Se ejecuta cada vez que el input cambia

  // Obtiene el texto del placeholder según si el límite de mensajes ha sido alcanzado
  const getPlaceholderText = () => {
    if (isLimitReached) return t('chat.placeholderLimit');
    return t('chat.placeholder');
  };

  // Determina si los botones de control y el input deben estar deshabilitados
  const isResetDisabled = isRecording || isTranscribing || isBotTyping;
  const isTextareaAndSendDisabled = isLimitReached || isBotTyping;
  const isMicButtonDisabled = isLimitReached || isTranscribing || isBotTyping || isRecording;
  const areSuggestionsDisabled = isLimitReached || isRecording || isTranscribing || isBotTyping;


  return (
    <div className={styles.inputWrapper} data-no-tab-swipe="true">
      <div className={styles.inputArea}>
        {isRecording || isTranscribing ? (
          // Muestra el estado de grabación/transcripción
          <div className={styles.recordingStatusContainer}>
            {isRecording && (<button className={styles.recordingControlButton} onClick={cancelAudioRecording}>✖️</button>)}
            <span className={styles.statusText}>{isTranscribing ? t('chat.placeholderTranscribing') : t('chat.placeholderRecording')}</span>
            {isRecording && (<button className={styles.recordingControlButton} onClick={stopAudioRecordingAndTranscribe}>✔️</button>)}
          </div>
        ) : (
          // Muestra el input normal y los botones de enviar/micrófono
          <>
            <textarea
              ref={textareaRef}
              rows="1"
              placeholder={getPlaceholderText()}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTextareaAndSendDisabled}
              readOnly={isTextareaAndSendDisabled} // También readOnly para evitar edición si está deshabilitado
              className={styles.chatTextarea}
            />
            <button
              className={`${styles.micButton} ${isMicButtonDisabled ? styles.micButtonDisabled : ''}`}
              onClick={startAudioRecording}
              disabled={isMicButtonDisabled}
            >
              <MicrophoneIcon className={styles.microphoneSvg} />
            </button>
            <button
              className={styles.sendMessage}
              onClick={handleSendMessage}
              disabled={isTextareaAndSendDisabled || input.trim() === ''} // Deshabilita si el input está vacío
            >
              <SendIcon className={styles.sendSvg} />
            </button>
          </>
        )}
      </div>
      
      <div className={styles.bottomControlsContainer}>
        {/* Botón para reiniciar el chat */}
        <button onClick={handleReset} disabled={isResetDisabled} className={styles.resetIconChipFixed}>
          ↻
        </button>
        {/* Contenedor de sugerencias con scroll horizontal */}
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

      {/* El contenedor para el botón de pedido ha sido eliminado */}
    </div>
  );
};

export default ChatInput;