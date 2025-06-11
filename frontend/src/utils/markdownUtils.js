// src/utils/markdownUtils.js
import React from 'react';
import { findDishById } from './menuUtils';

/**
 * MODIFICADO: Crea un renderer de enlaces personalizado.
 * @param {function} onViewDishDetailsCallback - Callback para mostrar el modal.
 * @param {object} menu - El objeto de menú completo del inquilino (que contiene `allDishes`).
 * @param {object} componentStyles - Estilos CSS del módulo.
 * @returns {React.Component} El componente para ReactMarkdown.
 */
export const createMarkdownLinkRenderer = (onViewDishDetailsCallback, menu, componentStyles = {}) => {
  const CustomLinkComponent = (props) => {
    const { href, children, node, ...rest } = props;

    if (href && href.startsWith('dish:')) {
      const dishIdString = href.split(':')[1];
      // Usamos el menú pasado como argumento para encontrar el plato.
      const dish = menu && menu.allDishes ? findDishById(dishIdString, menu.allDishes) : null;

      if (dish) {
        return (
          <button
            className={componentStyles.dishLink || ''}
            onClick={() => {
              if (onViewDishDetailsCallback) {
                onViewDishDetailsCallback(dish);
              } else {
                console.error("onViewDishDetailsCallback no proporcionado para dish:", dishIdString);
              }
            }}
            {...rest}
          >
            {children}
          </button>
        );
      } else {
        console.warn(`MarkdownUtils: Plato con ID '${dishIdString}' no encontrado.`);
        return <span {...rest}>{children} (detalle no disponible)</span>;
      }
    }

    // Para enlaces estándar (http, https)
    if (href) {
      try {
        const url = new URL(href);
        if (url.protocol === "http:" || url.protocol === "https:") {
          return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
        }
      } catch (e) {
        // No es una URL válida, se renderizará como texto.
      }
    }

    // Fallback para cualquier otro caso.
    return <span {...rest}>{children}</span>;
  };
  return CustomLinkComponent;
};

/**
 * URL transform function for ReactMarkdown.
 * Permite el protocolo 'dish:' y los estándar HTTP/HTTPS.
 * @param {string} uri - The URI from the markdown link.
 * @returns {string|null} The transformed URI if allowed, or null to disallow.
 */
export const markdownUrlTransform = (uri) => {
  if (uri.startsWith('dish:')) {
    return uri; // Permitir protocolo 'dish:'
  }
  try {
    const parsedUrl = new URL(uri);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return uri;
    }
  } catch (e) {
    // No es una URL estándar o tiene un esquema no permitido.
  }
  return null; // Rechazar otros esquemas (ReactMarkdown lo renderizará como texto)
};