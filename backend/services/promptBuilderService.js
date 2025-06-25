// backend/services/promptBuilderService.js

/**
 * @file promptBuilderService.js
 * @description Centraliza la lógica para construir los prompts y mensajes iniciales para el LLM.
 */

// Contiene el texto que se añade al final del primer mensaje del bot cuando el usuario escribe/habla.
const appendixTranslations = {
  es: "(Importante: responderé en el idioma que uses para hablarme y traduciré el menú para ti)",
  en: "(Important: I will reply in the language you use to speak to me and translate the menu for you)",
  fr: "(Important : je répondrai dans la langue que vous utilisez pour me parler et je traduirai le menu pour vous)",
  de: "(Wichtig: Ich werde in der Sprache antworten, die Sie verwenden, um mit mir zu sprechen, und die Speisekarte für Sie übersetzen)"
};

/**
* Prepara las instrucciones de sistema y el primer mensaje del bot para la conversación con el LLM.
* 
* @param {object} params - Los parámetros para construir los prompts.
* @param {string} params.language - El código de idioma del frontend (ej. 'es', 'en').
* @param {object} params.providedMenu - El objeto del menú ya traducido.
* @param {boolean} params.initialFlowClick - `true` si el usuario hizo clic en una bebida del flujo inicial.
* @param {string} params.systemInstructionsTemplate - La plantilla de instrucciones base desde la BBDD.
* @param {string} params.firstBotMessageTemplate - La plantilla del primer mensaje del bot desde la BBDD.
* @returns {{systemInstructions: string, firstBotMessage: string}} - Los prompts finales listos para usar.
*/
function preparePromptsForLlm({ 
  language, 
  providedMenu, 
  initialFlowClick, 
  systemInstructionsTemplate, 
  firstBotMessageTemplate 
}) {
  let finalFirstBotMessage = firstBotMessageTemplate;

  // Se añade una instrucción general al prompt del sistema para guiar la respuesta del LLM.
  const languageHint = `--- LANGUAGE INSTRUCTION ---\nYour primary goal is to respond in the same language as the user's message.\nHowever, if the user's message is ambiguous, a single word, or doesn't have a clear language (e.g., just a product name like "Coca-Cola"), you MUST default to responding in the interface language provided, which is: [${language}].\nUse this language as your definitive fallback.\n--- END LANGUAGE INSTRUCTION ---\n\n`;

  if (initialFlowClick) {
      // Si el usuario hizo clic en el flujo inicial, se fuerza el idioma de respuesta en el primer mensaje.
      console.log(`[PromptBuilder] Modificando firstBotMessage para FORZAR idioma [${language}] por clic en InitialFlow.`);
      finalFirstBotMessage = `(Internal instruction: You must respond in [${language}].)\n${finalFirstBotMessage}`;
  } else {
      // Si el usuario escribió, se añade una nota informativa al primer mensaje.
      const appendix = appendixTranslations[language] || appendixTranslations.en;
      console.log(`[PromptBuilder] Modificando firstBotMessage para AÑADIR nota de idioma flexible.`);
      finalFirstBotMessage = `${finalFirstBotMessage} ${appendix}`;
  }

  // Se construye el prompt de sistema final.
  const menuJsonString = JSON.stringify(providedMenu, null, 2);
  const finalSystemInstructions = languageHint + systemInstructionsTemplate.replace('__MENU_JSON_PLACEHOLDER__', menuJsonString);

  return {
      systemInstructions: finalSystemInstructions,
      firstBotMessage: finalFirstBotMessage
  };
}

module.exports = {
  preparePromptsForLlm
};