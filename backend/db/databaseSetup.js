// backend/db/databaseSetup.js

/**
 * @file databaseSetup.js
 * @description En la arquitectura multi-tenant, la creación de schemas y tablas
 * se realiza manualmente o mediante scripts de migración por inquilino.
 * Este archivo se mantiene pero su función de inicialización se ha desactivado
 * para evitar la creación accidental de tablas en el schema 'public'.
 */
const initializeDatabase = async () => {
  console.log('Database setup is now managed via manual tenant onboarding scripts. Skipping automatic initialization.');
  return Promise.resolve();
};

module.exports = { initializeDatabase };