// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const instructions = require('./instructions');
const firstMessage = require('./firstMessage');
const questionnaire_instructions = require('./questionnaire_instructions');
const { getChatbotResponse } = require('./geminiApi');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Configuración Base de Datos PostgreSQL ---
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// --- Función para inicializar las tablas en la DB ---
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // Tabla para conversaciones de CHAT
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id UUID PRIMARY KEY,
        session_id TEXT NOT NULL,
        messages JSONB NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE, -- <<< AÑADIDO
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Asegurarse de que la columna is_active exista si la tabla ya fue creada
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'chat_conversations' AND column_name = 'is_active'
        ) THEN
          ALTER TABLE chat_conversations ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
        END IF;
      END $$;
    `);
    // Considerar un índice para búsquedas eficientes de chats activos por sesión
    await client.query(`
        CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_active 
        ON chat_conversations (session_id, is_active) 
        WHERE is_active = TRUE;
    `);


    // Tabla para interacciones del CUESTIONARIO (sin cambios)
    await client.query(`
      CREATE TABLE IF NOT EXISTS questionnaire_interactions (
        id UUID PRIMARY KEY,
        session_id TEXT NOT NULL,
        submission_data JSONB NOT NULL,
        recommendation_text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Función y Trigger para 'updated_at' en chat_conversations (sin cambios)
    await client.query(`
      CREATE OR REPLACE FUNCTION trigger_set_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger 
          WHERE tgname = 'set_timestamp_chat_conversations' AND tgrelid = 'chat_conversations'::regclass
        ) THEN
          CREATE TRIGGER set_timestamp_chat_conversations
          BEFORE UPDATE ON chat_conversations
          FOR EACH ROW
          EXECUTE FUNCTION trigger_set_timestamp();
        END IF;
      END
      $$;
    `);

    console.log('Base de datos inicializada (chat_conversations con is_active, questionnaire_interactions).');
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  } finally {
    client.release();
  }
};

// --- Configuración CORS y Sesiones (sin cambios) ---
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

if (!process.env.SESSION_SECRET) {
  console.error("Error: SESSION_SECRET no está definido.");
  process.exit(1);
}
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true, // True para que sessionID se genere siempre
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// --- Rutas API ---

// GET /api/conversation - Devuelve el historial del CHAT ACTIVO para el frontend
app.get('/api/conversation', async (req, res) => {
  const client = await pool.connect();
  try {
    // Buscar la conversación de chat ACTIVA para esta sesión
    const result = await client.query(
      'SELECT messages FROM chat_conversations WHERE session_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
      [req.sessionID]
    );

    if (result.rows.length > 0 && result.rows[0].messages && result.rows[0].messages.length > 0) {
      const savedMessages = result.rows[0].messages;
      const frontendMessages = [
        { sender: 'bot', text: firstMessage },
        ...savedMessages.map(msg => ({
          sender: msg.role === 'assistant' ? 'bot' : 'user',
          text: msg.content
        }))
      ];
      res.json({ messages: frontendMessages });
    } else {
      // No hay conversación activa, devolver solo el mensaje inicial
      res.json({ messages: [{ sender: 'bot', text: firstMessage }] });
    }
  } catch (error) {
    console.error('Error al obtener la conversación activa del chat:', error);
    res.status(500).json({ error: 'Error interno al obtener la conversación del chat.' });
  } finally {
    client.release();
  }
});

// POST /api/chat - Procesa un mensaje del usuario para el CHAT ACTIVO
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'El mensaje es requerido y debe ser texto.' });
  }

  const userMessageContent = message.trim();
  const client = await pool.connect();
  let activeChatConversationId = null;
  let messagesForAI = [];
  let messagesToSaveInDB = [];

  try {
    // 1. Buscar conversación de chat ACTIVA existente
    const findResult = await client.query(
      'SELECT id, messages FROM chat_conversations WHERE session_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
      [req.sessionID]
    );

    const userMessageForAI = { role: 'user', content: userMessageContent };

    if (findResult.rows.length > 0) {
      // 2a. Conversación activa encontrada: Cargarla y añadir mensaje
      activeChatConversationId = findResult.rows[0].id;
      messagesToSaveInDB = findResult.rows[0].messages || [];
      messagesForAI = [
        { role: 'system', content: instructions },
        { role: 'assistant', content: firstMessage }, // Contexto de saludo para la IA
        ...messagesToSaveInDB,
        userMessageForAI
      ];
      messagesToSaveInDB.push(userMessageForAI);
    } else {
      // 2b. NO hay conversación activa: Inicializar una nueva
      activeChatConversationId = uuidv4();
      messagesForAI = [
        { role: 'system', content: instructions },
        { role: 'assistant', content: firstMessage },
        userMessageForAI
      ];
      messagesToSaveInDB = [userMessageForAI]; // Solo el mensaje del usuario se guarda inicialmente
    }

    // 3. Obtener respuesta del Chatbot
    const replyContent = await getChatbotResponse(messagesForAI);
    const assistantMessageForAI = { role: 'assistant', content: replyContent };
    messagesToSaveInDB.push(assistantMessageForAI);

    // 4. Guardar/Actualizar en la Base de Datos
    if (findResult.rows.length > 0) {
      // Actualizar conversación activa existente
      await client.query(
        'UPDATE chat_conversations SET messages = $1 WHERE id = $2 AND is_active = TRUE', // Doble check en is_active
        [JSON.stringify(messagesToSaveInDB), activeChatConversationId]
      );
      console.log(`Chat conversacion activa ${activeChatConversationId} actualizada para sesión ${req.sessionID}`);
    } else {
      // Insertar NUEVA conversación activa
      await client.query(
        'INSERT INTO chat_conversations (id, session_id, messages, is_active) VALUES ($1, $2, $3, TRUE)',
        [activeChatConversationId, req.sessionID, JSON.stringify(messagesToSaveInDB)]
      );
      console.log(`Nueva chat conversacion activa ${activeChatConversationId} creada para sesión ${req.sessionID}`);
    }
    res.json({ reply: replyContent });
  } catch (error) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar el mensaje de chat.' });
  } finally {
    client.release();
  }
});

