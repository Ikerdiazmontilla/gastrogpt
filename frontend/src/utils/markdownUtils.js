// frontend/src/utils/markdownUtils.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../context/TenantContext';
import { findDishById } from './menuUtils';
import DishPreviewLink from '../components/Dish/DishPreviewLink';
import CategoryPreviewLink from '../components/Category/CategoryPreviewLink';

export const createMarkdownLinkRenderer = (onViewDishDetailsCallback, onCategoryClickCallback) => {
  const CustomLinkComponent = (props) => {
    // La prop `node` es la clave para acceder al texto crudo del enlace.
    const { href, children, node, ...rest } = props;
    const { tenantConfig } = useTenant();
    const { i18n } = useTranslation();

    const menu = tenantConfig?.menu;
    const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;
    const currentLanguage = i18n.language;

    // Lógica para platos (sin cambios)
    if (href && href.startsWith('dish:')) {
      const dishIdString = href.split(':')[1];
      const dishId = parseInt(dishIdString, 10);
      const dish = menu?.allDishes ? findDishById(dishId, menu.allDishes) : null;

      if (dish) {
        return (
          <DishPreviewLink
            dish={dish}
            onViewDetails={() => {
              if (onViewDishDetailsCallback) {
                onViewDishDetailsCallback(dish);
              }
            }}
            currentLanguage={currentLanguage}
            menuHasImages={menuHasImages}
            {...rest}
          />
        );
      } else {
        console.warn(`MarkdownUtils: Dish with ID '${dishIdString}' not found.`);
        return null;
      }
    }

    // Lógica para categorías flexibles
    if (href === 'category') {
      // --- LA CORRECCIÓN ESTÁ AQUÍ ---
      // Usamos `node.children[0].value` para obtener el texto original del enlace.
      const fullText = node?.children?.[0]?.value || '';
      
      if (fullText.trim() !== '') {
        const defaultEmoji = '🏷️';
        const emojiRegex = /^(\p{Emoji})/u;
        const match = fullText.match(emojiRegex);

        let emoji;
        let categoryName;

        if (match) {
          emoji = match[1];
          categoryName = fullText.substring(emoji.length).trim();
        } else {
          emoji = defaultEmoji;
          categoryName = fullText.trim();
        }
        
        return (
          <CategoryPreviewLink
            emoji={emoji}
            categoryName={categoryName}
            onClick={() => {
              if (onCategoryClickCallback) {
                onCategoryClickCallback(categoryName);
              }
            }}
            {...rest}
          />
        );
      }
      return null;
    }


    // Lógica para enlaces externos (sin cambios)
    if (href) {
      try {
        const url = new URL(href);
        if (url.protocol === "http:" || url.protocol === "https:") {
          return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
        }
      } catch (e) {
        // No es una URL válida
      }
    }

    return <span {...rest}>{children}</span>;
  };

  return CustomLinkComponent;
};

// Esta función ya estaba correcta, se mantiene sin cambios.
export const markdownUrlTransform = (uri) => {
  if (uri.startsWith('dish:') || uri === 'category') {
    return uri;
  }
  try {
    const parsedUrl = new URL(uri);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return uri;
    }
  } catch (e) {
    // No es una URL estándar
  }
  return null;
};