// backend/controllers/configController.js

/**
 * Controlador para obtener la configuración específica de un inquilino.
 * Esta configuración es la que necesita el frontend para renderizarse.
 */
async function getTenantConfig(req, res) {
  const client = req.dbClient;

  try {
    const menuPromise = client.query('SELECT data FROM menu WHERE id = 1');
    // MODIFICADO: Buscamos la nueva clave para el mensaje del frontend.
    const configPromise = client.query("SELECT key, value FROM configurations WHERE key IN ('frontend_welcome_message')");
    
    const [menuResult, configResult] = await Promise.all([menuPromise, configPromise]);

    if (!menuResult.rows[0]) {
      return res.status(404).json({ error: 'Configuración de menú no encontrada para este restaurante.' });
    }

    const menu = menuResult.rows[0].data;

    // Convertimos las configuraciones en un objeto más fácil de usar para el frontend.
    const configurations = configResult.rows.reduce((acc, row) => {
      // MODIFICADO: Mapeamos 'frontend_welcome_message' a 'welcomeMessage' en el JSON final.
      if (row.key === 'frontend_welcome_message') {
        acc['welcomeMessage'] = row.value;
      }
      return acc;
    }, {});
    
    const frontendConfig = {
      menu,
      ...configurations
    };

    res.json(frontendConfig);

  } catch (error) {
    console.error('Error en getTenantConfig:', error);
    res.status(500).json({ error: 'Error al obtener la configuración del restaurante.' });
  }
}

module.exports = {
  getTenantConfig,
};