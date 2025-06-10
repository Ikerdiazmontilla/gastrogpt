// backend/server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const config = require('./config/config'); // Centralized configuration
const { initializeDatabase } = require('./db/databaseSetup');
const mainRoutes = require('./routes'); // Main router from routes/index.js

/**
 * @file server.js
 * @description Main entry point for the backend application.
 * Sets up Express, middleware, database, routes, and starts the server.
 */

const app = express();

// --- Middleware Setup ---
// CORS
const corsOptions = {
  origin: config.corsOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
console.log('CORS Origins allowed:', config.corsOrigins);
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
    sameSite: 'Lax', // Recommended: 'Lax' for first-party proxied setup
  },
}));

// --- API Routes ---
app.use('/api', mainRoutes);

// --- Start Server and Initialize Database ---
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialization complete.');

    app.listen(config.port, () => {
      console.log(`Backend server running on http://localhost:${config.port}`);
      console.log(`CORS enabled for origins: ${config.corsOrigins.join(', ')}`);
      console.log(`Current Node Environment: ${config.nodeEnv}`);
      console.log(`Session cookie SameSite policy: Lax`); // Updated to reflect change
    });
  } catch (error) {
    console.error("Fatal error during server startup:", error);
    process.exit(1);
  }
};

startServer();