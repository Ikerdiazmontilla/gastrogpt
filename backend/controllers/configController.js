// backend/controllers/configController.js

/**
 * Controlador para obtener la configuración específica de un inquilino.
 * Esta configuración es la que necesita el frontend para renderizarse dinámicamente.
 */
async function getTenantConfig(req, res) {
  // El middleware dbConnection ya nos proporciona un cliente y tenantResolver el inquilino.
  const client = req.dbClient;
  const tenant = req.tenant; 


  try {
    // Hacemos las consultas en paralelo para más eficiencia.
    const menuPromise = client.query('SELECT data FROM menu WHERE id = 1');
    const configPromise = client.query("SELECT key, value FROM configurations WHERE key IN ('frontend_welcome_message', 'suggestion_chips_text', 'suggestion_chips_count')");
    
    const [menuResult, configResult] = await Promise.all([menuPromise, configPromise]);

    if (!menuResult.rows[0]) {
      return res.status(404).json({ error: 'Configuración de menú no encontrada para este restaurante.' });
    }

    const menu = menuResult.rows[0].data;

    // Convertimos las configuraciones de la tabla en un objeto JS amigable.
    const configurations = configResult.rows.reduce((acc, row) => {
      const keyMap = {
        frontend_welcome_message: 'welcomeMessage',
        suggestion_chips_text: 'suggestionChipsText',
        suggestion_chips_count: 'suggestionChipsCount'
      };
      const newKey = keyMap[row.key];
      if (newKey) {
        // Parseamos los valores que son numéricos o JSON para no enviarlos como string.
        if (row.key === 'suggestion_chips_text') {
            try {
                // Convierte el string '["texto1", "texto2"]' a un array de verdad.
                acc[newKey] = JSON.parse(row.value);
            } catch {
                acc[newKey] = []; // Fallback a un array vacío si el JSON está malformado.
            }
        } else if (row.key === 'suggestion_chips_count') {
            // Convierte el string '4' a un número.
            acc[newKey] = parseInt(row.value, 10) || 4; // Fallback a 4 si no es un número.
        } else {
            acc[newKey] = row.value;
        }
      }
      return acc;
    }, {});
    
    // Ensamblamos el objeto 'theme' a partir de las columnas de la tabla 'tenants'.
    const theme = {
      logoUrl: tenant.logo_url, // CORRECCIÓN AQUÍ: Esta línea faltaba.
      menuHasImages: tenant.menu_has_images,
      borderRadius: `${tenant.border_radius_px || 8}px`,
      colors: {
        primary: tenant.color_primary || '#0071E3',
        background: tenant.color_background || '#FAFAFC',
        textDefault: tenant.color_text_default || '#333333',
        cardBackground: tenant.color_card_background || '#FFFFFF'
      }
    };

    // Combinamos todo en una única respuesta para el frontend.
    const frontendConfig = {
      menu,
      theme,
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