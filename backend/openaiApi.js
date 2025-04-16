
require('dotenv').config();
const axios = require('axios');

/**
 * Llama a la API de OpenAI para obtener una respuesta de chat.
 * @param {Array<Object>} messages - El historial de la conversación.
 * @returns {Promise<string>} - La respuesta del asistente.
 * @throws {Error} - Si ocurre un error durante la llamada a la API.
 */
async function getChatbotResponse(messages) {
// Verificación opcional pero buena práctica para la clave de OpenAI
  if (!process.env.OPENAI_API_KEY) {
      console.error('Error: La variable de entorno OPENAI_API_KEY no está configurada.');
      throw new Error('Configuración de API Key de OpenAI incompleta.');
  }

  try {
    // Log para saber qué API se está usando
    console.log(`Enviando petición a: OpenAI con el modelo: gpt-4o-mini-2024-07-18`);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini-2024-07-18',
        messages: messages,
        max_tokens: 250,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    // Extrae y devuelve el contenido de la respuesta del asistente (sin cambios aquí)
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        return response.data.choices[0].message.content.trim();
    } else {
        console.error('Error: La respuesta de la API de OpenAI no tiene la estructura esperada. Respuesta recibida:', response.data);
        throw new Error('Respuesta inesperada de la API de OpenAI.');
    }

  } catch (error) {
    // Loguea el error detallado
    console.error('Error al comunicarse con la API de OpenAI:');
     if (error.response) {
      console.error('Datos:', error.response.data);
      console.error('Estado:', error.response.status);
      console.error('Cabeceras:', error.response.headers);
    } else if (error.request) {
      console.error('Request:', error.request);
    } else {
      console.error('Error en configuración:', error.message);
    }
    // Relanza la excepción para que sea manejada por server.js
    throw new Error('Error al obtener la respuesta de la API de OpenAI.');
  }
}

module.exports = { getChatbotResponse };