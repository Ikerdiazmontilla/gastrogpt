import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../Chat.module.css'; // Reutiliza los estilos existentes
import { ReactComponent as SendIcon } from '../../../assets/up-arrow-icon.svg';
import { ReactComponent as MicrophoneIcon } from '../../../assets/microphone.svg';

/**
 * Componente que renderiza el área de entrada del chat, incluyendo
 * el campo de texto, botones y sugerencias.
 */
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
  suggestionCount
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef(null);

  // Ajusta la altura del textarea dinámicamente según el contenido.
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Determina el texto del placeholder según el estado actual.
  const getPlaceholderText = () => {
    if (isLimitReached) return t('chat.placeholderLimit');
    return t('chat.placeholder');
  };

  // Lógica para deshabilitar botones según el estado del chat.
  const isResetDisabled = isRecording || isTranscribing || isBotTyping;
  const isTextareaAndSendDisabled = isLimitReached || isBotTyping;
  const isMicButtonDisabled = isLimitReached || isTranscribing || isBotTyping || isRecording;
  const areSuggestionsDisabled = isLimitReached || isRecording || isTranscribing || isBotTyping;

  return (
    <div className={styles.inputWrapper} data-no-tab-swipe="true">
      <div className={styles.inputArea}>
        {isRecording || isTranscribing ? (
          // Vista durante la grabación o transcripción.
          <div className={styles.recordingStatusContainer}>
            {isRecording && (
              <button className={styles.recordingControlButton} onClick={cancelAudioRecording}>
                ✖️
              </button>
            )}
            <span className={styles.statusText}>
              {isTranscribing ? t('chat.placeholderTranscribing') : t('chat.placeholderRecording')}
            </span>
            {isRecording && (
              <button className={styles.recordingControlButton} onClick={stopAudioRecordingAndTranscribe}>
                ✔️
              </button>
            )}
          </div>
        ) : (
          // Vista por defecto con el textarea.
          <>
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
            <button className={`${styles.micButton} ${isMicButtonDisabled ? styles.micButtonDisabled : ''}`} onClick={startAudioRecording} disabled={isMicButtonDisabled}>
              <MicrophoneIcon className={styles.microphoneSvg} />
            </button>
            <button className={styles.sendMessage} onClick={handleSendMessage} disabled={isTextareaAndSendDisabled || input.trim() === ''}>
              <SendIcon className={styles.sendSvg} />
            </button>
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
  );
};

export default ChatInput;