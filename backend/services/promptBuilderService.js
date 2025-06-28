// backend/services/promptBuilderService.js

/**
 * @file promptBuilderService.js
 * @description Centraliza la lógica para construir los prompts y mensajes iniciales para el LLM.
 */

// MODIFIED: New first-person disclaimer texts.
const disclaimerForTyping = {
  es: "(Por cierto, te responderé en el idioma que uses y traduciré el menú para ti).",
  en: "(By the way, I'll reply in the language you use and translate the menu for you).",
  fr: "(D'ailleurs, je vous répondrai dans la langue que vous utilisez et je traduirai le menu pour vous).",
  de: "(Übrigens, ich antworte in der Sprache, die Sie verwenden, und übersetze die Speisekarte für Sie)."
};

/**
* Prepara las instrucciones de sistema y el primer mensaje del bot para la conversación con el LLM.
* 
* @param {object} params - Los parámetros para construir los prompts.
* @param {string} params.language - El código de idioma del frontend (ej. 'es', 'en').
* @param {object} params.providedMenu - El objeto del menú ya traducido.
* @param {boolean} params.initialFlowClick - `true` si el usuario hizo clic en una bebida del flujo inicial.
* @param {string} params.systemInstructionsTemplate - La plantilla de instrucciones base desde la BBDD.
* @param {object} params.firstBotMessageTemplate - La plantilla del primer mensaje del bot desde la BBDD (ahora es un objeto multi-idioma).
* @returns {{systemInstructions: string, firstBotMessage: string}} - Los prompts finales listos para usar.
*/
function preparePromptsForLlm({ 
  language, 
  providedMenu, 
  initialFlowClick, 
  systemInstructionsTemplate, 
  firstBotMessageTemplate // This is now a multi-language object
}) {
  
  // MODIFIED: Select the translated first message from the object.
  const translatedFirstMessage = firstBotMessageTemplate[language] || firstBotMessageTemplate['es'] || 'Hola, ¿en qué puedo ayudarte?';
  
  let finalFirstBotMessage;

  // Se añade una instrucción general al prompt del sistema para guiar la respuesta del LLM.
  const languageHint = `--- LANGUAGE INSTRUCTION ---\nYour primary goal is to respond in the same language as the user's message.\nHowever, if the user's message is ambiguous, a single word, or doesn't have a clear language (e.g., just a product name like "Coca-Cola"), you MUST default to responding in the interface language provided, which is: [${language}].\nUse this language as your definitive fallback.\n--- END LANGUAGE INSTRUCTION ---\n\n`;

  if (initialFlowClick) {
      // If the user clicked a drink, the LLM gets an internal instruction. The user sees the clean translated message.
      console.log(`[PromptBuilder] Modificando firstBotMessage para FORZAR idioma [${language}] por clic en InitialFlow.`);
      finalFirstBotMessage = `(Internal instruction: The user has selected a drink in [${language}]. You MUST respond in [${language}].)\n${translatedFirstMessage}`;
  } else {
      // If the user typed, append the new first-person disclaimer to the translated message.
      const appendix = disclaimerForTyping[language] || disclaimerForTyping.en;
      console.log(`[PromptBuilder] Añadiendo disclaimer en primera persona al firstBotMessage.`);
      finalFirstBotMessage = `${translatedFirstMessage} ${appendix}`;
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