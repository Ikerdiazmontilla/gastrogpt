// backend/controllers/configController.js
async function getTenantConfig(req, res) {
  const client = req.dbClient;
  const tenant = req.tenant; 

  try {
    const menuPromise = client.query('SELECT data FROM menu WHERE id = 1');
    // MODIFIED: Removed 'frontend_welcome_message' from the query as it's no longer used.
    const configPromise = client.query("SELECT key, value FROM configurations WHERE key IN ('suggestion_chips_text', 'suggestion_chips_count')");
    
    const [menuResult, configResult] = await Promise.all([menuPromise, configPromise]);

    if (!menuResult.rows[0]) {
      return res.status(404).json({ error: 'Configuración de menú no encontrada para este restaurante.' });
    }

    const menu = menuResult.rows[0].data;

    const configurations = configResult.rows.reduce((acc, row) => {
      // MODIFIED: Removed 'welcomeMessage' from the key map.
      const keyMap = {
        suggestion_chips_text: 'suggestionChipsText',
        suggestion_chips_count: 'suggestionChipsCount',
      };
      const newKey = keyMap[row.key];
      if (newKey) {
        // MODIFIED: Simplified the parsing logic as welcomeMessage is no longer needed.
        if (row.key === 'suggestion_chips_text') {
            try { acc[newKey] = JSON.parse(row.value); } catch { acc[newKey] = {}; }
        } else if (row.key === 'suggestion_chips_count') {
            acc[newKey] = parseInt(row.value, 10) || 4;
        } else {
            acc[newKey] = row.value;
        }
      }
      return acc;
    }, {});
    
    const transformDrinksForInitialFlow = (menuData) => {
      const drinksCategory = Object.values(menuData).find(cat => cat.title && (cat.title.es === 'Bebidas' || cat.title.en === 'Drinks'));

      if (!drinksCategory) return { enabled: false };

      const buildOptions = (category) => {
        let currentOptions = [];
        if (category.dishes && category.dishes.length > 0) {
          const dishOptions = category.dishes.map(drink => ({
            type: 'send_message', label: drink.nombre, dishId: drink.id, orderId: drink.orderId || 99
          }));
          currentOptions.push(...dishOptions);
        }
        if (category.subCategories) {
          const subCategoryOptions = Object.values(category.subCategories).map(subCat => ({
            type: 'category', label: subCat.title, sub_options: buildOptions(subCat), orderId: subCat.orderId || 99
          }));
          currentOptions.push(...subCategoryOptions);
        }
        return currentOptions.sort((a, b) => a.orderId - b.orderId);
      };

      const finalOptions = buildOptions(drinksCategory);
      if (finalOptions.length === 0) return { enabled: false };

      return {
        enabled: true,
        // --- CAMBIO CLAVE: Título estático y traducible ---
        question: {
          es: "¿Qué te apetece para beber?",
          en: "What would you like to drink?",
          fr: "Que souhaitez-vous boire?",
          de: "Was möchten Sie trinken?"
        },
        options: finalOptions
      };
    };

    const initialDrinkPrompt = transformDrinksForInitialFlow(menu);

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

    const frontendConfig = {
      menu,
      theme,
      googleReviewsUrl: tenant.google_reviews_url,
      initialDrinkPrompt,
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