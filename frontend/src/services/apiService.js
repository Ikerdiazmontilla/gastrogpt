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

export const sendFeedback = (feedbackData) => {
  return fetchApi('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });
};

/**
 * NEW: Tracks a click on the Google Review link.
 * @param {string} conversationId - The ID of the conversation.
 * @returns {Promise<object>} - The result of the operation.
 */
export const trackGoogleReviewClick = (conversationId) => {
  return fetchApi('/api/feedback/track-click', {
    method: 'POST',
    body: JSON.stringify({ conversationId }),
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