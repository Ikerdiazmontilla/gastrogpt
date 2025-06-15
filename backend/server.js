// backend/server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const config = require('./config/config');
const mainRoutes = require('./routes');
const tenantResolver = require('./middleware/tenantResolver');
const dbConnection = require('./middleware/dbConnection');

/**
 * @file server.js
 * @description Main entry point for the backend application.
 */

const app = express();

// --- Middleware Setup ---
// CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Si no hay origin (peticiones del mismo origen o server-to-server como curl), permitir.
    if (!origin) return callback(null, true);

    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,     // Regex: localhost con cualquier puerto
      /^http:\/\/.*\.localhost:\d+$/, // Regex: demo.localhost con cualquier puerto
      'https://gastroai.net',
      /https:\/\/.*\.gastroai\.net$/,           // String: Tu dominio estático exacto
    ];
    
    // LA CORRECCIÓN ESTÁ AQUÍ.
    // Ahora la lógica comprueba si el 'pattern' es un string o una expresión regular
    // y usa el método de comparación correcto para cada caso.
    const isAllowed = allowedPatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return origin === pattern; // Comparación directa para strings
      } else if (pattern instanceof RegExp) {
        return pattern.test(origin); // Test de regex para expresiones regulares
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`CORS: Origen no permitido: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json());

// Session Management
if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: config.nodeEnv === 'production' ? 'None' : 'Lax', 
  },
}));

// --- Middleware de Multi-Tenancy ---
app.use('/api', tenantResolver);
app.use('/api', dbConnection);

// --- API Routes ---
app.use('/api', mainRoutes);

// --- Start Server ---
const startServer = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`Backend server running on http://localhost:${config.port}`);
      console.log(`Current Node Environment: ${config.nodeEnv}`);
      console.log(`Session cookie SameSite policy: ${config.nodeEnv === 'production' ? 'None' : 'Lax'}`);
    });
  } catch (error) {
    console.error("Fatal error during server startup:", error);
    process.exit(1);
  }
};

startServer();