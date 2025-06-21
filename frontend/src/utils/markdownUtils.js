// frontend/src/utils/markdownUtils.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../context/TenantContext';
// La importación de useOrder ha sido eliminada
import { findDishById } from './menuUtils';
import DishPreviewLink from '../components/Dish/DishPreviewLink';

// Crea un componente de enlace personalizado para ReactMarkdown
export const createMarkdownLinkRenderer = (onViewDishDetailsCallback) => {
  const CustomLinkComponent = (props) => {
    const { href, children, node, ...rest } = props;
    const { tenantConfig } = useTenant();
    // Las variables relacionadas con el pedido han sido eliminadas
    const { i18n } = useTranslation();

    const menu = tenantConfig?.menu;
    const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;
    const currentLanguage = i18n.language;

    // Si el href comienza con 'dish:', es un enlace interno a un plato
    if (href && href.startsWith('dish:')) {
      const dishIdString = href.split(':')[1]; // Extrae el ID del plato
      const dishId = parseInt(dishIdString, 10);
      const dish = menu?.allDishes ? findDishById(dishId, menu.allDishes) : null;

      if (dish) {
        // Renderiza un DishPreviewLink para el plato
        return (
          <DishPreviewLink
            dish={dish}
            onViewDetails={() => {
              if (onViewDishDetailsCallback) {
                onViewDishDetailsCallback(dish); // Llama al callback para abrir el modal del plato
              }
            }}
            currentLanguage={currentLanguage}
            menuHasImages={menuHasImages}
            // Las props relacionadas con el pedido han sido eliminadas
            {...rest}
          />
        );
      } else {
        console.warn(`MarkdownUtils: Dish with ID '${dishIdString}' not found.`);
        return null; // No renderiza nada si el plato no se encuentra
      }
    }

    // Si es una URL externa, renderiza un enlace HTML estándar
    if (href) {
      try {
        const url = new URL(href);
        if (url.protocol === "http:" || url.protocol === "https:") {
          return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
        }
      } catch (e) {
        // No es una URL válida, se trata como texto
      }
    }

    // Si no es un enlace de plato ni una URL válida, renderiza solo el contenido (texto)
    return <span {...rest}>{children}</span>;
  };

  return CustomLinkComponent;
};

// Función para transformar URLs en Markdown
// Solo permite URLs HTTP/HTTPS y los enlaces 'dish:'
export const markdownUrlTransform = (uri) => {
  if (uri.startsWith('dish:')) {
    return uri; // Permite enlaces internos de platos
  }
  try {
    const parsedUrl = new URL(uri);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return uri; // Permite URLs estándar
    }
  } catch (e) {
    // No es una URL estándar o tiene un esquema no permitido.
  }
  return null; // Bloquea otros tipos de enlaces
};