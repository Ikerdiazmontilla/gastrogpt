// backend/middleware/dbConnection.js

const pool = require('../db/pool');

/**
 * Middleware para establecer una conexión de base de datos específica para el inquilino.
 * 
 * 1. Se ejecuta DESPUÉS de tenantResolver, por lo que asume que `req.tenant` existe.
 * 2. Obtiene una conexión del pool.
 * 3. Ejecuta `SET search_path` para que todas las consultas de esta conexión apunten al schema del inquilino.
 *    Esto elimina la necesidad de escribir `tenant_demo.chat_conversations` en cada consulta.
 * 4. Adjunta el cliente de base de datos configurado a `req` (`req.dbClient`).
 * 5. Asegura que la conexión se libere de vuelta al pool cuando la petición termine.
 */
async function dbConnection(req, res, next) {
  // Si no hay inquilino, es un error de programación (el orden de los middlewares es incorrecto).
  if (!req.tenant) {
    return res.status(500).json({ error: 'Error: No se ha identificado al inquilino antes de la conexión a la BBDD.' });
  }

  let client;
  try {
    // Obtenemos un cliente del pool de conexiones.
    client = await pool.connect();

    // ¡La magia está aquí! Cambiamos el contexto de búsqueda para esta conexión.
    // Todas las consultas (ej. `SELECT * FROM chat_conversations`) buscarán primero
    // en 'tenant_demo.chat_conversations' y luego en 'public.chat_conversations' (fallback).
    await client.query(`SET search_path TO ${req.tenant.schema_name}, public`);
    
    // Adjuntamos el cliente listo para usar al objeto de la petición.
    req.dbClient = client;

    // Nos aseguramos de que el cliente se libere cuando la respuesta se complete.
    res.on('finish', () => {
      if (req.dbClient) {
        req.dbClient.release();
        console.log(`Conexión a BBDD liberada para el schema ${req.tenant.schema_name}.`);
      }
    });
    
    next();
  } catch (error) {
    console.error(`Error configurando la conexión para el schema ${req.tenant.schema_name}:`, error);
    // Si se obtuvo un cliente pero algo falló, lo liberamos.
    if (client) {
      client.release();
    }
    res.status(500).json({ error: 'Error interno al configurar la conexión a la base de datos.' });
  }
}

module.exports = dbConnection;