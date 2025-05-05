// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session'); // <--- Añadido
const { Pool } = require('pg');           // <--- Añadido
const { v4: uuidv4 } = require('uuid');   // <--- Añadido

const instructions = require('./instructions');
const firstMessage = require('./firstMessage');
const { getChatbotResponse } = require('./geminiApi'); // O la API que uses

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

// --- Función para inicializar la tabla en la DB ---
const initializeDatabase = async () => {
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
    // Considera terminar el proceso si la DB no se puede inicializar
    process.exit(1);
  } finally {
    client.release(); // Liberar cliente de vuelta al pool
  }
};

// --- Configuración CORS (sin cambios significativos) ---
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://restaurant-chatbot-three.vercel.app' // Asegúrate que el origen de producción sea correcto
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // <--- MUY IMPORTANTE: Necesario para que las cookies de sesión funcionen con CORS
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Configuración Sesiones ---
if (!process.env.SESSION_SECRET) {
  console.error("Error: SESSION_SECRET no está definido en el archivo .env. La aplicación no puede iniciarse de forma segura.");
  process.exit(1);
}
app.use(session({
  secret: process.env.SESSION_SECRET, // Clave secreta para firmar la cookie de sesión
  resave: false,                      // No guardar la sesión si no se modificó
  saveUninitialized: true,            // Guarda sesiones nuevas (aunque estén vacías inicialmente)
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Usar cookies seguras (HTTPS) en producción
    httpOnly: true,                               // Previene acceso a la cookie desde JS en el navegador
    maxAge: 24 * 60 * 60 * 1000                    // Tiempo de vida de la cookie (e.g., 1 día). Ajusta si necesitas.
                                                   // Si el usuario cierra el navegador antes de maxAge, la sesión persiste (almacenada en el navegador).
                                                   // Si quieres que se borre al cerrar navegador, omite maxAge.
  }
  // Nota: Por defecto usa MemoryStore. Para producción con muchos usuarios,
  // considera connect-pg-simple para almacenar sesiones en PostgreSQL.
}));

// --- Middleware para loggear información de sesión (opcional, para depuración) ---
// app.use((req, res, next) => {
//   console.log('Session ID:', req.sessionID);
//   console.log('Session Data:', req.session);
//   next();
// });

// --- Rutas API ---

// GET /api/conversation - Devuelve el historial de la sesión actual
app.get('/api/conversation', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT messages FROM conversations WHERE session_id = $1',
      [req.sessionID]
    );

    if (result.rows.length > 0) {
      // Convertir roles para el frontend
      const frontendMessages = result.rows[0].messages
        .filter(msg => msg.role !== 'system') // No enviar el system prompt al frontend
        .map(msg => ({
          sender: msg.role === 'assistant' ? 'bot' : 'user',
          text: msg.content
        }));
      res.json({ messages: frontendMessages });
    } else {
      // No hay conversación previa para esta sesión, devolver solo el mensaje inicial
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
  let currentMessages = [];

  try {
    // 1. Buscar conversación existente por session_id
    const findResult = await client.query(
      'SELECT id, messages FROM conversations WHERE session_id = $1',
      [req.sessionID]
    );

    const userMessage = { role: 'user', content: userMessageContent };

    if (findResult.rows.length > 0) {
      // 2a. Conversación encontrada: Cargarla y añadir mensaje de usuario
      conversationId = findResult.rows[0].id;
      currentMessages = findResult.rows[0].messages;
      currentMessages.push(userMessage);
    } else {
      // 2b. Conversación no encontrada: Inicializarla
      conversationId = uuidv4(); // Generar nuevo ID para la conversación
      currentMessages = [
        { role: 'system', content: instructions },
        { role: 'assistant', content: firstMessage },
        userMessage
      ];
    }

    // 3. Obtener respuesta del Chatbot
    const replyContent = await getChatbotResponse(currentMessages); // Pasar el historial actual
    const assistantMessage = { role: 'assistant', content: replyContent };
    currentMessages.push(assistantMessage);

    // 4. Guardar/Actualizar en la Base de Datos
    const messagesToSave = currentMessages.filter(msg => msg.role !== 'system'); // <--- AÑADIR FILTRO

    if (findResult.rows.length > 0) {
      // Actualizar conversación existente
      await client.query(
        'UPDATE conversations SET messages = $1 WHERE id = $2',
        // Usar el array filtrado para guardar
        [JSON.stringify(messagesToSave), conversationId] // <--- MODIFICADO
      );
      console.log(`Conversación ${conversationId} actualizada para sesión ${req.sessionID}`);
    } else {
      // Insertar nueva conversación
      await client.query(
        'INSERT INTO conversations (id, session_id, messages) VALUES ($1, $2, $3)',
        // Usar el array filtrado para guardar
        [conversationId, req.sessionID, JSON.stringify(messagesToSave)] // <--- MODIFICADO
      );
      console.log(`Nueva conversación ${conversationId} creada para sesión ${req.sessionID}`);
    }

    // 5. Enviar respuesta al frontend (sin cambios aquí)
    res.json({ reply: replyContent });

  } catch (error) {
    console.error('Error en /api/chat:', error);
    // Determinar si el error fue de la API o de la DB
    if (error.message.includes('API')) { // O una comprobación más específica si es posible
        res.status(502).json({ error: 'Error al comunicarse con el servicio de IA.' });
    } else {
        res.status(500).json({ error: 'Error interno del servidor al procesar el mensaje.' });
    }
  } finally {
    client.release();
  }
});

