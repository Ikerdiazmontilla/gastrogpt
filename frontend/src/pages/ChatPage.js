// src/pages/ChatPage.js
import React, { useState, useEffect } from 'react';
import Chat from '../features/Chat/Chat';
import DishDetailModal from '../components/Dish/DishDetailModal';
import { useTenant } from '../context/TenantContext';
import { useOrder } from '../context/OrderContext'; // <-- CORRECCIÓN: Importar useOrder

const MODAL_HISTORY_STATE_KEY = 'dishDetailModalOpen';

const ChatPage = () => {
  const { tenantConfig } = useTenant();
  const menu = tenantConfig?.menu;
  
  // ----- CORRECCIÓN AQUÍ -----
  // Conectamos con el contexto del pedido para obtener el estado y la función.
  const { selectedDishes, toggleDishSelection } = useOrder();

  const [selectedPlatoModal, setSelectedPlatoModal] = useState(null);

  const handleDisplayDishInModal = (plato) => {
    if (!selectedPlatoModal) {
      window.history.pushState({ [MODAL_HISTORY_STATE_KEY]: true }, '');
    }
    setSelectedPlatoModal(plato);
  };

  const handleCloseModal = () => {
    setSelectedPlatoModal(null);
    if (window.history.state && window.history.state[MODAL_HISTORY_STATE_KEY]) {
      window.history.back();
    }
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (selectedPlatoModal) {
        setSelectedPlatoModal(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedPlatoModal]);

  return (
    <>
      <Chat onViewDishDetails={handleDisplayDishInModal} />
      {selectedPlatoModal && (
        <DishDetailModal
          plato={selectedPlatoModal}
          onClose={handleCloseModal}
          onSelectPairedDish={handleDisplayDishInModal}
          menu={menu}
          // ----- CORRECCIÓN AQUÍ -----
          // Pasamos las props que faltaban al modal.
          isSelected={selectedDishes.has(selectedPlatoModal.id)}
          onToggleSelect={toggleDishSelection}
        />
      )}
    </>
  );
};

export default ChatPage;