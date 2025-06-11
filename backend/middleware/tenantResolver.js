// backend/middleware/tenantResolver.js

const pool = require('../db/pool');

/**
 * Middleware para resolver el inquilino (tenant) basado en el subdominio de la petición.
 * 
 * 1. Extrae el subdominio del hostname de la petición (ej. 'tenant-demo' de 'tenant-demo.localhost:5000').
 * 2. Busca en la tabla `public.tenants` si existe un inquilino activo con ese subdominio.
 * 3. Si lo encuentra, adjunta la información del inquilino al objeto `req` (`req.tenant`).
 * 4. Si no lo encuentra, o si es un dominio raíz sin subdominio, devuelve un error 404.
 */
async function tenantResolver(req, res, next) {
  // Extraemos el hostname (ej. "tenant-demo.localhost:5000")
  const hostname = req.hostname;
  
  // Dividimos por '.' y tomamos la primera parte. Esto funciona para 'sub.dominio.com' y 'sub.localhost'.
  const subdomain = hostname.split('.')[0];

  // Si no hay un subdominio válido (ej. acceso por IP o 'localhost' a secas), no es una petición de inquilino.
  if (!subdomain || subdomain === 'localhost' || subdomain === 'www') {
    return res.status(404).json({ error: 'Restaurante no especificado o no encontrado.' });
  }

  try {
    // Consultamos la tabla maestra de inquilinos en el schema 'public'.
    const result = await pool.query(
      'SELECT id, subdomain, schema_name, restaurant_name, is_active FROM public.tenants WHERE subdomain = $1',
      [subdomain]
    );

    const tenant = result.rows[0];

    // Verificamos si el inquilino existe y está activo.
    if (!tenant || !tenant.is_active) {
      return res.status(404).json({ error: 'Restaurante no encontrado o inactivo.' });
    }

    // Adjuntamos la información del inquilino al objeto de la petición para uso posterior.
    req.tenant = tenant;
    console.log(`Petición para el inquilino: ${tenant.restaurant_name} (schema: ${tenant.schema_name})`);
    
    // Pasamos al siguiente middleware.
    next();
  } catch (error) {
    console.error('Error en el middleware tenantResolver:', error);
    res.status(500).json({ error: 'Error interno del servidor al resolver el inquilino.' });
  }
}

module.exports = tenantResolver;