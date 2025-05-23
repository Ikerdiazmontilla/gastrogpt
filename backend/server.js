// gastrogpts/backend/server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path'); // Import the 'path' module
const config = require('./config/config');
const { initializeDatabase } = require('./db/databaseSetup');
const mainRoutes = require('./routes');

const app = express();

// --- Middleware Setup ---
// CORS: For serving frontend from the same domain, restrictive CORS isn't strictly needed
// but it's good practice if you ever want to allow other origins.
// If Railway serves on your behalf, it might handle some CORS headers.
// For now, let's keep your existing config but understand it's less critical
// when backend and frontend are same-origin.
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // and requests from your Railway app's domain (and localhost for dev)
    // You'll replace 'YOUR_RAILWAY_APP_URL_HERE' later or make it dynamic
    const allowedOrigins = [
        'http://localhost:3000', // Frontend dev
        'http://localhost:5000', // Backend dev if separate
        process.env.RAILWAY_STATIC_URL, // Railway generated domain
        // Add your custom domain here once configured: e.g., 'https://www.yourcustomdomain.com'
    ].filter(Boolean); // Filter out undefined values like RAILWAY_STATIC_URL if not set

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin ${origin} not allowed.`); // Log blocked origins
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions)); // Keep your CORS for now

app.use(express.json());

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
    sameSite: config.nodeEnv === 'production' ? 'lax' : 'lax', // 'lax' is usually fine for same-site. 'none' is for cross-site.
  },
}));

// --- API Routes ---
app.use('/api', mainRoutes); // All API routes are prefixed with /api

// --- Serve React Frontend Static Files ---
// This line tells Express to serve any static files (like CSS, JS, images)
// from the 'build' folder of your React app.
// We use path.join to create an absolute path to the 'build' folder.
// '__dirname' is the directory of the current module (server.js)
// '../build' means "go up one directory from 'backend', then into 'build'"
const frontendBuildPath = path.join(__dirname, '..', 'build');
app.use(express.static(frontendBuildPath));

// --- Fallback for Client-Side Routing ---
// For any GET request that hasn't been handled by now (i.e., it's not an API route
// and not a static file), send back the main 'index.html' file from the React build.
// This allows React Router to take over and handle the routing on the client side.
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      // If index.html can't be sent (e.g., it doesn't exist yet during first build),
      // send a 500 error or a simpler message.
      // This can also happen if there's an issue with the path.
      console.error("Error sending index.html:", err);
      res.status(500).send("Error serving the application. If this is the first deployment, the frontend might still be building.");
    }
  });
});

// --- Start Server and Initialize Database ---
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialization complete.');

    // Railway provides the PORT environment variable
    const port = process.env.PORT || config.port; // Use Railway's port if available

    app.listen(port, () => {
      console.log(`Backend server running on port ${port}`);
      console.log(`Serving frontend from: ${frontendBuildPath}`);
      console.log(`CORS enabled for origins (check config): ${config.corsOrigins ? config.corsOrigins.join(', ') : 'configured dynamically'}`);
      console.log(`Current Node Environment: ${config.nodeEnv}`);
      console.log(`Session cookie SameSite policy: ${app.get('session').cookie.sameSite}`);
    });
  } catch (error) {
    console.error("Fatal error during server startup:", error);
    process.exit(1);
  }
};

startServer();