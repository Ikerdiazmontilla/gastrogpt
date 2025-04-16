
require('dotenv').config();
const axios = require('axios');
const apiKey = process.env.GEMINI_API_KEY;
const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const modelName = 'gemini-2.0-flash';

/**
 * Llama a una API de Chatbot (ahora configurada para Gemini vía compatibilidad OpenAI)
 * para obtener una respuesta.
 *
 * @param {Array<Object>} messages - El historial de la conversación (mismo formato que antes).
 * @returns {Promise<string>} - La respuesta del asistente.
 * @throws {Error} - Si ocurre un error durante la llamada a la API.
 */


async function getChatbotResponse(messages) {
  // Verificamos si la API Key está presente. Si no, damos un error claro.
  if (!apiKey) {
    console.error('Error: La variable de entorno GEMINI_API_KEY no está configurada.');
    throw new Error('Configuración de API Key incompleta.');
  }

  try {
    console.log(`Enviando petición a: ${apiUrl} con el modelo: ${modelName}`); // Log para depuración

    const response = await axios.post(
      apiUrl, 
      {
        model: modelName, 
        messages: messages, 
        max_tokens: 250,   
        temperature: 0.7,
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
      console.error('Error: La respuesta de la API de Gemini no tiene la estructura esperada (modo compatibilidad OpenAI). Respuesta recibida:', response.data);
      throw new Error('Respuesta inesperada de la API del Chatbot.');
    }

  } catch (error) {
    console.error('Error al comunicarse con la API de Gemini (vía compatibilidad OpenAI):');
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Datos:', error.response.data);
      console.error('Estado:', error.response.status);
      console.error('Cabeceras:', error.response.headers);
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      console.error('Request:', error.request);
    } else {
      // Algo sucedió al configurar la solicitud que provocó un error
      console.error('Error en configuración:', error.message);
    }
    // Lanza un error genérico para que server.js lo maneje.
    throw new Error('Error al obtener la respuesta de la API del Chatbot.');
  }
}

module.exports = { getChatbotResponse };