// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const instructions = require('./instructions');
const firstMessage = require('./firstMessage'); // This is for chat, likely remains as is
const questionnaire_instructions = require('./questionnaire_instructions'); // System prompt for questionnaire AI
const { getChatbotResponse } = require('./geminiApi');
const { buildQuestionnairePrompt } = require('./promptBuilder'); // <-- IMPORTED

const app = express();
const PORT = process.env.PORT || 5000;

// --- Configuración Base de Datos PostgreSQL ---
// ... (database setup remains the same)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id UUID PRIMARY KEY,
        session_id TEXT NOT NULL,
        messages JSONB NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
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
    await client.query(`
        CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_active
        ON chat_conversations (session_id, is_active)
        WHERE is_active = TRUE;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS questionnaire_interactions (
        id UUID PRIMARY KEY,
        session_id TEXT NOT NULL,
        submission_data JSONB NOT NULL, -- Will store submissionData including language
        recommendation_text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
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


// --- Configuración CORS y Sesiones ---
// ... (CORS and session setup remains the same)
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
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// --- Rutas API ---

// GET /api/conversation
// ... (this route remains the same)
app.get('/api/conversation', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT messages FROM chat_conversations WHERE session_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
      [req.sessionID]
    );
    if (result.rows.length > 0 && result.rows[0].messages && result.rows[0].messages.length > 0) {
      const savedMessages = result.rows[0].messages;
      const frontendMessages = [
        ...savedMessages.map(msg => ({
          sender: msg.role === 'assistant' ? 'bot' : 'user',
          text: msg.content
        }))
      ];
      res.json({ messages: frontendMessages });
    } else {
      res.json({ messages: [{ sender: 'bot', text: '' }]});
    }
  } catch (error) {
    console.error('Error al obtener la conversación activa del chat:', error);
    res.status(500).json({ error: 'Error interno al obtener la conversación del chat.' });
  } finally {
    client.release();
  }
});


// POST /api/chat
// ... (this route remains the same)
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
    const findResult = await client.query(
      'SELECT id, messages FROM chat_conversations WHERE session_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
      [req.sessionID]
    );
    const userMessageForAI = { role: 'user', content: userMessageContent };
    if (findResult.rows.length > 0) {
      activeChatConversationId = findResult.rows[0].id;
      messagesToSaveInDB = findResult.rows[0].messages || [];
      messagesForAI = [
        { role: 'system', content: instructions },
        { role: 'assistant', content: firstMessage },
        ...messagesToSaveInDB,
        userMessageForAI
      ];
      messagesToSaveInDB.push(userMessageForAI);
    } else {
      activeChatConversationId = uuidv4();
      messagesForAI = [
        { role: 'system', content: instructions },
        { role: 'assistant', content: firstMessage },
        userMessageForAI
      ];
      messagesToSaveInDB = [userMessageForAI];
    }
    const replyContent = await getChatbotResponse(messagesForAI);
    const assistantMessageForAI = { role: 'assistant', content: replyContent };
    messagesToSaveInDB.push(assistantMessageForAI);
    if (findResult.rows.length > 0) {
      await client.query(
        'UPDATE chat_conversations SET messages = $1 WHERE id = $2 AND is_active = TRUE',
        [JSON.stringify(messagesToSaveInDB), activeChatConversationId]
      );
      console.log(`Chat conversacion activa ${activeChatConversationId} actualizada para sesión ${req.sessionID}`);
    } else {
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

// POST /api/reset
// ... (this route remains the same)
app.post('/api/reset', async (req, res) => {
    const client = await pool.connect();
    try {
        const updateResult = await client.query(
            'UPDATE chat_conversations SET is_active = FALSE, updated_at = NOW() WHERE session_id = $1 AND is_active = TRUE RETURNING id',
            [req.sessionID]
        );
        if (updateResult.rowCount > 0) {
            console.log(`Chat conversacion(es) ${updateResult.rows.map(r => r.id).join(', ')} marcada(s) como inactiva(s) para sesión ${req.sessionID} debido a reset.`);
        } else {
            console.log(`Intento de reset de chat para sesión ${req.sessionID}, pero no se encontraron conversaciones activas para marcar como inactivas.`);
        }
        res.json({ message: 'Conversación de chat archivada. Se iniciará una nueva en el próximo mensaje.' });
    } catch (error) {
        console.error('Error en /api/reset (marcar chat como inactivo):', error);
        res.status(500).json({ error: 'Error interno al reiniciar la conversación de chat.' });
    } finally {
        client.release();
    }
});


// POST /api/questionnaire - MODIFIED
app.post('/api/questionnaire', async (req, res) => {
  const submissionDataWithLang = req.body; // Contains all form fields + language
  const language = submissionDataWithLang.language || 'Español'; // Extract language, default if not provided

  // For validation, we can use the data without the language field if it's not a preference
  // However, the prompt builder will use submissionDataWithLang
  const { language: langField, ...formDataForValidation } = submissionDataWithLang;

  if (
    !formDataForValidation.tipoComida || !Array.isArray(formDataForValidation.tipoComida) || formDataForValidation.tipoComida.length === 0 ||
    !formDataForValidation.precio || !Array.isArray(formDataForValidation.precio) || formDataForValidation.precio.length === 0  ||
    !formDataForValidation.alergias || !Array.isArray(formDataForValidation.alergias) || formDataForValidation.alergias.length === 0 || // Ensure alergias has at least one item (e.g., "nada")
    !formDataForValidation.nivelPicante || !Array.isArray(formDataForValidation.nivelPicante) || formDataForValidation.nivelPicante.length === 0
  ) {
    // This error message should ideally be internationalized if sent to frontend, but for now, it's server-side.
    return res.status(400).json({ error: 'Faltan campos requeridos o tienen formato incorrecto para el cuestionario.' });
  }

  // The old arrayToString function is removed from here.
  // buildQuestionnairePrompt handles formatting and language.
  const userPreferencesPrompt = buildQuestionnairePrompt(submissionDataWithLang, language);

  const messagesForQuestionnaireAI = [
    { role: 'system', content: questionnaire_instructions }, // This is general, language-agnostic system instructions
    { role: 'user', content: userPreferencesPrompt } // This user prompt now includes "Answer in X language"
  ];

  const client = await pool.connect();
  try {
    const recommendationsText = await getChatbotResponse(messagesForQuestionnaireAI);
    const questionnaireInteractionId = uuidv4();
    await client.query(
      'INSERT INTO questionnaire_interactions (id, session_id, submission_data, recommendation_text) VALUES ($1, $2, $3, $4)',
      // Storing the full submissionData (which includes language)
      [questionnaireInteractionId, req.sessionID, JSON.stringify(submissionDataWithLang), recommendationsText]
    );
    console.log(`Nueva interaccion de cuestionario ${questionnaireInteractionId} creada para sesión ${req.sessionID} con idioma ${language}`);
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