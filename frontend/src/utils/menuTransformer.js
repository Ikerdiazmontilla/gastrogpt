// frontend/src/utils/menuTransformer.js
const SUPPORTED_LANGS = ['es', 'en', 'fr', 'de'];
const DEFAULT_LANG = 'es';

/**
 * Traduce un campo de un objeto multi-idioma a una sola cadena.
 * Si el idioma no está, usa inglés y luego español como respaldo.
 * @param {object} field - El objeto con claves de idioma (ej. { es: 'Hola', en: 'Hello' }).
 * @param {string} lang - El idioma deseado (ej. 'fr').
 * @returns {string} La cadena traducida.
 */
function translateField(field, lang) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.en || field.es || '';
}

/**
 * Transforma un objeto de plato a una versión en un solo idioma.
 * @param {object} dish - El plato original con campos multi-idioma.
 * @param {string} lang - El idioma deseado.
 * @returns {object} Un nuevo objeto de plato con cadenas traducidas.
 */
function transformDish(dish, lang) {
  // Clona el plato para no modificar el original
  const newDish = { ...dish }; 
  // Traduce los campos de texto
  newDish.nombre = translateField(dish.nombre, lang);
  // The 'descripcion' field is now used, and 'descripcionCorta' is removed.
  newDish.descripcion = translateField(dish.descripcion, lang);
  return newDish;
}

/**
 * Transforma recursivamente un menú completo a una versión en un solo idioma.
 * @param {object} menuData - El menú original completo con todas las traducciones.
 * @param {string} targetLang - El idioma deseado para el menú de salida.
 * @returns {object} Un nuevo objeto de menú con todos los campos de texto traducidos.
 */
export function transformMenuForLanguage(menuData, targetLang) {
  // Valida el idioma o usa el por defecto
  const lang = SUPPORTED_LANGS.includes(targetLang) ? targetLang : DEFAULT_LANG;

  const transformedMenu = {};

  // Itera sobre cada categoría del menú (ej. 'bebidas', 'entrantes')
  for (const categoryKey in menuData) {
    if (categoryKey === 'allDishes') continue; // Salta el array de ayuda

    const category = menuData[categoryKey];
    const newCategory = { ...category };

    newCategory.title = translateField(category.title, lang);

    // Transforma los platos directamente dentro de la categoría
    if (Array.isArray(category.dishes)) {
      newCategory.dishes = category.dishes.map(dish => transformDish(dish, lang));
    }

    // Transforma los platos dentro de las subcategorías
    if (category.subCategories) {
      newCategory.subCategories = {};
      for (const subCatKey in category.subCategories) {
        const subCat = category.subCategories[subCatKey];
        // Crea una nueva subcategoría con título y platos traducidos
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