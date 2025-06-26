// frontend/src/pages/CartaPage/hooks/useMenuFiltering.js
import { useMemo } from 'react';
import { getTranslatedDishText } from '../../../utils/menuUtils';

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
    // Si no hay búsqueda, todos los platos son válidos.
    const filteredDishIds = new Set(
      (searchTerm
        ? allDishes.filter(plato => {
            const nombre = getTranslatedDishText(plato.nombre, currentLanguage).toLowerCase();
            // Changed from `descripcionCorta` to `descripcion` to search in the main description.
            const descripcion = getTranslatedDishText(plato.descripcion, currentLanguage).toLowerCase();
            return nombre.includes(lowerSearchTerm) || descripcion.includes(lowerSearchTerm);
          })
        : allDishes
      ).map(d => d.id)
    );

    const sections = [];

    // 2. Recorrer la estructura original del menú para reconstruirla con los platos filtrados.
    const sortedCategoryKeys = Object.keys(menu).filter(k => k !== 'allDishes').sort((a, b) => (menu[a].orderId || 99) - (menu[b].orderId || 99));

    for (const categoryKey of sortedCategoryKeys) {
      const categoryData = menu[categoryKey];
      const newSection = {
        key: categoryKey,
        title: getTranslatedDishText(categoryData.title, currentLanguage),
        orderId: categoryData.orderId,
        parentCategoryKey: categoryKey,
        // Almacenará platos que no pertenecen a ninguna subcategoría.
        dishesWithoutSubcategory: [],
        // Almacenará grupos de subcategorías con sus platos.
        subCategoryGroups: [],
      };

      // 3. Filtrar platos que están directamente en la categoría principal.
      if (Array.isArray(categoryData.dishes)) {
        newSection.dishesWithoutSubcategory = categoryData.dishes.filter(dish =>
          filteredDishIds.has(dish.id)
        );
      }

      // 4. Procesar y filtrar las subcategorías.
      if (categoryData.subCategories) {
        const sortedSubCatKeys = Object.keys(categoryData.subCategories).sort((a,b) => (categoryData.subCategories[a].orderId || 99) - (categoryData.subCategories[b].orderId || 99));

        for (const subCatKey of sortedSubCatKeys) {
          const subCatData = categoryData.subCategories[subCatKey];
          const filteredSubCatDishes = (subCatData.dishes || []).filter(dish =>
            filteredDishIds.has(dish.id)
          );

          // Solo añadir el grupo de subcategoría si tiene platos después de filtrar.
          if (filteredSubCatDishes.length > 0) {
            newSection.subCategoryGroups.push({
              key: subCatKey,
              title: getTranslatedDishText(subCatData.title, currentLanguage),
              orderId: subCatData.orderId,
              dishes: filteredSubCatDishes
            });
          }
        }
      }

      // 5. Añadir la sección principal solo si contiene algún plato (directo o en subcategorías).
      if (newSection.dishesWithoutSubcategory.length > 0 || newSection.subCategoryGroups.length > 0) {
        sections.push(newSection);
      }
    }

    return sections;

  }, [menu, searchTerm, currentLanguage]);
};