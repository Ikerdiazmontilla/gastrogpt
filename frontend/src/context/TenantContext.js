// frontend/src/context/TenantContext.js

import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { fetchTenantConfig } from '../services/apiService';

// 1. Crear el Context
const TenantContext = createContext(null);

/**
 * El Provider es un componente que envolverá nuestra aplicación.
 * Se encarga de:
 * - Llamar a la API para obtener la configuración del inquilino.
 * - Manejar los estados de carga (isLoading) y error.
 * - Proveer los datos (tenantConfig), isLoading y error a todos sus componentes hijos.
 */
export const TenantProvider = ({ children }) => {
  const [tenantConfig, setTenantConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función autoejecutable para poder usar async/await dentro de useEffect.
    const loadConfig = async () => {
      try {
        const config = await fetchTenantConfig();
        
        // Pre-procesamos el menú para facilitar búsquedas futuras.
        // Creamos un array plano con todos los platos.
        if (config.menu) {
          config.menu.allDishes = [
            ...(config.menu.entrantes || []),
            ...(config.menu.principales || []),
            ...(config.menu.postres || []),
            ...(config.menu.bebidas || [])
          ];
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
  }, []); // El array vacío [] asegura que esto se ejecute solo una vez, al montar el componente.

  // Usamos useMemo para evitar que el objeto 'value' se cree en cada render, optimizando el rendimiento.
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

/**
 * Hook personalizado para consumir el TenantContext de forma sencilla.
 * En lugar de usar useContext(TenantContext) en cada componente,
 * simplemente usaremos const { tenantConfig } = useTenant();
 */
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant debe ser usado dentro de un TenantProvider');
  }
  return context;
};