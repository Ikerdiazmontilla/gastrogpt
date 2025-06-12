// frontend/src/components/Theme/ThemeApplicator.js

import { useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';

/**
 * Componente sin UI que aplica el tema del inquilino como variables CSS globales.
 * Se ejecuta una vez al cargar la app y cada vez que el tema cambia.
 */
const ThemeApplicator = () => {
  const { tenantConfig } = useTenant();
  const theme = tenantConfig?.theme;

  useEffect(() => {
    // Seleccionamos el elemento raíz del DOM (la etiqueta <html>).
    const root = document.documentElement;

    // Aplicamos los valores recibidos desde la API.
    // Si algún valor no está definido en la BBDD para el inquilino,
    // se usa un valor por defecto (fallback) para evitar que la UI se rompa.
    root.style.setProperty('--border-radius-global', theme?.borderRadius || '8px');
    root.style.setProperty('--primary-color', theme?.colors?.primary || '#0071E3');
    root.style.setProperty('--background-color', theme?.colors?.background || '#FAFAFC');
    root.style.setProperty('--text-default-color', theme?.colors?.textDefault || '#333333');
    root.style.setProperty('--card-background-color', theme?.colors?.cardBackground || '#FFFFFF');
    
  }, [theme]); // Se vuelve a ejecutar si el objeto 'theme' cambia.

  // Este componente no renderiza nada en la pantalla.
  return null;
};

export default ThemeApplicator;