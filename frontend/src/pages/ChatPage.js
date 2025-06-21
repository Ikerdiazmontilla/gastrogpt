// src/pages/ChatPage.js
import React, { useState, useEffect } from 'react';
import Chat from '../features/Chat/Chat';
import DishDetailModal from '../components/Dish/DishDetailModal';
import { useTenant } from '../context/TenantContext';
// import { useOrder } from '../context/OrderContext'; // <-- ESTA LÍNEA ES LA QUE CAUSABA EL ERROR Y HA SIDO ELIMINADA

const MODAL_HISTORY_STATE_KEY = 'dishDetailModalOpen';

const ChatPage = () => {
  const { tenantConfig } = useTenant();
  const menu = tenantConfig?.menu;
  
  // Las referencias a `selectedDishes` y `toggleDishSelection` han sido eliminadas
  // ya que la lógica de pedido fue removida.

  const [selectedPlatoModal, setSelectedPlatoModal] = useState(null);

  // Función para mostrar un plato en el modal de detalles
  const handleDisplayDishInModal = (plato) => {
    // Se añade un estado al historial del navegador para permitir cerrar el modal con el botón de atrás
    if (!selectedPlatoModal) {
      window.history.pushState({ [MODAL_HISTORY_STATE_KEY]: true }, '');
    }
    setSelectedPlatoModal(plato);
  };

  // Función para cerrar el modal de detalles del plato
  const handleCloseModal = () => {
    setSelectedPlatoModal(null);
    // Vuelve al estado anterior del historial si el modal se abrió con pushState
    if (window.history.state && window.history.state[MODAL_HISTORY_STATE_KEY]) {
      window.history.back();
    }
  };

  // Efecto para manejar el botón de atrás del navegador cuando el modal está abierto
  useEffect(() => {
    const handlePopState = (event) => {
      // Si el modal está abierto y el evento popstate se dispara, cerrar el modal
      if (selectedPlatoModal) {
        setSelectedPlatoModal(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedPlatoModal]); // Dependencia: se re-ejecuta si el plato del modal cambia

  return (
    <>
      {/* Componente principal del chat, al que se le pasa la función para ver detalles del plato */}
      <Chat onViewDishDetails={handleDisplayDishInModal} />
      
      {/* Modal de detalle del plato, se renderiza solo si hay un plato seleccionado */}
      {selectedPlatoModal && (
        <DishDetailModal
          plato={selectedPlatoModal}
          onClose={handleCloseModal}
          onSelectPairedDish={handleDisplayDishInModal} // Permite navegar a detalles de platos relacionados
          menu={menu} // Se pasa el menú completo para la funcionalidad de platos relacionados
          // isSelected y onToggleSelect han sido eliminados ya que no hay lógica de pedido
        />
      )}
    </>
  );
};

export default ChatPage;