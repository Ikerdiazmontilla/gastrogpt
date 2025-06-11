// backend/controllers/configController.js

/**
 * Controlador para obtener la configuración específica de un inquilino.
 * Esta configuración es la que necesita el frontend para renderizarse.
 */
async function getTenantConfig(req, res) {
  // El middleware dbConnection ya nos proporciona un cliente configurado en req.dbClient.
  const client = req.dbClient;

  try {
    // Hacemos las consultas en paralelo para más eficiencia.
    const menuPromise = client.query('SELECT data FROM menu WHERE id = 1');
    const configPromise = client.query("SELECT key, value FROM configurations WHERE key IN ('welcome_message')");
    
    const [menuResult, configResult] = await Promise.all([menuPromise, configPromise]);

    if (!menuResult.rows[0]) {
      return res.status(404).json({ error: 'Configuración de menú no encontrada para este restaurante.' });
    }

    // Extraemos los datos del menú.
    const menu = menuResult.rows[0].data;

    // Convertimos las configuraciones en un objeto más fácil de usar para el frontend.
    const configurations = configResult.rows.reduce((acc, row) => {
      // De 'welcome_message' a 'welcomeMessage' (camelCase)
      const camelCaseKey = row.key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      acc[camelCaseKey] = row.value;
      return acc;
    }, {});
    
    // Combinamos todo en una única respuesta para el frontend.
    const frontendConfig = {
      menu,
      ...configurations
    };

    res.json(frontendConfig);

  } catch (error) {
    console.error('Error en getTenantConfig:', error);
    res.status(500).json({ error: 'Error al obtener la configuración del restaurante.' });
  }
  // No necesitamos client.release(), el middleware se encarga.
}

module.exports = {
  getTenantConfig,
};