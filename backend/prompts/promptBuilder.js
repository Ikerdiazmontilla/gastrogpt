// backend/prompts/promptBuilder.js
// Utility to build user preference strings for AI prompts from questionnaire data.

/**
 * Converts an array of strings into a human-readable list (e.g., "item1, item2 and item3").
 * Handles different languages for conjunctions and "none" cases.
 * @param {string[]} array - The array of items.
 * @param {string} lang - The language ('Español' or 'English').
 * @param {object} conjunctions - Language-specific conjunctions (e.g., { Español: "y", English: "and" }).
 * @param {object} noneStrings - Language-specific "none" strings (e.g., { Español: "ninguna", English: "none" }).
 * @returns {string} A formatted string representing the list.
 */
const arrayToString = (array, lang, conjunctions, noneStrings) => {
  if (!array || array.length === 0) return noneStrings[lang] || noneStrings['Español']; // Default to Spanish "none"
  if (array.length === 1) return array[0];
  const and = conjunctions[lang] || conjunctions['Español']; // Default to Spanish conjunction
  return array.slice(0, -1).join(', ') + ` ${and} ` + array[array.length - 1];
};

// Predefined strings for different parts of the prompt, localized.
const promptStrings = {
  Español: {
    intro: "Mis preferencias son:",
    tipoComida: "Tipo de comida:",
    precio: "Rango de precio:",
    alergias: "Alergias:",
    nivelPicante: "Nivel de picante:",
    consideraciones: "Consideraciones adicionales:",
    answerInstruction: "Responde en Español.",
    conjunctions: { Español: "y", English: "and" },
    noneStrings: { Español: "ninguna", English: "none" }
  },
  English: {
    intro: "My preferences are:",
    tipoComida: "Type of food:",
    precio: "Price range:",
    alergias: "Allergies:",
    nivelPicante: "Spice level:",
    consideraciones: "Additional considerations:",
    answerInstruction: "Answer in English.",
    conjunctions: { Español: "y", English: "and" },
    noneStrings: { Español: "ninguna", English: "none" }
  }
};

/**
 * Builds the user preferences prompt for the AI based on questionnaire submission data and language.
 * @param {object} submissionData - The form data from the questionnaire.
 * @param {string} language - The selected language ('Español' or 'English').
 * @returns {string} The formatted prompt string for the AI.
 */
const buildQuestionnairePrompt = (submissionData, language) => {
  // Select the appropriate set of strings based on language, defaulting to Spanish.
  const langStrings = promptStrings[language] || promptStrings['Español'];
  const { tipoComida, precio, alergias, nivelPicante, consideraciones: userConsideraciones } = submissionData;

  // Format each preference array into a string.
  const tipoComidaStr = arrayToString(tipoComida, language, langStrings.conjunctions, langStrings.noneStrings);
  const precioStr = arrayToString(precio, language, langStrings.conjunctions, langStrings.noneStrings);
  const alergiasStr = arrayToString(alergias, language, langStrings.conjunctions, langStrings.noneStrings);
  const nivelPicanteStr = arrayToString(nivelPicante, language, langStrings.conjunctions, langStrings.noneStrings);

  // Construct the prompt.
  let prompt = `${langStrings.intro}\n`;
  prompt += `- ${langStrings.tipoComida} ${tipoComidaStr}\n`;
  prompt += `- ${langStrings.precio} ${precioStr}\n`;
  prompt += `- ${langStrings.alergias} ${alergiasStr}\n`;
  prompt += `- ${langStrings.nivelPicante} ${nivelPicanteStr}\n`;

  // Add additional considerations if provided.
  if (userConsideraciones && userConsideraciones.trim() !== '') {
    prompt += `- ${langStrings.consideraciones} ${userConsideraciones.trim()}\n`;
  }
  // Instruct the AI on the response language.
  prompt += `\n${langStrings.answerInstruction}`;
  return prompt;
};

module.exports = { buildQuestionnairePrompt };