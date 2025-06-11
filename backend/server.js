// backend/server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const config = require('./config/config'); // Centralized configuration
// ELIMINADO: const { initializeDatabase } = require('./db/databaseSetup');
const mainRoutes = require('./routes'); // Main router from routes/index.js
const tenantResolver = require('./middleware/tenantResolver'); // NUEVO
const dbConnection = require('./middleware/dbConnection'); // NUEVO

/**
 * @file server.js
 * @description Main entry point for the backend application.
 * Sets up Express, middleware, database, routes, and starts the server.
 */

const app = express();

// --- Middleware Setup ---
// CORS
const corsOptions = {
  // Permitimos que CUALQUIER subdominio de gastrogpt.app (o tu dominio) y localhost hagan peticiones.
  origin: (origin, callback) => {
    // Si no hay origin (peticiones del mismo origen o server-to-server como curl), permitir.
    if (!origin) return callback(null, true);

    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/, // localhost con cualquier puerto
      /https:\/\/.*\.gastrogpt\.app$/, // Cualquier subdominio de gastrogpt.app
      'https://gastroai.net' // Tu dominio estático
    ];
    
    // Si el origin coincide con alguna de nuestras reglas, permitir.
    if (allowedPatterns.some(pattern => pattern.test(origin))) {
      callback(null, true);
    } else {
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
  app.set('trust proxy', 1); // trust first proxy
}

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    // Cambiado a 'None' para permitir cookies cross-domain (necesario si el frontend y backend están en dominios diferentes)
    // 'secure: true' es OBLIGATORIO con SameSite=None.
    sameSite: config.nodeEnv === 'production' ? 'None' : 'Lax', 
  },
}));

// --- Middleware de Multi-Tenancy ---
// Estos middlewares se aplican solo a las rutas /api.
// 1. Resuelve el inquilino basado en el subdominio.
app.use('/api', tenantResolver);
// 2. Establece la conexión a la BBDD con el search_path correcto.
app.use('/api', dbConnection);


// --- API Routes ---
// Ahora las rutas principales usan la información de inquilino y la conexión de BBDD preparadas.
app.use('/api', mainRoutes);

// --- Start Server ---
const startServer = async () => {
  try {
    // YA NO ES NECESARIO: La BBDD se gestiona manualmente.
    // await initializeDatabase(); 
    // console.log('Database initialization complete.');

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