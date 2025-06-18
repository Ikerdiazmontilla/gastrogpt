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
        if (row.key === 'frontend_welcome_message' || row.key === 'suggestion_chips_text') {
            try {
                // Convierte el string '{"es": "...", "en": "..."}' a un objeto JS.
                acc[newKey] = JSON.parse(row.value);
            } catch {
                // Fallback si el JSON está malformado.
                acc[newKey] = (row.key === 'frontend_welcome_message') ? {} : []; 
            }
        } else if (row.key === 'suggestion_chips_count') {
            acc[newKey] = parseInt(row.value, 10) || 4;
        } else {
            acc[newKey] = row.value;
        }
      }
      return acc;
    }, {});
    
    const theme = {
      logoUrl: tenant.logo_url,
      menuHasImages: tenant.menu_has_images,
      borderRadius: tenant.border_radius_px ? `${tenant.border_radius_px}px` : null,
      colors: {
        accent: tenant.theme_color_accent,
        accentText: tenant.theme_color_accent_text,
        pageBackground: tenant.theme_color_page_bg,
        surfaceBackground: tenant.theme_color_surface_bg,
        textPrimary: tenant.theme_color_text_primary,
        textSecondary: tenant.theme_color_text_secondary,
        border: tenant.theme_color_border,
        chat: {
          userBubbleBackground: tenant.theme_chat_bubble_user_bg,
          botBubbleBackground: tenant.theme_chat_bubble_bot_bg,
        }
      }
    };

    // Combinamos todo en una única respuesta para el frontend.
    const frontendConfig = {
      menu,
      theme,
      googleReviewsUrl: tenant.google_reviews_url, // Added the URL to the config payload
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