// POST /api/reset - Marca la conversación de CHAT ACTIVA como INACTIVA
app.post('/api/reset', async (req, res) => {
    const client = await pool.connect();
    try {
        // Marcar CUALQUIER conversación activa para esta sesión como inactiva
        // Esto "archiva" la conversación actual.
        const updateResult = await client.query(
            'UPDATE chat_conversations SET is_active = FALSE, updated_at = NOW() WHERE session_id = $1 AND is_active = TRUE RETURNING id',
            [req.sessionID]
        );

        if (updateResult.rowCount > 0) {
            console.log(`Chat conversacion(es) ${updateResult.rows.map(r => r.id).join(', ')} marcada(s) como inactiva(s) para sesión ${req.sessionID} debido a reset.`);
        } else {
            console.log(`Intento de reset de chat para sesión ${req.sessionID}, pero no se encontraron conversaciones activas para marcar como inactivas.`);
        }
        // El frontend se encargará de recargar el estado del chat, que mostrará el mensaje inicial.
        res.json({ message: 'Conversación de chat archivada. Se iniciará una nueva en el próximo mensaje.' });
    } catch (error) {
        console.error('Error en /api/reset (marcar chat como inactivo):', error);
        res.status(500).json({ error: 'Error interno al reiniciar la conversación de chat.' });
    } finally {
        client.release();
    }
});

// POST /api/questionnaire (SIN CAMBIOS, sigue funcionando independientemente)
app.post('/api/questionnaire', async (req, res) => {
  const submissionData = req.body;
  if (
    !submissionData.tipoComida || !Array.isArray(submissionData.tipoComida) || submissionData.tipoComida.length === 0 ||
    !submissionData.precio || !Array.isArray(submissionData.precio) || submissionData.precio.length === 0  ||
    !submissionData.alergias || !Array.isArray(submissionData.alergias) ||
    !submissionData.nivelPicante || !Array.isArray(submissionData.nivelPicante) || submissionData.nivelPicante.length === 0
  ) {
    return res.status(400).json({ error: 'Faltan campos requeridos o tienen formato incorrecto para el cuestionario.' });
  }

  const arrayToString = (array) => {
    if (!array || array.length === 0) return 'ninguna';
    if (array.length === 1) return array[0];
    return array.slice(0, -1).join(', ') + ' y ' + array[array.length - 1];
  };
  const tipoComidaStr = arrayToString(submissionData.tipoComida);
  const precioStr = arrayToString(submissionData.precio);
  const alergiasStr = arrayToString(submissionData.alergias);
  const nivelPicanteStr = arrayToString(submissionData.nivelPicante);
  let userPreferencesPrompt = `Mis preferencias son: Tipo de comida: ${tipoComidaStr}. Rango de precio: ${precioStr}. Alergias: ${alergiasStr}. Nivel de picante: ${nivelPicanteStr}.`;
  if (submissionData.consideraciones && submissionData.consideraciones.trim() !== '') {
    userPreferencesPrompt += ` Consideraciones adicionales: ${submissionData.consideraciones.trim()}`;
  }
  const messagesForQuestionnaireAI = [
    { role: 'system', content: questionnaire_instructions },
    { role: 'user', content: userPreferencesPrompt }
  ];
  const client = await pool.connect();
  try {
    const recommendationsText = await getChatbotResponse(messagesForQuestionnaireAI);
    const questionnaireInteractionId = uuidv4();
    await client.query(
      'INSERT INTO questionnaire_interactions (id, session_id, submission_data, recommendation_text) VALUES ($1, $2, $3, $4)',
      [questionnaireInteractionId, req.sessionID, JSON.stringify(submissionData), recommendationsText]
    );
    console.log(`Nueva interaccion de cuestionario ${questionnaireInteractionId} creada para sesión ${req.sessionID}`);
    res.json({ recommendations: recommendationsText });
  } catch (error) {
    console.error('Error en /api/questionnaire:', error);
    res.status(500).json({ error: 'Error interno al obtener recomendaciones del cuestionario.' });
  } finally {
    client.release();
  }
});

// --- Iniciar servidor y base de datos ---
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