// src/utils/menuUtils.js
import { alergenosDetails, etiquetasDetails } from '../data/menuDefinitions.js';

/**
 * Gets translated text for a dish property (name, description).
 * @param {object|string} dishProperty - The property object (e.g., { es: "Hola", en: "Hello" }).
 * @param {string} lang - The current language code ('es', 'en', 'fr', 'de').
 * @returns {string} The translated text.
 */
export const getTranslatedDishText = (dishProperty, lang) => {
  if (typeof dishProperty === 'object' && dishProperty !== null) {
    if (lang === 'es') {
      return dishProperty.es || dishProperty.en || '';
    } else {
      return dishProperty.en || dishProperty.es || '';
    }
  }
  return String(dishProperty || '');
};

/**
 * Gets the icon for a given alergeno key.
 * REFACTORIZADO: Devuelve el icono por defecto si no encuentra uno específico.
 * @param {string} alergenoKey - The key of the alergeno (e.g., "gluten").
 * @returns {string} The emoji icon.
 */
export const getAlergenoIcon = (alergenoKey) => {
  const details = alergenosDetails[alergenoKey];
  // Si el alérgeno está definido y tiene icono, lo usamos. Si no, usamos el icono por defecto.
  return (details && details.icon) ? details.icon : alergenosDetails.default.icon;
};

/**
 * Gets the translated name for a given alergeno key.
 * Si el alérgeno no está definido, devuelve el propio `alergenoKey`.
 * @param {string} alergenoKey - The key of the alergeno.
 * @param {string} lang - The current language code.
 * @returns {string} The translated name.
 */
export const getAlergenoNombre = (alergenoKey, lang = 'es') => {
  const details = alergenosDetails[alergenoKey];
  if (!details) {
    return alergenoKey.charAt(0).toUpperCase() + alergenoKey.slice(1);
  }

  if (lang === 'es') {
    return details.nombre || details.nombre_en || alergenoKey;
  }
  return details.nombre_en || details.nombre || alergenoKey;
};

/**
 * Gets UI data (label, icon) for a given etiqueta key.
 * @param {string} etiquetaKey - The key of the etiqueta.
 * @param {string} lang - The current language code.
 * @returns {object} An object with { label, icon }.
 */
export const getEtiquetaUIData = (etiquetaKey, lang = 'es') => {
  const detail = etiquetasDetails[etiquetaKey];
  if (!detail) return { label: etiquetaKey, icon: null };

  let label;
  if (lang === 'es') {
    label = detail.label || detail.label_en || etiquetaKey;
  } else {
    label = detail.label_en || detail.label || etiquetaKey;
  }
  
  return {
    label: label,
    icon: detail.icon || null
  };
};

/**
 * Gets the CSS class name for an etiqueta, for styling pills.
 */
export const getEtiquetaClass = (etiquetaKey, styles = {}) => {
  switch (etiquetaKey) {
    case "popular":
      return styles.tagPopularPill || '';
    case "recomendado":
      return styles.tagRecomendadoPill || '';
    case "vegano":
      return styles.tagVeganoPill || '';
    case "vegetariano":
      return styles.tagVegetarianoPill || '';
    case "sin_gluten":
      return styles.tagSinGlutenPill || '';
    case "picante":
      return styles.tagPicanteSuavePill || '';
    default:
      return styles.tagDefaultPill || '';
  }
};

/**
 * Finds a dish by its ID within a provided array of dishes.
 */
export const findDishById = (id, allDishes) => {
  if (id === undefined || id === null || !allDishes || allDishes.length === 0) return null;
  
  const dishId = parseInt(String(id), 10);
  if (isNaN(dishId)) return null;
  
  return allDishes.find(plato => plato.id === dishId) || null;
};