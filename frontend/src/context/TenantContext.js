import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { fetchTenantConfig } from '../services/apiService';

const TenantContext = createContext(null);

/**
 * Recurses through the menu structure to build a flat list of all dishes
 * and a map of each dish ID to its top-level parent category key.
 * @param {object} menuNode - The current node of the menu to process.
 * @param {string} parentKey - The key of the top-level category for the current node.
 * @param {Map} dishToParentMap - The map to populate with dish IDs and their parent keys.
 * @returns {array} A flat array of all dishes found in the node.
 */
const flattenDishesAndMapCategories = (menuNode, parentKey, dishToParentMap) => {
  let dishes = [];
  if (Array.isArray(menuNode)) {
    // This is a direct array of dishes.
    menuNode.forEach(dish => {
      if (dish && dish.id) {
        dishes.push(dish);
        if (!dishToParentMap.has(dish.id)) {
          dishToParentMap.set(dish.id, parentKey);
        }
      }
    });
  } else if (typeof menuNode === 'object' && menuNode !== null) {
    // This is a category or sub-category object.
    if (Array.isArray(menuNode.dishes)) {
      menuNode.dishes.forEach(dish => {
        if (dish && dish.id) {
          dishes.push(dish);
          if (!dishToParentMap.has(dish.id)) {
            dishToParentMap.set(dish.id, parentKey);
          }
        }
      });
    }
    // Recurse into sub-categories if they exist.
    if (menuNode.subCategories) {
      for (const subCatKey in menuNode.subCategories) {
        dishes = dishes.concat(
          flattenDishesAndMapCategories(menuNode.subCategories[subCatKey], parentKey, dishToParentMap)
        );
      }
    }
  }
  return dishes;
};

export const TenantProvider = ({ children }) => {
  const [tenantConfig, setTenantConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await fetchTenantConfig();
        
        if (config.menu) {
          const dishToParentMap = new Map();
          let allDishes = [];

          // Iterate over top-level categories to start the process.
          for (const categoryKey in config.menu) {
            if (categoryKey === 'allDishes') continue;
            allDishes = allDishes.concat(
              flattenDishesAndMapCategories(config.menu[categoryKey], categoryKey, dishToParentMap)
            );
          }
          
          // Remove duplicates that might arise from complex structures
          const uniqueDishes = Array.from(new Map(allDishes.map(d => [d.id, d])).values());

          // Add the parentCategoryKey to each unique dish object.
          uniqueDishes.forEach(dish => {
            dish.parentCategoryKey = dishToParentMap.get(dish.id) || 'default';
          });
          
          config.menu.allDishes = uniqueDishes;
        }

        setTenantConfig(config);
      } catch (err) {
        console.error("Error fatal al cargar la configuración del inquilino:", err);
        setError(err.message || 'No se pudo cargar la configuración del restaurante.');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const value = useMemo(() => ({
    tenantConfig,
    isLoading,
    error,
  }), [tenantConfig, isLoading, error]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant debe ser usado dentro de un TenantProvider');
  }
  return context;
};