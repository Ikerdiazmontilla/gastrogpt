// <file path="backend/services/llmService.js">
const { getGeminiChatResponse } = require('./providers/geminiProvider');
const { getOpenAIChatResponse } = require('./providers/openaiProvider');
const config = require('../config/config');

/**
 * @file llmService.js
 * @description Abstraction layer for interacting with LLM providers.
 * Allows switching between different LLMs or using a specific one based on configuration.
 */

/**
 * Attempts to use the Gemini provider.
 * @param {Array<Object>} messages - Conversation messages.
 * @returns {Promise<string>} AI response.
 * @throws If API key is missing or API call fails.
 */
async function useGemini(messages) {
  if (!config.geminiApiKey) throw new Error('Gemini API key not configured.');
  console.log("Attempting to use Gemini provider.");
  return await getGeminiChatResponse(messages);
}

/**
 * Attempts to use the OpenAI provider.
 * @param {Array<Object>} messages - Conversation messages.
 * @returns {Promise<string>} AI response.
 * @throws If API key is missing or API call fails.
 */
async function useOpenAI(messages) {
  if (!config.openaiApiKey) throw new Error('OpenAI API key not configured.');
  console.log("Attempting to use OpenAI provider.");
  return await getOpenAIChatResponse(messages);
}

/**
 * Gets a chatbot response from an LLM provider.
 *
 * Logic:
 * 1. If `preferredProvider` (parameter) is specified and its key is available, try it.
 * 2. Else, if `config.llm.primaryProvider` is set and its key is available, try it.
 * 3. Else, if Gemini key is available, try Gemini.
 * 4. Else, if OpenAI key is available, try OpenAI.
 *
 * Fallback: If the chosen provider (from steps 1-3) fails, and the *other* provider has a key,
 * it will attempt to use the other provider.
 *
 * @param {Array<Object>} messages - The conversation messages for the AI.
 * @param {string} [preferredProviderParam] - Optional: 'gemini' or 'openai' to override default logic.
 * @returns {Promise<string>} - The AI's response.
 * @throws {Error} - If no suitable provider is configured/available or an API error occurs after exhausting options.
 */
async function getChatbotResponse(messages, preferredProviderParam) {
  const primaryConfiguredProvider = config.llm.primaryProvider; // from .env

  let providerToTry;
  let fallbackProvider;

  // Determine initial provider based on parameter, then config, then default availability
  if (preferredProviderParam === 'gemini' && config.geminiApiKey) {
    providerToTry = useGemini;
    fallbackProvider = config.openaiApiKey ? useOpenAI : null;
  } else if (preferredProviderParam === 'openai' && config.openaiApiKey) {
    providerToTry = useOpenAI;
    fallbackProvider = config.geminiApiKey ? useGemini : null;
  } else if (primaryConfiguredProvider === 'gemini' && config.geminiApiKey) {
    providerToTry = useGemini;
    fallbackProvider = config.openaiApiKey ? useOpenAI : null;
  } else if (primaryConfiguredProvider === 'openai' && config.openaiApiKey) {
    providerToTry = useOpenAI;
    fallbackProvider = config.geminiApiKey ? useGemini : null;
  } else if (config.geminiApiKey) { // Default to Gemini if key exists and no primary preference
    providerToTry = useGemini;
    fallbackProvider = config.openaiApiKey ? useOpenAI : null;
  } else if (config.openaiApiKey) { // Then OpenAI if key exists
    providerToTry = useOpenAI;
    fallbackProvider = config.geminiApiKey ? useGemini : null; // Should be null if gemini was already tried
  } else {
    console.error('Error: No LLM API Key is configured (GEMINI_API_KEY or OPENAI_API_KEY).');
    throw new Error('LLM service not configured: No API key available.');
  }

  try {
    if (!providerToTry) { // Should ideally be caught by the 'else' above, but as a safeguard.
         throw new Error('LLM service not configured: No suitable provider could be determined.');
    }
    return await providerToTry(messages);
  } catch (error) {
    console.warn(`Initial provider failed: ${error.message}.`);
    if (fallbackProvider) {
      console.log("Attempting to use fallback provider.");
      try {
        return await fallbackProvider(messages);
      } catch (fallbackError) {
        console.error(`Fallback provider also failed: ${fallbackError.message}`);
        throw new Error(`All LLM providers failed. Initial: ${error.message}, Fallback: ${fallbackError.message}`);
      }
    } else {
      console.error('No fallback provider available or configured.');
      throw error; // Re-throw the original error if no fallback
    }
  }
}

module.exports = { getChatbotResponse };
// </file>