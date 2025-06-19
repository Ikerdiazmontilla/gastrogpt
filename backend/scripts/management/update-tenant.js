// backend/scripts/management/update-tenant.js
const fs = require('fs');
const path = require('path');
const pool = require('../../db/pool');

(async () => {
  const configFile = process.argv[2];
  if (!configFile) {
    console.error('❌ ERROR: Debes proporcionar el nombre del archivo de configuración a aplicar.');
    console.error('   Ejemplo: npm run update-tenant -- demo.config.js');
    process.exit(1);
  }

  const configPath = path.join(__dirname, '../onboarding/configs', configFile);
  if (!fs.existsSync(configPath)) {
    console.error(`❌ ERROR: No se encuentra el archivo de configuración en: ${configPath}`);
    process.exit(1);
  }

  const tenantConfig = require(configPath);
  console.log(`🚀 Iniciando actualización para el restaurante: ${tenantConfig.restaurantName} (Subdominio: ${tenantConfig.subdomain})`);

  const client = await pool.connect();

  try {
    console.log('🔌 Conectado a la base de datos...');
    await client.query('BEGIN');
    console.log('✅ Transacción iniciada. Aplicando cambios...');

    const tenantResult = await client.query(
      'SELECT id, schema_name FROM public.tenants WHERE subdomain = $1',
      [tenantConfig.subdomain]
    );

    const tenantToUpdate = tenantResult.rows[0];
    if (!tenantToUpdate) {
      throw new Error(`El inquilino con el subdominio '${tenantConfig.subdomain}' no existe. Usa el script 'add-tenant' para crearlo primero.`);
    }
    const schemaName = tenantToUpdate.schema_name;
    console.log(`  -> Inquilino encontrado. Schema: '${schemaName}'. Procediendo a actualizar.`);

    const updateTenantQuery = `
      UPDATE public.tenants SET
        restaurant_name = $2, logo_url = $3, menu_has_images = $4, border_radius_px = $5,
        theme_color_accent = $6, theme_color_accent_text = $7, theme_color_page_bg = $8,
        theme_color_surface_bg = $9, theme_color_text_primary = $10, theme_color_text_secondary = $11,
        theme_color_border = $12, theme_chat_bubble_user_bg = $13, theme_chat_bubble_bot_bg = $14,
        google_reviews_url = $15
      WHERE subdomain = $1;
    `;
    const theme = tenantConfig.theme;
    const tenantValues = [
      tenantConfig.subdomain, tenantConfig.restaurantName, theme.logoUrl, theme.menuHasImages, 
      theme.borderRadiusPx, theme.colors.accent, theme.colors.accentText, theme.colors.pageBackground, 
      theme.colors.surfaceBackground, theme.colors.textPrimary, theme.colors.textSecondary, 
      theme.colors.border, theme.colors.chat.userBubbleBackground, theme.colors.chat.botBubbleBackground,
      tenantConfig.google_reviews_url
    ];
    await client.query(updateTenantQuery, tenantValues);
    console.log(`✅ PASO 1/3: Tabla 'public.tenants' actualizada para '${tenantConfig.restaurantName}'.`);

    const updateMenuQuery = `UPDATE ${schemaName}.menu SET data = $1 WHERE id = 1;`;
    await client.query(updateMenuQuery, [JSON.stringify(tenantConfig.menu)]);
    console.log(`✅ PASO 2/3: Menú actualizado en el schema '${schemaName}'.`);

    const upsertConfigQuery = `
      INSERT INTO ${schemaName}.configurations (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP;
    `;
    await client.query(upsertConfigQuery, ['llm_instructions', tenantConfig.llm.instructions]);
    await client.query(upsertConfigQuery, ['llm_first_message', tenantConfig.llm.firstMessage]);
    await client.query(upsertConfigQuery, ['frontend_welcome_message', JSON.stringify(tenantConfig.chatConfig.welcomeMessage)]);
    await client.query(upsertConfigQuery, ['suggestion_chips_text', JSON.stringify(tenantConfig.chatConfig.suggestionChips)]);
    await client.query(upsertConfigQuery, ['suggestion_chips_count', tenantConfig.chatConfig.suggestionChipsCount.toString()]);
    // Añadido el upsert para la nueva configuración del flujo de bebidas
    if (tenantConfig.initial_drink_prompt) {
      await client.query(upsertConfigQuery, ['initial_drink_prompt', JSON.stringify(tenantConfig.initial_drink_prompt)]);
    }
    console.log(`✅ PASO 3/3: Configuraciones del chat y LLM actualizadas en '${schemaName}'.`);

    await client.query('COMMIT');
    console.log('✅ Transacción completada.');
    console.log(`\n🎉 ¡Actualización finalizada con éxito para '${tenantConfig.restaurantName}'!`);

  } catch (err) {
    console.error('\n❌ ERROR: Ocurrió un fallo durante la actualización. Revirtiendo cambios...');
    console.error(err.stack);
    await client.query('ROLLBACK');
    console.log('🛡️ Transacción revertida. La base de datos está en su estado previo a la ejecución.');
  } finally {
    client.release();
    console.log('🔌 Conexión con la base de datos cerrada.');
  }
})();