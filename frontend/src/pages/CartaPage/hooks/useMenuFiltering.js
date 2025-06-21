// frontend/src/pages/CartaPage/hooks/useMenuFiltering.js
import { useMemo } from 'react';
import { getTranslatedDishText } from '../../../utils/menuUtils';

/**
 * Hook para filtrar y estructurar las secciones del menú basadas en un término de búsqueda.
 * @param {object} menu - El objeto completo del menú del tenant.
 * @param {string} searchTerm - El término de búsqueda introducido por el usuario.
 * @param {string} currentLanguage - El idioma actual.
 * @returns {Array} - Un array de secciones de menú filtradas y listas para renderizar.
 */
export const useMenuFiltering = (menu, searchTerm, currentLanguage) => {
  return useMemo(() => {
    if (!menu) return [];

    const allDishes = menu.allDishes || [];

    // 1. Filtrar platos según el término de búsqueda
    const filteredDishes = searchTerm
      ? allDishes.filter(plato => {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const nombre = getTranslatedDishText(plato.nombre, currentLanguage).toLowerCase();
          const descripcionCorta = getTranslatedDishText(plato.descripcionCorta, currentLanguage).toLowerCase();
          return nombre.includes(lowerSearchTerm) || descripcionCorta.includes(lowerSearchTerm);
        })
      : allDishes;

    const sections = {};

    // 2. Agrupar los platos filtrados por su categoría original
    filteredDishes.forEach(dish => {
      const parentKey = dish.parentCategoryKey || 'default';
      if (!sections[parentKey]) {
        sections[parentKey] = {
          key: parentKey,
          title: getTranslatedDishText(menu[parentKey]?.title, currentLanguage),
          orderId: menu[parentKey]?.orderId || 99,
          parentCategoryKey: parentKey,
          dishes: [],
        };
      }
      sections[parentKey].dishes.push(dish);
    });

    // 3. Convertir el objeto de secciones en un array y ordenarlo
    return Object.values(sections).sort((a, b) => a.orderId - b.orderId);

  }, [menu, searchTerm, currentLanguage]);
};