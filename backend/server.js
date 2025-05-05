// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const instructions = require('./instructions');
const firstMessage = require('./firstMessage');
const { getChatbotResponse } = require('./geminiApi');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Configuración Base de Datos PostgreSQL (sin cambios) ---
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// --- Función para inicializar la tabla en la DB (sin cambios) ---
const initializeDatabase = async () => {
  // ... (código igual que antes)
    const client = await pool.connect();
  try {
    // Crear tabla si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY,
        session_id TEXT NOT NULL UNIQUE,
        messages JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear función para actualizar 'updated_at' automáticamente (si no existe)
    await client.query(`
      CREATE OR REPLACE FUNCTION trigger_set_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Crear trigger para actualizar 'updated_at' (si no existe)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp') THEN
          CREATE TRIGGER set_timestamp
          BEFORE UPDATE ON conversations
          FOR EACH ROW
          EXECUTE FUNCTION trigger_set_timestamp();
        END IF;
      END
      $$;
    `);

    console.log('Base de datos inicializada correctamente.');
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  } finally {
    client.release();
  }
};


// --- Configuración CORS (sin cambios) ---
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://restaurant-chatbot-three.vercel.app'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Configuración Sesiones (sin cambios) ---
if (!process.env.SESSION_SECRET) {
  console.error("Error: SESSION_SECRET no está definido en el archivo .env. La aplicación no puede iniciarse de forma segura.");
  process.exit(1);
}
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));


// --- Rutas API ---

// GET /api/conversation - Devuelve el historial para el frontend
app.get('/api/conversation', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT messages FROM conversations WHERE session_id = $1',
      [req.sessionID]
    );

    if (result.rows.length > 0 && result.rows[0].messages && result.rows[0].messages.length > 0) {
      // Mensajes guardados (ya filtrados, sin system/primer assistant)
      const savedMessages = result.rows[0].messages;

      // Reconstruir para el frontend: añadir el firstMessage al principio si hay mensajes guardados
      const frontendMessages = [
        { sender: 'bot', text: firstMessage }, // Siempre empezamos con el saludo en el frontend
        ...savedMessages.map(msg => ({
          sender: msg.role === 'assistant' ? 'bot' : 'user',
          text: msg.content
        }))
      ];
      res.json({ messages: frontendMessages });

    } else {
      // No hay conversación previa guardada o está vacía, devolver solo el mensaje inicial
      res.json({ messages: [{ sender: 'bot', text: firstMessage }] });
    }
  } catch (error) {
    console.error('Error al obtener la conversación:', error);
    res.status(500).json({ error: 'Error interno al obtener la conversación.' });
  } finally {
    client.release();
  }
});


// POST /api/chat - Procesa un mensaje del usuario
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'El mensaje es requerido y debe ser texto.' });
  }

  const userMessageContent = message.trim();
  const client = await pool.connect();
  let conversationId = null;
  // `messagesForAI`: Incluye system/firstMsg para enviar a la API
  let messagesForAI = [];
  // `messagesToSave`: Solo user/assistant a partir del primer mensaje del usuario
  let messagesToSave = [];

  try {
    // 1. Buscar conversación existente por session_id
    const findResult = await client.query(
      'SELECT id, messages FROM conversations WHERE session_id = $1',
      [req.sessionID]
    );

    const userMessage = { role: 'user', content: userMessageContent };

    if (findResult.rows.length > 0) {
      // 2a. Conversación encontrada
      conversationId = findResult.rows[0].id;
      // Cargar los mensajes ya guardados (filtrados)
      messagesToSave = findResult.rows[0].messages || [];
      // Reconstruir el historial completo para la API
      messagesForAI = [
        { role: 'system', content: instructions },
        { role: 'assistant', content: firstMessage },
        ...messagesToSave, // Añadir mensajes guardados
        userMessage      // Añadir mensaje actual del usuario
      ];
      // Añadir el mensaje del usuario a lo que se guardará
      messagesToSave.push(userMessage);

    } else {
      // 2b. Conversación no encontrada: Inicializarla
      conversationId = uuidv4(); // Generar nuevo ID para la conversación
      // Preparar historial completo para la API
      messagesForAI = [
        { role: 'system', content: instructions },
        { role: 'assistant', content: firstMessage },
        userMessage
      ];
      // Solo el mensaje del usuario se guarda inicialmente
      messagesToSave = [userMessage];
    }

    // 3. Obtener respuesta del Chatbot (usando el historial completo)
    const replyContent = await getChatbotResponse(messagesForAI);
    const assistantMessage = { role: 'assistant', content: replyContent };

    // 4. Añadir respuesta del bot a lo que se guardará
    messagesToSave.push(assistantMessage);

    // 5. Guardar/Actualizar en la Base de Datos (solo los mensajes filtrados)
    if (findResult.rows.length > 0) {
      // Actualizar conversación existente
      await client.query(
        'UPDATE conversations SET messages = $1 WHERE id = $2',
        // ¡Guardamos messagesToSave!
        [JSON.stringify(messagesToSave), conversationId]
      );
      console.log(`Conversación ${conversationId} actualizada (guardados ${messagesToSave.length} mensajes) para sesión ${req.sessionID}`);
    } else {
      // Insertar nueva conversación
      await client.query(
        'INSERT INTO conversations (id, session_id, messages) VALUES ($1, $2, $3)',
         // ¡Guardamos messagesToSave!
        [conversationId, req.sessionID, JSON.stringify(messagesToSave)]
      );
      console.log(`Nueva conversación ${conversationId} creada (guardados ${messagesToSave.length} mensajes) para sesión ${req.sessionID}`);
    }

    // 6. Enviar respuesta al frontend
    res.json({ reply: replyContent });

  } catch (error) {
    // ... (manejo de errores igual que antes)
        console.error('Error en /api/chat:', error);
    if (error.message.includes('API')) {
        res.status(502).json({ error: 'Error al comunicarse con el servicio de IA.' });
    } else {
        res.status(500).json({ error: 'Error interno del servidor al procesar el mensaje.' });
    }
  } finally {
    client.release();
  }
});

