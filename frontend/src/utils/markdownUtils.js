import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../context/TenantContext';
import { findDishById } from './menuUtils';
import DishPreviewLink from '../components/Dish/DishPreviewLink'; // Import the new component

/**
 * Creates a renderer for `react-markdown` that transforms `dish:ID` links
 * into a rich, clickable preview component.
 * @param {function} onViewDishDetailsCallback - The function to call when a dish preview is clicked.
 * @returns {React.Component} A component for `react-markdown`'s `components` prop.
 */
export const createMarkdownLinkRenderer = (onViewDishDetailsCallback) => {
  // This is a valid React component that can use hooks because it's what `react-markdown` will render.
  const CustomLinkComponent = (props) => {
    const { href, children, node, ...rest } = props;
    const { tenantConfig } = useTenant();
    const { i18n } = useTranslation();

    // Safely access tenant data
    const menu = tenantConfig?.menu;
    const menuHasImages = tenantConfig?.theme?.menuHasImages ?? true;
    const currentLanguage = i18n.language;

    // Handle `dish:` protocol links
    if (href && href.startsWith('dish:')) {
      const dishIdString = href.split(':')[1];
      const dish = menu?.allDishes ? findDishById(dishIdString, menu.allDishes) : null;

      if (dish) {
        // Render the rich preview component
        return (
          <DishPreviewLink
            dish={dish}
            onClick={() => {
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
        // As per spec, if dish ID is invalid, render nothing.
        console.warn(`MarkdownUtils: Dish with ID '${dishIdString}' not found.`);
        return null;
      }
    }

    // Handle standard http/https links
    if (href) {
      try {
        const url = new URL(href);
        if (url.protocol === "http:" || url.protocol === "https:") {
          return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
        }
      } catch (e) {
        // Not a valid URL, will be rendered as text.
      }
    }

    // Fallback for any other case (render as plain text)
    return <span {...rest}>{children}</span>;
  };

  return CustomLinkComponent;
};

/**
 * URL transform function for ReactMarkdown.
 * Allows 'dish:' protocol and standard HTTP/HTTPS.
 * @param {string} uri - The URI from the markdown link.
 * @returns {string|null} The transformed URI if allowed, or null to disallow.
 */
export const markdownUrlTransform = (uri) => {
  if (uri.startsWith('dish:')) {
    return uri; // Allow 'dish:' protocol
  }
  try {
    const parsedUrl = new URL(uri);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return uri;
    }
  } catch (e) {
    // Not a standard URL or has a disallowed scheme.
  }
  return null; // Reject other schemes (ReactMarkdown will render it as text)
};