// <file path="backend/services/providers/openaiProvider.js">
const axios = require('axios');
const config = require('../../config/config'); // Use centralized config

/**
 * @file openaiProvider.js
 * @description Handles communication with the OpenAI API.
 */

const apiKey = config.openaiApiKey;
const apiUrl = 'https://api.openai.com/v1/chat/completions'; // Standard OpenAI API URL
const { modelName, maxTokens, temperature } = config.llm.openai; // Get OpenAI specific settings

/**
 * Calls the OpenAI API to get a chat response.
 * @param {Array<Object>} messages - The history of the conversation.
 * @returns {Promise<string>} - The assistant's response.
 * @throws {Error} - If an API error occurs or the API key is missing.
 */
async function getOpenAIChatResponse(messages) {
  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY is not configured.');
    throw new Error('OpenAI API Key configuration incomplete.');
  }

  try {
    console.log(`Sending request to OpenAI API: ${apiUrl} with model: ${modelName}, max_tokens: ${maxTokens}, temperature: ${temperature}`);

    const response = await axios.post(
      apiUrl,
      {
        model: modelName,       // Using configured model name
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
      console.error('Error: OpenAI API response lacks expected structure. Response:', response.data);
      throw new Error('Unexpected response from OpenAI API.');
    }

  } catch (error) {
    console.error('Error communicating with OpenAI API:');
    if (error.response) {
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request:', error.request);
    } else {
      console.error('Config Error:', error.message);
    }
    throw new Error('Failed to get response from OpenAI API.');
  }
}

module.exports = { getOpenAIChatResponse };
// </file>