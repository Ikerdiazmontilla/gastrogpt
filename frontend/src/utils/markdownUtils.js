// frontend/src/utils/markdownUtils.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../context/TenantContext';
import { useOrder } from '../context/OrderContext';
import { findDishById } from './menuUtils';
import DishPreviewLink from '../components/Dish/DishPreviewLink';

export const createMarkdownLinkRenderer = (onViewDishDetailsCallback) => {
  const CustomLinkComponent = (props) => {
    const { href, children, node, ...rest } = props;
    const { tenantConfig } = useTenant();
    const { isOrderingFeatureEnabled, selectedDishes, toggleDishSelection } = useOrder();
    const { i18n } = useTranslation();

    const menu = tenantConfig?.menu;
    const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;
    const currentLanguage = i18n.language;

    if (href && href.startsWith('dish:')) {
      const dishIdString = href.split(':')[1];
      const dishId = parseInt(dishIdString, 10);
      const dish = menu?.allDishes ? findDishById(dishId, menu.allDishes) : null;

      if (dish) {
        const isSelected = selectedDishes.has(dish.id);

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
            isSelected={isSelected}
            onToggleSelect={toggleDishSelection}
            isOrderingFeatureEnabled={isOrderingFeatureEnabled}
            {...rest}
          />
        );
      } else {
        console.warn(`MarkdownUtils: Dish with ID '${dishIdString}' not found.`);
        return null;
      }
    }

    if (href) {
      try {
        const url = new URL(href);
        if (url.protocol === "http:" || url.protocol === "https:") {
          return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
        }
      } catch (e) {
        // Not a valid URL
      }
    }

    return <span {...rest}>{children}</span>;
  };

  return CustomLinkComponent;
};

export const markdownUrlTransform = (uri) => {
  if (uri.startsWith('dish:')) {
    return uri;
  }
  try {
    const parsedUrl = new URL(uri);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return uri;
    }
  } catch (e) {
    // Not a standard URL or has a disallowed scheme.
  }
  return null;
};