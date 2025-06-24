// src/utils/menuUtils.js
import { alergenosDetails, etiquetasDetails } from '../data/menuDefinitions.js';

/**
 * CORRECTED: Gets translated text for a dish property (name, description).
 * It now correctly checks for the selected language before falling back.
 * @param {object|string} dishProperty - The property object (e.g., { es: "Hola", en: "Hello", fr: "Bonjour" }).
 * @param {string} lang - The current language code ('es', 'en', 'fr', 'de').
 * @returns {string} The translated text.
 */
export const getTranslatedDishText = (dishProperty, lang) => {
  if (typeof dishProperty === 'object' && dishProperty !== null) {
    // 1. Try the specific language first (e.g., 'fr').
    if (dishProperty[lang]) {
      return dishProperty[lang];
    }
    // 2. If the specific language is not found, fall back to English.
    if (dishProperty.en) {
      return dishProperty.en;
    }
    // 3. If English is also not found, fall back to Spanish.
    if (dishProperty.es) {
      return dishProperty.es;
    }
    // 4. If nothing is found, return an empty string.
    return '';
  }
  // If the property is already a simple string, return it as is.
  return String(dishProperty || '');
};

/**
 * Gets the icon for a given alergeno key.
 * @param {string} alergenoKey - The key of the alergeno (e.g., "gluten").
 * @returns {string} The emoji icon.
 */
export const getAlergenoIcon = (alergenoKey) => {
  const details = alergenosDetails[alergenoKey];
  return (details && details.icon) ? details.icon : alergenosDetails.default.icon;
};

/**
 * CORRECTED: Gets the translated name for a given alergeno key.
 * @param {string} alergenoKey - The key of the alergeno.
 * @param {string} lang - The current language code.
 * @returns {string} The translated name.
 */
export const getAlergenoNombre = (alergenoKey, lang = 'es') => {
  const details = alergenosDetails[alergenoKey];
  if (!details) {
    return alergenoKey.charAt(0).toUpperCase() + alergenoKey.slice(1);
  }
  // CORRECCIÓN: Usar 'nombre' para español y 'nombre_xx' para otros idiomas.
    const langKey = lang === 'es' ? 'nombre' : `nombre_${lang}`;
  
  // Fallback: idioma específico -> español ('nombre') -> inglés ('nombre_en') -> clave original
   return details[langKey] || details.nombre || details.nombre_en || alergenoKey;
};

/**
 * CORRECTED: Gets UI data (label, icon) for a given etiqueta key.
 * @param {string} etiquetaKey - The key of the etiqueta.
 * @param {string} lang - The current language code.
 * @returns {object} An object with { label, icon }.
 */
export const getEtiquetaUIData = (etiquetaKey, lang = 'es') => {
  const detail = etiquetasDetails[etiquetaKey];
  if (!detail) return { label: etiquetaKey, icon: null };

  // Use the same robust fallback logic
  const key_lang = `label_${lang}`; // e.g., 'label_fr'
  const label = detail[key_lang] || detail.label_en || detail.label || etiquetaKey;
  
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