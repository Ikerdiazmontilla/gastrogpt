// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');
// const instructions = require('./instructions');
// const app = express();
// const PORT = process.env.PORT || 5000;
// const firstMessage = require('./firstMessage');

// // Middleware
// const corsOptions = {
//   origin: [
//     'http://localhost:3000', // Origen frontend local
//     'https://restaurant-chatbot-three.vercel.app'
//   ],
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };
// app.use(cors(corsOptions));
// app.use(express.json());

// // Variable global para almacenar la conversación de chat
// let conversation = [
//   { role: 'system', content: instructions },
//   { role: 'assistant', content: firstMessage }
// ];

// // Ruta para manejar mensajes de chat
// app.post('/api/chat', async (req, res) => {
//   const { message } = req.body;

//   if (!message) {
//     return res.status(400).json({ error: 'El mensaje es requerido.' });
//   }

//   // Agregar el mensaje del usuario al historial de la conversación
//   conversation.push({ role: 'user', content: message });

//   try {
//     const response = await axios.post(
//       'https://api.openai.com/v1/chat/completions',
//       {
//         model: 'gpt-4o-mini-2024-07-18',
//         messages: conversation,
//         max_tokens: 250,
//         temperature: 0.7,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//         },
//       }
//     );

//     const reply = response.data.choices[0].message.content.trim();

//     // Agregar la respuesta del asistente al historial de la conversación
//     conversation.push({ role: 'assistant', content: reply });

//     res.json({ reply });
//   } catch (error) {
//     console.error('Error al comunicarse con la API de OpenAI:', error.response ? error.response.data : error.message);
//     res.status(500).json({ error: 'Error al obtener la respuesta del chatbot.' });
//   }
// });

// // Ruta para manejar el cuestionario
// app.post('/api/questionnaire', async (req, res) => {
//   const { tipoComida, precio, alergias, nivelPicante, consideraciones } = req.body;

//   // Validación de campos múltiples
//   if (
//     !Array.isArray(tipoComida) || tipoComida.length === 0 ||
//     !Array.isArray(precio) || precio.length === 0  ||
//     !Array.isArray(alergias) || alergias.length === 0 ||
//     !Array.isArray(nivelPicante) || nivelPicante.length === 0
//   ) {
//     return res.status(400).json({ error: 'Todos los campos múltiples son requeridos y deben tener al menos una opción seleccionada.' });
//   }

//   // Validación de consideraciones (opcional)
//   // Si deseas que este campo sea obligatorio, descomenta la siguiente línea
//   // if (!consideraciones || consideraciones.trim() === '') {
//   //   return res.status(400).json({ error: 'Las consideraciones adicionales son requeridas.' });
//   // }

//   // Función para convertir arrays en una lista separada por comas
//   const arrayToString = (array) => {
//     if (array.length === 1) return array[0];
//     return array.slice(0, -1).join(', ') + ' y ' + array[array.length - 1];
//   };

//   // Crear descripciones a partir de las selecciones múltiples
//   const tipoComidaStr = arrayToString(tipoComida);
//   const precioStr = arrayToString(precio);
//   const alergiasStr = arrayToString(alergias);
//   const nivelPicanteStr = arrayToString(nivelPicante);

//   // Construir el mensaje con todas las preferencias
//   let userPreferences = `Me gustaría comer alguna de estos tipos de comida: ${tipoComidaStr} a un precio de ${precioStr}, soy alérgico a ${alergiasStr} y me gustaría un plato con nivel de picante ${nivelPicanteStr}.`;

//   // Añadir consideraciones adicionales si están presentes
//   if (consideraciones && consideraciones.trim() !== '') {
//     userPreferences += ` Además, tengo las siguientes consideraciones adicionales: ${consideraciones.trim()}`;
//   }

//   // Crear una nueva conversación para el cuestionario
//   const questionnaireConversation = [
//     { role: 'system', content: instructions },
//     { role: 'assistant', content: firstMessage },
//     { role: 'user', content: userPreferences }
//   ];

