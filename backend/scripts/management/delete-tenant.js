const readline = require('readline');
const pool = require('../../db/pool');

// Interfaz para leer la entrada del usuario desde la consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para hacer preguntas y esperar la respuesta de forma asíncrona
const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

// Función principal auto-ejecutable
(async () => {
  // Obtener el subdominio desde los argumentos de la línea de comandos
  const subdomain = process.argv[2];
  if (!subdomain) {
    console.error('❌ ERROR: Debes proporcionar el subdominio del restaurante a eliminar.');
    console.error('   Ejemplo: npm run delete-tenant -- mi-restaurante-antiguo');
    process.exit(1);
  }

  const client = await pool.connect();
  console.log('🔌 Conectado a la base de datos...');

  try {
    // Buscar al inquilino para confirmar que existe y obtener sus datos
    const result = await client.query('SELECT restaurant_name, schema_name FROM public.tenants WHERE subdomain = $1', [subdomain]);
    const tenant = result.rows[0];

    if (!tenant) {
      console.error(`\n⚠️ No se encontró ningún restaurante con el subdominio '${subdomain}'.`);
      return; // Salir limpiamente si no se encuentra
    }

    // Pedir confirmación explícita al usuario
    console.log('\n\n===============================================================');
    console.log('                ⚠️  ADVERTENCIA DE ELIMINACIÓN  ⚠️');
    console.log('===============================================================\n');
    console.log(`Estás a punto de eliminar PERMANENTEMENTE el siguiente restaurante:`);
    console.log(`  -> Nombre:      ${tenant.restaurant_name}`);
    console.log(`  -> Subdominio:  ${subdomain}`);
    console.log(`  -> Esquema DB:  ${tenant.schema_name}`);
    console.log('\nEsto eliminará TODAS sus tablas, conversaciones y configuración.');
    console.log('Esta acción NO SE PUEDE DESHACER.\n');

    const confirmation = await askQuestion(`Escribe "YES" para confirmar la eliminación: `);

    if (confirmation.trim() !== 'YES') {
      console.log('\n❌ Operación cancelada por el usuario.');
      return;
    }

    // Si la confirmación es correcta, proceder con la eliminación
    console.log('\n✅ Confirmación recibida. Iniciando proceso de eliminación...');
    await client.query('BEGIN');

    // Paso 1: Eliminar la fila de la tabla pública de inquilinos
    await client.query('DELETE FROM public.tenants WHERE subdomain = $1', [subdomain]);
    console.log(`  -> Fila eliminada de 'public.tenants' para el subdominio '${subdomain}'.`);

    // Paso 2: Eliminar el esquema completo del inquilino y todo su contenido
    await client.query(`DROP SCHEMA ${tenant.schema_name} CASCADE`);
    console.log(`  -> Esquema '${tenant.schema_name}' y todos sus datos han sido eliminados.`);

    await client.query('COMMIT');
    console.log('\n🔥 ¡Eliminación completada con éxito! 🔥');

  } catch (err) {
    console.error('\n❌ ERROR: Ocurrió un fallo durante la eliminación. Revirtiendo cambios...');
    console.error(err.stack);
    await client.query('ROLLBACK');
    console.log('🛡️ Transacción revertida. La base de datos está segura.');
  } finally {
    rl.close();
    client.release();
    console.log('🔌 Conexión con la base de datos cerrada.');
  }
})();