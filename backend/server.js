require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const instructions = require('./instructions');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Variable global para almacenar la conversación
let conversation = [
  { role: 'system', content: instructions },
  { role: 'assistant', content: '¿Qué tipo de comida te gustaría comer hoy?' }
];

// Ruta para manejar mensajes de chat
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'El mensaje es requerido.' });
  }

  // Agregar el mensaje del usuario al historial de la conversación
  conversation.push({ role: 'user', content: message });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini', 
        messages: conversation,
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

    const reply = response.data.choices[0].message.content.trim();

    // Agregar la respuesta del asistente al historial de la conversación
    conversation.push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (error) {
    console.error('Error al comunicarse con la API de OpenAI:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error al obtener la respuesta del chatbot.' });
  }
});

// Ruta para manejar el cuestionario
app.post('/api/questionnaire', async (req, res) => {
  const { tipoComida, precio, alergias, nivelPicante } = req.body;

  if (!tipoComida || !precio || !alergias || !nivelPicante) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }

  const userPreferences = `Me gustaría comer ${tipoComida} a un precio ${precio}, soy alérgico a ${alergias} y me gustaría un plato con nivel de picante ${nivelPicante}.`;

  // Agregar las preferencias del usuario al historial de la conversación
  conversation.push({ role: 'user', content: userPreferences });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: conversation,
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const recommendations = response.data.choices[0].message.content.trim();

    // Agregar las recomendaciones del asistente al historial de la conversación
    conversation.push({ role: 'assistant', content: recommendations });

    res.json({ recommendations });
  } catch (error) {
    console.error('Error al comunicarse con la API de OpenAI:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error al obtener las recomendaciones.' });
  }
});

// Ruta opcional para reiniciar la conversación
app.post('/api/reset', (req, res) => {
  conversation = [
    { role: 'system', content: instructions },
    { role: 'assistant', content: '¿Qué tipo de comida te gustaría comer hoy?' }
  ];
  res.json({ message: 'Conversación reiniciada.' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
