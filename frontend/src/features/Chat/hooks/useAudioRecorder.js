import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../../../services/apiService';

/**
 * Hook personalizado para manejar la grabación y transcripción de audio.
 * @param {function} onTranscriptionSuccess - Callback que se ejecuta con el texto transcrito.
 * @param {function} onError - Callback para manejar errores.
 * @param {function} t - Función de traducción de i18next.
 * @returns {object} Estado y funciones para controlar la grabación de audio.
 */
export const useAudioRecorder = (onTranscriptionSuccess, onError, t) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);

  // Detiene las pistas de medios (cámara, micrófono) para liberar los recursos.
  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // Inicia la grabación de audio.
  const startAudioRecording = async () => {
    if (isRecording || isTranscribing) return;
    onError(null); // Limpia errores previos
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
      onError(t('chat.errorAccessingMic'));
      stopMediaStream();
    }
  };

  // Detiene la grabación y envía el audio para ser transcrito.
  const stopAudioRecordingAndTranscribe = async () => {
    if (!isRecording || !mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    setIsRecording(false);
    setIsTranscribing(true);

    mediaRecorderRef.current.onstop = async () => {
      stopMediaStream();
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      audioChunksRef.current = [];

      if (audioBlob.size === 0) {
        onError(t('chat.errorNoAudio'));
        setIsTranscribing(false);
        return;
      }
      try {
        const data = await transcribeAudio(audioBlob, 'recording.webm');
        if (data.transcription) {
          onTranscriptionSuccess(data.transcription);
        }
      } catch (err) {
        onError(err.message || t('chat.errorTranscription'));
      } finally {
        setIsTranscribing(false);
      }
    };
    mediaRecorderRef.current.stop();
  };

  // Cancela la grabación sin procesar el audio.
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

  // Exporta el estado y las funciones para que el componente las use.
  return {
    isRecording,
    isTranscribing,
    startAudioRecording,
    stopAudioRecordingAndTranscribe,
    cancelAudioRecording,
    stopMediaStream
  };
};