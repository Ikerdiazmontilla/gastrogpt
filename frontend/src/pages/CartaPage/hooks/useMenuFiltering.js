// frontend/src/pages/CartaPage/hooks/useMenuFiltering.js
import { useMemo } from 'react';
import { getTranslatedDishText } from '../../../utils/menuUtils';

/**
 * Función recursiva para procesar subcategorías anidadas.
 * "Aplana" la estructura para que la vista solo reciba una lista de subcategorías finales.
 * @param {object} subCategoriesNode - El objeto que contiene las subcategorías a procesar.
 * @param {Set<number>} filteredDishIds - El Set con los IDs de los platos que pasan el filtro de búsqueda.
 * @param {string} currentLanguage - El idioma actual.
 * @returns {Array} - Un array "plano" de grupos de subcategorías que contienen platos.
 */
const processSubCategoriesRecursively = (subCategoriesNode, filteredDishIds, currentLanguage) => {
  let finalSubCategoryGroups = [];

  // Ordena las claves de la subcategoría por su `orderId`.
  const sortedSubCatKeys = Object.keys(subCategoriesNode).sort(
    (a, b) => (subCategoriesNode[a].orderId || 99) - (subCategoriesNode[b].orderId || 99)
  );

  for (const subCatKey of sortedSubCatKeys) {
    const subCatData = subCategoriesNode[subCatKey];

    // Si esta subcategoría a su vez tiene más subcategorías dentro, llamamos de nuevo a la función.
    if (subCatData.subCategories && Object.keys(subCatData.subCategories).length > 0) {
      const nestedGroups = processSubCategoriesRecursively(
        subCatData.subCategories,
        filteredDishIds,
        currentLanguage
      );
      // Añadimos los resultados de la llamada recursiva a nuestra lista final.
      finalSubCategoryGroups = finalSubCategoryGroups.concat(nestedGroups);
    } 
    // Si es una subcategoría final que contiene platos.
    else if (subCatData.dishes && subCatData.dishes.length > 0) {
      const filteredSubCatDishes = subCatData.dishes.filter(dish =>
        filteredDishIds.has(dish.id)
      );

      // Solo añadimos el grupo si, después de filtrar, todavía tiene platos.
      if (filteredSubCatDishes.length > 0) {
        finalSubCategoryGroups.push({
          key: subCatKey,
          title: getTranslatedDishText(subCatData.title, currentLanguage),
          orderId: subCatData.orderId,
          dishes: filteredSubCatDishes,
        });
      }
    }
  }
  return finalSubCategoryGroups;
};


/**
 * Hook para filtrar y estructurar las secciones del menú, preservando las subcategorías.
 * @param {object} menu - El objeto completo del menú del tenant.
 * @param {string} searchTerm - El término de búsqueda del usuario.
 * @param {string} currentLanguage - El idioma actual.
 * @returns {Array} - Un array de secciones de menú, donde cada sección puede contener
 *                    platos directos y grupos de subcategorías con sus propios platos.
 */
export const useMenuFiltering = (menu, searchTerm, currentLanguage) => {
  return useMemo(() => {
    if (!menu) return [];

    const allDishes = menu.allDishes || [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    // 1. Obtener un Set de IDs de los platos que coinciden con la búsqueda.
    const filteredDishIds = new Set(
      (searchTerm
        ? allDishes.filter(plato => {
            const nombre = getTranslatedDishText(plato.nombre, currentLanguage).toLowerCase();
            const descripcion = getTranslatedDishText(plato.descripcion, currentLanguage).toLowerCase();
            return nombre.includes(lowerSearchTerm) || descripcion.includes(lowerSearchTerm);
          })
        : allDishes
      ).map(d => d.id)
    );

    const sections = [];

    // 2. Recorrer la estructura original del menú.
    const sortedCategoryKeys = Object.keys(menu).filter(k => k !== 'allDishes').sort((a, b) => (menu[a].orderId || 99) - (menu[b].orderId || 99));

    for (const categoryKey of sortedCategoryKeys) {
      const categoryData = menu[categoryKey];
      const newSection = {
        key: categoryKey,
        title: getTranslatedDishText(categoryData.title, currentLanguage),
        orderId: categoryData.orderId,
        parentCategoryKey: categoryKey,
        dishesWithoutSubcategory: [],
        subCategoryGroups: [],
      };

      // 3. Filtrar platos que están directamente en la categoría principal.
      if (Array.isArray(categoryData.dishes)) {
        newSection.dishesWithoutSubcategory = categoryData.dishes.filter(dish =>
          filteredDishIds.has(dish.id)
        );
      }

      // 4. Procesar y filtrar las subcategorías usando la nueva función recursiva.
      if (categoryData.subCategories) {
        newSection.subCategoryGroups = processSubCategoriesRecursively(
          categoryData.subCategories,
          filteredDishIds,
          currentLanguage
        );
      }

      // 5. Añadir la sección principal solo si contiene algún plato (directo o en subcategorías).
      if (newSection.dishesWithoutSubcategory.length > 0 || newSection.subCategoryGroups.length > 0) {
        sections.push(newSection);
      }
    }

    return sections;

  }, [menu, searchTerm, currentLanguage]);
};