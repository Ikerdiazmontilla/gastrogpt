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
    // Si no hay tema, no hacemos nada. Los valores por defecto de App.css se usarán.
    if (!theme) return;

    // Seleccionamos el elemento raíz del DOM (la etiqueta <html>).
    const root = document.documentElement;

    // Mapeo directo de la nueva estructura de theme a las variables CSS.
    // Se comprueba la existencia de cada valor antes de aplicarlo.
    const colors = theme.colors;
    if (colors) {
        if (colors.accent) root.style.setProperty('--color-accent', colors.accent);
        if (colors.accentText) root.style.setProperty('--color-accent-text', colors.accentText);
        if (colors.pageBackground) root.style.setProperty('--color-page-background', colors.pageBackground);
        if (colors.surfaceBackground) root.style.setProperty('--color-surface-background', colors.surfaceBackground);
        if (colors.textPrimary) root.style.setProperty('--color-text-primary', colors.textPrimary);
        if (colors.textSecondary) root.style.setProperty('--color-text-secondary', colors.textSecondary);
        if (colors.border) root.style.setProperty('--color-border', colors.border);
        
        // Colores del chat anidados
        if (colors.chat) {
            if (colors.chat.userBubbleBackground) root.style.setProperty('--chat-bubble-user-background', colors.chat.userBubbleBackground);
            if (colors.chat.botBubbleBackground) root.style.setProperty('--chat-bubble-bot-background', colors.chat.botBubbleBackground);
        }
    }

    if (theme.borderRadius) {
      root.style.setProperty('--border-radius', theme.borderRadius);
    }

  }, [theme]); // Se vuelve a ejecutar si el objeto 'theme' cambia.

  // Este componente no renderiza nada en la pantalla.
  return null;
};

export default ThemeApplicator;