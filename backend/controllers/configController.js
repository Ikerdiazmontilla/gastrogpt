// backend/controllers/configController.js
async function getTenantConfig(req, res) {
  const client = req.dbClient;
  const tenant = req.tenant; 

  try {
    // Se añade 'initial_drink_prompt' a la consulta de configuraciones
    const menuPromise = client.query('SELECT data FROM menu WHERE id = 1');
    const configPromise = client.query("SELECT key, value FROM configurations WHERE key IN ('frontend_welcome_message', 'suggestion_chips_text', 'suggestion_chips_count', 'initial_drink_prompt')");
    
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
        suggestion_chips_count: 'suggestionChipsCount',
        initial_drink_prompt: 'initialDrinkPrompt' // Nueva clave mapeada
      };
      const newKey = keyMap[row.key];
      if (newKey) {
        // Para todas las configuraciones que son objetos JSON
        if (['frontend_welcome_message', 'suggestion_chips_text', 'initial_drink_prompt'].includes(row.key)) {
            try {
                acc[newKey] = JSON.parse(row.value);
            } catch {
                acc[newKey] = (row.key === 'frontend_welcome_message') ? {} : (row.key === 'initial_drink_prompt' ? null : []); 
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
      googleReviewsUrl: tenant.google_reviews_url,
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