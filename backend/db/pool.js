// <file path="backend/db/pool.js">
const { Pool } = require('pg');
const config = require('../config/config');

/**
 * @file pool.js
 * @description Manages the PostgreSQL connection pool.
 * Initializes a single pool instance using settings from the config file.
 * This pool is then used by repositories to interact with the database.
 */

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  ssl: {
    rejectUnauthorized: true, // for Render's managed PostgreSQL
  },
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit if the pool encounters a critical error
});

module.exports = pool;
// </file>