//   try {
//     const response = await axios.post(
//       'https://api.openai.com/v1/chat/completions',
//       {
//         model: 'gpt-4o-mini-2024-07-18', // Asegúrate de que el modelo es correcto
//         messages: questionnaireConversation,
//         max_tokens: 250,
//         temperature: 0.7,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//         },
//       }
//     );

//     const recommendations = response.data.choices[0].message.content.trim();

//     res.json({ recommendations });
//   } catch (error) {
//     console.error('Error al comunicarse con la API de OpenAI:', error.response ? error.response.data : error.message);
//     res.status(500).json({ error: 'Error al obtener las recomendaciones.' });
//   }
// });

// // Ruta opcional para reiniciar la conversación de chat
// // app.post('/api/reset', (req, res) => {
// //   conversation = [
// //     { role: 'system', content: instructions },
// //     { role: 'assistant', content: firstMessage }
// //   ];
// //   res.json({ message: 'Conversación reiniciada.' });
// // });

// // Iniciar el servidor
// app.listen(PORT, () => {
//   console.log(`Servidor backend corriendo en el puerto ${PORT}`);
// });


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const instructions = require('./instructions');
const app = express();
const PORT = process.env.PORT || 5000;
const firstMessage = require('./firstMessage');


// Para cambiar de api descomentar la otra linea y comentar esta
const { getChatbotResponse } = require('./geminiApi'); 
// const { getChatbotResponse } = require('./openaiApi'); 


// Middleware (sin cambios)
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://restaurant-chatbot-three.vercel.app'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// Conversación de chat
let conversation = [
  { role: 'system', content: instructions },
  { role: 'assistant', content: firstMessage }
];

// Ruta /api/chat
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'El mensaje es requerido.' });
  }
  conversation.push({ role: 'user', content: message });

  try {

    const reply = await getChatbotResponse(conversation); // <-- Nombre actualizado

    conversation.push({ role: 'assistant', content: reply });
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la respuesta del chatbot.' });
  }
});

// Ruta /api/questionnaire
app.post('/api/questionnaire', async (req, res) => {
  const { tipoComida, precio, alergias, nivelPicante, consideraciones } = req.body;

  // Validación (sin cambios)
  if (
    !Array.isArray(tipoComida) || tipoComida.length === 0 ||
    !Array.isArray(precio) || precio.length === 0  ||
    !Array.isArray(alergias) || alergias.length === 0 ||
    !Array.isArray(nivelPicante) || nivelPicante.length === 0
  ) {
    return res.status(400).json({ error: 'Todos los campos múltiples son requeridos y deben tener al menos una opción seleccionada.' });
  }

  // Procesamiento de datos (sin cambios)
  const arrayToString = (array) => {
    if (array.length === 1) return array[0];
    return array.slice(0, -1).join(', ') + ' y ' + array[array.length - 1];
  };
  const tipoComidaStr = arrayToString(tipoComida);
  const precioStr = arrayToString(precio);
  const alergiasStr = arrayToString(alergias);
  const nivelPicanteStr = arrayToString(nivelPicante);
  let userPreferences = `Me gustaría comer alguna de estos tipos de comida: ${tipoComidaStr} a un precio de ${precioStr}, soy alérgico a ${alergiasStr} y me gustaría un plato con nivel de picante ${nivelPicanteStr}.`;
  if (consideraciones && consideraciones.trim() !== '') {
    userPreferences += ` Además, tengo las siguientes consideraciones adicionales: ${consideraciones.trim()}`;
  }
  const questionnaireConversation = [
    { role: 'system', content: instructions },
    { role: 'assistant', content: firstMessage },
    { role: 'user', content: userPreferences }
  ];

  try {
    const recommendations = await getChatbotResponse(questionnaireConversation); 

    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las recomendaciones.' });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});