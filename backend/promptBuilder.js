// backend/promptBuilder.js

/**
 * Converts an array of strings into a human-readable list.
 * @param {string[]} array - The array of items.
 * @param {string} lang - The language ('Español' or 'English').
 * @param {object} conjunctions - Object containing language-specific conjunctions (e.g., { and: 'y' }).
 * @param {object} noneStrings - Object containing language-specific "none" strings (e.g., { none: 'ninguna' }).
 * @returns {string} A formatted string.
 */
const arrayToString = (array, lang, conjunctions, noneStrings) => {
  if (!array || array.length === 0) return noneStrings[lang] || noneStrings['Español'];
  if (array.length === 1) return array[0];
  const and = conjunctions[lang] || conjunctions['Español'];
  return array.slice(0, -1).join(', ') + ` ${and} ` + array[array.length - 1];
};

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
 * Builds the user preferences prompt for the AI based on submission data and language.
 * @param {object} submissionData - The form data from the questionnaire.
 * @param {string} language - The selected language ('Español' or 'English').
 * @returns {string} The formatted prompt for the AI.
 */
const buildQuestionnairePrompt = (submissionData, language) => {
  const langStrings = promptStrings[language] || promptStrings['Español']; // Default to Spanish
  const { tipoComida, precio, alergias, nivelPicante, consideraciones: userConsideraciones } = submissionData;

  const tipoComidaStr = arrayToString(tipoComida, language, langStrings.conjunctions, langStrings.noneStrings);
  const precioStr = arrayToString(precio, language, langStrings.conjunctions, langStrings.noneStrings);
  const alergiasStr = arrayToString(alergias, language, langStrings.conjunctions, langStrings.noneStrings);
  const nivelPicanteStr = arrayToString(nivelPicante, language, langStrings.conjunctions, langStrings.noneStrings);

  let prompt = `${langStrings.intro}\n`;
  prompt += `- ${langStrings.tipoComida} ${tipoComidaStr}\n`;
  prompt += `- ${langStrings.precio} ${precioStr}\n`;
  prompt += `- ${langStrings.alergias} ${alergiasStr}\n`;
  prompt += `- ${langStrings.nivelPicante} ${nivelPicanteStr}\n`;

  if (userConsideraciones && userConsideraciones.trim() !== '') {
    prompt += `- ${langStrings.consideraciones} ${userConsideraciones.trim()}\n`;
  }
  prompt += `\n${langStrings.answerInstruction}`;
  return prompt;
};

module.exports = { buildQuestionnairePrompt };