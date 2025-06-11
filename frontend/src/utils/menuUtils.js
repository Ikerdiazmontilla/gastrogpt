// src/utils/menuUtils.js
import { alergenosDetails, etiquetasDetails } from '../data/translations';

/**
 * Gets translated text for a dish property (name, description).
 * @param {object|string} dishProperty - The property object (e.g., { es: "Hola", en: "Hello" }) or a string.
 * @param {string} lang - The current language ('Español' or 'English').
 * @returns {string} The translated text.
 */
export const getTranslatedDishText = (dishProperty, lang) => {
  if (typeof dishProperty === 'object' && dishProperty !== null) {
    const langKey = lang === 'English' ? 'en' : 'es';
    return dishProperty[langKey] || dishProperty['es']; // Fallback to Spanish
  }
  return String(dishProperty); // Ensure it's a string if not an object
};

/**
 * Gets the icon for a given alergeno key.
 * @param {string} alergenoKey - The key of the alergeno (e.g., "gluten").
 * @returns {string} The emoji icon.
 */
export const getAlergenoIcon = (alergenoKey) => {
  return alergenosDetails[alergenoKey]?.icon || alergenosDetails.default.icon;
};

/**
 * Gets the translated name for a given alergeno key.
 * @param {string} alergenoKey - The key of the alergeno.
 * @param {string} lang - The current language ('Español' or 'English').
 * @returns {string} The translated name.
 */
export const getAlergenoNombre = (alergenoKey, lang = 'Español') => {
  const details = alergenosDetails[alergenoKey] || alergenosDetails.default;
  const langKey = lang === 'English' ? 'nombre_en' : 'nombre';
  return details[langKey] || details.nombre; // Fallback to Spanish name
};

/**
 * Gets UI data (label, icon) for a given etiqueta key.
 * @param {string} etiquetaKey - The key of the etiqueta.
 * @param {string} lang - The current language ('Español' or 'English').
 * @returns {object} An object with { label, icon }.
 */
export const getEtiquetaUIData = (etiquetaKey, lang = 'Español') => {
  const detail = etiquetasDetails[etiquetaKey];
  if (!detail) return { label: etiquetaKey, icon: null };

  const langKey = lang === 'English' ? 'label_en' : 'label';
  return {
    label: detail[langKey] || detail.label,
    icon: detail.icon || null
  };
};

/**
 * Gets the CSS class name for an etiqueta, for styling pills.
 * @param {string} etiquetaKey - The key of the etiqueta.
 * @param {object} styles - The CSS module styles object (passed from the component).
 * @returns {string} The CSS class name.
 */
export const getEtiquetaClass = (etiquetaKey, styles = {}) => {
  // This function is primarily for the pill-style tags in the modal.
  // It requires the component's 'styles' object to correctly map to CSS module class names.
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
    case "picante_suave":
      return styles.tagPicanteSuavePill || '';
    default:
      return styles.tagDefaultPill || '';
  }
};


/**
 * MODIFICADO: Encuentra un plato por su ID dentro de un array de platos proporcionado.
 * @param {string|number} id - El ID del plato.
 * @param {Array<object>} allDishes - El array plano de todos los platos del menú del inquilino.
 * @returns {object|null} El objeto del plato o null si no se encuentra.
 */
export const findDishById = (id, allDishes) => {
  if (id === undefined || id === null || !allDishes || allDishes.length === 0) return null;
  
  const dishId = parseInt(String(id), 10);
  if (isNaN(dishId)) return null;
  
  return allDishes.find(plato => plato.id === dishId) || null;
};