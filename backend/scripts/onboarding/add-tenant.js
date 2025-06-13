const fs = require('fs');
const path = require('path');
const pool = require('../../db/pool'); // Ruta actualizada para salir de /onboarding

//npm run add-tenant --prefix backend -- nuevo-restaurante.config.js

// --- PASO 1: Obtener el nombre del archivo de configuración desde la terminal ---
const configFile = process.argv[2];
if (!configFile) {
  console.error('❌ ERROR: Debes proporcionar el nombre del archivo de configuración.');
  console.error('   Ejemplo: npm run add-tenant -- la-cuchara-de-oro.config.js');
  process.exit(1);
}

const configPath = path.join(__dirname, 'configs', configFile);
if (!fs.existsSync(configPath)) {
  console.error(`❌ ERROR: No se encuentra el archivo de configuración en: ${configPath}`);
  process.exit(1);
}

const tenantConfig = require(configPath);

// --- El resto del script es igual, pero ahora usa el config importado ---

(async () => {
  // MODIFICACIÓN: Convertir subdominio con guiones a un nombre de schema válido con guiones bajos.
  const schemaFriendlySubdomain = tenantConfig.subdomain.replace(/-/g, '_');
  const schemaName = `tenant_${schemaFriendlySubdomain}`;
  
  const client = await pool.connect();

  try {
    console.log(`🚀 Iniciando onboarding para el restaurante: ${tenantConfig.restaurantName}`);
    
    await client.query('BEGIN');
    console.log('✅ Transacción iniciada.');

    const insertTenantQuery = `
      INSERT INTO public.tenants (
        subdomain, schema_name, restaurant_name, logo_url, menu_has_images, border_radius_px,
        theme_color_accent, theme_color_accent_text, theme_color_page_bg, theme_color_surface_bg,
        theme_color_text_primary, theme_color_text_secondary, theme_color_border,
        theme_chat_bubble_user_bg, theme_chat_bubble_bot_bg
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);
    `;
    const theme = tenantConfig.theme;
    const tenantValues = [
      tenantConfig.subdomain, // El subdominio original (ej: "la-taurina")
      schemaName,             // El nombre del schema convertido (ej: "tenant_la_taurina")
      tenantConfig.restaurantName, 
      theme.logoUrl, 
      theme.menuHasImages, 
      theme.borderRadiusPx,
      theme.colors.accent, 
      theme.colors.accentText, 
      theme.colors.pageBackground, 
      theme.colors.surfaceBackground,
      theme.colors.textPrimary, 
      theme.colors.textSecondary, 
      theme.colors.border,
      theme.colors.chat.userBubbleBackground, 
      theme.colors.chat.botBubbleBackground
    ];
    await client.query(insertTenantQuery, tenantValues);
    console.log(`✅ PASO 1/4: Inquilino '${tenantConfig.restaurantName}' registrado en public.tenants.`);

    if (!/^[a-zA-Z0-9_]+$/.test(schemaName)) {
      throw new Error(`Nombre de schema inválido: ${schemaName}`);
    }
    await client.query(`CREATE SCHEMA ${schemaName}`);
    console.log(`✅ PASO 2/4: Schema '${schemaName}' creado.`);

    const schemaSqlPath = path.join(__dirname, 'tenant_schema.sql');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8').replace(/__SCHEMA_NAME__/g, schemaName);
    await client.query(schemaSql);
    console.log(`✅ PASO 3/4: Tablas creadas dentro de '${schemaName}'.`);

    const insertMenuQuery = `INSERT INTO ${schemaName}.menu (data) VALUES ($1);`;
    await client.query(insertMenuQuery, [JSON.stringify(tenantConfig.menu)]);

    const insertConfigQuery = `INSERT INTO ${schemaName}.configurations (key, value) VALUES ($1, $2);`;
    await client.query(insertConfigQuery, ['llm_instructions', tenantConfig.llm.instructions]);
    await client.query(insertConfigQuery, ['llm_first_message', tenantConfig.llm.firstMessage]);
    await client.query(insertConfigQuery, ['frontend_welcome_message', JSON.stringify(tenantConfig.chatConfig.welcomeMessage)]);
    await client.query(insertConfigQuery, ['suggestion_chips_text', JSON.stringify(tenantConfig.chatConfig.suggestionChips)]);
    await client.query(insertConfigQuery, ['suggestion_chips_count', tenantConfig.chatConfig.suggestionChipsCount.toString()]);
    console.log(`✅ PASO 4/4: Datos de configuración y menú insertados.`);

    await client.query('COMMIT');
    console.log('✅ Transacción completada.');
    console.log(`\n🎉 ¡Onboarding finalizado con éxito para '${tenantConfig.restaurantName}'!`);
    console.log(`   Puede acceder a la aplicación en: http://${tenantConfig.subdomain}.localhost:3000`);

  } catch (err) {
    console.error('❌ ERROR: Ocurrió un fallo durante el onboarding. Revirtiendo cambios...');
    console.error(err.stack);
    await client.query('ROLLBACK');
    console.log('🔥 Transacción revertida. La base de datos está en su estado original.');
  } finally {
    client.release();
    console.log('🔌 Conexión con la base de datos cerrada.');
  }
})();