// src/services/apiService.js

const BASE_URL = process.env.REACT_APP_BACKEND_URL || ''; // Base URL for backend
// console.log('base url: ',BASE_URL)
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
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Always include credentials for session handling
    ...options,
  });

  if (!response.ok) {
    const errorMessage = await getErrorFromResponse(response);
    throw new Error(errorMessage);
  }
  // For 204 No Content or similar, response.json() will fail.
  // Check if there's content to parse.
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return {}; // Return empty object or handle as needed for non-JSON responses
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