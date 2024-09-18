require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const menu = require('./menu');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Instrucciones para ChatGPT
const instructions = `
Eres un chatbot de un restaurante que ofrece recomendaciones de platos según las preferencias del usuario. Las preferencias pueden incluir tipo de proteína (carne, pescado, vegetariano), presupuesto, restricciones dietéticas (sin gluten, sin lactosa, etc.), estilo de comida (picante, suave, etc.), etc. 
Tu objetivo es recomendar de 1 a 3 platos del menú basados en estas preferencias y proporcionar información clara sobre cada plato, incluyendo el nombre, descripción breve y precio. Si el usuario no especifica suficientes detalles, pregúntales para obtener más información antes de hacer las recomendaciones.

Aquí está el menú del restaurante: ${JSON.stringify(menu)}
Y aquí empieza la conversación con el usuario:
`;

// Ruta para manejar mensajes de chat
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'El mensaje es requerido.' });
  }

  try {
    const prompt = `${instructions}\nUsuario: ${message}\nChefGPT:`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: instructions },
          { role: 'user', content: message },
        ],
        max_tokens: 150,
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

  try {
    const userPreferences = `Me gustaría comer ${tipoComida} a un precio ${precio}, soy alérgico a ${alergias} y me gustaría un plato con nivel de picante ${nivelPicante}.`;

    const prompt = `${instructions}\nUsuario: ${userPreferences}\nChefGPT:`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: instructions },
          { role: 'user', content: userPreferences },
        ],
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
    res.json({ recommendations });
  } catch (error) {
    console.error('Error al comunicarse con la API de OpenAI:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error al obtener las recomendaciones.' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
