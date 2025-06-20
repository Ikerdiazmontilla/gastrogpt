// frontend/src/context/OrderContext.js
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

// Nombre de la clave para guardar en localStorage
const ORDER_STORAGE_KEY = 'gastroai_order';

// Crear el contexto
const OrderContext = createContext(null);

// Proveedor del contexto
export const OrderProvider = ({ children }) => {
  // El estado se inicializa leyendo de localStorage, si existe.
  const [selectedDishes, setSelectedDishes] = useState(() => {
    try {
      const storedOrder = localStorage.getItem(ORDER_STORAGE_KEY);
      if (storedOrder) {
        const dishIds = JSON.parse(storedOrder);
        return new Set(dishIds);
      }
    } catch (error) {
      console.error("Error al leer el pedido de localStorage:", error);
    }
    return new Set(); // Si no hay nada o hay un error, empezamos con un Set vacío.
  });

  // useEffect para guardar los cambios en localStorage cada vez que el pedido se actualiza.
  useEffect(() => {
    try {
      // Convertimos el Set a un Array para poder guardarlo como JSON
      const dishIds = Array.from(selectedDishes);
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(dishIds));
    } catch (error) {
      console.error("Error al guardar el pedido en localStorage:", error);
    }
  }, [selectedDishes]); // Este efecto se ejecuta cada vez que 'selectedDishes' cambia.

  // Función para añadir o quitar un plato del pedido.
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

  // Usamos useMemo para evitar re-renderizados innecesarios en los componentes consumidores.
  const value = useMemo(() => ({
    selectedDishes,
    toggleDishSelection,
  }), [selectedDishes]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente en otros componentes.
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder debe ser usado dentro de un OrderProvider');
  }
  return context;
};