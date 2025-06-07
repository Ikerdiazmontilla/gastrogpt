// frontend/src/services/apiService.js

const BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Helper to process API responses and extract errors.
 * @param {Response} response - The fetch response object.
 * @returns {Promise<string>} - The error message.
 */
const getErrorFromResponse = async (response) => {
  try {
    const errorData = await response.json();
    return errorData.error || `Error HTTP ${response.status}: ${response.statusText || 'Unknown server error'}`;
  } catch (e) {
    return `Error HTTP ${response.status}: ${response.statusText || 'Failed to parse error response'}`;
  }
};

/**
 * Generic fetch wrapper
 * @param {string} endpoint - The API endpoint (e.g., '/api/chat').
 * @param {object} options - Fetch options (method, headers, body, credentials).
 * @returns {Promise<any>} - The JSON response data.
 * @throws {Error} - If the network response is not ok.
 */
const fetchApi = async (endpoint, options = {}) => {
  const finalHeaders = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers: finalHeaders,
  });

  if (!response.ok) {
    const errorMessage = await getErrorFromResponse(response);
    const error = new Error(errorMessage);
    try {
        error.response = await response.json();
    } catch (e) {
        error.response = { status: response.status, statusText: response.statusText };
    }
    throw error;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return {};
};

// --- Specific API functions ---

/**
 * Fetches the current chat conversation history.
 * @returns {Promise<object>} - The conversation data.
 */
export const fetchConversation = () => {
  return fetchApi('/api/conversation', { method: 'GET' });
};

/**
 * Sends a chat message to the backend.
 * @param {string} messageText - The text of the user's message.
 * @returns {Promise<object>} - The backend's reply.
 */
export const postChatMessage = (messageText) => {
  return fetchApi('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: messageText }),
  });
};

/**
 * Resets the current chat conversation on the backend.
 * @returns {Promise<object>} - Confirmation message.
 */
export const resetChatConversation = () => {
  return fetchApi('/api/reset', { method: 'POST' });
};

/**
 * Submits questionnaire data to get recommendations.
 * @param {object} questionnaireData - The data from the questionnaire form.
 * @returns {Promise<object>} - The AI's recommendations.
 */
export const submitQuestionnaire = (questionnaireData) => {
  return fetchApi('/api/questionnaire', {
    method: 'POST',
    body: JSON.stringify(questionnaireData),
  });
};

/**
 * Sends an audio blob to the backend for transcription.
 * @param {Blob} audioBlob - The audio data to transcribe.
 * @param {string} filename - The filename for the audio blob.
 * @returns {Promise<object>} - The transcription result.
 */
export const transcribeAudio = (audioBlob, filename = 'audio.webm') => {
  const formData = new FormData();
  formData.append('audio', audioBlob, filename);
  return fetchApi('/api/transcribe-audio', {
    method: 'POST',
    body: formData,
  });
};

/**
 * New: Fetches a signed URL to start a Conversational AI session.
 * @returns {Promise<object>} - The response containing the signed URL.
 */
export const getSignedUrlForVoiceChat = () => {
  return fetchApi('/api/convai/signed-url', { method: 'POST' });
};