// POST /api/reset - (Sin cambios funcionales, ya borra por sessionID)
app.post('/api/reset', async (req, res) => {
    // ... (código igual que antes)
    const client = await pool.connect();
    try {
        const deleteResult = await client.query(
            'DELETE FROM conversations WHERE session_id = $1 RETURNING id',
            [req.sessionID]
        );

        if (deleteResult.rowCount > 0) {
            console.log(`Conversación ${deleteResult.rows[0].id} eliminada (reset) para sesión ${req.sessionID}.`);
        } else {
            console.log(`Intento de reset para sesión ${req.sessionID}, pero no se encontró conversación activa.`);
        }
        res.json({ message: 'Conversación reiniciada. Se creará una nueva al enviar el próximo mensaje.' });
    } catch (error) {
        console.error('Error en /api/reset:', error);
        res.status(500).json({ error: 'Error interno al reiniciar la conversación.' });
    } finally {
        client.release();
    }
});


// POST /api/questionnaire - Adaptado para usar la misma lógica de filtrado
app.post('/api/questionnaire', async (req, res) => {
  const { tipoComida, precio, alergias, nivelPicante, consideraciones } = req.body;

  // --- Validación (sin cambios) ---
  if (
    !Array.isArray(tipoComida) || tipoComida.length === 0 ||
    !Array.isArray(precio) || precio.length === 0  ||
    !Array.isArray(alergias) || alergias.length === 0 ||
    !Array.isArray(nivelPicante) || nivelPicante.length === 0
  ) {
    return res.status(400).json({ error: 'Todos los campos múltiples son requeridos y deben tener al menos una opción seleccionada.' });
  }

  // --- Procesamiento de datos (sin cambios) ---
  const arrayToString = (array) => {
    if (array.length === 1) return array[0];
    return array.slice(0, -1).join(', ') + ' y ' + array[array.length - 1];
  };
  const tipoComidaStr = arrayToString(tipoComida);
  const precioStr = arrayToString(precio);
  const alergiasStr = arrayToString(alergias);
  const nivelPicanteStr = arrayToString(nivelPicante);
  let userPreferences = `Quiero recomendaciones basadas en esto: Tipo de comida: ${tipoComidaStr}; Precio: ${precioStr}; Alergias: ${alergiasStr}; Nivel de picante: ${nivelPicanteStr}.`;
  if (consideraciones && consideraciones.trim() !== '') {
    userPreferences += ` Consideraciones adicionales: ${consideraciones.trim()}`;
  }

  const client = await pool.connect();
  let conversationId = null;
  let messagesForAI = [];
  let messagesToSave = [];

  try {
    // Lógica similar a /api/chat para encontrar o crear conversación
    const findResult = await client.query(
      'SELECT id, messages FROM conversations WHERE session_id = $1',
      [req.sessionID]
    );

    const userMessage = { role: 'user', content: userPreferences }; // Mensaje del formulario

    if (findResult.rows.length > 0) {
      // Conversación encontrada
      conversationId = findResult.rows[0].id;
      messagesToSave = findResult.rows[0].messages || [];
      messagesForAI = [
        { role: 'system', content: instructions },
        { role: 'assistant', content: firstMessage },
        ...messagesToSave,
        userMessage
      ];
       messagesToSave.push(userMessage);
    } else {
      // Conversación no encontrada
      conversationId = uuidv4();
      messagesForAI = [
        { role: 'system', content: instructions },
        { role: 'assistant', content: firstMessage },
        userMessage
      ];
      messagesToSave = [userMessage];
    }

    // Obtener respuesta del Chatbot (recomendaciones)
    const recommendations = await getChatbotResponse(messagesForAI);
    const assistantMessage = { role: 'assistant', content: recommendations };
    messagesToSave.push(assistantMessage); // Añadir respuesta a lo que se guarda

    // Guardar/Actualizar en la Base de Datos (solo mensajes filtrados)
     if (findResult.rows.length > 0) {
      await client.query(
        'UPDATE conversations SET messages = $1 WHERE id = $2',
        [JSON.stringify(messagesToSave), conversationId] // <-- Guardar filtrado
      );
       console.log(`Conversación ${conversationId} actualizada (questionnaire, ${messagesToSave.length} mensajes guardados) para sesión ${req.sessionID}`);
    } else {
      await client.query(
        'INSERT INTO conversations (id, session_id, messages) VALUES ($1, $2, $3)',
        [conversationId, req.sessionID, JSON.stringify(messagesToSave)] // <-- Guardar filtrado
      );
       console.log(`Nueva conversación ${conversationId} creada (questionnaire, ${messagesToSave.length} mensajes guardados) para sesión ${req.sessionID}`);
    }

    // Enviar recomendaciones al frontend
    res.json({ recommendations });

  } catch (error) {
     // ... (manejo de errores igual que antes)
    console.error('Error en /api/questionnaire:', error);
     if (error.message.includes('API')) {
        res.status(502).json({ error: 'Error al comunicarse con el servicio de IA.' });
    } else {
        res.status(500).json({ error: 'Error interno del servidor al obtener recomendaciones.' });
    }
  } finally {
    client.release();
  }
});


// --- Iniciar servidor y base de datos (sin cambios) ---
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error fatal al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();