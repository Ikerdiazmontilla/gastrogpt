// backend/utils/menuTransformer.js

const SUPPORTED_LANGS = ['es', 'en', 'fr', 'de'];
const DEFAULT_LANG = 'es';

/**
 * Translates a field from a multi-language object to a single string.
 * Falls back to English, then Spanish if the target language is not available.
 * @param {object} field - The object containing language keys (e.g., { es: 'Hola', en: 'Hello' }).
 * @param {string} lang - The target language code (e.g., 'fr').
 * @returns {string} The translated string.
 */
function translateField(field, lang) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.en || field.es || '';
}

/**
 * Transforms a dish object into a single-language version.
 * @param {object} dish - The original dish object with multi-language fields.
 * @param {string} lang - The target language code.
 * @returns {object} A new dish object with translated strings.
 */
function transformDish(dish, lang) {
  const newDish = { ...dish };
  newDish.nombre = translateField(dish.nombre, lang);
  // The 'descripcion' field is now used, and 'descripcionCorta' is removed.
  newDish.descripcion = translateField(dish.descripcion, lang);
  return newDish;
}

/**
 * Recursively transforms a full menu object into a single-language version.
 * @param {object} menuData - The original, full menu with all translations.
 * @param {string} targetLang - The desired language for the output menu.
 * @returns {object} A new menu object with all text fields translated to the target language.
 */
function transformMenuForLanguage(menuData, targetLang) {
  // Validate the target language or use the default.
  const lang = SUPPORTED_LANGS.includes(targetLang) ? targetLang : DEFAULT_LANG;

  const transformedMenu = {};

  // Iterate over each category in the menu (e.g., 'bebidas', 'entrantes').
  for (const categoryKey in menuData) {
    if (categoryKey === 'allDishes') continue; // Skip the helper array

    const category = menuData[categoryKey];
    const newCategory = { ...category };

    newCategory.title = translateField(category.title, lang);

    // Transform dishes directly within the category
    if (Array.isArray(category.dishes)) {
      newCategory.dishes = category.dishes.map(dish => transformDish(dish, lang));
    }

    // Transform dishes within subcategories
    if (category.subCategories) {
      newCategory.subCategories = {};
      for (const subCatKey in category.subCategories) {
        const subCat = category.subCategories[subCatKey];
        newCategory.subCategories[subCatKey] = {
          ...subCat,
          title: translateField(subCat.title, lang),
          dishes: Array.isArray(subCat.dishes) ? subCat.dishes.map(dish => transformDish(dish, lang)) : [],
        };
      }
    }
    transformedMenu[categoryKey] = newCategory;
  }

  return transformedMenu;
}

module.exports = { transformMenuForLanguage };