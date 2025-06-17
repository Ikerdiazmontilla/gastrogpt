// frontend/src/services/apiService.js

const BASE_URL = '';

const getErrorFromResponse = async (response) => {
  try {
    const errorData = await response.json();
    return errorData.error || `Error HTTP ${response.status}: ${response.statusText || 'Unknown server error'}`;
  } catch (e) {
    return `Error HTTP ${response.status}: ${response.statusText || 'Failed to parse error response'}`;
  }
};

const fetchApi = async (endpoint, options = {}) => {
  const finalHeaders = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const url = `${BASE_URL}${endpoint}`;
  console.log(`[apiService] Fetching from URL: ${url}`);

  const response = await fetch(url, {
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

export const fetchTenantConfig = () => {
    return fetchApi('/api/config', { method: 'GET' });
};

export const fetchConversation = () => {
  return fetchApi('/api/conversation', { method: 'GET' });
};

export const postChatMessage = (messageText) => {
  return fetchApi('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: messageText }),
  });
};

export const resetChatConversation = () => {
  return fetchApi('/api/reset', { method: 'POST' });
};

/**
 * NUEVO: Envía el feedback del usuario al backend.
 * @param {object} feedbackData - Contiene { conversationId, rating, comment }.
 * @returns {Promise<object>} - El resultado de la operación.
 */
export const sendFeedback = (feedbackData) => {
  return fetchApi('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });
};

export const transcribeAudio = (audioBlob, filename = 'audio.webm') => {
  const formData = new FormData();
  formData.append('audio', audioBlob, filename);

  return fetchApi('/api/transcribe-audio', {
    method: 'POST',
    body: formData,
  });
};