// <file path="backend/config/config.js">
require('dotenv').config(); // Load .env file variables into process.env

/**
 * @file config.js
 * @description Centralized configuration management.
 * Loads environment variables and exports them for use throughout the application.
 */

const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  sessionSecret: process.env.SESSION_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',

  // API Keys
  openaiApiKey: process.env.OPENAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,

  // LLM Provider Configuration
  llm: {
    primaryProvider: process.env.PRIMARY_LLM_PROVIDER, // 'gemini', 'openai', or undefined
    gemini: {
      modelName: process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash-latest', // Default value
      maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS, 10) || 450,    // Default value
      temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7, // Default value
      // API URL could be added here if it needed to be configurable
      // apiUrl: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
    },
    openai: {
      modelName: process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini', // Default value
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 300,   // Default value
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7, // Default value
      // apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions',
    },
  },

  // Database Configuration
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },

  // CORS Configuration
  corsOrigins: [
    'http://localhost:3000',
    process.env.CORSLINK1,
  ],
};

// Validate essential configurations
if (!config.sessionSecret) {
  console.error("FATAL ERROR: SESSION_SECRET is not defined in the environment variables.");
  process.exit(1);
}
// Note: The warning for AI API keys is now implicitly handled by llmService if no keys are found.
if (!config.db.host || !config.db.user || !config.db.password || !config.db.name) {
    console.error("FATAL ERROR: Database configuration is incomplete. Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.");
    process.exit(1);
}

// Validate temperature and maxTokens to be within reasonable limits if needed
if (config.llm.gemini.temperature < 0 || config.llm.gemini.temperature > 2) {
    console.warn(`Warning: GEMINI_TEMPERATURE (${config.llm.gemini.temperature}) is outside the typical range [0, 2]. Using it as is.`);
}
if (config.llm.openai.temperature < 0 || config.llm.openai.temperature > 2) {
    console.warn(`Warning: OPENAI_TEMPERATURE (${config.llm.openai.temperature}) is outside the typical range [0, 2]. Using it as is.`);
}
if (config.llm.gemini.maxTokens <= 0) {
    console.warn(`Warning: GEMINI_MAX_TOKENS (${config.llm.gemini.maxTokens}) is invalid. Using default 450.`);
    config.llm.gemini.maxTokens = 450;
}
if (config.llm.openai.maxTokens <= 0) {
    console.warn(`Warning: OPENAI_MAX_TOKENS (${config.llm.openai.maxTokens}) is invalid. Using default 300.`);
    config.llm.openai.maxTokens = 300;
}


module.exports = config;
// </file>