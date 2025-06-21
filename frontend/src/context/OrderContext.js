// frontend/src/context/OrderContext.js
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { isOrderingEnabled } from '../config'; // <-- NUEVO: Importamos la bandera de configuración

const ORDER_STORAGE_KEY = 'gastroai_order';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  // El estado interno sigue igual para cuando la función está habilitada
  const [selectedDishes, setSelectedDishes] = useState(() => {
    if (!isOrderingEnabled) return new Set(); // Si está desactivado, siempre empieza vacío
    try {
      const storedOrder = localStorage.getItem(ORDER_STORAGE_KEY);
      if (storedOrder) {
        return new Set(JSON.parse(storedOrder));
      }
    } catch (error) {
      console.error("Error al leer el pedido de localStorage:", error);
    }
    return new Set();
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // Solo guardamos en localStorage si la funcionalidad está habilitada
    if (!isOrderingEnabled) {
      localStorage.removeItem(ORDER_STORAGE_KEY);
      return;
    };
    try {
      const dishIds = Array.from(selectedDishes);
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(dishIds));
    } catch (error) {
      console.error("Error al guardar el pedido en localStorage:", error);
    }
  }, [selectedDishes]);

  const toggleDishSelection = useCallback((dishId) => {
    // La función no hace nada si la característica está desactivada
    if (!isOrderingEnabled) return;

    setSelectedDishes(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(dishId)) {
        newSelected.delete(dishId);
      } else {
        newSelected.add(dishId);
      }
      return newSelected;
    });
  }, []);

  const openDrawer = useCallback(() => {
    if (isOrderingEnabled) setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  // UseMemo es perfecto para construir el valor del contexto condicionalmente
  const value = useMemo(() => ({
    // Proporcionamos la bandera directamente para que los componentes la puedan usar
    isOrderingFeatureEnabled: isOrderingEnabled,
    selectedDishes: isOrderingEnabled ? selectedDishes : new Set(),
    toggleDishSelection,
    isDrawerOpen: isOrderingEnabled ? isDrawerOpen : false,
    openDrawer,
    closeDrawer,
  }), [ selectedDishes, isDrawerOpen, openDrawer, closeDrawer, toggleDishSelection]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder debe ser usado dentro de un OrderProvider');
  }
  return context;
};