// POST /api/reset - (Opcional) Limpia la conversación para la sesión actual
app.post('/api/reset', async (req, res) => {
    const client = await pool.connect();
    try {
        // Opcionalmente, podrías marcar la conversación como "finalizada"
        // en lugar de borrarla si quisieras mantener un registro más explícito.
        // Por ahora, simplemente la eliminamos de la DB asociada a esta sesión.
        const deleteResult = await client.query(
            'DELETE FROM conversations WHERE session_id = $1 RETURNING id',
            [req.sessionID]
        );

        if (deleteResult.rowCount > 0) {
            console.log(`Conversación ${deleteResult.rows[0].id} eliminada para sesión ${req.sessionID} debido a reset.`);
        } else {
            console.log(`Intento de reset para sesión ${req.sessionID}, pero no se encontró conversación activa.`);
        }

        // Destruir la sesión podría ser demasiado si solo quieres reiniciar el chat.
        // Por ahora, solo eliminamos la conversación de la DB. La próxima
        // llamada a /api/chat creará una nueva automáticamente.
        // Si también quieres borrar la cookie, tendrías que destruir la sesión:
        // req.session.destroy(err => { ... });

        res.json({ message: 'Conversación reiniciada. Se creará una nueva al enviar el próximo mensaje.' });
    } catch (error) {
        console.error('Error en /api/reset:', error);
        res.status(500).json({ error: 'Error interno al reiniciar la conversación.' });
    } finally {
        client.release();
    }
});


// POST /api/questionnaire - Adaptado para usar la misma lógica de sesión y DB
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
  let currentMessages = [];

  try {
    // Lógica similar a /api/chat para encontrar o crear conversación
    const findResult = await client.query(
      'SELECT id, messages FROM conversations WHERE session_id = $1',
      [req.sessionID]
    );

    const userMessage = { role: 'user', content: userPreferences };

    if (findResult.rows.length > 0) {
      conversationId = findResult.rows[0].id;
      currentMessages = findResult.rows[0].messages;
      currentMessages.push(userMessage);
    } else {
      conversationId = uuidv4();
      currentMessages = [
        { role: 'system', content: instructions },
        { role: 'assistant', content: firstMessage }, // Incluir mensaje inicial en historial
        userMessage
      ];
    }

    // Obtener respuesta del Chatbot (recomendaciones)
    const recommendations = await getChatbotResponse(currentMessages);
    const assistantMessage = { role: 'assistant', content: recommendations };
    currentMessages.push(assistantMessage);

    // Guardar/Actualizar en la Base de Datos
     if (findResult.rows.length > 0) {
      await client.query(
        'UPDATE conversations SET messages = $1 WHERE id = $2',
        [JSON.stringify(currentMessages), conversationId]
      );
       console.log(`Conversación ${conversationId} actualizada (questionnaire) para sesión ${req.sessionID}`);
    } else {
      await client.query(
        'INSERT INTO conversations (id, session_id, messages) VALUES ($1, $2, $3)',
        [conversationId, req.sessionID, JSON.stringify(currentMessages)]
      );
       console.log(`Nueva conversación ${conversationId} creada (questionnaire) para sesión ${req.sessionID}`);
    }

    // Enviar recomendaciones al frontend
    res.json({ recommendations });

  } catch (error) {
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


// --- Iniciar servidor y base de datos ---
const startServer = async () => {
  try {
    await initializeDatabase(); // Asegurarse de que la DB esté lista antes de aceptar conexiones
    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error fatal al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();