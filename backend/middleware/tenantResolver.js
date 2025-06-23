// backend/middleware/tenantResolver.js

const pool = require('../db/pool');

/**
 * Middleware para resolver el inquilino (tenant) basado en el subdominio de la petición.
 */
async function tenantResolver(req, res, next) {
  const hostname = req.hostname;
  const subdomain = hostname.split('.')[0];

  if (!subdomain || subdomain === 'localhost' || subdomain === 'www') {
    return res.status(404).json({ error: 'Restaurante no especificado o no encontrado.' });
  }

  try {
    // MODIFIED: The query now selects the `show_short_description_in_menu` column.
    const query = `
      SELECT
        id, subdomain, schema_name, restaurant_name, is_active,
        logo_url, menu_has_images, border_radius_px,
        theme_color_accent, theme_color_accent_text, theme_color_page_bg,
        theme_color_surface_bg, theme_color_text_primary, theme_color_text_secondary,
        theme_color_border, theme_chat_bubble_user_bg, theme_chat_bubble_bot_bg,
        google_reviews_url, show_short_description_in_menu
      FROM public.tenants
      WHERE subdomain = $1
    `;
    
    const result = await pool.query(query, [subdomain]);

    const tenant = result.rows[0];

    if (!tenant || !tenant.is_active) {
      return res.status(404).json({ error: 'Restaurante no encontrado o inactivo.' });
    }

    // 'req.tenant' will now contain the full tenant object including the new property.
    req.tenant = tenant;
    console.log(`Petición resuelta para el inquilino: ${tenant.restaurant_name} (schema: ${tenant.schema_name})`);
    
    next();
  } catch (error) {
    console.error('Error en el middleware tenantResolver:', error);
    res.status(500).json({ error: 'Error interno del servidor al resolver el inquilino.' });
  }
}

module.exports = tenantResolver;