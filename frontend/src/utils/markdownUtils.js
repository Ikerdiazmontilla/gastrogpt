// frontend/src/utils/markdownUtils.js
import React from 'react';
import { useTenant } from '../context/TenantContext';
import { findDishById } from './menuUtils';
import DishPreviewLink from '../components/Dish/DishPreviewLink';
import CategoryPreviewLink from '../components/Category/CategoryPreviewLink';

// Expresión regular para detectar un emoji al inicio de una cadena.
const EMOJI_REGEX = /^(\p{Emoji})\s*/u;
const DEFAULT_EMOJI = '🍽️';

export const createMarkdownLinkRenderer = (onViewDishDetailsCallback, onCategoryClickCallback) => {
  const CustomLinkComponent = (props) => {
    const { href, children, node } = props;
    const { tenantConfig } = useTenant();

    const menu = tenantConfig?.menu;
    const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;

    // Lógica para platos
    if (href && href.startsWith('dish:')) {
      const dishIdString = href.split(':')[1];
      const dishId = parseInt(dishIdString, 10);
      const dish = menu?.allDishes ? findDishById(dishId, menu.allDishes) : null;

      if (dish) {
        // Extraer el texto completo del enlace generado por el LLM.
        const linkText = node?.children?.[0]?.value || '';
        const emojiMatch = linkText.match(EMOJI_REGEX);
        
        // Determinar el emoji y el nombre limpio del plato.
        const emoji = emojiMatch ? emojiMatch[1] : DEFAULT_EMOJI;
        const cleanDishName = emojiMatch ? linkText.replace(EMOJI_REGEX, '') : linkText;

        return (
          <DishPreviewLink
            dish={dish}
            emoji={emoji}
            cleanDishName={cleanDishName}
            onViewDetails={() => {
              if (onViewDishDetailsCallback) {
                onViewDishDetailsCallback(dish);
              }
            }}
            menuHasImages={menuHasImages}
          />
        );
      } else {
        console.warn(`MarkdownUtils: Dish with ID '${dishIdString}' not found.`);
        return null;
      }
    }

    // Lógica para categorías flexibles
    if (href === 'category') {
      const fullText = node?.children?.[0]?.value || '';
      
      if (fullText.trim() !== '') {
        const match = fullText.match(EMOJI_REGEX);
        let emoji;
        let categoryName;

        if (match) {
          emoji = match[1];
          categoryName = fullText.substring(emoji.length).trim();
        } else {
          emoji = '🏷️';
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
          />
        );
      }
      return null;
    }

    // Lógica para enlaces externos
    if (href) {
      try {
        const url = new URL(href);
        if (url.protocol === "http:" || url.protocol === "https:") {
          return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
        }
      } catch (e) {
        // No es una URL válida
      }
    }

    return <span>{children}</span>;
  };

  return CustomLinkComponent;
};

// Esta función se mantiene sin cambios.
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