// frontend/src/context/TenantContext.js
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { fetchTenantConfig } from '../services/apiService';

const TenantContext = createContext(null);

// ====================================================================
// NUEVA FUNCIÓN RECURSIVA para aplanar el menú
// ====================================================================
/**
 * Recorre recursivamente un nodo del menú y extrae todos los platos.
 * @param {object|array} menuNode - El nodo actual del menú a procesar.
 * @returns {array} Un array plano de todos los platos encontrados.
 */
const flattenAllDishes = (menuNode) => {
  let dishes = [];
  if (Array.isArray(menuNode)) {
    // Si el nodo es un array (categoría simple), lo añadimos directamente.
    dishes = dishes.concat(menuNode);
  } else if (typeof menuNode === 'object' && menuNode !== null) {
    // Si es un objeto, puede tener subcategorías o ser un objeto de sección.
    if (Array.isArray(menuNode.dishes)) {
      // Es un objeto de sección como { title: ..., dishes: [...] }
      dishes = dishes.concat(menuNode.dishes);
    } else {
      // Es un contenedor de subcategorías, iteramos sobre sus claves.
      for (const key in menuNode) {
        dishes = dishes.concat(flattenAllDishes(menuNode[key]));
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
          // Usamos la nueva función para crear la lista plana de platos.
          // Esto funciona con cualquier nivel de anidación.
          config.menu.allDishes = flattenAllDishes(config.menu);
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