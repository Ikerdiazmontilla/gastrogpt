// frontend/src/features/Chat/hooks/useAudioRecorder.js
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

  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const startAudioRecording = async () => {
    if (isRecording || isTranscribing) return;
    onError(null);
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
  
  // MODIFICADO: Ahora incluye la lógica de timeout.
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
        // ---- NUEVA LÓGICA DE TIMEOUT ----
        // 1. Creamos una promesa que falla después de 7 segundos.
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('timeout')), 7000);
        });

        // 2. Creamos la promesa de transcripción.
        const transcriptionPromise = transcribeAudio(audioBlob, 'recording.webm');

        // 3. Usamos Promise.race para ver cuál termina primero.
        const data = await Promise.race([transcriptionPromise, timeoutPromise]);
        
        if (data.transcription) {
          onTranscriptionSuccess(data.transcription);
        }
        // ---- FIN DE LA NUEVA LÓGICA ----
      } catch (err) {
        // MODIFICADO: Se captura el error de timeout.
        if (err.message === 'timeout') {
          onError(t('chat.errorTranscriptionTimeout'));
        } else {
          onError(err.message || t('chat.errorTranscription'));
        }
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

  return {
    isRecording,
    isTranscribing,
    startAudioRecording,
    stopAudioRecordingAndTranscribe,
    cancelAudioRecording,
    stopMediaStream
  };
};