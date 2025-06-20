// frontend/src/context/OrderContext.js
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';

const ORDER_STORAGE_KEY = 'gastroai_order';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [selectedDishes, setSelectedDishes] = useState(() => {
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

  // --- NUEVO: Estado para controlar el cajón del pedido ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const dishIds = Array.from(selectedDishes);
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(dishIds));
    } catch (error) {
      console.error("Error al guardar el pedido en localStorage:", error);
    }
  }, [selectedDishes]);

  const toggleDishSelection = (dishId) => {
    setSelectedDishes(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(dishId)) {
        newSelected.delete(dishId);
      } else {
        newSelected.add(dishId);
      }
      return newSelected;
    });
  };

  // --- NUEVO: Funciones para abrir y cerrar el cajón ---
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const value = useMemo(() => ({
    selectedDishes,
    toggleDishSelection,
    isDrawerOpen, // <-- Exponemos el estado
    openDrawer,   // <-- Exponemos la función para abrir
    closeDrawer,  // <-- Exponemos la función para cerrar
  }), [selectedDishes, isDrawerOpen, openDrawer, closeDrawer]);

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