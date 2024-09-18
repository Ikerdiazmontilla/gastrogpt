const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const menu = require('../menus/menu')

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ruta POST para el chat
router.post('/', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage || !menu) {
    return res.status(400).json({ reply: 'Mensaje o menú faltante.' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Eres ChefGPT, un asistente que ayuda a crear menús personalizados para restaurantes." },
        { role: "user", content: `Aquí está el menú del restaurante: ${JSON.stringify(menu)}. El usuario dice: "${userMessage}". Responde con recomendaciones personalizadas de platos.` }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const botReply = response.choices[0].message.content.trim();
    res.json({ reply: botReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: 'Lo siento, ocurrió un error al procesar tu solicitud.' });
  }
});

module.exports = router;
