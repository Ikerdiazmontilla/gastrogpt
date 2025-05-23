// src/utils/markdownUtils.js
import React from 'react';
import { findDishById } from './menuUtils'; // Use the centralized findDishById

/**
 * Creates a custom link renderer component for ReactMarkdown.
 * Handles 'dish:ID' links by creating a button that triggers onViewDishDetails.
 * Standard HTTP/HTTPS links are rendered as regular anchor tags.
 *
 * @param {function} onViewDishDetailsCallback - Callback function (dishObject) => void.
 * @param {object} componentStyles - CSS module styles for the dishLink class.
 * @returns {React.Component} A component suitable for ReactMarkdown's `components.a`.
 */
export const createMarkdownLinkRenderer = (onViewDishDetailsCallback, componentStyles = {}) => {
  const CustomLinkComponent = (props) => {
    const { href, children, node, ...rest } = props;

    if (href && href.startsWith('dish:')) {
      const dishIdString = href.split(':')[1];
      const dish = findDishById(dishIdString); // Use utility function

      if (dish) {
        return (
          <button
            className={componentStyles.dishLink || ''} // Safely access dishLink
            onClick={() => {
              if (onViewDishDetailsCallback) {
                onViewDishDetailsCallback(dish);
              } else {
                console.error("onViewDishDetailsCallback not provided to CustomLinkComponent for dish:", dishIdString);
              }
            }}
            {...rest}
          >
            {children}
          </button>
        );
      } else {
        // Dish not found, render as text with a warning
        console.warn(`MarkdownUtils: Dish with ID '${dishIdString}' not found. Markdown: [${String(children)}](${href})`);
        return <span {...rest}>{children} (detalle no disponible)</span>; // Or just {children}
      }
    }

    // For standard external links (http, https)
    if (href) {
      try {
        // Validate if it's a proper URL before rendering an <a> tag
        // This prevents rendering invalid hrefs.
        const url = new URL(href);
        if (url.protocol === "http:" || url.protocol === "https:") {
          return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
        }
      } catch (e) {
        // Not a valid URL, or not http/https, render as plain text or span
        // console.warn(`MarkdownUtils: Invalid or non-HTTP/HTTPS href: ${href}. Rendering as text.`);
      }
    }

    // Fallback for non-dish, non-standard-HTTP links, or if href is missing
    return <span {...rest}>{children}</span>;
  };
  return CustomLinkComponent;
};

/**
 * URL transform function for ReactMarkdown.
 * Allows 'dish:' protocol. Validates and allows standard HTTP/HTTPS URLs.
 * Other URI schemes will result in the link being rendered as text by ReactMarkdown.
 *
 * @param {string} uri - The URI from the markdown link.
 * @returns {string|null} The transformed URI if allowed, or null to disallow.
 */
export const markdownUrlTransform = (uri) => {
  if (uri.startsWith('dish:')) {
    return uri; // Allow 'dish:' protocol
  }
  try {
    const parsedUrl = new URL(uri);
    // Allow only http and https protocols for standard links
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return uri;
    }
  } catch (e) {
    // Not a standard absolute URL, or invalid scheme
    // console.warn(`MarkdownUtils: URI '${uri}' is not a valid http/https URL or dish: link. Will be rendered as text.`);
  }
  return null; // Disallow other URI schemes (ReactMarkdown will render as text)
};