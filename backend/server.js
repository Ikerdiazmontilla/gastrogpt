// <file path="backend/server.js">
// This is the refactored main server file.
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
// MODIFICATION: Add 'trust proxy' setting for production environments.
// This is important when the app is behind a reverse proxy (like on Render),
// as it allows Express to correctly determine if the connection is secure (HTTPS)
// which is necessary for `cookie.secure = true`.
if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1); // trust first proxy
}

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true, // Set to true to store session for all visitors, helps ensure session ID is available on first request.
  cookie: {
    secure: config.nodeEnv === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    // MODIFICATION: Set SameSite attribute for cookies.
    // 'lax' is a good default for development.
    // 'none' is required for cross-origin (e.g., Vercel frontend to Render backend) requests in production.
    // When SameSite='none', 'secure: true' is also mandatory.
    sameSite: 'lax', 
    // sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  },
}));

// --- API Routes ---
// Mount all API routes defined in the routes/index.js
app.use('/api', mainRoutes); // All routes will be prefixed with /api

// --- Global Error Handler (Optional - for future consideration) ---
// app.use((err, req, res, next) => {
//   console.error("Global Error Handler:", err.stack);
//   res.status(err.status || 500).json({
//     error: err.message || 'An unexpected error occurred.',
//   });
// });

// --- Start Server and Initialize Database ---
const startServer = async () => {
  try {
    // Initialize database schema
    await initializeDatabase();
    console.log('Database initialization complete.');

    // Start the Express server
    app.listen(config.port, () => {
      console.log(`Backend server running on http://localhost:${config.port}`);
      console.log(`CORS enabled for origins: ${config.corsOrigins.join(', ')}`);
      console.log(`Current Node Environment: ${config.nodeEnv}`);
      // MODIFICATION: Log SameSite cookie setting for clarity during startup.
      console.log(`Session cookie SameSite policy: ${config.nodeEnv === 'production' ? 'none' : 'lax'}`);
    });
  } catch (error) {
    console.error("Fatal error during server startup:", error);
    process.exit(1); // Exit if critical setup fails
  }
};

console.log(`Session cookie SameSite policy: ${app.get('session').cookie.sameSite}`);

startServer();
// </file>