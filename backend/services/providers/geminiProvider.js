// <file path="backend/services/providers/geminiProvider.js">
const axios = require('axios');
const config = require('../../config/config'); // Use centralized config

/**
 * @file geminiProvider.js
 * @description Handles communication with a Gemini API.
 * Note: The original implementation used an OpenAI compatibility endpoint.
 * This version is updated to reflect common direct Gemini API usage patterns if that's the intent,
 * or can be kept as is if the OpenAI-compatible endpoint is still desired.
 * For this iteration, I'll keep the OpenAI compatibility endpoint as per the original structure
 * but use the new config values.
 */

const apiKey = config.geminiApiKey;
// The URL is for OpenAI compatibility endpoint, as per original project.
// If direct Gemini API is preferred, this URL and request structure would change.
const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'; // Kept from original for consistency
const { modelName, maxTokens, temperature } = config.llm.gemini; // Get Gemini specific settings

/**
 * Calls the Gemini API (via OpenAI compatibility layer) to get a chat response.
 *
 * @param {Array<Object>} messages - The history of the conversation.
 * @returns {Promise<string>} - The assistant's response.
 * @throws {Error} - If an API error occurs or the API key is missing.
 */
async function getGeminiChatResponse(messages) {
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not configured.');
    throw new Error('Gemini API Key configuration incomplete.');
  }

  try {
    console.log(`Sending request to Gemini compatible API: ${apiUrl} with model: ${modelName}, max_tokens: ${maxTokens}, temperature: ${temperature}`);

    const response = await axios.post(
      apiUrl,
      {
        model: modelName, // Using configured model name
        messages: messages,
        max_tokens: maxTokens,    // Using configured max tokens
        temperature: temperature, // Using configured temperature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content.trim();
    } else {
      console.error('Error: Gemini API response (OpenAI compatibility mode) lacks expected structure. Response:', response.data);
      throw new Error('Unexpected response from Gemini Chatbot API.');
    }

  } catch (error) {
    console.error('Error communicating with Gemini API (via OpenAI compatibility):');
    if (error.response) {
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request:', error.request);
    } else {
      console.error('Config Error:', error.message);
    }
    throw new Error('Failed to get response from Gemini Chatbot API.');
  }
}

module.exports = { getGeminiChatResponse };
// </file>